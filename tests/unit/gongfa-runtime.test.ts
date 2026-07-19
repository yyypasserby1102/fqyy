import { describe, expect, it } from "vitest";
import { gongfaConfigs, type GongfaId } from "../../src/data/gongfa";
import { upgradeConfigs } from "../../src/data/upgrades";
import {
  advanceGongfaMasteryProgress,
  advanceGongfaRuntimeForProjectileHit,
  advanceGongfaRuntime,
  advanceTimedMasterySkill2Cooldown,
  applyGongfaMasteryChoice,
  applyGongfaImprovement,
  advanceGongfaCollectionMastery,
  createGongfaCollectionRuntime,
  createGongfaCollectionRuntimeFromCheckpoint,
  createGongfaCollectionFromCheckpoint,
  learnGongfa,
  migrateLegacyMasteryPendingRanks,
  createGongfaRuntime,
  createGongfaMasteryStateFromCheckpoint,
  createGongfaRuntimeFromCheckpoint,
  galeStepSeveranceCorridor,
  ironWakeWall,
  reboundingEdgeBlade,
  getAuthoredSkill2CooldownMs,
  getCrimsonEmbedThreshold,
  getAuthoredSkill2Plan,
  getGongfaProjectileHitMode,
  getGongfaRuntimeTickThreatRadius,
  planGongfaAttack,
  projectGongfaMasteryCheckpoint,
  projectGongfaCollectionMasteryCheckpoint,
  projectGongfaCollectionCheckpoint,
  projectGongfaRuntimeCheckpoint,
  projectGongfaRuntimeView,
  recordMasterySkill2Cast,
  selectCrimsonFurnaceTargetIndexes,
  splitGongfaImprovementReplayIds
} from "../../src/logic/gongfaRuntime";
import { getRank10Skill2Id } from "../../src/logic/mastery";

