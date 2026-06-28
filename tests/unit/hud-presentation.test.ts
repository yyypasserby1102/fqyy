import { describe, expect, it } from "vitest";
import { buildHudLines } from "../../src/logic/hudPresentation";

describe("HUD presentation", () => {
  it("renders the core progression state into stable lines", () => {
    expect(
      buildHudLines({
        stageName: "Lianqi",
        realmPhase: "chuqi",
        realmProgress: 37,
        stageBreakthroughReady: false,
        foundationGrowthTransactions: 1,
        masteryRank: 2,
        masteryProgress: 14,
        masterySkill2: "returning-sword-formation",
        masterySkill2Casts: 5,
        galeMomentum: 1.23,
        skillTags: "projectile, sword",
        guard: 7.4,
        guardMitigation: 0.25,
        bladeShellCasts: 3,
        bladeShellCharge: 42,
        linggenName: "Metal Linggen",
        linggenGrades: "Strong",
        gongfaName: "Yujian Jue",
        health: 77,
        maxHealth: 100,
        methodCount: 3,
        methodDamage: 12,
        methodCooldownMs: 900,
        moveSpeed: 250,
        kills: 8,
        lingcaoCollected: true,
        evadeActive: false,
        evadeCooldownRemainingMs: 0
      })
    ).toEqual([
      "Cultivator: Outer Peak Wanderer",
      "Stage: Lianqi",
      "Phase: chuqi | Qi: 37 / 100",
      "Stage breakthrough: waiting",
      "Foundation Growth: 1",
      "Mastery: Rank 2 | Progress 14 / 100 | Skill 2: returning-sword-formation | Casts: 5",
      "Gale Momentum: 1.23 | Skill Tags: projectile, sword",
      "Guard: 7.4 | Mitigation: 25% | Blade Shell: 3 (42%)",
      "Linggen: Metal Linggen | Grades: Strong",
      "Gongfa: Yujian Jue",
      "Vitality: 77 / 100",
      "Method: 3 | Damage: 12 | Cooldown: 900ms",
      "Movement: 250 | Kills: 8",
      "Evade: Ready",
      "Lingcao: claimed"
    ]);
  });
});
