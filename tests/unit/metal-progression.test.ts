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
import { isPlayableGongfa } from "../../src/data/gongfa";
import { linggenConfigs, type LinggenId } from "../../src/data/linggen";

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

  it("drops learned Fire-Metal Gongfa and backfills only with Playable Gongfa", () => {
    // The remaining unlearned Fire pool is stat-only scaffolds
    // (blazing-feather-art, scarlet-wave-manual) which must never be offered,
    // so the offer falls back to the two unlearned Playable Metal Gongfa.
    expect(
      getPresentedGongfaIdsForLinggen("fire-metal", [
        "burning-ring-scripture",
        "yujian-jue",
        "crimson-furnace-sword-art"
      ])
    ).toEqual(["jinfeng-gong", "gengjin-huti"]);
  });

  it("never offers stat-only scaffolds even when the compatible pool contains them", () => {
    // Water-Metal compatibility includes three Water scaffolds, but only the
    // Playable Metal trio is authored, so only those may be presented.
    expect(getPresentedGongfaIdsForLinggen("water-metal")).toEqual([
      "yujian-jue",
      "jinfeng-gong",
      "gengjin-huti"
    ]);
  });

  it("only ever presents Playable Gongfa across every Linggen profile", () => {
    const everyLinggen = Object.keys(linggenConfigs) as LinggenId[];
    for (const linggenId of everyLinggen) {
      const presented = getPresentedGongfaIdsForLinggen(linggenId);
      expect(presented.every(isPlayableGongfa)).toBe(true);
    }
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

  it("includes Gongfa-specific upgrades plus generic refinements for Yujian Jue", () => {
    expect(getCompatibleUpgradeIdsForGongfa("yujian-jue")).toEqual([
      "sword-intent-sharpening",
      "twin-sword-split",
      "refined-sword-channel",
      "tempered-meridians",
      "jade-meridian",
      "minor-pill",
      "soul-lure-banner"
    ]);
  });

  it("includes the full six authored refinements plus generic fallbacks for Jinfeng Gong", () => {
    expect(getCompatibleUpgradeIdsForGongfa("jinfeng-gong")).toEqual([
      "cutting-qi-pressure",
      "broadened-front",
      "long-edge-resonance",
      "gathering-gale",
      "unbroken-stride",
      "windborne-reach",
      "tempered-meridians",
      "jade-meridian",
      "minor-pill",
      "soul-lure-banner"
    ]);
  });

  it("includes the full six authored refinements plus generic fallbacks for Gengjin Huti", () => {
    expect(getCompatibleUpgradeIdsForGongfa("gengjin-huti")).toEqual([
      "guard-pressure",
      "retaliatory-edge",
      "expanding-shell",
      "lasting-temper",
      "bulwark-reflection",
      "unyielding-shield",
      "tempered-meridians",
      "jade-meridian",
      "minor-pill",
      "soul-lure-banner"
    ]);
  });

  it("includes the full six authored refinements plus generic fallbacks for Burning Ring Scripture", () => {
    expect(getCompatibleUpgradeIdsForGongfa("burning-ring-scripture")).toEqual([
      "broadened-flame",
      "rapid-revolution",
      "scorching-passage",
      "counterflow-ring",
      "gathering-heat",
      "banked-ember",
      "tempered-meridians",
      "jade-meridian",
      "minor-pill",
      "soul-lure-banner"
    ]);
  });

  it("includes the full six authored refinements plus generic fallbacks for Crimson Furnace Sword Art", () => {
    expect(getCompatibleUpgradeIdsForGongfa("crimson-furnace-sword-art")).toEqual([
      "tempered-needles",
      "rapid-forging",
      "deep-embedding",
      "furnace-expansion",
      "rising-pressure",
      "sealed-crucible",
      "tempered-meridians",
      "jade-meridian",
      "minor-pill",
      "soul-lure-banner"
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
      "tempered-meridians",
      "jade-meridian",
      "minor-pill",
      "soul-lure-banner"
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
