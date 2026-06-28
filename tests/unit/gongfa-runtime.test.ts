import { describe, expect, it } from "vitest";
import { gongfaConfigs, type GongfaId } from "../../src/data/gongfa";
import {
  advanceGongfaRuntimeForProjectileHit,
  advanceGongfaRuntime,
  applyGongfaImprovement,
  createGongfaRuntime,
  createGongfaRuntimeFromCheckpoint,
  galeStepSeveranceCorridor,
  ironWakeWall,
  reboundingEdgeBlade,
  getCrimsonEmbedThreshold,
  getAuthoredSkill2Plan,
  getGongfaProjectileHitMode,
  getGongfaRuntimeTickThreatRadius,
  planGongfaAttack,
  projectGongfaRuntimeCheckpoint,
  selectCrimsonFurnaceTargetIndexes,
  splitGongfaImprovementReplayIds
} from "../../src/logic/gongfaRuntime";
import { getRank10Skill2Id } from "../../src/logic/mastery";

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
    expect(getAuthoredSkill2Plan("feather-rain-formation")?.trigger).toBe("timed");
    expect(getAuthoredSkill2Plan("missing-skill-2")).toBeUndefined();
  });

  it("casts every declared rank-10 Skill 2 through the runtime public interface", () => {
    (Object.keys(gongfaConfigs) as GongfaId[]).forEach((gongfaId) => {
      const skill2Id = getRank10Skill2Id(gongfaId);
      const plan = getAuthoredSkill2Plan(skill2Id);
      expect(plan, `${gongfaId} declares unsupported Skill 2 ${skill2Id}`).toBeDefined();

      const runtime = createGongfaRuntime({ gongfaId });
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
                skill2Id
              });

      const castCommands = result.commands.filter((command) => "masteryCast" in command);
      expect(castCommands, `${skill2Id} did not record a successful cast`).toHaveLength(1);
      expect(castCommands[0]?.masteryCast.skill2Id).toBe(skill2Id);
      expect(
        result.commands.some((command) => command.kind !== "mastery-skill2-cast"),
        `${skill2Id} did not produce an observable effect command`
      ).toBe(true);
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
      skill2Id: "returning-sword-formation"
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

    expect(secondHit.commands).toEqual([
      {
        kind: "apply-target-damage",
        targetId: 10,
        amount: 9,
        source: "execution-seal"
      }
    ]);
    expect(secondHit.runtime.yujian).toMatchObject({
      executionSealTriggers: 1,
      swordBloomTriggers: 1,
      executionSealStacksByTarget: { 10: 2 }
    });
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
        masteryCast: {
          skill2Id: "blade-shell-rebound",
          cooldownMs: 3000
        }
      }
    ]);
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
    expect(sharperRetaliation.combat.retaliationDamage).toBe(16);
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
      skill2Id: "furnace-cascade"
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
});
