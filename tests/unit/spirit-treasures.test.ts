import { describe, expect, it } from "vitest";
import {
  aggregateSpiritTreasureEffects,
  offerSpiritTreasure,
  replaceSpiritTreasure,
  spiritTreasureDropForKill,
  SPIRIT_TREASURE_DROP_INTERVAL
} from "../../src/logic/spiritTreasures";
import { spiritTreasureConfigs } from "../../src/data/spiritTreasures";
import {
  attuneSpiritTreasure,
  projectSpiritTreasureState
} from "../../src/logic/spiritTreasures";
import {
  projectSpiritTreasureReplacement,
  projectSpiritTreasureResonanceModifiers
} from "../../src/logic/spiritTreasures";

describe("Spirit Treasures", () => {
  it("authors two seals, a signature trigger, and culmination for every treasure", () => {
    for (const treasure of Object.values(spiritTreasureConfigs)) {
      expect(treasure.resonanceSeals).toHaveLength(2);
      expect(treasure.signature).toMatchObject({ name: expect.any(String), effect: expect.any(String) });
      expect(treasure.culmination).toMatchObject({ name: expect.any(String), effect: expect.any(String) });
    }
  });
  it("deepens duplicate treasures through three Attunement ranks", () => {
    const rank1 = attuneSpiritTreasure([], "jade-heart-pendant");
    expect(rank1).toEqual({ kind: "attuned", active: [{ id: "jade-heart-pendant", rank: 1 }] });
    const rank2 = attuneSpiritTreasure(rank1.active, "jade-heart-pendant");
    expect(rank2).toEqual({ kind: "attuned", active: [{ id: "jade-heart-pendant", rank: 2 }] });
    expect(attuneSpiritTreasure(rank2.active, "jade-heart-pendant")).toEqual({
      kind: "attuned",
      active: [{ id: "jade-heart-pendant", rank: 3 }]
    });
  });

  it("projects rank signatures and pair resonances", () => {
    expect(
      projectSpiritTreasureState([
        { id: "jade-heart-pendant", rank: 2 },
        { id: "ironhide-seal", rank: 1 }
      ])
    ).toMatchObject({
      effects: { maxHealth: 45, mitigation: 0.08 },
      signatures: ["jade-heart-pendant:steady-heart"],
      resonances: ["vitality"]
    });
  });

  it("compares replacement gains, losses, and resonance changes", () => {
    expect(
      projectSpiritTreasureReplacement(
        [
          { id: "jade-heart-pendant", rank: 2 },
          { id: "ironhide-seal", rank: 1 },
          { id: "lodestone-charm", rank: 1 }
        ],
        "ironhide-seal",
        "windstep-talisman"
      )
    ).toEqual({
      gain: "+24 moveSpeed",
      loss: "-0.08 mitigation",
      resonanceGained: ["harvest"],
      resonanceLost: ["vitality"],
      mechanicsGained: [],
      mechanicsLost: []
    });

    expect(projectSpiritTreasureReplacement(
      [
        { id: "jade-heart-pendant", rank: 3 },
        { id: "ironhide-seal", rank: 1 },
        { id: "lodestone-charm", rank: 1 }
      ],
      "jade-heart-pendant",
      "windstep-talisman"
    ).mechanicsLost).toEqual(["A2 Steady Heart", "A3 Jade Heart Reborn"]);
  });

  it("projects build-shaping runtime effects for every active resonance", () => {
    expect(
      projectSpiritTreasureResonanceModifiers([
        "vitality",
        "bulwark",
        "harvest",
        "perception",
        "windwalk"
      ])
    ).toEqual({
      healingMultiplier: 1.25,
      emergencyHealFraction: 0.1,
      bulwarkGuardMultiplier: 0.7,
      harvestPulseDamage: 8,
      projectileDamageMultiplier: 1.12,
      evadeCooldownMultiplier: 0.85
    });
  });

  it("makes each rank-2 signature trigger and rank-3 culmination mechanical", () => {
    expect(
      projectSpiritTreasureResonanceModifiers([], [
        { id: "farsight-mirror", rank: 2 },
        { id: "windstep-talisman", rank: 3 }
      ])
    ).toMatchObject({
      projectileDamageMultiplier: 1.06,
      evadeCooldownMultiplier: 0.85
    });
  });
  it("stores a treasure while an empty slot remains", () => {
    expect(offerSpiritTreasure([], "jade-heart-pendant")).toEqual({
      kind: "stored",
      activeIds: ["jade-heart-pendant"]
    });

    expect(
      offerSpiritTreasure(["jade-heart-pendant", "windstep-talisman"], "lodestone-charm")
    ).toEqual({
      kind: "stored",
      activeIds: ["jade-heart-pendant", "windstep-talisman", "lodestone-charm"]
    });
  });

  it("no-ops when the treasure is already held", () => {
    expect(offerSpiritTreasure(["jade-heart-pendant"], "jade-heart-pendant")).toEqual({
      kind: "stored",
      activeIds: ["jade-heart-pendant"]
    });
  });

  it("requires a replacement once all three slots are full", () => {
    const full = ["jade-heart-pendant", "windstep-talisman", "lodestone-charm"] as const;
    expect(offerSpiritTreasure([...full], "ironhide-seal")).toEqual({
      kind: "replace-required",
      activeIds: [...full],
      offeredId: "ironhide-seal"
    });
  });

  it("replaces an held treasure in place and rejects invalid swaps", () => {
    const full = ["jade-heart-pendant", "windstep-talisman", "lodestone-charm"] as const;
    expect(replaceSpiritTreasure([...full], "windstep-talisman", "ironhide-seal")).toEqual([
      "jade-heart-pendant",
      "ironhide-seal",
      "lodestone-charm"
    ]);

    // Replacing an unheld treasure, or duplicating an held one, is a no-op.
    expect(replaceSpiritTreasure([...full], "ironhide-seal", "spiritbloom-vial")).toEqual([
      ...full
    ]);
    expect(replaceSpiritTreasure([...full], "windstep-talisman", "jade-heart-pendant")).toEqual([
      ...full
    ]);
  });

  it("aggregates Cultivator Attribute bonuses across active treasures", () => {
    expect(
      aggregateSpiritTreasureEffects(["jade-heart-pendant", "spiritbloom-vial", "lodestone-charm"])
    ).toEqual({
      maxHealth: 48,
      moveSpeed: 0,
      magnetRadius: 48,
      mitigation: 0
    });

    expect(aggregateSpiritTreasureEffects([])).toEqual({
      maxHealth: 0,
      moveSpeed: 0,
      magnetRadius: 0,
      mitigation: 0
    });
  });

  it("drops a treasure every interval and rotates deterministically", () => {
    const n = SPIRIT_TREASURE_DROP_INTERVAL;
    expect(spiritTreasureDropForKill(0)).toBeUndefined();
    expect(spiritTreasureDropForKill(n - 1)).toBeUndefined();
    expect(spiritTreasureDropForKill(n + 1)).toBeUndefined();

    const first = spiritTreasureDropForKill(n);
    const second = spiritTreasureDropForKill(n * 2);
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first).not.toBe(second);

    // The rotation is stable for a given kill count.
    expect(spiritTreasureDropForKill(n)).toBe(first);
  });
});
