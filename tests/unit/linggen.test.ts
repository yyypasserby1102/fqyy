import { describe, expect, it } from "vitest";
import {
  getGongfaMasterySpeedLabel,
  getLinggenAffinityGradeSummary,
  getLinggenAffinityTotal,
  linggenConfigs
} from "../../src/data/linggen";

describe("Linggen affinity rules", () => {
  it("keeps each authored Linggen at a total affinity of 10 and exposes grade labels", () => {
    for (const linggen of Object.values(linggenConfigs)) {
      expect(getLinggenAffinityTotal(linggen.id)).toBe(10);
      expect(getLinggenAffinityGradeSummary(linggen.id)).toEqual(
        linggen.roots.map((root) => {
          const value = linggen.rootAffinities[root];
          if (value <= 3) {
            return "Weak";
          }
          if (value <= 6) {
            return "Medium";
          }
          return "Strong";
        })
      );
    }
  });

  it("derives Slow, Normal, and Fast Mastery Speed from effective affinity", () => {
    expect(getGongfaMasterySpeedLabel("metal", "yujian-jue")).toBe("Fast");
    expect(getGongfaMasterySpeedLabel("water-metal", "yujian-jue")).toBe("Normal");
    expect(getGongfaMasterySpeedLabel("water-wood", "yujian-jue")).toBe("Slow");
  });
});
