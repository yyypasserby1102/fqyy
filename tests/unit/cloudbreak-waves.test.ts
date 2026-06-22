import { describe, expect, it } from "vitest";
import { stageWaveSpawns } from "../../src/data/waves";

describe("Cloudbreak Summit wave tables", () => {
  it("routes Yuanying through celestial constructs and tribulation shades", () => {
    const yuanyingPools = stageWaveSpawns.yuanying.flatMap((wave) => wave.pool);

    expect(yuanyingPools).toContain("celestial-construct");
    expect(yuanyingPools).toContain("tribulation-shade");
  });
});
