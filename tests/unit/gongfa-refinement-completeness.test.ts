import { describe, expect, it } from "vitest";
import { gongfaConfigs, type GongfaId } from "../../src/data/gongfa";
import { upgradeConfigs } from "../../src/data/upgrades";
import {
  getDeterministicMasteryChoiceIds,
  getRank10Skill2Id,
  isGongfaFullyMastered
} from "../../src/logic/mastery";
import {
  advanceGongfaMasteryProgress,
  advanceGongfaRuntime,
  applyGongfaImprovement,
  createGongfaCollectionFromCheckpoint,
  createGongfaRuntime
} from "../../src/logic/gongfaRuntime";

describe("complete Gongfa refinement tracks", () => {
  it("caps an oversized final Qi gain at the Rank-22 endpoint", () => {
    const refinements = upgradeConfigs
      .filter((upgrade) => upgrade.requiredGongfaIds?.includes("scarlet-wave-manual") && upgrade.id !== "counterflow-ring")
      .flatMap((upgrade) => [upgrade.id, upgrade.id]);
    const learnedIds = refinements.slice(0, -1);
    const result = advanceGongfaMasteryProgress({
      masteryPoints: 2190,
      masteryRank: 21,
      masterySkill2Id: "sunset-wave-apex",
      masterySkill2CooldownRemaining: 0,
      masteryChoiceActive: false,
      masteryPendingRanks: []
    }, {
      gongfaId: "scarlet-wave-manual",
      points: 310,
      finalBossActive: false,
      learnedIds
    });

    expect(result.state.masteryRank).toBe(22);
    expect(result.automaticRewards).toHaveLength(1);
  });

  it("enforces Skill-1 and Skill-2 effect scopes in runtime numbers", () => {
    const cast = (runtime: ReturnType<typeof createGongfaRuntime>) =>
      advanceGongfaRuntime(runtime, {
        kind: "skill2",
        skill2Id: "feather-rain-formation",
        eligibleTargetCount: 3
      }).commands[0];
    const base = createGongfaRuntime({ gongfaId: "blazing-feather-art" });
    const skill1Refined = applyGongfaImprovement(base, "tempered-plumage").runtime;
    expect(skill1Refined.combat.damage).toBeGreaterThan(base.combat.damage);
    expect(cast(skill1Refined)).toMatchObject({ damage: (cast(base) as { damage: number }).damage });

    skill1Refined.mastery.masteryLearnedIds.push("blazing-feather-art-rain-tempering");
    expect((cast(skill1Refined) as { damage: number }).damage).toBeGreaterThan(
      (cast(base) as { damage: number }).damage
    );
  });

  it("reconstructs the Skill-1 scope ledger for legacy runtime saves", () => {
    const legacyRuntime = applyGongfaImprovement(
      createGongfaRuntime({ gongfaId: "blazing-feather-art" }),
      "tempered-plumage"
    ).runtime;
    legacyRuntime.mastery.masteryLearnedIds.push("tempered-plumage");
    delete legacyRuntime.skill1Refinements;

    const restored = createGongfaCollectionFromCheckpoint({
      primaryGongfaId: "blazing-feather-art",
      runtimes: [legacyRuntime]
    }).byId["blazing-feather-art"]!;
    const command = advanceGongfaRuntime(restored, {
      kind: "skill2",
      skill2Id: "feather-rain-formation",
      eligibleTargetCount: 3
    }).commands[0] as { damage: number };
    const baseCommand = advanceGongfaRuntime(
      createGongfaRuntime({ gongfaId: "blazing-feather-art" }),
      { kind: "skill2", skill2Id: "feather-rain-formation", eligibleTargetCount: 3 }
    ).commands[0] as { damage: number };

    expect(restored.skill1Refinements?.damageBonus).toBe(4);
    expect(command.damage).toBe(baseCommand.damage);
  });

  for (const gongfaId of Object.keys(gongfaConfigs) as GongfaId[]) {
    it(`${gongfaId} has six two-tier starting families and three two-tier Skill 2 families`, () => {
      const refinements = upgradeConfigs.filter(
        (upgrade) => upgrade.requiredGongfaIds?.includes(gongfaId) &&
          upgrade.id !== "counterflow-ring"
      );
      const starting = refinements.filter((upgrade) => (upgrade.unlockRank ?? 0) < 10);
      const skill2 = refinements.filter((upgrade) => upgrade.unlockRank === 10);

      expect(starting).toHaveLength(6);
      expect(skill2).toHaveLength(3);
      expect(starting.filter((upgrade) => upgrade.category === "skill1")).toHaveLength(2);
      expect(starting.filter((upgrade) => upgrade.category === "passive")).toHaveLength(2);
      expect(starting.filter((upgrade) => upgrade.category === "synergy")).toHaveLength(2);
      expect(skill2.every((upgrade) => upgrade.category === "skill2")).toBe(true);
      for (const refinement of refinements) {
        expect(refinement.maxSelections).toBe(2);
        expect(refinement.scope?.length).toBeGreaterThan(5);
      }
    });

    it(`${gongfaId} keeps Skill 2 refinements sealed until Rank 10 and completes at Rank 22`, () => {
      const startingIds = upgradeConfigs
        .filter((upgrade) => upgrade.requiredGongfaIds?.includes(gongfaId) && (upgrade.unlockRank ?? 0) < 10 && upgrade.id !== "counterflow-ring")
        .flatMap((upgrade) => [upgrade.id, upgrade.id]);
      const skill2Ids = upgradeConfigs
        .filter((upgrade) => upgrade.requiredGongfaIds?.includes(gongfaId) && upgrade.unlockRank === 10)
        .flatMap((upgrade) => [upgrade.id, upgrade.id]);

      expect(getDeterministicMasteryChoiceIds({ gongfaId, rank: 8, seed: "track", learnedIds: startingIds }))
        .toEqual([]);
      expect(isGongfaFullyMastered(gongfaId, 21, getRank10Skill2Id(gongfaId), [...startingIds, ...skill2Ids.slice(0, -1)])).toBe(false);
      expect(isGongfaFullyMastered(gongfaId, 21, getRank10Skill2Id(gongfaId), [...startingIds, ...skill2Ids])).toBe(false);
      expect(isGongfaFullyMastered(gongfaId, 22, getRank10Skill2Id(gongfaId), [...startingIds, ...skill2Ids])).toBe(true);
    });
  }
});
