import {
  gongfaConfigs,
  type GongfaId,
  type GongfaPattern,
  type GongfaStageState
} from "../data/gongfa";
import {
  authoredGongfaMechanics,
  createAuthoredGongfaRuntimeState,
  type AuthoredGongfaRuntimeState
} from "../data/authoredGongfaMechanics";
import {
  getSurgeGongfaSpec,
  surgeGongfaIds,
  SURGE_BURST_IDS,
  SURGE_CASCADE_IDS,
  SURGE_CROWN_IDS,
  SURGE_DOMAIN_IDS,
  SURGE_FOCUS_IDS,
  SURGE_HOLD_IDS,
  SURGE_QUICKEN_IDS,
  SURGE_SPREAD_IDS,
  SURGE_UPDRAFT_IDS
} from "../data/surgeGongfa";
import { upgradeConfigs, type UpgradeEffect } from "../data/upgrades";
import {
  getDeterministicMasteryChoiceIds,
  FULLY_MASTERED_RANK,
  getRank10Skill2Id,
  hasAvailableGongfaRefinement,
  isMasteryTransformationRank
} from "./mastery";
import type { ProjectileVisualId } from "../types/combatVisuals";

export interface GongfaCombatState extends GongfaStageState {
  pattern: GongfaPattern;
  projectileTexture: ProjectileVisualId;
  tint: number;
}

export interface GongfaRuntime {
  gongfaId: GongfaId;
  combat: GongfaCombatState;
  attackCooldownRemaining: number;
  mastery: GongfaMasteryCheckpointFields;
  yujian?: YujianState;
  jinfeng?: JinfengState;
  gengjin?: GengjinState;
  burningRing?: BurningRingState;
  crimsonFurnace?: CrimsonFurnaceState;
  blazingFeather?: BlazingFeatherState;
  surge?: SurgeState;
  skill1Refinements?: Skill1RefinementState;
  /** Canonical state shared by all 25 approved, independently authored mechanics. */
  authored: AuthoredGongfaRuntimeState;
}

export interface Skill1RefinementState {
  damageBonus: number;
  countBonus: number;
  pierceBonus: number;
  rangeBonus: number;
}

const emptySkill1Refinements = (): Skill1RefinementState => ({
  damageBonus: 0,
  countBonus: 0,
  pierceBonus: 0,
  rangeBonus: 0
});

function skill2Combat(runtime: GongfaRuntime): GongfaCombatState {
  const skill1 = runtime.skill1Refinements ?? emptySkill1Refinements();
  return {
    ...runtime.combat,
    damage: Math.max(1, runtime.combat.damage - skill1.damageBonus),
    count: Math.max(1, runtime.combat.count - skill1.countBonus),
    pierce: Math.max(0, runtime.combat.pierce - skill1.pierceBonus),
    range: Math.max(0, runtime.combat.range - skill1.rangeBonus),
    auraRadius: Math.max(0, runtime.combat.auraRadius - skill1.rangeBonus)
  };
}

/** Shared passive for the lighter gongfa; see data/surgeGongfa.ts. */
export interface SurgeState {
  stacks: number;
  durationRemaining: number;
  appliedDamageBonus: number;
}

export interface BlazingFeatherState {
  // Ember Surge passive: hits stoke Embers that boost feather damage and add
  // feathers; Embers fade over time.
  emberStacks: number;
  emberDurationRemaining: number;
  emberAppliedDamageBonus: number;
}

export interface GongfaProjectileHitMode {
  appliesBaseDamage: boolean;
  consumesPierce: boolean;
}

export interface GongfaProjectileHitFacts {
  sourceGongfaId?: GongfaId;
  targetId: number;
  damage: number;
  learnedMasteryIds?: string[];
  baseDamageKilledTarget: boolean;
  embedStacks: number;
  embedPower: number;
  resourceGainEligible?: boolean;
}

export interface AuthoredTargetFact {
  targetId: number;
  x: number;
  y: number;
  healthRatio: number;
  rank: "ordinary" | "elite" | "boss";
}

export interface YujianState {
  executionSealTriggers: number;
  swordBloomTriggers: number;
  reversingSwordPathTriggers: number;
  executionSealStacksByTarget: Record<number, number>;
  // Unbroken Sword Intent passive.
  intentStacks: number;
  intentDurationRemaining: number;
  intentAppliedDamageBonus: number;
  intentAppliedSpeedBonus: number;
  intentAppliedPierceBonus: number;
  intentPotencyBonus: number;
}

export interface JinfengState {
  momentum: number;
  momentumBuildRate: number;
  momentumDecayRate: number;
  momentumWaveBonus: number;
  momentumAppliedRangeBonus: number;
  momentumAppliedSpreadBonus: number;
  momentumAppliedLifetimeBonus: number;
  walkingStormCooldownRemaining: number;
}

export interface GengjinState {
  guardValue: number;
  guardBuildRate: number;
  guardDecayRate: number;
  guardMitigation: number;
  guardMitigationBonus: number;
  guardAppliedRetaliationBonus: number;
  guardAppliedAuraBonus: number;
  guardAppliedDamageBonus: number;
  bladeShellCharge: number;
  bladeShellThreshold: number;
  bladeShellCooldownRemaining: number;
  bladeShellCasts: number;
  gengjinPulseCooldownRemaining: number;
}

export interface BurningRingState {
  heat: number;
  heatBuildRate: number;
  heatDecayRate: number;
  heatAppliedCooldownBonus: number;
  heatAuraSpeedBonus: number;
  ringSegments: number;
  counterflowRingSegments: number;
  counterflowRingAppliedSegments: number;
  counterflowRingRadiusBonus: number;
  counterflowRingCooldownRemaining: number;
  solarFlareCooldownRemaining: number;
  solarFlareCasts: number;
  sunspotCooldownRemaining: number;
}

export interface CrimsonFurnaceState {
  pressure: number;
  pressureBuildRate: number;
  pressureDecayRate: number;
  pressureAppliedRadiusBonus: number;
  pressureRadiusScale: number;
  embedThreshold: number;
  furnaceCascadeCooldownRemaining: number;
  furnaceCascadeCasts: number;
}

export type GongfaRuntimeEvent =
  | {
      kind: "tick";
      deltaMs: number;
      nearbyEnemyCount: number;
      eligibleTargetCount?: number;
      hasMovementDirection?: boolean;
      isMoving?: boolean;
      movementAngle?: number;
      movementDistance?: number;
      playerX?: number;
      playerY?: number;
      healthRatio?: number;
      targets?: AuthoredTargetFact[];
      skill2Enabled?: boolean;
      skill2Id?: string;
      learnedMasteryIds?: string[];
    }
  | { kind: "projectile-hit"; damage: number; learnedMasteryIds?: string[] }
  | { kind: "jinfeng-wave-hit"; learnedMasteryIds?: string[] }
  | { kind: "blazing-feather-hit"; learnedMasteryIds?: string[] }
  | { kind: "surge-hit"; learnedMasteryIds?: string[] }
  | { kind: "gengjin-defensive-hit"; learnedMasteryIds?: string[] }
  | { kind: "evade"; playerX?: number; playerY?: number; learnedMasteryIds?: string[] }
  | {
      kind: "authored-beast-assist";
      targetId: number;
      species: "boar" | "fox" | "deer";
      learnedMasteryIds?: string[];
    }
  | {
      kind: "authored-edict-result";
      doubleHits: number; partialHits: number; eliteDoubleHits: number; lineQuality: number;
      lines: Array<{ x: number; y: number; angle: number; length: number }>;
      learnedMasteryIds?: string[];
    }
  | {
      kind: "authored-sun-result"; hitCount: number; centerHits: number; missed: boolean;
      supreme: boolean; learnedMasteryIds?: string[];
    }
  | {
      kind: "yujian-projectile-hit";
      targetId: number;
      damage: number;
      learnedMasteryIds?: string[];
    }
  | {
      kind: "crimson-projectile-hit";
      targetId: number;
      damage: number;
      embedStacks: number;
      embedPower: number;
    }
  | { kind: "yujian-reversal-spawned" }
  | {
      kind: "skill2";
      skill2Id?: string;
      nearbyEnemyCount?: number;
      eligibleTargetCount?: number;
      hasMovementDirection?: boolean;
      isMoving?: boolean;
      targets?: AuthoredTargetFact[];
      learnedMasteryIds?: string[];
    }
  | { kind: "incoming-damage"; amount: number; healthRatio?: number; skill2Id?: string; learnedMasteryIds?: string[] }
  | { kind: "crimson-detonation"; x: number; y: number; damage: number; fromEmbed: boolean }
  | {
      kind: "enemy-death";
      targetId: number;
      x: number;
      y: number;
      rank: "ordinary" | "elite" | "boss";
      velocityX: number;
      velocityY: number;
      playerX: number;
      playerY: number;
      targets?: AuthoredTargetFact[];
    };

export type GongfaRuntimeCommand =
  | {
      kind: "mastery-skill2-cast";
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "homing-volley";
      count: number;
      transformationTriggers?: YujianTransformationTriggers;
    }
  | {
      kind: "apply-target-damage";
      targetId: number;
      amount: number;
      source: "execution-seal";
    }
  | {
      kind: "spawn-yujian-bloom";
      originTargetId: number;
      maxTargets: number;
      damage: number;
      pierce: number;
    }
  | {
      kind: "spawn-yujian-reversal";
      delayMs: number;
      damage: number;
      pierce: number;
      speed: number;
      lifetimeMs: number;
    }
  | {
      kind: "returning-sword-formation";
      count: number;
      opening: YujianProjectileSpec;
      returnPath: YujianProjectileSpec & { delayMs: number };
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "golden-gale-corridor";
      burstCount: number;
      burstDelayMs: number;
      laneCount: number;
      spreadDeg: number;
      forwardOffset: {
        start: number;
        step: number;
      };
      sidewaysSpacing: number;
      projectile: WaveProjectileSpec;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "wave-volley";
      count: number;
      returnShots: number;
      aimMode: "nearest" | "last";
      growthScale?: number;
    }
  | { kind: "gravity-pull"; radius: number; strength: number }
  | {
      kind: "aura-burst";
      damage: number;
      count: number;
    }
  | {
      kind: "burning-ring-volley";
      rotation: number;
      segmentCount: number;
      visibleSegments: number;
      ringRadius: number;
      damageScale?: number;
      scatterEmbers?: boolean;
    }
  | { kind: "sunspot-collapse"; radius: number; damage: number }
  | {
      kind: "solar-flare-cycle";
      segmentCount: number;
      ringRadius: number;
      damageScale: number;
      baseDamage: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "blade-shell-rebound";
      damageScale: number;
      bonusBlades: number;
      baseDamage: number;
      baseBladeCount: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "incoming-damage";
      finalDamage: number;
    }
  | {
      kind: "crimson-furnace-volley";
      count: number;
    }
  | {
      kind: "crimson-detonation";
      x: number;
      y: number;
      radius: number;
      splashDamage: number;
    }
  | {
      kind: "lodge-crimson-needle";
      targetId: number;
      embedStacks: number;
      embedPower: number;
    }
  | {
      kind: "detonate-crimson-embed";
      targetId: number;
      sourceDamage: number;
      fragment: CrimsonFragmentSpec;
    }
  | {
      kind: "furnace-cascade";
      sourceDamage: {
        embedPowerMultiplier: number;
        stackDamage: number;
      };
      fragment: CrimsonFragmentSpec;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "feather-rain-formation";
      fanCount: number;
      feathersPerFan: number;
      fanDelayMs: number;
      damage: number;
      pierce: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "sunset-wave-apex";
      wallCount: number;
      overlapScale: number;
      damage: number;
      width: number;
      pierce: number;
      speed: number;
      lifetimeMs: number;
      distanceScale: number;
      speedScale: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "mirror-needle-constellation";
      needleCount: number;
      staggerMs: number;
      damage: number;
      pierce: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "moon-tide-vault";
      radius: number;
      damage: number;
      controlStrength: number;
      returnDelayMs: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "frozen-lotus-shell";
      petalCount: number;
      damage: number;
      radius: number;
      shatterDelayMs: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "verdant-root-network";
      linkCount: number;
      pulseCount: number;
      pulseDelayMs: number;
      damage: number;
      reach: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "sprout-sun-circle";
      spokeCount: number;
      pulseCount: number;
      pulseDelayMs: number;
      damage: number;
      radius: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "ironwood-surge-form";
      waveCount: number;
      returnShots: number;
      growthScale: number;
      damage: number;
      width: number;
      pushStrength: number;
      pierce: number;
      speed: number;
      lifetimeMs: number;
      distanceScale: number;
      speedScale: number;
      masteryCast: MasterySkill2Cast;
    }
  | { kind: "ritual-impact"; count: number; damage: number; radius: number; telegraphMs: number; burnPulses: number; burnDelayMs: number }
  | { kind: "summon-wraiths"; count: number; shotsPerWraith: number; damage: number; pierce: number; orbitMs: number }
  | { kind: "melee-combination"; strikeCount: number; damage: number; radius: number; finisherScale: number; staggerMs: number }
  | { kind: "root-trap-array"; count: number; pulses: number; damage: number; radius: number; pulseDelayMs: number; lifetimeMs: number }
  | {
      kind: "heavenly-sun-descent";
      impactCount: number; damage: number; radius: number; telegraphMs: number; burnPulses: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "hundred-ghost-procession";
      wraithCount: number; shotsPerWraith: number; damage: number; pierce: number; orbitMs: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "star-breaking-descent";
      strikeCount: number; damage: number; radius: number; finisherScale: number; staggerMs: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "myriad-root-killing-field";
      trapCount: number; pulses: number; damage: number; radius: number; pulseDelayMs: number; lifetimeMs: number;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-line-strike";
      style: "mist-wraith-crossing" | "grave-sword-rise";
      origin: "player" | { x: number; y: number };
      aimMode?: "nearest" | "strongest";
      angle?: number;
      damage: number;
      width: number;
      length: number;
      sourceGongfaId: GongfaId;
      angleOffset?: number;
      slowMultiplier?: number;
      slowDurationMs?: number;
      maxHits?: number;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-blood-combination";
      strikeCount: number;
      damage: number;
      radius: number;
      staggerMs: number;
      healthCostFractions: number[];
      shape: "focused" | "radial" | "pursuit";
      refundFraction: number;
      asuraChoice?: "undying-asura" | "world-burning-asura" | "life-hunting-asura";
      asuraActive: boolean;
      sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-cold-debt-placement";
      seals: Array<{ x: number; y: number; role: "origin" | "crossing"; chainId: number }>;
      lifetimeMs: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-frozen-river";
      from: { x: number; y: number };
      to: { x: number; y: number };
      damage: number;
      width: number;
      slowMultiplier: number;
      slowDurationMs: number;
      bossDamageScale: number;
      sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-frozen-river-network";
      nodes: Array<{ x: number; y: number; targetId: number; rank: AuthoredTargetFact["rank"] }>;
      damagePool: number;
      width: number;
      fate: "shared-cold" | "collective-liability" | "compensating-ferry";
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-root-infection";
      hosts: Array<{ targetId: number; x: number; y: number }>;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-root-stage";
      targetId: number;
      x: number;
      y: number;
      stage: 1 | 2;
      damage: number;
      radius: number;
      maxSplashTargets: number;
      slowMultiplier?: number;
      slowDurationMs?: number;
      immobilizeOrdinary?: boolean;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-root-ancestor";
      hosts: Array<{ targetId: number; x: number; y: number; rank: AuthoredTargetFact["rank"] }>;
      routeTargets: Array<{ targetId: number; x: number; y: number; rank: AuthoredTargetFact["rank"] }>;
      mergeTarget: { x: number; y: number };
      damage: number;
      radius: number;
      fate: "many-mouths" | "one-heart" | "wither-seed";
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-world-tide-band";
      phase: "ebb" | "still" | "flood";
      direction: 0 | 1 | 2 | 3;
      damage: number;
      bandCount: number;
      bandWidth: number;
      force: number;
      slowMultiplier: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-deluge-mandate";
      direction: 0 | 1 | 2 | 3;
      damage: number;
      force: number;
      durationMs: number;
      bossSlowMultiplier: number;
      fate: "shared-flow" | "anchored-water" | "dry-sea";
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-vermilion-flight";
      from: { x: number; y: number };
      waypoints: Array<{ x: number; y: number; targetId?: number }>;
      damage: number;
      width: number;
      maxHits: number;
      terminal: boolean;
      sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-vermilion-sacrifice";
      x: number;
      y: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-beast-action";
      species: "boar" | "fox" | "deer";
      form: "rock-boar" | "spirit-fox" | "verdant-deer" | "mountain-lord" | "black-tortoise" | "white-ape";
      from: { x: number; y: number };
      target: AuthoredTargetFact;
      damage: number;
      radius: number;
      rootMs: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-beast-ancestors";
      species: Array<"boar" | "fox" | "deer">;
      targets: AuthoredTargetFact[];
      damage: number;
      fate: "wild-run" | "encirclement" | "return-grove";
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-ancient-tree-cycle";
      x: number; y: number; rings: number; rootRadius: number; branchSectors: number;
      canopyRadius: number; damage: number; law: "many-roots" | "one-tree" | "sheltering";
      heal: number; worldTree: boolean; canopyFocus: boolean; sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-heavenfall-body";
      x: number; y: number; radius: number; damage: number; force: number;
      eligibleTargetIds: number[];
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-star-descent";
      x: number; y: number; angle: number; mass: number; damage: number; radius: number;
      fate: "star-lance" | "crater" | "reverse-return"; sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-sundering-edict";
      lines: Array<{ x: number; y: number; angle: number; length: number }>;
      width: number; physicalDamage: number; judgmentDamage: number; delayMs: number;
      supreme: boolean; translateTo?: { x: number; y: number }; sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-falling-sun";
      seals: Array<{ x: number; y: number; delayMs: number }>;
      radius: number; centerRadius: number; damage: number; zenith: number;
      supreme: boolean; sourceGongfaId: GongfaId; masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-scarlet-tides";
      waves: Array<{ x: number; y: number; angle: number; length: number; width: number }>;
      seam?: { from: { x: number; y: number }; to: { x: number; y: number }; width: number };
      damage: number; seamDamage: number; immediateSeam: boolean; reverse: boolean;
      durationMs: number; supreme: boolean; sourceGongfaId: GongfaId; masteryCast?: MasterySkill2Cast;
    };

export interface YujianTransformationTriggers {
  executionSeal: boolean;
  swordBloom: boolean;
  reversingSwordPath: boolean;
}

export interface YujianProjectileSpec {
  damage: number;
  pierce: number;
  speed: number;
  lifetimeMs: number;
}

export interface WaveProjectileSpec {
  damage: number;
  pierce: number;
  speed: number;
  lifetimeMs: number;
  scale: number;
}

export interface MasterySkill2Cast {
  skill2Id: AuthoredSkill2Intent;
  cooldownMs?: number;
}

export interface CrimsonFragmentSpec {
  radius: number;
  maxTargets: number;
  delayMs: number;
  delayStepMs: number;
  damage: number;
  speed: number;
  lifetimeMs: number;
}

export interface GongfaRuntimeResult {
  runtime: GongfaRuntime;
  commands: GongfaRuntimeCommand[];
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

export interface GongfaImprovementReplayPlan {
  runtimeUpgradeIds: string[];
  checkpointedRuntimeUpgradeIds: string[];
  playerUpgradeIds: string[];
}

export type AuthoredSkill2Intent =
  | "returning-sword-formation"
  | "golden-gale-corridor"
  | "blade-shell-rebound"
  | "solar-flare-cycle"
  | "furnace-cascade"
  | "feather-rain-formation"
  | "sunset-wave-apex"
  | "mirror-needle-constellation"
  | "moon-tide-vault"
  | "frozen-lotus-shell"
  | "verdant-root-network"
  | "sprout-sun-circle"
  | "ironwood-surge-form"
  | "heavenly-sun-descent"
  | "hundred-ghost-procession"
  | "star-breaking-descent"
  | "myriad-root-killing-field"
  | "asura-conflagration"
  | "vermilion-host-descent"
  | "frozen-river-prison"
  | "moonfall-cataclysm"
  | "ten-thousand-sword-tomb"
  | "supreme-sundering-decree"
  | "myriad-beast-stampede"
  | "world-tree-incarnation";

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
  },
  "feather-rain-formation": {
    intent: "feather-rain-formation",
    trigger: "timed",
    cooldownMs: 2700
  },
  "sunset-wave-apex": {
    intent: "sunset-wave-apex",
    trigger: "timed",
    cooldownMs: 2800
  },
  "mirror-needle-constellation": {
    intent: "mirror-needle-constellation",
    trigger: "timed",
    cooldownMs: 2700
  },
  "moon-tide-vault": {
    intent: "moon-tide-vault",
    trigger: "timed",
    cooldownMs: 2800
  },
  "frozen-lotus-shell": {
    intent: "frozen-lotus-shell",
    trigger: "timed",
    cooldownMs: 3000
  },
  "verdant-root-network": {
    intent: "verdant-root-network",
    trigger: "timed",
    cooldownMs: 2700
  },
  "sprout-sun-circle": {
    intent: "sprout-sun-circle",
    trigger: "timed",
    cooldownMs: 3000
  },
  "ironwood-surge-form": {
    intent: "ironwood-surge-form",
    trigger: "timed",
    cooldownMs: 2800
  },
  "heavenly-sun-descent": {
    intent: "heavenly-sun-descent", trigger: "timed", cooldownMs: 5200
  },
  "hundred-ghost-procession": {
    intent: "hundred-ghost-procession", trigger: "timed", cooldownMs: 4200
  },
  "star-breaking-descent": {
    intent: "star-breaking-descent", trigger: "timed", cooldownMs: 3800
  },
  "myriad-root-killing-field": {
    intent: "myriad-root-killing-field", trigger: "timed", cooldownMs: 4400
  },
  "asura-conflagration": { intent: "asura-conflagration", trigger: "timed", cooldownMs: 3900 },
  "vermilion-host-descent": { intent: "vermilion-host-descent", trigger: "timed", cooldownMs: 4300 },
  "frozen-river-prison": { intent: "frozen-river-prison", trigger: "timed", cooldownMs: 4400 },
  "moonfall-cataclysm": { intent: "moonfall-cataclysm", trigger: "timed", cooldownMs: 5300 },
  "ten-thousand-sword-tomb": { intent: "ten-thousand-sword-tomb", trigger: "timed", cooldownMs: 4500 },
  "supreme-sundering-decree": { intent: "supreme-sundering-decree", trigger: "timed", cooldownMs: 5500 },
  "myriad-beast-stampede": { intent: "myriad-beast-stampede", trigger: "timed", cooldownMs: 4300 },
  "world-tree-incarnation": { intent: "world-tree-incarnation", trigger: "timed", cooldownMs: 4000 }
};

const skill2GongfaIds: Record<AuthoredSkill2Intent, GongfaId> = {
  "returning-sword-formation": "yujian-jue",
  "golden-gale-corridor": "jinfeng-gong",
  "blade-shell-rebound": "gengjin-huti",
  "solar-flare-cycle": "burning-ring-scripture",
  "furnace-cascade": "crimson-furnace-sword-art",
  "feather-rain-formation": "blazing-feather-art",
  "sunset-wave-apex": "scarlet-wave-manual",
  "mirror-needle-constellation": "drifting-frost-needle",
  "moon-tide-vault": "black-tide-scripture",
  "frozen-lotus-shell": "ice-mirror-guard",
  "verdant-root-network": "green-vine-art",
  "sprout-sun-circle": "verdant-ring-scripture",
  "ironwood-surge-form": "ironwood-wave-form",
  "heavenly-sun-descent": "nine-sun-calamity-seal",
  "hundred-ghost-procession": "mist-wraith-canon",
  "star-breaking-descent": "heavenfall-body-art",
  "myriad-root-killing-field": "thousand-root-formation",
  "asura-conflagration": "flame-demon-body-art",
  "vermilion-host-descent": "vermilion-bird-covenant",
  "frozen-river-prison": "frozen-river-formation",
  "moonfall-cataclysm": "moonfall-tide-ritual",
  "ten-thousand-sword-tomb": "sword-burial-formation",
  "supreme-sundering-decree": "heaven-sundering-edict",
  "myriad-beast-stampede": "myriad-beast-grove",
  "world-tree-incarnation": "ancient-tree-body-art"
};

const emptyYujianTransformationTriggers: YujianTransformationTriggers = {
  executionSeal: false,
  swordBloom: false,
  reversingSwordPath: false
};

export function getAuthoredSkill2Plan(skill2Id: string | undefined): AuthoredSkill2Plan | undefined {
  if (!skill2Id || !(skill2Id in authoredSkill2Plans)) {
    return undefined;
  }

  return authoredSkill2Plans[skill2Id as AuthoredSkill2Intent];
}

export function getAuthoredSkill2CooldownMs(skill2Id: string | undefined): number {
  return getAuthoredSkill2Plan(skill2Id)?.cooldownMs ?? 0;
}

export interface MasterySkill2CooldownTick {
  cooldownRemainingMs: number;
  readySkill2Id?: AuthoredSkill2Intent;
}

export interface MasterySkill2CastState {
  masterySkill2CooldownRemaining: number;
  masterySkill2Casts: number;
}

export interface GongfaMasteryProgressState {
  masteryPoints: number;
  masteryRank: number;
  masterySkill2Id?: string;
  masterySkill2CooldownRemaining: number;
  masteryChoiceActive: boolean;
  masteryPendingRanks: number[];
}

export interface GongfaMasteryProgressResult {
  state: GongfaMasteryProgressState;
  automaticRewards?: Array<{
    rank: number;
    choiceId: string;
  }>;
  rankUp?: {
    previousRank: number;
    targetRank: number;
  };
}

export interface LegacyMasteryMigrationResult {
  state: GongfaMasteryProgressState & { masteryLearnedIds: string[] };
  automaticRewardIds: string[];
}

export function migrateLegacyMasteryPendingRanks(
  state: GongfaMasteryProgressState & { masteryLearnedIds: string[] },
  context: { gongfaId: GongfaId; seed: string; finalBossActive: boolean }
): LegacyMasteryMigrationResult {
  const next = {
    ...state,
    masteryLearnedIds: [...state.masteryLearnedIds],
    masteryPendingRanks: [] as number[]
  };
  const automaticRewardIds: string[] = [];

  for (const rank of state.masteryPendingRanks) {
    if (isMasteryTransformationRank(rank)) {
      next.masteryPendingRanks.push(rank);
      continue;
    }
    if (rank === 10) {
      next.masterySkill2Id = getRank10Skill2Id(context.gongfaId);
      next.masterySkill2CooldownRemaining = getAuthoredSkill2CooldownMs(
        next.masterySkill2Id
      );
      continue;
    }
    const [choiceId] = getDeterministicMasteryChoiceIds({
      gongfaId: context.gongfaId,
      rank,
      seed: context.seed,
      learnedIds: next.masteryLearnedIds
    });
    if (choiceId) {
      next.masteryLearnedIds.push(choiceId);
      automaticRewardIds.push(choiceId);
    }
  }

  if (next.masteryRank >= 10 && !next.masterySkill2Id) {
    next.masterySkill2Id = getRank10Skill2Id(context.gongfaId);
    next.masterySkill2CooldownRemaining = getAuthoredSkill2CooldownMs(next.masterySkill2Id);
  }
  next.masteryChoiceActive = !context.finalBossActive && next.masteryPendingRanks.length > 0;
  return { state: next, automaticRewardIds };
}

