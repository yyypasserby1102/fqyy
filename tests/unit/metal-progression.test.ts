import { describe, expect, it } from "vitest";
import {
  advanceProgressionUntilChoice,
  getCurrentStage,
  getCompatibleUpgradeIdsForGongfa,
  getCompatibleGongfaIdsForLinggen,
  getFirstBreakthroughState,
  getGongfaStageState,
  getMetalBranchSpec,
  getPresentedGongfaIdsForLinggen,
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

  it("presents a balanced 3-choice dual-root Gongfa reveal instead of sampling one pool only", () => {
    expect(getPresentedGongfaIdsForLinggen("water-metal")).toEqual([
      "drifting-frost-needle",
      "yujian-jue",
      "black-tide-scripture"
    ]);
  });

  it("describes authored realm transitions for each Metal branch", () => {
    const metal = getMetalBranchSpec();

    expect(metal.realmOrder).toEqual(["lianqi", "zhuji", "jindan"]);
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

  it("does not leak unrelated Metal upgrades into another Metal Gongfa pool", () => {
    expect(getCompatibleUpgradeIdsForGongfa("jinfeng-gong")).toEqual([
      "cutting-qi-pressure",
      "broadened-front",
      "long-edge-resonance",
      "tempered-meridians",
      "jade-meridian",
      "minor-pill",
      "soul-lure-banner"
    ]);
  });

  it("maps levels into the authored Lianqi -> Zhuji -> Jindan thresholds", () => {
    expect(getCurrentStage(1)).toBe("lianqi");
    expect(getCurrentStage(3)).toBe("lianqi");
    expect(getCurrentStage(4)).toBe("zhuji");
    expect(getCurrentStage(6)).toBe("zhuji");
    expect(getCurrentStage(7)).toBe("jindan");
    expect(getCurrentStage(12)).toBe("jindan");
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

  it("does not repeat the first breakthrough after Linggen is already revealed", () => {
    expect(
      getFirstBreakthroughState({
        lingcaoCollected: true,
        linggenRevealed: true
      }).canReveal
    ).toBe(false);
  });

  it("halts on Zhuji breakthrough before later refinements when a large XP gain crosses the realm threshold", () => {
    expect(
      advanceProgressionUntilChoice({
        level: 3,
        xp: 100,
        xpToNext: 20,
        stage: "lianqi",
        mainGongfaId: "yujian-jue"
      })
    ).toEqual({
      level: 4,
      xp: 80,
      xpToNext: 29,
      stage: "zhuji",
      pendingChoice: {
        kind: "stage-breakthrough",
        stageId: "zhuji",
        gongfaId: "yujian-jue"
      },
      pendingUpgradeChoice: true
    });
  });

  it("offers a normal refinement when leveling within the same realm", () => {
    expect(
      advanceProgressionUntilChoice({
        level: 4,
        xp: 30,
        xpToNext: 26,
        stage: "zhuji",
        mainGongfaId: "yujian-jue"
      })
    ).toEqual({
      level: 5,
      xp: 4,
      xpToNext: 37,
      stage: "zhuji",
      pendingChoice: {
        kind: "upgrade"
      },
      pendingUpgradeChoice: false
    });
  });
});
