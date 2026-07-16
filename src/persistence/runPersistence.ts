import type { GongfaId } from "../data/gongfa";
import type { LinggenId } from "../data/linggen";
import type { RealmPhaseId, StageId } from "../data/stages";
import type { SpiritTreasureId } from "../data/spiritTreasures";
import type { GongfaMasteryCheckpoint, GongfaRuntime } from "../logic/gongfaRuntime";
import type { RunJourneyDecision } from "../logic/runJourney";
import type { SpiritTreasureAttunement } from "../logic/spiritTreasures";
import {
  decodeActiveRunCheckpoint,
  decodeActiveRunSave,
  encodeActiveRunSave
} from "./runCheckpointCodec";

export const activeRunStorageKey = "fqyy.active-run.v1";

export type RunLifecycle = "mortal";

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
  playerDamageReduction?: number;
  /** Legacy v1 fields. They are ignored by the Run journey. */
  level?: number;
  xp?: number;
  xpToNext?: number;
  stage: StageId;
  realmPhase: RealmPhaseId;
  realmProgress: number;
  phaseCleanupActive: boolean;
  foundationGrowthTransactions: number;
  foundationGrowthAppliedTransactions?: number;
  tribulationActive?: boolean;
  masteryPoints: number;
  masteryRank: number;
  masteryLearnedIds: string[];
  upgradeSelectionIds?: string[];
  masterySkill2Id?: string;
  masterySkill2CooldownRemaining: number;
  masterySkill2Casts: number;
  masteryChoiceActive: boolean;
  masteryPendingRanks: number[];
  gongfaMasteries?: GongfaMasteryCheckpoint[];
  gongfaRuntimes?: GongfaRuntime[];
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
  guardMitigationBonus?: number;
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
  spiritTreasureIds?: SpiritTreasureId[];
  spiritTreasureAttunements?: SpiritTreasureAttunement[];
  mainGongfaId?: GongfaId;
  kills: number;
  elapsedMs: number;
  finalBossActive: boolean;
  finalBossPhaseIndex: number;
  pendingDecision?: RunJourneyDecision;
}

export interface ActiveRunSave {
  version: 1;
  seed: number;
  startedAt: number;
  lifecycle: RunLifecycle;
  selectedLinggenId?: LinggenId;
  checkpoint?: ActiveRunCheckpoint;
}

export function createActiveRunSave(
  seed: number,
  startedAt: number = Date.now(),
  selectedLinggenId?: LinggenId
): ActiveRunSave {
  return {
    version: 1,
    seed,
    startedAt,
    lifecycle: "mortal",
    ...(selectedLinggenId ? { selectedLinggenId } : {})
  };
}

export function createActiveRunCheckpoint(checkpoint: unknown): ActiveRunCheckpoint {
  const decoded = decodeActiveRunCheckpoint(checkpoint);
  if (!decoded) {
    throw new Error("Invalid active Run checkpoint.");
  }
  return decoded;
}

export function saveActiveRun(storage: Storage, save: ActiveRunSave): void {
  storage.setItem(activeRunStorageKey, encodeActiveRunSave(save));
}

export function loadActiveRun(storage: Storage): ActiveRunSave | null {
  const raw = storage.getItem(activeRunStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return decodeActiveRunSave(JSON.parse(raw));
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