export interface GongfaMasteryChoiceState {
  masteryLearnedIds: string[];
  masteryChoiceActive: boolean;
  masteryPendingRanks: number[];
}

export interface GongfaMasteryCheckpointFields
  extends GongfaMasteryProgressState,
    GongfaMasteryChoiceState {
  upgradeSelectionIds: string[];
  masterySkill2Casts: number;
}

export interface GongfaCollectionRuntime {
  primaryGongfaId?: GongfaId;
  byId: Partial<Record<GongfaId, GongfaRuntime>>;
}

export interface GongfaCollectionMasteryResult {
  runtime: GongfaCollectionRuntime;
  automaticRewards: Array<{
    gongfaId: GongfaId;
    rank: number;
    choiceId: string;
  }>;
  rankUps: Array<{
    gongfaId: GongfaId;
    previousRank: number;
    targetRank: number;
  }>;
}

export interface GongfaMasteryCheckpoint extends GongfaMasteryCheckpointFields {
  gongfaId: GongfaId;
}

export interface GongfaCollectionMasteryCheckpoint {
  primaryGongfaId?: GongfaId;
  masteries: GongfaMasteryCheckpoint[];
}

export interface GongfaCollectionCheckpoint {
  primaryGongfaId?: GongfaId;
  runtimes: GongfaRuntime[];
}

function createEmptyGongfaMastery(): GongfaMasteryCheckpointFields {
  return {
    masteryPoints: 0,
    masteryRank: 0,
    masteryLearnedIds: [],
    upgradeSelectionIds: [],
    masterySkill2CooldownRemaining: 0,
    masterySkill2Casts: 0,
    masteryChoiceActive: false,
    masteryPendingRanks: []
  };
}

export function createGongfaCollectionRuntime(): GongfaCollectionRuntime {
  return { byId: {} };
}

export function learnGongfa(
  collection: GongfaCollectionRuntime,
  gongfaId: GongfaId,
  makePrimary = false
): GongfaCollectionRuntime {
  return {
    primaryGongfaId:
      makePrimary || !collection.primaryGongfaId ? gongfaId : collection.primaryGongfaId,
    byId: {
      ...collection.byId,
      [gongfaId]: collection.byId[gongfaId] ?? createGongfaRuntime({ gongfaId })
    }
  };
}

export function replaceGongfaCollection(
  gongfaId: GongfaId
): GongfaCollectionRuntime {
  return learnGongfa(createGongfaCollectionRuntime(), gongfaId, true);
}

export function advanceGongfaCollectionMastery(
  collection: GongfaCollectionRuntime,
  context: {
    points: number | ((gongfaId: GongfaId) => number);
    finalBossActive: boolean;
    seed?: string;
  }
): GongfaCollectionMasteryResult {
  const byId: Partial<Record<GongfaId, GongfaRuntime>> = { ...collection.byId };
  const rankUps: GongfaCollectionMasteryResult["rankUps"] = [];
  const automaticRewards: GongfaCollectionMasteryResult["automaticRewards"] = [];

  for (const [gongfaId, current] of Object.entries(collection.byId) as Array<
    [GongfaId, GongfaRuntime]
  >) {
    const result = advanceGongfaMasteryProgress(current.mastery, {
      gongfaId,
      points: typeof context.points === "function" ? context.points(gongfaId) : context.points,
      finalBossActive: context.finalBossActive,
      learnedIds: current.mastery.masteryLearnedIds,
      seed: context.seed
    });
    const learnedAutomaticIds = result.automaticRewards?.map((reward) => reward.choiceId) ?? [];
    byId[gongfaId] = {
      ...current,
      mastery: {
        ...result.state,
        masteryLearnedIds: [
          ...current.mastery.masteryLearnedIds,
          ...learnedAutomaticIds
        ],
        upgradeSelectionIds: [...current.mastery.upgradeSelectionIds],
        masterySkill2Casts: current.mastery.masterySkill2Casts
      }
    };
    result.automaticRewards?.forEach((reward) => {
      automaticRewards.push({ gongfaId, ...reward });
    });
    if (result.rankUp) {
      rankUps.push({ gongfaId, ...result.rankUp });
    }
  }

  return { runtime: { ...collection, byId }, automaticRewards, rankUps };
}

export function projectGongfaCollectionMasteryCheckpoint(
  collection: GongfaCollectionRuntime
): GongfaCollectionMasteryCheckpoint {
  return {
    primaryGongfaId: collection.primaryGongfaId,
    masteries: (Object.entries(collection.byId) as Array<[GongfaId, GongfaRuntime]>).map(
      ([gongfaId, runtime]) => ({
        gongfaId,
        ...projectGongfaMasteryCheckpoint(runtime.mastery)
      })
    )
  };
}

export function createGongfaCollectionRuntimeFromCheckpoint(
  checkpoint: GongfaCollectionMasteryCheckpoint
): GongfaCollectionRuntime {
  let collection = createGongfaCollectionRuntime();
  for (const { gongfaId, ...mastery } of checkpoint.masteries) {
    collection = learnGongfa(collection, gongfaId, gongfaId === checkpoint.primaryGongfaId);
    collection.byId[gongfaId] = createGongfaRuntime({ gongfaId, mastery });
  }
  return collection;
}

export function projectGongfaCollectionCheckpoint(
  collection: GongfaCollectionRuntime
): GongfaCollectionCheckpoint {
  return {
    primaryGongfaId: collection.primaryGongfaId,
    runtimes: (Object.values(collection.byId) as GongfaRuntime[]).map((runtime) => {
      const checkpoint = copyRuntime(runtime);
      checkpoint.attackCooldownRemaining = 0;
      checkpoint.mastery.masterySkill2CooldownRemaining = 0;
      resetTransientRuntimeTimers(checkpoint);
      return checkpoint;
    })
  };
}

function resetTransientRuntimeTimers(runtime: GongfaRuntime): void {
  runtime.authored.continuousMovementMs = 0;
  runtime.authored.continuousDistance = 0;
  runtime.authored.lastMovementAngle = undefined;
  if (runtime.yujian) runtime.yujian.intentDurationRemaining = 0;
  if (runtime.jinfeng) runtime.jinfeng.walkingStormCooldownRemaining = 0;
  if (runtime.gengjin) {
    runtime.gengjin.bladeShellCooldownRemaining = 0;
    runtime.gengjin.gengjinPulseCooldownRemaining = 0;
  }
  if (runtime.burningRing) {
    runtime.burningRing.counterflowRingCooldownRemaining = 0;
    runtime.burningRing.solarFlareCooldownRemaining = 0;
    runtime.burningRing.sunspotCooldownRemaining = 0;
  }
  if (runtime.crimsonFurnace) runtime.crimsonFurnace.furnaceCascadeCooldownRemaining = 0;
  if (runtime.blazingFeather) runtime.blazingFeather.emberDurationRemaining = 0;
  if (runtime.surge) runtime.surge.durationRemaining = 0;
}

export function createGongfaCollectionFromCheckpoint(
  checkpoint: GongfaCollectionCheckpoint
): GongfaCollectionRuntime {
  return {
    primaryGongfaId: checkpoint.primaryGongfaId,
    byId: Object.fromEntries(
      checkpoint.runtimes.map((runtime) => [runtime.gongfaId, copyRuntime(runtime)])
    )
  };
}

export function advanceTimedMasterySkill2Cooldown(
  skill2Id: string | undefined,
  cooldownRemainingMs: number,
  deltaMs: number
): MasterySkill2CooldownTick {
  const plan = getAuthoredSkill2Plan(skill2Id);
  if (!plan || plan.trigger !== "timed") {
    return { cooldownRemainingMs };
  }

  const nextCooldownRemainingMs = cooldownRemainingMs - deltaMs;
  if (nextCooldownRemainingMs > 0) {
    return { cooldownRemainingMs: nextCooldownRemainingMs };
  }

  return {
    cooldownRemainingMs: 0,
    readySkill2Id: plan.intent
  };
}

export function recordMasterySkill2Cast(
  state: MasterySkill2CastState,
  command: GongfaRuntimeCommand
): MasterySkill2CastState {
  if (!("masteryCast" in command) || !command.masteryCast) {
    return state;
  }

  return {
    masterySkill2Casts: state.masterySkill2Casts + 1,
    masterySkill2CooldownRemaining:
      command.masteryCast.cooldownMs ?? state.masterySkill2CooldownRemaining
  };
}

export function advanceGongfaMasteryProgress(
  state: GongfaMasteryProgressState,
  context: {
    gongfaId: GongfaId;
    points: number;
    finalBossActive: boolean;
    learnedIds?: string[];
    seed?: string;
  }
): GongfaMasteryProgressResult {
  if (
    context.points <= 0 ||
    (state.masteryRank >= 10 &&
      state.masteryPendingRanks.length === 0 &&
      !hasAvailableGongfaRefinement(context.gongfaId, context.learnedIds ?? []))
  ) {
    return { state };
  }

  const next: GongfaMasteryProgressState = {
    ...state,
    masteryPoints: state.masteryPoints + context.points,
    masteryPendingRanks: [...state.masteryPendingRanks]
  };
  const previousRank = state.masteryRank;
  const targetRank = Math.min(FULLY_MASTERED_RANK, Math.floor(next.masteryPoints / 100));
  if (targetRank <= state.masteryRank) {
    return { state: next };
  }

  next.masteryRank = targetRank;
  const automaticRewards: NonNullable<GongfaMasteryProgressResult["automaticRewards"]> = [];
  const learnedIds = [...(context.learnedIds ?? [])];
  for (let rank = previousRank + 1; rank <= targetRank; rank += 1) {
    if (rank === 10) {
      next.masterySkill2Id = getRank10Skill2Id(context.gongfaId);
      next.masterySkill2CooldownRemaining = getAuthoredSkill2CooldownMs(next.masterySkill2Id);
      continue;
    }

    if (isMasteryTransformationRank(rank) && !next.masteryPendingRanks.includes(rank)) {
      next.masteryPendingRanks.push(rank);
      continue;
    }

    const [choiceId] = getDeterministicMasteryChoiceIds({
      gongfaId: context.gongfaId,
      rank,
      seed: context.seed ?? "0",
      learnedIds
    });
    if (choiceId) {
      learnedIds.push(choiceId);
      automaticRewards.push({ rank, choiceId });
    }
  }

  next.masteryChoiceActive = context.finalBossActive ? false : next.masteryPendingRanks.length > 0;

  return {
    state: next,
    ...(automaticRewards.length > 0 ? { automaticRewards } : {}),
    rankUp: {
      previousRank,
      targetRank
    }
  };
}

export function applyGongfaMasteryChoice(
  state: GongfaMasteryChoiceState,
  choiceId: string
): GongfaMasteryChoiceState {
  const [, ...remainingPendingRanks] = state.masteryPendingRanks;
  return {
    masteryLearnedIds: [...state.masteryLearnedIds, choiceId],
    masteryChoiceActive: false,
    masteryPendingRanks: remainingPendingRanks
  };
}

export function createGongfaMasteryStateFromCheckpoint(
  checkpoint: GongfaMasteryCheckpointFields
): GongfaMasteryCheckpointFields {
  return {
    masteryPoints: checkpoint.masteryPoints,
    masteryRank: checkpoint.masteryRank,
    masteryLearnedIds: [...checkpoint.masteryLearnedIds],
    upgradeSelectionIds: [...checkpoint.upgradeSelectionIds],
    masterySkill2Id: checkpoint.masterySkill2Id,
    masterySkill2CooldownRemaining: checkpoint.masterySkill2CooldownRemaining,
    masterySkill2Casts: checkpoint.masterySkill2Casts,
    masteryChoiceActive: checkpoint.masteryChoiceActive,
    masteryPendingRanks: [...checkpoint.masteryPendingRanks]
  };
}

export function projectGongfaMasteryCheckpoint(
  state: GongfaMasteryCheckpointFields
): GongfaMasteryCheckpointFields {
  return createGongfaMasteryStateFromCheckpoint(state);
}

function buildExplicitTimedSkill2Command(
  runtime: GongfaRuntime,
  skill2: AuthoredSkill2Plan
): GongfaRuntimeCommand | undefined {
  const { damageScale, coverage, cadenceScale } = skill2RefinementStats(runtime);
  const damage = (value: number): number => Math.max(1, Math.floor(value * damageScale));
  const delay = (value: number): number => Math.max(40, Math.floor(value * cadenceScale));
  const distanceScale = 1 + coverage * 0.18;
  const speedScale = 1 + (1 - cadenceScale);
  const combat = skill2Combat(runtime);
  const masteryCast: MasterySkill2Cast = {
    skill2Id: skill2.intent,
    cooldownMs: Math.max(600, Math.floor(skill2.cooldownMs * cadenceScale))
  };
  const resource = runtime.blazingFeather?.emberStacks ?? runtime.surge?.stacks ?? 0;

  switch (skill2.intent) {
    case "feather-rain-formation":
      return { kind: skill2.intent, fanCount: 3 + coverage, feathersPerFan: Math.max(3, combat.count + resource + coverage), fanDelayMs: delay(140), damage: damage(combat.damage * (1.1 + resource * 0.08)), pierce: combat.pierce, masteryCast };
    case "sunset-wave-apex":
      return { kind: skill2.intent, wallCount: 2, overlapScale: 1.4 + resource * 0.08, damage: damage(combat.damage * (1.15 + resource * 0.07)), width: 70 + resource * 10 + coverage * 18, pierce: combat.pierce + 1, speed: combat.projectileSpeed, lifetimeMs: combat.projectileLifetimeMs + 300, distanceScale, speedScale, masteryCast };
    case "mirror-needle-constellation":
      return { kind: skill2.intent, needleCount: Math.max(5, combat.count + 3 + resource + coverage * 2), staggerMs: delay(75), damage: damage(combat.damage * 1.05), pierce: combat.pierce + Math.floor(resource / 3), masteryCast };
    case "moon-tide-vault":
      return { kind: skill2.intent, radius: 180 + resource * 12 + coverage * 24, damage: damage(combat.damage * 1.2), controlStrength: 180 + resource * 15 + coverage * 20, returnDelayMs: delay(320), masteryCast };
    case "frozen-lotus-shell":
      return { kind: skill2.intent, petalCount: Math.max(6, combat.count + 4 + resource + coverage * 2), damage: damage(combat.damage * (1.15 + resource * 0.08)), radius: 90 + resource * 12 + coverage * 16, shatterDelayMs: delay(520), masteryCast };
    case "verdant-root-network":
      return { kind: skill2.intent, linkCount: Math.max(3, combat.count + resource + coverage), pulseCount: 3 + coverage, pulseDelayMs: delay(180), damage: damage(combat.damage * (0.7 + resource * 0.08)), reach: 220 + resource * 20 + coverage * 30, masteryCast };
    case "sprout-sun-circle":
      return { kind: skill2.intent, spokeCount: Math.max(8, combat.count + 5 + resource + coverage * 2), pulseCount: 3 + coverage, pulseDelayMs: delay(220), damage: damage(combat.damage * (1.1 + resource * 0.07)), radius: 100 + resource * 12 + coverage * 18, masteryCast };
    case "ironwood-surge-form":
      return { kind: skill2.intent, waveCount: Math.max(3, combat.count + 1 + coverage), returnShots: 2 + coverage, growthScale: 1.25 + resource * 0.05, damage: damage(combat.damage * (1.1 + resource * 0.08)), width: 80 + resource * 12 + coverage * 18, pushStrength: 170 + resource * 18 + coverage * 20, pierce: combat.pierce + 1, speed: combat.projectileSpeed, lifetimeMs: combat.projectileLifetimeMs + 360, distanceScale, speedScale, masteryCast };
    case "heavenly-sun-descent":
    case "moonfall-cataclysm":
    case "supreme-sundering-decree":
      return { kind: "heavenly-sun-descent", impactCount: 1 + coverage, damage: damage(combat.damage * (2.4 + resource * 0.16)), radius: combat.auraRadius * 1.75 + coverage * 24, telegraphMs: delay(1150), burnPulses: 5 + coverage + Math.floor(resource / 2), masteryCast };
    case "hundred-ghost-procession":
    case "vermilion-host-descent":
    case "myriad-beast-stampede":
      return { kind: "hundred-ghost-procession", wraithCount: Math.max(8, combat.count * 2 + resource + coverage * 2), shotsPerWraith: 3 + coverage, damage: damage(combat.damage * (0.9 + resource * 0.05)), pierce: combat.pierce + 1, orbitMs: delay(520), masteryCast };
    case "star-breaking-descent":
    case "asura-conflagration":
    case "world-tree-incarnation":
      return { kind: "star-breaking-descent", strikeCount: combat.count + 3 + coverage, damage: damage(combat.damage * (1.3 + resource * 0.08)), radius: combat.auraRadius * 1.7 + coverage * 18, finisherScale: 2.4 + resource * 0.12, staggerMs: delay(75), masteryCast };
    case "myriad-root-killing-field":
    case "frozen-river-prison":
    case "ten-thousand-sword-tomb":
      return { kind: "myriad-root-killing-field", trapCount: Math.max(8, combat.count * 2 + resource + coverage * 2), pulses: 5 + coverage, damage: damage(combat.damage * (0.9 + resource * 0.06)), radius: combat.auraRadius * 1.35 + coverage * 16, pulseDelayMs: delay(260), lifetimeMs: combat.projectileLifetimeMs + 1800 + coverage * 400, masteryCast };
    default:
      return undefined;
  }
}

function buildCrimsonFragmentSpec(runtime: GongfaRuntime): CrimsonFragmentSpec {
  const combat = skill2Combat(runtime);
  return {
    radius: 220,
    maxTargets: 2,
    delayMs: 100,
    delayStepMs: 60,
    damage: Math.max(4, Math.floor(combat.damage * 0.45)),
    speed: combat.projectileSpeed + 80,
    lifetimeMs: Math.max(420, combat.projectileLifetimeMs - 120)
  };
}

interface CreateGongfaRuntimeInput {
  gongfaId: GongfaId;
  mastery?: Partial<GongfaMasteryCheckpointFields>;
  yujian?: Partial<YujianState>;
  jinfeng?: Partial<JinfengState>;
  gengjin?: Partial<GengjinState>;
  burningRing?: Partial<BurningRingState>;
  crimsonFurnace?: Partial<CrimsonFurnaceState>;
  blazingFeather?: Partial<BlazingFeatherState>;
  surge?: Partial<SurgeState>;
  skill1Refinements?: Partial<Skill1RefinementState>;
  authored?: Partial<AuthoredGongfaRuntimeState>;
}

export interface GongfaRuntimeCheckpointFields {
  galeMomentum: number;
  galeMomentumBuildRate: number;
  galeMomentumDecayRate: number;
  galeMomentumWaveBonus: number;
  galeMomentumAppliedRangeBonus: number;
  galeMomentumAppliedSpreadBonus: number;
  galeMomentumAppliedLifetimeBonus: number;
  heat: number;
  heatBuildRate: number;
  heatDecayRate: number;
  heatAppliedCooldownBonus: number;
  heatAuraSpeedBonus: number;
  ringSegments: number;
  counterflowRingSegments: number;
  counterflowRingAppliedSegments: number;
  counterflowRingRadiusBonus: number;
  counterflowRingCooldownRemaining: number;
  solarFlareCooldownRemaining: number;
  solarFlareCasts: number;
  crimsonPressure: number;
  crimsonPressureBuildRate: number;
  crimsonPressureDecayRate: number;
  crimsonPressureAppliedRadiusBonus: number;
  crimsonPressureRadiusScale: number;
  crimsonEmbedThreshold: number;
  furnaceCascadeCooldownRemaining: number;
  furnaceCascadeCasts: number;
  guardValue: number;
  guardBuildRate: number;
  guardDecayRate: number;
  guardMitigation: number;
  guardMitigationBonus: number;
  guardAppliedRetaliationBonus: number;
  guardAppliedAuraBonus: number;
  guardAppliedDamageBonus: number;
  bladeShellCharge: number;
  bladeShellThreshold: number;
  bladeShellCooldownRemaining: number;
  bladeShellCasts: number;
}

export type GongfaRuntimeCheckpointInput = Partial<GongfaRuntimeCheckpointFields>;

export interface GongfaRuntimeView {
  galeMomentum: number;
  heat: number;
  ringSegments: number;
  counterflowRingSegments: number;
  solarFlareCasts: number;
  pressure: number;
  furnaceCascadeCasts: number;
  crimsonPressureRadiusScale: number;
  guard: number;
  guardMitigation: number;
  bladeShellCharge: number;
  bladeShellCasts: number;
  masteryTransformationTriggers: {
    executionSeal: number;
    swordBloom: number;
    reversingSwordPath: number;
  };
}

const jinfengDefaults: JinfengState = {
  momentum: 0,
  momentumBuildRate: 0.72,
  momentumDecayRate: 0.48,
  momentumWaveBonus: 0.08,
  momentumAppliedRangeBonus: 0,
  momentumAppliedSpreadBonus: 0,
  momentumAppliedLifetimeBonus: 0,
  walkingStormCooldownRemaining: 0
};

const gengjinDefaults: GengjinState = {
  guardValue: 0,
  guardBuildRate: 0.62,
  guardDecayRate: 0.38,
  guardMitigation: 0,
  guardMitigationBonus: 0,
  guardAppliedRetaliationBonus: 0,
  guardAppliedAuraBonus: 0,
  guardAppliedDamageBonus: 0,
  bladeShellCharge: 0,
  bladeShellThreshold: 100,
  bladeShellCooldownRemaining: 0,
  bladeShellCasts: 0,
  gengjinPulseCooldownRemaining: 0
};

const burningRingDefaults: BurningRingState = {
  heat: 0,
  heatBuildRate: 1.2,
  heatDecayRate: 0.65,
  heatAppliedCooldownBonus: 0,
  heatAuraSpeedBonus: 0.08,
  ringSegments: 6,
  counterflowRingSegments: 0,
  counterflowRingAppliedSegments: 0,
  counterflowRingRadiusBonus: 0,
  counterflowRingCooldownRemaining: 0,
  solarFlareCooldownRemaining: 0,
  solarFlareCasts: 0,
  sunspotCooldownRemaining: 0
};

const crimsonFurnaceDefaults: CrimsonFurnaceState = {
  pressure: 0,
  pressureBuildRate: 1.4,
  pressureDecayRate: 0.6,
  pressureAppliedRadiusBonus: 0,
  pressureRadiusScale: 0.45,
  embedThreshold: 3,
  furnaceCascadeCooldownRemaining: 0,
  furnaceCascadeCasts: 0
};

const yujianDefaults: YujianState = {
  executionSealTriggers: 0,
  swordBloomTriggers: 0,
  reversingSwordPathTriggers: 0,
  executionSealStacksByTarget: {},
  intentStacks: 0,
  intentDurationRemaining: 0,
  intentAppliedDamageBonus: 0,
  intentAppliedSpeedBonus: 0,
  intentAppliedPierceBonus: 0,
  intentPotencyBonus: 0
};

const INTENT_DURATION_MS = 3000;

const EMBER_DURATION_MS = 2600;
const MAX_EMBER_STACKS = 6;

const blazingFeatherDefaults: BlazingFeatherState = {
  emberStacks: 0,
  emberDurationRemaining: 0,
  emberAppliedDamageBonus: 0
};

function syncBlazingFeatherCombat(runtime: GongfaRuntime): void {
  const state = runtime.blazingFeather;
  if (!state) {
    return;
  }
  const desiredDamageBonus = state.emberStacks * 2;
  runtime.combat.damage += desiredDamageBonus - state.emberAppliedDamageBonus;
  state.emberAppliedDamageBonus = desiredDamageBonus;
}

const SURGE_DURATION_MS = 2600;
const MAX_SURGE_STACKS = 6;
const surgeGongfaIdSet = surgeGongfaIds();

const surgeDefaults: SurgeState = {
  stacks: 0,
  durationRemaining: 0,
  appliedDamageBonus: 0
};

const learned = (ids: string[], group: Set<string>): boolean => ids.some((id) => group.has(id));
const masteryEffectTiers = (ids: string[], effect: UpgradeEffect): number =>
  ids.filter((id) => upgradeConfigs.some((upgrade) => upgrade.id === id && upgrade.effect === effect)).length;
const skill2RefinementStats = (runtime: GongfaRuntime): {
  damageScale: number;
  coverage: number;
  cadenceScale: number;
} => ({
  damageScale: 1 + masteryEffectTiers(runtime.mastery.masteryLearnedIds, "skill2Damage") * 0.15,
  coverage: masteryEffectTiers(runtime.mastery.masteryLearnedIds, "skill2Coverage"),
  cadenceScale: 1 - masteryEffectTiers(runtime.mastery.masteryLearnedIds, "skill2Cadence") * 0.12
});

function syncSurgeCombat(runtime: GongfaRuntime): void {
  const state = runtime.surge;
  if (!state) {
    return;
  }
  const desiredDamageBonus = state.stacks * 2;
  runtime.combat.damage += desiredDamageBonus - state.appliedDamageBonus;
  state.appliedDamageBonus = desiredDamageBonus;
}

/** Extra projectiles a Surge gongfa adds to its volley from current stacks. */
function surgeBonusCount(runtime: GongfaRuntime, learnedMasteryIds: string[]): number {
  const state = runtime.surge;
  if (!state) {
    return 0;
  }
  let bonus = Math.floor(state.stacks / 2);
  const mechanics = getSurgeGongfaSpec(runtime.gongfaId)?.mechanics;
  if (state.stacks >= MAX_SURGE_STACKS && learned(learnedMasteryIds, SURGE_BURST_IDS)) {
    bonus += mechanics?.burstCount ?? 3;
  }
  if (learned(learnedMasteryIds, SURGE_CROWN_IDS)) {
    bonus += Math.floor(state.stacks * (mechanics?.crownPerStack ?? 1));
  }
  return bonus;
}

function syncYujianCombat(runtime: GongfaRuntime): void {
  const state = runtime.yujian;
  if (!state) {
    return;
  }

  // Each Intent stack improves Yujian damage and projectile flight speed;
  // five stacks grant +1 pierce.
  const intentPotency =
    masteryEffectTiers(runtime.mastery.masteryLearnedIds, "resourcePotency") +
    state.intentPotencyBonus;
  const desiredDamageBonus = state.intentStacks * (2 + intentPotency);
  const desiredSpeedBonus = state.intentStacks * 24;
  const desiredPierceBonus = state.intentStacks >= 5 ? 1 : 0;

  runtime.combat.damage += desiredDamageBonus - state.intentAppliedDamageBonus;
  runtime.combat.projectileSpeed += desiredSpeedBonus - state.intentAppliedSpeedBonus;
  runtime.combat.pierce += desiredPierceBonus - state.intentAppliedPierceBonus;

  state.intentAppliedDamageBonus = desiredDamageBonus;
  state.intentAppliedSpeedBonus = desiredSpeedBonus;
  state.intentAppliedPierceBonus = desiredPierceBonus;
}

function restoreSkill1RefinementLedger(runtime: GongfaRuntime): Skill1RefinementState {
  if (runtime.skill1Refinements) return { ...runtime.skill1Refinements };

  const ledger = emptySkill1Refinements();
  const learnedIds = runtime.mastery.masteryLearnedIds;
  const replayIds = [
    ...runtime.mastery.upgradeSelectionIds.filter((id) => !learnedIds.includes(id)),
    ...learnedIds
  ];
  for (const id of replayIds) {
    const upgrade = upgradeConfigs.find((candidate) => candidate.id === id);
    if (!upgrade) continue;
    if (upgrade.effect === "skill1Damage") ledger.damageBonus += upgrade.value;
    if (upgrade.effect === "skill1Count") ledger.countBonus += upgrade.value;
    if (upgrade.effect === "skill1Pierce") ledger.pierceBonus += upgrade.value;
    if (upgrade.effect === "skill1Range") ledger.rangeBonus += upgrade.value;
  }
  return ledger;
}

