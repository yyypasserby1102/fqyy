import { describe, expect, it } from "vitest";
import {
  applyGongfaImprovement,
  createGongfaRuntime,
  getAuthoredSkill2Plan
} from "../../src/logic/gongfaRuntime";

describe("Gongfa runtime", () => {
  it("constructs and refines a complete Gongfa combat package through one interface", () => {
    const initial = createGongfaRuntime({
      gongfaId: "yujian-jue"
    });

    const refined = applyGongfaImprovement(initial, "sword-intent-sharpening");

    expect(initial.combat.damage).toBe(15);
    expect(refined.runtime.combat.damage).toBe(20);
    expect(refined.playerEffect).toBeUndefined();
  });

  it("owns activation plans for every currently authored Skill 2", () => {
    expect(getAuthoredSkill2Plan("returning-sword-formation")).toEqual({
      intent: "returning-sword-formation",
      trigger: "timed",
      cooldownMs: 2400
    });
    expect(getAuthoredSkill2Plan("golden-gale-corridor")?.trigger).toBe("timed");
    expect(getAuthoredSkill2Plan("furnace-cascade")?.trigger).toBe("timed");
    expect(getAuthoredSkill2Plan("solar-flare-cycle")?.trigger).toBe("cycle");
    expect(getAuthoredSkill2Plan("blade-shell-rebound")?.trigger).toBe("threshold");
    expect(getAuthoredSkill2Plan("feather-rain-formation")).toBeUndefined();
  });
});
