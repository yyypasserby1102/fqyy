import { describe, expect, it } from "vitest";
import {
  getDeterministicMasteryChoiceIds,
  getMasteryChoiceDefinition,
  hasMasteryTransformation,
  getRank10Skill2Id
} from "../../src/logic/mastery";

describe("mastery progression", () => {
  it("returns deterministic capped choices for a rank and removes learned authored options", () => {
    const first = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: []
    });
    const second = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: []
    });

    expect(first).toEqual(second);
    expect(first).toHaveLength(3);

    const filtered = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: [
        "sword-intent-sharpening",
        "sword-intent-sharpening",
        "sword-intent-sharpening"
      ]
    });

    expect(filtered).not.toContain("sword-intent-sharpening");
  });

  it("maps rank 10 to a dedicated second Skill identifier", () => {
    expect(getRank10Skill2Id("yujian-jue")).toBe("returning-sword-formation");
    expect(getRank10Skill2Id("crimson-furnace-sword-art")).toBe("furnace-cascade");
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 10,
      seed: "seed-123",
      learnedIds: []
    })).toEqual(["returning-sword-formation"]);
  });

  it("offers exactly the Yujian rank-3 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).toEqual(["execution-seal", "sword-bloom", "reversing-sword-path"]);

    expect(getMasteryChoiceDefinition("sword-bloom")).toMatchObject({
      name: "Sword Bloom",
      kind: "transformation",
      milestoneRank: 3,
      exclusivityGroup: "yujian-jue:rank-3"
    });
  });

  it("resolves mastery choice definitions across refinements, transformations, Skill 2, and unknown ids", () => {
    expect(getMasteryChoiceDefinition("sword-intent-sharpening")).toMatchObject({
      id: "sword-intent-sharpening",
      kind: "refinement",
      requiredGongfaIds: ["yujian-jue"]
    });

    expect(getMasteryChoiceDefinition("returning-sword-formation")).toMatchObject({
      id: "returning-sword-formation",
      kind: "skill2",
      requiredGongfaIds: ["yujian-jue"],
      milestoneRank: 10
    });

    expect(getMasteryChoiceDefinition("missing-choice")).toBeUndefined();
  });

  it("checks whether a learned mastery set contains a Transformation", () => {
    expect(hasMasteryTransformation(["sword-bloom"], "sword-bloom")).toBe(true);
    expect(hasMasteryTransformation(["sword-intent-sharpening"], "sword-bloom")).toBe(false);
  });

  it("excludes sibling Transformations once one rank-3 Yujian Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 3,
      seed: "seed-123",
      learnedIds: ["sword-bloom"]
    })).toEqual([]);
  });

  it("keeps non-Yujian rank 3 on ordinary refinement choices until authored Transformations exist", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "jinfeng-gong",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).toHaveLength(3);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "jinfeng-gong",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).not.toContain("sword-bloom");
  });

  it("adds the rank-10 Skill 2 family into the post-rank-10 pool", () => {
    expect(
      getDeterministicMasteryChoiceIds({
        gongfaId: "yujian-jue",
        rank: 11,
        seed: "seed-123",
        learnedIds: []
      })
    ).toContain("returning-sword-formation");
  });

  it("keeps evergreen mastery choices out until authored choices are exhausted", () => {
    const authoredOnly = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: []
    });

    expect(authoredOnly).not.toContain("tempered-meridians");
    expect(authoredOnly).not.toContain("jade-meridian");
    expect(authoredOnly).not.toContain("minor-pill");
    expect(authoredOnly).not.toContain("soul-lure-banner");

    const evergreenFallback = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: [
        "sword-intent-sharpening",
        "twin-sword-split",
        "refined-sword-channel",
        "sword-intent-sharpening",
        "twin-sword-split",
        "refined-sword-channel",
        "sword-intent-sharpening",
        "twin-sword-split",
        "refined-sword-channel"
      ]
    });

    expect(evergreenFallback).toContain("jade-meridian");
    expect(evergreenFallback).not.toContain("sword-intent-sharpening");
  });

  it("removes authored mastery choices once their selection cap is reached", () => {
    const exhausted = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: [
        "sword-intent-sharpening",
        "sword-intent-sharpening",
        "sword-intent-sharpening"
      ]
    });

    expect(exhausted).not.toContain("sword-intent-sharpening");
    expect(exhausted.length).toBeGreaterThan(0);
  });
});
