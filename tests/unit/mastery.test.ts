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

  it("offers exactly the Jinfeng rank-3 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "jinfeng-gong",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).toEqual(["heaven-splitting-line", "golden-gale-fan", "crescent-wake"]);

    expect(getMasteryChoiceDefinition("crescent-wake")).toMatchObject({
      name: "Crescent Wake",
      kind: "transformation",
      milestoneRank: 3,
      exclusivityGroup: "jinfeng-gong:rank-3"
    });
  });

  it("excludes sibling Transformations once one rank-3 Jinfeng Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "jinfeng-gong",
      rank: 3,
      seed: "seed-123",
      learnedIds: ["golden-gale-fan"]
    })).toEqual([]);
  });

  it("offers exactly the Jinfeng rank-6 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "jinfeng-gong",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["golden-gale-fan"]
    })).toEqual([
      "unbroken-current",
      "ten-thousand-wave-resonance",
      "gale-detonation"
    ]);

    expect(getMasteryChoiceDefinition("gale-detonation")).toMatchObject({
      name: "Gale Detonation",
      kind: "transformation",
      milestoneRank: 6,
      exclusivityGroup: "jinfeng-gong:rank-6"
    });
  });

  it("excludes sibling Transformations once one rank-6 Jinfeng Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "jinfeng-gong",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["golden-gale-fan", "unbroken-current"]
    })).toEqual([]);
  });

  it("offers exactly the Jinfeng rank-9 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "jinfeng-gong",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["golden-gale-fan", "unbroken-current"]
    })).toEqual([
      "endless-horizon",
      "walking-storm",
      "gale-step-severance"
    ]);

    expect(getMasteryChoiceDefinition("walking-storm")).toMatchObject({
      name: "Walking Storm",
      kind: "transformation",
      milestoneRank: 9,
      exclusivityGroup: "jinfeng-gong:rank-9"
    });
  });

  it("excludes sibling Transformations once one rank-9 Jinfeng Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "jinfeng-gong",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["golden-gale-fan", "unbroken-current", "walking-storm"]
    })).toEqual([]);
  });

  it("offers exactly the Gengjin rank-3 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "gengjin-huti",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).toEqual([
      "rebounding-edge",
      "hundred-blade-halo",
      "iron-wake"
    ]);

    expect(getMasteryChoiceDefinition("iron-wake")).toMatchObject({
      name: "Iron Wake",
      kind: "transformation",
      milestoneRank: 3,
      exclusivityGroup: "gengjin-huti:rank-3"
    });
  });

  it("excludes sibling Transformations once one rank-3 Gengjin Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "gengjin-huti",
      rank: 3,
      seed: "seed-123",
      learnedIds: ["hundred-blade-halo"]
    })).toEqual([]);
  });

  it("offers exactly the Gengjin rank-6 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "gengjin-huti",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["hundred-blade-halo"]
    })).toEqual([
      "immovable-mountain",
      "flowing-iron-body",
      "ten-thousand-armor-resonance"
    ]);

    expect(getMasteryChoiceDefinition("flowing-iron-body")).toMatchObject({
      name: "Flowing Iron Body",
      kind: "transformation",
      milestoneRank: 6,
      exclusivityGroup: "gengjin-huti:rank-6"
    });
  });

  it("excludes sibling Transformations once one rank-6 Gengjin Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "gengjin-huti",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["hundred-blade-halo", "immovable-mountain"]
    })).toEqual([]);
  });

  it("offers exactly the Gengjin rank-9 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "gengjin-huti",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["hundred-blade-halo", "immovable-mountain"]
    })).toEqual([
      "gengjin-fortress",
      "iron-gravity-domain",
      "unbroken-advance"
    ]);

    expect(getMasteryChoiceDefinition("iron-gravity-domain")).toMatchObject({
      name: "Iron Gravity Domain",
      kind: "transformation",
      milestoneRank: 9,
      exclusivityGroup: "gengjin-huti:rank-9"
    });
  });

  it("excludes sibling Transformations once one rank-9 Gengjin Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "gengjin-huti",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["hundred-blade-halo", "immovable-mountain", "gengjin-fortress"]
    })).toEqual([]);
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

  it("keeps gongfa without authored Transformations on ordinary rank 3 refinement choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "crimson-furnace-sword-art",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).toHaveLength(3);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "crimson-furnace-sword-art",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).not.toContain("sword-bloom");
  });

  it("offers exactly the Burning Ring rank-3 Transformation milestone choices and drops counterflow-ring from ordinary refinements", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "burning-ring-scripture",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).toEqual([
      "counterflow-ring",
      "condensed-furnace-ring",
      "scattered-ember-orbit"
    ]);

    expect(getMasteryChoiceDefinition("counterflow-ring")).toMatchObject({
      kind: "transformation",
      milestoneRank: 3,
      exclusivityGroup: "burning-ring-scripture:rank-3"
    });

    // counterflow-ring is no longer offered as an ordinary (rank 1) refinement.
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "burning-ring-scripture",
      rank: 1,
      seed: "seed-123",
      learnedIds: []
    })).not.toContain("counterflow-ring");
  });

  it("excludes sibling Transformations once one rank-3 Burning Ring Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "burning-ring-scripture",
      rank: 3,
      seed: "seed-123",
      learnedIds: ["condensed-furnace-ring"]
    })).toEqual([]);
  });

  it("offers exactly the Burning Ring rank-6 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "burning-ring-scripture",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["condensed-furnace-ring"]
    })).toEqual([
      "banked-sun",
      "aura-furnace",
      "meridian-ignition"
    ]);

    expect(getMasteryChoiceDefinition("meridian-ignition")).toMatchObject({
      name: "Meridian Ignition",
      kind: "transformation",
      milestoneRank: 6,
      exclusivityGroup: "burning-ring-scripture:rank-6"
    });
  });

  it("excludes sibling Transformations once one rank-6 Burning Ring Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "burning-ring-scripture",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["condensed-furnace-ring", "banked-sun"]
    })).toEqual([]);
  });

  it("offers exactly the Burning Ring rank-9 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "burning-ring-scripture",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["condensed-furnace-ring", "banked-sun"]
    })).toEqual([
      "perfect-solar-orbit",
      "sunspot-collapse",
      "phoenix-passage"
    ]);

    expect(getMasteryChoiceDefinition("phoenix-passage")).toMatchObject({
      name: "Phoenix Passage",
      kind: "transformation",
      milestoneRank: 9,
      exclusivityGroup: "burning-ring-scripture:rank-9"
    });
  });

  it("excludes sibling Transformations once one rank-9 Burning Ring Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "burning-ring-scripture",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["condensed-furnace-ring", "banked-sun", "perfect-solar-orbit"]
    })).toEqual([]);
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
