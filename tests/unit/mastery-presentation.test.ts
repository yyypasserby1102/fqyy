import { describe, expect, it } from "vitest";
import {
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
});
