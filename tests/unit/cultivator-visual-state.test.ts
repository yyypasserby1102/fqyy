import { describe, expect, it } from "vitest";
import {
  advanceCultivatorVisualState,
  createCultivatorVisualState
} from "../../src/logic/cultivatorVisualState";

describe("Cultivator visual state", () => {
  it("runs in the movement direction and keeps facing when returning to idle", () => {
    const running = advanceCultivatorVisualState(createCultivatorVisualState(), {
      kind: "tick",
      deltaMs: 16,
      movement: { x: -1, y: 0 }
    });
    const idle = advanceCultivatorVisualState(running, {
      kind: "tick",
      deltaMs: 16,
      movement: { x: 0, y: 0 }
    });

    expect(running).toMatchObject({ mode: "run", facing: "west" });
    expect(idle).toMatchObject({ mode: "idle", facing: "west" });
  });

  it("locks an attack facing until its presentation finishes", () => {
    const attacking = advanceCultivatorVisualState(createCultivatorVisualState(), {
      kind: "attack",
      direction: { x: 0, y: -1 }
    });
    const held = advanceCultivatorVisualState(attacking, {
      kind: "tick",
      deltaMs: 200,
      movement: { x: -1, y: 0 }
    });
    const released = advanceCultivatorVisualState(held, {
      kind: "tick",
      deltaMs: 100,
      movement: { x: -1, y: 0 }
    });

    expect(attacking).toEqual({ mode: "attack", facing: "north", remainingMs: 300 });
    expect(held).toEqual({ mode: "attack", facing: "north", remainingMs: 100 });
    expect(released).toEqual({ mode: "run", facing: "west", remainingMs: 0 });
  });

  it("keeps a Skill cast above attack and Evade presentation", () => {
    const casting = advanceCultivatorVisualState(createCultivatorVisualState(), {
      kind: "skill",
      direction: { x: 1, y: 0 }
    });
    const afterAttack = advanceCultivatorVisualState(casting, {
      kind: "attack",
      direction: { x: -1, y: 0 }
    });
    const afterEvade = advanceCultivatorVisualState(afterAttack, {
      kind: "evade",
      direction: { x: 0, y: -1 }
    });

    expect(casting).toEqual({ mode: "skill", facing: "east", remainingMs: 520 });
    expect(afterAttack).toEqual(casting);
    expect(afterEvade).toEqual(casting);
  });

  it("lets hit reaction interrupt a Skill and makes defeat terminal", () => {
    const casting = advanceCultivatorVisualState(createCultivatorVisualState(), {
      kind: "skill",
      direction: { x: 1, y: 0 }
    });
    const hit = advanceCultivatorVisualState(casting, { kind: "hit" });
    const defeated = advanceCultivatorVisualState(hit, { kind: "defeat" });
    const afterTick = advanceCultivatorVisualState(defeated, {
      kind: "tick",
      deltaMs: 1000,
      movement: { x: -1, y: 0 }
    });
    const afterAttack = advanceCultivatorVisualState(afterTick, {
      kind: "attack",
      direction: { x: -1, y: 0 }
    });

    expect(hit).toEqual({ mode: "hit", facing: "east", remainingMs: 160 });
    expect(defeated).toEqual({
      mode: "defeat",
      facing: "east",
      remainingMs: Number.POSITIVE_INFINITY
    });
    expect(afterTick).toEqual(defeated);
    expect(afterAttack).toEqual(defeated);
  });
});
