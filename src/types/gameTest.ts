import type { ChoiceOption } from "../data/choices";
import type { LinggenId } from "../data/linggen";
import type { EvadeState } from "../logic/evade";

export interface GameSnapshot {
  sceneName: string;
  activeScenes: string[];
  message?: string;
  hud: {
    lines: string[];
  };
  player: {
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    moveSpeed: number;
    evade: EvadeState;
  };
  progression: {
    stage: string;
    realmPhase: string;
    realmProgress: number;
    stageBreakthroughReady: boolean;
    foundationGrowthTransactions: number;
    masteryPoints: number;
    masteryProgress: number;
    masteryRank: number;
    masterySkill2?: string;
    masterySkill2Casts: number;
    learnedGongfaIds: string[];
    skillTags: string[];
    galeMomentum: number;
    guard: number;
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
    orbs: number;
    healingPills: number;
    healingPillPositions: Array<{ x: number; y: number; healAmount: number }>;
    enemyIds: Record<string, number>;
  };
  choice?: {
    title: string;
    options: ChoiceOption[];
  };
}

export interface GameTestHarness {
  getSnapshot(): GameSnapshot;
  getHudState(): Record<string, unknown>;
  forceSpawnEnemies(count: number): void;
  forceGrantQi(amount: number): void;
  selectChoice(index: number): void;
  setRngSeed(seed: number): void;
  forceClaimLingcao(): void;
  forceSetLinggen(id: LinggenId): void;
  forceDamagePlayer(amount: number): void;
  forceAdvanceRealmProgress(amount: number): void;
  forceClearEnemies(): void;
  forceSpawnQiOrb(qiValue: number): void;
  forceSpawnHealingPill(healAmount?: number): void;
  forceAdvanceSpawnClock(deltaMs: number): void;
  forceAdvanceMasteryProgress(points: number): void;
}
