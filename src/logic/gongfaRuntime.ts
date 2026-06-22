import {
  gongfaConfigs,
  type GongfaId,
  type GongfaPattern,
  type GongfaStageState
} from "../data/gongfa";
import { upgradeConfigs, type UpgradeEffect } from "../data/upgrades";

export interface GongfaCombatState extends GongfaStageState {
  pattern: GongfaPattern;
  projectileTexture: string;
  tint: number;
}

export interface GongfaRuntime {
  gongfaId: GongfaId;
  combat: GongfaCombatState;
}

export type PlayerImprovementEffect =
  | { kind: "moveSpeed"; value: number }
  | { kind: "maxHealth"; value: number }
  | { kind: "heal"; value: number }
  | { kind: "magnet"; value: number };

export interface PassiveImprovementEffect {
  kind: "passive";
  effect: UpgradeEffect;
  value: number;
  upgradeId: string;
}

export interface GongfaImprovementResult {
  runtime: GongfaRuntime;
  playerEffect?: PlayerImprovementEffect;
  passiveEffect?: PassiveImprovementEffect;
}

export type AuthoredSkill2Intent =
  | "returning-sword-formation"
  | "golden-gale-corridor"
  | "blade-shell-rebound"
  | "solar-flare-cycle"
  | "furnace-cascade";

export interface AuthoredSkill2Plan {
  intent: AuthoredSkill2Intent;
  trigger: "timed" | "cycle" | "threshold";
  cooldownMs: number;
}

const authoredSkill2Plans: Record<AuthoredSkill2Intent, AuthoredSkill2Plan> = {
  "returning-sword-formation": {
    intent: "returning-sword-formation",
    trigger: "timed",
    cooldownMs: 2400
  },
  "golden-gale-corridor": {
    intent: "golden-gale-corridor",
    trigger: "timed",
    cooldownMs: 2600
  },
  "blade-shell-rebound": {
    intent: "blade-shell-rebound",
    trigger: "threshold",
    cooldownMs: 3000
  },
  "solar-flare-cycle": {
    intent: "solar-flare-cycle",
    trigger: "cycle",
    cooldownMs: 2800
  },
  "furnace-cascade": {
    intent: "furnace-cascade",
    trigger: "timed",
    cooldownMs: 2600
  }
};

export function getAuthoredSkill2Plan(skill2Id: string | undefined): AuthoredSkill2Plan | undefined {
  if (!skill2Id || !(skill2Id in authoredSkill2Plans)) {
    return undefined;
  }

  return authoredSkill2Plans[skill2Id as AuthoredSkill2Intent];
}

interface CreateGongfaRuntimeInput {
  gongfaId: GongfaId;
}

export function createGongfaRuntime(input: CreateGongfaRuntimeInput): GongfaRuntime {
  const gongfa = gongfaConfigs[input.gongfaId];
  const stageState = gongfa.stages.lianqi;
  if (!stageState) {
    throw new Error(`Gongfa ${input.gongfaId} has no starting combat state.`);
  }

  return {
    gongfaId: input.gongfaId,
    combat: {
      ...stageState,
      pattern: gongfa.pattern,
      projectileTexture: gongfa.projectileTexture,
      tint: gongfa.tint,
      damage: stageState.damage,
      cooldownMs: stageState.cooldownMs
    }
  };
}

export function applyGongfaImprovement(
  runtime: GongfaRuntime,
  upgradeId: string
): GongfaImprovementResult {
  const upgrade = upgradeConfigs.find((item) => item.id === upgradeId);
  if (!upgrade) {
    return { runtime };
  }

  const next: GongfaRuntime = {
    ...runtime,
    combat: { ...runtime.combat }
  };

  switch (upgrade.effect) {
    case "methodDamage":
      next.combat.damage += upgrade.value;
      return { runtime: next };
    case "methodCooldown":
      next.combat.cooldownMs = Math.max(180, Math.floor(next.combat.cooldownMs * upgrade.value));
      return { runtime: next };
    case "methodCount":
      next.combat.count += upgrade.value;
      return { runtime: next };
    case "methodPierce":
      next.combat.pierce += upgrade.value;
      return { runtime: next };
    case "methodRange":
      next.combat.range += upgrade.value;
      next.combat.auraRadius += upgrade.value;
      return { runtime: next };
    case "retaliationDamage":
      next.combat.retaliationDamage += upgrade.value;
      return { runtime: next };
    case "moveSpeed":
    case "maxHealth":
    case "heal":
    case "magnet":
      return {
        runtime: next,
        playerEffect: { kind: upgrade.effect, value: upgrade.value }
      };
    default:
      return {
        runtime: next,
        passiveEffect: {
          kind: "passive",
          effect: upgrade.effect,
          value: upgrade.value,
          upgradeId
        }
      };
  }
}
