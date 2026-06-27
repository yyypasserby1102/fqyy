import { describe, expect, it } from "vitest";
import {
  pickRandom,
  pickUniqueRandom,
  randomFloat,
  randomInt,
  setRandomSeed
} from "../../src/utils/random";

describe("seeded random utilities", () => {
  it("produces deterministic floats and bounded integers from a seed", () => {
    setRandomSeed(123);
    expect(randomFloat()).toBeCloseTo(0.2837369213812053);
    expect(randomInt(4, 8)).toBe(6);

    setRandomSeed(123);
    expect(randomFloat()).toBeCloseTo(0.2837369213812053);
    expect(randomInt(4, 8)).toBe(6);
  });

  it("picks deterministic values and never duplicates unique picks", () => {
    setRandomSeed(7);
    expect(pickRandom(["rat", "wolf", "crow"])).toBe("rat");

    setRandomSeed(7);
    const picks = pickUniqueRandom(["rat", "wolf", "crow"], 5);
    expect(picks).toHaveLength(3);
    expect(new Set(picks).size).toBe(3);
    expect([...picks].sort()).toEqual(["crow", "rat", "wolf"]);
  });
});
