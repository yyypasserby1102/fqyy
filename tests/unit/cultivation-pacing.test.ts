import { describe, expect, it } from "vitest";
import { getCultivationProgressGain } from "../../src/logic/progression";

describe("cultivation pacing", () => {
  it("makes Realm Progress increasingly demanding after Lianqi", () => {
    expect(getCultivationProgressGain("lianqi", 4, 1).realm).toBe(16);
    expect(getCultivationProgressGain("zhuji", 4, 1).realm).toBeCloseTo(12.48);
    expect(getCultivationProgressGain("jindan", 4, 1).realm).toBeCloseTo(6.72);
    expect(getCultivationProgressGain("yuanying", 4, 1).realm).toBeCloseTo(4.16);
  });

  it("slows Mastery less than Realm so later Gongfa can still develop", () => {
    const jindan = getCultivationProgressGain("jindan", 3, 0.97);
    const yuanying = getCultivationProgressGain("yuanying", 4, 0.97);

    expect(jindan.realm).toBeCloseTo(4.8888);
    expect(jindan.mastery).toBeCloseTo(15.8304);
    expect(yuanying.realm).toBeCloseTo(4.0352);
    expect(yuanying.mastery).toBeCloseTo(18.0032);
  });
});
