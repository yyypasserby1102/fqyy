import { formatMasteryHudLine } from "./masteryPresentation";

export interface HudPresentationState {
  stageName: string;
  realmPhase: string;
  realmProgress: number;
  stageBreakthroughReady: boolean;
  foundationGrowthTransactions: number;
  masteryRank: number;
  masteryProgress: number;
  masterySkill2?: string;
  masterySkill2Casts: number;
  masteryFullyMastered?: boolean;
  gongfaPaths?: string;
  gongfaMechanicStatus?: string;
  galeMomentum: number;
  skillTags: string;
  guard: number;
  guardMitigation: number;
  bladeShellCasts: number;
  bladeShellCharge: number;
  linggenName: string;
  linggenGrades: string;
  gongfaName: string;
  health: number;
  maxHealth: number;
  methodCount: number;
  methodDamage: number;
  methodCooldownMs: number;
  moveSpeed: number;
  evadeActive: boolean;
  evadeCooldownRemainingMs: number;
  kills: number;
  lingcaoCollected: boolean;
  spiritTreasures: string;
}

/**
 * The active build's signature resource, or undefined when none is engaged.
 * Only the meter that matters for the current Gongfa is surfaced, so the HUD
 * never shows a wall of zeroed-out stats.
 */
function buildResourceLine(state: HudPresentationState): string | undefined {
  if (state.galeMomentum > 0) {
    return `Gale Momentum: ${state.galeMomentum.toFixed(1)}`;
  }
  if (state.guard > 0) {
    const mitigation = `${(state.guardMitigation * 100).toFixed(0)}% mitigation`;
    const shell = state.bladeShellCasts > 0 ? ` · Blade Shell x${state.bladeShellCasts}` : "";
    return `Guard: ${state.guard.toFixed(0)} · ${mitigation}${shell}`;
  }
  return undefined;
}

export function buildHudLines(state: HudPresentationState): string[] {
  const phase = state.realmPhase.charAt(0).toUpperCase() + state.realmPhase.slice(1);
  const lines: string[] = [
    `${state.stageName} · ${phase}`,
    `Qi: ${state.realmProgress} / 100${state.stageBreakthroughReady ? " · breakthrough ready" : ""}`,
    `Vitality: ${Math.ceil(state.health)} / ${state.maxHealth}`,
    `Gongfa: ${state.gongfaName}`
  ];

  if (state.gongfaName !== "Crude Qi Thread") {
    lines.push(
      formatMasteryHudLine({
        masteryRank: state.masteryRank,
        masteryProgress: state.masteryProgress,
        masterySkill2: state.masterySkill2,
        masterySkill2Casts: state.masterySkill2Casts,
        fullyMastered: state.masteryFullyMastered
      })
    );
  }

  if (state.gongfaPaths) {
    lines.push(state.gongfaPaths);
  }
  if (state.gongfaMechanicStatus) {
    lines.push(state.gongfaMechanicStatus);
  }

  const resource = buildResourceLine(state);
  if (resource) {
    lines.push(resource);
  }

  if (state.linggenName !== "Unrevealed") {
    lines.push(`Linggen: ${state.linggenName} · ${state.linggenGrades}`);
  }

  lines.push(
    state.evadeActive
      ? "Evade: Active"
      : state.evadeCooldownRemainingMs > 0
        ? `Evade: ${(state.evadeCooldownRemainingMs / 1_000).toFixed(1)}s`
        : "Evade: Ready"
  );

  if (state.spiritTreasures) {
    lines.push(`Spirit Treasures: ${state.spiritTreasures}`);
  }
  if (!state.lingcaoCollected) {
    lines.push("Lingcao: unclaimed — claim it to awaken your Linggen");
  }

  return lines;
}