function copyRuntime(runtime: GongfaRuntime): GongfaRuntime {
  const authored = runtime.authored ?? createAuthoredGongfaRuntimeState(runtime.gongfaId);
  return {
    ...runtime,
    combat: { ...runtime.combat },
    mastery: createGongfaMasteryStateFromCheckpoint(runtime.mastery),
    yujian: runtime.yujian
      ? {
          ...runtime.yujian,
          executionSealStacksByTarget: {
            ...runtime.yujian.executionSealStacksByTarget
          }
        }
      : undefined,
    jinfeng: runtime.jinfeng ? { ...runtime.jinfeng } : undefined,
    gengjin: runtime.gengjin ? { ...runtime.gengjin } : undefined,
    burningRing: runtime.burningRing ? { ...runtime.burningRing } : undefined,
    crimsonFurnace: runtime.crimsonFurnace ? { ...runtime.crimsonFurnace } : undefined,
    blazingFeather: runtime.blazingFeather ? { ...runtime.blazingFeather } : undefined,
    surge: runtime.surge ? { ...runtime.surge } : undefined,
    authored: {
      ...authored,
      targetLedger: { ...authored.targetLedger },
      anchors: authored.anchors.map((anchor) => ({ ...anchor }))
    },
    skill1Refinements: restoreSkill1RefinementLedger(runtime)
  };
}