describe("Gongfa runtime", () => {
  it("migrates legacy ordinary and rank-10 pending panels into automatic rewards", () => {
    const migrated = migrateLegacyMasteryPendingRanks(
      {
        masteryPoints: 1000,
        masteryRank: 10,
        masterySkill2CooldownRemaining: 0,
        masteryChoiceActive: true,
        masteryPendingRanks: [1, 3, 4, 10],
        masteryLearnedIds: []
      },
      { gongfaId: "yujian-jue", seed: "legacy-seed", finalBossActive: false }
    );

    expect(migrated.state.masteryPendingRanks).toEqual([3]);
    expect(migrated.state.masteryChoiceActive).toBe(true);
    expect(migrated.state.masterySkill2Id).toBe("returning-sword-formation");
    expect(migrated.automaticRewardIds).toHaveLength(2);
    expect(migrated.state.masteryLearnedIds).toEqual(migrated.automaticRewardIds);
  });

  it("keeps migrated Transformation choices banked during the final boss", () => {
    const migrated = migrateLegacyMasteryPendingRanks(
      {
        masteryPoints: 900,
        masteryRank: 9,
        masterySkill2CooldownRemaining: 0,
        masteryChoiceActive: false,
        masteryPendingRanks: [9],
        masteryLearnedIds: []
      },
      { gongfaId: "yujian-jue", seed: "legacy-seed", finalBossActive: true }
    );
    expect(migrated.state.masteryPendingRanks).toEqual([9]);
    expect(migrated.state.masteryChoiceActive).toBe(false);
  });

  it("advances every learned Gongfa on an independent Mastery track", () => {
    const yujian = learnGongfa(createGongfaCollectionRuntime(), "yujian-jue", true);
    const twoGongfa = learnGongfa(yujian, "jinfeng-gong");

    const firstGain = advanceGongfaCollectionMastery(twoGongfa, {
      points: 120,
      finalBossActive: false
    });
    const secondGain = advanceGongfaCollectionMastery(firstGain.runtime, {
      points: 80,
      finalBossActive: false
    });

    expect(secondGain.runtime.byId["yujian-jue"]?.mastery).toMatchObject({
      masteryPoints: 200,
      masteryRank: 2,
      masteryPendingRanks: [],
      masteryLearnedIds: expect.any(Array)
    });
    expect(secondGain.runtime.byId["jinfeng-gong"]?.mastery).toMatchObject({
      masteryPoints: 200,
      masteryRank: 2,
      masteryPendingRanks: [],
      masteryLearnedIds: expect.any(Array)
    });
    expect(secondGain.runtime.byId["yujian-jue"]?.mastery.masteryLearnedIds).toHaveLength(2);
    expect(secondGain.runtime.byId["jinfeng-gong"]?.mastery.masteryLearnedIds).toHaveLength(2);
    expect(secondGain.rankUps.map(({ gongfaId }) => gongfaId)).toEqual([
      "yujian-jue",
      "jinfeng-gong"
    ]);
  });

  it("advances a secondary Gongfa through the same runtime interface as the primary", () => {
    const collection = learnGongfa(
      learnGongfa(createGongfaCollectionRuntime(), "burning-ring-scripture", true),
      "crimson-furnace-sword-art"
    );
    const secondary = collection.byId["crimson-furnace-sword-art"]!;

    const advanced = advanceGongfaRuntime(secondary, {
      kind: "crimson-detonation",
      x: 10,
      y: 20,
      damage: 20,
      fromEmbed: true
    });

    expect(collection.primaryGongfaId).toBe("burning-ring-scripture");
    expect(advanced.runtime.gongfaId).toBe("crimson-furnace-sword-art");
    expect(advanced.runtime.crimsonFurnace!.pressure).toBeGreaterThan(0);
  });

  it("can advance learned Gongfa at different affinity-derived rates", () => {
    const learned = learnGongfa(
      learnGongfa(createGongfaCollectionRuntime(), "yujian-jue", true),
      "burning-ring-scripture"
    );

    const result = advanceGongfaCollectionMastery(learned, {
      points: (gongfaId) => gongfaId === "yujian-jue" ? 80 : 120,
      finalBossActive: false
    });

    expect(result.runtime.byId["yujian-jue"]?.mastery.masteryPoints).toBe(80);
    expect(result.runtime.byId["burning-ring-scripture"]?.mastery.masteryPoints).toBe(120);
  });

  it("persists every learned Gongfa Mastery track without sharing checkpoint arrays", () => {
    const learned = learnGongfa(
      learnGongfa(createGongfaCollectionRuntime(), "yujian-jue", true),
      "jinfeng-gong"
    );
    learned.byId["yujian-jue"]!.mastery.masteryLearnedIds.push("sword-bloom");
    learned.byId["jinfeng-gong"]!.mastery.masteryPoints = 240;

    const checkpoint = projectGongfaCollectionMasteryCheckpoint(learned);
    const restored = createGongfaCollectionRuntimeFromCheckpoint(checkpoint);
    restored.byId["yujian-jue"]!.mastery.masteryLearnedIds.push("execution-seal");

    expect(checkpoint).toEqual({
      primaryGongfaId: "yujian-jue",
      masteries: [
        expect.objectContaining({
          gongfaId: "yujian-jue",
          masteryLearnedIds: ["sword-bloom"]
        }),
        expect.objectContaining({
          gongfaId: "jinfeng-gong",
          masteryPoints: 240
        })
      ]
    });
  });

  it("checkpoints every learned Gongfa combat and passive state", () => {
    let collection = learnGongfa(createGongfaCollectionRuntime(), "jinfeng-gong", true);
    collection = learnGongfa(collection, "burning-ring-scripture");
    collection.byId["jinfeng-gong"]!.jinfeng!.momentum = 4;
    collection.byId["jinfeng-gong"]!.attackCooldownRemaining = 320;
    collection.byId["jinfeng-gong"]!.jinfeng!.walkingStormCooldownRemaining = 450;
    collection.byId["jinfeng-gong"]!.combat.range = 188;
    collection.byId["burning-ring-scripture"]!.burningRing!.heat = 72;

    const checkpoint = projectGongfaCollectionCheckpoint(collection);
    const restored = createGongfaCollectionFromCheckpoint(checkpoint);

    expect(restored.byId["jinfeng-gong"]!.jinfeng!.momentum).toBe(4);
    expect(restored.byId["jinfeng-gong"]!.attackCooldownRemaining).toBe(0);
    expect(restored.byId["jinfeng-gong"]!.jinfeng!.walkingStormCooldownRemaining).toBe(0);
    expect(restored.byId["jinfeng-gong"]!.combat.range).toBe(188);
    expect(restored.byId["burning-ring-scripture"]!.burningRing!.heat).toBe(72);

    restored.byId["jinfeng-gong"]!.jinfeng!.momentum = 1;
    expect(checkpoint.runtimes[0].jinfeng!.momentum).toBe(4);
  });

  it("constructs and refines a complete Gongfa combat package through one interface", () => {
    const initial = createGongfaRuntime({
      gongfaId: "yujian-jue",
      yujian: { intentStacks: 2 }
    });

    const refined = applyGongfaImprovement(initial, "sword-intent-sharpening");

    expect(initial.combat.damage).toBe(15);
    expect(refined.runtime.combat.damage).toBe(21);
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
    expect(getAuthoredSkill2Plan("feather-rain-formation")?.trigger).toBe("timed");
    expect(getAuthoredSkill2Plan("missing-skill-2")).toBeUndefined();
  });

  it("owns timed Skill 2 cooldown interpretation", () => {
    expect(getAuthoredSkill2CooldownMs("returning-sword-formation")).toBe(2400);
    expect(getAuthoredSkill2CooldownMs("missing-skill-2")).toBe(0);

    expect(advanceTimedMasterySkill2Cooldown("returning-sword-formation", 1000, 400)).toEqual({
      cooldownRemainingMs: 600
    });
    expect(advanceTimedMasterySkill2Cooldown("returning-sword-formation", 1000, 1000)).toEqual({
      cooldownRemainingMs: 0,
      readySkill2Id: "returning-sword-formation"
    });
    expect(advanceTimedMasterySkill2Cooldown("returning-sword-formation", 100, 250)).toEqual({
      cooldownRemainingMs: 0,
      readySkill2Id: "returning-sword-formation"
    });
    expect(advanceTimedMasterySkill2Cooldown("solar-flare-cycle", 1000, 1000)).toEqual({
      cooldownRemainingMs: 1000
    });
  });

  it("records successful Skill 2 casts through the runtime command interface", () => {
    const state = {
      masterySkill2CooldownRemaining: 25,
      masterySkill2Casts: 2
    };

    expect(recordMasterySkill2Cast(state, { kind: "aura-burst", damage: 10, count: 3 })).toBe(
      state
    );
    expect(
      recordMasterySkill2Cast(state, {
        kind: "returning-sword-formation",
        count: 1,
        opening: {
          damage: 10,
          pierce: 2,
          speed: 485,
          lifetimeMs: 1680
        },
        returnPath: {
          delayMs: 240,
          damage: 8,
          pierce: 2,
          speed: 505,
          lifetimeMs: 1740
        },
        masteryCast: {
          skill2Id: "returning-sword-formation",
          cooldownMs: 2400
        }
      })
    ).toEqual({
      masterySkill2CooldownRemaining: 2400,
      masterySkill2Casts: 3
    });
  });

  it("integrates ordinary Refinements automatically and pauses only for Transformation ranks", () => {
    const base = {
      masteryPoints: 90,
      masteryRank: 0,
      masterySkill2CooldownRemaining: 0,
      masteryChoiceActive: false,
      masteryPendingRanks: [] as number[]
    };

    expect(
      advanceGongfaMasteryProgress(base, {
        gongfaId: "yujian-jue",
        points: 5,
        finalBossActive: false
      })
    ).toEqual({
      state: {
        ...base,
        masteryPoints: 95,
        masteryPendingRanks: []
      }
    });

    const rankTwo = advanceGongfaMasteryProgress(base, {
      gongfaId: "yujian-jue",
      points: 120,
      finalBossActive: false,
      seed: "run-2"
    });
    expect(rankTwo).toMatchObject({
      state: {
        masteryPoints: 210,
        masteryRank: 2,
        masterySkill2CooldownRemaining: 0,
        masteryChoiceActive: false,
        masteryPendingRanks: []
      },
      rankUp: {
        previousRank: 0,
        targetRank: 2
      },
      automaticRewards: [
        { rank: 1 },
        { rank: 2 }
      ]
    });
    expect(rankTwo.automaticRewards?.map((reward) => reward.choiceId)).toHaveLength(2);

    const transformation = advanceGongfaMasteryProgress(
      rankTwo.state,
      {
        gongfaId: "yujian-jue",
        points: 100,
        finalBossActive: false,
        learnedIds: rankTwo.automaticRewards?.map((reward) => reward.choiceId),
        seed: "run-2"
      }
    );
    expect(transformation).toMatchObject({
      state: {
        masteryRank: 3,
        masteryChoiceActive: true,
        masteryPendingRanks: [3]
      }
    });
    expect(transformation.automaticRewards).toBeUndefined();

    expect(
      advanceGongfaMasteryProgress(
        {
          ...base,
          masteryPoints: 990,
          masteryRank: 9
        },
        {
          gongfaId: "yujian-jue",
          points: 10,
          finalBossActive: false
        }
      ).state
    ).toMatchObject({
      masteryPoints: 1000,
      masteryRank: 10,
      masterySkill2Id: "returning-sword-formation",
      masterySkill2CooldownRemaining: 2400,
      masteryChoiceActive: false,
      masteryPendingRanks: []
    });

    expect(
      advanceGongfaMasteryProgress(base, {
        gongfaId: "yujian-jue",
        points: 120,
        finalBossActive: true
      }).state
    ).toMatchObject({
      masteryChoiceActive: false,
      masteryPendingRanks: []
    });
  });

  it("continues after rank 10 with automatic authored Refinements until the pool is exhausted", () => {
    const mastered = {
      masteryPoints: 1000,
      masteryRank: 10,
      masterySkill2Id: "returning-sword-formation",
      masterySkill2CooldownRemaining: 0,
      masteryChoiceActive: false,
      masteryPendingRanks: [] as number[]
    };

    const continued = advanceGongfaMasteryProgress(mastered, {
        gongfaId: "yujian-jue",
        points: 500,
        finalBossActive: false,
        learnedIds: [],
        seed: "run-2"
      });
    expect(continued).toMatchObject({
      state: {
        masteryPoints: 1500,
        masteryRank: 15,
        masteryChoiceActive: false,
        masteryPendingRanks: []
      },
      automaticRewards: [
        { rank: 11 },
        { rank: 12 },
        { rank: 13 },
        { rank: 14 },
        { rank: 15 }
      ]
    });
    expect(new Set(continued.automaticRewards?.map((reward) => reward.choiceId)).size).toBeGreaterThan(1);

    const exhausted = {
      ...mastered,
      masteryRank: 22,
      masteryPoints: 2200,
      masteryPendingRanks: [] as number[]
    };
    expect(
      advanceGongfaMasteryProgress(exhausted, {
        gongfaId: "yujian-jue",
        points: 100,
        finalBossActive: false,
        learnedIds: upgradeConfigs
          .filter((upgrade) => upgrade.requiredGongfaIds?.includes("yujian-jue") && upgrade.id !== "counterflow-ring")
          .flatMap((upgrade) => [upgrade.id, upgrade.id])
      })
    ).toEqual({ state: exhausted });
  });

  it("applies a Gongfa Mastery choice and advances the pending-rank queue", () => {
    expect(
      applyGongfaMasteryChoice(
        {
          masteryLearnedIds: ["sword-bloom"],
          masteryChoiceActive: true,
          masteryPendingRanks: [2, 3]
        },
        "execution-seal"
      )
    ).toEqual({
      masteryLearnedIds: ["sword-bloom", "execution-seal"],
      masteryChoiceActive: false,
      masteryPendingRanks: [3]
    });
  });

  it("hydrates and projects Gongfa Mastery checkpoint fields without sharing arrays", () => {
    const checkpoint = {
      masteryPoints: 320,
      masteryRank: 3,
      masteryLearnedIds: ["sword-bloom"],
      upgradeSelectionIds: ["tempered-meridians"],
      masterySkill2Id: "returning-sword-formation",
      masterySkill2CooldownRemaining: 1200,
      masterySkill2Casts: 4,
      masteryChoiceActive: true,
      masteryPendingRanks: [4, 5]
    };

    const restored = createGongfaMasteryStateFromCheckpoint(checkpoint);
    restored.masteryLearnedIds.push("execution-seal");
    restored.upgradeSelectionIds.push("jade-meridian");
    restored.masteryPendingRanks.shift();

    expect(checkpoint).toEqual({
      masteryPoints: 320,
      masteryRank: 3,
      masteryLearnedIds: ["sword-bloom"],
      upgradeSelectionIds: ["tempered-meridians"],
      masterySkill2Id: "returning-sword-formation",
      masterySkill2CooldownRemaining: 1200,
      masterySkill2Casts: 4,
      masteryChoiceActive: true,
      masteryPendingRanks: [4, 5]
    });
    expect(projectGongfaMasteryCheckpoint(restored)).toEqual({
      masteryPoints: 320,
      masteryRank: 3,
      masteryLearnedIds: ["sword-bloom", "execution-seal"],
      upgradeSelectionIds: ["tempered-meridians", "jade-meridian"],
      masterySkill2Id: "returning-sword-formation",
      masterySkill2CooldownRemaining: 1200,
      masterySkill2Casts: 4,
      masteryChoiceActive: true,
      masteryPendingRanks: [5]
    });
  });

  it("casts every declared rank-10 Skill 2 through the runtime public interface", () => {
    const expectedEffectKinds: Partial<Record<GongfaId, string>> = {
      "blazing-feather-art": "feather-rain-formation",
      "scarlet-wave-manual": "sunset-wave-apex",
      "drifting-frost-needle": "mirror-needle-constellation",
      "black-tide-scripture": "authored-deluge-mandate",
      "ice-mirror-guard": "frozen-lotus-shell",
      "green-vine-art": "verdant-root-network",
      "verdant-ring-scripture": "sprout-sun-circle",
      "ironwood-wave-form": "ironwood-surge-form",
      "vermilion-bird-covenant": "authored-vermilion-flight"
    };
    (Object.keys(gongfaConfigs) as GongfaId[]).forEach((gongfaId) => {
      const skill2Id = getRank10Skill2Id(gongfaId);
      const plan = getAuthoredSkill2Plan(skill2Id);
      expect(plan, `${gongfaId} declares unsupported Skill 2 ${skill2Id}`).toBeDefined();

      const runtime = createGongfaRuntime({ gongfaId });
      if (gongfaId === "black-tide-scripture") runtime.authored.cycleCount = 3;
      if (gongfaId === "vermilion-bird-covenant") {
        runtime.authored.targetLedger[-20] = 1;
        runtime.authored.resource = 1;
      }
      if (gongfaId === "myriad-beast-grove") runtime.authored.resource = 1;
      if (gongfaId === "ancient-tree-body-art") {
        runtime.authored.phase = 1;
        runtime.authored.charges = runtime.authored.maxCharges;
        runtime.authored.resource = 1;
      }
      if (gongfaId === "mist-wraith-canon") {
        runtime.authored.anchors.push({ kind: "stored-soul", x: 0, y: 0, value: 1 });
      }
      if (gongfaId === "sword-burial-formation") {
        runtime.authored.anchors.push({ kind: "grave-sword", x: 0, y: 0, value: 1, angle: 0 });
      }
      if (gongfaId === "frozen-river-formation") {
        runtime.authored.cycleCount = 3;
        runtime.authored.anchors.push(
          { kind: "seal", sealRole: "origin", chainId: 1, targetId: 51, x: 20, y: 0, value: 1 },
          { kind: "seal", sealRole: "origin", chainId: 2, targetId: 52, x: -20, y: 0, value: 1 }
        );
      }
      if (gongfaId === "thousand-root-formation") {
        runtime.authored.anchors.push(
          { kind: "infection", targetId: 91, x: -60, y: 0, value: 7000, infectionStage: 2 },
          { kind: "infection", targetId: 92, x: -20, y: 0, value: 7000, infectionStage: 2 },
          { kind: "infection", targetId: 93, x: 20, y: 0, value: 3000, infectionStage: 1 },
          { kind: "infection", targetId: 94, x: 60, y: 0, value: 0, infectionStage: 0 }
        );
      }
      const result =
        plan?.trigger === "cycle"
          ? advanceGongfaRuntime(runtime, {
              kind: "tick",
              deltaMs: plan.cooldownMs,
              nearbyEnemyCount: 1,
              skill2Id
            })
          : plan?.trigger === "threshold"
            ? advanceGongfaRuntime(runtime, {
                kind: "incoming-damage",
                amount: 1000,
                skill2Id
              })
            : advanceGongfaRuntime(runtime, {
                kind: "skill2",
                skill2Id,
                nearbyEnemyCount: 3,
                eligibleTargetCount: 3,
                hasMovementDirection: true,
                isMoving: true,
                targets: gongfaId === "frozen-river-formation" ? [
                  { targetId: 51, x: 20, y: 0, healthRatio: 1, rank: "elite" },
                  { targetId: 52, x: -20, y: 0, healthRatio: 0.5, rank: "ordinary" }
                ] : gongfaId === "thousand-root-formation" ? [
                  { targetId: 91, x: -60, y: 0, healthRatio: 1, rank: "elite" },
                  { targetId: 92, x: -20, y: 0, healthRatio: 0.8, rank: "ordinary" },
                  { targetId: 93, x: 20, y: 0, healthRatio: 0.6, rank: "ordinary" },
                  { targetId: 94, x: 60, y: 0, healthRatio: 0.4, rank: "ordinary" }
                ] : gongfaId === "vermilion-bird-covenant" ? [
                  { targetId: 96, x: 120, y: 0, healthRatio: 1, rank: "elite" }
                ] : gongfaId === "myriad-beast-grove" ? [
                  { targetId: 97, x: 120, y: 0, healthRatio: 1, rank: "elite" }
                ] : undefined
              });

      const castCommands = result.commands.filter((command) => "masteryCast" in command);
      expect(castCommands, `${skill2Id} did not record a successful cast`).toHaveLength(1);
      expect(castCommands[0]?.masteryCast.skill2Id).toBe(skill2Id);
      expect(
        result.commands.some((command) => command.kind !== "mastery-skill2-cast"),
        `${skill2Id} did not produce an observable effect command`
      ).toBe(true);
      if (expectedEffectKinds[gongfaId]) {
        expect(result.commands.map((command) => command.kind)).toContain(
          expectedEffectKinds[gongfaId]
        );
        expect(result.commands.map((command) => command.kind)).not.toContain(
          "mastery-skill2-cast"
        );
      }
    });
  });

  it("does not count or cool down unknown and mismatched Skill 2 identifiers", () => {
    const runtime = createGongfaRuntime({ gongfaId: "blazing-feather-art" });
    runtime.mastery.masterySkill2CooldownRemaining = 0;

    for (const skill2Id of ["missing-skill-2", "moon-tide-vault"]) {
      const result = advanceGongfaRuntime(runtime, { kind: "skill2", skill2Id });
      expect(result.commands).toEqual([]);
      expect(result.runtime.mastery.masterySkill2CooldownRemaining).toBe(0);
      expect(result.runtime.mastery.masterySkill2Casts).toBe(0);
    }
  });

  it("keeps target-dependent Skill 2 cooldowns ready when no effect can be emitted", () => {
    const targetDependent = [
      "yujian-jue",
      "crimson-furnace-sword-art",
      "blazing-feather-art",
      "scarlet-wave-manual",
      "drifting-frost-needle",
      "green-vine-art"
    ] as const;

    for (const gongfaId of targetDependent) {
      const runtime = createGongfaRuntime({ gongfaId });
      const skill2Id = getRank10Skill2Id(gongfaId);
      const result = advanceGongfaRuntime(runtime, {
        kind: "skill2",
        skill2Id,
        nearbyEnemyCount: 0,
        eligibleTargetCount: 0
      });

      expect(result.commands, `${skill2Id} silently counted without a target`).toEqual([]);
      expect(result.runtime.mastery.masterySkill2Casts).toBe(0);
      expect(result.runtime.mastery.masterySkill2CooldownRemaining).toBe(0);
    }
  });

  it("keeps Ironwood Surge Form ready until a movement direction exists", () => {
    const runtime = createGongfaRuntime({ gongfaId: "ironwood-wave-form" });
    const result = advanceGongfaRuntime(runtime, {
      kind: "skill2",
      skill2Id: "ironwood-surge-form",
      hasMovementDirection: false
    });

    expect(result.commands).toEqual([]);
    expect(result.runtime.mastery.masterySkill2CooldownRemaining).toBe(0);
    expect(result.runtime.mastery.masterySkill2Casts).toBe(0);
  });

  it("projects defining resource-scaled behavior for every newly authored Skill 2", () => {
    const cast = (gongfaId: GongfaId) => {
      const runtime = createGongfaRuntime({ gongfaId });
      if (gongfaId === "black-tide-scripture") runtime.authored.cycleCount = 3;
      if (gongfaId === "vermilion-bird-covenant") {
        runtime.authored.targetLedger[-20] = 1;
        runtime.authored.resource = 1;
      }
      if (runtime.blazingFeather) runtime.blazingFeather.emberStacks = 6;
      if (runtime.surge) runtime.surge.stacks = 6;
      return advanceGongfaRuntime(runtime, {
        kind: "skill2",
        skill2Id: getRank10Skill2Id(gongfaId),
        eligibleTargetCount: 4,
        hasMovementDirection: true,
        targets: gongfaId === "vermilion-bird-covenant" ? [
          { targetId: 97, x: 120, y: 0, healthRatio: 1, rank: "elite" }
        ] : undefined
      }).commands[0];
    };

    expect(cast("blazing-feather-art")).toMatchObject({
      kind: "feather-rain-formation",
      fanCount: 3,
      feathersPerFan: 7,
      damage: 22
    });
    expect(cast("scarlet-wave-manual")).toMatchObject({
      kind: "sunset-wave-apex",
      wallCount: 2,
      width: 130
    });
    expect(cast("drifting-frost-needle")).toMatchObject({
      kind: "mirror-needle-constellation",
      needleCount: 10,
      pierce: 3
    });
    expect(cast("black-tide-scripture")).toMatchObject({
      kind: "authored-deluge-mandate",
      fate: "shared-flow",
      force: 250
    });
    expect(cast("ice-mirror-guard")).toMatchObject({
      kind: "frozen-lotus-shell",
      radius: 162,
      petalCount: 16
    });
    expect(cast("vermilion-bird-covenant")).toMatchObject({
      kind: "authored-vermilion-flight",
      terminal: true
    });
    expect(cast("green-vine-art")).toMatchObject({
      kind: "verdant-root-network",
      reach: 340,
      linkCount: 7
    });
    expect(cast("verdant-ring-scripture")).toMatchObject({
      kind: "sprout-sun-circle",
      radius: 172,
      spokeCount: 17
    });
    expect(cast("ironwood-wave-form")).toMatchObject({
      kind: "ironwood-surge-form",
      width: 152,
      pushStrength: 278,
      returnShots: 2
    });
  });

  it("plans generic primary attacks behind the runtime seam", () => {
    expect(planGongfaAttack(createGongfaRuntime({ gongfaId: "yujian-jue" }), 0)).toEqual([
      {
        kind: "homing-volley",
        count: 1,
        transformationTriggers: {
          executionSeal: false,
          swordBloom: false,
          reversingSwordPath: false
        }
      }
    ]);

    expect(planGongfaAttack(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), 0)).toEqual([
      {
        kind: "wave-volley",
        count: 2,
        returnShots: 0,
        aimMode: "last"
      }
    ]);

    expect(planGongfaAttack(createGongfaRuntime({ gongfaId: "gengjin-huti" }), 0)).toEqual([
      {
        kind: "aura-burst",
        damage: 9,
        count: 6
      }
    ]);
  });

  it("plans Yujian transformation commands from learned mastery ids", () => {
    const runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });

    expect(
      planGongfaAttack(runtime, 0, {
        learnedMasteryIds: ["reversing-sword-path"]
      })
    ).toEqual([
      {
        kind: "homing-volley",
        count: 1,
        transformationTriggers: {
          executionSeal: false,
          swordBloom: false,
          reversingSwordPath: true
        }
      },
      {
        kind: "spawn-yujian-reversal",
        delayMs: 170,
        damage: 8,
        pierce: 2,
        speed: 500,
        lifetimeMs: 1560
      }
    ]);
  });

  it("owns projectile-hit mode and Gongfa-specific hit effects", () => {
    expect(getGongfaProjectileHitMode("crimson-furnace-sword-art")).toEqual({
      appliesBaseDamage: false,
      consumesPierce: false
    });
    expect(getGongfaProjectileHitMode("yujian-jue")).toEqual({
      appliesBaseDamage: true,
      consumesPierce: true
    });

    const yujian = advanceGongfaRuntimeForProjectileHit(
      createGongfaRuntime({ gongfaId: "yujian-jue" }),
      {
        sourceGongfaId: "yujian-jue",
        targetId: 7,
        damage: 20,
        learnedMasteryIds: ["execution-seal", "sword-bloom"],
        baseDamageKilledTarget: false,
        embedStacks: 0,
        embedPower: 0
      }
    );
    expect(yujian.commands.map((command) => command.kind)).toEqual(["spawn-yujian-bloom"]);

    const crimson = advanceGongfaRuntimeForProjectileHit(
      createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" }),
      {
        sourceGongfaId: "crimson-furnace-sword-art",
        targetId: 3,
        damage: 20,
        learnedMasteryIds: [],
        baseDamageKilledTarget: false,
        embedStacks: 0,
        embedPower: 0
      }
    );
    expect(crimson.commands[0]).toMatchObject({
      kind: "lodge-crimson-needle",
      targetId: 3
    });

    const burningRing = advanceGongfaRuntimeForProjectileHit(
      createGongfaRuntime({ gongfaId: "burning-ring-scripture" }),
      {
        sourceGongfaId: "burning-ring-scripture",
        targetId: 1,
        damage: 12,
        learnedMasteryIds: [],
        baseDamageKilledTarget: false,
        embedStacks: 0,
        embedPower: 0
      }
    );
    expect(burningRing.runtime.burningRing?.heat).toBeGreaterThan(0);
  });

  it("owns tick threat radii for passives that need nearby enemy facts", () => {
    expect(getGongfaRuntimeTickThreatRadius(createGongfaRuntime({ gongfaId: "gengjin-huti" }))).toBe(160);
    expect(
      getGongfaRuntimeTickThreatRadius(createGongfaRuntime({ gongfaId: "burning-ring-scripture" }))
    ).toBe(170);
    expect(getGongfaRuntimeTickThreatRadius(createGongfaRuntime({ gongfaId: "jinfeng-gong" }))).toBe(0);
  });

  it("plans Returning Sword Formation as a runtime-owned Yujian Skill 2 command", () => {
    const runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });

    expect(advanceGongfaRuntime(runtime, {
      kind: "skill2",
      skill2Id: "returning-sword-formation",
      eligibleTargetCount: 1
    }).commands).toEqual([
      {
        kind: "returning-sword-formation",
        count: 1,
        opening: {
          damage: 10,
          pierce: 2,
          speed: 485,
          lifetimeMs: 1680
        },
        returnPath: {
          delayMs: 240,
          damage: 8,
          pierce: 2,
          speed: 505,
          lifetimeMs: 1740
        },
        masteryCast: {
          skill2Id: "returning-sword-formation",
          cooldownMs: 2400
        }
      }
    ]);
  });

  it("plans Golden Gale Corridor as a runtime-owned Jinfeng Skill 2 command", () => {
    const runtime = createGongfaRuntime({ gongfaId: "jinfeng-gong" });

    expect(advanceGongfaRuntime(runtime, {
      kind: "skill2",
      skill2Id: "golden-gale-corridor"
    }).commands).toEqual([
      {
        kind: "golden-gale-corridor",
        burstCount: 3,
        burstDelayMs: 180,
        laneCount: 4,
        spreadDeg: 8,
        forwardOffset: {
          start: 32,
          step: 26
        },
        sidewaysSpacing: 12,
        projectile: {
          damage: 16,
          pierce: 2,
          speed: 385,
          lifetimeMs: 876,
          scale: 0.92
        },
        masteryCast: {
          skill2Id: "golden-gale-corridor",
          cooldownMs: 2600
        }
      }
    ]);
  });

  it("owns Yujian rank-3 hit transformations without Phaser objects", () => {
    const runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });

    const firstHit = advanceGongfaRuntime(runtime, {
      kind: "yujian-projectile-hit",
      targetId: 10,
      damage: 15,
      learnedMasteryIds: ["execution-seal", "sword-bloom"]
    });

    expect(firstHit.commands).toEqual([
      {
        kind: "spawn-yujian-bloom",
        originTargetId: 10,
        maxTargets: 2,
        damage: 7,
        pierce: 1
      }
    ]);
    expect(firstHit.runtime.yujian).toMatchObject({
      executionSealTriggers: 0,
      swordBloomTriggers: 1,
      reversingSwordPathTriggers: 0,
      executionSealStacksByTarget: { 10: 1 }
    });

    const secondHit = advanceGongfaRuntime(firstHit.runtime, {
      kind: "yujian-projectile-hit",
      targetId: 10,
      damage: 15,
      learnedMasteryIds: ["execution-seal"]
    });

    // The first hit's Unbroken Sword Intent stack raises Yujian damage, so the
    // second hit's execution-seal scales up accordingly.
    expect(secondHit.commands).toEqual([
      {
        kind: "apply-target-damage",
        targetId: 10,
        amount: 11,
        source: "execution-seal"
      }
    ]);
    expect(secondHit.runtime.yujian).toMatchObject({
      executionSealTriggers: 1,
      swordBloomTriggers: 1,
      executionSealStacksByTarget: { 10: 2 }
    });
  });

  it("keeps Yujian reversal accounting inert for non-Yujian runtimes", () => {
    const runtime = createGongfaRuntime({ gongfaId: "jinfeng-gong" });

    const result = advanceGongfaRuntime(runtime, {
      kind: "yujian-reversal-spawned"
    });

    expect(result.runtime).toEqual(runtime);
    expect(result.commands).toEqual([]);
  });

  it("routes generic player improvements without leaking them into combat state", () => {
    const initial = createGongfaRuntime({ gongfaId: "yujian-jue" });
    const improved = applyGongfaImprovement(initial, "tempered-meridians");

    expect(improved.runtime.combat).toEqual(initial.combat);
    expect(improved.playerEffect).toEqual({ kind: "moveSpeed", value: 22 });
    expect(improved.passiveEffect).toBeUndefined();
  });

  it("leaves unknown improvements as no-ops", () => {
    const initial = createGongfaRuntime({ gongfaId: "yujian-jue" });
    const improved = applyGongfaImprovement(initial, "missing-upgrade");

    expect(improved.runtime).toBe(initial);
    expect(improved.playerEffect).toBeUndefined();
    expect(improved.passiveEffect).toBeUndefined();
  });

  it("ignores improvements authored for a different Gongfa", () => {
    const initial = createGongfaRuntime({ gongfaId: "gengjin-huti" });
    const improved = applyGongfaImprovement(initial, "sword-intent-sharpening");

    expect(improved.runtime.combat.damage).toBe(initial.combat.damage);
    expect(improved.playerEffect).toBeUndefined();
    expect(improved.passiveEffect).toBeUndefined();
  });

  it("separates runtime improvements from player-stat improvements for checkpoint replay", () => {
    expect(
      splitGongfaImprovementReplayIds([
        "lasting-temper",
        "tempered-meridians",
        "jade-meridian",
        "missing-upgrade",
        "counterflow-ring",
        "unyielding-shield"
      ])
    ).toEqual({
      runtimeUpgradeIds: ["missing-upgrade"],
      checkpointedRuntimeUpgradeIds: ["lasting-temper", "counterflow-ring", "unyielding-shield"],
      playerUpgradeIds: ["tempered-meridians", "jade-meridian"]
    });
  });

  it("hydrates and projects checkpoint fields without leaking style state to the scene", () => {
    const jinfeng = createGongfaRuntimeFromCheckpoint("jinfeng-gong", {
      galeMomentum: 2,
      galeMomentumBuildRate: 1,
      galeMomentumDecayRate: 0.25,
      galeMomentumWaveBonus: 0.1
    });

    expect(jinfeng.jinfeng).toMatchObject({
      momentum: 2,
      momentumBuildRate: 1,
      momentumDecayRate: 0.25,
      momentumWaveBonus: 0.1
    });
    expect(projectGongfaRuntimeCheckpoint(jinfeng)).toMatchObject({
      galeMomentum: 2,
      galeMomentumBuildRate: 1,
      galeMomentumDecayRate: 0.25,
      galeMomentumWaveBonus: 0.1,
      guardValue: 0,
      heat: 0,
      crimsonPressure: 0
    });

    const gengjin = createGongfaRuntimeFromCheckpoint("gengjin-huti", {
      guardValue: 40,
      guardBuildRate: 2,
      bladeShellCharge: 75,
      bladeShellCasts: 3
    });
    expect(projectGongfaRuntimeCheckpoint(gengjin)).toMatchObject({
      guardValue: 40,
      guardBuildRate: 2,
      bladeShellCharge: 75,
      bladeShellCasts: 3
    });
  });

  it("projects UI-visible runtime meters without exposing Gongfa subtype state", () => {
    const yujian = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "yujian-jue" }), {
      kind: "yujian-projectile-hit",
      targetId: 10,
      damage: 15,
      learnedMasteryIds: ["execution-seal", "sword-bloom", "reversing-sword-path"]
    }).runtime;

    expect(projectGongfaRuntimeView(yujian)).toMatchObject({
      galeMomentum: 0,
      heat: 0,
      guard: 0,
      masteryTransformationTriggers: {
        executionSeal: 0,
        swordBloom: 1,
        reversingSwordPath: 0
      }
    });

    const gengjin = advanceGongfaRuntime(
      createGongfaRuntime({ gongfaId: "gengjin-huti" }),
      {
        kind: "tick",
        deltaMs: 1000,
        nearbyEnemyCount: 2,
        skill2Id: "blade-shell-rebound"
      }
    ).runtime;

    expect(projectGongfaRuntimeView(gengjin)).toMatchObject({
      guard: 1.24,
      guardMitigation: 1.24 / 220,
      bladeShellCharge: 14.062,
      bladeShellCasts: 0,
      crimsonPressureRadiusScale: 0.45
    });

    expect(projectGongfaRuntimeView(undefined)).toMatchObject({
      galeMomentum: 0,
      heat: 0,
      ringSegments: 0,
      pressure: 0,
      guard: 0,
      crimsonPressureRadiusScale: 0.45
    });
  });

  it("hydrates sparse checkpoint fields without erasing runtime defaults", () => {
    const gengjin = createGongfaRuntimeFromCheckpoint("gengjin-huti", {
      guardValue: 40
    });

    expect(gengjin.gengjin).toMatchObject({
      guardValue: 40,
      guardBuildRate: 0.62,
      guardDecayRate: 0.38,
      bladeShellThreshold: 100
    });
    expect(gengjin.gengjin?.guardMitigation).toBeCloseTo(40 / 220);

    const advanced = advanceGongfaRuntime(gengjin, {
      kind: "tick",
      deltaMs: 1000,
      nearbyEnemyCount: 1,
      skill2Id: "blade-shell-rebound"
    }).runtime;

    expect(advanced.gengjin?.guardValue).toBeCloseTo(40.62);
    expect(advanced.gengjin?.bladeShellCharge).toBeGreaterThan(0);
  });

  it("owns Burning Ring heat, refinement interpretation, and attack planning", () => {
    const initial = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    const heated = advanceGongfaRuntime(initial, {
      kind: "tick",
      deltaMs: 1000,
      nearbyEnemyCount: 2
    }).runtime;
    const refined = applyGongfaImprovement(heated, "counterflow-ring").runtime;
    const strengthened = applyGongfaImprovement(refined, "gathering-heat").runtime;

    expect(strengthened.burningRing).toMatchObject({
      heat: 2.4,
      heatBuildRate: 1.38,
      ringSegments: 6,
      counterflowRingSegments: 1,
      counterflowRingAppliedSegments: 1
    });
    expect(planGongfaAttack(strengthened, 2000)).toEqual([
      {
        kind: "burning-ring-volley",
        rotation: 1.8,
        segmentCount: 7,
        visibleSegments: 5,
        ringRadius: 24
      }
    ]);
  });

  it("restores durable Burning Ring state and emits a Solar Flare command", () => {
    const restored = createGongfaRuntime({
      gongfaId: "burning-ring-scripture",
      burningRing: {
        heat: 40,
        solarFlareCooldownRemaining: 500,
        solarFlareCasts: 2
      }
    });

    expect(restored.combat.cooldownMs).toBeLessThan(980);

    const result = advanceGongfaRuntime(restored, {
      kind: "tick",
      deltaMs: 500,
      nearbyEnemyCount: 0,
      skill2Id: "solar-flare-cycle"
    });

    expect(result.runtime.burningRing).toMatchObject({
      heat: 39.675,
      solarFlareCooldownRemaining: 2800,
      solarFlareCasts: 3
    });
    expect(result.commands).toEqual([
      {
        kind: "solar-flare-cycle",
        baseDamage: 8,
        damageScale: 1,
        segmentCount: 6,
        ringRadius: 43,
        masteryCast: {
          skill2Id: "solar-flare-cycle"
        }
      }
    ]);
  });

  it("builds heat from projectile hits without Phaser", () => {
    const initial = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    const result = advanceGongfaRuntime(initial, {
      kind: "projectile-hit",
      damage: 10
    });

    expect(result.runtime.burningRing?.heat).toBe(1.5);
    expect(result.runtime.combat.cooldownMs).toBeLessThan(initial.combat.cooldownMs);
  });

  it("owns Jinfeng momentum, refinements, and combat projection without Phaser", () => {
    const initial = createGongfaRuntime({ gongfaId: "jinfeng-gong" });
    const moving = advanceGongfaRuntime(initial, {
      kind: "tick",
      deltaMs: 1000,
      nearbyEnemyCount: 0,
      isMoving: true
    }).runtime;
    const refined = applyGongfaImprovement(moving, "windborne-reach").runtime;

    expect(refined.jinfeng).toMatchObject({
      momentum: 0.72,
      momentumBuildRate: 0.72,
      momentumDecayRate: 0.48,
      momentumWaveBonus: 0.14
    });
    expect(refined.combat.range).toBeGreaterThan(initial.combat.range);
    expect(refined.combat.spreadDeg).toBeGreaterThan(initial.combat.spreadDeg);
    expect(refined.combat.projectileLifetimeMs).toBeGreaterThan(
      initial.combat.projectileLifetimeMs
    );

    const decayed = advanceGongfaRuntime(refined, {
      kind: "tick",
      deltaMs: 500,
      nearbyEnemyCount: 0,
      isMoving: false
    }).runtime;
    expect(decayed.jinfeng?.momentum).toBe(0.48);
  });

  it("owns Gengjin guard, mitigation, and Blade Shell commands without Phaser", () => {
    const guarded = advanceGongfaRuntime(
      createGongfaRuntime({ gongfaId: "gengjin-huti" }),
      {
        kind: "tick",
        deltaMs: 1000,
        nearbyEnemyCount: 2,
        skill2Id: "blade-shell-rebound"
      }
    ).runtime;

    expect(guarded.gengjin?.guardValue).toBe(1.24);
    expect(guarded.gengjin?.bladeShellCharge).toBeCloseTo(14.062);
    expect(guarded.gengjin?.guardMitigation).toBeCloseTo(1.24 / 220);

    const damaged = advanceGongfaRuntime(guarded, {
      kind: "incoming-damage",
      amount: 20,
      skill2Id: "blade-shell-rebound"
    });
    expect(damaged.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 19 });
    expect(damaged.runtime.gengjin?.bladeShellCharge).toBeCloseTo(52.062);

    const primed = createGongfaRuntime({
      gongfaId: "gengjin-huti",
      gengjin: {
        bladeShellCharge: 100
      }
    });
    const triggered = advanceGongfaRuntime(primed, {
      kind: "tick",
      deltaMs: 0,
      nearbyEnemyCount: 0,
      skill2Id: "blade-shell-rebound"
    });
    expect(triggered.runtime.gengjin).toMatchObject({
      bladeShellCharge: 0,
      bladeShellCooldownRemaining: 1800,
      bladeShellCasts: 1
    });
    expect(triggered.commands).toEqual([
      {
        kind: "blade-shell-rebound",
        baseDamage: 9,
        baseBladeCount: 6,
        damageScale: 1,
        bonusBlades: 0,
        masteryCast: {
          skill2Id: "blade-shell-rebound",
          cooldownMs: 3000
        }
      }
    ]);
  });

  it("returns ordinary incoming damage for runtimes without defensive state", () => {
    const runtime = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });

    const result = advanceGongfaRuntime(runtime, {
      kind: "incoming-damage",
      amount: 12.8,
      skill2Id: "solar-flare-cycle",
      learnedMasteryIds: []
    });

    expect(result.runtime).toEqual(runtime);
    expect(result.commands).toEqual([{ kind: "incoming-damage", finalDamage: 12 }]);
  });

  it("interprets the authored Gengjin refinement families in the runtime", () => {
    const initial = createGongfaRuntime({ gongfaId: "gengjin-huti" });
    const strongerGuard = applyGongfaImprovement(initial, "lasting-temper").runtime;
    const steadierGuard = applyGongfaImprovement(strongerGuard, "bulwark-reflection").runtime;
    const widerShell = applyGongfaImprovement(steadierGuard, "expanding-shell").runtime;
    const retaliationResult = applyGongfaImprovement(widerShell, "retaliatory-edge");
    const sharperRetaliation = retaliationResult.runtime;

    expect(sharperRetaliation.gengjin).toMatchObject({
      guardBuildRate: 0.8,
      guardDecayRate: 0.3192
    });
    expect(sharperRetaliation.combat.auraRadius).toBe(110);
    expect(sharperRetaliation.combat.damage).toBe(initial.combat.damage + 3);
    expect(retaliationResult.passiveEffect).toBeUndefined();
  });

  it("makes defensive synergy increase Guard mitigation instead of being overwritten", () => {
    const guarded = createGongfaRuntime({
      gongfaId: "gengjin-huti",
      gengjin: {
        guardValue: 44
      }
    });
    const baselineMitigation = guarded.gengjin?.guardMitigation ?? 0;

    const improved = applyGongfaImprovement(guarded, "unyielding-shield").runtime;

    expect(baselineMitigation).toBeCloseTo(0.2);
    expect(improved.gengjin?.guardMitigation).toBeCloseTo(0.28);

    const projected = projectGongfaRuntimeCheckpoint(improved);
    expect(projected.guardMitigationBonus).toBe(0.08);
    const restored = createGongfaRuntimeFromCheckpoint("gengjin-huti", projected);
    expect(restored.gengjin?.guardMitigation).toBeCloseTo(0.28);
  });

  it("does not need runtime improvement replay after restoring a projected checkpoint", () => {
    const improved = applyGongfaImprovement(
      applyGongfaImprovement(createGongfaRuntime({ gongfaId: "gengjin-huti" }), "lasting-temper")
        .runtime,
      "unyielding-shield"
    ).runtime;
    const checkpoint = projectGongfaRuntimeCheckpoint(improved);

    const restored = createGongfaRuntimeFromCheckpoint("gengjin-huti", checkpoint);
    const doubleApplied = applyGongfaImprovement(
      applyGongfaImprovement(restored, "lasting-temper").runtime,
      "unyielding-shield"
    ).runtime;

    expect(restored.gengjin?.guardBuildRate).toBeCloseTo(improved.gengjin?.guardBuildRate ?? 0);
    expect(restored.gengjin?.guardMitigationBonus).toBeCloseTo(
      improved.gengjin?.guardMitigationBonus ?? 0
    );
    expect(doubleApplied.gengjin?.guardBuildRate).toBeGreaterThan(
      restored.gengjin?.guardBuildRate ?? 0
    );
    expect(doubleApplied.gengjin?.guardMitigationBonus).toBeGreaterThan(
      restored.gengjin?.guardMitigationBonus ?? 0
    );
  });

  it("owns Crimson pressure, refinements, and target planning without Phaser", () => {
    const initial = createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" });
    const embedded = applyGongfaImprovement(initial, "deep-embedding").runtime;
    const pressurized = applyGongfaImprovement(embedded, "rising-pressure").runtime;

    expect(getCrimsonEmbedThreshold(pressurized)).toBe(2);
    expect(selectCrimsonFurnaceTargetIndexes(
      [
        { index: 0, active: true, embedStacks: 0, distance: 10 },
        { index: 1, active: true, embedStacks: 2, distance: 80 },
        { index: 2, active: false, embedStacks: 4, distance: 1 },
        { index: 3, active: true, embedStacks: 2, distance: 40 }
      ],
      2
    )).toEqual([3, 1]);

    const result = advanceGongfaRuntime(pressurized, {
      kind: "crimson-detonation",
      x: 12,
      y: 34,
      damage: 20,
      fromEmbed: true
    });

    expect(result.runtime.crimsonFurnace).toMatchObject({
      pressure: 4.424,
      pressureBuildRate: 1.5799999999999998,
      embedThreshold: 2
    });
    expect(result.runtime.combat.range).toBeGreaterThan(initial.combat.range);
    expect(result.commands).toEqual([
      {
        kind: "crimson-detonation",
        x: 12,
        y: 34,
        radius: 54,
        splashDamage: 21
      }
    ]);
    expect(planGongfaAttack(result.runtime, 1200)).toEqual([
      {
        kind: "crimson-furnace-volley",
        count: 2
      }
    ]);

    const hitResult = advanceGongfaRuntime(pressurized, {
      kind: "crimson-projectile-hit",
      targetId: 7,
      damage: 20,
      embedStacks: 1,
      embedPower: 6
    });

    expect(hitResult.commands).toEqual([
      {
        kind: "lodge-crimson-needle",
        targetId: 7,
        embedStacks: 2,
        embedPower: 26
      },
      {
        kind: "detonate-crimson-embed",
        targetId: 7,
        sourceDamage: 30,
        fragment: {
          radius: 220,
          maxTargets: 2,
          delayMs: 100,
          delayStepMs: 60,
          damage: 6,
          speed: 530,
          lifetimeMs: 780
        }
      }
    ]);
  });

  it("keeps Crimson detonation inert for non-Crimson runtimes", () => {
    const runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });

    const result = advanceGongfaRuntime(runtime, {
      kind: "crimson-detonation",
      x: 12,
      y: 34,
      damage: 20,
      fromEmbed: true
    });

    expect(result.runtime).toEqual(runtime);
    expect(result.commands).toEqual([]);
  });

  it("restores Crimson state, decays pressure, and records Furnace Cascade casts", () => {
    const restored = createGongfaRuntime({
      gongfaId: "crimson-furnace-sword-art",
      crimsonFurnace: {
        pressure: 20,
        pressureBuildRate: 2,
        pressureDecayRate: 1,
        pressureRadiusScale: 0.6,
        furnaceCascadeCasts: 4
      }
    });

    expect(restored.combat.range).toBe(64);

    const decayed = advanceGongfaRuntime(restored, {
      kind: "tick",
      deltaMs: 500,
      nearbyEnemyCount: 0
    }).runtime;

    expect(decayed.crimsonFurnace?.pressure).toBe(19.5);

    const cascaded = advanceGongfaRuntime(decayed, {
      kind: "skill2",
      skill2Id: "furnace-cascade",
      eligibleTargetCount: 1
    });
    expect(cascaded.runtime.crimsonFurnace?.furnaceCascadeCasts).toBe(5);
    expect(cascaded.commands).toEqual([
      {
        kind: "furnace-cascade",
        sourceDamage: {
          embedPowerMultiplier: 1,
          stackDamage: 3
        },
        fragment: {
          radius: 220,
          maxTargets: 2,
          delayMs: 100,
          delayStepMs: 60,
          damage: 6,
          speed: 530,
          lifetimeMs: 780
        },
        masteryCast: {
          skill2Id: "furnace-cascade",
          cooldownMs: 2600
        }
      }
    ]);
  });

  it("Heaven-Splitting Line compresses Jinfeng Cutting Front into a piercing lane", () => {
    const runtime = createGongfaRuntime({ gongfaId: "jinfeng-gong" });
    const { combat } = applyGongfaImprovement(runtime, "heaven-splitting-line").runtime;

    expect(combat.count).toBe(1);
    expect(combat.pierce).toBe(runtime.combat.pierce + 2);
    expect(combat.range).toBe(runtime.combat.range + 90);
    expect(combat.spreadDeg).toBeLessThan(runtime.combat.spreadDeg);
  });

  it("Golden Gale Fan widens Jinfeng Cutting Front into a frontal arc", () => {
    const runtime = createGongfaRuntime({ gongfaId: "jinfeng-gong" });
    const { combat } = applyGongfaImprovement(runtime, "golden-gale-fan").runtime;

    expect(combat.count).toBe(runtime.combat.count + 2);
    expect(combat.spreadDeg).toBe(runtime.combat.spreadDeg + 40);
  });

  it("Crescent Wake trails an extra wave only while moving with built Momentum", () => {
    const base = createGongfaRuntime({ gongfaId: "jinfeng-gong" });

    // No Momentum yet: only the standard Cutting Front fires.
    expect(
      planGongfaAttack(base, 0, { learnedMasteryIds: ["crescent-wake"] })
    ).toHaveLength(1);

    // Build Momentum by moving, then the crescent trails behind.
    const moved = advanceGongfaRuntime(base, {
      kind: "tick",
      deltaMs: 4000,
      nearbyEnemyCount: 0,
      isMoving: true,
      skill2Id: undefined
    }).runtime;
    expect(moved.jinfeng!.momentum).toBeGreaterThanOrEqual(2);

    const commands = planGongfaAttack(moved, 0, {
      learnedMasteryIds: ["crescent-wake"]
    });
    expect(commands).toHaveLength(2);
    expect(commands.every((command) => command.kind === "wave-volley")).toBe(true);

    // Without the Transformation learned, no crescent even at Momentum.
    expect(planGongfaAttack(moved, 0)).toHaveLength(1);
  });

  it("Unbroken Current holds Momentum when the Cultivator stops", () => {
    const moved = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), {
      kind: "tick",
      deltaMs: 3000,
      nearbyEnemyCount: 0,
      isMoving: true
    }).runtime;
    const momentum = moved.jinfeng!.momentum;
    expect(momentum).toBeGreaterThan(0);

    const held = advanceGongfaRuntime(moved, {
      kind: "tick",
      deltaMs: 1000,
      nearbyEnemyCount: 0,
      isMoving: false,
      learnedMasteryIds: ["unbroken-current"]
    }).runtime;
    expect(held.jinfeng!.momentum).toBe(momentum);

    const decayed = advanceGongfaRuntime(moved, {
      kind: "tick",
      deltaMs: 1000,
      nearbyEnemyCount: 0,
      isMoving: false
    }).runtime;
    expect(decayed.jinfeng!.momentum).toBeLessThan(momentum);
  });

  it("Ten-Thousand Wave Resonance builds Momentum on Jinfeng wave hits", () => {
    const base = createGongfaRuntime({ gongfaId: "jinfeng-gong" });
    const hitFacts = {
      sourceGongfaId: "jinfeng-gong" as const,
      targetId: 1,
      damage: 10,
      baseDamageKilledTarget: false,
      embedStacks: 0,
      embedPower: 0
    };

    const resonant = advanceGongfaRuntimeForProjectileHit(base, {
      ...hitFacts,
      learnedMasteryIds: ["ten-thousand-wave-resonance"]
    }).runtime;
    expect(resonant.jinfeng!.momentum).toBeGreaterThan(0);

    const inert = advanceGongfaRuntimeForProjectileHit(base, {
      ...hitFacts,
      learnedMasteryIds: []
    }).runtime;
    expect(inert.jinfeng!.momentum).toBe(0);
  });

  it("Gale Detonation spends full Momentum to launch a crossing wave", () => {
    const full = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), {
      kind: "tick",
      deltaMs: 8000,
      nearbyEnemyCount: 0,
      isMoving: true
    }).runtime;
    expect(full.jinfeng!.momentum).toBe(5);

    const { runtime: detonated, commands } = advanceGongfaRuntime(full, {
      kind: "tick",
      deltaMs: 16,
      nearbyEnemyCount: 0,
      isMoving: true,
      learnedMasteryIds: ["gale-detonation"]
    });
    expect(detonated.jinfeng!.momentum).toBeLessThan(5);
    expect(commands).toContainEqual({
      kind: "wave-volley",
      count: 2,
      returnShots: 0,
      aimMode: "last"
    });
  });

  it("Endless Horizon grows the Cutting Front by Momentum", () => {
    const full = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), {
      kind: "tick",
      deltaMs: 8000,
      nearbyEnemyCount: 0,
      isMoving: true
    }).runtime;

    const [wave] = planGongfaAttack(full, 0, { learnedMasteryIds: ["endless-horizon"] });
    expect(wave.kind).toBe("wave-volley");
    expect(wave.kind === "wave-volley" && wave.growthScale).toBeGreaterThan(1);

    // No growth without the Transformation.
    const [plain] = planGongfaAttack(full, 0);
    expect(plain.kind === "wave-volley" && plain.growthScale).toBeUndefined();
  });

  it("Walking Storm erupts a cooldown-gated radial burst at high Momentum", () => {
    const full = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), {
      kind: "tick",
      deltaMs: 8000,
      nearbyEnemyCount: 0,
      isMoving: true
    }).runtime;

    const first = advanceGongfaRuntime(full, {
      kind: "tick",
      deltaMs: 16,
      nearbyEnemyCount: 0,
      isMoving: true,
      learnedMasteryIds: ["walking-storm"]
    });
    expect(first.commands.some((command) => command.kind === "aura-burst")).toBe(true);
    expect(first.runtime.jinfeng!.walkingStormCooldownRemaining).toBeGreaterThan(0);

    // Still on cooldown the very next tick.
    const second = advanceGongfaRuntime(first.runtime, {
      kind: "tick",
      deltaMs: 16,
      nearbyEnemyCount: 0,
      isMoving: true,
      learnedMasteryIds: ["walking-storm"]
    });
    expect(second.commands.some((command) => command.kind === "aura-burst")).toBe(false);
  });

  it("Gale-Step Severance cuts a Momentum-scaled corridor only when learned", () => {
    const full = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), {
      kind: "tick",
      deltaMs: 8000,
      nearbyEnemyCount: 0,
      isMoving: true
    }).runtime;

    const corridor = galeStepSeveranceCorridor(full, ["gale-step-severance"]);
    expect(corridor).toBeDefined();
    expect(corridor!.pierce).toBe(full.combat.pierce + 2);
    expect(corridor!.count).toBeGreaterThanOrEqual(2);

    expect(galeStepSeveranceCorridor(full, [])).toBeUndefined();
    expect(
      galeStepSeveranceCorridor(
        createGongfaRuntime({ gongfaId: "jinfeng-gong" }),
        ["gale-step-severance"]
      )
    ).toBeUndefined();
  });

  it("Hundred-Blade Halo widens the Gengjin aura by Guard", () => {
    const guarded = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "gengjin-huti" }), {
      kind: "tick",
      deltaMs: 8000,
      nearbyEnemyCount: 10,
      isMoving: false
    }).runtime;
    expect(guarded.gengjin!.guardValue).toBeGreaterThan(12);

    const [halo] = planGongfaAttack(guarded, 0, { learnedMasteryIds: ["hundred-blade-halo"] });
    const [plain] = planGongfaAttack(guarded, 0);
    const haloCount = halo.kind === "aura-burst" ? halo.count : 0;
    const plainCount = plain.kind === "aura-burst" ? plain.count : 0;
    expect(haloCount).toBeGreaterThan(plainCount);
  });

  it("Rebounding Edge returns a Guard-scaled blade only when learned", () => {
    const guarded = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "gengjin-huti" }), {
      kind: "tick",
      deltaMs: 8000,
      nearbyEnemyCount: 10,
      isMoving: false
    }).runtime;

    const blade = reboundingEdgeBlade(guarded, ["rebounding-edge"]);
    expect(blade).toBeDefined();
    expect(blade!.damage).toBeGreaterThan(guarded.combat.damage);
    expect(blade!.pierce).toBe(guarded.combat.pierce + 1);

    expect(reboundingEdgeBlade(guarded, [])).toBeUndefined();
    expect(
      reboundingEdgeBlade(createGongfaRuntime({ gongfaId: "gengjin-huti" }), ["rebounding-edge"])
    ).toBeUndefined();
  });

  it("Iron Wake returns a Guard-scaled wall only when learned", () => {
    const guarded = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "gengjin-huti" }), {
      kind: "tick",
      deltaMs: 8000,
      nearbyEnemyCount: 10,
      isMoving: false
    }).runtime;

    const wall = ironWakeWall(guarded, ["iron-wake"]);
    expect(wall).toBeDefined();
    expect(wall!.pierce).toBe(guarded.combat.pierce + 1);
    expect(wall!.count).toBeGreaterThanOrEqual(2);

    expect(ironWakeWall(guarded, [])).toBeUndefined();
    expect(
      ironWakeWall(createGongfaRuntime({ gongfaId: "gengjin-huti" }), ["iron-wake"])
    ).toBeUndefined();
  });

  it("Immovable Mountain builds Guard faster while standing still", () => {
    const base = createGongfaRuntime({ gongfaId: "gengjin-huti" });
    const still = advanceGongfaRuntime(base, {
      kind: "tick",
      deltaMs: 2000,
      nearbyEnemyCount: 5,
      isMoving: false,
      learnedMasteryIds: ["immovable-mountain"]
    }).runtime;
    const ordinary = advanceGongfaRuntime(base, {
      kind: "tick",
      deltaMs: 2000,
      nearbyEnemyCount: 5,
      isMoving: false
    }).runtime;
    expect(still.gengjin!.guardValue).toBeGreaterThan(ordinary.gengjin!.guardValue);
  });

  it("Flowing Iron Body grants Guard and a shockwave on Evade", () => {
    const guarded = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "gengjin-huti" }), {
      kind: "tick",
      deltaMs: 2000,
      nearbyEnemyCount: 5,
      isMoving: false
    }).runtime;
    const before = guarded.gengjin!.guardValue;

    const evaded = advanceGongfaRuntime(guarded, {
      kind: "evade",
      learnedMasteryIds: ["flowing-iron-body"]
    });
    expect(evaded.runtime.gengjin!.guardValue).toBeGreaterThan(before);
    expect(evaded.commands.some((command) => command.kind === "aura-burst")).toBe(true);

    const inert = advanceGongfaRuntime(guarded, { kind: "evade", learnedMasteryIds: [] });
    expect(inert.runtime.gengjin!.guardValue).toBe(before);
    expect(inert.commands).toHaveLength(0);
  });

  it("Ten-Thousand Armor Resonance builds Guard on defensive hits", () => {
    const guarded = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "gengjin-huti" }), {
      kind: "tick",
      deltaMs: 2000,
      nearbyEnemyCount: 5,
      isMoving: false
    }).runtime;
    const before = guarded.gengjin!.guardValue;
    const hitFacts = {
      sourceGongfaId: "gengjin-huti" as const,
      targetId: 1,
      damage: 8,
      baseDamageKilledTarget: false,
      embedStacks: 0,
      embedPower: 0
    };

    const resonant = advanceGongfaRuntimeForProjectileHit(guarded, {
      ...hitFacts,
      learnedMasteryIds: ["ten-thousand-armor-resonance"]
    }).runtime;
    expect(resonant.gengjin!.guardValue).toBeGreaterThan(before);

    const inert = advanceGongfaRuntimeForProjectileHit(guarded, {
      ...hitFacts,
      learnedMasteryIds: []
    }).runtime;
    expect(inert.gengjin!.guardValue).toBe(before);
  });

  it("Gengjin Fortress turns Guard into extra orbiting aura blades", () => {
    const guarded = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "gengjin-huti" }), {
      kind: "tick",
      deltaMs: 8000,
      nearbyEnemyCount: 15,
      isMoving: false
    }).runtime;
    expect(guarded.gengjin!.guardValue).toBeGreaterThan(8);

    const [fortress] = planGongfaAttack(guarded, 0, { learnedMasteryIds: ["gengjin-fortress"] });
    const [plain] = planGongfaAttack(guarded, 0);
    const fortressCount = fortress.kind === "aura-burst" ? fortress.count : 0;
    const plainCount = plain.kind === "aura-burst" ? plain.count : 0;
    expect(fortressCount).toBeGreaterThan(plainCount);
  });

  it("Iron Gravity Domain pulls and bursts at high Guard, then waits on cooldown", () => {
    const guarded = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "gengjin-huti" }), {
      kind: "tick",
      deltaMs: 8000,
      nearbyEnemyCount: 15,
      isMoving: false
    }).runtime;
    expect(guarded.gengjin!.guardValue).toBeGreaterThanOrEqual(60);

    const first = advanceGongfaRuntime(guarded, {
      kind: "tick",
      deltaMs: 16,
      nearbyEnemyCount: 4,
      isMoving: false,
      learnedMasteryIds: ["iron-gravity-domain"]
    });
    expect(first.commands.some((command) => command.kind === "gravity-pull")).toBe(true);
    expect(first.commands.some((command) => command.kind === "aura-burst")).toBe(true);
    expect(first.runtime.gengjin!.gengjinPulseCooldownRemaining).toBeGreaterThan(0);

    const second = advanceGongfaRuntime(first.runtime, {
      kind: "tick",
      deltaMs: 16,
      nearbyEnemyCount: 4,
      isMoving: false,
      learnedMasteryIds: ["iron-gravity-domain"]
    });
    expect(second.commands.some((command) => command.kind === "gravity-pull")).toBe(false);
  });

  it("Unbroken Advance strikes on Evade and while moving at high Guard", () => {
    const guarded = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "gengjin-huti" }), {
      kind: "tick",
      deltaMs: 8000,
      nearbyEnemyCount: 15,
      isMoving: false
    }).runtime;

    const evaded = advanceGongfaRuntime(guarded, {
      kind: "evade",
      learnedMasteryIds: ["unbroken-advance"]
    });
    expect(evaded.commands.some((command) => command.kind === "aura-burst")).toBe(true);

    const moving = advanceGongfaRuntime(guarded, {
      kind: "tick",
      deltaMs: 16,
      nearbyEnemyCount: 4,
      isMoving: true,
      learnedMasteryIds: ["unbroken-advance"]
    });
    expect(moving.commands.some((command) => command.kind === "aura-burst")).toBe(true);
  });

  it("Condensed Furnace Ring trades segments for fiercer hotspots", () => {
    const ring = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    const [base] = planGongfaAttack(ring, 0);
    const [condensed] = planGongfaAttack(ring, 0, {
      learnedMasteryIds: ["condensed-furnace-ring"]
    });
    if (base.kind !== "burning-ring-volley" || condensed.kind !== "burning-ring-volley") {
      throw new Error("expected burning-ring-volley");
    }
    expect(condensed.segmentCount).toBeLessThan(base.segmentCount);
    expect(condensed.damageScale).toBeGreaterThan(1);
    expect(base.damageScale).toBeUndefined();
  });

  it("Scattered Ember Orbit flags the volley to leave burning patches", () => {
    const ring = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    const [scattered] = planGongfaAttack(ring, 0, {
      learnedMasteryIds: ["scattered-ember-orbit"]
    });
    const [plain] = planGongfaAttack(ring, 0);
    expect(scattered.kind === "burning-ring-volley" && scattered.scatterEmbers).toBe(true);
    expect(plain.kind === "burning-ring-volley" && plain.scatterEmbers).toBeUndefined();
  });

  it("Banked Sun floors Heat decay at half", () => {
    const heated = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "burning-ring-scripture" }), {
      kind: "tick",
      deltaMs: 12000,
      nearbyEnemyCount: 5,
      isMoving: false
    }).runtime;
    expect(heated.burningRing!.heat).toBeGreaterThan(50);

    const banked = advanceGongfaRuntime(heated, {
      kind: "tick",
      deltaMs: 60000,
      nearbyEnemyCount: 0,
      isMoving: false,
      learnedMasteryIds: ["banked-sun"]
    }).runtime;
    const bled = advanceGongfaRuntime(heated, {
      kind: "tick",
      deltaMs: 60000,
      nearbyEnemyCount: 0,
      isMoving: false
    }).runtime;
    expect(banked.burningRing!.heat).toBe(50);
    expect(bled.burningRing!.heat).toBeLessThan(50);
  });

  it("Aura Furnace stokes more Heat per hit", () => {
    const ring = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    const hitFacts = {
      sourceGongfaId: "burning-ring-scripture" as const,
      targetId: 1,
      damage: 10,
      baseDamageKilledTarget: false,
      embedStacks: 0,
      embedPower: 0
    };

    const furnace = advanceGongfaRuntimeForProjectileHit(ring, {
      ...hitFacts,
      learnedMasteryIds: ["aura-furnace"]
    }).runtime;
    const ordinary = advanceGongfaRuntimeForProjectileHit(ring, {
      ...hitFacts,
      learnedMasteryIds: []
    }).runtime;
    expect(furnace.burningRing!.heat).toBeGreaterThan(ordinary.burningRing!.heat);
  });

  it("Meridian Ignition bursts and resets Heat at full", () => {
    const full = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "burning-ring-scripture" }), {
      kind: "tick",
      deltaMs: 12000,
      nearbyEnemyCount: 10,
      isMoving: false
    }).runtime;
    expect(full.burningRing!.heat).toBe(100);

    const ignited = advanceGongfaRuntime(full, {
      kind: "tick",
      deltaMs: 16,
      nearbyEnemyCount: 5,
      isMoving: false,
      learnedMasteryIds: ["meridian-ignition"]
    });
    expect(ignited.runtime.burningRing!.heat).toBeLessThan(100);
    expect(ignited.commands.some((command) => command.kind === "aura-burst")).toBe(true);
  });

  it("Perfect Solar Orbit adds Heat-scaled segments and closes ring gaps", () => {
    const heated = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "burning-ring-scripture" }), {
      kind: "tick",
      deltaMs: 12000,
      nearbyEnemyCount: 5,
      isMoving: false
    }).runtime;
    expect(heated.burningRing!.heat).toBeGreaterThan(40);

    const [base] = planGongfaAttack(heated, 0);
    const [perfect] = planGongfaAttack(heated, 0, {
      learnedMasteryIds: ["perfect-solar-orbit"]
    });
    if (base.kind !== "burning-ring-volley" || perfect.kind !== "burning-ring-volley") {
      throw new Error("expected burning-ring-volley");
    }
    expect(perfect.segmentCount).toBeGreaterThan(base.segmentCount);
    expect(perfect.visibleSegments).toBe(perfect.segmentCount);
  });

  it("Sunspot Collapse condenses on a cooldown", () => {
    const ring = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    const first = advanceGongfaRuntime(ring, {
      kind: "tick",
      deltaMs: 16,
      nearbyEnemyCount: 3,
      isMoving: false,
      learnedMasteryIds: ["sunspot-collapse"]
    });
    expect(first.commands.some((command) => command.kind === "sunspot-collapse")).toBe(true);
    expect(first.runtime.burningRing!.sunspotCooldownRemaining).toBeGreaterThan(0);

    const second = advanceGongfaRuntime(first.runtime, {
      kind: "tick",
      deltaMs: 16,
      nearbyEnemyCount: 3,
      isMoving: false,
      learnedMasteryIds: ["sunspot-collapse"]
    });
    expect(second.commands.some((command) => command.kind === "sunspot-collapse")).toBe(false);
  });

  it("Phoenix Passage leaves a ring copy on Evade", () => {
    const heated = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "burning-ring-scripture" }), {
      kind: "tick",
      deltaMs: 12000,
      nearbyEnemyCount: 5,
      isMoving: false
    }).runtime;

    const evaded = advanceGongfaRuntime(heated, {
      kind: "evade",
      learnedMasteryIds: ["phoenix-passage"]
    });
    expect(evaded.commands.some((command) => command.kind === "burning-ring-volley")).toBe(true);

    const inert = advanceGongfaRuntime(heated, { kind: "evade", learnedMasteryIds: [] });
    expect(inert.commands).toHaveLength(0);
  });

  it("applies Crimson Furnace rank-3 and rank-6 structural Transformations", () => {
    const ring = createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" });

    const piercing = applyGongfaImprovement(ring, "crimson-piercing-needles").runtime;
    expect(piercing.combat.pierce).toBe(ring.combat.pierce + 2);
    expect(piercing.combat.count).toBe(Math.max(1, ring.combat.count - 1));

    expect(applyGongfaImprovement(ring, "scattered-needles").runtime.combat.count).toBe(
      ring.combat.count + 2
    );
    expect(
      applyGongfaImprovement(ring, "volatile-embeds").runtime.crimsonFurnace!.embedThreshold
    ).toBe(ring.crimsonFurnace!.embedThreshold - 1);
    expect(
      applyGongfaImprovement(ring, "sustained-crucible").runtime.crimsonFurnace!.pressureDecayRate
    ).toBeLessThan(ring.crimsonFurnace!.pressureDecayRate);
    expect(
      applyGongfaImprovement(ring, "resonant-crucible").runtime.crimsonFurnace!.pressureBuildRate
    ).toBeGreaterThan(ring.crimsonFurnace!.pressureBuildRate);
    expect(
      applyGongfaImprovement(ring, "overpressure-detonation").runtime.crimsonFurnace!
        .pressureRadiusScale
    ).toBeGreaterThan(ring.crimsonFurnace!.pressureRadiusScale);
  });

  it("Furnace Heart and Relentless Needles scale volleys with Pressure", () => {
    const pressured = createGongfaRuntime({
      gongfaId: "crimson-furnace-sword-art",
      crimsonFurnace: { pressure: 80 }
    });

    const [heart] = planGongfaAttack(pressured, 0, { learnedMasteryIds: ["furnace-heart"] });
    const [plain] = planGongfaAttack(pressured, 0);
    const heartCount = heart.kind === "crimson-furnace-volley" ? heart.count : 0;
    const plainCount = plain.kind === "crimson-furnace-volley" ? plain.count : 0;
    expect(heartCount).toBeGreaterThan(plainCount);

    expect(
      planGongfaAttack(pressured, 0, { learnedMasteryIds: ["relentless-needles"] })
    ).toHaveLength(2);
    expect(planGongfaAttack(pressured, 0)).toHaveLength(1);
  });

  it("Crucible Nova erupts and resets at full Pressure", () => {
    const full = createGongfaRuntime({
      gongfaId: "crimson-furnace-sword-art",
      crimsonFurnace: { pressure: 100 }
    });
    const nova = advanceGongfaRuntime(full, {
      kind: "tick",
      deltaMs: 16,
      nearbyEnemyCount: 0,
      isMoving: false,
      learnedMasteryIds: ["crucible-nova"]
    });
    expect(nova.commands.some((command) => command.kind === "aura-burst")).toBe(true);
    expect(nova.runtime.crimsonFurnace!.pressure).toBeLessThan(100);
  });

  it("Unbroken Sword Intent builds on hits, boosts combat, and fades over time", () => {
    let runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });
    const baseDamage = runtime.combat.damage;
    const baseSpeed = runtime.combat.projectileSpeed;
    const basePierce = runtime.combat.pierce;

    runtime = advanceGongfaRuntime(runtime, {
      kind: "yujian-projectile-hit",
      targetId: 1,
      damage: 10,
      learnedMasteryIds: []
    }).runtime;
    expect(runtime.yujian!.intentStacks).toBe(1);
    expect(runtime.combat.damage).toBeGreaterThan(baseDamage);
    expect(runtime.combat.projectileSpeed).toBeGreaterThan(baseSpeed);

    for (let i = 0; i < 5; i += 1) {
      runtime = advanceGongfaRuntime(runtime, {
        kind: "yujian-projectile-hit",
        targetId: 1,
        damage: 10,
        learnedMasteryIds: []
      }).runtime;
    }
    expect(runtime.yujian!.intentStacks).toBe(5);
    expect(runtime.combat.pierce).toBe(basePierce + 1);

    // Taking damage sheds two stacks.
    runtime = advanceGongfaRuntime(runtime, {
      kind: "incoming-damage",
      amount: 10,
      learnedMasteryIds: []
    }).runtime;
    expect(runtime.yujian!.intentStacks).toBe(3);

    // Time without hits fades a stack.
    const faded = advanceGongfaRuntime(runtime, {
      kind: "tick",
      deltaMs: 4000,
      nearbyEnemyCount: 0,
      isMoving: false
    }).runtime;
    expect(faded.yujian!.intentStacks).toBeLessThan(3);
  });

  it("Still Sword Heart holds Intent through damage; Myriad Blade Resonance builds it faster", () => {
    let runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });
    for (let i = 0; i < 3; i += 1) {
      runtime = advanceGongfaRuntime(runtime, {
        kind: "yujian-projectile-hit",
        targetId: 1,
        damage: 10,
        learnedMasteryIds: []
      }).runtime;
    }
    const held = advanceGongfaRuntime(runtime, {
      kind: "incoming-damage",
      amount: 10,
      learnedMasteryIds: ["still-sword-heart"]
    }).runtime;
    expect(held.yujian!.intentStacks).toBe(3);

    const fresh = createGongfaRuntime({ gongfaId: "yujian-jue" });
    const myriad = advanceGongfaRuntime(fresh, {
      kind: "yujian-projectile-hit",
      targetId: 1,
      damage: 10,
      learnedMasteryIds: ["myriad-blade-resonance"]
    }).runtime;
    const ordinary = advanceGongfaRuntime(fresh, {
      kind: "yujian-projectile-hit",
      targetId: 1,
      damage: 10,
      learnedMasteryIds: []
    }).runtime;
    expect(myriad.yujian!.intentStacks).toBeGreaterThan(ordinary.yujian!.intentStacks);
  });

  it("Intent Unleashed empowers the volley at full Intent", () => {
    let runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });
    for (let i = 0; i < 5; i += 1) {
      runtime = advanceGongfaRuntime(runtime, {
        kind: "yujian-projectile-hit",
        targetId: 1,
        damage: 10,
        learnedMasteryIds: []
      }).runtime;
    }
    const [unleashed] = planGongfaAttack(runtime, 0, { learnedMasteryIds: ["intent-unleashed"] });
    const [plain] = planGongfaAttack(runtime, 0);
    const unleashedCount = unleashed.kind === "homing-volley" ? unleashed.count : 0;
    const plainCount = plain.kind === "homing-volley" ? plain.count : 0;
    expect(unleashedCount).toBeGreaterThan(plainCount);
  });

  it("applies Blazing Feather rank-3 structural Transformations", () => {
    const base = createGongfaRuntime({ gongfaId: "blazing-feather-art" });

    const searing = applyGongfaImprovement(base, "searing-feathers").runtime;
    expect(searing.combat.pierce).toBe(base.combat.pierce + 2);
    expect(searing.combat.count).toBe(Math.max(1, base.combat.count - 1));
    expect(searing.combat.damage).toBeGreaterThan(base.combat.damage);

    const storm = applyGongfaImprovement(base, "feather-storm").runtime;
    expect(storm.combat.count).toBe(base.combat.count + 3);
    expect(storm.combat.spreadDeg).toBe(base.combat.spreadDeg + 24);
    expect(storm.combat.damage).toBeLessThan(base.combat.damage);

    const swift = applyGongfaImprovement(base, "swift-molt").runtime;
    expect(swift.combat.cooldownMs).toBeLessThan(base.combat.cooldownMs);
    expect(swift.combat.damage).toBeLessThan(base.combat.damage);
    expect(swift.combat.projectileSpeed).toBe(base.combat.projectileSpeed + 80);
  });

  it("Ember Surge builds on hits, boosts damage and feather count, and fades", () => {
    let runtime = createGongfaRuntime({ gongfaId: "blazing-feather-art" });
    const baseDamage = runtime.combat.damage;
    const [basePlan] = planGongfaAttack(runtime, 0);
    const baseCount = basePlan.kind === "homing-volley" ? basePlan.count : 0;

    for (let i = 0; i < 4; i += 1) {
      runtime = advanceGongfaRuntimeForProjectileHit(runtime, {
        sourceGongfaId: "blazing-feather-art",
        targetId: 1,
        damage: 10,
        learnedMasteryIds: [],
        baseDamageKilledTarget: false,
        embedStacks: 0,
        embedPower: 0
      }).runtime;
    }
    expect(runtime.blazingFeather!.emberStacks).toBe(4);
    expect(runtime.combat.damage).toBeGreaterThan(baseDamage);
    const [chargedPlan] = planGongfaAttack(runtime, 0);
    const chargedCount = chargedPlan.kind === "homing-volley" ? chargedPlan.count : 0;
    expect(chargedCount).toBeGreaterThan(baseCount);

    const faded = advanceGongfaRuntime(runtime, {
      kind: "tick",
      deltaMs: 4000,
      nearbyEnemyCount: 0,
      isMoving: false
    }).runtime;
    expect(faded.blazingFeather!.emberStacks).toBeLessThan(4);
  });

  it("does not stoke an owning resource for a repeated Skill 2 activation hit", () => {
    const hitFacts = {
      targetId: 1,
      damage: 10,
      baseDamageKilledTarget: false,
      embedStacks: 0,
      embedPower: 0,
      resourceGainEligible: false
    };
    const feather = advanceGongfaRuntimeForProjectileHit(
      createGongfaRuntime({ gongfaId: "blazing-feather-art" }),
      { ...hitFacts, sourceGongfaId: "blazing-feather-art" }
    ).runtime;
    const wave = advanceGongfaRuntimeForProjectileHit(
      createGongfaRuntime({ gongfaId: "scarlet-wave-manual" }),
      { ...hitFacts, sourceGongfaId: "scarlet-wave-manual" }
    ).runtime;

    expect(feather.blazingFeather!.emberStacks).toBe(0);
    expect(wave.surge!.stacks).toBe(0);
  });

  it("Ember Cascade builds Embers faster; Banked Embers holds them at half", () => {
    const base = createGongfaRuntime({ gongfaId: "blazing-feather-art" });
    const cascade = advanceGongfaRuntimeForProjectileHit(base, {
      sourceGongfaId: "blazing-feather-art",
      targetId: 1,
      damage: 10,
      learnedMasteryIds: ["ember-cascade"],
      baseDamageKilledTarget: false,
      embedStacks: 0,
      embedPower: 0
    }).runtime;
    expect(cascade.blazingFeather!.emberStacks).toBe(2);

    let banked = createGongfaRuntime({
      gongfaId: "blazing-feather-art",
      blazingFeather: { emberStacks: 6, emberDurationRemaining: 10 }
    });
    for (let i = 0; i < 10; i += 1) {
      banked = advanceGongfaRuntime(banked, {
        kind: "tick",
        deltaMs: 3000,
        nearbyEnemyCount: 0,
        isMoving: false,
        learnedMasteryIds: ["banked-embers"]
      }).runtime;
    }
    expect(banked.blazingFeather!.emberStacks).toBe(3);
  });

  it("Ember Burst adds feathers only at full Embers", () => {
    const full = createGongfaRuntime({
      gongfaId: "blazing-feather-art",
      blazingFeather: { emberStacks: 6 }
    });
    const [burst] = planGongfaAttack(full, 0, { learnedMasteryIds: ["ember-burst"] });
    const [plain] = planGongfaAttack(full, 0);
    const burstCount = burst.kind === "homing-volley" ? burst.count : 0;
    const plainCount = plain.kind === "homing-volley" ? plain.count : 0;
    expect(burstCount).toBe(plainCount + 3);
  });

  it("Blazing Feather rank-9: Phoenix Ascendant, Searing Domain, Molten Updraft", () => {
    const stoked = createGongfaRuntime({
      gongfaId: "blazing-feather-art",
      blazingFeather: { emberStacks: 4 }
    });

    // Phoenix Ascendant adds spectral feathers by current Embers.
    const [crowned] = planGongfaAttack(stoked, 0, { learnedMasteryIds: ["phoenix-ascendant"] });
    const [plain] = planGongfaAttack(stoked, 0);
    const crownedCount = crowned.kind === "homing-volley" ? crowned.count : 0;
    const plainCount = plain.kind === "homing-volley" ? plain.count : 0;
    expect(crownedCount).toBe(plainCount + 4);

    // Searing Domain leaves a blazing field (aura-burst) on hit.
    const domainHit = advanceGongfaRuntimeForProjectileHit(stoked, {
      sourceGongfaId: "blazing-feather-art",
      targetId: 1,
      damage: 10,
      learnedMasteryIds: ["searing-domain"],
      baseDamageKilledTarget: false,
      embedStacks: 0,
      embedPower: 0
    });
    expect(domainHit.commands.some((command) => command.kind === "aura-burst")).toBe(true);

    // Molten Updraft looses an extra feather volley on Evade.
    const evaded = advanceGongfaRuntime(stoked, {
      kind: "evade",
      learnedMasteryIds: ["molten-updraft"]
    });
    expect(evaded.commands.some((command) => command.kind === "homing-volley")).toBe(true);
  });

  it("Surge passive builds on hits, boosts damage and volley, and fades", () => {
    const hit = (rt: ReturnType<typeof createGongfaRuntime>, ids: string[]) =>
      advanceGongfaRuntimeForProjectileHit(rt, {
        sourceGongfaId: "scarlet-wave-manual",
        targetId: 1,
        damage: 10,
        learnedMasteryIds: ids,
        baseDamageKilledTarget: false,
        embedStacks: 0,
        embedPower: 0
      }).runtime;

    let runtime = createGongfaRuntime({ gongfaId: "scarlet-wave-manual" });
    const baseDamage = runtime.combat.damage;
    const [basePlan] = planGongfaAttack(createGongfaRuntime({ gongfaId: "scarlet-wave-manual" }), 0);
    const baseCount = basePlan.kind === "wave-volley" ? basePlan.count : 0;

    for (let i = 0; i < 4; i += 1) {
      runtime = hit(runtime, []);
    }
    expect(runtime.surge!.stacks).toBe(4);
    expect(runtime.combat.damage).toBeGreaterThan(baseDamage);
    const [charged] = planGongfaAttack(runtime, 0);
    expect((charged.kind === "wave-volley" ? charged.count : 0)).toBeGreaterThan(baseCount);

    const faded = advanceGongfaRuntime(runtime, {
      kind: "tick",
      deltaMs: 4000,
      nearbyEnemyCount: 0,
      isMoving: false
    }).runtime;
    expect(faded.surge!.stacks).toBeLessThan(4);

    // Cascade stokes twice as fast.
    const cascade = hit(createGongfaRuntime({ gongfaId: "scarlet-wave-manual" }), ["spreading-scorch"]);
    expect(cascade.surge!.stacks).toBe(2);
  });

  it("Surge structural/crown/domain/updraft behaviours, pattern-aware", () => {
    const base = createGongfaRuntime({ gongfaId: "scarlet-wave-manual" });
    const focus = applyGongfaImprovement(base, "lancing-crescent").runtime;
    expect(focus.combat.pierce).toBe(base.combat.pierce + 2);
    expect(focus.combat.damage).toBeGreaterThan(base.combat.damage);

    const spread = applyGongfaImprovement(base, "wide-crescent").runtime;
    expect(spread.combat.count).toBe(base.combat.count + 3);
    expect(spread.combat.damage).toBeLessThan(base.combat.damage);

    const quicken = applyGongfaImprovement(base, "rolling-heat").runtime;
    expect(quicken.combat.cooldownMs).toBeLessThan(base.combat.cooldownMs);
    expect(quicken.combat.damage).toBeLessThan(base.combat.damage);

    const frostBase = createGongfaRuntime({ gongfaId: "drifting-frost-needle" });
    const frostSpread = applyGongfaImprovement(frostBase, "frost-flurry").runtime;
    expect(frostSpread.combat.count - frostBase.combat.count).toBe(2);
    expect(frostSpread.combat.spreadDeg).not.toBe(spread.combat.spreadDeg);

    const stoked = createGongfaRuntime({ gongfaId: "scarlet-wave-manual", surge: { stacks: 4 } });
    const [crowned] = planGongfaAttack(stoked, 0, { learnedMasteryIds: ["sunfire-crescents"] });
    const [plain] = planGongfaAttack(stoked, 0);
    expect((crowned.kind === "wave-volley" ? crowned.count : 0)).toBeGreaterThan(
      plain.kind === "wave-volley" ? plain.count : 0
    );

    const domainHit = advanceGongfaRuntimeForProjectileHit(stoked, {
      sourceGongfaId: "scarlet-wave-manual",
      targetId: 1,
      damage: 10,
      learnedMasteryIds: ["cinder-trail"],
      baseDamageKilledTarget: false,
      embedStacks: 0,
      embedPower: 0
    });
    expect(domainHit.commands.some((command) => command.kind === "aura-burst")).toBe(true);

    // Updraft emits a volley matching each gongfa's pattern.
    const waveEvade = advanceGongfaRuntime(stoked, { kind: "evade", learnedMasteryIds: ["heatwave-step"] });
    expect(waveEvade.commands.some((command) => command.kind === "wave-volley")).toBe(true);

    const homingEvade = advanceGongfaRuntime(
      createGongfaRuntime({ gongfaId: "drifting-frost-needle", surge: { stacks: 3 } }),
      { kind: "evade", learnedMasteryIds: ["frost-step"] }
    );
    expect(homingEvade.commands.some((command) => command.kind === "homing-volley")).toBe(true);

    const auraEvade = advanceGongfaRuntime(
      createGongfaRuntime({ gongfaId: "ice-mirror-guard", surge: { stacks: 3 } }),
      { kind: "evade", learnedMasteryIds: ["reflection-step"] }
    );
    expect(auraEvade.commands.some((command) => command.kind === "aura-burst")).toBe(true);
  });

  it("Sword Crown and Intent Domain scale with Intent; Void-Step looses a volley", () => {
    let runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });
    for (let i = 0; i < 3; i += 1) {
      runtime = advanceGongfaRuntime(runtime, {
        kind: "yujian-projectile-hit",
        targetId: 1,
        damage: 10,
        learnedMasteryIds: []
      }).runtime;
    }
    expect(runtime.yujian!.intentStacks).toBe(3);

    // Sword Crown adds spectral swords by current Intent.
    const [crowned] = planGongfaAttack(runtime, 0, { learnedMasteryIds: ["sword-crown"] });
    const [plain] = planGongfaAttack(runtime, 0);
    const crownedCount = crowned.kind === "homing-volley" ? crowned.count : 0;
    const plainCount = plain.kind === "homing-volley" ? plain.count : 0;
    expect(crownedCount).toBe(plainCount + 3);

    // Intent Domain leaves a blade field (aura-burst) on hit.
    const domainHit = advanceGongfaRuntime(runtime, {
      kind: "yujian-projectile-hit",
      targetId: 1,
      damage: 10,
      learnedMasteryIds: ["intent-domain"]
    });
    expect(domainHit.commands.some((command) => command.kind === "aura-burst")).toBe(true);

    // Void-Step Formation looses an extra volley on Evade.
    const evaded = advanceGongfaRuntime(runtime, {
      kind: "evade",
      learnedMasteryIds: ["void-step-formation"]
    });
    expect(evaded.commands.some((command) => command.kind === "homing-volley")).toBe(true);
  });

  it("builds Myriad Beast Kinship only from distinct species assisting one kill", () => {
    let runtime = createGongfaRuntime({ gongfaId: "myriad-beast-grove" });
    runtime = advanceGongfaRuntime(runtime, {
      kind: "authored-beast-assist", targetId: 71, species: "boar"
    }).runtime;
    runtime = advanceGongfaRuntime(runtime, {
      kind: "authored-beast-assist", targetId: 71, species: "boar"
    }).runtime;
    runtime = advanceGongfaRuntime(runtime, {
      kind: "enemy-death", targetId: 71, x: 10, y: 0, rank: "ordinary",
      velocityX: 0, velocityY: 0, playerX: 0, playerY: 0
    }).runtime;
    expect(runtime.authored.resource).toBe(0);

    for (const species of ["boar", "fox"] as const) {
      runtime = advanceGongfaRuntime(runtime, {
        kind: "authored-beast-assist", targetId: 72, species
      }).runtime;
    }
    runtime = advanceGongfaRuntime(runtime, {
      kind: "enemy-death", targetId: 72, x: 10, y: 0, rank: "ordinary",
      velocityX: 0, velocityY: 0, playerX: 0, playerY: 0
    }).runtime;
    expect(runtime.authored.resource).toBeCloseTo(0.18);
  });

  it("keeps exactly three independent Myriad Beast jobs and reforms without attacking on Evade", () => {
    const runtime = createGongfaRuntime({ gongfaId: "myriad-beast-grove" });
    expect(runtime.authored.anchors.map((anchor) => anchor.beastSpecies)).toEqual(["boar", "fox", "deer"]);
    const evaded = advanceGongfaRuntime(runtime, {
      kind: "evade", playerX: 80, playerY: 40
    });
    expect(evaded.commands).toEqual([]);
    expect(evaded.runtime.authored.anchors.every((anchor) => anchor.targetId === undefined)).toBe(true);

    const ticked = advanceGongfaRuntime(evaded.runtime, {
      kind: "tick", deltaMs: 700, nearbyEnemyCount: 2, playerX: 80, playerY: 40,
      isMoving: true,
      targets: [
        { targetId: 1, x: 180, y: 40, healthRatio: 1, rank: "elite" },
        { targetId: 2, x: 210, y: 55, healthRatio: 0.3, rank: "ordinary" }
      ],
      learnedMasteryIds: ["mountain-lord-enters-the-grove"]
    });
    const actions = ticked.commands.filter((command) => command.kind === "authored-beast-action");
    expect(actions).toHaveLength(3);
    expect(actions.find((command) => command.species === "fox")?.form).toBe("mountain-lord");
    expect(actions.find((command) => command.species === "fox")?.target.rank).toBe("elite");
  });

  it("calls one ancestor per living Myriad Beast species and consumes Kinship", () => {
    const runtime = createGongfaRuntime({ gongfaId: "myriad-beast-grove" });
    runtime.authored.resource = 1;
    const fox = runtime.authored.anchors.find((anchor) => anchor.beastSpecies === "fox")!;
    fox.beastState = "downed";
    fox.value = 0;
    const result = advanceGongfaRuntime(runtime, {
      kind: "skill2",
      skill2Id: "myriad-beast-stampede",
      targets: [{ targetId: 9, x: 140, y: 0, healthRatio: 1, rank: "boss" }],
      learnedMasteryIds: ["ancestral-encirclement"]
    });
    const ancestor = result.commands.find((command) => command.kind === "authored-beast-ancestors");
    expect(ancestor?.species).toEqual(["boar", "deer"]);
    expect(ancestor?.fate).toBe("encirclement");
    expect(result.runtime.authored.resource).toBe(0);
  });

  it("grows Ancient Tree Rings only while rooted and loses them after readable uprooting", () => {
    let runtime = createGongfaRuntime({ gongfaId: "ancient-tree-body-art" });
    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 600, nearbyEnemyCount: 2, isMoving: false, playerX: 0, playerY: 0
    }).runtime;
    expect(runtime.authored.phase).toBe(1);
    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 1300, nearbyEnemyCount: 2, isMoving: false, playerX: 0, playerY: 0
    }).runtime;
    expect(runtime.authored.charges).toBe(1);
    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 2, isMoving: true, playerX: 0, playerY: 0
    }).runtime;
    expect(runtime.authored.phase).toBe(2);
    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 1000, nearbyEnemyCount: 2, isMoving: true, playerX: 0, playerY: 0
    }).runtime;
    expect(runtime.authored.phase).toBe(0);
    expect(runtime.authored.charges).toBe(0);
  });

  it("requires maximum Ancient Tree Rings for the timed World-Tree incarnation", () => {
    const runtime = createGongfaRuntime({ gongfaId: "ancient-tree-body-art" });
    runtime.authored.phase = 1;
    runtime.authored.charges = runtime.authored.maxCharges;
    runtime.authored.resource = 1;
    const result = advanceGongfaRuntime(runtime, {
      kind: "skill2", skill2Id: "world-tree-incarnation",
      learnedMasteryIds: ["world-sheltering-canopy"]
    });
    const cycle = result.commands.find((command) => command.kind === "authored-ancient-tree-cycle");
    expect(result.runtime.authored.phase).toBe(3);
    expect(cycle?.worldTree).toBe(true);
    expect(cycle?.law).toBe("sheltering");
  });
});
