import { realmPhaseOrder, type RealmPhaseId } from "../data/stages";
import { formatFoundationGrowthPackage } from "./foundationGrowth";

export const REALM_PHASE_LABELS = ["Chuqi", "Zhongqi", "Houqi", "Dayuanman"] as const;
export const REALM_PROGRESS_LABELS = [...REALM_PHASE_LABELS, "Breakthrough"] as const;

export interface RealmProgressPresentation {
  phase: RealmPhaseId;
  phaseLabel: (typeof REALM_PHASE_LABELS)[number];
  phaseIndex: number;
  completedMilestones: number;
  totalProgress: number;
}

export function getRealmProgressPresentation(
  phase: RealmPhaseId,
  phaseProgress: number
): RealmProgressPresentation {
  const phaseIndex = realmPhaseOrder.indexOf(phase);
  const normalizedPhaseProgress = Math.max(0, Math.min(100, phaseProgress));

  return {
    phase,
    phaseLabel: REALM_PHASE_LABELS[phaseIndex],
    phaseIndex,
    completedMilestones: phaseIndex,
    totalProgress:
      (phaseIndex + Math.min(normalizedPhaseProgress, 96) / 100) / realmPhaseOrder.length
  };
}

export function formatRealmMilestoneReward(
  completedPhase: Exclude<RealmPhaseId, "dayuanman">,
  foundationGrowthTransactions: number
): string {
  const completedIndex = realmPhaseOrder.indexOf(completedPhase);
  return `${REALM_PHASE_LABELS[completedIndex]} complete · ${formatFoundationGrowthPackage()} · Foundation ${foundationGrowthTransactions}`;
}
