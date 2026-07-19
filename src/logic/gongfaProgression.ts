import type { GongfaId } from "../data/gongfa";
import {
  FULLY_MASTERED_RANK,
  getRank10Skill2Id,
  masteryTransformationConfigs
} from "./mastery";

export type GongfaProgressionChoiceState = "selected" | "unselected" | "available" | "future";

export interface GongfaProgressionChoice {
  id: string;
  state: GongfaProgressionChoiceState;
}

export interface GongfaProgressionMilestone {
  rank: 3 | 6 | 9 | 10;
  choices: GongfaProgressionChoice[];
}

export interface GongfaProgressionRank {
  rank: number;
  state: "completed" | "current" | "future";
}

export interface GongfaProgression {
  ranks: GongfaProgressionRank[];
  milestones: GongfaProgressionMilestone[];
}

export function projectGongfaProgression(input: {
  gongfaId: GongfaId;
  rank: number;
  learnedMasteryIds: string[];
  pendingRanks: number[];
  skill2Unlocked: boolean;
}): GongfaProgression {
  const learned = new Set(input.learnedMasteryIds);
  const pending = new Set(input.pendingRanks);
  const milestones = ([3, 6, 9, 10] as const).map((rank): GongfaProgressionMilestone => {
    const ids = rank === 10
      ? [getRank10Skill2Id(input.gongfaId)]
      : masteryTransformationConfigs
          .filter((choice) => choice.milestoneRank === rank && choice.requiredGongfaIds?.includes(input.gongfaId))
          .map((choice) => choice.id);
    const selectedId = rank === 10
      ? input.skill2Unlocked ? ids[0] : undefined
      : ids.find((id) => learned.has(id));
    const isAvailable = pending.has(rank) || (input.rank >= rank && !selectedId);

    return {
      rank,
      choices: ids.map((id) => ({
        id,
        state: selectedId
          ? id === selectedId ? "selected" : "unselected"
          : isAvailable ? "available" : "future"
      }))
    };
  });

  return {
    ranks: Array.from({ length: FULLY_MASTERED_RANK }, (_, index) => {
      const rank = index + 1;
      return {
        rank,
        state: rank < input.rank ? "completed" : rank === input.rank ? "current" : "future"
      };
    }),
    milestones
  };
}
