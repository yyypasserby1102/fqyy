import { describe, expect, it } from "vitest";
import { ARENA_VARIANTS } from "../../src/data/arenaVariants";

describe("realm visual identity", () => {
  it("gives every combat Stage a distinct persistent identity label and accent", () => {
    expect(Object.values(ARENA_VARIANTS).map(({ identityLabel }) => identityLabel)).toEqual([
      "Fallen Sect Courtyard · Breath",
      "Mist Bamboo Valley · Root",
      "Burial Ridge · Core",
      "Cloudbreak Summit · Soul"
    ]);
    expect(new Set(Object.values(ARENA_VARIANTS).map(({ primary }) => primary)).size).toBe(4);
  });
});
