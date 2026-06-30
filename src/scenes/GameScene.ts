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
  type LinggenConfig
} from "../data/linggen";
import { stageConfigs, type StageId } from "../data/stages";
import { Enemy } from "../entities/Enemy";
import { Lingcao } from "../entities/Lingcao";
import { HealingPill } from "../entities/HealingPill";
import { Player } from "../entities/Player";
import { SoundFx } from "../audio/SoundFx";
import { SpiritTreasure } from "../entities/SpiritTreasure";
import {
  getSpiritTreasureConfig,
  type SpiritTreasureId
} from "../data/spiritTreasures";
import {
  aggregateSpiritTreasureEffects,
  offerSpiritTreasure,
  replaceSpiritTreasure,
  spiritTreasureDropForKill
} from "../logic/spiritTreasures";
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
import { Evade } from "../logic/evade";
import {
  advanceRunJourney,
  createRunJourneyStateFromCheckpoint,
  projectRunJourneyCheckpointFields,
  type RunJourneyCommand,
  type RunJourneyDecision,
  type RunJourneyState
} from "../logic/runJourney";
import {
  getDeterministicMasteryChoiceIds,
  getMasteryChoiceDefinition,
  getRank10Skill2Id
} from "../logic/mastery";
import {
  advanceGongfaRuntimeForProjectileHit,
  advanceGongfaRuntime,
  applyGongfaImprovement,
  createGongfaRuntime,
  createGongfaRuntimeFromCheckpoint,
  galeStepSeveranceCorridor,
  ironWakeWall,
  reboundingEdgeBlade,
  getAuthoredSkill2Plan,
  getGongfaProjectileHitMode,
  getGongfaRuntimeTickThreatRadius,
  planGongfaAttack,
  projectGongfaRuntimeCheckpoint,
  projectGongfaRuntimeView,
  selectCrimsonFurnaceTargetIndexes,
  splitGongfaImprovementReplayIds,
  type GongfaRuntimeCommand,
  type GongfaRuntime,
  type PassiveImprovementEffect,
  type PlayerImprovementEffect
} from "../logic/gongfaRuntime";
import {
  clearActiveRun,
  createActiveRunCheckpoint,
  createActiveRunSave,
  loadActiveRun,
  saveActiveRun,
  type HealingPillCheckpoint,
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
  furnaceCascadeCooldownRemaining: number;
  hiddenLinggen: LinggenConfig;
  revealedLinggen?: LinggenConfig;
  lingcaoCollected: boolean;
  mainGongfaId?: GongfaId;
  lingcaoMarker: string;
  lingcaoX: number;
  lingcaoY: number;
  healingPills: HealingPillCheckpoint[];
  spiritTreasureIds: SpiritTreasureId[];
  finalBossActive: boolean;
  finalBossPhaseIndex: number;
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

// A bounded but generous arena (2000x1280, centred on the origin). Large enough
// for the Yuanying boss's drifting safe zone, small enough that the grid floor
// and glowing border give the play space a readable edge instead of void.
const ARENA_HALF_WIDTH = 1000;
const ARENA_HALF_HEIGHT = 640;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private orbs!: Phaser.Physics.Arcade.Group;
  private lingcaoGroup!: Phaser.Physics.Arcade.Group;
  private healingPills!: Phaser.Physics.Arcade.Group;
  private spiritTreasures!: Phaser.Physics.Arcade.Group;
  private pendingSpiritTreasure?: SpiritTreasure;
  private appliedSpiritTreasureEffects = {
    maxHealth: 0,
    moveSpeed: 0,
    magnetRadius: 0,
    mitigation: 0
  };
  private spawner!: SpawnerSystem;
  private gongfaRuntime?: GongfaRuntime;
  private combatState: CombatState = { ...baselineState };
  private combatCooldownRemaining = 0;
  private msSinceDamage = 0;
  private readonly sfx = new SoundFx();
  private readonly evade = new Evade();
  private choiceActive = false;
  private currentChoiceTitle?: string;
  private currentChoiceOptions: ChoiceOption[] = [];
  private pendingJourneyDecision?: RunJourneyDecision;
  private lastMessage?: string;
  private lastAimAngle = 0;
  private finalBossWaveAccumulator = 0;
  private finalBossHazardAccumulator = 0;
  private finalBossSafeZoneX = 0;
  private finalBossSafeZoneY = 0;
  private finalBossSafeZoneRadius = 220;
  private finalBossPhaseSpawned = false;
  private activeRunSave: ActiveRunSave | null = null;
  private nextCombatTargetId = 1;
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
    furnaceCascadeCooldownRemaining: 0,
    hiddenLinggen: rollLinggen(),
    lingcaoCollected: false,
    lingcaoMarker: "",
    lingcaoX: 260,
    lingcaoY: -140,
    healingPills: [],
    spiritTreasureIds: [],
    finalBossActive: false,
    finalBossPhaseIndex: 0
  };

  constructor() {
    super("game");
  }

  create(): void {
    this.activeRunSave = loadActiveRun(window.localStorage);
    this.restoreSavedRunState();
    const arenaWidth = ARENA_HALF_WIDTH * 2;
    const arenaHeight = ARENA_HALF_HEIGHT * 2;
    this.physics.world.setBounds(-ARENA_HALF_WIDTH, -ARENA_HALF_HEIGHT, arenaWidth, arenaHeight);
    // Void beyond the arena, the arena floor, a tiling grid for spatial reference,
    // then a glowing border so the play space reads as bounded ground.
    this.add.rectangle(0, 0, 6000, 6000, 0x05090f, 1).setOrigin(0.5).setDepth(-30);
    this.add.rectangle(0, 0, arenaWidth, arenaHeight, 0x0b1322, 1).setOrigin(0.5).setDepth(-22);
    this.add.tileSprite(0, 0, arenaWidth, arenaHeight, "grid-cell").setOrigin(0.5).setDepth(-21);
    this.add
      .rectangle(0, 0, arenaWidth, arenaHeight)
      .setOrigin(0.5)
      .setStrokeStyle(4, 0x2f5878, 0.85)
      .setDepth(-20);

    this.player = new Player(this, 0, 0);
    this.player.setCollideWorldBounds(true);
    const checkpoint = this.activeRunSave?.checkpoint;
    this.player.stats.health = checkpoint?.playerHealth ?? this.player.stats.health;
    this.player.stats.maxHealth = checkpoint?.playerMaxHealth ?? this.player.stats.maxHealth;
    this.player.stats.moveSpeed = checkpoint?.playerMoveSpeed ?? this.player.stats.moveSpeed;
    this.player.stats.magnetRadius = checkpoint?.playerMagnetRadius ?? this.player.stats.magnetRadius;
    this.player.stats.damageReduction =
      checkpoint?.playerDamageReduction ?? this.player.stats.damageReduction;
    splitGongfaImprovementReplayIds([
      ...this.runState.upgradeSelectionIds,
      ...this.runState.masteryLearnedIds
    ]).runtimeUpgradeIds.forEach((upgradeId) => this.replayCombatImprovement(upgradeId));
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(-ARENA_HALF_WIDTH, -ARENA_HALF_HEIGHT, ARENA_HALF_WIDTH * 2, ARENA_HALF_HEIGHT * 2);

    this.enemies = this.physics.add.group({ runChildUpdate: false });
    this.projectiles = this.physics.add.group({ runChildUpdate: false });
    this.orbs = this.physics.add.group({ runChildUpdate: false });
    this.lingcaoGroup = this.physics.add.group({ runChildUpdate: false });
    this.healingPills = this.physics.add.group({ runChildUpdate: false });
    this.spiritTreasures = this.physics.add.group({ runChildUpdate: false });
    this.inputController = new InputController(this);
    this.spawner = new SpawnerSystem(this, this.enemies, (enemy) =>
      this.assignCombatTargetId(enemy)
    );

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
    this.physics.add.overlap(
      this.player,
      this.spiritTreasures,
      (_playerObj, treasureObj) => {
        this.collectSpiritTreasure(treasureObj as SpiritTreasure);
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
    this.evade.advance(delta);

    // Gentle out-of-combat regen: staying unhit for a few seconds recovers
    // chip damage, so good dodging is rewarded and a fresh build can stabilise.
    this.msSinceDamage += delta;
    if (this.msSinceDamage > 3000 && this.player.stats.health < this.player.stats.maxHealth) {
      this.player.heal(delta * 0.004);
    }

    const movement = this.inputController.getMovementVector();
    if (this.inputController.evadePressed) {
      if (this.evade.tryStart({ x: movement.x, y: movement.y })) {
        this.sfx.evade();
        this.maybeCutGaleStepCorridor();
        this.maybeCutIronWake();
        this.applyEvadeRuntimeEffects();
      }
    }
    const evadeState = this.evade.state;
    this.player.move(
      evadeState.active
        ? new Phaser.Math.Vector2(evadeState.direction.x, evadeState.direction.y)
        : movement,
      evadeState.active ? evadeState.speed : this.player.stats.moveSpeed
    );
    if (movement.lengthSq() > 0) {
      this.lastAimAngle = Phaser.Math.Angle.Between(0, 0, movement.x, movement.y);
    }
    this.updateGongfaRuntimeTick(movement, delta);

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
    const hitMode = getGongfaProjectileHitMode(projectile.sourceGongfaId);
    const diedFromHit = hitMode.appliesBaseDamage ? enemy.receiveDamage(projectile.damage) : false;
    if (hitMode.appliesBaseDamage) {
      this.spawnDamageNumber(enemy.x, enemy.y, projectile.damage);
      this.sfx.hit();
    }
    let diedFromCommands = false;

    if (this.gongfaRuntime) {
      const result = advanceGongfaRuntimeForProjectileHit(this.gongfaRuntime, {
        sourceGongfaId: projectile.sourceGongfaId,
        targetId: enemy.combatTargetId,
        damage: projectile.damage,
        learnedMasteryIds: this.runState.masteryLearnedIds,
        baseDamageKilledTarget: diedFromHit,
        embedStacks: enemy.embedStacks,
        embedPower: enemy.embedPower
      });
      this.gongfaRuntime = result.runtime;
      this.combatState = result.runtime.combat;
      diedFromCommands = this.executeProjectileHitCommands(projectile, enemy, result.commands);
    }

    const died = diedFromHit || diedFromCommands;

    if (hitMode.consumesPierce) {
      projectile.pierceRemaining -= 1;
    }

    if (hitMode.consumesPierce && projectile.pierceRemaining <= 0) {
      projectile.destroy();
    }

    if (!died) {
      return;
    }

    this.resolveEnemyDeath(enemy);
  }

  private resolveEnemyDeath(enemy: Enemy): void {
    if (!enemy.active) {
      return;
    }

    this.spawnDeathPop(enemy.x, enemy.y, enemy.config.tint);
    this.spawnOrb(enemy.x, enemy.y, enemy.config.xpDrop);
    const dropX = enemy.x;
    const dropY = enemy.y;
    enemy.destroy();
    this.runState.kills += 1;

    const droppedTreasure = spiritTreasureDropForKill(this.runState.kills);
    if (droppedTreasure) {
      this.spawnSpiritTreasure(droppedTreasure, dropX, dropY);
    }
  }

  private executeProjectileHitCommands(
    projectile: Projectile,
    enemy: Enemy,
    commands: GongfaRuntimeCommand[]
  ): boolean {
    let targetDied = false;
    commands.forEach((command) => {
      if (command.kind === "apply-target-damage") {
        const target = this.getEnemyByCombatTargetId(command.targetId);
        if (target?.active && target.receiveDamage(command.amount)) {
          targetDied ||= target === enemy;
        }
        return;
      }

      if (command.kind === "spawn-yujian-bloom") {
        const origin = this.getEnemyByCombatTargetId(command.originTargetId) ?? enemy;
        this.spawnYujianBloomProjectiles(origin, command);
        return;
      }

      if (command.kind === "lodge-crimson-needle") {
        const target = this.getEnemyByCombatTargetId(command.targetId);
        if (!target?.active || !projectile.active) {
          return;
        }

        target.embedStacks = command.embedStacks;
        target.embedPower = command.embedPower;
        projectile.lodgedEnemy = target;
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.reset(target.x, target.y);
        body.setVelocity(0, 0);
        body.enable = false;
        return;
      }

      if (command.kind === "detonate-crimson-embed") {
        const target = this.getEnemyByCombatTargetId(command.targetId);
        if (!target?.active) {
          return;
        }

        this.detonateCrimsonEnemy(target, command.sourceDamage, command.fragment);
        this.destroyLodgedCrimsonNeedles(target);
      }
    });

    return targetDied || enemy.health <= 0;
  }

  private spawnYujianBloomProjectiles(
    origin: Enemy,
    command: Extract<GongfaRuntimeCommand, { kind: "spawn-yujian-bloom" }>
  ): void {
    const bloomTargets = this.getNearestEnemies(6)
      .filter((enemy) => enemy.active && enemy.combatTargetId !== command.originTargetId)
      .slice(0, command.maxTargets);

    bloomTargets.forEach((target, index) => {
      this.spawnProjectileAtTarget(
        origin.x,
        origin.y - 4 + index * 8,
        target,
        command.damage,
        command.pierce,
        this.combatState.projectileSpeed,
        this.combatState.projectileLifetimeMs,
        this.combatState.projectileTexture,
        this.combatState.tint,
        { sourceGongfaId: "yujian-jue" }
      );
    });
  }

  private spawnYujianReversalProjectiles(
    command: Extract<GongfaRuntimeCommand, { kind: "spawn-yujian-reversal" }>
  ): void {
    const targets = this.getNearestEnemies(Math.max(1, this.combatState.count));
    targets.forEach((enemy, index) => {
      this.time.delayedCall(command.delayMs + index * 35, () => {
        if (!enemy.active || !this.player.active) {
          return;
        }

        const returnAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        this.spawnProjectileAlongAngle(
          enemy.x - Math.cos(returnAngle) * 30,
          enemy.y - Math.sin(returnAngle) * 30,
          returnAngle,
          command.damage,
          command.pierce,
          command.speed,
          command.lifetimeMs,
          this.combatState.projectileTexture,
          this.combatState.tint,
          { sourceGongfaId: "yujian-jue" }
        );

        if (this.gongfaRuntime?.yujian) {
          const result = advanceGongfaRuntime(this.gongfaRuntime, {
            kind: "yujian-reversal-spawned"
          });
          this.gongfaRuntime = result.runtime;
          this.combatState = result.runtime.combat;
        }
      });
    });
  }

  private collectOrb(orb: QiOrb): void {
    this.spawnPickupPop(orb.x, orb.y);
    this.sfx.pickup();
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
    this.maybeReboundEdge(enemy);

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

  private spawnDamageNumber(x: number, y: number, amount: number): void {
    const label = this.add
      .text(x + randomInt(-6, 6), y - 8, String(Math.max(1, Math.round(amount))), {
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: "15px",
        color: "#ffe6a0",
        stroke: "#2a1c08",
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setDepth(30);
    this.tweens.add({
      targets: label,
      y: y - 34,
      alpha: 0,
      duration: 520,
      ease: "Cubic.out",
      onComplete: () => label.destroy()
    });
  }

  private spawnDeathPop(x: number, y: number, tint: number): void {
    const ring = this.add.circle(x, y, 9, tint, 0.5).setDepth(6);
    this.tweens.add({
      targets: ring,
      scale: 2.6,
      alpha: 0,
      duration: 240,
      ease: "Quad.out",
      onComplete: () => ring.destroy()
    });
  }

  private spawnPickupPop(x: number, y: number): void {
    const pop = this.add.circle(x, y, 5, 0x9be7ff, 0.85).setDepth(7);
    this.tweens.add({
      targets: pop,
      scale: 2.2,
      alpha: 0,
      duration: 200,
      ease: "Quad.out",
      onComplete: () => pop.destroy()
    });
  }

  private spawnCastPulse(): void {
    if (!this.player?.active) {
      return;
    }
    const pulse = this.add
      .circle(this.player.x, this.player.y, 14, undefined, 0)
      .setStrokeStyle(2, this.combatState.tint, 0.45)
      .setDepth(9);
    this.tweens.add({
      targets: pulse,
      scale: 1.8,
      alpha: 0,
      duration: 170,
      ease: "Quad.out",
      onComplete: () => pulse.destroy()
    });
  }

  private playFanfare(color: number): void {
    this.cameras.main.flash(220, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff, false);
    if (this.player?.active) {
      const ring = this.add
        .circle(this.player.x, this.player.y, 16, undefined, 0)
        .setStrokeStyle(3, color, 0.9)
        .setDepth(20);
      this.tweens.add({
        targets: ring,
        scale: 5,
        alpha: 0,
        duration: 440,
        ease: "Cubic.out",
        onComplete: () => ring.destroy()
      });
    }
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

  private spawnSpiritTreasure(treasureId: SpiritTreasureId, x: number, y: number): void {
    this.spiritTreasures.add(new SpiritTreasure(this, x, y, treasureId));
  }

  private collectSpiritTreasure(treasure: SpiritTreasure): void {
    if (!treasure.active || this.choiceActive) {
      return;
    }

    const result = offerSpiritTreasure(this.runState.spiritTreasureIds, treasure.treasureId);
    if (result.kind === "stored") {
      this.runState.spiritTreasureIds = result.activeIds;
      this.applySpiritTreasureEffects();
      this.lastMessage = `${getSpiritTreasureConfig(treasure.treasureId).name} attunes to you.`;
      treasure.destroy();
      this.persistRunCheckpoint();
      this.publishHud(this.lastMessage);
      return;
    }

    // All three slots are full: pause for a replace-or-leave choice.
    this.offerSpiritTreasureChoice(treasure);
  }

  private offerSpiritTreasureChoice(treasure: SpiritTreasure): void {
    this.pendingSpiritTreasure = treasure;
    this.choiceActive = true;
    this.currentChoiceTitle = `${getSpiritTreasureConfig(treasure.treasureId).name} found`;
    this.currentChoiceOptions = [
      ...this.runState.spiritTreasureIds.map<ChoiceOption>((heldId) => ({
        id: heldId,
        kind: "spirit-treasure-replace",
        title: `Replace ${getSpiritTreasureConfig(heldId).name}`,
        description: getSpiritTreasureConfig(heldId).lore
      })),
      {
        id: "leave",
        kind: "spirit-treasure-leave",
        title: "Leave it behind",
        description: "Keep your current three Spirit Treasures."
      }
    ];
    this.setPausedState(true);
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: "All three Spirit Treasure slots are full.",
      options: this.currentChoiceOptions
    });
    this.publishHud(this.lastMessage);
  }

  private resolveSpiritTreasureReplace(replacedId: SpiritTreasureId): void {
    const treasure = this.pendingSpiritTreasure;
    if (!treasure) {
      return;
    }
    this.runState.spiritTreasureIds = replaceSpiritTreasure(
      this.runState.spiritTreasureIds,
      replacedId,
      treasure.treasureId
    );
    this.applySpiritTreasureEffects();
    this.lastMessage = `${getSpiritTreasureConfig(treasure.treasureId).name} supplants ${getSpiritTreasureConfig(replacedId).name}.`;
    treasure.destroy();
    this.pendingSpiritTreasure = undefined;
    this.persistRunCheckpoint();
  }

  private resolveSpiritTreasureLeave(): void {
    this.pendingSpiritTreasure?.destroy();
    this.pendingSpiritTreasure = undefined;
    this.lastMessage = "You leave the Spirit Treasure behind.";
  }

  private applySpiritTreasureEffects(): void {
    if (!this.player) {
      return;
    }
    const totals = aggregateSpiritTreasureEffects(this.runState.spiritTreasureIds);
    const applied = this.appliedSpiritTreasureEffects;

    const maxHealthDelta = totals.maxHealth - applied.maxHealth;
    this.player.stats.maxHealth += maxHealthDelta;
    if (maxHealthDelta > 0) {
      this.player.heal(maxHealthDelta);
    } else if (maxHealthDelta < 0) {
      // Replacing a vitality treasure with a smaller one must not leave current
      // health above the new maximum.
      this.player.stats.health = Math.min(this.player.stats.health, this.player.stats.maxHealth);
    }
    this.player.stats.moveSpeed += totals.moveSpeed - applied.moveSpeed;
    this.player.stats.magnetRadius += totals.magnetRadius - applied.magnetRadius;
    this.player.stats.damageReduction += totals.mitigation - applied.mitigation;

    this.appliedSpiritTreasureEffects = { ...totals };
  }

  private spiritTreasureHudText(): string {
    return this.runState.spiritTreasureIds
      .map((id) => getSpiritTreasureConfig(id).name)
      .join(", ");
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
        // The zone drifts on its own each second (placed at the player at phase
        // start) rather than tracking the player, so standing still falls
        // outside it and the player must chase the shrinking safe ground.
        const drift = this.runState.finalBossPhaseIndex % 2 === 0 ? 44 : -44;
        // Keep the zone fully inside the arena so the clamped player can reach it.
        this.finalBossSafeZoneX = Phaser.Math.Clamp(
          this.finalBossSafeZoneX + drift,
          -ARENA_HALF_WIDTH + this.finalBossSafeZoneRadius,
          ARENA_HALF_WIDTH - this.finalBossSafeZoneRadius
        );
        this.finalBossSafeZoneY = Phaser.Math.Clamp(
          this.finalBossSafeZoneY - drift * 0.6,
          -ARENA_HALF_HEIGHT + this.finalBossSafeZoneRadius,
          ARENA_HALF_HEIGHT - this.finalBossSafeZoneRadius
        );
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
    if (this.gongfaRuntime) {
      this.spawnCastPulse();
      this.executeGongfaRuntimeCommands(
        planGongfaAttack(this.gongfaRuntime, this.runState.elapsedMs, {
          learnedMasteryIds: this.runState.masteryLearnedIds
        })
      );
    }
  }

  private fireHomingVolley(
    command: Extract<GongfaRuntimeCommand, { kind: "homing-volley" }>
  ): void {
    const targets = this.getNearestEnemies(command.count);
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
        this.combatState.tint,
        {
          sourceGongfaId: this.gongfaRuntime?.gongfaId
        }
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
            this.combatState.tint,
            {
              sourceGongfaId: this.gongfaRuntime?.gongfaId
            }
          );
        });
      });
    }
  }

  private fireCrimsonFurnaceVolley(
    command: Extract<GongfaRuntimeCommand, { kind: "crimson-furnace-volley" }>
  ): void {
    const targets = this.getCrimsonFurnaceTargets(command.count);
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
      this.triggerCrimsonDetonation(projectile.x, projectile.y, projectile.damage, false);
      projectile.destroy();
    });
  }

  private fireWaveVolley(
    command: Extract<GongfaRuntimeCommand, { kind: "wave-volley" }>
  ): void {
    const angle = this.getWaveAimAngle(command.aimMode);
    const count = command.count;
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
        1.05,
        command.growthScale ?? 1
      );
    }

    for (let trail = 0; trail < command.returnShots; trail += 1) {
      this.time.delayedCall(110 + trail * 90, () => {
        if (!this.player.active) {
          return;
        }

        const delayedAngle = this.getWaveAimAngle(command.aimMode);
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
    scale: number,
    growthScale = 1
  ): void {
    const projectile = new Projectile(this, x, y, this.combatState.projectileTexture);
    projectile.sourceGongfaId = this.gongfaRuntime?.gongfaId;
    projectile.damage = damage;
    projectile.pierceRemaining = pierce;
    projectile.setTint(this.combatState.tint);
    projectile.setAngle(Phaser.Math.RadToDeg(angle));
    const baseScaleX = scale;
    const baseScaleY = Math.max(0.72, scale - 0.15);
    projectile.setScale(baseScaleX, baseScaleY);
    this.projectiles.add(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    // Endless Horizon: grow the Cutting Front as it travels.
    if (growthScale > 1) {
      this.tweens.add({
        targets: projectile,
        scaleX: baseScaleX * growthScale,
        scaleY: baseScaleY * growthScale,
        duration: lifetimeMs,
        ease: "Linear"
      });
    }
    this.time.delayedCall(lifetimeMs, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });
  }

  private maybeCutGaleStepCorridor(): void {
    if (!this.gongfaRuntime) {
      return;
    }

    const corridor = galeStepSeveranceCorridor(
      this.gongfaRuntime,
      this.runState.masteryLearnedIds
    );
    if (!corridor) {
      return;
    }

    const direction = this.evade.state.direction;
    const angle = Math.atan2(direction.y, direction.x);
    for (let i = 0; i < corridor.count; i += 1) {
      this.time.delayedCall(i * 40, () => {
        if (!this.player.active) {
          return;
        }
        this.spawnWaveProjectile(
          this.player.x,
          this.player.y,
          angle,
          Math.max(1, Math.floor(this.combatState.damage * 0.7)),
          corridor.pierce,
          this.combatState.projectileSpeed + 60,
          this.combatState.projectileLifetimeMs + 220,
          0.95
        );
      });
    }
  }

  private maybeCutIronWake(): void {
    if (!this.gongfaRuntime) {
      return;
    }

    const wall = ironWakeWall(this.gongfaRuntime, this.runState.masteryLearnedIds);
    if (!wall) {
      return;
    }

    const direction = this.evade.state.direction;
    const angle = Math.atan2(direction.y, direction.x) + Math.PI / 2;
    for (let i = 0; i < wall.count; i += 1) {
      this.time.delayedCall(i * 45, () => {
        if (!this.player.active) {
          return;
        }
        this.spawnWaveProjectile(
          this.player.x,
          this.player.y,
          angle,
          Math.max(1, Math.floor(this.combatState.damage * 0.6)),
          wall.pierce,
          this.combatState.projectileSpeed,
          this.combatState.projectileLifetimeMs + 260,
          0.9
        );
      });
    }
  }

  private applyEvadeRuntimeEffects(): void {
    if (!this.gongfaRuntime) {
      return;
    }

    const result = advanceGongfaRuntime(this.gongfaRuntime, {
      kind: "evade",
      learnedMasteryIds: this.runState.masteryLearnedIds
    });
    this.gongfaRuntime = result.runtime;
    this.combatState = result.runtime.combat;
    this.executeGongfaRuntimeCommands(result.commands);
  }

  private maybeReboundEdge(enemy: Enemy): void {
    if (!this.gongfaRuntime || !enemy.active) {
      return;
    }

    const blade = reboundingEdgeBlade(this.gongfaRuntime, this.runState.masteryLearnedIds);
    if (!blade) {
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
    this.spawnWaveProjectile(
      this.player.x,
      this.player.y,
      angle,
      blade.damage,
      blade.pierce,
      this.combatState.projectileSpeed + 80,
      this.combatState.projectileLifetimeMs + 200,
      1.0
    );
  }

  private pullEnemiesToward(radius: number, strength: number): void {
    for (const enemy of this.getEnemiesWithinRadius(radius)) {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, strength);
      }
    }
  }

  private collapseSunspot(radius: number, damage: number): void {
    const target = this.getEnemiesWithinRadius(radius)
      .filter((enemy) => enemy.active)
      .reduce<Enemy | undefined>(
        (sturdiest, enemy) =>
          !sturdiest || enemy.health > sturdiest.health ? enemy : sturdiest,
        undefined
      );
    if (!target) {
      return;
    }

    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    for (let i = 0; i < 4; i += 1) {
      const angle = baseAngle + (i - 1.5) * 0.18;
      this.spawnWaveProjectile(
        this.player.x,
        this.player.y,
        angle,
        Math.max(1, Math.floor(damage / 4)),
        this.combatState.pierce + 1,
        this.combatState.projectileSpeed + 90,
        this.combatState.projectileLifetimeMs + 200,
        1.0
      );
    }
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
      projectile.sourceGongfaId = this.gongfaRuntime?.gongfaId;
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
    tint: number,
    options: {
      sourceGongfaId?: GongfaId;
    } = {}
  ): void {
    const projectile = new Projectile(this, x, y, texture);
    projectile.damage = damage;
    projectile.pierceRemaining = pierce;
    projectile.sourceGongfaId = options.sourceGongfaId;
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

  private spawnProjectileAlongAngle(
    x: number,
    y: number,
    angle: number,
    damage: number,
    pierce: number,
    speed: number,
    lifetimeMs: number,
    texture: string,
    tint: number,
    options: {
      sourceGongfaId?: GongfaId;
    } = {}
  ): void {
    const projectile = new Projectile(this, x, y, texture);
    projectile.damage = damage;
    projectile.pierceRemaining = pierce;
    projectile.sourceGongfaId = options.sourceGongfaId;
    projectile.setTint(tint);
    projectile.setAngle(Phaser.Math.RadToDeg(angle));
    this.projectiles.add(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
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

  private getWaveAimAngle(aimMode: "nearest" | "last" = "last"): number {
    if (aimMode === "last") {
      return this.lastAimAngle;
    }

    return this.getAimAngle();
  }

  private updateGongfaRuntimeTick(movement: Phaser.Math.Vector2, delta: number): void {
    if (!this.gongfaRuntime) {
      return;
    }

    const threatRadius = getGongfaRuntimeTickThreatRadius(this.gongfaRuntime);
    const result = advanceGongfaRuntime(this.gongfaRuntime, {
      kind: "tick",
      deltaMs: delta,
      nearbyEnemyCount: threatRadius > 0 ? this.getEnemiesWithinRadius(threatRadius).length : 0,
      isMoving: movement.lengthSq() > 0,
      skill2Id: this.runState.masterySkill2Id,
      learnedMasteryIds: this.runState.masteryLearnedIds
    });
    this.gongfaRuntime = result.runtime;
    this.combatState = result.runtime.combat;
    this.executeGongfaRuntimeCommands(result.commands);
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
  }

  private getMasterySkill2CooldownMs(): number {
    return getAuthoredSkill2Plan(this.runState.masterySkill2Id)?.cooldownMs ?? 0;
  }

  private fireMasterySkill2(): void {
    const plan = getAuthoredSkill2Plan(this.runState.masterySkill2Id);
    if (!plan) {
      return;
    }

    if (!this.gongfaRuntime) {
      return;
    }

    const result = advanceGongfaRuntime(this.gongfaRuntime, {
      kind: "skill2",
      skill2Id: plan.intent
    });
    this.gongfaRuntime = result.runtime;
    this.combatState = result.runtime.combat;
    this.executeGongfaRuntimeCommands(result.commands);
  }

  private executeGongfaRuntimeCommands(commands: GongfaRuntimeCommand[]): void {
    commands.forEach((command) => {
      this.recordMasterySkill2Cast(command);

      if (command.kind === "homing-volley") {
        this.fireHomingVolley(command);
        return;
      }

      if (command.kind === "mastery-skill2-cast") {
        return;
      }

      if (command.kind === "wave-volley") {
        this.fireWaveVolley(command);
        return;
      }

      if (command.kind === "aura-burst") {
        this.emitAuraBurst(command.damage, command.count);
        return;
      }

      if (command.kind === "gravity-pull") {
        this.pullEnemiesToward(command.radius, command.strength);
        return;
      }

      if (command.kind === "sunspot-collapse") {
        this.collapseSunspot(command.radius, command.damage);
        return;
      }

      if (command.kind === "burning-ring-volley") {
        this.fireBurningRingVolley(command);
        return;
      }

      if (command.kind === "crimson-furnace-volley") {
        this.fireCrimsonFurnaceVolley(command);
        return;
      }

      if (command.kind === "crimson-detonation") {
        this.applyCrimsonDetonation(command);
        return;
      }

      if (command.kind === "furnace-cascade") {
        this.fireFurnaceCascade(command);
        return;
      }

      if (command.kind === "incoming-damage") {
        this.player.applyDamage(command.finalDamage);
        return;
      }

      if (command.kind === "spawn-yujian-reversal") {
        this.spawnYujianReversalProjectiles(command);
        return;
      }

      if (command.kind === "returning-sword-formation") {
        this.fireReturningSwordFormation(command);
        return;
      }

      if (command.kind === "golden-gale-corridor") {
        this.fireGoldenGaleCorridor(command);
        return;
      }

      if (command.kind === "apply-target-damage") {
        const target = this.getEnemyByCombatTargetId(command.targetId);
        if (target?.active && target.receiveDamage(command.amount)) {
          this.resolveEnemyDeath(target);
        }
        return;
      }

      if (command.kind === "spawn-yujian-bloom") {
        const origin = this.getEnemyByCombatTargetId(command.originTargetId);
        if (origin?.active) {
          this.spawnYujianBloomProjectiles(origin, command);
        }
        return;
      }

      if (command.kind === "blade-shell-rebound") {
        this.fireBladeShellRebound(command);
        return;
      }

      if (command.kind === "solar-flare-cycle") {
        this.fireSolarFlareCycle(command);
      }
    });
  }

  private recordMasterySkill2Cast(command: GongfaRuntimeCommand): void {
    if (!("masteryCast" in command)) {
      return;
    }

    this.runState.masterySkill2Casts += 1;
    if (command.masteryCast.cooldownMs !== undefined) {
      this.runState.masterySkill2CooldownRemaining = command.masteryCast.cooldownMs;
    }
  }

  private fireSolarFlareCycle(
    command: Extract<GongfaRuntimeCommand, { kind: "solar-flare-cycle" }>
  ): void {
    const baseAngle = this.getAimAngle();

    for (let ring = 0; ring < 2; ring += 1) {
      const direction = ring === 0 ? 1 : -1;
      const ringRadius = command.ringRadius + ring * 10;
      for (let i = 0; i < command.segmentCount; i += 1) {
        const angle =
          baseAngle + ((Math.PI * 2) / command.segmentCount) * i * direction;
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

  private fireFurnaceCascade(
    command: Extract<GongfaRuntimeCommand, { kind: "furnace-cascade" }>
  ): void {
    const primedEnemies = (this.enemies.getChildren() as Enemy[]).filter(
      (enemy) => enemy.active && enemy.embedStacks > 0
    );

    primedEnemies.forEach((enemy) => {
      this.detonateCrimsonEnemy(
        enemy,
        enemy.embedPower * command.sourceDamage.embedPowerMultiplier +
          enemy.embedStacks * command.sourceDamage.stackDamage,
        command.fragment
      );
      this.destroyLodgedCrimsonNeedles(enemy);
    });
  }

  private fireGoldenGaleCorridor(
    command: Extract<GongfaRuntimeCommand, { kind: "golden-gale-corridor" }>
  ): void {
    const angle = this.getWaveAimAngle();
    const laneCount = command.laneCount;
    const spreadRad = Phaser.Math.DegToRad(command.spreadDeg);

    for (let burst = 0; burst < command.burstCount; burst += 1) {
      this.time.delayedCall(burst * command.burstDelayMs, () => {
        if (!this.player.active) {
          return;
        }

        const forwardOffset = command.forwardOffset.start + burst * command.forwardOffset.step;
        for (let i = 0; i < laneCount; i += 1) {
          const offset = laneCount === 1 ? 0 : Phaser.Math.Linear(-spreadRad / 2, spreadRad / 2, i / (laneCount - 1));
          const sideways = (i - (laneCount - 1) / 2) * command.sidewaysSpacing;
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
            command.projectile.damage,
            command.projectile.pierce,
            command.projectile.speed,
            command.projectile.lifetimeMs,
            command.projectile.scale
          );
        }
      });
    }
  }

  private fireReturningSwordFormation(
    command: Extract<GongfaRuntimeCommand, { kind: "returning-sword-formation" }>
  ): void {
    const targets = this.getNearestEnemies(command.count);
    if (targets.length === 0) {
      return;
    }

    targets.forEach((enemy, index) => {
      this.spawnProjectileAtTarget(
        this.player.x,
        this.player.y - 12 + index * 6,
        enemy,
        command.opening.damage,
        command.opening.pierce,
        command.opening.speed,
        command.opening.lifetimeMs,
        this.combatState.projectileTexture,
        this.combatState.tint
      );
    });

    this.time.delayedCall(command.returnPath.delayMs, () => {
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
          command.returnPath.damage,
          command.returnPath.pierce,
          command.returnPath.speed,
          command.returnPath.lifetimeMs,
          this.combatState.projectileTexture,
          this.combatState.tint
        );
      });
    });
  }

  private fireBladeShellRebound(
    command: Extract<GongfaRuntimeCommand, { kind: "blade-shell-rebound" }>
  ): void {
    void command;
    this.emitAuraBurst(Math.floor(this.combatState.damage * 0.82), this.combatState.count + 2);
  }

  private fireBurningRingVolley(
    command: Extract<GongfaRuntimeCommand, { kind: "burning-ring-volley" }>
  ): void {
    const baseAngle = this.getAimAngle();

    for (let ring = 0; ring < 2; ring += 1) {
      const direction = ring === 0 ? 1 : -1;
      const radius = command.ringRadius + ring * 12;
      const start = Math.floor((command.segmentCount - command.visibleSegments) / 2);

      for (let i = 0; i < command.visibleSegments; i += 1) {
        const segmentIndex = start + i;
        const angle =
          baseAngle +
          command.rotation * direction +
          ((Math.PI * 2) / command.segmentCount) * segmentIndex;
        const projectile = new Projectile(
          this,
          this.player.x + Math.cos(angle) * radius,
          this.player.y + Math.sin(angle) * radius,
          this.combatState.projectileTexture
        );
        projectile.damage = Math.max(
          1,
          Math.floor(this.combatState.damage * (ring === 0 ? 1 : 0.9) * (command.damageScale ?? 1))
        );
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

        // Scattered Ember Orbit: leave a short-lived burning patch in the wake.
        if (command.scatterEmbers && ring === 0) {
          this.spawnEmberPatch(
            this.player.x + Math.cos(angle) * radius,
            this.player.y + Math.sin(angle) * radius
          );
        }
      }
    }
  }

  private spawnEmberPatch(x: number, y: number): void {
    const ember = new Projectile(this, x, y, this.combatState.projectileTexture);
    ember.sourceGongfaId = this.gongfaRuntime?.gongfaId;
    ember.damage = Math.max(1, Math.floor(this.combatState.damage * 0.4));
    ember.pierceRemaining = 999;
    ember.setTint(this.combatState.tint);
    ember.setScale(0.7);
    this.projectiles.add(ember);
    const body = ember.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.time.delayedCall(700, () => {
      if (ember.active) {
        ember.destroy();
      }
    });
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

  private assignCombatTargetId(enemy: Enemy): void {
    enemy.combatTargetId = this.nextCombatTargetId;
    this.nextCombatTargetId += 1;
    this.spawnTelegraphRing(enemy.x, enemy.y, enemy.config.tint);
  }

  private spawnTelegraphRing(x: number, y: number, tint: number): void {
    const ring = this.add.circle(x, y, 22, undefined, 0).setStrokeStyle(2, tint, 0.8).setDepth(4);
    this.tweens.add({
      targets: ring,
      scale: 0.4,
      alpha: 0,
      duration: 240,
      ease: "Quad.in",
      onComplete: () => ring.destroy()
    });
  }

  private getEnemyByCombatTargetId(targetId: number): Enemy | undefined {
    return (this.enemies.getChildren() as Enemy[]).find(
      (enemy) => enemy.active && enemy.combatTargetId === targetId
    );
  }

  private getCrimsonFurnaceTargets(count: number): Enemy[] {
    const enemies = this.enemies.getChildren() as Enemy[];
    const targetIndexes = selectCrimsonFurnaceTargetIndexes(
      enemies.map((enemy, index) => ({
        index,
        active: enemy.active,
        embedStacks: enemy.embedStacks,
        distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y)
      })),
      count
    );

    return targetIndexes.map((index) => enemies[index]).filter((enemy) => enemy?.active);
  }

  private triggerCrimsonDetonation(
    x: number,
    y: number,
    damage: number,
    fromEmbed: boolean
  ): void {
    if (!this.gongfaRuntime) {
      return;
    }

    const result = advanceGongfaRuntime(this.gongfaRuntime, {
      kind: "crimson-detonation",
      x,
      y,
      damage,
      fromEmbed
    });
    this.gongfaRuntime = result.runtime;
    this.combatState = result.runtime.combat;
    this.executeGongfaRuntimeCommands(result.commands);
  }

  private applyCrimsonDetonation(
    command: Extract<GongfaRuntimeCommand, { kind: "crimson-detonation" }>
  ): void {
    const hits = this.getEnemiesWithinRadiusFrom(command.x, command.y, command.radius);
    hits.forEach((enemy) => {
      const died = enemy.receiveDamage(command.splashDamage);
      if (died) {
        this.spawnOrb(enemy.x, enemy.y, enemy.config.xpDrop);
        enemy.destroy();
        this.runState.kills += 1;
      }
    });

  }

  private detonateCrimsonEnemy(
    enemy: Enemy,
    sourceDamage: number,
    fragment: Extract<GongfaRuntimeCommand, { kind: "detonate-crimson-embed" }>["fragment"]
  ): void {
    const embedStacks = enemy.embedStacks;
    const embedPower = enemy.embedPower;
    enemy.embedStacks = 0;
    enemy.embedPower = 0;
    this.triggerCrimsonDetonation(
      enemy.x,
      enemy.y,
      Math.max(sourceDamage, embedPower + embedStacks * 2),
      true
    );
    this.spawnCrimsonFragments(enemy.x, enemy.y, fragment);
  }

  private destroyLodgedCrimsonNeedles(enemy: Enemy): void {
    (this.projectiles.getChildren() as Projectile[]).forEach((projectile) => {
      if (projectile.active && projectile.lodgedEnemy === enemy) {
        projectile.destroy();
      }
    });
  }

  private spawnCrimsonFragments(
    x: number,
    y: number,
    fragment: Extract<GongfaRuntimeCommand, { kind: "detonate-crimson-embed" }>["fragment"]
  ): void {
    const fragments = this.getEnemiesWithinRadiusFrom(x, y, fragment.radius).slice(
      0,
      fragment.maxTargets
    );
    fragments.forEach((enemy, index) => {
      this.time.delayedCall(fragment.delayMs + index * fragment.delayStepMs, () => {
        if (!enemy.active) {
          return;
        }

        this.spawnCrimsonNeedle(
          x,
          y,
          enemy,
          fragment.damage,
          fragment.speed,
          fragment.lifetimeMs,
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
    const acceptedJourneyDecision =
      option.kind === "continue" ? this.pendingJourneyDecision : undefined;

    if (option.kind === "spirit-treasure-replace") {
      this.resolveSpiritTreasureReplace(option.id as SpiritTreasureId);
    } else if (option.kind === "spirit-treasure-leave") {
      this.resolveSpiritTreasureLeave();
    } else if (option.kind === "gongfa") {
      this.applyGongfaChoice(option.id as keyof typeof gongfaConfigs, !this.runState.mainGongfaId);
    } else if (option.kind === "mastery") {
      this.applyMasteryChoice(option.id);
      return;
    } else if (acceptedJourneyDecision) {
      this.pendingJourneyDecision = undefined;
      const result = advanceRunJourney(this.runState, {
        kind: "journey-choice-accepted",
        decision: acceptedJourneyDecision
      });
      this.applyRunJourneyState(result.state);
      this.applyJourneyChoiceMessage(acceptedJourneyDecision);
      this.executeRunJourneyCommands(result.commands);
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

    if (acceptedJourneyDecision?.kind === "tribulation") {
      this.offerGongfaChoice();
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
    this.playFanfare(0xffe08a);
    this.sfx.breakthrough();
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
    switch (improvement.effect) {
      default:
        break;
    }
  }

  private applyRunJourneyState(state: RunJourneyState): void {
    this.runState.stage = state.stage;
    this.runState.realmPhase = state.realmPhase;
    this.runState.realmProgress = state.realmProgress;
    this.runState.phaseCleanupActive = state.phaseCleanupActive;
    this.runState.foundationGrowthTransactions = state.foundationGrowthTransactions ?? 0;
    this.runState.finalBossActive = state.finalBossActive ?? false;
    this.runState.finalBossPhaseIndex = state.finalBossPhaseIndex ?? 0;
    this.runState.gameOver = state.gameOver ?? false;
  }

  private applyJourneyChoiceMessage(decision: RunJourneyDecision): void {
    if (decision.kind === "phase-transition") {
      this.lastMessage =
        decision.nextPhase === "zhongqi"
          ? "Chuqi complete. Foundation pressure settles into Zhongqi."
          : decision.nextPhase === "houqi"
            ? "Zhongqi complete. Pressure deepens into Houqi."
            : "Houqi complete. Dayuanman approaches.";
      return;
    }

    if (decision.kind === "tribulation") {
      this.lastMessage = `${stageConfigs[this.runState.stage].name} Chuqi begins.`;
    }
  }

  private executeRunJourneyCommands(commands: RunJourneyCommand[]): void {
    commands.forEach((command) => {
      if (command.kind === "persist-checkpoint") {
        this.persistRunCheckpoint();
        return;
      }

      if (command.kind === "present-journey-choice") {
        this.offerJourneyChoice(command.decision);
        return;
      }

      if (command.kind === "start-final-boss") {
        this.startYuanyingTribulation(command.phaseIndex);
        return;
      }

      if (command.kind === "advance-final-boss-phase") {
        this.advanceFinalBossPhase(command.phaseIndex);
        return;
      }

      if (command.kind === "complete-run") {
        this.completeFinalBossVictory();
      }
    });
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
    if (this.runState.mainGongfaId === "crimson-furnace-sword-art") {
      this.runState.furnaceCascadeCooldownRemaining = 0;
      return;
    }

    this.runState.furnaceCascadeCooldownRemaining = 0;
  }

  private applyGongfaStage(restoredRuntime?: GongfaRuntime): void {
    const gongfaId = this.runState.mainGongfaId;
    if (!gongfaId) {
      return;
    }

    this.gongfaRuntime = restoredRuntime ?? createGongfaRuntime({ gongfaId });
    this.combatState = this.gongfaRuntime.combat;
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
      if (this.activeRunSave?.selectedLinggenId) {
        this.runState.hiddenLinggen = linggenConfigs[this.activeRunSave.selectedLinggenId];
      }
      return;
    }

    this.applyRunJourneyState(createRunJourneyStateFromCheckpoint(checkpoint));
    this.runState.masteryPoints = checkpoint.masteryPoints;
    this.runState.masteryRank = checkpoint.masteryRank;
    this.runState.masteryLearnedIds = [...checkpoint.masteryLearnedIds];
    this.runState.upgradeSelectionIds = [...(checkpoint.upgradeSelectionIds ?? [])];
    this.runState.masterySkill2Id = checkpoint.masterySkill2Id;
    this.runState.masterySkill2CooldownRemaining = checkpoint.masterySkill2CooldownRemaining;
    this.runState.masterySkill2Casts = checkpoint.masterySkill2Casts;
    this.runState.masteryChoiceActive = checkpoint.masteryChoiceActive;
    this.runState.masteryPendingRanks = [...checkpoint.masteryPendingRanks];
    this.runState.learnedGongfaIds = [...checkpoint.learnedGongfaIds];
    this.runState.spiritTreasureIds = [...(checkpoint.spiritTreasureIds ?? [])];
    // The restored player stats already include treasure bonuses, so seed the
    // applied-effects baseline instead of re-applying (which would double-count).
    this.appliedSpiritTreasureEffects = aggregateSpiritTreasureEffects(
      this.runState.spiritTreasureIds
    );
    this.runState.furnaceCascadeCooldownRemaining = checkpoint.furnaceCascadeCooldownRemaining;
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
      this.applyGongfaStage(
        createGongfaRuntimeFromCheckpoint(this.runState.mainGongfaId, checkpoint)
      );
    }
  }

  private persistRunCheckpoint(): void {
    if (typeof window === "undefined") {
      return;
    }

    const gongfaCheckpoint = projectGongfaRuntimeCheckpoint(this.gongfaRuntime);
    const checkpoint = createActiveRunCheckpoint({
      playerHealth: this.player?.stats.health,
      playerMaxHealth: this.player?.stats.maxHealth,
      playerMoveSpeed: this.player?.stats.moveSpeed,
      playerMagnetRadius: this.player?.stats.magnetRadius,
      playerDamageReduction: this.player?.stats.damageReduction,
      ...projectRunJourneyCheckpointFields(this.runState),
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
      spiritTreasureIds: this.runState.spiritTreasureIds,
      ...gongfaCheckpoint,
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
    });

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
    this.cameras.main.shake(280, 0.013);
    this.sfx.death();
    this.runState.gameOver = true;
    this.setPausedState(true);
    this.lastMessage = message;
    this.clearActiveRunSave();
    this.publishHud(message);
  }

  private publishHud(message?: string): void {
    const gongfaView = projectGongfaRuntimeView(this.gongfaRuntime);
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
      galeMomentum: gongfaView.galeMomentum,
      heat: gongfaView.heat,
      ringSegments: gongfaView.ringSegments,
      counterflowRingSegments: gongfaView.counterflowRingSegments,
      solarFlareCasts: gongfaView.solarFlareCasts,
      pressure: gongfaView.pressure,
      embeddedEnemies: (this.enemies?.getChildren() as Enemy[] | undefined)?.filter(
        (enemy) => enemy.active && enemy.embedStacks > 0
      ).length ?? 0,
      furnaceCascadeCasts: gongfaView.furnaceCascadeCasts,
      crimsonPressureRadiusScale: gongfaView.crimsonPressureRadiusScale,
      guard: gongfaView.guard,
      guardMitigation: gongfaView.guardMitigation,
      bladeShellCharge: gongfaView.bladeShellCharge,
      bladeShellCasts: gongfaView.bladeShellCasts,
      skillTags: this.runState.mainGongfaId
        ? getGongfaSkillTags(this.runState.mainGongfaId).join(", ")
        : "",
      kills: this.runState.kills,
      elapsedMs: this.runState.elapsedMs,
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
      evadeActive: this.evade.state.active,
      evadeCooldownRemainingMs: this.evade.state.cooldownRemainingMs,
      enemyKinds: Object.keys(enemyConfigs).length,
      enemyCount: this.enemies?.countActive(true) ?? 0,
      orbCount: this.orbs?.countActive(true) ?? 0,
      lingcaoCollected: this.runState.lingcaoCollected,
      spiritTreasures: this.spiritTreasureHudText(),
      message: message ?? this.lastMessage
    });
  }

  getTestSnapshot(): GameSnapshot {
    const gongfaView = projectGongfaRuntimeView(this.gongfaRuntime);
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
          galeMomentum: gongfaView.galeMomentum,
          skillTags: this.runState.mainGongfaId
            ? getGongfaSkillTags(this.runState.mainGongfaId).join(", ")
            : "",
          guard: gongfaView.guard,
          guardMitigation: gongfaView.guardMitigation,
          bladeShellCasts: gongfaView.bladeShellCasts,
          bladeShellCharge: gongfaView.bladeShellCharge,
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
          evadeActive: this.evade.state.active,
          evadeCooldownRemainingMs: this.evade.state.cooldownRemainingMs,
          kills: this.runState.kills,
          lingcaoCollected: this.runState.lingcaoCollected,
          spiritTreasures: this.spiritTreasureHudText()
        })
      },
      player: {
        x: this.player?.x ?? 0,
        y: this.player?.y ?? 0,
        health: this.player?.stats.health ?? 0,
        maxHealth: this.player?.stats.maxHealth ?? 0,
        moveSpeed: this.player?.stats.moveSpeed ?? 0,
        evade: this.evade.state
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
        spiritTreasureIds: [...this.runState.spiritTreasureIds],
        masteryTransformationTriggers: {
          ...gongfaView.masteryTransformationTriggers
        },
        skillTags: this.runState.mainGongfaId
          ? getGongfaSkillTags(this.runState.mainGongfaId)
          : [],
        galeMomentum: gongfaView.galeMomentum,
        heat: gongfaView.heat,
        ringSegments: gongfaView.ringSegments,
        counterflowRingSegments: gongfaView.counterflowRingSegments,
        solarFlareCasts: gongfaView.solarFlareCasts,
        pressure: gongfaView.pressure,
        embeddedEnemies: (this.enemies?.getChildren() as Enemy[] | undefined)?.filter(
          (enemy) => enemy.active && enemy.embedStacks > 0
        ).length ?? 0,
        furnaceCascadeCasts: gongfaView.furnaceCascadeCasts,
        crimsonPressureRadiusScale: gongfaView.crimsonPressureRadiusScale,
        guard: gongfaView.guard,
        guardMitigation: gongfaView.guardMitigation,
        bladeShellCharge: gongfaView.bladeShellCharge,
        bladeShellCasts: gongfaView.bladeShellCasts,
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
        counterflowSegments: gongfaView.counterflowRingSegments,
        spreadDeg: this.combatState.spreadDeg,
        range: this.combatState.range,
        auraRadius: this.combatState.auraRadius,
        retaliationDamage: this.combatState.retaliationDamage,
        returnShots: this.combatState.returnShots,
        shellBursts: this.combatState.shellBursts
      },
      counts: {
        enemies: this.enemies?.countActive(true) ?? 0,
        projectiles: this.projectiles?.countActive(true) ?? 0,
        orbs: this.orbs?.countActive(true) ?? 0,
        orbPositions: ((this.orbs?.getChildren() as QiOrb[] | undefined) ?? [])
          .filter((orb) => orb.active)
          .map((orb) => ({
            x: orb.x,
            y: orb.y
          })),
        healingPills: this.healingPills?.countActive(true) ?? 0,
        healingPillPositions: ((this.healingPills?.getChildren() as HealingPill[] | undefined) ?? [])
          .filter((pill) => pill.active)
          .map((pill) => ({
            x: pill.x,
            y: pill.y,
            healAmount: pill.healAmount
          })),
        lingcaoPositions: ((this.lingcaoGroup?.getChildren() as Lingcao[] | undefined) ?? [])
          .filter((lingcao) => lingcao.active)
          .map((lingcao) => ({
            x: lingcao.x,
            y: lingcao.y
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

  forceSelectChoice(index: number): void {
    if (!this.choiceActive || index < 0 || index >= this.currentChoiceOptions.length) {
      return;
    }
    this.resolveChoice(this.currentChoiceOptions[index]);
  }

  forceDamagePlayer(amount: number): void {
    this.applyIncomingDamage(amount);
    if (this.player.stats.health <= 0) {
      this.handlePlayerDeath("Cultivator fell. Qi scattered.");
      return;
    }

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
    this.spawnOrb(this.player.x, this.player.y, qiValue);
    this.publishHud(this.lastMessage);
  }

  forceSpawnSpiritTreasure(treasureId: SpiritTreasureId): void {
    this.spawnSpiritTreasure(treasureId, this.player.x, this.player.y);
    this.publishHud(this.lastMessage);
  }

  forceSpawnHealingPill(healAmount = 30, offsetX = 0, offsetY = 0): void {
    this.spawnHealingPill(this.player.x + offsetX, this.player.y + offsetY, healAmount);
    this.publishHud(this.lastMessage);
  }

  private getRunSeed(): number {
    return this.activeRunSave?.seed ?? 0;
  }

  private applyIncomingDamage(amount: number): void {
    if (this.evade.state.invulnerable) {
      return;
    }

    this.msSinceDamage = 0;
    this.cameras.main.shake(110, 0.005);

    if (this.gongfaRuntime?.gengjin || this.gongfaRuntime?.yujian) {
      const result = advanceGongfaRuntime(this.gongfaRuntime, {
        kind: "incoming-damage",
        amount,
        skill2Id: this.runState.masterySkill2Id,
        learnedMasteryIds: this.runState.masteryLearnedIds
      });
      this.gongfaRuntime = result.runtime;
      this.combatState = result.runtime.combat;
      this.executeGongfaRuntimeCommands(result.commands);
      this.persistRunCheckpoint();
      return;
    }

    this.player.applyDamage(Math.max(1, Math.floor(amount)));
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
    this.playFanfare(0x8ec5ff);
    this.sfx.rankUp();
    this.lastMessage = formatMasteryRankUpMessage(
      gongfaConfigs[this.runState.mainGongfaId].name,
      targetRank
    );
    for (let rank = previousRank + 1; rank <= targetRank; rank += 1) {
      if (rank === 10) {
        this.runState.masterySkill2Id = getRank10Skill2Id(this.runState.mainGongfaId);
        this.runState.masterySkill2CooldownRemaining = this.getMasterySkill2CooldownMs();
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
    this.advanceRealmProgress(amount * 4 * efficiency);
    this.advanceMasteryProgress(amount * 8 * efficiency);
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
      const definition = getMasteryChoiceDefinition(id);
      return {
        id,
        kind: "mastery",
        title: definition?.name ?? id,
        description: definition?.lore ?? "A deterministic mastery refinement."
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

    const result = advanceRunJourney(this.runState, {
      kind: "realm-qi-gained",
      amount
    });
    this.applyRunJourneyState(result.state);
    this.executeRunJourneyCommands(result.commands);
  }

  private maybeResolvePhaseTransition(): void {
    if (!this.runState.phaseCleanupActive) {
      return;
    }

    if (this.runState.finalBossActive) {
      if (this.runState.masteryPendingRanks.length > 0) {
        this.offerMasteryChoice();
        return;
      }

      const result = advanceRunJourney(this.runState, {
        kind: "final-boss-phase-cleared"
      });
      this.applyRunJourneyState(result.state);
      this.executeRunJourneyCommands(result.commands);
      return;
    }

    const result = advanceRunJourney(this.runState, {
      kind: "cleanup-finished"
    });
    this.applyRunJourneyState(result.state);
    this.executeRunJourneyCommands(result.commands);
  }

  private offerJourneyChoice(decision: RunJourneyDecision): void {
    if (this.choiceActive || this.pendingJourneyDecision) {
      return;
    }

    this.pendingJourneyDecision = decision;
    this.choiceActive = true;
    this.currentChoiceTitle = this.getJourneyChoiceTitle(decision);
    this.currentChoiceOptions = this.getJourneyChoiceOptions(decision);
    this.setPausedState(true);
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: this.getJourneyChoiceSubtitle(decision),
      options: this.currentChoiceOptions
    });
    this.publishHud(this.lastMessage);
  }

  private getJourneyChoiceTitle(decision: RunJourneyDecision): string {
    if (decision.kind === "phase-transition") {
      return "Phase Transition";
    }

    if (decision.kind === "tribulation") {
      return `${stageConfigs[decision.stage].name} Tribulation`;
    }

    return "Yuanying Heavenly Tribulation";
  }

  private getJourneyChoiceSubtitle(decision: RunJourneyDecision): string {
    if (decision.kind === "phase-transition") {
      return `Cleanup complete. ${decision.nextPhase === "zhongqi" ? "Lianqi Chuqi" : this.runState.realmPhase} is ready to advance.`;
    }

    if (decision.kind === "tribulation") {
      return `${stageConfigs[decision.stage].name} Dayuanman clears. Its concluding Tribulation rises.`;
    }

    if (decision.kind === "yuanying-tribulation") {
      return "Dayuanman clears. Cloudbreak Summit answers with thunder.";
    }

    const phaseNames = ["Lightning Judgment", "Tribulation Shades", "Collapsing Safe Zones"] as const;
    return `${phaseNames[this.runState.finalBossPhaseIndex]} clears. The tribulation deepens.`;
  }

  private getJourneyChoiceOptions(decision: RunJourneyDecision): ChoiceOption[] {
    if (decision.kind === "phase-transition") {
      return [
        {
          id: "phase-continue",
          kind: "continue",
          title: `Continue to ${decision.nextPhase}`,
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
    }

    if (decision.kind === "tribulation") {
      const destination =
        decision.stage === "lianqi"
          ? "zhuji"
          : decision.stage === "zhuji"
            ? "jindan"
            : "yuanying";
      const destinationName = stageConfigs[destination].name;
      const currentName = stageConfigs[decision.stage].name;
      return [
        {
          id: `${decision.stage}-tribulation-continue`,
          kind: "continue",
          title: `Break through into ${destinationName}`,
          description: `Complete the ${currentName} Tribulation and open the next Gongfa slot.`
        }
      ];
    }

    if (decision.kind === "yuanying-tribulation") {
      return [
        {
          id: "yuanying-tribulation-continue",
          kind: "continue",
          title: "Face the Heavenly Tribulation",
          description: "Begin the normal-ending boss sequence."
        }
      ];
    }

    const phaseNames = ["Lightning Judgment", "Tribulation Shades", "Collapsing Safe Zones"] as const;
    const nextPhaseName = phaseNames[decision.nextPhaseIndex] ?? "Heavenly Judgment";
    return [
      {
        id: "final-boss-continue",
        kind: "continue",
        title: `Continue to ${nextPhaseName}`,
        description: "Resolve the next celestial pattern after cleanup and autosave."
      }
    ];
  }

  private startYuanyingTribulation(phaseIndex: number): void {
    this.finalBossWaveAccumulator = 0;
    this.finalBossHazardAccumulator = 0;
    this.finalBossPhaseSpawned = false;
    this.finalBossSafeZoneX = this.player.x;
    this.finalBossSafeZoneY = this.player.y;
    this.finalBossSafeZoneRadius = 220;
    this.lastMessage = "Lightning judgment descends over Cloudbreak Summit.";
    void phaseIndex;
  }

  private advanceFinalBossPhase(phaseIndex: number): void {
    this.finalBossWaveAccumulator = 0;
    this.finalBossHazardAccumulator = 0;
    this.finalBossPhaseSpawned = false;
    this.finalBossSafeZoneX = this.player.x;
    this.finalBossSafeZoneY = this.player.y;
    this.finalBossSafeZoneRadius = Math.max(120, 220 - phaseIndex * 40);
    const phaseNames = ["Lightning Judgment", "Tribulation Shades", "Collapsing Safe Zones"] as const;
    this.lastMessage = `${phaseNames[phaseIndex]} begins.`;
  }

  private completeFinalBossVictory(): void {
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

}
