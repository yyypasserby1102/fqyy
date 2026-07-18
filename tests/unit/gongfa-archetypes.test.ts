import { describe, expect, it } from "vitest";
import { gongfaConfigs, type GongfaId } from "../../src/data/gongfa";
import { createGongfaRuntime, advanceGongfaRuntime, planGongfaAttack } from "../../src/logic/gongfaRuntime";
import { getCompatibleGongfaIdsForLinggen, getPresentedGongfaIdsForLinggen } from "../../src/logic/progression";
import { getRank10Skill2Id } from "../../src/logic/mastery";
import { getGongfaPackage } from "../../src/data/gongfaPackages";
import { getSurgeGongfaSpec } from "../../src/data/surgeGongfa";
import { getGongfaVisualIdentity } from "../../src/visual/gongfaVisualIdentity";

const archetypes = [
  ["nine-sun-calamity-seal", "ritual-impact", "heavenly-sun-descent", "heavenly-sun-descent"],
  ["mist-wraith-canon", "summon-wraiths", "hundred-ghost-procession", "hundred-ghost-procession"],
  ["heavenfall-body-art", "melee-combination", "star-breaking-descent", "star-breaking-descent"],
  ["thousand-root-formation", "root-trap-array", "myriad-root-killing-field", "myriad-root-killing-field"],
  ["flame-demon-body-art", "melee-combination", "asura-conflagration", "star-breaking-descent"],
  ["vermilion-bird-covenant", "summon-wraiths", "vermilion-host-descent", "hundred-ghost-procession"],
  ["frozen-river-formation", "root-trap-array", "frozen-river-prison", "myriad-root-killing-field"],
  ["moonfall-tide-ritual", "ritual-impact", "moonfall-cataclysm", "heavenly-sun-descent"],
  ["sword-burial-formation", "root-trap-array", "ten-thousand-sword-tomb", "myriad-root-killing-field"],
  ["heaven-sundering-edict", "ritual-impact", "supreme-sundering-decree", "heavenly-sun-descent"],
  ["myriad-beast-grove", "summon-wraiths", "myriad-beast-stampede", "hundred-ghost-procession"],
  ["ancient-tree-body-art", "melee-combination", "world-tree-incarnation", "star-breaking-descent"]
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
      const command = planGongfaAttack(runtime, 0)[0];
      expect(command?.kind).toBe(expectedKind);
      return command?.kind;
    });
    expect(new Set(kinds).size).toBe(4);
  });

  it("authors a matching automatic Skill 2 for every new playstyle", () => {
    for (const [gongfaId, , expectedSkill2, expectedCommand] of archetypes) {
      const runtime = createGongfaRuntime({ gongfaId });
      expect(getRank10Skill2Id(gongfaId)).toBe(expectedSkill2);
      const result = advanceGongfaRuntime(runtime, {
        kind: "skill2",
        skill2Id: expectedSkill2,
        eligibleTargetCount: 8,
        nearbyEnemyCount: 8,
        hasMovementDirection: true
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

  it("keeps peak single-target output in one risk-reward band across the new archetypes", () => {
    const outputs = archetypes.map(([gongfaId]) => {
      const runtime = createGongfaRuntime({ gongfaId });
      runtime.combat = { ...runtime.combat, ...gongfaConfigs[gongfaId].stages.yuanying! };
      const command = planGongfaAttack(runtime, 0)[0]!;
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
      if (command.kind === "root-trap-array") {
        return command.damage * command.count * command.pulses / cadence;
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
