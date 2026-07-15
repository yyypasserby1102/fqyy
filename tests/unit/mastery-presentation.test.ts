import { describe, expect, it } from "vitest";
import {
  formatGongfaMasteryRoster,
  formatMasteryHudLine,
  formatMasteryRankUpMessage,
  getMasteryProgressWithinRank
} from "../../src/logic/masteryPresentation";

describe("mastery presentation", () => {
  it("shows progress within the current rank and a readable rank-up toast", () => {
    expect(getMasteryProgressWithinRank(237, 2)).toBe(37);
    expect(
      formatMasteryHudLine({
        masteryRank: 2,
        masteryProgress: 37,
        masterySkill2: "returning-sword-formation",
        masterySkill2Casts: 4
      })
    ).toBe(
      "Mastery: Rank 2 | Progress 37 / 100 | Skill 2: returning-sword-formation | Casts: 4"
    );
    expect(formatMasteryRankUpMessage("Yujian Jue", 3)).toBe(
      "Yujian Jue mastery reaches Rank 3."
    );
  });

  it("keeps late-Run growth legible when the first Gongfa is Fully Mastered", () => {
    expect(
      formatMasteryHudLine({
        masteryRank: 20,
        masteryProgress: 0,
        masterySkill2: "solar-flare-cycle",
        masterySkill2Casts: 7,
        fullyMastered: true
      })
    ).toBe("Mastery: Fully Mastered | Skill 2: solar-flare-cycle | Casts: 7");

    expect(
      formatGongfaMasteryRoster([
        { name: "Burning Ring", rank: 20, fullyMastered: true },
        { name: "Scarlet Wave", rank: 9, fullyMastered: false },
        { name: "Blazing Feather", rank: 6, fullyMastered: false },
        { name: "Crimson Furnace", rank: 3, fullyMastered: false }
      ])
    ).toBe(
      "Paths: Burning Ring R20 ✓ · Scarlet Wave R9 · Blazing Feather R6 · Crimson Furnace R3"
    );
  });
});
