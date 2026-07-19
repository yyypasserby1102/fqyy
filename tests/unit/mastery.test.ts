import { describe, expect, it } from "vitest";
import {
  getDeterministicMasteryChoiceIds,
  getMasteryChoiceDefinition,
  hasMasteryTransformation,
  isGongfaFullyMastered,
  getRank10Skill2Id,
  masteryTransformationConfigs
} from "../../src/logic/mastery";
import { surgeGongfaSpecs } from "../../src/data/surgeGongfa";
import { upgradeConfigs } from "../../src/data/upgrades";

const allRefinementTiers = (gongfaId: "yujian-jue") =>
  upgradeConfigs
    .filter((upgrade) => upgrade.requiredGongfaIds?.includes(gongfaId) && upgrade.id !== "counterflow-ring")
    .flatMap((upgrade) => [upgrade.id, upgrade.id]);

describe("mastery progression", () => {
  it("exposes explicit playstyle tradeoffs for every Transformation", () => {
    for (const transformation of masteryTransformationConfigs) {
      expect(getMasteryChoiceDefinition(transformation.id)).toMatchObject({
        playstyle: expect.any(String),
        gain: expect.stringMatching(/.+/),
        cost: expect.any(String),
        scope: expect.any(String),
        treasureInteraction: expect.any(String)
      });
    }
  });

  it("describes authored special transformations without shared-archetype numbers", () => {
    expect(getMasteryChoiceDefinition("execution-seal")).toMatchObject({
      playstyle: "Execution Seal",
      gain: "Repeated Yujian Skill 1 hits escalate against a marked priority target.",
      cost: "Locks out Sword Bloom or Reversing Sword Path at Rank 3.",
      scope: "Flying Sword Volley form and hit pattern"
    });
    expect(getMasteryChoiceDefinition("iron-gravity-domain")).toMatchObject({
      gain: "At high Guard, pull nearby enemies into repeated aura bursts.",
      cost: "Locks out Gengjin Fortress or Unbroken Advance at Rank 9."
    });
  });
  it("marks a Gongfa Fully Mastered only after Skill 2 and its authored Refinements are complete", () => {
    const allYujianRefinements = allRefinementTiers("yujian-jue");

    expect(isGongfaFullyMastered("yujian-jue", 20, undefined, allYujianRefinements)).toBe(false);
    expect(
      isGongfaFullyMastered(
        "yujian-jue",
        22,
        "returning-sword-formation",
        allYujianRefinements
      )
    ).toBe(true);
  });

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

  it("offers exactly the Yujian rank-6 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["sword-bloom"]
    })).toEqual(["still-sword-heart", "myriad-blade-resonance", "intent-unleashed"]);

    expect(getMasteryChoiceDefinition("intent-unleashed")).toMatchObject({
      kind: "transformation",
      milestoneRank: 6,
      exclusivityGroup: "yujian-jue:rank-6"
    });
  });

  it("excludes sibling Transformations once one rank-6 Yujian Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["sword-bloom", "still-sword-heart"]
    })).toEqual([]);
  });

  it("offers exactly the Yujian rank-9 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["sword-bloom", "still-sword-heart"]
    })).toEqual(["sword-crown", "intent-domain", "void-step-formation"]);

    expect(getMasteryChoiceDefinition("void-step-formation")).toMatchObject({
      kind: "transformation",
      milestoneRank: 9,
      exclusivityGroup: "yujian-jue:rank-9"
    });
  });

  it("excludes sibling Transformations once one rank-9 Yujian Transformation is learned", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["sword-bloom", "still-sword-heart", "intent-domain"]
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

  it("offers the Crimson Furnace Transformation milestones at ranks 3, 6, and 9", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "crimson-furnace-sword-art",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).toEqual(["crimson-piercing-needles", "scattered-needles", "volatile-embeds"]);

    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "crimson-furnace-sword-art",
      rank: 6,
      seed: "seed-123",
      learnedIds: []
    })).toEqual(["sustained-crucible", "resonant-crucible", "overpressure-detonation"]);

    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "crimson-furnace-sword-art",
      rank: 9,
      seed: "seed-123",
      learnedIds: []
    })).toEqual(["furnace-heart", "relentless-needles", "crucible-nova"]);
  });

  it("excludes Crimson Furnace sibling Transformations once one per milestone is learned", () => {
    for (const [rank, learned] of [
      [3, "scattered-needles"],
      [6, "resonant-crucible"],
      [9, "relentless-needles"]
    ] as const) {
      expect(getDeterministicMasteryChoiceIds({
        gongfaId: "crimson-furnace-sword-art",
        rank,
        seed: "seed-123",
        learnedIds: [learned]
      })).toEqual([]);
    }
  });

  it("offers exactly the Blazing Feather rank-3 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "blazing-feather-art",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).toEqual(["searing-feathers", "feather-storm", "swift-molt"]);

    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "blazing-feather-art",
      rank: 3,
      seed: "seed-123",
      learnedIds: ["feather-storm"]
    })).toEqual([]);
  });

  it("offers exactly the Blazing Feather rank-6 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "blazing-feather-art",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["feather-storm"]
    })).toEqual(["banked-embers", "ember-cascade", "ember-burst"]);

    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "blazing-feather-art",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["feather-storm", "banked-embers"]
    })).toEqual([]);
  });

  it("offers exactly the Blazing Feather rank-9 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "blazing-feather-art",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["feather-storm", "banked-embers"]
    })).toEqual(["phoenix-ascendant", "searing-domain", "molten-updraft"]);

    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "blazing-feather-art",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["feather-storm", "banked-embers", "searing-domain"]
    })).toEqual([]);
  });

  it("offers the Surge Transformation milestones for every lighter gongfa", () => {
    for (const spec of surgeGongfaSpecs) {
      if (["mist-wraith-canon", "sword-burial-formation", "flame-demon-body-art", "frozen-river-formation", "thousand-root-formation", "black-tide-scripture", "vermilion-bird-covenant", "myriad-beast-grove", "ancient-tree-body-art", "heavenfall-body-art", "heaven-sundering-edict"].includes(spec.gongfaId)) {
        continue;
      }
      expect(
        getDeterministicMasteryChoiceIds({ gongfaId: spec.gongfaId, rank: 3, seed: "s", learnedIds: [] })
      ).toEqual([spec.focus.id, spec.spread.id, spec.quicken.id]);
      expect(
        getDeterministicMasteryChoiceIds({ gongfaId: spec.gongfaId, rank: 6, seed: "s", learnedIds: [] })
      ).toEqual([spec.hold.id, spec.cascade.id, spec.burst.id]);
      expect(
        getDeterministicMasteryChoiceIds({ gongfaId: spec.gongfaId, rank: 9, seed: "s", learnedIds: [] })
      ).toEqual([spec.crown.id, spec.domain.id, spec.updraft.id]);
      // One pick per milestone locks its siblings.
      expect(
        getDeterministicMasteryChoiceIds({
          gongfaId: spec.gongfaId,
          rank: 3,
          seed: "s",
          learnedIds: [spec.spread.id]
        })
      ).toEqual([]);
    }
  });

  it("offers the approved transformations for the corpse and blood Gongfa", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "mist-wraith-canon", rank: 3, seed: "s", learnedIds: []
    })).toEqual([
      "life-seeking-fierce-wraith", "wandering-mist-host", "lantern-returning-underworld-attendant"
    ]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "sword-burial-formation", rank: 6, seed: "s", learnedIds: []
    })).toEqual([
      "rise-at-living-presence", "recognize-calamity-leave-sheath", "seal-grave-treading-stars"
    ]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "flame-demon-body-art", rank: 9, seed: "s", learnedIds: []
    })).toEqual([
      "undying-asura", "world-burning-asura", "life-hunting-asura"
    ]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "frozen-river-formation", rank: 3, seed: "s", learnedIds: []
    })).toEqual([
      "lone-bridge-final-crossing", "three-ford-branching-flow", "curving-nether-river"
    ]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "thousand-root-formation", rank: 9, seed: "s", learnedIds: []
    })).toEqual([
      "many-mouths-devour-life", "one-heart-strangles-life", "wither-and-flourish-leave-a-seed"
    ]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "black-tide-scripture", rank: 6, seed: "s", learnedIds: []
    })).toEqual([
      "ride-the-tide", "hold-the-moon-against-the-tide", "heaven-timed-tide"
    ]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "vermilion-bird-covenant", rank: 9, seed: "s", learnedIds: []
    })).toEqual([
      "urgent-ember-egg", "true-plume-nirvana", "sacrifice-to-guard-the-master"
    ]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "myriad-beast-grove", rank: 3, seed: "s", learnedIds: []
    })).toEqual([
      "mountain-lord-enters-the-grove", "black-tortoise-guards-the-grove", "white-ape-calls-the-pack"
    ]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "myriad-beast-grove", rank: 6, seed: "s", learnedIds: []
    })).toEqual([
      "two-beasts-aid-each-other", "three-spirits-hunt-together", "unending-rotating-hunt"
    ]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "myriad-beast-grove", rank: 9, seed: "s", learnedIds: []
    })).toEqual([
      "ancestors-run-the-wild", "ancestral-encirclement", "ancestors-return-to-the-grove"
    ]);
  });

  it("keeps post-rank-10 Refinements Gongfa-specific after Skill 2 unlocks automatically", () => {
    const choices = getDeterministicMasteryChoiceIds({
        gongfaId: "yujian-jue",
        rank: 11,
        seed: "seed-123",
        learnedIds: []
      });
    expect(choices).not.toContain("returning-sword-formation");
    expect(choices).not.toContain("jade-meridian");
    expect(choices.every((id) =>
      upgradeConfigs.some((upgrade) =>
        upgrade.id === id && upgrade.requiredGongfaIds?.includes("yujian-jue")
      )
    )).toBe(true);
  });

  it("never substitutes generic stat upgrades when authored Gongfa Refinements are exhausted", () => {
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

    const exhaustedPool = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: allRefinementTiers("yujian-jue").filter((id) =>
        (upgradeConfigs.find((upgrade) => upgrade.id === id)?.unlockRank ?? 0) < 10
      )
    });

    expect(exhaustedPool).toEqual([]);
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
