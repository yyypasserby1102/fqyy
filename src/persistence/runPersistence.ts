import type { GongfaId } from "../data/gongfa";
import type { LinggenId } from "../data/linggen";
import type { StageId } from "../data/stages";

export const activeRunStorageKey = "fqyy.active-run.v1";

export type RunLifecycle = "mortal";
export type RealmPhaseId = "chuqi" | "zhongqi" | "houqi" | "dayuanman";

export interface HealingPillCheckpoint {
  x: number;
  y: number;
  healAmount: number;
}

export interface ActiveRunCheckpoint {
  playerHealth?: number;
  playerMaxHealth?: number;
  playerMoveSpeed?: number;
  playerMagnetRadius?: number;
  /** Legacy v1 fields. They are ignored by the Run journey. */
  level?: number;
  xp?: number;
  xpToNext?: number;
  stage: StageId;
  realmPhase: RealmPhaseId;
  realmProgress: number;
  phaseCleanupActive: boolean;
  foundationGrowthTransactions: number;
  masteryPoints: number;
  masteryRank: number;
  masteryLearnedIds: string[];
  upgradeSelectionIds?: string[];
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
  hiddenLinggenId: LinggenId;
  revealedLinggenId?: LinggenId;
  lingcaoCollected: boolean;
  lingcaoMarker: string;
  lingcaoX: number;
  lingcaoY: number;
  healingPills: HealingPillCheckpoint[];
  mainGongfaId?: GongfaId;
  kills: number;
  elapsedMs: number;
}

export interface ActiveRunSave {
  version: 1;
  seed: number;
  startedAt: number;
  lifecycle: RunLifecycle;
  checkpoint?: ActiveRunCheckpoint;
}

export function createActiveRunSave(seed: number, startedAt: number = Date.now()): ActiveRunSave {
  return {
    version: 1,
    seed,
    startedAt,
    lifecycle: "mortal"
  };
}

export function saveActiveRun(storage: Storage, save: ActiveRunSave): void {
  storage.setItem(activeRunStorageKey, JSON.stringify(save));
}

export function loadActiveRun(storage: Storage): ActiveRunSave | null {
  const raw = storage.getItem(activeRunStorageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ActiveRunSave>;
    if (
      parsed.version !== 1 ||
      typeof parsed.seed !== "number" ||
      typeof parsed.startedAt !== "number" ||
      parsed.lifecycle !== "mortal"
    ) {
      return null;
    }

    return {
      version: 1,
      seed: parsed.seed,
      startedAt: parsed.startedAt,
      lifecycle: "mortal",
      checkpoint: parsed.checkpoint as ActiveRunCheckpoint | undefined
    };
  } catch {
    return null;
  }
}

export function hasActiveRun(storage: Storage): boolean {
  return loadActiveRun(storage) !== null;
}

export function clearActiveRun(storage: Storage): void {
  storage.removeItem(activeRunStorageKey);
}
