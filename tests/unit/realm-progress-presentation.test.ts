import { describe, expect, it } from "vitest";
import {
  formatRealmMilestoneReward,
  getRealmProgressPresentation,
  REALM_PHASE_LABELS
} from "../../src/logic/realmProgressPresentation";

describe("Realm progress presentation", () => {
  it("maps all four phases onto one continuous segmented track", () => {
    expect(REALM_PHASE_LABELS).toEqual(["Chuqi", "Zhongqi", "Houqi", "Dayuanman"]);
    expect(getRealmProgressPresentation("chuqi", 50)).toMatchObject({
      phaseLabel: "Chuqi",
      completedMilestones: 0,
      totalProgress: 0.125
    });
    expect(getRealmProgressPresentation("houqi", 0)).toMatchObject({
      phaseLabel: "Houqi",
      completedMilestones: 2,
      totalProgress: 0.5
    });
    expect(getRealmProgressPresentation("dayuanman", 100)).toMatchObject({
      phaseLabel: "Dayuanman",
      completedMilestones: 3,
      totalProgress: 1
    });
  });

  it("makes the automatic milestone reward explicit", () => {
    expect(formatRealmMilestoneReward("zhongqi", 5)).toBe(
      "Zhongqi complete · Foundation Growth +1 · Total 5"
    );
  });
});
