import { describe, expect, it } from "vitest";
import { getGongfaVisualEmphasis } from "../../src/logic/combatVisualHierarchy";

describe("combat visual hierarchy", () => {
  it("keeps the founding Gongfa dominant as four paths overlap", () => {
    const learned = [
      "burning-ring-scripture",
      "scarlet-wave-manual",
      "blazing-feather-art",
      "crimson-furnace-sword-art"
    ] as const;

    expect(getGongfaVisualEmphasis(learned, learned[0])).toEqual({
      visualTier: "founding",
      alpha: 1,
      depth: 12
    });
    expect(getGongfaVisualEmphasis(learned, learned[1])).toEqual({
      visualTier: "layered",
      alpha: 0.82,
      depth: 11
    });
    expect(getGongfaVisualEmphasis(learned, learned[2])).toEqual({
      visualTier: "layered",
      alpha: 0.68,
      depth: 10
    });
    expect(getGongfaVisualEmphasis(learned, learned[3])).toEqual({
      visualTier: "layered",
      alpha: 0.58,
      depth: 9
    });
  });
});