function definedFields<T extends Record<string, unknown>>(fields: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

function syncJinfengCombat(runtime: GongfaRuntime): void {
  const state = runtime.jinfeng;
  if (!state) {
    return;
  }

  const stageState = gongfaConfigs["jinfeng-gong"].stages.lianqi!;
  const momentumBonus = 1 + state.momentum * state.momentumWaveBonus;
  const desiredRangeBonus = Math.round(stageState.range * (momentumBonus - 1));
  const desiredSpreadBonus = Math.round(stageState.spreadDeg * (momentumBonus - 1));
  const desiredLifetimeBonus = Math.floor(state.momentum * 50);

  runtime.combat.range += desiredRangeBonus - state.momentumAppliedRangeBonus;
  runtime.combat.spreadDeg += desiredSpreadBonus - state.momentumAppliedSpreadBonus;
  runtime.combat.projectileLifetimeMs +=
    desiredLifetimeBonus - state.momentumAppliedLifetimeBonus;

  state.momentumAppliedRangeBonus = desiredRangeBonus;
  state.momentumAppliedSpreadBonus = desiredSpreadBonus;
  state.momentumAppliedLifetimeBonus = desiredLifetimeBonus;
}

function syncGengjinCombat(runtime: GongfaRuntime): void {
  const state = runtime.gengjin;
  if (!state) {
    return;
  }

  const stageState = gongfaConfigs["gengjin-huti"].stages.lianqi!;
  const desiredRetaliationBonus = Math.max(1, Math.floor(state.guardValue * 0.18));
  const desiredAuraBonus = Math.floor(state.guardValue * 0.35);
  const desiredDamageBonus = Math.floor(state.guardValue * 0.08);

  runtime.combat.retaliationDamage +=
    desiredRetaliationBonus - state.guardAppliedRetaliationBonus;
  runtime.combat.auraRadius += desiredAuraBonus - state.guardAppliedAuraBonus;
  runtime.combat.damage += desiredDamageBonus - state.guardAppliedDamageBonus;

  state.guardAppliedRetaliationBonus = desiredRetaliationBonus;
  state.guardAppliedAuraBonus = desiredAuraBonus;
  state.guardAppliedDamageBonus = desiredDamageBonus;
  state.guardMitigation = Math.min(0.65, state.guardValue / 220 + state.guardMitigationBonus);
  runtime.combat.auraRadius = Math.max(stageState.auraRadius, runtime.combat.auraRadius);
}

function syncBurningRingCombat(runtime: GongfaRuntime): void {
  const state = runtime.burningRing;
  if (!state) {
    return;
  }

  const stageState = gongfaConfigs["burning-ring-scripture"].stages.lianqi!;
  const currentHeatBonus = Math.min(0.5, state.heat * (0.01 + state.heatAuraSpeedBonus));
  const desiredCooldownBonus = Math.floor(stageState.cooldownMs * currentHeatBonus);
  runtime.combat.cooldownMs = Math.max(
    220,
    runtime.combat.cooldownMs - (desiredCooldownBonus - state.heatAppliedCooldownBonus)
  );
  state.heatAppliedCooldownBonus = desiredCooldownBonus;
}

function syncCrimsonFurnaceCombat(runtime: GongfaRuntime): void {
  const state = runtime.crimsonFurnace;
  if (!state) {
    return;
  }

  const stageState = gongfaConfigs["crimson-furnace-sword-art"].stages.lianqi!;
  const desiredRadiusBonus = Math.floor(state.pressure * state.pressureRadiusScale);
  runtime.combat.range += desiredRadiusBonus - state.pressureAppliedRadiusBonus;
  state.pressureAppliedRadiusBonus = desiredRadiusBonus;
  runtime.combat.range = Math.max(stageState.range, runtime.combat.range);
}

export function createGongfaRuntime(input: CreateGongfaRuntimeInput): GongfaRuntime {
  const gongfa = gongfaConfigs[input.gongfaId];
  const stageState = gongfa.stages.lianqi;
  if (!stageState) {
    throw new Error(`Gongfa ${input.gongfaId} has no starting combat state.`);
  }

  const authoredDefaults = createAuthoredGongfaRuntimeState(input.gongfaId);
  const runtime: GongfaRuntime = {
    gongfaId: input.gongfaId,
    attackCooldownRemaining: 0,
    mastery: {
      ...createEmptyGongfaMastery(),
      ...input.mastery,
      masterySkill2Id: input.mastery?.masterySkill2Id,
      masteryLearnedIds: [...(input.mastery?.masteryLearnedIds ?? [])],
      upgradeSelectionIds: [...(input.mastery?.upgradeSelectionIds ?? [])],
      masteryPendingRanks: [...(input.mastery?.masteryPendingRanks ?? [])]
    },
    combat: {
      ...stageState,
      pattern: gongfa.pattern,
      projectileTexture: gongfa.projectileTexture,
      tint: gongfa.tint,
      damage: stageState.damage,
      cooldownMs: stageState.cooldownMs
    },
    yujian:
      input.gongfaId === "yujian-jue"
        ? {
            ...yujianDefaults,
            ...input.yujian,
            executionSealStacksByTarget: {
              ...yujianDefaults.executionSealStacksByTarget,
              ...input.yujian?.executionSealStacksByTarget
            }
          }
        : undefined,
    jinfeng:
      input.gongfaId === "jinfeng-gong"
        ? {
            ...jinfengDefaults,
            ...input.jinfeng,
            // These are derived projections onto combat state, not durable state.
            momentumAppliedRangeBonus: 0,
            momentumAppliedSpreadBonus: 0,
            momentumAppliedLifetimeBonus: 0
          }
        : undefined,
    gengjin:
      input.gongfaId === "gengjin-huti"
        ? {
            ...gengjinDefaults,
            ...input.gengjin,
            // These are derived projections onto combat state, not durable state.
            guardAppliedRetaliationBonus: 0,
            guardAppliedAuraBonus: 0,
            guardAppliedDamageBonus: 0
          }
        : undefined,
    burningRing:
      input.gongfaId === "burning-ring-scripture"
        ? {
            ...burningRingDefaults,
            ...input.burningRing,
            // This is a derived projection onto combat cooldown, not durable state.
            heatAppliedCooldownBonus: 0
          }
        : undefined,
    crimsonFurnace:
      input.gongfaId === "crimson-furnace-sword-art"
        ? {
            ...crimsonFurnaceDefaults,
            ...input.crimsonFurnace,
            // This is a derived projection onto combat range, not durable state.
            pressureAppliedRadiusBonus: 0
          }
        : undefined,
    blazingFeather:
      input.gongfaId === "blazing-feather-art"
        ? { ...blazingFeatherDefaults, ...input.blazingFeather }
        : undefined,
    surge: surgeGongfaIdSet.has(input.gongfaId)
      ? { ...surgeDefaults, ...input.surge }
      : undefined,
    authored: {
      ...authoredDefaults,
      ...input.authored,
      mechanicId: authoredDefaults.mechanicId,
      targetLedger: {
        ...authoredDefaults.targetLedger,
        ...input.authored?.targetLedger
      },
      anchors: (input.authored?.anchors ?? authoredDefaults.anchors).map((anchor) => ({ ...anchor }))
    },
    skill1Refinements: {
      ...emptySkill1Refinements(),
      ...input.skill1Refinements
    }
  };

  syncJinfengCombat(runtime);
  syncGengjinCombat(runtime);
  syncBurningRingCombat(runtime);
  syncCrimsonFurnaceCombat(runtime);
  syncBlazingFeatherCombat(runtime);
  syncSurgeCombat(runtime);
  return runtime;
}

export function createGongfaRuntimeFromCheckpoint(
  gongfaId: GongfaId,
  checkpoint: GongfaRuntimeCheckpointInput
): GongfaRuntime {
  return createGongfaRuntime({
    gongfaId,
    jinfeng:
      gongfaId === "jinfeng-gong"
        ? definedFields({
            momentum: checkpoint.galeMomentum,
            momentumBuildRate: checkpoint.galeMomentumBuildRate,
            momentumDecayRate: checkpoint.galeMomentumDecayRate,
            momentumWaveBonus: checkpoint.galeMomentumWaveBonus,
            momentumAppliedRangeBonus: checkpoint.galeMomentumAppliedRangeBonus,
            momentumAppliedSpreadBonus: checkpoint.galeMomentumAppliedSpreadBonus,
            momentumAppliedLifetimeBonus: checkpoint.galeMomentumAppliedLifetimeBonus
          })
        : undefined,
    gengjin:
      gongfaId === "gengjin-huti"
        ? definedFields({
            guardValue: checkpoint.guardValue,
            guardBuildRate: checkpoint.guardBuildRate,
            guardDecayRate: checkpoint.guardDecayRate,
            guardMitigation: checkpoint.guardMitigation,
            guardMitigationBonus: checkpoint.guardMitigationBonus,
            guardAppliedRetaliationBonus: checkpoint.guardAppliedRetaliationBonus,
            guardAppliedAuraBonus: checkpoint.guardAppliedAuraBonus,
            guardAppliedDamageBonus: checkpoint.guardAppliedDamageBonus,
            bladeShellCharge: checkpoint.bladeShellCharge,
            bladeShellThreshold: checkpoint.bladeShellThreshold,
            bladeShellCooldownRemaining: checkpoint.bladeShellCooldownRemaining,
            bladeShellCasts: checkpoint.bladeShellCasts
          })
        : undefined,
    burningRing:
      gongfaId === "burning-ring-scripture"
        ? definedFields({
            heat: checkpoint.heat,
            heatBuildRate: checkpoint.heatBuildRate,
            heatDecayRate: checkpoint.heatDecayRate,
            heatAppliedCooldownBonus: checkpoint.heatAppliedCooldownBonus,
            heatAuraSpeedBonus: checkpoint.heatAuraSpeedBonus,
            ringSegments: checkpoint.ringSegments,
            counterflowRingSegments: checkpoint.counterflowRingSegments,
            counterflowRingAppliedSegments: checkpoint.counterflowRingAppliedSegments,
            counterflowRingRadiusBonus: checkpoint.counterflowRingRadiusBonus,
            counterflowRingCooldownRemaining: checkpoint.counterflowRingCooldownRemaining,
            solarFlareCooldownRemaining: checkpoint.solarFlareCooldownRemaining,
            solarFlareCasts: checkpoint.solarFlareCasts
          })
        : undefined,
    crimsonFurnace:
      gongfaId === "crimson-furnace-sword-art"
        ? definedFields({
            pressure: checkpoint.crimsonPressure,
            pressureBuildRate: checkpoint.crimsonPressureBuildRate,
            pressureDecayRate: checkpoint.crimsonPressureDecayRate,
            pressureAppliedRadiusBonus: checkpoint.crimsonPressureAppliedRadiusBonus,
            pressureRadiusScale: checkpoint.crimsonPressureRadiusScale,
            embedThreshold: checkpoint.crimsonEmbedThreshold,
            furnaceCascadeCooldownRemaining: checkpoint.furnaceCascadeCooldownRemaining,
            furnaceCascadeCasts: checkpoint.furnaceCascadeCasts
          })
        : undefined
  });
}

export function projectGongfaRuntimeCheckpoint(
  runtime: GongfaRuntime | undefined
): GongfaRuntimeCheckpointFields {
  const jinfeng = runtime?.jinfeng;
  const gengjin = runtime?.gengjin;
  const burningRing = runtime?.burningRing;
  const crimsonFurnace = runtime?.crimsonFurnace;

  return {
    galeMomentum: jinfeng?.momentum ?? 0,
    galeMomentumBuildRate: jinfeng?.momentumBuildRate ?? 0,
    galeMomentumDecayRate: jinfeng?.momentumDecayRate ?? 0,
    galeMomentumWaveBonus: jinfeng?.momentumWaveBonus ?? 0,
    galeMomentumAppliedRangeBonus: jinfeng?.momentumAppliedRangeBonus ?? 0,
    galeMomentumAppliedSpreadBonus: jinfeng?.momentumAppliedSpreadBonus ?? 0,
    galeMomentumAppliedLifetimeBonus: jinfeng?.momentumAppliedLifetimeBonus ?? 0,
    heat: burningRing?.heat ?? 0,
    heatBuildRate: burningRing?.heatBuildRate ?? 0,
    heatDecayRate: burningRing?.heatDecayRate ?? 0,
    heatAppliedCooldownBonus: burningRing?.heatAppliedCooldownBonus ?? 0,
    heatAuraSpeedBonus: burningRing?.heatAuraSpeedBonus ?? 0,
    ringSegments: burningRing?.ringSegments ?? 0,
    counterflowRingSegments: burningRing?.counterflowRingSegments ?? 0,
    counterflowRingAppliedSegments: burningRing?.counterflowRingAppliedSegments ?? 0,
    counterflowRingRadiusBonus: burningRing?.counterflowRingRadiusBonus ?? 0,
    counterflowRingCooldownRemaining: burningRing?.counterflowRingCooldownRemaining ?? 0,
    solarFlareCooldownRemaining: burningRing?.solarFlareCooldownRemaining ?? 0,
    solarFlareCasts: burningRing?.solarFlareCasts ?? 0,
    crimsonPressure: crimsonFurnace?.pressure ?? 0,
    crimsonPressureBuildRate: crimsonFurnace?.pressureBuildRate ?? 0,
    crimsonPressureDecayRate: crimsonFurnace?.pressureDecayRate ?? 0,
    crimsonPressureAppliedRadiusBonus: crimsonFurnace?.pressureAppliedRadiusBonus ?? 0,
    crimsonPressureRadiusScale: crimsonFurnace?.pressureRadiusScale ?? 0.45,
    crimsonEmbedThreshold: crimsonFurnace?.embedThreshold ?? 3,
    furnaceCascadeCooldownRemaining: crimsonFurnace?.furnaceCascadeCooldownRemaining ?? 0,
    furnaceCascadeCasts: crimsonFurnace?.furnaceCascadeCasts ?? 0,
    guardValue: gengjin?.guardValue ?? 0,
    guardBuildRate: gengjin?.guardBuildRate ?? 0,
    guardDecayRate: gengjin?.guardDecayRate ?? 0,
    guardMitigation: gengjin?.guardMitigation ?? 0,
    guardMitigationBonus: gengjin?.guardMitigationBonus ?? 0,
    guardAppliedRetaliationBonus: gengjin?.guardAppliedRetaliationBonus ?? 0,
    guardAppliedAuraBonus: gengjin?.guardAppliedAuraBonus ?? 0,
    guardAppliedDamageBonus: gengjin?.guardAppliedDamageBonus ?? 0,
    bladeShellCharge: gengjin?.bladeShellCharge ?? 0,
    bladeShellThreshold: gengjin?.bladeShellThreshold ?? 100,
    bladeShellCooldownRemaining: gengjin?.bladeShellCooldownRemaining ?? 0,
    bladeShellCasts: gengjin?.bladeShellCasts ?? 0
  };
}

export interface GongfaCollectionPersistenceFields
  extends GongfaMasteryCheckpointFields,
    GongfaRuntimeCheckpointFields {
  gongfaMasteries: GongfaMasteryCheckpoint[];
  gongfaRuntimes: GongfaRuntime[];
}

export function restoreGongfaCollection(input: {
  primaryGongfaId?: GongfaId;
  learnedGongfaIds: GongfaId[];
  gongfaRuntimes?: GongfaRuntime[];
  gongfaMasteries?: GongfaMasteryCheckpoint[];
  legacyPrimary?: GongfaMasteryCheckpointFields & GongfaRuntimeCheckpointInput;
}): GongfaCollectionRuntime {
  let collection = input.gongfaRuntimes
    ? createGongfaCollectionFromCheckpoint({
        primaryGongfaId: input.primaryGongfaId,
        runtimes: input.gongfaRuntimes
      })
    : createGongfaCollectionRuntimeFromCheckpoint({
        primaryGongfaId: input.primaryGongfaId,
        masteries: input.gongfaMasteries ?? []
      });

  for (const gongfaId of input.learnedGongfaIds) {
    collection = learnGongfa(
      collection,
      gongfaId,
      gongfaId === input.primaryGongfaId
    );
  }

  if (input.primaryGongfaId && !input.gongfaRuntimes && input.legacyPrimary) {
    const primary = createGongfaRuntimeFromCheckpoint(
      input.primaryGongfaId,
      input.legacyPrimary
    );
    primary.mastery = collection.byId[input.primaryGongfaId]?.mastery ??
      createGongfaMasteryStateFromCheckpoint(input.legacyPrimary);
    collection.byId[input.primaryGongfaId] = primary;
  }

  return collection;
}

export function projectGongfaCollectionPersistence(
  collection: GongfaCollectionRuntime
): GongfaCollectionPersistenceFields {
  const primaryId = collection.primaryGongfaId;
  const primary = primaryId ? collection.byId[primaryId] : undefined;
  const mastery = projectGongfaMasteryCheckpoint(
    primary?.mastery ?? createEmptyGongfaMastery()
  );
  return {
    ...projectGongfaRuntimeCheckpoint(primary),
    ...mastery,
    gongfaMasteries: projectGongfaCollectionMasteryCheckpoint(collection).masteries,
    gongfaRuntimes: projectGongfaCollectionCheckpoint(collection).runtimes
  };
}

export function projectGongfaRuntimeView(runtime: GongfaRuntime | undefined): GongfaRuntimeView {
  const jinfeng = runtime?.jinfeng;
  const gengjin = runtime?.gengjin;
  const burningRing = runtime?.burningRing;
  const crimsonFurnace = runtime?.crimsonFurnace;
  const yujian = runtime?.yujian;

  return {
    galeMomentum: jinfeng?.momentum ?? 0,
    heat: burningRing?.heat ?? 0,
    ringSegments: burningRing?.ringSegments ?? 0,
    counterflowRingSegments: burningRing?.counterflowRingSegments ?? 0,
    solarFlareCasts: burningRing?.solarFlareCasts ?? 0,
    pressure: crimsonFurnace?.pressure ?? 0,
    furnaceCascadeCasts: crimsonFurnace?.furnaceCascadeCasts ?? 0,
    crimsonPressureRadiusScale: crimsonFurnace?.pressureRadiusScale ?? 0.45,
    guard: gengjin?.guardValue ?? 0,
    guardMitigation: gengjin?.guardMitigation ?? 0,
    bladeShellCharge: gengjin?.bladeShellCharge ?? 0,
    bladeShellCasts: gengjin?.bladeShellCasts ?? 0,
    masteryTransformationTriggers: {
      executionSeal: yujian?.executionSealTriggers ?? 0,
      swordBloom: yujian?.swordBloomTriggers ?? 0,
      reversingSwordPath: yujian?.reversingSwordPathTriggers ?? 0
    }
  };
}

export function getGongfaProjectileHitMode(sourceGongfaId?: GongfaId): GongfaProjectileHitMode {
  if (sourceGongfaId === "crimson-furnace-sword-art") {
    return {
      appliesBaseDamage: false,
      consumesPierce: false
    };
  }

  return {
    appliesBaseDamage: true,
    consumesPierce: true
  };
}

export function advanceGongfaRuntimeForProjectileHit(
  runtime: GongfaRuntime,
  facts: GongfaProjectileHitFacts
): GongfaRuntimeResult {
  const commands: GongfaRuntimeCommand[] = [];

  if (facts.sourceGongfaId === "crimson-furnace-sword-art") {
    return advanceGongfaRuntime(runtime, {
      kind: "crimson-projectile-hit",
      targetId: facts.targetId,
      damage: facts.damage,
      embedStacks: facts.embedStacks,
      embedPower: facts.embedPower
    });
  }

  let next = runtime;

  if (facts.sourceGongfaId === "yujian-jue" && !facts.baseDamageKilledTarget) {
    const result = advanceGongfaRuntime(next, {
      kind: "yujian-projectile-hit",
      targetId: facts.targetId,
      damage: facts.damage,
      learnedMasteryIds: facts.learnedMasteryIds
    });
    next = result.runtime;
    commands.push(...result.commands);
  }

  if (next.burningRing) {
    const result = advanceGongfaRuntime(next, {
      kind: "projectile-hit",
      damage: facts.damage,
      learnedMasteryIds: facts.learnedMasteryIds
    });
    next = result.runtime;
    commands.push(...result.commands);
  }

  if (facts.sourceGongfaId === "jinfeng-gong" && next.jinfeng) {
    const result = advanceGongfaRuntime(next, {
      kind: "jinfeng-wave-hit",
      learnedMasteryIds: facts.learnedMasteryIds
    });
    next = result.runtime;
    commands.push(...result.commands);
  }

  if (
    facts.resourceGainEligible !== false &&
    facts.sourceGongfaId === "blazing-feather-art" &&
    next.blazingFeather
  ) {
    const result = advanceGongfaRuntime(next, {
      kind: "blazing-feather-hit",
      learnedMasteryIds: facts.learnedMasteryIds
    });
    next = result.runtime;
    commands.push(...result.commands);
  }

  if (facts.sourceGongfaId === "gengjin-huti" && next.gengjin) {
    const result = advanceGongfaRuntime(next, {
      kind: "gengjin-defensive-hit",
      learnedMasteryIds: facts.learnedMasteryIds
    });
    next = result.runtime;
    commands.push(...result.commands);
  }

  if (
    facts.resourceGainEligible !== false &&
    facts.sourceGongfaId &&
    surgeGongfaIdSet.has(facts.sourceGongfaId) &&
    next.surge
  ) {
    const result = advanceGongfaRuntime(next, {
      kind: "surge-hit",
      learnedMasteryIds: facts.learnedMasteryIds
    });
    next = result.runtime;
    commands.push(...result.commands);
  }

  return { runtime: next, commands };
}

export function getGongfaRuntimeTickThreatRadius(runtime: GongfaRuntime): number {
  if (runtime.burningRing) {
    return 170;
  }

  if (runtime.gengjin) {
    return 160;
  }

  if (runtime.mastery.masterySkill2Id) {
    return 640;
  }

  return 0;
}

function distanceSquared(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function cardinalFlowAngle(direction: number): number {
  return [0, Math.PI / 2, Math.PI, -Math.PI / 2][direction] ?? 0;
}

function advanceAuthoredWorldFacts(
  runtime: GongfaRuntime,
  event: GongfaRuntimeEvent,
  commands: GongfaRuntimeCommand[]
): void {
  const state = runtime.authored;
  const learnedIds = "learnedMasteryIds" in event
    ? event.learnedMasteryIds ?? runtime.mastery.masteryLearnedIds
    : runtime.mastery.masteryLearnedIds;

  if (event.kind === "enemy-death") {
    if (runtime.gongfaId === "mist-wraith-canon") {
      const value = event.rank === "boss" ? 3 : event.rank === "elite" ? 2 : 1;
      const remainingMs = event.rank === "boss" ? 20_000 : event.rank === "elite" ? 12_000 : 6_000;
      state.anchors.push({
        kind: "corpse-soul",
        x: event.x,
        y: event.y,
        value,
        remainingMs,
        targetId: event.targetId
      });
      state.anchors = state.anchors.slice(-12);
    }

    if (runtime.gongfaId === "sword-burial-formation") {
      const velocityMagnitude = Math.hypot(event.velocityX, event.velocityY);
      const angle = velocityMagnitude > 1
        ? Math.atan2(event.velocityY, event.velocityX)
        : Math.atan2(event.y - event.playerY, event.x - event.playerX);
      const isolated = !state.anchors.some((anchor) =>
        anchor.kind === "grave-sword" && distanceSquared(anchor.x, anchor.y, event.x, event.y) <= 120 * 120
      );
      const graveValue = learnedIds.includes("lone-grave-great-que")
        ? isolated ? 1.7 : 0.7
        : learnedIds.includes("collective-burial-sword-mound")
          ? 0.72
          : learnedIds.includes("field-path-sword-forest")
            ? 0.65
            : 1;
      state.anchors.push({
        kind: "grave-sword",
        x: event.x,
        y: event.y,
        value: graveValue,
        angle,
        originPlayerX: event.playerX,
        originPlayerY: event.playerY,
        targetId: event.targetId
      });
      state.anchors = state.anchors.filter((anchor) => anchor.kind === "grave-sword").slice(-state.maxCharges);
      state.charges = state.anchors.length;
    }

    if (runtime.gongfaId === "frozen-river-formation") {
      for (const origin of state.anchors.filter((anchor) =>
        anchor.kind === "seal" && anchor.sealRole !== "crossing" && anchor.targetId === event.targetId
      )) {
        const candidates = event.targets ?? [];
        const compensates = learnedIds.includes("compensating-ferry");
        const recipient = compensates
          ? [...candidates].sort((a, b) => {
              if (learnedIds.includes("cold-debt-pursues-the-weak")) return a.healthRatio - b.healthRatio;
              if (learnedIds.includes("cold-debt-migrates-afar")) {
                return distanceSquared(b.x, b.y, event.playerX, event.playerY) -
                  distanceSquared(a.x, a.y, event.playerX, event.playerY);
              }
              return b.healthRatio - a.healthRatio;
            })[0]
          : undefined;
        origin.targetId = recipient?.targetId;
        origin.sealRole = recipient ? "origin" : "waiting";
        origin.remainingMs = compensates ? Math.max(origin.remainingMs ?? 0, 6500) : Math.min(origin.remainingMs ?? 3000, 3000);
        if (recipient) state.cycleCount += 1;
      }
      state.resource = Math.min(1, state.cycleCount / 3);
    }

    if (runtime.gongfaId === "thousand-root-formation") {
      const dyingLineages = state.anchors.filter((anchor) =>
        anchor.kind === "infection" && anchor.targetId === event.targetId
      );
      const occupied = new Set(state.anchors
        .filter((anchor) => anchor.kind === "infection" && anchor.targetId !== event.targetId)
        .map((anchor) => anchor.targetId));
      for (const lineage of dyingLineages) {
        const eligible = (event.targets ?? []).filter((target) => !occupied.has(target.targetId));
        let successor: AuthoredTargetFact | undefined;
        if (learnedIds.includes("new-sprout-pursues-the-crowd")) {
          successor = [...eligible].sort((a, b) => {
            const densityA = eligible.filter((other) => distanceSquared(a.x, a.y, other.x, other.y) <= 115 ** 2).length;
            const densityB = eligible.filter((other) => distanceSquared(b.x, b.y, other.x, other.y) <= 115 ** 2).length;
            return densityB - densityA;
          })[0];
          lineage.value = 0;
        } else if (learnedIds.includes("old-root-seizes-a-body")) {
          successor = eligible
            .filter((target) => distanceSquared(event.x, event.y, target.x, target.y) <= 150 ** 2)
            .sort((a, b) => distanceSquared(event.x, event.y, a.x, a.y) - distanceSquared(event.x, event.y, b.x, b.y))[0];
          lineage.value *= 0.5;
        } else if (learnedIds.includes("strong-seed-chooses-its-host")) {
          successor = [...eligible].sort((a, b) =>
            (b.rank === "elite" || b.rank === "boss" ? 2 : 0) + b.healthRatio -
            ((a.rank === "elite" || a.rank === "boss" ? 2 : 0) + a.healthRatio)
          )[0];
        } else {
          successor = [...eligible].sort((a, b) =>
            distanceSquared(event.x, event.y, a.x, a.y) - distanceSquared(event.x, event.y, b.x, b.y)
          )[0];
          lineage.value = 0;
        }

        if (!successor && learnedIds.includes("old-root-seizes-a-body")) {
          state.anchors = state.anchors.filter((anchor) => anchor !== lineage);
          continue;
        }
        lineage.targetId = successor?.targetId;
        lineage.x = successor?.x ?? event.x;
        lineage.y = successor?.y ?? event.y;
        lineage.infectionStage = lineage.value >= 7000 ? 2 : lineage.value >= 3000 ? 1 : 0;
        lineage.remainingMs = successor
          ? undefined
          : learnedIds.includes("strong-seed-chooses-its-host") ? 4000 : 1600;
        if (successor) {
          occupied.add(successor.targetId);
          commands.push({
            kind: "authored-root-infection",
            hosts: [{ targetId: successor.targetId, x: successor.x, y: successor.y }],
            sourceGongfaId: runtime.gongfaId
          });
        }
      }
      state.charges = state.anchors.filter((anchor) => anchor.kind === "infection").length;
      state.resource = state.charges / Math.max(1, state.maxCharges);
    }

    if (runtime.gongfaId === "myriad-beast-grove") {
      const marks = Math.floor(state.targetLedger[event.targetId] ?? 0);
      const markCount = (marks & 1 ? 1 : 0) + (marks & 2 ? 1 : 0) + (marks & 4 ? 1 : 0);
      const twoBeasts = learnedIds.includes("two-beasts-aid-each-other");
      const threeSpirits = learnedIds.includes("three-spirits-hunt-together");
      const rotating = learnedIds.includes("unending-rotating-hunt");
      const livingPack = state.anchors.filter((anchor) => anchor.kind === "beast" && anchor.beastState === "living");
      const qualifying = markCount >= (twoBeasts ? 2 : 2);
      if (qualifying) {
        const combination = marks & 7;
        const repeated = rotating && state.targetLedger[-44] === combination;
        const complete = markCount === 3 && livingPack.length === 3;
        let gain = twoBeasts ? 0.22 : complete ? 0.34 : 0.18;
        if (threeSpirits) gain = complete ? 0.68 : 0;
        if (rotating && repeated) gain = 0;
        state.resource = Math.min(1, state.resource + (twoBeasts ? gain / 0.7 : gain));
        if (rotating && gain > 0) state.targetLedger[-44] = combination;
        if (complete) {
          for (const beast of livingPack) {
            beast.value = Math.min(beast.maxValue ?? 1, beast.value + (beast.maxValue ?? 1) * 0.3);
          }
        }
      }
      delete state.targetLedger[event.targetId];
      state.secondaryResource = livingPack.length / 3;
    }
    return;
  }

  if (event.kind === "authored-beast-assist" && runtime.gongfaId === "myriad-beast-grove") {
    const bit = event.species === "boar" ? 1 : event.species === "fox" ? 2 : 4;
    state.targetLedger[event.targetId] = Math.floor(state.targetLedger[event.targetId] ?? 0) | bit;
    return;
  }

  if (event.kind === "authored-edict-result" && runtime.gongfaId === "heaven-sundering-edict") {
    const lenient = learnedIds.includes("lenient-record");
    const aggravated = learnedIds.includes("aggravated-judgment");
    const collective = learnedIds.includes("collective-sentence");
    let gain = event.doubleHits * 0.18 + (lenient ? event.partialHits * 0.05 : 0);
    if (aggravated) gain = event.eliteDoubleHits * 0.36 + (event.doubleHits - event.eliteDoubleHits) * 0.06;
    if (collective) gain *= event.doubleHits >= 3 ? 2 : 0.45;
    if (learnedIds.includes("swift-short-edict")) gain *= 0.68;
    state.resource = Math.min(lenient ? 0.78 : 1, state.resource + gain);
    const records = event.lines.map((line) => ({
      kind: "trail" as const, x: line.x, y: line.y, angle: line.angle,
      value: event.lineQuality, maxValue: line.length
    }));
    if (learnedIds.includes("twin-edicts")) {
      state.anchors = [...state.anchors.filter((anchor) => anchor.kind !== "trail"), ...state.anchors.filter((anchor) => anchor.kind === "trail"), ...records].slice(-2);
    } else {
      const best = [...state.anchors.filter((anchor) => anchor.kind === "trail"), ...records]
        .sort((a, b) => b.value - a.value)[0];
      state.anchors = best ? [best] : [];
    }
    state.secondaryResource = event.lineQuality;
    state.charges = state.anchors.length;
    return;
  }

  if (event.kind === "authored-sun-result" && runtime.gongfaId === "nine-sun-calamity-seal") {
    state.phase = 0;
    if (event.supreme) {
      state.charges = 0; state.resource = 0; state.secondaryResource = 0;
      return;
    }
    let omens = 0;
    if (learnedIds.includes("center-forged-solar-soul")) omens = event.centerHits > 0 ? 2 : 0;
    else if (learnedIds.includes("myriad-beings-calamity")) omens = Math.min(3, event.hitCount);
    else if (event.missed && learnedIds.includes("returning-afterglow")) {
      omens = 1; state.secondaryResource = Math.min(9, state.secondaryResource + 1);
    } else if (event.hitCount > 0) omens = 1;
    state.charges = Math.min(9, state.charges + omens);
    return;
  }

  if (event.kind === "evade" && runtime.gongfaId === "myriad-beast-grove") {
    const playerX = event.playerX ?? 0;
    const playerY = event.playerY ?? 0;
    const offsets = [[-42, 24], [42, 24], [0, -46]] as const;
    state.anchors.filter((anchor) => anchor.kind === "beast").forEach((beast, index) => {
      beast.x = playerX + (offsets[index]?.[0] ?? 0);
      beast.y = playerY + (offsets[index]?.[1] ?? 0);
      beast.targetId = undefined;
    });
    state.targetLedger[-40] = 620;
    return;
  }

  if (
    event.kind === "evade" && runtime.gongfaId === "sword-burial-formation" &&
    learnedIds.includes("seal-grave-treading-stars")
  ) {
    const playerX = event.playerX ?? 0;
    const playerY = event.playerY ?? 0;
    const sealedCount = state.anchors.filter((anchor) => anchor.kind === "grave-sword" && anchor.sealed).length;
    if (sealedCount < 6) {
      const nearest = state.anchors
        .filter((anchor) => anchor.kind === "grave-sword" && !anchor.sealed)
        .sort((a, b) =>
          distanceSquared(a.x, a.y, playerX, playerY) - distanceSquared(b.x, b.y, playerX, playerY)
        )[0];
      if (nearest && distanceSquared(nearest.x, nearest.y, playerX, playerY) <= 76 ** 2) {
        nearest.sealed = true;
        nearest.value *= 1.35;
      }
    }
    return;
  }

  if (event.kind !== "tick") return;

  if (runtime.gongfaId === "flame-demon-body-art") {
    state.secondaryResource = Math.max(0, Math.min(1, event.healthRatio ?? 1));
    state.resource = 1 - state.secondaryResource;
  }
  if (event.isMoving) {
    state.continuousMovementMs += event.deltaMs;
    state.continuousDistance += Math.max(0, event.movementDistance ?? 0);
    state.lastMovementAngle = event.movementAngle ?? state.lastMovementAngle;
  } else {
    state.continuousMovementMs = 0;
    state.continuousDistance = 0;
    state.lastMovementAngle = undefined;
  }

  if (runtime.gongfaId === "black-tide-scripture") {
    const lockRemaining = state.targetLedger[-99] ?? 0;
    if (lockRemaining > 0) {
      state.targetLedger[-99] = Math.max(0, lockRemaining - event.deltaMs);
    } else {
      const direction = Math.max(0, Math.min(3, Math.floor(state.secondaryResource)));
      const movementAngle = event.movementAngle;
      const flowAlignment = event.isMoving && movementAngle !== undefined
        ? Math.cos(movementAngle - cardinalFlowAngle(direction))
        : 0;
      const timeScale = learnedIds.includes("heaven-timed-tide")
        ? 0.78
        : learnedIds.includes("ride-the-tide")
          ? flowAlignment > 0.55 ? 2.2 : flowAlignment < -0.55 ? 0.9 : 1
          : learnedIds.includes("hold-the-moon-against-the-tide")
            ? flowAlignment < -0.55 ? 0.34 : flowAlignment > 0.55 ? 1.15 : 1
            : flowAlignment > 0.55 ? 1.45 : flowAlignment < -0.55 ? 0.68 : 1;
      state.phaseElapsedMs += event.deltaMs * timeScale;
      let phaseDuration = state.phase === 2 && learnedIds.includes("dry-sea-splits-the-shore") ? 3000 : 6200;
      while (state.phaseElapsedMs >= phaseDuration) {
        state.phaseElapsedMs -= phaseDuration;
        state.phase += 1;
        if (state.phase > 2) {
          state.phase = 0;
          state.cycleCount += 1;
          state.secondaryResource = (direction + 2) % 4;
        }
        phaseDuration = state.phase === 2 && learnedIds.includes("dry-sea-splits-the-shore") ? 3000 : 6200;
      }
      state.resource = Math.min(1, state.phaseElapsedMs / phaseDuration);
      state.charges = Math.min(3, state.cycleCount);
    }
  } else if (!["ancient-tree-body-art", "heavenfall-body-art"].includes(runtime.gongfaId)) {
    state.phaseElapsedMs += event.deltaMs;
  }

  if (runtime.gongfaId === "vermilion-bird-covenant") {
    let bird = state.anchors.find((anchor) => anchor.kind === "companion");
    if (!bird) {
      bird = {
        kind: "companion", companionState: "guard", x: event.playerX ?? 0, y: event.playerY ?? 0,
        value: 1, maxValue: 1
      };
      state.anchors.push(bird);
    }
    const targets = event.targets ?? [];
    const playerX = event.playerX ?? 0;
    const playerY = event.playerY ?? 0;
    const birdState = bird.companionState ?? "guard";
    let stateTimer = state.targetLedger[-30] ?? 0;
    const bondCap = learnedIds.includes("nurtured-covenant") ? 0.65 : 1;
    let rawBond = Math.min(bondCap, state.targetLedger[-20] ?? 0);
    const downBird = (): void => {
      bird!.companionState = "ember";
      bird!.value = 0;
      bird!.maxValue = 1;
      stateTimer = 0;
      rawBond = 0;
      state.resource = 0;
    };

    if (birdState === "guard" || birdState === "phoenix") {
      bird.x = playerX;
      bird.y = playerY;
      if (event.isMoving && targets.length > 0) {
        const headHunt = learnedIds.includes("crimson-feather-head-hunt");
        const guardian = learnedIds.includes("cinnabar-plume-guardian");
        const sweeping = learnedIds.includes("firewing-sweeping-formation");
        const ordered = [...targets].sort((a, b) => {
          if (headHunt) {
            const rankA = a.rank === "boss" ? 3 : a.rank === "elite" ? 2 : 1;
            const rankB = b.rank === "boss" ? 3 : b.rank === "elite" ? 2 : 1;
            return rankB + b.healthRatio - (rankA + a.healthRatio);
          }
          return distanceSquared(a.x, a.y, playerX, playerY) - distanceSquared(b.x, b.y, playerX, playerY);
        });
        const chosen = sweeping ? ordered.slice(0, 3) : ordered.slice(0, 1);
        const waypoints = chosen.map((target) => {
          if (!guardian) return { x: target.x, y: target.y, targetId: target.targetId };
          const angle = Math.atan2(target.y - playerY, target.x - playerX);
          const distance = Math.min(105, Math.hypot(target.x - playerX, target.y - playerY));
          return {
            x: playerX + Math.cos(angle) * distance,
            y: playerY + Math.sin(angle) * distance,
            targetId: target.targetId
          };
        });
        const destination = waypoints[waypoints.length - 1]!;
        commands.push({
          kind: "authored-vermilion-flight",
          from: { x: bird.x, y: bird.y },
          waypoints,
          damage: Math.max(1, Math.floor(runtime.combat.damage *
            (headHunt ? 3.1 : guardian ? 1.3 : sweeping ? 1.05 : 2.1) *
            Math.max(0.65, bird.maxValue ?? 1))),
          width: guardian ? 26 : sweeping ? 54 : 34,
          maxHits: sweeping ? 3 : 1,
          terminal: false,
          sourceGongfaId: runtime.gongfaId
        });
        bird.x = destination.x;
        bird.y = destination.y;
        bird.targetId = destination.targetId;
        bird.companionState = "outbound";
        bird.angle = Math.atan2(destination.y - playerY, destination.x - playerX);
        stateTimer = 0;
      }
    } else if (birdState === "outbound") {
      const guardian = learnedIds.includes("cinnabar-plume-guardian");
      const sweeping = learnedIds.includes("firewing-sweeping-formation");
      const headHunt = learnedIds.includes("crimson-feather-head-hunt");
      stateTimer += event.deltaMs;
      const dangerCount = targets.filter((target) => distanceSquared(target.x, target.y, bird!.x, bird!.y) <= 72 ** 2).length;
      const dangerScale = guardian ? 0.45 : headHunt ? 1.5 : sweeping ? 1.2 : 1;
      bird.value -= dangerCount * event.deltaMs * 0.000075 * dangerScale;
      const outboundDuration = guardian ? 560 : headHunt ? 1250 : sweeping ? 1400 : 900;
      if (bird.value <= 0) {
        downBird();
      } else if (!event.isMoving || stateTimer >= outboundDuration) {
        const returnAngle = Math.atan2(playerY - bird.y, playerX - bird.x);
        commands.push({
          kind: "authored-vermilion-flight",
          from: { x: bird.x, y: bird.y },
          waypoints: [{ x: playerX, y: playerY }],
          damage: 0,
          width: 18,
          maxHits: 0,
          terminal: false,
          sourceGongfaId: runtime.gongfaId
        });
        bird.angle = returnAngle;
        bird.x = playerX;
        bird.y = playerY;
        bird.companionState = "return";
        stateTimer = 0;
      }
    } else if (birdState === "return") {
      const paired = learnedIds.includes("paired-wing-flight");
      const alignment = paired && event.isMoving && event.movementAngle !== undefined
        ? Math.cos(event.movementAngle - (bird.angle ?? 0))
        : 0;
      stateTimer += event.deltaMs * (paired ? alignment > 0.5 ? 1.55 : alignment < -0.5 ? 0.55 : 1 : 1);
      if (stateTimer >= 720) {
        const lowHealthReturn = bird.value / Math.max(0.01, bird.maxValue ?? 1) < 0.5;
        const bondGain = learnedIds.includes("blood-covenant-of-fire-bathing")
          ? lowHealthReturn ? 0.42 : 0.18
          : paired ? alignment > 0.5 ? 0.32 : 0.16 : 0.22;
        rawBond = Math.min(bondCap, rawBond + bondGain);
        if (learnedIds.includes("nurtured-covenant")) {
          bird.value = Math.min(bird.maxValue ?? 1, bird.value + (bird.maxValue ?? 1) * 0.24);
        }
        bird.companionState = (bird.maxValue ?? 1) > 1 ? "phoenix" : "guard";
        bird.x = playerX;
        bird.y = playerY;
        stateTimer = 0;
      }
    } else if (birdState === "ember") {
      stateTimer += event.deltaMs;
      const recoveryMs = learnedIds.includes("urgent-ember-egg") ? 2400 :
        learnedIds.includes("true-plume-nirvana") ? 5200 : 4200;
      if (stateTimer >= recoveryMs) {
        bird.companionState = "guard";
        bird.maxValue = learnedIds.includes("urgent-ember-egg") ? 0.68 : 0.82;
        bird.value = bird.maxValue;
        bird.x = playerX;
        bird.y = playerY;
        stateTimer = 0;
      }
    } else if (birdState === "egg") {
      const closeToEgg = distanceSquared(playerX, playerY, bird.x, bird.y) <= 115 ** 2;
      stateTimer += event.deltaMs * (closeToEgg ? 2 : 1);
      const attackers = targets.filter((target) => distanceSquared(target.x, target.y, bird!.x, bird!.y) <= 62 ** 2).length;
      bird.value -= attackers * event.deltaMs * 0.00006;
      const hatchMs = learnedIds.includes("urgent-ember-egg") ? 2200 :
        learnedIds.includes("true-plume-nirvana") ? 5600 : 4200;
      if (bird.value <= 0) {
        downBird();
      } else if (stateTimer >= hatchMs) {
        const truePlume = learnedIds.includes("true-plume-nirvana");
        bird.maxValue = truePlume ? 1.4 : learnedIds.includes("urgent-ember-egg") ? 0.68 : 0.58;
        bird.value = bird.maxValue;
        bird.companionState = truePlume ? "phoenix" : "guard";
        bird.x = playerX;
        bird.y = playerY;
        stateTimer = 0;
      }
    }
    state.targetLedger[-20] = rawBond;
    state.targetLedger[-21] = bondCap;
    state.targetLedger[-30] = stateTimer;
    state.resource = rawBond / bondCap;
    state.secondaryResource = Math.max(0, bird.value / Math.max(0.01, bird.maxValue ?? 1));
    state.phase = ["guard", "outbound", "return", "ember", "egg", "phoenix"].indexOf(bird.companionState ?? "guard");
    state.charges = bird.companionState === "ember" ? 0 : 1;
  }

  if (runtime.gongfaId === "myriad-beast-grove") {
    const playerX = event.playerX ?? 0;
    const playerY = event.playerY ?? 0;
    const targets = event.targets ?? [];
    const forms = {
      boar: learnedIds.includes("black-tortoise-guards-the-grove") ? "black-tortoise" : "rock-boar",
      fox: learnedIds.includes("mountain-lord-enters-the-grove") ? "mountain-lord" : "spirit-fox",
      deer: learnedIds.includes("white-ape-calls-the-pack") ? "white-ape" : "verdant-deer"
    } as const;
    const pack = state.anchors.filter((anchor) => anchor.kind === "beast");
    const protectionRemaining = Math.max(0, (state.targetLedger[-45] ?? 0) - event.deltaMs);
    state.targetLedger[-45] = protectionRemaining;
    for (const beast of pack) {
      const species = beast.beastSpecies ?? "boar";
      beast.beastForm = forms[species];
      if (beast.beastState === "downed") {
        beast.rebirthMs = Math.max(0, (beast.rebirthMs ?? 5000) - event.deltaMs);
        if (beast.rebirthMs <= 0) {
          beast.beastState = "living";
          beast.value = beast.maxValue ?? 1;
          beast.x = playerX;
          beast.y = playerY;
        }
        continue;
      }
      const nearbyThreats = targets.filter((target) => distanceSquared(target.x, target.y, beast.x, beast.y) <= 64 ** 2).length;
      beast.value -= nearbyThreats * event.deltaMs * 0.000022 * (protectionRemaining > 0 ? 0.18 : 1);
      if (beast.value <= 0) {
        beast.value = 0;
        beast.beastState = "downed";
        beast.rebirthMs = Math.max(3600, 6000 - runtime.combat.count * 200);
        beast.targetId = undefined;
      }
    }
    const living = pack.filter((beast) => beast.beastState === "living");
    let cooldown = Math.max(0, (state.targetLedger[-40] ?? 0) - event.deltaMs);
    if (cooldown <= 0 && targets.length > 0) {
      for (const beast of living) {
        const species = beast.beastSpecies ?? "boar";
        const form = beast.beastForm ?? forms[species];
        const candidates = form === "mountain-lord"
          ? targets.filter((target) => target.rank === "elite" || target.rank === "boss")
          : targets;
        const target = [...candidates].sort((a, b) => {
          if (form === "mountain-lord") {
            const weight = (target: AuthoredTargetFact): number => target.rank === "boss" ? 3 : target.rank === "elite" ? 2 : 0;
            return weight(b) + b.healthRatio - weight(a) - a.healthRatio;
          }
          if (form === "black-tortoise") {
            return distanceSquared(a.x, a.y, playerX, playerY) - distanceSquared(b.x, b.y, playerX, playerY);
          }
          if (species === "boar") {
            const density = (target: AuthoredTargetFact): number => targets.filter((other) =>
              distanceSquared(target.x, target.y, other.x, other.y) <= 88 ** 2
            ).length;
            return density(b) - density(a);
          }
          if (species === "fox") {
            const isolation = (target: AuthoredTargetFact): number => targets.filter((other) =>
              other !== target && distanceSquared(target.x, target.y, other.x, other.y) <= 90 ** 2
            ).length;
            return a.healthRatio + isolation(a) * 0.2 - b.healthRatio - isolation(b) * 0.2;
          }
          return distanceSquared(a.x, a.y, playerX, playerY) - distanceSquared(b.x, b.y, playerX, playerY);
        })[0];
        if (!target) continue;
        const from = { x: beast.x, y: beast.y };
        const recalled = !event.isMoving;
        if (recalled) {
          const angle = species === "boar" ? 2.5 : species === "fox" ? 0.65 : -Math.PI / 2;
          beast.x = playerX + Math.cos(angle) * 48;
          beast.y = playerY + Math.sin(angle) * 48;
        } else if (species === "deer") {
          beast.x = playerX;
          beast.y = playerY - 48;
        } else {
          const spread = species === "boar" ? -34 : 34;
          beast.x = target.x + spread;
          beast.y = target.y + 18;
        }
        beast.targetId = target.targetId;
        commands.push({
          kind: "authored-beast-action",
          species,
          form,
          from,
          target,
          damage: Math.max(1, Math.floor(runtime.combat.damage *
            (form === "mountain-lord" ? 2.1 : form === "black-tortoise" ? 0.62 : form === "white-ape" ? 0.72 : species === "fox" ? 1.3 : 0.9))),
          radius: (form === "black-tortoise" ? 26 : species === "boar" ? 64 : form === "white-ape" ? 48 : 22) +
            runtime.combat.pierce * 4,
          rootMs: species === "deer" && form !== "white-ape" ? 720 : 0,
          sourceGongfaId: runtime.gongfaId
        });
      }
      cooldown = Math.max(720, 1260 - runtime.combat.count * 55);
    }
    state.targetLedger[-40] = cooldown;
    state.charges = living.length;
    state.secondaryResource = living.length / 3;
  }

  if (runtime.gongfaId === "ancient-tree-body-art") {
    const playerX = event.playerX ?? 0;
    const playerY = event.playerY ?? 0;
    const moving = event.isMoving === true;
    const thousand = learnedIds.includes("one-ring-in-a-thousand-years");
    const spring = learnedIds.includes("spring-flourishing");
    const fusang = learnedIds.includes("spirit-fruit-fusang");
    const maxRings = thousand ? 3 : spring ? 7 : 5;
    state.maxCharges = maxRings;
    if (state.phase === 0) {
      state.resource = 0;
      state.charges = 0;
      state.phaseElapsedMs = moving || event.nearbyEnemyCount === 0 ? 0 : state.phaseElapsedMs + event.deltaMs;
      if (state.phaseElapsedMs >= 520) { state.phase = 1; state.phaseElapsedMs = 0; }
    } else if (state.phase === 1) {
      if (moving) {
        state.phase = 2;
        state.phaseElapsedMs = 360 + state.charges * (spring ? 310 : 170);
      } else {
        const interval = thousand ? 2600 : spring ? 620 : fusang ? 1900 : 1250;
        state.secondaryResource += event.deltaMs;
        while (state.secondaryResource >= interval && state.charges < maxRings) {
          state.secondaryResource -= interval;
          state.charges += 1;
        }
        state.resource = state.charges / maxRings;
      }
    } else if (state.phase === 2) {
      state.phaseElapsedMs = Math.max(0, state.phaseElapsedMs - event.deltaMs);
      if (state.phaseElapsedMs === 0) {
        state.phase = 0; state.charges = 0; state.resource = 0; state.secondaryResource = 0;
      }
    } else if (state.phase === 3) {
      state.phaseElapsedMs = Math.max(0, state.phaseElapsedMs - event.deltaMs);
      if (state.phaseElapsedMs === 0) {
        state.phase = 0; state.charges = 0; state.resource = 0; state.secondaryResource = 0;
      }
    }
    let attackTimer = Math.max(0, (state.targetLedger[-60] ?? 0) - event.deltaMs);
    if ((state.phase === 1 || state.phase === 3) && attackTimer === 0 && event.nearbyEnemyCount > 0) {
      const banyan = learnedIds.includes("great-rooted-banyan");
      const ironCrown = learnedIds.includes("iron-crowned-divine-tree");
      const law = learnedIds.includes("one-tree-upholds-heaven") ? "one-tree" as const :
        learnedIds.includes("world-sheltering-canopy") ? "sheltering" as const : "many-roots" as const;
      const ringPower = thousand ? 1.65 : spring ? 0.72 : 1;
      commands.push({
        kind: "authored-ancient-tree-cycle", x: playerX, y: playerY, rings: state.charges,
        rootRadius: (banyan ? 112 : ironCrown ? 48 : 72) + state.charges * (banyan ? 15 : 10),
        branchSectors: Math.max(1, state.charges + 1),
        canopyRadius: (fusang ? 150 : 205) + state.charges * 18,
        damage: Math.max(1, Math.floor(runtime.combat.damage * ringPower * (banyan ? 0.58 : fusang ? 0.62 : 1) * (state.phase === 3 ? 1.45 : 0.72))),
        law, heal: fusang || law === "sheltering" ? 2 + state.charges : 0,
        worldTree: state.phase === 3, canopyFocus: ironCrown, sourceGongfaId: runtime.gongfaId
      });
      attackTimer = state.phase === 3 ? 520 : 920;
    }
    state.targetLedger[-60] = attackTimer;
  }

  if (runtime.gongfaId === "heavenfall-body-art") {
    const moving = event.isMoving === true;
    const targets = event.targets ?? [];
    const playerX = event.playerX ?? 0;
    const playerY = event.playerY ?? 0;
    for (const key of Object.keys(state.targetLedger).map(Number).filter((key) => key > 0)) {
      state.targetLedger[key] = Math.max(0, state.targetLedger[key]! - event.deltaMs);
    }
    if (state.phase === 0) {
      state.phaseElapsedMs = moving && targets.length > 0 ? state.phaseElapsedMs + event.deltaMs : 0;
      if (state.phaseElapsedMs >= 420) {
        state.phase = 1; state.phaseElapsedMs = 0; state.resource = 0; state.secondaryResource = 0;
        state.lastMovementAngle = event.movementAngle;
        state.targetLedger[-70] = event.movementAngle ?? 0;
      }
    } else if (state.phase === 1) {
      state.phaseElapsedMs += event.deltaMs;
      const angle = event.movementAngle ?? state.lastMovementAngle ?? 0;
      const previousHeading = state.targetLedger[-70];
      const turn = previousHeading === undefined ? 0 : Math.abs(Math.atan2(
        Math.sin(angle - previousHeading), Math.cos(angle - previousHeading)
      ));
      const light = learnedIds.includes("wandering-star-light-body");
      const giant = learnedIds.includes("heavenfall-giant-body");
      const noReturn = learnedIds.includes("no-return-advance");
      const pivot = learnedIds.includes("heaven-turning-pivot");
      const cap = light ? 0.68 : pivot ? 0.78 : 1;
      if (!moving) state.resource = Math.max(0, state.resource - event.deltaMs * 0.0011);
      else if (turn > 1.05) {
        if (pivot && state.secondaryResource < 1) { state.resource *= 0.5; state.secondaryResource = 1; }
        else state.resource = noReturn ? 0 : Math.max(0, state.resource - 0.36);
      } else {
        const gain = giant ? 0.00011 : noReturn && turn < 0.18 ? 0.00034 : 0.0002;
        state.resource = Math.min(cap, state.resource + event.deltaMs * gain);
      }
      state.lastMovementAngle = angle;
      state.targetLedger[-70] = angle;
      const radius = (learnedIds.includes("star-piercing-iron-body") ? 24 : giant ? 58 : 38) + state.resource * 24;
      const eligible = targets.filter((target) => target.rank === "ordinary" &&
        distanceSquared(target.x, target.y, playerX, playerY) <= radius ** 2 &&
        (state.targetLedger[target.targetId] ?? 0) <= 0
      );
      if (eligible.length > 0) {
        for (const target of eligible) state.targetLedger[target.targetId] = 720;
        commands.push({
          kind: "authored-heavenfall-body", x: playerX, y: playerY, radius,
          damage: Math.max(1, Math.floor(runtime.combat.damage * (0.5 + state.resource * 0.65))),
          force: 90 + state.resource * 190, eligibleTargetIds: eligible.map((target) => target.targetId),
          sourceGongfaId: runtime.gongfaId
        });
      }
      if (state.phaseElapsedMs >= 6200 && !runtime.mastery.masterySkill2Id) {
        state.phase = 0; state.phaseElapsedMs = 0; state.resource = 0;
      }
    }
  }

  if (runtime.gongfaId === "nine-sun-calamity-seal" && state.phase === 0) {
    const cap = learnedIds.includes("fixed-noon-sun") ? 0.67 : learnedIds.includes("swift-eclipse-calamity") ? 0.78 : 1;
    const rate = learnedIds.includes("swift-eclipse-calamity") ? 0.000085 : 0.000055;
    state.resource = Math.min(cap, state.resource + event.deltaMs * rate);
  }
  if (runtime.gongfaId === "scarlet-wave-manual") {
    const trails = state.anchors.filter((anchor) => anchor.kind === "trail");
    if (state.phase === 1 && trails.length === 0) state.phase = 0;
    if (state.phase === 2) {
      state.targetLedger[-80] = Math.max(0, (state.targetLedger[-80] ?? 600) - event.deltaMs);
      if (state.targetLedger[-80] === 0) state.phase = 0;
    }
    state.resource = state.phase / 2;
    state.charges = Math.min(3, state.cycleCount);
  }

  state.anchors = state.anchors.filter((anchor) => {
    if (anchor.remainingMs === undefined) return true;
    anchor.remainingMs -= event.deltaMs;
    return anchor.remainingMs > 0;
  });

  if (runtime.gongfaId === "mist-wraith-canon") {
    const playerX = event.playerX ?? 0;
    const playerY = event.playerY ?? 0;
    const collectionRadius = learnedIds.includes("long-banner-soul-call")
      ? 140
      : learnedIds.includes("tread-corpse-guide-soul")
        ? 40
        : 68;
    const capacity = learnedIds.includes("life-seeking-fierce-wraith")
      ? Math.min(5, state.maxCharges)
      : learnedIds.includes("lantern-returning-underworld-attendant")
        ? state.maxCharges + 3
        : learnedIds.includes("long-banner-soul-call")
          ? Math.max(1, state.maxCharges - 2)
          : state.maxCharges;
    let storedCount = state.anchors.filter((anchor) => anchor.kind === "stored-soul").length;
    for (const anchor of state.anchors) {
      const inCollectionRange = distanceSquared(anchor.x, anchor.y, playerX, playerY) <= collectionRadius ** 2;
      const needsVigil = learnedIds.includes("halt-lantern-keep-vigil") && anchor.kind === "corpse-soul";
      if (needsVigil && inCollectionRange) {
        const ledgerId = anchor.targetId ?? -1;
        state.targetLedger[ledgerId] = event.isMoving
          ? 0
          : (state.targetLedger[ledgerId] ?? 0) + event.deltaMs;
        if ((state.targetLedger[ledgerId] ?? 0) < 800) continue;
        anchor.value += 1;
      }
      if (
        anchor.kind === "corpse-soul" &&
        storedCount < capacity &&
        inCollectionRange
      ) {
        anchor.kind = "stored-soul";
        if (learnedIds.includes("tread-corpse-guide-soul")) anchor.value *= 1.35;
        anchor.remainingMs = (anchor.value >= 3 ? 20_000 : anchor.value >= 2 ? 14_000 : 9_000) *
          (learnedIds.includes("tread-corpse-guide-soul") ? 1.5 : 1);
        storedCount += 1;
      }
      if (anchor.kind === "stored-soul") {
        anchor.x = playerX;
        anchor.y = playerY;
      }
    }
    state.charges = storedCount;
    state.resource = storedCount / Math.max(1, capacity);
  }

  if (runtime.gongfaId === "sword-burial-formation") {
    const targets = event.targets ?? [];
    const retained = [] as typeof state.anchors;
    for (const anchor of state.anchors) {
      if (anchor.kind !== "grave-sword") {
        retained.push(anchor);
        continue;
      }
      if (anchor.sealed && learnedIds.includes("seal-grave-treading-stars")) {
        retained.push(anchor);
        continue;
      }
      const triggerRadius = learnedIds.includes("rise-at-living-presence") ? 72 : 46;
      const trespasser = targets.find(
        (target) =>
          (!learnedIds.includes("recognize-calamity-leave-sheath") || target.rank !== "ordinary") &&
          distanceSquared(anchor.x, anchor.y, target.x, target.y) <= triggerRadius ** 2
      );
      if (!trespasser) {
        retained.push(anchor);
        continue;
      }
      commands.push({
        kind: "authored-line-strike",
        style: "grave-sword-rise",
        origin: { x: anchor.x, y: anchor.y },
        angle: anchor.angle ?? 0,
        damage: runtime.combat.damage * anchor.value *
          (learnedIds.includes("recognize-calamity-leave-sheath") ? 1.35 :
            learnedIds.includes("seal-grave-treading-stars") ? 0.72 : 1),
        width: Math.max(18, runtime.combat.auraRadius * 0.42),
        length: Math.max(260, runtime.combat.range),
        sourceGongfaId: runtime.gongfaId
      });
    }
    state.anchors = retained;
    state.charges = retained.filter((anchor) => anchor.kind === "grave-sword").length;
    state.resource = state.charges / Math.max(1, state.maxCharges);
  }

  if (runtime.gongfaId === "frozen-river-formation") {
    const targets = event.targets ?? [];
    const origins = state.anchors.filter((anchor) => anchor.kind === "seal" && anchor.sealRole !== "crossing");
    const crossings = state.anchors.filter((anchor) => anchor.kind === "seal" && anchor.sealRole === "crossing");
    for (const origin of origins) {
      if (origin.targetId === undefined) {
        const waitingCandidates = targets.filter((target) =>
          distanceSquared(origin.x, origin.y, target.x, target.y) <= 58 ** 2
        );
        const waitingRecipient = waitingCandidates.sort((a, b) => {
          if (learnedIds.includes("cold-debt-pursues-the-weak")) return a.healthRatio - b.healthRatio;
          if (learnedIds.includes("cold-debt-migrates-afar")) {
            const px = event.playerX ?? 0;
            const py = event.playerY ?? 0;
            return distanceSquared(b.x, b.y, px, py) - distanceSquared(a.x, a.y, px, py);
          }
          return b.healthRatio - a.healthRatio;
        })[0];
        if (waitingRecipient) {
          origin.targetId = waitingRecipient.targetId;
          origin.sealRole = "origin";
        }
        continue;
      }
      const debtor = targets.find((target) => target.targetId === origin.targetId);
      if (!debtor) {
        origin.targetId = undefined;
        origin.sealRole = "waiting";
        continue;
      }
      const crossed = crossings.find((seal) =>
        seal.chainId !== origin.chainId && distanceSquared(seal.x, seal.y, debtor.x, debtor.y) <= 42 ** 2
      );
      if (!crossed) continue;

      const segmentX = crossed.x - origin.x;
      const segmentY = crossed.y - origin.y;
      const segmentLengthSq = Math.max(1, segmentX * segmentX + segmentY * segmentY);
      const caught = targets.filter((target) => {
        if (target.targetId === debtor.targetId) return false;
        const projection = Math.max(0, Math.min(1,
          ((target.x - origin.x) * segmentX + (target.y - origin.y) * segmentY) / segmentLengthSq
        ));
        const closestX = origin.x + segmentX * projection;
        const closestY = origin.y + segmentY * projection;
        return distanceSquared(target.x, target.y, closestX, closestY) <= 36 ** 2;
      });
      const recipient = caught.sort((a, b) => {
        if (learnedIds.includes("cold-debt-pursues-the-weak")) return a.healthRatio - b.healthRatio;
        if (learnedIds.includes("cold-debt-migrates-afar")) {
          const px = event.playerX ?? 0;
          const py = event.playerY ?? 0;
          return distanceSquared(b.x, b.y, px, py) - distanceSquared(a.x, a.y, px, py);
        }
        return b.healthRatio - a.healthRatio;
      })[0];
      commands.push({
        kind: "authored-frozen-river",
        from: { x: origin.x, y: origin.y },
        to: { x: crossed.x, y: crossed.y },
        damage: Math.max(1, Math.floor(runtime.combat.damage * origin.value)),
        width: learnedIds.includes("lone-bridge-final-crossing") ? 24 :
          learnedIds.includes("three-ford-branching-flow") ? 54 :
            learnedIds.includes("curving-nether-river") ? 68 : 42,
        slowMultiplier: learnedIds.includes("curving-nether-river") ? 0.38 : 0.48,
        slowDurationMs: 1300,
        bossDamageScale: learnedIds.includes("curving-nether-river") ? 0.55 : 1,
        sourceGongfaId: runtime.gongfaId
      });
      origin.x = crossed.x;
      origin.y = crossed.y;
      origin.targetId = recipient?.targetId;
      origin.sealRole = recipient ? "origin" : "waiting";
      origin.remainingMs = runtime.combat.projectileLifetimeMs * 1.4;
      state.anchors = state.anchors.filter((anchor) => anchor !== crossed);
      state.cycleCount += 1;
    }
    state.charges = origins.filter((origin) => origin.targetId !== undefined).length;
    state.resource = Math.min(1, state.cycleCount / 3);
  }

  if (runtime.gongfaId === "thousand-root-formation") {
    const targets = event.targets ?? [];
    const infections = state.anchors.filter((anchor) => anchor.kind === "infection");
    const occupied = new Set(infections.map((anchor) => anchor.targetId));
    for (const infection of infections) {
      if (infection.targetId === undefined) {
        const candidates = targets.filter((target) => !occupied.has(target.targetId));
        const successor = [...candidates].sort((a, b) => {
          if (learnedIds.includes("strong-seed-chooses-its-host")) {
            return (b.rank === "elite" || b.rank === "boss" ? 2 : 0) + b.healthRatio -
              ((a.rank === "elite" || a.rank === "boss" ? 2 : 0) + a.healthRatio);
          }
          return distanceSquared(infection.x, infection.y, a.x, a.y) -
            distanceSquared(infection.x, infection.y, b.x, b.y);
        })[0];
        if (successor) {
          infection.targetId = successor.targetId;
          infection.x = successor.x;
          infection.y = successor.y;
          infection.remainingMs = undefined;
          occupied.add(successor.targetId);
          commands.push({
            kind: "authored-root-infection",
            hosts: [{ targetId: successor.targetId, x: successor.x, y: successor.y }],
            sourceGongfaId: runtime.gongfaId
          });
        }
        continue;
      }
      const host = targets.find((target) => target.targetId === infection.targetId);
      if (!host) continue;
      infection.x = host.x;
      infection.y = host.y;
      const previousStage = infection.infectionStage ?? 0;
      infection.value += event.deltaMs;
      const nextStage = infection.value >= 7000 ? 2 : infection.value >= 3000 ? 1 : 0;
      for (let stage = previousStage + 1; stage <= nextStage; stage += 1) {
        if (stage !== 1 && stage !== 2) continue;
        const heartRoot = learnedIds.includes("heart-piercing-killing-root");
        const branchRoot = learnedIds.includes("body-borrowing-branch-root");
        const coilingRoot = learnedIds.includes("bone-locking-coiling-root");
        commands.push({
          kind: "authored-root-stage",
          targetId: host.targetId,
          x: host.x,
          y: host.y,
          stage,
          damage: Math.max(1, Math.floor(runtime.combat.damage *
            (heartRoot ? stage === 2 ? 1.65 : 1.15 :
              branchRoot ? stage === 2 ? 0.55 : 0.18 :
                coilingRoot ? 0.12 : stage === 2 ? 0.9 : 0.55))),
          radius: branchRoot && stage === 2 ? 115 : coilingRoot ? 34 : 48,
          maxSplashTargets: branchRoot && stage === 2 ? 3 : 0,
          ...(coilingRoot ? {
            slowMultiplier: stage === 2 ? 0.16 : 0.52,
            slowDurationMs: stage === 2 ? 2200 : 1400,
            immobilizeOrdinary: stage === 2
          } : {}),
          sourceGongfaId: runtime.gongfaId
        });
      }
      infection.infectionStage = nextStage;
    }
    state.charges = infections.length;
    state.secondaryResource = infections.filter((infection) => infection.infectionStage === 2).length;
    state.resource = infections.reduce((sum, infection) => sum + Math.min(1, infection.value / 7000), 0) /
      Math.max(1, state.maxCharges);
  }
}

export function advanceGongfaRuntime(
  runtime: GongfaRuntime,
  inputEvent: GongfaRuntimeEvent
): GongfaRuntimeResult {
  const event = {
    ...inputEvent,
    learnedMasteryIds:
      ("learnedMasteryIds" in inputEvent ? inputEvent.learnedMasteryIds : undefined) ??
      runtime.mastery.masteryLearnedIds,
    skill2Id:
      ("skill2Id" in inputEvent ? inputEvent.skill2Id : undefined) ??
      runtime.mastery.masterySkill2Id
  };
  if (
    !runtime.yujian &&
    !runtime.jinfeng &&
    !runtime.gengjin &&
    !runtime.burningRing &&
    !runtime.crimsonFurnace &&
    !runtime.blazingFeather &&
    !runtime.surge &&
    event.kind !== "skill2"
  ) {
    return { runtime, commands: [] };
  }

  let next = copyRuntime(runtime);
  const commands: GongfaRuntimeCommand[] = [];
  advanceAuthoredWorldFacts(next, event, commands);
  if (event.kind === "enemy-death" || event.kind === "authored-beast-assist" || event.kind === "authored-edict-result" || event.kind === "authored-sun-result") {
    return { runtime: next, commands };
  }

  if (
    event.kind === "tick" &&
    event.skill2Enabled !== false &&
    next.mastery.masterySkill2Id
  ) {
    const cooldown = advanceTimedMasterySkill2Cooldown(
      next.mastery.masterySkill2Id,
      next.mastery.masterySkill2CooldownRemaining,
      event.deltaMs
    );
    next.mastery.masterySkill2CooldownRemaining = cooldown.cooldownRemainingMs;
    if (cooldown.readySkill2Id) {
      const skillResult = advanceGongfaRuntime(next, {
        kind: "skill2",
        nearbyEnemyCount: event.nearbyEnemyCount,
        eligibleTargetCount: event.eligibleTargetCount,
        hasMovementDirection: event.hasMovementDirection,
        isMoving: event.isMoving,
        targets: event.targets,
        learnedMasteryIds: event.learnedMasteryIds
      });
      next = skillResult.runtime;
      commands.push(...skillResult.commands);
    }
  }

  if (event.kind === "yujian-projectile-hit") {
    const state = next.yujian;
    if (!state) {
      return { runtime: next, commands };
    }

    if (event.learnedMasteryIds.includes("execution-seal")) {
      const nextStack = Math.min(
        3,
        (state.executionSealStacksByTarget[event.targetId] ?? 0) + 1
      );
      state.executionSealStacksByTarget[event.targetId] = nextStack;

      if (nextStack >= 2) {
        state.executionSealTriggers += 1;
        commands.push({
          kind: "apply-target-damage",
          targetId: event.targetId,
          amount: Math.max(1, Math.floor(next.combat.damage * (0.35 + nextStack * 0.15))),
          source: "execution-seal"
        });
      }
    }

    if (event.learnedMasteryIds.includes("sword-bloom")) {
      state.swordBloomTriggers += 1;
      commands.push({
        kind: "spawn-yujian-bloom",
        originTargetId: event.targetId,
        maxTargets: 2,
        damage: Math.max(1, Math.floor(next.combat.damage * 0.5)),
        pierce: 1
      });
    }

    // Unbroken Sword Intent: a successful hit builds a stack and refreshes its
    // duration (applied after this hit's Skill-1 effects). Myriad Blade
    // Resonance feeds Intent faster.
    const intentGain = (event.learnedMasteryIds.includes("myriad-blade-resonance") ? 2 : 1) +
      masteryEffectTiers(event.learnedMasteryIds, "surgeBuild");
    state.intentStacks = Math.min(5, state.intentStacks + intentGain);
    state.intentDurationRemaining = INTENT_DURATION_MS *
      (1 + masteryEffectTiers(event.learnedMasteryIds, "surgeStability") * 0.25);
    syncYujianCombat(next);

    // Intent Domain: hits leave an Intent-scaled blade field. Evaluated after
    // the gain, matching the equivalent Ember (searing-domain) and Surge
    // (domain) capstones so all three include the just-added stack.
    if (event.learnedMasteryIds.includes("intent-domain") && state.intentStacks > 0) {
      commands.push({
        kind: "aura-burst",
        damage: Math.max(1, Math.floor(next.combat.damage * 0.4)),
        count: 2 + state.intentStacks
      });
    }

    return { runtime: next, commands };
  }

  if (event.kind === "yujian-reversal-spawned") {
    if (next.yujian) {
      next.yujian.reversingSwordPathTriggers += 1;
    }
    return { runtime: next, commands };
  }

  if (event.kind === "skill2") {
    const skill2Stats = skill2RefinementStats(next);
    const skill2Base = skill2Combat(next);
    if (event.skill2Id === "sunset-wave-apex" && next.gongfaId === "scarlet-wave-manual") {
      const record = next.authored.anchors.find((anchor) => anchor.kind === "trail" && anchor.angle !== undefined);
      if (next.authored.cycleCount >= 3 && record) {
        const angle = record.angle!;
        const seamLength = 1100;
        commands.push({
          kind: "authored-scarlet-tides",
          waves: [
            { x: record.x - Math.cos(angle + Math.PI / 2) * 520, y: record.y - Math.sin(angle + Math.PI / 2) * 520, angle, length: 1100, width: 86 },
            { x: record.x + Math.cos(angle + Math.PI / 2) * 520, y: record.y + Math.sin(angle + Math.PI / 2) * 520, angle, length: 1100, width: 86 }
          ],
          seam: {
            from: { x: record.x - Math.cos(angle) * seamLength / 2, y: record.y - Math.sin(angle) * seamLength / 2 },
            to: { x: record.x + Math.cos(angle) * seamLength / 2, y: record.y + Math.sin(angle) * seamLength / 2 }, width: 48
          },
          damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale * 0.55)),
          seamDamage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale * 2.1)),
          immediateSeam: true, reverse: false, durationMs: 1100, supreme: true,
          sourceGongfaId: next.gongfaId,
          masteryCast: { skill2Id: "sunset-wave-apex", cooldownMs: Math.floor(authoredSkill2Plans["sunset-wave-apex"].cooldownMs * skill2Stats.cadenceScale) }
        });
        next.authored.cycleCount = 0; next.authored.charges = 0; next.authored.phase = 0;
        next.authored.resource = 0; next.authored.anchors = [];
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "heavenly-sun-descent" && next.gongfaId === "nine-sun-calamity-seal") {
      const targets = event.targets ?? [];
      const target = [...targets].sort((a, b) => {
        const rank = (item: AuthoredTargetFact): number => item.rank === "boss" ? 3 : item.rank === "elite" ? 2 : 1;
        return rank(b) + b.healthRatio - rank(a) - a.healthRatio;
      })[0];
      if (next.authored.phase === 0 && next.authored.charges >= 9 && target) {
        const dimScale = Math.max(0.45, 1 - next.authored.secondaryResource * 0.06);
        next.authored.phase = 1;
        commands.push({
          kind: "authored-falling-sun", seals: [{ x: target.x, y: target.y, delayMs: 2400 }],
          radius: 220, centerRadius: 58,
          damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale * 3.4 * dimScale)),
          zenith: next.authored.resource, supreme: true, sourceGongfaId: next.gongfaId,
          masteryCast: { skill2Id: "heavenly-sun-descent", cooldownMs: Math.floor(authoredSkill2Plans["heavenly-sun-descent"].cooldownMs * skill2Stats.cadenceScale) }
        });
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "supreme-sundering-decree" && next.gongfaId === "heaven-sundering-edict") {
      const cap = event.learnedMasteryIds.includes("lenient-record") ? 0.78 : 1;
      const records = next.authored.anchors.filter((anchor) => anchor.kind === "trail" && anchor.angle !== undefined);
      if (next.authored.resource >= cap - 0.001 && records.length > 0) {
        const amendment = event.learnedMasteryIds.includes("heaven-moving-amendment");
        const dense = event.targets?.[0];
        commands.push({
          kind: "authored-sundering-edict",
          lines: records.map((record) => ({
            x: amendment && dense ? dense.x : record.x, y: amendment && dense ? dense.y : record.y,
            angle: record.angle!, length: 1200
          })),
          width: event.learnedMasteryIds.includes("lone-heaven-scar") ? 16 : 34,
          physicalDamage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale * 0.38)),
          judgmentDamage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale *
            (amendment ? 1.15 : event.learnedMasteryIds.includes("twin-edicts") ? 1.05 : 1.65))),
          delayMs: 900, supreme: true, sourceGongfaId: next.gongfaId,
          masteryCast: { skill2Id: "supreme-sundering-decree", cooldownMs: Math.floor(authoredSkill2Plans["supreme-sundering-decree"].cooldownMs * skill2Stats.cadenceScale) }
        });
        next.authored.resource = 0; next.authored.secondaryResource = 0; next.authored.charges = 0;
        next.authored.anchors = next.authored.anchors.filter((anchor) => anchor.kind !== "trail");
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "star-breaking-descent" && next.gongfaId === "heavenfall-body-art") {
      const cap = event.learnedMasteryIds.includes("wandering-star-light-body") ? 0.68 :
        event.learnedMasteryIds.includes("heaven-turning-pivot") ? 0.78 : 1;
      if (next.authored.phase === 1 && (next.authored.resource >= cap - 0.01 || next.authored.phaseElapsedMs >= 6000)) {
        const fate = event.learnedMasteryIds.includes("mountain-piercing-star-lance") ? "star-lance" as const :
          event.learnedMasteryIds.includes("reverse-star-return") ? "reverse-return" as const : "crater" as const;
        const mass = next.authored.resource;
        commands.push({
          kind: "authored-star-descent", x: 0, y: 0, angle: next.authored.lastMovementAngle ?? 0,
          mass, damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale * (0.75 + mass * 1.8))),
          radius: fate === "star-lance" ? 34 : fate === "reverse-return" ? 26 : 90 + mass * 150,
          fate, sourceGongfaId: next.gongfaId,
          masteryCast: { skill2Id: "star-breaking-descent", cooldownMs: Math.floor(authoredSkill2Plans["star-breaking-descent"].cooldownMs * skill2Stats.cadenceScale) }
        });
        next.authored.phase = 0; next.authored.phaseElapsedMs = 0; next.authored.resource = 0;
        next.authored.secondaryResource = 0;
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "world-tree-incarnation" && next.gongfaId === "ancient-tree-body-art") {
      if (next.authored.phase === 1 && next.authored.charges >= next.authored.maxCharges) {
        const law = event.learnedMasteryIds.includes("one-tree-upholds-heaven") ? "one-tree" as const :
          event.learnedMasteryIds.includes("world-sheltering-canopy") ? "sheltering" as const : "many-roots" as const;
        next.authored.phase = 3;
        next.authored.phaseElapsedMs = 5600;
        next.authored.targetLedger[-60] = 0;
        commands.push({
          kind: "authored-ancient-tree-cycle", x: 0, y: 0, rings: next.authored.charges,
          rootRadius: 150 + next.authored.charges * 14, branchSectors: next.authored.charges + 2,
          canopyRadius: 260 + next.authored.charges * 20,
          damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale * (law === "sheltering" ? 0.42 : 1.2))),
          law, heal: law === "sheltering" ? 12 : 0, worldTree: true, canopyFocus: false, sourceGongfaId: next.gongfaId,
          masteryCast: { skill2Id: "world-tree-incarnation", cooldownMs: Math.floor(authoredSkill2Plans["world-tree-incarnation"].cooldownMs * skill2Stats.cadenceScale) }
        });
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "myriad-beast-stampede" && next.gongfaId === "myriad-beast-grove") {
      const livingSpecies = next.authored.anchors
        .filter((anchor) => anchor.kind === "beast" && anchor.beastState === "living")
        .map((anchor) => anchor.beastSpecies)
        .filter((species): species is "boar" | "fox" | "deer" => species !== undefined);
      const ancestorSpecies = event.learnedMasteryIds.includes("two-beasts-aid-each-other")
        ? livingSpecies.slice(0, 2)
        : livingSpecies;
      if (next.authored.resource >= 0.999 && ancestorSpecies.length >= 2) {
        const learnedIds = event.learnedMasteryIds;
        const fate = learnedIds.includes("ancestors-return-to-the-grove")
          ? "return-grove" as const
          : learnedIds.includes("ancestral-encirclement")
            ? "encirclement" as const
            : "wild-run" as const;
        commands.push({
          kind: "authored-beast-ancestors",
          species: ancestorSpecies,
          targets: event.targets ?? [],
          damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale *
            (fate === "return-grove" ? 0.42 : fate === "encirclement" ? 1.5 : 0.82))),
          fate,
          sourceGongfaId: next.gongfaId,
          masteryCast: {
            skill2Id: "myriad-beast-stampede",
            cooldownMs: Math.floor(authoredSkill2Plans["myriad-beast-stampede"].cooldownMs * skill2Stats.cadenceScale)
          }
        });
        if (fate === "return-grove") {
          for (const beast of next.authored.anchors.filter((anchor) => anchor.kind === "beast")) {
            beast.beastState = "living";
            beast.value = beast.maxValue ?? 1;
            beast.rebirthMs = 0;
          }
          next.authored.targetLedger[-45] = 4200;
        }
        next.authored.resource = 0;
        next.authored.activationCount += 1;
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "vermilion-host-descent" && next.gongfaId === "vermilion-bird-covenant") {
      const bird = next.authored.anchors.find((anchor) =>
        anchor.kind === "companion" && !["ember", "egg"].includes(anchor.companionState ?? "guard")
      );
      const targets = event.targets ?? [];
      const target = [...targets].sort((a, b) => {
        const rankA = a.rank === "boss" ? 3 : a.rank === "elite" ? 2 : 1;
        const rankB = b.rank === "boss" ? 3 : b.rank === "elite" ? 2 : 1;
        return rankB + b.healthRatio - (rankA + a.healthRatio);
      })[0];
      if (bird && target && next.authored.resource >= 0.999) {
        const learnedIds = event.learnedMasteryIds;
        const truePlume = learnedIds.includes("true-plume-nirvana");
        const urgent = learnedIds.includes("urgent-ember-egg");
        const eggHealth = truePlume ? 1.4 : urgent ? 0.48 : 0.62;
        commands.push({
          kind: "authored-vermilion-flight",
          from: { x: bird.x, y: bird.y },
          waypoints: [{ x: target.x, y: target.y, targetId: target.targetId }],
          damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale *
            (truePlume ? 3.5 : urgent ? 2.4 : 3.1))),
          width: 58 + skill2Stats.coverage * 8,
          maxHits: 4 + skill2Stats.coverage,
          terminal: true,
          sourceGongfaId: next.gongfaId,
          masteryCast: {
            skill2Id: "vermilion-host-descent",
            cooldownMs: Math.floor(authoredSkill2Plans["vermilion-host-descent"].cooldownMs * skill2Stats.cadenceScale)
          }
        });
        bird.x = target.x;
        bird.y = target.y;
        bird.value = eggHealth;
        bird.maxValue = eggHealth;
        bird.companionState = "egg";
        bird.targetId = undefined;
        next.authored.targetLedger[-20] = 0;
        next.authored.targetLedger[-30] = 0;
        next.authored.resource = 0;
        next.authored.secondaryResource = 1;
        next.authored.phase = 4;
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "moon-tide-vault" && next.gongfaId === "black-tide-scripture") {
      if (next.authored.cycleCount >= 3) {
        const learnedIds = event.learnedMasteryIds;
        const fate = learnedIds.includes("mystic-water-anchors-the-realm")
          ? "anchored-water" as const
          : learnedIds.includes("dry-sea-splits-the-shore")
            ? "dry-sea" as const
            : "shared-flow" as const;
        const durationMs = fate === "dry-sea" ? 900 : fate === "anchored-water" ? 1800 : 1500;
        commands.push({
          kind: "authored-deluge-mandate",
          direction: Math.max(0, Math.min(3, Math.floor(next.authored.secondaryResource))) as 0 | 1 | 2 | 3,
          damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale *
            (fate === "dry-sea" ? 2.15 : fate === "anchored-water" ? 0.55 : 0.72))),
          force: fate === "shared-flow" ? 250 : fate === "dry-sea" ? 75 : 0,
          durationMs,
          bossSlowMultiplier: fate === "anchored-water" ? 0.22 : fate === "shared-flow" ? 0.42 : 0.58,
          fate,
          sourceGongfaId: next.gongfaId,
          masteryCast: {
            skill2Id: "moon-tide-vault",
            cooldownMs: Math.floor(authoredSkill2Plans["moon-tide-vault"].cooldownMs * skill2Stats.cadenceScale)
          }
        });
        next.authored.cycleCount = 0;
        next.authored.charges = 0;
        next.authored.targetLedger[-99] = durationMs;
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "frozen-river-prison" && next.gongfaId === "frozen-river-formation") {
      const activeTargets = event.targets ?? [];
      const nodes = next.authored.anchors
        .filter((anchor) => anchor.kind === "seal" && anchor.sealRole !== "crossing" && anchor.targetId !== undefined)
        .flatMap((anchor) => {
          const target = activeTargets.find((candidate) => candidate.targetId === anchor.targetId);
          return target ? [target] : [];
        });
      if (next.authored.cycleCount >= 3 && nodes.length >= 2) {
        const learnedIds = event.learnedMasteryIds;
        const fate = learnedIds.includes("collective-liability")
          ? "collective-liability" as const
          : learnedIds.includes("compensating-ferry")
            ? "compensating-ferry" as const
            : "shared-cold" as const;
        commands.push({
          kind: "authored-frozen-river-network",
          nodes,
          damagePool: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale *
            (fate === "shared-cold" ? 0.48 : fate === "compensating-ferry" ? 0.62 : 1.25))),
          width: 44 + skill2Stats.coverage * 4,
          fate,
          sourceGongfaId: next.gongfaId,
          masteryCast: {
            skill2Id: "frozen-river-prison",
            cooldownMs: Math.floor(authoredSkill2Plans["frozen-river-prison"].cooldownMs * skill2Stats.cadenceScale)
          }
        });
        next.authored.anchors = next.authored.anchors.filter((anchor) => anchor.kind !== "seal");
        next.authored.cycleCount = 0;
        next.authored.charges = 0;
        next.authored.resource = 0;
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "myriad-root-killing-field" && next.gongfaId === "thousand-root-formation") {
      const targets = event.targets ?? [];
      const infections = next.authored.anchors.filter((anchor) =>
        anchor.kind === "infection" && anchor.targetId !== undefined
      );
      const hosts = infections.flatMap((infection) => {
        const target = targets.find((candidate) => candidate.targetId === infection.targetId);
        return target ? [target] : [];
      });
      const matureCount = infections.filter((infection) => infection.infectionStage === 2).length;
      if (hosts.length >= 4 && matureCount >= 2) {
        const learnedIds = event.learnedMasteryIds;
        const fate = learnedIds.includes("one-heart-strangles-life")
          ? "one-heart" as const
          : learnedIds.includes("wither-and-flourish-leave-a-seed")
            ? "wither-seed" as const
            : "many-mouths" as const;
        const strongestHost = [...hosts].sort((a, b) =>
          (b.rank === "boss" ? 3 : b.rank === "elite" ? 2 : 1) + b.healthRatio -
          ((a.rank === "boss" ? 3 : a.rank === "elite" ? 2 : 1) + a.healthRatio)
        )[0]!;
        const ordinaryRoutes = targets
          .filter((target) => target.rank === "ordinary")
          .sort((a, b) => a.healthRatio - b.healthRatio)
          .slice(0, hosts.length);
        const routeTargets = fate === "one-heart"
          ? [strongestHost]
          : fate === "many-mouths"
            ? ordinaryRoutes
            : [];
        const mergeTarget = fate === "one-heart"
          ? { x: strongestHost.x, y: strongestHost.y }
          : {
              x: hosts.reduce((sum, host) => sum + host.x, 0) / hosts.length,
              y: hosts.reduce((sum, host) => sum + host.y, 0) / hosts.length
            };
        commands.push({
          kind: "authored-root-ancestor",
          hosts,
          routeTargets,
          mergeTarget,
          damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale *
            (fate === "one-heart" ? 1.65 : fate === "wither-seed" ? 0.48 : 0.9))),
          radius: 82 + skill2Stats.coverage * 8,
          fate,
          sourceGongfaId: next.gongfaId,
          masteryCast: {
            skill2Id: "myriad-root-killing-field",
            cooldownMs: Math.floor(authoredSkill2Plans["myriad-root-killing-field"].cooldownMs * skill2Stats.cadenceScale)
          }
        });
        next.authored.anchors = next.authored.anchors.filter((anchor) => anchor.kind !== "infection");
        if (fate === "wither-seed") {
          const survivor = [...targets].sort((a, b) => b.healthRatio - a.healthRatio)[0];
          if (survivor) {
            next.authored.anchors.push({
              kind: "infection", targetId: survivor.targetId, x: survivor.x, y: survivor.y,
              value: 7000, infectionStage: 2
            });
          }
        }
        next.authored.charges = next.authored.anchors.filter((anchor) => anchor.kind === "infection").length;
        next.authored.secondaryResource = fate === "wither-seed" && next.authored.charges > 0 ? 1 : 0;
        next.authored.resource = fate === "wither-seed" && next.authored.charges > 0 ? 0.2 : 0;
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "hundred-ghost-procession" && next.gongfaId === "mist-wraith-canon") {
      const storedSouls = next.authored.anchors.filter((anchor) => anchor.kind === "stored-soul");
      if (storedSouls.length > 0) {
        const learnedIds = event.learnedMasteryIds;
        const converges = learnedIds.includes("myriad-souls-ask-for-life");
        const funeral = learnedIds.includes("nether-river-funeral");
        const spread = learnedIds.includes("hundred-ghosts-cross-river") ? 0.11 : 0.045;
        storedSouls.forEach((soul, index) => {
          commands.push({
            kind: "authored-line-strike",
            style: "mist-wraith-crossing",
            origin: "player",
            aimMode: converges ? "strongest" : soul.value >= 3 ? "strongest" : "nearest",
            angleOffset: converges ? 0 : (index - (storedSouls.length - 1) / 2) * spread,
            damage: Math.max(1, Math.floor(skill2Base.damage * soul.value * skill2Stats.damageScale * (funeral ? 0.55 : 1))),
            width: 20 + soul.value * 8 + skill2Stats.coverage * 3,
            length: Math.max(520, skill2Base.range * 1.65),
            sourceGongfaId: next.gongfaId,
            ...(funeral ? { slowMultiplier: 0.45, slowDurationMs: 2200 } : {}),
            ...(index === 0 ? {
              masteryCast: {
                skill2Id: "hundred-ghost-procession" as const,
                cooldownMs: Math.floor(authoredSkill2Plans["hundred-ghost-procession"].cooldownMs * skill2Stats.cadenceScale)
              }
            } : {})
          });
        });
        next.authored.anchors = next.authored.anchors.filter((anchor) => anchor.kind !== "stored-soul");
        next.authored.charges = 0;
        next.authored.resource = 0;
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "ten-thousand-sword-tomb" && next.gongfaId === "sword-burial-formation") {
      const graves = next.authored.anchors.filter((anchor) => anchor.kind === "grave-sword");
      if (graves.length > 0) {
        const learnedIds = event.learnedMasteryIds;
        const asksLeader = learnedIds.includes("myriad-edges-ask-the-leader");
        const oldRoads = learnedIds.includes("old-roads-return-the-soul");
        graves.forEach((grave, index) => {
          const oldRoadAngle = Math.atan2(
            (grave.originPlayerY ?? grave.y) - grave.y,
            (grave.originPlayerX ?? grave.x) - grave.x
          );
          commands.push({
            kind: "authored-line-strike",
            style: "grave-sword-rise",
            origin: { x: grave.x, y: grave.y },
            ...(asksLeader ? { aimMode: "strongest" as const } : { angle: oldRoads ? oldRoadAngle : grave.angle ?? 0 }),
            damage: Math.max(1, Math.floor(skill2Base.damage * grave.value * skill2Stats.damageScale)),
            width: 18 + skill2Stats.coverage * 3,
            length: Math.max(520, skill2Base.range * 1.7),
            sourceGongfaId: next.gongfaId,
            ...(index === 0 ? {
              masteryCast: {
                skill2Id: "ten-thousand-sword-tomb" as const,
                cooldownMs: Math.floor(authoredSkill2Plans["ten-thousand-sword-tomb"].cooldownMs * skill2Stats.cadenceScale)
              }
            } : {})
          });
        });
        next.authored.anchors = next.authored.anchors.filter((anchor) => anchor.kind !== "grave-sword");
        next.authored.charges = 0;
        next.authored.resource = 0;
      }
      return { runtime: next, commands };
    }
    if (
      event.skill2Id === "returning-sword-formation" &&
      next.yujian &&
      (event.eligibleTargetCount ?? 0) > 0
    ) {
      commands.push({
        kind: "returning-sword-formation",
        count: Math.max(1, skill2Base.count + skill2Stats.coverage),
        opening: {
          damage: Math.floor(skill2Base.damage * 0.72 * skill2Stats.damageScale),
          pierce: skill2Base.pierce + 1,
          speed: skill2Base.projectileSpeed + 55,
          lifetimeMs: skill2Base.projectileLifetimeMs + 280
        },
        returnPath: {
          delayMs: Math.floor(240 * skill2Stats.cadenceScale),
          damage: Math.floor(skill2Base.damage * 0.58 * skill2Stats.damageScale),
          pierce: skill2Base.pierce + 1,
          speed: skill2Base.projectileSpeed + 75,
          lifetimeMs: skill2Base.projectileLifetimeMs + 340
        },
        masteryCast: {
          skill2Id: "returning-sword-formation",
          cooldownMs: Math.floor(authoredSkill2Plans["returning-sword-formation"].cooldownMs * skill2Stats.cadenceScale)
        }
      });
    }
    if (event.skill2Id === "golden-gale-corridor" && next.jinfeng) {
      commands.push({
        kind: "golden-gale-corridor",
        burstCount: 3 + skill2Stats.coverage,
        burstDelayMs: Math.floor(180 * skill2Stats.cadenceScale),
        laneCount: Math.max(3, Math.min(7, 3 + Math.floor(skill2Base.count / 2) + skill2Stats.coverage)),
        spreadDeg: Math.max(8, skill2Base.spreadDeg * 0.4),
        forwardOffset: {
          start: 32,
          step: 26
        },
        sidewaysSpacing: 12,
        projectile: {
          damage: Math.floor(skill2Base.damage * 0.8 * skill2Stats.damageScale),
          pierce: skill2Base.pierce + 1,
          speed: skill2Base.projectileSpeed + 25,
          lifetimeMs: skill2Base.projectileLifetimeMs + Math.floor(skill2Base.range * 0.9),
          scale: 0.92
        },
        masteryCast: {
          skill2Id: "golden-gale-corridor",
          cooldownMs: Math.floor(authoredSkill2Plans["golden-gale-corridor"].cooldownMs * skill2Stats.cadenceScale)
        }
      });
    }
    if (
      event.skill2Id === "furnace-cascade" &&
      next.crimsonFurnace &&
      (event.eligibleTargetCount ?? 0) > 0
    ) {
      next.crimsonFurnace.furnaceCascadeCasts += 1;
      commands.push({
        kind: "furnace-cascade",
        sourceDamage: {
          embedPowerMultiplier: skill2Stats.damageScale,
          stackDamage: 3 + skill2Stats.coverage
        },
        fragment: buildCrimsonFragmentSpec(next),
        masteryCast: {
          skill2Id: "furnace-cascade",
          cooldownMs: Math.floor(authoredSkill2Plans["furnace-cascade"].cooldownMs * skill2Stats.cadenceScale)
        }
      });
    }
    const skill2 = getAuthoredSkill2Plan(event.skill2Id);
    if (
      skill2?.trigger === "timed" &&
      skill2GongfaIds[skill2.intent] === next.gongfaId &&
      !commands.some((command) => "masteryCast" in command)
    ) {
      const requiresTarget = new Set<AuthoredSkill2Intent>([
        "feather-rain-formation",
        "sunset-wave-apex",
        "mirror-needle-constellation",
        "verdant-root-network",
        "heavenly-sun-descent",
        "hundred-ghost-procession",
        "star-breaking-descent",
        "myriad-root-killing-field",
        "asura-conflagration",
        "vermilion-host-descent",
        "frozen-river-prison",
        "moonfall-cataclysm",
        "ten-thousand-sword-tomb",
        "supreme-sundering-decree",
        "myriad-beast-stampede",
        "world-tree-incarnation"
      ]).has(skill2.intent);
      const lacksDirection =
        skill2.intent === "ironwood-surge-form" && event.hasMovementDirection !== true;
      const command = (requiresTarget && (event.eligibleTargetCount ?? 0) <= 0) || lacksDirection
        ? undefined
        : buildExplicitTimedSkill2Command(next, skill2);
      if (command) {
        commands.push(command);
      }
    }
    return { runtime: next, commands };
  }

  if (event.kind === "projectile-hit") {
    const state = next.burningRing;
    if (!state) {
      return { runtime: next, commands };
    }
    // Aura Furnace: aura-tagged hits stoke markedly more Heat.
    const heatGain = (event.learnedMasteryIds ?? []).includes("aura-furnace")
      ? Math.max(0.8, event.damage * 0.3)
      : Math.max(0.4, event.damage * 0.15);
    state.heat = Math.min(100, state.heat + heatGain);
    syncBurningRingCombat(next);
    return { runtime: next, commands };
  }

  if (event.kind === "jinfeng-wave-hit") {
    // Ten-Thousand Wave Resonance: wave-tagged Skill hits feed Momentum.
    if (next.jinfeng && event.learnedMasteryIds.includes("ten-thousand-wave-resonance")) {
      next.jinfeng.momentum = Math.min(5, next.jinfeng.momentum + 0.5);
      syncJinfengCombat(next);
    }
    return { runtime: next, commands };
  }

  if (event.kind === "blazing-feather-hit") {
    const state = next.blazingFeather;
    if (!state) {
      return { runtime: next, commands };
    }
    // Ember Surge: hits stoke Embers; Ember Cascade stokes them faster.
    const gain = (event.learnedMasteryIds.includes("ember-cascade") ? 2 : 1) +
      masteryEffectTiers(event.learnedMasteryIds, "surgeBuild");
    state.emberStacks = Math.min(MAX_EMBER_STACKS, state.emberStacks + gain);
    state.emberDurationRemaining = EMBER_DURATION_MS *
      (1 + masteryEffectTiers(event.learnedMasteryIds, "surgeStability") * 0.25);
    syncBlazingFeatherCombat(next);
    // Searing Domain: hits leave an Ember-scaled blazing field.
    if (event.learnedMasteryIds.includes("searing-domain") && state.emberStacks > 0) {
      commands.push({
        kind: "aura-burst",
        damage: Math.max(1, Math.floor(next.combat.damage * 0.35)),
        count: 2 + Math.floor(state.emberStacks / 2)
      });
    }
    return { runtime: next, commands };
  }

  if (event.kind === "surge-hit") {
    const state = next.surge;
    if (!state) {
      return { runtime: next, commands };
    }
    const mechanics = getSurgeGongfaSpec(next.gongfaId)?.mechanics;
    const gain = (learned(event.learnedMasteryIds, SURGE_CASCADE_IDS)
      ? mechanics?.cascadeGain ?? 2
      : 1) +
      masteryEffectTiers(event.learnedMasteryIds, "surgeBuild");
    state.stacks = Math.min(MAX_SURGE_STACKS, state.stacks + gain);
    state.durationRemaining = SURGE_DURATION_MS *
      (1 + masteryEffectTiers(event.learnedMasteryIds, "surgeStability") * 0.25);
    syncSurgeCombat(next);
    // Domain: hits leave a stack-scaled field.
    if (learned(event.learnedMasteryIds, SURGE_DOMAIN_IDS) && state.stacks > 0) {
      commands.push({
        kind: "aura-burst",
        damage: Math.max(1, Math.floor(
          next.combat.damage * (mechanics?.domainDamageScale ?? 0.35)
        )),
        count: 2 + Math.floor(state.stacks / 2)
      });
    }
    return { runtime: next, commands };
  }

  if (event.kind === "gengjin-defensive-hit") {
    // Ten-Thousand Armor Resonance: defensive-tagged Skill hits build Guard.
    if (next.gengjin && event.learnedMasteryIds.includes("ten-thousand-armor-resonance")) {
      next.gengjin.guardValue = Math.min(100, next.gengjin.guardValue + 1.5);
      syncGengjinCombat(next);
    }
    return { runtime: next, commands };
  }

  if (event.kind === "evade") {
    if (next.yujian && event.learnedMasteryIds.includes("swordborne-steps")) {
      next.yujian.intentStacks = Math.min(5, next.yujian.intentStacks + 1);
      next.yujian.intentDurationRemaining = INTENT_DURATION_MS;
      syncYujianCombat(next);
    }
    if (next.burningRing && event.learnedMasteryIds.includes("ember-step")) {
      next.burningRing.heat = Math.min(100, next.burningRing.heat + 8);
      syncBurningRingCombat(next);
    }
    // Flowing Iron Body: each Evade grants Guard and a defensive shockwave.
    if (next.gengjin && event.learnedMasteryIds.includes("flowing-iron-body")) {
      next.gengjin.guardValue = Math.min(100, next.gengjin.guardValue + 20);
      syncGengjinCombat(next);
      commands.push({ kind: "aura-burst", damage: next.combat.damage, count: 8 });
    }
    // Unbroken Advance: Evade becomes a Guard-scaled breakthrough strike.
    if (next.gengjin && event.learnedMasteryIds.includes("unbroken-advance")) {
      commands.push({
        kind: "aura-burst",
        damage: next.combat.damage + Math.floor(next.gengjin.guardValue * 0.6),
        count: 10
      });
    }
    // Void-Step Formation: each Evade looses an extra sword volley.
    if (next.yujian && event.learnedMasteryIds.includes("void-step-formation")) {
      commands.push({
        kind: "homing-volley",
        count: Math.max(1, next.combat.count)
      });
    }
    // Molten Updraft: each Evade looses an Ember-scaled feather volley.
    if (next.blazingFeather && event.learnedMasteryIds.includes("molten-updraft")) {
      commands.push({
        kind: "homing-volley",
        count: Math.max(1, next.combat.count + next.blazingFeather.emberStacks)
      });
    }
    // Surge "updraft": each Evade looses a stack-scaled volley of its pattern.
    if (next.surge && learned(event.learnedMasteryIds, SURGE_UPDRAFT_IDS)) {
      const stackScale = getSurgeGongfaSpec(next.gongfaId)?.mechanics.updraftStackScale ?? 1;
      const count = Math.max(1, next.combat.count + Math.floor(next.surge.stacks * stackScale));
      if (["ritual", "summon", "melee", "trap"].includes(next.combat.pattern)) {
        commands.push(...planGongfaAttack(next, 0, { learnedMasteryIds: [] }));
      } else if (next.combat.pattern === "wave") {
        commands.push({ kind: "wave-volley", count, returnShots: 0, aimMode: "nearest" });
      } else if (next.combat.pattern === "aura") {
        commands.push({ kind: "aura-burst", damage: next.combat.damage, count });
      } else {
        commands.push({ kind: "homing-volley", count });
      }
    }
    // Phoenix Passage: leave a Heat-scaled ring copy at the Evade's origin.
    if (next.burningRing && event.learnedMasteryIds.includes("phoenix-passage")) {
      const extraSegments = Math.floor(next.burningRing.heat / 15);
      commands.push({
        kind: "burning-ring-volley",
        rotation: 0,
        segmentCount: 6 + extraSegments,
        visibleSegments: Math.max(4, 4 + extraSegments),
        ringRadius: 24 + Math.floor(next.burningRing.heat * 0.3)
      });
    }
    return { runtime: next, commands };
  }

  if (event.kind === "crimson-projectile-hit") {
    const state = next.crimsonFurnace;
    if (!state) {
      return { runtime: next, commands };
    }

    const embedStacks = event.embedStacks + 1;
    const embedPower = event.embedPower + event.damage;
    commands.push({
      kind: "lodge-crimson-needle",
      targetId: event.targetId,
      embedStacks,
      embedPower
    });

    if (embedStacks >= state.embedThreshold) {
      commands.push({
        kind: "detonate-crimson-embed",
        targetId: event.targetId,
        sourceDamage: Math.max(event.damage, embedPower + embedStacks * 2),
        fragment: buildCrimsonFragmentSpec(next)
      });
    }

    return { runtime: next, commands };
  }

  if (event.kind === "incoming-damage") {
    // Unbroken Sword Intent: taking damage sheds two stacks, unless Still Sword
    // Heart holds them.
    if (next.yujian && !(event.learnedMasteryIds ?? []).includes("still-sword-heart")) {
      next.yujian.intentStacks = Math.max(0, next.yujian.intentStacks - 2);
      syncYujianCombat(next);
    }

    if (
      next.gongfaId === "vermilion-bird-covenant" &&
      event.learnedMasteryIds.includes("sacrifice-to-guard-the-master") &&
      (event.healthRatio ?? 1) <= 0.25
    ) {
      const bird = next.authored.anchors.find((anchor) =>
        anchor.kind === "companion" && !["ember", "egg"].includes(anchor.companionState ?? "guard")
      );
      if (bird) {
        bird.companionState = "egg";
        bird.value = 0.55;
        bird.maxValue = 0.55;
        next.authored.targetLedger[-20] = 0;
        next.authored.targetLedger[-30] = 0;
        next.authored.resource = 0;
        commands.push({
          kind: "authored-vermilion-sacrifice",
          x: bird.x,
          y: bird.y,
          sourceGongfaId: next.gongfaId
        });
        commands.push({ kind: "incoming-damage", finalDamage: 0 });
        return { runtime: next, commands };
      }
    }

    if (next.gongfaId === "ancient-tree-body-art" &&
      event.learnedMasteryIds.includes("hollow-trunk-tribulation") &&
      next.authored.charges > 0 && (event.healthRatio ?? 1) <= 0.12) {
      next.authored.charges -= 1;
      next.authored.resource = next.authored.charges / Math.max(1, next.authored.maxCharges);
      commands.push({ kind: "incoming-damage", finalDamage: 0 });
      return { runtime: next, commands };
    }

    const state = next.gengjin;
    if (!state) {
      commands.push({
        kind: "incoming-damage",
        finalDamage: Math.max(1, Math.floor(event.amount))
      });
      return { runtime: next, commands };
    }

    const finalDamage = Math.max(1, Math.floor(event.amount * (1 - state.guardMitigation)));
    state.bladeShellCharge = Math.min(
      state.bladeShellThreshold,
      state.bladeShellCharge + finalDamage * 2
    );
    syncGengjinCombat(next);
    commands.push({ kind: "incoming-damage", finalDamage });

    const skill2 = getAuthoredSkill2Plan(event.skill2Id);
    if (skill2?.trigger === "threshold" && state.bladeShellCooldownRemaining === 0) {
      if (state.bladeShellCharge >= state.bladeShellThreshold) {
        state.bladeShellCasts += 1;
        state.bladeShellCharge = 0;
        state.bladeShellCooldownRemaining = 1800;
        commands.push({
          kind: "blade-shell-rebound",
          damageScale: skill2RefinementStats(next).damageScale,
          bonusBlades: skill2RefinementStats(next).coverage * 2,
          baseDamage: skill2Combat(next).damage,
          baseBladeCount: skill2Combat(next).count,
          masteryCast: {
            skill2Id: "blade-shell-rebound",
            cooldownMs: Math.floor(authoredSkill2Plans["blade-shell-rebound"].cooldownMs * skill2RefinementStats(next).cadenceScale)
          }
        });
      }
    }
    return { runtime: next, commands };
  }

  if (event.kind === "crimson-detonation") {
    const state = next.crimsonFurnace;
    if (!state) {
      return { runtime: next, commands };
    }

    const pressureGain = event.fromEmbed
      ? Math.max(0.8, event.damage * 0.14)
      : Math.max(0.5, event.damage * 0.1);
    state.pressure = Math.min(100, state.pressure + pressureGain * state.pressureBuildRate);
    syncCrimsonFurnaceCombat(next);
    commands.push({
      kind: "crimson-detonation",
      x: event.x,
      y: event.y,
      radius: Math.max(20, next.combat.range + Math.floor(state.pressure * 0.35)),
      splashDamage: Math.max(1, Math.floor(event.damage + state.pressure * 0.4))
    });
    return { runtime: next, commands };
  }

  const deltaSeconds = Math.max(0, event.deltaMs) / 1000;

  if (next.yujian && next.yujian.intentStacks > 0) {
    // Unbroken Sword Intent fades a stack at a time once its duration lapses.
    next.yujian.intentDurationRemaining = Math.max(
      0,
      next.yujian.intentDurationRemaining - Math.max(0, event.deltaMs)
    );
    if (next.yujian.intentDurationRemaining === 0) {
      next.yujian.intentStacks -= 1;
      if (next.yujian.intentStacks > 0) {
        next.yujian.intentDurationRemaining = INTENT_DURATION_MS;
      }
      syncYujianCombat(next);
    }
  }

  if (next.blazingFeather && next.blazingFeather.emberStacks > 0) {
    const blazingLearned = event.learnedMasteryIds ?? [];
    next.blazingFeather.emberDurationRemaining = Math.max(
      0,
      next.blazingFeather.emberDurationRemaining - Math.max(0, event.deltaMs)
    );
    if (next.blazingFeather.emberDurationRemaining === 0) {
      // Banked Embers holds Embers at half (3 of 6) once they are well stoked.
      const floor =
        blazingLearned.includes("banked-embers") && next.blazingFeather.emberStacks >= 3 ? 3 : 0;
      next.blazingFeather.emberStacks = Math.max(floor, next.blazingFeather.emberStacks - 1);
      if (next.blazingFeather.emberStacks > 0) {
        next.blazingFeather.emberDurationRemaining = EMBER_DURATION_MS;
      }
      syncBlazingFeatherCombat(next);
    }
  }

  if (next.surge && next.surge.stacks > 0) {
    const surgeLearned = event.learnedMasteryIds ?? [];
    next.surge.durationRemaining = Math.max(
      0,
      next.surge.durationRemaining - Math.max(0, event.deltaMs)
    );
    if (next.surge.durationRemaining === 0) {
      // A "hold" Transformation banks the resource at half once well stoked.
      const holdFloor = getSurgeGongfaSpec(next.gongfaId)?.mechanics.holdFloor ?? 3;
      const floor = learned(surgeLearned, SURGE_HOLD_IDS) && next.surge.stacks >= holdFloor
        ? holdFloor
        : 0;
      next.surge.stacks = Math.max(floor, next.surge.stacks - 1);
      if (next.surge.stacks > 0) {
        next.surge.durationRemaining = SURGE_DURATION_MS;
      }
      syncSurgeCombat(next);
    }
  }

  if (next.jinfeng) {
    const learnedMasteryIds = event.learnedMasteryIds ?? [];
    if (event.isMoving) {
      next.jinfeng.momentum = Math.min(
        5,
        next.jinfeng.momentum + next.jinfeng.momentumBuildRate * deltaSeconds
      );
    } else if (!learnedMasteryIds.includes("unbroken-current")) {
      // Unbroken Current holds Momentum instead of letting it bleed on a stop.
      next.jinfeng.momentum = Math.max(
        0,
        next.jinfeng.momentum - next.jinfeng.momentumDecayRate * deltaSeconds
      );
    }

    // Gale Detonation: at full Momentum, spend part of it for a crossing wave.
    if (learnedMasteryIds.includes("gale-detonation") && next.jinfeng.momentum >= 5) {
      next.jinfeng.momentum = Math.max(0, next.jinfeng.momentum - 2.5);
      commands.push({ kind: "wave-volley", count: 2, returnShots: 0, aimMode: "last" });
    }

    // Walking Storm: periodic radial cutting waves while Momentum stays high.
    next.jinfeng.walkingStormCooldownRemaining = Math.max(
      0,
      next.jinfeng.walkingStormCooldownRemaining - Math.max(0, event.deltaMs)
    );
    if (
      learnedMasteryIds.includes("walking-storm") &&
      next.jinfeng.momentum >= 4 &&
      next.jinfeng.walkingStormCooldownRemaining === 0
    ) {
      next.jinfeng.walkingStormCooldownRemaining = 1600;
      commands.push({
        kind: "aura-burst",
        damage: next.combat.damage,
        count: 8
      });
    }

    syncJinfengCombat(next);
  }

  if (next.gengjin) {
    const learnedMasteryIds = event.learnedMasteryIds ?? [];
    // Immovable Mountain: standing still greatly increases Guard gain (and, via
    // higher Guard, defensive output through syncGengjinCombat).
    const stillGuardBonus =
      learnedMasteryIds.includes("immovable-mountain") && !event.isMoving ? 1.8 : 1;
    if (event.nearbyEnemyCount > 0) {
      next.gengjin.guardValue = Math.min(
        100,
        next.gengjin.guardValue +
          event.nearbyEnemyCount * next.gengjin.guardBuildRate * stillGuardBonus * deltaSeconds
      );
      next.gengjin.bladeShellCharge = Math.min(
        next.gengjin.bladeShellThreshold,
        next.gengjin.bladeShellCharge +
          event.nearbyEnemyCount * 7 * deltaSeconds +
          next.gengjin.guardValue * 0.05 * deltaSeconds
      );
    } else {
      next.gengjin.guardValue = Math.max(
        0,
        next.gengjin.guardValue - next.gengjin.guardDecayRate * deltaSeconds
      );
      next.gengjin.bladeShellCharge = Math.max(
        0,
        next.gengjin.bladeShellCharge - 5 * deltaSeconds
      );
    }
    syncGengjinCombat(next);

    // Rank-9 Guard pulses share one cooldown (Iron Gravity Domain and Unbroken
    // Advance are exclusive milestone choices, so at most one ever fires).
    next.gengjin.gengjinPulseCooldownRemaining = Math.max(
      0,
      next.gengjin.gengjinPulseCooldownRemaining - Math.max(0, event.deltaMs)
    );
    if (next.gengjin.gengjinPulseCooldownRemaining === 0) {
      // Iron Gravity Domain: at high Guard, pull enemies into an aura burst.
      if (learnedMasteryIds.includes("iron-gravity-domain") && next.gengjin.guardValue >= 60) {
        next.gengjin.gengjinPulseCooldownRemaining = 1500;
        commands.push({ kind: "gravity-pull", radius: 200, strength: 220 });
        commands.push({ kind: "aura-burst", damage: next.combat.damage, count: 10 });
      } else if (
        // Unbroken Advance: high-Guard movement strikes nearby enemies.
        learnedMasteryIds.includes("unbroken-advance") &&
        event.isMoving &&
        next.gengjin.guardValue >= 40
      ) {
        next.gengjin.gengjinPulseCooldownRemaining = 900;
        commands.push({ kind: "aura-burst", damage: next.combat.damage, count: 6 });
      }
    }

    const skill2 = getAuthoredSkill2Plan(event.skill2Id);
    if (skill2?.trigger === "threshold") {
      if (next.gengjin.bladeShellCooldownRemaining > 0) {
        next.gengjin.bladeShellCooldownRemaining = Math.max(
          0,
          next.gengjin.bladeShellCooldownRemaining - Math.max(0, event.deltaMs)
        );
      } else if (next.gengjin.bladeShellCharge >= next.gengjin.bladeShellThreshold) {
        next.gengjin.bladeShellCasts += 1;
        next.gengjin.bladeShellCharge = 0;
        next.gengjin.bladeShellCooldownRemaining = 1800;
        commands.push({
          kind: "blade-shell-rebound",
          damageScale: skill2RefinementStats(next).damageScale,
          bonusBlades: skill2RefinementStats(next).coverage * 2,
          baseDamage: skill2Combat(next).damage,
          baseBladeCount: skill2Combat(next).count,
          masteryCast: {
            skill2Id: "blade-shell-rebound",
            cooldownMs: Math.floor(authoredSkill2Plans["blade-shell-rebound"].cooldownMs * skill2RefinementStats(next).cadenceScale)
          }
        });
      }
    }
  }

  if (next.crimsonFurnace) {
    // Crucible Nova: full Pressure erupts in a furnace nova, then resets.
    // Checked before decay, since Pressure only ever decays in the tick.
    if ((event.learnedMasteryIds ?? []).includes("crucible-nova") && next.crimsonFurnace.pressure >= 100) {
      next.crimsonFurnace.pressure = 30;
      commands.push({
        kind: "aura-burst",
        damage: Math.max(1, Math.floor(next.combat.damage * 2)),
        count: 14
      });
    }
    next.crimsonFurnace.pressure = Math.max(
      0,
      next.crimsonFurnace.pressure - next.crimsonFurnace.pressureDecayRate * deltaSeconds
    );
    syncCrimsonFurnaceCombat(next);
  }

  if (!next.burningRing) {
    return { runtime: next, commands };
  }

  const state = next.burningRing;
  const burningLearnedMasteryIds = event.learnedMasteryIds ?? [];
  if (event.nearbyEnemyCount > 0) {
    state.heat = Math.min(
      100,
      state.heat + event.nearbyEnemyCount * state.heatBuildRate * deltaSeconds
    );
  } else {
    // Banked Sun: stoked Heat no longer bleeds below half.
    const heatFloor =
      burningLearnedMasteryIds.includes("banked-sun") && state.heat >= 50 ? 50 : 0;
    state.heat = Math.max(heatFloor, state.heat - state.heatDecayRate * deltaSeconds);
  }

  // Meridian Ignition: full Heat ignites into a high-output burst, then resets.
  if (burningLearnedMasteryIds.includes("meridian-ignition") && state.heat >= 100) {
    state.heat = 20;
    commands.push({
      kind: "aura-burst",
      damage: Math.max(1, Math.floor(next.combat.damage * 1.8)),
      count: 12
    });
  }

  // Sunspot Collapse: periodically condense the ring onto a sturdy nearby enemy.
  state.sunspotCooldownRemaining = Math.max(
    0,
    state.sunspotCooldownRemaining - Math.max(0, event.deltaMs)
  );
  if (burningLearnedMasteryIds.includes("sunspot-collapse") && state.sunspotCooldownRemaining === 0) {
    state.sunspotCooldownRemaining = 2000;
    commands.push({
      kind: "sunspot-collapse",
      radius: 220,
      damage: Math.max(1, Math.floor(next.combat.damage * 1.5 + state.heat))
    });
  }
  syncBurningRingCombat(next);

  const skill2 = getAuthoredSkill2Plan(event.skill2Id);
  if (skill2?.intent === "solar-flare-cycle") {
    const skill2Stats = skill2RefinementStats(next);
    state.solarFlareCooldownRemaining = Math.max(
      0,
      state.solarFlareCooldownRemaining - Math.max(0, event.deltaMs)
    );
    if (state.solarFlareCooldownRemaining === 0) {
      state.solarFlareCasts += 1;
      state.solarFlareCooldownRemaining = Math.floor(skill2.cooldownMs * skill2Stats.cadenceScale);
      commands.push({
        kind: "solar-flare-cycle",
        segmentCount: Math.max(
          6,
          state.ringSegments + state.counterflowRingAppliedSegments + skill2Stats.coverage * 2
        ),
        ringRadius: 32 + Math.floor(state.heat * 0.3) + state.counterflowRingRadiusBonus + skill2Stats.coverage * 10,
        damageScale: skill2Stats.damageScale,
        baseDamage: skill2Combat(next).damage,
        masteryCast: {
          skill2Id: "solar-flare-cycle"
        }
      });
    }
  }

  return { runtime: next, commands };
}

