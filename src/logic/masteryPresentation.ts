export interface MasteryHudLineState {
  masteryRank: number;
  masteryProgress: number;
  masterySkill2?: string;
  masterySkill2Casts: number;
}

export function getMasteryProgressWithinRank(masteryPoints: number, masteryRank: number): number {
  return Math.max(0, Math.floor(masteryPoints - masteryRank * 100));
}

export function formatMasteryHudLine(state: MasteryHudLineState): string {
  return `Mastery: Rank ${state.masteryRank} | Progress ${state.masteryProgress} / 100 | Skill 2: ${
    state.masterySkill2 ?? "Locked"
  } | Casts: ${state.masterySkill2Casts}`;
}

export function formatMasteryRankUpMessage(gongfaName: string, masteryRank: number): string {
  return `${gongfaName} mastery reaches Rank ${masteryRank}.`;
}
