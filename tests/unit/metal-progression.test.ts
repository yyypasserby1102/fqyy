import { describe, expect, it } from "vitest";
import {
  getCompatibleUpgradeIdsForGongfa,
  getCompatibleGongfaIdsForLinggen,
  getFirstBreakthroughState,
  getGongfaSkillTags,
  getGongfaStageState,
  getMetalBranchSpec,
  getPresentedGongfaIdsForLinggen,
  getStageNarrative,
  getStageProgressionSummary
} from "../../src/logic/progression";

describe("Metal progression tree", () => {
  it("exposes the exact Metal Gongfa trio for pure Metal Linggen", () => {
    expect(getCompatibleGongfaIdsForLinggen("metal")).toEqual([
      "yujian-jue",
      "jinfeng-gong",
      "gengjin-huti"
    ]);
  });

  it("mixes both pools for Water-Metal dual-root Linggen", () => {
    expect(getCompatibleGongfaIdsForLinggen("water-metal")).toEqual([
      "drifting-frost-needle",
      "black-tide-scripture",
      "ice-mirror-guard",
      "yujian-jue",
      "jinfeng-gong",
      "gengjin-huti"
    ]);
  });

  it("prioritizes the guaranteed Fire-Metal hybrid alongside the Fire and Metal picks", () => {
    expect(getPresentedGongfaIdsForLinggen("fire-metal")).toEqual([
      "burning-ring-scripture",
      "yujian-jue",
      "crimson-furnace-sword-art"
    ]);
  });

  it("drops learned Fire-Metal Gongfa and backfills from the authored pools without duplicates", () => {
    expect(
      getPresentedGongfaIdsForLinggen("fire-metal", [
        "burning-ring-scripture",
        "yujian-jue",
        "crimson-furnace-sword-art"
      ])
    ).toEqual([
      "blazing-feather-art",
      "scarlet-wave-manual",
      "jinfeng-gong"
    ]);
  });

  it("presents a balanced 3-choice dual-root Gongfa reveal instead of sampling one pool only", () => {
    expect(getPresentedGongfaIdsForLinggen("water-metal")).toEqual([
      "drifting-frost-needle",
      "yujian-jue",
      "black-tide-scripture"
    ]);
  });

  it("describes authored realm transitions for each Metal branch", () => {
    const metal = getMetalBranchSpec();

    expect(metal.realmOrder).toEqual(["lianqi", "zhuji", "jindan", "yuanying"]);
    expect(metal.branches).toHaveLength(3);
    expect(metal.branches.map((branch) => branch.id)).toEqual([
      "yujian-jue",
      "jinfeng-gong",
      "gengjin-huti"
    ]);
  });

  it("marks Jindan as a true transformation instead of only a numeric bump", () => {
    const summary = getStageProgressionSummary("yujian-jue");
    expect(summary.jindan.transitionKind).toBe("transform");
    expect(summary.jindan.signatureChange).toContain("return");

    const waveSummary = getStageProgressionSummary("jinfeng-gong");
    expect(waveSummary.jindan.transitionKind).toBe("transform");
    expect(waveSummary.jindan.signatureChange).toContain("trail");

    const auraSummary = getStageProgressionSummary("gengjin-huti");
    expect(auraSummary.jindan.transitionKind).toBe("transform");
    expect(auraSummary.jindan.signatureChange).toContain("blade shell");
  });

  it("gives Gengjin Huti a distinct blade-shell eruption only at Jindan", () => {
    const zhuji = getGongfaStageState("gengjin-huti", "zhuji");
    const jindan = getGongfaStageState("gengjin-huti", "jindan");

    expect(zhuji.shellBursts).toBe(0);
    expect(jindan.shellBursts).toBeGreaterThanOrEqual(1);
    expect(jindan.pierce).toBeGreaterThan(zhuji.pierce);
  });

  it("keeps Yujian Mastery specific to Yujian", () => {
    expect(getCompatibleUpgradeIdsForGongfa("yujian-jue")).toEqual([
      "sword-intent-sharpening",
      "twin-sword-split",
      "refined-sword-channel",
      "steady-sword-heart",
      "swordborne-steps",
      "penetrating-intent",
      "yujian-jue-formation-tempering",
      "yujian-jue-expanded-sword-array",
      "yujian-jue-swift-formation"
    ]);
  });

  it("includes only the full six authored refinements for Jinfeng Gong", () => {
    expect(getCompatibleUpgradeIdsForGongfa("jinfeng-gong")).toEqual([
      "cutting-qi-pressure",
      "broadened-front",
      "long-edge-resonance",
      "gathering-gale",
      "unbroken-stride",
      "windborne-reach",
      "jinfeng-gong-corridor-edge",
      "jinfeng-gong-expanding-passage",
      "jinfeng-gong-rapid-crosswinds"
    ]);
  });

  it("includes only the full six authored refinements for Gengjin Huti", () => {
    expect(getCompatibleUpgradeIdsForGongfa("gengjin-huti")).toEqual([
      "guard-pressure",
      "retaliatory-edge",
      "expanding-shell",
      "lasting-temper",
      "bulwark-reflection",
      "unyielding-shield",
      "gengjin-huti-tempered-shell",
      "gengjin-huti-layered-eruption",
      "gengjin-huti-rapid-reforging"
    ]);
  });

  it("includes only the full six authored refinements for Burning Ring Scripture", () => {
    expect(getCompatibleUpgradeIdsForGongfa("burning-ring-scripture")).toEqual([
      "broadened-flame",
      "rapid-revolution",
      "scorching-passage",
      "gathering-heat",
      "banked-ember",
      "ember-step",
      "burning-ring-scripture-solar-tempering",
      "burning-ring-scripture-widened-corona",
      "burning-ring-scripture-accelerated-cycle"
    ]);
  });

  it("includes only the full six authored refinements for Crimson Furnace Sword Art", () => {
    expect(getCompatibleUpgradeIdsForGongfa("crimson-furnace-sword-art")).toEqual([
      "tempered-needles",
      "rapid-forging",
      "deep-embedding",
      "furnace-expansion",
      "rising-pressure",
      "sealed-crucible",
      "crimson-furnace-sword-art-cascade-tempering",
      "crimson-furnace-sword-art-scattering-furnace",
      "crimson-furnace-sword-art-rapid-cascade"
    ]);
  });

  it("does not leak unrelated Metal upgrades into another Metal Gongfa pool", () => {
    expect(getCompatibleUpgradeIdsForGongfa("jinfeng-gong")).toEqual([
      "cutting-qi-pressure",
      "broadened-front",
      "long-edge-resonance",
      "gathering-gale",
      "unbroken-stride",
      "windborne-reach",
      "jinfeng-gong-corridor-edge",
      "jinfeng-gong-expanding-passage",
      "jinfeng-gong-rapid-crosswinds"
    ]);
  });

  it("exposes the wave and metal skill tags for Jinfeng Gong", () => {
    expect(getGongfaSkillTags("jinfeng-gong")).toEqual(["wave", "metal"]);
  });

  it("exposes the aura, metal, and defensive skill tags for Gengjin Huti", () => {
    expect(getGongfaSkillTags("gengjin-huti")).toEqual(["aura", "metal", "defensive"]);
  });

  it("exposes the aura and fire skill tags for Burning Ring Scripture", () => {
    expect(getGongfaSkillTags("burning-ring-scripture")).toEqual(["aura", "fire"]);
  });

  it("derives fallback skill tags and progression narratives for non-specialized Gongfa", () => {
    expect(getGongfaSkillTags("blazing-feather-art")).toEqual(["homing", "fire"]);

    const summary = getStageProgressionSummary("blazing-feather-art");
    expect(summary.lianqi.signatureChange).toBe("acquire Blazing Feather Art");
    expect(summary.zhuji.transitionKind).toBe("refine");
    expect(getStageNarrative("blazing-feather-art", "yuanying").signatureChange).toContain(
      "nascent-soul"
    );
  });

  it("falls back to the Jindan combat state for stages without authored stats", () => {
    expect(getGongfaStageState("blazing-feather-art", "yuanying")).toEqual(
      getGongfaStageState("blazing-feather-art", "jindan")
    );
  });

  it("exposes projectile, explosive, fire, and metal tags for Crimson Furnace Sword Art", () => {
    expect(getGongfaSkillTags("crimson-furnace-sword-art")).toEqual([
      "projectile",
      "explosive",
      "fire",
      "metal"
    ]);
  });

  it("does not allow the first breakthrough before Lingcao is claimed", () => {
    expect(
      getFirstBreakthroughState({
        lingcaoCollected: false,
        linggenRevealed: false
      }).canReveal
    ).toBe(false);
  });

  it("allows the first breakthrough immediately after Lingcao is claimed", () => {
    const state = getFirstBreakthroughState({
      lingcaoCollected: true,
      linggenRevealed: false
    });

    expect(state.canReveal).toBe(true);
    expect(state.reason).toContain("Lingcao");
  });

  it("returns the remaining compatible Gongfa when a reveal has three or fewer choices", () => {
    expect(
      getPresentedGongfaIdsForLinggen("metal", ["yujian-jue", "jinfeng-gong"])
    ).toEqual(["gengjin-huti"]);
  });

  it("does not repeat the first breakthrough after Linggen is already revealed", () => {
    expect(
      getFirstBreakthroughState({
        lingcaoCollected: true,
        linggenRevealed: true
      }).canReveal
    ).toBe(false);
  });

});
