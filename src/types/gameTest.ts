import type { ChoiceOption, ChoiceVisualMode } from "../data/choices";
import type { EvadeState } from "../logic/evade";
import type { PlayerVisualSnapshot } from "../entities/Player";
import type { EnemyVisualSnapshot } from "../entities/Enemy";
import type { ProjectileVisualSnapshot } from "../entities/Projectile";
import type { EnemyId } from "../data/enemies";
import type { SpiritTreasureId } from "../data/spiritTreasures";
import type { LingcaoVisualState } from "../entities/Lingcao";
import type { ArenaVisualSnapshot } from "../visual/arenaVisuals";
import type { SoundFxSnapshot } from "../audio/SoundFx";
import type { JourneyPresentationSnapshot } from "../ui/JourneyPresentation";
import type { RealmProgressBarSnapshot } from "../ui/RealmProgressBar";
import type { RealmPhaseId, StageId } from "../data/stages";
import type { GongfaId } from "../data/gongfa";
import type { GongfaCodexSnapshot } from "../ui/GongfaCodex";
import type { EncounterPressure } from "../logic/encounterPressure";
import type { FoundationGrowthAttributes } from "../logic/foundationGrowth";
import type { TribulationBossBarSnapshot } from "../ui/TribulationBossBar";
import type {
  SpiritTreasureAttunement,
  SpiritTreasureResonance,
  SpiritTreasureResonanceModifiers
} from "../logic/spiritTreasures";

export interface GameSnapshot {
  sceneName: string;
  activeScenes: string[];
  paused: boolean;
  message?: string;
  audio: SoundFxSnapshot;
  hud: {
    lines: string[];
  };
  encounter: {
    pressure: EncounterPressure;
    tribulationActive: boolean;
    boss?: {
      id: string;
      name: string;
      health: number;
      maxHealth: number;
      healthRatio: number;
      enraged: boolean;
      phaseLabel: string;
      activeHazards: number;
    };
  };
  player: {
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    moveSpeed: number;
    magnetRadius: number;
    evade: EvadeState;
    visual: PlayerVisualSnapshot;
  };
  visuals: {
    gongfaMotifs: string[];
    enemies: EnemyVisualSnapshot[];
    projectiles: ProjectileVisualSnapshot[];
    projectileImpacts: string[];
    pickups: {
      qiOrbs: Array<{ textureKey: string; animationKey: string }>;
      healingPills: Array<{ textureKey: string; animationKey: string }>;
      spiritTreasures: Array<{
        treasureId: SpiritTreasureId;
        textureKey: string;
        animationKey: string;
        tint: number;
      }>;
      collectionEffects: string[];
      collectionEffectTints: number[];
    };
    lingcao: {
      textureKey: string;
      animationKey: string;
      state: LingcaoVisualState;
      markerTitle: string;
      collisionCenterOffsetX: number;
      collisionCenterOffsetY: number;
      collectionEffects: string[];
    };
    arena: ArenaVisualSnapshot & {
      floorTextureKey: string;
      decorationCount: number;
    };
  };
  progression: {
    stage: StageId;
    realmPhase: RealmPhaseId;
    realmProgress: number;
    stageBreakthroughReady: boolean;
    foundationGrowthTransactions: number;
    foundationGrowth: FoundationGrowthAttributes;
    masteryPoints: number;
    masteryProgress: number;
    masteryRank: number;
    masterySkill2?: string;
    masterySkill2Casts: number;
    gongfaMasteries: Array<{
      gongfaId: GongfaId;
      rank: number;
      fullyMastered: boolean;
    }>;
    gongfaCombats: Array<{
      gongfaId: GongfaId;
      damage: number;
      count: number;
      cooldownMs: number;
      passiveStacks: number;
      passiveDamageBonus: number;
      passiveStackGain: number;
      mechanicResource: number;
      skill2Id?: string;
      skill2Casts: number;
    }>;
    learnedGongfaIds: string[];
    spiritTreasureIds: string[];
    spiritTreasureAttunements: SpiritTreasureAttunement[];
    spiritTreasureSignatures: string[];
    spiritTreasureResonances: SpiritTreasureResonance[];
    spiritTreasureResonanceModifiers: SpiritTreasureResonanceModifiers;
    masteryTransformationTriggers: {
      executionSeal: number;
      swordBloom: number;
      reversingSwordPath: number;
    };
    skillTags: string[];
    galeMomentum: number;
    guard: number;
    guardCapacity: number;
    guardFractures: number;
    guardDisabled: boolean;
    guardShield: number;
    guardMitigation: number;
    bladeShellCharge: number;
    bladeShellCasts: number;
    heat: number;
    ringSegments: number;
    counterflowRingSegments: number;
    solarFlareCasts: number;
    pressure: number;
    embeddedEnemies: number;
    furnaceCascadeCasts: number;
    crimsonPressureRadiusScale: number;
    linggen: string;
    linggenGrades: string;
    gongfa: string;
    lingcaoCollected: boolean;
    lingcaoMarker: string;
    finalBossActive: boolean;
    finalBossPhaseIndex: number;
    kills: number;
  };
  combat: {
    pattern: string;
    damage: number;
    count: number;
    cooldownMs: number;
    pierce: number;
    segmentCount: number;
    counterflowSegments: number;
    spreadDeg: number;
    range: number;
    auraRadius: number;
    retaliationDamage: number;
    returnShots: number;
    shellBursts: number;
  };
  counts: {
    enemies: number;
    projectiles: number;
    projectileSourceGongfaIds: string[];
    orbs: number;
    orbPositions: Array<{ x: number; y: number }>;
    healingPills: number;
    healingPillPositions: Array<{ x: number; y: number; healAmount: number }>;
    lingcaoPositions: Array<{ x: number; y: number }>;
    enemyIds: Record<string, number>;
    enemyPositions: Array<{
      id: EnemyId;
      x: number;
      y: number;
      health: number;
      maxHealth: number;
    }>;
  };
  choice?: {
    title: string;
    options: ChoiceOption[];
  };
}

