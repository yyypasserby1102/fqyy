import { describe, expect, it } from "vitest";
import { getCultivationProgressGain } from "../../src/logic/progression";

describe("cultivation pacing", () => {
  it("makes Realm Progress increasingly demanding after Lianqi", () => {
    expect(getCultivationProgressGain("lianqi", 4, 1).realm).toBe(16);
    expect(getCultivationProgressGain("zhuji", 4, 1).realm).toBeCloseTo(13.6);
    expect(getCultivationProgressGain("jindan", 4, 1).realm).toBeCloseTo(8.8);
    expect(getCultivationProgressGain("yuanying", 4, 1).realm).toBeCloseTo(6.4);
  });

  it("slows Mastery less than Realm so later Gongfa can still develop", () => {
    const jindan = getCultivationProgressGain("jindan", 3, 0.97);
    const yuanying = getCultivationProgressGain("yuanying", 4, 0.97);

    expect(jindan.realm).toBeCloseTo(6.402);
    expect(jindan.mastery).toBeCloseTo(16.296);
    expect(yuanying.realm).toBeCloseTo(6.208);
    expect(yuanying.mastery).toBeCloseTo(17.072);
  });
});
