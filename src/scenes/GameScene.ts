import Phaser from "phaser";
import type { ChoiceOption } from "../data/choices";
import { enemyConfigs } from "../data/enemies";
import {
  gongfaConfigs,
  getGongfaSkillTags,
  type GongfaId,
  type GongfaPattern,
  type GongfaStageState
} from "../data/gongfa";
import {
  getGongfaMasterySpeedLabel,
  getLinggenAffinityGradeSummary,
  linggenConfigs,
  rollLinggen,
  type LinggenConfig,
  type LinggenId
} from "../data/linggen";
import { stageConfigs, type StageId } from "../data/stages";
import { upgradeConfigs } from "../data/upgrades";
import { waveDurationMs } from "../data/waves";
import { Enemy } from "../entities/Enemy";
import { Lingcao } from "../entities/Lingcao";
import { HealingPill } from "../entities/HealingPill";
import { Player } from "../entities/Player";
import { Projectile } from "../entities/Projectile";
import { QiOrb } from "../entities/QiOrb";
import {
  getFirstBreakthroughState,
  getPresentedGongfaIdsForLinggen
} from "../logic/progression";
import {
  formatMasteryRankUpMessage,
  getMasteryProgressWithinRank
} from "../logic/masteryPresentation";
import { buildHudLines } from "../logic/hudPresentation";
import {
  completePhaseTransition,
  completeStageTribulation,
  getCleanupDecision,
  grantRealmQi
} from "../logic/runJourney";
import {
  getDeterministicMasteryChoiceIds,
  getRank10Skill2Id
} from "../logic/mastery";
import {
  applyGongfaImprovement,
  createGongfaRuntime,
  getAuthoredSkill2Plan,
  type AuthoredSkill2Intent,
  type GongfaRuntime,
  type PassiveImprovementEffect,
  type PlayerImprovementEffect
} from "../logic/gongfaRuntime";
import {
  clearActiveRun,
  createActiveRunSave,
  loadActiveRun,
  saveActiveRun,
  type HealingPillCheckpoint,
  type ActiveRunCheckpoint,
  type ActiveRunSave
} from "../persistence/runPersistence";
import {
  createProfileRecord,
  loadProfileRecord,
  saveProfileRecord
} from "../persistence/profilePersistence";
import { InputController } from "../systems/InputController";
import { SpawnerSystem } from "../systems/SpawnerSystem";
import type { GameSnapshot } from "../types/gameTest";
import { randomInt } from "../utils/random";

interface CombatState extends GongfaStageState {
  pattern: GongfaPattern | "baseline";
  projectileTexture: string;
  tint: number;
}

interface RunState {
  kills: number;
  elapsedMs: number;
  paused: boolean;
  gameOver: boolean;
  stage: StageId;
  realmPhase: "chuqi" | "zhongqi" | "houqi" | "dayuanman";
  realmProgress: number;
  phaseCleanupActive: boolean;
  foundationGrowthTransactions: number;
  masteryPoints: number;
  masteryRank: number;
  masteryLearnedIds: string[];
  upgradeSelectionIds: string[];
  masterySkill2Id?: string;
  masterySkill2CooldownRemaining: number;
  masterySkill2Casts: number;
  masteryChoiceActive: boolean;
  masteryPendingRanks: number[];
  learnedGongfaIds: GongfaId[];
  galeMomentum: number;
  galeMomentumBuildRate: number;
  galeMomentumDecayRate: number;
  galeMomentumWaveBonus: number;
  galeMomentumAppliedRangeBonus: number;
  galeMomentumAppliedSpreadBonus: number;
  galeMomentumAppliedLifetimeBonus: number;
  guardValue: number;
  guardBuildRate: number;
  guardDecayRate: number;
  guardMitigation: number;
  guardAppliedRetaliationBonus: number;
  guardAppliedAuraBonus: number;
  guardAppliedDamageBonus: number;
  bladeShellCharge: number;
  bladeShellThreshold: number;
  bladeShellCooldownRemaining: number;
  bladeShellCasts: number;
  heat: number;
  heatBuildRate: number;
  heatDecayRate: number;
  heatAppliedCooldownBonus: number;
  heatAuraSpeedBonus: number;
  ringSegments: number;
  counterflowRingSegments: number;
  counterflowRingAppliedSegments: number;
  counterflowRingRadiusBonus: number;
  counterflowRingCooldownRemaining: number;
  solarFlareCooldownRemaining: number;
  solarFlareCasts: number;
  crimsonPressure: number;
  crimsonPressureBuildRate: number;
  crimsonPressureDecayRate: number;
  crimsonPressureAppliedRadiusBonus: number;
  crimsonPressureRadiusScale: number;
  crimsonEmbedThreshold: number;
  furnaceCascadeCooldownRemaining: number;
  furnaceCascadeCasts: number;
  hiddenLinggen: LinggenConfig;
  revealedLinggen?: LinggenConfig;
  lingcaoCollected: boolean;
  mainGongfaId?: GongfaId;
  lingcaoMarker: string;
  lingcaoX: number;
  lingcaoY: number;
  healingPills: HealingPillCheckpoint[];
  finalBossActive: boolean;
  finalBossPhaseIndex: number;
  finalBossPhaseReady: boolean;
}

const baselineState: CombatState = {
  pattern: "baseline",
  damage: 9,
  cooldownMs: 1150,
  count: 1,
  pierce: 1,
  projectileSpeed: 360,
  projectileLifetimeMs: 1050,
  spreadDeg: 0,
  auraRadius: 0,
  retaliationDamage: 0,
  range: 0,
  returnShots: 0,
  shellBursts: 0,
  projectileTexture: "qi-bolt",
  tint: 0xb6edff
};

