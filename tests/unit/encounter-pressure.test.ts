import { describe, expect, it } from "vitest";
import { projectEncounterPressure } from "../../src/logic/encounterPressure";

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
      healthScale: 2.45,
      contactDamageScale: 1.61,
      speedScale: 1.42,
      spawnIntervalScale: 0.68,
      spawnAmountBonus: 3,
      concurrentEnemyBudget: 32,
      geometry: "flank",
      composition: ["bone-crow", "corpse-cultivator"]
    });
  });

  it("keeps multi-Gongfa burst builds under pressure in late Stages", () => {
    expect(projectEncounterPressure("jindan", "chuqi", 3)).toMatchObject({
      healthScale: 5.29,
      contactDamageScale: 1.94
    });
    expect(projectEncounterPressure("yuanying", "chuqi", 4)).toMatchObject({
      healthScale: 13.93,
      contactDamageScale: 2.74
    });
  });

  it("gets strictly tougher at each later Stage for the expected Gongfa count", () => {
    const pressures = [
      projectEncounterPressure("lianqi", "chuqi", 1),
      projectEncounterPressure("zhuji", "chuqi", 2),
      projectEncounterPressure("jindan", "chuqi", 3),
      projectEncounterPressure("yuanying", "chuqi", 4)
    ];

    for (let index = 1; index < pressures.length; index += 1) {
      expect(pressures[index].healthScale).toBeGreaterThan(pressures[index - 1].healthScale);
      expect(pressures[index].contactDamageScale).toBeGreaterThan(
        pressures[index - 1].contactDamageScale
      );
      expect(pressures[index].speedScale).toBeGreaterThan(pressures[index - 1].speedScale);
      expect(pressures[index].concurrentEnemyBudget).toBeGreaterThan(
        pressures[index - 1].concurrentEnemyBudget
      );
    }
  });
});
