import { describe, expect, it } from "vitest";
import {
  aggregateSpiritTreasureEffects,
  offerSpiritTreasure,
  replaceSpiritTreasure,
  spiritTreasureDropForKill,
  SPIRIT_TREASURE_DROP_INTERVAL
} from "../../src/logic/spiritTreasures";

describe("Spirit Treasures", () => {
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