/**
 * Gale-Step Severance: each Evade cuts a Momentum-scaled corridor. Returns the
 * corridor's pierce and wave count, or undefined when the Transformation is not
 * learned or there is no Momentum to spend on it.
 */
export function galeStepSeveranceCorridor(
  runtime: GongfaRuntime,
  learnedMasteryIds: string[] = runtime.mastery.masteryLearnedIds
): { pierce: number; count: number } | undefined {
  if (
    !runtime.jinfeng ||
    !learnedMasteryIds.includes("gale-step-severance") ||
    runtime.jinfeng.momentum <= 0
  ) {
    return undefined;
  }

  return {
    pierce: runtime.combat.pierce + 2,
    count: Math.max(2, Math.round(runtime.jinfeng.momentum))
  };
}

/**
 * Rebounding Edge: prevented damage launches a focused blade back at its
 * source, its bite scaled by current Guard. Returns undefined when the
 * Transformation is not learned or there is no Guard to spend.
 */
export function reboundingEdgeBlade(
  runtime: GongfaRuntime,
  learnedMasteryIds: string[] = runtime.mastery.masteryLearnedIds
): { damage: number; pierce: number } | undefined {
  if (
    !runtime.gengjin ||
    !learnedMasteryIds.includes("rebounding-edge") ||
    runtime.gengjin.guardValue <= 0
  ) {
    return undefined;
  }

  return {
    damage: Math.max(1, Math.floor(runtime.combat.damage + runtime.gengjin.guardValue * 0.5)),
    pierce: runtime.combat.pierce + 1
  };
}

