import { describe, expect, it } from "vitest";
import { enemyConfigs } from "../../src/data/enemies";
import { projectEncounterPressure } from "../../src/logic/encounterPressure";
import {
  finalTribulationBosses,
  getStageTribulationBoss,
  projectTribulationBossPressure
} from "../../src/logic/tribulationBoss";

describe("Tianjie bosses", () => {
  it("replaces every Stage wave with a named, scaled boss encounter", () => {
    const profiles = [
      getStageTribulationBoss("lianqi"),
      getStageTribulationBoss("zhuji"),
      getStageTribulationBoss("jindan")
    ];

    expect(new Set(profiles.map(({ name }) => name)).size).toBe(3);
    expect(profiles.every(({ displayScale }) => displayScale >= 1.65)).toBe(true);
    expect(profiles.every(({ initialAdds, slamDamage }) => initialAdds > 0 && slamDamage > 0)).toBe(true);
  });

  it("makes each successive Stage boss substantially more durable", () => {
    const stages = ["lianqi", "zhuji", "jindan"] as const;
    const health = stages.map((stage, index) => {
      const profile = getStageTribulationBoss(stage);
      const pressure = projectEncounterPressure(stage, "dayuanman", index + 1);
      const bossPressure = projectTribulationBossPressure(pressure, profile);
      return enemyConfigs[profile.enemyId].maxHealth * bossPressure.healthScale;
    });

    expect(health[0]).toBeGreaterThan(700);
    expect(health[1]).toBeGreaterThan(health[0] * 2);
    expect(health[2]).toBeGreaterThan(health[1] * 2);
  });

  it("culminates in three increasingly durable Yuanying boss forms", () => {
    const pressure = projectEncounterPressure("yuanying", "dayuanman", 4);
    const health = finalTribulationBosses.map((profile) =>
      enemyConfigs[profile.enemyId].maxHealth *
      projectTribulationBossPressure(pressure, profile).healthScale
    );

    expect(finalTribulationBosses.map(({ name }) => name)).toEqual([
      "Heavenly Judgment Avatar",
      "Myriad Calamity Sovereign",
      "Heaven-Rending Dao Eye"
    ]);
    expect(health[0]).toBeGreaterThan(9_000);
    expect(health[1]).toBeGreaterThan(health[0]);
    expect(health[2]).toBeGreaterThan(health[1]);
  });
});
