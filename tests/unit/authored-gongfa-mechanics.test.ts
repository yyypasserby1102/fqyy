import { describe, expect, it } from "vitest";
import { gongfaConfigs, type GongfaId } from "../../src/data/gongfa";
import {
  authoredGongfaMechanicList,
  authoredGongfaMechanics,
  createAuthoredGongfaRuntimeState
} from "../../src/data/authoredGongfaMechanics";
import {
  advanceGongfaRuntime,
  createGongfaCollectionFromCheckpoint,
  createGongfaCollectionRuntime,
  createGongfaRuntime,
  learnGongfa,
  planGongfaAttack,
  projectGongfaCollectionCheckpoint
} from "../../src/logic/gongfaRuntime";

describe("approved Gongfa mechanic contracts", () => {
  it("defines one authored contract for every playable Gongfa", () => {
    const ids = Object.keys(gongfaConfigs) as GongfaId[];
    expect(authoredGongfaMechanicList).toHaveLength(25);
    expect(new Set(authoredGongfaMechanicList.map((spec) => spec.gongfaId))).toEqual(new Set(ids));
    for (const id of ids) {
      expect(authoredGongfaMechanics[id].gongfaId).toBe(id);
      expect(createAuthoredGongfaRuntimeState(id).mechanicId).toBe(authoredGongfaMechanics[id].mechanicId);
    }
  });

  it("does not collapse any two Gongfa onto the same mechanic or resource engine", () => {
    expect(new Set(authoredGongfaMechanicList.map((spec) => spec.mechanicId)).size).toBe(25);
    expect(new Set(authoredGongfaMechanicList.map((spec) => spec.resourceSource)).size).toBe(25);
    expect(new Set(authoredGongfaMechanicList.map((spec) => spec.playerLever)).size).toBe(25);
    expect(new Set(authoredGongfaMechanicList.map((spec) => spec.spatialShape)).size).toBe(25);
  });

  it("keeps automatic combat and forbids the old generic hit-stack-decay loop", () => {
    for (const spec of authoredGongfaMechanicList) {
      expect(spec.manualAim).toBe(false);
      expect(spec.resourceSource).not.toMatch(/generic|hit-stack|hits-build/);
      expect(spec.failureCondition.length).toBeGreaterThan(24);
      expect(spec.capstoneRule.length).toBeGreaterThan(24);
    }
  });

  it("gives every mechanic an explicit bounded balance and visual envelope", () => {
    for (const spec of authoredGongfaMechanicList) {
      expect(spec.balance.damage).toBeGreaterThanOrEqual(0.8);
      expect(spec.balance.damage).toBeLessThanOrEqual(1.2);
      expect(spec.balance.survival).toBeGreaterThanOrEqual(0.6);
      expect(spec.balance.survival).toBeLessThanOrEqual(1.25);
      expect(spec.balance.control).toBeGreaterThanOrEqual(0.6);
      expect(spec.balance.control).toBeLessThanOrEqual(1.2);
      expect(spec.balance.payoffSeconds).toBeGreaterThanOrEqual(7);
      expect(spec.balance.payoffSeconds).toBeLessThanOrEqual(18);
      expect(spec.balance.objectBudget).toBeGreaterThan(0);
      expect(`${spec.visual.geometry}:${spec.visual.motion}:${spec.visual.silhouette}`).not.toBe("::");
    }
  });

  it("collects ranked corpse souls by position and consumes one finite wraith crossing", () => {
    let runtime = createGongfaRuntime({ gongfaId: "mist-wraith-canon" });
    runtime = advanceGongfaRuntime(runtime, {
      kind: "enemy-death", targetId: 7, x: 40, y: 0, rank: "elite",
      velocityX: 0, velocityY: 0, playerX: 0, playerY: 0
    }).runtime;
    expect(runtime.authored.anchors).toEqual([
      expect.objectContaining({ kind: "corpse-soul", value: 2, remainingMs: 12_000 })
    ]);

    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 1, isMoving: true,
      movementDistance: 12, movementAngle: 0, playerX: 20, playerY: 0, targets: []
    }).runtime;
    expect(runtime.authored.anchors[0]).toMatchObject({ kind: "stored-soul", value: 2 });
    expect(runtime.authored.charges).toBe(1);

    const [crossing] = planGongfaAttack(runtime, 0);
    expect(crossing).toMatchObject({
      kind: "authored-line-strike",
      style: "mist-wraith-crossing",
      damage: runtime.combat.damage * 2
    });
    expect(runtime.authored.charges).toBe(0);
    expect(runtime.authored.anchors).toHaveLength(0);
  });

  it("binds one grave sword to each corpse and raises it once for a later trespasser", () => {
    let runtime = createGongfaRuntime({ gongfaId: "sword-burial-formation" });
    runtime = advanceGongfaRuntime(runtime, {
      kind: "enemy-death", targetId: 9, x: 80, y: 20, rank: "ordinary",
      velocityX: 100, velocityY: 0, playerX: 0, playerY: 0
    }).runtime;
    expect(runtime.authored.anchors).toEqual([
      expect.objectContaining({ kind: "grave-sword", x: 80, y: 20, angle: 0 })
    ]);

    const triggered = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
      targets: [{ targetId: 10, x: 82, y: 22, healthRatio: 1, rank: "ordinary" }]
    });
    expect(triggered.commands).toEqual([
      expect.objectContaining({ kind: "authored-line-strike", style: "grave-sword-rise", angle: 0 })
    ]);
    expect(triggered.runtime.authored.anchors).toHaveLength(0);
    expect(triggered.runtime.authored.charges).toBe(0);
  });

  it("spends the entire stored-soul procession on its selected capstone route", () => {
    const runtime = createGongfaRuntime({ gongfaId: "mist-wraith-canon" });
    runtime.authored.anchors.push(
      { kind: "stored-soul", x: 10, y: 0, value: 1 },
      { kind: "stored-soul", x: 20, y: 0, value: 2 }
    );
    runtime.authored.charges = 2;
    const result = advanceGongfaRuntime(runtime, {
      kind: "skill2", skill2Id: "hundred-ghost-procession", eligibleTargetCount: 4,
      nearbyEnemyCount: 4, hasMovementDirection: true,
      learnedMasteryIds: ["nether-river-funeral"]
    });
    expect(result.commands).toHaveLength(2);
    expect(result.commands[0]).toMatchObject({
      kind: "authored-line-strike", slowMultiplier: 0.45, slowDurationMs: 2200
    });
    expect(result.runtime.authored.anchors).toHaveLength(0);
    expect(result.runtime.authored.charges).toBe(0);
  });

  it("changes Mist-Wraith collection and ordinary attacks at R3/R6", () => {
    let runtime = createGongfaRuntime({ gongfaId: "mist-wraith-canon" });
    runtime = advanceGongfaRuntime(runtime, {
      kind: "enemy-death", targetId: 21, x: 130, y: 0, rank: "ordinary",
      velocityX: 0, velocityY: 0, playerX: 0, playerY: 0
    }).runtime;
    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
      targets: [], learnedMasteryIds: ["long-banner-soul-call"]
    }).runtime;
    expect(runtime.authored.anchors[0]).toMatchObject({ kind: "stored-soul" });

    const retained = planGongfaAttack(runtime, 0, {
      learnedMasteryIds: ["lantern-returning-underworld-attendant"]
    })[0];
    expect(retained).toMatchObject({ kind: "authored-line-strike" });
    expect(runtime.authored.anchors).toHaveLength(1);

    const wandering = planGongfaAttack(runtime, 0, {
      learnedMasteryIds: ["wandering-mist-host"]
    })[0];
    expect(wandering).toMatchObject({ kind: "authored-line-strike", maxHits: 3 });
    expect(runtime.authored.anchors).toHaveLength(0);
  });

  it("makes Sword-Burial trigger doctrine and sealed inventory exclusive", () => {
    let runtime = createGongfaRuntime({ gongfaId: "sword-burial-formation" });
    runtime.authored.anchors.push({ kind: "grave-sword", x: 60, y: 0, value: 1, angle: 0 });
    runtime = advanceGongfaRuntime(runtime, {
      kind: "evade", playerX: 60, playerY: 0,
      learnedMasteryIds: ["seal-grave-treading-stars"]
    }).runtime;
    expect(runtime.authored.anchors[0]).toMatchObject({ sealed: true, value: 1.35 });

    const held = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
      learnedMasteryIds: ["seal-grave-treading-stars"],
      targets: [{ targetId: 30, x: 60, y: 0, healthRatio: 1, rank: "elite" }]
    });
    expect(held.commands).toHaveLength(0);
    expect(held.runtime.authored.anchors).toHaveLength(1);

    held.runtime.authored.anchors[0]!.sealed = false;
    const eliteOnly = advanceGongfaRuntime(held.runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, playerX: 0, playerY: 0,
      learnedMasteryIds: ["recognize-calamity-leave-sheath"],
      targets: [{ targetId: 31, x: 60, y: 0, healthRatio: 1, rank: "ordinary" }]
    });
    expect(eliteOnly.commands).toHaveLength(0);
    expect(eliteOnly.runtime.authored.anchors).toHaveLength(1);
  });

  it("makes Flame-Demon health bands and rank-3 routes mechanically distinct", () => {
    const runtime = createGongfaRuntime({ gongfaId: "flame-demon-body-art" });
    runtime.authored.secondaryResource = 0.35;
    const focused = planGongfaAttack(runtime, 0, {
      learnedMasteryIds: ["one-horn-army-breaker", "meridian-locking-heart-guard"]
    })[0];
    expect(focused).toMatchObject({
      kind: "authored-blood-combination", strikeCount: 4, shape: "focused",
      healthCostFractions: [0, 0.03, 0.04, 0.05]
    });
    const pursuit = planGongfaAttack(runtime, 0, {
      learnedMasteryIds: ["hungry-ghost-soul-pursuit"]
    })[0];
    expect(pursuit).toMatchObject({ kind: "authored-blood-combination", shape: "pursuit" });

    runtime.authored.phase = 1;
    const worldBurning = planGongfaAttack(runtime, 0, {
      learnedMasteryIds: ["six-armed-yaksha", "world-burning-asura"]
    })[0];
    expect(worldBurning).toMatchObject({
      kind: "authored-blood-combination",
      shape: "radial",
      asuraChoice: "world-burning-asura",
      asuraActive: true,
      refundFraction: 0
    });
    if (worldBurning?.kind === "authored-blood-combination" &&
        pursuit?.kind === "authored-blood-combination") {
      expect(worldBurning.radius).toBeGreaterThan(pursuit.radius);
      expect(worldBurning.damage).toBeGreaterThan(pursuit.damage);
    }
  });

  it("places harmless Cold-Debt seals and transfers one debt across a foreign seal", () => {
    let runtime = createGongfaRuntime({ gongfaId: "frozen-river-formation" });
    const [placement] = planGongfaAttack(runtime, 0, {
      playerX: 0,
      playerY: 0,
      targets: [{ targetId: 61, x: 180, y: 0, healthRatio: 1, rank: "elite" }],
      learnedMasteryIds: ["three-ford-branching-flow"]
    });
    expect(placement).toMatchObject({ kind: "authored-cold-debt-placement" });
    if (placement?.kind === "authored-cold-debt-placement") {
      expect(placement.seals.filter((seal) => seal.role === "crossing")).toHaveLength(3);
    }

    runtime = createGongfaRuntime({ gongfaId: "frozen-river-formation" });
    runtime.authored.anchors.push(
      { kind: "seal", sealRole: "origin", chainId: 1, targetId: 61, x: 0, y: 0, value: 1 },
      { kind: "seal", sealRole: "crossing", chainId: 2, x: 100, y: 0, value: 1 }
    );
    const crossed = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 2, playerX: 0, playerY: 0,
      learnedMasteryIds: ["cold-debt-pursues-the-weak"],
      targets: [
        { targetId: 61, x: 100, y: 0, healthRatio: 0.8, rank: "elite" },
        { targetId: 62, x: 52, y: 0, healthRatio: 0.2, rank: "ordinary" }
      ]
    });
    expect(crossed.commands).toEqual([
      expect.objectContaining({ kind: "authored-frozen-river", from: { x: 0, y: 0 }, to: { x: 100, y: 0 } })
    ]);
    expect(crossed.runtime.authored.cycleCount).toBe(1);
    expect(crossed.runtime.authored.anchors).toEqual([
      expect.objectContaining({ sealRole: "origin", targetId: 62, x: 100, y: 0 })
    ]);
  });

  it("spends three completed Cold-Debt transfers on the selected prison fate", () => {
    const runtime = createGongfaRuntime({ gongfaId: "frozen-river-formation" });
    runtime.authored.cycleCount = 3;
    runtime.authored.anchors.push(
      { kind: "seal", sealRole: "origin", chainId: 1, targetId: 71, x: -40, y: 0, value: 1 },
      { kind: "seal", sealRole: "origin", chainId: 2, targetId: 72, x: 40, y: 0, value: 1 }
    );
    const prison = advanceGongfaRuntime(runtime, {
      kind: "skill2", skill2Id: "frozen-river-prison", nearbyEnemyCount: 2,
      eligibleTargetCount: 2, hasMovementDirection: true,
      learnedMasteryIds: ["collective-liability"],
      targets: [
        { targetId: 71, x: -40, y: 0, healthRatio: 0.6, rank: "elite" },
        { targetId: 72, x: 40, y: 0, healthRatio: 0.4, rank: "ordinary" }
      ]
    });
    expect(prison.commands).toEqual([
      expect.objectContaining({ kind: "authored-frozen-river-network", fate: "collective-liability" })
    ]);
    expect(prison.runtime.authored.anchors).toHaveLength(0);
    expect(prison.runtime.authored.cycleCount).toBe(0);
  });

  it("lets Compensating Ferry hand Debt off when its debtor dies", () => {
    const runtime = createGongfaRuntime({ gongfaId: "frozen-river-formation" });
    runtime.mastery.masteryLearnedIds = ["compensating-ferry", "cold-debt-pursues-the-strong"];
    runtime.authored.anchors.push({
      kind: "seal", sealRole: "origin", chainId: 8, targetId: 81,
      x: 20, y: 30, value: 1, remainingMs: 1000
    });
    const handedOff = advanceGongfaRuntime(runtime, {
      kind: "enemy-death", targetId: 81, x: 40, y: 30, rank: "ordinary",
      velocityX: 0, velocityY: 0, playerX: 0, playerY: 0,
      targets: [
        { targetId: 82, x: 90, y: 0, healthRatio: 0.4, rank: "ordinary" },
        { targetId: 83, x: 70, y: 0, healthRatio: 0.9, rank: "elite" }
      ]
    });
    expect(handedOff.runtime.authored.anchors[0]).toMatchObject({
      targetId: 83, sealRole: "origin", remainingMs: 6500
    });
    expect(handedOff.runtime.authored.cycleCount).toBe(1);
  });

  it("ages one living Root lineage through one-shot Seed, Sprout, and Mature transitions", () => {
    const runtime = createGongfaRuntime({ gongfaId: "thousand-root-formation" });
    const [infection] = planGongfaAttack(runtime, 0, {
      playerX: 0,
      playerY: 0,
      targets: [{ targetId: 101, x: 80, y: 0, healthRatio: 1, rank: "elite" }]
    });
    expect(infection).toMatchObject({ kind: "authored-root-infection" });
    expect(runtime.authored.anchors).toEqual([
      expect.objectContaining({ kind: "infection", targetId: 101, value: 0, infectionStage: 0 })
    ]);

    let grown = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 3000, nearbyEnemyCount: 1,
      targets: [{ targetId: 101, x: 84, y: 2, healthRatio: 1, rank: "elite" }],
      learnedMasteryIds: ["body-borrowing-branch-root"]
    });
    expect(grown.commands).toEqual([
      expect.objectContaining({ kind: "authored-root-stage", targetId: 101, stage: 1, maxSplashTargets: 0 })
    ]);
    grown = advanceGongfaRuntime(grown.runtime, {
      kind: "tick", deltaMs: 4000, nearbyEnemyCount: 4,
      targets: [{ targetId: 101, x: 88, y: 3, healthRatio: 0.8, rank: "elite" }],
      learnedMasteryIds: ["body-borrowing-branch-root"]
    });
    expect(grown.commands).toEqual([
      expect.objectContaining({ kind: "authored-root-stage", stage: 2, maxSplashTargets: 3 })
    ]);
    expect(grown.runtime.authored.anchors[0]).toMatchObject({ value: 7000, infectionStage: 2, x: 88, y: 3 });
  });

  it("transfers exactly one Root lineage with the selected R6 inheritance law", () => {
    const runtime = createGongfaRuntime({ gongfaId: "thousand-root-formation" });
    runtime.mastery.masteryLearnedIds = ["old-root-seizes-a-body"];
    runtime.authored.anchors.push({
      kind: "infection", targetId: 111, x: 0, y: 0, value: 7000, infectionStage: 2
    });
    const successor = advanceGongfaRuntime(runtime, {
      kind: "enemy-death", targetId: 111, x: 0, y: 0, rank: "elite",
      velocityX: 0, velocityY: 0, playerX: 0, playerY: 0,
      targets: [{ targetId: 112, x: 90, y: 0, healthRatio: 0.7, rank: "ordinary" }]
    });
    expect(successor.commands).toEqual([
      expect.objectContaining({ kind: "authored-root-infection", hosts: [expect.objectContaining({ targetId: 112 })] })
    ]);
    expect(successor.runtime.authored.anchors).toEqual([
      expect.objectContaining({ targetId: 112, value: 3500, infectionStage: 1 })
    ]);
  });

  it("merges four living lineages once and preserves only the approved Wither seed", () => {
    const runtime = createGongfaRuntime({ gongfaId: "thousand-root-formation" });
    runtime.authored.anchors.push(
      { kind: "infection", targetId: 121, x: -60, y: 0, value: 7000, infectionStage: 2 },
      { kind: "infection", targetId: 122, x: -20, y: 0, value: 7000, infectionStage: 2 },
      { kind: "infection", targetId: 123, x: 20, y: 0, value: 3000, infectionStage: 1 },
      { kind: "infection", targetId: 124, x: 60, y: 0, value: 0, infectionStage: 0 }
    );
    const targets = [
      { targetId: 121, x: -60, y: 0, healthRatio: 0.5, rank: "elite" as const },
      { targetId: 122, x: -20, y: 0, healthRatio: 0.4, rank: "ordinary" as const },
      { targetId: 123, x: 20, y: 0, healthRatio: 0.8, rank: "ordinary" as const },
      { targetId: 124, x: 60, y: 0, healthRatio: 0.3, rank: "ordinary" as const }
    ];
    const merged = advanceGongfaRuntime(runtime, {
      kind: "skill2", skill2Id: "myriad-root-killing-field", nearbyEnemyCount: 4,
      eligibleTargetCount: 4, hasMovementDirection: true,
      learnedMasteryIds: ["wither-and-flourish-leave-a-seed"], targets
    });
    expect(merged.commands).toEqual([
      expect.objectContaining({ kind: "authored-root-ancestor", fate: "wither-seed" })
    ]);
    expect(merged.runtime.authored.anchors).toEqual([
      expect.objectContaining({ kind: "infection", targetId: 123, value: 7000, infectionStage: 2 })
    ]);
  });

  it("advances the Black-Tide world calendar with or against its cardinal current", () => {
    let runtime = createGongfaRuntime({ gongfaId: "black-tide-scripture" });
    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 3000, nearbyEnemyCount: 1,
      isMoving: true, movementAngle: 0, movementDistance: 100, targets: []
    }).runtime;
    expect(runtime.authored).toMatchObject({ phase: 0, phaseElapsedMs: 4350, secondaryResource: 0 });

    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 1000, nearbyEnemyCount: 1,
      isMoving: true, movementAngle: Math.PI, movementDistance: 30, targets: []
    }).runtime;
    expect(runtime.authored.phaseElapsedMs).toBe(5030);

    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 1170, nearbyEnemyCount: 1,
      isMoving: false, targets: []
    }).runtime;
    expect(runtime.authored).toMatchObject({ phase: 1, phaseElapsedMs: 0 });
  });

  it("makes each Black-Tide phase and R3 doctrine produce a different world band", () => {
    const runtime = createGongfaRuntime({ gongfaId: "black-tide-scripture" });
    const empoweredEbb = planGongfaAttack(runtime, 0, {
      learnedMasteryIds: ["azure-sea-withdraws-the-border"]
    })[0];
    const sacrificedEbb = planGongfaAttack(runtime, 0, {
      learnedMasteryIds: ["great-flood-presses-the-realm"]
    })[0];
    expect(empoweredEbb).toMatchObject({
      kind: "authored-world-tide-band", phase: "ebb", direction: 0, force: -95
    });
    if (empoweredEbb?.kind === "authored-world-tide-band" &&
        sacrificedEbb?.kind === "authored-world-tide-band") {
      expect(empoweredEbb.damage).toBeGreaterThan(sacrificedEbb.damage);
    }
    runtime.authored.phase = 2;
    const flood = planGongfaAttack(runtime, 0, {
      learnedMasteryIds: ["dry-sea-splits-the-shore"]
    })[0];
    expect(flood).toMatchObject({ kind: "authored-world-tide-band", phase: "flood" });
    if (flood?.kind === "authored-world-tide-band") expect(flood.force).toBe(72);
  });

  it("spends three complete Black-Tide cycles on one locked Deluge law", () => {
    const runtime = createGongfaRuntime({ gongfaId: "black-tide-scripture" });
    runtime.authored.cycleCount = 3;
    runtime.authored.secondaryResource = 2;
    const deluge = advanceGongfaRuntime(runtime, {
      kind: "skill2", skill2Id: "moon-tide-vault", nearbyEnemyCount: 5,
      eligibleTargetCount: 5, hasMovementDirection: true,
      learnedMasteryIds: ["dry-sea-splits-the-shore"]
    });
    expect(deluge.commands).toEqual([
      expect.objectContaining({
        kind: "authored-deluge-mandate", direction: 2, fate: "dry-sea", durationMs: 900
      })
    ]);
    expect(deluge.runtime.authored.cycleCount).toBe(0);
    expect(deluge.runtime.authored.targetLedger[-99]).toBe(900);
    expect(planGongfaAttack(deluge.runtime, 0)).toEqual([]);
  });

  it("keeps exactly one Vermilion companion and builds Bond only after a safe return", () => {
    let runtime = createGongfaRuntime({ gongfaId: "vermilion-bird-covenant" });
    expect(runtime.authored.anchors).toEqual([
      expect.objectContaining({ kind: "companion", companionState: "guard", value: 1 })
    ]);
    let flight = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: true,
      movementAngle: 0, movementDistance: 5, playerX: 0, playerY: 0,
      targets: [{ targetId: 131, x: 140, y: 0, healthRatio: 1, rank: "elite" }]
    });
    expect(flight.commands).toEqual([
      expect.objectContaining({ kind: "authored-vermilion-flight", terminal: false, maxHits: 1 })
    ]);
    expect(flight.runtime.authored.resource).toBe(0);
    expect(flight.runtime.authored.anchors[0]).toMatchObject({ companionState: "outbound", targetId: 131 });

    flight = advanceGongfaRuntime(flight.runtime, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 1, isMoving: false,
      playerX: 0, playerY: 0, targets: []
    });
    expect(flight.runtime.authored.anchors[0]).toMatchObject({ companionState: "return" });
    expect(flight.runtime.authored.resource).toBe(0);

    runtime = advanceGongfaRuntime(flight.runtime, {
      kind: "tick", deltaMs: 720, nearbyEnemyCount: 1, isMoving: false,
      playerX: 0, playerY: 0, targets: []
    }).runtime;
    expect(runtime.authored.anchors[0]).toMatchObject({ companionState: "guard" });
    expect(runtime.authored.resource).toBeCloseTo(0.22);
    expect(runtime.authored.anchors.filter((anchor) => anchor.kind === "companion")).toHaveLength(1);
  });

  it("makes the three Vermilion R3 routes differ in depth, safety, and coverage", () => {
    const targets = [
      { targetId: 141, x: 90, y: 0, healthRatio: 0.5, rank: "ordinary" as const },
      { targetId: 142, x: 240, y: 0, healthRatio: 1, rank: "boss" as const },
      { targetId: 143, x: 130, y: 80, healthRatio: 0.7, rank: "elite" as const }
    ];
    const cast = (learnedMasteryIds: string[]) => advanceGongfaRuntime(
      createGongfaRuntime({ gongfaId: "vermilion-bird-covenant" }),
      {
        kind: "tick", deltaMs: 16, nearbyEnemyCount: 3, isMoving: true,
        movementAngle: 0, movementDistance: 5, playerX: 0, playerY: 0,
        targets, learnedMasteryIds
      }
    ).commands[0];
    const hunt = cast(["crimson-feather-head-hunt"]);
    const guard = cast(["cinnabar-plume-guardian"]);
    const sweep = cast(["firewing-sweeping-formation"]);
    expect(hunt).toMatchObject({ kind: "authored-vermilion-flight", maxHits: 1, flightStyle: "head-hunt" });
    expect(guard).toMatchObject({ kind: "authored-vermilion-flight", maxHits: 1, flightStyle: "guardian" });
    expect(sweep).toMatchObject({ kind: "authored-vermilion-flight", maxHits: 3, flightStyle: "sweep" });
    if (hunt?.kind === "authored-vermilion-flight" && guard?.kind === "authored-vermilion-flight" &&
        sweep?.kind === "authored-vermilion-flight") {
      expect(hunt.waypoints[0]?.targetId).toBe(142);
      expect(Math.hypot(guard.waypoints[0]!.x, guard.waypoints[0]!.y)).toBeLessThanOrEqual(105);
      expect(sweep.waypoints).toHaveLength(3);
      expect(hunt.damage).toBeGreaterThan(sweep.damage);
    }
  });

  it("uses ordinary movement direction to guide Vermilion target choice without manual aim", () => {
    const runtime = createGongfaRuntime({ gongfaId: "vermilion-bird-covenant" });
    const flight = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 2, isMoving: true,
      movementAngle: 0, playerX: 0, playerY: 0,
      targets: [
        { targetId: 145, x: -60, y: 0, healthRatio: 0.2, rank: "ordinary" },
        { targetId: 146, x: 180, y: 0, healthRatio: 1, rank: "ordinary" }
      ]
    });
    const command = flight.commands.find((candidate) => candidate.kind === "authored-vermilion-flight");
    expect(command?.waypoints[0]?.targetId).toBe(146);
    expect(command?.flightStyle).toBe("guided");
    const noWeakPreyHunt = advanceGongfaRuntime(createGongfaRuntime({ gongfaId: "vermilion-bird-covenant" }), {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: true,
      movementAngle: 0, playerX: 0, playerY: 0,
      learnedMasteryIds: ["crimson-feather-head-hunt"],
      targets: [{ targetId: 150, x: 100, y: 0, healthRatio: 1, rank: "ordinary" }]
    });
    expect(noWeakPreyHunt.commands).toEqual([]);
  });

  it("makes a Vermilion return a real vulnerable journey instead of teleporting to safety", () => {
    let runtime = createGongfaRuntime({ gongfaId: "vermilion-bird-covenant" });
    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: true,
      movementAngle: 0, playerX: 0, playerY: 0,
      targets: [{ targetId: 147, x: 140, y: 0, healthRatio: 1, rank: "elite" }]
    }).runtime;
    runtime = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 100, nearbyEnemyCount: 1, isMoving: false,
      playerX: 0, playerY: 0, targets: []
    }).runtime;
    const returning = runtime.authored.anchors[0]!;
    expect(returning).toMatchObject({ companionState: "return", x: 140, originPlayerX: 140 });
    returning.value = 0.01;
    const endangered = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 360, nearbyEnemyCount: 1, isMoving: false,
      playerX: 0, playerY: 0,
      targets: [{ targetId: 148, x: 70, y: 0, healthRatio: 1, rank: "ordinary" }]
    });
    expect(endangered.runtime.authored.anchors[0]).toMatchObject({ companionState: "ember", value: 0 });
    expect(endangered.runtime.authored.resource).toBe(0);
  });

  it("allows Vermilion Rebirth only after reunion and preserves Nurtured Covenant's low capstone force", () => {
    const cast = (learnedMasteryIds: string[], state: "guard" | "outbound") => {
      const runtime = createGongfaRuntime({ gongfaId: "vermilion-bird-covenant" });
      runtime.authored.targetLedger[-20] = learnedMasteryIds.includes("nurtured-covenant") ? 0.65 : 1;
      runtime.authored.resource = 1;
      runtime.authored.anchors[0]!.companionState = state;
      return advanceGongfaRuntime(runtime, {
        kind: "skill2", skill2Id: "vermilion-host-descent",
        learnedMasteryIds,
        targets: [{ targetId: 149, x: 160, y: 0, healthRatio: 1, rank: "elite" }]
      });
    };
    expect(cast([], "outbound").commands).toEqual([]);
    const base = cast([], "guard").commands.find((command) => command.kind === "authored-vermilion-flight");
    const nurtured = cast(["nurtured-covenant"], "guard").commands.find((command) => command.kind === "authored-vermilion-flight");
    expect(nurtured?.damage).toBeLessThan(base?.damage ?? 0);
  });

  it("turns full Vermilion Bond into one vulnerable egg and the same reborn phoenix", () => {
    const runtime = createGongfaRuntime({ gongfaId: "vermilion-bird-covenant" });
    runtime.authored.targetLedger[-20] = 1;
    runtime.authored.resource = 1;
    let rebirth = advanceGongfaRuntime(runtime, {
      kind: "skill2", skill2Id: "vermilion-host-descent", nearbyEnemyCount: 1,
      eligibleTargetCount: 1, hasMovementDirection: true,
      learnedMasteryIds: ["true-plume-nirvana"],
      targets: [{ targetId: 151, x: 160, y: 0, healthRatio: 1, rank: "elite" }]
    });
    expect(rebirth.commands).toEqual([
      expect.objectContaining({ kind: "authored-vermilion-flight", terminal: true, flightStyle: "rebirth" })
    ]);
    expect(rebirth.runtime.authored.anchors).toEqual([
      expect.objectContaining({ kind: "companion", companionState: "egg", x: 160, y: 0 })
    ]);
    expect(rebirth.runtime.authored.resource).toBe(0);

    rebirth = advanceGongfaRuntime(rebirth.runtime, {
      kind: "tick", deltaMs: 2800, nearbyEnemyCount: 0, isMoving: false,
      playerX: 160, playerY: 0, targets: [],
      learnedMasteryIds: ["true-plume-nirvana"]
    });
    expect(rebirth.runtime.authored.anchors).toEqual([
      expect.objectContaining({ kind: "companion", companionState: "phoenix", maxValue: 1.4, value: 1.4 })
    ]);
  });

  it("lets nearby enemies destroy the physical Vermilion egg into ordinary ember downtime", () => {
    const runtime = createGongfaRuntime({ gongfaId: "vermilion-bird-covenant" });
    runtime.authored.anchors[0]!.companionState = "egg";
    runtime.authored.anchors[0]!.x = 120;
    runtime.authored.anchors[0]!.y = 0;
    runtime.authored.anchors[0]!.value = 0.02;
    const broken = advanceGongfaRuntime(runtime, {
      kind: "tick", deltaMs: 400, nearbyEnemyCount: 1, isMoving: false,
      playerX: 0, playerY: 0,
      targets: [{ targetId: 152, x: 120, y: 0, healthRatio: 1, rank: "ordinary" }]
    });
    expect(broken.runtime.authored.anchors[0]).toMatchObject({ companionState: "ember", value: 0 });
    expect(broken.runtime.authored.resource).toBe(0);
  });

  it("lets one living Vermilion sacrifice itself for a low-health incoming blow", () => {
    const runtime = createGongfaRuntime({ gongfaId: "vermilion-bird-covenant" });
    const saved = advanceGongfaRuntime(runtime, {
      kind: "incoming-damage", amount: 80, healthRatio: 0.2,
      learnedMasteryIds: ["sacrifice-to-guard-the-master"]
    });
    expect(saved.commands).toEqual([
      expect.objectContaining({ kind: "authored-vermilion-sacrifice" }),
      { kind: "incoming-damage", finalDamage: 0 }
    ]);
    expect(saved.runtime.authored.anchors[0]).toMatchObject({ companionState: "egg", value: 0.55 });
    expect(saved.runtime.authored.resource).toBe(0);
  });

  it("persists authored inventories while resetting transient movement continuity", () => {
    let collection = learnGongfa(createGongfaCollectionRuntime(), "sword-burial-formation", true);
    const runtime = collection.byId["sword-burial-formation"]!;
    runtime.authored.anchors.push({ kind: "grave-sword", x: 12, y: 34, value: 1, angle: 0.5 });
    runtime.authored.continuousMovementMs = 900;
    runtime.authored.continuousDistance = 180;

    const checkpoint = projectGongfaCollectionCheckpoint(collection);
    collection = createGongfaCollectionFromCheckpoint(checkpoint);
    expect(collection.byId["sword-burial-formation"]!.authored.anchors).toEqual([
      expect.objectContaining({ kind: "grave-sword", x: 12, y: 34, angle: 0.5 })
    ]);
    expect(collection.byId["sword-burial-formation"]!.authored.continuousMovementMs).toBe(0);
    expect(collection.byId["sword-burial-formation"]!.authored.continuousDistance).toBe(0);
  });
});
