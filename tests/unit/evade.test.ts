import { describe, expect, it } from "vitest";
import { Evade } from "../../src/logic/evade";

describe("Evade", () => {
  it("starts an invulnerable evade in the requested direction", () => {
    const evade = new Evade();

    expect(evade.tryStart({ x: 1, y: 0 })).toBe(true);
    expect(evade.state).toEqual({
      active: true,
      invulnerable: true,
      direction: { x: 1, y: 0 },
      speed: 600,
      cooldownRemainingMs: 1_200
    });
  });

  it("ends invulnerability after 200ms and becomes ready after 1.2s", () => {
    const evade = new Evade();
    evade.tryStart({ x: 0, y: -1 });

    evade.advance(200);
    expect(evade.state.active).toBe(false);
    expect(evade.state.invulnerable).toBe(false);
    expect(evade.state.cooldownRemainingMs).toBe(1_000);
    expect(evade.tryStart({ x: 1, y: 0 })).toBe(false);

    evade.advance(1_000);
    expect(evade.state.cooldownRemainingMs).toBe(0);
    expect(evade.tryStart({ x: 1, y: 0 })).toBe(true);
  });

  it("does not consume the cooldown without a held movement direction", () => {
    const evade = new Evade();

    expect(evade.tryStart({ x: 0, y: 0 })).toBe(false);
    expect(evade.state.active).toBe(false);
    expect(evade.state.cooldownRemainingMs).toBe(0);
  });
});
