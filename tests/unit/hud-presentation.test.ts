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
        guardCapacity: 100,
        guardFractures: 0,
        guardDisabled: false,
        guardShield: 0,
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
        spiritTreasures: "Jade Heart Pendant, Windstep Talisman",
        evadeActive: false,
        evadeCooldownRemainingMs: 0
      })
    ).toEqual([
      "Lianqi · Chuqi",
      "Qi: 37 / 100",
      "Vitality: 77 / 100",
      "Gongfa: Yujian Jue",
      "Mastery: Rank 2 | Progress 14 / 100 | Skill 2: returning-sword-formation | Casts: 5",
      "Gale Momentum: 1.2",
      "Linggen: Metal Linggen · Strong",
      "Evade: Ready",
      "Spirit Treasures: Jade Heart Pendant, Windstep Talisman"
    ]);
  });
});