/**
 * Iron Wake: each Evade leaves a Guard-scaled cutting wall along its path.
 * Returns the wall's pierce and blade count, or undefined when not learned or
 * there is no Guard.
 */
export function ironWakeWall(
  runtime: GongfaRuntime,
  learnedMasteryIds: string[] = runtime.mastery.masteryLearnedIds
): { pierce: number; count: number } | undefined {
  if (
    !runtime.gengjin ||
    !learnedMasteryIds.includes("iron-wake") ||
    runtime.gengjin.guardValue <= 0
  ) {
    return undefined;
  }

  return {
    pierce: runtime.combat.pierce + 1,
    count: Math.max(2, Math.round(runtime.gengjin.guardValue / 20))
  };
}

export function planGongfaAttack(
  runtime: GongfaRuntime,
  elapsedMs: number,
  options: {
    learnedMasteryIds?: string[];
    playerX?: number;
    playerY?: number;
    targets?: AuthoredTargetFact[];
  } = {}
): GongfaRuntimeCommand[] {
  options = {
    ...options,
    learnedMasteryIds: options.learnedMasteryIds ?? runtime.mastery.masteryLearnedIds
  };
  if (runtime.gongfaId === "mist-wraith-canon") {
    const learnedIds = options.learnedMasteryIds ?? [];
    const soulIndex = runtime.authored.anchors.findIndex((anchor) => anchor.kind === "stored-soul");
    const retainsSoul = learnedIds.includes("lantern-returning-underworld-attendant");
    const soul = soulIndex >= 0
      ? retainsSoul
        ? runtime.authored.anchors[soulIndex]
        : runtime.authored.anchors.splice(soulIndex, 1)[0]
      : undefined;
    runtime.authored.charges = runtime.authored.anchors.filter(
      (anchor) => anchor.kind === "stored-soul"
    ).length;
    runtime.authored.resource = runtime.authored.charges / Math.max(1, runtime.authored.maxCharges);
    return [{
      kind: "authored-line-strike",
      style: "mist-wraith-crossing",
      origin: "player",
      aimMode: learnedIds.includes("life-seeking-fierce-wraith") || (soul?.value ?? 0) >= 3
        ? "strongest"
        : "nearest",
      damage: Math.max(1, Math.floor(runtime.combat.damage * (soul
        ? soul.value *
          (learnedIds.includes("life-seeking-fierce-wraith") ? 1.35 : 1) *
          (learnedIds.includes("wandering-mist-host") ? 0.62 : 1) *
          (learnedIds.includes("long-banner-soul-call") ? 0.8 : 1) *
          (retainsSoul ? 0.3 : 1)
        : 0.28))),
      width: soul ? 14 + soul.value * 7 + (learnedIds.includes("wandering-mist-host") ? 24 : 0) : 8,
      length: Math.max(240, runtime.combat.range + (soul?.value ?? 0) * 55),
      ...(learnedIds.includes("wandering-mist-host") ? { maxHits: 3 } : {}),
      sourceGongfaId: runtime.gongfaId
    }];
  }
  if (runtime.gongfaId === "heaven-sundering-edict") {
    const targets = options.targets ?? [];
    if (targets.length === 0) return [];
    const learnedIds = options.learnedMasteryIds ?? [];
    const playerX = options.playerX ?? 0;
    const playerY = options.playerY ?? 0;
    const longLine = learnedIds.includes("one-line-mountain-sundering");
    const crossed = learnedIds.includes("crossed-golden-edict");
    const swift = learnedIds.includes("swift-short-edict");
    const length = longLine ? 620 : crossed ? 310 : swift ? 300 : 460;
    const width = longLine ? 18 : crossed ? 28 : swift ? 34 : 30;
    const candidates = targets.map((target) => {
      const angle = Math.atan2(target.y - playerY, target.x - playerX);
      const score = targets.reduce((total, other) => {
        const along = (other.x - playerX) * Math.cos(angle) + (other.y - playerY) * Math.sin(angle);
        const across = Math.abs((other.x - playerX) * Math.sin(angle) - (other.y - playerY) * Math.cos(angle));
        return total + (Math.abs(along) <= length / 2 && across <= width ? (other.rank === "boss" ? 4 : other.rank === "elite" ? 2 : 1) : 0);
      }, 0);
      return { angle, score };
    }).sort((a, b) => b.score - a.score);
    const angle = candidates[0]?.angle ?? 0;
    const lines = [{ x: playerX, y: playerY, angle, length }];
    if (crossed) lines.push({ x: playerX, y: playerY, angle: angle + Math.PI / 2, length });
    return [{
      kind: "authored-sundering-edict", lines, width,
      physicalDamage: Math.max(1, Math.floor(runtime.combat.damage * (longLine ? 0.34 : crossed ? 0.22 : 0.28))),
      judgmentDamage: Math.max(1, Math.floor(runtime.combat.damage * (longLine ? 1.65 : crossed ? 0.72 : swift ? 0.82 : 1.25))),
      delayMs: swift ? 340 : longLine ? 1050 : 760,
      supreme: false, sourceGongfaId: runtime.gongfaId
    }];
  }
  if (runtime.gongfaId === "nine-sun-calamity-seal") {
    if (runtime.authored.phase !== 0 || runtime.authored.charges >= 9) return [];
    const targets = options.targets ?? [];
    if (targets.length === 0) return [];
    const learnedIds = options.learnedMasteryIds ?? [];
    const unsetting = learnedIds.includes("unsetting-high-noon");
    if (unsetting && runtime.authored.resource < 0.999) return [];
    const twin = learnedIds.includes("twin-luminary-eclipse");
    const solitary = learnedIds.includes("solitary-heavenly-judgment");
    const swift = learnedIds.includes("swift-eclipse-calamity");
    const dark = learnedIds.includes("dark-sun-calamity");
    const density = (target: AuthoredTargetFact): number => targets.filter((other) =>
      distanceSquared(target.x, target.y, other.x, other.y) <= 120 ** 2
    ).length + (target.rank === "boss" ? 4 : target.rank === "elite" ? 2 : 0);
    const ordered = [...targets].sort((a, b) => density(b) - density(a));
    const delay = dark ? 2100 : swift ? 720 : solitary ? 1850 : 1450;
    const seals = ordered.slice(0, twin ? 2 : 1).map((target, index) => ({
      x: target.x, y: target.y, delayMs: delay + index * 420
    }));
    const zenith = runtime.authored.resource;
    runtime.authored.phase = 1;
    runtime.authored.resource = learnedIds.includes("fixed-noon-sun") ? zenith / 3 : 0;
    return [{
      kind: "authored-falling-sun", seals,
      radius: solitary ? 76 : twin ? 92 : 118,
      centerRadius: dark ? 22 : solitary ? 28 : 42,
      damage: Math.max(1, Math.floor(runtime.combat.damage * (solitary ? 2.4 : twin ? 0.8 : swift ? 0.88 : 1.35) * (1 + zenith * (unsetting ? 2.2 : dark ? 1.8 : 1.35)))),
      zenith, supreme: false, sourceGongfaId: runtime.gongfaId
    }];
  }
  if (runtime.gongfaId === "scarlet-wave-manual") {
    const targets = options.targets ?? [];
    if (targets.length === 0 || runtime.authored.phase === 2) return [];
    const learnedIds = options.learnedMasteryIds ?? [];
    const playerX = options.playerX ?? 0;
    const playerY = options.playerY ?? 0;
    const target = [...targets].sort((a, b) => b.healthRatio - a.healthRatio)[0]!;
    const baseAngle = Math.atan2(target.y - playerY, target.x - playerX);
    const lance = learnedIds.includes("scarlet-lance-tide");
    const broad = learnedIds.includes("river-crossing-flame-moon");
    const rolling = learnedIds.includes("rolling-twin-tides");
    const horizon = learnedIds.includes("horizon-opposing-tides");
    const length = (lance ? 520 : broad ? 390 : 440) + (horizon ? 180 : 0);
    const width = lance ? 16 : broad ? 72 : 42;
    const durationMs = learnedIds.includes("after-tide-awaits-moon") ? 3600 : rolling ? 1100 : 2200;
    const angle = baseAngle + (runtime.authored.phase === 0 ? 0.5 : -0.5);
    const horizonSide = runtime.authored.phase === 0 ? -1 : 1;
    const wave = {
      x: playerX + (horizon ? Math.cos(angle + Math.PI / 2) * 210 * horizonSide : 0),
      y: playerY + (horizon ? Math.sin(angle + Math.PI / 2) * 210 * horizonSide : 0),
      angle, length, width: width + (horizon ? 20 : 0)
    };
    if (runtime.authored.phase === 0) {
      runtime.authored.phase = 1;
      runtime.authored.anchors = [{ kind: "trail", x: wave.x, y: wave.y, angle, value: wave.width, maxValue: length, remainingMs: durationMs }];
      return [{
        kind: "authored-scarlet-tides", waves: [wave], damage: Math.max(1, Math.floor(runtime.combat.damage * (lance ? 1.25 : broad ? 0.62 : 0.9) *
          (learnedIds.includes("after-tide-awaits-moon") ? 0.68 : 1) * (learnedIds.includes("long-sunset-trace") ? 0.72 : 1) * (horizon ? 1.18 : 1))),
        seamDamage: 0, immediateSeam: false, reverse: false, durationMs,
        supreme: false, sourceGongfaId: runtime.gongfaId
      }];
    }
    const first = runtime.authored.anchors.find((anchor) => anchor.kind === "trail" && anchor.angle !== undefined);
    if (!first) { runtime.authored.phase = 0; return []; }
    const firstLength = first.maxValue ?? length;
    const a1x = first.x - Math.cos(first.angle!) * firstLength / 2;
    const a1y = first.y - Math.sin(first.angle!) * firstLength / 2;
    const a2x = first.x + Math.cos(first.angle!) * firstLength / 2;
    const a2y = first.y + Math.sin(first.angle!) * firstLength / 2;
    const b1x = wave.x - Math.cos(wave.angle) * wave.length / 2;
    const b1y = wave.y - Math.sin(wave.angle) * wave.length / 2;
    const b2x = wave.x + Math.cos(wave.angle) * wave.length / 2;
    const b2y = wave.y + Math.sin(wave.angle) * wave.length / 2;
    const denominator = (a1x - a2x) * (b1y - b2y) - (a1y - a2y) * (b1x - b2x);
    const t = denominator === 0 ? -1 : ((a1x - b1x) * (b1y - b2y) - (a1y - b1y) * (b1x - b2x)) / denominator;
    const u = denominator === 0 ? -1 : -((a1x - a2x) * (a1y - b1y) - (a1y - a2y) * (a1x - b1x)) / denominator;
    let intersects = t >= 0 && t <= 1 && u >= 0 && u <= 1;
    const misbanked = learnedIds.includes("misbanked-flying-arc");
    if (!intersects && misbanked) intersects = Math.hypot(first.x - wave.x, first.y - wave.y) <= 420;
    const ix = intersects && t >= 0 ? a1x + t * (a2x - a1x) : (first.x + wave.x) / 2;
    const iy = intersects && t >= 0 ? a1y + t * (a2y - a1y) : (first.y + wave.y) / 2;
    const seamLength = learnedIds.includes("long-sunset-trace") ? 520 : 340;
    const seamAngle = (first.angle! + wave.angle) / 2;
    const seam = intersects ? {
      from: { x: ix - Math.cos(seamAngle) * seamLength / 2, y: iy - Math.sin(seamAngle) * seamLength / 2 },
      to: { x: ix + Math.cos(seamAngle) * seamLength / 2, y: iy + Math.sin(seamAngle) * seamLength / 2 },
      width: misbanked && t < 0 ? 18 : 30
    } : undefined;
    runtime.authored.anchors = seam ? [{
      kind: "trail", x: ix, y: iy, angle: seamAngle, value: seam.width,
      maxValue: seamLength
    }] : [];
    runtime.authored.phase = intersects ? 2 : 0;
    runtime.authored.targetLedger[-80] = 600;
    if (intersects) runtime.authored.cycleCount = Math.min(3, runtime.authored.cycleCount + 1);
    return [{
      kind: "authored-scarlet-tides", waves: [wave], seam,
      damage: Math.max(1, Math.floor(runtime.combat.damage * (lance ? 1.25 : broad ? 0.62 : rolling ? 0.72 : 0.9) *
        (learnedIds.includes("long-sunset-trace") ? 0.72 : 1) * (horizon ? 1.18 : 1))),
      seamDamage: Math.max(1, Math.floor(runtime.combat.damage * (learnedIds.includes("ruptured-burning-current") ? 2.1 : learnedIds.includes("reverse-scarlet-tide") ? 0.72 : 1.25))),
      immediateSeam: learnedIds.includes("ruptured-burning-current"), reverse: learnedIds.includes("reverse-scarlet-tide"),
      durationMs: learnedIds.includes("long-sunset-trace") ? 3200 : 1600,
      supreme: false, sourceGongfaId: runtime.gongfaId
    }];
  }
  if (runtime.gongfaId === "flame-demon-body-art") {
    const healthRatio = runtime.authored.secondaryResource || 1;
    const strikeCount = healthRatio > 0.7 ? 2 : healthRatio > 0.4 ? 3 : 4;
    const learnedIds = options.learnedMasteryIds ?? [];
    const shape = learnedIds.includes("one-horn-army-breaker")
      ? "focused" as const
      : learnedIds.includes("hungry-ghost-soul-pursuit")
        ? "pursuit" as const
        : "radial" as const;
    const costScale = learnedIds.includes("meridian-locking-heart-guard")
      ? 0.5
      : learnedIds.includes("life-flame-without-return")
        ? 1.5
        : 1;
    const missingHealthScale = 1 + (1 - healthRatio) *
      (learnedIds.includes("meridian-locking-heart-guard") ? 0.25 : 0.5) *
      (learnedIds.includes("life-flame-without-return") ? 1.5 : 1);
    const asuraChoice = (["undying-asura", "world-burning-asura", "life-hunting-asura"] as const)
      .find((id) => learnedIds.includes(id));
    const asuraActive = runtime.authored.phase === 1;
    const asuraDamageScale = !asuraActive
      ? 1
      : asuraChoice === "undying-asura"
        ? 0.84
        : asuraChoice === "world-burning-asura"
          ? 1.35
          : 1.08;
    const asuraRadiusScale = asuraActive && asuraChoice === "world-burning-asura" ? 1.5 : 1;
    const refundFraction = learnedIds.includes("blood-debt-repaid-at-the-end")
      ? 0.7
      : asuraActive && asuraChoice === "undying-asura"
        ? 0.85
        : healthRatio < 0.4 && !learnedIds.includes("life-flame-without-return") &&
            !(asuraActive && asuraChoice === "world-burning-asura")
          ? 0.5
          : 0;
    return [{
      kind: "authored-blood-combination",
      strikeCount,
      damage: Math.max(1, Math.floor(runtime.combat.damage * missingHealthScale * asuraDamageScale)),
      radius: runtime.combat.auraRadius *
        (shape === "focused" ? 0.62 : shape === "radial" ? 1.08 : 0.82) * asuraRadiusScale,
      staggerMs: Math.max(100, runtime.combat.projectileLifetimeMs),
      healthCostFractions: [0, 0.06 * costScale, 0.08 * costScale, 0.1 * costScale],
      shape,
      refundFraction,
      ...(asuraChoice ? { asuraChoice } : {}),
      asuraActive,
      sourceGongfaId: runtime.gongfaId
    }];
  }
  if (runtime.gongfaId === "sword-burial-formation") {
    return [{
      kind: "authored-line-strike",
      style: "grave-sword-rise",
      origin: "player",
      aimMode: "nearest",
      damage: Math.max(1, Math.floor(runtime.combat.damage * 0.3)),
      width: 7,
      length: Math.max(220, runtime.combat.range * 0.82),
      sourceGongfaId: runtime.gongfaId
    }];
  }
  if (runtime.gongfaId === "black-tide-scripture") {
    if ((runtime.authored.targetLedger[-99] ?? 0) > 0) return [];
    const learnedIds = options.learnedMasteryIds ?? [];
    const phase = (["ebb", "still", "flood"] as const)[runtime.authored.phase] ?? "ebb";
    const selectedPhase = learnedIds.includes("azure-sea-withdraws-the-border")
      ? "ebb"
      : learnedIds.includes("still-sea-mystic-mirror")
        ? "still"
        : learnedIds.includes("great-flood-presses-the-realm")
          ? "flood"
          : undefined;
    const phaseTradeScale = selectedPhase ? selectedPhase === phase ? 1.58 : 0.68 : 1;
    const baseDamageScale = phase === "ebb" ? 0.28 : phase === "still" ? 0.52 : 1.35;
    const r9DamageScale = learnedIds.includes("all-beings-share-the-flow")
      ? 0.62
      : learnedIds.includes("mystic-water-anchors-the-realm")
        ? 0.56
        : learnedIds.includes("dry-sea-splits-the-shore") && phase === "flood"
          ? 1.55
          : 1;
    const baseForce = phase === "ebb" ? -95 : phase === "still" ? 0 : 150;
    const r9ForceScale = learnedIds.includes("all-beings-share-the-flow")
      ? 1.65
      : learnedIds.includes("mystic-water-anchors-the-realm")
        ? 0.22
        : learnedIds.includes("dry-sea-splits-the-shore")
          ? 0.48
          : 1;
    return [{
      kind: "authored-world-tide-band",
      phase,
      direction: Math.max(0, Math.min(3, Math.floor(runtime.authored.secondaryResource))) as 0 | 1 | 2 | 3,
      damage: Math.max(1, Math.floor(runtime.combat.damage * baseDamageScale * phaseTradeScale * r9DamageScale)),
      bandCount: phase === "ebb" ? 3 : 2,
      bandWidth: phase === "ebb" ? 112 : phase === "still" ? 84 : 68,
      force: baseForce * r9ForceScale,
      slowMultiplier: phase === "still"
        ? learnedIds.includes("mystic-water-anchors-the-realm") ? 0.24 : 0.5
        : 0.82,
      sourceGongfaId: runtime.gongfaId
    }];
  }
  if (runtime.gongfaId === "vermilion-bird-covenant") {
    return [];
  }
  if (runtime.gongfaId === "myriad-beast-grove") {
    return [];
  }
  if (runtime.gongfaId === "ancient-tree-body-art") return [];
  if (runtime.gongfaId === "heavenfall-body-art") return [];
  if (runtime.gongfaId === "frozen-river-formation") {
    const targets = (options.targets ?? []).filter((target) =>
      !runtime.authored.anchors.some((anchor) =>
        anchor.kind === "seal" && anchor.sealRole === "origin" && anchor.targetId === target.targetId
      )
    );
    if (targets.length === 0) return [];
    const learnedIds = options.learnedMasteryIds ?? [];
    const playerX = options.playerX ?? 0;
    const playerY = options.playerY ?? 0;
    const threeFord = learnedIds.includes("three-ford-branching-flow");
    const curving = learnedIds.includes("curving-nether-river");
    const loneBridge = learnedIds.includes("lone-bridge-final-crossing");
    const chosen = targets
      .sort((a, b) => b.healthRatio - a.healthRatio)
      .slice(0, threeFord || curving ? 1 : Math.min(2, runtime.combat.count));
    const placed: Array<{ x: number; y: number; role: "origin" | "crossing"; chainId: number }> = [];
    for (const target of chosen) {
      const chainId = ++runtime.authored.activationCount;
      const angleToPlayer = Math.atan2(playerY - target.y, playerX - target.x);
      const crossingCount = threeFord || curving ? 3 : 1;
      const strength = loneBridge ? 1.5 : threeFord ? 0.58 : curving ? 0.66 : 1;
      runtime.authored.anchors.push({
        kind: "seal", sealRole: "origin", chainId, targetId: target.targetId,
        x: target.x, y: target.y, value: strength, remainingMs: runtime.combat.projectileLifetimeMs * 2.2
      });
      placed.push({ x: target.x, y: target.y, role: "origin", chainId });
      for (let index = 0; index < crossingCount; index += 1) {
        const spread = curving
          ? (index - 1) * 0.72
          : threeFord
            ? (index - 1) * 0.42
            : 0;
        const distance = loneBridge ? 175 : threeFord ? 68 + index * 30 : curving ? 92 : 108;
        const baseX = curving ? playerX : target.x;
        const baseY = curving ? playerY : target.y;
        const x = baseX + Math.cos(angleToPlayer + spread) * distance;
        const y = baseY + Math.sin(angleToPlayer + spread) * distance;
        runtime.authored.anchors.push({
          kind: "seal", sealRole: "crossing", chainId, x, y, value: strength,
          remainingMs: runtime.combat.projectileLifetimeMs * 2.2
        });
        placed.push({ x, y, role: "crossing", chainId });
      }
    }
    runtime.authored.anchors = runtime.authored.anchors
      .filter((anchor) => anchor.kind === "seal")
      .slice(-authoredGongfaMechanics["frozen-river-formation"].balance.objectBudget);
    runtime.authored.charges = runtime.authored.anchors.filter((anchor) => anchor.sealRole === "origin").length;
    return [{
      kind: "authored-cold-debt-placement",
      seals: placed,
      lifetimeMs: runtime.combat.projectileLifetimeMs * 2.2,
      sourceGongfaId: runtime.gongfaId
    }];
  }
  if (runtime.gongfaId === "thousand-root-formation") {
    const lineages = runtime.authored.anchors.filter((anchor) => anchor.kind === "infection");
    if (lineages.length >= runtime.authored.maxCharges) return [];
    const infectedIds = new Set(lineages.map((anchor) => anchor.targetId));
    const playerX = options.playerX ?? 0;
    const playerY = options.playerY ?? 0;
    const host = (options.targets ?? [])
      .filter((target) => !infectedIds.has(target.targetId))
      .sort((a, b) =>
        distanceSquared(a.x, a.y, playerX, playerY) - distanceSquared(b.x, b.y, playerX, playerY)
      )[0];
    if (!host) return [];
    runtime.authored.anchors.push({
      kind: "infection",
      targetId: host.targetId,
      x: host.x,
      y: host.y,
      value: 0,
      infectionStage: 0
    });
    runtime.authored.charges = lineages.length + 1;
    runtime.authored.resource = runtime.authored.charges / runtime.authored.maxCharges;
    return [{
      kind: "authored-root-infection",
      hosts: [{ targetId: host.targetId, x: host.x, y: host.y }],
      sourceGongfaId: runtime.gongfaId
    }];
  }
  const archetypeBonus = surgeBonusCount(runtime, options.learnedMasteryIds ?? []);
  if (runtime.combat.pattern === "ritual") {
    return [{
      kind: "ritual-impact",
      count: Math.max(1, runtime.combat.count + Math.floor(archetypeBonus / 3)),
      damage: runtime.combat.damage,
      radius: runtime.combat.auraRadius,
      telegraphMs: runtime.combat.projectileLifetimeMs,
      burnPulses: Math.max(2, runtime.combat.returnShots),
      burnDelayMs: 360
    }];
  }
  if (runtime.combat.pattern === "summon") {
    return [{
      kind: "summon-wraiths",
      count: Math.max(1, runtime.combat.count + archetypeBonus),
      shotsPerWraith: Math.max(2, runtime.combat.returnShots),
      damage: runtime.combat.damage,
      pierce: runtime.combat.pierce,
      orbitMs: 320
    }];
  }
  if (runtime.combat.pattern === "melee") {
    return [{
      kind: "melee-combination",
      strikeCount: Math.max(2, runtime.combat.count + archetypeBonus),
      damage: runtime.combat.damage,
      radius: runtime.combat.auraRadius,
      finisherScale: 1.55 + (runtime.surge?.stacks ?? 0) * 0.08,
      staggerMs: runtime.combat.projectileLifetimeMs
    }];
  }
  if (runtime.combat.pattern === "trap") {
    return [{
      kind: "root-trap-array",
      count: Math.max(1, runtime.combat.count + archetypeBonus),
      pulses: Math.max(2, runtime.combat.returnShots),
      damage: runtime.combat.damage,
      radius: runtime.combat.auraRadius,
      pulseDelayMs: 420,
      lifetimeMs: runtime.combat.projectileLifetimeMs
    }];
  }
  if (runtime.crimsonFurnace) {
    const learnedMasteryIds = options.learnedMasteryIds ?? [];
    let count = runtime.combat.count;
    // Furnace Heart: Crucible Pressure adds needles to each volley.
    if (learnedMasteryIds.includes("furnace-heart")) {
      count += Math.floor(runtime.crimsonFurnace.pressure / 20);
    }
    const commands: GongfaRuntimeCommand[] = [{ kind: "crimson-furnace-volley", count }];
    // Relentless Needles: high Pressure looses a second volley.
    if (learnedMasteryIds.includes("relentless-needles") && runtime.crimsonFurnace.pressure >= 40) {
      commands.push({
        kind: "crimson-furnace-volley",
        count: Math.max(1, Math.floor(count / 2))
      });
    }
    return commands;
  }

  switch (runtime.combat.pattern) {
    case "homing": {
      const learnedMasteryIds = options.learnedMasteryIds ?? [];
      const transformationTriggers = runtime.yujian
        ? {
            executionSeal: learnedMasteryIds.includes("execution-seal"),
            swordBloom: learnedMasteryIds.includes("sword-bloom"),
            reversingSwordPath: learnedMasteryIds.includes("reversing-sword-path")
          }
        : emptyYujianTransformationTriggers;
      let count = runtime.combat.count;
      // Intent Unleashed: a full Intent charge empowers the next volley.
      if (
        runtime.yujian &&
        learnedMasteryIds.includes("intent-unleashed") &&
        runtime.yujian.intentStacks >= 5
      ) {
        count += 3;
      }
      // Sword Crown: current Intent crowns the volley with spectral swords.
      if (runtime.yujian && learnedMasteryIds.includes("sword-crown")) {
        count += runtime.yujian.intentStacks;
      }
      // Ember Surge adds a feather per two Embers; Ember Burst spends a full
      // charge for an extra flurry.
      if (runtime.blazingFeather) {
        count += Math.floor(runtime.blazingFeather.emberStacks / 2);
        if (
          learnedMasteryIds.includes("ember-burst") &&
          runtime.blazingFeather.emberStacks >= MAX_EMBER_STACKS
        ) {
          count += 3;
        }
        // Phoenix Ascendant: Embers crown the volley with spectral feathers.
        if (learnedMasteryIds.includes("phoenix-ascendant")) {
          count += runtime.blazingFeather.emberStacks;
        }
      }
      count += surgeBonusCount(runtime, learnedMasteryIds);
      const commands: GongfaRuntimeCommand[] = [
        {
          kind: "homing-volley",
          count,
          transformationTriggers
        }
      ];

      if (runtime.yujian && transformationTriggers.reversingSwordPath) {
        commands.push({
          kind: "spawn-yujian-reversal",
          delayMs: 170,
          damage: Math.max(1, Math.floor(runtime.combat.damage * 0.58)),
          pierce: runtime.combat.pierce + 1,
          speed: runtime.combat.projectileSpeed + 70,
          lifetimeMs: runtime.combat.projectileLifetimeMs + 160
        });
      }

      return commands;
    }
    case "wave": {
      const learnedMasteryIds = options.learnedMasteryIds ?? [];
      // Endless Horizon: the Cutting Front grows as it travels, scaled by Momentum.
      const growthScale =
        runtime.jinfeng && learnedMasteryIds.includes("endless-horizon")
          ? 1 + runtime.jinfeng.momentum * 0.18
          : undefined;
      const commands: GongfaRuntimeCommand[] = [
        {
          kind: "wave-volley",
          count: Math.max(1, runtime.combat.count + surgeBonusCount(runtime, learnedMasteryIds)),
          returnShots: runtime.combat.returnShots,
          aimMode: runtime.jinfeng ? "last" : "nearest",
          ...(growthScale !== undefined ? { growthScale } : {})
        }
      ];

      // Crescent Wake trails an extra cutting crescent while moving at speed.
      if (
        runtime.jinfeng &&
        learnedMasteryIds.includes("crescent-wake") &&
        runtime.jinfeng.momentum >= 2
      ) {
        commands.push({
          kind: "wave-volley",
          count: 1,
          returnShots: 0,
          aimMode: "last"
        });
      }

      return commands;
    }
    case "aura":
      if (!runtime.burningRing) {
        const learnedMasteryIds = options.learnedMasteryIds ?? [];
        let count = runtime.combat.count;
        // Hundred-Blade Halo: Guard fuels a denser rotating blade halo.
        if (runtime.gengjin && learnedMasteryIds.includes("hundred-blade-halo")) {
          count += Math.floor(runtime.gengjin.guardValue / 12);
        }
        // Gengjin Fortress: current Guard manifests as orbiting defensive blades.
        if (runtime.gengjin && learnedMasteryIds.includes("gengjin-fortress")) {
          count += Math.floor(runtime.gengjin.guardValue / 8);
        }
        count += surgeBonusCount(runtime, learnedMasteryIds);
        return [
          {
            kind: "aura-burst",
            damage: runtime.combat.damage,
            count
          }
        ];
      }
      break;
  }

  const state = runtime.burningRing;
  if (!state) {
    return [];
  }

  const learnedMasteryIds = options.learnedMasteryIds ?? [];
  const baseSegmentCount = Math.max(
    6,
    state.ringSegments + state.counterflowRingAppliedSegments
  );
  // Condensed Furnace Ring: merge into fewer, fiercer priority-burning hotspots.
  const condensed = learnedMasteryIds.includes("condensed-furnace-ring");
  // Perfect Solar Orbit: Heat adds segments and closes the ring's gaps.
  const perfectOrbit = learnedMasteryIds.includes("perfect-solar-orbit");
  const segmentCount =
    (condensed ? Math.max(3, Math.floor(baseSegmentCount / 2)) : baseSegmentCount) +
    (perfectOrbit ? Math.floor(state.heat / 20) : 0);
  return [
    {
      kind: "burning-ring-volley",
      rotation: (Math.max(0, elapsedMs) / 1000) * 0.9,
      segmentCount,
      visibleSegments: perfectOrbit
        ? segmentCount
        : Math.min(segmentCount, Math.max(4, segmentCount - 2)),
      ringRadius: 24 + Math.floor(state.heat * 0.3),
      ...(condensed ? { damageScale: 1.8 } : {}),
      ...(learnedMasteryIds.includes("scattered-ember-orbit") ? { scatterEmbers: true } : {})
    }
  ];
}

