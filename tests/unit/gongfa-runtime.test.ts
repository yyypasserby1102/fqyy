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
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 4,
      targets: [0, 1, 2, 3].map((index) => ({
        targetId: index + 1, x: index * 44, y: 0, healthRatio: 1,
        rank: "ordinary" as const, embedStacks: 1, embedPower: 10
      }))
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
    collection.byId["jinfeng-gong"]!.authored.resource = 0.64;
    collection.byId["jinfeng-gong"]!.authored.anchors.push({
      kind: "trail", x: 20, y: 40, value: 0.64, remainingMs: 1800
    });
    collection.byId["jinfeng-gong"]!.attackCooldownRemaining = 320;
    collection.byId["jinfeng-gong"]!.combat.range = 188;
    collection.byId["burning-ring-scripture"]!.burningRing!.heat = 72;

    const checkpoint = projectGongfaCollectionCheckpoint(collection);
    const restored = createGongfaCollectionFromCheckpoint(checkpoint);

    expect(restored.byId["jinfeng-gong"]!.authored.resource).toBe(0.64);
    expect(restored.byId["jinfeng-gong"]!.attackCooldownRemaining).toBe(0);
    expect(restored.byId["jinfeng-gong"]!.authored.anchors).toContainEqual(
      expect.objectContaining({ kind: "trail", x: 20, y: 40 })
    );
    expect(restored.byId["jinfeng-gong"]!.combat.range).toBe(188);
    expect(restored.byId["burning-ring-scripture"]!.burningRing!.heat).toBe(72);

    restored.byId["jinfeng-gong"]!.authored.resource = 0.1;
    expect(checkpoint.runtimes[0].authored.resource).toBe(0.64);
  });

  it("constructs and refines a complete Gongfa combat package through one interface", () => {
    const initial = createGongfaRuntime({
      gongfaId: "yujian-jue",
      yujian: { intentStacks: 2 }
    });

    const refined = applyGongfaImprovement(initial, "sword-intent-sharpening");

    expect(initial.combat.damage).toBe(15);
    expect(refined.runtime.combat.damage).toBe(15);
    expect(refined.runtime.yujian?.intentPotencyBonus).toBe(1);
    expect(refined.playerEffect).toBeUndefined();
  });

  it("owns activation plans for every currently authored Skill 2", () => {
    expect(getAuthoredSkill2Plan("returning-sword-formation")).toEqual({
      intent: "returning-sword-formation",
      trigger: "threshold",
      cooldownMs: 2400
    });
    expect(getAuthoredSkill2Plan("golden-gale-corridor")?.trigger).toBe("threshold");
    expect(getAuthoredSkill2Plan("furnace-cascade")?.trigger).toBe("timed");
    expect(getAuthoredSkill2Plan("solar-flare-cycle")?.trigger).toBe("cycle");
    expect(getAuthoredSkill2Plan("blade-shell-rebound")?.trigger).toBe("threshold");
    expect(getAuthoredSkill2Plan("feather-rain-formation")?.trigger).toBe("timed");
    expect(getAuthoredSkill2Plan("missing-skill-2")).toBeUndefined();
  });

  it("owns timed Skill 2 cooldown interpretation", () => {
    expect(getAuthoredSkill2CooldownMs("returning-sword-formation")).toBe(2400);
    expect(getAuthoredSkill2CooldownMs("missing-skill-2")).toBe(0);

    expect(advanceTimedMasterySkill2Cooldown("returning-sword-formation", 1000, 1000)).toEqual({
      cooldownRemainingMs: 1000
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
      "yujian-jue": "authored-myriad-swords-return",
      "jinfeng-gong": "authored-golden-gale-route",
      "blazing-feather-art": "authored-phoenix-horizon",
      "scarlet-wave-manual": "authored-scarlet-tides",
      "drifting-frost-needle": "authored-reverse-winter-thread",
      "black-tide-scripture": "authored-deluge-mandate",
      "ice-mirror-guard": "authored-mirror-facets",
      "green-vine-art": "authored-heaven-net",
      "verdant-ring-scripture": "authored-sprout-sun",
      "ironwood-wave-form": "authored-ironwood-walls",
      "vermilion-bird-covenant": "authored-vermilion-flight"
    };
    (Object.keys(gongfaConfigs) as GongfaId[]).forEach((gongfaId) => {
      const skill2Id = getRank10Skill2Id(gongfaId);
      const plan = getAuthoredSkill2Plan(skill2Id);
      expect(plan, `${gongfaId} declares unsupported Skill 2 ${skill2Id}`).toBeDefined();

      const runtime = createGongfaRuntime({ gongfaId });
      if (gongfaId === "yujian-jue") runtime.mastery.masterySkill2Id = skill2Id;
      if (gongfaId === "jinfeng-gong") {
        runtime.mastery.masterySkill2Id = skill2Id;
        runtime.authored.resource = 1;
        runtime.authored.anchors.push(
          { kind: "trail", x: 0, y: 0, value: 0.4, remainingMs: 2100 },
          { kind: "trail", x: 60, y: 0, value: 0.7, remainingMs: 2100 },
          { kind: "trail", x: 120, y: 0, value: 1, remainingMs: 2100 }
        );
      }
      if (gongfaId === "green-vine-art") {
        runtime.mastery.masterySkill2Id = skill2Id;
        runtime.authored.anchors.push(
          { kind: "verdant-knot", x: -80, y: 40, value: 1, remainingMs: 6000 },
          { kind: "verdant-knot", x: 80, y: 40, value: 1, remainingMs: 6000 },
          { kind: "verdant-knot", x: 0, y: -80, value: 1, remainingMs: 6000 }
        );
      }
      if (gongfaId === "gengjin-huti") runtime.gengjin!.guardValue = 60;
      if (gongfaId === "blazing-feather-art") {
        runtime.mastery.masterySkill2Id = skill2Id;
        runtime.mastery.masterySkill2CooldownRemaining = 0;
        runtime.authored.cycleCount = 2;
        runtime.authored.anchors.push(
          { kind: "phoenix-brand", x: 175, y: 0, targetId: 201, value: 1 },
          { kind: "phoenix-brand", x: 210, y: 0, targetId: 202, value: 1 }
        );
      }
      if (gongfaId === "drifting-frost-needle") {
        runtime.mastery.masterySkill2Id = skill2Id;
        runtime.mastery.masterySkill2CooldownRemaining = 0;
        runtime.authored.anchors.push(...[1, 2, 3, 4].map((targetId, index) => ({
          kind: "weakpoint" as const, x: 40 + index * 45, y: index % 2 ? 25 : 0,
          targetId, value: 1
        })));
      }
      if (gongfaId === "ironwood-wave-form") {
        runtime.authored.cycleCount = 3;
        runtime.mastery.masterySkill2Id = skill2Id;
      }
      if (gongfaId === "crimson-furnace-sword-art") runtime.mastery.masterySkill2Id = skill2Id;
      if (gongfaId === "burning-ring-scripture") runtime.burningRing!.heat = 100;
      if (gongfaId === "black-tide-scripture") runtime.authored.cycleCount = 3;
      if (gongfaId === "vermilion-bird-covenant") {
        runtime.authored.targetLedger[-20] = 1;
        runtime.authored.resource = 1;
      }
      if (gongfaId === "scarlet-wave-manual") {
        runtime.authored.cycleCount = 3;
        runtime.authored.anchors.push({ kind: "trail", x: 0, y: 0, angle: 0, value: 30, maxValue: 340 });
      }
      if (gongfaId === "myriad-beast-grove") runtime.authored.resource = 1;
      if (gongfaId === "flame-demon-body-art") {
        runtime.mastery.masterySkill2Id = skill2Id;
        runtime.mastery.masterySkill2CooldownRemaining = 0;
        runtime.mastery.masteryLearnedIds = ["world-burning-asura"];
      }
      if (gongfaId === "ancient-tree-body-art") {
        runtime.authored.phase = 1;
        runtime.authored.charges = runtime.authored.maxCharges;
        runtime.authored.resource = 1;
        runtime.mastery.masterySkill2Id = skill2Id;
        runtime.mastery.masterySkill2CooldownRemaining = 0;
      }
      if (gongfaId === "heavenfall-body-art") {
        runtime.authored.phase = 1;
        runtime.authored.resource = 1;
        runtime.authored.phaseElapsedMs = 6000;
        runtime.mastery.masterySkill2Id = skill2Id;
        runtime.mastery.masterySkill2CooldownRemaining = 0;
      }
      if (gongfaId === "heaven-sundering-edict") {
        runtime.authored.resource = 1;
        runtime.authored.anchors.push({ kind: "trail", x: 0, y: 0, angle: 0, value: 2, maxValue: 500 });
      }
      if (gongfaId === "nine-sun-calamity-seal") runtime.authored.charges = 9;
      if (gongfaId === "moonfall-tide-ritual") runtime.authored.cycleCount = 3;
      if (gongfaId === "verdant-ring-scripture") {
        runtime.authored.phase = 2;
        runtime.authored.anchors.push(
          { kind: "glyph", glyph: "root", x: 0, y: 0, value: 1 },
          { kind: "glyph", glyph: "leaf", x: 0, y: 0, value: 1 },
          { kind: "glyph", glyph: "thorn", x: 0, y: 0, value: 1 }
        );
      }
      if (gongfaId === "mist-wraith-canon") {
        runtime.authored.anchors.push(
          { kind: "stored-soul", x: 0, y: 0, value: 1 },
          { kind: "stored-soul", x: 0, y: 0, value: 1 },
          { kind: "stored-soul", x: 0, y: 0, value: 2 },
          { kind: "stored-soul", x: 0, y: 0, value: 3 }
        );
      }
      if (gongfaId === "sword-burial-formation") {
        runtime.authored.anchors.push(...Array.from({ length: runtime.authored.maxCharges }, (_, index) => ({
          kind: "grave-sword" as const, x: index * 14, y: 0, value: 1, angle: 0
        })));
      }
      if (gongfaId === "frozen-river-formation") {
        runtime.authored.cycleCount = 3;
        runtime.authored.anchors.push(
          { kind: "seal", sealRole: "origin", chainId: 1, targetId: 51, x: 20, y: 0, value: 1 },
          { kind: "seal", sealRole: "origin", chainId: 2, targetId: 52, x: -20, y: 0, value: 1 },
          { kind: "seal", sealRole: "origin", chainId: 3, targetId: 53, x: 0, y: 40, value: 1 }
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
      const result = gongfaId === "yujian-jue"
        ? (() => {
            const targets = [1, 2, 3].map((targetId) => ({
              targetId, x: 120 + targetId * 45, y: targetId * 12,
              healthRatio: 1, rank: "ordinary" as const
            }));
            planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0, targets });
            planGongfaAttack(runtime, 1, { playerX: 10, playerY: 0, targets });
            return { runtime, commands: planGongfaAttack(runtime, 2, { playerX: 20, playerY: 0, targets }) };
          })()
        : gongfaId === "blazing-feather-art"
        ? { runtime, commands: planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0,
            targets: [{ targetId: 203, x: 200, y: 0, healthRatio: 1, rank: "elite" }] }) }
        : gongfaId === "drifting-frost-needle"
        ? { runtime, commands: planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0,
            targets: [{ targetId: 5, x: 220, y: -10, healthRatio: 1, rank: "elite" }] }) }
        : gongfaId === "flame-demon-body-art"
        ? advanceGongfaRuntime(runtime, {
            kind: "authored-asura-transform", healthRatio: 0.19,
            learnedMasteryIds: ["world-burning-asura"]
          })
        : gongfaId === "ancient-tree-body-art"
        ? advanceGongfaRuntime(runtime, {
            kind: "tick", deltaMs: 900, nearbyEnemyCount: 3, isMoving: false,
            playerX: 0, playerY: 0,
            targets: [{ targetId: 47, x: 120, y: 0, healthRatio: 1, rank: "elite" }]
          })
        : gongfaId === "heavenfall-body-art"
        ? (() => {
            const committed = advanceGongfaRuntime(runtime, {
              kind: "tick", deltaMs: 16, nearbyEnemyCount: 3, isMoving: true,
              movementAngle: 0, playerX: 0, playerY: 0,
              targets: [{ targetId: 48, x: 260, y: 0, healthRatio: 1, rank: "elite" }]
            });
            return advanceGongfaRuntime(committed.runtime, {
              kind: "tick", deltaMs: 760, nearbyEnemyCount: 3, isMoving: true,
              movementAngle: 0, playerX: 12, playerY: 0,
              targets: [{ targetId: 48, x: 260, y: 0, healthRatio: 1, rank: "elite" }]
            });
          })()
        :
        gongfaId === "crimson-furnace-sword-art"
          ? advanceGongfaRuntime(runtime, {
              kind: "tick", deltaMs: 16, nearbyEnemyCount: 5, playerX: 0, playerY: 0,
              targets: [0, 1, 2, 3, 4].map((index) => ({
                targetId: 60 + index, x: index * 42, y: 0, healthRatio: 1,
                rank: "ordinary" as const, embedStacks: 1, embedPower: 10
              }))
            })
        : gongfaId === "ironwood-wave-form"
          ? advanceGongfaRuntime(runtime, {
              kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
              targets: [{ targetId: 51, x: 120, y: 0, healthRatio: 1, rank: "ordinary" }]
            })
        : plan?.trigger === "cycle"
          ? advanceGongfaRuntime(runtime, {
              kind: "tick",
              deltaMs: plan.cooldownMs,
              nearbyEnemyCount: 1,
              skill2Id,
              playerX: 0,
              playerY: 0,
              targets: gongfaId === "burning-ring-scripture"
                ? [{ targetId: 50, x: 108, y: 0, healthRatio: 1, rank: "ordinary" }]
                : gongfaId === "ironwood-wave-form"
                  ? [{ targetId: 51, x: 120, y: 0, healthRatio: 1, rank: "ordinary" }]
                : undefined
            })
          : plan?.trigger === "threshold"
            ? advanceGongfaRuntime(runtime, {
              kind: "tick",
              deltaMs: 16,
              nearbyEnemyCount: 1,
              skill2Id,
              isMoving: gongfaId === "jinfeng-gong",
              movementAngle: gongfaId === "jinfeng-gong" ? 0 : undefined,
              movementDistance: gongfaId === "jinfeng-gong" ? 1 : undefined,
              playerX: gongfaId === "jinfeng-gong" ? 121 : 0,
              playerY: 0,
                targets: [{ targetId: 49, x: 100, y: 0, healthRatio: 1, rank: "ordinary" }]
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
                  { targetId: 52, x: -20, y: 0, healthRatio: 0.5, rank: "ordinary" },
                  { targetId: 53, x: 0, y: 40, healthRatio: 0.8, rank: "ordinary" }
                ] : gongfaId === "thousand-root-formation" ? [
                  { targetId: 91, x: -60, y: 0, healthRatio: 1, rank: "elite" },
                  { targetId: 92, x: -20, y: 0, healthRatio: 0.8, rank: "ordinary" },
                  { targetId: 93, x: 20, y: 0, healthRatio: 0.6, rank: "ordinary" },
                  { targetId: 94, x: 60, y: 0, healthRatio: 0.4, rank: "ordinary" }
                ] : gongfaId === "vermilion-bird-covenant" ? [
                  { targetId: 96, x: 120, y: 0, healthRatio: 1, rank: "elite" }
                ] : gongfaId === "myriad-beast-grove" ? [
                  { targetId: 97, x: 120, y: 0, healthRatio: 1, rank: "elite" }
                ] : gongfaId === "nine-sun-calamity-seal" ? [
                  { targetId: 98, x: 120, y: 0, healthRatio: 1, rank: "elite" }
                ] : gongfaId === "moonfall-tide-ritual" ? [
                  { targetId: 99, x: 80, y: 0, healthRatio: 1, rank: "elite" }
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

  it("does not let Ironwood Citadel bypass its three strong-drive requirement", () => {
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
      if (gongfaId === "blazing-feather-art") {
        runtime.mastery.masterySkill2Id = "feather-rain-formation";
        runtime.authored.cycleCount = 2;
        runtime.authored.anchors.push(
          { kind: "phoenix-brand", x: 175, y: 0, targetId: 1, value: 1 },
          { kind: "phoenix-brand", x: 210, y: 0, targetId: 2, value: 1 }
        );
        return planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0,
          targets: [{ targetId: 3, x: 200, y: 0, healthRatio: 1, rank: "elite" }] })
          .find((command) => command.kind === "authored-phoenix-horizon");
      }
      if (gongfaId === "drifting-frost-needle") {
        runtime.mastery.masterySkill2Id = "mirror-needle-constellation";
        runtime.authored.anchors.push(...[1, 2, 3, 4].map((targetId, index) => ({
          kind: "weakpoint" as const, x: 40 + index * 45, y: index % 2 ? 25 : 0,
          targetId, value: 1
        })));
        return planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0,
          targets: [{ targetId: 5, x: 220, y: -10, healthRatio: 1, rank: "elite" }] })
          .find((command) => command.kind === "authored-reverse-winter-thread");
      }
      if (gongfaId === "black-tide-scripture") runtime.authored.cycleCount = 3;
      if (gongfaId === "vermilion-bird-covenant") {
        runtime.authored.targetLedger[-20] = 1;
        runtime.authored.resource = 1;
      }
      if (gongfaId === "scarlet-wave-manual") {
        runtime.authored.cycleCount = 3;
        runtime.authored.anchors.push({ kind: "trail", x: 0, y: 0, angle: 0, value: 30, maxValue: 340 });
      }
      if (gongfaId === "verdant-ring-scripture") {
        runtime.authored.phase = 2;
        runtime.authored.anchors.push(
          { kind: "glyph", glyph: "root", x: 0, y: 0, value: 1 },
          { kind: "glyph", glyph: "leaf", x: 0, y: 0, value: 1 },
          { kind: "glyph", glyph: "thorn", x: 0, y: 0, value: 1 }
        );
      }
      if (gongfaId === "green-vine-art") {
        runtime.mastery.masterySkill2Id = "verdant-root-network";
        runtime.authored.anchors.push(
          { kind: "verdant-knot", x: -100, y: 60, value: 1, remainingMs: 6000 },
          { kind: "verdant-knot", x: 100, y: 60, value: 1, remainingMs: 6000 },
          { kind: "verdant-knot", x: 0, y: -100, value: 1, remainingMs: 6000 }
        );
        return advanceGongfaRuntime(runtime, {
          kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
          targets: [{ targetId: 6, x: 0, y: 0, healthRatio: 1, rank: "elite" }]
        }).commands.find((command) => command.kind === "authored-heaven-net");
      }
      if (runtime.surge) runtime.surge.stacks = 6;
      return advanceGongfaRuntime(runtime, {
        kind: "skill2",
        skill2Id: getRank10Skill2Id(gongfaId),
        nearbyEnemyCount: 4,
        eligibleTargetCount: 4,
        hasMovementDirection: true,
        targets: gongfaId === "vermilion-bird-covenant" ? [
          { targetId: 97, x: 120, y: 0, healthRatio: 1, rank: "elite" }
        ] : undefined
      }).commands[0];
    };

    expect(cast("blazing-feather-art")).toMatchObject({
      kind: "authored-phoenix-horizon",
      targetIds: [1, 2, 3]
    });
    expect(cast("scarlet-wave-manual")).toMatchObject({
      kind: "authored-scarlet-tides",
      supreme: true,
      immediateSeam: true
    });
    expect(cast("drifting-frost-needle")).toMatchObject({
      kind: "authored-reverse-winter-thread",
      points: expect.arrayContaining([expect.objectContaining({ targetId: 5 })])
    });
    expect(cast("black-tide-scripture")).toMatchObject({
      kind: "authored-deluge-mandate",
      fate: "shared-flow",
      force: 250
    });
    expect(cast("ice-mirror-guard")).toMatchObject({
      kind: "authored-mirror-facets",
      radius: 70,
      shell: true,
      facets: expect.arrayContaining([
        expect.objectContaining({ durability: 1, maxDurability: 1 })
      ])
    });
    expect(cast("vermilion-bird-covenant")).toMatchObject({
      kind: "authored-vermilion-flight",
      terminal: true
    });
    expect(cast("green-vine-art")).toMatchObject({
      kind: "authored-heaven-net",
      points: expect.arrayContaining([expect.objectContaining({ x: -100, y: 60 })]),
      targetIds: [6]
    });
    expect(cast("verdant-ring-scripture")).toMatchObject({
      kind: "authored-sprout-sun",
      radius: 225,
      phaseDelayMs: 620
    });
    expect(cast("ironwood-wave-form")).toBeUndefined();
  });

  const ironwoodTarget = (targetId = 1, x = 120, y = 0) =>
    ({ targetId, x, y, healthRatio: 1, rank: "ordinary" as const });

  it("constructs, matures, and physically drives one directional Ironwood rampart", () => {
    const initial = createGongfaRuntime({ gongfaId: "ironwood-wave-form" });
    const built = advanceGongfaRuntime(initial, {
      kind: "tick", deltaMs: 650, nearbyEnemyCount: 1, isMoving: false,
      playerX: 0, playerY: 0, targets: [ironwoodTarget()]
    });
    expect(built.runtime.authored.anchors).toHaveLength(1);
    expect(built.runtime.authored.anchors[0]).toMatchObject({ kind: "wall", x: 72, y: 0, value: 120 });
    expect(built.commands).toContainEqual(expect.objectContaining({
      kind: "authored-ironwood-walls",
      walls: [expect.objectContaining({ mode: "rooted", length: 150 })]
    }));

    const matured = advanceGongfaRuntime(built.runtime, {
      kind: "tick", deltaMs: 4000, nearbyEnemyCount: 1, isMoving: false,
      playerX: 0, playerY: 0, targets: [ironwoodTarget()]
    }).runtime;
    expect(matured.authored.resource).toBe(72);
    const driven = advanceGongfaRuntime(matured, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: true,
      movementAngle: 0, movementDistance: 4, playerX: 0, playerY: 0,
      targets: [ironwoodTarget()]
    });
    expect(driven.runtime.authored.resource).toBe(0);
    expect(driven.runtime.authored.cycleCount).toBe(1);
    expect(driven.commands).toContainEqual(expect.objectContaining({
      kind: "authored-ironwood-walls",
      walls: [expect.objectContaining({ mode: "driving" })]
    }));
    expect(planGongfaAttack(driven.runtime, 0)).toEqual([]);
  });

  it("withers on an early move and loses durability only to bodies pressing the wall", () => {
    const built = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "ironwood-wave-form" }), {
      kind: "tick", deltaMs: 650, nearbyEnemyCount: 1, isMoving: false,
      playerX: 0, playerY: 0, targets: [ironwoodTarget()]
    }).runtime;
    const pressured = advanceGongfaRuntime(built, {
      kind: "tick", deltaMs: 1000, nearbyEnemyCount: 1, isMoving: false,
      playerX: 0, playerY: 0, targets: [ironwoodTarget(2, 72, 0)]
    }).runtime;
    expect(pressured.authored.anchors[0]?.value).toBe(111);
    const withered = advanceGongfaRuntime(built, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: true,
      movementAngle: 0, movementDistance: 4, playerX: 0, playerY: 0,
      targets: [ironwoodTarget()]
    }).runtime;
    expect(withered.authored.anchors).toHaveLength(0);
  });

  it("gives all Ironwood branches distinct construction, Stability, and drive laws", () => {
    const buildWith = (learnedMasteryIds: string[], deltaMs = 1200) => advanceGongfaRuntime(
      createGongfaRuntime({ gongfaId: "ironwood-wave-form" }),
      { kind: "tick", deltaMs, nearbyEnemyCount: 2, isMoving: false, playerX: 0, playerY: 0,
        targets: [ironwoodTarget(1), ironwoodTarget(2, 130, 30)], learnedMasteryIds }
    );
    const lone = buildWith(["lone-great-rampart"], 650);
    const broad = buildWith(["linked-timber-palisade"], 650);
    const curved = buildWith(["living-root-curved-wall"], 1200);
    const loneWall = lone.commands.find((command) => command.kind === "authored-ironwood-walls");
    const broadWall = broad.commands.find((command) => command.kind === "authored-ironwood-walls");
    expect(loneWall?.walls[0]!.length).toBeLessThan(broadWall?.walls[0]!.length ?? 0);
    expect(loneWall?.walls[0]!.maxDurability).toBeGreaterThan(broadWall?.walls[0]!.maxDurability ?? 0);
    expect(curved.runtime.authored.anchors).toHaveLength(3);

    const pressed = advanceGongfaRuntime(buildWith(["enemy-pressed-forest"], 650).runtime, {
      kind: "tick", deltaMs: 1000, nearbyEnemyCount: 2, isMoving: false, playerX: 0, playerY: 0,
      targets: [ironwoodTarget(7, 72, 0), ironwoodTarget(8, 72, 12)], learnedMasteryIds: ["enemy-pressed-forest"]
    }).runtime;
    expect(pressed.authored.resource).toBe(28);

    const deep = buildWith(["deep-age-root"], 1200).runtime;
    expect(deep.authored.maxCharges).toBe(145);
    const relocation = buildWith(["living-root-relocation"], 650).runtime;
    expect(relocation.authored.maxCharges).toBe(65);

    const city = advanceGongfaRuntime(createGongfaRuntime({
      gongfaId: "ironwood-wave-form",
      mastery: { masterySkill2Id: "ironwood-surge-form" },
      authored: { cycleCount: 3 }
    }), {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 2, isMoving: false,
      playerX: 10, playerY: 20, targets: [ironwoodTarget()]
    });
    const citadel = city.commands.find((command) => command.kind === "authored-ironwood-walls" && "masteryCast" in command);
    expect(city.runtime.authored).toMatchObject({ phase: 2, cycleCount: 0 });
    expect(citadel).toMatchObject({
      kind: "authored-ironwood-walls",
      walls: expect.arrayContaining([expect.objectContaining({ mode: "citadel" })]),
      masteryCast: { skill2Id: "ironwood-surge-form", cooldownMs: 2800 }
    });
    expect(citadel?.walls).toHaveLength(4);
  });

  it("plans generic primary attacks behind the runtime seam", () => {
    expect(planGongfaAttack(createGongfaRuntime({ gongfaId: "yujian-jue" }), 0, {
      playerX: 0, playerY: 0,
      targets: [{ targetId: 1, x: 140, y: 0, healthRatio: 1, rank: "ordinary" }]
    })[0]).toMatchObject({
      kind: "authored-yujian-flight",
      swordId: 0,
      targetId: 1,
      shadeTargetIds: []
    });

    expect(planGongfaAttack(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), 0, {
      playerX: 0, playerY: 0,
      targets: [{ targetId: 2, x: 70, y: 0, healthRatio: 1, rank: "ordinary" }]
    })[0]).toMatchObject({
      kind: "authored-jinfeng-ground-cut",
      targetIds: [2],
      style: "standing"
    });

    expect(planGongfaAttack(createGongfaRuntime({ gongfaId: "gengjin-huti" }), 0)).toEqual([]);
  });

  it("plans Yujian transformation commands from learned mastery ids", () => {
    const runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });

    expect(
      planGongfaAttack(runtime, 0, {
        learnedMasteryIds: ["reversing-sword-path"],
        playerX: 0, playerY: 0,
        targets: [{ targetId: 1, x: 140, y: 0, healthRatio: 1, rank: "ordinary" }]
      })
    ).toEqual([expect.objectContaining({
      kind: "authored-yujian-flight",
      outboundDamage: 6,
      returnDamage: 21
    })]);
  });

  it("earns Myriad Swords Return from three airborne routes and reverses each one", () => {
    const runtime = createGongfaRuntime({
      gongfaId: "yujian-jue",
      mastery: { masterySkill2Id: "returning-sword-formation" }
    });
    const targets = [
      { targetId: 1, x: 120, y: -30, healthRatio: 0.7, rank: "ordinary" as const },
      { targetId: 2, x: 180, y: 20, healthRatio: 1, rank: "elite" as const },
      { targetId: 3, x: 230, y: 70, healthRatio: 0.8, rank: "ordinary" as const }
    ];
    planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0, targets });
    planGongfaAttack(runtime, 1, { playerX: 20, playerY: 0, targets });
    const commands = planGongfaAttack(runtime, 2, { playerX: 40, playerY: 5, targets });
    const returned = commands.find((command) => command.kind === "authored-myriad-swords-return");
    expect(returned?.kind).toBe("authored-myriad-swords-return");
    if (returned?.kind !== "authored-myriad-swords-return") throw new Error("missing Myriad Swords Return");
    expect(returned.routes).toHaveLength(3);
    expect(returned.routes.every((route) => route.points.length === 3)).toBe(true);
    expect(returned.routes[0]!.points.at(-1)).toEqual({ x: 0, y: 0 });
    expect(returned.masteryCast).toEqual({
      skill2Id: "returning-sword-formation",
      cooldownMs: 2400
    });
    expect(runtime.authored.anchors.filter((anchor) =>
      anchor.kind === "sword" && anchor.participating
    )).toHaveLength(3);
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
    expect(yujian.commands).toEqual([]);

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
    expect(burningRing.runtime.burningRing?.heat).toBe(0);
  });

  it("owns tick threat radii for passives that need nearby enemy facts", () => {
    expect(getGongfaRuntimeTickThreatRadius(createGongfaRuntime({ gongfaId: "gengjin-huti" }))).toBe(160);
    expect(
      getGongfaRuntimeTickThreatRadius(createGongfaRuntime({ gongfaId: "burning-ring-scripture" }))
    ).toBe(170);
    expect(getGongfaRuntimeTickThreatRadius(createGongfaRuntime({ gongfaId: "jinfeng-gong" }))).toBe(0);
  });

  it("does not let a timer bypass Myriad Swords Return's airborne threshold", () => {
    const runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });
    expect(advanceGongfaRuntime(runtime, {
      kind: "skill2",
      skill2Id: "returning-sword-formation",
      eligibleTargetCount: 1
    }).commands).toEqual([]);
  });

  it("requires full Momentum and a recorded route for Golden Gale Corridor", () => {
    const runtime = createGongfaRuntime({ gongfaId: "jinfeng-gong" });
    runtime.mastery.masterySkill2Id = "golden-gale-corridor";
    expect(advanceGongfaRuntime(runtime, {
      kind: "skill2",
      skill2Id: "golden-gale-corridor"
    }).commands).toEqual([]);
    runtime.authored.resource = 1;
    runtime.authored.anchors.push(
      { kind: "trail", x: 0, y: 0, value: 0.3, remainingMs: 2100 },
      { kind: "trail", x: 70, y: 0, value: 0.7, remainingMs: 2100 },
      { kind: "trail", x: 140, y: 0, value: 1, remainingMs: 2100 }
    );
    const result = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: true,
      movementAngle: 0, movementDistance: 1,
      playerX: 140, playerY: 0,
      targets: [{ targetId: 5, x: 70, y: 8, healthRatio: 1, rank: "ordinary" }]
    });
    expect(result.commands[0]).toMatchObject({
      kind: "authored-golden-gale-route",
      targetIds: [5],
      masteryCast: { skill2Id: "golden-gale-corridor", cooldownMs: 2600 }
    });
    expect(result.runtime.authored.resource).toBe(0);
    expect(result.runtime.authored.anchors).toHaveLength(0);
  });

  it("owns Yujian rank-3 route transformations without Phaser objects", () => {
    const targets = [
      { targetId: 10, x: 120, y: 0, healthRatio: 0.4, rank: "ordinary" as const },
      { targetId: 11, x: 180, y: 20, healthRatio: 1, rank: "elite" as const },
      { targetId: 12, x: 210, y: -20, healthRatio: 0.8, rank: "ordinary" as const }
    ];
    const cast = (learnedMasteryIds: string[]) => planGongfaAttack(
      createGongfaRuntime({ gongfaId: "yujian-jue" }), 0,
      { learnedMasteryIds, playerX: 0, playerY: 0, targets }
    )[0];
    expect(cast(["execution-seal"])).toMatchObject({
      kind: "authored-yujian-flight", targetId: 11, outboundDamage: 19, shadeTargetIds: []
    });
    expect(cast(["sword-bloom"])).toMatchObject({
      kind: "authored-yujian-flight", outboundDamage: 10, shadeTargetIds: [11, 12]
    });
    expect(cast(["reversing-sword-path"])).toMatchObject({
      kind: "authored-yujian-flight", outboundDamage: 6, returnDamage: 21
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

    expect(jinfeng.jinfeng).toBeUndefined();
    expect(jinfeng.authored).toMatchObject({ resource: 0, anchors: [] });
    expect(projectGongfaRuntimeCheckpoint(jinfeng)).toMatchObject({
      galeMomentum: 0,
      galeMomentumBuildRate: 0,
      galeMomentumDecayRate: 0,
      galeMomentumWaveBonus: 0,
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
    const yujian = createGongfaRuntime({ gongfaId: "yujian-jue" });
    planGongfaAttack(yujian, 0, {
      learnedMasteryIds: ["sword-bloom"], playerX: 0, playerY: 0,
      targets: [{ targetId: 10, x: 120, y: 0, healthRatio: 1, rank: "ordinary" }]
    });

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
        kind: "incoming-damage",
        amount: 20,
        sourceDistance: 80,
        sourceId: 1
      }
    ).runtime;

    expect(projectGongfaRuntimeView(gengjin)).toMatchObject({
      guard: 6,
      guardMitigation: 0.3,
      bladeShellCharge: 6,
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
    expect(gengjin.gengjin?.guardMitigation).toBeCloseTo(0.3);

    const advanced = advanceGongfaRuntime(gengjin, {
      kind: "tick",
      deltaMs: 1000,
      nearbyEnemyCount: 1,
      skill2Id: "blade-shell-rebound"
    }).runtime;

    expect(advanced.gengjin?.guardValue).toBe(40);
    expect(advanced.gengjin?.bladeShellCharge).toBe(40);
  });

  it("owns Burning Ring distinct-target Heat and never schedules a substitute volley", () => {
    const initial = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    const heated = advanceGongfaRuntime(initial, {
      kind: "tick",
      deltaMs: 1000,
      nearbyEnemyCount: 2,
      playerX: 0,
      playerY: 0,
      targets: [
        { targetId: 1, x: 108, y: 0, healthRatio: 1, rank: "ordinary" },
        { targetId: 2, x: -108, y: 0, healthRatio: 1, rank: "ordinary" }
      ]
    }).runtime;
    expect(heated.burningRing?.heat).toBe(15);
    expect(planGongfaAttack(heated, 2000)).toEqual([]);
  });

  it("restores durable Burning Ring state without casting below full Heat", () => {
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

    expect(result.runtime.burningRing).toMatchObject({ heat: 29, solarFlareCasts: 2 });
    expect(result.commands.some((command) => "masteryCast" in command)).toBe(false);
  });

  it("does not build Heat from projectile hits", () => {
    const initial = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    const result = advanceGongfaRuntime(initial, {
      kind: "projectile-hit",
      damage: 10
    });

    expect(result.runtime.burningRing?.heat).toBe(0);
    expect(result.runtime.combat.cooldownMs).toBe(initial.combat.cooldownMs);
  });

  it("owns Jinfeng distance Momentum and route recording without Phaser", () => {
    const initial = createGongfaRuntime({ gongfaId: "jinfeng-gong" });
    const moving = advanceGongfaRuntime(initial, {
      kind: "tick",
      deltaMs: 500,
      nearbyEnemyCount: 0,
      isMoving: true,
      movementAngle: 0,
      movementDistance: 136,
      playerX: 136,
      playerY: 0
    }).runtime;
    const refined = applyGongfaImprovement(moving, "windborne-reach").runtime;

    expect(refined.jinfeng).toBeUndefined();
    expect(refined.authored.resource).toBeCloseTo(0.2);
    expect(refined.authored.anchors).toContainEqual(
      expect.objectContaining({ kind: "trail", x: 136, y: 0 })
    );
    expect(refined.combat.range).toBe(initial.combat.range);

    const decayed = advanceGongfaRuntime(refined, {
      kind: "tick",
      deltaMs: 500,
      nearbyEnemyCount: 0,
      isMoving: false
    }).runtime;
    expect(decayed.authored.resource).toBeLessThan(refined.authored.resource);
  });

  it("owns Gengjin guard, mitigation, and Blade Shell commands without Phaser", () => {
    const damaged = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "gengjin-huti" }), {
      kind: "incoming-damage",
      amount: 20,
      sourceDistance: 80,
      sourceId: 7,
      skill2Id: "blade-shell-rebound"
    });
    expect(damaged.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 14 });
    expect(damaged.runtime.gengjin?.guardValue).toBe(6);

    const primed = createGongfaRuntime({
      gongfaId: "gengjin-huti",
      gengjin: { guardValue: 75 }
    });
    const triggered = advanceGongfaRuntime(primed, {
      kind: "tick",
      deltaMs: 0,
      nearbyEnemyCount: 2,
      skill2Id: "blade-shell-rebound",
      playerX: 0,
      playerY: 0,
      targets: [
        { targetId: 1, x: 80, y: 0, healthRatio: 1, rank: "ordinary" },
        { targetId: 2, x: 100, y: 0, healthRatio: 1, rank: "ordinary" }
      ]
    });
    expect(triggered.runtime.gengjin).toMatchObject({
      bladeShellCharge: 0,
      bladeShellCooldownRemaining: 1800,
      bladeShellCasts: 1
    });
    const release = triggered.commands.find((command) => command.kind === "authored-gengjin-release");
    expect(release).toMatchObject({ kind: "authored-gengjin-release", conservedTotal: 75, law: "shared" });
    expect(release?.allocations.reduce((sum, allocation) => sum + allocation.amount, 0)).toBe(75);
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

    expect(baselineMitigation).toBeCloseTo(0.3);
    expect(improved.gengjin?.guardMitigation).toBeCloseTo(0.38);

    const projected = projectGongfaRuntimeCheckpoint(improved);
    expect(projected.guardMitigationBonus).toBe(0.08);
    const restored = createGongfaRuntimeFromCheckpoint("gengjin-huti", projected);
    expect(restored.gengjin?.guardMitigation).toBeCloseTo(0.38);
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
    )).toEqual([0, 3]);

    const result = advanceGongfaRuntime(pressurized, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 4,
      targets: [0, 1, 2, 3].map((index) => ({
        targetId: index + 1, x: index * 48, y: 0, healthRatio: 1,
        rank: "ordinary" as const, embedStacks: 1, embedPower: 10
      }))
    });

    expect(result.runtime.crimsonFurnace?.pressure).toBeGreaterThan(0);
    expect(result.runtime.combat.range).toBe(initial.combat.range);
    expect(result.commands[0]).toMatchObject({
      kind: "authored-crimson-network",
      nodes: expect.arrayContaining([expect.objectContaining({ targetId: 1, nodeCount: 1 })]),
      links: expect.any(Array)
    });
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

    expect(hitResult.commands).toEqual([{
      kind: "lodge-crimson-needle", targetId: 7, embedStacks: 2, embedPower: 26
    }]);
  });

  it("does not let direct Furnace Cascade bypass its live topology requirement", () => {
    const runtime = createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" });
    const result = advanceGongfaRuntime(runtime, { kind: "skill2", skill2Id: "furnace-cascade" });
    expect(result.commands).toEqual([]);
    expect(result.runtime.crimsonFurnace?.furnaceCascadeCasts).toBe(0);
  });

  it("restores Crimson state, drops disconnected Pressure, and earns Furnace Cascade from topology", () => {
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

    restored.mastery.masterySkill2Id = "furnace-cascade";
    expect(restored.combat.range).toBe(52);

    const decayed = advanceGongfaRuntime(restored, {
      kind: "tick",
      deltaMs: 500,
      nearbyEnemyCount: 0
    }).runtime;
    expect(decayed.crimsonFurnace?.pressure).toBe(0);

    const cascaded = advanceGongfaRuntime(decayed, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 5,
      targets: [0, 1, 2, 3, 4].map((index) => ({
        targetId: 20 + index, x: index * 40, y: 0, healthRatio: 1,
        rank: "ordinary" as const, embedStacks: 1, embedPower: 10
      }))
    });
    expect(cascaded.runtime.crimsonFurnace?.furnaceCascadeCasts).toBe(5);
    expect(cascaded.commands[0]).toMatchObject({
      kind: "authored-crimson-network",
      ignition: { targetIds: expect.arrayContaining([20, 21, 22, 23, 24]), fragmentCount: 5 },
      masteryCast: { skill2Id: "furnace-cascade", cooldownMs: 2600 }
    });
  });

  it("creates distinct longitudinal, crosscut, and delayed-wake ground cuts", () => {
    const tick = (learnedMasteryIds: string[], movementDistance = 110) => advanceGongfaRuntime(
      createGongfaRuntime({ gongfaId: "jinfeng-gong" }),
      { kind: "tick", deltaMs: 100, nearbyEnemyCount: 1, isMoving: true,
        movementAngle: 0, movementDistance, playerX: movementDistance, playerY: 0,
        learnedMasteryIds,
        targets: [{ targetId: 1, x: movementDistance, y: 12, healthRatio: 1, rank: "ordinary" }] }
    );
    const longitudinal = tick(["heaven-splitting-long-edge"]);
    const longCut = longitudinal.commands.find((command) => command.kind === "authored-jinfeng-ground-cut");
    expect(longCut).toMatchObject({ kind: "authored-jinfeng-ground-cut", style: "longitudinal" });
    expect(longCut?.kind === "authored-jinfeng-ground-cut" && longCut.from.y).toBeCloseTo(
      longCut?.kind === "authored-jinfeng-ground-cut" ? longCut.to.y : 1
    );

    expect(tick(["golden-gale-crosscut"], 90).commands).toEqual([]);
    expect(tick(["golden-gale-crosscut"], 110).commands[0]).toMatchObject({
      kind: "authored-jinfeng-ground-cut", style: "cross-step"
    });
    expect(tick(["crescent-wake"]).commands[0]).toMatchObject({
      kind: "authored-jinfeng-ground-cut", style: "wake", delayMs: 260
    });
  });

  it("builds Momentum only from distance and loses it on a sharp reversal", () => {
    const first = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 0, isMoving: true,
      movementAngle: 0, movementDistance: 340, playerX: 340, playerY: 0
    });
    expect(first.runtime.authored.resource).toBeCloseTo(0.5);
    const reversed = advanceGongfaRuntime(first.runtime, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 0, isMoving: true,
      movementAngle: Math.PI, movementDistance: 34, playerX: 306, playerY: 0
    });
    expect(reversed.runtime.authored.resource).toBeCloseTo(0.05);
    expect(reversed.runtime.authored.anchors).toHaveLength(1);
  });

  it("Unbroken Continuance tolerates a brief stop but lowers the Momentum cap", () => {
    const moved = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 0, isMoving: true,
      movementAngle: 0, movementDistance: 680, playerX: 680, playerY: 0,
      learnedMasteryIds: ["unbroken-continuance"]
    }).runtime;
    expect(moved.authored.resource).toBe(0.78);
    const held = advanceGongfaRuntime(moved, {
      kind: "tick", deltaMs: 500, nearbyEnemyCount: 0, isMoving: false,
      learnedMasteryIds: ["unbroken-continuance"]
    }).runtime;
    expect(held.authored.resource).toBe(0.78);
  });

  it("Borrowed-Turn Edge spends half Momentum to preserve one reversal", () => {
    const full = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 0, isMoving: true,
      movementAngle: 0, movementDistance: 680, playerX: 680, playerY: 0,
      learnedMasteryIds: ["borrowed-turn-edge"]
    }).runtime;
    const turned = advanceGongfaRuntime(full, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 0, isMoving: true,
      movementAngle: Math.PI, movementDistance: 10, playerX: 670, playerY: 0,
      learnedMasteryIds: ["borrowed-turn-edge"]
    }).runtime;
    expect(turned.authored.resource).toBeGreaterThan(0.5);
    expect(turned.authored.anchors).toContainEqual(
      expect.objectContaining({ kind: "trail", x: 680, y: 0 })
    );
  });

  it("Gale Rupture empties full Momentum into a non-projectile ground cross", () => {
    const result = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 1, isMoving: true,
      movementAngle: 0, movementDistance: 680, playerX: 680, playerY: 0,
      learnedMasteryIds: ["gale-rupture"],
      targets: [{ targetId: 2, x: 680, y: 0, healthRatio: 1, rank: "elite" }]
    });
    expect(result.runtime.authored.resource).toBe(0);
    expect(result.commands.filter((command) =>
      command.kind === "authored-jinfeng-ground-cut" && command.style === "rupture"
    )).toHaveLength(2);
    expect(result.commands.some((command) => command.kind === "wave-volley")).toBe(false);
  });

  it("One Line to Horizon and Returning Dragon impose opposite route disciplines", () => {
    const straight = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 0, isMoving: true,
      movementAngle: 0, movementDistance: 300, playerX: 300, playerY: 0,
      learnedMasteryIds: ["one-line-to-horizon"]
    });
    const horizon = straight.commands.find((command) => command.kind === "authored-jinfeng-ground-cut");
    expect(horizon?.kind === "authored-jinfeng-ground-cut"
      ? Math.hypot(horizon.to.x - horizon.from.x, horizon.to.y - horizon.from.y)
      : 0).toBe(680);

    const curvedBase = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "jinfeng-gong" }), {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 0, isMoving: true,
      movementAngle: 0, movementDistance: 500, playerX: 500, playerY: 0,
      learnedMasteryIds: ["returning-dragon-edge"]
    }).runtime;
    const curved = advanceGongfaRuntime(curvedBase, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 0, isMoving: true,
      movementAngle: 1, movementDistance: 200, playerX: 608, playerY: 168,
      learnedMasteryIds: ["returning-dragon-edge"]
    }).runtime;
    expect(curved.authored.resource).toBe(0.86);
    expect(curved.authored.anchors.length).toBeGreaterThan(1);
  });

  it("Formation-Breaking Gale Step cuts both Evade endpoints and spends half Momentum", () => {
    const runtime = createGongfaRuntime({ gongfaId: "jinfeng-gong" });
    runtime.authored.resource = 0.8;
    const result = advanceGongfaRuntime(runtime, {
      kind: "evade", playerX: 50, playerY: 40, movementAngle: 0,
      learnedMasteryIds: ["formation-breaking-gale-step"],
      targets: [{ targetId: 9, x: 50, y: 40, healthRatio: 1, rank: "ordinary" }]
    });
    expect(result.commands).toHaveLength(2);
    expect(result.commands.every((command) =>
      command.kind === "authored-jinfeng-ground-cut" && command.style === "evade-cross"
    )).toBe(true);
    expect(result.runtime.authored.resource).toBeCloseTo(0.4);
  });

  it("Green Vine creates one automatic V-tether and builds Tension only from geometry", () => {
    const runtime = createGongfaRuntime({ gongfaId: "green-vine-art" });
    const commands = planGongfaAttack(runtime, 0, {
      playerX: 0, playerY: 0,
      targets: [
        { targetId: 1, x: -100, y: 0, healthRatio: 1, rank: "ordinary" },
        { targetId: 2, x: 100, y: 0, healthRatio: 1, rank: "ordinary" }
      ]
    });
    expect(commands[0]).toMatchObject({
      kind: "authored-vine-tether",
      endpoints: [{ targetId: 1 }, { targetId: 2 }],
      tension: 0
    });
    expect(commands.some((command) => command.kind === "homing-volley")).toBe(false);
    const stretched = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 2, playerX: 0, playerY: 100,
      targets: [
        { targetId: 1, x: -100, y: 0, healthRatio: 1, rank: "ordinary" },
        { targetId: 2, x: 100, y: 0, healthRatio: 1, rank: "ordinary" }
      ]
    });
    expect(stretched.runtime.authored.resource).toBeCloseTo(0.518, 2);
    expect(stretched.commands).toContainEqual(expect.objectContaining({ kind: "authored-vine-tether" }));
  });

  it("Green Vine snaps directly between endpoints, binds, and leaves no seeking projectile", () => {
    const runtime = createGongfaRuntime({ gongfaId: "green-vine-art" });
    planGongfaAttack(runtime, 0, {
      playerX: 0, playerY: 0,
      targets: [
        { targetId: 1, x: -100, y: 0, healthRatio: 1, rank: "ordinary" },
        { targetId: 2, x: 100, y: 0, healthRatio: 1, rank: "ordinary" }
      ]
    });
    const snapped = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 3, playerX: 0, playerY: 220,
      learnedMasteryIds: ["dragon-binding-knot"],
      targets: [
        { targetId: 1, x: -100, y: 0, healthRatio: 1, rank: "ordinary" },
        { targetId: 2, x: 100, y: 0, healthRatio: 1, rank: "ordinary" },
        { targetId: 3, x: 0, y: 4, healthRatio: 1, rank: "elite" }
      ]
    });
    expect(snapped.commands).toContainEqual(expect.objectContaining({
      kind: "authored-vine-snap", targetIds: [1, 2, 3], bindMs: 1100
    }));
    expect(snapped.commands.some((command) => command.kind === "homing-volley")).toBe(false);
    expect(snapped.runtime.authored.anchors).toContainEqual(
      expect.objectContaining({ kind: "verdant-knot", x: 0, y: 0 })
    );
  });

  it("Flying Vine Graft reattaches twice while Broken-Vine Branching leaves finite weak knots", () => {
    const graft = createGongfaRuntime({ gongfaId: "green-vine-art" });
    graft.authored.anchors.push(
      { kind: "vine-endpoint", x: -80, y: 0, targetId: 1, value: 0 },
      { kind: "vine-endpoint", x: 80, y: 0, targetId: 2, value: 0 }
    );
    graft.authored.resource = 0.8;
    const reattached = advanceGongfaRuntime(graft, {
      kind: "enemy-death", targetId: 1, x: -80, y: 0, rank: "ordinary",
      velocityX: 0, velocityY: 0, playerX: 0, playerY: 0,
      learnedMasteryIds: ["flying-vine-graft"],
      targets: [{ targetId: 3, x: -120, y: 20, healthRatio: 1, rank: "ordinary" }]
    });
    expect(reattached.runtime.authored.resource).toBeCloseTo(0.4);
    expect(reattached.runtime.authored.anchors).toContainEqual(
      expect.objectContaining({ kind: "vine-endpoint", targetId: 3 })
    );

    const broken = advanceGongfaRuntime(graft, {
      kind: "enemy-death", targetId: 1, x: -80, y: 0, rank: "ordinary",
      velocityX: 0, velocityY: 0, playerX: 0, playerY: 0,
      learnedMasteryIds: ["broken-vine-branching"], targets: []
    });
    expect(broken.runtime.authored.anchors.filter((anchor) => anchor.kind === "verdant-knot")).toHaveLength(2);
    expect(broken.runtime.authored.anchors.some((anchor) => anchor.kind === "vine-endpoint")).toBe(false);
  });

  it("stores exactly prevented close damage and ignores distant danger", () => {
    const base = createGongfaRuntime({ gongfaId: "gengjin-huti" });
    const close = advanceGongfaRuntime(base, {
      kind: "incoming-damage", amount: 100, sourceDistance: 80, sourceId: 1
    });
    expect(close.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 70 });
    expect(close.runtime.gengjin!.guardValue).toBe(30);
    const distant = advanceGongfaRuntime(base, {
      kind: "incoming-damage", amount: 100, sourceDistance: 260, sourceId: 1
    });
    expect(distant.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 100 });
    expect(distant.runtime.gengjin!.guardValue).toBe(0);
  });

  it("makes each rank-3 armor choice change gain and failure behavior", () => {
    const base = createGongfaRuntime({ gongfaId: "gengjin-huti" });
    const rebound = advanceGongfaRuntime(base, {
      kind: "incoming-damage", amount: 100, sourceDistance: 80, sourceId: 8,
      learnedMasteryIds: ["rebounding-edge-armor"]
    });
    expect(rebound.runtime.gengjin!.guardValue).toBe(19);
    expect(rebound.commands).toContainEqual(expect.objectContaining({
      kind: "authored-gengjin-reflection", targetId: 8, amount: 10
    }));

    const heavy = advanceGongfaRuntime(base, {
      kind: "incoming-damage", amount: 100, sourceDistance: 80, sourceId: 8,
      learnedMasteryIds: ["hundred-forged-heavy-armor"]
    });
    expect(heavy.runtime.gengjin).toMatchObject({ guardValue: 42, guardCapacity: 150 });

    const vented = advanceGongfaRuntime(createGongfaRuntime({
      gongfaId: "gengjin-huti", gengjin: { guardValue: 70 }
    }), {
      kind: "incoming-damage", amount: 100, sourceDistance: 80, sourceId: 8,
      learnedMasteryIds: ["flowing-gold-vent"]
    });
    expect(vented.runtime.gengjin).toMatchObject({ guardValue: 72, guardCapacity: 72, fractureCount: 0 });
  });

  it("fractures on overflow and temporarily disables mitigation", () => {
    const primed = createGongfaRuntime({ gongfaId: "gengjin-huti", gengjin: { guardValue: 95 } });
    const broken = advanceGongfaRuntime(primed, {
      kind: "incoming-damage", amount: 100, sourceDistance: 80, sourceId: 3
    });
    expect(broken.runtime.gengjin).toMatchObject({
      guardValue: 35, fractureCount: 1, mitigationDisabledRemaining: 2800
    });
    const followup = advanceGongfaRuntime(broken.runtime, {
      kind: "incoming-damage", amount: 20, sourceDistance: 80, sourceId: 3
    });
    expect(followup.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 20 });
  });

  it("implements stationary capacity, Evade venting, and source adaptation", () => {
    const mountain = advanceGongfaRuntime(createGongfaRuntime({
      gongfaId: "gengjin-huti", gengjin: { guardValue: 140 }
    }), {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 0, isMoving: false,
      learnedMasteryIds: ["immovable-mountain"]
    }).runtime;
    expect(mountain.gengjin!.guardCapacity).toBe(150);
    const moved = advanceGongfaRuntime(mountain, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 0, isMoving: true,
      learnedMasteryIds: ["immovable-mountain"]
    }).runtime;
    expect(moved.gengjin).toMatchObject({ guardCapacity: 100, guardValue: 100, fractureCount: 0 });

    const evaded = advanceGongfaRuntime(createGongfaRuntime({
      gongfaId: "gengjin-huti", gengjin: { guardValue: 80 }
    }), { kind: "evade", learnedMasteryIds: ["flowing-gold-turn"] });
    expect(evaded.runtime.gengjin).toMatchObject({ guardValue: 48, postEvadeGuard: 32, postEvadeLayerRemaining: 1000 });
    const layeredHit = advanceGongfaRuntime(evaded.runtime, {
      kind: "incoming-damage", amount: 100, sourceDistance: 80, sourceId: 10,
      learnedMasteryIds: ["flowing-gold-turn"]
    });
    expect(layeredHit.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 52 });
    expect(layeredHit.runtime.gengjin).toMatchObject({ guardValue: 78, postEvadeGuard: 14 });

    const first = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "gengjin-huti" }), {
      kind: "incoming-damage", amount: 100, sourceDistance: 80, sourceId: 11,
      learnedMasteryIds: ["armor-remembers-enemy"]
    });
    const second = advanceGongfaRuntime(first.runtime, {
      kind: "incoming-damage", amount: 100, sourceDistance: 80, sourceId: 11,
      learnedMasteryIds: ["armor-remembers-enemy"]
    });
    const switched = advanceGongfaRuntime(second.runtime, {
      kind: "incoming-damage", amount: 100, sourceDistance: 80, sourceId: 12,
      learnedMasteryIds: ["armor-remembers-enemy"]
    });
    expect(second.runtime.gengjin!.guardMitigation).toBeGreaterThan(first.runtime.gengjin!.guardMitigation);
    expect(switched.runtime.gengjin!.rememberedHits).toBe(1);
  });

  it("conserves the release total for all three rank-9 laws", () => {
    const targets = [1, 2, 3].map((targetId) => ({ targetId, x: targetId * 35, y: 0, healthRatio: 1, rank: "ordinary" as const }));
    const releaseFor = (masteryId: string) => advanceGongfaRuntime(createGongfaRuntime({
      gongfaId: "gengjin-huti", gengjin: { guardValue: 79 }
    }), {
      kind: "tick", deltaMs: 0, nearbyEnemyCount: 3, skill2Id: "blade-shell-rebound",
      playerX: 0, playerY: 0, targets, learnedMasteryIds: [masteryId]
    }).commands.find((command) => command.kind === "authored-gengjin-release");

    const shared = releaseFor("eight-wastes-rebound");
    expect(shared?.law).toBe("shared");
    expect(shared?.allocations.reduce((sum, allocation) => sum + allocation.amount, 0)).toBe(79);
    const single = releaseFor("one-edge-breaks-mountain");
    expect(single).toMatchObject({ law: "single", conservedTotal: 79, allocations: [{ targetId: 1, amount: 79 }] });
    const city = releaseFor("unbroken-golden-city");
    expect(city).toMatchObject({ law: "shield", conservedTotal: 79, allocations: [], shield: 79 });
  });

  const burningTarget = (targetId: number, rank: "ordinary" | "elite" | "boss" = "ordinary") =>
    ({ targetId, x: 108, y: 0, healthRatio: 1, rank });

  it("emits a persistent broken corona with real R3 geometry", () => {
    const ring = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    const base = advanceGongfaRuntime(ring, {
      kind: "tick", deltaMs: 150, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
      targets: [burningTarget(1)]
    }).commands.find((command) => command.kind === "authored-burning-corona");
    const twin = advanceGongfaRuntime(ring, {
      kind: "tick", deltaMs: 150, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
      targets: [burningTarget(1)], learnedMasteryIds: ["counter-rotating-twin-rings"]
    }).commands.find((command) => command.kind === "authored-burning-corona");
    const lone = advanceGongfaRuntime(ring, {
      kind: "tick", deltaMs: 150, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
      targets: [burningTarget(1)], learnedMasteryIds: ["furnace-heart-lone-ring"]
    }).commands.find((command) => command.kind === "authored-burning-corona");
    expect(base?.rings).toHaveLength(1);
    expect(twin?.rings.map((candidate) => candidate.direction)).toEqual([1, -1]);
    expect(lone?.rings[0]).toMatchObject({ segmentCount: 6, visibleSegments: 2 });
    expect(lone!.rings[0]!.damage).toBeGreaterThan(base!.rings[0]!.damage);
  });

  it("Wandering Luminary Rings exposes transition downtime", () => {
    const ring = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    const result = advanceGongfaRuntime(ring, {
      kind: "tick", deltaMs: 150, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
      targets: [burningTarget(1)], learnedMasteryIds: ["wandering-luminary-rings"]
    });
    const corona = result.commands.find((command) => command.kind === "authored-burning-corona");
    expect(corona?.rings).toEqual([]);
  });

  it("Banked Sun floors Heat decay at half", () => {
    const heated = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "burning-ring-scripture" }), {
      kind: "tick",
      deltaMs: 1000,
      nearbyEnemyCount: 1,
      playerX: 0, playerY: 0,
      targets: [burningTarget(1)]
    }).runtime;
    heated.burningRing!.heat = 70;

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

  it("R6 paths weight distinct enemy ranks instead of hits", () => {
    const ring = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    const tick = (learnedMasteryIds: string[], target: ReturnType<typeof burningTarget>) =>
      advanceGongfaRuntime(ring, { kind: "tick", deltaMs: 1000, nearbyEnemyCount: 1,
        playerX: 0, playerY: 0, targets: [target], learnedMasteryIds }).runtime.burningRing!.heat;
    expect(tick(["myriad-enemies-as-furnace"], burningTarget(1))).toBeGreaterThan(
      tick(["lone-true-sun"], burningTarget(1))
    );
    expect(tick(["lone-true-sun"], burningTarget(2, "boss"))).toBeGreaterThan(
      tick(["myriad-enemies-as-furnace"], burningTarget(2, "boss"))
    );
  });

  it("Perfect-Sun closes gaps while draining and Sunspot widens them", () => {
    const ring = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    ring.burningRing!.heat = 80;
    const perfect = advanceGongfaRuntime(ring, { kind: "tick", deltaMs: 150,
      nearbyEnemyCount: 1, playerX: 0, playerY: 0, targets: [burningTarget(1)],
      learnedMasteryIds: ["perfect-sun-consumption"] });
    const perfectCorona = perfect.commands.find((command) => command.kind === "authored-burning-corona");
    expect(perfectCorona?.rings[0]?.visibleSegments).toBe(8);
    expect(perfect.runtime.burningRing!.heat).toBeLessThan(80);

    const sunspot = advanceGongfaRuntime(ring, { kind: "tick", deltaMs: 150,
      nearbyEnemyCount: 1, playerX: 0, playerY: 0, targets: [burningTarget(1)],
      learnedMasteryIds: ["sunspot-lure"] });
    const sunspotCorona = sunspot.commands.find((command) => command.kind === "authored-burning-corona");
    expect(sunspotCorona).toMatchObject({ sunspotLure: true });
    expect(sunspotCorona?.rings[0]?.visibleSegments).toBe(3);
  });

  it("Reverse-Wheel Reflection spends Heat and reverses without spawning attacks", () => {
    const heated = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    heated.burningRing!.heat = 40;

    const evaded = advanceGongfaRuntime(heated, {
      kind: "evade",
      learnedMasteryIds: ["reverse-wheel-reflection"]
    });
    expect(evaded.runtime.burningRing).toMatchObject({ heat: 22, rotationDirection: -1 });
    expect(evaded.commands).toHaveLength(0);
  });

  it("Sunlit Guard requires full Heat and danger, prevents damage, then consumes Heat", () => {
    const ring = createGongfaRuntime({ gongfaId: "burning-ring-scripture" });
    ring.burningRing!.heat = 100;
    const cast = advanceGongfaRuntime(ring, { kind: "tick", deltaMs: 16,
      nearbyEnemyCount: 1, playerX: 0, playerY: 0, targets: [burningTarget(1)],
      skill2Id: "solar-flare-cycle" });
    expect(cast.commands.find((command) => command.kind === "authored-burning-corona")).toMatchObject({
      guard: true, pushStrength: 300, masteryCast: { skill2Id: "solar-flare-cycle" }
    });
    const blocked = advanceGongfaRuntime(cast.runtime, { kind: "incoming-damage", amount: 999 });
    expect(blocked.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 0 });
    const ended = advanceGongfaRuntime(cast.runtime, { kind: "tick", deltaMs: 1300,
      nearbyEnemyCount: 0, playerX: 0, playerY: 0, targets: [], skill2Id: "solar-flare-cycle" });
    expect(ended.runtime.burningRing).toMatchObject({ guardRemaining: 0, heat: 0 });
  });

  it("Sixfold Ice Mirrors block only intact facet directions and leave real gaps", () => {
    const mirror = createGongfaRuntime({ gongfaId: "ice-mirror-guard" });
    const blocked = advanceGongfaRuntime(mirror, {
      kind: "incoming-damage", amount: 40, incomingAngle: 0
    });
    expect(blocked.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 0 });
    expect(blocked.commands.some((command) => command.kind === "authored-mirror-reflection")).toBe(true);
    expect(blocked.runtime.authored.charges).toBe(5);

    const throughCrack = advanceGongfaRuntime(blocked.runtime, {
      kind: "incoming-damage", amount: 40, incomingAngle: 0
    });
    expect(throughCrack.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 40 });

    const throughGap = advanceGongfaRuntime(mirror, {
      kind: "incoming-damage", amount: 40, incomingAngle: Math.PI / 6
    });
    expect(throughGap.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 40 });
  });

  it("Cold-Mirror Repair requires a close-danger Evade and all-cracked state restores slowly", () => {
    let mirror = createGongfaRuntime({ gongfaId: "ice-mirror-guard" });
    mirror = advanceGongfaRuntime(mirror, {
      kind: "incoming-damage", amount: 20, incomingAngle: 0
    }).runtime;
    const distant = advanceGongfaRuntime(mirror, { kind: "evade", nearbyEnemyCount: 0 });
    expect(distant.runtime.authored.charges).toBe(5);
    const repaired = advanceGongfaRuntime(distant.runtime, { kind: "evade", nearbyEnemyCount: 1 });
    expect(repaired.runtime.authored.charges).toBe(6);

    for (let index = 0; index < 6; index += 1) {
      mirror = advanceGongfaRuntime(mirror, {
        kind: "incoming-damage", amount: 20, incomingAngle: index * Math.PI / 3
      }).runtime;
    }
    expect(mirror.authored.charges).toBe(0);
    const early = advanceGongfaRuntime(mirror, { kind: "tick", deltaMs: 4700, nearbyEnemyCount: 0 });
    expect(early.runtime.authored.charges).toBe(0);
    const restored = advanceGongfaRuntime(early.runtime, { kind: "tick", deltaMs: 200, nearbyEnemyCount: 0 });
    expect(restored.runtime.authored.charges).toBe(1);
  });

  it("Ice Mirror R3 forms change physical facet count, durability, and motion", () => {
    const commandFor = (learnedMasteryIds: string[]) => {
      const runtime = createGongfaRuntime({ gongfaId: "ice-mirror-guard" });
      runtime.mastery.masteryLearnedIds = learnedMasteryIds;
      return advanceGongfaRuntime(runtime, { kind: "tick", deltaMs: 100, nearbyEnemyCount: 0 })
        .commands.find((command) => command.kind === "authored-mirror-facets");
    };
    const heavy = commandFor(["three-enclosure-heavy-mirrors"]);
    expect(heavy?.facets).toHaveLength(3);
    expect(heavy?.facets[0]).toMatchObject({ durability: 2, maxDurability: 2 });
    const lotus = commandFor(["thousand-facet-lotus"]);
    expect(lotus?.facets).toHaveLength(8);
    expect(lotus!.arcWidth).toBeLessThan(heavy!.arcWidth);

    const flowing = createGongfaRuntime({ gongfaId: "ice-mirror-guard" });
    flowing.mastery.masteryLearnedIds = ["flowing-light-mirrors"];
    const before = advanceGongfaRuntime(flowing, { kind: "tick", deltaMs: 100, nearbyEnemyCount: 0 }).runtime;
    const reversed = advanceGongfaRuntime(before, { kind: "evade", nearbyEnemyCount: 0 }).runtime;
    const after = advanceGongfaRuntime(reversed, { kind: "tick", deltaMs: 100, nearbyEnemyCount: 0 }).runtime;
    expect(after.authored.targetLedger[-110]).toBeLessThan(before.authored.targetLedger[-110]!);
  });

  it("Ice Mirror R6 repair, shatter, and lingering branches are mechanically distinct", () => {
    const iceHeart = createGongfaRuntime({ gongfaId: "ice-mirror-guard" });
    iceHeart.mastery.masteryLearnedIds = ["ice-heart-repair"];
    let damaged = advanceGongfaRuntime(iceHeart, { kind: "incoming-damage", amount: 20, incomingAngle: 0 }).runtime;
    damaged = advanceGongfaRuntime(damaged, { kind: "incoming-damage", amount: 20, incomingAngle: Math.PI / 3 }).runtime;
    const repaired = advanceGongfaRuntime(damaged, { kind: "evade", nearbyEnemyCount: 2 });
    expect(repaired.runtime.authored.charges).toBe(6);
    expect(repaired.runtime.authored.targetLedger[-115]).toBe(1);

    const shattered = createGongfaRuntime({ gongfaId: "ice-mirror-guard" });
    shattered.mastery.masteryLearnedIds = ["shattered-mirror-frost"];
    const shards = advanceGongfaRuntime(shattered, { kind: "incoming-damage", amount: 20, incomingAngle: 0 });
    expect(shards.commands.find((command) => command.kind === "authored-mirror-reflection"))
      .toMatchObject({ shardsPerAngle: 3 });

    const lingering = createGongfaRuntime({ gongfaId: "ice-mirror-guard" });
    lingering.mastery.masteryLearnedIds = ["lingering-reflection"];
    const cracked = advanceGongfaRuntime(lingering, { kind: "incoming-damage", amount: 20, incomingAngle: 0 });
    const half = advanceGongfaRuntime(cracked.runtime, { kind: "incoming-damage", amount: 20, incomingAngle: 0 });
    expect(half.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 10 });
  });

  it("Frozen Lotus records directions, blocks without storing damage, then cracks participating facets", () => {
    const mirror = createGongfaRuntime({ gongfaId: "ice-mirror-guard" });
    const cast = advanceGongfaRuntime(mirror, {
      kind: "skill2", skill2Id: "frozen-lotus-shell", nearbyEnemyCount: 1
    });
    expect(cast.commands[0]).toMatchObject({ kind: "authored-mirror-facets", shell: true });
    const first = advanceGongfaRuntime(cast.runtime, {
      kind: "incoming-damage", amount: 10, incomingAngle: 0.25
    });
    const second = advanceGongfaRuntime(first.runtime, {
      kind: "incoming-damage", amount: 999, incomingAngle: -1.2
    });
    expect(second.commands).toContainEqual({ kind: "incoming-damage", finalDamage: 0 });
    const ended = advanceGongfaRuntime(second.runtime, {
      kind: "tick", deltaMs: 1500, nearbyEnemyCount: 0
    });
    const reflected = ended.commands.find((command) => command.kind === "authored-mirror-reflection");
    expect(reflected?.angles).toEqual([0.25, -1.2]);
    expect(ended.runtime.authored.charges).toBe(0);
  });

  it("Frozen Lotus R9 branches enforce distinct readiness and payoff laws", () => {
    const damaged = createGongfaRuntime({ gongfaId: "ice-mirror-guard" });
    damaged.mastery.masteryLearnedIds = ["flawless-lotus"];
    const cracked = advanceGongfaRuntime(damaged, { kind: "incoming-damage", amount: 10, incomingAngle: 0 }).runtime;
    const denied = advanceGongfaRuntime(cracked, { kind: "skill2", skill2Id: "frozen-lotus-shell", nearbyEnemyCount: 1 });
    expect(denied.commands).toEqual([]);

    cracked.mastery.masteryLearnedIds = ["calamity-answering-broken-lotus"];
    const brokenCast = advanceGongfaRuntime(cracked, { kind: "skill2", skill2Id: "frozen-lotus-shell", nearbyEnemyCount: 1 });
    expect(brokenCast.commands[0]).toMatchObject({ shell: true });

    const killing = createGongfaRuntime({ gongfaId: "ice-mirror-guard" });
    killing.mastery.masteryLearnedIds = ["killing-shattered-mirror"];
    const killingCast = advanceGongfaRuntime(killing, { kind: "skill2", skill2Id: "frozen-lotus-shell", nearbyEnemyCount: 1 });
    const recorded = advanceGongfaRuntime(killingCast.runtime, { kind: "incoming-damage", amount: 50, incomingAngle: 0 });
    const ended = advanceGongfaRuntime(recorded.runtime, { kind: "tick", deltaMs: 700, nearbyEnemyCount: 0 });
    expect(ended.commands.find((command) => command.kind === "authored-mirror-reflection"))
      .toMatchObject({ shardsPerAngle: 3, range: 560 });
  });

  it("applies Crimson Furnace structural Transformations without generic pierce or radius bonuses", () => {
    const ring = createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" });

    const piercing = applyGongfaImprovement(ring, "piercing-furnace-needle").runtime;
    expect(piercing.combat.pierce).toBe(ring.combat.pierce);
    expect(piercing.combat.count).toBe(Math.max(1, ring.combat.count - 1));
    expect(piercing.combat.damage).toBeGreaterThan(ring.combat.damage);

    expect(applyGongfaImprovement(ring, "scattered-furnace-needles").runtime.combat.count).toBe(
      ring.combat.count + 2
    );
    expect(applyGongfaImprovement(ring, "volatile-furnace-core").runtime.combat.cooldownMs)
      .toBeLessThan(ring.combat.cooldownMs);
    for (const id of ["sealed-leftover-needle", "star-furnace-resonance", "compressed-furnace",
      "furnace-heart-reforge", "myriad-edges-return", "falling-star-forge"]) {
      expect(applyGongfaImprovement(ring, id).runtime).not.toBe(ring);
    }
  });

  it("migrates legacy Crimson milestone identifiers in existing checkpoints", () => {
    const restored = createGongfaRuntime({
      gongfaId: "crimson-furnace-sword-art",
      mastery: {
        masteryLearnedIds: ["crimson-piercing-needles", "resonant-crucible", "crucible-nova"],
        upgradeSelectionIds: ["crimson-piercing-needles", "resonant-crucible", "crucible-nova"]
      }
    });
    expect(restored.mastery.masteryLearnedIds).toEqual([
      "piercing-furnace-needle", "star-furnace-resonance", "falling-star-forge"
    ]);
    expect(restored.mastery.upgradeSelectionIds).toEqual(restored.mastery.masteryLearnedIds);
  });

  it("uses distinct R9 fragment laws and permits only one reforged follow-up", () => {
    const targets = [0, 1, 2, 3].map((index) => ({
      targetId: index + 1, x: index * 40, y: 0, healthRatio: 1,
      rank: "ordinary" as const, embedStacks: 1, embedPower: 10
    }));
    for (const [id, law] of [["furnace-heart-reforge", "reforge"], ["myriad-edges-return", "return"], ["falling-star-forge", "falling-star"]] as const) {
      const runtime = createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" });
      runtime.mastery.masteryLearnedIds = [id];
      const ignited = advanceGongfaRuntime(runtime, { kind: "tick", deltaMs: 16, nearbyEnemyCount: 4, targets });
      expect(ignited.commands[0]).toMatchObject({
        kind: "authored-crimson-network",
        ignition: { fragmentLaw: law, fragmentCount: 4, followUp: false }
      });
      const cooled = advanceGongfaRuntime(ignited.runtime, { kind: "tick", deltaMs: 800, nearbyEnemyCount: 4, targets });
      expect(cooled.commands[0]).toMatchObject({
        kind: "authored-crimson-network",
        ignition: { fragmentCount: 0, followUp: true }
      });
    }
  });

  it("gives every Crimson R3 branch a different network threshold and body distribution", () => {
    const make = (learnedMasteryIds: string[], targets: Array<{
      targetId: number; x: number; y: number; healthRatio: number; rank: "ordinary" | "elite"; embedStacks: number; embedPower: number;
    }>) => {
      const runtime = createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" });
      runtime.mastery.masteryLearnedIds = learnedMasteryIds;
      return advanceGongfaRuntime(runtime, { kind: "tick", deltaMs: 16, nearbyEnemyCount: targets.length, targets });
    };
    const piercing = make(["piercing-furnace-needle"], [
      { targetId: 1, x: 0, y: 0, healthRatio: 1, rank: "elite", embedStacks: 3, embedPower: 30 },
      { targetId: 2, x: 90, y: 0, healthRatio: 1, rank: "ordinary", embedStacks: 1, embedPower: 10 }
    ]);
    expect(piercing.commands[0]).toMatchObject({
      kind: "authored-crimson-network",
      nodes: expect.arrayContaining([expect.objectContaining({ targetId: 1, nodeCount: 3 })]),
      ignition: expect.objectContaining({ fragmentCount: 4 })
    });

    const scatteredTargets = [0, 1, 2, 3, 4, 5].map((index) => ({
      targetId: 10 + index, x: index * 90, y: 0, healthRatio: 1,
      rank: "ordinary" as const, embedStacks: 1, embedPower: 8
    }));
    const scattered = make(["scattered-furnace-needles"], scatteredTargets);
    expect(scattered.commands[0]).toMatchObject({
      kind: "authored-crimson-network", ignition: expect.objectContaining({ fragmentCount: 6 })
    });

    const volatile = make(["volatile-furnace-core"], [0, 1, 2].map((index) => ({
      targetId: 30 + index, x: index * 55, y: 0, healthRatio: 1,
      rank: "ordinary" as const, embedStacks: 1, embedPower: 8
    })));
    expect(volatile.commands[0]).toMatchObject({
      kind: "authored-crimson-network", ignition: expect.objectContaining({ fragmentCount: 3 })
    });
  });

  it("gives every Crimson R6 branch a distinct death, loop, or compression law", () => {
    const leftover = createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" });
    leftover.mastery.masteryLearnedIds = ["sealed-leftover-needle"];
    const dead = advanceGongfaRuntime(leftover, {
      kind: "enemy-death", targetId: 9, x: 40, y: 0, rank: "ordinary",
      velocityX: 0, velocityY: 0, playerX: 0, playerY: 0, embedStacks: 2, embedPower: 20
    });
    expect(dead.runtime.authored.anchors).toContainEqual(expect.objectContaining({
      kind: "furnace-node", x: 40, remainingMs: 4200
    }));

    const square = [
      { targetId: 1, x: 0, y: 0 }, { targetId: 2, x: 100, y: 0 },
      { targetId: 3, x: 100, y: 100 }, { targetId: 4, x: 0, y: 100 }
    ].map((target) => ({ ...target, healthRatio: 1, rank: "ordinary" as const, embedStacks: 1, embedPower: 8 }));
    const base = createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" });
    base.crimsonFurnace!.networkIgnitionCooldownRemaining = 1000;
    const baseGraph = advanceGongfaRuntime(base, { kind: "tick", deltaMs: 16, nearbyEnemyCount: 4, targets: square });
    const star = createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" });
    star.mastery.masteryLearnedIds = ["star-furnace-resonance"];
    star.crimsonFurnace!.networkIgnitionCooldownRemaining = 1000;
    const starGraph = advanceGongfaRuntime(star, { kind: "tick", deltaMs: 16, nearbyEnemyCount: 4, targets: square });
    const baseLinks = baseGraph.commands[0]?.kind === "authored-crimson-network" ? baseGraph.commands[0].links.length : 0;
    const starLinks = starGraph.commands[0]?.kind === "authored-crimson-network" ? starGraph.commands[0].links.length : 0;
    expect(starLinks).toBeGreaterThan(baseLinks);

    const spread = square.map((target, index) => ({ ...target, x: index * 150, y: 0 }));
    const compressed = createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" });
    compressed.mastery.masteryLearnedIds = ["compressed-furnace"];
    const compressedGraph = advanceGongfaRuntime(compressed, { kind: "tick", deltaMs: 16, nearbyEnemyCount: 4, targets: spread });
    expect(compressedGraph.runtime.crimsonFurnace?.pressure).toBe(0);
  });

  it("Furnace Cascade marks one core per connected furnace and consumes every connected network", () => {
    const runtime = createGongfaRuntime({ gongfaId: "crimson-furnace-sword-art" });
    runtime.mastery.masterySkill2Id = "furnace-cascade";
    const targets = [0, 45, 90, 500, 545, 590].map((x, index) => ({
      targetId: 70 + index, x, y: 0, healthRatio: 1,
      rank: "ordinary" as const, embedStacks: 1, embedPower: 10
    }));
    const result = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 6, targets
    });
    const command = result.commands[0];
    expect(command).toMatchObject({
      kind: "authored-crimson-network",
      ignition: { targetIds: expect.arrayContaining([70, 71, 72, 73, 74, 75]) }
    });
    if (command?.kind !== "authored-crimson-network") throw new Error("missing Crimson network");
    expect(command.nodes.filter((node) => node.core)).toHaveLength(2);
  });

  it("Four Symbols Together launches only a complete four-sword rack", () => {
    const runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });
    const targets = [1, 2, 3, 4].map((targetId) => ({
      targetId, x: 100 + targetId * 25, y: targetId * 8,
      healthRatio: 1, rank: "ordinary" as const
    }));
    const full = planGongfaAttack(runtime, 0, {
      learnedMasteryIds: ["four-symbols-together"], playerX: 0, playerY: 0, targets
    });
    expect(full.filter((command) => command.kind === "authored-yujian-flight")).toHaveLength(4);
    expect(runtime.authored.charges).toBe(0);
    expect(planGongfaAttack(runtime, 1, {
      learnedMasteryIds: ["four-symbols-together"], playerX: 0, playerY: 0, targets
    })).toEqual([]);
  });

  it("Blazing Feather uses a finite non-homing fan with a visibly stronger outer edge", () => {
    const runtime = createGongfaRuntime({ gongfaId: "blazing-feather-art" });
    const [fan] = planGongfaAttack(runtime, 0, {
      playerX: 0, playerY: 0,
      targets: [
        { targetId: 1, x: 70, y: 0, healthRatio: 1, rank: "ordinary" },
        { targetId: 2, x: 200, y: 5, healthRatio: 1, rank: "elite" }
      ]
    });
    expect(fan?.kind).toBe("authored-blazing-feather-fan");
    if (fan?.kind !== "authored-blazing-feather-fan") return;
    const close = fan.targets.find((target) => target.targetId === 1)!;
    const edge = fan.targets.find((target) => target.targetId === 2)!;
    expect(edge.optimal).toBe(true);
    expect(edge.damage).toBeGreaterThan(close.damage * 2);
    expect(runtime.authored.charges).toBe(4);
    expect(runtime.blazingFeather).toBeUndefined();
  });

  it("Blazing Feather R3 and R6 branches change fan geometry or quiver economy", () => {
    const target = [{ targetId: 2, x: 200, y: 0, healthRatio: 1, rank: "elite" as const }];
    const plan = (ids: string[]) => {
      const runtime = createGongfaRuntime({ gongfaId: "blazing-feather-art" });
      const command = planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0, targets: target, learnedMasteryIds: ids })[0];
      return { runtime, command };
    };
    const searing = plan(["searing-quill"]);
    const storm = plan(["feather-storm"]);
    expect(searing.command?.kind === "authored-blazing-feather-fan" &&
      storm.command?.kind === "authored-blazing-feather-fan" && searing.command.arc).toBeLessThan(
        storm.command?.kind === "authored-blazing-feather-fan" ? storm.command.arc : 0
      );
    const endless = createGongfaRuntime({ gongfaId: "blazing-feather-art" });
    advanceGongfaRuntime(endless, { kind: "tick", deltaMs: 1, nearbyEnemyCount: 1,
      learnedMasteryIds: ["endless-plumage"] });
    expect(endless.authored.maxCharges).toBe(5);
    const updated = advanceGongfaRuntime(endless, { kind: "tick", deltaMs: 1, nearbyEnemyCount: 1,
      learnedMasteryIds: ["endless-plumage"] }).runtime;
    expect(updated.authored.maxCharges).toBe(8);
    const swift = applyGongfaImprovement(createGongfaRuntime({ gongfaId: "blazing-feather-art" }), "swift-molt").runtime;
    expect(swift.combat.cooldownMs).toBeLessThan(createGongfaRuntime({ gongfaId: "blazing-feather-art" }).combat.cooldownMs);
  });

  it("Phoenix Horizon requires ideal hits and Brands, chooses one corridor, then empties the quiver", () => {
    const runtime = createGongfaRuntime({ gongfaId: "blazing-feather-art" });
    runtime.mastery.masterySkill2Id = "feather-rain-formation";
    runtime.mastery.masterySkill2CooldownRemaining = 0;
    runtime.authored.cycleCount = 2;
    runtime.authored.anchors.push(
      { kind: "phoenix-brand", x: 170, y: 0, targetId: 1, value: 1 },
      { kind: "phoenix-brand", x: 210, y: 4, targetId: 2, value: 1 }
    );
    const commands = planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0,
      targets: [{ targetId: 3, x: 200, y: 2, healthRatio: 1, rank: "elite" }] });
    const horizon = commands.find((command) => command.kind === "authored-phoenix-horizon");
    expect(horizon?.kind).toBe("authored-phoenix-horizon");
    expect(horizon?.kind === "authored-phoenix-horizon" && horizon.targetIds).toEqual([1, 2, 3]);
    expect(runtime.authored.charges).toBe(0);
    expect(runtime.authored.anchors).toEqual([]);
    expect(commands.some((command) => command.kind === "homing-volley")).toBe(false);
  });

  it("Scarlet Twin Tides uses pair state rather than hit-built Surge", () => {
    const runtime = createGongfaRuntime({ gongfaId: "scarlet-wave-manual" });
    const targets = [{ targetId: 1, x: 120, y: 0, healthRatio: 1, rank: "ordinary" as const }];
    const [left] = planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0, targets });
    expect(left.kind).toBe("authored-scarlet-tides");
    expect(runtime.authored.phase).toBe(1);
    expect(runtime.authored.cycleCount).toBe(0);
    const [right] = planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0, targets });
    expect(right.kind === "authored-scarlet-tides" && right.seam).toBeDefined();
    expect(runtime.authored.phase).toBe(2);
    expect(runtime.authored.cycleCount).toBe(1);
  });

  it("Moonfall builds Syzygy only from a retained enemy's real angular travel", () => {
    const runtime = createGongfaRuntime({ gongfaId: "moonfall-tide-ritual" });
    const initial = [{ targetId: 7, x: 100, y: 0, healthRatio: 1, rank: "ordinary" as const }];
    expect(planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0, targets: initial })[0]?.kind).toBe("authored-moon-orbit");
    let result = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 1, playerX: 0, playerY: 0, targets: initial
    });
    expect(result.runtime.authored.resource).toBe(0);
    result = advanceGongfaRuntime(result.runtime, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
      targets: [{ ...initial[0]!, x: 98, y: 100 }]
    });
    expect(result.runtime.authored.resource).toBeGreaterThan(0);
    const escaped = advanceGongfaRuntime(result.runtime, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
      targets: [{ ...initial[0]!, x: 900, y: 900 }]
    });
    expect(escaped.runtime.authored.resource).toBe(0);
  });

  it("Moonfall R9 resolves with a branch-specific fate instead of a generic blast", () => {
    const runtime = createGongfaRuntime({ gongfaId: "moonfall-tide-ritual" });
    runtime.authored.phase = 1;
    runtime.authored.phaseElapsedMs = 6150;
    runtime.authored.anchors = [
      { kind: "moon", x: 0, y: 0, value: 1, chainId: 0 },
      { kind: "orbiter", x: 100, y: 0, value: 2.4, targetId: 8, angle: 0, chainId: 0 }
    ];
    const result = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
      targets: [{ targetId: 8, x: 0, y: 100, healthRatio: 1, rank: "elite" }],
      learnedMasteryIds: ["flying-star-release"]
    });
    const resolution = result.commands.find((command) => command.kind === "authored-moon-resolution");
    expect(resolution?.fate).toBe("release");
    expect(result.commands.some((command) => command.kind === "ritual-impact")).toBe(false);
  });

  it("Verdant Ring compiles all 27 ordered behavior glyphs into predictable shape, motion, and payoff", () => {
    const glyphs = ["root", "leaf", "thorn"] as const;
    const expectedShape = { root: "root-circle", leaf: "leaf-route", thorn: "thorn-triangle" } as const;
    const expectedMotion = { root: "fixed", leaf: "traveling", thorn: "contracting" } as const;
    const expectedPayoff = { root: "bind", leaf: "repeat", thorn: "damage" } as const;
    let combinations = 0;
    for (const first of glyphs) for (const second of glyphs) for (const third of glyphs) {
      let runtime = createGongfaRuntime({ gongfaId: "verdant-ring-scripture" });
      runtime.authored.anchors = [
        { kind: "glyph", glyph: first, x: 0, y: 0, value: 1 },
        { kind: "glyph", glyph: second, x: 0, y: 0, value: 1 }
      ];
      runtime.authored.phaseElapsedMs = 899;
      if (third === "thorn") runtime = advanceGongfaRuntime(runtime, { kind: "evade" }).runtime;
      const result = advanceGongfaRuntime(runtime, {
        kind: "tick", deltaMs: 1, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
        movementDistance: third === "leaf" ? 30 : 0,
        targets: [{ targetId: 3, x: 90, y: 0, healthRatio: 1, rank: "elite" }]
      });
      const invocation = result.commands.find((command) => command.kind === "authored-glyph-invocation");
      expect(invocation).toMatchObject({
        glyphs: [first, second, third], shape: expectedShape[first],
        motion: expectedMotion[second], payoff: expectedPayoff[third]
      });
      combinations += 1;
    }
    expect(combinations).toBe(27);
    const authored = createGongfaRuntime({ gongfaId: "verdant-ring-scripture" });
    expect(authored.surge).toBeUndefined();
    expect(planGongfaAttack(authored, 0)).toEqual([]);
  });

  it("Verdant Ring transformations alter sequence rules rather than generic hit stacks", () => {
    const invoke = (sequence: ["root" | "leaf" | "thorn", "root" | "leaf" | "thorn", "root" | "leaf" | "thorn"], learnedMasteryIds: string[]) => {
      const runtime = createGongfaRuntime({ gongfaId: "verdant-ring-scripture" });
      runtime.authored.anchors = sequence.map((glyph) => ({ kind: "glyph" as const, glyph, x: 0, y: 0, value: 1 }));
      runtime.authored.phaseElapsedMs = 899;
      runtime.authored.anchors.pop();
      if (sequence[2] === "thorn") runtime.authored.targetLedger[-90] = 100;
      return advanceGongfaRuntime(runtime, {
        kind: "tick", deltaMs: 1, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
        movementDistance: sequence[2] === "leaf" ? 30 : 0, learnedMasteryIds,
        targets: [{ targetId: 4, x: 80, y: 0, healthRatio: 1, rank: "ordinary" }]
      }).commands.find((command) => command.kind === "authored-glyph-invocation");
    };
    const plainSame = invoke(["root", "root", "root"], []);
    const specializedSame = invoke(["root", "root", "root"], ["single-line-specialization"]);
    expect(specializedSame?.power).toBeGreaterThan(plainSame?.power ?? 0);
    const concord = invoke(["root", "leaf", "thorn"], ["three-talents-concord"]);
    expect(concord?.power).toBeGreaterThan(1);
    const aba = invoke(["leaf", "thorn", "leaf"], ["first-last-generation"]);
    expect(aba?.repeatCount).toBeGreaterThan(2);
    const thornFinal = invoke(["leaf", "leaf", "thorn"], ["thorn-scripture-hundred-calamities"]);
    expect(thornFinal?.payoff).toBe("damage");
    expect(thornFinal?.power).toBeGreaterThan(1);
  });

  it("Drifting Frost records distinct weak points and immediately reverses the exact five-point zigzag", () => {
    const runtime = createGongfaRuntime({ gongfaId: "drifting-frost-needle" });
    runtime.mastery.masterySkill2Id = "mirror-needle-constellation";
    runtime.mastery.masterySkill2CooldownRemaining = 0;
    runtime.authored.anchors.push(
      { kind: "weakpoint", x: 60, y: 0, targetId: 1, value: 1 },
      { kind: "weakpoint", x: 100, y: 40, targetId: 2, value: 1 },
      { kind: "weakpoint", x: 140, y: -20, targetId: 3, value: 1 },
      { kind: "weakpoint", x: 180, y: 35, targetId: 4, value: 1 }
    );
    const commands = planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0,
      targets: [{ targetId: 5, x: 220, y: -15, healthRatio: 1, rank: "elite" }] });
    const reverse = commands.find((command) => command.kind === "authored-reverse-winter-thread");
    expect(reverse?.kind === "authored-reverse-winter-thread" &&
      reverse.points.map((point) => point.targetId)).toEqual([5, 4, 3, 2, 1]);
    expect(reverse?.kind === "authored-reverse-winter-thread" &&
      reverse.points.at(-1)!.damage).toBeGreaterThan(
        reverse?.kind === "authored-reverse-winter-thread" ? reverse.points[0]!.damage : Infinity
      );
    expect(runtime.authored.anchors).toEqual([]);
    expect(runtime.surge).toBeUndefined();
    expect(commands.some((command) => command.kind === "homing-volley")).toBe(false);
  });

  it("Drifting Frost R3 routes are structurally different", () => {
    const targets = [1, 2, 3, 4].map((targetId, index) => ({
      targetId, x: 70 + index * 55, y: index % 2 ? 35 : 0, healthRatio: 1,
      rank: "ordinary" as const
    }));
    const cast = (learnedMasteryIds: string[]) => planGongfaAttack(
      createGongfaRuntime({ gongfaId: "drifting-frost-needle" }), 0,
      { playerX: 0, playerY: 0, targets, learnedMasteryIds }
    )[0];
    const lone = cast(["army-breaking-lone-needle"]);
    const linked = cast(["linked-pearl-thread"]);
    const swift = cast(["swift-frost-point"]);
    expect(lone?.kind === "authored-frost-needle-chain" && lone.points).toHaveLength(1);
    expect(linked?.kind === "authored-frost-needle-chain" && linked.points).toHaveLength(4);
    expect(swift?.kind === "authored-frost-needle-chain" && swift.points.length).toBeLessThan(4);
  });

  it("Heavenly Crown reduces the rack and Void-Step recalls existing swords without duplicates", () => {
    const runtime = createGongfaRuntime({ gongfaId: "yujian-jue" });
    const targets = [{ targetId: 1, x: 150, y: 0, healthRatio: 1, rank: "ordinary" as const }];
    planGongfaAttack(runtime, 0, {
      learnedMasteryIds: ["heavenly-sword-crown"], playerX: 0, playerY: 0, targets
    });
    expect(runtime.authored.maxCharges).toBe(3);
    expect(runtime.authored.anchors.filter((anchor) => anchor.kind === "sword")).toHaveLength(1);

    const evaded = advanceGongfaRuntime(runtime, {
      kind: "evade", playerX: 10, playerY: 0,
      learnedMasteryIds: ["void-step-recall"]
    });
    expect(evaded.commands).toEqual([expect.objectContaining({
      kind: "authored-myriad-swords-return",
      targetIds: [],
      damage: 0
    })]);
    expect(evaded.runtime.authored.anchors.filter((anchor) => anchor.kind === "sword")).toHaveLength(1);
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

  it("recalls the Myriad Beast formation without attacking while the player stands still", () => {
    const runtime = createGongfaRuntime({ gongfaId: "myriad-beast-grove" });
    const result = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 1300, nearbyEnemyCount: 2, playerX: 90, playerY: 40,
      isMoving: false,
      targets: [{ targetId: 3, x: 150, y: 40, healthRatio: 1, rank: "ordinary" }]
    });
    expect(result.commands.filter((command) => command.kind === "authored-beast-action")).toEqual([]);
    expect(result.runtime.authored.anchors.every((beast) => beast.targetId === undefined)).toBe(true);
  });

  it("makes Deer and Black Tortoise protection real while White Ape gives that defense up", () => {
    const incoming = (form: "verdant-deer" | "black-tortoise" | "white-ape") => {
      const runtime = createGongfaRuntime({ gongfaId: "myriad-beast-grove" });
      const protector = runtime.authored.anchors.find((beast) =>
        form === "black-tortoise" ? beast.beastSpecies === "boar" : beast.beastSpecies === "deer"
      )!;
      protector.beastForm = form;
      const result = advanceGongfaRuntime(runtime, {
        kind: "incoming-damage", amount: 100, sourceDistance: 80
      });
      return result.commands.find((command) => command.kind === "incoming-damage")?.finalDamage;
    };
    expect(incoming("verdant-deer")).toBe(86);
    expect(incoming("black-tortoise")).toBe(70);
    expect(incoming("white-ape")).toBe(100);
  });

  it("enforces the three distinct Myriad Beast cooperation laws", () => {
    const resolveMarkedKill = (runtime: GongfaRuntime, targetId: number, species: Array<"boar" | "fox" | "deer">, learnedMasteryIds: string[]) => {
      for (const mark of species) runtime = advanceGongfaRuntime(runtime, {
        kind: "authored-beast-assist", targetId, species: mark, learnedMasteryIds
      }).runtime;
      return advanceGongfaRuntime(runtime, {
        kind: "enemy-death", targetId, x: 0, y: 0, rank: "ordinary",
        velocityX: 0, velocityY: 0, playerX: 0, playerY: 0, learnedMasteryIds
      }).runtime;
    };
    const two = resolveMarkedKill(createGongfaRuntime({ gongfaId: "myriad-beast-grove" }), 81, ["boar", "fox"], ["two-beasts-aid-each-other"]);
    expect(two.authored.resource).toBeCloseTo(0.22 / 0.7);
    const three = resolveMarkedKill(createGongfaRuntime({ gongfaId: "myriad-beast-grove" }), 82, ["boar", "fox", "deer"], ["three-spirits-hunt-together"]);
    expect(three.authored.resource).toBeCloseTo(0.68);
    let rotating = resolveMarkedKill(createGongfaRuntime({ gongfaId: "myriad-beast-grove" }), 83, ["boar", "fox"], ["unending-rotating-hunt"]);
    const firstGain = rotating.authored.resource;
    rotating = resolveMarkedKill(rotating, 84, ["boar", "fox"], ["unending-rotating-hunt"]);
    expect(rotating.authored.resource).toBe(firstGain);
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

  it("gives the Black Tortoise and White Ape replacement jobs distinct action contracts", () => {
    const actionFor = (masteryId: string, species: "boar" | "deer") => {
      const runtime = createGongfaRuntime({ gongfaId: "myriad-beast-grove" });
      return advanceGongfaRuntime(runtime, {
        kind: "tick", deltaMs: 1300, nearbyEnemyCount: 2, playerX: 0, playerY: 0,
        isMoving: true, learnedMasteryIds: [masteryId],
        targets: [
          { targetId: 11, x: 100, y: 0, healthRatio: 1, rank: "ordinary" },
          { targetId: 12, x: 140, y: 30, healthRatio: 1, rank: "elite" }
        ]
      }).commands.find((command) => command.kind === "authored-beast-action" && command.species === species);
    };
    const tortoise = actionFor("black-tortoise-guards-the-grove", "boar");
    const ape = actionFor("white-ape-calls-the-pack", "deer");
    expect(tortoise?.form).toBe("black-tortoise");
    expect(tortoise?.radius).toBeLessThan(ape?.radius ?? 0);
    expect(ape?.form).toBe("white-ape");
    expect(ape?.rootMs).toBe(0);
  });

  it("makes Ancestors Return revive the missing species and establish a real protection window", () => {
    const runtime = createGongfaRuntime({ gongfaId: "myriad-beast-grove" });
    runtime.authored.resource = 1;
    const fox = runtime.authored.anchors.find((anchor) => anchor.beastSpecies === "fox")!;
    fox.beastState = "downed";
    fox.value = 0;
    const result = advanceGongfaRuntime(runtime, {
      kind: "skill2", skill2Id: "myriad-beast-stampede",
      targets: [{ targetId: 13, x: 140, y: 0, healthRatio: 1, rank: "boss" }],
      learnedMasteryIds: ["ancestors-return-to-the-grove"]
    });
    const ancestor = result.commands.find((command) => command.kind === "authored-beast-ancestors");
    expect(ancestor?.fate).toBe("return-grove");
    expect(result.runtime.authored.anchors.every((beast) => beast.beastState === "living")).toBe(true);
    expect(result.runtime.authored.targetLedger[-45]).toBe(4200);
    const guarded = advanceGongfaRuntime(result.runtime, {
      kind: "incoming-damage", amount: 100, sourceDistance: 400,
      learnedMasteryIds: ["ancestors-return-to-the-grove"]
    });
    expect(guarded.commands.find((command) => command.kind === "incoming-damage")?.finalDamage).toBe(55);
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
    runtime.mastery.masterySkill2Id = "world-tree-incarnation";
    runtime.mastery.masterySkill2CooldownRemaining = 0;
    const bypass = advanceGongfaRuntime(runtime, {
      kind: "skill2", skill2Id: "world-tree-incarnation",
      learnedMasteryIds: ["world-sheltering-canopy"]
    });
    expect(bypass.runtime.authored.phase).toBe(1);
    expect(bypass.commands).toHaveLength(0);
    const result = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 900, nearbyEnemyCount: 1, isMoving: false,
      playerX: 0, playerY: 0,
      targets: [{ targetId: 70, x: 120, y: 0, healthRatio: 1, rank: "elite" }],
      learnedMasteryIds: ["world-sheltering-canopy"]
    });
    const cycle = result.commands.find((command) => command.kind === "authored-ancient-tree-cycle");
    expect(result.runtime.authored.phase).toBe(3);
    expect(cycle?.worldTree).toBe(true);
    expect(cycle?.law).toBe("sheltering");
    expect(cycle?.clearProjectiles).toBe(true);
    expect(cycle?.masteryCast?.skill2Id).toBe("world-tree-incarnation");
  });

  it("separates Ancient Tree root, rotating branch, and farthest canopy targets", () => {
    const runtime = createGongfaRuntime({ gongfaId: "ancient-tree-body-art" });
    runtime.authored.phase = 1;
    runtime.authored.charges = 2;
    const result = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 3, isMoving: false,
      playerX: 0, playerY: 0,
      targets: [
        { targetId: 1, x: 40, y: 0, healthRatio: 1, rank: "ordinary" },
        { targetId: 2, x: 150, y: 0, healthRatio: 1, rank: "ordinary" },
        { targetId: 3, x: 220, y: 0, healthRatio: 1, rank: "elite" }
      ]
    });
    const cycle = result.commands.find((command) => command.kind === "authored-ancient-tree-cycle");
    expect(cycle?.rootTargetIds).toEqual([1]);
    expect(cycle?.branchTargetIds).toContain(2);
    expect(cycle?.canopyTargetIds).toEqual([3]);
    expect(cycle?.activeBranchSector).toBe(0);
    expect(cycle?.rootDamage).not.toBe(cycle?.canopyDamage);
  });

  it("makes Ancient Tree forms and World-Tree laws mechanically distinct", () => {
    const formCycle = (learnedMasteryIds: string[]) => {
      const runtime = createGongfaRuntime({ gongfaId: "ancient-tree-body-art" });
      runtime.authored.phase = 1;
      runtime.authored.charges = 2;
      return advanceGongfaRuntime(runtime, {
        kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: false,
        playerX: 0, playerY: 0,
        targets: [{ targetId: 1, x: 40, y: 0, healthRatio: 1, rank: "ordinary" }],
        learnedMasteryIds
      }).commands.find((command) => command.kind === "authored-ancient-tree-cycle");
    };
    const banyan = formCycle(["great-rooted-banyan"]);
    const ironCrown = formCycle(["iron-crowned-divine-tree"]);
    const fusang = formCycle(["spirit-fruit-fusang"]);
    expect(banyan!.rootRadius).toBeGreaterThan(ironCrown!.rootRadius);
    expect(ironCrown!.canopyDamage).toBeGreaterThan(ironCrown!.rootDamage);
    expect(fusang!.canopyRadius).toBeLessThan(banyan!.canopyRadius);
    expect(fusang!.heal).toBeGreaterThan(0);

    const lawCycle = (law: string) => {
      const runtime = createGongfaRuntime({ gongfaId: "ancient-tree-body-art" });
      runtime.authored.phase = 1;
      runtime.authored.charges = runtime.authored.maxCharges;
      runtime.mastery.masterySkill2Id = "world-tree-incarnation";
      return advanceGongfaRuntime(runtime, {
        kind: "tick", deltaMs: 900, nearbyEnemyCount: 1, isMoving: false,
        playerX: 0, playerY: 0,
        targets: [
          { targetId: 11, x: 800, y: 0, healthRatio: 1, rank: "ordinary" },
          { targetId: 12, x: 180, y: 0, healthRatio: 1, rank: "elite" },
          { targetId: 13, x: 700, y: 0, healthRatio: 1, rank: "boss" }
        ],
        learnedMasteryIds: [law]
      }).commands.find((command) => command.kind === "authored-ancient-tree-cycle");
    };
    const manyRoots = lawCycle("myriad-roots-pervade-the-realm");
    const oneTree = lawCycle("one-tree-upholds-heaven");
    const shelter = lawCycle("world-sheltering-canopy");
    expect(manyRoots?.rootTargetIds).toEqual([11, 13]);
    expect(oneTree?.rootTargetIds).toEqual([13]);
    expect(oneTree?.branchTargetIds).toEqual([13]);
    expect(oneTree?.canopyTargetIds).toEqual([13]);
    expect(shelter?.clearProjectiles).toBe(true);
    expect(shelter?.heal).toBeGreaterThan(0);
    expect(shelter!.rootDamage).toBeLessThan(manyRoots!.rootDamage);
  });

  it("spends a Hollow Trunk ring only on fatal damage and cannot regrow it until uprooting", () => {
    const runtime = createGongfaRuntime({ gongfaId: "ancient-tree-body-art" });
    runtime.authored.phase = 1;
    runtime.authored.charges = 2;
    const nonFatal = advanceGongfaRuntime(runtime, {
      kind: "incoming-damage", amount: 20, currentHealth: 100, healthRatio: 0.05,
      learnedMasteryIds: ["hollow-trunk-tribulation"]
    });
    expect(nonFatal.runtime.authored.charges).toBe(2);
    expect(nonFatal.commands.find((command) => command.kind === "incoming-damage")?.finalDamage).toBe(20);
    const fatal = advanceGongfaRuntime(nonFatal.runtime, {
      kind: "incoming-damage", amount: 100, currentHealth: 100,
      learnedMasteryIds: ["hollow-trunk-tribulation"]
    });
    expect(fatal.runtime.authored.charges).toBe(1);
    expect(fatal.runtime.authored.targetLedger[-64]).toBe(1);
    expect(fatal.commands.find((command) => command.kind === "incoming-damage")?.finalDamage).toBe(0);
    const regrowth = advanceGongfaRuntime(fatal.runtime, {
      kind: "tick", deltaMs: 10000, nearbyEnemyCount: 1, isMoving: false,
      playerX: 0, playerY: 0,
      learnedMasteryIds: ["hollow-trunk-tribulation"]
    });
    expect(regrowth.runtime.authored.charges).toBe(4);
  });

  it("builds Heavenfall Mass from straight travel and sheds it on a sharp turn", () => {
    let runtime = createGongfaRuntime({ gongfaId: "heavenfall-body-art" });
    runtime.authored.phase = 1;
    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 1000, nearbyEnemyCount: 1, isMoving: true,
      movementAngle: 0, movementDistance: 200, playerX: 0, playerY: 0
    }).runtime;
    expect(runtime.authored.resource).toBeCloseTo(0.2);
    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: true,
      movementAngle: Math.PI, movementDistance: 3, playerX: 0, playerY: 0,
      learnedMasteryIds: ["no-return-advance"]
    }).runtime;
    expect(runtime.authored.resource).toBe(0);
  });

  it("automatically rises, previews, then spends Heavenfall Mass on the recorded return route", () => {
    const runtime = createGongfaRuntime({ gongfaId: "heavenfall-body-art" });
    runtime.authored.phase = 1;
    runtime.authored.resource = 1;
    runtime.authored.phaseElapsedMs = 6000;
    runtime.authored.lastMovementAngle = Math.PI / 2;
    runtime.authored.targetLedger[-70] = Math.PI / 2;
    runtime.authored.targetLedger[-73] = -80;
    runtime.authored.targetLedger[-74] = 20;
    runtime.mastery.masterySkill2Id = "star-breaking-descent";
    runtime.mastery.masterySkill2CooldownRemaining = 0;
    let result = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: true,
      movementAngle: Math.PI / 2, playerX: 0, playerY: 0,
      learnedMasteryIds: ["reverse-star-return"]
    });
    expect(result.runtime.authored.phase).toBe(2);
    expect(result.commands.some((command) => command.kind === "authored-star-descent")).toBe(false);
    result = advanceGongfaRuntime(result.runtime, {
      kind: "tick", deltaMs: 760, nearbyEnemyCount: 1, isMoving: true,
      movementAngle: Math.PI / 2, playerX: 0, playerY: 10,
      learnedMasteryIds: ["reverse-star-return"]
    });
    const descent = result.commands.find((command) => command.kind === "authored-star-descent");
    expect(descent?.angle).toBe(Math.PI / 2);
    expect(descent?.fate).toBe("reverse-return");
    expect(descent?.returnX).toBe(-80);
    expect(descent?.returnY).toBe(20);
    expect(result.runtime.authored.resource).toBe(0);
    expect(result.runtime.authored.phase).toBe(0);
  });

  it("does not let a direct Skill 2 event bypass Heavenfall movement commitment", () => {
    const runtime = createGongfaRuntime({ gongfaId: "heavenfall-body-art" });
    runtime.authored.phase = 1;
    runtime.authored.resource = 1;
    const result = advanceGongfaRuntime(runtime, {
      kind: "skill2", skill2Id: "star-breaking-descent",
      learnedMasteryIds: ["heavenfall-crater"]
    });
    expect(result.commands).toEqual([]);
    expect(result.runtime.authored.phase).toBe(1);
  });

  it("makes Heavenfall ordinary and hard collisions visibly cost Mass unless the road-opening branch preserves it", () => {
    const collide = (learnedMasteryIds: string[], rank: "ordinary" | "elite") => {
      const runtime = createGongfaRuntime({ gongfaId: "heavenfall-body-art" });
      runtime.authored.phase = 1;
      runtime.authored.resource = 0.7;
      runtime.authored.targetLedger[-70] = 0;
      return advanceGongfaRuntime(runtime, {
        kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: true,
        movementAngle: 0, playerX: 0, playerY: 0, learnedMasteryIds,
        targets: [{ targetId: 72, x: 10, y: 0, healthRatio: 1, rank }]
      }).runtime;
    };
    expect(collide([], "ordinary").authored.resource).toBeLessThan(0.7);
    const road = collide(["iron-body-opens-the-road"], "ordinary");
    expect(road.authored.resource).toBeGreaterThan(0.7);
    expect(road.authored.targetLedger[-72]).toBe(360);
    expect(collide([], "elite").authored.resource).toBeLessThan(0.4);
  });

  it("gives the three Heavenfall body choices different silhouettes and contact power", () => {
    const bodyFor = (masteryId: string) => {
      const runtime = createGongfaRuntime({ gongfaId: "heavenfall-body-art" });
      runtime.authored.phase = 1;
      runtime.authored.resource = 0.4;
      runtime.authored.targetLedger[-70] = 0;
      return advanceGongfaRuntime(runtime, {
        kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: true,
        movementAngle: 0, playerX: 0, playerY: 0, learnedMasteryIds: [masteryId],
        targets: [{ targetId: 73, x: 10, y: 0, healthRatio: 1, rank: "ordinary" }]
      }).commands.find((command) => command.kind === "authored-heavenfall-body");
    };
    const piercing = bodyFor("star-piercing-iron-body");
    const giant = bodyFor("heavenfall-giant-body");
    const light = bodyFor("wandering-star-light-body");
    expect(giant?.radius).toBeGreaterThan(light?.radius ?? 0);
    expect(light?.radius).toBeGreaterThan(piercing?.radius ?? 0);
    expect(giant?.damage).toBeGreaterThan(piercing?.damage ?? 0);
    expect(piercing?.damage).toBeGreaterThan(light?.damage ?? 0);
  });

  it("writes Heaven-Sundering Mandate only from complete double judgments", () => {
    let runtime = createGongfaRuntime({ gongfaId: "heaven-sundering-edict" });
    runtime = advanceGongfaRuntime(runtime, {
      kind: "authored-edict-result", doubleHits: 0, partialHits: 3, eliteDoubleHits: 0,
      lineQuality: 2, lines: [{ x: 0, y: 0, angle: 0, length: 460 }]
    }).runtime;
    expect(runtime.authored.resource).toBe(0);
    runtime = advanceGongfaRuntime(runtime, {
      kind: "authored-edict-result", doubleHits: 2, partialHits: 0, eliteDoubleHits: 1,
      lineQuality: 4, lines: [{ x: 0, y: 0, angle: Math.PI / 4, length: 460 }]
    }).runtime;
    expect(runtime.authored.resource).toBeCloseTo(0.36);
    expect(runtime.authored.anchors[0]?.angle).toBe(Math.PI / 4);
  });

  it("extends retained Heaven-Sundering records without rotating them", () => {
    const runtime = createGongfaRuntime({ gongfaId: "heaven-sundering-edict" });
    runtime.authored.resource = 1;
    runtime.authored.anchors.push({ kind: "trail", x: 10, y: 20, angle: 0.7, value: 5, maxValue: 500 });
    const result = advanceGongfaRuntime(runtime, {
      kind: "skill2", skill2Id: "supreme-sundering-decree",
      targets: [{ targetId: 1, x: 200, y: 100, healthRatio: 1, rank: "elite" }],
      learnedMasteryIds: ["heaven-moving-amendment"]
    });
    const decree = result.commands.find((command) => command.kind === "authored-sundering-edict");
    expect(decree?.lines[0]).toMatchObject({ x: 200, y: 100, angle: 0.7, length: 1200 });
    expect(result.runtime.authored.anchors).toHaveLength(0);
    expect(result.runtime.authored.resource).toBe(0);
  });

  it("grows Nine-Sun Zenith only outside a committed fixed seal", () => {
    let runtime = createGongfaRuntime({ gongfaId: "nine-sun-calamity-seal" });
    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 1000, nearbyEnemyCount: 1
    }).runtime;
    expect(runtime.authored.resource).toBeCloseTo(0.055);
    runtime.authored.phase = 1;
    const charging = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 1000, nearbyEnemyCount: 1
    }).runtime;
    expect(charging.authored.resource).toBeCloseTo(0.055);
  });

  it("fixes a Nine-Sun seal at the target's predicted future position", () => {
    const runtime = createGongfaRuntime({ gongfaId: "nine-sun-calamity-seal" });
    const [command] = planGongfaAttack(runtime, 0, {
      targets: [{
        targetId: 1, x: 100, y: 50, velocityX: 20, velocityY: -10,
        healthRatio: 1, rank: "elite"
      }]
    });
    expect(command).toMatchObject({
      kind: "authored-falling-sun",
      seals: [{ x: 129, y: 35.5, delayMs: 1450 }]
    });
  });

  it("marks Dark-Sun's long telegraph as a visibly shrinking center", () => {
    const runtime = createGongfaRuntime({ gongfaId: "nine-sun-calamity-seal" });
    const [command] = planGongfaAttack(runtime, 0, {
      learnedMasteryIds: ["dark-sun-calamity"],
      targets: [{ targetId: 1, x: 100, y: 50, healthRatio: 1, rank: "elite" }]
    });
    expect(command).toMatchObject({
      kind: "authored-falling-sun", shrinkingCenter: true,
      seals: [{ x: 100, y: 50, delayMs: 2100 }]
    });
  });

  it("turns a Nine-Sun miss into only a dim Returning Afterglow omen", () => {
    const runtime = createGongfaRuntime({ gongfaId: "nine-sun-calamity-seal" });
    runtime.authored.phase = 1;
    const result = advanceGongfaRuntime(runtime, {
      kind: "authored-sun-result", hitCount: 0, centerHits: 0, missed: true,
      supreme: false, learnedMasteryIds: ["returning-afterglow"]
    });
    expect(result.runtime.authored.phase).toBe(0);
    expect(result.runtime.authored.charges).toBe(1);
    expect(result.runtime.authored.secondaryResource).toBe(1);
  });

  it("condenses nine visible omens into one fixed Nine-Suns impact", () => {
    const runtime = createGongfaRuntime({ gongfaId: "nine-sun-calamity-seal" });
    runtime.authored.charges = 9;
    const result = advanceGongfaRuntime(runtime, {
      kind: "skill2", skill2Id: "heavenly-sun-descent",
      targets: [{
        targetId: 4, x: 160, y: -40, velocityX: 10, velocityY: 5,
        healthRatio: 1, rank: "boss"
      }]
    });
    const sun = result.commands.find((command) => command.kind === "authored-falling-sun");
    expect(sun?.seals).toEqual([{ x: 184, y: -28, delayMs: 2400 }]);
    expect(sun?.supreme).toBe(true);
  });
});
