import Phaser from "phaser";
import type { ChoiceOption, ChoicePayload } from "../data/choices";
import { enemyConfigs, type EnemyId } from "../data/enemies";
import {
  gongfaConfigs,
  getGongfaSkillTags,
  type GongfaId,
  type GongfaPattern,
  type GongfaStageState
} from "../data/gongfa";
import { getGongfaPackage } from "../data/gongfaPackages";
import { SURGE_CASCADE_IDS } from "../data/surgeGongfa";
import {
  getGongfaMasteryEfficiency,
  getGongfaMasterySpeedLabel,
  getLinggenAffinityGradeSummary,
  linggenConfigs,
  rollLinggen,
  type LinggenConfig
} from "../data/linggen";
import { stageConfigs, type StageId } from "../data/stages";
import { ARENA_VARIANTS } from "../data/arenaVariants";
import { Enemy } from "../entities/Enemy";
import { Lingcao } from "../entities/Lingcao";
import { HealingPill } from "../entities/HealingPill";
import { Player } from "../entities/Player";
import { SoundFx } from "../audio/SoundFx";
import { getSettings } from "../persistence/settingsPersistence";
import { subscribeSettingsPanelState } from "../settingsEvents";
import { SpiritTreasure } from "../entities/SpiritTreasure";
import {
  getSpiritTreasureConfig,
  type SpiritTreasureId
} from "../data/spiritTreasures";
import {
  attuneSpiritTreasure,
  projectSpiritTreasureReplacement,
  projectSpiritTreasureResonanceModifiers,
  projectSpiritTreasureState,
  replaceSpiritTreasure,
  spiritTreasureDropForKill,
  type SpiritTreasureAttunement
} from "../logic/spiritTreasures";
import { Projectile } from "../entities/Projectile";
import { QiOrb } from "../entities/QiOrb";
import {
  getCultivationProgressGain,
  getFirstBreakthroughState,
  getPresentedGongfaIdsForLinggen
} from "../logic/progression";
import {
  formatGongfaMasteryRoster,
  formatMasteryRankUpMessage,
  getMasteryProgressWithinRank
} from "../logic/masteryPresentation";
import { buildHudLines } from "../logic/hudPresentation";
import { getGongfaVisualEmphasis } from "../logic/combatVisualHierarchy";
import { getRealmProgressPresentation } from "../logic/realmProgressPresentation";
import { Evade } from "../logic/evade";
import {
  advanceRunJourney,
  createRunJourneyStateFromCheckpoint,
  getStageBreakthroughDestination,
  projectRunJourneyCheckpointFields,
  type RunJourneyCommand,
  type RunJourneyDecision,
  type RunJourneyState
} from "../logic/runJourney";
import {
  getDeterministicMasteryChoiceIds,
  getMasteryChoiceDefinition,
  isGongfaFullyMastered
} from "../logic/mastery";
import {
  advanceGongfaCollectionMastery,
  advanceGongfaRuntimeForProjectileHit,
  advanceGongfaRuntime,
  applyGongfaMasteryChoice,
  applyGongfaImprovement,
  createGongfaRuntime,
  createGongfaCollectionRuntime,
  galeStepSeveranceCorridor,
  ironWakeWall,
  reboundingEdgeBlade,
  getGongfaProjectileHitMode,
  getGongfaRuntimeTickThreatRadius,
  planGongfaAttack,
  projectGongfaCollectionPersistence,
  projectGongfaRuntimeView,
  recordMasterySkill2Cast,
  restoreGongfaCollection,
  migrateLegacyMasteryPendingRanks,
  learnGongfa,
  replaceGongfaCollection,
  selectCrimsonFurnaceTargetIndexes,
  splitGongfaImprovementReplayIds,
  type GongfaRuntimeCommand,
  type GongfaRuntime,
  type GongfaCollectionRuntime,
  type GongfaMasteryCheckpointFields,
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
import { projectEncounterPressure } from "../logic/encounterPressure";
import {
  getFinalTribulationBoss,
  getStageTribulationBoss,
  projectTribulationBossPressure,
  type TribulationBossProfile
} from "../logic/tribulationBoss";
import { projectFoundationGrowth } from "../logic/foundationGrowth";
import type { GameSnapshot } from "../types/gameTest";
import type { ProjectileVisualId } from "../types/combatVisuals";
import { createGongfaSigil } from "../visual/gongfaSigils";
import { getGongfaVisualIdentity } from "../visual/gongfaVisualIdentity";
import { randomInt } from "../utils/random";
import {
  COMBAT_TEXTURES,
  projectileVisualDefinitions
} from "../visual/combatVisuals";
import {
  PICKUP_ANIMATIONS,
  LINGCAO_ANIMATIONS,
  SPIRIT_TREASURE_COLLECTION_TINT,
  SPIRIT_TREASURE_TINTS,
  WORLD_TEXTURES
} from "../visual/worldVisuals";
import { createArenaPresentation, type ArenaPresentation } from "../visual/arenaVisuals";

interface CombatState extends GongfaStageState {
  pattern: GongfaPattern | "baseline";
  projectileTexture: ProjectileVisualId;
  tint: number;
}

interface RunState extends RunJourneyState {
  kills: number;
  elapsedMs: number;
  paused: boolean;
  gameOver: boolean;
  foundationGrowthTransactions: number;
  finalBossActive: boolean;
  finalBossPhaseIndex: number;
  learnedGongfaIds: GongfaId[];
  hiddenLinggen: LinggenConfig;
  revealedLinggen?: LinggenConfig;
  lingcaoCollected: boolean;
  mainGongfaId?: GongfaId;
  lingcaoMarker: string;
  lingcaoX: number;
  lingcaoY: number;
  healingPills: HealingPillCheckpoint[];
  spiritTreasureIds: SpiritTreasureId[];
  spiritTreasureAttunements: SpiritTreasureAttunement[];
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

function getFinalBossPhasePresentation(phaseIndex: number): {
  name: string;
  subtitle: string;
} {
  const profile = getFinalTribulationBoss(phaseIndex);
  return { name: profile.name, subtitle: profile.subtitle };
}

// A bounded but generous arena (2000x1280, centred on the origin). Large enough
// for the Yuanying boss's drifting safe zone, small enough that the grid floor
// and glowing border give the play space a readable edge instead of void.
const ARENA_HALF_WIDTH = 1000;
const ARENA_HALF_HEIGHT = 640;

export class GameScene extends Phaser.Scene {
  private arenaFloor!: Phaser.GameObjects.TileSprite;
  private arenaDecorationCount = 0;
  private arenaPresentation?: ArenaPresentation;
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
  private gongfaCollection: GongfaCollectionRuntime = createGongfaCollectionRuntime();
  private readonly mortalMastery: GongfaMasteryCheckpointFields = {
    masteryPoints: 0,
    masteryRank: 0,
    masteryLearnedIds: [],
    upgradeSelectionIds: [],
    masterySkill2CooldownRemaining: 0,
    masterySkill2Casts: 0,
    masteryChoiceActive: false,
    masteryPendingRanks: []
  };
  private combatState: CombatState = { ...baselineState };
  private readonly sfx = new SoundFx();
  private readonly evade = new Evade();
  private choiceActive = false;
  private currentChoiceTitle?: string;
  private currentChoiceOptions: ChoiceOption[] = [];
  private lastMessage?: string;
  private lastAimAngle = 0;
  private hasMovementDirection = false;
  private finalBossWaveAccumulator = 0;
  private finalBossHazardAccumulator = 0;
  private finalBossSafeZoneX = 0;
  private finalBossSafeZoneY = 0;
  private finalBossSafeZoneRadius = 220;
  private finalBossSafeZoneVisual?: Phaser.GameObjects.Graphics;
  private finalBossPhaseSpawned = false;
  private activeTribulationBoss?: Enemy;
  private activeTribulationBossProfile?: TribulationBossProfile;
  private bossSlamAccumulator = 0;
  private bossEnrageAnnounced = false;
  private readonly activeBossHazards = new Set<Phaser.GameObjects.Arc>();
  private activeRunSave: ActiveRunSave | null = null;
  private nextCombatTargetId = 1;
  private nextSkill2ActivationId = 1;
  private bloodCombinationSerial = 0;
  private readonly skill2HitTargets = new Map<number, Set<number>>();
  private readonly activeProjectileImpacts = new Set<Phaser.GameObjects.Sprite>();
  private recentGongfaMotifs: string[] = [];
  private readonly activePickupEffects = new Set<Phaser.GameObjects.Sprite>();
  private readonly activeLingcaoEffects = new Set<Phaser.GameObjects.Sprite>();
  private didSettingsPanelPauseRun = false;
  private bulwarkGuardRemainingMs = 0;
  private vitalityEmergencyCooldownMs = 0;
  private unsubscribeSettingsPanel?: () => void;
  private readonly onSettingsPanel = ({ open }: { open: boolean }): void => {
    if (open && !this.runState.paused && !this.choiceActive && !this.runState.gameOver) {
      this.didSettingsPanelPauseRun = true;
      this.setPausedState(true);
      this.publishHud("Settings open — Run paused.");
    } else if (!open && this.didSettingsPanelPauseRun) {
      this.didSettingsPanelPauseRun = false;
      this.setPausedState(false);
      this.publishHud();
    }
  };
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
    learnedGongfaIds: [],
    hiddenLinggen: rollLinggen(),
    lingcaoCollected: false,
    lingcaoMarker: "",
    lingcaoX: 260,
    lingcaoY: -140,
    healingPills: [],
    spiritTreasureIds: [],
    spiritTreasureAttunements: [],
    finalBossActive: false,
    finalBossPhaseIndex: 0
  };

  constructor() {
    super("game");
  }

  private get primaryMastery(): GongfaMasteryCheckpointFields {
    const primaryId = this.gongfaCollection.primaryGongfaId;
    return (primaryId ? this.gongfaCollection.byId[primaryId]?.mastery : undefined) ??
      this.mortalMastery;
  }

  private get masteryChoiceRuntime(): GongfaRuntime | undefined {
    return this.runState.learnedGongfaIds
      .map((gongfaId) => this.gongfaCollection.byId[gongfaId])
      .find((runtime) => runtime?.mastery.masteryPendingRanks.length);
  }

  private get learnedGongfaRuntimes(): GongfaRuntime[] {
    return this.runState.learnedGongfaIds
      .map((gongfaId) => this.gongfaCollection.byId[gongfaId])
      .filter((runtime): runtime is GongfaRuntime => Boolean(runtime));
  }

  private summarizeGongfaMastery(runtime: GongfaRuntime): {
    gongfaId: GongfaId;
    name: string;
    rank: number;
    fullyMastered: boolean;
  } {
    return {
      gongfaId: runtime.gongfaId,
      name: gongfaConfigs[runtime.gongfaId].name,
      rank: runtime.mastery.masteryRank,
      fullyMastered: isGongfaFullyMastered(
        runtime.gongfaId,
        runtime.mastery.masteryRank,
        runtime.mastery.masterySkill2Id,
        runtime.mastery.masteryLearnedIds
      )
    };
  }

  private get gongfaMasteries(): GameSnapshot["progression"]["gongfaMasteries"] {
    return this.learnedGongfaRuntimes.map((runtime) => {
      const { gongfaId, rank, fullyMastered } = this.summarizeGongfaMastery(runtime);
      return { gongfaId, rank, fullyMastered };
    });
  }

  private get primaryMasteryFullyMastered(): boolean {
    const primaryId = this.gongfaCollection.primaryGongfaId;
    const runtime = primaryId ? this.gongfaCollection.byId[primaryId] : undefined;
    return runtime ? this.summarizeGongfaMastery(runtime).fullyMastered : false;
  }

  private get gongfaPathsHudLine(): string {
    return formatGongfaMasteryRoster(
      this.learnedGongfaRuntimes.map((runtime) => this.summarizeGongfaMastery(runtime))
    );
  }

  private adoptPrimaryRuntime(runtime: GongfaRuntime): void {
    this.gongfaCollection.byId[runtime.gongfaId] = runtime;
    this.gongfaRuntime = runtime;
    this.combatState = runtime.combat;
  }

  private restorePrimaryRuntimeAdapter(): void {
    const primaryId = this.gongfaCollection.primaryGongfaId;
    const primary = primaryId ? this.gongfaCollection.byId[primaryId] : undefined;
    if (primary) {
      this.gongfaRuntime = primary;
      this.combatState = primary.combat;
    }
  }

  create(): void {
    this.activeRunSave = loadActiveRun(window.localStorage);
    this.restoreSavedRunState();
    const arenaWidth = ARENA_HALF_WIDTH * 2;
    const arenaHeight = ARENA_HALF_HEIGHT * 2;
    this.physics.world.setBounds(-ARENA_HALF_WIDTH, -ARENA_HALF_HEIGHT, arenaWidth, arenaHeight);
    const arena = createArenaPresentation(this, arenaWidth, arenaHeight, this.runState.stage);
    this.arenaPresentation = arena;
    this.arenaFloor = arena.floor;
    this.arenaDecorationCount = arena.decorationCount;
    this.sfx.setAmbience(this.runState.stage);

    this.player = new Player(this, 0, 0);
    this.player.setCultivationPhase(this.runState.realmPhase);
    this.player.setCollideWorldBounds(true);
    const checkpoint = this.activeRunSave?.checkpoint;
    this.player.stats.health = checkpoint?.playerHealth ?? this.player.stats.health;
    this.player.stats.maxHealth = checkpoint?.playerMaxHealth ?? this.player.stats.maxHealth;
    this.player.stats.moveSpeed = checkpoint?.playerMoveSpeed ?? this.player.stats.moveSpeed;
    this.player.stats.magnetRadius = checkpoint?.playerMagnetRadius ?? this.player.stats.magnetRadius;
    this.player.stats.damageReduction =
      checkpoint?.playerDamageReduction ?? this.player.stats.damageReduction;
    this.applyLegacyFoundationGrowthMigration();
    this.migrateLegacyMasteryChoices(Boolean(checkpoint?.gongfaRuntimes));
    if (!checkpoint?.gongfaRuntimes) {
      splitGongfaImprovementReplayIds([
        ...this.primaryMastery.upgradeSelectionIds,
        ...this.primaryMastery.masteryLearnedIds
      ]).runtimeUpgradeIds.forEach((upgradeId) => this.replayCombatImprovement(upgradeId));
    }
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
    if (this.runState.tribulationActive && this.runState.stage !== "yuanying") {
      this.startStageTribulation(this.runState.stage);
    }

    if (!this.runState.lingcaoCollected) {
      this.spawnOpeningLingcao();
    }
    this.restoreHealingPillsFromCheckpoint();
    if (this.primaryMastery.masteryChoiceActive) {
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
    this.unsubscribeSettingsPanel = subscribeSettingsPanelState(this.onSettingsPanel);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off("resolve-choice", this.resolveChoice, this);
      this.unsubscribeSettingsPanel?.();
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
    this.evade.advance(delta);
    this.bulwarkGuardRemainingMs = Math.max(0, this.bulwarkGuardRemainingMs - delta);
    this.vitalityEmergencyCooldownMs = Math.max(
      0,
      this.vitalityEmergencyCooldownMs - delta
    );

    const movement = this.inputController.getMovementVector();
    if (this.inputController.evadePressed) {
      if (
        this.evade.tryStart(
          { x: movement.x, y: movement.y },
          this.getSpiritTreasureResonanceModifiers().evadeCooldownMultiplier
        )
      ) {
        this.player.presentEvade(this.evade.state.direction);
        this.sfx.evade();
        this.maybeCutGaleStepCorridor();
        this.maybeCutIronWake();
        this.applyEvadeRuntimeEffects();
      }
    }
    const evadeState = this.evade.state;
    const presentedMovement = evadeState.active
      ? new Phaser.Math.Vector2(evadeState.direction.x, evadeState.direction.y)
      : movement;
    this.player.move(
      presentedMovement,
      evadeState.active ? evadeState.speed : this.player.stats.moveSpeed
    );
    this.player.advanceVisual(delta, presentedMovement);
    if (movement.lengthSq() > 0) {
      this.lastAimAngle = Phaser.Math.Angle.Between(0, 0, movement.x, movement.y);
      this.hasMovementDirection = true;
    }
    this.updateGongfaRuntimeTick(movement, delta);

    const playerPosition = new Phaser.Math.Vector2(this.player.x, this.player.y);
    this.updateLingcaoResonance(playerPosition);
    if (this.runState.finalBossActive) {
      this.updateFinalBoss(delta, playerPosition);
    } else if (this.runState.tribulationActive) {
      this.updateStageTribulation(delta, playerPosition);
    } else if (!this.runState.phaseCleanupActive && !this.runState.tribulationActive) {
      this.spawner.update(
        delta,
        playerPosition,
        this.runState.stage,
        this.getEncounterPressure()
      );
    }

    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      enemy.chase(playerPosition);
    });

    this.maybeCompleteTribulation();

    this.pullNearbyOrbs();
    this.maybeResolvePhaseTransition();

    if (this.runState.gameOver) {
      this.publishHud(this.lastMessage);
      return;
    }

    this.fireReadyGongfaMethods(delta);
    this.applyActiveProjectileVisualHierarchy();


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
    lingcao.setWorldMarker(marker);
    this.runState.lingcaoMarker = marker;
    this.runState.lingcaoX = x;
    this.runState.lingcaoY = y;
  }

  private updateLingcaoResonance(playerPosition: Phaser.Math.Vector2): void {
    ((this.lingcaoGroup?.getChildren() as Lingcao[] | undefined) ?? []).forEach((lingcao) => {
      lingcao.setResonating(
        Phaser.Math.Distance.Between(
          playerPosition.x,
          playerPosition.y,
          lingcao.x,
          lingcao.y
        ) <= 145
      );
    });
  }

  private handleProjectileHit(projectile: Projectile, enemy: Enemy): void {
    const hitMode = getGongfaProjectileHitMode(projectile.sourceGongfaId);
    const projectileDamage =
      projectile.damage *
      this.getSpiritTreasureResonanceModifiers().projectileDamageMultiplier;
    const diedFromHit = hitMode.appliesBaseDamage
      ? enemy.receiveDamage(projectileDamage)
      : false;
    if (hitMode.appliesBaseDamage) {
      this.spawnProjectileImpact(projectile, enemy.x, enemy.y);
      this.spawnDamageNumber(enemy.x, enemy.y, projectileDamage);
      this.sfx.hit();
    }
    let diedFromCommands = false;

    const sourceRuntime = projectile.sourceGongfaId
      ? this.gongfaCollection.byId[projectile.sourceGongfaId]
      : this.gongfaRuntime;
    if (sourceRuntime) {
      const resourceGainEligible = projectile.skill2ActivationId
        ? this.registerSkill2TargetHit(projectile.skill2ActivationId, enemy.combatTargetId)
        : true;
      const result = advanceGongfaRuntimeForProjectileHit(sourceRuntime, {
        sourceGongfaId: projectile.sourceGongfaId,
        targetId: enemy.combatTargetId,
        damage: projectileDamage,
        baseDamageKilledTarget: diedFromHit,
        embedStacks: enemy.embedStacks,
        embedPower: enemy.embedPower,
        resourceGainEligible
      });
      this.adoptPrimaryRuntime(result.runtime);
      diedFromCommands = this.executeProjectileHitCommands(projectile, enemy, result.commands);
      this.restorePrimaryRuntimeAdapter();
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

    const dropX = enemy.x;
    const dropY = enemy.y;
    const xpDrop = enemy.config.xpDrop;
    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
    const velocityX = enemyBody.velocity.x;
    const velocityY = enemyBody.velocity.y;
    const targetId = enemy.combatTargetId;
    const rank = enemy.role === "tribulation-boss"
      ? "boss" as const
      : enemy.maxHealth >= 150
        ? "elite" as const
        : "ordinary" as const;
    if (!enemy.presentDefeat()) {
      return;
    }
    for (const runtime of this.learnedGongfaRuntimes) {
      const result = advanceGongfaRuntime(runtime, {
        kind: "enemy-death",
        targetId,
        x: dropX,
        y: dropY,
        rank,
        velocityX,
        velocityY,
        playerX: this.player.x,
        playerY: this.player.y
      });
      this.adoptPrimaryRuntime(result.runtime);
      this.executeGongfaRuntimeCommands(result.commands, result.runtime);
    }
    this.restorePrimaryRuntimeAdapter();
    this.spawnOrb(dropX, dropY, xpDrop);
    this.runState.kills += 1;

    const droppedTreasure = spiritTreasureDropForKill(this.runState.kills);
    if (droppedTreasure) {
      this.spawnSpiritTreasure(droppedTreasure, dropX, dropY);
    }
  }

  private spawnProjectileImpact(projectile: Projectile, x: number, y: number): void {
    const visual = projectileVisualDefinitions[projectile.logicalTexture];
    const impact = this.add
      .sprite(x, y, COMBAT_TEXTURES.projectileImpacts)
      .setDisplaySize(visual.impactSize, visual.impactSize)
      .setAlpha(projectile.alpha)
      .setDepth(Math.max(8, projectile.depth - 0.5))
      .setTint(projectile.tintTopLeft)
      .play(visual.impactAnimation);
    this.activeProjectileImpacts.add(impact);
    impact.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.activeProjectileImpacts.delete(impact);
      impact.destroy();
    });
    if (projectile.sourceGongfaId) {
      const identity = getGongfaVisualIdentity(projectile.sourceGongfaId);
      this.recordGongfaMotif(`${identity.motifId}:impact`);
      const sigil = createGongfaSigil(
        this,
        x,
        y,
        projectile.sourceGongfaId,
        Math.max(12, visual.impactSize * 0.28),
        projectile.alpha * 0.72
      ).setDepth(Math.max(8, projectile.depth - 0.25)).setRotation(projectile.rotation);
      this.tweens.add({
        targets: sigil,
        scale: 1.45,
        alpha: 0,
        duration: 210,
        ease: "Quad.out",
        onComplete: () => sigil.destroy()
      });
    }
  }

  private applyActiveProjectileVisualHierarchy(): void {
    const learnedIds = this.runState.learnedGongfaIds;
    (this.projectiles.getChildren() as Projectile[]).forEach((projectile) => {
      if (!projectile.active) return;
      projectile.applyVisualEmphasis(
        getGongfaVisualEmphasis(learnedIds, projectile.sourceGongfaId)
      );
    });
  }

  private applyGongfaEffectVisualHierarchy(
    effect: Phaser.GameObjects.Graphics,
    sourceGongfaId: GongfaId | undefined
  ): Phaser.GameObjects.Graphics {
    const emphasis = getGongfaVisualEmphasis(
      this.runState.learnedGongfaIds,
      sourceGongfaId
    );
    return effect.setAlpha(emphasis.alpha).setDepth(emphasis.depth - 1.5);
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
        { sourceGongfaId: this.gongfaRuntime?.gongfaId }
      );
    });
  }

  private spawnYujianReversalProjectiles(
    command: Extract<GongfaRuntimeCommand, { kind: "spawn-yujian-reversal" }>
  ): void {
    const runtime = this.gongfaRuntime;
    const combat = { ...this.combatState };
    const targets = this.getNearestEnemies(Math.max(1, combat.count));
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
          combat.projectileTexture,
          combat.tint,
          { sourceGongfaId: runtime?.gongfaId }
        );

        if (runtime) {
          const currentRuntime = this.gongfaCollection.byId[runtime.gongfaId] ?? runtime;
          const result = advanceGongfaRuntime(currentRuntime, {
            kind: "yujian-reversal-spawned"
          });
          this.gongfaCollection.byId[result.runtime.gongfaId] = result.runtime;
          this.restorePrimaryRuntimeAdapter();
        }
      });
    });
  }

  private collectOrb(orb: QiOrb): void {
    this.spawnPickupBurst(orb.x, orb.y, 0x8feaff, 58);
    this.sfx.pickup();
    const harvestDamage = this.getSpiritTreasureResonanceModifiers().harvestPulseDamage;
    if (harvestDamage > 0) {
      this.getEnemiesWithinRadiusFrom(orb.x, orb.y, 160).forEach((enemy) => {
        if (enemy.receiveDamage(harvestDamage)) {
          this.resolveEnemyDeath(enemy);
        }
      });
      this.spawnPickupBurst(orb.x, orb.y, 0xd7f08a, 92);
    }
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
    this.spawnLingcaoBloom(lingcao.x, lingcao.y);
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

  private spawnLingcaoBloom(x: number, y: number): void {
    const bloom = this.add
      .sprite(x, y, WORLD_TEXTURES.lingcao, 8)
      .setDisplaySize(118, 118)
      .setDepth(15)
      .play(LINGCAO_ANIMATIONS.collect);
    this.activeLingcaoEffects.add(bloom);
    bloom.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.activeLingcaoEffects.delete(bloom);
      bloom.destroy();
    });
  }

  private handlePlayerContact(enemy: Enemy): void {
    const now = this.time.now;

    if (enemy.contactCooldownUntil > now) {
      return;
    }

    enemy.contactCooldownUntil = now + 750;
    this.applyIncomingDamage(enemy.touchDamage);
    this.maybeReboundEdge(enemy);

    for (const runtime of this.learnedGongfaRuntimes) {
      if (runtime.combat.pattern !== "melee" || runtime.combat.retaliationDamage <= 0) continue;
      const reflected = runtime.combat.retaliationDamage * (1 + (runtime.surge?.stacks ?? 0) * 0.08);
      const ring = this.add.circle(enemy.x, enemy.y, 34, 0xf0d38a, 0.08)
        .setStrokeStyle(3, 0xffffff, 0.82).setDepth(12);
      this.tweens.add({ targets: ring, scale: 1.8, alpha: 0, duration: 220, onComplete: () => ring.destroy() });
      this.stokeSkill2Resource(runtime.gongfaId);
      if (enemy.receiveDamage(reflected)) this.resolveEnemyDeath(enemy);
    }

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

  private spawnPickupBurst(x: number, y: number, tint: number, size: number): void {
    const effect = this.add
      .sprite(x, y, WORLD_TEXTURES.pickups, 12)
      .setDisplaySize(size, size)
      .setDepth(12)
      .setTint(tint)
      .play(PICKUP_ANIMATIONS.collect);
    this.activePickupEffects.add(effect);
    effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.activePickupEffects.delete(effect);
      effect.destroy();
    });
  }

  private spawnCastPulse(sourceGongfaId: GongfaId): void {
    if (!this.player?.active) {
      return;
    }
    this.sfx.cast();
    const emphasis = getGongfaVisualEmphasis(
      this.runState.learnedGongfaIds,
      sourceGongfaId
    );
    const pulse = this.add
      .circle(this.player.x, this.player.y, 14, undefined, 0)
      .setStrokeStyle(2, this.combatState.tint, 0.45)
      .setAlpha(emphasis.alpha)
      .setDepth(emphasis.depth - 2);
    this.tweens.add({
      targets: pulse,
      scale: 1.8,
      alpha: 0,
      duration: 170,
      ease: "Quad.out",
      onComplete: () => pulse.destroy()
    });
    const identity = getGongfaVisualIdentity(sourceGongfaId);
    this.recordGongfaMotif(`${identity.motifId}:cast`);
    const sigil = createGongfaSigil(
      this,
      this.player.x,
      this.player.y,
      sourceGongfaId,
      30,
      emphasis.alpha * 0.74
    ).setDepth(emphasis.depth - 1);
    this.tweens.add({
      targets: sigil,
      scale: 1.32,
      rotation: identity.geometry === "solar" || identity.geometry === "lotus" ? 0.55 : 0,
      alpha: 0,
      duration: 250,
      ease: "Cubic.out",
      onComplete: () => sigil.destroy()
    });
  }

  private recordGongfaMotif(motif: string): void {
    this.recentGongfaMotifs = [...this.recentGongfaMotifs, motif].slice(-24);
  }

  private playFanfare(color: number): void {
    this.flashCamera(220, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
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

  private flashCamera(duration: number, red: number, green: number, blue: number): void {
    if (!getSettings().reducedMotion) {
      this.cameras.main.flash(duration, red, green, blue, false);
    }
  }

  private shakeCamera(duration: number, intensity: number): void {
    const settings = getSettings();
    const scale = settings.reducedMotion ? 0 : settings.cameraShake;
    if (scale > 0) this.cameras.main.shake(duration, intensity * scale);
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

    const result = attuneSpiritTreasure(
      this.runState.spiritTreasureAttunements,
      treasure.treasureId
    );
    if (result.kind === "attuned") {
      this.runState.spiritTreasureAttunements = result.active;
      this.runState.spiritTreasureIds = result.active.map(({ id }) => id);
      this.applySpiritTreasureEffects();
      const rank = result.active.find(({ id }) => id === treasure.treasureId)?.rank ?? 1;
      this.lastMessage = `${getSpiritTreasureConfig(treasure.treasureId).name} reaches Attunement ${rank}.`;
      this.spawnPickupBurst(
        treasure.x,
        treasure.y,
        SPIRIT_TREASURE_COLLECTION_TINT,
        76
      );
      this.sfx.spiritTreasure();
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
      ...this.runState.spiritTreasureIds.map<ChoiceOption>((heldId) => {
        const comparison = projectSpiritTreasureReplacement(
          this.runState.spiritTreasureAttunements,
          heldId,
          treasure.treasureId
        );
        const resonance = [
          comparison.resonanceGained.length
            ? `Gain resonance: ${comparison.resonanceGained.join(", ")}`
            : "",
          comparison.resonanceLost.length
            ? `Lose resonance: ${comparison.resonanceLost.join(", ")}`
            : ""
        ].filter(Boolean).join(" · ");
        const mechanics = [
          ...comparison.mechanicsGained.map((effect) => `Gain mechanic: ${effect}`),
          ...comparison.mechanicsLost.map((effect) => `Lose mechanic: ${effect}`)
        ].join(" · ");
        return {
          id: heldId,
          kind: "spirit-treasure-replace",
          spiritTreasureId: treasure.treasureId,
          replacedSpiritTreasureId: heldId,
          title: `Replace ${getSpiritTreasureConfig(heldId).name}`,
          description: `Gain ${comparison.gain} · Lose ${comparison.loss}${resonance ? ` · ${resonance}` : ""}${mechanics ? ` · ${mechanics}` : ""}`,
          gain: comparison.gain,
          loss: comparison.loss,
          resonanceGained: comparison.resonanceGained,
          resonanceLost: comparison.resonanceLost,
          mechanicsGained: comparison.mechanicsGained,
          mechanicsLost: comparison.mechanicsLost
        };
      }),
      {
        id: "leave",
        kind: "spirit-treasure-leave",
        spiritTreasureId: treasure.treasureId,
        title: "Leave it behind",
        description: "Keep your current three Spirit Treasures."
      }
    ];
    this.showChoicePanel({
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
    this.runState.spiritTreasureAttunements = this.runState.spiritTreasureIds.map((id) => ({
      id,
      rank: id === treasure.treasureId ? 1 : this.runState.spiritTreasureAttunements.find(
        (entry) => entry.id === id
      )?.rank ?? 1
    }));
    this.applySpiritTreasureEffects();
    this.lastMessage = `${getSpiritTreasureConfig(treasure.treasureId).name} supplants ${getSpiritTreasureConfig(replacedId).name}.`;
    this.spawnPickupBurst(
      treasure.x,
      treasure.y,
      SPIRIT_TREASURE_COLLECTION_TINT,
      76
    );
    this.sfx.spiritTreasure();
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
    const totals = projectSpiritTreasureState(
      this.runState.spiritTreasureAttunements
    ).effects;
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
      .map((id) => {
        const rank = this.runState.spiritTreasureAttunements.find((entry) => entry.id === id)?.rank ?? 1;
        return `${getSpiritTreasureConfig(id).name} · A${rank}`;
      })
      .join(", ");
  }

  private updateFinalBoss(delta: number, playerPosition: Phaser.Math.Vector2): void {
    const profile = getFinalTribulationBoss(this.runState.finalBossPhaseIndex);

    if (this.finalBossPhaseSpawned && !this.activeTribulationBoss?.active) {
      this.reportFinalBossPhaseCleared();
      return;
    }

    if (!this.finalBossPhaseSpawned) {
      this.spawnTribulationBossEncounter(profile, playerPosition);
      this.finalBossPhaseSpawned = true;
    } else {
      this.updateTribulationBossMechanics(delta, playerPosition, profile);
    }

    if (this.runState.finalBossPhaseIndex === 2) {
      this.renderFinalBossSafeZone();
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

    if (this.finalBossPhaseSpawned && !this.activeTribulationBoss?.active) {
      this.reportFinalBossPhaseCleared();
    }
  }

  private updateStageTribulation(
    delta: number,
    playerPosition: Phaser.Math.Vector2
  ): void {
    const profile = this.activeTribulationBossProfile;
    if (!profile || !this.activeTribulationBoss?.active) return;
    this.updateTribulationBossMechanics(delta, playerPosition, profile);
  }

  private updateTribulationBossMechanics(
    delta: number,
    playerPosition: Phaser.Math.Vector2,
    profile: TribulationBossProfile
  ): void {
    const boss = this.activeTribulationBoss;
    if (!boss?.active) return;
    this.finalBossWaveAccumulator += delta;
    this.bossSlamAccumulator += delta;

    if (this.finalBossWaveAccumulator >= profile.addIntervalMs) {
      this.finalBossWaveAccumulator = 0;
      this.spawnTribulationAdds(profile, profile.addAmount, playerPosition);
    }

    if (this.bossSlamAccumulator >= profile.slamIntervalMs) {
      this.bossSlamAccumulator = 0;
      this.telegraphTribulationSlam(profile);
    }

    if (boss.isEnraged && !this.bossEnrageAnnounced) {
      this.bossEnrageAnnounced = true;
      this.lastMessage = `${profile.name} enters its enraged second form.`;
      this.flashCamera(150, 255, 108, 108);
      this.shakeCamera(180, 0.005);
    }
  }

  private spawnTribulationBossEncounter(
    profile: TribulationBossProfile,
    playerPosition: Phaser.Math.Vector2
  ): void {
    const pressure = this.getEncounterPressure();
    const bossPressure = projectTribulationBossPressure(pressure, profile);
    this.activeTribulationBossProfile = profile;
    this.activeTribulationBoss = this.spawner.spawnManual(
      profile.enemyId,
      playerPosition.x + 340,
      playerPosition.y - 90,
      { ...pressure, ...bossPressure },
      {
        role: "tribulation-boss",
        displayName: profile.name,
        displayScale: profile.displayScale,
        auraColor: profile.auraColor
      }
    );
    this.finalBossWaveAccumulator = 0;
    this.bossSlamAccumulator = 0;
    this.bossEnrageAnnounced = false;
    this.spawnTribulationAdds(profile, profile.initialAdds, playerPosition);
  }

  private spawnTribulationAdds(
    profile: TribulationBossProfile,
    amount: number,
    playerPosition: Phaser.Math.Vector2
  ): void {
    const activeAdds = (this.enemies.getChildren() as Enemy[]).filter(
      (enemy) => enemy.active && enemy.role !== "tribulation-boss"
    ).length;
    const spawnCount = Math.min(amount, Math.max(0, profile.maxAdds - activeAdds));
    const pressure = this.getEncounterPressure();
    for (let i = 0; i < spawnCount; i += 1) {
      const enemyId = profile.addPool[i % profile.addPool.length];
      const angle = (Math.PI * 2 * i) / Math.max(1, spawnCount) + this.time.now / 1700;
      const radius = randomInt(280, 390);
      this.spawner.spawnManual(
        enemyId,
        playerPosition.x + Math.cos(angle) * radius,
        playerPosition.y + Math.sin(angle) * radius,
        pressure
      );
    }
  }

  private telegraphTribulationSlam(profile: TribulationBossProfile): void {
    const boss = this.activeTribulationBoss;
    if (!boss?.active) return;
    const x = boss.x;
    const y = boss.y;
    const telegraph = this.add
      .circle(x, y, profile.slamRadius, profile.auraColor, 0.08)
      .setStrokeStyle(4, profile.auraColor, 0.82)
      .setDepth(4.75)
      .setScale(0.2);
    this.activeBossHazards.add(telegraph);
    this.tweens.add({
      targets: telegraph,
      scale: 1,
      alpha: 0.9,
      duration: 720,
      ease: "Cubic.out"
    });
    this.time.delayedCall(720, () => {
      if (!telegraph.active) return;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y) <= profile.slamRadius) {
        this.applyIncomingDamage(profile.slamDamage);
      }
      this.flashCamera(90, 215, 185, 109);
      this.activeBossHazards.delete(telegraph);
      telegraph.destroy();
    });
  }

  private clearTribulationBossEncounter(): void {
    this.activeBossHazards.forEach((hazard) => hazard.destroy());
    this.activeBossHazards.clear();
    this.finalBossSafeZoneVisual?.destroy();
    this.finalBossSafeZoneVisual = undefined;
    this.forceClearEnemies();
    this.activeTribulationBoss = undefined;
    this.activeTribulationBossProfile = undefined;
    this.finalBossWaveAccumulator = 0;
    this.bossSlamAccumulator = 0;
    this.bossEnrageAnnounced = false;
  }

  private renderFinalBossSafeZone(): void {
    this.finalBossSafeZoneVisual ??= this.add.graphics().setDepth(3.8);
    const visual = this.finalBossSafeZoneVisual;
    const pulse = 1 + Math.sin(this.time.now / 240) * 0.025;
    visual.clear();
    visual.fillStyle(0x8fe8ff, 0.055);
    visual.fillCircle(
      this.finalBossSafeZoneX,
      this.finalBossSafeZoneY,
      this.finalBossSafeZoneRadius * pulse
    );
    visual.lineStyle(5, 0x8fe8ff, 0.78);
    visual.strokeCircle(
      this.finalBossSafeZoneX,
      this.finalBossSafeZoneY,
      this.finalBossSafeZoneRadius * pulse
    );
    visual.lineStyle(2, 0xf5df8c, 0.52);
    visual.strokeCircle(
      this.finalBossSafeZoneX,
      this.finalBossSafeZoneY,
      Math.max(12, this.finalBossSafeZoneRadius * pulse - 12)
    );
  }

  private collectHealingPill(pill: HealingPill): void {
    if (!pill.active) {
      return;
    }

    if (this.player.stats.health >= this.player.stats.maxHealth) {
      return;
    }

    this.player.heal(
      pill.healAmount * this.getSpiritTreasureResonanceModifiers().healingMultiplier
    );
    this.spawnPickupBurst(pill.x, pill.y, 0xff9dc9, 68);
    this.sfx.healingPill();
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
      this.getEncounterPressure(),
      Boolean(this.runState.mainGongfaId)
    );
    this.publishHud(this.lastMessage);
  }

  private getEncounterPressure() {
    return projectEncounterPressure(
      this.runState.stage,
      this.runState.realmPhase,
      this.learnedGongfaRuntimes.length
    );
  }

  private getSpiritTreasureResonanceModifiers() {
    return projectSpiritTreasureResonanceModifiers(
      projectSpiritTreasureState(this.runState.spiritTreasureAttunements).resonances,
      this.runState.spiritTreasureAttunements
    );
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

  private fireReadyGongfaMethods(delta: number): void {
    for (const runtime of this.learnedGongfaRuntimes) {
      runtime.attackCooldownRemaining -= delta;
      if (runtime.attackCooldownRemaining > 0) {
        continue;
      }

      this.adoptPrimaryRuntime(runtime);
      const commands = planGongfaAttack(runtime, this.runState.elapsedMs);
      if (commands.length > 0) {
        const aimAngle = this.getAimAngle();
        this.player.presentAttack({ x: Math.cos(aimAngle), y: Math.sin(aimAngle) });
        this.spawnCastPulse(runtime.gongfaId);
        this.executeGongfaRuntimeCommands(commands, runtime);
      }
      const updatedRuntime = this.gongfaCollection.byId[runtime.gongfaId] ?? runtime;
      updatedRuntime.attackCooldownRemaining = updatedRuntime.combat.cooldownMs;
    }
    this.restorePrimaryRuntimeAdapter();
  }

  private fireHomingVolley(
    command: Extract<GongfaRuntimeCommand, { kind: "homing-volley" }>
  ): void {
    const combat = { ...this.combatState };
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    const targets = this.getNearestEnemies(command.count);
    if (targets.length === 0) {
      return;
    }

    targets.forEach((enemy, index) => {
      this.spawnProjectileAtTarget(
        this.player.x,
        this.player.y - 10 + index * 4,
        enemy,
        combat.damage,
        combat.pierce,
        combat.projectileSpeed,
        combat.projectileLifetimeMs,
        combat.projectileTexture,
        combat.tint,
        {
          sourceGongfaId
        }
      );
    });

    for (let i = 0; i < combat.returnShots; i += 1) {
      targets.forEach((enemy, index) => {
        this.time.delayedCall(140 + i * 90, () => {
          if (!enemy.active || !this.player.active) {
            return;
          }

          this.spawnProjectileAtTarget(
            this.player.x,
            this.player.y + 12 + index * 5,
            enemy,
            Math.floor(combat.damage * 0.65),
            combat.pierce,
            combat.projectileSpeed + 40,
            combat.projectileLifetimeMs,
            combat.projectileTexture,
            combat.tint,
            {
              sourceGongfaId
            }
          );
        });
      });
    }
  }

  private fireCrimsonFurnaceVolley(
    command: Extract<GongfaRuntimeCommand, { kind: "crimson-furnace-volley" }>
  ): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
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
        this.combatState.tint,
        sourceGongfaId
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
    texture: ProjectileVisualId,
    tint: number,
    sourceGongfaId: GongfaId | undefined
  ): void {
    const projectile = new Projectile(this, x, y, texture);
    projectile.damage = damage;
    projectile.sourceGongfaId = sourceGongfaId;
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
      this.triggerCrimsonDetonation(
        sourceGongfaId,
        projectile.x,
        projectile.y,
        projectile.damage,
        false
      );
      projectile.destroy();
    });
  }

  private fireWaveVolley(
    command: Extract<GongfaRuntimeCommand, { kind: "wave-volley" }>
  ): void {
    const combat = { ...this.combatState };
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    const angle = this.getWaveAimAngle(command.aimMode);
    const count = command.count;
    const spreadRad = Phaser.Math.DegToRad(combat.spreadDeg);

    for (let i = 0; i < count; i += 1) {
      const offset = count === 1 ? 0 : Phaser.Math.Linear(-spreadRad / 2, spreadRad / 2, i / (count - 1));
      this.spawnWaveProjectile(
        this.player.x,
        this.player.y,
        angle + offset,
        combat.damage,
        combat.pierce,
        combat.projectileSpeed,
        combat.projectileLifetimeMs + Math.floor(combat.range * 0.8),
        1.05,
        command.growthScale ?? 1,
        sourceGongfaId,
        combat.projectileTexture,
        combat.tint
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
            Math.floor(combat.damage * 0.55),
            combat.pierce,
            combat.projectileSpeed + 30,
            Math.max(420, combat.projectileLifetimeMs + Math.floor(combat.range * 0.45)),
            0.85,
            1,
            sourceGongfaId,
            combat.projectileTexture,
            combat.tint
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
    growthScale = 1,
    sourceGongfaId = this.gongfaRuntime?.gongfaId,
    texture = this.combatState.projectileTexture,
    tint = this.combatState.tint,
    skill2ActivationId?: number
  ): void {
    const projectile = new Projectile(this, x, y, texture);
    projectile.sourceGongfaId = sourceGongfaId;
    projectile.skill2ActivationId = skill2ActivationId;
    projectile.damage = damage;
    projectile.pierceRemaining = pierce;
    projectile.setTint(tint);
    projectile.setAngle(Phaser.Math.RadToDeg(angle));
    const baseScaleX = scale;
    const baseScaleY = Math.max(0.72, scale - 0.15);
    projectile.setVisualScale(baseScaleX, baseScaleY);
    this.projectiles.add(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    // Endless Horizon: grow the Cutting Front as it travels.
    if (growthScale > 1) {
      this.tweens.add({
        targets: projectile,
        scaleX: projectile.scaleX * growthScale,
        scaleY: projectile.scaleY * growthScale,
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
    const direction = this.evade.state.direction;
    const angle = Math.atan2(direction.y, direction.x);
    for (const runtime of this.learnedGongfaRuntimes) {
      const corridor = galeStepSeveranceCorridor(runtime);
      if (!corridor) {
        continue;
      }
      const combat = { ...runtime.combat };
      for (let i = 0; i < corridor.count; i += 1) {
        this.time.delayedCall(i * 40, () => {
          if (!this.player.active) {
            return;
          }
          this.spawnWaveProjectile(
            this.player.x,
            this.player.y,
            angle,
            Math.max(1, Math.floor(combat.damage * 0.7)),
            corridor.pierce,
            combat.projectileSpeed + 60,
            combat.projectileLifetimeMs + 220,
            0.95,
            1,
            runtime.gongfaId,
            combat.projectileTexture,
            combat.tint
          );
        });
      }
    }
  }

  private maybeCutIronWake(): void {
    const direction = this.evade.state.direction;
    const angle = Math.atan2(direction.y, direction.x) + Math.PI / 2;
    for (const runtime of this.learnedGongfaRuntimes) {
      const wall = ironWakeWall(runtime);
      if (!wall) {
        continue;
      }
      const combat = { ...runtime.combat };
      for (let i = 0; i < wall.count; i += 1) {
        this.time.delayedCall(i * 45, () => {
          if (!this.player.active) {
            return;
          }
          this.spawnWaveProjectile(
            this.player.x,
            this.player.y,
            angle,
            Math.max(1, Math.floor(combat.damage * 0.6)),
            wall.pierce,
            combat.projectileSpeed,
            combat.projectileLifetimeMs + 260,
            0.9,
            1,
            runtime.gongfaId,
            combat.projectileTexture,
            combat.tint
          );
        });
      }
    }
  }

  private applyEvadeRuntimeEffects(): void {
    this.bloodCombinationSerial += 1;
    for (const runtime of this.learnedGongfaRuntimes) {
      const result = advanceGongfaRuntime(runtime, {
        kind: "evade",
        playerX: this.player.x,
        playerY: this.player.y
      });
      this.adoptPrimaryRuntime(result.runtime);
      this.executeGongfaRuntimeCommands(result.commands, result.runtime);
    }
    this.restorePrimaryRuntimeAdapter();
  }

  private maybeReboundEdge(enemy: Enemy): void {
    if (!enemy.active) {
      return;
    }

    const runtime = this.learnedGongfaRuntimes.find((candidate) =>
      Boolean(reboundingEdgeBlade(candidate))
    );
    if (!runtime) {
      return;
    }
    const blade = reboundingEdgeBlade(runtime)!;

    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
    this.spawnWaveProjectile(
      this.player.x,
      this.player.y,
      angle,
      blade.damage,
      blade.pierce,
      runtime.combat.projectileSpeed + 80,
      runtime.combat.projectileLifetimeMs + 200,
      1.0,
      1,
      runtime.gongfaId,
      runtime.combat.projectileTexture,
      runtime.combat.tint
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

  private emitAuraBurst(
    damage: number,
    count: number,
    skill2ActivationId?: number,
    combat: CombatState = this.combatState,
    sourceGongfaId = this.gongfaRuntime?.gongfaId
  ): void {
    const projectileCount = Math.max(4, count);
    for (let i = 0; i < projectileCount; i += 1) {
      const angle = (Math.PI * 2 * i) / projectileCount;
      const projectile = new Projectile(
        this,
        this.player.x + Math.cos(angle) * 10,
        this.player.y + Math.sin(angle) * 10,
        combat.projectileTexture
      );
      projectile.sourceGongfaId = sourceGongfaId;
      projectile.skill2ActivationId = skill2ActivationId;
      projectile.damage = damage;
      projectile.pierceRemaining = combat.pierce;
      projectile.setTint(combat.tint);
      projectile.setVisualScale(0.85);
      projectile.setAngle(Phaser.Math.RadToDeg(angle));
      this.projectiles.add(projectile);
      const body = projectile.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        Math.cos(angle) * combat.projectileSpeed,
        Math.sin(angle) * combat.projectileSpeed
      );
      this.time.delayedCall(combat.projectileLifetimeMs, () => {
        if (projectile.active) {
          projectile.destroy();
        }
      });
    }

    for (let burst = 0; burst < combat.shellBursts; burst += 1) {
      this.time.delayedCall(150 + burst * 110, () => {
        if (!this.player.active) {
          return;
        }

        this.emitAuraShell(
          Math.floor(damage * 0.75),
          projectileCount + 2 + burst * 2,
          1 + burst * 0.18,
          combat,
          sourceGongfaId,
          skill2ActivationId
        );
      });
    }
  }

  private emitAuraShell(
    damage: number,
    count: number,
    scale: number,
    combat: CombatState = this.combatState,
    sourceGongfaId = this.gongfaRuntime?.gongfaId,
    skill2ActivationId?: number
  ): void {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const projectile = new Projectile(
        this,
        this.player.x + Math.cos(angle) * 16,
        this.player.y + Math.sin(angle) * 16,
        combat.projectileTexture
      );
      projectile.sourceGongfaId = sourceGongfaId;
      projectile.skill2ActivationId = skill2ActivationId;
      projectile.damage = damage;
      projectile.pierceRemaining = combat.pierce + 1;
      projectile.setTint(combat.tint);
      projectile.setVisualScale(Math.max(0.95, scale));
      projectile.setAngle(Phaser.Math.RadToDeg(angle));
      this.projectiles.add(projectile);
      const body = projectile.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        Math.cos(angle) * (combat.projectileSpeed + 55),
        Math.sin(angle) * (combat.projectileSpeed + 55)
      );
      this.time.delayedCall(combat.projectileLifetimeMs + 120, () => {
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
    texture: ProjectileVisualId,
    tint: number,
    options: {
      sourceGongfaId?: GongfaId;
      skill2ActivationId?: number;
    } = {}
  ): void {
    const projectile = new Projectile(this, x, y, texture);
    projectile.damage = damage;
    projectile.pierceRemaining = pierce;
    projectile.sourceGongfaId = options.sourceGongfaId;
    projectile.skill2ActivationId = options.skill2ActivationId;
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
    texture: ProjectileVisualId,
    tint: number,
    options: {
      sourceGongfaId?: GongfaId;
      skill2ActivationId?: number;
    } = {}
  ): void {
    const projectile = new Projectile(this, x, y, texture);
    projectile.damage = damage;
    projectile.pierceRemaining = pierce;
    projectile.sourceGongfaId = options.sourceGongfaId;
    projectile.skill2ActivationId = options.skill2ActivationId;
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
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const targetFacts = (this.enemies.getChildren() as Enemy[])
      .filter((enemy) => enemy.active)
      .map((enemy) => ({
        targetId: enemy.combatTargetId,
        x: enemy.x,
        y: enemy.y,
        healthRatio: enemy.maxHealth > 0 ? enemy.health / enemy.maxHealth : 0,
        rank: enemy.role === "tribulation-boss"
          ? "boss" as const
          : enemy.maxHealth >= 150
            ? "elite" as const
            : "ordinary" as const
      }));
    for (const runtime of this.learnedGongfaRuntimes) {
      const threatRadius = getGongfaRuntimeTickThreatRadius(runtime);
      const result = advanceGongfaRuntime(runtime, {
        kind: "tick",
        deltaMs: delta,
        nearbyEnemyCount:
          threatRadius > 0 ? this.getEnemiesWithinRadius(threatRadius).length : 0,
        eligibleTargetCount: runtime.crimsonFurnace
          ? (this.enemies.getChildren() as Enemy[]).filter(
              (enemy) => enemy.active && enemy.embedStacks > 0
            ).length
          : this.getNearestEnemies(64).length,
        hasMovementDirection: this.hasMovementDirection,
        isMoving: movement.lengthSq() > 0,
        movementAngle: movement.lengthSq() > 0 ? movement.angle() : undefined,
        movementDistance: playerBody.velocity.length() * Math.max(0, delta) / 1000,
        playerX: this.player.x,
        playerY: this.player.y,
        healthRatio: this.player.stats.maxHealth > 0
          ? this.player.stats.health / this.player.stats.maxHealth
          : 0,
        targets: targetFacts,
        skill2Enabled:
          !this.choiceActive && !this.runState.paused && !this.runState.gameOver
      });
      this.adoptPrimaryRuntime(result.runtime);
      this.executeGongfaRuntimeCommands(result.commands, result.runtime);
    }
    this.restorePrimaryRuntimeAdapter();
  }

  private getEnemiesWithinRadius(radius: number): Enemy[] {
    return this.getEnemiesWithinRadiusFrom(this.player.x, this.player.y, radius);
  }

  private getEnemiesWithinRadiusFrom(x: number, y: number, radius: number): Enemy[] {
    return (this.enemies.getChildren() as Enemy[])
      .filter((enemy) => enemy.active)
      .filter((enemy) => Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius);
  }

  private executeGongfaRuntimeCommands(
    commands: GongfaRuntimeCommand[],
    runtime = this.gongfaRuntime
  ): void {
    if (runtime) {
      this.adoptPrimaryRuntime(runtime);
    }
    let skillPresented = false;
    commands.forEach((command) => {
      this.recordMasterySkill2Cast(command, runtime);

      if (!skillPresented && command.kind !== "mastery-skill2-cast" && "masteryCast" in command) {
        const aimAngle = this.getAimAngle();
        this.player.presentSkill({ x: Math.cos(aimAngle), y: Math.sin(aimAngle) });
        skillPresented = true;
      }

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
        return;
      }

      if (command.kind === "feather-rain-formation") {
        this.fireFeatherRainFormation(command);
        return;
      }

      if (command.kind === "sunset-wave-apex") {
        this.fireSunsetWaveApex(command);
        return;
      }

      if (command.kind === "mirror-needle-constellation") {
        this.fireMirrorNeedleConstellation(command);
        return;
      }

      if (command.kind === "moon-tide-vault") {
        this.fireMoonTideVault(command);
        return;
      }

      if (command.kind === "frozen-lotus-shell") {
        this.fireFrozenLotusShell(command);
        return;
      }

      if (command.kind === "verdant-root-network") {
        this.fireVerdantRootNetwork(command);
        return;
      }

      if (command.kind === "sprout-sun-circle") {
        this.fireSproutSunCircle(command);
        return;
      }

      if (command.kind === "ironwood-surge-form") {
        this.fireIronwoodSurgeForm(command);
        return;
      }

      if (command.kind === "ritual-impact") {
        this.fireRitualImpact(command);
        return;
      }

      if (command.kind === "summon-wraiths") {
        this.summonMistWraiths(command);
        return;
      }

      if (command.kind === "melee-combination") {
        this.fireMeleeCombination(command);
        return;
      }

      if (command.kind === "root-trap-array") {
        this.plantRootTrapArray(command);
        return;
      }

      if (command.kind === "authored-line-strike") {
        this.fireAuthoredLineStrike(command);
        return;
      }

      if (command.kind === "authored-blood-combination") {
        this.fireAuthoredBloodCombination(command);
        return;
      }

      if (command.kind === "heavenly-sun-descent") {
        this.fireRitualImpact({
          kind: "ritual-impact", count: command.impactCount, damage: command.damage,
          radius: command.radius, telegraphMs: command.telegraphMs,
          burnPulses: command.burnPulses, burnDelayMs: 300
        });
        return;
      }

      if (command.kind === "hundred-ghost-procession") {
        this.summonMistWraiths({
          kind: "summon-wraiths", count: command.wraithCount,
          shotsPerWraith: command.shotsPerWraith, damage: command.damage,
          pierce: command.pierce, orbitMs: command.orbitMs
        });
        return;
      }

      if (command.kind === "star-breaking-descent") {
        this.fireMeleeCombination({
          kind: "melee-combination", strikeCount: command.strikeCount,
          damage: command.damage, radius: command.radius,
          finisherScale: command.finisherScale, staggerMs: command.staggerMs
        });
        return;
      }

      if (command.kind === "myriad-root-killing-field") {
        this.plantRootTrapArray({
          kind: "root-trap-array", count: command.trapCount, pulses: command.pulses,
          damage: command.damage, radius: command.radius,
          pulseDelayMs: command.pulseDelayMs, lifetimeMs: command.lifetimeMs
        });
      }
    });
  }

  private fireRitualImpact(command: Extract<GongfaRuntimeCommand, { kind: "ritual-impact" }>): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    if (!sourceGongfaId) return;
    const identity = getGongfaVisualIdentity(sourceGongfaId);
    const targets = this.getDensestClusterTargets(Math.max(1, command.count), command.radius * 1.5);
    const anchors = targets.length > 0 ? targets : this.getNearestEnemies(1);
    anchors.slice(0, command.count).forEach((target, index) => {
      const x = target.x + (index - (command.count - 1) / 2) * command.radius * 0.7;
      const y = target.y;
      const omen = this.add.graphics().setDepth(13);
      omen.fillStyle(identity.accent, 0.08).fillCircle(x, y, command.radius);
      omen.lineStyle(3, identity.accent, 0.9).strokeCircle(x, y, command.radius);
      omen.lineStyle(1, identity.secondary, 0.75).strokeCircle(x, y, command.radius * 0.62);
      this.tweens.add({ targets: omen, alpha: 0.35, yoyo: true, repeat: 2, duration: Math.max(90, command.telegraphMs / 6) });
      this.time.delayedCall(command.telegraphMs, () => {
        omen.destroy();
        const impact = createGongfaSigil(this, x, y, sourceGongfaId, command.radius, 0.95).setDepth(14);
        this.tweens.add({ targets: impact, scale: 1.28, alpha: 0, duration: 420, onComplete: () => impact.destroy() });
        this.damageEnemiesWithin(x, y, command.radius, command.damage, sourceGongfaId);
        for (let pulse = 1; pulse <= command.burnPulses; pulse += 1) {
          this.time.delayedCall(pulse * command.burnDelayMs, () => {
            const scar = this.add.circle(x, y, command.radius * (0.72 + pulse * 0.025), identity.accent, 0.08).setDepth(3);
            this.tweens.add({ targets: scar, alpha: 0, duration: command.burnDelayMs, onComplete: () => scar.destroy() });
            this.damageEnemiesWithin(x, y, command.radius * 0.9, Math.max(1, Math.floor(command.damage * 0.14)), sourceGongfaId);
          });
        }
      });
    });
  }

  private summonMistWraiths(command: Extract<GongfaRuntimeCommand, { kind: "summon-wraiths" }>): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    if (!sourceGongfaId) return;
    const combat = { ...this.combatState };
    for (let index = 0; index < command.count; index += 1) {
      const angle = (Math.PI * 2 * index) / command.count;
      const radius = 42 + (index % 2) * 18;
      const wraith = createGongfaSigil(
        this,
        this.player.x + Math.cos(angle) * radius,
        this.player.y + Math.sin(angle) * radius,
        sourceGongfaId,
        14,
        0.9
      ).setDepth(12);
      this.tweens.add({ targets: wraith, rotation: angle + Math.PI, scale: 1.18, yoyo: true, duration: command.orbitMs, repeat: command.shotsPerWraith - 1 });
      for (let shot = 0; shot < command.shotsPerWraith; shot += 1) {
        this.time.delayedCall(command.orbitMs * (shot + 1) + index * 32, () => {
          const target = this.getNearestEnemies(command.count + 2)[index % Math.max(1, this.getNearestEnemies(command.count + 2).length)];
          if (!target?.active || !wraith.active) return;
          this.spawnProjectileAtTarget(wraith.x, wraith.y, target, command.damage, command.pierce,
            combat.projectileSpeed, combat.projectileLifetimeMs,
            combat.projectileTexture, combat.tint, { sourceGongfaId });
        });
      }
      this.time.delayedCall(command.orbitMs * (command.shotsPerWraith + 1), () => {
        if (!wraith.active) return;
        this.tweens.add({ targets: wraith, alpha: 0, scale: 0.4, duration: 180, onComplete: () => wraith.destroy() });
      });
    }
  }

  private fireMeleeCombination(command: Extract<GongfaRuntimeCommand, { kind: "melee-combination" }>): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    if (!sourceGongfaId) return;
    const identity = getGongfaVisualIdentity(sourceGongfaId);
    for (let strike = 0; strike < command.strikeCount; strike += 1) {
      this.time.delayedCall(strike * command.staggerMs, () => {
        if (!this.player.active) return;
        const finisher = strike === command.strikeCount - 1;
        const radius = command.radius * (finisher ? 1.18 : 0.82);
        const damage = command.damage * (finisher ? command.finisherScale : 0.55);
        const arc = this.add.circle(this.player.x, this.player.y, radius, identity.accent, 0.06)
          .setStrokeStyle(finisher ? 5 : 2, finisher ? identity.secondary : identity.accent, 0.85).setDepth(11);
        this.tweens.add({ targets: arc, scale: finisher ? 1.2 : 1.08, alpha: 0, duration: 180, onComplete: () => arc.destroy() });
        this.damageEnemiesWithin(this.player.x, this.player.y, radius, damage, sourceGongfaId);
        if (finisher) this.pushEnemiesAwayFrom(this.player.x, this.player.y, radius, 220);
      });
    }
  }

  private plantRootTrapArray(command: Extract<GongfaRuntimeCommand, { kind: "root-trap-array" }>): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    if (!sourceGongfaId) return;
    const targets = this.getNearestEnemies(command.count);
    const activationId = this.beginSkill2Activation();
    for (let index = 0; index < command.count; index += 1) {
      const target = targets[index % Math.max(1, targets.length)];
      const angle = (Math.PI * 2 * index) / command.count;
      const x = target?.x ?? this.player.x + Math.cos(angle) * (90 + (index % 3) * 38);
      const y = target?.y ?? this.player.y + Math.sin(angle) * (90 + (index % 3) * 38);
      const seal = createGongfaSigil(this, x, y, sourceGongfaId, command.radius, 0.58).setDepth(4);
      for (let pulse = 0; pulse < command.pulses; pulse += 1) {
        const delay = 180 + pulse * command.pulseDelayMs;
        if (delay > command.lifetimeMs) break;
        this.time.delayedCall(delay, () => {
          if (!seal.active) return;
          seal.setScale(1.08).setAlpha(0.9);
          this.tweens.add({ targets: seal, scale: 1, alpha: 0.58, duration: 150 });
          this.damageEnemiesWithin(x, y, command.radius, command.damage, sourceGongfaId, activationId);
        });
      }
      this.time.delayedCall(command.lifetimeMs, () => {
        if (!seal.active) return;
        this.tweens.add({ targets: seal, alpha: 0, duration: 220, onComplete: () => seal.destroy() });
      });
    }
  }

  private fireAuthoredLineStrike(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-line-strike" }>
  ): void {
    const originX = command.origin === "player" ? this.player.x : command.origin.x;
    const originY = command.origin === "player" ? this.player.y : command.origin.y;
    const active = (this.enemies.getChildren() as Enemy[]).filter((enemy) => enemy.active);
    const aimedTarget = command.aimMode === "strongest"
      ? active.reduce<Enemy | undefined>((best, enemy) =>
          !best || enemy.maxHealth > best.maxHealth ? enemy : best, undefined)
      : this.getNearestEnemies(1)[0];
    const angle = (command.angle ?? (aimedTarget
      ? Phaser.Math.Angle.Between(originX, originY, aimedTarget.x, aimedTarget.y)
      : this.lastAimAngle)) + (command.angleOffset ?? 0);
    const endX = originX + Math.cos(angle) * command.length;
    const endY = originY + Math.sin(angle) * command.length;
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const visual = this.applyGongfaEffectVisualHierarchy(
      this.add.graphics(),
      command.sourceGongfaId
    ).setDepth(12);

    if (command.style === "mist-wraith-crossing") {
      visual.lineStyle(Math.max(2, command.width * 0.34), identity.accent, 0.72);
      const normalX = -Math.sin(angle);
      const normalY = Math.cos(angle);
      for (const offset of [-command.width * 0.28, 0, command.width * 0.28]) {
        visual.beginPath();
        visual.moveTo(originX + normalX * offset, originY + normalY * offset);
        visual.lineTo(
          originX + (endX - originX) * 0.34 - normalX * offset,
          originY + (endY - originY) * 0.34 - normalY * offset
        );
        visual.lineTo(
          originX + (endX - originX) * 0.68 + normalX * offset,
          originY + (endY - originY) * 0.68 + normalY * offset
        );
        visual.lineTo(endX - normalX * offset, endY - normalY * offset);
        visual.strokePath();
      }
    } else {
      visual.lineStyle(Math.max(3, command.width * 0.38), identity.secondary, 0.9);
      visual.lineBetween(originX, originY, endX, endY);
      visual.lineStyle(1, identity.accent, 0.8);
      visual.lineBetween(
        originX - Math.sin(angle) * command.width * 0.5,
        originY + Math.cos(angle) * command.width * 0.5,
        endX,
        endY
      );
      const graveSigil = createGongfaSigil(
        this,
        originX,
        originY,
        command.sourceGongfaId,
        Math.max(12, command.width),
        0.9
      ).setDepth(12).setRotation(angle);
      this.tweens.add({
        targets: graveSigil,
        alpha: 0,
        scale: 1.4,
        duration: 260,
        onComplete: () => graveSigil.destroy()
      });
    }

    const lineX = endX - originX;
    const lineY = endY - originY;
    const lineLengthSquared = Math.max(1, lineX * lineX + lineY * lineY);
    const halfWidth = command.width / 2;
    let hitCount = 0;
    for (const enemy of active) {
      if (command.maxHits !== undefined && hitCount >= command.maxHits) break;
      const targetX = enemy.x - originX;
      const targetY = enemy.y - originY;
      const projection = (targetX * lineX + targetY * lineY) / lineLengthSquared;
      if (projection < 0 || projection > 1) continue;
      const closestX = originX + lineX * projection;
      const closestY = originY + lineY * projection;
      if (Phaser.Math.Distance.Between(closestX, closestY, enemy.x, enemy.y) > halfWidth + 12) continue;
      if (command.slowMultiplier !== undefined && command.slowDurationMs !== undefined) {
        enemy.applySlow(command.slowMultiplier, command.slowDurationMs);
      }
      hitCount += 1;
      if (enemy.receiveDamage(command.damage)) this.resolveEnemyDeath(enemy);
    }

    this.recordGongfaMotif(`${identity.motifId}:${command.style}`);
    this.tweens.add({
      targets: visual,
      alpha: 0,
      duration: command.style === "mist-wraith-crossing" ? 360 : 220,
      onComplete: () => visual.destroy()
    });
  }

  private fireAuthoredBloodCombination(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-blood-combination" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    if (command.asuraActive && command.asuraChoice) {
      this.player.lockRecoveryCeiling(
        command.asuraChoice === "undying-asura" ? 0.3 :
          command.asuraChoice === "world-burning-asura" ? 0.15 : 0.25
      );
    }
    let totalHealthBurned = 0;
    let combinationStayedValid = true;
    const combinationSerial = ++this.bloodCombinationSerial;
    for (let strike = 0; strike < command.strikeCount; strike += 1) {
      this.time.delayedCall(strike * command.staggerMs, () => {
        if (combinationSerial !== this.bloodCombinationSerial) return;
        if (!this.player.active) {
          combinationStayedValid = false;
          return;
        }
        const finisher = strike === command.strikeCount - 1;
        const strikeDamage = command.damage * (finisher ? 1.45 : 0.62);
        const radius = command.radius * (finisher ? 1.18 : 0.86);
        const activeEnemies = (this.enemies.getChildren() as Enemy[]).filter((enemy) => enemy.active);
        const eligibleRange = command.shape === "focused"
          ? radius * 2.5
          : command.shape === "pursuit"
            ? radius + 42
            : radius;
        const hadEligibleTarget = activeEnemies.some((enemy) =>
          Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= eligibleRange + 12
        );
        if (!hadEligibleTarget) {
          combinationStayedValid = false;
          return;
        }
        const costFraction = command.healthCostFractions[strike] ?? 0;
        if (costFraction > 0) {
          const healthCost = this.player.stats.health * costFraction;
          this.player.stats.health = Math.max(1, this.player.stats.health - healthCost);
          totalHealthBurned += healthCost;
          this.spawnDamageNumber(this.player.x, this.player.y - 26, healthCost);
        }
        if (command.shape === "focused") {
          this.fireAuthoredLineStrike({
            kind: "authored-line-strike",
            style: "grave-sword-rise",
            origin: "player",
            aimMode: "strongest",
            damage: strikeDamage * 1.16,
            width: Math.max(12, radius * 0.42),
            length: radius * 2.5,
            sourceGongfaId: command.sourceGongfaId
          });
        } else {
          if (command.shape === "pursuit") {
            const target = (this.enemies.getChildren() as Enemy[])
              .filter((enemy) => enemy.active)
              .sort((a, b) => a.health - b.health)[0];
            if (target) {
              const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
              const distance = Math.min(18, Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y));
              this.player.setPosition(
                this.player.x + Math.cos(angle) * distance,
                this.player.y + Math.sin(angle) * distance
              );
            }
          }
          const armCount = command.shape === "radial" ? 6 : 3;
          const arcs = this.applyGongfaEffectVisualHierarchy(
            this.add.graphics(),
            command.sourceGongfaId
          ).setDepth(12);
          arcs.lineStyle(finisher ? 5 : 3, finisher ? identity.secondary : identity.accent, 0.86);
          for (let arm = 0; arm < armCount; arm += 1) {
            const angle = (Math.PI * 2 * arm) / armCount + strike * 0.32;
            arcs.beginPath();
            arcs.arc(this.player.x, this.player.y, radius, angle - 0.34, angle + 0.34);
            arcs.strokePath();
          }
          this.tweens.add({ targets: arcs, alpha: 0, scale: 1.08, duration: 200, onComplete: () => arcs.destroy() });
          this.damageEnemiesWithin(this.player.x, this.player.y, radius, strikeDamage, command.sourceGongfaId);
        }
        if (finisher && combinationStayedValid) {
          if (command.refundFraction > 0) this.player.heal(totalHealthBurned * command.refundFraction);
          if (command.asuraChoice && !command.asuraActive && this.player.stats.health / this.player.stats.maxHealth < 0.2) {
            const runtime = this.learnedGongfaRuntimes.find((candidate) => candidate.gongfaId === command.sourceGongfaId);
            if (runtime) {
              runtime.authored.phase = 1;
              runtime.authored.activationCount += 1;
            }
            const ceiling = command.asuraChoice === "undying-asura"
              ? 0.3
              : command.asuraChoice === "world-burning-asura"
                ? 0.15
                : 0.25;
            this.player.lockRecoveryCeiling(ceiling);
          }
        }
        this.recordGongfaMotif(`${identity.motifId}:blood-combination:${command.shape}`);
        this.publishHud(this.lastMessage);
      });
    }
  }

  private fireFeatherRainFormation(
    command: Extract<GongfaRuntimeCommand, { kind: "feather-rain-formation" }>
  ): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    const combat = { ...this.combatState };
    const activationId = this.beginSkill2Activation();
    for (let fan = 0; fan < command.fanCount; fan += 1) {
      this.time.delayedCall(fan * command.fanDelayMs, () => {
        const targets = this.getDensestClusterTargets(command.feathersPerFan, 140);
        for (let feather = 0; feather < command.feathersPerFan; feather += 1) {
          const target = targets[feather % targets.length];
          if (!target) break;
          this.spawnProjectileAtTarget(
            target.x + (feather - (command.feathersPerFan - 1) / 2) * 14,
            target.y - 180 - fan * 10,
            target,
            command.damage,
            command.pierce,
            combat.projectileSpeed + 80,
            combat.projectileLifetimeMs,
            combat.projectileTexture,
            combat.tint,
            { sourceGongfaId, skill2ActivationId: activationId }
          );
        }
      });
    }
  }

  private fireSunsetWaveApex(
    command: Extract<GongfaRuntimeCommand, { kind: "sunset-wave-apex" }>
  ): void {
    const activationId = this.beginSkill2Activation();
    const angle = this.getWaveAimAngle("nearest");
    const crossingX = this.player.x + Math.cos(angle) * 180;
    const crossingY = this.player.y + Math.sin(angle) * 180;
    for (let wall = 0; wall < command.wallCount; wall += 1) {
      const side = wall % 2 === 0 ? -1 : 1;
      const startX = this.player.x + Math.cos(angle + Math.PI / 2) * side * command.width;
      const startY = this.player.y + Math.sin(angle + Math.PI / 2) * side * command.width;
      this.spawnWaveProjectile(
        startX,
        startY,
        Phaser.Math.Angle.Between(startX, startY, crossingX, crossingY),
        command.damage,
        command.pierce,
        command.speed * command.speedScale,
        command.lifetimeMs * command.distanceScale,
        command.overlapScale,
        1,
        this.gongfaRuntime?.gongfaId,
        this.combatState.projectileTexture,
        this.combatState.tint,
        activationId
      );
    }
  }

  private fireMirrorNeedleConstellation(
    command: Extract<GongfaRuntimeCommand, { kind: "mirror-needle-constellation" }>
  ): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    const combat = { ...this.combatState };
    const activationId = this.beginSkill2Activation();
    const orbit = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), sourceGongfaId);
    orbit.lineStyle(2, this.combatState.tint, 0.8);
    orbit.strokeCircle(this.player.x, this.player.y, 54);
    for (let needle = 0; needle < command.needleCount; needle += 1) {
      this.time.delayedCall(needle * command.staggerMs, () => {
        const livingTargets = this.getNearestEnemies(command.needleCount);
        const target = livingTargets[needle % Math.max(1, livingTargets.length)];
        if (!target?.active) return;
        const angle = (Math.PI * 2 * needle) / command.needleCount;
        this.spawnProjectileAtTarget(
          this.player.x + Math.cos(angle) * 54,
          this.player.y + Math.sin(angle) * 54,
          target,
          command.damage,
          command.pierce,
          combat.projectileSpeed + 60,
          combat.projectileLifetimeMs,
          combat.projectileTexture,
          combat.tint,
          { sourceGongfaId, skill2ActivationId: activationId }
        );
      });
    }
    this.time.delayedCall(command.needleCount * command.staggerMs + 80, () => orbit.destroy());
  }

  private fireMoonTideVault(
    command: Extract<GongfaRuntimeCommand, { kind: "moon-tide-vault" }>
  ): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    const combat = { ...this.combatState };
    const outwardActivationId = this.beginSkill2Activation();
    this.emitAuraBurst(
      command.damage,
      Math.max(8, Math.floor(command.radius / 20)),
      outwardActivationId,
      combat,
      sourceGongfaId
    );
    this.pushEnemiesAwayFrom(this.player.x, this.player.y, command.radius, command.controlStrength);
    this.time.delayedCall(command.returnDelayMs, () => {
      this.pullEnemiesToward(command.radius, command.controlStrength);
      const returnActivationId = this.beginSkill2Activation();
      this.emitAuraBurst(
        Math.floor(command.damage * 1.25),
        Math.max(8, Math.floor(command.radius / 20)),
        returnActivationId,
        combat,
        sourceGongfaId
      );
    });
  }

  private fireFrozenLotusShell(
    command: Extract<GongfaRuntimeCommand, { kind: "frozen-lotus-shell" }>
  ): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    const combat = { ...this.combatState };
    const activationId = this.beginSkill2Activation();
    const lotus = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), sourceGongfaId);
    lotus.lineStyle(3, combat.tint, 0.9);
    for (let petal = 0; petal < command.petalCount; petal += 1) {
      const angle = (Math.PI * 2 * petal) / command.petalCount;
      lotus.strokeEllipse(
        this.player.x + Math.cos(angle) * command.radius * 0.55,
        this.player.y + Math.sin(angle) * command.radius * 0.55,
        22,
        46
      );
    }
    this.tweens.add({ targets: lotus, angle: 90, duration: command.shatterDelayMs });
    const petalTargets = this.getEnemiesWithinRadius(command.radius).slice(0, command.petalCount);
    for (const enemy of petalTargets) {
      if (sourceGongfaId && this.registerSkill2TargetHit(activationId, enemy.combatTargetId)) {
        this.stokeSkill2Resource(sourceGongfaId);
      }
      if (enemy.receiveDamage(command.damage)) this.resolveEnemyDeath(enemy);
    }
    this.pushEnemiesAwayFrom(this.player.x, this.player.y, command.radius, 190);
    let shattered = false;
    const shatter = () => {
      if (shattered) return;
      shattered = true;
      lotus.destroy();
      const targets = this.getNearestEnemies(command.petalCount);
      for (let petal = 0; petal < command.petalCount; petal += 1) {
        const angle = (Math.PI * 2 * petal) / command.petalCount;
        const x = this.player.x + Math.cos(angle) * command.radius;
        const y = this.player.y + Math.sin(angle) * command.radius;
        const target = targets[petal % targets.length];
        if (target) {
          this.spawnProjectileAtTarget(
            x,
            y,
            target,
            command.damage,
            combat.pierce,
            combat.projectileSpeed + 70,
            combat.projectileLifetimeMs,
            combat.projectileTexture,
            combat.tint,
            { sourceGongfaId, skill2ActivationId: activationId }
          );
        } else {
          this.spawnProjectileAlongAngle(
            x,
            y,
            angle,
            command.damage,
            combat.pierce,
            combat.projectileSpeed + 70,
            combat.projectileLifetimeMs,
            combat.projectileTexture,
            combat.tint,
            { sourceGongfaId, skill2ActivationId: activationId }
          );
        }
      }
    };
    if (petalTargets.length === command.petalCount) shatter();
    else this.time.delayedCall(command.shatterDelayMs, shatter);
  }

  private fireVerdantRootNetwork(
    command: Extract<GongfaRuntimeCommand, { kind: "verdant-root-network" }>
  ): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    const tint = this.combatState.tint;
    for (let pulse = 0; pulse < command.pulseCount; pulse += 1) {
      this.time.delayedCall(pulse * command.pulseDelayMs, () => {
        const linked = this.getNearestEnemies(command.linkCount).filter(
          (enemy) => Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= command.reach
        );
        const vines = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), sourceGongfaId);
        vines.lineStyle(3, tint, 0.75);
        let fromX = this.player.x;
        let fromY = this.player.y;
        linked.forEach((enemy) => {
          vines.lineBetween(fromX, fromY, enemy.x, enemy.y);
          fromX = enemy.x;
          fromY = enemy.y;
          const body = enemy.body as Phaser.Physics.Arcade.Body;
          body.setVelocity(0, 0);
          if (enemy.receiveDamage(command.damage)) this.resolveEnemyDeath(enemy);
        });
        if (linked.length > 0 && sourceGongfaId) {
          this.stokeSkill2Resource(sourceGongfaId);
        }
        this.time.delayedCall(command.pulseDelayMs - 20, () => vines.destroy());
      });
    }
  }

  private fireSproutSunCircle(
    command: Extract<GongfaRuntimeCommand, { kind: "sprout-sun-circle" }>
  ): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    const tint = this.combatState.tint;
    const activationId = this.beginSkill2Activation();
    const originX = this.player.x;
    const originY = this.player.y;
    const circle = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), sourceGongfaId);
    circle.lineStyle(3, tint, 0.85);
    circle.strokeCircle(originX, originY, command.radius);
    for (let pulse = 0; pulse < command.pulseCount; pulse += 1) {
      this.time.delayedCall(pulse * command.pulseDelayMs, () => {
        for (let spoke = 0; spoke < command.spokeCount; spoke += 1) {
          const angle = (Math.PI * 2 * spoke) / command.spokeCount;
          circle.lineBetween(
            originX,
            originY,
            originX + Math.cos(angle) * command.radius,
            originY + Math.sin(angle) * command.radius
          );
        }
        const isFinalBloom = pulse === command.pulseCount - 1;
        this.damageEnemiesWithin(
          originX,
          originY,
          command.radius,
          Math.floor(command.damage * (isFinalBloom ? 1.6 : 1)),
          sourceGongfaId,
          activationId
        );
        if (isFinalBloom) {
          circle.fillStyle(tint, 0.18);
          circle.fillCircle(originX, originY, command.radius);
          this.time.delayedCall(180, () => circle.destroy());
        }
      });
    }
  }

  private fireIronwoodSurgeForm(
    command: Extract<GongfaRuntimeCommand, { kind: "ironwood-surge-form" }>
  ): void {
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
    const activationId = this.beginSkill2Activation();
    const angle = this.getWaveAimAngle("last");
    const originX = this.player.x;
    const originY = this.player.y;
    const travelDurationMs = command.lifetimeMs * command.distanceScale;
    const travelSpeed = command.speed * command.speedScale;
    const maximumRange = (travelSpeed * travelDurationMs) / 1000;
    for (let wave = 0; wave < command.waveCount; wave += 1) {
      const sideways = (wave - (command.waveCount - 1) / 2) * (command.width / command.waveCount);
      this.spawnWaveProjectile(
        originX + Math.cos(angle + Math.PI / 2) * sideways,
        originY + Math.sin(angle + Math.PI / 2) * sideways,
        angle,
        command.damage,
        command.pierce,
        travelSpeed,
        travelDurationMs,
        1.2,
        command.growthScale,
        sourceGongfaId,
        this.combatState.projectileTexture,
        this.combatState.tint,
        activationId
      );
    }
    for (let pulse = 0; pulse < 3; pulse += 1) {
      this.time.delayedCall(pulse * 120, () => {
        this.pushEnemiesAlongLane(
          angle,
          command.width,
          maximumRange,
          command.pushStrength,
          originX,
          originY
        );
      });
    }
    this.time.delayedCall(travelDurationMs, () => {
      for (let shot = 0; shot < command.returnShots; shot += 1) {
        const spread =
          command.returnShots === 1
            ? 0
            : Phaser.Math.Linear(-0.45, 0.45, shot / (command.returnShots - 1));
        this.spawnWaveProjectile(
          originX + Math.cos(angle) * maximumRange,
          originY + Math.sin(angle) * maximumRange,
          angle + Math.PI + spread,
          Math.floor(command.damage * 0.75),
          Math.max(0, command.pierce - 1),
          travelSpeed + 35,
          command.lifetimeMs,
          1,
          1,
          sourceGongfaId,
          this.combatState.projectileTexture,
          this.combatState.tint,
          activationId
        );
      }
    });
  }

  private getDensestClusterTargets(limit: number, radius: number): Enemy[] {
    const active = (this.enemies.getChildren() as Enemy[]).filter((enemy) => enemy.active);
    const center = active.reduce<Enemy | undefined>((best, candidate) => {
      const density = active.filter(
        (enemy) => Phaser.Math.Distance.Between(candidate.x, candidate.y, enemy.x, enemy.y) <= radius
      ).length;
      const bestDensity = best
        ? active.filter((enemy) => Phaser.Math.Distance.Between(best.x, best.y, enemy.x, enemy.y) <= radius).length
        : -1;
      return density > bestDensity ? candidate : best;
    }, undefined);
    if (!center) return [];
    return active
      .sort(
        (a, b) =>
          Phaser.Math.Distance.Between(center.x, center.y, a.x, a.y) -
          Phaser.Math.Distance.Between(center.x, center.y, b.x, b.y)
      )
      .slice(0, limit);
  }

  private damageEnemiesWithin(
    x: number,
    y: number,
    radius: number,
    damage: number,
    sourceGongfaId?: GongfaId,
    skill2ActivationId?: number
  ): void {
    for (const enemy of this.getEnemiesWithinRadiusFrom(x, y, radius)) {
      if (!enemy.active) continue;
      if (
        sourceGongfaId &&
        (!skill2ActivationId ||
          this.registerSkill2TargetHit(skill2ActivationId, enemy.combatTargetId))
      ) {
        this.stokeSkill2Resource(sourceGongfaId);
      }
      if (enemy.receiveDamage(damage)) this.resolveEnemyDeath(enemy);
    }
  }

  private beginSkill2Activation(): number {
    const activationId = this.nextSkill2ActivationId;
    this.nextSkill2ActivationId += 1;
    this.skill2HitTargets.set(activationId, new Set());
    this.time.delayedCall(6000, () => this.skill2HitTargets.delete(activationId));
    return activationId;
  }

  private registerSkill2TargetHit(activationId: number, targetId: number): boolean {
    const targets = this.skill2HitTargets.get(activationId);
    if (!targets || targets.has(targetId)) return false;
    targets.add(targetId);
    return true;
  }

  private stokeSkill2Resource(sourceGongfaId: GongfaId): void {
    const runtime = this.gongfaCollection.byId[sourceGongfaId];
    if (!runtime) return;
    const event = runtime.blazingFeather
      ? ({ kind: "blazing-feather-hit" } as const)
      : runtime.surge
        ? ({ kind: "surge-hit" } as const)
        : undefined;
    if (!event) return;
    const result = advanceGongfaRuntime(runtime, event);
    this.adoptPrimaryRuntime(result.runtime);
    this.restorePrimaryRuntimeAdapter();
  }

  private pushEnemiesAwayFrom(x: number, y: number, radius: number, strength: number): void {
    for (const enemy of this.getEnemiesWithinRadiusFrom(x, y, radius)) {
      const angle = Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y);
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(Math.cos(angle) * strength, Math.sin(angle) * strength);
    }
  }

  private pushEnemiesAlongLane(
    angle: number,
    width: number,
    length: number,
    strength: number,
    originX = this.player.x,
    originY = this.player.y
  ): void {
    const forwardX = Math.cos(angle);
    const forwardY = Math.sin(angle);
    for (const enemy of this.getEnemiesWithinRadiusFrom(originX, originY, length)) {
      const dx = enemy.x - originX;
      const dy = enemy.y - originY;
      const forward = dx * forwardX + dy * forwardY;
      const sideways = Math.abs(dx * -forwardY + dy * forwardX);
      if (forward >= 0 && forward <= length && sideways <= width / 2) {
        const body = enemy.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(forwardX * strength, forwardY * strength);
      }
    }
  }

  private recordMasterySkill2Cast(
    command: GongfaRuntimeCommand,
    runtime = this.gongfaRuntime
  ): void {
    if (!runtime) {
      return;
    }
    const next = recordMasterySkill2Cast(
      {
        masterySkill2CooldownRemaining: runtime.mastery.masterySkill2CooldownRemaining,
        masterySkill2Casts: runtime.mastery.masterySkill2Casts
      },
      command
    );
    runtime.mastery.masterySkill2CooldownRemaining = next.masterySkill2CooldownRemaining;
    runtime.mastery.masterySkill2Casts = next.masterySkill2Casts;
  }

  private fireSolarFlareCycle(
    command: Extract<GongfaRuntimeCommand, { kind: "solar-flare-cycle" }>
  ): void {
    const combat = { ...this.combatState };
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
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
          combat.projectileTexture
        );
        projectile.sourceGongfaId = sourceGongfaId;
        projectile.damage = Math.floor(command.baseDamage * 0.85 * command.damageScale);
        projectile.pierceRemaining = combat.pierce + 1;
        projectile.setTint(combat.tint);
        projectile.setVisualScale(0.9);
        const travelAngle = angle + (Math.PI / 2) * direction;
        projectile.setAngle(Phaser.Math.RadToDeg(travelAngle));
        this.projectiles.add(projectile);
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
          Math.cos(travelAngle) * (combat.projectileSpeed + 35),
          Math.sin(travelAngle) * (combat.projectileSpeed + 35)
        );
        this.time.delayedCall(combat.projectileLifetimeMs + 160, () => {
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
    const combat = { ...this.combatState };
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
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
            command.projectile.scale,
            1,
            sourceGongfaId,
            combat.projectileTexture,
            combat.tint
          );
        }
      });
    }
  }

  private fireReturningSwordFormation(
    command: Extract<GongfaRuntimeCommand, { kind: "returning-sword-formation" }>
  ): void {
    const combat = { ...this.combatState };
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
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
        combat.projectileTexture,
        combat.tint,
        { sourceGongfaId }
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
          combat.projectileTexture,
          combat.tint,
          { sourceGongfaId }
        );
      });
    });
  }

  private fireBladeShellRebound(
    command: Extract<GongfaRuntimeCommand, { kind: "blade-shell-rebound" }>
  ): void {
    this.emitAuraBurst(
      Math.floor(command.baseDamage * 0.82 * command.damageScale),
      command.baseBladeCount + 2 + command.bonusBlades
    );
  }

  private fireBurningRingVolley(
    command: Extract<GongfaRuntimeCommand, { kind: "burning-ring-volley" }>
  ): void {
    const combat = { ...this.combatState };
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
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
          combat.projectileTexture
        );
        projectile.sourceGongfaId = sourceGongfaId;
        projectile.damage = Math.max(
          1,
          Math.floor(combat.damage * (ring === 0 ? 1 : 0.9) * (command.damageScale ?? 1))
        );
        projectile.pierceRemaining = combat.pierce;
        projectile.setTint(combat.tint);
        projectile.setVisualScale(ring === 0 ? 1 : 0.84);
        const travelAngle = angle + direction * (Math.PI / 2);
        projectile.setAngle(Phaser.Math.RadToDeg(travelAngle));
        this.projectiles.add(projectile);
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
          Math.cos(travelAngle) * (combat.projectileSpeed + 50),
          Math.sin(travelAngle) * (combat.projectileSpeed + 50)
        );
        this.time.delayedCall(combat.projectileLifetimeMs + 120, () => {
          if (projectile.active) {
            projectile.destroy();
          }
        });

        // Scattered Ember Orbit: leave a short-lived burning patch in the wake.
        if (command.scatterEmbers && ring === 0) {
          this.spawnEmberPatch(
            this.player.x + Math.cos(angle) * radius,
            this.player.y + Math.sin(angle) * radius,
            combat,
            sourceGongfaId
          );
        }
      }
    }
  }

  private spawnEmberPatch(
    x: number,
    y: number,
    combat: CombatState = this.combatState,
    sourceGongfaId = this.gongfaRuntime?.gongfaId
  ): void {
    const ember = new Projectile(this, x, y, combat.projectileTexture);
    ember.sourceGongfaId = sourceGongfaId;
    ember.damage = Math.max(1, Math.floor(combat.damage * 0.4));
    ember.pierceRemaining = 999;
    ember.setTint(combat.tint);
    ember.setVisualScale(0.7);
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
    sourceGongfaId: GongfaId | undefined,
    x: number,
    y: number,
    damage: number,
    fromEmbed: boolean
  ): void {
    const runtime = sourceGongfaId
      ? this.gongfaCollection.byId[sourceGongfaId]
      : this.gongfaRuntime;
    if (!runtime) {
      return;
    }

    const result = advanceGongfaRuntime(runtime, {
      kind: "crimson-detonation",
      x,
      y,
      damage,
      fromEmbed
    });
    this.adoptPrimaryRuntime(result.runtime);
    this.executeGongfaRuntimeCommands(result.commands, result.runtime);
    this.restorePrimaryRuntimeAdapter();
  }

  private applyCrimsonDetonation(
    command: Extract<GongfaRuntimeCommand, { kind: "crimson-detonation" }>
  ): void {
    const hits = this.getEnemiesWithinRadiusFrom(command.x, command.y, command.radius);
    hits.forEach((enemy) => {
      const died = enemy.receiveDamage(command.splashDamage);
      if (died) {
        this.resolveEnemyDeath(enemy);
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
    this.spawnCrimsonFragments(enemy.x, enemy.y, fragment);
    this.triggerCrimsonDetonation(
      this.gongfaRuntime?.gongfaId,
      enemy.x,
      enemy.y,
      Math.max(sourceDamage, embedPower + embedStacks * 2),
      true
    );
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
    const combat = { ...this.combatState };
    const sourceGongfaId = this.gongfaRuntime?.gongfaId;
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
          combat.projectileTexture,
          combat.tint,
          sourceGongfaId
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
      const packageInfo = getGongfaPackage(id);
      const masterySpeed = getGongfaMasterySpeedLabel(linggen.id, gongfa.id);
      return {
        id: gongfa.id,
        kind: "gongfa",
        gongfaId: gongfa.id,
        title: gongfa.name,
        description: `${gongfa.lore} Mastery Speed: ${masterySpeed}.`,
        playstyle: packageInfo.combatRole,
        gain: packageInfo.skill1.name,
        scope: `${packageInfo.passive.name} · ${packageInfo.passive.resource}`,
        cost: `${masterySpeed} Mastery`
      };
    });

    this.choiceActive = true;
    this.currentChoiceTitle = `${linggen.name} Revealed`;
    this.currentChoiceOptions = options;
    this.showChoicePanel({
      title: this.currentChoiceTitle,
      subtitle: linggen.lore,
      options,
      visualMode: this.runState.mainGongfaId ? "choice" : "linggen-awakening"
    });
    this.publishHud(this.lastMessage);
  }

  private resolveChoice(option: ChoiceOption): void {
    this.sfx.choiceAccept();
    const acceptedJourneyDecision =
      option.kind === "continue" ? this.runState.pendingDecision : undefined;

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
      const result = advanceRunJourney(this.runState, {
        kind: "journey-choice-accepted"
      });
      this.applyRunJourneyState(result.state);
      this.applyJourneyChoiceMessage(acceptedJourneyDecision);
      this.executeRunJourneyCommands(result.commands);
      this.presentAcceptedJourneyDecision(acceptedJourneyDecision);
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

    if (this.runState.pendingDecision) {
      this.offerJourneyChoice();
    }
  }

  private applyGongfaChoice(gongfaId: keyof typeof gongfaConfigs, replaceCurrent = false): void {
    this.runState.revealedLinggen = this.runState.hiddenLinggen;
    if (replaceCurrent || !this.runState.mainGongfaId) {
      this.runState.mainGongfaId = gongfaId;
      this.gongfaCollection = replaceGongfaCollection(gongfaId);
      this.runState.learnedGongfaIds = [];
    }
    if (!this.runState.learnedGongfaIds.includes(gongfaId)) {
      this.runState.learnedGongfaIds.push(gongfaId);
    }
    const learnedSecondaryGongfa = !this.gongfaCollection.byId[gongfaId];
    if (learnedSecondaryGongfa) {
      this.gongfaCollection = learnGongfa(
        this.gongfaCollection,
        gongfaId,
        gongfaId === this.runState.mainGongfaId
      );
      this.gongfaCollection.byId[gongfaId]!.combat.damage += projectFoundationGrowth(
        this.runState.foundationGrowthTransactions
      ).baseDamage;
    }
    this.applyGongfaStage();
    this.playFanfare(0xffe08a);
    this.sfx.breakthrough();
    this.lastMessage = `${gongfaConfigs[gongfaId].name} circulates through your meridians.`;
    this.persistRunCheckpoint();
  }

  private applyMasteryChoice(choiceId: string): void {
    const runtime = this.masteryChoiceRuntime;
    if (!runtime) {
      return;
    }

    const mastery = applyGongfaMasteryChoice(
      {
        masteryLearnedIds: runtime.mastery.masteryLearnedIds,
        masteryChoiceActive: runtime.mastery.masteryChoiceActive,
        masteryPendingRanks: runtime.mastery.masteryPendingRanks
      },
      choiceId
    );
    runtime.mastery.masteryLearnedIds = mastery.masteryLearnedIds;
    runtime.mastery.masteryChoiceActive = mastery.masteryChoiceActive;
    runtime.mastery.masteryPendingRanks = mastery.masteryPendingRanks;
    this.applyMasteryUpgradeEffect(runtime, choiceId);
    this.lastMessage = `${gongfaConfigs[runtime.gongfaId].name} mastery deepens.`;
    this.choiceActive = false;
    this.currentChoiceTitle = undefined;
    this.currentChoiceOptions = [];
    this.setPausedState(false);
    this.scene.get("ui").events.emit("hide-choice-panel");
    this.persistRunCheckpoint();

    if (this.masteryChoiceRuntime) {
      this.offerMasteryChoice();
    }
  }

  private applyMasteryUpgradeEffect(runtime: GongfaRuntime, upgradeId: string): void {
    this.applyImprovementEffect(upgradeId, runtime);
  }

  private migrateLegacyMasteryChoices(applyMigratedEffects: boolean): void {
    for (const gongfaId of this.runState.learnedGongfaIds) {
      const runtime = this.gongfaCollection.byId[gongfaId];
      if (!runtime) continue;
      const migration = migrateLegacyMasteryPendingRanks(runtime.mastery, {
        gongfaId,
        seed: String(this.getRunSeed()),
        finalBossActive: this.runState.finalBossActive
      });
      runtime.mastery = { ...runtime.mastery, ...migration.state };
      if (!applyMigratedEffects) continue;
      migration.automaticRewardIds.forEach((choiceId) => {
        const current = this.gongfaCollection.byId[gongfaId];
        if (current) this.applyMasteryUpgradeEffect(current, choiceId);
      });
    }
    this.restorePrimaryRuntimeAdapter();
  }

  private applyImprovementEffect(upgradeId: string, runtime = this.gongfaRuntime): void {
    if (!runtime) {
      return;
    }

    const result = applyGongfaImprovement(runtime, upgradeId);
    this.gongfaCollection.byId[result.runtime.gongfaId] = result.runtime;
    if (result.runtime.gongfaId === this.gongfaCollection.primaryGongfaId) {
      this.adoptPrimaryRuntime(result.runtime);
    }

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
    const previousStage = this.runState.stage;
    const previousFoundationTransactions = this.runState.foundationGrowthTransactions;
    this.runState.stage = state.stage;
    this.runState.realmPhase = state.realmPhase;
    this.player?.setCultivationPhase(state.realmPhase);
    this.runState.realmProgress = state.realmProgress;
    this.runState.phaseCleanupActive = state.phaseCleanupActive;
    this.runState.foundationGrowthTransactions = state.foundationGrowthTransactions ?? 0;
    this.runState.tribulationActive = state.tribulationActive ?? false;
    const gainedFoundationTransactions =
      this.runState.foundationGrowthTransactions - previousFoundationTransactions;
    if (gainedFoundationTransactions > 0 && this.player) {
      const growth = projectFoundationGrowth(gainedFoundationTransactions);
      this.player.stats.maxHealth += growth.maxHealth;
      this.player.stats.health = Math.min(
        this.player.stats.maxHealth,
        this.player.stats.health + growth.maxHealth
      );
      this.player.stats.moveSpeed += growth.moveSpeed;
      this.player.stats.magnetRadius += growth.magnetRadius;
      if (this.learnedGongfaRuntimes.length === 0) {
        this.combatState.damage += growth.baseDamage;
      } else {
        this.learnedGongfaRuntimes.forEach((runtime) => {
          runtime.combat.damage += growth.baseDamage;
        });
        this.restorePrimaryRuntimeAdapter();
      }
    }
    this.runState.finalBossActive = state.finalBossActive ?? false;
    this.runState.finalBossPhaseIndex = state.finalBossPhaseIndex ?? 0;
    this.runState.gameOver = state.gameOver ?? false;
    if (previousStage !== state.stage) {
      this.arenaPresentation?.applyStage(state.stage);
      this.sfx.setAmbience(state.stage);
    }
    this.runState.pendingDecision = state.pendingDecision;
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
      this.lastMessage = `${stageConfigs[this.runState.stage].name} Tribulation begins.`;
    }
  }

  private presentAcceptedJourneyDecision(decision: RunJourneyDecision): void {
    if (decision.kind === "phase-transition") {
      const phaseNames = {
        zhongqi: "Zhongqi",
        houqi: "Houqi",
        dayuanman: "Dayuanman"
      } as const;
      this.sfx.phaseTransition();
      this.flashCamera(160, 92, 180, 184);
      this.scene.get("ui").events.emit("show-journey-presentation", {
        kind: "phase",
        eyebrow: "FOUNDATION SETTLES",
        title: phaseNames[decision.nextPhase],
        subtitle: `${stageConfigs[this.runState.stage].name} pressure deepens without breaking the flow.`,
        accent: 0x79d7c8
      });
      return;
    }

    if (decision.kind === "tribulation") {
      const boss = getStageTribulationBoss(decision.stage as Exclude<StageId, "yuanying">);
      this.flashCamera(180, 190, 208, 255);
      this.shakeCamera(180, 0.003);
      this.scene.get("ui").events.emit("show-journey-presentation", {
        kind: "tribulation",
        eyebrow: `${stageConfigs[this.runState.stage].name.toUpperCase()} TIANJIE · BOSS`,
        title: boss.name,
        subtitle: boss.subtitle,
        accent: boss.auraColor
      });
    }
  }

  private startStageTribulation(stage: Exclude<StageId, "yuanying">): void {
    this.forceClearEnemies();
    const profile = getStageTribulationBoss(stage);
    this.spawnTribulationBossEncounter(
      profile,
      new Phaser.Math.Vector2(this.player.x, this.player.y)
    );
    this.lastMessage = `${stageConfigs[stage].name} Tribulation: defeat ${profile.name}.`;
    this.publishHud(this.lastMessage);
  }

  private maybeCompleteTribulation(): void {
    if (!this.runState.tribulationActive || !this.activeTribulationBoss) {
      return;
    }
    if (this.activeTribulationBoss.active) {
      return;
    }
    this.clearTribulationBossEncounter();
    const result = advanceRunJourney(this.runState, { kind: "tribulation-cleared" });
    this.applyRunJourneyState(result.state);
    this.executeRunJourneyCommands(result.commands);
  }

  private executeRunJourneyCommands(commands: RunJourneyCommand[]): void {
    commands.forEach((command) => {
      if (command.kind === "persist-checkpoint") {
        this.persistRunCheckpoint();
        return;
      }

      if (command.kind === "present-journey-choice") {
        this.offerJourneyChoice();
        return;
      }

      if (command.kind === "present-phase-milestone") {
        this.sfx.phaseTransition();
        this.flashCamera(140, 92, 180, 184);
        const nextPhaseLabel = getRealmProgressPresentation(command.nextPhase, 0).phaseLabel;
        this.lastMessage = `Foundation settles into ${nextPhaseLabel}.`;
        this.scene.get("ui").events.emit("show-phase-milestone", command);
        this.publishHud(this.lastMessage);
        return;
      }

      if (command.kind === "start-final-boss") {
        this.startYuanyingTribulation(command.phaseIndex);
        return;
      }

      if (command.kind === "start-tribulation") {
        this.startStageTribulation(command.stage);
        return;
      }

      if (command.kind === "present-stage-breakthrough") {
        this.sfx.breakthrough();
        this.flashCamera(260, 215, 185, 109);
        this.lastMessage = `${stageConfigs[command.nextStage].name} Chuqi begins.`;
        this.scene.get("ui").events.emit("show-journey-presentation", {
          kind: "breakthrough",
          eyebrow: "TRIBULATION CLEARED",
          title: stageConfigs[command.nextStage].name,
          subtitle: `Foundation Growth: +1 damage · +8 max HP · +3 movement · +8 orb radius.`,
          accent: 0xd7b96d
        });
        this.offerGongfaChoice();
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
    this.adoptPrimaryRuntime(result.runtime);
  }

  private applyGongfaStage(restoredRuntime?: GongfaRuntime): void {
    const gongfaId = this.runState.mainGongfaId;
    if (!gongfaId) {
      return;
    }

    if (restoredRuntime) {
      this.gongfaCollection.byId[gongfaId] = restoredRuntime;
    }
    this.gongfaRuntime = this.gongfaCollection.byId[gongfaId] ?? createGongfaRuntime({ gongfaId });
    this.gongfaCollection.byId[gongfaId] = this.gongfaRuntime;
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
    this.runState.learnedGongfaIds = [...checkpoint.learnedGongfaIds];
    this.gongfaCollection = restoreGongfaCollection({
      primaryGongfaId: checkpoint.mainGongfaId,
      learnedGongfaIds: this.runState.learnedGongfaIds,
      gongfaRuntimes: checkpoint.gongfaRuntimes,
      gongfaMasteries: checkpoint.gongfaMasteries,
      legacyPrimary: {
        ...checkpoint,
        upgradeSelectionIds: checkpoint.upgradeSelectionIds ?? []
      }
    });
    this.runState.spiritTreasureIds = [...(checkpoint.spiritTreasureIds ?? [])];
    this.runState.spiritTreasureAttunements = checkpoint.spiritTreasureAttunements
      ? checkpoint.spiritTreasureAttunements.map((entry) => ({ ...entry }))
      : this.runState.spiritTreasureIds.map((id) => ({ id, rank: 1 }));
    // The restored player stats already include treasure bonuses, so seed the
    // applied-effects baseline instead of re-applying (which would double-count).
    this.appliedSpiritTreasureEffects = projectSpiritTreasureState(
      this.runState.spiritTreasureAttunements
    ).effects;
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

    const gongfaPersistence = projectGongfaCollectionPersistence(this.gongfaCollection);
    const checkpoint = createActiveRunCheckpoint({
      playerHealth: this.player?.stats.health,
      playerMaxHealth: this.player?.stats.maxHealth,
      playerMoveSpeed: this.player?.stats.moveSpeed,
      playerMagnetRadius: this.player?.stats.magnetRadius,
      playerDamageReduction: this.player?.stats.damageReduction,
      foundationGrowthAppliedTransactions:
        this.runState.foundationGrowthTransactions,
      ...projectRunJourneyCheckpointFields(this.runState),
      ...gongfaPersistence,
      learnedGongfaIds: this.runState.learnedGongfaIds,
      spiritTreasureIds: this.runState.spiritTreasureIds,
      spiritTreasureAttunements: this.runState.spiritTreasureAttunements,
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

  private applyLegacyFoundationGrowthMigration(): void {
    const checkpoint = this.activeRunSave?.checkpoint;
    if (!checkpoint) return;
    const missingTransactions = Math.max(
      0,
      this.runState.foundationGrowthTransactions -
        (checkpoint.foundationGrowthAppliedTransactions ?? 0)
    );
    if (missingTransactions === 0) return;
    const growth = projectFoundationGrowth(missingTransactions);
    this.player.stats.maxHealth += growth.maxHealth;
    this.player.stats.health = Math.min(
      this.player.stats.maxHealth,
      this.player.stats.health + growth.maxHealth
    );
    this.player.stats.moveSpeed += growth.moveSpeed;
    this.player.stats.magnetRadius += growth.magnetRadius;
    this.learnedGongfaRuntimes.forEach((runtime) => {
      runtime.combat.damage += growth.baseDamage;
    });
    this.restorePrimaryRuntimeAdapter();
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
    if (this.runState.gameOver) {
      return;
    }

    this.shakeCamera(280, 0.013);
    this.sfx.death();
    const result = advanceRunJourney(this.runState, { kind: "player-died" });
    this.applyRunJourneyState(result.state);
    this.player.presentDefeat();
    this.physics.world.isPaused = true;
    this.player.move(new Phaser.Math.Vector2(0, 0));
    this.lastMessage = message;
    this.clearActiveRunSave();
    this.publishHud(message);
    this.time.delayedCall(1_200, () => this.returnToTitle(false));
  }

  private publishHud(message?: string): void {
    const gongfaView = projectGongfaRuntimeView(this.gongfaRuntime);
    const boss = this.getActiveTribulationBossSnapshot();
    this.registry.set("hud", {
      health: this.player?.stats.health ?? 100,
      maxHealth: this.player?.stats.maxHealth ?? 100,
      realmPhase: this.runState.realmPhase,
      realmProgress: this.runState.realmProgress,
      stageBreakthroughReady: this.runState.realmProgress >= 100,
      foundationGrowthTransactions: this.runState.foundationGrowthTransactions,
      masteryPoints: this.primaryMastery.masteryPoints,
      masteryProgress: getMasteryProgressWithinRank(
        this.primaryMastery.masteryPoints,
        this.primaryMastery.masteryRank
      ),
      masteryRank: this.primaryMastery.masteryRank,
      masterySkill2: this.primaryMastery.masterySkill2Id,
      masterySkill2Casts: this.primaryMastery.masterySkill2Casts,
      masteryFullyMastered: this.primaryMasteryFullyMastered,
      gongfaPaths: this.gongfaPathsHudLine,
      gongfaCodexPaths: this.learnedGongfaRuntimes.map((runtime) => ({
        gongfaId: runtime.gongfaId,
        rank: runtime.mastery.masteryRank,
        skill2Unlocked: Boolean(runtime.mastery.masterySkill2Id),
        fullyMastered: this.summarizeGongfaMastery(runtime).fullyMastered,
        learnedMasteryIds: [...runtime.mastery.masteryLearnedIds],
        pendingRanks: [...runtime.mastery.masteryPendingRanks]
      })),
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
      realmIdentityLabel: ARENA_VARIANTS[this.runState.stage].identityLabel,
      realmAccent: ARENA_VARIANTS[this.runState.stage].primary,
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
      boss,
      message: message ?? this.lastMessage
    });
  }

  getTestSnapshot(): GameSnapshot {
    const gongfaView = projectGongfaRuntimeView(this.gongfaRuntime);
    const boss = this.getActiveTribulationBossSnapshot();
    return {
      sceneName: this.scene.key,
      activeScenes: this.scene.manager.getScenes(true).map((scene) => scene.scene.key),
      paused: this.runState.paused,
      message: this.lastMessage,
      audio: this.sfx.getSnapshot(),
      hud: {
        lines: buildHudLines({
          stageName: stageConfigs[this.runState.stage].name,
      realmPhase: this.runState.realmPhase,
      realmProgress: this.runState.realmProgress,
      stageBreakthroughReady: this.runState.realmProgress >= 100,
      foundationGrowthTransactions: this.runState.foundationGrowthTransactions,
          masteryRank: this.primaryMastery.masteryRank,
          masteryProgress: getMasteryProgressWithinRank(
            this.primaryMastery.masteryPoints,
            this.primaryMastery.masteryRank
          ),
          masterySkill2: this.primaryMastery.masterySkill2Id,
          masterySkill2Casts: this.primaryMastery.masterySkill2Casts,
          masteryFullyMastered: this.primaryMasteryFullyMastered,
          gongfaPaths: this.gongfaPathsHudLine,
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
      encounter: {
        pressure: this.getEncounterPressure(),
        tribulationActive: this.runState.tribulationActive ?? false,
        boss
      },
      player: {
        x: this.player?.x ?? 0,
        y: this.player?.y ?? 0,
        health: this.player?.stats.health ?? 0,
        maxHealth: this.player?.stats.maxHealth ?? 0,
        moveSpeed: this.player?.stats.moveSpeed ?? 0,
        magnetRadius: this.player?.stats.magnetRadius ?? 0,
        evade: this.evade.state,
        visual: this.player?.getVisualSnapshot() ?? {
          mode: "idle",
          facing: "east",
          animationKey: "",
          activeVfx: [],
          cultivationPhase: "chuqi",
          phaseRegalia: "qi-knot",
          phaseAuraColor: 0x64c9a7,
          phaseRingCount: 1,
          phaseOrbitingMotes: 0
        }
      },
      visuals: {
        gongfaMotifs: [...this.recentGongfaMotifs],
        enemies: ((this.enemies?.getChildren() as Enemy[] | undefined) ?? [])
          .filter((enemy) => enemy.scene)
          .map((enemy) => enemy.getVisualSnapshot()),
        projectiles: ((this.projectiles?.getChildren() as Projectile[] | undefined) ?? [])
          .filter((projectile) => projectile.active)
          .map((projectile) => projectile.getVisualSnapshot()),
        projectileImpacts: [...this.activeProjectileImpacts]
          .filter((impact) => impact.active)
          .map((impact) => impact.anims.currentAnim?.key ?? "")
          .filter(Boolean),
        pickups: {
          qiOrbs: ((this.orbs?.getChildren() as QiOrb[] | undefined) ?? []).map((orb) =>
            orb.getVisualSnapshot()
          ),
          healingPills: ((this.healingPills?.getChildren() as HealingPill[] | undefined) ?? []).map(
            (pill) => pill.getVisualSnapshot()
          ),
          spiritTreasures: (
            (this.spiritTreasures?.getChildren() as SpiritTreasure[] | undefined) ?? []
          ).map((treasure) => treasure.getVisualSnapshot()),
          collectionEffects: [...this.activePickupEffects]
            .filter((effect) => effect.active)
            .map((effect) => effect.anims.currentAnim?.key ?? "")
            .filter(Boolean),
          collectionEffectTints: [...this.activePickupEffects]
            .filter((effect) => effect.active)
            .map((effect) => effect.tintTopLeft)
        },
        lingcao: (() => {
          const lingcao = (
            (this.lingcaoGroup?.getChildren() as Lingcao[] | undefined) ?? []
          ).find((candidate) => candidate.active);
          return {
            ...(lingcao?.getVisualSnapshot() ?? {
              textureKey: "",
              animationKey: "",
              state: "idle",
              markerTitle: "",
              collisionCenterOffsetX: 0,
              collisionCenterOffsetY: 0
            }),
            collectionEffects: [...this.activeLingcaoEffects]
              .filter((effect) => effect.active)
              .map((effect) => effect.anims.currentAnim?.key ?? "")
              .filter(Boolean)
          };
        })(),
        arena: {
          floorTextureKey: this.arenaFloor?.texture.key ?? "",
          decorationCount: this.arenaDecorationCount,
          ...(this.arenaPresentation?.getSnapshot() ?? {
            variantId: "",
            atmosphere: "",
            identityLabel: "",
            accent: 0,
            atmosphereMoteCount: 0,
            atmosphereAnimated: false
          })
        }
      },
      progression: {
        stage: this.runState.stage,
        realmPhase: this.runState.realmPhase,
        realmProgress: this.runState.realmProgress,
        stageBreakthroughReady: this.runState.realmProgress >= 100,
        foundationGrowthTransactions: this.runState.foundationGrowthTransactions,
        foundationGrowth: projectFoundationGrowth(
          this.runState.foundationGrowthTransactions
        ),
        masteryPoints: this.primaryMastery.masteryPoints,
        masteryProgress: getMasteryProgressWithinRank(
          this.primaryMastery.masteryPoints,
          this.primaryMastery.masteryRank
        ),
        masteryRank: this.primaryMastery.masteryRank,
        masterySkill2: this.primaryMastery.masterySkill2Id,
        masterySkill2Casts: this.primaryMastery.masterySkill2Casts,
        gongfaMasteries: this.gongfaMasteries,
        gongfaCombats: this.learnedGongfaRuntimes.map((runtime) => ({
          gongfaId: runtime.gongfaId,
          damage: runtime.combat.damage,
          count: runtime.combat.count,
          cooldownMs: runtime.combat.cooldownMs,
          passiveStacks: runtime.surge?.stacks ?? runtime.blazingFeather?.emberStacks ?? 0,
          passiveDamageBonus: runtime.surge?.appliedDamageBonus ??
            runtime.blazingFeather?.emberAppliedDamageBonus ?? 0,
          passiveStackGain: runtime.mastery.masteryLearnedIds.some((id) =>
            SURGE_CASCADE_IDS.has(id) || id === "ember-cascade"
          ) ? 2 : 1,
          skill2Id: runtime.mastery.masterySkill2Id,
          skill2Casts: runtime.mastery.masterySkill2Casts
        })),
        learnedGongfaIds: [...this.runState.learnedGongfaIds],
        spiritTreasureIds: [...this.runState.spiritTreasureIds],
        spiritTreasureAttunements: this.runState.spiritTreasureAttunements.map((entry) => ({
          ...entry
        })),
        spiritTreasureSignatures: projectSpiritTreasureState(
          this.runState.spiritTreasureAttunements
        ).signatures,
        spiritTreasureResonances: projectSpiritTreasureState(
          this.runState.spiritTreasureAttunements
        ).resonances,
        spiritTreasureResonanceModifiers: this.getSpiritTreasureResonanceModifiers(),
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
        finalBossPhaseIndex: this.runState.finalBossPhaseIndex,
        kills: this.runState.kills
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
        projectileSourceGongfaIds: Array.from(
          new Set(
            ((this.projectiles?.getChildren() as Projectile[] | undefined) ?? [])
              .filter((projectile) => projectile.active && projectile.sourceGongfaId)
              .map((projectile) => projectile.sourceGongfaId!)
          )
        ),
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
        }, {}),
        enemyPositions: ((this.enemies?.getChildren() as Enemy[] | undefined) ?? [])
          .filter((enemy) => enemy.active)
          .map((enemy) => ({
            id: enemy.config.id,
            x: enemy.x,
            y: enemy.y
          }))
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

  forceEquipGongfa(gongfaId: GongfaId): void {
    this.applyGongfaChoice(gongfaId, true);
    this.publishHud(this.lastMessage);
  }

  forceSpawnEnemy(enemyId: EnemyId): void {
    const index = this.enemies.countActive(true);
    const column = index % 4;
    const row = Math.floor(index / 4);
    this.spawner.spawnManual(
      enemyId,
      this.player.x + 110 + column * 82,
      this.player.y - 72 + row * 118
    );
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

  forceDamageEnemy(enemyId: EnemyId, amount: number): void {
    const enemy = (this.enemies.getChildren() as Enemy[]).find(
      (candidate) => candidate.active && candidate.config.id === enemyId
    );
    if (!enemy) return;
    if (enemy.receiveDamage(amount)) this.resolveEnemyDeath(enemy);
  }

  forceDamageBoss(amount: number): void {
    const boss = this.activeTribulationBoss;
    if (!boss?.active || amount <= 0) return;
    if (boss.receiveDamage(amount)) this.resolveEnemyDeath(boss);
    this.publishHud(this.lastMessage);
  }

  forceTriggerTribulationBossSlam(): void {
    const profile = this.activeTribulationBossProfile;
    if (!profile || !this.activeTribulationBoss?.active) return;
    this.telegraphTribulationSlam(profile);
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

  forceSpawnPickupShowcase(): void {
    this.spawnOrb(this.player.x - 108, this.player.y - 48, 1);
    this.spawnHealingPill(this.player.x - 72, this.player.y + 62, 30);

    (Object.keys(SPIRIT_TREASURE_TINTS) as SpiritTreasureId[]).forEach(
      (treasureId, index) => {
        const column = index % 3;
        const row = Math.floor(index / 3);
        this.spawnSpiritTreasure(
          treasureId,
          this.player.x + 48 + column * 66,
          this.player.y - 58 + row * 112
        );
      }
    );

    this.publishHud(this.lastMessage);
  }

  forceClaimLingcao(): void {
    const lingcao = (this.lingcaoGroup?.getChildren() as Lingcao[] | undefined)?.find(
      (item) => item.active
    );
    if (lingcao) {
      this.collectLingcao(lingcao);
    }
    this.publishHud(this.lastMessage);
  }

  private getRunSeed(): number {
    return this.activeRunSave?.seed ?? 0;
  }

  private applyIncomingDamage(amount: number): void {
    if (this.evade.state.invulnerable) {
      return;
    }

    this.shakeCamera(110, 0.005);

    const resonanceModifiers = this.getSpiritTreasureResonanceModifiers();
    const guardWasActive = this.bulwarkGuardRemainingMs > 0;
    let finalDamage = Math.max(
      1,
      Math.floor(amount * (guardWasActive ? resonanceModifiers.bulwarkGuardMultiplier : 1))
    );
    for (const runtime of this.learnedGongfaRuntimes) {
      const result = advanceGongfaRuntime(runtime, {
        kind: "incoming-damage",
        amount: finalDamage
      });
      this.adoptPrimaryRuntime(result.runtime);
      const damageCommand = result.commands.find(
        (command): command is Extract<GongfaRuntimeCommand, { kind: "incoming-damage" }> =>
          command.kind === "incoming-damage"
      );
      finalDamage = damageCommand?.finalDamage ?? finalDamage;
      this.executeGongfaRuntimeCommands(
        result.commands.filter((command) => command.kind !== "incoming-damage"),
        result.runtime
      );
    }
    this.restorePrimaryRuntimeAdapter();
    this.player.applyDamage(finalDamage);
    if (
      resonanceModifiers.emergencyHealFraction > 0 &&
      this.vitalityEmergencyCooldownMs <= 0 &&
      this.player.stats.health > 0 &&
      this.player.stats.health <= this.player.stats.maxHealth * 0.3
    ) {
      this.player.heal(
        this.player.stats.maxHealth * resonanceModifiers.emergencyHealFraction
      );
      this.vitalityEmergencyCooldownMs = 30_000;
      this.spawnPickupBurst(this.player.x, this.player.y, 0x8ff0b2, 108);
    }
    if (
      !guardWasActive &&
      resonanceModifiers.bulwarkGuardMultiplier < 1 &&
      amount >= 15
    ) {
      this.bulwarkGuardRemainingMs = 2_000;
    }
    this.persistRunCheckpoint();
  }

  private advanceMasteryProgress(points: number): void {
    const primaryGongfaId = this.gongfaCollection.primaryGongfaId;
    if (!primaryGongfaId || points <= 0) {
      return;
    }

    const result = advanceGongfaCollectionMastery(this.gongfaCollection, {
      points: (gongfaId) =>
        points * getGongfaMasteryEfficiency(this.runState.hiddenLinggen.id, gongfaId),
      finalBossActive: this.runState.finalBossActive,
      seed: String(this.getRunSeed())
    });
    this.gongfaCollection = result.runtime;
    result.automaticRewards.forEach(({ gongfaId, choiceId }) => {
      const runtime = this.gongfaCollection.byId[gongfaId];
      if (runtime) {
        this.applyMasteryUpgradeEffect(runtime, choiceId);
      }
    });
    this.restorePrimaryRuntimeAdapter();
    this.gongfaRuntime = this.gongfaCollection.byId[primaryGongfaId];
    if (this.gongfaRuntime) {
      this.combatState = this.gongfaRuntime.combat;
    }

    const rankUp = result.rankUps[0];
    if (!rankUp) {
      return;
    }

    this.playFanfare(0x8ec5ff);
    this.sfx.rankUp();
    this.lastMessage = formatMasteryRankUpMessage(
      gongfaConfigs[rankUp.gongfaId].name,
      rankUp.targetRank
    );
    if (result.automaticRewards.length > 0) {
      const integrated = result.automaticRewards.map(({ choiceId }) => {
        const definition = getMasteryChoiceDefinition(choiceId);
        return definition ? `${definition.name} — ${definition.lore}` : choiceId;
      });
      this.lastMessage += ` Integrated automatically without interrupting combat: ${integrated.join("; ")}.`;
    }

    if (this.masteryChoiceRuntime) {
      this.offerMasteryChoice();
    }

    this.persistRunCheckpoint();
  }

  private grantQi(amount: number): void {
    if (amount <= 0) {
      return;
    }

    const gain = getCultivationProgressGain(
      this.runState.stage,
      amount,
      this.runState.hiddenLinggen.efficiency
    );
    this.advanceRealmProgress(gain.realm);
    this.advanceMasteryProgress(gain.mastery);
  }

  private offerMasteryChoice(): void {
    const runtime = this.masteryChoiceRuntime;
    if (!runtime) {
      return;
    }

    const rank = runtime.mastery.masteryPendingRanks[0] ?? runtime.mastery.masteryRank;
    const options = getDeterministicMasteryChoiceIds({
      gongfaId: runtime.gongfaId,
      rank,
      seed: String(this.getRunSeed()),
      learnedIds: runtime.mastery.masteryLearnedIds
    }).map<ChoiceOption>((id) => {
      const definition = getMasteryChoiceDefinition(id);
      return {
        id,
        kind: "mastery",
        gongfaId: runtime.gongfaId,
        title: definition?.name ?? id,
        description: definition?.playstyle
          ? `${definition.gain === definition.lore ? "" : `${definition.lore} · `}Gain: ${definition.gain} · Cost: ${definition.cost} · Treasure: ${definition.treasureInteraction}`
          : definition?.lore ?? "A deterministic mastery refinement.",
        playstyle: definition?.playstyle,
        gain: definition?.gain,
        cost: definition?.cost,
        scope: definition?.scope,
        treasureInteraction: definition?.treasureInteraction
      };
    });

    if (options.length === 0) {
      return;
    }

    this.choiceActive = true;
    runtime.mastery.masteryChoiceActive = true;
    this.currentChoiceTitle = `${gongfaConfigs[runtime.gongfaId].name} Mastery Rank ${rank}`;
    this.currentChoiceOptions = options;
    this.showChoicePanel({
      title: this.currentChoiceTitle,
      subtitle: getMasteryChoiceDefinition(options[0].id)?.kind === "transformation"
        ? "Choose one permanent Transformation. The other two paths close."
        : "Choose one refinement for the current Gongfa rank.",
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
    if (!this.runState.phaseCleanupActive || this.runState.gameOver) {
      return;
    }

    if (this.runState.pendingDecision) {
      if (this.runState.pendingDecision.kind === "phase-transition") {
        const result = advanceRunJourney(this.runState, { kind: "cleanup-finished" });
        this.applyRunJourneyState(result.state);
        this.executeRunJourneyCommands(result.commands);
        return;
      }
      this.offerJourneyChoice();
      return;
    }

    if (this.runState.finalBossActive) {
      if (this.masteryChoiceRuntime) {
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

  private reportFinalBossPhaseCleared(): void {
    this.clearTribulationBossEncounter();
    const result = advanceRunJourney(this.runState, {
      kind: "final-boss-phase-cleared"
    });
    this.applyRunJourneyState(result.state);
    this.executeRunJourneyCommands(result.commands);
  }

  private getActiveTribulationBossSnapshot(): GameSnapshot["encounter"]["boss"] {
    const boss = this.activeTribulationBoss;
    const profile = this.activeTribulationBossProfile;
    if (!boss?.active || !profile) return undefined;
    return {
      id: profile.id,
      name: profile.name,
      health: Math.max(0, boss.health),
      maxHealth: boss.maxHealth,
      healthRatio: boss.maxHealth > 0 ? Math.max(0, boss.health / boss.maxHealth) : 0,
      enraged: boss.isEnraged,
      phaseLabel: this.runState.finalBossActive
        ? `HEAVENLY TRIBULATION ${this.runState.finalBossPhaseIndex + 1}/3`
        : `${stageConfigs[this.runState.stage].name.toUpperCase()} TIANJIE`,
      activeHazards: this.activeBossHazards.size
    };
  }

  private offerJourneyChoice(): void {
    const decision = this.runState.pendingDecision;
    if (!decision || this.choiceActive) {
      return;
    }

    this.choiceActive = true;
    this.currentChoiceTitle = this.getJourneyChoiceTitle(decision);
    this.currentChoiceOptions = this.getJourneyChoiceOptions(decision);
    this.showChoicePanel({
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
      const boss = getStageTribulationBoss(decision.stage as Exclude<StageId, "yuanying">);
      return `${stageConfigs[decision.stage].name} Dayuanman clears. ${boss.name} descends.`;
    }

    if (decision.kind === "yuanying-tribulation") {
      return "Dayuanman clears. Cloudbreak Summit answers with thunder.";
    }

    const phase = getFinalBossPhasePresentation(this.runState.finalBossPhaseIndex);
    return `${phase.name} clears. The tribulation deepens.`;
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
      const destination = getStageBreakthroughDestination(decision.stage);
      if (!destination) {
        return [];
      }
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

    const nextPhaseName = getFinalBossPhasePresentation(decision.nextPhaseIndex).name;
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
    this.clearTribulationBossEncounter();
    this.finalBossWaveAccumulator = 0;
    this.finalBossHazardAccumulator = 0;
    this.finalBossPhaseSpawned = false;
    this.finalBossSafeZoneX = this.player.x;
    this.finalBossSafeZoneY = this.player.y;
    this.finalBossSafeZoneRadius = 220;
    this.lastMessage = "Lightning judgment descends over Cloudbreak Summit.";
    this.presentTribulationPhase(phaseIndex);
  }

  private advanceFinalBossPhase(phaseIndex: number): void {
    this.clearTribulationBossEncounter();
    // Each celestial form is a discrete boss round. Recover part of the damage
    // between forms so the sequence tests three mechanics instead of silently
    // carrying one unavoidable contact mistake into a later instant death.
    this.player.heal(this.player.stats.maxHealth * 0.35);
    this.spawnPickupBurst(this.player.x, this.player.y, 0xaeeaff, 96);
    this.finalBossWaveAccumulator = 0;
    this.finalBossHazardAccumulator = 0;
    this.finalBossPhaseSpawned = false;
    this.finalBossSafeZoneX = this.player.x;
    this.finalBossSafeZoneY = this.player.y;
    this.finalBossSafeZoneRadius = Math.max(120, 220 - phaseIndex * 40);
    const phase = getFinalBossPhasePresentation(phaseIndex);
    this.lastMessage = `${phase.name} begins.`;
    this.presentTribulationPhase(phaseIndex);
  }

  private presentTribulationPhase(phaseIndex: number): void {
    const phase = getFinalBossPhasePresentation(phaseIndex);
    this.sfx.tribulation();
    this.flashCamera(240, 116, 102, 210);
    this.shakeCamera(300, 0.006 + phaseIndex * 0.0015);
    this.scene.get("ui").events.emit("show-journey-presentation", {
      kind: "tribulation",
      eyebrow: `HEAVENLY TRIBULATION · ${phaseIndex + 1}/3`,
      title: phase.name,
      subtitle: phase.subtitle,
      accent: 0xa993ef
    });
  }

  private completeFinalBossVictory(): void {
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
    this.flashCamera(420, 255, 222, 138);
    this.scene.get("ui").events.emit("show-journey-presentation", {
      kind: "victory",
      eyebrow: "HEAVENLY TRIBULATION BROKEN",
      title: "Ascendant",
      subtitle: "The Yuanying Cultivator stands beyond the storm.",
      accent: 0xffdf8a
    });
    this.showChoicePanel({
      title: this.currentChoiceTitle,
      subtitle: "A permanent completion record has been written.",
      options: this.currentChoiceOptions
    });
    this.sfx.victory();
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

  private showChoicePanel(payload: ChoicePayload): void {
    this.setPausedState(true);
    this.sfx.choiceOpen();
    this.scene.get("ui").events.emit("show-choice-panel", payload);
  }

}