export interface CrimsonTargetFact {
  index: number;
  embedStacks: number;
  distance: number;
  active: boolean;
}

export function selectCrimsonFurnaceTargetIndexes(
  candidates: CrimsonTargetFact[],
  count: number
): number[] {
  return candidates
    .filter((enemy) => enemy.active)
    .sort((a, b) => {
      const embedPriority = b.embedStacks - a.embedStacks;
      if (embedPriority !== 0) {
        return embedPriority;
      }

      return a.distance - b.distance;
    })
    .slice(0, Math.max(0, count))
    .map((enemy) => enemy.index);
}

export function getCrimsonEmbedThreshold(runtime: GongfaRuntime): number {
  return runtime.crimsonFurnace?.embedThreshold ?? crimsonFurnaceDefaults.embedThreshold;
}

export function splitGongfaImprovementReplayIds(upgradeIds: string[]): GongfaImprovementReplayPlan {
  const checkpointedRuntimeEffects: UpgradeEffect[] = [
    "heatBuild",
    "heatDecay",
    "auraSynergy",
    "galeMomentumBuild",
    "galeMomentumDecay",
    "waveSynergy",
    "guardBuild",
    "guardStability",
    "defensiveSynergy",
    "embedThreshold",
    "pressureBuild",
    "pressureDecay"
  ];

  return upgradeIds.reduce<GongfaImprovementReplayPlan>(
    (plan, upgradeId) => {
      const upgrade = upgradeConfigs.find((item) => item.id === upgradeId);
      if (
        upgrade?.effect === "moveSpeed" ||
        upgrade?.effect === "maxHealth" ||
        upgrade?.effect === "heal" ||
        upgrade?.effect === "magnet"
      ) {
        plan.playerUpgradeIds.push(upgradeId);
        return plan;
      }

      if (
        upgrade &&
        (checkpointedRuntimeEffects.includes(upgrade.effect) || upgradeId === "counterflow-ring")
      ) {
        plan.checkpointedRuntimeUpgradeIds.push(upgradeId);
        return plan;
      }

      plan.runtimeUpgradeIds.push(upgradeId);
      return plan;
    },
    { runtimeUpgradeIds: [], checkpointedRuntimeUpgradeIds: [], playerUpgradeIds: [] }
  );
}