export interface UiSnapshot {
  masteryProgress?: number;
  hudText: string;
  visualTheme: string;
  hudRegions: string[];
  realmIdentity: {
    label: string;
    accent: number;
  };
  realmProgressBar: RealmProgressBarSnapshot;
  bossBar: TribulationBossBarSnapshot;
  choicePanel: {
    visible: boolean;
    renderedOptionCount: number;
    mode: ChoiceVisualMode | "hidden";
    motionReduced: boolean;
    title: string;
    subtitle: string;
    optionTitles: string[];
    optionKinds: ChoiceOption["kind"][];
    optionVisuals: string[];
  };
  journeyPresentation: JourneyPresentationSnapshot;
  gongfaCodex: GongfaCodexSnapshot;
}

export interface GameTestHarness {
  getSnapshot(): GameSnapshot;
  getUiSnapshot(): UiSnapshot;
  forceSpawnEnemies(count: number): void;
  forceEquipGongfa(gongfaId: GongfaId): void;
  forceSpawnEnemy(enemyId: EnemyId): void;
  selectChoice(index: number): void;
  forceDamagePlayer(amount: number): void;
  forceCloseDamagePlayer(amount: number, sourceId?: number): void;
  forceDamageEnemy(enemyId: EnemyId, amount: number): void;
  forceDamageBoss(amount: number): void;
  forceTriggerTribulationBossSlam(): void;
  forceClearEnemies(): void;
  forceSpawnQiOrb(qiValue: number): void;
  forceSpawnSpiritTreasure(treasureId: string): void;
  forceClaimLingcao(): void;
  forceSpawnHealingPill(healAmount?: number): void;
  forceSetIncomingDamageDisabled(disabled: boolean): void;
  forceSpawnPickupShowcase(): void;
  forceAdvanceSpawnClock(deltaMs: number): void;
}
