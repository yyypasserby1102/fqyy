export interface MasteryHudLineState {
  masteryRank: number;
  masteryProgress: number;
  masterySkill2?: string;
  masterySkill2Casts: number;
  fullyMastered?: boolean;
}

export interface GongfaMasteryRosterEntry {
  name: string;
  rank: number;
  fullyMastered: boolean;
}

export function getMasteryProgressWithinRank(masteryPoints: number, masteryRank: number): number {
  return Math.max(0, Math.floor(masteryPoints - masteryRank * 100));
}

export function formatMasteryHudLine(state: MasteryHudLineState): string {
  const status = state.fullyMastered
    ? "Fully Mastered"
    : `Rank ${state.masteryRank} | Progress ${state.masteryProgress} / 100`;
  return `Mastery: ${status} | Skill 2: ${
    state.masterySkill2 ?? "Locked"
  } | Casts: ${state.masterySkill2Casts}`;
}

export function formatGongfaMasteryRoster(entries: GongfaMasteryRosterEntry[]): string {
  if (entries.length === 0) {
    return "";
  }

  return `Paths: ${entries
    .map(({ name, rank, fullyMastered }) => `${name} R${rank}${fullyMastered ? " ✓" : ""}`)
    .join(" · ")}`;
}

export function formatMasteryRankUpMessage(gongfaName: string, masteryRank: number): string {
  return `${gongfaName} mastery reaches Rank ${masteryRank}.`;
}
