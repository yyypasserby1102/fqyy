import { describe, expect, it } from "vitest";
import { gongfaConfigs } from "../../src/data/gongfa";
import { firstSliceLinggenPool, linggenConfigs } from "../../src/data/linggen";
import { stageOrder } from "../../src/data/stages";
import { upgradeConfigs } from "../../src/data/upgrades";

describe("config schema validation", () => {
  it("keeps the first-slice Linggen pool within the designed scope", () => {
    expect(firstSliceLinggenPool).toHaveLength(6);
    firstSliceLinggenPool.forEach((id) => {
      expect(linggenConfigs[id].roots.length).toBeGreaterThanOrEqual(1);
      expect(linggenConfigs[id].roots.length).toBeLessThanOrEqual(2);
    });
  });

  it("defines every Gongfa for every playable stage", () => {
    Object.values(gongfaConfigs).forEach((gongfa) => {
      stageOrder.forEach((stageId) => {
        expect(gongfa.stages[stageId]).toBeDefined();
      });
    });
  });

  it("ensures Gongfa-specific upgrades only target known Gongfa ids", () => {
    const knownIds = new Set(Object.keys(gongfaConfigs));
    upgradeConfigs.forEach((upgrade) => {
      upgrade.requiredGongfaIds?.forEach((id) => {
        expect(knownIds.has(id)).toBe(true);
      });
    });
  });
});