const finalBossPhaseConfigs = [
  {
    name: "Lightning Judgment",
    pool: ["celestial-construct"] as const,
    intervalMs: 1200,
    amount: 2,
    safeZone: false
  },
  {
    name: "Tribulation Shades",
    pool: ["tribulation-shade", "celestial-construct"] as const,
    intervalMs: 1050,
    amount: 3,
    safeZone: false
  },
  {
    name: "Collapsing Safe Zones",
    pool: ["celestial-construct", "tribulation-shade"] as const,
    intervalMs: 900,
    amount: 4,
    safeZone: true
  }
] as const;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private orbs!: Phaser.Physics.Arcade.Group;
  private lingcaoGroup!: Phaser.Physics.Arcade.Group;
  private healingPills!: Phaser.Physics.Arcade.Group;
  private spawner!: SpawnerSystem;
  private gongfaRuntime?: GongfaRuntime;
  private combatState: CombatState = { ...baselineState };
  private combatCooldownRemaining = 0;
  private choiceActive = false;
  private currentChoiceTitle?: string;
  private currentChoiceOptions: ChoiceOption[] = [];
  private pendingStageTribulationChoice = false;
  private pendingFinalBossChoice = false;
  private pendingPhaseTransitionTarget?: "zhongqi" | "houqi" | "dayuanman";
  private lastMessage?: string;
  private lastAimAngle = 0;
  private finalBossWaveAccumulator = 0;
  private finalBossHazardAccumulator = 0;
  private finalBossSafeZoneX = 0;
  private finalBossSafeZoneY = 0;
  private finalBossSafeZoneRadius = 220;
  private finalBossPhaseSpawned = false;
  private activeRunSave: ActiveRunSave | null = null;
  private runState: RunState = {
    kills: 0,
    elapsedMs: 0,
    paused: false,
    gameOver: false,
    stage: "lianqi",
    realmPhase: "chuqi",
    realmProgress: 0,
    phaseCleanupActive: false,
    foundationGrowthTransactions: 0,
    masteryPoints: 0,
    masteryRank: 0,
    masteryLearnedIds: [],
    upgradeSelectionIds: [],
    masteryChoiceActive: false,
    masteryPendingRanks: [],
    learnedGongfaIds: [],
    masterySkill2CooldownRemaining: 0,
    masterySkill2Casts: 0,
    galeMomentum: 0,
    galeMomentumBuildRate: 0.72,
    galeMomentumDecayRate: 0.48,
    galeMomentumWaveBonus: 0.08,
    galeMomentumAppliedRangeBonus: 0,
    galeMomentumAppliedSpreadBonus: 0,
    galeMomentumAppliedLifetimeBonus: 0,
    guardValue: 0,
    guardBuildRate: 0,
    guardDecayRate: 0,
    guardMitigation: 0,
    guardAppliedRetaliationBonus: 0,
    guardAppliedAuraBonus: 0,
    guardAppliedDamageBonus: 0,
    bladeShellCharge: 0,
    bladeShellThreshold: 100,
    bladeShellCooldownRemaining: 0,
    bladeShellCasts: 0,
    heat: 0,
    heatBuildRate: 1.2,
    heatDecayRate: 0.65,
    heatAppliedCooldownBonus: 0,
    heatAuraSpeedBonus: 0.08,
    ringSegments: 6,
    counterflowRingSegments: 0,
    counterflowRingAppliedSegments: 0,
    counterflowRingRadiusBonus: 0,
    counterflowRingCooldownRemaining: 0,
    solarFlareCooldownRemaining: 0,
    solarFlareCasts: 0,
    crimsonPressure: 0,
    crimsonPressureBuildRate: 1.4,
    crimsonPressureDecayRate: 0.6,
    crimsonPressureAppliedRadiusBonus: 0,
    crimsonPressureRadiusScale: 0.45,
    crimsonEmbedThreshold: 3,
    furnaceCascadeCooldownRemaining: 0,
    furnaceCascadeCasts: 0,
    hiddenLinggen: rollLinggen(),
    lingcaoCollected: false,
    lingcaoMarker: "",
    lingcaoX: 260,
    lingcaoY: -140,
    healingPills: [],
    finalBossActive: false,
    finalBossPhaseIndex: 0,
    finalBossPhaseReady: false
  };

  constructor() {
    super("game");
  }

  create(): void {
    this.activeRunSave = loadActiveRun(window.localStorage);
    this.restoreSavedRunState();
    this.physics.world.setBounds(-2000, -2000, 4000, 4000);
    this.add
      .rectangle(0, 0, 5000, 5000, 0x0c1520, 1)
      .setOrigin(0.5)
      .setDepth(-10);

    this.player = new Player(this, 0, 0);
    const checkpoint = this.activeRunSave?.checkpoint;
    this.player.stats.health = checkpoint?.playerHealth ?? this.player.stats.health;
    this.player.stats.maxHealth = checkpoint?.playerMaxHealth ?? this.player.stats.maxHealth;
    this.player.stats.moveSpeed = checkpoint?.playerMoveSpeed ?? this.player.stats.moveSpeed;
    this.player.stats.magnetRadius = checkpoint?.playerMagnetRadius ?? this.player.stats.magnetRadius;
    [...this.runState.upgradeSelectionIds, ...this.runState.masteryLearnedIds].forEach(
      (upgradeId) => this.replayCombatImprovement(upgradeId)
    );
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    this.enemies = this.physics.add.group({ runChildUpdate: false });
    this.projectiles = this.physics.add.group({ runChildUpdate: false });
    this.orbs = this.physics.add.group({ runChildUpdate: false });
    this.lingcaoGroup = this.physics.add.group({ runChildUpdate: false });
    this.healingPills = this.physics.add.group({ runChildUpdate: false });
    this.inputController = new InputController(this);
    this.spawner = new SpawnerSystem(this, this.enemies);

    if (!this.runState.lingcaoCollected) {
      this.spawnOpeningLingcao();
    }
    this.restoreHealingPillsFromCheckpoint();
    if (this.runState.masteryChoiceActive) {
      this.offerMasteryChoice();
    }
    this.persistRunCheckpoint();

    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      (projectileObj, enemyObj) => {
        this.handleProjectileHit(projectileObj as Projectile, enemyObj as Enemy);
      },
      undefined,
      this
    );
    this.physics.add.overlap(this.player, this.orbs, (_playerObj, orbObj) => {
      this.collectOrb(orbObj as QiOrb);
    });
    this.physics.add.overlap(
      this.player,
      this.enemies,
      (_playerObj, enemyObj) => {
        this.handlePlayerContact(enemyObj as Enemy);
      },
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.lingcaoGroup,
      (_playerObj, lingcaoObj) => {
        this.collectLingcao(lingcaoObj as Lingcao);
      },
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.healingPills,
      (_playerObj, pillObj) => {
        this.collectHealingPill(pillObj as HealingPill);
      },
      undefined,
      this
    );

    this.events.on("resolve-choice", this.resolveChoice, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off("resolve-choice", this.resolveChoice, this);
    });

    this.publishHud("Qi is unstable. Claim the Lingcao and reveal your roots.");
  }

  update(_time: number, delta: number): void {
    if (this.inputController.pausePressed && !this.runState.gameOver && !this.choiceActive) {
      this.togglePause();
    }

    if (this.runState.paused || this.runState.gameOver) {
      this.player.move(new Phaser.Math.Vector2(0, 0));
      return;
    }

    this.runState.elapsedMs += delta;
    this.combatCooldownRemaining -= delta;

    const movement = this.inputController.getMovementVector();
    this.player.move(movement);
    if (movement.lengthSq() > 0) {
      this.lastAimAngle = Phaser.Math.Angle.Between(0, 0, movement.x, movement.y);
    }
    this.updateGaleMomentum(movement, delta);
    this.updateGengjinGuard(delta);
    this.updateBurningRingHeat(delta);
    this.updateCrimsonPressure(delta);

    const playerPosition = new Phaser.Math.Vector2(this.player.x, this.player.y);
    if (this.runState.finalBossActive) {
      this.updateFinalBoss(delta, playerPosition);
    } else if (!this.runState.phaseCleanupActive) {
      this.spawner.update(delta, playerPosition, this.runState.stage);
    }

    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      enemy.chase(playerPosition);
    });

    this.pullNearbyOrbs();
    this.maybeResolvePhaseTransition();

    if (this.runState.gameOver) {
      this.publishHud(this.lastMessage);
      return;
    }

    if (this.runState.mainGongfaId && this.combatCooldownRemaining <= 0) {
      this.fireCurrentMethod();
      this.combatCooldownRemaining = this.combatState.cooldownMs;
    }

    this.tickMasterySkill2(delta);

    if (this.runState.elapsedMs >= waveDurationMs) {
      this.runState.gameOver = true;
      this.setPausedState(true);
      this.publishHud("Tribulation survived. Outer sect awaits.");
      this.clearActiveRunSave();
      return;
    }

    this.publishHud();
  }

  private spawnOpeningLingcao(): void {
    const savedCheckpoint = this.activeRunSave?.checkpoint;
    const x = savedCheckpoint?.lingcaoX ?? randomInt(220, 320);
    const y = savedCheckpoint?.lingcaoY ?? randomInt(-180, -110);
    const distance = Math.round(Math.sqrt(x * x + y * y));
    const direction = x >= 0 && y < 0 ? "north-east" : x >= 0 ? "south-east" : y < 0 ? "north-west" : "south-west";
    const marker = `${distance}m ${direction}`;
    const lingcao = new Lingcao(this, x, y);
    this.lingcaoGroup.add(lingcao);
    this.add
      .text(lingcao.x, lingcao.y - 28, "Lingcao", {
        fontFamily: "Trebuchet MS, Noto Sans SC, sans-serif",
        fontSize: "14px",
        color: "#9fe38c"
      })
      .setOrigin(0.5)
      .setDepth(12);
    this.add
      .text(lingcao.x, lingcao.y + 24, marker, {
        fontFamily: "Trebuchet MS, Noto Sans SC, sans-serif",
        fontSize: "13px",
        color: "#d8e4ee"
      })
      .setOrigin(0.5)
      .setDepth(12);
    this.runState.lingcaoMarker = marker;
    this.runState.lingcaoX = x;
    this.runState.lingcaoY = y;
  }

  private handleProjectileHit(projectile: Projectile, enemy: Enemy): void {
    if (projectile.sourceGongfaId === "crimson-furnace-sword-art") {
      this.handleCrimsonNeedleHit(projectile, enemy);
      return;
    }

    const died = enemy.receiveDamage(projectile.damage);
    projectile.pierceRemaining -= 1;

    if (this.runState.mainGongfaId === "burning-ring-scripture") {
      this.runState.heat = Math.min(100, this.runState.heat + Math.max(0.4, projectile.damage * 0.15));
      this.syncBurningRingCombatState();
    }

    if (projectile.pierceRemaining <= 0) {
      projectile.destroy();
    }

    if (!died) {
      return;
    }

    this.spawnOrb(enemy.x, enemy.y, enemy.config.xpDrop);
    enemy.destroy();
    this.runState.kills += 1;
  }

  private handleCrimsonNeedleHit(projectile: Projectile, enemy: Enemy): void {
    enemy.embedStacks += 1;
    enemy.embedPower += projectile.damage;
    projectile.lodgedEnemy = enemy;
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.reset(enemy.x, enemy.y);
    body.setVelocity(0, 0);
    body.enable = false;

    if (enemy.embedStacks >= this.runState.crimsonEmbedThreshold) {
      this.detonateCrimsonEnemy(enemy, projectile.damage);
      this.destroyLodgedCrimsonNeedles(enemy);
    }
  }

  private collectOrb(orb: QiOrb): void {
    this.grantQi(orb.qiValue);
    orb.destroy();
    this.publishHud();
    this.persistRunCheckpoint();
  }

  private collectLingcao(lingcao: Lingcao): void {
    const breakthroughState = getFirstBreakthroughState({
      lingcaoCollected: this.runState.lingcaoCollected,
      linggenRevealed: Boolean(this.runState.revealedLinggen)
    });
    if (!breakthroughState.canReveal && this.runState.lingcaoCollected) {
      return;
    }

    this.runState.lingcaoCollected = true;
    lingcao.destroy();
    this.lastMessage = `${this.runState.hiddenLinggen.name} stirs within your meridians.`;
    this.persistRunCheckpoint();
    const nextState = getFirstBreakthroughState({
      lingcaoCollected: this.runState.lingcaoCollected,
      linggenRevealed: Boolean(this.runState.revealedLinggen)
    });
    if (nextState.canReveal) {
      this.offerGongfaChoice();
    }
  }

  private handlePlayerContact(enemy: Enemy): void {
    const now = this.time.now;

    if (enemy.contactCooldownUntil > now) {
      return;
    }

    enemy.contactCooldownUntil = now + 750;
    this.applyIncomingDamage(enemy.config.touchDamage);

    if (this.combatState.pattern === "aura" && this.combatState.retaliationDamage > 0) {
      this.emitAuraBurst(this.combatState.retaliationDamage, Math.max(4, Math.floor(this.combatState.count / 2)));
    }

    if (this.player.stats.health <= 0) {
      this.handlePlayerDeath("Cultivator fell. Qi scattered.");
      return;
    }

    this.publishHud();
  }

  private spawnOrb(x: number, y: number, qiValue: number): void {
    const orb = new QiOrb(this, x, y, qiValue);
    this.orbs.add(orb);
  }

  private spawnHealingPill(x: number, y: number, healAmount = 30): void {
    const pill = new HealingPill(this, x, y, healAmount);
    this.healingPills.add(pill);
  }

  private restoreHealingPillsFromCheckpoint(): void {
    const pills = this.activeRunSave?.checkpoint?.healingPills ?? [];
    pills.forEach((pill) => {
      this.spawnHealingPill(pill.x, pill.y, pill.healAmount);
    });
  }

  private updateFinalBoss(delta: number, playerPosition: Phaser.Math.Vector2): void {
    const phase = finalBossPhaseConfigs[this.runState.finalBossPhaseIndex];
    if (!phase) {
      return;
    }

    if (this.finalBossPhaseSpawned && this.enemies.countActive(true) === 0) {
      this.runState.phaseCleanupActive = true;
      return;
    }

    this.finalBossWaveAccumulator += delta;
    if (!this.finalBossPhaseSpawned) {
      this.spawnFinalBossWave(phase.pool, phase.amount, playerPosition);
      this.finalBossPhaseSpawned = true;
      this.finalBossWaveAccumulator = 0;
    } else if (this.finalBossWaveAccumulator >= phase.intervalMs) {
      this.spawnFinalBossWave(phase.pool, phase.amount, playerPosition);
      this.finalBossWaveAccumulator = 0;
    }

    if (phase.safeZone) {
      this.finalBossHazardAccumulator += delta;
      if (this.finalBossHazardAccumulator >= 1000) {
        this.finalBossHazardAccumulator = 0;
        this.finalBossSafeZoneRadius = Math.max(110, this.finalBossSafeZoneRadius - 6);
        const drift = this.runState.finalBossPhaseIndex % 2 === 0 ? 80 : -80;
        this.finalBossSafeZoneX = playerPosition.x + drift;
        this.finalBossSafeZoneY = playerPosition.y - drift * 0.6;
        const distance = Phaser.Math.Distance.Between(
          playerPosition.x,
          playerPosition.y,
          this.finalBossSafeZoneX,
          this.finalBossSafeZoneY
        );
        if (distance > this.finalBossSafeZoneRadius) {
          this.applyIncomingDamage(6);
        }
      }
    }

    if (this.finalBossPhaseSpawned && this.enemies.countActive(true) === 0) {
      this.runState.phaseCleanupActive = true;
    }
  }

  private spawnFinalBossWave(
    pool: (typeof finalBossPhaseConfigs)[number]["pool"],
    amount: number,
    playerPosition: Phaser.Math.Vector2
  ): void {
    for (let i = 0; i < amount; i += 1) {
      const enemyId = pool[i % pool.length];
      const angle = (i / Math.max(1, amount)) * Math.PI * 2;
      const radius = randomInt(300, 420);
      this.spawner.spawnManual(
        enemyId,
        playerPosition.x + Math.cos(angle) * radius,
        playerPosition.y + Math.sin(angle) * radius
      );
    }
  }

  private collectHealingPill(pill: HealingPill): void {
    if (!pill.active) {
      return;
    }

    if (this.player.stats.health >= this.player.stats.maxHealth) {
      return;
    }

    this.player.heal(pill.healAmount);
    pill.destroy();
    this.lastMessage = "Healing Pill restores your vitality.";
    this.persistRunCheckpoint();
    this.publishHud(this.lastMessage);
  }

  forceAdvanceSpawnClock(deltaMs: number): void {
    this.spawner.advanceClock(
      deltaMs,
      new Phaser.Math.Vector2(this.player.x, this.player.y),
      this.runState.stage,
      Boolean(this.runState.mainGongfaId)
    );
    this.publishHud(this.lastMessage);
  }

  private pullNearbyOrbs(): void {
    this.orbs.getChildren().forEach((child) => {
      const orb = child as QiOrb;
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        orb.x,
        orb.y
      );

      if (distance <= this.player.stats.magnetRadius) {
        this.physics.moveToObject(orb, this.player, 280);
      }
    });
  }

  private fireCurrentMethod(): void {
    switch (this.combatState.pattern) {
      case "baseline":
      case "homing":
        if (this.runState.mainGongfaId === "crimson-furnace-sword-art") {
          this.fireCrimsonFurnaceVolley();
        } else {
          this.fireHomingVolley();
        }
        break;
      case "wave":
        this.fireWaveVolley();
        break;
      case "aura":
        if (this.runState.mainGongfaId === "burning-ring-scripture") {
          this.fireBurningRingVolley();
        } else {
          this.emitAuraBurst(this.combatState.damage, this.combatState.count);
        }
        break;
    }
  }

  private fireHomingVolley(): void {
    const targets = this.getNearestEnemies(this.combatState.count);
    if (targets.length === 0) {
      return;
    }

    targets.forEach((enemy, index) => {
      this.spawnProjectileAtTarget(
        this.player.x,
        this.player.y - 10 + index * 4,
        enemy,
        this.combatState.damage,
        this.combatState.pierce,
        this.combatState.projectileSpeed,
        this.combatState.projectileLifetimeMs,
        this.combatState.projectileTexture,
        this.combatState.tint
      );
    });

    for (let i = 0; i < this.combatState.returnShots; i += 1) {
      targets.forEach((enemy, index) => {
        this.time.delayedCall(140 + i * 90, () => {
          if (!enemy.active || !this.player.active) {
            return;
          }

          this.spawnProjectileAtTarget(
            this.player.x,
            this.player.y + 12 + index * 5,
            enemy,
            Math.floor(this.combatState.damage * 0.65),
            this.combatState.pierce,
            this.combatState.projectileSpeed + 40,
            this.combatState.projectileLifetimeMs,
            this.combatState.projectileTexture,
            this.combatState.tint
          );
        });
      });
    }
  }

  private fireCrimsonFurnaceVolley(): void {
    const targets = this.getCrimsonFurnaceTargets(this.combatState.count);
    if (targets.length === 0) {
      return;
    }

    targets.forEach((enemy, index) => {
      this.spawnCrimsonNeedle(
        this.player.x,
        this.player.y - 8 + index * 4,
        enemy,
        this.combatState.damage,
        this.combatState.projectileSpeed,
        this.combatState.projectileLifetimeMs,
        this.combatState.projectileTexture,
        this.combatState.tint
      );
    });
  }

  private spawnCrimsonNeedle(
    x: number,
    y: number,
    enemy: Enemy,
    damage: number,
    speed: number,
    lifetimeMs: number,
    texture: string,
    tint: number
  ): void {
    const projectile = new Projectile(this, x, y, texture);
    projectile.damage = damage;
    projectile.sourceGongfaId = "crimson-furnace-sword-art";
    projectile.setTint(tint);
    projectile.setAngle(Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y)));
    this.projectiles.add(projectile);
    this.physics.moveToObject(projectile, enemy, speed);
    this.time.delayedCall(lifetimeMs, () => {
      if (!projectile.active) {
        return;
      }

      if (projectile.lodgedEnemy?.active) {
        projectile.lodgedEnemy.embedStacks = Math.max(0, projectile.lodgedEnemy.embedStacks - 1);
        projectile.lodgedEnemy.embedPower = Math.max(
          0,
          projectile.lodgedEnemy.embedPower - projectile.damage
        );
      }
      this.detonateCrimsonNeedle(projectile.x, projectile.y, projectile.damage, false);
      projectile.destroy();
    });
  }

  private fireWaveVolley(): void {
    const angle = this.getWaveAimAngle();
    const count = Math.max(1, this.combatState.count);
    const spreadRad = Phaser.Math.DegToRad(this.combatState.spreadDeg);

    for (let i = 0; i < count; i += 1) {
      const offset = count === 1 ? 0 : Phaser.Math.Linear(-spreadRad / 2, spreadRad / 2, i / (count - 1));
      this.spawnWaveProjectile(
        this.player.x,
        this.player.y,
        angle + offset,
        this.combatState.damage,
        this.combatState.pierce,
        this.combatState.projectileSpeed,
        this.combatState.projectileLifetimeMs + Math.floor(this.combatState.range * 0.8),
        1.05
      );
    }

    for (let trail = 0; trail < this.combatState.returnShots; trail += 1) {
      this.time.delayedCall(110 + trail * 90, () => {
        if (!this.player.active) {
          return;
        }

        const delayedAngle = this.getWaveAimAngle();
        for (let i = 0; i < count; i += 1) {
          const offset =
            count === 1
              ? 0
              : Phaser.Math.Linear(-spreadRad / 2, spreadRad / 2, i / (count - 1));
          this.spawnWaveProjectile(
            this.player.x + Math.cos(delayedAngle) * (28 + trail * 16),
            this.player.y + Math.sin(delayedAngle) * (28 + trail * 16),
            delayedAngle + offset,
            Math.floor(this.combatState.damage * 0.55),
            this.combatState.pierce,
            this.combatState.projectileSpeed + 30,
            Math.max(420, this.combatState.projectileLifetimeMs + Math.floor(this.combatState.range * 0.45)),
            0.85
          );
        }
      });
    }
  }

  private spawnWaveProjectile(
    x: number,
    y: number,
    angle: number,
    damage: number,
    pierce: number,
    speed: number,
    lifetimeMs: number,
    scale: number
  ): void {
    const projectile = new Projectile(this, x, y, this.combatState.projectileTexture);
    projectile.damage = damage;
    projectile.pierceRemaining = pierce;
    projectile.setTint(this.combatState.tint);
    projectile.setAngle(Phaser.Math.RadToDeg(angle));
    projectile.setScale(scale, Math.max(0.72, scale - 0.15));
    this.projectiles.add(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.time.delayedCall(lifetimeMs, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });
  }

  private emitAuraBurst(damage: number, count: number): void {
    const projectileCount = Math.max(4, count);
    for (let i = 0; i < projectileCount; i += 1) {
      const angle = (Math.PI * 2 * i) / projectileCount;
      const projectile = new Projectile(
        this,
        this.player.x + Math.cos(angle) * 10,
        this.player.y + Math.sin(angle) * 10,
        this.combatState.projectileTexture
      );
      projectile.damage = damage;
      projectile.pierceRemaining = this.combatState.pierce;
      projectile.setTint(this.combatState.tint);
      projectile.setScale(0.85);
      this.projectiles.add(projectile);
      const body = projectile.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        Math.cos(angle) * this.combatState.projectileSpeed,
        Math.sin(angle) * this.combatState.projectileSpeed
      );
      this.time.delayedCall(this.combatState.projectileLifetimeMs, () => {
        if (projectile.active) {
          projectile.destroy();
        }
      });
    }

    for (let burst = 0; burst < this.combatState.shellBursts; burst += 1) {
      this.time.delayedCall(150 + burst * 110, () => {
        if (!this.player.active) {
          return;
        }

        this.emitAuraShell(
          Math.floor(damage * 0.75),
          projectileCount + 2 + burst * 2,
          1 + burst * 0.18
        );
      });
    }
  }

  private emitAuraShell(damage: number, count: number, scale: number): void {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const projectile = new Projectile(
        this,
        this.player.x + Math.cos(angle) * 16,
        this.player.y + Math.sin(angle) * 16,
        this.combatState.projectileTexture
      );
      projectile.damage = damage;
      projectile.pierceRemaining = this.combatState.pierce + 1;
      projectile.setTint(this.combatState.tint);
      projectile.setScale(Math.max(0.95, scale));
      this.projectiles.add(projectile);
      const body = projectile.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        Math.cos(angle) * (this.combatState.projectileSpeed + 55),
        Math.sin(angle) * (this.combatState.projectileSpeed + 55)
      );
      this.time.delayedCall(this.combatState.projectileLifetimeMs + 120, () => {
        if (projectile.active) {
          projectile.destroy();
        }
      });
    }
  }

  private spawnProjectileAtTarget(
    x: number,
    y: number,
    enemy: Enemy,
    damage: number,
    pierce: number,
    speed: number,
    lifetimeMs: number,
    texture: string,
    tint: number
  ): void {
    const projectile = new Projectile(this, x, y, texture);
    projectile.damage = damage;
    projectile.pierceRemaining = pierce;
    projectile.setTint(tint);
    projectile.setAngle(
      Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y))
    );
    this.projectiles.add(projectile);
    this.physics.moveToObject(projectile, enemy, speed);
    this.time.delayedCall(lifetimeMs, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });
  }

  private getAimAngle(): number {
    const nearestEnemy = this.getNearestEnemies(1)[0];
    if (nearestEnemy) {
      return Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        nearestEnemy.x,
        nearestEnemy.y
      );
    }

    return this.lastAimAngle;
  }

  private getWaveAimAngle(): number {
    if (this.runState.mainGongfaId === "jinfeng-gong") {
      return this.lastAimAngle;
    }

    return this.getAimAngle();
  }

  private updateGaleMomentum(movement: Phaser.Math.Vector2, delta: number): void {
    if (this.runState.mainGongfaId !== "jinfeng-gong") {
      return;
    }

    const deltaSeconds = delta / 1000;
    if (movement.lengthSq() > 0) {
      this.runState.galeMomentum = Math.min(
        5,
        this.runState.galeMomentum + this.runState.galeMomentumBuildRate * deltaSeconds
      );
      this.syncGaleMomentumCombatState();
      return;
    }

    this.runState.galeMomentum = Math.max(
      0,
      this.runState.galeMomentum - this.runState.galeMomentumDecayRate * deltaSeconds
    );
    this.syncGaleMomentumCombatState();
    return;
  }

  private updateGengjinGuard(delta: number): void {
    if (this.runState.mainGongfaId !== "gengjin-huti") {
      return;
    }

    const deltaSeconds = delta / 1000;
    const nearbyEnemies = this.getEnemiesWithinRadius(160);

    if (nearbyEnemies.length > 0) {
      this.runState.guardValue = Math.min(
        100,
        this.runState.guardValue + nearbyEnemies.length * this.runState.guardBuildRate * deltaSeconds
      );
      this.runState.bladeShellCharge = Math.min(
        this.runState.bladeShellThreshold,
        this.runState.bladeShellCharge +
          nearbyEnemies.length * 7 * deltaSeconds +
          this.runState.guardValue * 0.05 * deltaSeconds
      );
    } else {
      this.runState.guardValue = Math.max(
        0,
        this.runState.guardValue - this.runState.guardDecayRate * deltaSeconds
      );
      this.runState.bladeShellCharge = Math.max(
        0,
        this.runState.bladeShellCharge - 5 * deltaSeconds
      );
    }

    this.syncGengjinCombatState();
    this.tickBladeShell(delta);
  }

  private updateBurningRingHeat(delta: number): void {
    if (this.runState.mainGongfaId !== "burning-ring-scripture") {
      return;
    }

    const deltaSeconds = delta / 1000;
    const nearbyEnemies = this.getEnemiesWithinRadius(170);

    if (nearbyEnemies.length > 0) {
      this.runState.heat = Math.min(
        100,
        this.runState.heat + nearbyEnemies.length * this.runState.heatBuildRate * deltaSeconds
      );
    } else {
      this.runState.heat = Math.max(
        0,
        this.runState.heat - this.runState.heatDecayRate * deltaSeconds
      );
    }

    this.syncBurningRingCombatState();
    this.tickSolarFlareCycle(delta);
  }

  private updateCrimsonPressure(delta: number): void {
    if (this.runState.mainGongfaId !== "crimson-furnace-sword-art") {
      return;
    }

    const deltaSeconds = delta / 1000;
    this.runState.crimsonPressure = Math.max(
      0,
      this.runState.crimsonPressure - this.runState.crimsonPressureDecayRate * deltaSeconds
    );
    this.syncCrimsonPressureCombatState();
  }

  private syncGaleMomentumCombatState(): void {
    if (this.runState.mainGongfaId !== "jinfeng-gong") {
      return;
    }

    const gongfa = gongfaConfigs["jinfeng-gong"];
    const stageState = gongfa.stages.lianqi!;
    const momentumBonus = 1 + this.runState.galeMomentum * this.runState.galeMomentumWaveBonus;
    const desiredRangeBonus = Math.round(stageState.range * (momentumBonus - 1));
    const desiredSpreadBonus = Math.round(stageState.spreadDeg * (momentumBonus - 1));
    const desiredLifetimeBonus = Math.floor(this.runState.galeMomentum * 50);

    this.combatState.range += desiredRangeBonus - this.runState.galeMomentumAppliedRangeBonus;
    this.combatState.spreadDeg +=
      desiredSpreadBonus - this.runState.galeMomentumAppliedSpreadBonus;
    this.combatState.projectileLifetimeMs +=
      desiredLifetimeBonus - this.runState.galeMomentumAppliedLifetimeBonus;

    this.runState.galeMomentumAppliedRangeBonus = desiredRangeBonus;
    this.runState.galeMomentumAppliedSpreadBonus = desiredSpreadBonus;
    this.runState.galeMomentumAppliedLifetimeBonus = desiredLifetimeBonus;
  }

  private syncGengjinCombatState(): void {
    if (this.runState.mainGongfaId !== "gengjin-huti") {
      return;
    }

    const gongfa = gongfaConfigs["gengjin-huti"];
    const stageState = gongfa.stages.lianqi!;
    const desiredRetaliationBonus = Math.max(1, Math.floor(this.runState.guardValue * 0.18));
    const desiredAuraBonus = Math.floor(this.runState.guardValue * 0.35);
    const desiredDamageBonus = Math.floor(this.runState.guardValue * 0.08);

    this.combatState.retaliationDamage +=
      desiredRetaliationBonus - this.runState.guardAppliedRetaliationBonus;
    this.combatState.auraRadius += desiredAuraBonus - this.runState.guardAppliedAuraBonus;
    this.combatState.damage += desiredDamageBonus - this.runState.guardAppliedDamageBonus;

    this.runState.guardAppliedRetaliationBonus = desiredRetaliationBonus;
    this.runState.guardAppliedAuraBonus = desiredAuraBonus;
    this.runState.guardAppliedDamageBonus = desiredDamageBonus;

    this.runState.guardMitigation = Math.min(0.5, this.runState.guardValue / 220);
    this.combatState.auraRadius = Math.max(stageState.auraRadius, this.combatState.auraRadius);
  }

  private syncBurningRingCombatState(): void {
    if (this.runState.mainGongfaId !== "burning-ring-scripture") {
      return;
    }

    const gongfa = gongfaConfigs["burning-ring-scripture"];
    const stageState = gongfa.stages.lianqi!;
    const currentHeatBonus = Math.min(0.5, this.runState.heat * (0.01 + this.runState.heatAuraSpeedBonus));
    const desiredCooldownBonus = Math.floor(stageState.cooldownMs * currentHeatBonus);

    this.combatState.cooldownMs = Math.max(
      220,
      this.combatState.cooldownMs - (desiredCooldownBonus - this.runState.heatAppliedCooldownBonus)
    );
    this.runState.heatAppliedCooldownBonus = desiredCooldownBonus;
  }

  private syncCrimsonPressureCombatState(): void {
    if (this.runState.mainGongfaId !== "crimson-furnace-sword-art") {
      return;
    }

    const gongfa = gongfaConfigs["crimson-furnace-sword-art"];
    const stageState = gongfa.stages.lianqi!;
    const desiredRadiusBonus = Math.floor(
      this.runState.crimsonPressure * this.runState.crimsonPressureRadiusScale
    );

    this.combatState.range += desiredRadiusBonus - this.runState.crimsonPressureAppliedRadiusBonus;
    this.runState.crimsonPressureAppliedRadiusBonus = desiredRadiusBonus;
    this.combatState.range = Math.max(stageState.range, this.combatState.range);
  }

  private tickSolarFlareCycle(delta: number): void {
    const plan = getAuthoredSkill2Plan(this.runState.masterySkill2Id);
    if (
      this.runState.mainGongfaId !== "burning-ring-scripture" ||
      plan?.trigger !== "cycle"
    ) {
      return;
    }

    this.runState.solarFlareCooldownRemaining = Math.max(
      0,
      this.runState.solarFlareCooldownRemaining - delta
    );
    if (this.runState.solarFlareCooldownRemaining > 0) {
      return;
    }

    this.fireMasterySkill2();
    this.runState.solarFlareCooldownRemaining = this.getMasterySkill2CooldownMs();
  }

  private tickBladeShell(delta: number): void {
    const plan = getAuthoredSkill2Plan(this.runState.masterySkill2Id);
    if (this.runState.mainGongfaId !== "gengjin-huti" || plan?.trigger !== "threshold") {
      return;
    }

    if (this.runState.bladeShellCooldownRemaining > 0) {
      this.runState.bladeShellCooldownRemaining = Math.max(
        0,
        this.runState.bladeShellCooldownRemaining - delta
      );
      return;
    }

    if (this.runState.bladeShellCharge < this.runState.bladeShellThreshold) {
      return;
    }

    this.fireMasterySkill2();
    this.runState.bladeShellCharge = 0;
    this.runState.bladeShellCooldownRemaining = 1800;
    this.runState.masterySkill2CooldownRemaining = this.getMasterySkill2CooldownMs();
  }

  private getEnemiesWithinRadius(radius: number): Enemy[] {
    return this.getEnemiesWithinRadiusFrom(this.player.x, this.player.y, radius);
  }

  private getEnemiesWithinRadiusFrom(x: number, y: number, radius: number): Enemy[] {
    return (this.enemies.getChildren() as Enemy[])
      .filter((enemy) => enemy.active)
      .filter((enemy) => Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius);
  }

  private tickMasterySkill2(delta: number): void {
    if (
      !this.runState.mainGongfaId ||
      !this.runState.masterySkill2Id ||
      this.choiceActive ||
      this.runState.paused ||
      this.runState.gameOver
    ) {
      return;
    }

    const plan = getAuthoredSkill2Plan(this.runState.masterySkill2Id);
    if (!plan || plan.trigger !== "timed") {
      return;
    }

    this.runState.masterySkill2CooldownRemaining -= delta;
    if (this.runState.masterySkill2CooldownRemaining > 0) {
      return;
    }

    this.fireMasterySkill2();
    this.runState.masterySkill2CooldownRemaining = this.getMasterySkill2CooldownMs();
  }

  private getMasterySkill2CooldownMs(): number {
    return getAuthoredSkill2Plan(this.runState.masterySkill2Id)?.cooldownMs ?? 0;
  }

  private fireMasterySkill2(): void {
    const plan = getAuthoredSkill2Plan(this.runState.masterySkill2Id);
    if (!plan) {
      return;
    }

    this.runState.masterySkill2Casts += 1;
    this.executeSkill2Intent(plan.intent);
  }

  private executeSkill2Intent(intent: AuthoredSkill2Intent): void {
    switch (intent) {
      case "solar-flare-cycle":
        this.fireSolarFlareCycle();
        break;
      case "furnace-cascade":
        this.fireFurnaceCascade();
        break;
      case "golden-gale-corridor":
        this.fireGoldenGaleCorridor();
        break;
      case "returning-sword-formation":
        this.fireReturningSwordFormation();
        break;
      case "blade-shell-rebound":
        this.fireBladeShellRebound();
        break;
    }
  }

  private fireSolarFlareCycle(): void {
    this.runState.solarFlareCasts += 1;
    const baseAngle = this.getAimAngle();
    const radius = 32 + Math.floor(this.runState.heat * 0.3) + this.runState.counterflowRingRadiusBonus;

    for (let ring = 0; ring < 2; ring += 1) {
      const direction = ring === 0 ? 1 : -1;
      const ringRadius = radius + ring * 10;
      const segmentCount = Math.max(6, this.runState.ringSegments + this.runState.counterflowRingAppliedSegments);
      for (let i = 0; i < segmentCount; i += 1) {
        const angle = baseAngle + ((Math.PI * 2) / segmentCount) * i * direction;
        const projectile = new Projectile(
          this,
          this.player.x + Math.cos(angle) * ringRadius,
          this.player.y + Math.sin(angle) * ringRadius,
          this.combatState.projectileTexture
        );
        projectile.damage = Math.floor(this.combatState.damage * 0.85);
        projectile.pierceRemaining = this.combatState.pierce + 1;
        projectile.setTint(this.combatState.tint);
        projectile.setScale(0.9);
        this.projectiles.add(projectile);
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
          Math.cos(angle + Math.PI / 2 * direction) * (this.combatState.projectileSpeed + 35),
          Math.sin(angle + Math.PI / 2 * direction) * (this.combatState.projectileSpeed + 35)
        );
        this.time.delayedCall(this.combatState.projectileLifetimeMs + 160, () => {
          if (projectile.active) {
            projectile.destroy();
          }
        });
      }
    }
  }

  private fireFurnaceCascade(): void {
    this.runState.furnaceCascadeCasts += 1;
    const primedEnemies = (this.enemies.getChildren() as Enemy[]).filter(
      (enemy) => enemy.active && enemy.embedStacks > 0
    );

    primedEnemies.forEach((enemy) => {
      this.detonateCrimsonEnemy(enemy, enemy.embedPower + enemy.embedStacks * 3);
      this.destroyLodgedCrimsonNeedles(enemy);
    });
  }

  private fireGoldenGaleCorridor(): void {
    const angle = this.getWaveAimAngle();
    const laneCount = Math.max(3, Math.min(5, 3 + Math.floor(this.combatState.count / 2)));
    const spreadRad = Phaser.Math.DegToRad(Math.max(8, this.combatState.spreadDeg * 0.4));

    for (let burst = 0; burst < 3; burst += 1) {
      this.time.delayedCall(burst * 180, () => {
        if (!this.player.active) {
          return;
        }

        const forwardOffset = 32 + burst * 26;
        for (let i = 0; i < laneCount; i += 1) {
          const offset = laneCount === 1 ? 0 : Phaser.Math.Linear(-spreadRad / 2, spreadRad / 2, i / (laneCount - 1));
          const sideways = (i - (laneCount - 1) / 2) * 12;
          const x =
            this.player.x +
            Math.cos(angle) * forwardOffset +
            Math.cos(angle + Math.PI / 2) * sideways;
          const y =
            this.player.y +
            Math.sin(angle) * forwardOffset +
            Math.sin(angle + Math.PI / 2) * sideways;

          this.spawnWaveProjectile(
            x,
            y,
            angle + offset,
            Math.floor(this.combatState.damage * 0.8),
            this.combatState.pierce + 1,
            this.combatState.projectileSpeed + 25,
            this.combatState.projectileLifetimeMs + Math.floor(this.combatState.range * 0.9),
            0.92
          );
        }
      });
    }
  }

  private fireReturningSwordFormation(): void {
    const targets = this.getNearestEnemies(Math.max(1, this.combatState.count));
    if (targets.length === 0) {
      return;
    }

    targets.forEach((enemy, index) => {
      this.spawnProjectileAtTarget(
        this.player.x,
        this.player.y - 12 + index * 6,
        enemy,
        Math.floor(this.combatState.damage * 0.72),
        this.combatState.pierce + 1,
        this.combatState.projectileSpeed + 55,
        this.combatState.projectileLifetimeMs + 280,
        this.combatState.projectileTexture,
        this.combatState.tint
      );
    });

    this.time.delayedCall(240, () => {
      if (!this.player.active) {
        return;
      }

      targets.forEach((enemy, index) => {
        if (!enemy.active) {
          return;
        }

        this.spawnProjectileAtTarget(
          this.player.x,
          this.player.y + 14 + index * 6,
          enemy,
          Math.floor(this.combatState.damage * 0.58),
          this.combatState.pierce + 1,
          this.combatState.projectileSpeed + 75,
          this.combatState.projectileLifetimeMs + 340,
          this.combatState.projectileTexture,
          this.combatState.tint
        );
      });
    });
  }

  private fireBladeShellRebound(): void {
    this.runState.bladeShellCasts += 1;
    this.emitAuraBurst(Math.floor(this.combatState.damage * 0.82), this.combatState.count + 2);
  }

  private fireBurningRingVolley(): void {
    const baseAngle = this.getAimAngle();
    const segmentCount = Math.max(6, this.runState.ringSegments + this.runState.counterflowRingAppliedSegments);
    const visibleSegments = Math.max(4, segmentCount - 2);
    const rotation = (this.runState.elapsedMs / 1000) * 0.9;
    const ringRadius = 24 + Math.floor(this.runState.heat * 0.3);

    for (let ring = 0; ring < 2; ring += 1) {
      const direction = ring === 0 ? 1 : -1;
      const radius = ringRadius + ring * 12;
      const start = Math.floor((segmentCount - visibleSegments) / 2);

      for (let i = 0; i < visibleSegments; i += 1) {
        const segmentIndex = start + i;
        const angle = baseAngle + rotation * direction + ((Math.PI * 2) / segmentCount) * segmentIndex;
        const projectile = new Projectile(
          this,
          this.player.x + Math.cos(angle) * radius,
          this.player.y + Math.sin(angle) * radius,
          this.combatState.projectileTexture
        );
        projectile.damage = Math.max(1, Math.floor(this.combatState.damage * (ring === 0 ? 1 : 0.9)));
        projectile.pierceRemaining = this.combatState.pierce;
        projectile.setTint(this.combatState.tint);
        projectile.setScale(ring === 0 ? 1 : 0.84);
        this.projectiles.add(projectile);
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
          Math.cos(angle + direction * Math.PI / 2) * (this.combatState.projectileSpeed + 50),
          Math.sin(angle + direction * Math.PI / 2) * (this.combatState.projectileSpeed + 50)
        );
        this.time.delayedCall(this.combatState.projectileLifetimeMs + 120, () => {
          if (projectile.active) {
            projectile.destroy();
          }
        });
      }
    }
  }

  private getNearestEnemies(count: number): Enemy[] {
    const enemies = this.enemies.getChildren() as Enemy[];
    return enemies
      .filter((enemy) => enemy.active)
      .sort((a, b) => {
        const distanceA = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
        const distanceB = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
        return distanceA - distanceB;
      })
      .slice(0, count);
  }

  private getCrimsonFurnaceTargets(count: number): Enemy[] {
    const enemies = this.enemies.getChildren() as Enemy[];
    const prioritized = enemies
      .filter((enemy) => enemy.active)
      .sort((a, b) => {
        const embedPriority = b.embedStacks - a.embedStacks;
        if (embedPriority !== 0) {
          return embedPriority;
        }

        const distanceA = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
        const distanceB = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
        return distanceA - distanceB;
      });

    return prioritized.slice(0, count);
  }

  private detonateCrimsonNeedle(
    x: number,
    y: number,
    damage: number,
    fromEmbed: boolean
  ): void {
    const pressureBonus = Math.floor(this.runState.crimsonPressure * 0.35);
    const radius = Math.max(20, this.combatState.range + pressureBonus);
    const splashDamage = Math.max(1, Math.floor(damage + this.runState.crimsonPressure * 0.4));
    const hits = this.getEnemiesWithinRadiusFrom(x, y, radius);

    if (fromEmbed) {
      this.runState.crimsonPressure = Math.min(
        100,
        this.runState.crimsonPressure +
          Math.max(0.8, damage * 0.14) * this.runState.crimsonPressureBuildRate
      );
    } else {
      this.runState.crimsonPressure = Math.min(
        100,
        this.runState.crimsonPressure +
          Math.max(0.5, damage * 0.1) * this.runState.crimsonPressureBuildRate
      );
    }

    hits.forEach((enemy) => {
      const died = enemy.receiveDamage(splashDamage);
      if (died) {
        this.spawnOrb(enemy.x, enemy.y, enemy.config.xpDrop);
        enemy.destroy();
        this.runState.kills += 1;
      }
    });

    this.syncCrimsonPressureCombatState();
  }

  private detonateCrimsonEnemy(enemy: Enemy, sourceDamage: number): void {
    const embedStacks = enemy.embedStacks;
    const embedPower = enemy.embedPower;
    enemy.embedStacks = 0;
    enemy.embedPower = 0;
    this.detonateCrimsonNeedle(enemy.x, enemy.y, Math.max(sourceDamage, embedPower + embedStacks * 2), true);
    this.spawnCrimsonFragments(enemy.x, enemy.y);
  }

  private destroyLodgedCrimsonNeedles(enemy: Enemy): void {
    (this.projectiles.getChildren() as Projectile[]).forEach((projectile) => {
      if (projectile.active && projectile.lodgedEnemy === enemy) {
        projectile.destroy();
      }
    });
  }

  private spawnCrimsonFragments(x: number, y: number): void {
    const fragments = this.getEnemiesWithinRadiusFrom(x, y, 220).slice(0, 2);
    fragments.forEach((enemy, index) => {
      this.time.delayedCall(100 + index * 60, () => {
        if (!enemy.active) {
          return;
        }

        this.spawnCrimsonNeedle(
          x,
          y,
          enemy,
          Math.max(4, Math.floor(this.combatState.damage * 0.45)),
          this.combatState.projectileSpeed + 80,
          Math.max(420, this.combatState.projectileLifetimeMs - 120),
          this.combatState.projectileTexture,
          this.combatState.tint
        );
      });
    });
  }

  private offerGongfaChoice(): void {
    const linggen = this.runState.hiddenLinggen;
    const selectedIds = getPresentedGongfaIdsForLinggen(
      linggen.id,
      this.runState.learnedGongfaIds
    );
    const options: ChoiceOption[] = selectedIds.map((id) => {
      const gongfa = gongfaConfigs[id];
      return {
        id: gongfa.id,
        kind: "gongfa",
        title: gongfa.name,
        description: `${gongfa.lore} Mastery Speed: ${getGongfaMasterySpeedLabel(
          linggen.id,
          gongfa.id
        )}.`
      };
    });

    this.choiceActive = true;
    this.currentChoiceTitle = `${linggen.name} Revealed`;
    this.currentChoiceOptions = options;
    this.setPausedState(true);
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: linggen.lore,
      options
    });
    this.publishHud(this.lastMessage);
  }

  private resolveChoice(option: ChoiceOption): void {
    const wasStageTribulationChoice =
      option.kind === "continue" && this.pendingStageTribulationChoice;
    const wasFinalBossChoice = option.kind === "continue" && this.pendingFinalBossChoice;

    if (option.kind === "gongfa") {
      this.applyGongfaChoice(option.id as keyof typeof gongfaConfigs, !this.runState.mainGongfaId);
    } else if (option.kind === "mastery") {
      this.applyMasteryChoice(option.id);
      return;
    } else if (option.kind === "continue" && this.pendingPhaseTransitionTarget) {
      this.applyPhaseTransitionChoice();
    } else if (option.kind === "continue" && this.pendingStageTribulationChoice) {
      this.completeStageTribulationVictory();
    } else if (option.kind === "continue" && this.pendingFinalBossChoice) {
      this.pendingFinalBossChoice = false;
      if (!this.runState.finalBossActive) {
        this.startYuanyingTribulation();
      } else {
        this.advanceFinalBossPhase();
      }
    } else if (option.kind === "return-to-title") {
      this.returnToTitle(false);
      return;
    } else if (option.kind === "abandon-run") {
      this.returnToTitle(true);
      return;
    }

    this.choiceActive = false;
    this.currentChoiceTitle = undefined;
    this.currentChoiceOptions = [];
    this.setPausedState(false);
    this.scene.get("ui").events.emit("hide-choice-panel");
    this.publishHud(this.lastMessage);

    if (wasStageTribulationChoice) {
      this.offerGongfaChoice();
      return;
    }

    if (wasFinalBossChoice) {
      return;
    }

  }

  private applyGongfaChoice(gongfaId: keyof typeof gongfaConfigs, replaceCurrent = false): void {
    this.runState.revealedLinggen = this.runState.hiddenLinggen;
    if (replaceCurrent || !this.runState.mainGongfaId) {
      this.runState.mainGongfaId = gongfaId;
      this.runState.masteryPoints = 0;
      this.runState.masteryRank = 0;
      this.runState.masteryLearnedIds = [];
      this.runState.masterySkill2Id = undefined;
      this.runState.masterySkill2CooldownRemaining = 0;
      this.runState.masterySkill2Casts = 0;
      this.runState.masteryChoiceActive = false;
      this.runState.masteryPendingRanks = [];
      this.runState.learnedGongfaIds = [];
    }
    if (!this.runState.learnedGongfaIds.includes(gongfaId)) {
      this.runState.learnedGongfaIds.push(gongfaId);
    }
    this.resetGongfaPassiveState();
    this.applyGongfaStage();
    this.lastMessage = `${gongfaConfigs[gongfaId].name} circulates through your meridians.`;
    this.persistRunCheckpoint();
  }

  private applyMasteryChoice(choiceId: string): void {
    if (!this.runState.mainGongfaId) {
      return;
    }

    this.runState.masteryLearnedIds.push(choiceId);
    this.applyMasteryUpgradeEffect(choiceId);
    this.lastMessage = `${gongfaConfigs[this.runState.mainGongfaId].name} mastery deepens.`;
    this.runState.masteryPendingRanks.shift();
    this.choiceActive = false;
    this.currentChoiceTitle = undefined;
    this.currentChoiceOptions = [];
    this.runState.masteryChoiceActive = false;
    this.setPausedState(false);
    this.scene.get("ui").events.emit("hide-choice-panel");
    this.persistRunCheckpoint();

    if (this.runState.masteryPendingRanks.length > 0) {
      this.offerMasteryChoice();
    }
  }

  private applyMasteryUpgradeEffect(upgradeId: string): void {
    this.applyImprovementEffect(upgradeId);
  }

  private applyImprovementEffect(upgradeId: string): void {
    if (!this.gongfaRuntime) {
      return;
    }

    const result = applyGongfaImprovement(this.gongfaRuntime, upgradeId);
    this.gongfaRuntime = result.runtime;
    this.combatState = result.runtime.combat;

    if (result.playerEffect) {
      this.applyPlayerImprovement(result.playerEffect);
    }
    if (result.passiveEffect) {
      this.applyPassiveImprovement(result.passiveEffect);
    }
  }

  private applyPlayerImprovement(effect: PlayerImprovementEffect): void {
    switch (effect.kind) {
      case "moveSpeed":
        this.player.stats.moveSpeed += effect.value;
        break;
      case "maxHealth":
        this.player.stats.maxHealth += effect.value;
        this.player.heal(effect.value);
        break;
      case "heal":
        this.player.heal(effect.value);
        break;
      case "magnet":
        this.player.stats.magnetRadius += effect.value;
        break;
    }
  }

  private applyPassiveImprovement(improvement: PassiveImprovementEffect): void {
    if (
      improvement.upgradeId === "counterflow-ring" &&
      this.runState.mainGongfaId === "burning-ring-scripture"
    ) {
      this.runState.counterflowRingSegments += 1;
      this.runState.counterflowRingAppliedSegments = this.runState.counterflowRingSegments;
    }

    switch (improvement.effect) {
      case "galeMomentumBuild":
        this.runState.galeMomentumBuildRate += improvement.value;
        break;
      case "galeMomentumDecay":
        this.runState.galeMomentumDecayRate = Math.max(
          0.08,
          this.runState.galeMomentumDecayRate * improvement.value
        );
        break;
      case "waveSynergy":
        this.runState.galeMomentumWaveBonus += improvement.value;
        this.syncGaleMomentumCombatState();
        break;
      case "guardBuild":
        this.runState.guardBuildRate += improvement.value;
        break;
      case "guardStability":
        this.runState.guardDecayRate = Math.max(
          0.08,
          this.runState.guardDecayRate * improvement.value
        );
        break;
      case "defensiveSynergy":
        this.runState.guardMitigation = Math.min(
          0.65,
          this.runState.guardMitigation + improvement.value
        );
        this.syncGengjinCombatState();
        break;
      case "heatBuild":
        this.runState.heatBuildRate += improvement.value;
        break;
      case "heatDecay":
        this.runState.heatDecayRate = Math.max(
          0.08,
          this.runState.heatDecayRate * improvement.value
        );
        break;
      case "auraSynergy":
        this.runState.heatDecayRate = Math.max(0.08, this.runState.heatDecayRate * 0.84);
        this.runState.heatAuraSpeedBonus += improvement.value;
        this.syncBurningRingCombatState();
        break;
      case "embedThreshold":
        this.runState.crimsonEmbedThreshold = Math.max(
          1,
          this.runState.crimsonEmbedThreshold + improvement.value
        );
        break;
      case "pressureBuild":
        this.runState.crimsonPressureBuildRate += improvement.value;
        break;
      case "pressureDecay":
        this.runState.crimsonPressureDecayRate = Math.max(
          0.08,
          this.runState.crimsonPressureDecayRate * improvement.value
        );
        this.runState.crimsonPressureRadiusScale += 0.08;
        this.syncCrimsonPressureCombatState();
        break;
    }
  }

  private applyPhaseTransitionChoice(): void {
    if (!this.pendingPhaseTransitionTarget) {
      return;
    }

    const nextPhase = this.pendingPhaseTransitionTarget;
    const nextJourney = completePhaseTransition(this.runState);
    this.applyFoundationGrowthHook();
    this.runState.realmPhase = nextJourney.realmPhase;
    this.runState.realmProgress = nextJourney.realmProgress;
    this.runState.phaseCleanupActive = nextJourney.phaseCleanupActive;
    this.pendingPhaseTransitionTarget = undefined;
    this.lastMessage =
      nextPhase === "zhongqi"
        ? "Chuqi complete. Foundation pressure settles into Zhongqi."
        : nextPhase === "houqi"
          ? "Zhongqi complete. Pressure deepens into Houqi."
          : "Houqi complete. Dayuanman approaches.";
    this.persistRunCheckpoint();
    this.publishHud(this.lastMessage);
  }

  private completeStageTribulationVictory(): void {
    const result = completeStageTribulation(this.runState);
    if (result.outcome !== "breakthrough") {
      return;
    }

    this.runState.stage = result.state.stage;
    this.runState.realmPhase = result.state.realmPhase;
    this.runState.realmProgress = result.state.realmProgress;
    this.runState.phaseCleanupActive = result.state.phaseCleanupActive;
    this.pendingStageTribulationChoice = false;
    this.applyFoundationGrowthHook();
    this.lastMessage = `${stageConfigs[this.runState.stage].name} Chuqi begins.`;
    this.persistRunCheckpoint();
  }

  private applyFoundationGrowthHook(): void {
    this.runState.foundationGrowthTransactions += 1;
  }

  private returnToTitle(abandon: boolean): void {
    if (abandon) {
      this.clearActiveRunSave();
    }

    window.location.reload();
  }

  private replayCombatImprovement(upgradeId: string): void {
    if (!this.gongfaRuntime) {
      return;
    }

    const result = applyGongfaImprovement(this.gongfaRuntime, upgradeId);
    this.gongfaRuntime = result.runtime;
    this.combatState = result.runtime.combat;
  }

  private resetGongfaPassiveState(): void {
    if (this.runState.mainGongfaId === "jinfeng-gong") {
      this.runState.galeMomentum = 0;
      this.runState.galeMomentumBuildRate = 0.72;
      this.runState.galeMomentumDecayRate = 0.48;
      this.runState.galeMomentumWaveBonus = 0.08;
      this.runState.galeMomentumAppliedRangeBonus = 0;
      this.runState.galeMomentumAppliedSpreadBonus = 0;
      this.runState.galeMomentumAppliedLifetimeBonus = 0;
      return;
    }

    if (this.runState.mainGongfaId === "gengjin-huti") {
      this.runState.guardValue = 0;
      this.runState.guardBuildRate = 0.62;
      this.runState.guardDecayRate = 0.38;
      this.runState.guardMitigation = 0;
      this.runState.guardAppliedRetaliationBonus = 0;
      this.runState.guardAppliedAuraBonus = 0;
      this.runState.guardAppliedDamageBonus = 0;
      this.runState.bladeShellCharge = 0;
      this.runState.bladeShellThreshold = 100;
      this.runState.bladeShellCooldownRemaining = 0;
      this.runState.bladeShellCasts = 0;
      this.runState.galeMomentum = 0;
      this.runState.galeMomentumBuildRate = 0;
      this.runState.galeMomentumDecayRate = 0;
      this.runState.galeMomentumWaveBonus = 0;
      this.runState.galeMomentumAppliedRangeBonus = 0;
      this.runState.galeMomentumAppliedSpreadBonus = 0;
      this.runState.galeMomentumAppliedLifetimeBonus = 0;
      return;
    }

    if (this.runState.mainGongfaId === "burning-ring-scripture") {
      this.runState.heat = 0;
      this.runState.heatBuildRate = 1.2;
      this.runState.heatDecayRate = 0.65;
      this.runState.heatAppliedCooldownBonus = 0;
      this.runState.heatAuraSpeedBonus = 0.08;
      this.runState.ringSegments = 6;
      this.runState.counterflowRingSegments = 0;
      this.runState.counterflowRingAppliedSegments = 0;
      this.runState.counterflowRingRadiusBonus = 0;
      this.runState.counterflowRingCooldownRemaining = 0;
      this.runState.solarFlareCooldownRemaining = 0;
      this.runState.solarFlareCasts = 0;
      this.runState.galeMomentum = 0;
      this.runState.galeMomentumBuildRate = 0;
      this.runState.galeMomentumDecayRate = 0;
      this.runState.galeMomentumWaveBonus = 0;
      this.runState.galeMomentumAppliedRangeBonus = 0;
      this.runState.galeMomentumAppliedSpreadBonus = 0;
      this.runState.galeMomentumAppliedLifetimeBonus = 0;
      this.runState.guardValue = 0;
      this.runState.guardBuildRate = 0;
      this.runState.guardDecayRate = 0;
      this.runState.guardMitigation = 0;
      this.runState.guardAppliedRetaliationBonus = 0;
      this.runState.guardAppliedAuraBonus = 0;
      this.runState.guardAppliedDamageBonus = 0;
      this.runState.bladeShellCharge = 0;
      this.runState.bladeShellThreshold = 100;
      this.runState.bladeShellCooldownRemaining = 0;
      this.runState.bladeShellCasts = 0;
      return;
    }

    if (this.runState.mainGongfaId === "crimson-furnace-sword-art") {
      this.runState.crimsonPressure = 0;
      this.runState.crimsonPressureBuildRate = 1.4;
      this.runState.crimsonPressureDecayRate = 0.6;
      this.runState.crimsonPressureAppliedRadiusBonus = 0;
      this.runState.crimsonPressureRadiusScale = 0.45;
      this.runState.crimsonEmbedThreshold = 3;
      this.runState.furnaceCascadeCooldownRemaining = 0;
      this.runState.furnaceCascadeCasts = 0;
      this.runState.heat = 0;
      this.runState.heatBuildRate = 0;
      this.runState.heatDecayRate = 0;
      this.runState.heatAppliedCooldownBonus = 0;
      this.runState.heatAuraSpeedBonus = 0;
      this.runState.ringSegments = 0;
      this.runState.counterflowRingSegments = 0;
      this.runState.counterflowRingAppliedSegments = 0;
      this.runState.counterflowRingRadiusBonus = 0;
      this.runState.counterflowRingCooldownRemaining = 0;
      this.runState.solarFlareCooldownRemaining = 0;
      this.runState.solarFlareCasts = 0;
      this.runState.galeMomentum = 0;
      this.runState.galeMomentumBuildRate = 0;
      this.runState.galeMomentumDecayRate = 0;
      this.runState.galeMomentumWaveBonus = 0;
      this.runState.galeMomentumAppliedRangeBonus = 0;
      this.runState.galeMomentumAppliedSpreadBonus = 0;
      this.runState.galeMomentumAppliedLifetimeBonus = 0;
      this.runState.guardValue = 0;
      this.runState.guardBuildRate = 0;
      this.runState.guardDecayRate = 0;
      this.runState.guardMitigation = 0;
      this.runState.guardAppliedRetaliationBonus = 0;
      this.runState.guardAppliedAuraBonus = 0;
      this.runState.guardAppliedDamageBonus = 0;
      this.runState.bladeShellCharge = 0;
      this.runState.bladeShellThreshold = 100;
      this.runState.bladeShellCooldownRemaining = 0;
      this.runState.bladeShellCasts = 0;
      return;
    }

    this.runState.galeMomentum = 0;
    this.runState.galeMomentumBuildRate = 0;
    this.runState.galeMomentumDecayRate = 0;
    this.runState.galeMomentumWaveBonus = 0;
    this.runState.galeMomentumAppliedRangeBonus = 0;
    this.runState.galeMomentumAppliedSpreadBonus = 0;
    this.runState.galeMomentumAppliedLifetimeBonus = 0;
    this.runState.guardValue = 0;
    this.runState.guardBuildRate = 0;
    this.runState.guardDecayRate = 0;
    this.runState.guardMitigation = 0;
    this.runState.guardAppliedRetaliationBonus = 0;
    this.runState.guardAppliedAuraBonus = 0;
    this.runState.guardAppliedDamageBonus = 0;
    this.runState.bladeShellCharge = 0;
    this.runState.bladeShellThreshold = 100;
    this.runState.bladeShellCooldownRemaining = 0;
    this.runState.bladeShellCasts = 0;
    this.runState.heat = 0;
    this.runState.heatBuildRate = 0;
    this.runState.heatDecayRate = 0;
    this.runState.heatAppliedCooldownBonus = 0;
    this.runState.heatAuraSpeedBonus = 0;
    this.runState.ringSegments = 0;
    this.runState.counterflowRingSegments = 0;
    this.runState.counterflowRingAppliedSegments = 0;
    this.runState.counterflowRingRadiusBonus = 0;
    this.runState.counterflowRingCooldownRemaining = 0;
    this.runState.solarFlareCooldownRemaining = 0;
    this.runState.solarFlareCasts = 0;
    this.runState.crimsonPressure = 0;
    this.runState.crimsonPressureBuildRate = 0;
    this.runState.crimsonPressureDecayRate = 0;
    this.runState.crimsonPressureAppliedRadiusBonus = 0;
    this.runState.crimsonPressureRadiusScale = 0.45;
    this.runState.crimsonEmbedThreshold = 3;
    this.runState.furnaceCascadeCooldownRemaining = 0;
    this.runState.furnaceCascadeCasts = 0;
  }

  private applyGongfaStage(): void {
    const gongfaId = this.runState.mainGongfaId;
    if (!gongfaId) {
      return;
    }

    this.gongfaRuntime = createGongfaRuntime({
      gongfaId
    });
    this.combatState = this.gongfaRuntime.combat;
    this.runState.galeMomentumAppliedRangeBonus = 0;
    this.runState.galeMomentumAppliedSpreadBonus = 0;
    this.runState.galeMomentumAppliedLifetimeBonus = 0;
    this.syncGaleMomentumCombatState();
    this.runState.guardAppliedRetaliationBonus = 0;
    this.runState.guardAppliedAuraBonus = 0;
    this.runState.guardAppliedDamageBonus = 0;
    this.syncGengjinCombatState();
    this.runState.crimsonPressureAppliedRadiusBonus = 0;
    this.syncCrimsonPressureCombatState();
  }

  private togglePause(): void {
    this.setPausedState(!this.runState.paused);
    this.publishHud(this.runState.paused ? "Meditation pause." : undefined);
  }

  private setPausedState(paused: boolean): void {
    this.runState.paused = paused;
    this.physics.world.isPaused = paused;
    this.time.paused = paused;

    if (paused) {
      this.player.move(new Phaser.Math.Vector2(0, 0));
    }
  }

  private restoreSavedRunState(): void {
    const checkpoint = this.activeRunSave?.checkpoint;
    if (!checkpoint) {
      return;
    }

    this.runState.stage = checkpoint.stage;
    this.runState.realmPhase = checkpoint.realmPhase;
    this.runState.realmProgress = checkpoint.realmProgress;
    this.runState.phaseCleanupActive = checkpoint.phaseCleanupActive;
    this.runState.foundationGrowthTransactions = checkpoint.foundationGrowthTransactions;
    this.runState.masteryPoints = checkpoint.masteryPoints;
    this.runState.masteryRank = checkpoint.masteryRank;
    this.runState.masteryLearnedIds = [...checkpoint.masteryLearnedIds];
    this.runState.upgradeSelectionIds = [...(checkpoint.upgradeSelectionIds ?? [])];
    this.runState.masterySkill2Id = checkpoint.masterySkill2Id;
    this.runState.masterySkill2CooldownRemaining = checkpoint.masterySkill2CooldownRemaining ?? 0;
    this.runState.masterySkill2Casts = checkpoint.masterySkill2Casts ?? 0;
    this.runState.masteryChoiceActive = checkpoint.masteryChoiceActive;
    this.runState.masteryPendingRanks = [...checkpoint.masteryPendingRanks];
    this.runState.learnedGongfaIds = [...(checkpoint.learnedGongfaIds ?? [])];
    this.runState.galeMomentum = checkpoint.galeMomentum ?? 0;
    this.runState.galeMomentumBuildRate = checkpoint.galeMomentumBuildRate ?? 0;
    this.runState.galeMomentumDecayRate = checkpoint.galeMomentumDecayRate ?? 0;
    this.runState.galeMomentumWaveBonus = checkpoint.galeMomentumWaveBonus ?? 0;
    this.runState.galeMomentumAppliedRangeBonus = checkpoint.galeMomentumAppliedRangeBonus ?? 0;
    this.runState.galeMomentumAppliedSpreadBonus = checkpoint.galeMomentumAppliedSpreadBonus ?? 0;
    this.runState.galeMomentumAppliedLifetimeBonus = checkpoint.galeMomentumAppliedLifetimeBonus ?? 0;
    this.runState.heat = checkpoint.heat ?? 0;
    this.runState.heatBuildRate = checkpoint.heatBuildRate ?? 0;
    this.runState.heatDecayRate = checkpoint.heatDecayRate ?? 0;
    this.runState.heatAppliedCooldownBonus = checkpoint.heatAppliedCooldownBonus ?? 0;
    this.runState.heatAuraSpeedBonus = checkpoint.heatAuraSpeedBonus ?? 0;
    this.runState.ringSegments = checkpoint.ringSegments ?? 0;
    this.runState.counterflowRingSegments = checkpoint.counterflowRingSegments ?? 0;
    this.runState.counterflowRingAppliedSegments = checkpoint.counterflowRingAppliedSegments ?? 0;
    this.runState.counterflowRingRadiusBonus = checkpoint.counterflowRingRadiusBonus ?? 0;
    this.runState.counterflowRingCooldownRemaining = checkpoint.counterflowRingCooldownRemaining ?? 0;
    this.runState.solarFlareCooldownRemaining = checkpoint.solarFlareCooldownRemaining ?? 0;
    this.runState.solarFlareCasts = checkpoint.solarFlareCasts ?? 0;
    this.runState.crimsonPressure = checkpoint.crimsonPressure ?? 0;
    this.runState.crimsonPressureBuildRate = checkpoint.crimsonPressureBuildRate ?? 0;
    this.runState.crimsonPressureDecayRate = checkpoint.crimsonPressureDecayRate ?? 0;
    this.runState.crimsonPressureAppliedRadiusBonus =
      checkpoint.crimsonPressureAppliedRadiusBonus ?? 0;
    this.runState.crimsonPressureRadiusScale = checkpoint.crimsonPressureRadiusScale ?? 0.45;
    this.runState.crimsonEmbedThreshold = checkpoint.crimsonEmbedThreshold ?? 3;
    this.runState.furnaceCascadeCooldownRemaining =
      checkpoint.furnaceCascadeCooldownRemaining ?? 0;
    this.runState.furnaceCascadeCasts = checkpoint.furnaceCascadeCasts ?? 0;
    this.runState.guardValue = checkpoint.guardValue ?? 0;
    this.runState.guardBuildRate = checkpoint.guardBuildRate ?? 0;
    this.runState.guardDecayRate = checkpoint.guardDecayRate ?? 0;
    this.runState.guardMitigation = checkpoint.guardMitigation ?? 0;
    this.runState.guardAppliedRetaliationBonus = checkpoint.guardAppliedRetaliationBonus ?? 0;
    this.runState.guardAppliedAuraBonus = checkpoint.guardAppliedAuraBonus ?? 0;
    this.runState.guardAppliedDamageBonus = checkpoint.guardAppliedDamageBonus ?? 0;
    this.runState.bladeShellCharge = checkpoint.bladeShellCharge ?? 0;
    this.runState.bladeShellThreshold = checkpoint.bladeShellThreshold ?? 100;
    this.runState.bladeShellCooldownRemaining = checkpoint.bladeShellCooldownRemaining ?? 0;
    this.runState.bladeShellCasts = checkpoint.bladeShellCasts ?? 0;
    this.runState.hiddenLinggen = linggenConfigs[checkpoint.hiddenLinggenId];
    this.runState.revealedLinggen = checkpoint.revealedLinggenId
      ? linggenConfigs[checkpoint.revealedLinggenId]
      : undefined;
    this.runState.lingcaoCollected = checkpoint.lingcaoCollected;
    this.runState.lingcaoMarker = checkpoint.lingcaoMarker;
    this.runState.lingcaoX = checkpoint.lingcaoX;
    this.runState.lingcaoY = checkpoint.lingcaoY;
    this.runState.mainGongfaId = checkpoint.mainGongfaId;
    if (this.runState.mainGongfaId && !this.runState.learnedGongfaIds.includes(this.runState.mainGongfaId)) {
      this.runState.learnedGongfaIds.unshift(this.runState.mainGongfaId);
    }
    this.runState.kills = checkpoint.kills;
    this.runState.elapsedMs = checkpoint.elapsedMs;
    if (this.runState.mainGongfaId) {
      this.applyGongfaStage();
    }
  }

  private persistRunCheckpoint(): void {
    if (typeof window === "undefined") {
      return;
    }

    const checkpoint: ActiveRunCheckpoint = {
      playerHealth: this.player?.stats.health,
      playerMaxHealth: this.player?.stats.maxHealth,
      playerMoveSpeed: this.player?.stats.moveSpeed,
      playerMagnetRadius: this.player?.stats.magnetRadius,
      stage: this.runState.stage,
      realmPhase: this.runState.realmPhase,
      realmProgress: this.runState.realmProgress,
      phaseCleanupActive: this.runState.phaseCleanupActive,
      foundationGrowthTransactions: this.runState.foundationGrowthTransactions,
      masteryPoints: this.runState.masteryPoints,
      masteryRank: this.runState.masteryRank,
      masteryLearnedIds: this.runState.masteryLearnedIds,
      upgradeSelectionIds: this.runState.upgradeSelectionIds,
      masterySkill2Id: this.runState.masterySkill2Id,
      masterySkill2CooldownRemaining: this.runState.masterySkill2CooldownRemaining,
      masterySkill2Casts: this.runState.masterySkill2Casts,
      masteryChoiceActive: this.runState.masteryChoiceActive,
      masteryPendingRanks: this.runState.masteryPendingRanks,
      learnedGongfaIds: this.runState.learnedGongfaIds,
      galeMomentum: this.runState.galeMomentum,
      galeMomentumBuildRate: this.runState.galeMomentumBuildRate,
      galeMomentumDecayRate: this.runState.galeMomentumDecayRate,
      galeMomentumWaveBonus: this.runState.galeMomentumWaveBonus,
      galeMomentumAppliedRangeBonus: this.runState.galeMomentumAppliedRangeBonus,
      galeMomentumAppliedSpreadBonus: this.runState.galeMomentumAppliedSpreadBonus,
      galeMomentumAppliedLifetimeBonus: this.runState.galeMomentumAppliedLifetimeBonus,
      heat: this.runState.heat,
      heatBuildRate: this.runState.heatBuildRate,
      heatDecayRate: this.runState.heatDecayRate,
      heatAppliedCooldownBonus: this.runState.heatAppliedCooldownBonus,
      heatAuraSpeedBonus: this.runState.heatAuraSpeedBonus,
      ringSegments: this.runState.ringSegments,
      counterflowRingSegments: this.runState.counterflowRingSegments,
      counterflowRingAppliedSegments: this.runState.counterflowRingAppliedSegments,
      counterflowRingRadiusBonus: this.runState.counterflowRingRadiusBonus,
      counterflowRingCooldownRemaining: this.runState.counterflowRingCooldownRemaining,
      solarFlareCooldownRemaining: this.runState.solarFlareCooldownRemaining,
      solarFlareCasts: this.runState.solarFlareCasts,
      crimsonPressure: this.runState.crimsonPressure,
      crimsonPressureBuildRate: this.runState.crimsonPressureBuildRate,
      crimsonPressureDecayRate: this.runState.crimsonPressureDecayRate,
      crimsonPressureAppliedRadiusBonus: this.runState.crimsonPressureAppliedRadiusBonus,
      crimsonPressureRadiusScale: this.runState.crimsonPressureRadiusScale,
      crimsonEmbedThreshold: this.runState.crimsonEmbedThreshold,
      furnaceCascadeCooldownRemaining: this.runState.furnaceCascadeCooldownRemaining,
      furnaceCascadeCasts: this.runState.furnaceCascadeCasts,
      guardValue: this.runState.guardValue,
      guardBuildRate: this.runState.guardBuildRate,
      guardDecayRate: this.runState.guardDecayRate,
      guardMitigation: this.runState.guardMitigation,
      guardAppliedRetaliationBonus: this.runState.guardAppliedRetaliationBonus,
      guardAppliedAuraBonus: this.runState.guardAppliedAuraBonus,
      guardAppliedDamageBonus: this.runState.guardAppliedDamageBonus,
      bladeShellCharge: this.runState.bladeShellCharge,
      bladeShellThreshold: this.runState.bladeShellThreshold,
      bladeShellCooldownRemaining: this.runState.bladeShellCooldownRemaining,
      bladeShellCasts: this.runState.bladeShellCasts,
      hiddenLinggenId: this.runState.hiddenLinggen.id,
      revealedLinggenId: this.runState.revealedLinggen?.id,
      lingcaoCollected: this.runState.lingcaoCollected,
      lingcaoMarker: this.runState.lingcaoMarker,
      lingcaoX: this.runState.lingcaoX,
      lingcaoY: this.runState.lingcaoY,
      healingPills: (this.healingPills?.getChildren() as HealingPill[] | undefined)
        ?.filter((pill) => pill.active)
        .map((pill) => ({
          x: pill.x,
          y: pill.y,
          healAmount: pill.healAmount
        })) ?? [],
      mainGongfaId: this.runState.mainGongfaId,
      kills: this.runState.kills,
      elapsedMs: this.runState.elapsedMs
    };

    const save = this.activeRunSave ?? createActiveRunSave(Date.now());
    this.activeRunSave = {
      ...save,
      checkpoint
    };
    saveActiveRun(window.localStorage, this.activeRunSave);
  }

  private clearActiveRunSave(): void {
    if (typeof window === "undefined") {
      return;
    }

    clearActiveRun(window.localStorage);
    this.activeRunSave = null;
  }

  private recordCompletion(): void {
    if (typeof window === "undefined") {
      return;
    }

    const record = loadProfileRecord(window.localStorage) ?? createProfileRecord();
    record.completedRuns += 1;
    saveProfileRecord(window.localStorage, record);
  }

  private handlePlayerDeath(message: string): void {
    this.runState.gameOver = true;
    this.setPausedState(true);
    this.lastMessage = message;
    this.clearActiveRunSave();
    this.publishHud(message);
  }

  private publishHud(message?: string): void {
    this.registry.set("hud", {
      health: this.player?.stats.health ?? 100,
      maxHealth: this.player?.stats.maxHealth ?? 100,
      realmPhase: this.runState.realmPhase,
      realmProgress: this.runState.realmProgress,
      stageBreakthroughReady: this.runState.realmProgress >= 100,
      foundationGrowthTransactions: this.runState.foundationGrowthTransactions,
      masteryPoints: this.runState.masteryPoints,
      masteryProgress: getMasteryProgressWithinRank(
        this.runState.masteryPoints,
        this.runState.masteryRank
      ),
      masteryRank: this.runState.masteryRank,
      masterySkill2: this.runState.masterySkill2Id,
      masterySkill2Casts: this.runState.masterySkill2Casts,
      galeMomentum: this.runState.galeMomentum,
      heat: this.runState.heat,
      ringSegments: this.runState.ringSegments,
      counterflowRingSegments: this.runState.counterflowRingSegments,
      solarFlareCasts: this.runState.solarFlareCasts,
      pressure: this.runState.crimsonPressure,
      embeddedEnemies: (this.enemies?.getChildren() as Enemy[] | undefined)?.filter(
        (enemy) => enemy.active && enemy.embedStacks > 0
      ).length ?? 0,
      furnaceCascadeCasts: this.runState.furnaceCascadeCasts,
      crimsonPressureRadiusScale: this.runState.crimsonPressureRadiusScale,
      guard: this.runState.guardValue,
      guardMitigation: this.runState.guardMitigation,
      bladeShellCharge: this.runState.bladeShellCharge,
      bladeShellCasts: this.runState.bladeShellCasts,
      skillTags: this.runState.mainGongfaId
        ? getGongfaSkillTags(this.runState.mainGongfaId).join(", ")
        : "",
      kills: this.runState.kills,
      elapsedMs: this.runState.elapsedMs,
      remainingMs: Math.max(0, waveDurationMs - this.runState.elapsedMs),
      paused: this.runState.paused,
      gameOver: this.runState.gameOver,
      stageName: stageConfigs[this.runState.stage].name,
      linggenName: this.runState.revealedLinggen?.name ?? "Unrevealed",
      linggenGrades: this.runState.revealedLinggen
        ? getLinggenAffinityGradeSummary(this.runState.revealedLinggen.id).join(", ")
        : "Hidden",
      gongfaName:
        this.runState.mainGongfaId
          ? gongfaConfigs[this.runState.mainGongfaId as keyof typeof gongfaConfigs].name
          : "Crude Qi Thread",
      methodDamage: this.combatState.damage,
      methodCount: this.combatState.count,
      methodCooldownMs: this.combatState.cooldownMs,
      moveSpeed: this.player?.stats.moveSpeed ?? 0,
      enemyKinds: Object.keys(enemyConfigs).length,
      enemyCount: this.enemies?.countActive(true) ?? 0,
      orbCount: this.orbs?.countActive(true) ?? 0,
      lingcaoCollected: this.runState.lingcaoCollected,
      message: message ?? this.lastMessage
    });
  }

  getTestSnapshot(): GameSnapshot {
    return {
      sceneName: this.scene.key,
      activeScenes: this.scene.manager.getScenes(true).map((scene) => scene.scene.key),
      message: this.lastMessage,
      hud: {
        lines: buildHudLines({
          stageName: stageConfigs[this.runState.stage].name,
      realmPhase: this.runState.realmPhase,
      realmProgress: this.runState.realmProgress,
      stageBreakthroughReady: this.runState.realmProgress >= 100,
      foundationGrowthTransactions: this.runState.foundationGrowthTransactions,
          masteryRank: this.runState.masteryRank,
          masteryProgress: getMasteryProgressWithinRank(
            this.runState.masteryPoints,
            this.runState.masteryRank
          ),
          masterySkill2: this.runState.masterySkill2Id,
          masterySkill2Casts: this.runState.masterySkill2Casts,
          galeMomentum: this.runState.galeMomentum,
          skillTags: this.runState.mainGongfaId
            ? getGongfaSkillTags(this.runState.mainGongfaId).join(", ")
            : "",
          guard: this.runState.guardValue,
          guardMitigation: this.runState.guardMitigation,
          bladeShellCasts: this.runState.bladeShellCasts,
          bladeShellCharge: this.runState.bladeShellCharge,
          linggenName: this.runState.revealedLinggen?.name ?? "Unrevealed",
          linggenGrades: this.runState.revealedLinggen
            ? getLinggenAffinityGradeSummary(this.runState.revealedLinggen.id).join(", ")
            : "Hidden",
          gongfaName:
            this.runState.mainGongfaId
              ? gongfaConfigs[this.runState.mainGongfaId as keyof typeof gongfaConfigs].name
              : "Crude Qi Thread",
          health: this.player?.stats.health ?? 100,
          maxHealth: this.player?.stats.maxHealth ?? 100,
          methodCount: this.combatState.count,
          methodDamage: this.combatState.damage,
          methodCooldownMs: this.combatState.cooldownMs,
          moveSpeed: this.player?.stats.moveSpeed ?? 0,
          kills: this.runState.kills,
          lingcaoCollected: this.runState.lingcaoCollected,
          remainingMs: Math.max(0, waveDurationMs - this.runState.elapsedMs)
        })
      },
      player: {
        x: this.player?.x ?? 0,
        y: this.player?.y ?? 0,
        health: this.player?.stats.health ?? 0,
        maxHealth: this.player?.stats.maxHealth ?? 0,
        moveSpeed: this.player?.stats.moveSpeed ?? 0
      },
      progression: {
        stage: this.runState.stage,
        realmPhase: this.runState.realmPhase,
        realmProgress: this.runState.realmProgress,
        stageBreakthroughReady: this.runState.realmProgress >= 100,
        foundationGrowthTransactions: this.runState.foundationGrowthTransactions,
        masteryPoints: this.runState.masteryPoints,
        masteryProgress: getMasteryProgressWithinRank(
          this.runState.masteryPoints,
          this.runState.masteryRank
        ),
        masteryRank: this.runState.masteryRank,
        masterySkill2: this.runState.masterySkill2Id,
        masterySkill2Casts: this.runState.masterySkill2Casts,
        learnedGongfaIds: [...this.runState.learnedGongfaIds],
        skillTags: this.runState.mainGongfaId
          ? getGongfaSkillTags(this.runState.mainGongfaId)
          : [],
        galeMomentum: this.runState.galeMomentum,
        heat: this.runState.heat,
        ringSegments: this.runState.ringSegments,
        counterflowRingSegments: this.runState.counterflowRingSegments,
        solarFlareCasts: this.runState.solarFlareCasts,
        pressure: this.runState.crimsonPressure,
        embeddedEnemies: (this.enemies?.getChildren() as Enemy[] | undefined)?.filter(
          (enemy) => enemy.active && enemy.embedStacks > 0
        ).length ?? 0,
        furnaceCascadeCasts: this.runState.furnaceCascadeCasts,
        crimsonPressureRadiusScale: this.runState.crimsonPressureRadiusScale,
        guard: this.runState.guardValue,
        guardMitigation: this.runState.guardMitigation,
        bladeShellCharge: this.runState.bladeShellCharge,
        bladeShellCasts: this.runState.bladeShellCasts,
        linggen: this.runState.revealedLinggen?.id ?? "unrevealed",
        linggenGrades: this.runState.revealedLinggen
          ? getLinggenAffinityGradeSummary(this.runState.revealedLinggen.id).join(", ")
          : "Hidden",
        gongfa: this.runState.mainGongfaId ?? "baseline",
        lingcaoCollected: this.runState.lingcaoCollected,
        lingcaoMarker: this.runState.lingcaoMarker,
        finalBossActive: this.runState.finalBossActive,
        finalBossPhaseIndex: this.runState.finalBossPhaseIndex
      },
      combat: {
        pattern: this.combatState.pattern,
        damage: this.combatState.damage,
        count: this.combatState.count,
        cooldownMs: this.combatState.cooldownMs,
        pierce: this.combatState.pierce,
        segmentCount: this.combatState.count,
        counterflowSegments: this.runState.counterflowRingSegments,
        spreadDeg: this.combatState.spreadDeg,
        range: this.combatState.range,
        auraRadius: this.combatState.auraRadius,
        retaliationDamage: this.combatState.retaliationDamage,
        returnShots: this.combatState.returnShots,
        shellBursts: this.combatState.shellBursts
      },
      counts: {
        enemies: this.enemies?.countActive(true) ?? 0,
        orbs: this.orbs?.countActive(true) ?? 0,
        healingPills: this.healingPills?.countActive(true) ?? 0,
        healingPillPositions: ((this.healingPills?.getChildren() as HealingPill[] | undefined) ?? [])
          .filter((pill) => pill.active)
          .map((pill) => ({
            x: pill.x,
            y: pill.y,
            healAmount: pill.healAmount
          })),
        enemyIds: ((this.enemies?.getChildren() as Enemy[] | undefined) ?? []).reduce<
          Record<string, number>
        >((acc, enemy) => {
          if (!enemy.active) {
            return acc;
          }

          const id = enemy.config.id;
          acc[id] = (acc[id] ?? 0) + 1;
          return acc;
        }, {})
      },
      choice: this.choiceActive && this.currentChoiceTitle
        ? {
            title: this.currentChoiceTitle,
            options: this.currentChoiceOptions
          }
        : undefined
    };
  }

  forceSpawnEnemies(count: number): void {
    const ids = this.runState.finalBossActive
      ? ([
          "celestial-construct",
          "tribulation-shade",
          "celestial-construct"
        ] as const)
      : this.runState.stage === "yuanying"
        ? (["celestial-construct", "tribulation-shade"] as const)
        : this.runState.stage === "jindan"
          ? (["corpse-cultivator", "resentful-spirit", "bone-crow"] as const)
          : (["jade-rat", "mist-wolf", "bone-crow"] as const);
    for (let i = 0; i < count; i += 1) {
      const enemyId = ids[i % ids.length];
      this.spawner.spawnManual(enemyId, this.player.x + 120 + i * 18, this.player.y + 24);
    }
    this.publishHud(this.lastMessage);
  }

  forceGrantQi(amount: number): void {
    this.grantQi(amount);
    this.publishHud(this.lastMessage);
  }

  forceSelectChoice(index: number): void {
    if (!this.choiceActive || index < 0 || index >= this.currentChoiceOptions.length) {
      return;
    }
    this.resolveChoice(this.currentChoiceOptions[index]);
  }

  forceClaimLingcao(): void {
    const lingcao = this.lingcaoGroup.getChildren()[0] as Lingcao | undefined;
    if (lingcao?.active) {
      this.collectLingcao(lingcao);
    }
  }

  forceSetLinggen(id: LinggenId): void {
    if (this.runState.revealedLinggen) {
      return;
    }

    this.runState.hiddenLinggen = linggenConfigs[id];
    this.publishHud(this.lastMessage);
  }

  forceDamagePlayer(amount: number): void {
    this.applyIncomingDamage(amount);
    if (this.player.stats.health <= 0) {
      this.handlePlayerDeath("Cultivator fell. Qi scattered.");
      return;
    }

    this.publishHud(this.lastMessage);
  }

  forceAdvanceRealmProgress(amount: number): void {
    this.advanceRealmProgress(amount);
    this.persistRunCheckpoint();
    this.publishHud(this.lastMessage);
  }

  forceClearEnemies(): void {
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (enemy.active) {
        enemy.destroy();
      }
    });
    this.maybeResolvePhaseTransition();
    this.publishHud(this.lastMessage);
  }

  forceSpawnQiOrb(qiValue: number): void {
    this.spawnOrb(this.player.x + 24, this.player.y + 24, qiValue);
    this.publishHud(this.lastMessage);
  }

  forceSpawnHealingPill(healAmount = 30, offsetX = 0, offsetY = 0): void {
    this.spawnHealingPill(this.player.x + offsetX, this.player.y + offsetY, healAmount);
    this.publishHud(this.lastMessage);
  }

  forceAdvanceMasteryProgress(points: number): void {
    this.advanceMasteryProgress(points);
    this.publishHud(this.lastMessage);
  }

  private getRunSeed(): number {
    return this.activeRunSave?.seed ?? 0;
  }

  private applyIncomingDamage(amount: number): void {
    const mitigation = this.runState.mainGongfaId === "gengjin-huti" ? this.runState.guardMitigation : 0;
    const finalDamage = Math.max(1, Math.floor(amount * (1 - mitigation)));
    this.player.applyDamage(finalDamage);

    if (this.runState.mainGongfaId === "gengjin-huti") {
      this.runState.bladeShellCharge = Math.min(
        this.runState.bladeShellThreshold,
        this.runState.bladeShellCharge + finalDamage * 2
      );
      this.syncGengjinCombatState();
      this.tickBladeShell(0);
      this.persistRunCheckpoint();
    }
  }

  private advanceMasteryProgress(points: number): void {
    if (!this.runState.mainGongfaId || points <= 0) {
      return;
    }

    const previousRank = this.runState.masteryRank;
    this.runState.masteryPoints += points;
    const targetRank = Math.floor(this.runState.masteryPoints / 100);
    if (targetRank <= this.runState.masteryRank) {
      return;
    }

    this.runState.masteryRank = targetRank;
    this.lastMessage = formatMasteryRankUpMessage(
      gongfaConfigs[this.runState.mainGongfaId].name,
      targetRank
    );
    for (let rank = previousRank + 1; rank <= targetRank; rank += 1) {
      if (rank === 10) {
        this.runState.masterySkill2Id = getRank10Skill2Id(this.runState.mainGongfaId);
        this.runState.masterySkill2CooldownRemaining = this.getMasterySkill2CooldownMs();
        if (this.runState.masterySkill2Id === "blade-shell-rebound") {
          this.runState.bladeShellCooldownRemaining = 0;
        } else if (this.runState.masterySkill2Id === "solar-flare-cycle") {
          this.runState.solarFlareCooldownRemaining = 0;
        }
        continue;
      }

      if (!this.runState.masteryPendingRanks.includes(rank)) {
        this.runState.masteryPendingRanks.push(rank);
      }
    }

    if (this.runState.finalBossActive) {
      this.runState.masteryChoiceActive = false;
    } else if (this.runState.masteryPendingRanks.length > 0) {
      this.offerMasteryChoice();
    } else {
      this.runState.masteryChoiceActive = false;
    }

    this.persistRunCheckpoint();
  }

  private grantQi(amount: number): void {
    if (amount <= 0) {
      return;
    }

    const efficiency = this.runState.hiddenLinggen.efficiency;
    this.advanceRealmProgress(amount * 8 * efficiency);
    this.advanceMasteryProgress(amount * efficiency * 2);
  }

  private offerMasteryChoice(): void {
    if (!this.runState.mainGongfaId) {
      return;
    }

    const rank = this.runState.masteryPendingRanks[0] ?? this.runState.masteryRank;
    const options = getDeterministicMasteryChoiceIds({
      gongfaId: this.runState.mainGongfaId,
      rank,
      seed: String(this.getRunSeed()),
      learnedIds: this.runState.masteryLearnedIds
    }).map<ChoiceOption>((id) => {
      const upgrade = upgradeConfigs.find((item) => item.id === id);
      return {
        id,
        kind: "mastery",
        title: upgrade?.name ?? id,
        description: upgrade?.lore ?? "A deterministic mastery refinement."
      };
    });

    if (options.length === 0) {
      return;
    }

    this.choiceActive = true;
    this.runState.masteryChoiceActive = true;
    this.currentChoiceTitle = `${gongfaConfigs[this.runState.mainGongfaId].name} Mastery Rank ${rank}`;
    this.currentChoiceOptions = options;
    this.setPausedState(true);
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: "Choose one refinement for the current Gongfa rank.",
      options
    });
    this.persistRunCheckpoint();
    this.publishHud(this.lastMessage);
  }

  private advanceRealmProgress(amount: number): void {
    if (this.runState.gameOver || this.runState.finalBossActive) {
      return;
    }

    const nextJourney = grantRealmQi(this.runState, amount);
    this.runState.realmProgress = nextJourney.realmProgress;
    this.runState.phaseCleanupActive = nextJourney.phaseCleanupActive;
  }

  private maybeResolvePhaseTransition(): void {
    if (!this.runState.phaseCleanupActive) {
      return;
    }

    if (this.runState.finalBossActive) {
      this.runState.finalBossPhaseReady = true;

      if (this.runState.masteryPendingRanks.length > 0) {
        this.offerMasteryChoice();
        return;
      }

      if (this.runState.finalBossPhaseIndex >= 2) {
        this.completeFinalBossVictory();
        return;
      }

      this.offerFinalBossPhaseChoice();
      return;
    }

    const decision = getCleanupDecision(this.runState);
    if (decision?.kind === "tribulation") {
      if (decision.stage === "yuanying") {
        this.offerYuanyingTribulationChoice();
      } else {
        this.offerStageTribulationChoice();
      }
      return;
    }

    this.offerPhaseTransition();
  }

  private offerYuanyingTribulationChoice(): void {
    if (this.choiceActive || this.pendingFinalBossChoice) {
      return;
    }

    this.pendingFinalBossChoice = true;
    this.choiceActive = true;
    this.currentChoiceTitle = "Yuanying Heavenly Tribulation";
    this.currentChoiceOptions = [
      {
        id: "yuanying-tribulation-continue",
        kind: "continue",
        title: "Face the Heavenly Tribulation",
        description: "Begin the normal-ending boss sequence."
      }
    ];
    this.setPausedState(true);
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: "Dayuanman clears. Cloudbreak Summit answers with thunder.",
      options: this.currentChoiceOptions
    });
    this.publishHud(this.lastMessage);
  }

  private offerStageTribulationChoice(): void {
    if (this.choiceActive || this.pendingStageTribulationChoice) {
      return;
    }

    const destination =
      this.runState.stage === "lianqi"
        ? "zhuji"
        : this.runState.stage === "zhuji"
          ? "jindan"
          : "yuanying";
    const destinationName = stageConfigs[destination].name;
    const currentName = stageConfigs[this.runState.stage].name;
    this.pendingStageTribulationChoice = true;
    this.choiceActive = true;
    this.currentChoiceTitle = `${currentName} Tribulation`;
    this.currentChoiceOptions = [
      {
        id: `${this.runState.stage}-tribulation-continue`,
        kind: "continue",
        title: `Break through into ${destinationName}`,
        description: `Complete the ${currentName} Tribulation and open the next Gongfa slot.`
      }
    ];
    this.setPausedState(true);
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: `${currentName} Dayuanman clears. Its concluding Tribulation rises.`,
      options: this.currentChoiceOptions
    });
    this.publishHud(this.lastMessage);
  }

  private startYuanyingTribulation(): void {
    this.runState.finalBossActive = true;
    this.runState.finalBossPhaseIndex = 0;
    this.runState.finalBossPhaseReady = false;
    this.runState.phaseCleanupActive = false;
    this.runState.realmProgress = 0;
    this.finalBossWaveAccumulator = 0;
    this.finalBossHazardAccumulator = 0;
    this.finalBossPhaseSpawned = false;
    this.finalBossSafeZoneX = this.player.x;
    this.finalBossSafeZoneY = this.player.y;
    this.finalBossSafeZoneRadius = 220;
    this.lastMessage = "Lightning judgment descends over Cloudbreak Summit.";
    this.persistRunCheckpoint();
  }

  private offerFinalBossPhaseChoice(): void {
    if (this.choiceActive || !this.runState.finalBossActive) {
      return;
    }

    const phaseNames = ["Lightning Judgment", "Tribulation Shades", "Collapsing Safe Zones"] as const;
    const nextPhaseIndex = this.runState.finalBossPhaseIndex + 1;
    const nextPhaseName = phaseNames[nextPhaseIndex] ?? "Heavenly Judgment";

    this.pendingFinalBossChoice = true;
    this.choiceActive = true;
    this.currentChoiceTitle = "Yuanying Heavenly Tribulation";
    this.currentChoiceOptions = [
      {
        id: "final-boss-continue",
        kind: "continue",
        title: `Continue to ${nextPhaseName}`,
        description: "Resolve the next celestial pattern after cleanup and autosave."
      }
    ];
    this.setPausedState(true);
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: `${phaseNames[this.runState.finalBossPhaseIndex]} clears. The tribulation deepens.`,
      options: this.currentChoiceOptions
    });
    this.publishHud(this.lastMessage);
  }

  private advanceFinalBossPhase(): void {
    this.runState.finalBossPhaseIndex += 1;
    this.runState.finalBossPhaseReady = false;
    this.runState.phaseCleanupActive = false;
    this.finalBossWaveAccumulator = 0;
    this.finalBossHazardAccumulator = 0;
    this.finalBossPhaseSpawned = false;
    this.finalBossSafeZoneX = this.player.x;
    this.finalBossSafeZoneY = this.player.y;
    this.finalBossSafeZoneRadius = Math.max(120, 220 - this.runState.finalBossPhaseIndex * 40);
    const phaseNames = ["Lightning Judgment", "Tribulation Shades", "Collapsing Safe Zones"] as const;
    this.lastMessage = `${phaseNames[this.runState.finalBossPhaseIndex]} begins.`;
    this.persistRunCheckpoint();
  }

  private completeFinalBossVictory(): void {
    this.runState.finalBossActive = false;
    this.runState.finalBossPhaseReady = false;
    this.runState.phaseCleanupActive = false;
    this.runState.gameOver = true;
    this.pendingFinalBossChoice = false;
    this.setPausedState(true);
    this.recordCompletion();
    this.clearActiveRunSave();
    this.lastMessage = "The Heavenly Tribulation is broken. The run is complete.";
    this.choiceActive = true;
    this.currentChoiceTitle = "Run Complete";
    this.currentChoiceOptions = [
      {
        id: "victory-return-title",
        kind: "return-to-title",
        title: "Return to Title",
        description: "Leave the completed run and return to the shell."
      }
    ];
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: "A permanent completion record has been written.",
      options: this.currentChoiceOptions
    });
    this.publishHud(this.lastMessage);
  }

  private collectRemainingOrbs(): void {
    this.orbs.getChildren().forEach((child) => {
      const orb = child as QiOrb;
      if (orb.active) {
        this.collectOrb(orb);
      }
    });
  }

  private offerPhaseTransition(): void {
    if (this.choiceActive || this.pendingPhaseTransitionTarget) {
      return;
    }

    const decision = getCleanupDecision(this.runState);
    if (!decision || decision.kind !== "phase-transition") {
      return;
    }
    const nextPhase = decision.nextPhase;

    this.pendingPhaseTransitionTarget = nextPhase;
    this.choiceActive = true;
    this.currentChoiceTitle = "Phase Transition";
    this.currentChoiceOptions = [
      {
        id: "phase-continue",
        kind: "continue",
        title: `Continue to ${nextPhase}`,
        description: "Advance after cleanup and autosave."
      },
      {
        id: "phase-return-title",
        kind: "return-to-title",
        title: "Return to Title",
        description: "Leave the run on the current checkpoint."
      },
      {
        id: "phase-abandon",
        kind: "abandon-run",
        title: "Abandon Run",
        description: "Delete the active save and return to title."
      }
    ];
    this.setPausedState(true);
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: `Cleanup complete. ${nextPhase === "zhongqi" ? "Lianqi Chuqi" : this.runState.realmPhase} is ready to advance.`,
      options: this.currentChoiceOptions
    });
    this.publishHud(this.lastMessage);
  }

}
