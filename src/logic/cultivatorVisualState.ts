export type CultivatorFacing = "north" | "south" | "east" | "west";

export interface CultivatorVector {
  x: number;
  y: number;
}

export type CultivatorVisualMode =
  | "idle"
  | "run"
  | "attack"
  | "skill"
  | "evade"
  | "hit"
  | "defeat";

export interface CultivatorVisualState {
  mode: CultivatorVisualMode;
  facing: CultivatorFacing;
  remainingMs: number;
}

export type CultivatorVisualEvent =
  | {
      kind: "tick";
      deltaMs: number;
      movement: CultivatorVector;
    }
  | {
      kind: "attack";
      direction: CultivatorVector;
    }
  | {
      kind: "skill";
      direction: CultivatorVector;
    }
  | {
      kind: "evade";
      direction: CultivatorVector;
    }
  | { kind: "hit" }
  | { kind: "defeat" };

const visualPriority: Record<CultivatorVisualMode, number> = {
  idle: 0,
  run: 0,
  evade: 1,
  attack: 2,
  skill: 3,
  hit: 4,
  defeat: 5
};

const presentationDurationMs = {
  attack: 300,
  skill: 520,
  evade: 200,
  hit: 160,
  defeat: Number.POSITIVE_INFINITY
} as const;

export function createCultivatorVisualState(): CultivatorVisualState {
  return {
    mode: "idle",
    facing: "east",
    remainingMs: 0
  };
}

function facingFromVector(
  vector: CultivatorVector,
  fallback: CultivatorFacing
): CultivatorFacing {
  if (vector.x === 0 && vector.y === 0) return fallback;
  if (Math.abs(vector.x) >= Math.abs(vector.y)) return vector.x < 0 ? "west" : "east";
  return vector.y < 0 ? "north" : "south";
}

export function advanceCultivatorVisualState(
  state: CultivatorVisualState,
  event: CultivatorVisualEvent
): CultivatorVisualState {
  if (event.kind !== "tick") {
    if (
      state.remainingMs > 0 &&
      visualPriority[state.mode] >= visualPriority[event.kind]
    ) {
      return state;
    }
    return {
      mode: event.kind,
      facing: "direction" in event
        ? facingFromVector(event.direction, state.facing)
        : state.facing,
      remainingMs: presentationDurationMs[event.kind]
    };
  }

  const remainingMs = Math.max(0, state.remainingMs - Math.max(0, event.deltaMs));
  if (remainingMs > 0) {
    return { ...state, remainingMs };
  }

  const moving = event.movement.x !== 0 || event.movement.y !== 0;
  return {
    mode: moving ? "run" : "idle",
    facing: facingFromVector(event.movement, state.facing),
    remainingMs: 0
  };
}
