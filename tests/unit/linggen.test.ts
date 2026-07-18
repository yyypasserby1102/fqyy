import { describe, expect, it } from "vitest";
import {
  getGongfaMasteryEfficiency,
  getCultivatorCandidates,
  getGongfaMasterySpeedLabel,
  getLinggenAffinityGradeSummary,
  getLinggenAffinityTotal,
  getMasterySpeedLabelFromValue,
  rollLinggen,
  linggenConfigs
} from "../../src/data/linggen";
import { setRandomSeed } from "../../src/utils/random";
import { getCompatibleGongfaIdsForLinggen } from "../../src/logic/progression";

describe("Linggen affinity rules", () => {
  it("gives pure Wood access to every authored Wood Gongfa package", () => {
    expect(getCompatibleGongfaIdsForLinggen("wood")).toEqual([
      "green-vine-art",
      "ironwood-wave-form",
      "verdant-ring-scripture",
      "thousand-root-formation",
      "myriad-beast-grove",
      "ancient-tree-body-art"
    ]);
    expect(getGongfaMasterySpeedLabel("wood", "green-vine-art")).toBe("Fast");
  });
  it("derives per-Gongfa Mastery efficiency from required-root affinity", () => {
    expect(getGongfaMasteryEfficiency("fire-metal", "burning-ring-scripture")).toBe(1);
    expect(getGongfaMasteryEfficiency("fire-metal", "yujian-jue")).toBeCloseTo(4 / 6);
    expect(getGongfaMasteryEfficiency("fire-metal", "crimson-furnace-sword-art")).toBeCloseTo(
      5 / 6
    );
  });

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

  it("classifies mastery speed boundaries and rolls deterministic Linggen candidates", () => {
    expect(getMasterySpeedLabelFromValue(3)).toBe("Slow");
    expect(getMasterySpeedLabelFromValue(6)).toBe("Normal");
    expect(getMasterySpeedLabelFromValue(7)).toBe("Fast");

    setRandomSeed(1);
    expect(rollLinggen().id).toBe("water");
  });

  it("generates three deterministic visible Cultivator Candidates with single and dual roots", () => {
    const first = getCultivatorCandidates(42);
    const second = getCultivatorCandidates(42);

    expect(second).toEqual(first);
    expect(first).toHaveLength(3);
    expect(new Set(first.map((candidate) => candidate.linggenId)).size).toBe(3);
    expect(first.some((candidate) => candidate.roots.length === 1)).toBe(true);
    expect(first.some((candidate) => candidate.roots.length === 2)).toBe(true);
    expect(first.every((candidate) => candidate.affinityGrades.length === candidate.roots.length)).toBe(
      true
    );
    expect(new Set(first.map((candidate) => candidate.familyName)).size).toBe(1);
    expect(new Set(first.map((candidate) => candidate.familyNameZh)).size).toBe(1);
    expect(new Set(first.map((candidate) => candidate.givenName)).size).toBe(3);
    expect(new Set(first.map((candidate) => candidate.givenNameZh)).size).toBe(3);
    expect(first.every((candidate) => candidate.name === `${candidate.familyName} ${candidate.givenName}`)).toBe(true);
    expect(first.every((candidate) => candidate.nameZh === `${candidate.familyNameZh}${candidate.givenNameZh}`)).toBe(true);
    expect(first.every((candidate) => !candidate.name.includes("Candidate"))).toBe(true);
  });
});
