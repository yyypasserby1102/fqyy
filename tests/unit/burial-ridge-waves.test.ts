import { describe, expect, it } from "vitest";
import { stageWaveSpawns } from "../../src/data/waves";

describe("Burial Ridge wave tables", () => {
  it("routes Jindan through corpse cultivators and resentful spirits", () => {
    const jindanPools = stageWaveSpawns.jindan.flatMap((wave) => wave.pool);

    expect(jindanPools).toContain("corpse-cultivator");
    expect(jindanPools).toContain("resentful-spirit");
  });
});
