import { describe, expect, it } from "vitest";
import { projectGongfaProgression } from "../../src/logic/gongfaProgression";

describe("projectGongfaProgression", () => {
  it("shows every structural choice as future before its milestone", () => {
    const result = projectGongfaProgression({
      gongfaId: "yujian-jue",
      rank: 0,
      learnedMasteryIds: [],
      pendingRanks: [],
      skill2Unlocked: false
    });

    expect(result.ranks).toHaveLength(22);
    expect(result.milestones.map((milestone) => milestone.rank)).toEqual([3, 6, 9, 10]);
    expect(result.milestones.flatMap((milestone) => milestone.choices).every((choice) => choice.state === "future")).toBe(true);
  });

  it("distinguishes a selected branch from its unselected siblings", () => {
    const result = projectGongfaProgression({
      gongfaId: "blazing-feather-art",
      rank: 3,
      learnedMasteryIds: ["searing-feathers"],
      pendingRanks: [],
      skill2Unlocked: false
    });
    const rank3 = result.milestones[0];

    expect(rank3.choices.find((choice) => choice.id === "searing-feathers")?.state).toBe("selected");
    expect(rank3.choices.filter((choice) => choice.state === "unselected")).toHaveLength(2);
  });

  it("marks a pending milestone as available and the unlocked Skill 2 as selected", () => {
    const pending = projectGongfaProgression({
      gongfaId: "yujian-jue",
      rank: 6,
      learnedMasteryIds: [],
      pendingRanks: [6],
      skill2Unlocked: false
    });
    expect(pending.milestones[1].choices.every((choice) => choice.state === "available")).toBe(true);

    const unlocked = projectGongfaProgression({
      gongfaId: "yujian-jue",
      rank: 10,
      learnedMasteryIds: [],
      pendingRanks: [],
      skill2Unlocked: true
    });
    expect(unlocked.milestones[3].choices[0].state).toBe("selected");
  });
});
