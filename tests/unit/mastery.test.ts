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
      playstyle: "Execution Order",
      gain: "Different rack swords focus the strongest threat with heavier cuts, but abandon their pack-clearing assignments.",
      cost: "Locks out Sword Bloom or Reversing Sword Path at Rank 3.",
      scope: "Sword Unsheathing form and hit pattern"
    });
    expect(getMasteryChoiceDefinition("eight-wastes-rebound")).toMatchObject({
      gain: "Release reaches up to eight nearby enemies",
      cost: "Each target receives only its share of the fixed total"
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
    })).toEqual(["heaven-splitting-long-edge", "golden-gale-crosscut", "crescent-wake"]);

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
      learnedIds: ["golden-gale-crosscut"]
    })).toEqual([]);
  });

  it("offers exactly the Jinfeng rank-6 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "jinfeng-gong",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["golden-gale-crosscut"]
    })).toEqual([
      "unbroken-continuance",
      "borrowed-turn-edge",
      "gale-rupture"
    ]);

    expect(getMasteryChoiceDefinition("gale-rupture")).toMatchObject({
      name: "Gale Rupture",
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
      learnedIds: ["golden-gale-crosscut", "unbroken-continuance"]
    })).toEqual([]);
  });

  it("offers exactly the Jinfeng rank-9 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "jinfeng-gong",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["golden-gale-crosscut", "unbroken-continuance"]
    })).toEqual([
      "one-line-to-horizon",
      "returning-dragon-edge",
      "formation-breaking-gale-step"
    ]);

    expect(getMasteryChoiceDefinition("returning-dragon-edge")).toMatchObject({
      name: "Returning Dragon Edge",
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
      learnedIds: ["golden-gale-crosscut", "unbroken-continuance", "returning-dragon-edge"]
    })).toEqual([]);
  });

  it("offers exactly the Gengjin rank-3 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "gengjin-huti",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).toEqual([
      "rebounding-edge-armor",
      "hundred-forged-heavy-armor",
      "flowing-gold-vent"
    ]);

    expect(getMasteryChoiceDefinition("flowing-gold-vent")).toMatchObject({
      name: "Flowing-Gold Vent",
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
      learnedIds: ["hundred-forged-heavy-armor"]
    })).toEqual([]);
  });

  it("offers exactly the Gengjin rank-6 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "gengjin-huti",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["hundred-forged-heavy-armor"]
    })).toEqual([
      "immovable-mountain",
      "flowing-gold-turn",
      "armor-remembers-enemy"
    ]);

    expect(getMasteryChoiceDefinition("flowing-gold-turn")).toMatchObject({
      name: "Flowing-Gold Turn",
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
      learnedIds: ["hundred-forged-heavy-armor", "immovable-mountain"]
    })).toEqual([]);
  });

  it("offers exactly the Gengjin rank-9 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "gengjin-huti",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["hundred-forged-heavy-armor", "immovable-mountain"]
    })).toEqual([
      "eight-wastes-rebound",
      "one-edge-breaks-mountain",
      "unbroken-golden-city"
    ]);

    expect(getMasteryChoiceDefinition("one-edge-breaks-mountain")).toMatchObject({
      name: "One Edge Breaks Mountain",
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
      learnedIds: ["hundred-forged-heavy-armor", "immovable-mountain", "eight-wastes-rebound"]
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
    })).toEqual(["still-sword-edge", "linked-sword-catch", "four-symbols-together"]);

    expect(getMasteryChoiceDefinition("four-symbols-together")).toMatchObject({
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
      learnedIds: ["sword-bloom", "still-sword-edge"]
    })).toEqual([]);
  });

  it("offers exactly the Yujian rank-9 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["sword-bloom", "still-sword-edge"]
    })).toEqual(["heavenly-sword-crown", "three-enclosure-sword-domain", "void-step-recall"]);

    expect(getMasteryChoiceDefinition("void-step-recall")).toMatchObject({
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
      learnedIds: ["sword-bloom", "still-sword-edge", "three-enclosure-sword-domain"]
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

  it("offers exactly the authored Burning Ring rank-3 Transformations", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "burning-ring-scripture",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).toEqual([
      "counter-rotating-twin-rings",
      "furnace-heart-lone-ring",
      "wandering-luminary-rings"
    ]);

    expect(getMasteryChoiceDefinition("counter-rotating-twin-rings")).toMatchObject({
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
      learnedIds: ["furnace-heart-lone-ring"]
    })).toEqual([]);
  });

  it("offers exactly the Burning Ring rank-6 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "burning-ring-scripture",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["furnace-heart-lone-ring"]
    })).toEqual([
      "banked-sun",
      "myriad-enemies-as-furnace",
      "lone-true-sun"
    ]);

    expect(getMasteryChoiceDefinition("lone-true-sun")).toMatchObject({
      name: "Lone True Sun",
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
      learnedIds: ["furnace-heart-lone-ring", "banked-sun"]
    })).toEqual([]);
  });

  it("offers exactly the Burning Ring rank-9 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "burning-ring-scripture",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["furnace-heart-lone-ring", "banked-sun"]
    })).toEqual([
      "perfect-sun-consumption",
      "sunspot-lure",
      "reverse-wheel-reflection"
    ]);

    expect(getMasteryChoiceDefinition("reverse-wheel-reflection")).toMatchObject({
      name: "Reverse-Wheel Reflection",
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
      learnedIds: ["furnace-heart-lone-ring", "banked-sun", "perfect-sun-consumption"]
    })).toEqual([]);
  });

  it("offers the Crimson Furnace Transformation milestones at ranks 3, 6, and 9", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "crimson-furnace-sword-art",
      rank: 3,
      seed: "seed-123",
      learnedIds: []
    })).toEqual(["piercing-furnace-needle", "scattered-furnace-needles", "volatile-furnace-core"]);

    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "crimson-furnace-sword-art",
      rank: 6,
      seed: "seed-123",
      learnedIds: []
    })).toEqual(["sealed-leftover-needle", "star-furnace-resonance", "compressed-furnace"]);

    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "crimson-furnace-sword-art",
      rank: 9,
      seed: "seed-123",
      learnedIds: []
    })).toEqual(["furnace-heart-reforge", "myriad-edges-return", "falling-star-forge"]);
  });

  it("excludes Crimson Furnace sibling Transformations once one per milestone is learned", () => {
    for (const [rank, learned] of [
      [3, "scattered-furnace-needles"],
      [6, "star-furnace-resonance"],
      [9, "myriad-edges-return"]
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
    })).toEqual(["searing-quill", "feather-storm", "swift-molt"]);

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
    })).toEqual(["endless-plumage", "combat-molt", "last-feather"]);

    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "blazing-feather-art",
      rank: 6,
      seed: "seed-123",
      learnedIds: ["feather-storm", "endless-plumage"]
    })).toEqual([]);
  });

  it("offers exactly the Blazing Feather rank-9 Transformation milestone choices", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "blazing-feather-art",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["feather-storm", "endless-plumage"]
    })).toEqual(["phoenix-brand", "sun-chasing-wings", "ashen-pursuit"]);

    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "blazing-feather-art",
      rank: 9,
      seed: "seed-123",
      learnedIds: ["feather-storm", "endless-plumage", "phoenix-brand"]
    })).toEqual([]);
  });

  it("offers the Surge Transformation milestones for every lighter gongfa", () => {
    for (const spec of surgeGongfaSpecs) {
      if (["mist-wraith-canon", "sword-burial-formation", "flame-demon-body-art", "frozen-river-formation", "thousand-root-formation", "black-tide-scripture", "vermilion-bird-covenant", "myriad-beast-grove", "ancient-tree-body-art", "heavenfall-body-art", "heaven-sundering-edict", "nine-sun-calamity-seal", "scarlet-wave-manual", "moonfall-tide-ritual", "verdant-ring-scripture", "ice-mirror-guard", "ironwood-wave-form"].includes(spec.gongfaId)) {
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

  it("offers the nine authored Ice Mirror transformations at their exact milestones", () => {
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "ice-mirror-guard", rank: 3, seed: "mirror", learnedIds: []
    })).toEqual([
      "three-enclosure-heavy-mirrors", "thousand-facet-lotus", "flowing-light-mirrors"
    ]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "ice-mirror-guard", rank: 6, seed: "mirror", learnedIds: ["flowing-light-mirrors"]
    })).toEqual([
      "ice-heart-repair", "shattered-mirror-frost", "lingering-reflection"
    ]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "ice-mirror-guard", rank: 9, seed: "mirror",
      learnedIds: ["flowing-light-mirrors", "lingering-reflection"]
    })).toEqual([
      "flawless-lotus", "calamity-answering-broken-lotus", "killing-shattered-mirror"
    ]);
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
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "moonfall-tide-ritual", rank: 3, seed: "s", learnedIds: []
    })).toEqual(["sea-suppressing-heavy-moon", "twin-moon-crossing", "swift-moon-vessel"]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "moonfall-tide-ritual", rank: 6, seed: "s", learnedIds: []
    })).toEqual(["still-sea-syzygy", "myriad-currents-to-moon", "mountain-weight-eclipse"]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "moonfall-tide-ritual", rank: 9, seed: "s", learnedIds: []
    })).toEqual(["returning-abyss-moon", "flying-star-release", "grand-yin-suspension"]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "verdant-ring-scripture", rank: 3, seed: "s", learnedIds: []
    })).toEqual(["mountain-root-scripture", "green-wind-leaf-scripture", "calamity-step-thorn-scripture"]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "verdant-ring-scripture", rank: 6, seed: "s", learnedIds: []
    })).toEqual(["single-line-specialization", "three-talents-concord", "first-last-generation"]);
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "verdant-ring-scripture", rank: 9, seed: "s", learnedIds: []
    })).toEqual(["earth-scripture-myriad-roots", "heaven-scripture-thousand-leaves", "thorn-scripture-hundred-calamities"]);
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
