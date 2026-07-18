import { describe, expect, it } from "vitest";
import {
  getPhaseBreathingRoomMs,
  projectEncounterPressure
} from "../../src/logic/encounterPressure";

describe("Encounter pressure", () => {
  it("turns Lianqi Dayuanman into converging anti-kiting pressure", () => {
    expect(projectEncounterPressure("lianqi", "chuqi", 0)).toEqual({
      healthScale: 1,
      contactDamageScale: 1,
      speedScale: 1,
      spawnIntervalScale: 1,
      spawnAmountBonus: 0,
      concurrentEnemyBudget: 16,
      geometry: "ring",
      composition: ["jade-rat"]
    });

    expect(projectEncounterPressure("lianqi", "chuqi", 1).composition).toEqual([
      "jade-rat",
      "mist-wolf"
    ]);

    expect(projectEncounterPressure("lianqi", "dayuanman", 1)).toEqual({
      healthScale: 1.4,
      contactDamageScale: 1.25,
      speedScale: 1.55,
      spawnIntervalScale: 0.68,
      spawnAmountBonus: 3,
      concurrentEnemyBudget: 28,
      geometry: "converge",
      composition: ["jade-rat", "mist-wolf", "bone-crow"]
    });
  });

  it("compensates for every additional simultaneously active Gongfa", () => {
    expect(projectEncounterPressure("zhuji", "houqi", 2)).toEqual({
      healthScale: 2.03,
      contactDamageScale: 1.52,
      speedScale: 1.35,
      spawnIntervalScale: 0.68,
      spawnAmountBonus: 3,
      concurrentEnemyBudget: 30,
      geometry: "flank",
      composition: ["bone-crow", "corpse-cultivator"]
    });
  });

  it("adds a readable quiet beat after late-Stage phase milestones", () => {
    expect(getPhaseBreathingRoomMs("lianqi")).toBe(0);
    expect(getPhaseBreathingRoomMs("zhuji")).toBe(0);
    expect(getPhaseBreathingRoomMs("jindan")).toBe(4_000);
    expect(getPhaseBreathingRoomMs("yuanying")).toBe(4_000);
  });
});
