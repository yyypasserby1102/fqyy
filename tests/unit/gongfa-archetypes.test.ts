import { describe, expect, it } from "vitest";
import { gongfaConfigs, type GongfaId } from "../../src/data/gongfa";
import { createGongfaRuntime, advanceGongfaRuntime, planGongfaAttack } from "../../src/logic/gongfaRuntime";
import { getCompatibleGongfaIdsForLinggen, getPresentedGongfaIdsForLinggen } from "../../src/logic/progression";
import { getRank10Skill2Id } from "../../src/logic/mastery";
import { getGongfaPackage } from "../../src/data/gongfaPackages";
import { getSurgeGongfaSpec } from "../../src/data/surgeGongfa";
import { getGongfaVisualIdentity } from "../../src/visual/gongfaVisualIdentity";
import { authoredGongfaMechanics } from "../../src/data/authoredGongfaMechanics";

const archetypes = [
  ["nine-sun-calamity-seal", "ritual-impact", "heavenly-sun-descent", "heavenly-sun-descent"],
  ["mist-wraith-canon", "authored-line-strike", "hundred-ghost-procession", "authored-line-strike"],
  ["heavenfall-body-art", "authored-heavenfall-body", "star-breaking-descent", "authored-star-descent"],
  ["thousand-root-formation", "authored-root-infection", "myriad-root-killing-field", "authored-root-ancestor"],
  ["flame-demon-body-art", "authored-blood-combination", "asura-conflagration", "star-breaking-descent"],
  ["vermilion-bird-covenant", "authored-vermilion-flight", "vermilion-host-descent", "authored-vermilion-flight"],
  ["frozen-river-formation", "authored-cold-debt-placement", "frozen-river-prison", "authored-frozen-river-network"],
  ["moonfall-tide-ritual", "ritual-impact", "moonfall-cataclysm", "heavenly-sun-descent"],
  ["sword-burial-formation", "authored-line-strike", "ten-thousand-sword-tomb", "authored-line-strike"],
  ["heaven-sundering-edict", "authored-sundering-edict", "supreme-sundering-decree", "authored-sundering-edict"],
  ["myriad-beast-grove", "authored-beast-action", "myriad-beast-stampede", "authored-beast-ancestors"],
  ["ancient-tree-body-art", "authored-ancient-tree-cycle", "world-tree-incarnation", "authored-ancient-tree-cycle"]
] as const satisfies ReadonlyArray<readonly [GongfaId, string, string, string]>;