function applyStructuralTransformation(
  runtime: GongfaRuntime,
  transformationId: string
): GongfaRuntime | undefined {
  if (runtime.jinfeng) {
    if (transformationId === "heaven-splitting-line") {
      // Compress the Cutting Front into one long penetrating lane.
      const next = copyRuntime(runtime);
      next.combat.count = 1;
      next.combat.pierce += 2;
      next.combat.range += 90;
      next.combat.spreadDeg = Math.max(2, Math.floor(next.combat.spreadDeg / 2));
      return next;
    }

    if (transformationId === "golden-gale-fan") {
      // Spread the Cutting Front into a broad frontal arc.
      const next = copyRuntime(runtime);
      next.combat.count += 2;
      next.combat.spreadDeg += 40;
      return next;
    }
  }

  if (runtime.gongfaId === "blazing-feather-art") {
    if (transformationId === "searing-feathers") {
      const next = copyRuntime(runtime);
      next.combat.pierce += 2;
      next.combat.count = Math.max(1, next.combat.count - 1);
      next.combat.damage = Math.round(next.combat.damage * 1.35 * 100) / 100;
      next.combat.spreadDeg = Math.round(next.combat.spreadDeg * 0.65);
      return next;
    }

    if (transformationId === "feather-storm") {
      const next = copyRuntime(runtime);
      next.combat.count += 3;
      next.combat.spreadDeg += 24;
      next.combat.damage = Math.round(next.combat.damage * 0.8 * 100) / 100;
      return next;
    }

    if (transformationId === "swift-molt") {
      const next = copyRuntime(runtime);
      next.combat.cooldownMs = Math.max(180, Math.floor(next.combat.cooldownMs * 0.72));
      next.combat.damage = Math.round(next.combat.damage * 0.82 * 100) / 100;
      next.combat.projectileSpeed += 80;
      return next;
    }
  }

  if (runtime.surge) {
    const mechanics = getSurgeGongfaSpec(runtime.gongfaId)?.mechanics;
    if (SURGE_FOCUS_IDS.has(transformationId)) {
      const next = copyRuntime(runtime);
      next.combat.pierce += mechanics?.focusPierce ?? 2;
      next.combat.count = Math.max(1, next.combat.count - 1);
      next.combat.damage = Math.round(
        next.combat.damage * (mechanics?.focusDamageScale ?? 1.35) * 100
      ) / 100;
      next.combat.spreadDeg = Math.round(
        next.combat.spreadDeg * (mechanics?.focusSpreadScale ?? 0.65)
      );
      return next;
    }
    if (SURGE_SPREAD_IDS.has(transformationId)) {
      const next = copyRuntime(runtime);
      next.combat.count += mechanics?.spreadCount ?? 2;
      next.combat.spreadDeg += mechanics?.spreadDegrees ?? 24;
      next.combat.damage = Math.round(
        next.combat.damage * (mechanics?.spreadDamageScale ?? 0.8) * 100
      ) / 100;
      return next;
    }
    if (SURGE_QUICKEN_IDS.has(transformationId)) {
      const next = copyRuntime(runtime);
      next.combat.cooldownMs = Math.max(
        180,
        Math.floor(next.combat.cooldownMs * (mechanics?.quickenCooldownScale ?? 0.72))
      );
      next.combat.damage = Math.round(
        next.combat.damage * (mechanics?.quickenDamageScale ?? 0.82) * 100
      ) / 100;
      next.combat.projectileSpeed += mechanics?.quickenSpeed ?? 60;
      return next;
    }
  }

  if (runtime.crimsonFurnace) {
    if (transformationId === "crimson-piercing-needles") {
      const next = copyRuntime(runtime);
      next.combat.pierce += 2;
      next.combat.count = Math.max(1, next.combat.count - 1);
      return next;
    }

    if (transformationId === "scattered-needles") {
      const next = copyRuntime(runtime);
      next.combat.count += 2;
      return next;
    }

    if (transformationId === "volatile-embeds") {
      const next = copyRuntime(runtime);
      next.crimsonFurnace!.embedThreshold = Math.max(1, next.crimsonFurnace!.embedThreshold - 1);
      return next;
    }

    if (transformationId === "sustained-crucible") {
      const next = copyRuntime(runtime);
      next.crimsonFurnace!.pressureDecayRate = Math.max(
        0.08,
        next.crimsonFurnace!.pressureDecayRate * 0.55
      );
      return next;
    }

    if (transformationId === "resonant-crucible") {
      const next = copyRuntime(runtime);
      next.crimsonFurnace!.pressureBuildRate += 0.7;
      return next;
    }

    if (transformationId === "overpressure-detonation") {
      const next = copyRuntime(runtime);
      next.crimsonFurnace!.pressureRadiusScale += 0.35;
      syncCrimsonFurnaceCombat(next);
      return next;
    }
  }

  return undefined;
}

export function applyGongfaImprovement(
  runtime: GongfaRuntime,
  upgradeId: string
): GongfaImprovementResult {
  // Milestone Transformations are not authored in upgradeConfigs. Structural
  // ones (those that restructure Skill 1 on selection) are applied here.
  const structural = applyStructuralTransformation(runtime, upgradeId);
  if (structural) {
    return { runtime: structural };
  }

  const upgrade = upgradeConfigs.find((item) => item.id === upgradeId);
  if (!upgrade) {
    return { runtime };
  }
  if (upgrade.requiredGongfaIds && !upgrade.requiredGongfaIds.includes(runtime.gongfaId)) {
    return { runtime };
  }

  const next = copyRuntime(runtime);
  const skill1 = next.skill1Refinements ?? (next.skill1Refinements = emptySkill1Refinements());

  switch (upgrade.effect) {
    case "skill1Damage":
      next.combat.damage += upgrade.value;
      skill1.damageBonus += upgrade.value;
      return { runtime: next };
    case "skill1Cooldown":
      next.combat.cooldownMs = Math.max(180, Math.floor(next.combat.cooldownMs * upgrade.value));
      return { runtime: next };
    case "skill1Count":
      next.combat.count += upgrade.value;
      skill1.countBonus += upgrade.value;
      if (upgradeId === "counterflow-ring" && next.burningRing) {
        next.burningRing.counterflowRingSegments += 1;
        next.burningRing.counterflowRingAppliedSegments =
          next.burningRing.counterflowRingSegments;
      }
      return { runtime: next };
    case "skill1Pierce":
      next.combat.pierce += upgrade.value;
      skill1.pierceBonus += upgrade.value;
      return { runtime: next };
    case "skill1Range":
      next.combat.range += upgrade.value;
      next.combat.auraRadius += upgrade.value;
      skill1.rangeBonus += upgrade.value;
      return { runtime: next };
    case "gongfaDamageSynergy":
      next.combat.damage += upgrade.value;
      return { runtime: next };
    case "gongfaPierceSynergy":
      next.combat.pierce += upgrade.value;
      return { runtime: next };
    case "gongfaRangeSynergy":
      next.combat.range += upgrade.value;
      next.combat.auraRadius += upgrade.value;
      return { runtime: next };
    case "resourcePotency":
      if (next.yujian) {
        next.yujian.intentPotencyBonus += upgrade.value;
      }
      syncYujianCombat(next);
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
    case "heatBuild":
      if (next.burningRing) {
        next.burningRing.heatBuildRate += upgrade.value;
        return { runtime: next };
      }
      break;
    case "heatDecay":
      if (next.burningRing) {
        next.burningRing.heatDecayRate = Math.max(
          0.08,
          next.burningRing.heatDecayRate * upgrade.value
        );
        return { runtime: next };
      }
      break;
    case "auraSynergy":
      if (next.burningRing) {
        next.burningRing.heatDecayRate = Math.max(
          0.08,
          next.burningRing.heatDecayRate * 0.84
        );
        next.burningRing.heatAuraSpeedBonus += upgrade.value;
        syncBurningRingCombat(next);
        return { runtime: next };
      }
      break;
    case "galeMomentumBuild":
      if (next.jinfeng) {
        next.jinfeng.momentumBuildRate += upgrade.value;
        return { runtime: next };
      }
      break;
    case "galeMomentumDecay":
      if (next.jinfeng) {
        next.jinfeng.momentumDecayRate = Math.max(
          0.08,
          next.jinfeng.momentumDecayRate * upgrade.value
        );
        return { runtime: next };
      }
      break;
    case "waveSynergy":
      if (next.jinfeng) {
        next.jinfeng.momentumWaveBonus += upgrade.value;
        syncJinfengCombat(next);
        return { runtime: next };
      }
      break;
    case "guardBuild":
      if (next.gengjin) {
        next.gengjin.guardBuildRate += upgrade.value;
        return { runtime: next };
      }
      break;
    case "guardStability":
      if (next.gengjin) {
        next.gengjin.guardDecayRate = Math.max(
          0.08,
          next.gengjin.guardDecayRate * upgrade.value
        );
        return { runtime: next };
      }
      break;
    case "defensiveSynergy":
      if (next.gengjin) {
        next.gengjin.guardMitigationBonus += upgrade.value;
        syncGengjinCombat(next);
        return { runtime: next };
      }
      break;
    case "embedThreshold":
      if (next.crimsonFurnace) {
        next.crimsonFurnace.embedThreshold = Math.max(
          1,
          next.crimsonFurnace.embedThreshold + upgrade.value
        );
        return { runtime: next };
      }
      break;
    case "pressureBuild":
      if (next.crimsonFurnace) {
        next.crimsonFurnace.pressureBuildRate += upgrade.value;
        return { runtime: next };
      }
      break;
    case "pressureDecay":
      if (next.crimsonFurnace) {
        next.crimsonFurnace.pressureDecayRate = Math.max(
          0.08,
          next.crimsonFurnace.pressureDecayRate * upgrade.value
        );
        next.crimsonFurnace.pressureRadiusScale += 0.08;
        syncCrimsonFurnaceCombat(next);
        return { runtime: next };
      }
      break;
    default:
      break;
  }

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
