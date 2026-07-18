import { describe, expect, it } from "vitest";
import {
  getEnemyMovementBehavior,
  projectEnemyMovement
} from "../../src/logic/enemyMovement";

describe("enemy movement escalation", () => {
  it("keeps the opening rat readable while later enemies gain tactical movement", () => {
    expect(getEnemyMovementBehavior("jade-rat")).toBe("pursuit");
    expect(getEnemyMovementBehavior("mist-wolf")).toBe("pounce");
    expect(getEnemyMovementBehavior("resentful-spirit")).toBe("phase-flank");
    expect(getEnemyMovementBehavior("celestial-construct")).toBe("celestial-charge");
    expect(getEnemyMovementBehavior("tribulation-shade")).toBe("phase-flank");
  });

  it("gives Mist Wolves and Celestial Constructs real burst windows", () => {
    const base = {
      sourceX: 0,
      sourceY: 0,
      targetX: 100,
      targetY: 0,
      speed: 100
    };
    const wolfPounce = projectEnemyMovement({ ...base, enemyId: "mist-wolf", elapsedMs: 100 });
    const constructCharge = projectEnemyMovement({
      ...base,
      enemyId: "celestial-construct",
      elapsedMs: 2_700
    });

    expect(wolfPounce.mode).toBe("charge");
    expect(wolfPounce.velocityX).toBeCloseTo(170);
    expect(constructCharge.mode).toBe("charge");
    expect(constructCharge.velocityX).toBeCloseTo(185);
  });

  it("makes spirits flank instead of following a straight pursuit line", () => {
    const movement = projectEnemyMovement({
      enemyId: "tribulation-shade",
      elapsedMs: 500,
      sourceX: 0,
      sourceY: 0,
      targetX: 100,
      targetY: 0,
      speed: 100
    });

    expect(movement.mode).toBe("maneuver");
    expect(Math.abs(movement.velocityY)).toBeGreaterThan(40);
  });
});