describe("expanded Gongfa archetypes", () => {
  it("gives every pure Linggen six methods so all four milestones retain three choices", () => {
    for (const root of ["fire", "water", "metal", "wood"] as const) {
      const compatible = getCompatibleGongfaIdsForLinggen(root);
      expect(compatible).toHaveLength(6);
      expect(getPresentedGongfaIdsForLinggen(root, compatible.slice(0, 3))).toEqual(compatible.slice(3));
    }
  });

  it("ships all 25 Gongfa with complete packages and unique visual motifs", () => {
    const ids = Object.keys(gongfaConfigs) as GongfaId[];
    expect(ids).toHaveLength(25);
    expect(new Set(ids.map((id) => getGongfaVisualIdentity(id).motifId)).size).toBe(25);
    for (const id of ids) {
      const pkg = getGongfaPackage(id);
      expect(pkg.skill1.name).not.toBe("");
      expect(pkg.skill2.id).toBe(getRank10Skill2Id(id));
    }
    for (const [id] of archetypes) {
      const spec = getSurgeGongfaSpec(id)!;
      expect(new Set([spec.focus.id, spec.spread.id, spec.quicken.id, spec.hold.id, spec.cascade.id, spec.burst.id, spec.crown.id, spec.domain.id, spec.updraft.id]).size).toBe(9);
    }
  });

  it("uses four distinct Skill 1 command families rather than the old projectile template", () => {
    const kinds = archetypes.slice(0, 4).map(([gongfaId, expectedKind]) => {
      const runtime = createGongfaRuntime({ gongfaId });
      if (gongfaId === "mist-wraith-canon") {
        runtime.authored.anchors.push({ kind: "stored-soul", x: 0, y: 0, value: 1 });
      }
      if (gongfaId === "sword-burial-formation") {
        runtime.authored.anchors.push({ kind: "grave-sword", x: 0, y: 0, value: 1, angle: 0 });
      }
      if (gongfaId === "frozen-river-formation") {
        runtime.authored.cycleCount = 3;
        runtime.authored.anchors.push(
          { kind: "seal", sealRole: "origin", chainId: 1, targetId: 41, x: 20, y: 0, value: 1 },
          { kind: "seal", sealRole: "origin", chainId: 2, targetId: 42, x: -20, y: 0, value: 1 }
        );
      }
      if (gongfaId === "heavenfall-body-art") runtime.authored.phase = 1;
      const command = gongfaId === "heavenfall-body-art"
        ? advanceGongfaRuntime(runtime, {
            kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: true,
            movementAngle: 0, movementDistance: 4, playerX: 0, playerY: 0,
            targets: [{ targetId: 91, x: 20, y: 0, healthRatio: 1, rank: "ordinary" }]
          }).commands[0]
        : planGongfaAttack(runtime, 0, {
            playerX: 0,
            playerY: 0,
            targets: [{ targetId: 91, x: 100, y: 0, healthRatio: 1, rank: "ordinary" }]
          })[0];
      expect(command?.kind).toBe(expectedKind);
      return command?.kind;
    });
    expect(new Set(kinds).size).toBe(4);
  });

  it("authors a matching automatic Skill 2 for every new playstyle", () => {
    for (const [gongfaId, , expectedSkill2, expectedCommand] of archetypes) {
      const runtime = createGongfaRuntime({ gongfaId });
      if (gongfaId === "mist-wraith-canon") {
        runtime.authored.anchors.push({ kind: "stored-soul", x: 0, y: 0, value: 1 });
      }
      if (gongfaId === "sword-burial-formation") {
        runtime.authored.anchors.push({ kind: "grave-sword", x: 0, y: 0, value: 1, angle: 0 });
      }
      if (gongfaId === "frozen-river-formation") {
        runtime.authored.cycleCount = 3;
        runtime.authored.anchors.push(
          { kind: "seal", sealRole: "origin", chainId: 1, targetId: 41, x: 20, y: 0, value: 1 },
          { kind: "seal", sealRole: "origin", chainId: 2, targetId: 42, x: -20, y: 0, value: 1 }
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
      if (gongfaId === "heavenfall-body-art") {
        runtime.authored.phase = 1;
        runtime.authored.resource = 1;
        runtime.authored.phaseElapsedMs = 6000;
      }
      if (gongfaId === "heaven-sundering-edict") {
        runtime.authored.resource = 1;
        runtime.authored.anchors.push({ kind: "trail", x: 0, y: 0, angle: 0, value: 2, maxValue: 500 });
      }
      expect(getRank10Skill2Id(gongfaId)).toBe(expectedSkill2);
      const result = advanceGongfaRuntime(runtime, {
        kind: "skill2",
        skill2Id: expectedSkill2,
        eligibleTargetCount: 8,
        nearbyEnemyCount: 8,
        hasMovementDirection: true,
        targets: gongfaId === "frozen-river-formation" ? [
          { targetId: 41, x: 20, y: 0, healthRatio: 1, rank: "elite" },
          { targetId: 42, x: -20, y: 0, healthRatio: 0.5, rank: "ordinary" }
        ] : gongfaId === "thousand-root-formation" ? [
          { targetId: 91, x: -60, y: 0, healthRatio: 1, rank: "elite" },
          { targetId: 92, x: -20, y: 0, healthRatio: 0.8, rank: "ordinary" },
          { targetId: 93, x: 20, y: 0, healthRatio: 0.6, rank: "ordinary" },
          { targetId: 94, x: 60, y: 0, healthRatio: 0.4, rank: "ordinary" }
        ] : gongfaId === "vermilion-bird-covenant" ? [
          { targetId: 95, x: 120, y: 0, healthRatio: 1, rank: "elite" }
        ] : gongfaId === "myriad-beast-grove" ? [
          { targetId: 96, x: 120, y: 0, healthRatio: 1, rank: "elite" }
        ] : undefined
      });
      expect(result.commands[0]?.kind).toBe(expectedCommand);
      expect("masteryCast" in result.commands[0]!).toBe(true);
    }
  });

  it("keeps every new method authored through Yuanying instead of inheriting Jindan numbers", () => {
    for (const [gongfaId] of archetypes) {
      const config = gongfaConfigs[gongfaId];
      expect(config.stages.yuanying).toBeDefined();
      expect(config.stages.yuanying!.damage).toBeGreaterThan(config.stages.jindan!.damage);
      expect(config.stages.yuanying!.cooldownMs).toBeLessThan(config.stages.jindan!.cooldownMs);
    }
  });

  it("keeps template output in one band and routes event-driven methods through authored budgets", () => {
    const outputs = archetypes.flatMap(([gongfaId]) => {
      const runtime = createGongfaRuntime({ gongfaId });
      runtime.combat = { ...runtime.combat, ...gongfaConfigs[gongfaId].stages.yuanying! };
      if (gongfaId === "ancient-tree-body-art") runtime.authored.phase = 1;
      if (gongfaId === "heavenfall-body-art") runtime.authored.phase = 1;
      const targets = [{ targetId: 77, x: gongfaId === "heavenfall-body-art" ? 20 : 100, y: 0, healthRatio: 1, rank: "ordinary" as const }];
      const command = ["vermilion-bird-covenant", "myriad-beast-grove", "ancient-tree-body-art", "heavenfall-body-art"].includes(gongfaId)
        ? advanceGongfaRuntime(runtime, {
            kind: "tick", deltaMs: 16, nearbyEnemyCount: 1, isMoving: gongfaId !== "ancient-tree-body-art",
            movementAngle: 0, movementDistance: 4, playerX: 0, playerY: 0, targets
          }).commands[0]!
        : planGongfaAttack(runtime, 0, { playerX: 0, playerY: 0, targets })[0]!;
      const cadence = runtime.combat.cooldownMs / 1000;
      if (command.kind === "ritual-impact") {
        return command.damage * command.count * (1 + command.burnPulses * 0.14) / cadence;
      }
      if (command.kind === "summon-wraiths") {
        return command.damage * command.count * command.shotsPerWraith / cadence;
      }
      if (command.kind === "melee-combination") {
        return command.damage * ((command.strikeCount - 1) * 0.55 + command.finisherScale) / cadence;
      }
      if (command.kind === "authored-blood-combination") {
        return command.damage * command.strikeCount / cadence;
      }
      if (command.kind === "authored-cold-debt-placement") {
        expect(command.seals.length).toBeGreaterThanOrEqual(2);
        return [];
      }
      if (command.kind === "authored-root-infection") {
        expect(command.hosts).toHaveLength(1);
        return [];
      }
      if (command.kind === "authored-vermilion-flight") {
        expect(command.maxHits).toBeGreaterThan(0);
        return [];
      }
      if (command.kind === "authored-beast-action") {
        expect(command.target.targetId).toBe(77);
        return [];
      }
      if (command.kind === "authored-ancient-tree-cycle") return [];
      if (command.kind === "authored-heavenfall-body") return [];
      if (command.kind === "authored-sundering-edict") return [];
      if (command.kind === "root-trap-array") {
        return [command.damage * command.count * command.pulses / cadence];
      }
      if (command.kind === "authored-line-strike") {
        expect(authoredGongfaMechanics[gongfaId].balance.damage).toBeGreaterThanOrEqual(0.8);
        expect(authoredGongfaMechanics[gongfaId].balance.damage).toBeLessThanOrEqual(1.2);
        return [];
      }
      throw new Error(`Unexpected archetype command: ${command.kind}`);
    });
    expect(Math.max(...outputs) / Math.min(...outputs)).toBeLessThan(2.3);
  });

  it("gives every legacy Gongfa a real Yuanying evolution", () => {
    for (const config of Object.values(gongfaConfigs)) {
      expect(config.stages.yuanying!.damage).toBeGreaterThan(config.stages.jindan!.damage);
      expect(config.stages.yuanying!.cooldownMs).toBeLessThan(config.stages.jindan!.cooldownMs);
    }
  });
});
