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

export function buildHudLines(state: HudPresentationState): string[] {
  return [
    "Cultivator: Outer Peak Wanderer",
    `Stage: ${state.stageName}`,
    `Phase: ${state.realmPhase} | Qi: ${state.realmProgress} / 100`,
    `Stage breakthrough: ${state.stageBreakthroughReady ? "ready" : "waiting"}`,
    `Foundation Growth: ${state.foundationGrowthTransactions}`,
    formatMasteryHudLine({
      masteryRank: state.masteryRank,
      masteryProgress: state.masteryProgress,
      masterySkill2: state.masterySkill2,
      masterySkill2Casts: state.masterySkill2Casts
    }),
    `Gale Momentum: ${state.galeMomentum.toFixed(2)} | Skill Tags: ${state.skillTags || "none"}`,
    `Guard: ${state.guard.toFixed(1)} | Mitigation: ${(state.guardMitigation * 100).toFixed(
      0
    )}% | Blade Shell: ${state.bladeShellCasts} (${state.bladeShellCharge.toFixed(0)}%)`,
    `Linggen: ${state.linggenName} | Grades: ${state.linggenGrades}`,
    `Gongfa: ${state.gongfaName}`,
    `Vitality: ${Math.ceil(state.health)} / ${state.maxHealth}`,
    `Method: ${state.methodCount} | Damage: ${state.methodDamage} | Cooldown: ${Math.round(
      state.methodCooldownMs
    )}ms`,
    `Movement: ${state.moveSpeed} | Kills: ${state.kills}`,
    state.evadeActive
      ? "Evade: Active"
      : state.evadeCooldownRemainingMs > 0
        ? `Evade: ${(state.evadeCooldownRemainingMs / 1_000).toFixed(1)}s`
        : "Evade: Ready",
    `Lingcao: ${state.lingcaoCollected ? "claimed" : "unclaimed"}`,
    `Spirit Treasures: ${state.spiritTreasures || "none"}`
  ];
}
