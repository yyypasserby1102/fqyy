import type { EnemyId } from "../data/enemies";

export type EnemyMovementBehavior =
  | "pursuit"
  | "pounce"
  | "weave"
  | "phase-flank"
  | "celestial-charge";

export type EnemyMovementMode = "pursue" | "maneuver" | "charge";

export interface EnemyMovementProjection {
  velocityX: number;
  velocityY: number;
  behavior: EnemyMovementBehavior;
  mode: EnemyMovementMode;
}

const enemyMovementBehaviors: Record<EnemyId, EnemyMovementBehavior> = {
  "jade-rat": "pursuit",
  "mist-wolf": "pounce",
  "bone-crow": "weave",
  "corpse-cultivator": "pursuit",
  "resentful-spirit": "phase-flank",
  "celestial-construct": "celestial-charge",
  "tribulation-shade": "phase-flank"
};

export function getEnemyMovementBehavior(enemyId: EnemyId): EnemyMovementBehavior {
  return enemyMovementBehaviors[enemyId];
}

export function projectEnemyMovement(input: {
  enemyId: EnemyId;
  elapsedMs: number;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  speed: number;
}): EnemyMovementProjection {
  const behavior = getEnemyMovementBehavior(input.enemyId);
  const baseAngle = Math.atan2(input.targetY - input.sourceY, input.targetX - input.sourceX);
  let angle = baseAngle;
  let speedMultiplier = 1;
  let mode: EnemyMovementMode = "pursue";

  if (behavior === "pounce") {
    const cycle = input.elapsedMs % 2_700;
    if (cycle < 520) {
      speedMultiplier = 1.7;
      mode = "charge";
    } else {
      speedMultiplier = 0.82;
    }
  } else if (behavior === "weave") {
    angle += Math.sin(input.elapsedMs / 360) * 0.5;
    mode = "maneuver";
  } else if (behavior === "phase-flank") {
    angle += Math.sin(input.elapsedMs / 520) * 0.68;
    speedMultiplier = 0.98;
    mode = "maneuver";
  } else if (behavior === "celestial-charge") {
    const cycle = input.elapsedMs % 3_200;
    if (cycle >= 2_400) {
      speedMultiplier = 1.85;
      mode = "charge";
    } else {
      speedMultiplier = 0.78;
    }
  }

  return {
    velocityX: Math.cos(angle) * input.speed * speedMultiplier,
    velocityY: Math.sin(angle) * input.speed * speedMultiplier,
    behavior,
    mode
  };
}
