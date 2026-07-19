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
  private readonly rootInfectionMarkers = new Map<number, Phaser.GameObjects.Graphics>();
  private blackTideCompassMarker?: Phaser.GameObjects.Graphics;
  private blackTideCompassSignature = "";
  private vermilionBirdMarker?: Phaser.GameObjects.Graphics;
  private readonly myriadBeastMarkers = new Map<string, Phaser.GameObjects.Graphics>();
  private readonly myriadBeastAssistMarkers = new Map<number, Phaser.GameObjects.Graphics>();
  private heavenfallBodyMarker?: Phaser.GameObjects.Graphics;
  private moonfallMarker?: Phaser.GameObjects.Graphics;
  private readonly moonfallVelocityRecord = new Map<number, { x: number; y: number }>();
  private verdantGlyphMarker?: Phaser.GameObjects.Graphics;
  private burningCoronaMarker?: Phaser.GameObjects.Graphics;
  private readonly burningSunspotEntrants = new Set<number>();
  private iceMirrorMarker?: Phaser.GameObjects.Graphics;
  private gengjinBraceMarker?: Phaser.GameObjects.Graphics;
  private ironwoodRampartMarker?: Phaser.GameObjects.Graphics;
  private crimsonFurnaceNetworkMarker?: Phaser.GameObjects.Graphics;
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

  private get gongfaMechanicStatus(): string | undefined {
    const primaryId = this.gongfaCollection.primaryGongfaId;
    const runtime = primaryId ? this.gongfaCollection.byId[primaryId] : undefined;
    if (!runtime) return undefined;
    if (runtime.gongfaId === "black-tide-scripture") {
      const phases = ["Ebb", "Still", "Flood"] as const;
      const directions = ["East", "South", "West", "North"] as const;
      const phase = phases[runtime.authored.phase] ?? "Ebb";
      const next = phases[(runtime.authored.phase + 1) % 3] ?? "Still";
      const direction = directions[Math.floor(runtime.authored.secondaryResource)] ?? "East";
      const lockRemaining = runtime.authored.targetLedger[-99] ?? 0;
      if (lockRemaining > 0) {
        return `Tide: Deluge locked · ${direction} · Drain ${Math.ceil(lockRemaining / 100) / 10}s`;
      }
      return `Tide: ${phase} → ${next} · ${direction} · ${Math.floor(runtime.authored.resource * 100)}% · Cycles ${Math.min(3, runtime.authored.cycleCount)}/3`;
    }
    if (runtime.gongfaId === "vermilion-bird-covenant") {
      const bird = runtime.authored.anchors.find((anchor) => anchor.kind === "companion");
      const timer = runtime.authored.targetLedger[-30] ?? 0;
      const learned = runtime.mastery.masteryLearnedIds;
      const hatchMs = learned.includes("urgent-ember-egg") ? 2200 : learned.includes("true-plume-nirvana") ? 5600 : 4200;
      const recoveryMs = learned.includes("urgent-ember-egg") ? 2400 : learned.includes("true-plume-nirvana") ? 5200 : 4200;
      const stateLabel = bird?.companionState === "egg" ? "Nirvana Egg" :
        bird?.companionState === "ember" ? `Ember Recovery ${Math.max(0, Math.ceil((recoveryMs - timer) / 100) / 10)}s` :
          bird?.companionState === "outbound" ? "Outbound Dive" :
            bird?.companionState === "return" ? "Returning" :
              bird?.companionState === "phoenix" ? "True Phoenix" : "Close Guard";
      const eggProgress = bird?.companionState === "egg" ? ` · Hatch ${Math.min(100, Math.floor(timer / hatchMs * 100))}%` : "";
      return `Vermilion Bird: ${stateLabel} · HP ${Math.floor(runtime.authored.secondaryResource * 100)}% · Bond ${Math.floor(runtime.authored.resource * 100)}%${eggProgress}`;
    }
    if (runtime.gongfaId === "myriad-beast-grove") {
      const labels = runtime.authored.anchors
        .filter((anchor) => anchor.kind === "beast")
        .map((anchor) => {
          const species = anchor.beastSpecies === "boar" ? "Boar" : anchor.beastSpecies === "fox" ? "Fox" : "Deer";
          return `${species} ${anchor.beastState === "downed" ? `Rebirthing ${Math.ceil((anchor.rebirthMs ?? 0) / 100) / 10}s` : `${Math.floor(anchor.value * 100)}%`}`;
        });
      return `Pack: ${labels.join(" · ")} · Kinship ${Math.floor(runtime.authored.resource * 100)}%`;
    }
    if (runtime.gongfaId === "ancient-tree-body-art") {
      const state = runtime.authored.phase === 0 ? "Mobile" : runtime.authored.phase === 1 ? "Rooted" : runtime.authored.phase === 2 ? "Uprooting" : "World-Tree";
      return `Ancient Tree: ${state} · Rings ${runtime.authored.charges}/${runtime.authored.maxCharges}${runtime.authored.phase === 2 ? ` · ${Math.ceil(runtime.authored.phaseElapsedMs / 100) / 10}s` : ""}`;
    }
    if (runtime.gongfaId === "ironwood-wave-form") {
      const walls = runtime.authored.anchors.filter((anchor) => anchor.kind === "wall");
      const rampartState = runtime.authored.phase === 2 ? "Citadel holding" :
        runtime.authored.phase === 3 ? "Citadel driving outward" :
          walls.some((wall) => wall.participating) ? "Rampart driving" :
            walls.length > 0 ? "Rampart rooted" : runtime.authored.phaseElapsedMs > 0 ? "Constructing" : "Awaiting threat";
      return `Ironwood: ${rampartState} · Stability ${Math.floor(runtime.authored.resource)}/${runtime.authored.maxCharges} · Strong drives ${Math.min(3, runtime.authored.cycleCount)}/3 · Walls ${walls.length}`;
    }
    if (runtime.gongfaId === "crimson-furnace-sword-art") {
      const state = runtime.authored.phase === 1 ? "Reforged follow-up armed" :
        runtime.crimsonFurnace?.networkIgnitionCooldownRemaining ? "Ignition propagating" :
          runtime.authored.secondaryResource > 0 ? "Living furnace linked" : "Forging nodes";
      return `Crimson Furnace: ${state} · Pressure ${Math.floor(runtime.authored.resource)}/100 · Nodes ${runtime.authored.charges} · Links ${Math.floor(runtime.authored.secondaryResource)}`;
    }
    if (runtime.gongfaId === "heavenfall-body-art") {
      const state = runtime.authored.phase === 1 ? "Transformed" : runtime.authored.phase === 2 ? "Descent committed" : runtime.authored.phase === 3 ? "Crater recovery" : "Ready";
      const mass = runtime.authored.phase === 2 ? runtime.authored.secondaryResource : runtime.authored.resource;
      const timer = runtime.authored.phase === 2 || runtime.authored.phase === 3
        ? Math.ceil(runtime.authored.phaseElapsedMs / 100) / 10
        : Math.max(0, Math.ceil((6000 - runtime.authored.phaseElapsedMs) / 100) / 10);
      return `Falling Star: ${state} · Mass ${Math.floor(mass * 100)}% · ${timer}s`;
    }
    if (runtime.gongfaId === "heaven-sundering-edict") {
      return `Edict: Mandate ${Math.floor(runtime.authored.resource * 100)}% · Records ${runtime.authored.charges} · Best ${runtime.authored.secondaryResource.toFixed(1)}`;
    }
    if (runtime.gongfaId === "nine-sun-calamity-seal") {
      return `Nine Sun: ${runtime.authored.phase === 1 ? "Seal Falling" : "Zenith Rising"} · Zenith ${Math.floor(runtime.authored.resource * 100)}% · Omens ${runtime.authored.charges}/9`;
    }
    if (runtime.gongfaId === "scarlet-wave-manual") {
      const state = runtime.authored.phase === 0 ? "Awaiting Left" : runtime.authored.phase === 1 ? "Awaiting Right" : "Confluence";
      return `Scarlet Tides: ${state} · Successful pairs ${Math.min(3, runtime.authored.cycleCount)}/3`;
    }
    if (runtime.gongfaId === "moonfall-tide-ritual") {
      const state = runtime.authored.phase === 2 ? "Moonless Eclipse" : runtime.authored.phase === 1 ? "Moon Carried" : "Awaiting Moon";
      return `Moonfall: ${state} · Syzygy ${Math.floor(runtime.authored.resource * 100)}% · Orbiters ${runtime.authored.charges} · High resolutions ${Math.min(3, runtime.authored.cycleCount)}/3`;
    }
    if (runtime.gongfaId === "ice-mirror-guard") {
      const state = runtime.authored.phase === 2
        ? `Frozen Lotus ${Math.ceil((runtime.authored.targetLedger[-112] ?? 0) / 100) / 10}s`
        : runtime.authored.charges === 0
          ? `Emergency repair ${Math.max(0, Math.ceil((4800 - (runtime.authored.targetLedger[-113] ?? 0)) / 100) / 10)}s`
          : "Sixfold rotation";
      return `Ice Mirrors: ${state} · Intact ${runtime.authored.charges}/${runtime.authored.maxCharges} · Lingering ${runtime.authored.secondaryResource}`;
    }
    if (runtime.gongfaId === "verdant-ring-scripture") {
      const glyphs = runtime.authored.anchors.filter((anchor) => anchor.kind === "glyph").flatMap((anchor) => anchor.glyph ? [anchor.glyph] : []);
      const label = (glyph: "root" | "leaf" | "thorn"): string => glyph === "root" ? "Root" : glyph === "leaf" ? "Leaf" : "Thorn";
      const queue = [0, 1, 2].map((index) => glyphs[index] ? label(glyphs[index]!) : "—").join(" → ");
      const preview = glyphs.length === 0 ? "Shape pending" : glyphs.length === 1 ?
        `${glyphs[0] === "root" ? "Root circle" : glyphs[0] === "leaf" ? "Leaf route" : "Threat triangle"} · motion pending` :
        `${glyphs[0] === "root" ? "Root circle" : glyphs[0] === "leaf" ? "Leaf route" : "Threat triangle"} · ${glyphs[1] === "root" ? "fixed" : glyphs[1] === "leaf" ? "traveling" : "contracting"} · ${glyphs[2] ? glyphs[2] === "root" ? "bind/guard" : glyphs[2] === "leaf" ? "repeat" : "high damage" : "payoff pending"}`;
      return `Glyphs: ${queue} · ${preview} · Next: recent Evade > stillness > movement`;
    }
    return undefined;
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
          this.getSpiritTreasureResonanceModifiers().evadeCooldownMultiplier *
            (this.gongfaCollection.byId["verdant-ring-scripture"]?.mastery.masteryLearnedIds.includes("calamity-step-thorn-scripture") ? 1.35 : 1) *
            (this.gongfaCollection.byId["ice-mirror-guard"]?.mastery.masteryLearnedIds.includes("ice-heart-repair") ? 1.35 : 1)
        )
      ) {
        this.player.presentEvade(this.evade.state.direction);
        this.sfx.evade();
        this.maybeCutGaleStepCorridor();
        this.applyEvadeRuntimeEffects();
      }
    }
    const evadeState = this.evade.state;
    const treeRuntime = this.gongfaCollection.byId["ancient-tree-body-art"];
    const treeMovementLocked = treeRuntime && [1, 2, 3].includes(treeRuntime.authored.phase);
    let presentedMovement = treeMovementLocked
      ? new Phaser.Math.Vector2(0, 0)
      : evadeState.active
      ? new Phaser.Math.Vector2(evadeState.direction.x, evadeState.direction.y)
      : movement;
    const heavenfall = this.gongfaCollection.byId["heavenfall-body-art"];
    if (!treeMovementLocked && heavenfall && [1, 2].includes(heavenfall.authored.phase) && movement.lengthSq() > 0) {
      const learned = heavenfall.mastery.masteryLearnedIds;
      const baseResponse = learned.includes("star-piercing-iron-body") ? 0.24 :
        learned.includes("wandering-star-light-body") ? 1 : learned.includes("heavenfall-giant-body") ? 0.5 : 0.68;
      const mass = heavenfall.authored.phase === 2 ? heavenfall.authored.secondaryResource : heavenfall.authored.resource;
      const response = baseResponse * (1 - mass * 0.45);
      const prior = new Phaser.Math.Vector2(
        Math.cos(heavenfall.authored.lastMovementAngle ?? movement.angle()),
        Math.sin(heavenfall.authored.lastMovementAngle ?? movement.angle())
      );
      presentedMovement = prior.scale(1 - response).add(movement.clone().normalize().scale(response)).normalize();
    }
    this.player.move(
      presentedMovement,
      evadeState.active
        ? evadeState.speed
        : this.player.stats.moveSpeed * this.getBlackTidePlayerMoveScale(movement) * this.getGengjinMoveScale() *
          (heavenfall && [1, 2].includes(heavenfall.authored.phase)
            ? heavenfall.mastery.masteryLearnedIds.includes("star-piercing-iron-body") ? 1.18
              : heavenfall.mastery.masteryLearnedIds.includes("heavenfall-giant-body") ? 0.9 : 1
            : 1) *
          (heavenfall?.authored.phase === 3 ? 0.32 : (heavenfall?.authored.targetLedger[-72] ?? 0) > 0 ? 0.62 : 1)
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
    this.myriadBeastAssistMarkers.get(targetId)?.destroy();
    this.myriadBeastAssistMarkers.delete(targetId);
    const rank = enemy.role === "tribulation-boss"
      ? "boss" as const
      : enemy.maxHealth >= 150
        ? "elite" as const
        : "ordinary" as const;
    const survivingTargetFacts = (this.enemies.getChildren() as Enemy[])
      .filter((candidate) => candidate.active && candidate !== enemy)
      .map((candidate) => ({
        targetId: candidate.combatTargetId,
        x: candidate.x,
        y: candidate.y,
        healthRatio: candidate.maxHealth > 0 ? candidate.health / candidate.maxHealth : 0,
        rank: candidate.role === "tribulation-boss"
          ? "boss" as const
          : candidate.maxHealth >= 150
            ? "elite" as const
            : "ordinary" as const,
        embedStacks: candidate.embedStacks,
        embedPower: candidate.embedPower
      }));
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
        playerY: this.player.y,
        targets: survivingTargetFacts,
        embedStacks: enemy.embedStacks,
        embedPower: enemy.embedPower
      });
      this.adoptPrimaryRuntime(result.runtime);
      this.executeGongfaRuntimeCommands(result.commands, result.runtime);
      if (result.runtime.gongfaId === "black-tide-scripture") {
        this.syncBlackTideCompass(result.runtime);
      }
      if (result.runtime.gongfaId === "thousand-root-formation") {
        this.syncRootInfectionMarkers(result.runtime);
      }
      if (result.runtime.gongfaId === "vermilion-bird-covenant") {
        this.syncVermilionBirdMarker(result.runtime);
      }
      if (result.runtime.gongfaId === "myriad-beast-grove") {
        this.syncMyriadBeastMarkers(result.runtime);
      }
      if (result.runtime.gongfaId === "heavenfall-body-art") {
        this.syncHeavenfallBodyMarker(result.runtime);
      }
      if (result.runtime.gongfaId === "moonfall-tide-ritual") {
        this.syncMoonfallMarker(result.runtime);
      }
      if (result.runtime.gongfaId === "verdant-ring-scripture") {
        this.syncVerdantGlyphMarker(result.runtime);
      }
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
        this.time.delayedCall(4800, () => {
          if (!projectile.active || projectile.lodgedEnemy !== target) return;
          target.embedStacks = Math.max(0, target.embedStacks - 1);
          target.embedPower = Math.max(0, target.embedPower - projectile.damage);
          projectile.destroy();
        });
        return;
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
    this.applyIncomingDamage(enemy.touchDamage, enemy.x, enemy.y, enemy.combatTargetId);

    for (const runtime of this.learnedGongfaRuntimes) {
      if (runtime.combat.pattern !== "melee" || runtime.combat.retaliationDamage <= 0) continue;
      const reflected = runtime.combat.retaliationDamage * (1 + (runtime.surge?.stacks ?? 0) * 0.08);
      const ring = this.add.circle(enemy.x, enemy.y, 34, 0xf0d38a, 0.08)
        .setStrokeStyle(3, 0xffffff, 0.82).setDepth(12);
      this.tweens.add({ targets: ring, scale: 1.8, alpha: 0, duration: 220, onComplete: () => ring.destroy() });
      this.stokeSkill2Resource(runtime.gongfaId);
      if (enemy.receiveDamage(reflected)) this.resolveEnemyDeath(enemy);
    }

    if (this.combatState.pattern === "aura" && !this.gongfaRuntime?.gengjin && this.combatState.retaliationDamage > 0) {
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
        this.applyIncomingDamage(profile.slamDamage, x, y, boss.combatTargetId);
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
      const authoredTargets = (this.enemies.getChildren() as Enemy[])
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
              : "ordinary" as const,
          embedStacks: enemy.embedStacks,
          embedPower: enemy.embedPower
        }));
      const commands = planGongfaAttack(runtime, this.runState.elapsedMs, {
        playerX: this.player.x,
        playerY: this.player.y,
        targets: authoredTargets
      });
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
      if (projectile.lodgedEnemy?.active) return;
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

  private applyEvadeRuntimeEffects(): void {
    this.bloodCombinationSerial += 1;
    for (const runtime of this.learnedGongfaRuntimes) {
      const result = advanceGongfaRuntime(runtime, {
        kind: "evade",
        playerX: this.player.x,
        playerY: this.player.y,
        nearbyEnemyCount: this.getEnemiesWithinRadius(190).length
      });
      this.adoptPrimaryRuntime(result.runtime);
      this.executeGongfaRuntimeCommands(result.commands, result.runtime);
      if (result.runtime.gongfaId === "black-tide-scripture") {
        this.syncBlackTideCompass(result.runtime);
      }
      if (result.runtime.gongfaId === "thousand-root-formation") {
        this.syncRootInfectionMarkers(result.runtime);
      }
    }
    this.restorePrimaryRuntimeAdapter();
  }

  private pullEnemiesToward(radius: number, strength: number): void {
    for (const enemy of this.getEnemiesWithinRadius(radius)) {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, strength);
      }
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

  private getBlackTidePlayerMoveScale(movement: Phaser.Math.Vector2): number {
    const runtime = this.gongfaCollection.byId["black-tide-scripture"];
    if (!runtime?.mastery.masteryLearnedIds.includes("hold-the-moon-against-the-tide")) return 1;
    if (movement.lengthSq() === 0) return 0.82;
    const direction = Math.max(0, Math.min(3, Math.floor(runtime.authored.secondaryResource)));
    const flowAngle = [0, Math.PI / 2, Math.PI, -Math.PI / 2][direction] ?? 0;
    const movementAngle = movement.angle();
    return Math.cos(movementAngle - flowAngle) < -0.55 ? 0.72 : 0.82;
  }

  private getGengjinMoveScale(): number {
    const runtime = this.gongfaCollection.byId["gengjin-huti"];
    return runtime?.mastery.masteryLearnedIds.includes("hundred-forged-heavy-armor") ? 0.84 : 1;
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
            : "ordinary" as const,
        embedStacks: enemy.embedStacks,
        embedPower: enemy.embedPower
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
      if (result.runtime.gongfaId === "black-tide-scripture") {
        this.syncBlackTideCompass(result.runtime);
      }
      if (result.runtime.gongfaId === "thousand-root-formation") {
        this.syncRootInfectionMarkers(result.runtime);
      }
      if (result.runtime.gongfaId === "vermilion-bird-covenant") {
        this.syncVermilionBirdMarker(result.runtime);
      }
      if (result.runtime.gongfaId === "myriad-beast-grove") {
        this.syncMyriadBeastMarkers(result.runtime);
      }
      if (result.runtime.gongfaId === "heavenfall-body-art") {
        this.syncHeavenfallBodyMarker(result.runtime);
      }
    }
    this.restorePrimaryRuntimeAdapter();
  }

  private getEnemiesWithinRadius(radius: number): Enemy[] {
    return this.getEnemiesWithinRadiusFrom(this.player.x, this.player.y, radius);
  }

  private syncRootInfectionMarkers(runtime: GongfaRuntime): void {
    const identity = getGongfaVisualIdentity(runtime.gongfaId);
    const activeIds = new Set<number>();
    for (const infection of runtime.authored.anchors.filter((anchor) =>
      anchor.kind === "infection" && anchor.targetId !== undefined
    )) {
      const targetId = infection.targetId!;
      activeIds.add(targetId);
      let marker = this.rootInfectionMarkers.get(targetId);
      if (!marker) {
        marker = this.add.graphics().setDepth(15);
        this.rootInfectionMarkers.set(targetId, marker);
      }
      const stage = infection.infectionStage ?? 0;
      marker.clear();
      marker.fillStyle(stage === 2 ? identity.secondary : identity.accent, 0.88);
      marker.fillEllipse(0, -18, 5 + stage * 3, 9 + stage * 4);
      marker.lineStyle(1.5 + stage, identity.accent, 0.78);
      const branches = 2 + stage * 2;
      for (let branch = 0; branch < branches; branch += 1) {
        const side = branch % 2 === 0 ? -1 : 1;
        const tier = Math.floor(branch / 2) + 1;
        marker.lineBetween(0, -16, side * (6 + tier * 4), -20 - tier * 5);
      }
      const host = this.getEnemyByCombatTargetId(targetId);
      marker.setPosition(host?.active ? host.x : infection.x, host?.active ? host.y : infection.y);
      marker.setAlpha(0.62 + stage * 0.16);
    }
    for (const [targetId, marker] of this.rootInfectionMarkers) {
      if (activeIds.has(targetId)) continue;
      marker.destroy();
      this.rootInfectionMarkers.delete(targetId);
    }
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

      if (command.kind === "crimson-furnace-volley") {
        this.fireCrimsonFurnaceVolley(command);
        return;
      }

      if (command.kind === "authored-crimson-network") {
        this.syncAuthoredCrimsonNetwork(command);
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

      if (command.kind === "authored-gengjin-brace") {
        this.syncAuthoredGengjinBrace(command);
        return;
      }

      if (command.kind === "authored-gengjin-reflection") {
        this.applyAuthoredGengjinReflection(command);
        return;
      }

      if (command.kind === "authored-gengjin-release") {
        this.applyAuthoredGengjinRelease(command);
        return;
      }

      if (command.kind === "authored-ironwood-walls") {
        this.syncAuthoredIronwoodWalls(command);
        return;
      }

      if (command.kind === "authored-burning-corona") {
        this.applyAuthoredBurningCorona(command);
        return;
      }

      if (command.kind === "authored-mirror-facets") {
        this.syncAuthoredMirrorFacets(command);
        return;
      }

      if (command.kind === "authored-mirror-reflection") {
        this.fireAuthoredMirrorReflection(command);
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

      if (command.kind === "verdant-root-network") {
        this.fireVerdantRootNetwork(command);
        return;
      }

      if (command.kind === "sprout-sun-circle") {
        this.fireSproutSunCircle(command);
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

      if (command.kind === "authored-cold-debt-placement") {
        this.presentColdDebtSeals(command);
        return;
      }

      if (command.kind === "authored-frozen-river") {
        this.fireAuthoredFrozenRiver(command);
        return;
      }

      if (command.kind === "authored-frozen-river-network") {
        this.fireAuthoredFrozenRiverNetwork(command);
        return;
      }

      if (command.kind === "authored-root-infection") {
        this.presentRootInfection(command);
        return;
      }

      if (command.kind === "authored-root-stage") {
        this.fireAuthoredRootStage(command);
        return;
      }

      if (command.kind === "authored-root-ancestor") {
        this.fireAuthoredRootAncestor(command);
        return;
      }

      if (command.kind === "authored-world-tide-band") {
        this.fireAuthoredWorldTide(command);
        return;
      }

      if (command.kind === "authored-deluge-mandate") {
        this.fireAuthoredDelugeMandate(command);
        return;
      }

      if (command.kind === "authored-vermilion-flight") {
        this.fireAuthoredVermilionFlight(command);
        return;
      }

      if (command.kind === "authored-vermilion-sacrifice") {
        this.fireAuthoredVermilionSacrifice(command);
        return;
      }

      if (command.kind === "authored-beast-action") {
        this.fireAuthoredBeastAction(command);
        return;
      }

      if (command.kind === "authored-beast-ancestors") {
        this.fireAuthoredBeastAncestors(command);
        return;
      }

      if (command.kind === "authored-ancient-tree-cycle") {
        this.fireAuthoredAncientTreeCycle(command);
        return;
      }

      if (command.kind === "authored-heavenfall-body") {
        this.fireAuthoredHeavenfallBody(command);
        return;
      }

      if (command.kind === "authored-star-descent") {
        this.fireAuthoredStarDescent(command);
        return;
      }

      if (command.kind === "authored-sundering-edict") {
        this.fireAuthoredSunderingEdict(command);
        return;
      }

      if (command.kind === "authored-falling-sun") {
        this.fireAuthoredFallingSun(command);
        return;
      }

      if (command.kind === "authored-scarlet-tides") {
        this.fireAuthoredScarletTides(command);
        return;
      }

      if (command.kind === "authored-moon-orbit") {
        this.applyAuthoredMoonOrbit(command);
        return;
      }

      if (command.kind === "authored-moon-resolution") {
        this.fireAuthoredMoonResolution(command);
        return;
      }

      if (command.kind === "authored-glyph-invocation") {
        this.fireAuthoredGlyphInvocation(command);
        return;
      }

      if (command.kind === "authored-sprout-sun") {
        this.fireAuthoredSproutSun(command);
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

  private presentColdDebtSeals(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-cold-debt-placement" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    for (const seal of command.seals) {
      const sigil = createGongfaSigil(
        this, seal.x, seal.y, command.sourceGongfaId,
        seal.role === "origin" ? 24 : 18,
        seal.role === "origin" ? 0.78 : 0.5
      ).setDepth(5);
      sigil.setData("coldDebtChain", seal.chainId);
      const crack = this.add.graphics().setDepth(4);
      crack.lineStyle(seal.role === "origin" ? 2 : 1, identity.accent, 0.55);
      for (let spoke = 0; spoke < 4; spoke += 1) {
        const angle = spoke * Math.PI / 2 + seal.chainId * 0.31;
        crack.lineBetween(
          seal.x, seal.y,
          seal.x + Math.cos(angle) * (seal.role === "origin" ? 30 : 22),
          seal.y + Math.sin(angle) * (seal.role === "origin" ? 30 : 22)
        );
      }
      this.time.delayedCall(command.lifetimeMs, () => {
        if (sigil.active) this.tweens.add({ targets: sigil, alpha: 0, duration: 180, onComplete: () => sigil.destroy() });
        if (crack.active) this.tweens.add({ targets: crack, alpha: 0, duration: 180, onComplete: () => crack.destroy() });
      });
    }
    this.recordGongfaMotif(`${identity.motifId}:cold-debt-seals`);
  }

  private fireAuthoredFrozenRiver(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-frozen-river" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const river = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(10);
    river.lineStyle(Math.max(5, command.width), identity.accent, 0.22);
    river.lineBetween(command.from.x, command.from.y, command.to.x, command.to.y);
    river.lineStyle(2, identity.secondary, 0.92);
    const steps = 9;
    river.beginPath();
    river.moveTo(command.from.x, command.from.y);
    for (let step = 1; step <= steps; step += 1) {
      const ratio = step / steps;
      const jitter = step === steps ? 0 : (step % 2 === 0 ? 7 : -7);
      const dx = command.to.x - command.from.x;
      const dy = command.to.y - command.from.y;
      const length = Math.max(1, Math.hypot(dx, dy));
      river.lineTo(
        command.from.x + dx * ratio - dy / length * jitter,
        command.from.y + dy * ratio + dx / length * jitter
      );
    }
    river.strokePath();
    this.damageEnemiesAlongFrozenSegment(command.from, command.to, command.width, command.damage,
      command.slowMultiplier, command.slowDurationMs, false, command.bossDamageScale);
    this.tweens.add({ targets: river, alpha: 0, duration: 520, onComplete: () => river.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:one-shot-river`);
  }

  private fireAuthoredFrozenRiverNetwork(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-frozen-river-network" }>
  ): void {
    if (command.nodes.length < 2) return;
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const network = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(11);
    network.lineStyle(Math.max(6, command.width), identity.accent, 0.18);
    const perNodeDamage = command.fate === "collective-liability"
      ? command.damagePool / command.nodes.length
      : command.damagePool;
    for (let index = 0; index < command.nodes.length; index += 1) {
      const from = command.nodes[index]!;
      const to = command.nodes[(index + 1) % command.nodes.length]!;
      network.lineBetween(from.x, from.y, to.x, to.y);
      this.damageEnemiesAlongFrozenSegment(
        from, to, command.width, perNodeDamage,
        command.fate === "shared-cold" ? 0.05 : command.fate === "collective-liability" ? 0.72 : 0.62,
        command.fate === "shared-cold" ? 1100 : 700,
        command.fate === "shared-cold"
      );
    }
    network.lineStyle(2, identity.secondary, 0.9);
    command.nodes.forEach((node, index) => {
      const next = command.nodes[(index + 1) % command.nodes.length]!;
      network.lineBetween(node.x, node.y, next.x, next.y);
    });
    this.tweens.add({ targets: network, alpha: 0, duration: 900, onComplete: () => network.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:prison:${command.fate}`);
  }

  private damageEnemiesAlongFrozenSegment(
    from: { x: number; y: number },
    to: { x: number; y: number },
    width: number,
    damage: number,
    slowMultiplier: number,
    slowDurationMs: number,
    hardFreezeOrdinary = false,
    bossDamageScale = 1
  ): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const lengthSq = Math.max(1, dx * dx + dy * dy);
    for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active)) {
      const projection = Math.max(0, Math.min(1,
        ((enemy.x - from.x) * dx + (enemy.y - from.y) * dy) / lengthSq
      ));
      const closestX = from.x + dx * projection;
      const closestY = from.y + dy * projection;
      if (Phaser.Math.Distance.Between(enemy.x, enemy.y, closestX, closestY) > width / 2 + 12) continue;
      const isBoss = enemy.role === "tribulation-boss";
      enemy.applySlow(hardFreezeOrdinary && !isBoss ? 0.03 : isBoss ? Math.max(0.42, slowMultiplier) : slowMultiplier,
        isBoss ? slowDurationMs * 1.25 : slowDurationMs);
      if (enemy.receiveDamage(damage * (isBoss ? bossDamageScale : 1))) this.resolveEnemyDeath(enemy);
    }
  }

  private presentRootInfection(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-root-infection" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    for (const host of command.hosts) {
      const seed = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(13);
      seed.fillStyle(identity.secondary, 0.92);
      seed.fillEllipse(host.x, host.y - 7, 7, 12);
      seed.lineStyle(2, identity.accent, 0.8);
      seed.beginPath();
      seed.moveTo(host.x, host.y - 3);
      seed.lineTo(host.x - 8, host.y - 16);
      seed.lineTo(host.x - 2, host.y - 12);
      seed.moveTo(host.x, host.y - 5);
      seed.lineTo(host.x + 8, host.y - 18);
      seed.lineTo(host.x + 3, host.y - 13);
      seed.strokePath();
      this.tweens.add({
        targets: seed, alpha: 0, scale: 1.35, y: -8, duration: 600,
        onComplete: () => seed.destroy()
      });
    }
    this.recordGongfaMotif(`${identity.motifId}:living-root-seed`);
  }

  private fireAuthoredRootStage(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-root-stage" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const host = this.getEnemyByCombatTargetId(command.targetId);
    const roots = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(12);
    roots.lineStyle(command.stage === 2 ? 5 : 3, identity.accent, 0.88);
    const branchCount = command.stage === 2 ? 7 : 4;
    for (let branch = 0; branch < branchCount; branch += 1) {
      const angle = branch / branchCount * Math.PI * 2 + command.targetId * 0.17;
      const reach = command.radius * (0.62 + (branch % 3) * 0.16);
      roots.beginPath();
      roots.moveTo(command.x, command.y);
      roots.lineTo(
        command.x + Math.cos(angle - 0.18) * reach * 0.48,
        command.y + Math.sin(angle - 0.18) * reach * 0.48
      );
      roots.lineTo(command.x + Math.cos(angle) * reach, command.y + Math.sin(angle) * reach);
      roots.strokePath();
    }
    if (host?.active) {
      if (command.slowMultiplier !== undefined && command.slowDurationMs !== undefined) {
        const isBoss = host.role === "tribulation-boss";
        host.applySlow(
          command.immobilizeOrdinary && !isBoss ? 0.03 : isBoss ? Math.max(0.38, command.slowMultiplier) : command.slowMultiplier,
          command.slowDurationMs
        );
      }
      if (host.receiveDamage(command.damage)) this.resolveEnemyDeath(host);
    }
    if (command.maxSplashTargets > 0) {
      (this.enemies.getChildren() as Enemy[])
        .filter((enemy) => enemy.active && enemy.combatTargetId !== command.targetId &&
          Phaser.Math.Distance.Between(command.x, command.y, enemy.x, enemy.y) <= command.radius)
        .sort((a, b) =>
          Phaser.Math.Distance.Between(command.x, command.y, a.x, a.y) -
          Phaser.Math.Distance.Between(command.x, command.y, b.x, b.y))
        .slice(0, command.maxSplashTargets)
        .forEach((enemy) => {
          if (enemy.receiveDamage(command.damage * 0.72)) this.resolveEnemyDeath(enemy);
        });
    }
    this.tweens.add({ targets: roots, alpha: 0, scale: 1.08, duration: 460, onComplete: () => roots.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:host-stage-${command.stage}`);
  }

  private fireAuthoredRootAncestor(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-root-ancestor" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const roots = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(11);
    roots.lineStyle(command.fate === "one-heart" ? 7 : 5, identity.accent, 0.8);
    const damaged = new Set<number>();
    command.hosts.forEach((host, index) => {
      const route = command.fate === "many-mouths"
        ? command.routeTargets[index % Math.max(1, command.routeTargets.length)]
        : command.fate === "one-heart"
          ? command.routeTargets[0]
          : undefined;
      const waypoint = route ?? command.mergeTarget;
      roots.beginPath();
      roots.moveTo(host.x, host.y);
      const bendX = (host.x + waypoint.x) / 2 + (index % 2 === 0 ? 24 : -24);
      const bendY = (host.y + waypoint.y) / 2 + (index % 2 === 0 ? -18 : 18);
      roots.lineTo(bendX, bendY);
      roots.lineTo(waypoint.x, waypoint.y);
      if (route) roots.lineTo(command.mergeTarget.x, command.mergeTarget.y);
      roots.strokePath();
      this.damageEnemiesAlongRootSegment(host, waypoint, 24, command.damage, damaged,
        command.fate === "many-mouths" ? 0.55 : 1);
      if (route) {
        this.damageEnemiesAlongRootSegment(route, command.mergeTarget, 24, command.damage, damaged,
          command.fate === "many-mouths" ? 0.55 : 1);
      }
    });
    const mother = createGongfaSigil(
      this, command.mergeTarget.x, command.mergeTarget.y,
      command.sourceGongfaId, command.radius, 0.9
    ).setDepth(12);
    mother.setScale(0.4);
    this.tweens.add({ targets: mother, scale: 1.15, alpha: 0, duration: 900, onComplete: () => mother.destroy() });
    this.tweens.add({ targets: roots, alpha: 0, duration: 820, onComplete: () => roots.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:root-mother:${command.fate}`);
  }

  private damageEnemiesAlongRootSegment(
    from: { x: number; y: number },
    to: { x: number; y: number },
    width: number,
    damage: number,
    damaged: Set<number>,
    bossDamageScale: number
  ): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const lengthSq = Math.max(1, dx * dx + dy * dy);
    for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active)) {
      if (damaged.has(enemy.combatTargetId)) continue;
      const projection = Math.max(0, Math.min(1,
        ((enemy.x - from.x) * dx + (enemy.y - from.y) * dy) / lengthSq
      ));
      const closestX = from.x + dx * projection;
      const closestY = from.y + dy * projection;
      if (Phaser.Math.Distance.Between(enemy.x, enemy.y, closestX, closestY) > width + 12) continue;
      damaged.add(enemy.combatTargetId);
      const isBoss = enemy.role === "tribulation-boss";
      if (enemy.receiveDamage(damage * (isBoss ? bossDamageScale : 1))) this.resolveEnemyDeath(enemy);
    }
  }

  private fireAuthoredWorldTide(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-world-tide-band" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const bounds = this.physics.world.bounds;
    const tide = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(7);
    const flowHorizontal = command.direction === 0 || command.direction === 2;
    const phaseAlpha = command.phase === "ebb" ? 0.16 : command.phase === "still" ? 0.24 : 0.34;
    for (let band = 0; band < command.bandCount; band += 1) {
      const ratio = command.phase === "flood"
        ? (band + 0.35) / Math.max(6, command.bandCount * 3)
        : (band + 0.5) / command.bandCount;
      tide.fillStyle(band % 2 === 0 ? identity.accent : identity.secondary, phaseAlpha);
      if (flowHorizontal) {
        const sourceRatio = command.direction === 0 ? ratio : 1 - ratio;
        tide.fillRect(bounds.x + bounds.width * sourceRatio - command.bandWidth / 2, bounds.y, command.bandWidth, bounds.height);
      } else {
        const sourceRatio = command.direction === 1 ? ratio : 1 - ratio;
        tide.fillRect(bounds.x, bounds.y + bounds.height * sourceRatio - command.bandWidth / 2, bounds.width, command.bandWidth);
      }
    }
    tide.lineStyle(command.phase === "flood" ? 4 : 2, identity.secondary, 0.7);
    const waveLines = command.phase === "ebb" ? 7 : command.phase === "still" ? 4 : 10;
    for (let line = 0; line < waveLines; line += 1) {
      if (flowHorizontal) {
        const x = bounds.x + (line + 1) * bounds.width / (waveLines + 1);
        tide.lineBetween(x, bounds.y, x, bounds.bottom);
      } else {
        const y = bounds.y + (line + 1) * bounds.height / (waveLines + 1);
        tide.lineBetween(bounds.x, y, bounds.right, y);
      }
    }
    const flowAngle = [0, Math.PI / 2, Math.PI, -Math.PI / 2][command.direction] ?? 0;
    const visualDirection = command.phase === "ebb" ? flowAngle + Math.PI : flowAngle;
    const arrowCount = command.phase === "still" ? 0 : command.phase === "flood" ? 12 : 7;
    tide.lineStyle(command.phase === "flood" ? 6 : 3, identity.secondary, 0.82);
    for (let arrow = 0; arrow < arrowCount; arrow += 1) {
      const x = bounds.x + (arrow + 1) * bounds.width / (arrowCount + 1);
      const y = bounds.y + ((arrow * 3) % Math.max(1, arrowCount) + 1) * bounds.height / (arrowCount + 1);
      tide.lineBetween(x, y, x - Math.cos(visualDirection - 0.65) * 18, y - Math.sin(visualDirection - 0.65) * 18);
      tide.lineBetween(x, y, x - Math.cos(visualDirection + 0.65) * 18, y - Math.sin(visualDirection + 0.65) * 18);
    }
    const forceAngle = command.force < 0 ? flowAngle + Math.PI : flowAngle;
    const applyFront = (enemy: Enemy): void => {
      if (!enemy.active) return;
      if (command.phase === "still") enemy.applySlow(command.slowMultiplier, 850);
      if (enemy.role === "tribulation-boss") {
        if (command.force !== 0) enemy.applySlow(0.72, 620);
      } else if (command.force !== 0) {
        enemy.applyForcedVelocity(forceAngle, Math.abs(command.force), 420);
      }
      if (enemy.receiveDamage(command.damage)) this.resolveEnemyDeath(enemy);
    };
    for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active)) {
      if (command.phase !== "flood") {
        applyFront(enemy);
        continue;
      }
      const sourceProgress = command.direction === 0
        ? (enemy.x - bounds.x) / bounds.width
        : command.direction === 2
          ? (bounds.right - enemy.x) / bounds.width
          : command.direction === 1
            ? (enemy.y - bounds.y) / bounds.height
            : (bounds.bottom - enemy.y) / bounds.height;
      this.time.delayedCall(90 + Math.max(0, Math.min(1, sourceProgress)) * 760, () => applyFront(enemy));
    }
    const travel = command.phase === "flood"
      ? (flowHorizontal ? bounds.width : bounds.height) * 0.72
      : command.phase === "ebb" ? -82 : 0;
    this.tweens.add({
      targets: tide,
      x: Math.cos(flowAngle) * travel,
      y: Math.sin(flowAngle) * travel,
      alpha: 0,
      duration: command.phase === "still" ? 900 : command.phase === "flood" ? 1050 : 680,
      onComplete: () => tide.destroy()
    });
    this.recordGongfaMotif(`${identity.motifId}:world-${command.phase}-${command.direction}`);
  }

  private syncBlackTideCompass(runtime: GongfaRuntime): void {
    if (this.gongfaCollection.primaryGongfaId !== runtime.gongfaId) {
      this.blackTideCompassMarker?.destroy();
      this.blackTideCompassMarker = undefined;
      this.blackTideCompassSignature = "";
      return;
    }
    const identity = getGongfaVisualIdentity(runtime.gongfaId);
    const marker = this.blackTideCompassMarker ?? this.add.graphics().setDepth(24).setScrollFactor(0);
    this.blackTideCompassMarker = marker;
    marker.clear();
    const direction = Math.max(0, Math.min(3, Math.floor(runtime.authored.secondaryResource)));
    const angle = [0, Math.PI / 2, Math.PI, -Math.PI / 2][direction] ?? 0;
    const phase = Math.max(0, Math.min(2, runtime.authored.phase));
    marker.fillStyle(0x07131d, 0.82);
    marker.fillCircle(0, 0, 48);
    marker.lineStyle(3, identity.secondary, 0.82);
    marker.strokeCircle(0, 0, 43);
    for (let tick = 0; tick < 4; tick += 1) {
      const tickAngle = tick * Math.PI / 2;
      marker.lineBetween(Math.cos(tickAngle) * 34, Math.sin(tickAngle) * 34, Math.cos(tickAngle) * 43, Math.sin(tickAngle) * 43);
    }
    marker.lineStyle(7, identity.accent, 0.96);
    marker.lineBetween(-Math.cos(angle) * 22, -Math.sin(angle) * 22, Math.cos(angle) * 25, Math.sin(angle) * 25);
    marker.fillStyle(identity.secondary, 0.96);
    marker.fillTriangle(
      Math.cos(angle) * 34, Math.sin(angle) * 34,
      Math.cos(angle + 2.45) * 17, Math.sin(angle + 2.45) * 17,
      Math.cos(angle - 2.45) * 17, Math.sin(angle - 2.45) * 17
    );
    for (let index = 0; index < 3; index += 1) {
      const x = (index - 1) * 25;
      marker.fillStyle(index === phase ? identity.accent : 0x203746, index === phase ? 0.95 : 0.72);
      if (index === 0) marker.fillTriangle(x - 8, 63, x, 52, x + 8, 63);
      if (index === 1) marker.fillRect(x - 8, 53, 16, 10);
      if (index === 2) marker.fillTriangle(x - 8, 53, x, 64, x + 8, 53);
    }
    marker.lineStyle(4, identity.secondary, 0.92);
    marker.beginPath();
    marker.arc(0, 0, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * runtime.authored.resource);
    marker.strokePath();
    if ((runtime.authored.targetLedger[-99] ?? 0) > 0) {
      marker.lineStyle(5, identity.accent, 0.95);
      marker.strokeRect(-58, -58, 116, 126);
    }
    marker.setPosition(1180, 620);
    const signature = `${identity.motifId}:cardinal-compass-${phase}-${direction}`;
    if (signature !== this.blackTideCompassSignature) {
      this.blackTideCompassSignature = signature;
      this.recordGongfaMotif(signature);
    }
  }

  private fireAuthoredDelugeMandate(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-deluge-mandate" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const bounds = this.physics.world.bounds;
    const flood = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(14);
    flood.fillStyle(identity.accent, command.fate === "dry-sea" ? 0.48 : 0.32);
    flood.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    flood.lineStyle(command.fate === "dry-sea" ? 7 : 4, identity.secondary, 0.9);
    const horizontal = command.direction === 0 || command.direction === 2;
    for (let line = 0; line < 12; line += 1) {
      if (horizontal) {
        const y = bounds.y + (line + 0.5) * bounds.height / 12;
        flood.lineBetween(bounds.x, y, bounds.right, y);
      } else {
        const x = bounds.x + (line + 0.5) * bounds.width / 12;
        flood.lineBetween(x, bounds.y, x, bounds.bottom);
      }
    }
    const flowAngle = [0, Math.PI / 2, Math.PI, -Math.PI / 2][command.direction] ?? 0;
    if (command.fate === "shared-flow") {
      flood.lineStyle(4, identity.accent, 0.92);
      for (let arrow = 0; arrow < 10; arrow += 1) {
        const x = bounds.x + (arrow + 1) * bounds.width / 11;
        const y = bounds.y + ((arrow * 4) % 9 + 1) * bounds.height / 10;
        flood.lineBetween(x, y, x - Math.cos(flowAngle - 0.65) * 24, y - Math.sin(flowAngle - 0.65) * 24);
        flood.lineBetween(x, y, x - Math.cos(flowAngle + 0.65) * 24, y - Math.sin(flowAngle + 0.65) * 24);
      }
    } else if (command.fate === "anchored-water") {
      flood.lineStyle(5, identity.secondary, 0.88);
      for (let anchor = 0; anchor < 9; anchor += 1) {
        const x = bounds.x + ((anchor % 3) + 1) * bounds.width / 4;
        const y = bounds.y + (Math.floor(anchor / 3) + 1) * bounds.height / 4;
        flood.strokeCircle(x, y, 24);
        flood.lineBetween(x - 19, y, x + 19, y);
        flood.lineBetween(x, y - 19, x, y + 19);
      }
    } else {
      const destinationX = command.direction === 0 ? bounds.right : command.direction === 2 ? bounds.x : undefined;
      const destinationY = command.direction === 1 ? bounds.bottom : command.direction === 3 ? bounds.y : undefined;
      flood.lineStyle(14, identity.secondary, 0.96);
      if (destinationX !== undefined) flood.lineBetween(destinationX, bounds.y, destinationX, bounds.bottom);
      if (destinationY !== undefined) flood.lineBetween(bounds.x, destinationY, bounds.right, destinationY);
      flood.lineStyle(6, identity.accent, 0.88);
      for (let crack = 0; crack < 8; crack += 1) {
        const across = (crack + 0.5) / 8;
        if (destinationX !== undefined) {
          const y = bounds.y + bounds.height * across;
          flood.lineBetween(destinationX - Math.cos(flowAngle) * 90, y - 24, destinationX, y);
          flood.lineBetween(destinationX - Math.cos(flowAngle) * 90, y + 24, destinationX, y);
        } else if (destinationY !== undefined) {
          const x = bounds.x + bounds.width * across;
          flood.lineBetween(x - 24, destinationY - Math.sin(flowAngle) * 90, x, destinationY);
          flood.lineBetween(x + 24, destinationY - Math.sin(flowAngle) * 90, x, destinationY);
        }
      }
    }
    for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active)) {
      if (enemy.role === "tribulation-boss") {
        enemy.applySlow(command.bossSlowMultiplier, command.durationMs);
      } else if (command.force > 0) {
        enemy.applyForcedVelocity(flowAngle, command.force, command.durationMs);
      } else {
        enemy.applySlow(0.25, command.durationMs);
      }
      if (enemy.receiveDamage(command.damage)) this.resolveEnemyDeath(enemy);
    }
    this.tweens.add({
      targets: flood,
      x: Math.cos(flowAngle) * (command.fate === "anchored-water" ? 0 : command.fate === "dry-sea" ? 220 : 140),
      y: Math.sin(flowAngle) * (command.fate === "anchored-water" ? 0 : command.fate === "dry-sea" ? 220 : 140),
      alpha: 0,
      duration: command.durationMs,
      onComplete: () => flood.destroy()
    });
    this.recordGongfaMotif(`${identity.motifId}:deluge-${command.fate}`);
  }

  private fireAuthoredVermilionFlight(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-vermilion-flight" }>
  ): void {
    if (command.waypoints.length === 0) return;
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const trail = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(13);
    const lineWidth = command.flightStyle === "rebirth" ? 11 : command.flightStyle === "head-hunt" ? 8 :
      command.flightStyle === "sweep" ? 7 : command.flightStyle === "guardian" ? 6 : command.flightStyle === "return" ? 3 : 4;
    trail.lineStyle(lineWidth, command.flightStyle === "guardian" || command.flightStyle === "return" ? identity.secondary : identity.accent, command.terminal ? 0.94 : 0.76);
    trail.beginPath();
    trail.moveTo(command.from.x, command.from.y);
    command.waypoints.forEach((point, index) => {
      const previous = index === 0 ? command.from : command.waypoints[index - 1]!;
      const bend = command.flightStyle === "head-hunt" || command.flightStyle === "guardian" ? 0 :
        command.flightStyle === "sweep" ? (index % 2 === 0 ? 34 : -34) : command.flightStyle === "return" ? 8 : 18;
      const midX = (previous.x + point.x) / 2 + bend;
      const midY = (previous.y + point.y) / 2 - Math.abs(bend) * 0.8;
      trail.lineTo(midX, midY);
      trail.lineTo(point.x, point.y);
    });
    trail.strokePath();
    trail.lineStyle(2, identity.secondary, 0.82);
    command.waypoints.forEach((point, index) => {
      const previous = index === 0 ? command.from : command.waypoints[index - 1]!;
      const angle = Phaser.Math.Angle.Between(previous.x, previous.y, point.x, point.y);
      const centerX = (previous.x + point.x) / 2;
      const centerY = (previous.y + point.y) / 2;
      trail.lineBetween(centerX, centerY, centerX + Math.cos(angle + 2.35) * 18, centerY + Math.sin(angle + 2.35) * 18);
      trail.lineBetween(centerX, centerY, centerX + Math.cos(angle - 2.35) * 18, centerY + Math.sin(angle - 2.35) * 18);
    });
    const destination = command.waypoints[command.waypoints.length - 1]!;
    if (command.flightStyle === "guardian") {
      trail.lineStyle(5, identity.secondary, 0.82);
      trail.strokeCircle(command.from.x, command.from.y, 42);
      trail.strokeCircle(destination.x, destination.y, 30);
    } else if (command.flightStyle === "sweep") {
      trail.lineStyle(3, identity.secondary, 0.72);
      command.waypoints.forEach((point) => trail.strokeCircle(point.x, point.y, command.width * 0.55));
    } else if (command.flightStyle === "head-hunt") {
      const angle = Phaser.Math.Angle.Between(command.from.x, command.from.y, destination.x, destination.y);
      trail.lineStyle(4, identity.secondary, 0.9);
      for (const side of [-1, 1]) trail.lineBetween(destination.x, destination.y, destination.x - Math.cos(angle + side * 0.55) * 42, destination.y - Math.sin(angle + side * 0.55) * 42);
    } else if (command.flightStyle === "rebirth") {
      trail.lineStyle(7, identity.secondary, 0.94);
      trail.strokeCircle(destination.x, destination.y, 48);
      trail.strokeCircle(destination.x, destination.y, 66);
      trail.lineBetween(destination.x, destination.y, destination.x - 72, destination.y - 48);
      trail.lineBetween(destination.x, destination.y, destination.x + 72, destination.y - 48);
    }
    const birdGlyph = createGongfaSigil(
      this, command.from.x, command.from.y, command.sourceGongfaId,
      command.terminal ? 42 : 27, 0.95
    ).setDepth(14);
    this.tweens.add({
      targets: birdGlyph,
      x: destination.x,
      y: destination.y,
      rotation: command.terminal ? Math.PI * 2 : Math.PI,
      duration: command.terminal ? 620 : 420,
      onComplete: () => birdGlyph.destroy()
    });
    if (command.maxHits > 0 && command.damage > 0) {
      const hitIds = new Set<number>();
      let from = command.from;
      for (const to of command.waypoints) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const lengthSq = Math.max(1, dx * dx + dy * dy);
        for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active)) {
          if (hitIds.size >= command.maxHits || hitIds.has(enemy.combatTargetId)) continue;
          const projection = Math.max(0, Math.min(1,
            ((enemy.x - from.x) * dx + (enemy.y - from.y) * dy) / lengthSq
          ));
          const closestX = from.x + dx * projection;
          const closestY = from.y + dy * projection;
          if (Phaser.Math.Distance.Between(enemy.x, enemy.y, closestX, closestY) > command.width / 2 + 12) continue;
          hitIds.add(enemy.combatTargetId);
          if (enemy.receiveDamage(command.damage)) this.resolveEnemyDeath(enemy);
        }
        from = to;
      }
    }
    this.tweens.add({ targets: trail, alpha: 0, duration: command.terminal ? 820 : 560, onComplete: () => trail.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:${command.flightStyle}`);
  }

  private fireAuthoredVermilionSacrifice(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-vermilion-sacrifice" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const shield = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(16);
    shield.fillStyle(identity.accent, 0.24);
    shield.fillCircle(this.player.x, this.player.y, 74);
    shield.lineStyle(7, identity.secondary, 0.95);
    shield.strokeCircle(this.player.x, this.player.y, 74);
    for (let wing = -1; wing <= 1; wing += 2) {
      shield.beginPath();
      shield.moveTo(this.player.x, this.player.y - 8);
      shield.lineTo(this.player.x + wing * 82, this.player.y - 42);
      shield.lineTo(this.player.x + wing * 46, this.player.y + 24);
      shield.strokePath();
    }
    this.tweens.add({ targets: shield, alpha: 0, scale: 1.3, duration: 700, onComplete: () => shield.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:sacrifice-guard`);
  }

  private syncVermilionBirdMarker(runtime: GongfaRuntime): void {
    const bird = runtime.authored.anchors.find((anchor) => anchor.kind === "companion");
    if (!bird) {
      this.vermilionBirdMarker?.destroy();
      this.vermilionBirdMarker = undefined;
      return;
    }
    const identity = getGongfaVisualIdentity(runtime.gongfaId);
    const marker = this.vermilionBirdMarker ?? this.add.graphics().setDepth(15);
    this.vermilionBirdMarker = marker;
    marker.clear();
    const birdState = bird.companionState ?? "guard";
    const stateTimer = runtime.authored.targetLedger[-30] ?? 0;
    if (birdState === "egg") {
      marker.fillStyle(identity.secondary, 0.9);
      marker.fillEllipse(0, 0, 25, 33);
      marker.lineStyle(3, identity.accent, 0.9);
      marker.strokeEllipse(0, 0, 31, 39);
      const hatchMs = runtime.mastery.masteryLearnedIds.includes("urgent-ember-egg") ? 2200 :
        runtime.mastery.masteryLearnedIds.includes("true-plume-nirvana") ? 5600 : 4200;
      marker.lineStyle(5, identity.secondary, 0.9);
      marker.beginPath();
      marker.arc(0, 0, 31, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, stateTimer / hatchMs));
      marker.strokePath();
    } else if (birdState === "ember") {
      marker.fillStyle(identity.accent, 0.9);
      marker.fillTriangle(-10, 10, 0, -15, 10, 10);
      marker.fillStyle(identity.secondary, 0.85);
      marker.fillTriangle(-5, 9, 0, -5, 5, 9);
      const recoveryMs = runtime.mastery.masteryLearnedIds.includes("urgent-ember-egg") ? 2400 :
        runtime.mastery.masteryLearnedIds.includes("true-plume-nirvana") ? 5200 : 4200;
      marker.lineStyle(4, identity.secondary, 0.75);
      marker.beginPath();
      marker.arc(0, 0, 27, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, stateTimer / recoveryMs));
      marker.strokePath();
    } else {
      const phoenixScale = (bird.maxValue ?? 1) > 1 ? 1.45 : 1;
      marker.fillStyle(identity.secondary, 0.92);
      marker.fillCircle(0, -2, 7 * phoenixScale);
      marker.fillStyle(identity.accent, 0.86);
      marker.fillTriangle(0, 0, -25 * phoenixScale, -12, -9, 10 * phoenixScale);
      marker.fillTriangle(0, 0, 25 * phoenixScale, -12, 9, 10 * phoenixScale);
      marker.fillTriangle(-5, 6, 0, 24 * phoenixScale, 5, 6);
      if (birdState === "phoenix") {
        marker.lineStyle(4, identity.secondary, 0.9);
        marker.lineBetween(-6, 10, -17, 37);
        marker.lineBetween(0, 10, 0, 44);
        marker.lineBetween(6, 10, 17, 37);
        marker.strokeCircle(0, -4, 18);
      }
      if (birdState === "outbound" || birdState === "return") {
        const angle = bird.angle ?? 0;
        marker.lineStyle(birdState === "return" ? 3 : 5, birdState === "return" ? identity.secondary : identity.accent, 0.7);
        marker.lineBetween(-Math.cos(angle) * 52, -Math.sin(angle) * 52, -Math.cos(angle) * 18, -Math.sin(angle) * 18);
      }
    }
    const healthRatio = Math.max(0, Math.min(1, bird.value / Math.max(0.01, bird.maxValue ?? 1)));
    marker.fillStyle(0x18212a, 0.78);
    marker.fillRect(-22, 27, 44, 5);
    marker.fillStyle(identity.accent, 0.95);
    marker.fillRect(-22, 27, 44 * healthRatio, 5);
    marker.lineStyle(2, identity.secondary, 0.7);
    marker.beginPath();
    marker.arc(0, 0, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * runtime.authored.resource);
    marker.strokePath();
    marker.setPosition(bird.x, bird.y);
  }

  private syncMyriadBeastMarkers(runtime: GongfaRuntime): void {
    const identity = getGongfaVisualIdentity(runtime.gongfaId);
    const activeSpecies = new Set<string>();
    for (const beast of runtime.authored.anchors.filter((anchor) => anchor.kind === "beast")) {
      const species = beast.beastSpecies ?? "boar";
      activeSpecies.add(species);
      const marker = this.myriadBeastMarkers.get(species) ?? this.add.graphics().setDepth(15);
      this.myriadBeastMarkers.set(species, marker);
      marker.clear();
      const downed = beast.beastState === "downed";
      marker.setAlpha(downed ? 0.34 : 1);
      if (beast.beastForm === "black-tortoise") {
        marker.fillStyle(0x335f57, 0.96);
        marker.fillEllipse(0, 2, 48, 32);
        marker.lineStyle(4, identity.secondary, 0.92);
        marker.strokeEllipse(0, 2, 48, 32);
        marker.lineBetween(-16, -7, 16, 11);
        marker.lineBetween(16, -7, -16, 11);
        marker.fillStyle(0x75d6a0, 0.9);
        marker.fillCircle(27, 2, 7);
      } else if (beast.beastForm === "mountain-lord") {
        marker.fillStyle(0xe0b85c, 0.96);
        marker.fillEllipse(0, 2, 46, 25);
        marker.fillCircle(20, -5, 11);
        marker.fillTriangle(14, -13, 16, -25, 22, -14);
        marker.fillTriangle(24, -14, 30, -24, 29, -10);
        marker.lineStyle(5, 0x6d3d21, 0.92);
        marker.lineBetween(-13, -8, -8, 11);
        marker.lineBetween(0, -10, 4, 12);
        marker.lineBetween(12, -9, 15, 8);
      } else if (beast.beastForm === "white-ape") {
        marker.fillStyle(0xd8e2ce, 0.96);
        marker.fillCircle(0, -7, 13);
        marker.fillEllipse(0, 10, 25, 30);
        marker.lineStyle(8, identity.accent, 0.92);
        marker.lineBetween(-8, 2, -25, 17);
        marker.lineBetween(8, 2, 25, 17);
        marker.lineStyle(3, identity.secondary, 0.9);
        marker.strokeCircle(0, 3, 27);
      } else if (species === "boar") {
        marker.fillStyle(identity.accent, 0.94);
        marker.fillRoundedRect(-18, -10, 36, 23, 8);
        marker.fillTriangle(13, -8, 25, -15, 18, 1);
        marker.fillTriangle(-13, -8, -25, -15, -18, 1);
      } else if (species === "fox") {
        marker.fillStyle(identity.secondary, 0.95);
        marker.fillTriangle(-17, 13, 0, -17, 17, 13);
        marker.fillTriangle(-13, -9, -5, -23, -1, -7);
        marker.fillTriangle(13, -9, 5, -23, 1, -7);
      } else {
        marker.lineStyle(5, identity.secondary, 0.95);
        marker.lineBetween(0, 13, 0, -12);
        marker.lineBetween(0, -9, -15, -23);
        marker.lineBetween(0, -9, 15, -23);
        marker.lineBetween(-15, -23, -21, -14);
        marker.lineBetween(15, -23, 21, -14);
      }
      const healthRatio = Math.max(0, Math.min(1, beast.value / Math.max(0.01, beast.maxValue ?? 1)));
      marker.fillStyle(0x172217, 0.82);
      marker.fillRect(-20, 27, 40, 4);
      marker.fillStyle(identity.accent, 0.96);
      marker.fillRect(-20, 27, 40 * healthRatio, 4);
      if (downed) {
        const rebirthRatio = 1 - Math.max(0, Math.min(1, (beast.rebirthMs ?? 0) / 6000));
        marker.lineStyle(4, identity.secondary, 0.9);
        marker.beginPath();
        marker.arc(0, 0, 31, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rebirthRatio);
        marker.strokePath();
      }
      marker.setPosition(beast.x, beast.y);
    }
    for (const [species, marker] of this.myriadBeastMarkers) {
      if (!activeSpecies.has(species)) {
        marker.destroy();
        this.myriadBeastMarkers.delete(species);
      }
    }
    for (const [targetId, marker] of this.myriadBeastAssistMarkers) {
      const target = this.getEnemyByCombatTargetId(targetId);
      if (!target?.active) {
        marker.destroy();
        this.myriadBeastAssistMarkers.delete(targetId);
      } else {
        marker.setPosition(target.x, target.y - 34);
      }
    }
  }

  private syncHeavenfallBodyMarker(runtime: GongfaRuntime): void {
    if (![1, 2].includes(runtime.authored.phase)) {
      this.heavenfallBodyMarker?.destroy();
      this.heavenfallBodyMarker = undefined;
      return;
    }
    const identity = getGongfaVisualIdentity(runtime.gongfaId);
    const marker = this.heavenfallBodyMarker ?? this.add.graphics().setDepth(13);
    this.heavenfallBodyMarker = marker;
    marker.clear();
    const mass = runtime.authored.phase === 2 ? runtime.authored.secondaryResource : runtime.authored.resource;
    const learned = runtime.mastery.masteryLearnedIds;
    const radius = (learned.includes("star-piercing-iron-body") ? 24 : learned.includes("heavenfall-giant-body") ? 58 : 38) + mass * 24;
    marker.fillStyle(identity.accent, 0.18);
    marker.fillCircle(0, 0, radius);
    marker.lineStyle(5 + mass * 4, identity.secondary, 0.82);
    marker.strokeCircle(0, 0, radius);
    const angle = runtime.authored.lastMovementAngle ?? 0;
    marker.lineStyle(4, identity.accent, 0.7);
    marker.lineBetween(-Math.cos(angle) * radius * (1.8 + mass), -Math.sin(angle) * radius * (1.8 + mass), Math.cos(angle) * radius, Math.sin(angle) * radius);
    if (runtime.authored.phase === 2) {
      const travel = 110 + mass * 170;
      const landingX = Math.cos(angle) * travel;
      const landingY = Math.sin(angle) * travel;
      marker.lineStyle(3, identity.secondary, 0.72);
      marker.lineBetween(0, 0, landingX, landingY);
      marker.lineStyle(4, identity.accent, 0.9);
      marker.strokeCircle(landingX, landingY, 18 + mass * 16);
      marker.lineBetween(landingX - 12, landingY, landingX + 12, landingY);
      marker.lineBetween(landingX, landingY - 12, landingX, landingY + 12);
    }
    marker.setPosition(this.player.x, this.player.y);
    this.recordGongfaMotif(`${identity.motifId}:${runtime.authored.phase === 2 ? "projected-landing" : "travel-body"}`);
  }

  private markMyriadBeastAssist(targetId: number, species: "boar" | "fox" | "deer"): void {
    const runtime = this.gongfaCollection.byId["myriad-beast-grove"];
    if (!runtime) return;
    const result = advanceGongfaRuntime(runtime, {
      kind: "authored-beast-assist",
      targetId,
      species,
      learnedMasteryIds: runtime.mastery.masteryLearnedIds
    });
    this.gongfaCollection.byId[runtime.gongfaId] = result.runtime;
    if (this.gongfaCollection.primaryGongfaId === runtime.gongfaId) this.adoptPrimaryRuntime(result.runtime);
    const target = this.getEnemyByCombatTargetId(targetId);
    if (!target?.active) return;
    const marks = Math.floor(result.runtime.authored.targetLedger[targetId] ?? 0);
    const marker = this.myriadBeastAssistMarkers.get(targetId) ?? this.add.graphics().setDepth(16);
    this.myriadBeastAssistMarkers.set(targetId, marker);
    marker.clear();
    const markColors = [0x7f9f55, 0xe3bd62, 0x75d6a0] as const;
    [1, 2, 4].forEach((bit, index) => {
      if ((marks & bit) === 0) return;
      const x = (index - 1) * 13;
      marker.fillStyle(markColors[index]!, 0.95);
      if (bit === 1) marker.fillRoundedRect(x - 5, -5, 10, 10, 3);
      if (bit === 2) marker.fillTriangle(x - 6, 5, x, -7, x + 6, 5);
      if (bit === 4) {
        marker.fillCircle(x, 0, 5);
        marker.lineStyle(2, markColors[index]!, 0.95);
        marker.lineBetween(x, -4, x - 5, -11);
        marker.lineBetween(x, -4, x + 5, -11);
      }
    });
    marker.setPosition(target.x, target.y - 34);
    this.tweens.add({
      targets: marker,
      scale: { from: 1.35, to: 1 },
      duration: 150
    });
  }

  private fireAuthoredBeastAction(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-beast-action" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const route = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(13);
    const color = command.species === "boar" ? 0x7f9f55 : command.species === "fox" ? 0xe3bd62 : 0x75d6a0;
    if (command.form === "black-tortoise") {
      route.fillStyle(color, 0.22);
      route.fillEllipse(command.target.x, command.target.y, command.radius * 2.2, command.radius * 1.5);
      route.lineStyle(6, identity.secondary, 0.9);
      route.strokeEllipse(command.target.x, command.target.y, command.radius * 2.2, command.radius * 1.5);
    } else if (command.form === "white-ape") {
      route.lineStyle(5, color, 0.88);
      route.strokeCircle(command.target.x, command.target.y, command.radius * 0.55);
      route.strokeCircle(command.target.x, command.target.y, command.radius);
    } else if (command.form === "mountain-lord") {
      const angle = Phaser.Math.Angle.Between(command.from.x, command.from.y, command.target.x, command.target.y);
      route.lineStyle(5, color, 0.9);
      for (const offset of [-10, 0, 10]) {
        const sideX = -Math.sin(angle) * offset; const sideY = Math.cos(angle) * offset;
        route.lineBetween(command.from.x + sideX, command.from.y + sideY, command.target.x + sideX, command.target.y + sideY);
      }
    } else if (command.species === "boar") {
      route.lineStyle(11, color, 0.84);
      route.lineBetween(command.from.x, command.from.y, command.target.x, command.target.y);
      route.fillStyle(color, 0.3);
      route.fillTriangle(command.target.x + command.radius, command.target.y, command.target.x - 12, command.target.y - 24, command.target.x - 12, command.target.y + 24);
    } else if (command.species === "fox") {
      const midX = (command.from.x + command.target.x) / 2;
      const midY = (command.from.y + command.target.y) / 2 - 34;
      route.lineStyle(4, color, 0.9);
      route.lineBetween(command.from.x, command.from.y, midX, midY);
      route.lineBetween(midX, midY, command.target.x, command.target.y);
    } else {
      route.lineStyle(4, color, 0.88);
      for (let spoke = 0; spoke < 6; spoke += 1) {
        const angle = spoke / 6 * Math.PI * 2;
        route.lineBetween(command.target.x, command.target.y, command.target.x + Math.cos(angle) * command.radius, command.target.y + Math.sin(angle) * command.radius);
      }
    }
    const victims = (this.enemies.getChildren() as Enemy[]).filter((enemy) =>
      enemy.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, command.target.x, command.target.y) <= command.radius + 12
    );
    for (const enemy of victims) {
      this.markMyriadBeastAssist(enemy.combatTargetId, command.species);
      if (command.rootMs > 0) enemy.applySlow(0.12, command.rootMs);
      if (enemy.receiveDamage(command.damage)) this.resolveEnemyDeath(enemy);
    }
    this.tweens.add({ targets: route, alpha: 0, duration: 440, onComplete: () => route.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:${command.form}`);
  }

  private fireAuthoredBeastAncestors(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-beast-ancestors" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const visual = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(16);
    const enemies = (this.enemies.getChildren() as Enemy[]).filter((enemy) => enemy.active);
    const strongest = [...enemies].sort((a, b) => b.maxHealth - a.maxHealth)[0];
    const wildBossHits = new Set<number>();
    const damageEnemy = (enemy: Enemy, scale = 1): void => {
      if (command.fate === "wild-run" && enemy.role === "tribulation-boss") {
        if (wildBossHits.has(enemy.combatTargetId)) return;
        wildBossHits.add(enemy.combatTargetId);
      }
      if (enemy.receiveDamage(command.damage * scale)) this.resolveEnemyDeath(enemy);
    };
    const nearLine = (enemy: Enemy, fromX: number, fromY: number, toX: number, toY: number, width: number): boolean => {
      const dx = toX - fromX; const dy = toY - fromY; const lengthSq = Math.max(1, dx * dx + dy * dy);
      const projection = Math.max(0, Math.min(1, ((enemy.x - fromX) * dx + (enemy.y - fromY) * dy) / lengthSq));
      return Phaser.Math.Distance.Between(enemy.x, enemy.y, fromX + dx * projection, fromY + dy * projection) <= width;
    };
    command.species.forEach((species, index) => {
      const angle = (index / Math.max(1, command.species.length)) * Math.PI * 2;
      const color = species === "boar" ? 0x7f9f55 : species === "fox" ? 0xe3bd62 : 0x75d6a0;
      if (command.fate === "encirclement" && strongest) {
        const fromX = strongest.x + Math.cos(angle) * 230;
        const fromY = strongest.y + Math.sin(angle) * 230;
        visual.lineStyle(species === "boar" ? 16 : species === "fox" ? 7 : 10, color, 0.78);
        visual.lineBetween(fromX, fromY, strongest.x, strongest.y);
        if (strongest.active) damageEnemy(strongest);
      } else if (species === "boar") {
        const y = command.fate === "return-grove" ? this.player.y + 52 : this.player.y - 80;
        const fromX = command.fate === "return-grove" ? this.player.x - 390 : this.player.x - 420;
        const toX = command.fate === "return-grove" ? this.player.x : this.player.x + 420;
        visual.lineStyle(18, color, 0.72);
        visual.lineBetween(fromX, y, toX, y);
        visual.fillStyle(color, 0.25);
        visual.fillTriangle(toX, y, toX - 44, y - 30, toX - 44, y + 30);
        for (const enemy of enemies.filter((candidate) => candidate.active && nearLine(candidate, fromX, y, toX, y, 58))) {
          damageEnemy(enemy);
        }
      } else if (species === "fox") {
        const fromX = this.player.x - 380;
        const fromY = this.player.y + (command.fate === "return-grove" ? -210 : 190);
        const toX = command.fate === "return-grove" ? this.player.x : this.player.x + 380;
        const toY = command.fate === "return-grove" ? this.player.y : this.player.y - 190;
        visual.lineStyle(7, color, 0.82);
        visual.lineBetween(fromX, fromY, toX, toY);
        visual.lineStyle(3, identity.secondary, 0.72);
        visual.lineBetween(fromX + 22, fromY, toX + 22, toY);
        for (const enemy of enemies.filter((candidate) => candidate.active && nearLine(candidate, fromX, fromY, toX, toY, 30))) {
          damageEnemy(enemy, 1.12);
        }
      } else {
        const centerX = this.player.x;
        const centerY = command.fate === "return-grove" ? this.player.y : this.player.y + 95;
        const radius = command.fate === "return-grove" ? 125 : 205;
        visual.lineStyle(9, color, 0.76);
        visual.strokeCircle(centerX, centerY, radius);
        for (let spoke = 0; spoke < 8; spoke += 1) {
          const spokeAngle = spoke / 8 * Math.PI * 2;
          visual.lineBetween(centerX, centerY, centerX + Math.cos(spokeAngle) * radius, centerY + Math.sin(spokeAngle) * radius);
        }
        for (const enemy of enemies.filter((candidate) => candidate.active && Phaser.Math.Distance.Between(candidate.x, candidate.y, centerX, centerY) <= radius)) {
          enemy.applySlow(0.18, 1200);
          damageEnemy(enemy, 0.72);
        }
      }
      visual.fillStyle(color, 0.9);
      if (species === "boar") visual.fillRoundedRect(this.player.x + Math.cos(angle) * 52 - 20, this.player.y + Math.sin(angle) * 52 - 12, 40, 24, 8);
      else if (species === "fox") visual.fillTriangle(this.player.x + Math.cos(angle) * 52 - 18, this.player.y + Math.sin(angle) * 52 + 14, this.player.x + Math.cos(angle) * 52, this.player.y + Math.sin(angle) * 52 - 20, this.player.x + Math.cos(angle) * 52 + 18, this.player.y + Math.sin(angle) * 52 + 14);
      else visual.strokeCircle(this.player.x + Math.cos(angle) * 52, this.player.y + Math.sin(angle) * 52, 21);
    });
    if (command.fate === "return-grove") {
      visual.lineStyle(7, identity.secondary, 0.9);
      visual.strokeCircle(this.player.x, this.player.y, 112);
    }
    this.tweens.add({ targets: visual, alpha: 0, scale: 1.12, duration: 900, onComplete: () => visual.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:ancestors-${command.fate}`);
  }

  private fireAuthoredAncientTreeCycle(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-ancient-tree-cycle" }>
  ): void {
    const x = command.x || this.player.x;
    const y = command.y || this.player.y;
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const tree = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(14);
    tree.lineStyle(command.worldTree ? 9 : 5, identity.accent, 0.78);
    for (let ring = 1; ring <= Math.max(1, command.rings); ring += 1) {
      tree.strokeCircle(x, y, command.rootRadius * ring / Math.max(1, command.rings));
    }
    tree.lineStyle(6, identity.secondary, 0.82);
    for (let sector = 0; sector < command.branchSectors; sector += 1) {
      const angle = sector / command.branchSectors * Math.PI * 2;
      tree.lineBetween(x, y, x + Math.cos(angle) * command.canopyRadius, y + Math.sin(angle) * command.canopyRadius);
    }
    tree.lineStyle(command.worldTree ? 12 : 5, identity.secondary, 0.55);
    tree.strokeCircle(x, y, command.canopyRadius);
    let enemies = (this.enemies.getChildren() as Enemy[]).filter((enemy) => enemy.active);
    const strongest = [...enemies].sort((a, b) => b.maxHealth - a.maxHealth)[0];
    if (command.law === "one-tree") enemies = strongest ? [strongest] : [];
    for (const enemy of enemies) {
      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (distance > command.canopyRadius + 14) continue;
      if (command.canopyFocus && distance > command.rootRadius && enemy.role !== "tribulation-boss" && enemy.maxHealth < 150) continue;
      const bossScale = enemy.role === "tribulation-boss" && command.law === "many-roots" ? 0.35 : 1;
      if (distance <= command.rootRadius) enemy.applySlow(0.18, 720);
      if (enemy.receiveDamage(command.damage * bossScale)) this.resolveEnemyDeath(enemy);
    }
    if (command.heal > 0) this.player.heal(command.heal);
    this.tweens.add({ targets: tree, alpha: 0, scale: 1.04, duration: 780, onComplete: () => tree.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:${command.worldTree ? "world-tree" : command.law}`);
  }

  private fireAuthoredHeavenfallBody(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-heavenfall-body" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    this.recordGongfaMotif(`${identity.motifId}:${command.committing ? "projected-landing" : "travel-body"}`);
    if (command.eligibleTargetIds.length === 0) return;
    const body = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(14);
    body.fillStyle(identity.accent, 0.2);
    body.fillCircle(command.x, command.y, command.radius);
    body.lineStyle(5, identity.secondary, 0.84);
    body.strokeCircle(command.x, command.y, command.radius);
    for (const targetId of command.eligibleTargetIds) {
      const enemy = this.getEnemyByCombatTargetId(targetId);
      if (!enemy?.active) continue;
      const angle = Phaser.Math.Angle.Between(command.x, command.y, enemy.x, enemy.y);
      enemy.applyForcedVelocity(angle, command.force, 260);
      if (enemy.receiveDamage(command.damage)) this.resolveEnemyDeath(enemy);
    }
    this.tweens.add({ targets: body, alpha: 0, scale: 1.3, duration: 260, onComplete: () => body.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:body-contact`);
  }

  private fireAuthoredStarDescent(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-star-descent" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const x = command.landingX;
    const y = command.landingY;
    const impact = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(16);
    impact.lineStyle(command.fate === "star-lance" ? 12 : 6, identity.secondary, 0.92);
    impact.lineBetween(command.originX, command.originY, x, y);
    impact.fillStyle(identity.accent, 0.32);
    if (command.fate === "crater") impact.fillCircle(x, y, command.radius);
    else {
      const forwardX = Math.cos(command.angle); const forwardY = Math.sin(command.angle);
      const sideX = -forwardY * command.radius; const sideY = forwardX * command.radius;
      impact.fillTriangle(
        x - sideX, y - sideY,
        x + forwardX * command.radius * 3, y + forwardY * command.radius * 3,
        x + sideX, y + sideY
      );
    }
    const hitPass = (fromX: number, fromY: number, toX: number, toY: number, scale: number): void => {
      const dx = toX - fromX; const dy = toY - fromY; const lengthSq = Math.max(1, dx * dx + dy * dy);
      for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active)) {
        const projection = Math.max(0, Math.min(1, ((enemy.x - fromX) * dx + (enemy.y - fromY) * dy) / lengthSq));
        const cx = fromX + dx * projection; const cy = fromY + dy * projection;
        const inCrater = command.fate === "crater" && Phaser.Math.Distance.Between(enemy.x, enemy.y, x, y) <= command.radius;
        if (!inCrater && Phaser.Math.Distance.Between(enemy.x, enemy.y, cx, cy) > command.radius + 12) continue;
        if (command.fate === "crater") enemy.applySlow(0.2, 1400);
        if (enemy.receiveDamage(command.damage * scale)) this.resolveEnemyDeath(enemy);
      }
    };
    hitPass(command.originX, command.originY, x, y, command.fate === "reverse-return" ? 0.68 : 1);
    if (command.fate === "reverse-return") {
      const returnX = command.returnX ?? command.originX;
      const returnY = command.returnY ?? command.originY;
      impact.lineStyle(5, identity.accent, 0.7);
      impact.lineBetween(x, y, returnX, returnY);
      hitPass(x, y, returnX, returnY, 0.52);
    }
    this.heavenfallBodyMarker?.destroy();
    this.heavenfallBodyMarker = undefined;
    this.tweens.add({ targets: impact, alpha: 0, scale: 1.12, duration: command.fate === "crater" ? 1050 : 620, onComplete: () => impact.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:${command.fate}`);
  }

  private fireAuthoredSunderingEdict(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-sundering-edict" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const seal = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(15);
    const onLine = (enemy: Enemy, line: (typeof command.lines)[number]): boolean => {
      const dx = Math.cos(line.angle); const dy = Math.sin(line.angle);
      const along = (enemy.x - line.x) * dx + (enemy.y - line.y) * dy;
      const across = Math.abs((enemy.x - line.x) * dy - (enemy.y - line.y) * dx);
      return Math.abs(along) <= line.length / 2 && across <= command.width + 12;
    };
    const physicalIds = new Set<number>();
    for (const line of command.lines) {
      const halfX = Math.cos(line.angle) * line.length / 2;
      const halfY = Math.sin(line.angle) * line.length / 2;
      seal.lineStyle(command.supreme ? 11 : 5, identity.accent, 0.85);
      seal.lineBetween(line.x - halfX, line.y - halfY, line.x + halfX, line.y + halfY);
      for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active && onLine(candidate, line))) {
        physicalIds.add(enemy.combatTargetId);
      }
    }
    for (const targetId of physicalIds) {
      const enemy = this.getEnemyByCombatTargetId(targetId);
      if (enemy?.active && enemy.receiveDamage(command.physicalDamage)) this.resolveEnemyDeath(enemy);
    }
    this.time.delayedCall(command.delayMs, () => {
      const judgmentIds = new Set<number>();
      const judgment = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(16);
      for (const line of command.lines) {
        const halfX = Math.cos(line.angle) * line.length / 2;
        const halfY = Math.sin(line.angle) * line.length / 2;
        judgment.lineStyle(command.supreme ? 15 : 8, identity.secondary, 0.96);
        judgment.lineBetween(line.x - halfX, line.y - halfY, line.x + halfX, line.y + halfY);
        for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active && onLine(candidate, line))) {
          judgmentIds.add(enemy.combatTargetId);
        }
      }
      let eliteDoubleHits = 0;
      const doubleHits = [...judgmentIds].filter((id) => physicalIds.has(id));
      for (const targetId of judgmentIds) {
        const enemy = this.getEnemyByCombatTargetId(targetId);
        if (!enemy?.active) continue;
        if (physicalIds.has(targetId) && (enemy.role === "tribulation-boss" || enemy.maxHealth >= 150)) eliteDoubleHits += 1;
        if (enemy.receiveDamage(command.judgmentDamage)) this.resolveEnemyDeath(enemy);
      }
      const runtime = this.gongfaCollection.byId[command.sourceGongfaId];
      if (runtime && !command.supreme) {
        const result = advanceGongfaRuntime(runtime, {
          kind: "authored-edict-result", doubleHits: doubleHits.length,
          partialHits: new Set([...physicalIds, ...judgmentIds]).size - doubleHits.length,
          eliteDoubleHits,
          lineQuality: doubleHits.length + eliteDoubleHits * 1.5 + command.lines.reduce((sum, line) => sum + line.length / 900, 0),
          lines: command.lines,
          learnedMasteryIds: runtime.mastery.masteryLearnedIds
        });
        this.gongfaCollection.byId[runtime.gongfaId] = result.runtime;
        if (this.gongfaCollection.primaryGongfaId === runtime.gongfaId) this.adoptPrimaryRuntime(result.runtime);
      }
      this.tweens.add({ targets: judgment, alpha: 0, duration: 420, onComplete: () => judgment.destroy() });
    });
    this.tweens.add({ targets: seal, alpha: 0.28, duration: command.delayMs, onComplete: () => seal.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:${command.supreme ? "supreme-record" : "fixed-double-line"}`);
  }

  private fireAuthoredFallingSun(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-falling-sun" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    let resolved = 0;
    let totalHits = 0;
    let centerHits = 0;
    for (const seal of command.seals) {
      const omen = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(12);
      const layers = command.supreme ? 9 : 3;
      for (let layer = 1; layer <= layers; layer += 1) {
        omen.lineStyle(command.supreme ? 3 : 2, layer % 2 ? identity.accent : identity.secondary, 0.5 + layer / layers * 0.35);
        omen.strokeCircle(seal.x, seal.y, command.radius * layer / layers);
      }
      omen.fillStyle(identity.accent, 0.12);
      omen.fillCircle(seal.x, seal.y, command.centerRadius);
      this.time.delayedCall(seal.delayMs, () => {
        const impact = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(17);
        impact.fillStyle(identity.secondary, 0.82);
        impact.fillCircle(seal.x, seal.y, command.centerRadius);
        impact.lineStyle(command.supreme ? 18 : 9, identity.accent, 0.95);
        impact.strokeCircle(seal.x, seal.y, command.radius);
        for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active)) {
          const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, seal.x, seal.y);
          if (distance > command.radius + 12) continue;
          totalHits += 1;
          const center = distance <= command.centerRadius;
          if (center) centerHits += 1;
          const edgeScale = center ? 1.55 : Math.max(0.28, 1 - distance / command.radius * 0.65);
          if (enemy.receiveDamage(command.damage * edgeScale)) this.resolveEnemyDeath(enemy);
        }
        resolved += 1;
        omen.destroy();
        this.tweens.add({ targets: impact, alpha: 0, scale: 1.22, duration: 650, onComplete: () => impact.destroy() });
        if (resolved === command.seals.length) {
          const runtime = this.gongfaCollection.byId[command.sourceGongfaId];
          if (runtime) {
            const result = advanceGongfaRuntime(runtime, {
              kind: "authored-sun-result", hitCount: totalHits, centerHits,
              missed: totalHits === 0, supreme: command.supreme,
              learnedMasteryIds: runtime.mastery.masteryLearnedIds
            });
            this.gongfaCollection.byId[runtime.gongfaId] = result.runtime;
            if (this.gongfaCollection.primaryGongfaId === runtime.gongfaId) this.adoptPrimaryRuntime(result.runtime);
          }
        }
      });
    }
    this.recordGongfaMotif(`${identity.motifId}:${command.supreme ? "nine-in-one" : "fixed-prediction"}`);
  }

  private fireAuthoredScarletTides(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-scarlet-tides" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const visual = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(14);
    const hitLine = (fromX: number, fromY: number, toX: number, toY: number, width: number, damage: number, push = 0): void => {
      const dx = toX - fromX; const dy = toY - fromY; const lengthSq = Math.max(1, dx * dx + dy * dy);
      for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active)) {
        const t = Math.max(0, Math.min(1, ((enemy.x - fromX) * dx + (enemy.y - fromY) * dy) / lengthSq));
        const cx = fromX + dx * t; const cy = fromY + dy * t;
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, cx, cy) > width + 12) continue;
        if (push > 0 && enemy.role !== "tribulation-boss") enemy.applyForcedVelocity(Math.atan2(dy, dx), push, 320);
        if (enemy.receiveDamage(damage)) this.resolveEnemyDeath(enemy);
      }
    };
    for (const wave of command.waves) {
      const hx = Math.cos(wave.angle) * wave.length / 2;
      const hy = Math.sin(wave.angle) * wave.length / 2;
      visual.lineStyle(wave.width, identity.accent, command.supreme ? 0.52 : 0.68);
      visual.lineBetween(wave.x - hx, wave.y - hy, wave.x + hx, wave.y + hy);
      hitLine(wave.x - hx, wave.y - hy, wave.x + hx, wave.y + hy, wave.width / 2, command.damage, command.supreme ? 170 : 0);
    }
    if (command.seam) {
      visual.lineStyle(command.immediateSeam ? command.seam.width + 10 : command.seam.width, identity.secondary, 0.95);
      visual.lineBetween(command.seam.from.x, command.seam.from.y, command.seam.to.x, command.seam.to.y);
      hitLine(command.seam.from.x, command.seam.from.y, command.seam.to.x, command.seam.to.y, command.seam.width / 2, command.seamDamage);
      if (command.reverse) {
        this.time.delayedCall(320, () => hitLine(
          command.seam!.to.x, command.seam!.to.y, command.seam!.from.x, command.seam!.from.y,
          command.seam!.width / 2, command.seamDamage * 0.55
        ));
      }
    }
    this.tweens.add({
      targets: visual,
      x: command.seam && !command.immediateSeam ? (command.seam.to.x - command.seam.from.x) * 0.18 : 0,
      y: command.seam && !command.immediateSeam ? (command.seam.to.y - command.seam.from.y) * 0.18 : 0,
      alpha: 0, duration: command.durationMs, onComplete: () => visual.destroy()
    });
    this.recordGongfaMotif(`${identity.motifId}:${command.supreme ? "sunset-divide" : command.seam ? "confluence" : "waiting-tide"}`);
  }

  private applyAuthoredMoonOrbit(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-moon-orbit" }>
  ): void {
    for (const orbiter of command.orbiters) {
      const enemy = this.getEnemyByCombatTargetId(orbiter.targetId);
      const moon = command.moons[orbiter.moonIndex];
      if (!enemy?.active || !moon) continue;
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      if (command.suspend) {
        if (!this.moonfallVelocityRecord.has(orbiter.targetId)) {
          this.moonfallVelocityRecord.set(orbiter.targetId, { x: body.velocity.x, y: body.velocity.y });
        }
        enemy.applyForcedVelocity(0, 0, 150);
        continue;
      }
      const inwardAngle = Math.atan2(moon.y - enemy.y, moon.x - enemy.x);
      const tangentAngle = inwardAngle + Math.PI / 2;
      const vx = Math.cos(tangentAngle) * command.tangentForce + Math.cos(inwardAngle) * command.inwardForce;
      const vy = Math.sin(tangentAngle) * command.tangentForce + Math.sin(inwardAngle) * command.inwardForce;
      enemy.applyForcedVelocity(Math.atan2(vy, vx), Math.hypot(vx, vy), 150);
    }
  }

  private fireAuthoredMoonResolution(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-moon-resolution" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const visual = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(18);
    visual.fillStyle(0x10142e, command.supreme ? 0.9 : 0.72);
    visual.fillCircle(command.x, command.y, command.supreme ? 92 : 48);
    visual.lineStyle(command.supreme ? 14 : 7, identity.secondary, 0.94);
    visual.strokeCircle(command.x, command.y, command.supreme ? 150 : 84 + command.syzygy * 42);
    for (const targetId of command.targetIds) {
      const enemy = this.getEnemyByCombatTargetId(targetId);
      if (!enemy?.active) continue;
      const inwardAngle = Math.atan2(command.y - enemy.y, command.x - enemy.x);
      if (command.fate === "collapse") {
        enemy.applyForcedVelocity(inwardAngle, command.force, 420);
      } else if (command.fate === "release") {
        enemy.applyForcedVelocity(inwardAngle + Math.PI / 2, command.force, 520);
        this.time.delayedCall(320, () => {
          if (!enemy.active) return;
          const collided = (this.enemies.getChildren() as Enemy[]).find((candidate) =>
            candidate.active && candidate !== enemy && Phaser.Math.Distance.Between(candidate.x, candidate.y, enemy.x, enemy.y) <= 48
          );
          if (!collided) return;
          if (enemy.receiveDamage(command.damage * 0.72)) this.resolveEnemyDeath(enemy);
          if (collided.active && collided.receiveDamage(command.damage * 0.48)) this.resolveEnemyDeath(collided);
        });
      } else if (command.fate === "suspend") {
        enemy.applySlow(0.08, 1700);
        enemy.applyForcedVelocity(0, 0, 1700);
      } else {
        const stored = this.moonfallVelocityRecord.get(targetId) ?? { x: 0, y: 0 };
        const storedSpeed = Math.hypot(stored.x, stored.y);
        const bentX = stored.x * 0.45 + Math.cos(inwardAngle) * (command.force + storedSpeed * 0.9);
        const bentY = stored.y * 0.45 + Math.sin(inwardAngle) * (command.force + storedSpeed * 0.9);
        enemy.applyForcedVelocity(Math.atan2(bentY, bentX), Math.hypot(bentX, bentY), 650);
      }
      const damageScale = command.fate === "suspend" ? 0.35 : command.fate === "release" ? 0.72 :
        command.fate === "eclipse" ? 1 + Math.min(0.75, Math.hypot(
          this.moonfallVelocityRecord.get(targetId)?.x ?? 0,
          this.moonfallVelocityRecord.get(targetId)?.y ?? 0
        ) / 360) : 1;
      if (command.fate !== "release" && enemy.receiveDamage(command.damage * damageScale)) this.resolveEnemyDeath(enemy);
    }
    if (command.fate === "eclipse") this.moonfallVelocityRecord.clear();
    this.tweens.add({ targets: visual, alpha: 0, scale: command.fate === "collapse" ? 0.35 : 1.55, duration: 720, onComplete: () => visual.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:${command.fate}`);
  }

  private syncMoonfallMarker(runtime: GongfaRuntime): void {
    const moons = runtime.authored.anchors.filter((anchor) => anchor.kind === "moon");
    if (moons.length === 0) {
      this.moonfallMarker?.destroy();
      this.moonfallMarker = undefined;
      if (runtime.authored.phase !== 2) this.moonfallVelocityRecord.clear();
      return;
    }
    const identity = getGongfaVisualIdentity(runtime.gongfaId);
    const marker = this.moonfallMarker ?? this.add.graphics().setDepth(14);
    this.moonfallMarker = marker;
    marker.clear();
    for (const [index, moon] of moons.entries()) {
      const radius = runtime.authored.phase === 2 ? 72 : moons.length > 1 ? 34 : 46;
      marker.fillStyle(0x0d1230, 0.82);
      marker.fillCircle(moon.x, moon.y, radius);
      marker.lineStyle(runtime.authored.phase === 2 ? 8 : 4, index % 2 ? identity.secondary : identity.accent, 0.9);
      marker.strokeCircle(moon.x, moon.y, radius);
      marker.lineStyle(2, identity.secondary, 0.42);
      marker.beginPath();
      marker.arc(moon.x, moon.y, radius + 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * runtime.authored.resource);
      marker.strokePath();
    }
    for (const orbiter of runtime.authored.anchors.filter((anchor) => anchor.kind === "orbiter" && anchor.targetId !== undefined)) {
      const target = this.getEnemyByCombatTargetId(orbiter.targetId!);
      const moon = moons[orbiter.chainId ?? 0];
      if (!target?.active || !moon) continue;
      marker.lineStyle(2, identity.secondary, 0.28);
      marker.lineBetween(moon.x, moon.y, target.x, target.y);
      marker.fillStyle(identity.secondary, 0.72);
      marker.fillCircle(target.x, target.y, 4);
    }
  }

  private fireAuthoredGlyphInvocation(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-glyph-invocation" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const pulses = Math.max(1, command.payoff === "repeat" ? command.repeatCount : 1);
    const targetX = command.target?.x ?? command.x + command.radius;
    const targetY = command.target?.y ?? command.y;
    const pointToSegment = (px: number, py: number, ax: number, ay: number, bx: number, by: number): number => {
      const dx = bx - ax; const dy = by - ay; const lengthSq = Math.max(1, dx * dx + dy * dy);
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
      return Phaser.Math.Distance.Between(px, py, ax + dx * t, ay + dy * t);
    };
    for (let pulse = 0; pulse < pulses; pulse += 1) {
      this.time.delayedCall(pulse * 330, () => {
        const progress = pulses <= 1 ? 0 : pulse / (pulses - 1);
        const travel = command.motion === "traveling" ? progress : 0;
        const cx = Phaser.Math.Linear(command.x, targetX, travel * 0.72);
        const cy = Phaser.Math.Linear(command.y, targetY, travel * 0.72);
        const radius = command.radius * (command.motion === "contracting" ? 1 - progress * 0.48 : 1);
        const visual = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(15);
        if (command.shape === "root-circle") {
          visual.lineStyle(8, identity.accent, 0.84);
          visual.strokeCircle(cx, cy, radius);
          visual.lineStyle(3, identity.secondary, 0.7);
          for (let root = 0; root < 6; root += 1) {
            const angle = root * Math.PI / 3;
            visual.lineBetween(cx, cy, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
          }
        } else if (command.shape === "leaf-route") {
          visual.lineStyle(13, identity.accent, 0.72);
          visual.lineBetween(cx, cy, targetX, targetY);
          const angle = Math.atan2(targetY - cy, targetX - cx);
          for (let leaf = 1; leaf <= 4; leaf += 1) {
            const t = leaf / 5; const lx = Phaser.Math.Linear(cx, targetX, t); const ly = Phaser.Math.Linear(cy, targetY, t);
            visual.fillStyle(identity.secondary, 0.82);
            visual.fillEllipse(lx + Math.cos(angle + Math.PI / 2) * (leaf % 2 ? 10 : -10), ly + Math.sin(angle + Math.PI / 2) * (leaf % 2 ? 10 : -10), 20, 9);
          }
        } else {
          const tx = command.target?.x ?? cx; const ty = command.target?.y ?? cy;
          visual.lineStyle(8, identity.secondary, 0.9);
          visual.beginPath();
          for (let corner = 0; corner <= 3; corner += 1) {
            const angle = -Math.PI / 2 + (corner % 3) * Math.PI * 2 / 3;
            const x = tx + Math.cos(angle) * radius; const y = ty + Math.sin(angle) * radius;
            if (corner === 0) visual.moveTo(x, y); else visual.lineTo(x, y);
          }
          visual.strokePath();
        }
        let hitCount = 0;
        for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active)) {
          const hit = command.shape === "root-circle" ? Phaser.Math.Distance.Between(enemy.x, enemy.y, cx, cy) <= radius :
            command.shape === "leaf-route" ? pointToSegment(enemy.x, enemy.y, cx, cy, targetX, targetY) <= 32 :
              Phaser.Math.Distance.Between(enemy.x, enemy.y, command.target?.x ?? cx, command.target?.y ?? cy) <= radius;
          if (!hit) continue;
          hitCount += 1;
          if (command.payoff === "bind") enemy.applySlow(0.12, 900 + command.power * 320);
          if (enemy.receiveDamage(command.damage * (pulse > 0 ? 0.62 : 1))) this.resolveEnemyDeath(enemy);
        }
        if (command.payoff === "bind" && hitCount > 0) this.player.heal(Math.max(1, command.power * 1.5));
        if (command.clearProjectiles) {
          for (const hazard of [...this.activeBossHazards]) {
            if (Phaser.Math.Distance.Between(hazard.x, hazard.y, cx, cy) > radius) continue;
            hazard.destroy(); this.activeBossHazards.delete(hazard);
          }
        }
        this.tweens.add({ targets: visual, alpha: 0, scale: command.motion === "contracting" ? 0.55 : 1.12, duration: 430, onComplete: () => visual.destroy() });
      });
    }
    this.recordGongfaMotif(`${identity.motifId}:${command.shape}:${command.motion}:${command.payoff}`);
  }

  private fireAuthoredSproutSun(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-sprout-sun" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const root = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(16);
    root.lineStyle(10, identity.accent, 0.9);
    root.strokeCircle(command.x, command.y, command.radius);
    for (let spoke = 0; spoke < 8; spoke += 1) {
      const angle = spoke * Math.PI / 4;
      root.lineBetween(command.x, command.y, command.x + Math.cos(angle) * command.radius, command.y + Math.sin(angle) * command.radius);
    }
    for (const enemy of this.getEnemiesWithinRadiusFrom(command.x, command.y, command.radius)) {
      enemy.applySlow(0.1, command.phaseDelayMs * 2);
      if (enemy.receiveDamage(command.rootDamage)) this.resolveEnemyDeath(enemy);
    }
    this.time.delayedCall(command.phaseDelayMs, () => {
      const leaves = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(17);
      leaves.lineStyle(18, identity.secondary, 0.58);
      for (let route = 0; route < 6; route += 1) {
        const angle = route * Math.PI / 3 + Math.PI / 6;
        leaves.lineBetween(command.x - Math.cos(angle) * command.radius, command.y - Math.sin(angle) * command.radius,
          command.x + Math.cos(angle) * command.radius, command.y + Math.sin(angle) * command.radius);
      }
      for (const enemy of this.getEnemiesWithinRadiusFrom(command.x, command.y, command.radius)) {
        if (enemy.receiveDamage(command.leafDamage)) this.resolveEnemyDeath(enemy);
      }
      this.tweens.add({ targets: leaves, alpha: 0, duration: command.phaseDelayMs, onComplete: () => leaves.destroy() });
    });
    this.time.delayedCall(command.phaseDelayMs * 2, () => {
      const sun = this.applyGongfaEffectVisualHierarchy(this.add.graphics(), command.sourceGongfaId).setDepth(18);
      sun.fillStyle(identity.secondary, 0.3); sun.fillCircle(command.x, command.y, command.radius * 0.32);
      sun.lineStyle(12, identity.accent, 0.96);
      for (let thorn = 0; thorn < 12; thorn += 1) {
        const angle = thorn * Math.PI / 6;
        sun.lineBetween(command.x + Math.cos(angle) * command.radius * 0.24, command.y + Math.sin(angle) * command.radius * 0.24,
          command.x + Math.cos(angle) * command.radius, command.y + Math.sin(angle) * command.radius);
      }
      for (const enemy of this.getEnemiesWithinRadiusFrom(command.x, command.y, command.radius)) {
        if (enemy.receiveDamage(command.thornDamage)) this.resolveEnemyDeath(enemy);
      }
      root.destroy();
      this.tweens.add({ targets: sun, alpha: 0, scale: 1.18, duration: 520, onComplete: () => sun.destroy() });
    });
    this.recordGongfaMotif(`${identity.motifId}:root-leaf-thorn-sprout-sun`);
  }

  private syncVerdantGlyphMarker(runtime: GongfaRuntime): void {
    const glyphs = runtime.authored.anchors.filter((anchor) => anchor.kind === "glyph").flatMap((anchor) => anchor.glyph ? [anchor.glyph] : []);
    if (glyphs.length === 0) {
      this.verdantGlyphMarker?.destroy(); this.verdantGlyphMarker = undefined; return;
    }
    const identity = getGongfaVisualIdentity(runtime.gongfaId);
    const marker = this.verdantGlyphMarker ?? this.add.graphics().setDepth(19);
    this.verdantGlyphMarker = marker; marker.clear();
    glyphs.forEach((glyph, index) => {
      const x = (index - 1) * 30; const y = -54;
      if (glyph === "root") {
        marker.lineStyle(4, identity.accent, 0.95); marker.strokeRect(x - 9, y - 9, 18, 18);
        marker.lineBetween(x, y - 9, x, y + 9); marker.lineBetween(x - 9, y, x + 9, y);
      } else if (glyph === "leaf") {
        marker.fillStyle(identity.accent, 0.9); marker.fillEllipse(x, y, 22, 12);
        marker.lineStyle(2, identity.secondary, 0.9); marker.lineBetween(x - 8, y + 5, x + 8, y - 5);
      } else {
        marker.lineStyle(4, identity.secondary, 0.95); marker.strokeTriangle(x, y - 11, x - 11, y + 9, x + 11, y + 9);
      }
    });
    marker.setPosition(this.player.x, this.player.y);
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

  private syncAuthoredMirrorFacets(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-mirror-facets" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    this.iceMirrorMarker ??= this.applyGongfaEffectVisualHierarchy(
      this.add.graphics(), command.sourceGongfaId
    ).setDepth(17);
    const visual = this.iceMirrorMarker;
    visual.clear().setPosition(this.player.x, this.player.y);
    for (const facet of command.facets) {
      const cx = Math.cos(facet.angle) * command.radius;
      const cy = Math.sin(facet.angle) * command.radius;
      const tangentX = Math.cos(facet.angle + Math.PI / 2);
      const tangentY = Math.sin(facet.angle + Math.PI / 2);
      const radialX = Math.cos(facet.angle);
      const radialY = Math.sin(facet.angle);
      const halfWidth = Math.max(10, command.radius * Math.tan(command.arcWidth / 2));
      if (facet.durability > 0) {
        visual.fillStyle(command.shell ? identity.secondary : identity.accent, command.shell ? 0.7 : 0.42);
        visual.lineStyle(2 + facet.durability, identity.secondary, 0.96);
      } else if (facet.lingering) {
        visual.fillStyle(identity.accent, 0.08);
        visual.lineStyle(2, identity.accent, 0.42);
      } else {
        visual.lineStyle(1, identity.accent, 0.18);
      }
      visual.beginPath();
      visual.moveTo(cx + tangentX * halfWidth, cy + tangentY * halfWidth);
      visual.lineTo(cx + radialX * 13, cy + radialY * 13);
      visual.lineTo(cx - tangentX * halfWidth, cy - tangentY * halfWidth);
      visual.lineTo(cx - radialX * 10, cy - radialY * 10);
      visual.closePath();
      if (facet.durability > 0 || facet.lingering) visual.fillPath();
      visual.strokePath();
      if (facet.durability < facet.maxDurability) {
        visual.lineStyle(1.5, 0xffffff, 0.68);
        visual.lineBetween(cx - 8, cy - 12, cx + 5, cy + 11);
        visual.lineBetween(cx + 5, cy + 11, cx + 12, cy - 2);
      }
    }
    this.recordGongfaMotif(`${identity.motifId}:${command.shell ? "closed-lotus" : "directional-facets"}`);
  }

  private syncAuthoredIronwoodWalls(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-ironwood-walls" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    this.ironwoodRampartMarker ??= this.applyGongfaEffectVisualHierarchy(
      this.add.graphics(), command.sourceGongfaId
    ).setDepth(15);
    const visual = this.ironwoodRampartMarker;
    visual.clear();
    if (command.walls.length === 0) return;
    for (const wall of command.walls) {
      const tangentX = Math.cos(wall.angle + Math.PI / 2);
      const tangentY = Math.sin(wall.angle + Math.PI / 2);
      const normalX = Math.cos(wall.angle);
      const normalY = Math.sin(wall.angle);
      const halfLength = wall.length / 2;
      const halfThickness = wall.thickness / 2;
      const durabilityRatio = Math.max(0, Math.min(1, wall.durability / Math.max(1, wall.maxDurability)));
      const driving = wall.mode === "driving" || wall.mode === "citadel-drive";
      visual.fillStyle(driving ? identity.secondary : identity.accent, 0.25 + durabilityRatio * 0.42);
      visual.lineStyle(wall.mode === "citadel" ? 5 : 3, identity.secondary, 0.9);
      visual.beginPath();
      visual.moveTo(wall.x + tangentX * halfLength + normalX * halfThickness, wall.y + tangentY * halfLength + normalY * halfThickness);
      visual.lineTo(wall.x - tangentX * halfLength + normalX * halfThickness, wall.y - tangentY * halfLength + normalY * halfThickness);
      visual.lineTo(wall.x - tangentX * halfLength - normalX * halfThickness, wall.y - tangentY * halfLength - normalY * halfThickness);
      visual.lineTo(wall.x + tangentX * halfLength - normalX * halfThickness, wall.y + tangentY * halfLength - normalY * halfThickness);
      visual.closePath().fillPath().strokePath();
      const beamCount = Math.max(2, Math.floor(wall.length / 42));
      visual.lineStyle(2, 0x3c2b1d, 0.72);
      for (let beam = 1; beam < beamCount; beam += 1) {
        const offset = -halfLength + wall.length * beam / beamCount;
        visual.lineBetween(
          wall.x + tangentX * offset - normalX * halfThickness,
          wall.y + tangentY * offset - normalY * halfThickness,
          wall.x + tangentX * offset + normalX * halfThickness,
          wall.y + tangentY * offset + normalY * halfThickness
        );
      }
      if (wall.mode === "citadel-drive") {
        visual.lineStyle(2, identity.accent, 0.88);
        for (let splinter = 0; splinter < 4; splinter += 1) {
          const offset = -halfLength * 0.72 + splinter * halfLength * 0.48;
          visual.lineBetween(
            wall.x + tangentX * offset - normalX * (halfThickness + 5),
            wall.y + tangentY * offset - normalY * (halfThickness + 5),
            wall.x + tangentX * (offset + 13) - normalX * (halfThickness + 20),
            wall.y + tangentY * (offset + 13) - normalY * (halfThickness + 20)
          );
        }
      }

      for (const enemy of this.enemies.getChildren() as Enemy[]) {
        if (!enemy.active) continue;
        const dx = enemy.x - wall.x; const dy = enemy.y - wall.y;
        const forward = dx * normalX + dy * normalY;
        const sideways = -dx * normalY + dy * normalX;
        if (Math.abs(forward) > halfThickness + 18 || Math.abs(sideways) > halfLength + 14) continue;
        const body = enemy.body as Phaser.Physics.Arcade.Body;
        const outward = forward >= 0 ? 1 : -1;
        if (enemy.role !== "tribulation-boss") {
          body.setVelocity(normalX * command.pushStrength * outward, normalY * command.pushStrength * outward);
        }
        if (driving) {
          const damage = command.damage * Math.max(0, command.deltaMs) / 1000;
          if (damage > 0 && enemy.receiveDamage(damage)) this.resolveEnemyDeath(enemy);
        }
      }
    }
    const mode = command.walls.some((wall) => wall.mode === "citadel-drive") ? "citadel-outward-splinters" :
      command.walls.some((wall) => wall.mode === "citadel") ? "four-wall-citadel" :
      command.walls.some((wall) => wall.mode === "driving") ? "driven-rampart" : "rooted-rampart";
    const motif = `${identity.motifId}:${mode}`;
    if (!this.recentGongfaMotifs.includes(motif)) this.recordGongfaMotif(motif);
  }

  private syncAuthoredGengjinBrace(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-gengjin-brace" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    this.gengjinBraceMarker ??= this.applyGongfaEffectVisualHierarchy(
      this.add.graphics(), command.sourceGongfaId
    ).setDepth(16);
    const visual = this.gengjinBraceMarker;
    visual.clear().setPosition(this.player.x, this.player.y);
    const fill = Math.max(0, Math.min(1, command.guard / Math.max(1, command.capacity)));
    const radius = 38 + fill * 9;
    for (let plate = 0; plate < 6; plate += 1) {
      const angle = plate * Math.PI / 3;
      const nextAngle = angle + Math.PI / 3;
      const inner = radius - 9;
      visual.fillStyle(command.disabled ? 0x5a4c42 : identity.secondary, 0.12 + fill * 0.34);
      visual.lineStyle(command.shield > 0 ? 5 : 2.5, command.shield > 0 ? 0xffe89a : identity.accent, command.disabled ? 0.3 : 0.85);
      visual.beginPath();
      visual.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      visual.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      visual.lineTo(Math.cos(nextAngle) * radius, Math.sin(nextAngle) * radius);
      visual.lineTo(Math.cos(nextAngle) * inner, Math.sin(nextAngle) * inner);
      visual.closePath().fillPath().strokePath();
    }
    visual.lineStyle(2, 0x251d17, 0.9);
    for (let crack = 0; crack < command.fractures; crack += 1) {
      const angle = -Math.PI / 2 + crack * 0.72;
      visual.lineBetween(
        Math.cos(angle) * (radius - 13), Math.sin(angle) * (radius - 13),
        Math.cos(angle + 0.16) * (radius + 3), Math.sin(angle + 0.16) * (radius + 3)
      );
    }
    const motif = `${identity.motifId}:tempered-brace:${command.fractures}`;
    if (!this.recentGongfaMotifs.includes(motif)) this.recordGongfaMotif(motif);
  }

  private applyAuthoredGengjinReflection(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-gengjin-reflection" }>
  ): void {
    const enemy = this.getEnemyByCombatTargetId(command.targetId);
    if (!enemy?.active) return;
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const edge = this.add.graphics().setDepth(18).lineStyle(5, identity.secondary, 0.94);
    edge.lineBetween(this.player.x, this.player.y, enemy.x, enemy.y);
    this.tweens.add({ targets: edge, alpha: 0, duration: 180, onComplete: () => edge.destroy() });
    if (enemy.receiveDamage(command.amount)) this.resolveEnemyDeath(enemy);
    this.recordGongfaMotif(`${identity.motifId}:rebounding-edge-armor`);
  }

  private applyAuthoredGengjinRelease(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-gengjin-release" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    const visual = this.add.graphics().setDepth(19);
    if (command.law === "shield") {
      visual.lineStyle(7, 0xffe89a, 0.94).strokeCircle(this.player.x, this.player.y, 58);
    } else {
      visual.lineStyle(command.law === "single" ? 9 : 4, identity.secondary, 0.95);
      for (const allocation of command.allocations) {
        const enemy = this.getEnemyByCombatTargetId(allocation.targetId);
        if (!enemy?.active) continue;
        visual.lineBetween(this.player.x, this.player.y, enemy.x, enemy.y);
        if (enemy.receiveDamage(allocation.amount)) this.resolveEnemyDeath(enemy);
      }
    }
    this.tweens.add({ targets: visual, alpha: 0, scale: 1.12, duration: 360, onComplete: () => visual.destroy() });
    this.recordGongfaMotif(`${identity.motifId}:conserved-release:${command.law}`);
  }

  private fireAuthoredMirrorReflection(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-mirror-reflection" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    for (const angle of command.angles) {
      for (let shard = 0; shard < command.shardsPerAngle; shard += 1) {
        const spread = (shard - (command.shardsPerAngle - 1) / 2) * 0.11;
        const shardAngle = angle + spread;
        const visual = this.applyGongfaEffectVisualHierarchy(
          this.add.graphics(), command.sourceGongfaId
        ).setDepth(18);
        visual.lineStyle(6, identity.secondary, 0.92);
        visual.lineBetween(
          this.player.x,
          this.player.y,
          this.player.x + Math.cos(shardAngle) * command.range,
          this.player.y + Math.sin(shardAngle) * command.range
        );
        this.tweens.add({ targets: visual, alpha: 0, duration: 260, onComplete: () => visual.destroy() });
      }
      const forwardX = Math.cos(angle);
      const forwardY = Math.sin(angle);
      for (const enemy of (this.enemies.getChildren() as Enemy[]).filter((candidate) => candidate.active)) {
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const forward = dx * forwardX + dy * forwardY;
        const sideways = Math.abs(dx * -forwardY + dy * forwardX);
        if (forward < 0 || forward > command.range || sideways > command.width) continue;
        if (enemy.receiveDamage(command.damage * command.shardsPerAngle)) this.resolveEnemyDeath(enemy);
      }
    }
    this.recordGongfaMotif(`${identity.motifId}:recorded-direction-reflection`);
  }

  private applyAuthoredBurningCorona(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-burning-corona" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    this.burningCoronaMarker ??= this.applyGongfaEffectVisualHierarchy(
      this.add.graphics(),
      command.sourceGongfaId
    ).setDepth(16);
    const visual = this.burningCoronaMarker;
    visual.clear().setPosition(this.player.x, this.player.y);

    const activeEnemies = (this.enemies.getChildren() as Enemy[]).filter((enemy) => enemy.active);
    const hitCounts = new Map<number, number>();
    for (const ring of command.rings) {
      const step = (Math.PI * 2) / ring.segmentCount;
      const orbit = command.rotation * ring.direction;
      visual.lineStyle(command.guard ? 12 : 9, command.guard ? identity.secondary : identity.accent, command.guard ? 0.98 : 0.88);
      for (let segment = 0; segment < ring.visibleSegments; segment += 1) {
        const center = orbit + segment * step;
        visual.beginPath();
        visual.arc(0, 0, ring.radius, center - step * ring.arcFraction / 2, center + step * ring.arcFraction / 2);
        visual.strokePath();
      }

      for (const enemy of activeEnemies) {
        if (!enemy.active) continue;
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const distance = Math.hypot(dx, dy);
        if (Math.abs(distance - ring.radius) > 25) continue;
        const relative = Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - orbit);
        const wrapped = (relative + Math.PI * 2) % (Math.PI * 2);
        const slot = Math.floor((wrapped + step / 2) / step) % ring.segmentCount;
        const slotCenter = slot * step;
        const fromCenter = Math.abs(Phaser.Math.Angle.Wrap(wrapped - slotCenter));
        const onSegment = slot < ring.visibleSegments && fromCenter <= step * ring.arcFraction / 2;
        if (!onSegment) {
          if (command.sunspotLure) {
            enemy.applySlow(0.42, 360);
            this.burningSunspotEntrants.add(enemy.combatTargetId);
          }
          continue;
        }
        const caught = this.burningSunspotEntrants.delete(enemy.combatTargetId);
        const damage = Math.max(1, Math.floor(ring.damage * (caught ? 1.85 : 1)));
        hitCounts.set(enemy.combatTargetId, (hitCounts.get(enemy.combatTargetId) ?? 0) + 1);
        if (enemy.receiveDamage(damage)) this.resolveEnemyDeath(enemy);
      }
    }

    // Intersections are deliberately stronger because an enemy can contact
    // both independently rotating rings during the same sample.
    for (const [targetId, hits] of hitCounts) {
      if (hits < 2) continue;
      const enemy = this.getEnemyByCombatTargetId(targetId);
      if (enemy?.active && enemy.receiveDamage(Math.max(1, Math.floor(this.combatState.damage * 0.55)))) {
        this.resolveEnemyDeath(enemy);
      }
    }
    if (command.guard) {
      this.pushEnemiesAwayFrom(this.player.x, this.player.y, 152, command.pushStrength);
      for (const hazard of [...this.activeBossHazards]) {
        if (Phaser.Math.Distance.Between(hazard.x, hazard.y, this.player.x, this.player.y) > 154) continue;
        hazard.destroy();
        this.activeBossHazards.delete(hazard);
      }
    }
    this.recordGongfaMotif(`${identity.motifId}:${command.guard ? "complete-guard" : "broken-corona"}`);
  }

  private syncAuthoredCrimsonNetwork(
    command: Extract<GongfaRuntimeCommand, { kind: "authored-crimson-network" }>
  ): void {
    const identity = getGongfaVisualIdentity(command.sourceGongfaId);
    this.crimsonFurnaceNetworkMarker ??= this.applyGongfaEffectVisualHierarchy(
      this.add.graphics(), command.sourceGongfaId
    ).setDepth(13);
    const visual = this.crimsonFurnaceNetworkMarker;
    visual.clear();
    const byId = new Map(command.nodes.map((node) => [node.targetId, node]));
    const pressureAlpha = 0.35 + Math.min(1, command.pressure / 100) * 0.55;
    for (const link of command.links) {
      const from = byId.get(link.fromTargetId);
      const to = byId.get(link.toTargetId);
      if (!from || !to) continue;
      visual.lineStyle(command.pressure >= 58 ? 4 : 2, identity.secondary, pressureAlpha);
      visual.lineBetween(from.x, from.y, to.x, to.y);
      visual.lineStyle(1, 0x2a0b08, 0.8);
      visual.lineBetween(from.x + 3, from.y + 3, to.x + 3, to.y + 3);
    }
    for (const node of command.nodes) {
      const radius = 8 + Math.min(5, node.nodeCount) * 2.5;
      visual.fillStyle(node.ground ? 0x5a2419 : identity.accent, node.ground ? 0.55 : 0.82);
      visual.lineStyle(node.core ? 4 : 2, node.core ? 0xffe18a : identity.secondary, 0.95);
      visual.fillCircle(node.x, node.y, radius);
      visual.strokeCircle(node.x, node.y, radius + (node.core ? 5 : 1));
      for (let needle = 0; needle < node.nodeCount; needle += 1) {
        const angle = needle * Math.PI * 2 / Math.max(1, node.nodeCount) - Math.PI / 2;
        visual.lineBetween(
          node.x + Math.cos(angle) * (radius - 2), node.y + Math.sin(angle) * (radius - 2),
          node.x + Math.cos(angle) * (radius + 9), node.y + Math.sin(angle) * (radius + 9)
        );
      }
    }
    if (command.nodes.length > 0) {
      const motif = command.ignition
        ? command.ignition.followUp ? "one-follow-up-chain" : "core-propagation"
        : command.links.length > command.nodes.length ? "looped-furnace" : "living-node-network";
      this.recordGongfaMotif(`${identity.motifId}:${motif}`);
    }
    if (!command.ignition) return;

    const ignition = command.ignition;
    const orderedIds = [...ignition.targetIds].sort((a, b) =>
      Number(!(byId.get(a)?.core)) - Number(!(byId.get(b)?.core))
    );
    orderedIds.forEach((targetId, index) => {
      this.time.delayedCall(index * ignition.propagationDelayMs, () => {
        const node = byId.get(targetId);
        if (!node) return;
        const flash = this.add.circle(node.x, node.y, 12, identity.secondary, 0.72).setDepth(17);
        this.tweens.add({ targets: flash, scale: 2.2, alpha: 0, duration: 220, onComplete: () => flash.destroy() });
        const enemy = this.getEnemyByCombatTargetId(targetId);
        if (!enemy?.active) return;
        enemy.embedStacks = 0;
        enemy.embedPower = 0;
        this.destroyLodgedCrimsonNeedles(enemy);
        if (enemy.receiveDamage(ignition.damage * Math.max(1, node.nodeCount))) this.resolveEnemyDeath(enemy);
      });
    });
    if (ignition.fragmentCount <= 0 || ignition.followUp) return;
    const delay = orderedIds.length * ignition.propagationDelayMs + 160;
    this.time.delayedCall(delay, () => {
      const survivors = (this.enemies.getChildren() as Enemy[]).filter((enemy) => enemy.active);
      if (ignition.fragmentLaw === "falling-star" || survivors.length === 0) return;
      const unembedded = survivors.filter((enemy) => enemy.embedStacks === 0);
      const strongest = [...survivors].sort((a, b) => b.maxHealth - a.maxHealth || b.health - a.health)[0];
      const targets = ignition.fragmentLaw === "return"
        ? strongest ? Array.from({ length: ignition.fragmentCount }, () => strongest) : []
        : Array.from({ length: Math.min(ignition.fragmentCount, unembedded.length) }, (_, index) => unembedded[index]!);
      targets.forEach((enemy, index) => this.time.delayedCall(index * 55, () => {
        if (!enemy.active) return;
        this.spawnCrimsonNeedle(
          byId.get(orderedIds[0] ?? 0)?.x ?? this.player.x,
          byId.get(orderedIds[0] ?? 0)?.y ?? this.player.y,
          enemy,
          Math.max(1, ignition.damage * 0.42),
          this.combatState.projectileSpeed * 0.88,
          this.combatState.projectileLifetimeMs,
          this.combatState.projectileTexture,
          this.combatState.tint,
          command.sourceGongfaId
        );
      }));
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
    const embedded = enemies.filter((enemy) => enemy.active && enemy.embedStacks > 0);
    const learnedIds = this.gongfaCollection.byId["crimson-furnace-sword-art"]?.mastery.masteryLearnedIds ?? [];
    const targetIndexes = selectCrimsonFurnaceTargetIndexes(
      enemies.map((enemy, index) => ({
        index,
        active: enemy.active,
        embedStacks: enemy.embedStacks,
        distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y),
        linkDistance: embedded.length === 0 ? undefined : Math.min(...embedded
          .filter((other) => other !== enemy)
          .map((other) => Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y))),
        priorityBody: learnedIds.includes("piercing-furnace-needle") && enemy.maxHealth >= 150
      })),
      count
    );

    return targetIndexes.map((index) => enemies[index]).filter((enemy) => enemy?.active);
  }

  private destroyLodgedCrimsonNeedles(enemy: Enemy): void {
    (this.projectiles.getChildren() as Projectile[]).forEach((projectile) => {
      if (projectile.active && projectile.lodgedEnemy === enemy) {
        projectile.destroy();
      }
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
      gongfaMechanicStatus: this.gongfaMechanicStatus,
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
      guardCapacity: gongfaView.guardCapacity,
      guardFractures: gongfaView.guardFractures,
      guardDisabled: gongfaView.guardDisabled,
      guardShield: gongfaView.guardShield,
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
          guardCapacity: gongfaView.guardCapacity,
          guardFractures: gongfaView.guardFractures,
          guardDisabled: gongfaView.guardDisabled,
          guardShield: gongfaView.guardShield,
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
        guardCapacity: gongfaView.guardCapacity,
        guardFractures: gongfaView.guardFractures,
        guardDisabled: gongfaView.guardDisabled,
        guardShield: gongfaView.guardShield,
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

  forceCloseDamagePlayer(amount: number, sourceId = 999_999): void {
    this.applyIncomingDamage(amount, this.player.x + 80, this.player.y, sourceId);
    if (this.player.stats.health <= 0) {
      this.handlePlayerDeath("Cultivator fell. Qi scattered.");
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

  private applyIncomingDamage(amount: number, sourceX?: number, sourceY?: number, sourceId?: number): void {
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
    const incomingAngle = sourceX !== undefined && sourceY !== undefined
      ? Phaser.Math.Angle.Between(this.player.x, this.player.y, sourceX, sourceY)
      : undefined;
    const sourceDistance = sourceX !== undefined && sourceY !== undefined
      ? Phaser.Math.Distance.Between(this.player.x, this.player.y, sourceX, sourceY)
      : undefined;
    for (const runtime of this.learnedGongfaRuntimes) {
      const result = advanceGongfaRuntime(runtime, {
        kind: "incoming-damage",
        amount: finalDamage,
        ...(incomingAngle !== undefined ? { incomingAngle } : {}),
        ...(sourceDistance !== undefined ? { sourceDistance } : {}),
        ...(sourceId !== undefined ? { sourceId } : {}),
        healthRatio: this.player.stats.maxHealth > 0 ? this.player.stats.health / this.player.stats.maxHealth : 0
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
      if (finalDamage <= 0) break;
    }
    this.restorePrimaryRuntimeAdapter();
    if (finalDamage > 0) this.player.applyDamage(finalDamage);
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
