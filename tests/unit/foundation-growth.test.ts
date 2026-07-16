import { describe, expect, it } from "vitest";
import {
  FOUNDATION_GROWTH_PER_TRANSACTION,
  projectFoundationGrowth
} from "../../src/logic/foundationGrowth";

describe("Foundation Growth", () => {
  it("projects the full automatic Cultivator Attribute package", () => {
    expect(FOUNDATION_GROWTH_PER_TRANSACTION).toEqual({
      baseDamage: 1,
      maxHealth: 8,
      moveSpeed: 3,
      magnetRadius: 8
    });
    expect(projectFoundationGrowth(3)).toEqual({
      baseDamage: 3,
      maxHealth: 24,
      moveSpeed: 9,
      magnetRadius: 24
    });
  });

  it("never projects negative growth for legacy or malformed counts", () => {
    expect(projectFoundationGrowth(-2)).toEqual({
      baseDamage: 0,
      maxHealth: 0,
      moveSpeed: 0,
      magnetRadius: 0
    });
  });
});
