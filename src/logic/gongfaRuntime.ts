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
  /** Legacy checkpoint payload; new runtimes migrate to authored quiver state. */
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
  embedStacks?: number;
  embedPower?: number;
}

export interface YujianState {
  executionSealTriggers: number;
  swordBloomTriggers: number;
  reversingSwordPathTriggers: number;
  /** Legacy checkpoint fields retained for save decoding; they have no live effect. */
  executionSealStacksByTarget: Record<number, number>;
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
  guardCapacity: number;
  fractureCount: number;
  fractureRecoveryRemaining: number;
  mitigationDisabledRemaining: number;
  postEvadeLayerRemaining: number;
  postEvadeGuard: number;
  rememberedSourceId: number;
  rememberedHits: number;
  shieldValue: number;
  shieldRemaining: number;
  isMoving: boolean;
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
  rotation: number;
  rotationDirection: 1 | -1;
  coronaTickRemaining: number;
  radiusPhaseRemaining: number;
  guardRemaining: number;
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
  networkIgnitionCooldownRemaining: number;
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
  | { kind: "surge-hit"; learnedMasteryIds?: string[] }
  | { kind: "gengjin-defensive-hit"; learnedMasteryIds?: string[] }
  | {
      kind: "evade";
      playerX?: number;
      playerY?: number;
      movementAngle?: number;
      nearbyEnemyCount?: number;
      targets?: AuthoredTargetFact[];
      learnedMasteryIds?: string[];
    }
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
  | { kind: "authored-asura-transform"; healthRatio: number; learnedMasteryIds?: string[] }
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
  | { kind: "incoming-damage"; amount: number; incomingAngle?: number; sourceDistance?: number; sourceId?: number; healthRatio?: number; currentHealth?: number; skill2Id?: string; learnedMasteryIds?: string[] }
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
      embedStacks?: number;
      embedPower?: number;
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
      kind: "authored-burning-corona";
      rotation: number;
      rings: Array<{
        radius: number;
        direction: 1 | -1;
        segmentCount: number;
        visibleSegments: number;
        arcFraction: number;
        damage: number;
      }>;
      guard: boolean;
      sunspotLure: boolean;
      pushStrength: number;
      sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-mirror-facets";
      facets: Array<{ angle: number; durability: number; maxDurability: number; lingering: boolean }>;
      radius: number;
      arcWidth: number;
      shell: boolean;
      sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-mirror-reflection";
      angles: number[];
      damage: number;
      shardsPerAngle: number;
      range: number;
      width: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-gengjin-brace";
      guard: number;
      capacity: number;
      fractures: number;
      disabled: boolean;
      shield: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-gengjin-reflection";
      targetId: number;
      amount: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-gengjin-release";
      law: "shared" | "single" | "shield";
      conservedTotal: number;
      allocations: Array<{ targetId: number; amount: number }>;
      shield: number;
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-ironwood-walls";
      walls: Array<{
        x: number; y: number; angle: number; length: number; thickness: number;
        durability: number; maxDurability: number; mode: "rooted" | "driving" | "citadel" | "citadel-drive";
      }>;
      damage: number;
      pushStrength: number;
      deltaMs: number;
      sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
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
      kind: "lodge-crimson-needle";
      targetId: number;
      embedStacks: number;
      embedPower: number;
    }
  | {
      kind: "authored-crimson-network";
      nodes: Array<{ targetId: number; x: number; y: number; nodeCount: number; ground: boolean; core: boolean }>;
      links: Array<{ fromTargetId: number; toTargetId: number }>;
      pressure: number;
      ignition?: {
        targetIds: number[];
        damage: number;
        propagationDelayMs: number;
        fragmentLaw: "reforge" | "return" | "falling-star";
        fragmentCount: number;
        followUp: boolean;
      };
      sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
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
      kind: "sprout-sun-circle";
      spokeCount: number;
      pulseCount: number;
      pulseDelayMs: number;
      damage: number;
      radius: number;
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
      style: "mist-wraith-crossing" | "soul-guiding-lantern" | "grave-sword-rise";
      origin: "player" | { x: number; y: number };
      aimMode?: "nearest" | "strongest";
      angle?: number;
      damage: number;
      width: number;
      length: number;
      sourceGongfaId: GongfaId;
      angleOffset?: number;
      graveLaw?: "recorded" | "leader" | "old-road" | "great-que" | "mound" | "forest";
      slowMultiplier?: number;
      slowDurationMs?: number;
      maxHits?: number;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-mist-wraith-crossing";
      from: { x: number; y: number };
      waypoints: Array<{ x: number; y: number }>;
      targetIds: number[];
      damage: number;
      width: number;
      rankPower: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-ghost-procession";
      routes: Array<{
        from: { x: number; y: number };
        to: { x: number; y: number };
        targetIds: number[];
        damage: number;
        width: number;
        rankPower: number;
      }>;
      fate: "parallel" | "converge" | "funeral";
      slowMultiplier: number;
      slowDurationMs: number;
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
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
      healthBand: "high" | "mid" | "low" | "critical";
      bossDamageScale: number;
      continuationsRemaining: number;
      armCountBonus: number;
      splitAcrossArms: boolean;
      sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-asura-transformation";
      choice: "undying-asura" | "world-burning-asura" | "life-hunting-asura";
      recoveryCeiling: number;
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-cold-debt-placement";
      seals: Array<{ x: number; y: number; role: "origin" | "crossing"; chainId: number }>;
      formation: "standard" | "lone-bridge" | "three-ford" | "curving-river";
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
      width: number;
      durationMs: number;
      fate: "shared-cold" | "collective-liability" | "compensating-ferry";
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-frozen-river-resolution";
      edge: { from: { x: number; y: number }; to: { x: number; y: number } };
      targetIds: number[];
      damagePool: number;
      width: number;
      slowMultiplier: number;
      slowDurationMs: number;
      hardFreezeOrdinary: boolean;
      bossDamageScale: number;
      fate: "shared-cold" | "collective-liability" | "compensating-ferry";
      sourceGongfaId: GongfaId;
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
      focusTargetId?: number;
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
      flightStyle: "guided" | "head-hunt" | "guardian" | "sweep" | "return" | "rebirth";
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
      canopyRadius: number; activeBranchSector: number;
      rootTargetIds: number[]; branchTargetIds: number[]; canopyTargetIds: number[];
      rootDamage: number; branchDamage: number; canopyDamage: number; rootForce: number;
      bossDamageScale: number;
      law: "many-roots" | "one-tree" | "sheltering";
      heal: number; worldTree: boolean; canopyFocus: boolean; clearProjectiles: boolean;
      sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-heavenfall-body";
      x: number; y: number; radius: number; mass: number; angle: number;
      committing: boolean; landingX?: number; landingY?: number;
      damage: number; force: number;
      eligibleTargetIds: number[];
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-star-descent";
      originX: number; originY: number; landingX: number; landingY: number;
      returnX?: number; returnY?: number; angle: number; mass: number; damage: number; radius: number;
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
    }
  | {
      kind: "authored-moon-orbit";
      moons: Array<{ x: number; y: number; radius: number }>;
      orbiters: Array<{ targetId: number; moonIndex: number }>;
      tangentForce: number; inwardForce: number; suspend: boolean; sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-moon-resolution";
      x: number; y: number; targetIds: number[];
      fate: "collapse" | "release" | "suspend" | "eclipse";
      damage: number; force: number; syzygy: number; supreme: boolean;
      sourceGongfaId: GongfaId; masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-glyph-invocation";
      glyphs: Array<"root" | "leaf" | "thorn">;
      shape: "root-circle" | "leaf-route" | "thorn-triangle";
      motion: "fixed" | "traveling" | "contracting";
      payoff: "bind" | "repeat" | "damage";
      x: number; y: number; target?: { x: number; y: number; targetId: number };
      radius: number; damage: number; power: number; repeatCount: number;
      clearProjectiles: boolean; sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-sprout-sun";
      x: number; y: number; radius: number; rootDamage: number; leafDamage: number;
      thornDamage: number; phaseDelayMs: number; sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-blazing-feather-fan";
      origin: { x: number; y: number };
      angle: number;
      arc: number;
      range: number;
      optimalStart: number;
      optimalEnd: number;
      targets: Array<{ targetId: number; x: number; y: number; damage: number; optimal: boolean }>;
      lastFeather: boolean;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-phoenix-horizon";
      from: { x: number; y: number };
      to: { x: number; y: number };
      targetIds: number[];
      damage: number;
      executeHealthRatio: number;
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-frost-needle-chain";
      points: Array<{ targetId: number; x: number; y: number; damage: number }>;
      freezeMs: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-reverse-winter-thread";
      points: Array<{ targetId: number; x: number; y: number; damage: number }>;
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-yujian-flight";
      swordId: number;
      targetId: number;
      route: Array<{ x: number; y: number }>;
      outboundDamage: number;
      returnDamage: number;
      shadeTargetIds: number[];
      domainTargetIds: number[];
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-myriad-swords-return";
      routes: Array<{ swordId: number; points: Array<{ x: number; y: number }>; targetId?: number }>;
      targetIds: number[];
      damage: number;
      intersectionDamage: number;
      sourceGongfaId: GongfaId;
      masteryCast?: MasterySkill2Cast;
    }
  | {
      kind: "authored-jinfeng-ground-cut";
      from: { x: number; y: number };
      to: { x: number; y: number };
      targetIds: number[];
      damage: number;
      delayMs: number;
      lifetimeMs: number;
      style: "cross-step" | "longitudinal" | "wake" | "rupture" | "evade-cross" | "standing";
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-golden-gale-route";
      points: Array<{ x: number; y: number }>;
      targetIds: number[];
      damage: number;
      width: number;
      durationMs: number;
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "authored-vine-tether";
      endpoints: Array<{ x: number; y: number; targetId?: number }>;
      player: { x: number; y: number };
      tension: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-vine-contact";
      from: { x: number; y: number };
      via: { x: number; y: number };
      to: { x: number; y: number };
      targetIds: number[];
      damage: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-vine-snap";
      from: { x: number; y: number };
      to: { x: number; y: number };
      targetIds: number[];
      damage: number;
      bindMs: number;
      sourceGongfaId: GongfaId;
    }
  | {
      kind: "authored-heaven-net";
      points: Array<{ x: number; y: number }>;
      targetIds: number[];
      damage: number;
      durationMs: number;
      slowMultiplier: number;
      sourceGongfaId: GongfaId;
      masteryCast: MasterySkill2Cast;
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

export interface MasterySkill2Cast {
  skill2Id: AuthoredSkill2Intent;
  cooldownMs?: number;
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
    trigger: "threshold",
    cooldownMs: 2400
  },
  "golden-gale-corridor": {
    intent: "golden-gale-corridor",
    trigger: "threshold",
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
    trigger: "threshold",
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
  const resource = runtime.surge?.stacks ?? 0;

  switch (skill2.intent) {
    case "feather-rain-formation":
      return { kind: skill2.intent, fanCount: 3 + coverage, feathersPerFan: Math.max(3, combat.count + resource + coverage), fanDelayMs: delay(140), damage: damage(combat.damage * (1.1 + resource * 0.08)), pierce: combat.pierce, masteryCast };
    case "sunset-wave-apex":
      return { kind: skill2.intent, wallCount: 2, overlapScale: 1.4 + resource * 0.08, damage: damage(combat.damage * (1.15 + resource * 0.07)), width: 70 + resource * 10 + coverage * 18, pierce: combat.pierce + 1, speed: combat.projectileSpeed, lifetimeMs: combat.projectileLifetimeMs + 300, distanceScale, speedScale, masteryCast };
    case "mirror-needle-constellation":
      return { kind: skill2.intent, needleCount: Math.max(5, combat.count + 3 + resource + coverage * 2), staggerMs: delay(75), damage: damage(combat.damage * 1.05), pierce: combat.pierce + Math.floor(resource / 3), masteryCast };
    case "moon-tide-vault":
      return { kind: skill2.intent, radius: 180 + resource * 12 + coverage * 24, damage: damage(combat.damage * 1.2), controlStrength: 180 + resource * 15 + coverage * 20, returnDelayMs: delay(320), masteryCast };
    case "sprout-sun-circle":
      return { kind: skill2.intent, spokeCount: Math.max(8, combat.count + 5 + resource + coverage * 2), pulseCount: 3 + coverage, pulseDelayMs: delay(220), damage: damage(combat.damage * (1.1 + resource * 0.07)), radius: 100 + resource * 12 + coverage * 18, masteryCast };
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
  guardCapacity: number;
  guardFractureCount: number;
  guardFractureRecoveryRemaining: number;
  guardMitigationDisabledRemaining: number;
  guardPostEvadeLayerRemaining: number;
  guardPostEvadeGuard: number;
  guardRememberedSourceId: number;
  guardRememberedHits: number;
  guardShieldValue: number;
  guardShieldRemaining: number;
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
  guardCapacity: number;
  guardFractures: number;
  guardDisabled: boolean;
  guardShield: number;
  guardMitigation: number;
  bladeShellCharge: number;
  bladeShellCasts: number;
  masteryTransformationTriggers: {
    executionSeal: number;
    swordBloom: number;
    reversingSwordPath: number;
  };
}

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
  gengjinPulseCooldownRemaining: 0,
  guardCapacity: 100,
  fractureCount: 0,
  fractureRecoveryRemaining: 0,
  mitigationDisabledRemaining: 0,
  postEvadeLayerRemaining: 0,
  postEvadeGuard: 0,
  rememberedSourceId: 0,
  rememberedHits: 0,
  shieldValue: 0,
  shieldRemaining: 0,
  isMoving: false
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
  sunspotCooldownRemaining: 0,
  rotation: 0,
  rotationDirection: 1,
  coronaTickRemaining: 0,
  radiusPhaseRemaining: 1800,
  guardRemaining: 0
};

const crimsonFurnaceDefaults: CrimsonFurnaceState = {
  pressure: 0,
  pressureBuildRate: 1.4,
  pressureDecayRate: 0.6,
  pressureAppliedRadiusBonus: 0,
  pressureRadiusScale: 0.45,
  embedThreshold: 3,
  furnaceCascadeCooldownRemaining: 0,
  furnaceCascadeCasts: 0,
  networkIgnitionCooldownRemaining: 0
};

const legacyCrimsonMasteryIds: Record<string, string> = {
  "crimson-piercing-needles": "piercing-furnace-needle",
  "scattered-needles": "scattered-furnace-needles",
  "volatile-embeds": "volatile-furnace-core",
  "sustained-crucible": "sealed-leftover-needle",
  "resonant-crucible": "star-furnace-resonance",
  "overpressure-detonation": "compressed-furnace",
  "furnace-heart": "furnace-heart-reforge",
  "relentless-needles": "myriad-edges-return",
  "crucible-nova": "falling-star-forge"
};

const legacyYujianMasteryIds: Record<string, string> = {
  "still-sword-heart": "still-sword-edge",
  "myriad-blade-resonance": "linked-sword-catch",
  "intent-unleashed": "four-symbols-together",
  "sword-crown": "heavenly-sword-crown",
  "intent-domain": "three-enclosure-sword-domain",
  "void-step-formation": "void-step-recall"
};

const legacyJinfengMasteryIds: Record<string, string> = {
  "heaven-splitting-line": "heaven-splitting-long-edge",
  "golden-gale-fan": "golden-gale-crosscut",
  "unbroken-current": "unbroken-continuance",
  "ten-thousand-wave-resonance": "borrowed-turn-edge",
  "gale-detonation": "gale-rupture",
  "endless-horizon": "one-line-to-horizon",
  "walking-storm": "returning-dragon-edge",
  "gale-step-severance": "formation-breaking-gale-step"
};

const legacyGreenVineMasteryIds: Record<string, string> = {
  "thorned-vines": "heart-piercing-thorn-cable",
  "vine-spread": "twin-serpent-bind",
  "swift-vines": "flying-vine-graft",
  "lasting-growth": "hundred-forged-soft-vine",
  "growth-cascade": "mountain-rending-iron-cable",
  "growth-burst": "step-borrowed-pull",
  "growth-crown": "dragon-binding-knot",
  "growth-domain": "dense-heaven-net-knot",
  "growth-step": "broken-vine-branching"
};

function migrateLegacyMasteryId(gongfaId: GongfaId, id: string): string {
  if (gongfaId === "crimson-furnace-sword-art") return legacyCrimsonMasteryIds[id] ?? id;
  if (gongfaId === "yujian-jue") return legacyYujianMasteryIds[id] ?? id;
  if (gongfaId === "jinfeng-gong") return legacyJinfengMasteryIds[id] ?? id;
  if (gongfaId === "green-vine-art") return legacyGreenVineMasteryIds[id] ?? id;
  return id;
}

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

  runtime.combat.retaliationDamage -= state.guardAppliedRetaliationBonus;
  runtime.combat.auraRadius -= state.guardAppliedAuraBonus;
  runtime.combat.damage -= state.guardAppliedDamageBonus;
  state.guardAppliedRetaliationBonus = 0;
  state.guardAppliedAuraBonus = 0;
  state.guardAppliedDamageBonus = 0;
  state.guardMitigation = gengjinMitigation(state, runtime.mastery.masteryLearnedIds);
}

const GENGJIN_CLOSE_RANGE = 190;
const GENGJIN_RELEASE_THRESHOLD = 60;

function gengjinCapacity(state: GengjinState, learnedIds: string[]): number {
  if (learnedIds.includes("flowing-gold-vent")) return 72;
  let capacity = learnedIds.includes("hundred-forged-heavy-armor") ? 150 : 100;
  if (learnedIds.includes("immovable-mountain") && !state.isMoving) capacity += 50;
  return capacity;
}

function gengjinMitigation(
  state: GengjinState,
  learnedIds: string[],
  sourceId?: number,
  includePostEvadeLayer = true
): number {
  if (state.mitigationDisabledRemaining > 0) return 0;
  let mitigation = learnedIds.includes("hundred-forged-heavy-armor") ? 0.42 : 0.3;
  if (learnedIds.includes("immovable-mountain") && !state.isMoving) mitigation += 0.12;
  if (learnedIds.includes("armor-remembers-enemy") && sourceId !== undefined &&
      state.rememberedSourceId === sourceId) {
    mitigation += Math.min(0.15, state.rememberedHits * 0.03);
  }
  if (includePostEvadeLayer && state.postEvadeLayerRemaining > 0 && state.postEvadeGuard > 0) mitigation += 0.18;
  return Math.min(0.68, mitigation + state.guardMitigationBonus);
}

function gengjinBraceCommand(runtime: GongfaRuntime): Extract<GongfaRuntimeCommand, { kind: "authored-gengjin-brace" }> {
  const state = runtime.gengjin!;
  return {
    kind: "authored-gengjin-brace",
    guard: state.guardValue,
    capacity: state.guardCapacity,
    fractures: state.fractureCount,
    disabled: state.mitigationDisabledRemaining > 0,
    shield: state.shieldValue,
    sourceGongfaId: runtime.gongfaId
  };
}

function buildGengjinRelease(
  runtime: GongfaRuntime,
  targets: AuthoredTargetFact[],
  learnedIds: string[],
  playerX: number,
  playerY: number
): Extract<GongfaRuntimeCommand, { kind: "authored-gengjin-release" }> | undefined {
  const state = runtime.gengjin;
  if (!state || state.guardValue < GENGJIN_RELEASE_THRESHOLD) return undefined;
  const nearby = targets
    .map((target) => ({
      ...target,
      distance: Math.hypot(target.x - playerX, target.y - playerY)
    }))
    .filter((target) => target.distance <= GENGJIN_CLOSE_RANGE)
    .sort((a, b) => a.distance - b.distance || b.healthRatio - a.healthRatio);
  if (nearby.length === 0) return undefined;

  const conservedTotal = Math.floor(state.guardValue);
  let law: "shared" | "single" | "shield" = "shared";
  let allocations: Array<{ targetId: number; amount: number }> = [];
  let shield = 0;
  if (learnedIds.includes("unbroken-golden-city")) {
    law = "shield";
    shield = conservedTotal;
  } else if (learnedIds.includes("one-edge-breaks-mountain")) {
    law = "single";
    allocations = [{ targetId: nearby[0].targetId, amount: conservedTotal }];
  } else {
    const recipients = learnedIds.includes("eight-wastes-rebound") ? nearby.slice(0, 8) : nearby.slice(0, 4);
    const base = Math.floor(conservedTotal / recipients.length);
    let remainder = conservedTotal - base * recipients.length;
    allocations = recipients.map((target) => ({
      targetId: target.targetId,
      amount: base + (remainder-- > 0 ? 1 : 0)
    }));
  }
  state.guardValue = 0;
  state.bladeShellCharge = 0;
  state.bladeShellCasts += 1;
  state.bladeShellCooldownRemaining = 1800;
  state.fractureCount = 0;
  state.fractureRecoveryRemaining = 0;
  state.mitigationDisabledRemaining = 0;
  if (shield > 0) {
    state.shieldValue = shield;
    state.shieldRemaining = 5000;
  }
  return {
    kind: "authored-gengjin-release",
    law,
    conservedTotal,
    allocations,
    shield,
    sourceGongfaId: runtime.gongfaId,
    masteryCast: {
      skill2Id: "blade-shell-rebound",
      cooldownMs: Math.floor(authoredSkill2Plans["blade-shell-rebound"].cooldownMs * skill2RefinementStats(runtime).cadenceScale)
    }
  };
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

  // Pressure describes the current living graph. It must never become a
  // permanent/global explosion-radius stat, including for restored old saves.
  runtime.combat.range = Math.max(
    gongfaConfigs["crimson-furnace-sword-art"].stages.lianqi!.range,
    runtime.combat.range - state.pressureAppliedRadiusBonus
  );
  state.pressureAppliedRadiusBonus = 0;
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
      masteryLearnedIds: (input.mastery?.masteryLearnedIds ?? []).map((id) => migrateLegacyMasteryId(input.gongfaId, id)),
      upgradeSelectionIds: (input.mastery?.upgradeSelectionIds ?? []).map((id) => migrateLegacyMasteryId(input.gongfaId, id)),
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
    // Legacy Momentum fields remain accepted by the checkpoint codec, but the
    // rebuilt movement-cut discipline lives entirely in authored state.
    jinfeng: undefined,
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
    // Legacy Ember fields are accepted by the codec but are no longer live.
    // Blazing Feather now uses the authored finite-quiver state below.
    blazingFeather: undefined,
    surge: surgeGongfaIdSet.has(input.gongfaId) &&
      !["blazing-feather-art", "drifting-frost-needle", "green-vine-art", "verdant-ring-scripture", "ice-mirror-guard", "ironwood-wave-form", "flame-demon-body-art", "mist-wraith-canon", "frozen-river-formation", "sword-burial-formation", "thousand-root-formation"].includes(input.gongfaId)
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
            bladeShellCasts: checkpoint.bladeShellCasts,
            guardCapacity: checkpoint.guardCapacity,
            fractureCount: checkpoint.guardFractureCount,
            fractureRecoveryRemaining: checkpoint.guardFractureRecoveryRemaining,
            mitigationDisabledRemaining: checkpoint.guardMitigationDisabledRemaining,
            postEvadeLayerRemaining: checkpoint.guardPostEvadeLayerRemaining,
            postEvadeGuard: checkpoint.guardPostEvadeGuard,
            rememberedSourceId: checkpoint.guardRememberedSourceId,
            rememberedHits: checkpoint.guardRememberedHits,
            shieldValue: checkpoint.guardShieldValue,
            shieldRemaining: checkpoint.guardShieldRemaining
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
    bladeShellCasts: gengjin?.bladeShellCasts ?? 0,
    guardCapacity: gengjin?.guardCapacity ?? 100,
    guardFractureCount: gengjin?.fractureCount ?? 0,
    guardFractureRecoveryRemaining: gengjin?.fractureRecoveryRemaining ?? 0,
    guardMitigationDisabledRemaining: gengjin?.mitigationDisabledRemaining ?? 0,
    guardPostEvadeLayerRemaining: gengjin?.postEvadeLayerRemaining ?? 0,
    guardPostEvadeGuard: gengjin?.postEvadeGuard ?? 0,
    guardRememberedSourceId: gengjin?.rememberedSourceId ?? 0,
    guardRememberedHits: gengjin?.rememberedHits ?? 0,
    guardShieldValue: gengjin?.shieldValue ?? 0,
    guardShieldRemaining: gengjin?.shieldRemaining ?? 0
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
  const gengjin = runtime?.gengjin;
  const burningRing = runtime?.burningRing;
  const crimsonFurnace = runtime?.crimsonFurnace;
  const yujian = runtime?.yujian;

  return {
    galeMomentum: runtime?.gongfaId === "jinfeng-gong" ? runtime.authored.resource : 0,
    heat: burningRing?.heat ?? 0,
    ringSegments: burningRing?.ringSegments ?? 0,
    counterflowRingSegments: burningRing?.counterflowRingSegments ?? 0,
    solarFlareCasts: burningRing?.solarFlareCasts ?? 0,
    pressure: crimsonFurnace?.pressure ?? 0,
    furnaceCascadeCasts: crimsonFurnace?.furnaceCascadeCasts ?? 0,
    crimsonPressureRadiusScale: crimsonFurnace?.pressureRadiusScale ?? 0.45,
    guard: gengjin?.guardValue ?? 0,
    guardCapacity: gengjin?.guardCapacity ?? 100,
    guardFractures: gengjin?.fractureCount ?? 0,
    guardDisabled: (gengjin?.mitigationDisabledRemaining ?? 0) > 0,
    guardShield: gengjin?.shieldValue ?? 0,
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

  if (runtime.gongfaId === "ice-mirror-guard") {
    return 190;
  }

  if (runtime.gongfaId === "ancient-tree-body-art") {
    return 640;
  }

  if (runtime.mastery.masterySkill2Id) {
    return 640;
  }

  return 0;
}

type IceMirrorFacet = GongfaRuntime["authored"]["anchors"][number];

function iceMirrorForm(learnedIds: string[]): {
  count: number; durability: number; arcWidth: number; rotationSpeed: number; reflectionScale: number;
} {
  if (learnedIds.includes("three-enclosure-heavy-mirrors")) {
    return { count: 3, durability: 2, arcWidth: Math.PI * 0.29, rotationSpeed: 0.42, reflectionScale: 1.55 };
  }
  if (learnedIds.includes("thousand-facet-lotus")) {
    return { count: 8, durability: 1, arcWidth: Math.PI * 0.12, rotationSpeed: 0.28, reflectionScale: 0.55 };
  }
  if (learnedIds.includes("flowing-light-mirrors")) {
    return { count: 6, durability: 1, arcWidth: Math.PI * 0.19, rotationSpeed: 2.35, reflectionScale: 0.68 };
  }
  return { count: 6, durability: 1, arcWidth: Math.PI * 0.18, rotationSpeed: 0.82, reflectionScale: 1 };
}

function ensureIceMirrorFacets(runtime: GongfaRuntime, learnedIds: string[]): IceMirrorFacet[] {
  const form = iceMirrorForm(learnedIds);
  let facets = runtime.authored.anchors.filter((anchor) => anchor.kind === "facet");
  if (facets.length !== form.count || facets.some((facet) => facet.maxValue !== form.durability)) {
    runtime.authored.anchors = runtime.authored.anchors.filter((anchor) => anchor.kind !== "facet");
    facets = Array.from({ length: form.count }, (_, index) => ({
      kind: "facet" as const,
      x: 0,
      y: 0,
      angle: index * Math.PI * 2 / form.count,
      value: form.durability,
      maxValue: form.durability,
      chainId: index,
      sealed: false
    }));
    runtime.authored.anchors.push(...facets);
  }
  runtime.authored.maxCharges = form.count;
  runtime.authored.charges = facets.filter((facet) => facet.value > 0).length;
  runtime.authored.resource = runtime.authored.charges / Math.max(1, form.count);
  runtime.authored.secondaryResource = facets.filter((facet) => facet.sealed).length;
  return facets;
}

function mirrorFacetCommand(
  runtime: GongfaRuntime,
  learnedIds: string[],
  masteryCast?: MasterySkill2Cast
): Extract<GongfaRuntimeCommand, { kind: "authored-mirror-facets" }> {
  const form = iceMirrorForm(learnedIds);
  const rotation = runtime.authored.targetLedger[-110] ?? 0;
  const facets = ensureIceMirrorFacets(runtime, learnedIds);
  return {
    kind: "authored-mirror-facets",
    facets: facets.map((facet) => ({
      angle: (facet.angle ?? 0) + rotation,
      durability: facet.value,
      maxDurability: facet.maxValue ?? 1,
      lingering: facet.sealed === true
    })),
    radius: runtime.authored.phase === 2 ? 70 : 92,
    arcWidth: runtime.authored.phase === 2 ? Math.PI * 2 / form.count * 0.96 : form.arcWidth,
    shell: runtime.authored.phase === 2,
    sourceGongfaId: runtime.gongfaId,
    ...(masteryCast ? { masteryCast } : {})
  };
}

function angularDistance(a: number, b: number): number {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

function distanceSquared(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function normalizedAngleDifference(a: number, b: number): number {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

function distanceToInfiniteLine(
  point: { x: number; y: number },
  from: { x: number; y: number },
  to: { x: number; y: number }
): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length < 0.001) return Math.hypot(point.x - from.x, point.y - from.y);
  return Math.abs(dy * point.x - dx * point.y + to.x * from.y - to.y * from.x) / length;
}

function distanceToSegment(
  point: { x: number; y: number },
  from: { x: number; y: number },
  to: { x: number; y: number }
): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 0.001) return Math.hypot(point.x - from.x, point.y - from.y);
  const t = Math.max(0, Math.min(1,
    ((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared
  ));
  return Math.hypot(point.x - (from.x + dx * t), point.y - (from.y + dy * t));
}

function movementCrossesLine(
  from: { x: number; y: number },
  to: { x: number; y: number },
  lineFrom: { x: number; y: number },
  lineTo: { x: number; y: number },
  tolerance = 14
): boolean {
  if (distanceSquared(from.x, from.y, to.x, to.y) < 4) return false;
  const side = (point: { x: number; y: number }): number =>
    (lineTo.x - lineFrom.x) * (point.y - lineFrom.y) -
    (lineTo.y - lineFrom.y) * (point.x - lineFrom.x);
  const before = side(from);
  const after = side(to);
  if (before !== 0 && after !== 0 && Math.sign(before) === Math.sign(after)) return false;
  const dx = lineTo.x - lineFrom.x;
  const dy = lineTo.y - lineFrom.y;
  const lengthSq = Math.max(1, dx * dx + dy * dy);
  const projection = ((to.x - lineFrom.x) * dx + (to.y - lineFrom.y) * dy) / lengthSq;
  return projection >= -tolerance / Math.sqrt(lengthSq) && projection <= 1 + tolerance / Math.sqrt(lengthSq);
}

function cardinalFlowAngle(direction: number): number {
  return [0, Math.PI / 2, Math.PI, -Math.PI / 2][direction] ?? 0;
}

function ironwoodWallForm(learnedIds: string[]): {
  length: number; durability: number; buildMs: number; stabilityCap: number;
  driveSpeed: number; driveDamage: number; push: number;
} {
  let length = 150; let durability = 120; let buildMs = 650; let stabilityCap = 100;
  let driveSpeed = 250; let driveDamage = 1; let push = 260;
  if (learnedIds.includes("lone-great-rampart")) { length *= 0.58; durability *= 1.7; driveDamage *= 1.65; }
  if (learnedIds.includes("linked-timber-palisade")) { length *= 1.75; durability *= 0.62; driveSpeed *= 0.68; driveDamage *= 0.65; }
  if (learnedIds.includes("living-root-curved-wall")) { length *= 0.8; buildMs *= 1.75; }
  if (learnedIds.includes("deep-age-root")) { durability *= 1.55; buildMs *= 1.7; stabilityCap = 145; driveSpeed *= 0.72; }
  if (learnedIds.includes("living-root-relocation")) stabilityCap = 65;
  if (learnedIds.includes("unbroken-iron-city")) { length *= 1.25; durability *= 1.55; driveDamage *= 0.55; push *= 0.72; }
  if (learnedIds.includes("mountain-collapse-timber-array")) { durability *= 0.58; driveSpeed *= 1.4; driveDamage *= 1.75; push *= 1.35; }
  if (learnedIds.includes("walking-city")) { driveSpeed *= 0.82; push *= 0.65; }
  return { length, durability, buildMs, stabilityCap, driveSpeed, driveDamage, push };
}

function densestThreatAngle(targets: AuthoredTargetFact[], playerX: number, playerY: number): number {
  const chosen = [...targets].sort((a, b) => {
    const density = (target: AuthoredTargetFact) => targets.filter((other) =>
      distanceSquared(target.x, target.y, other.x, other.y) <= 130 ** 2
    ).length;
    return density(b) - density(a) || distanceSquared(a.x, a.y, playerX, playerY) - distanceSquared(b.x, b.y, playerX, playerY);
  })[0];
  return chosen ? Math.atan2(chosen.y - playerY, chosen.x - playerX) : 0;
}

function targetPressesWall(target: AuthoredTargetFact, wall: AuthoredGongfaRuntimeState["anchors"][number], length: number): boolean {
  const angle = wall.angle ?? 0;
  const dx = target.x - wall.x; const dy = target.y - wall.y;
  const forward = dx * Math.cos(angle) + dy * Math.sin(angle);
  const sideways = -dx * Math.sin(angle) + dy * Math.cos(angle);
  return Math.abs(forward) <= 28 && Math.abs(sideways) <= length / 2;
}

function ironwoodWallCommand(
  runtime: GongfaRuntime,
  learnedIds: string[],
  deltaMs: number,
  masteryCast?: MasterySkill2Cast
): Extract<GongfaRuntimeCommand, { kind: "authored-ironwood-walls" }> {
  const form = ironwoodWallForm(learnedIds);
  const citadel = runtime.authored.phase >= 2;
  const skill2Stats = skill2RefinementStats(runtime);
  return {
    kind: "authored-ironwood-walls",
    walls: runtime.authored.anchors.filter((anchor) => anchor.kind === "wall").map((wall) => ({
      x: wall.x, y: wall.y, angle: wall.angle ?? 0,
      length: citadel ? form.length * 0.72 * (1 + skill2Stats.coverage * 0.12) : form.length,
      thickness: 28,
      durability: wall.value,
      maxDurability: wall.maxValue ?? form.durability,
      mode: runtime.authored.phase === 3 ? "citadel-drive" : citadel && !wall.participating ? "citadel" : wall.participating ? "driving" : "rooted"
    })),
    damage: Math.max(1, Math.floor(runtime.combat.damage * form.driveDamage * (citadel ? skill2Stats.damageScale : 1))),
    pushStrength: form.push + (citadel ? skill2Stats.coverage * 18 : 0),
    deltaMs,
    sourceGongfaId: runtime.gongfaId,
    ...(masteryCast ? { masteryCast } : {})
  };
}

function advanceIronwoodRampart(
  runtime: GongfaRuntime,
  event: Extract<GongfaRuntimeEvent, { kind: "tick" }>,
  learnedIds: string[],
  commands: GongfaRuntimeCommand[]
): void {
  const state = runtime.authored;
  const form = ironwoodWallForm(learnedIds);
  const playerX = event.playerX ?? 0; const playerY = event.playerY ?? 0;
  const targets = event.targets ?? [];
  const deltaSeconds = Math.max(0, event.deltaMs) / 1000;
  const refinementDurability = form.durability + (runtime.skill1Refinements?.countBonus ?? 0) * 20;
  let walls = state.anchors.filter((anchor) => anchor.kind === "wall");

  for (const wall of walls) {
    const pressing = targets.filter((target) => targetPressesWall(target, wall, state.phase >= 2 ? form.length * 0.72 : form.length));
    const pressureScale = Math.pow(0.84, masteryEffectTiers(learnedIds, "surgeStability"));
    const pressure = pressing.reduce((sum, target) => sum + (target.rank === "boss" ? 36 : target.rank === "elite" ? 20 : 9), 0) * pressureScale;
    wall.value = Math.max(0, wall.value - pressure * deltaSeconds);
    if (learnedIds.includes("enemy-pressed-forest") && !wall.participating) {
      for (const target of pressing) {
        if ((state.targetLedger[target.targetId] ?? 0) === 0) {
          state.targetLedger[target.targetId] = 1;
          state.resource = Math.min(form.stabilityCap, state.resource + 14);
        }
      }
    }
  }
  state.anchors = state.anchors.filter((anchor) => anchor.kind !== "wall" || anchor.value > 0);
  walls = state.anchors.filter((anchor) => anchor.kind === "wall");

  if (state.cycleCount >= 3 && state.phase === 0 && walls.length === 0 &&
      runtime.mastery.masterySkill2Id === "ironwood-surge-form" && runtime.mastery.masterySkill2CooldownRemaining === 0) {
    const skill2Stats = skill2RefinementStats(runtime);
    const durability = refinementDurability * 0.82 * skill2Stats.damageScale;
    state.anchors = [0, 1, 2, 3].map((index) => {
      const angle = index * Math.PI / 2;
      return { kind: "wall" as const, x: playerX + Math.cos(angle) * 72, y: playerY + Math.sin(angle) * 72,
        angle, value: durability, maxValue: durability, remainingMs: 3200 + skill2Stats.coverage * 250 };
    });
    state.phase = 2; state.phaseElapsedMs = 0; state.cycleCount = 0;
    commands.push(ironwoodWallCommand(runtime, learnedIds, event.deltaMs, {
      skill2Id: "ironwood-surge-form",
      cooldownMs: Math.floor(authoredSkill2Plans["ironwood-surge-form"].cooldownMs * skill2Stats.cadenceScale)
    }));
    return;
  }

  if (state.phase === 2) {
    state.phaseElapsedMs += event.deltaMs;
    const citadelHoldMs = 3200 + skill2RefinementStats(runtime).coverage * 250;
    if (state.phaseElapsedMs >= citadelHoldMs) {
      walls.forEach((wall) => { wall.participating = true; wall.remainingMs = 1150; });
      state.phase = 3; state.phaseElapsedMs = 0;
    }
  } else if (state.phase === 3) {
    for (const wall of walls) {
      wall.remainingMs = Math.max(0, (wall.remainingMs ?? 0) - event.deltaMs);
      wall.x += Math.cos(wall.angle ?? 0) * form.driveSpeed * deltaSeconds;
      wall.y += Math.sin(wall.angle ?? 0) * form.driveSpeed * deltaSeconds;
    }
    state.anchors = state.anchors.filter((anchor) => anchor.kind !== "wall" || (anchor.remainingMs ?? 0) > 0);
    if (!state.anchors.some((anchor) => anchor.kind === "wall")) {
      state.phase = 0;
      state.phaseElapsedMs = 0;
      state.resource = 0;
      state.charges = 0;
      for (const key of Object.keys(state.targetLedger).map(Number).filter((key) => key > 0)) {
        delete state.targetLedger[key];
      }
    }
  } else if (walls.some((wall) => wall.participating)) {
    for (const wall of walls) {
      wall.remainingMs = Math.max(0, (wall.remainingMs ?? 0) - event.deltaMs);
      if (learnedIds.includes("walking-city") && event.movementAngle !== undefined) wall.angle = event.movementAngle;
      wall.x += Math.cos(wall.angle ?? 0) * form.driveSpeed * deltaSeconds;
      wall.y += Math.sin(wall.angle ?? 0) * form.driveSpeed * deltaSeconds;
    }
    state.anchors = state.anchors.filter((anchor) => anchor.kind !== "wall" || (anchor.remainingMs ?? 0) > 0);
  } else if (walls.length === 0) {
    if (!event.isMoving && targets.length > 0) {
      state.phaseElapsedMs += event.deltaMs;
      if (state.phaseElapsedMs >= form.buildMs) {
        const angle = densestThreatAngle(targets, playerX, playerY);
        const count = learnedIds.includes("living-root-curved-wall") ? 3 : 1;
        for (let index = 0; index < count; index += 1) {
          const segmentAngle = angle + (index - (count - 1) / 2) * 0.48;
          state.anchors.push({ kind: "wall", x: playerX + Math.cos(segmentAngle) * 72, y: playerY + Math.sin(segmentAngle) * 72,
            angle: segmentAngle, value: refinementDurability, maxValue: refinementDurability });
        }
        state.phaseElapsedMs = 0; state.resource = 0;
        for (const key of Object.keys(state.targetLedger).map(Number).filter((key) => key > 0)) delete state.targetLedger[key];
      }
    } else state.phaseElapsedMs = 0;
  } else if (!event.isMoving) {
    if (!learnedIds.includes("enemy-pressed-forest")) {
      const gainScale = learnedIds.includes("walking-city") ? 0.72 : 1;
      state.resource = Math.min(form.stabilityCap, state.resource + 18 * gainScale *
        (1 + masteryEffectTiers(learnedIds, "surgeBuild") * 0.18) * deltaSeconds);
    }
  } else if (learnedIds.includes("living-root-relocation") && state.continuousDistance < 34) {
    const distance = Math.max(0, event.movementDistance ?? 0) * 0.45;
    const angle = event.movementAngle ?? 0;
    walls.forEach((wall) => { wall.x += Math.cos(angle) * distance; wall.y += Math.sin(angle) * distance; });
    state.resource = Math.max(0, state.resource - 16 * deltaSeconds);
  } else {
    const stability = state.resource;
    if (stability >= 35) {
      const baseAngle = walls[0]?.angle ?? 0;
      walls.forEach((wall, index) => {
        wall.participating = true;
        wall.remainingMs = learnedIds.includes("unbroken-iron-city") ? 1500 : learnedIds.includes("walking-city") ? 1450 : 1050;
        if (learnedIds.includes("living-root-curved-wall")) wall.angle = baseAngle + (index - (walls.length - 1) / 2) * 0.75;
      });
      if (stability >= 70) state.cycleCount += 1;
    } else state.anchors = state.anchors.filter((anchor) => anchor.kind !== "wall");
    state.resource = 0; state.phaseElapsedMs = 0;
  }

  state.maxCharges = form.stabilityCap;
  state.charges = Math.floor(state.resource);
  commands.push(ironwoodWallCommand(runtime, learnedIds, event.deltaMs));
}

type CrimsonNetworkNode = {
  targetId: number;
  x: number;
  y: number;
  nodeCount: number;
  power: number;
  ground: boolean;
};

type CrimsonNetworkLink = { fromTargetId: number; toTargetId: number };

function crimsonNetworkForm(learnedIds: string[]): {
  linkRange: number;
  linksPerNode: number;
  ignitionNodes: number;
  ignitionPressure: number;
  damageScale: number;
  propagationDelayMs: number;
} {
  let linkRange = 210;
  let linksPerNode = 1;
  let ignitionNodes = 4;
  let ignitionPressure = 42;
  let damageScale = 1;
  let propagationDelayMs = 115;
  if (learnedIds.includes("piercing-furnace-needle")) {
    linkRange = 155; ignitionNodes = 3; ignitionPressure = 32; damageScale = 1.45;
  }
  if (learnedIds.includes("scattered-furnace-needles")) {
    linkRange = 285; ignitionNodes = 6; ignitionPressure = 58; damageScale = 0.72;
  }
  if (learnedIds.includes("volatile-furnace-core")) {
    ignitionNodes = 3; ignitionPressure = 28; damageScale = 0.68; linksPerNode = 1;
  }
  if (learnedIds.includes("star-furnace-resonance")) {
    linksPerNode = 2; damageScale *= 0.72;
  }
  if (learnedIds.includes("compressed-furnace")) {
    linkRange = 128; ignitionPressure += 8; damageScale *= 1.65; propagationDelayMs = 70;
  }
  return { linkRange, linksPerNode, ignitionNodes, ignitionPressure, damageScale, propagationDelayMs };
}

function crimsonNodeCapacity(rank: AuthoredTargetFact["rank"], learnedIds: string[]): number {
  const base = rank === "boss" ? 5 : rank === "elite" ? 3 : 1;
  if (!learnedIds.includes("piercing-furnace-needle")) return base;
  return rank === "boss" ? 7 : rank === "elite" ? 5 : 1;
}

function buildCrimsonTopology(
  runtime: GongfaRuntime,
  targets: AuthoredTargetFact[],
  learnedIds: string[]
): { nodes: CrimsonNetworkNode[]; links: CrimsonNetworkLink[]; pressure: number; coreTargetId?: number; coreTargetIds: number[] } {
  const form = crimsonNetworkForm(learnedIds);
  const linkRange = form.linkRange * (1 + Math.max(0, (runtime.crimsonFurnace?.pressureRadiusScale ?? 0.45) - 0.45) * 0.25);
  const living = targets.flatMap((target) => {
    const nodeCount = Math.min(
      crimsonNodeCapacity(target.rank, learnedIds),
      Math.max(0, target.embedStacks ?? 0)
    );
    return nodeCount > 0 ? [{
      targetId: target.targetId,
      x: target.x,
      y: target.y,
      nodeCount,
      power: Math.max(nodeCount, target.embedPower ?? nodeCount),
      ground: false
    }] : [];
  });
  const ground = runtime.authored.anchors
    .filter((anchor) => anchor.kind === "furnace-node" && (anchor.remainingMs ?? 1) > 0)
    .map((anchor) => ({
      targetId: anchor.targetId ?? -1,
      x: anchor.x,
      y: anchor.y,
      nodeCount: Math.max(1, Math.floor(anchor.value)),
      power: Math.max(1, anchor.maxValue ?? anchor.value),
      ground: true
    }));
  const nodes = [...living, ...ground];
  const linkKeys = new Set<string>();
  const links: CrimsonNetworkLink[] = [];
  for (const node of nodes) {
    const nearest = nodes
      .filter((other) => other.targetId !== node.targetId)
      .map((other) => ({ other, distance: Math.sqrt(distanceSquared(node.x, node.y, other.x, other.y)) }))
      .filter(({ distance }) => distance <= linkRange)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, form.linksPerNode);
    for (const { other } of nearest) {
      const low = Math.min(node.targetId, other.targetId);
      const high = Math.max(node.targetId, other.targetId);
      const key = `${low}:${high}`;
      if (linkKeys.has(key)) continue;
      linkKeys.add(key);
      links.push({ fromTargetId: low, toTargetId: high });
    }
  }
  const degrees = new Map<number, number>();
  links.forEach((link) => {
    degrees.set(link.fromTargetId, (degrees.get(link.fromTargetId) ?? 0) + 1);
    degrees.set(link.toTargetId, (degrees.get(link.toTargetId) ?? 0) + 1);
  });
  const connectedIds = new Set(links.flatMap((link) => [link.fromTargetId, link.toTargetId]));
  const connectedNodes = nodes.filter((node) => connectedIds.has(node.targetId));
  const branches = [...degrees.values()].filter((degree) => degree >= 3).length;
  const adjacency = new Map<number, number[]>();
  links.forEach((link) => {
    adjacency.set(link.fromTargetId, [...(adjacency.get(link.fromTargetId) ?? []), link.toTargetId]);
    adjacency.set(link.toTargetId, [...(adjacency.get(link.toTargetId) ?? []), link.fromTargetId]);
  });
  const unseen = new Set(connectedIds);
  const componentTargetIds: number[][] = [];
  while (unseen.size > 0) {
    const start = unseen.values().next().value as number;
    const component: number[] = [];
    const queue = [start];
    unseen.delete(start);
    while (queue.length > 0) {
      const targetId = queue.shift()!;
      component.push(targetId);
      for (const neighbor of adjacency.get(targetId) ?? []) {
        if (!unseen.delete(neighbor)) continue;
        queue.push(neighbor);
      }
    }
    componentTargetIds.push(component);
  }
  const components = componentTargetIds.length;
  const loops = Math.max(0, links.length - connectedNodes.length + components);
  const rawPressure = connectedNodes.reduce((sum, node) => sum + node.nodeCount * 7, 0) +
    links.length * 6 + branches * 8 + loops * 12;
  const pressure = Math.min(100, rawPressure * ((runtime.crimsonFurnace?.pressureBuildRate ?? 1.4) / 1.4));
  const coreTargetIds = componentTargetIds.flatMap((component) => {
    const core = connectedNodes.filter((node) => component.includes(node.targetId)).sort((a, b) =>
      (degrees.get(b.targetId) ?? 0) - (degrees.get(a.targetId) ?? 0) || b.nodeCount - a.nodeCount || b.power - a.power
    )[0];
    return core ? [core.targetId] : [];
  });
  const core = [...connectedNodes].sort((a, b) =>
    (degrees.get(b.targetId) ?? 0) - (degrees.get(a.targetId) ?? 0) || b.nodeCount - a.nodeCount || b.power - a.power
  )[0];
  return { nodes, links, pressure, coreTargetId: core?.targetId, coreTargetIds };
}

function connectedCrimsonTargetIds(
  topology: ReturnType<typeof buildCrimsonTopology>,
  startTargetId: number
): number[] {
  const found = new Set<number>([startTargetId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const link of topology.links) {
      if (found.has(link.fromTargetId) && !found.has(link.toTargetId)) { found.add(link.toTargetId); changed = true; }
      if (found.has(link.toTargetId) && !found.has(link.fromTargetId)) { found.add(link.fromTargetId); changed = true; }
    }
  }
  return [...found];
}

function crimsonFragmentLaw(learnedIds: string[]): "reforge" | "return" | "falling-star" {
  if (learnedIds.includes("myriad-edges-return")) return "return";
  if (learnedIds.includes("falling-star-forge")) return "falling-star";
  return "reforge";
}

function advanceCrimsonNetwork(
  runtime: GongfaRuntime,
  event: Extract<GongfaRuntimeEvent, { kind: "tick" }>,
  learnedIds: string[],
  commands: GongfaRuntimeCommand[]
): void {
  const state = runtime.crimsonFurnace;
  if (!state) return;
  state.networkIgnitionCooldownRemaining = Math.max(0, state.networkIgnitionCooldownRemaining - event.deltaMs);
  if (runtime.authored.phase === 1) {
    runtime.authored.targetLedger[-300] = Math.max(0, (runtime.authored.targetLedger[-300] ?? 5000) - event.deltaMs);
    if (runtime.authored.targetLedger[-300] === 0) runtime.authored.phase = 0;
  }
  runtime.authored.anchors.forEach((anchor) => {
    if (anchor.kind === "furnace-node") anchor.remainingMs = Math.max(0, (anchor.remainingMs ?? 0) - event.deltaMs);
  });
  runtime.authored.anchors = runtime.authored.anchors.filter((anchor) =>
    anchor.kind !== "furnace-node" || (anchor.remainingMs ?? 0) > 0
  );
  const topology = buildCrimsonTopology(runtime, event.targets ?? [], learnedIds);
  state.pressure = topology.pressure;
  runtime.authored.resource = topology.pressure;
  runtime.authored.charges = topology.nodes.reduce((sum, node) => sum + node.nodeCount, 0);
  runtime.authored.secondaryResource = topology.links.length;
  runtime.authored.maxCharges = 100;
  const form = crimsonNetworkForm(learnedIds);
  const coreId = topology.coreTargetId;
  const componentIds = coreId === undefined ? [] : connectedCrimsonTargetIds(topology, coreId);
  const componentNodes = topology.nodes.filter((node) => componentIds.includes(node.targetId));
  const componentNodeCount = componentNodes.reduce((sum, node) => sum + node.nodeCount, 0);
  const allConnectedIds = new Set(topology.links.flatMap((link) => [link.fromTargetId, link.toTargetId]));
  const allConnectedNodeCount = topology.nodes
    .filter((node) => allConnectedIds.has(node.targetId))
    .reduce((sum, node) => sum + node.nodeCount, 0);
  const cascadeStats = skill2RefinementStats(runtime);
  const skill2Ready = runtime.mastery.masterySkill2Id === "furnace-cascade" &&
    runtime.mastery.masterySkill2CooldownRemaining === 0 &&
    topology.pressure >= Math.max(46, 58 - cascadeStats.coverage * 4) && allConnectedNodeCount >= 5;
  const refinementNodeDelta = (state.embedThreshold ?? 3) - 3;
  const ordinaryReady = componentNodeCount >= Math.max(3, form.ignitionNodes + refinementNodeDelta) &&
    topology.pressure >= form.ignitionPressure;
  const reservingForCascade = runtime.mastery.masterySkill2Id === "furnace-cascade" &&
    runtime.mastery.masterySkill2CooldownRemaining === 0;
  let ignition: Extract<GongfaRuntimeCommand, { kind: "authored-crimson-network" }>["ignition"];
  let masteryCast: MasterySkill2Cast | undefined;
  if (state.networkIgnitionCooldownRemaining === 0 &&
      (skill2Ready || (ordinaryReady && !reservingForCascade)) && coreId !== undefined) {
    const targetIds = skill2Ready
      ? topology.nodes.filter((node) => allConnectedIds.has(node.targetId)).map((node) => node.targetId)
      : componentIds;
    const consumed = topology.nodes.filter((node) => targetIds.includes(node.targetId));
    const consumedCount = consumed.reduce((sum, node) => sum + node.nodeCount, 0);
    const followUp = runtime.authored.phase === 1;
    const fragmentCount = followUp ? 0 : consumedCount;
    ignition = {
      targetIds,
      damage: Math.max(1, Math.floor(runtime.combat.damage * form.damageScale *
        (skill2Ready ? cascadeStats.damageScale : 1) * (1 + topology.pressure / 125))),
      propagationDelayMs: Math.max(45, Math.floor(form.propagationDelayMs * (skill2Ready ? cascadeStats.cadenceScale : 1))),
      fragmentLaw: crimsonFragmentLaw(learnedIds),
      fragmentCount,
      followUp
    };
    if (!followUp && ignition.fragmentLaw === "falling-star") {
      for (const [index, node] of consumed.slice(0, 6).entries()) {
        const angle = index * 2.399963;
        const targetId = -200_000 - runtime.authored.activationCount;
        runtime.authored.activationCount += 1;
        runtime.authored.anchors.push({
          kind: "furnace-node",
          x: node.x + Math.cos(angle) * 42,
          y: node.y + Math.sin(angle) * 42,
          value: 1,
          maxValue: Math.max(1, node.power * 0.45),
          remainingMs: 5200,
          targetId
        });
      }
    }
    if (skill2Ready) {
      masteryCast = {
        skill2Id: "furnace-cascade",
        cooldownMs: Math.floor(authoredSkill2Plans["furnace-cascade"].cooldownMs * cascadeStats.cadenceScale)
      };
      state.furnaceCascadeCasts += 1;
    }
    runtime.authored.anchors = runtime.authored.anchors.filter((anchor) =>
      anchor.kind !== "furnace-node" || !targetIds.includes(anchor.targetId ?? -1)
    );
    if (!followUp && fragmentCount > 0) {
      runtime.authored.phase = 1;
      runtime.authored.targetLedger[-300] = 5000;
    } else {
      runtime.authored.phase = 0;
      delete runtime.authored.targetLedger[-300];
    }
    state.networkIgnitionCooldownRemaining = Math.max(
      700,
      targetIds.length * ignition.propagationDelayMs + 300
    );
  }
  commands.push({
    kind: "authored-crimson-network",
    nodes: topology.nodes.map((node) => ({
      targetId: node.targetId, x: node.x, y: node.y, nodeCount: node.nodeCount,
      ground: node.ground, core: topology.coreTargetIds.includes(node.targetId)
    })),
    links: topology.links,
    pressure: topology.pressure,
    ...(ignition ? { ignition } : {}),
    sourceGongfaId: runtime.gongfaId,
    ...(masteryCast ? { masteryCast } : {})
  });
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
    if (runtime.gongfaId === "green-vine-art") {
      const deadEndpoint = state.anchors.find((anchor) =>
        anchor.kind === "vine-endpoint" && anchor.targetId === event.targetId
      );
      if (deadEndpoint) {
        const other = state.anchors.find((anchor) =>
          anchor.kind === "vine-endpoint" && anchor !== deadEndpoint
        );
        const grafts = state.targetLedger[-400] ?? 0;
        const replacement = learnedIds.includes("flying-vine-graft") && grafts < 2
          ? (event.targets ?? []).find((target) => target.targetId !== other?.targetId)
          : undefined;
        if (replacement) {
          deadEndpoint.targetId = replacement.targetId;
          deadEndpoint.x = replacement.x;
          deadEndpoint.y = replacement.y;
          state.resource *= 0.5;
          state.targetLedger[-400] = grafts + 1;
        } else {
          if (learnedIds.includes("broken-vine-branching")) {
            state.anchors.push(
              { kind: "verdant-knot", x: event.x - 24, y: event.y, value: 0.55, remainingMs: 3800 },
              { kind: "verdant-knot", x: event.x + 24, y: event.y, value: 0.55, remainingMs: 3800 }
            );
          }
          state.anchors = state.anchors.filter((anchor) => anchor.kind !== "vine-endpoint");
          state.resource = 0;
        }
      }
    }
    if (runtime.gongfaId === "blazing-feather-art") {
      const deadBrands = state.anchors.filter((anchor) =>
        anchor.kind === "phoenix-brand" && anchor.targetId === event.targetId
      );
      if (deadBrands.length > 0 && learnedIds.includes("ashen-pursuit")) {
        const branded = new Set(state.anchors
          .filter((anchor) => anchor.kind === "phoenix-brand" && anchor.targetId !== event.targetId)
          .map((anchor) => anchor.targetId));
        const recipient = [...(event.targets ?? [])]
          .filter((target) => !branded.has(target.targetId))
          .sort((a, b) =>
            distanceSquared(b.x, b.y, event.playerX, event.playerY) -
            distanceSquared(a.x, a.y, event.playerX, event.playerY)
          )[0];
        if (recipient) {
          deadBrands[0]!.targetId = recipient.targetId;
          deadBrands[0]!.x = recipient.x;
          deadBrands[0]!.y = recipient.y;
          deadBrands[0]!.remainingMs = 7000;
        }
      }
      state.anchors = state.anchors.filter((anchor) =>
        anchor.kind !== "phoenix-brand" || anchor.targetId !== event.targetId ||
        (learnedIds.includes("ashen-pursuit") && deadBrands[0]?.targetId !== event.targetId)
      );
    }

    if (runtime.gongfaId === "drifting-frost-needle") {
      const deadNodes = state.anchors.filter((anchor) =>
        anchor.kind === "weakpoint" && anchor.targetId === event.targetId
      );
      if (learnedIds.includes("reverse-star-trace")) {
        for (const node of deadNodes) {
          node.targetId = undefined;
          node.remainingMs = 1800 * Math.pow(1.16, masteryEffectTiers(learnedIds, "surgeStability"));
        }
      } else if (deadNodes.length > 0) {
        state.anchors = [];
        state.resource = 0;
        state.charges = 0;
      }
    }

    if (runtime.gongfaId === "crimson-furnace-sword-art" &&
        learnedIds.includes("sealed-leftover-needle") && (event.embedStacks ?? 0) > 0) {
      const targetId = -100_000 - state.activationCount;
      state.activationCount += 1;
      state.anchors.push({
        kind: "furnace-node",
        x: event.x,
        y: event.y,
        value: 1,
        maxValue: Math.max(1, (event.embedPower ?? 1) * 0.35),
        remainingMs: 4200,
        targetId
      });
      state.anchors = state.anchors.filter((anchor) => anchor.kind !== "furnace-node").concat(
        state.anchors.filter((anchor) => anchor.kind === "furnace-node").slice(-5)
      );
    }
    if (runtime.gongfaId === "mist-wraith-canon") {
      const value = event.rank === "boss" ? 3 : event.rank === "elite" ? 2 : 1;
      const remainingMs = (event.rank === "boss" ? 20_000 : event.rank === "elite" ? 12_000 : 6_000) *
        Math.pow(1.16, masteryEffectTiers(learnedIds, "surgeStability"));
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
      const occupiedDebtors = new Set(state.anchors
        .filter((anchor) => anchor.kind === "seal" && anchor.targetId !== undefined && anchor.targetId !== event.targetId)
        .map((anchor) => anchor.targetId));
      for (const origin of state.anchors.filter((anchor) =>
        anchor.kind === "seal" && anchor.sealRole !== "crossing" && anchor.targetId === event.targetId
      )) {
        const candidates = (event.targets ?? []).filter((target) => !occupiedDebtors.has(target.targetId));
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
        origin.remainingMs = state.phase === 3
          ? undefined
          : compensates ? Math.max(origin.remainingMs ?? 0, 6500) : Math.min(
              origin.remainingMs ?? 3000,
              3000 * Math.pow(1.16, masteryEffectTiers(learnedIds, "surgeStability"))
            );
        if (recipient && state.phase !== 3) state.cycleCount += 1;
        if (recipient && state.phase === 3 && compensates) state.phaseElapsedMs += 1200;
      }
      if (state.phase === 3 && !learnedIds.includes("compensating-ferry")) {
        state.anchors = state.anchors.filter((anchor) =>
          !(anchor.kind === "seal" && anchor.sealRole === "waiting")
        );
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
          successor = [...eligible].filter((target) =>
            target.rank === "elite" || target.rank === "boss" || target.healthRatio >= 0.75
          ).sort((a, b) =>
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
          : (learnedIds.includes("strong-seed-chooses-its-host") ? 4000 : 1600) *
            Math.pow(1.16, masteryEffectTiers(learnedIds, "surgeStability"));
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

  if (event.kind === "evade" && runtime.gongfaId === "blazing-feather-art") {
    const combatMolt = learnedIds.includes("combat-molt");
    if (state.charges === 0 || (combatMolt && state.charges < state.maxCharges)) {
      state.charges = state.maxCharges;
      state.phaseElapsedMs = 0;
      state.phase = 0;
      state.cycleCount = 0;
      state.resource = 1;
    }
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
        nearest.value *= 1.35 * Math.pow(1.16, masteryEffectTiers(learnedIds, "surgeStability"));
      }
    }
    return;
  }

  if (event.kind === "evade" && runtime.gongfaId === "verdant-ring-scripture") {
    state.targetLedger[-90] = learnedIds.includes("calamity-step-thorn-scripture") ? 1400 : 720;
    return;
  }

  if (event.kind === "evade" && runtime.gongfaId === "green-vine-art") {
    const endpoints = state.anchors.filter((anchor) => anchor.kind === "vine-endpoint");
    if (learnedIds.includes("step-borrowed-pull") && endpoints.length === 2 && state.targetLedger[-403] !== 1) {
      state.targetLedger[-403] = 1;
      state.resource = Math.min(1, state.resource + 0.45);
      const angle = (event.movementAngle ?? 0) + Math.PI / 2;
      const center = { x: event.playerX ?? 0, y: event.playerY ?? 0 };
      const from = { x: center.x - Math.cos(angle) * 110, y: center.y - Math.sin(angle) * 110 };
      const to = { x: center.x + Math.cos(angle) * 110, y: center.y + Math.sin(angle) * 110 };
      commands.push({
        kind: "authored-vine-contact", from, via: center, to,
        targetIds: (event.targets ?? []).filter((target) => distanceToSegment(target, from, to) <= 24)
          .map((target) => target.targetId),
        damage: Math.max(1, Math.floor(runtime.combat.damage * 0.9)), sourceGongfaId: runtime.gongfaId
      });
    }
    return;
  }

  if (event.kind === "evade" && runtime.gongfaId === "jinfeng-gong") {
    if (learnedIds.includes("formation-breaking-gale-step") && state.resource > 0) {
      const angle = event.movementAngle ?? state.lastMovementAngle ?? 0;
      const x = event.playerX ?? 0;
      const y = event.playerY ?? 0;
      const length = 150 + state.resource * 150;
      const damage = Math.max(1, Math.floor(runtime.combat.damage * (0.8 + state.resource * 0.6)));
      const buildCut = (centerX: number, centerY: number): GongfaRuntimeCommand => {
        const from = { x: centerX - Math.cos(angle + Math.PI / 2) * length / 2,
          y: centerY - Math.sin(angle + Math.PI / 2) * length / 2 };
        const to = { x: centerX + Math.cos(angle + Math.PI / 2) * length / 2,
          y: centerY + Math.sin(angle + Math.PI / 2) * length / 2 };
        return {
          kind: "authored-jinfeng-ground-cut", from, to,
          targetIds: (event.targets ?? []).filter((target) => distanceToSegment(target, from, to) <= 30)
            .map((target) => target.targetId),
          damage, delayMs: 0, lifetimeMs: 520,
          style: "evade-cross", sourceGongfaId: runtime.gongfaId
        };
      };
      commands.push(buildCut(x, y));
      commands.push(buildCut(x + Math.cos(angle) * 120, y + Math.sin(angle) * 120));
      state.resource *= 0.5;
    }
    return;
  }

  if (event.kind !== "tick") return;

  if (runtime.gongfaId === "flame-demon-body-art") {
    state.secondaryResource = Math.max(0, Math.min(1, event.healthRatio ?? 1));
    state.resource = 1 - state.secondaryResource;
    if (runtime.mastery.masterySkill2Id) {
      runtime.mastery.masterySkill2CooldownRemaining = Math.max(
        0,
        runtime.mastery.masterySkill2CooldownRemaining - event.deltaMs
      );
    }
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

  if (runtime.gongfaId === "crimson-furnace-sword-art") {
    advanceCrimsonNetwork(runtime, event, learnedIds, commands);
    return;
  }

  if (runtime.gongfaId === "green-vine-art") {
    runtime.mastery.masterySkill2CooldownRemaining = Math.max(
      0, runtime.mastery.masterySkill2CooldownRemaining - event.deltaMs
    );
    state.anchors = state.anchors.filter((anchor) => {
      if (anchor.kind !== "verdant-knot") return true;
      anchor.remainingMs = Math.max(0, (anchor.remainingMs ?? 6000) - event.deltaMs);
      return anchor.remainingMs > 0;
    });
    const endpoints = state.anchors.filter((anchor) => anchor.kind === "vine-endpoint");
    if (endpoints.length === 2) {
      for (const endpoint of endpoints) {
        if (endpoint.targetId === undefined) continue;
        const target = (event.targets ?? []).find((candidate) => candidate.targetId === endpoint.targetId);
        if (!target) {
          state.anchors = state.anchors.filter((anchor) => anchor.kind !== "vine-endpoint");
          state.resource = 0;
          return;
        }
        endpoint.x = target.x;
        endpoint.y = target.y;
      }
      const player = { x: event.playerX ?? 0, y: event.playerY ?? 0 };
      const direct = Math.hypot(endpoints[1]!.x - endpoints[0]!.x, endpoints[1]!.y - endpoints[0]!.y);
      const routed = Math.hypot(player.x - endpoints[0]!.x, player.y - endpoints[0]!.y) +
        Math.hypot(player.x - endpoints[1]!.x, player.y - endpoints[1]!.y);
      const geometric = Math.max(0, (routed - direct) / 160) *
        Math.pow(1.18, masteryEffectTiers(learnedIds, "surgeBuild"));
      const soft = learnedIds.includes("hundred-forged-soft-vine");
      const iron = learnedIds.includes("mountain-rending-iron-cable");
      const cap = iron ? 1.18 : soft ? 0.78 : 1;
      state.resource = soft
        ? Math.min(cap, Math.max(geometric, state.resource - event.deltaMs / 2500))
        : Math.min(cap, geometric);
      state.targetLedger[-402] = Math.max(0, (state.targetLedger[-402] ?? 0) - event.deltaMs);
      commands.push({
        kind: "authored-vine-tether",
        endpoints: endpoints.map((endpoint) => ({ x: endpoint.x, y: endpoint.y, targetId: endpoint.targetId })),
        player, tension: state.resource / cap, sourceGongfaId: runtime.gongfaId
      });
      if (!iron && state.targetLedger[-402] === 0) {
        state.targetLedger[-402] = 320;
        const targetIds = (event.targets ?? []).filter((target) =>
          distanceToSegment(target, endpoints[0]!, player) <= 18 ||
          distanceToSegment(target, player, endpoints[1]!) <= 18
        ).map((target) => target.targetId);
        if (targetIds.length > 0) commands.push({
          kind: "authored-vine-contact", from: endpoints[0]!, via: player, to: endpoints[1]!, targetIds,
          damage: Math.max(1, Math.floor(runtime.combat.damage *
            (learnedIds.includes("twin-serpent-bind") ? 0.72 : 0.48))),
          sourceGongfaId: runtime.gongfaId
        });
      }
      if (state.resource >= cap - 0.01) {
        const snapScale = iron ? 1.75 : learnedIds.includes("heart-piercing-thorn-cable") ? 1.55 :
          learnedIds.includes("flying-vine-graft") ? 0.72 : learnedIds.includes("twin-serpent-bind") ? 0.7 : 1.2;
        const targetIds = (event.targets ?? []).filter((target) =>
          distanceToSegment(target, endpoints[0]!, endpoints[1]!) <= 28
        ).map((target) => target.targetId);
        commands.push({
          kind: "authored-vine-snap", from: endpoints[0]!, to: endpoints[1]!, targetIds,
          damage: Math.max(1, Math.floor(runtime.combat.damage * snapScale)),
          bindMs: learnedIds.includes("step-borrowed-pull") ? 0 : soft ? 520 : 1100,
          sourceGongfaId: runtime.gongfaId
        });
        if (["dragon-binding-knot", "dense-heaven-net-knot", "broken-vine-branching"].some((id) => learnedIds.includes(id))) {
          const knot = {
            kind: "verdant-knot" as const,
            x: (endpoints[0]!.x + endpoints[1]!.x) / 2,
            y: (endpoints[0]!.y + endpoints[1]!.y) / 2,
            value: 1,
            remainingMs: (learnedIds.includes("dense-heaven-net-knot") ? 9000 : 6000) *
              Math.pow(1.16, masteryEffectTiers(learnedIds, "surgeStability"))
          };
          const knots = state.anchors.filter((anchor) => anchor.kind === "verdant-knot");
          const maxKnots = learnedIds.includes("dense-heaven-net-knot") ? 6 : 4;
          if (knots.length >= maxKnots) state.anchors.splice(state.anchors.indexOf(knots[0]!), 1);
          state.anchors.push(knot);
        }
        state.anchors = state.anchors.filter((anchor) => anchor.kind !== "vine-endpoint");
        state.resource = 0;
      }
    }
    const knots = state.anchors.filter((anchor) => anchor.kind === "verdant-knot");
    if (knots.length >= 3 && runtime.mastery.masterySkill2Id === "verdant-root-network" &&
        (runtime.mastery.masterySkill2CooldownRemaining <= 0 || runtime.mastery.masterySkill2Casts === 0)) {
      const center = knots.reduce((sum, knot) => ({ x: sum.x + knot.x, y: sum.y + knot.y }), { x: 0, y: 0 });
      center.x /= knots.length; center.y /= knots.length;
      const points = [...knots].sort((a, b) =>
        Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x)
      ).map((knot) => ({ x: knot.x, y: knot.y }));
      const stats = skill2RefinementStats(runtime);
      const cooldownMs = Math.floor(authoredSkill2Plans["verdant-root-network"].cooldownMs * stats.cadenceScale);
      commands.push({
        kind: "authored-heaven-net", points,
        targetIds: (event.targets ?? []).map((target) => target.targetId),
        damage: Math.max(1, Math.floor(skill2Combat(runtime).damage *
          (learnedIds.includes("dragon-binding-knot") ? 0.72 : learnedIds.includes("dense-heaven-net-knot") ? 0.78 : 1) * stats.damageScale)),
        durationMs: learnedIds.includes("broken-vine-branching") ? 1500 : 2400,
        slowMultiplier: learnedIds.includes("dragon-binding-knot") ? 0.2 : 0.55,
        sourceGongfaId: runtime.gongfaId,
        masteryCast: { skill2Id: "verdant-root-network", cooldownMs }
      });
      runtime.mastery.masterySkill2CooldownRemaining = cooldownMs;
      state.anchors = state.anchors.filter((anchor) => anchor.kind !== "verdant-knot");
      state.charges = 0;
    }
    state.charges = state.anchors.filter((anchor) => anchor.kind === "verdant-knot").length;
    return;
  }

  if (runtime.gongfaId === "jinfeng-gong") {
    const x = event.playerX ?? 0;
    const y = event.playerY ?? 0;
    const moving = event.isMoving === true && (event.movementDistance ?? 0) > 0;
    const angle = event.movementAngle ?? state.targetLedger[-303] ?? 0;
    const continuity = learnedIds.includes("unbroken-continuance");
    const borrowedTurn = learnedIds.includes("borrowed-turn-edge");
    const returningDragon = learnedIds.includes("returning-dragon-edge");
    const rupture = learnedIds.includes("gale-rupture");
    const cap = continuity ? 0.78 : returningDragon ? 0.86 : 1;
    runtime.mastery.masterySkill2CooldownRemaining = Math.max(
      0, runtime.mastery.masterySkill2CooldownRemaining - event.deltaMs
    );
    state.anchors = state.anchors.filter((anchor) => {
      if (anchor.kind !== "trail") return true;
      anchor.remainingMs = Math.max(0, (anchor.remainingMs ?? 2100) - event.deltaMs);
      return anchor.remainingMs > 0;
    });
    state.targetLedger[-304] = moving ? 1 : 0;
    if (moving) {
      state.targetLedger[-305] = 0;
      const priorAngle = state.targetLedger[-303];
      if (priorAngle !== undefined) {
        const turn = normalizedAngleDifference(angle, priorAngle);
        const allowedTurn = returningDragon ? 1.25 : 0.68;
        if (turn > allowedTurn) {
          if (borrowedTurn && state.resource >= cap - 0.02 && state.phase === 0) {
            state.resource *= 0.5;
            state.phase = 1;
          } else {
            state.resource = 0;
            state.phase = 0;
            state.anchors = state.anchors.filter((anchor) => anchor.kind !== "trail");
            state.continuousDistance = 0;
          }
        } else if (turn < 0.3) {
          state.phase = 0;
        }
      }
      state.targetLedger[-303] = angle;
      const distance = Math.max(0, event.movementDistance ?? 0);
      state.resource = Math.min(cap, state.resource + distance / 680 * (1 + (state.targetLedger[-307] ?? 0)));
      const lastPoint = state.anchors.filter((anchor) => anchor.kind === "trail").at(-1);
      if (!lastPoint || Math.hypot(x - lastPoint.x, y - lastPoint.y) >= 18) {
        state.anchors.push({ kind: "trail", x, y, angle, value: state.resource, remainingMs: 2100 });
      }
      state.targetLedger[-306] = (state.targetLedger[-306] ?? 0) + distance;
      const refinementCadence = 1 + (runtime.skill1Refinements?.countBonus ?? 0) * 0.12;
      const spacing = (learnedIds.includes("golden-gale-crosscut") ? 105 :
        learnedIds.includes("crescent-wake") ? 72 : 68) / refinementCadence;
      if (state.targetLedger[-306] >= spacing) {
        state.targetLedger[-306] %= spacing;
        const longitudinal = learnedIds.includes("heaven-splitting-long-edge");
        const oneLine = learnedIds.includes("one-line-to-horizon") && state.continuousDistance >= 260;
        let length = oneLine ? 680 : longitudinal ? 310 :
          learnedIds.includes("golden-gale-crosscut") ? 270 : 150 + state.resource * 170;
        if (returningDragon) length *= 0.8;
        if (rupture) length *= 0.72;
        length = (length + (runtime.skill1Refinements?.rangeBonus ?? 0)) *
          (1 + (state.targetLedger[-309] ?? 0));
        const cutAngle = longitudinal ? angle : angle + Math.PI / 2;
        const centerX = learnedIds.includes("crescent-wake") ? x - Math.cos(angle) * 52 : x;
        const centerY = learnedIds.includes("crescent-wake") ? y - Math.sin(angle) * 52 : y;
        const from = { x: centerX - Math.cos(cutAngle) * length / 2,
          y: centerY - Math.sin(cutAngle) * length / 2 };
        const to = { x: centerX + Math.cos(cutAngle) * length / 2,
          y: centerY + Math.sin(cutAngle) * length / 2 };
        const hitWidth = learnedIds.includes("golden-gale-crosscut") ? 32 : longitudinal ? 15 : 22;
        const targetIds = (event.targets ?? []).filter((target) =>
          distanceToSegment(target, from, to) <= hitWidth
        ).map((target) => target.targetId);
        commands.push({
          kind: "authored-jinfeng-ground-cut", from, to, targetIds,
          damage: Math.max(1, Math.floor(runtime.combat.damage *
            (learnedIds.includes("crescent-wake") ? 1.28 : longitudinal ? 1.18 :
              learnedIds.includes("golden-gale-crosscut") ? 0.82 : 1))),
          delayMs: learnedIds.includes("crescent-wake") ? 260 : 0,
          lifetimeMs: (420 + state.resource * 520) * (1 + (state.targetLedger[-309] ?? 0)),
          style: longitudinal ? "longitudinal" : learnedIds.includes("crescent-wake") ? "wake" : "cross-step",
          sourceGongfaId: runtime.gongfaId
        });
      }
      const route = state.anchors.filter((anchor) => anchor.kind === "trail");
      if (state.resource >= cap - 0.01 && rupture && !runtime.mastery.masterySkill2Id) {
        const length = 380;
        for (const cutAngle of [angle, angle + Math.PI / 2]) {
          const from = { x: x - Math.cos(cutAngle) * length / 2, y: y - Math.sin(cutAngle) * length / 2 };
          const to = { x: x + Math.cos(cutAngle) * length / 2, y: y + Math.sin(cutAngle) * length / 2 };
          commands.push({
            kind: "authored-jinfeng-ground-cut", from, to,
            targetIds: (event.targets ?? []).filter((target) => distanceToSegment(target, from, to) <= 30).map((target) => target.targetId),
            damage: Math.max(1, Math.floor(runtime.combat.damage * 1.65)), delayMs: 0,
            lifetimeMs: 650, style: "rupture", sourceGongfaId: runtime.gongfaId
          });
        }
        state.resource = 0;
        state.anchors = state.anchors.filter((anchor) => anchor.kind !== "trail");
      } else if (state.resource >= cap - 0.01 && route.length >= 3 &&
          runtime.mastery.masterySkill2Id === "golden-gale-corridor" &&
          (runtime.mastery.masterySkill2CooldownRemaining <= 0 || runtime.mastery.masterySkill2Casts === 0)) {
        const stats = skill2RefinementStats(runtime);
        const points = route.map((point) => ({ x: point.x, y: point.y }));
        const width = 34 + stats.coverage * 7;
        const targetIds = (event.targets ?? []).filter((target) => points.slice(1).some((point, index) =>
          distanceToSegment(target, points[index]!, point) <= width
        )).map((target) => target.targetId);
        const cooldownMs = Math.floor(authoredSkill2Plans["golden-gale-corridor"].cooldownMs * stats.cadenceScale);
        commands.push({
          kind: "authored-golden-gale-route", points, targetIds,
          damage: Math.max(1, Math.floor(skill2Combat(runtime).damage * 1.15 * stats.damageScale)),
          width, durationMs: 2200 + stats.coverage * 250,
          sourceGongfaId: runtime.gongfaId,
          masteryCast: { skill2Id: "golden-gale-corridor", cooldownMs }
        });
        runtime.mastery.masterySkill2CooldownRemaining = cooldownMs;
        state.resource = 0;
        state.anchors = state.anchors.filter((anchor) => anchor.kind !== "trail");
        state.cycleCount += 1;
      }
    } else {
      state.targetLedger[-305] = (state.targetLedger[-305] ?? 0) + event.deltaMs;
      const grace = continuity ? 720 : 180;
      if ((state.targetLedger[-305] ?? 0) > grace) {
        state.resource = Math.max(0, state.resource - event.deltaMs / 1200 * (state.targetLedger[-308] ?? 1));
        if (state.resource === 0) state.anchors = state.anchors.filter((anchor) => anchor.kind !== "trail");
      }
    }
    state.resource = Math.min(cap, state.resource);
    return;
  }

  if (runtime.gongfaId === "yujian-jue") {
    const swords = state.anchors.filter((anchor) => anchor.kind === "sword");
    state.phaseElapsedMs += event.deltaMs;
    runtime.mastery.masterySkill2CooldownRemaining = Math.max(
      0,
      runtime.mastery.masterySkill2CooldownRemaining - event.deltaMs
    );
    for (const sword of swords) {
      const total = Math.max(1, sword.maxValue ?? 2200);
      sword.remainingMs = Math.max(0, (sword.remainingMs ?? total) - event.deltaMs);
      const elapsed = total - sword.remainingMs;
      const half = total / 2;
      const origin = sword.routePoints?.[0] ?? {
        x: sword.originPlayerX ?? event.playerX ?? 0,
        y: sword.originPlayerY ?? event.playerY ?? 0
      };
      const endpoint = sword.routePoints?.at(-1) ?? { x: sword.x, y: sword.y };
      if (elapsed <= half) {
        const progress = elapsed / half;
        sword.x = origin.x + (endpoint.x - origin.x) * progress;
        sword.y = origin.y + (endpoint.y - origin.y) * progress;
      } else {
        const progress = Math.min(1, (elapsed - half) / half);
        sword.x = endpoint.x + ((event.playerX ?? origin.x) - endpoint.x) * progress;
        sword.y = endpoint.y + ((event.playerY ?? origin.y) - endpoint.y) * progress;
        if (learnedIds.includes("linked-sword-catch") &&
            Math.hypot(sword.x - (event.playerX ?? 0), sword.y - (event.playerY ?? 0)) <= 48) {
          sword.remainingMs = 0;
          runtime.attackCooldownRemaining = 0;
        }
      }
    }
    const returned = swords.filter((sword) => (sword.remainingMs ?? 0) <= 0).length;
    if (returned > 0) {
      state.anchors = state.anchors.filter((anchor) =>
        anchor.kind !== "sword" || (anchor.remainingMs ?? 0) > 0
      );
      state.charges = Math.min(state.maxCharges, state.charges + returned);
      if (state.anchors.every((anchor) => anchor.kind !== "sword")) state.phase = 0;
    }
    state.resource = state.charges / Math.max(1, state.maxCharges);
    return;
  }

  if (runtime.gongfaId === "blazing-feather-art") {
    const maxCharges = learnedIds.includes("endless-plumage") ? 8 :
      learnedIds.includes("swift-molt") ? 3 : state.maxCharges;
    state.maxCharges = maxCharges;
    if (state.charges === 0) {
      if (state.phaseElapsedMs <= 0) {
        const reloadMs = learnedIds.includes("last-feather") ? 2300 :
          learnedIds.includes("endless-plumage") ? 2200 :
            learnedIds.includes("swift-molt") ? 900 : 1500;
        state.phaseElapsedMs = reloadMs * Math.pow(0.92, masteryEffectTiers(learnedIds, "surgeBuild"));
        state.phase = 1;
      }
      state.phaseElapsedMs = Math.max(0, state.phaseElapsedMs - event.deltaMs);
      if (state.phaseElapsedMs === 0) {
        state.charges = state.maxCharges;
        state.cycleCount = 0;
        state.phase = 0;
      }
    }
    state.resource = state.charges / Math.max(1, state.maxCharges);
    state.anchors = state.anchors.filter((anchor) => {
      if (anchor.kind !== "phoenix-brand" || anchor.remainingMs === undefined) return true;
      anchor.remainingMs = Math.max(0, anchor.remainingMs - event.deltaMs);
      return anchor.remainingMs > 0;
    });
    for (const brand of state.anchors.filter((anchor) => anchor.kind === "phoenix-brand")) {
      const target = event.targets?.find((candidate) => candidate.targetId === brand.targetId);
      if (target) { brand.x = target.x; brand.y = target.y; }
    }
    return;
  }

  if (runtime.gongfaId === "drifting-frost-needle") {
    state.anchors = state.anchors.filter((anchor) =>
      anchor.kind !== "weakpoint" || anchor.remainingMs === undefined ||
      (anchor.remainingMs = Math.max(0, anchor.remainingMs - event.deltaMs)) > 0
    );
    state.charges = state.anchors.filter((anchor) => anchor.kind === "weakpoint").length;
    state.resource = Math.min(1, state.charges / 5);
    return;
  }

  if (runtime.gongfaId === "ironwood-wave-form") {
    advanceIronwoodRampart(runtime, event, learnedIds, commands);
    return;
  }

  if (runtime.gongfaId === "verdant-ring-scripture") {
    state.targetLedger[-90] = Math.max(0, (state.targetLedger[-90] ?? 0) - event.deltaMs);
    state.phaseElapsedMs += event.deltaMs;
    state.secondaryResource += Math.max(0, event.movementDistance ?? 0);
    if (state.phase !== 2 && state.phaseElapsedMs >= 900) {
      const mountain = learnedIds.includes("mountain-root-scripture");
      const leafScripture = learnedIds.includes("green-wind-leaf-scripture");
      const thornScripture = learnedIds.includes("calamity-step-thorn-scripture");
      const rootThreshold = mountain ? 34 : leafScripture ? 8 : 20;
      const glyph = (state.targetLedger[-90] ?? 0) > 0 ? "thorn" as const :
        state.secondaryResource <= rootThreshold ? "root" as const : "leaf" as const;
      state.anchors.push({ kind: "glyph", glyph, x: event.playerX ?? 0, y: event.playerY ?? 0, value: 1 });
      state.anchors = state.anchors.filter((anchor) => anchor.kind === "glyph").slice(-3);
      state.phaseElapsedMs = 0;
      state.secondaryResource = 0;
      state.charges = state.anchors.length;
      state.resource = state.charges / 3;
      const queue = state.anchors.flatMap((anchor) => anchor.glyph ? [anchor.glyph] : []);
      if (queue.length === 3) {
        const exactSproutSun = queue[0] === "root" && queue[1] === "leaf" && queue[2] === "thorn";
        if (exactSproutSun && runtime.mastery.masterySkill2Id === "sprout-sun-circle") {
          state.phase = 2;
        } else {
          const first = queue[0]!; const second = queue[1]!; const third = queue[2]!;
          const allSame = first === second && second === third;
          const allDifferent = new Set(queue).size === 3;
          const firstLast = first === third && first !== second;
          let power = 1;
          let repeatCount = third === "leaf" ? 2 : 1;
          let radiusScale = 1;
          if (learnedIds.includes("single-line-specialization")) power *= allSame ? 1.55 : 0.72;
          if (learnedIds.includes("three-talents-concord")) power *= allDifferent ? 1.45 : 0.72;
          if (learnedIds.includes("first-last-generation")) {
            if (firstLast) repeatCount += 1;
            else { power *= 0.78; radiusScale *= 0.76; }
          }
          if (queue.includes("root") && mountain) power *= 1.12;
          if (queue.includes("leaf") && leafScripture) power *= 1.1;
          if (third === "thorn" && thornScripture) power *= 1.28;
          const earth = learnedIds.includes("earth-scripture-myriad-roots");
          const heaven = learnedIds.includes("heaven-scripture-thousand-leaves");
          const thorns = learnedIds.includes("thorn-scripture-hundred-calamities");
          if (third === "root" && earth) power *= 1.35;
          if (third === "thorn" && earth) power *= 0.68;
          if (second === "leaf" && heaven) repeatCount += 1;
          if (third === "root" && heaven) power *= 0.65;
          if (third === "thorn" && thorns) power *= 1.65;
          if (third === "root" && thorns) power *= 0.58;
          if (thorns && (second === "leaf" || third === "leaf")) repeatCount = 1;
          const targets = event.targets ?? [];
          const rank = (target: AuthoredTargetFact): number => target.rank === "boss" ? 3 : target.rank === "elite" ? 2 : 1;
          const target = [...targets].sort((a, b) => rank(b) + b.healthRatio - rank(a) - a.healthRatio)[0];
          commands.push({
            kind: "authored-glyph-invocation", glyphs: queue,
            shape: first === "root" ? "root-circle" : first === "leaf" ? "leaf-route" : "thorn-triangle",
            motion: second === "root" ? "fixed" : second === "leaf" ? "traveling" : "contracting",
            payoff: third === "root" ? "bind" : third === "leaf" ? "repeat" : "damage",
            x: event.playerX ?? 0, y: event.playerY ?? 0,
            ...(target ? { target: { x: target.x, y: target.y, targetId: target.targetId } } : {}),
            radius: (first === "root" ? 118 : first === "leaf" ? 155 : 96) * radiusScale,
            damage: Math.max(1, Math.floor(runtime.combat.damage * power * (third === "root" ? 0.48 : third === "leaf" ? 0.62 : 1.35))),
            power, repeatCount, clearProjectiles: heaven && second === "leaf",
            sourceGongfaId: runtime.gongfaId
          });
          state.anchors = []; state.charges = 0; state.resource = 0; state.phase = 0;
        }
      }
    }
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
  } else if (!["ancient-tree-body-art", "heavenfall-body-art", "frozen-river-formation"].includes(runtime.gongfaId)) {
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
      bird!.targetId = undefined;
      bird!.originPlayerX = undefined;
      bird!.originPlayerY = undefined;
      stateTimer = 0;
      rawBond = 0;
      state.resource = 0;
      state.targetLedger[-31] = 0;
    };

    if (birdState === "guard" || birdState === "phoenix") {
      bird.x = playerX;
      bird.y = playerY;
      if (event.isMoving && targets.length > 0) {
        const headHunt = learnedIds.includes("crimson-feather-head-hunt");
        const guardian = learnedIds.includes("cinnabar-plume-guardian");
        const sweeping = learnedIds.includes("firewing-sweeping-formation");
        const movementAngle = event.movementAngle ?? state.lastMovementAngle ?? 0;
        const alignment = (target: AuthoredTargetFact): number => Math.cos(
          Math.atan2(target.y - playerY, target.x - playerX) - movementAngle
        );
        const eligible = headHunt
          ? targets.filter((target) => target.rank === "elite" || target.rank === "boss")
          : targets;
        const ordered = [...eligible].sort((a, b) => {
          if (headHunt) {
            const rankA = a.rank === "boss" ? 3 : a.rank === "elite" ? 2 : 1;
            const rankB = b.rank === "boss" ? 3 : b.rank === "elite" ? 2 : 1;
            return rankB * 4 + alignment(b) + b.healthRatio - (rankA * 4 + alignment(a) + a.healthRatio);
          }
          return alignment(b) * 600 - Math.sqrt(distanceSquared(b.x, b.y, playerX, playerY)) -
            (alignment(a) * 600 - Math.sqrt(distanceSquared(a.x, a.y, playerX, playerY)));
        });
        const chosen = sweeping ? ordered.slice(0, 3) : ordered.slice(0, 1);
        if (chosen.length === 0) {
          state.targetLedger[-20] = rawBond;
          state.targetLedger[-21] = bondCap;
          state.targetLedger[-30] = stateTimer;
          state.resource = rawBond / bondCap;
          state.secondaryResource = Math.max(0, bird.value / Math.max(0.01, bird.maxValue ?? 1));
          state.phase = ["guard", "outbound", "return", "ember", "egg", "phoenix"].indexOf(bird.companionState ?? "guard");
          state.charges = 1;
          return;
        }
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
          flightStyle: headHunt ? "head-hunt" : guardian ? "guardian" : sweeping ? "sweep" : "guided",
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
          flightStyle: "return",
          sourceGongfaId: runtime.gongfaId
        });
        bird.angle = returnAngle;
        bird.originPlayerX = bird.x;
        bird.originPlayerY = bird.y;
        bird.companionState = "return";
        stateTimer = 0;
        state.targetLedger[-31] = 0;
      }
    } else if (birdState === "return") {
      const paired = learnedIds.includes("paired-wing-flight");
      const alignment = paired && event.isMoving && event.movementAngle !== undefined
        ? Math.cos(event.movementAngle - (bird.angle ?? 0))
        : 0;
      const progressScale = paired ? alignment > 0.5 ? 1.55 : alignment < -0.5 ? 0.55 : 1 : 1;
      stateTimer += event.deltaMs * progressScale;
      state.targetLedger[-31] = (state.targetLedger[-31] ?? 0) + alignment * event.deltaMs;
      const sweeping = learnedIds.includes("firewing-sweeping-formation");
      const headHunt = learnedIds.includes("crimson-feather-head-hunt");
      const guardian = learnedIds.includes("cinnabar-plume-guardian");
      const returnDuration = guardian ? 560 : sweeping ? 1120 : headHunt ? 900 : 720;
      const progress = Math.min(1, stateTimer / returnDuration);
      bird.x = (bird.originPlayerX ?? bird.x) + (playerX - (bird.originPlayerX ?? bird.x)) * progress;
      bird.y = (bird.originPlayerY ?? bird.y) + (playerY - (bird.originPlayerY ?? bird.y)) * progress;
      bird.angle = Math.atan2(playerY - bird.y, playerX - bird.x);
      const dangerCount = targets.filter((target) => distanceSquared(target.x, target.y, bird!.x, bird!.y) <= 68 ** 2).length;
      bird.value -= dangerCount * event.deltaMs * 0.00006 * (guardian ? 0.42 : sweeping ? 1.25 : headHunt ? 1.1 : 1);
      if (bird.value <= 0) {
        downBird();
      } else if (stateTimer >= returnDuration) {
        const lowHealthReturn = bird.value / Math.max(0.01, bird.maxValue ?? 1) < 0.5;
        const pairedAlignment = (state.targetLedger[-31] ?? 0) / Math.max(1, returnDuration);
        const bondGain = learnedIds.includes("blood-covenant-of-fire-bathing")
          ? lowHealthReturn ? 0.42 : 0.18
          : paired ? pairedAlignment > 0.25 ? 0.32 : pairedAlignment < -0.25 ? 0.1 : 0.16 : 0.22;
        rawBond = Math.min(bondCap, rawBond + bondGain);
        if (learnedIds.includes("nurtured-covenant")) {
          bird.value = Math.min(bird.maxValue ?? 1, bird.value + (bird.maxValue ?? 1) * 0.24);
        }
        bird.companionState = (bird.maxValue ?? 1) > 1 ? "phoenix" : "guard";
        bird.x = playerX;
        bird.y = playerY;
        bird.originPlayerX = undefined;
        bird.originPlayerY = undefined;
        stateTimer = 0;
        state.targetLedger[-31] = 0;
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
      let acted = false;
      for (const beast of living) {
        const species = beast.beastSpecies ?? "boar";
        const form = beast.beastForm ?? forms[species];
        if (!event.isMoving) {
          const angle = species === "boar" ? 2.5 : species === "fox" ? 0.65 : -Math.PI / 2;
          beast.x = playerX + Math.cos(angle) * 48;
          beast.y = playerY + Math.sin(angle) * 48;
          beast.targetId = undefined;
          continue;
        }
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
        if (species === "deer") {
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
        acted = true;
      }
      if (acted) cooldown = Math.max(720, 1260 - runtime.combat.count * 55);
    }
    state.targetLedger[-40] = cooldown;
    state.charges = living.length;
    state.secondaryResource = living.length / 3;
  }

  if (runtime.gongfaId === "ancient-tree-body-art") {
    const playerX = event.playerX ?? 0;
    const playerY = event.playerY ?? 0;
    const targets = event.targets ?? [];
    const moving = event.isMoving === true;
    const thousand = learnedIds.includes("one-ring-in-a-thousand-years");
    const spring = learnedIds.includes("spring-flourishing");
    const fusang = learnedIds.includes("spirit-fruit-fusang");
    const maxRings = thousand ? 3 : spring ? 7 : 5;
    state.maxCharges = maxRings;
    let worldTreeActivated = false;
    let worldTreeMasteryCast: MasterySkill2Cast | undefined;
    if (runtime.mastery.masterySkill2Id) {
      runtime.mastery.masterySkill2CooldownRemaining = Math.max(
        0,
        runtime.mastery.masterySkill2CooldownRemaining - event.deltaMs
      );
    }
    if (state.phase === 0) {
      state.resource = 0;
      state.charges = 0;
      state.targetLedger[-63] = 0;
      state.targetLedger[-64] = 0;
      state.phaseElapsedMs = moving || event.nearbyEnemyCount === 0 ? 0 : state.phaseElapsedMs + event.deltaMs;
      if (state.phaseElapsedMs >= 520) { state.phase = 1; state.phaseElapsedMs = 0; }
    } else if (state.phase === 1) {
      if (moving) {
        state.phase = 2;
        state.phaseElapsedMs = (360 + state.charges * (spring ? 310 : 170)) *
          Math.pow(0.84, masteryEffectTiers(learnedIds, "surgeStability"));
        state.targetLedger[-63] = 0;
      } else {
        const interval = (thousand ? 2600 : spring ? 620 : fusang ? 1900 : 1250) /
          (1 + masteryEffectTiers(learnedIds, "surgeBuild") * 0.18);
        const lostRings = Math.max(0, Math.floor(state.targetLedger[-64] ?? 0));
        const currentRingCap = Math.max(0, maxRings - lostRings);
        state.secondaryResource += event.deltaMs;
        while (state.secondaryResource >= interval && state.charges < currentRingCap) {
          state.secondaryResource -= interval;
          state.charges += 1;
        }
        state.resource = state.charges / maxRings;
        const canBecomeWorldTree = state.charges >= maxRings &&
          runtime.mastery.masterySkill2Id === "world-tree-incarnation" &&
          runtime.mastery.masterySkill2CooldownRemaining === 0 && event.skill2Enabled !== false;
        state.targetLedger[-63] = canBecomeWorldTree
          ? (state.targetLedger[-63] ?? 0) + event.deltaMs
          : 0;
        if ((state.targetLedger[-63] ?? 0) >= 900) {
          const skill2Stats = skill2RefinementStats(runtime);
          const cooldownMs = Math.floor(authoredSkill2Plans["world-tree-incarnation"].cooldownMs * skill2Stats.cadenceScale);
          state.phase = 3;
          state.phaseElapsedMs = 5600;
          state.targetLedger[-60] = 0;
          state.targetLedger[-63] = 0;
          runtime.mastery.masterySkill2CooldownRemaining = cooldownMs;
          worldTreeActivated = true;
          worldTreeMasteryCast = { skill2Id: "world-tree-incarnation", cooldownMs };
        }
      }
    } else if (state.phase === 2) {
      state.phaseElapsedMs = Math.max(0, state.phaseElapsedMs - event.deltaMs);
      if (state.phaseElapsedMs === 0) {
        state.phase = 0; state.charges = 0; state.resource = 0; state.secondaryResource = 0;
        state.targetLedger[-64] = 0;
      }
    } else if (state.phase === 3) {
      state.phaseElapsedMs = Math.max(0, state.phaseElapsedMs - event.deltaMs);
      if (state.phaseElapsedMs === 0) {
        state.phase = 0; state.charges = 0; state.resource = 0; state.secondaryResource = 0;
        state.targetLedger[-64] = 0;
      }
    }
    let attackTimer = Math.max(0, (state.targetLedger[-60] ?? 0) - event.deltaMs);
    if (
      (state.phase === 1 || state.phase === 3) &&
      attackTimer === 0 &&
      (event.nearbyEnemyCount > 0 || (state.phase === 3 && targets.length > 0) || worldTreeActivated)
    ) {
      const banyan = learnedIds.includes("great-rooted-banyan");
      const ironCrown = learnedIds.includes("iron-crowned-divine-tree");
      const law = learnedIds.includes("one-tree-upholds-heaven") ? "one-tree" as const :
        learnedIds.includes("world-sheltering-canopy") ? "sheltering" as const : "many-roots" as const;
      const ringPower = thousand ? 1.65 : spring ? 0.72 : 1;
      const worldTree = state.phase === 3;
      const refinementRange = runtime.skill1Refinements?.rangeBonus ?? 0;
      const rootRadius = (banyan ? 112 : ironCrown ? 48 : 72) + state.charges * (banyan ? 15 : 10) + refinementRange;
      const branchSectors = Math.max(1, state.charges + 1 + (runtime.skill1Refinements?.countBonus ?? 0));
      const canopyRadius = (fusang ? 150 : 205) + state.charges * 18 + refinementRange;
      const activeBranchSector = Math.floor(state.targetLedger[-62] ?? 0) % branchSectors;
      state.targetLedger[-62] = activeBranchSector + 1;
      const rank = (target: AuthoredTargetFact): number => target.rank === "boss" ? 3 : target.rank === "elite" ? 2 : 1;
      const strongest = [...targets].sort((a, b) => rank(b) * 10 + b.healthRatio - rank(a) * 10 - a.healthRatio)[0];
      const inCanopy = targets.filter((target) => distanceSquared(target.x, target.y, playerX, playerY) <= canopyRadius ** 2);
      const outerCanopy = inCanopy.filter((target) =>
        distanceSquared(target.x, target.y, playerX, playerY) > rootRadius ** 2
      );
      const farthest = [...outerCanopy].sort((a, b) =>
        distanceSquared(b.x, b.y, playerX, playerY) - distanceSquared(a.x, a.y, playerX, playerY)
      )[0];
      const canopyPriority = ironCrown
        ? [...outerCanopy].filter((target) => target.rank !== "ordinary").sort((a, b) => rank(b) - rank(a))[0] ?? farthest
        : farthest;
      const sectorCenter = activeBranchSector / branchSectors * Math.PI * 2;
      const branchTargets = inCanopy.filter((target) => {
        const distance = Math.sqrt(distanceSquared(target.x, target.y, playerX, playerY));
        const angle = Math.atan2(target.y - playerY, target.x - playerX);
        return distance > rootRadius && angularDistance(angle, sectorCenter) <= Math.PI / branchSectors * 0.72;
      });
      let rootTargetIds = inCanopy.filter((target) =>
        distanceSquared(target.x, target.y, playerX, playerY) <= rootRadius ** 2
      ).map((target) => target.targetId);
      let branchTargetIds = branchTargets.map((target) => target.targetId);
      let canopyTargetIds = canopyPriority ? [canopyPriority.targetId] : [];
      if (worldTree && law === "many-roots") {
        rootTargetIds = targets.filter((target) => target.rank === "ordinary" || target.rank === "boss").map((target) => target.targetId);
      } else if (worldTree && law === "one-tree" && strongest) {
        rootTargetIds = [strongest.targetId];
        branchTargetIds = [strongest.targetId];
        canopyTargetIds = [strongest.targetId];
      }
      const basePower = runtime.combat.damage * ringPower * (worldTree ? 1.45 : 0.72);
      const shelterScale = law === "sheltering" ? 0.35 : 1;
      const focusScale = worldTree && law === "one-tree" ? 1.35 : 1;
      commands.push({
        kind: "authored-ancient-tree-cycle", x: playerX, y: playerY, rings: state.charges,
        rootRadius, branchSectors, canopyRadius, activeBranchSector,
        rootTargetIds, branchTargetIds, canopyTargetIds,
        rootDamage: Math.max(1, Math.floor(basePower * (banyan ? 0.55 : ironCrown ? 0.28 : fusang ? 0.32 : 0.42) * shelterScale * focusScale)),
        branchDamage: Math.max(1, Math.floor(basePower * (banyan ? 0.22 : ironCrown ? 0.38 : fusang ? 0.25 : 0.35) * shelterScale * focusScale)),
        canopyDamage: Math.max(1, Math.floor(basePower * (banyan ? 0.25 : ironCrown ? 0.72 : fusang ? 0.26 : 0.48) * shelterScale * focusScale)),
        rootForce: banyan ? 115 : ironCrown ? 45 : 78,
        bossDamageScale: law === "many-roots" ? 0.28 : 1,
        law, heal: law === "sheltering" && worldTree ? 12 : fusang || law === "sheltering" ? 2 + state.charges : 0,
        worldTree, canopyFocus: ironCrown, clearProjectiles: law === "sheltering",
        sourceGongfaId: runtime.gongfaId,
        ...(worldTreeActivated && worldTreeMasteryCast ? { masteryCast: worldTreeMasteryCast } : {})
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
    const light = learnedIds.includes("wandering-star-light-body");
    const giant = learnedIds.includes("heavenfall-giant-body");
    const piercing = learnedIds.includes("star-piercing-iron-body");
    const noReturn = learnedIds.includes("no-return-advance");
    const opensRoad = learnedIds.includes("iron-body-opens-the-road");
    const pivot = learnedIds.includes("heaven-turning-pivot");
    const starLance = learnedIds.includes("mountain-piercing-star-lance");
    const reverseReturn = learnedIds.includes("reverse-star-return");
    const cap = light ? 0.68 : pivot ? 0.78 : 1;
    const radiusFor = (mass: number): number => (piercing ? 24 : giant ? 58 : 38) + mass * 24;
    const wrapAngle = (angle: number): number => Math.atan2(Math.sin(angle), Math.cos(angle));
    const turnToward = (from: number, to: number, maximum: number): number =>
      from + Math.max(-maximum, Math.min(maximum, wrapAngle(to - from)));
    for (const key of Object.keys(state.targetLedger).map(Number).filter((key) => key > 0)) {
      state.targetLedger[key] = Math.max(0, state.targetLedger[key]! - event.deltaMs);
    }
    state.targetLedger[-72] = Math.max(0, (state.targetLedger[-72] ?? 0) - event.deltaMs);
    if (runtime.mastery.masterySkill2Id) {
      runtime.mastery.masterySkill2CooldownRemaining = Math.max(
        0,
        runtime.mastery.masterySkill2CooldownRemaining - event.deltaMs
      );
    }
    if (state.phase === 0) {
      state.phaseElapsedMs = moving && targets.length > 0 ? state.phaseElapsedMs + event.deltaMs : 0;
      if (state.phaseElapsedMs >= 420) {
        state.phase = 1; state.phaseElapsedMs = 0; state.resource = 0; state.secondaryResource = 0;
        state.lastMovementAngle = event.movementAngle;
        state.targetLedger[-70] = event.movementAngle ?? 0;
        state.targetLedger[-73] = playerX;
        state.targetLedger[-74] = playerY;
      }
    } else if (state.phase === 1) {
      state.phaseElapsedMs += event.deltaMs;
      const angle = event.movementAngle ?? state.lastMovementAngle ?? 0;
      const previousHeading = state.targetLedger[-70];
      const turn = previousHeading === undefined ? 0 : Math.abs(Math.atan2(
        Math.sin(angle - previousHeading), Math.cos(angle - previousHeading)
      ));
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
      const radius = radiusFor(state.resource);
      const eligible = targets.filter((target) => target.rank === "ordinary" &&
        distanceSquared(target.x, target.y, playerX, playerY) <= radius ** 2 &&
        (state.targetLedger[target.targetId] ?? 0) <= 0
      );
      const hardCollisions = targets.filter((target) => target.rank !== "ordinary" &&
        distanceSquared(target.x, target.y, playerX, playerY) <= radius ** 2 &&
        (state.targetLedger[target.targetId] ?? 0) <= 0
      );
      if (eligible.length > 0 && !opensRoad) state.resource = Math.max(0, state.resource - eligible.length * 0.055);
      if (eligible.length > 0 && opensRoad) state.targetLedger[-72] = Math.max(state.targetLedger[-72] ?? 0, 360);
      if (hardCollisions.length > 0) state.resource = Math.max(0, state.resource - hardCollisions.length * 0.32);
      for (const target of [...eligible, ...hardCollisions]) state.targetLedger[target.targetId] = 720;
      const bodyPower = piercing ? 1.18 : giant ? 1.42 : light ? 0.78 : 1;
      commands.push({
        kind: "authored-heavenfall-body", x: playerX, y: playerY, radius: radiusFor(state.resource),
        mass: state.resource, angle, committing: false,
        damage: Math.max(1, Math.floor(runtime.combat.damage * (0.5 + state.resource * 0.65) * bodyPower)),
        force: (90 + state.resource * 190) * bodyPower, eligibleTargetIds: eligible.map((target) => target.targetId),
        sourceGongfaId: runtime.gongfaId
      });
      const descentReady = runtime.mastery.masterySkill2Id === "star-breaking-descent" &&
        runtime.mastery.masterySkill2CooldownRemaining === 0 && event.skill2Enabled !== false;
      if (descentReady && (state.resource >= cap - 0.001 || state.phaseElapsedMs >= 6000)) {
        state.phase = 2;
        state.phaseElapsedMs = 0;
        state.secondaryResource = state.resource;
        state.targetLedger[-70] = angle;
      }
      if (state.phaseElapsedMs >= 6200 && !runtime.mastery.masterySkill2Id) {
        state.phase = 0; state.phaseElapsedMs = 0; state.resource = 0;
      }
    } else if (state.phase === 2) {
      if (event.skill2Enabled !== false) state.phaseElapsedMs += event.deltaMs;
      const mass = state.secondaryResource;
      const currentHeading = state.targetLedger[-70] ?? state.lastMovementAngle ?? 0;
      const strongest = [...targets].sort((a, b) => {
        const rank = (target: AuthoredTargetFact): number => target.rank === "boss" ? 3 : target.rank === "elite" ? 2 : 1;
        return rank(b) * 10 + (1 - b.healthRatio) - (rank(a) * 10 + (1 - a.healthRatio));
      })[0];
      const desiredHeading = starLance && strongest
        ? Math.atan2(strongest.y - playerY, strongest.x - playerX)
        : event.movementAngle ?? currentHeading;
      const steeringRate = (light ? 2.9 : giant ? 1.15 : piercing ? 0.82 : 1.75) * (1 - mass * 0.42);
      const heading = turnToward(currentHeading, desiredHeading, steeringRate * event.deltaMs / 1000);
      state.targetLedger[-70] = heading;
      state.lastMovementAngle = heading;
      const travel = 110 + mass * 170;
      const landingX = playerX + Math.cos(heading) * travel;
      const landingY = playerY + Math.sin(heading) * travel;
      commands.push({
        kind: "authored-heavenfall-body", x: playerX, y: playerY, radius: radiusFor(mass),
        mass, angle: heading, committing: true, landingX, landingY,
        damage: 0, force: 0, eligibleTargetIds: [], sourceGongfaId: runtime.gongfaId
      });
      if (state.phaseElapsedMs >= 760) {
        const fate = starLance ? "star-lance" as const : reverseReturn ? "reverse-return" as const : "crater" as const;
        const skill2Stats = skill2RefinementStats(runtime);
        const skill2Base = skill2Combat(runtime);
        const cooldownMs = Math.floor(authoredSkill2Plans["star-breaking-descent"].cooldownMs * skill2Stats.cadenceScale);
        commands.push({
          kind: "authored-star-descent",
          originX: playerX, originY: playerY, landingX, landingY,
          ...(reverseReturn ? { returnX: state.targetLedger[-73] ?? playerX, returnY: state.targetLedger[-74] ?? playerY } : {}),
          angle: heading, mass,
          damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale * (0.75 + mass * 1.8))),
          radius: fate === "star-lance" ? 24 + mass * 14 : fate === "reverse-return" ? 24 + mass * 10 : 90 + mass * 150,
          fate, sourceGongfaId: runtime.gongfaId,
          masteryCast: { skill2Id: "star-breaking-descent", cooldownMs }
        });
        runtime.mastery.masterySkill2CooldownRemaining = cooldownMs;
        state.phase = fate === "crater" ? 3 : 0;
        state.phaseElapsedMs = fate === "crater" ? 1450 : 0;
        state.resource = 0; state.secondaryResource = 0;
      }
    } else if (state.phase === 3) {
      state.phaseElapsedMs = Math.max(0, state.phaseElapsedMs - event.deltaMs);
      if (state.phaseElapsedMs === 0) state.phase = 0;
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

  if (runtime.gongfaId === "moonfall-tide-ritual" && (state.phase === 1 || state.phase === 2)) {
    const playerX = event.playerX ?? 0;
    const playerY = event.playerY ?? 0;
    const targets = event.targets ?? [];
    const heavy = learnedIds.includes("sea-suppressing-heavy-moon");
    const twin = learnedIds.includes("twin-moon-crossing");
    const swift = learnedIds.includes("swift-moon-vessel");
    const stillSea = learnedIds.includes("still-sea-syzygy");
    const myriad = learnedIds.includes("myriad-currents-to-moon");
    const mountain = learnedIds.includes("mountain-weight-eclipse");
    const returning = learnedIds.includes("returning-abyss-moon");
    const moonAnchors = state.anchors.filter((anchor) => anchor.kind === "moon");
    const orbiters = state.anchors.filter((anchor) => anchor.kind === "orbiter");
    state.phaseElapsedMs += event.deltaMs;
    const followRate = state.phase === 2 ? 0.00007 : heavy ? 0.000018 : swift ? 0.00028 : 0.000105;
    for (const moon of moonAnchors) {
      const blend = Math.min(1, event.deltaMs * followRate);
      moon.x += (playerX - moon.x) * blend;
      moon.y += (playerY - moon.y) * blend;
    }
    const radius = state.phase === 2 ? 245 : heavy ? 92 : swift ? 205 : twin ? 132 : 152;
    const maxOrbiters = state.phase === 2 ? 18 : twin ? 12 : 8;
    const targetById = new Map(targets.map((target) => [target.targetId, target]));
    const retained: typeof state.anchors = state.anchors.filter((anchor) => anchor.kind !== "orbiter");
    let escapedContribution = 0;
    for (const orbiter of orbiters) {
      const target = orbiter.targetId === undefined ? undefined : targetById.get(orbiter.targetId);
      if (!target || moonAnchors.length === 0) continue;
      const assigned = Math.min(moonAnchors.length - 1, Math.max(0, orbiter.chainId ?? 0));
      let moonIndex = assigned;
      if (twin) {
        moonIndex = moonAnchors.reduce((best, moon, index) =>
          distanceSquared(target.x, target.y, moon.x, moon.y) < distanceSquared(target.x, target.y, moonAnchors[best]!.x, moonAnchors[best]!.y) ? index : best, assigned);
      }
      const moon = moonAnchors[moonIndex]!;
      const distance = Math.sqrt(distanceSquared(target.x, target.y, moon.x, moon.y));
      const draggedTooFar = event.isMoving === true && distanceSquared(playerX, playerY, moon.x, moon.y) > (swift ? 350 : heavy ? 165 : 270) ** 2;
      if (distance > radius * 1.38 || draggedTooFar) {
        if (stillSea) escapedContribution += orbiter.value * 0.5;
        continue;
      }
      const angle = Math.atan2(target.y - moon.y, target.x - moon.x);
      const delta = orbiter.angle === undefined ? 0 : Math.abs(Math.atan2(Math.sin(angle - orbiter.angle), Math.cos(angle - orbiter.angle)));
      const rankWeight = mountain ? target.rank === "boss" ? 2.4 : target.rank === "elite" ? 1.6 : 0.28 : 1;
      const distinctWeight = myriad ? Math.min(1.35, 0.42 + orbiters.length * 0.12) : 1;
      orbiter.value += delta / (Math.PI * 2) * rankWeight * distinctWeight * (returning ? 0.62 : 1);
      orbiter.angle = angle;
      orbiter.chainId = moonIndex;
      retained.push(orbiter);
    }
    const existingIds = new Set(retained.filter((anchor) => anchor.kind === "orbiter").map((anchor) => anchor.targetId));
    if (state.phase !== 2) {
      const candidates = targets.map((target) => {
        const moonIndex = moonAnchors.reduce((best, moon, index) =>
          distanceSquared(target.x, target.y, moon.x, moon.y) < distanceSquared(target.x, target.y, moonAnchors[best]!.x, moonAnchors[best]!.y) ? index : best, 0);
        return { target, moonIndex, distance: moonAnchors[moonIndex] ? Math.sqrt(distanceSquared(target.x, target.y, moonAnchors[moonIndex]!.x, moonAnchors[moonIndex]!.y)) : Infinity };
      }).filter(({ target, distance }) => !existingIds.has(target.targetId) && distance <= radius)
        .sort((a, b) => a.distance - b.distance).slice(0, Math.max(0, maxOrbiters - existingIds.size));
      for (const { target, moonIndex } of candidates) retained.push({
        kind: "orbiter", x: target.x, y: target.y, value: 0, targetId: target.targetId,
        angle: Math.atan2(target.y - moonAnchors[moonIndex]!.y, target.x - moonAnchors[moonIndex]!.x), chainId: moonIndex
      });
    }
    state.anchors = retained;
    state.secondaryResource += escapedContribution;
    const liveOrbiters = state.anchors.filter((anchor) => anchor.kind === "orbiter");
    const rawSyzygy = liveOrbiters.reduce((sum, orbiter) => sum + orbiter.value, 0) + state.secondaryResource;
    const cap = stillSea ? 0.76 : 1;
    state.resource = Math.min(cap, rawSyzygy / (myriad ? 3.2 : mountain ? 2.8 : 2.4));
    state.charges = liveOrbiters.length;
    commands.push({
      kind: "authored-moon-orbit",
      moons: moonAnchors.map((moon) => ({ x: moon.x, y: moon.y, radius })),
      orbiters: liveOrbiters.filter((orbiter) => orbiter.targetId !== undefined).map((orbiter) => ({ targetId: orbiter.targetId!, moonIndex: orbiter.chainId ?? 0 })),
      tangentForce: state.phase === 2 ? 0 : heavy ? 105 : swift ? 145 : 125,
      inwardForce: state.phase === 2 ? 0 : heavy ? 105 : swift ? 24 : 54,
      suspend: state.phase === 2, sourceGongfaId: runtime.gongfaId
    });
    const duration = state.phase === 2 ? 1800 : 6200;
    if (state.phaseElapsedMs >= duration) {
      const primaryMoon = moonAnchors[0] ?? { x: playerX, y: playerY };
      const fate = state.phase === 2 ? "eclipse" as const : learnedIds.includes("flying-star-release") ? "release" as const :
        learnedIds.includes("grand-yin-suspension") ? "suspend" as const : "collapse" as const;
      const highSyzygy = state.resource >= cap * 0.72;
      if (state.phase === 1 && highSyzygy) state.cycleCount = Math.min(3, state.cycleCount + 1);
      commands.push({
        kind: "authored-moon-resolution", x: primaryMoon.x, y: primaryMoon.y,
        targetIds: liveOrbiters.flatMap((orbiter) => orbiter.targetId === undefined ? [] : [orbiter.targetId]), fate,
        damage: Math.max(1, Math.floor(runtime.combat.damage * (state.phase === 2 ? 2.2 : heavy ? 1.8 : swift ? 0.68 : twin ? 0.72 : 1.2) * (0.45 + state.resource))),
        force: state.phase === 2 ? 380 : heavy ? 440 : swift ? 150 : 290,
        syzygy: state.resource, supreme: state.phase === 2, sourceGongfaId: runtime.gongfaId
      });
      state.phase = 0; state.phaseElapsedMs = 0; state.resource = 0; state.secondaryResource = 0;
      state.charges = 0; state.anchors = [];
    }
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
    const refinedCapacity = state.maxCharges + (runtime.skill1Refinements?.countBonus ?? 0);
    const capacity = learnedIds.includes("life-seeking-fierce-wraith")
      ? Math.min(5, refinedCapacity)
      : learnedIds.includes("lantern-returning-underworld-attendant")
        ? refinedCapacity + 3
        : learnedIds.includes("long-banner-soul-call")
          ? Math.max(1, refinedCapacity - 2)
          : refinedCapacity;
    let storedCount = state.anchors.filter((anchor) => anchor.kind === "stored-soul").length;
    for (const anchor of state.anchors) {
      const inCollectionRange = distanceSquared(anchor.x, anchor.y, playerX, playerY) <= collectionRadius ** 2;
      const needsVigil = learnedIds.includes("halt-lantern-keep-vigil") &&
        anchor.kind === "corpse-soul" && anchor.value === 1;
      if (needsVigil && !inCollectionRange) {
        state.targetLedger[anchor.targetId ?? -1] = 0;
      } else if (needsVigil && inCollectionRange) {
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
          (learnedIds.includes("tread-corpse-guide-soul") ? 1.5 : 1) *
          (learnedIds.includes("lantern-returning-underworld-attendant") ? 1.45 : 1) *
          Math.pow(1.18, masteryEffectTiers(learnedIds, "surgeBuild"));
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
    const consumed = new Set<(typeof state.anchors)[number]>();
    const graveSwords = state.anchors.filter((anchor) => anchor.kind === "grave-sword");
    for (const anchor of state.anchors) {
      if (anchor.kind !== "grave-sword") {
        retained.push(anchor);
        continue;
      }
      if (consumed.has(anchor)) continue;
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
      const triggerGroup = learnedIds.includes("collective-burial-sword-mound")
        ? graveSwords.filter((grave) => !grave.sealed && distanceSquared(grave.x, grave.y, anchor.x, anchor.y) <= 120 ** 2)
        : learnedIds.includes("field-path-sword-forest")
          ? graveSwords.slice(graveSwords.indexOf(anchor), graveSwords.indexOf(anchor) + 3).filter((grave) => !grave.sealed)
          : [anchor];
      triggerGroup.forEach((grave, index) => {
        const nextGrave = learnedIds.includes("field-path-sword-forest") ? triggerGroup[index + 1] : undefined;
        const angle = nextGrave
          ? Math.atan2(nextGrave.y - grave.y, nextGrave.x - grave.x)
          : grave.angle ?? 0;
        commands.push({
          kind: "authored-line-strike",
          style: "grave-sword-rise",
          origin: { x: grave.x, y: grave.y },
          angle,
          graveLaw: learnedIds.includes("collective-burial-sword-mound") ? "mound" :
            learnedIds.includes("field-path-sword-forest") ? "forest" :
              learnedIds.includes("lone-grave-great-que") && grave.value > 1 ? "great-que" : "recorded",
          damage: runtime.combat.damage * grave.value *
            (learnedIds.includes("recognize-calamity-leave-sheath") ? 1.35 :
              learnedIds.includes("seal-grave-treading-stars") ? 0.72 : 1),
          width: learnedIds.includes("lone-grave-great-que") && grave.value > 1 ? Math.max(28, runtime.combat.auraRadius * 0.58) : Math.max(18, runtime.combat.auraRadius * 0.42),
          length: learnedIds.includes("lone-grave-great-que") && grave.value > 1 ? Math.max(390, runtime.combat.range * 1.35) : Math.max(260, runtime.combat.range),
          sourceGongfaId: runtime.gongfaId
        });
        consumed.add(grave);
      });
    }
    state.anchors = retained.filter((anchor) => !consumed.has(anchor));
    state.charges = state.anchors.filter((anchor) => anchor.kind === "grave-sword").length;
    state.resource = state.charges / Math.max(1, state.maxCharges);
  }

  if (runtime.gongfaId === "frozen-river-formation") {
    const targets = event.targets ?? [];
    if (state.phase === 3) {
      state.phaseElapsedMs = Math.max(0, state.phaseElapsedMs - event.deltaMs);
      const nodes = state.anchors
        .filter((anchor) => anchor.kind === "seal" && anchor.sealRole === "origin" && anchor.targetId !== undefined)
        .sort((a, b) => (a.chainId ?? 0) - (b.chainId ?? 0));
      const liveNodes = nodes.filter((anchor) => targets.some((target) => target.targetId === anchor.targetId));
      const fate = learnedIds.includes("collective-liability")
        ? "collective-liability" as const
        : learnedIds.includes("compensating-ferry")
          ? "compensating-ferry" as const
          : "shared-cold" as const;
      for (const node of liveNodes) {
        const target = targets.find((candidate) => candidate.targetId === node.targetId)!;
        const cooldownKey = 1_000_000 + target.targetId;
        state.targetLedger[cooldownKey] = Math.max(0, (state.targetLedger[cooldownKey] ?? 0) - event.deltaMs);
        if ((state.targetLedger[cooldownKey] ?? 0) === 0 && liveNodes.length >= 3) {
          for (let edgeIndex = 0; edgeIndex < liveNodes.length; edgeIndex += 1) {
            const lineFrom = liveNodes[edgeIndex]!;
            const lineTo = liveNodes[(edgeIndex + 1) % liveNodes.length]!;
            if (lineFrom === node || lineTo === node) continue;
            if (!movementCrossesLine(node, target, lineFrom, lineTo)) continue;
            const allTargetIds = liveNodes.flatMap((candidate) =>
              candidate.targetId === undefined ? [] : [candidate.targetId]
            );
            commands.push({
              kind: "authored-frozen-river-resolution",
              edge: { from: { x: lineFrom.x, y: lineFrom.y }, to: { x: lineTo.x, y: lineTo.y } },
              targetIds: fate === "compensating-ferry" ? [target.targetId] : allTargetIds,
              damagePool: state.targetLedger[-201] ?? runtime.combat.damage,
              width: state.targetLedger[-202] ?? 44,
              slowMultiplier: fate === "shared-cold" ? 0.05 : fate === "collective-liability" ? 0.64 : 0.72,
              slowDurationMs: fate === "shared-cold" ? 1200 : fate === "collective-liability" ? 650 : 500,
              hardFreezeOrdinary: fate === "shared-cold",
              bossDamageScale: fate === "compensating-ferry" ? 0.35 : fate === "shared-cold" ? 0.55 : 1,
              fate,
              sourceGongfaId: runtime.gongfaId
            });
            state.targetLedger[cooldownKey] = 900;
            break;
          }
        }
        node.x = target.x;
        node.y = target.y;
      }
      state.anchors = state.anchors.filter((anchor) =>
        anchor.kind !== "seal" || anchor.sealRole !== "origin" || liveNodes.includes(anchor)
      );
      state.charges = liveNodes.length;
      state.resource = Math.max(0, state.phaseElapsedMs / Math.max(1, state.targetLedger[-203] ?? 6500));
      if (state.phaseElapsedMs === 0 || liveNodes.length < 2) {
        state.anchors = state.anchors.filter((anchor) => anchor.kind !== "seal");
        state.phase = 0;
        state.phaseElapsedMs = 0;
        state.cycleCount = 0;
        state.charges = 0;
        state.resource = 0;
        for (const key of Object.keys(state.targetLedger).map(Number).filter((key) => key >= 1_000_000 || (key <= -201 && key >= -203))) {
          delete state.targetLedger[key];
        }
      }
      return;
    }
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
        const candidates = targets.filter((target) =>
          !occupied.has(target.targetId) &&
          (!learnedIds.includes("strong-seed-chooses-its-host") ||
            target.rank === "elite" || target.rank === "boss" || target.healthRatio >= 0.75)
        );
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
      infection.value += event.deltaMs * Math.pow(1.18, masteryEffectTiers(learnedIds, "surgeBuild"));
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
          radius: branchRoot && stage === 2 ? Math.max(115, runtime.combat.auraRadius + 25) : coilingRoot ? 34 : 48,
          maxSplashTargets: branchRoot && stage === 2 ? 3 + (runtime.skill1Refinements?.countBonus ?? 0) : 0,
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
    runtime.gongfaId !== "verdant-ring-scripture" &&
    runtime.gongfaId !== "ice-mirror-guard" &&
    runtime.gongfaId !== "ironwood-wave-form" &&
    runtime.gongfaId !== "flame-demon-body-art" &&
    runtime.gongfaId !== "mist-wraith-canon" &&
    runtime.gongfaId !== "frozen-river-formation" &&
    runtime.gongfaId !== "sword-burial-formation" &&
    runtime.gongfaId !== "thousand-root-formation" &&
    runtime.gongfaId !== "blazing-feather-art" &&
    runtime.gongfaId !== "drifting-frost-needle" &&
    runtime.gongfaId !== "jinfeng-gong" &&
    runtime.gongfaId !== "green-vine-art" &&
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

  if (event.kind === "authored-asura-transform") {
    if (
      next.gongfaId === "flame-demon-body-art" &&
      next.authored.phase === 0 &&
      event.healthRatio < 0.2 &&
      next.mastery.masterySkill2Id === "asura-conflagration" &&
      next.mastery.masterySkill2CooldownRemaining === 0
    ) {
      const choice = event.learnedMasteryIds.includes("undying-asura")
        ? "undying-asura" as const
        : event.learnedMasteryIds.includes("world-burning-asura")
          ? "world-burning-asura" as const
          : event.learnedMasteryIds.includes("life-hunting-asura")
            ? "life-hunting-asura" as const
            : undefined;
      if (choice) {
        const skill2Stats = skill2RefinementStats(next);
        const cooldownMs = Math.floor(authoredSkill2Plans["asura-conflagration"].cooldownMs * skill2Stats.cadenceScale);
        next.authored.phase = 1;
        next.authored.activationCount += 1;
        next.mastery.masterySkill2CooldownRemaining = cooldownMs;
        commands.push({
          kind: "authored-asura-transformation",
          choice,
          recoveryCeiling: choice === "undying-asura" ? 0.3 : choice === "world-burning-asura" ? 0.15 : 0.25,
          sourceGongfaId: next.gongfaId,
          masteryCast: { skill2Id: "asura-conflagration", cooldownMs }
        });
      }
    }
    return { runtime: next, commands };
  }

  if (
    event.kind === "tick" &&
    event.skill2Enabled !== false &&
    next.mastery.masterySkill2Id &&
    next.gongfaId !== "ironwood-wave-form" &&
    next.gongfaId !== "crimson-furnace-sword-art" &&
    next.gongfaId !== "heavenfall-body-art" &&
    next.gongfaId !== "ancient-tree-body-art" &&
    next.gongfaId !== "flame-demon-body-art"
    && next.gongfaId !== "yujian-jue"
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
    // Accepted only so old in-flight checkpoint events can drain harmlessly.
    // Authored Yujian uses direct physical-route commands, never hit stacks.
    return { runtime: next, commands };
  }

  if (event.kind === "yujian-reversal-spawned") {
    if (next.yujian) {
      next.yujian.reversingSwordPathTriggers += 1;
    }
    return { runtime: next, commands };
  }

  if (event.kind === "skill2") {
    if (event.skill2Id === "feather-rain-formation" && next.gongfaId === "blazing-feather-art") {
      // Phoenix Horizon is earned and fired by an ideal-range magazine; a
      // timer may ready it, but may never substitute the old feather rain.
      return { runtime: next, commands };
    }
    if (event.skill2Id === "mirror-needle-constellation" && next.gongfaId === "drifting-frost-needle") {
      // Reverse Winter Thread fires immediately from the fifth recorded point.
      return { runtime: next, commands };
    }
    if (event.skill2Id === "ironwood-surge-form" && next.gongfaId === "ironwood-wave-form") {
      // Ironwood Citadel is not a timed button-like cast. The rampart state
      // raises it only after three recorded high-Stability drives.
      return { runtime: next, commands };
    }
    if (event.skill2Id === "furnace-cascade" && next.gongfaId === "crimson-furnace-sword-art") {
      // Furnace Cascade is earned from the visible live topology and is
      // triggered by the tick that proves enough nodes and Pressure.
      return { runtime: next, commands };
    }
    const skill2Stats = skill2RefinementStats(next);
    const skill2Base = skill2Combat(next);
    if (event.skill2Id === "frozen-lotus-shell" && next.gongfaId === "ice-mirror-guard") {
      const learnedIds = event.learnedMasteryIds ?? [];
      const facets = ensureIceMirrorFacets(next, learnedIds);
      const intact = facets.filter((facet) => facet.value > 0);
      const flawless = learnedIds.includes("flawless-lotus");
      const broken = learnedIds.includes("calamity-answering-broken-lotus");
      const killing = learnedIds.includes("killing-shattered-mirror");
      const minimum = flawless ? facets.length : broken ? 3 : 4;
      const danger = (event.nearbyEnemyCount ?? 0) > 0;
      if (danger && intact.length >= minimum && next.authored.phase !== 2) {
        const durationMs = flawless ? 2200 : broken
          ? Math.max(700, intact.length * 260)
          : killing ? 620 : 1400;
        next.authored.phase = 2;
        next.authored.phaseElapsedMs = 0;
        next.authored.targetLedger[-112] = durationMs;
        next.authored.cycleCount = 0;
        for (const key of Object.keys(next.authored.targetLedger).map(Number).filter((key) => key <= -200)) {
          delete next.authored.targetLedger[key];
        }
        for (const facet of intact) facet.participating = true;
        commands.push(mirrorFacetCommand(next, learnedIds, {
          skill2Id: "frozen-lotus-shell",
          cooldownMs: Math.floor(authoredSkill2Plans["frozen-lotus-shell"].cooldownMs * skill2Stats.cadenceScale)
        }));
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "solar-flare-cycle" && next.burningRing) {
      const closeDanger = (event.nearbyEnemyCount ?? 0) > 0;
      if (next.burningRing.heat >= 99.5 && closeDanger && next.burningRing.guardRemaining <= 0) {
        next.burningRing.guardRemaining = 1250;
        next.burningRing.solarFlareCasts += 1;
        commands.push({
          kind: "authored-burning-corona",
          rotation: next.burningRing.rotation,
          rings: [{
            radius: 108, direction: next.burningRing.rotationDirection,
            segmentCount: 12, visibleSegments: 12, arcFraction: 0.94,
            damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale * 0.7))
          }],
          guard: true, sunspotLure: false, pushStrength: 300,
          sourceGongfaId: next.gongfaId,
          masteryCast: {
            skill2Id: "solar-flare-cycle",
            cooldownMs: Math.floor(authoredSkill2Plans["solar-flare-cycle"].cooldownMs * skill2Stats.cadenceScale)
          }
        });
      }
      return { runtime: next, commands };
    }
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
    if (event.skill2Id === "moonfall-cataclysm" && next.gongfaId === "moonfall-tide-ritual") {
      const targets = event.targets ?? [];
      if (next.authored.phase === 0 && next.authored.cycleCount >= 3 && targets.length > 0) {
        const center = targets.reduce((sum, target) => ({ x: sum.x + target.x, y: sum.y + target.y }), { x: 0, y: 0 });
        center.x /= targets.length; center.y /= targets.length;
        next.authored.phase = 2; next.authored.phaseElapsedMs = 0;
        next.authored.resource = 1; next.authored.secondaryResource = 0; next.authored.cycleCount = 0;
        next.authored.anchors = [
          { kind: "moon", x: center.x, y: center.y, value: 2, chainId: 0 },
          ...targets.slice(0, 18).map((target) => ({
            kind: "orbiter" as const, x: target.x, y: target.y, value: 1,
            targetId: target.targetId, angle: Math.atan2(target.y - center.y, target.x - center.x), chainId: 0
          }))
        ];
        const cooldownMs = Math.floor(authoredSkill2Plans["moonfall-cataclysm"].cooldownMs * skill2Stats.cadenceScale);
        next.mastery.masterySkill2CooldownRemaining = cooldownMs;
        commands.push({
          kind: "authored-moon-orbit", moons: [{ x: center.x, y: center.y, radius: 245 }],
          orbiters: targets.slice(0, 18).map((target) => ({ targetId: target.targetId, moonIndex: 0 })),
          tangentForce: 0, inwardForce: 0, suspend: true, sourceGongfaId: next.gongfaId,
          masteryCast: { skill2Id: "moonfall-cataclysm", cooldownMs }
        });
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "sprout-sun-circle" && next.gongfaId === "verdant-ring-scripture") {
      const queue = next.authored.anchors.flatMap((anchor) => anchor.kind === "glyph" && anchor.glyph ? [anchor.glyph] : []);
      if (next.authored.phase === 2 && queue.join(",") === "root,leaf,thorn") {
        const cooldownMs = Math.floor(authoredSkill2Plans["sprout-sun-circle"].cooldownMs * skill2Stats.cadenceScale);
        const origin = next.authored.anchors[2] ?? { x: 0, y: 0 };
        commands.push({
          kind: "authored-sprout-sun", x: origin.x, y: origin.y,
          radius: 225 + skill2Stats.coverage * 18,
          rootDamage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale * 0.42)),
          leafDamage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale * 0.68)),
          thornDamage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale * 2.1)),
          phaseDelayMs: 620, sourceGongfaId: next.gongfaId,
          masteryCast: { skill2Id: "sprout-sun-circle", cooldownMs }
        });
        next.authored.phase = 0; next.authored.anchors = []; next.authored.charges = 0; next.authored.resource = 0;
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
      // This capstone is committed and resolved by the movement-driven authored state machine.
      // A generic timed Skill 2 event must never bypass its rise, steering, or landing warning.
      return { runtime: next, commands };
    }
    if (event.skill2Id === "world-tree-incarnation" && next.gongfaId === "ancient-tree-body-art") {
      // World Tree is earned by remaining rooted at full rings. A generic timed
      // Skill 2 event must not bypass the visible hold or its immobility cost.
      return { runtime: next, commands };
    }
    if (event.skill2Id === "asura-conflagration" && next.gongfaId === "flame-demon-body-art") {
      // Asura Heart is earned only when the low-health full combination lands.
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
        anchor.kind === "companion" && ["guard", "phoenix"].includes(anchor.companionState ?? "guard")
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
        const nurtured = learnedIds.includes("nurtured-covenant");
        const eggHealth = truePlume ? 1.4 : urgent ? 0.48 : 0.62;
        commands.push({
          kind: "authored-vermilion-flight",
          from: { x: bird.x, y: bird.y },
          waypoints: [{ x: target.x, y: target.y, targetId: target.targetId }],
          damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale *
            (truePlume ? 3.5 : urgent ? 2.4 : 3.1) * (nurtured ? 0.72 : 1))),
          width: 58 + skill2Stats.coverage * 8,
          maxHits: 4 + skill2Stats.coverage,
          terminal: true,
          flightStyle: "rebirth",
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
      if (next.authored.phase !== 3 && next.authored.cycleCount >= 3 && nodes.length >= 3) {
        const learnedIds = event.learnedMasteryIds;
        const fate = learnedIds.includes("collective-liability")
          ? "collective-liability" as const
          : learnedIds.includes("compensating-ferry")
            ? "compensating-ferry" as const
            : "shared-cold" as const;
        commands.push({
          kind: "authored-frozen-river-network",
          nodes,
          width: 44 + skill2Stats.coverage * 4,
          durationMs: fate === "compensating-ferry" ? 7200 : 6500,
          fate,
          sourceGongfaId: next.gongfaId,
          masteryCast: {
            skill2Id: "frozen-river-prison",
            cooldownMs: Math.floor(authoredSkill2Plans["frozen-river-prison"].cooldownMs * skill2Stats.cadenceScale)
          }
        });
        const nodeById = new Map(nodes.map((node) => [node.targetId, node]));
        next.authored.anchors = next.authored.anchors.filter((anchor) => {
          if (anchor.kind !== "seal") return true;
          if (anchor.sealRole !== "origin" || anchor.targetId === undefined) return false;
          const node = nodeById.get(anchor.targetId);
          if (!node) return false;
          anchor.x = node.x;
          anchor.y = node.y;
          anchor.remainingMs = undefined;
          return true;
        });
        const durationMs = fate === "compensating-ferry" ? 7200 : 6500;
        next.authored.phase = 3;
        next.authored.phaseElapsedMs = durationMs;
        next.authored.targetLedger[-201] = Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale *
          (fate === "shared-cold" ? 0.42 : fate === "compensating-ferry" ? 0.68 : 1.35)));
        next.authored.targetLedger[-202] = 44 + skill2Stats.coverage * 4;
        next.authored.targetLedger[-203] = durationMs;
        next.authored.charges = nodes.length;
        next.authored.resource = 1;
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
          ...(fate === "one-heart" ? { focusTargetId: strongestHost.targetId } : {}),
          damage: Math.max(1, Math.floor(skill2Base.damage * skill2Stats.damageScale *
            (fate === "one-heart" ? 1.65 : fate === "wither-seed" ? 0.48 : 0.9))),
          radius: Math.max(82 + skill2Stats.coverage * 8, skill2Base.auraRadius),
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
      if (storedSouls.length >= 4) {
        const learnedIds = event.learnedMasteryIds;
        const converges = learnedIds.includes("myriad-souls-ask-for-life");
        const funeral = learnedIds.includes("nether-river-funeral");
        const targets = event.targets ?? [];
        const strongest = [...targets].sort((a, b) => {
          const rank = (target: AuthoredTargetFact): number => target.rank === "boss" ? 3 : target.rank === "elite" ? 2 : 1;
          return rank(b) * 10 + b.healthRatio - rank(a) * 10 - a.healthRatio;
        })[0];
        const candidateAngles = [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4];
        const angle = candidateAngles.sort((a, b) => {
          const spreadFor = (candidate: number): number => {
            const projections = targets.map((target) => -Math.sin(candidate) * target.x + Math.cos(candidate) * target.y);
            return projections.length > 0 ? Math.max(...projections) - Math.min(...projections) : 0;
          };
          return spreadFor(a) - spreadFor(b);
        })[0] ?? 0;
        const dirX = Math.cos(angle); const dirY = Math.sin(angle);
        const normalX = -dirY; const normalY = dirX;
        const boundaryEndpoints = (offset: number): [{ x: number; y: number }, { x: number; y: number }] => {
          const centerX = normalX * offset; const centerY = normalY * offset;
          const candidates: Array<{ x: number; y: number; t: number }> = [];
          if (Math.abs(dirX) > 0.001) {
            for (const x of [-1050, 1050]) {
              const t = (x - centerX) / dirX; const y = centerY + dirY * t;
              if (Math.abs(y) <= 690.01) candidates.push({ x, y, t });
            }
          }
          if (Math.abs(dirY) > 0.001) {
            for (const y of [-690, 690]) {
              const t = (y - centerY) / dirY; const x = centerX + dirX * t;
              if (Math.abs(x) <= 1050.01) candidates.push({ x, y, t });
            }
          }
          candidates.sort((a, b) => a.t - b.t);
          const first = candidates[0] ?? { x: centerX - dirX * 1050, y: centerY - dirY * 1050 };
          const last = candidates[candidates.length - 1] ?? { x: centerX + dirX * 1050, y: centerY + dirY * 1050 };
          return [{ x: first.x, y: first.y }, { x: last.x, y: last.y }];
        };
        const projectedTargets = targets.map((target) => ({
          target,
          offset: normalX * target.x + normalY * target.y
        })).sort((a, b) => a.offset - b.offset);
        const claimedTargets = new Set<number>();
        const routes = storedSouls.map((soul, index) => {
          const quantile = projectedTargets.length > 0
            ? projectedTargets[Math.min(projectedTargets.length - 1, Math.floor((index + 0.5) / storedSouls.length * projectedTargets.length))]!.offset
            : (index - (storedSouls.length - 1) / 2) * 54;
          const boundaryOffset = (index - (storedSouls.length - 1) / 2) * 42;
          const [laneFrom, laneTo] = boundaryEndpoints(converges ? boundaryOffset : quantile);
          const from = laneFrom;
          const to = converges && strongest
            ? { x: strongest.x, y: strongest.y }
            : laneTo;
          const width = 24 + soul.value * 10 + skill2Stats.coverage * 3;
          const targetIds = converges && strongest
            ? [strongest.targetId]
            : projectedTargets.flatMap(({ target, offset }) => {
                if (claimedTargets.has(target.targetId) || Math.abs(offset - quantile) > width / 2 + 14) return [];
                claimedTargets.add(target.targetId);
                return [target.targetId];
              });
          return {
            from, to, targetIds,
            damage: Math.max(1, Math.floor(skill2Base.damage * soul.value * skill2Stats.damageScale * (funeral ? 0.38 : 1))),
            width, rankPower: soul.value
          };
        });
        commands.push({
          kind: "authored-ghost-procession",
          routes,
          fate: converges ? "converge" : funeral ? "funeral" : "parallel",
          slowMultiplier: funeral ? 0.32 : 0.65,
          slowDurationMs: funeral ? 3000 : 700,
          sourceGongfaId: next.gongfaId,
          masteryCast: {
            skill2Id: "hundred-ghost-procession",
            cooldownMs: Math.floor(authoredSkill2Plans["hundred-ghost-procession"].cooldownMs * skill2Stats.cadenceScale)
          }
        });
        next.authored.anchors = next.authored.anchors.filter((anchor) => anchor.kind !== "stored-soul");
        next.authored.charges = 0;
        next.authored.resource = 0;
      }
      return { runtime: next, commands };
    }
    if (event.skill2Id === "ten-thousand-sword-tomb" && next.gongfaId === "sword-burial-formation") {
      const graves = next.authored.anchors.filter((anchor) => anchor.kind === "grave-sword");
      if (graves.length >= next.authored.maxCharges) {
        const learnedIds = event.learnedMasteryIds;
        const asksLeader = learnedIds.includes("myriad-edges-ask-the-leader");
        const oldRoads = learnedIds.includes("old-roads-return-the-soul");
        const strongest = [...(event.targets ?? [])].sort((a, b) => {
          const rank = (target: AuthoredTargetFact): number => target.rank === "boss" ? 3 : target.rank === "elite" ? 2 : 1;
          return rank(b) * 10 + b.healthRatio - (rank(a) * 10 + a.healthRatio);
        })[0];
        graves.forEach((grave, index) => {
          const oldRoadAngle = Math.atan2(
            (grave.originPlayerY ?? grave.y) - grave.y,
            (grave.originPlayerX ?? grave.x) - grave.x
          );
          commands.push({
            kind: "authored-line-strike",
            style: "grave-sword-rise",
            origin: { x: grave.x, y: grave.y },
            angle: asksLeader && strongest
              ? Math.atan2(strongest.y - grave.y, strongest.x - grave.x)
              : oldRoads ? oldRoadAngle : grave.angle ?? 0,
            graveLaw: asksLeader ? "leader" : oldRoads ? "old-road" : "recorded",
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
    // Burning Ring Heat is maintained by distinct bodies in its danger band;
    // repeated projectile/segment hits never generate Heat.
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
    return { runtime: next, commands };
  }

  if (event.kind === "evade") {
    const evadeLearnedIds = event.learnedMasteryIds ?? next.mastery.masteryLearnedIds;
    if (next.gongfaId === "ice-mirror-guard") {
      const learnedIds = event.learnedMasteryIds ?? [];
      const facets = ensureIceMirrorFacets(next, learnedIds);
      if (learnedIds.includes("flowing-light-mirrors")) {
        next.authored.targetLedger[-114] = (next.authored.targetLedger[-114] ?? 1) * -1;
      }
      if ((event.nearbyEnemyCount ?? 0) > 0 && next.authored.phase !== 2) {
        const repairs = learnedIds.includes("ice-heart-repair") ? 2 : 1;
        const damaged = facets
          .filter((facet) => facet.value < (facet.maxValue ?? 1))
          .sort((a, b) => a.value - b.value || (a.chainId ?? 0) - (b.chainId ?? 0));
        for (const facet of damaged.slice(0, repairs)) {
          facet.value = Math.min(facet.maxValue ?? 1, facet.value + 1);
          facet.sealed = false;
          delete facet.originPlayerX;
        }
        if (learnedIds.includes("ice-heart-repair") && damaged.length > 0) {
          next.authored.targetLedger[-115] = 1;
        }
        ensureIceMirrorFacets(next, learnedIds);
        commands.push(mirrorFacetCommand(next, learnedIds));
      }
    }
    if (next.gongfaId === "yujian-jue" && evadeLearnedIds.includes("swordborne-steps")) {
      for (const sword of next.authored.anchors.filter((anchor) => anchor.kind === "sword")) {
        sword.remainingMs = Math.max(120, (sword.remainingMs ?? 0) * 0.88);
      }
    }
    if (next.burningRing && event.learnedMasteryIds.includes("ember-step")) {
      next.burningRing.rotation += Math.PI / 3;
    }
    if (next.gengjin && event.learnedMasteryIds.includes("flowing-gold-turn") && next.gengjin.guardValue > 0) {
      const vented = Math.max(1, Math.floor(next.gengjin.guardValue * 0.4));
      next.gengjin.guardValue -= vented;
      next.gengjin.postEvadeGuard = vented;
      next.gengjin.postEvadeLayerRemaining = 1000;
      commands.push(gengjinBraceCommand(next));
    }
    // Void-Step Recall bends every live physical route home; it creates no
    // extra ammunition and therefore cannot become another projectile proc.
    if (next.gongfaId === "yujian-jue" && evadeLearnedIds.includes("void-step-recall")) {
      const swords = next.authored.anchors.filter((anchor) => anchor.kind === "sword");
      if (swords.length > 0) {
        commands.push({
          kind: "authored-myriad-swords-return",
          routes: swords.map((sword) => ({
            swordId: sword.value,
            points: sword.routePoints?.length
              ? [...sword.routePoints].reverse()
              : [{ x: sword.x, y: sword.y }, {
                  x: event.playerX ?? sword.originPlayerX ?? 0,
                  y: event.playerY ?? sword.originPlayerY ?? 0
                }],
            targetId: sword.targetId
          })),
          targetIds: [], damage: 0, intersectionDamage: 0, sourceGongfaId: next.gongfaId
        });
        swords.forEach((sword) => { sword.remainingMs = 220; sword.maxValue = 220; });
      }
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
    // Reverse-Wheel Reflection changes the existing corona; it never spawns
    // an attack at the Evade origin.
    if (next.burningRing && event.learnedMasteryIds.includes("reverse-wheel-reflection") && next.burningRing.heat >= 18) {
      next.burningRing.rotationDirection = next.burningRing.rotationDirection === 1 ? -1 : 1;
      next.burningRing.heat -= 18;
      syncBurningRingCombat(next);
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

    return { runtime: next, commands };
  }

  if (event.kind === "incoming-damage") {
    if (next.gongfaId === "ice-mirror-guard") {
      const learnedIds = event.learnedMasteryIds ?? [];
      const facets = ensureIceMirrorFacets(next, learnedIds);
      if (next.authored.phase === 2) {
        if (event.incomingAngle !== undefined) {
          const recordIndex = Math.min(11, next.authored.cycleCount);
          next.authored.targetLedger[-200 - recordIndex] = event.incomingAngle;
          next.authored.cycleCount = Math.min(12, next.authored.cycleCount + 1);
        }
        commands.push({ kind: "incoming-damage", finalDamage: 0 });
        return { runtime: next, commands };
      }
      if (event.incomingAngle === undefined) {
        commands.push({ kind: "incoming-damage", finalDamage: Math.max(1, Math.floor(event.amount)) });
        return { runtime: next, commands };
      }
      const incomingAngle = event.incomingAngle;
      const form = iceMirrorForm(learnedIds);
      const rotation = next.authored.targetLedger[-110] ?? 0;
      const facet = facets.find((candidate) => candidate.value > 0 &&
        angularDistance(incomingAngle, (candidate.angle ?? 0) + rotation) <= form.arcWidth / 2
      );
      if (facet?.value && facet.value > 0) {
        facet.value -= 1;
        let shardsPerAngle = 1;
        if (facet.value === 0) {
          facet.sealed = learnedIds.includes("lingering-reflection");
          if (facet.sealed) facet.originPlayerX = incomingAngle;
          if (learnedIds.includes("shattered-mirror-frost")) shardsPerAngle = 3;
        }
        const weakNext = (next.authored.targetLedger[-115] ?? 0) > 0;
        next.authored.targetLedger[-115] = 0;
        const damageScale = form.reflectionScale * (weakNext ? 0.5 : 1);
        ensureIceMirrorFacets(next, learnedIds);
        commands.push({
          kind: "authored-mirror-reflection",
          angles: [incomingAngle],
          damage: Math.max(1, Math.floor(next.combat.damage * damageScale)),
          shardsPerAngle,
          range: 420,
          width: 34,
          sourceGongfaId: next.gongfaId
        });
        commands.push({ kind: "incoming-damage", finalDamage: 0 });
        return { runtime: next, commands };
      }
      const lingeringFacet = facets.find((candidate) => candidate.sealed &&
        angularDistance(incomingAngle, candidate.originPlayerX ?? Number.POSITIVE_INFINITY) <= form.arcWidth / 2
      );
      if (lingeringFacet && learnedIds.includes("lingering-reflection")) {
        lingeringFacet.sealed = false;
        delete lingeringFacet.originPlayerX;
        commands.push({
          kind: "authored-mirror-reflection",
          angles: [incomingAngle],
          damage: Math.max(1, Math.floor(next.combat.damage * 0.35)),
          shardsPerAngle: 1,
          range: 320,
          width: 28,
          sourceGongfaId: next.gongfaId
        });
        commands.push({ kind: "incoming-damage", finalDamage: Math.max(1, Math.floor(event.amount * 0.5)) });
        return { runtime: next, commands };
      }
      commands.push({ kind: "incoming-damage", finalDamage: Math.max(1, Math.floor(event.amount)) });
      return { runtime: next, commands };
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

    if (next.gongfaId === "myriad-beast-grove") {
      const living = next.authored.anchors.filter((anchor) => anchor.kind === "beast" && anchor.beastState === "living");
      const tortoise = living.find((beast) => beast.beastForm === "black-tortoise");
      const deer = living.find((beast) => beast.beastSpecies === "deer" && beast.beastForm !== "white-ape");
      const ancestralGuard = (next.authored.targetLedger[-45] ?? 0) > 0;
      const closeThreat = event.sourceDistance === undefined || event.sourceDistance <= 180;
      const protector = closeThreat ? tortoise ?? deer : undefined;
      const mitigation = ancestralGuard ? 0.45 : tortoise && protector ? 0.3 : deer && protector ? 0.14 : 0;
      if (mitigation > 0) {
        const finalDamage = Math.max(1, Math.floor(event.amount * (1 - mitigation)));
        if (protector && !ancestralGuard) {
          const prevented = Math.max(0, event.amount - finalDamage);
          protector.value = Math.max(0, protector.value - prevented * (tortoise ? 0.006 : 0.01));
          if (protector.value === 0) {
            protector.beastState = "downed";
            protector.rebirthMs = 6000;
            protector.targetId = undefined;
          }
        }
        commands.push({ kind: "incoming-damage", finalDamage });
        return { runtime: next, commands };
      }
    }

    if (next.gongfaId === "ancient-tree-body-art" &&
      event.learnedMasteryIds.includes("hollow-trunk-tribulation") &&
      next.authored.charges > 0 &&
      (event.currentHealth !== undefined
        ? event.amount >= event.currentHealth
        : (event.healthRatio ?? 1) <= 0.12)) {
      next.authored.charges -= 1;
      next.authored.resource = next.authored.charges / Math.max(1, next.authored.maxCharges);
      next.authored.secondaryResource = 0;
      next.authored.targetLedger[-64] = (next.authored.targetLedger[-64] ?? 0) + 1;
      commands.push({ kind: "incoming-damage", finalDamage: 0 });
      return { runtime: next, commands };
    }

    if (next.burningRing?.guardRemaining && next.burningRing.guardRemaining > 0) {
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

    let remainingAmount = Math.max(0, Math.floor(event.amount));
    if (state.shieldRemaining > 0 && state.shieldValue > 0) {
      const absorbed = Math.min(state.shieldValue, remainingAmount);
      state.shieldValue -= absorbed;
      remainingAmount -= absorbed;
    }
    const closeSource = event.sourceDistance !== undefined && event.sourceDistance <= GENGJIN_CLOSE_RANGE;
    if (!closeSource || remainingAmount <= 0) {
      commands.push({ kind: "incoming-damage", finalDamage: remainingAmount });
      commands.push(gengjinBraceCommand(next));
      return { runtime: next, commands };
    }

    const learnedIds = event.learnedMasteryIds ?? [];
    if (learnedIds.includes("armor-remembers-enemy") && event.sourceId !== undefined) {
      if (state.rememberedSourceId === event.sourceId) state.rememberedHits += 1;
      else {
        state.rememberedSourceId = event.sourceId;
        state.rememberedHits = 1;
      }
    }
    const braceMitigation = gengjinMitigation(state, learnedIds, event.sourceId, false);
    const layerMitigation = state.postEvadeLayerRemaining > 0 && state.postEvadeGuard > 0
      ? Math.min(0.18, state.postEvadeGuard / Math.max(1, remainingAmount))
      : 0;
    state.guardMitigation = Math.min(0.68, braceMitigation + layerMitigation);
    const finalDamage = Math.max(1, Math.floor(remainingAmount * (1 - state.guardMitigation)));
    const prevented = Math.max(0, remainingAmount - finalDamage);
    const braceFinalDamage = Math.max(1, Math.floor(remainingAmount * (1 - braceMitigation)));
    const layerPrevented = Math.max(0, braceFinalDamage - finalDamage);
    state.postEvadeGuard = Math.max(0, state.postEvadeGuard - layerPrevented);
    if (state.postEvadeGuard === 0) state.postEvadeLayerRemaining = 0;
    let stored = Math.max(0, prevented - layerPrevented);
    if (learnedIds.includes("rebounding-edge-armor") && prevented > 0) {
      const reflected = Math.max(1, Math.floor(prevented * 0.35));
      stored = Math.floor(prevented * 0.65);
      if (event.sourceId !== undefined) commands.push({
        kind: "authored-gengjin-reflection",
        targetId: event.sourceId,
        amount: reflected,
        sourceGongfaId: next.gongfaId
      });
    }
    if (learnedIds.includes("armor-remembers-enemy")) stored = Math.floor(stored * 0.78);
    state.guardCapacity = gengjinCapacity(state, learnedIds);
    const proposed = state.guardValue + stored;
    if (proposed > state.guardCapacity) {
      if (learnedIds.includes("flowing-gold-vent")) {
        state.guardValue = state.guardCapacity;
      } else {
        state.fractureCount = Math.min(3, state.fractureCount + 1);
        state.fractureRecoveryRemaining = learnedIds.includes("hundred-forged-heavy-armor") ? 6500 : 4200;
        state.mitigationDisabledRemaining = learnedIds.includes("hundred-forged-heavy-armor") ? 4200 : 2800;
        state.guardValue = Math.floor(state.guardCapacity * 0.35);
      }
    } else {
      state.guardValue = proposed;
    }
    state.bladeShellCharge = state.guardValue;
    commands.push({ kind: "incoming-damage", finalDamage });
    commands.push(gengjinBraceCommand(next));
    return { runtime: next, commands };
  }

  const deltaSeconds = Math.max(0, event.deltaMs) / 1000;

  if (next.gongfaId === "ice-mirror-guard") {
    const learnedIds = event.learnedMasteryIds ?? [];
    const facets = ensureIceMirrorFacets(next, learnedIds);
    const form = iceMirrorForm(learnedIds);
    const direction = next.authored.targetLedger[-114] ?? 1;
    next.authored.targetLedger[-110] =
      (next.authored.targetLedger[-110] ?? 0) + direction * form.rotationSpeed * deltaSeconds;

    if (next.authored.phase === 2) {
      next.authored.targetLedger[-112] = Math.max(
        0,
        (next.authored.targetLedger[-112] ?? 0) - event.deltaMs
      );
      if (next.authored.targetLedger[-112] === 0) {
        const participating = facets.filter((facet) => facet.participating);
        for (const facet of participating) {
          facet.value = 0;
          facet.sealed = false;
          delete facet.participating;
        }
        const angles = Array.from({ length: next.authored.cycleCount }, (_, index) =>
          next.authored.targetLedger[-200 - index]
        ).filter((angle): angle is number => angle !== undefined);
        if (angles.length > 0) {
          const killing = learnedIds.includes("killing-shattered-mirror");
          const broken = learnedIds.includes("calamity-answering-broken-lotus");
          commands.push({
            kind: "authored-mirror-reflection",
            angles,
            damage: Math.max(1, Math.floor(next.combat.damage * (killing ? 2.2 : broken ? 0.55 : 1.05))),
            shardsPerAngle: killing ? 3 : 1,
            range: killing ? 560 : 440,
            width: killing ? 42 : 34,
            sourceGongfaId: next.gongfaId
          });
        }
        next.authored.phase = 0;
        next.authored.cycleCount = 0;
      }
    }

    const intact = facets.filter((facet) => facet.value > 0);
    if (intact.length === 0 && next.authored.phase !== 2) {
      next.authored.targetLedger[-113] = (next.authored.targetLedger[-113] ?? 0) + event.deltaMs;
      const emergencyMs = learnedIds.includes("thousand-facet-lotus") ? 6500 : 4800;
      if (next.authored.targetLedger[-113] >= emergencyMs) {
        const first = facets.sort((a, b) => (a.chainId ?? 0) - (b.chainId ?? 0))[0];
        if (first) {
          first.value = 1;
          first.sealed = false;
        }
        next.authored.targetLedger[-113] = 0;
      }
    } else {
      next.authored.targetLedger[-113] = 0;
    }
    ensureIceMirrorFacets(next, learnedIds);
    commands.push(mirrorFacetCommand(next, learnedIds));
    return { runtime: next, commands };
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

  if (next.gengjin) {
    const learnedMasteryIds = event.learnedMasteryIds ?? [];
    const state = next.gengjin;
    state.isMoving = event.isMoving === true;
    state.guardCapacity = gengjinCapacity(state, learnedMasteryIds);
    if (state.guardValue > state.guardCapacity) state.guardValue = state.guardCapacity;
    state.bladeShellCharge = state.guardValue;
    state.bladeShellCooldownRemaining = Math.max(0, state.bladeShellCooldownRemaining - event.deltaMs);
    state.mitigationDisabledRemaining = Math.max(0, state.mitigationDisabledRemaining - event.deltaMs);
    state.postEvadeLayerRemaining = Math.max(0, state.postEvadeLayerRemaining - event.deltaMs);
    if (state.postEvadeLayerRemaining === 0) state.postEvadeGuard = 0;
    state.shieldRemaining = Math.max(0, state.shieldRemaining - event.deltaMs);
    if (state.shieldRemaining === 0) state.shieldValue = 0;
    state.fractureRecoveryRemaining = Math.max(0, state.fractureRecoveryRemaining - event.deltaMs);
    if (state.fractureRecoveryRemaining === 0 && state.fractureCount > 0) {
      state.fractureCount -= 1;
      state.fractureRecoveryRemaining = state.fractureCount > 0
        ? (learnedMasteryIds.includes("hundred-forged-heavy-armor") ? 6500 : 4200)
        : 0;
    }
    state.guardMitigation = gengjinMitigation(state, learnedMasteryIds);

    const skill2 = getAuthoredSkill2Plan(event.skill2Id);
    if (skill2?.trigger === "threshold" && state.bladeShellCooldownRemaining === 0 && event.nearbyEnemyCount > 0) {
      const release = buildGengjinRelease(
        next,
        event.targets ?? [],
        learnedMasteryIds,
        event.playerX ?? 0,
        event.playerY ?? 0
      );
      if (release) commands.push(release);
    }
    commands.push(gengjinBraceCommand(next));
  }

  if (!next.burningRing) {
    return { runtime: next, commands };
  }

  const state = next.burningRing;
  const burningLearnedMasteryIds = event.learnedMasteryIds ?? [];
  const playerX = event.playerX ?? 0;
  const playerY = event.playerY ?? 0;
  const dangerTargets = (event.targets ?? []).filter((target) => {
    const distance = Math.hypot(target.x - playerX, target.y - playerY);
    return distance >= 48 && distance <= next.combat.auraRadius + 82;
  });
  const heatWeight = (target: AuthoredTargetFact): number => {
    if (burningLearnedMasteryIds.includes("myriad-enemies-as-furnace")) {
      return target.rank === "ordinary" ? 1.4 : target.rank === "elite" ? 0.65 : 0.2;
    }
    if (burningLearnedMasteryIds.includes("lone-true-sun")) {
      return target.rank === "boss" ? 2.2 : target.rank === "elite" ? 1.55 : 0.2;
    }
    return 1;
  };
  const heatCap = burningLearnedMasteryIds.includes("banked-sun") ? 78 : 100;
  if (dangerTargets.length > 0) {
    const distinctWeight = dangerTargets.reduce((sum, target) => sum + heatWeight(target), 0);
    state.heat = Math.min(
      heatCap,
      state.heat + distinctWeight * 7.5 * (state.heatBuildRate / burningRingDefaults.heatBuildRate) * deltaSeconds
    );
  } else {
    const heatFloor =
      burningLearnedMasteryIds.includes("banked-sun") && state.heat >= 50 ? 50 : 0;
    state.heat = Math.max(
      heatFloor,
      state.heat - 22 * (state.heatDecayRate / burningRingDefaults.heatDecayRate) * deltaSeconds
    );
  }
  next.mastery.masterySkill2CooldownRemaining = Math.max(
    0,
    next.mastery.masterySkill2CooldownRemaining - event.deltaMs
  );
  if (
    event.skill2Id === "solar-flare-cycle" &&
    state.heat >= 99.5 &&
    dangerTargets.length > 0 &&
    state.guardRemaining <= 0 &&
    next.mastery.masterySkill2CooldownRemaining === 0
  ) {
    const skill2Stats = skill2RefinementStats(next);
    state.guardRemaining = 1250;
    state.solarFlareCasts += 1;
    commands.push({
      kind: "authored-burning-corona",
      rotation: state.rotation,
      rings: [{
        radius: 108, direction: state.rotationDirection,
        segmentCount: 12, visibleSegments: 12, arcFraction: 0.94,
        damage: Math.max(1, Math.floor(skill2Combat(next).damage * skill2Stats.damageScale * 0.7))
      }],
      guard: true, sunspotLure: false, pushStrength: 300,
      sourceGongfaId: next.gongfaId,
      masteryCast: {
        skill2Id: "solar-flare-cycle",
        cooldownMs: Math.floor(authoredSkill2Plans["solar-flare-cycle"].cooldownMs * skill2Stats.cadenceScale)
      }
    });
  }
  state.guardRemaining = Math.max(0, state.guardRemaining - event.deltaMs);
  if (state.guardRemaining === 0 && next.authored.phase === 2) {
    state.heat = 0;
    next.authored.phase = 0;
  } else if (state.guardRemaining > 0) {
    next.authored.phase = 2;
  }
  const perfectSunActive =
    burningLearnedMasteryIds.includes("perfect-sun-consumption") &&
    state.heat >= 72 &&
    state.guardRemaining <= 0;
  if (perfectSunActive) state.heat = Math.max(0, state.heat - 10 * deltaSeconds);
  state.rotation += deltaSeconds *
    (burningLearnedMasteryIds.includes("furnace-heart-lone-ring") ? 0.7 : 1.55);
  state.radiusPhaseRemaining = Math.max(0, state.radiusPhaseRemaining - event.deltaMs);
  if (state.radiusPhaseRemaining === 0) {
    state.radiusPhaseRemaining = burningLearnedMasteryIds.includes("wandering-luminary-rings") ? 1650 : 1800;
    next.authored.phase = next.authored.phase === 1 ? 0 : 1;
  }
  state.coronaTickRemaining = Math.max(0, state.coronaTickRemaining - event.deltaMs);
  if (state.coronaTickRemaining === 0) {
    state.coronaTickRemaining = 150;
    const fullGuard = state.guardRemaining > 0;
    const perfect = perfectSunActive;
    const lone = burningLearnedMasteryIds.includes("furnace-heart-lone-ring");
    const twin = burningLearnedMasteryIds.includes("counter-rotating-twin-rings");
    const wandering = burningLearnedMasteryIds.includes("wandering-luminary-rings");
    const transition = wandering && state.radiusPhaseRemaining > 1400;
    const baseDamage = Math.max(1, Math.floor(next.combat.damage * (lone ? 1.85 : 0.72)));
    const visibleSegments = fullGuard ? 12 : perfect ? 8 :
      burningLearnedMasteryIds.includes("sunspot-lure") ? 3 : lone ? 2 : 5;
    const baseRadius = next.combat.auraRadius + 18;
    const rings = transition ? [] : twin
      ? [
          { radius: baseRadius - 26, direction: state.rotationDirection, segmentCount: 6, visibleSegments: fullGuard ? 6 : 4, arcFraction: fullGuard ? 0.96 : 0.58, damage: Math.floor(baseDamage * 0.72) },
          { radius: baseRadius + 24, direction: state.rotationDirection === 1 ? -1 as const : 1 as const, segmentCount: 6, visibleSegments: fullGuard ? 6 : 4, arcFraction: fullGuard ? 0.96 : 0.58, damage: Math.floor(baseDamage * 0.72) }
        ]
      : [{
          radius: wandering ? (next.authored.phase === 0 ? baseRadius - 32 : baseRadius + 30) : baseRadius,
          direction: state.rotationDirection, segmentCount: fullGuard ? 12 : lone ? 6 : 8,
          visibleSegments, arcFraction: fullGuard ? 0.96 : perfect ? 0.9 : lone ? 0.48 : 0.62, damage: baseDamage
        }];
    commands.push({
      kind: "authored-burning-corona", rotation: state.rotation, rings,
      guard: fullGuard, sunspotLure: burningLearnedMasteryIds.includes("sunspot-lure"),
      pushStrength: fullGuard ? 300 : 0, sourceGongfaId: next.gongfaId
    });
  }
  syncBurningRingCombat(next);

  return { runtime: next, commands };
}

/**
 * Rebounding Edge: prevented damage launches a focused blade back at its
 * source, its bite scaled by current Guard. Returns undefined when the
 * Transformation is not learned or there is no Guard to spend.
 */
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
  if (runtime.gongfaId === "ironwood-wave-form") return [];
  if (runtime.gongfaId === "ice-mirror-guard") return [];
  options = {
    ...options,
    learnedMasteryIds: options.learnedMasteryIds ?? runtime.mastery.masteryLearnedIds
  };
  if (runtime.gongfaId === "green-vine-art") {
    if (runtime.authored.anchors.some((anchor) => anchor.kind === "vine-endpoint")) return [];
    const targets = options.targets ?? [];
    if (targets.length === 0) return [];
    const playerX = options.playerX ?? 0;
    const playerY = options.playerY ?? 0;
    const learnedIds = options.learnedMasteryIds ?? [];
    const priority = [...targets].sort((a, b) =>
      distanceSquared(a.x, a.y, playerX, playerY) - distanceSquared(b.x, b.y, playerX, playerY)
    )[0]!;
    let second: { x: number; y: number; targetId?: number };
    if (!learnedIds.includes("heart-piercing-thorn-cable") && targets.length > 1) {
      second = [...targets].filter((target) => target.targetId !== priority.targetId).sort((a, b) => {
        const angleA = normalizedAngleDifference(
          Math.atan2(priority.y - playerY, priority.x - playerX),
          Math.atan2(a.y - playerY, a.x - playerX)
        );
        const angleB = normalizedAngleDifference(
          Math.atan2(priority.y - playerY, priority.x - playerX),
          Math.atan2(b.y - playerY, b.x - playerX)
        );
        return angleB - angleA;
      })[0]!;
    } else {
      second = { x: playerX * 2 - priority.x, y: playerY * 2 - priority.y };
    }
    runtime.authored.anchors.push(
      { kind: "vine-endpoint", x: priority.x, y: priority.y, targetId: priority.targetId, value: 0 },
      { kind: "vine-endpoint", x: second.x, y: second.y, targetId: second.targetId, value: 0 }
    );
    runtime.authored.resource = 0;
    runtime.authored.targetLedger[-400] = 0;
    runtime.authored.targetLedger[-403] = 0;
    return [{
      kind: "authored-vine-tether",
      endpoints: [
        { x: priority.x, y: priority.y, targetId: priority.targetId },
        { x: second.x, y: second.y, targetId: second.targetId }
      ],
      player: { x: playerX, y: playerY }, tension: 0, sourceGongfaId: runtime.gongfaId
    }];
  }
  if (runtime.gongfaId === "jinfeng-gong") {
    // Travel itself is Skill 1. The ordinary attack clock only supplies a
    // modest close cut while standing, so it can never become a projectile
    // fallback or reward idle play more than route building.
    if (runtime.authored.targetLedger[-304] === 1) return [];
    const playerX = options.playerX ?? 0;
    const playerY = options.playerY ?? 0;
    const targets = options.targets ?? [];
    const nearest = [...targets].sort((a, b) =>
      distanceSquared(a.x, a.y, playerX, playerY) - distanceSquared(b.x, b.y, playerX, playerY)
    )[0];
    if (!nearest || distanceSquared(nearest.x, nearest.y, playerX, playerY) > 155 ** 2) return [];
    const facing = Math.atan2(nearest.y - playerY, nearest.x - playerX);
    const cutAngle = facing + Math.PI / 2;
    const length = 125;
    const centerX = playerX + Math.cos(facing) * 54;
    const centerY = playerY + Math.sin(facing) * 54;
    const from = {
      x: centerX - Math.cos(cutAngle) * length / 2,
      y: centerY - Math.sin(cutAngle) * length / 2
    };
    const to = {
      x: centerX + Math.cos(cutAngle) * length / 2,
      y: centerY + Math.sin(cutAngle) * length / 2
    };
    return [{
      kind: "authored-jinfeng-ground-cut",
      from,
      to,
      targetIds: targets.filter((target) => distanceToSegment(target, from, to) <= 24)
        .map((target) => target.targetId),
      damage: Math.max(1, Math.floor(runtime.combat.damage * 0.58)),
      delayMs: 0,
      lifetimeMs: 300,
      style: "standing",
      sourceGongfaId: runtime.gongfaId
    }];
  }
  if (runtime.gongfaId === "yujian-jue") {
    const state = runtime.authored;
    const learnedIds = options.learnedMasteryIds ?? [];
    const targets = options.targets ?? [];
    const playerX = options.playerX ?? 0;
    const playerY = options.playerY ?? 0;
    const crown = learnedIds.includes("heavenly-sword-crown");
    state.maxCharges = crown ? 3 : 4;
    state.charges = Math.min(state.charges, state.maxCharges);
    const fourTogether = learnedIds.includes("four-symbols-together");
    const launchCount = fourTogether ? (state.charges === state.maxCharges ? state.charges : 0) : Math.min(1, state.charges);
    if (targets.length === 0 || launchCount === 0) return [];

    const rankValue = (target: AuthoredTargetFact): number =>
      target.rank === "boss" ? 3 : target.rank === "elite" ? 2 : 1;
    const toughest = [...targets].sort((a, b) =>
      rankValue(b) * 10 + b.healthRatio - rankValue(a) * 10 - a.healthRatio
    )[0]!;
    const commands: GongfaRuntimeCommand[] = [];
    for (let index = 0; index < launchCount; index += 1) {
      const swordId = state.activationCount++ % state.maxCharges;
      const nearest = [...targets].sort((a, b) =>
        distanceSquared(a.x, a.y, playerX, playerY) - distanceSquared(b.x, b.y, playerX, playerY)
      )[0]!;
      const farthest = [...targets].sort((a, b) =>
        distanceSquared(b.x, b.y, playerX, playerY) - distanceSquared(a.x, a.y, playerX, playerY)
      )[0]!;
      const healthiest = [...targets].sort((a, b) => b.healthRatio - a.healthRatio)[0]!;
      const assigned = learnedIds.includes("execution-seal")
        ? toughest
        : [nearest, healthiest, toughest, farthest][swordId % 4] ?? nearest;
      const angle = Math.atan2(assigned.y - playerY, assigned.x - playerX);
      const beyond = 54 + masteryEffectTiers(learnedIds, "skill1Range") * 12;
      const endpoint = {
        x: assigned.x + Math.cos(angle) * beyond,
        y: assigned.y + Math.sin(angle) * beyond
      };
      const stillEdge = learnedIds.includes("still-sword-edge");
      const flightMs = Math.floor((stillEdge ? 2900 : 2200) *
        Math.pow(0.94, masteryEffectTiers(learnedIds, "skill1Count")) *
        Math.pow(0.9, masteryEffectTiers(learnedIds, "surgeStability")));
      const restingCharge = stillEdge ? Math.min(0.65, state.phaseElapsedMs / 4200) : 0;
      const reversing = learnedIds.includes("reversing-sword-path");
      const bloom = learnedIds.includes("sword-bloom");
      const outboundScale = reversing ? 0.42 : bloom ? 0.72 :
        learnedIds.includes("execution-seal") ? 1.28 : crown ? 1.16 : 1;
      const returnScale = reversing ? 1.45 : 0.56;
      const shades = bloom
        ? targets.filter((target) => target.targetId !== assigned.targetId).slice(0, 2).map((target) => target.targetId)
        : [];
      const airborneBefore = state.anchors.filter((anchor) => anchor.kind === "sword");
      const domainTargets = learnedIds.includes("three-enclosure-sword-domain") && airborneBefore.length > 0
        ? targets.filter((target) => airborneBefore.some((sword) =>
            distanceToInfiniteLine(target, { x: playerX, y: playerY }, sword) <= 26
          )).map((target) => target.targetId)
        : [];
      state.anchors.push({
        kind: "sword", x: endpoint.x, y: endpoint.y, targetId: assigned.targetId,
        originPlayerX: playerX, originPlayerY: playerY, angle, value: swordId,
        maxValue: flightMs, remainingMs: flightMs,
        routePoints: [{ x: playerX, y: playerY }, { x: assigned.x, y: assigned.y }, endpoint]
      });
      state.charges -= 1;
      state.phaseElapsedMs = 0;
      if (runtime.yujian) {
        if (learnedIds.includes("execution-seal")) runtime.yujian.executionSealTriggers += 1;
        if (bloom) runtime.yujian.swordBloomTriggers += 1;
        if (reversing) runtime.yujian.reversingSwordPathTriggers += 1;
      }
      commands.push({
        kind: "authored-yujian-flight", swordId, targetId: assigned.targetId,
        route: [{ x: playerX, y: playerY }, { x: assigned.x, y: assigned.y }, endpoint],
        outboundDamage: Math.max(1, Math.floor(runtime.combat.damage * outboundScale *
          (1 + restingCharge + masteryEffectTiers(learnedIds, "resourcePotency") * 0.08))),
        returnDamage: Math.max(1, Math.floor(runtime.combat.damage * returnScale *
          (1 + masteryEffectTiers(learnedIds, "resourcePotency") * 0.08))),
        shadeTargetIds: shades, domainTargetIds: domainTargets, sourceGongfaId: runtime.gongfaId
      });
    }
    state.resource = state.charges / Math.max(1, state.maxCharges);
    const airborne = state.anchors.filter((anchor) => anchor.kind === "sword");
    if (airborne.length >= 3 && runtime.mastery.masterySkill2Id === "returning-sword-formation" &&
        state.phase !== 2 &&
        (runtime.mastery.masterySkill2CooldownRemaining <= 0 || runtime.mastery.masterySkill2Casts === 0)) {
      const stats = skill2RefinementStats(runtime);
      const cooldownMs = Math.floor(authoredSkill2Plans["returning-sword-formation"].cooldownMs * stats.cadenceScale);
      const targetIds = [...new Set(airborne.flatMap((sword) => sword.targetId === undefined ? [] : [sword.targetId]))];
      commands.push({
        kind: "authored-myriad-swords-return",
        routes: airborne.map((sword) => ({
          swordId: sword.value,
          points: sword.routePoints?.length
            ? [...sword.routePoints].reverse()
            : [{ x: sword.x, y: sword.y }, { x: sword.originPlayerX ?? playerX, y: sword.originPlayerY ?? playerY }],
          targetId: sword.targetId
        })),
        targetIds,
        damage: Math.max(1, Math.floor(skill2Combat(runtime).damage * 1.25 * stats.damageScale)),
        intersectionDamage: Math.max(1, Math.floor(skill2Combat(runtime).damage * 0.7 * stats.damageScale)),
        sourceGongfaId: runtime.gongfaId,
        masteryCast: { skill2Id: "returning-sword-formation", cooldownMs }
      });
      runtime.mastery.masterySkill2CooldownRemaining = cooldownMs;
      state.phase = 2;
      airborne.forEach((sword) => { sword.remainingMs = 360; sword.maxValue = 360; sword.participating = true; });
    }
    return commands;
  }
  if (runtime.gongfaId === "verdant-ring-scripture") return [];
  if (runtime.gongfaId === "blazing-feather-art") {
    const state = runtime.authored;
    const learnedIds = options.learnedMasteryIds ?? [];
    const targets = options.targets ?? [];
    if (targets.length === 0 || state.charges <= 0) return [];
    const playerX = options.playerX ?? 0;
    const playerY = options.playerY ?? 0;
    const rankValue = (target: AuthoredTargetFact): number =>
      target.rank === "boss" ? 3 : target.rank === "elite" ? 2 : 1;
    const priority = [...targets].sort((a, b) =>
      rankValue(b) * 10 + b.healthRatio - rankValue(a) * 10 - a.healthRatio
    )[0]!;
    const angle = Math.atan2(priority.y - playerY, priority.x - playerX);
    const searing = learnedIds.includes("searing-quill") || learnedIds.includes("searing-feathers");
    const storm = learnedIds.includes("feather-storm");
    const arc = searing ? Math.PI / 9 : storm ? Math.PI * 0.7 : Math.PI * 0.38;
    const range = Math.max(260, runtime.combat.range + (searing ? 125 : storm ? -35 : 50));
    const streakBand = learnedIds.includes("sun-chasing-wings")
      ? Math.min(0.14, (state.targetLedger[-20] ?? 0) * 0.025)
      : 0;
    const optimalStart = range * (0.58 - streakBand);
    const optimalEnd = range * (0.94 + streakBand * 0.25);
    const finalCharge = state.charges === 1;
    const lastFeather = finalCharge && learnedIds.includes("last-feather");
    const damageScale = searing ? 1.55 : storm ? 0.68 :
      learnedIds.includes("swift-molt") ? 0.82 : 1;
    const hitTargets = targets.flatMap((target) => {
      const distance = Math.hypot(target.x - playerX, target.y - playerY);
      const targetAngle = Math.atan2(target.y - playerY, target.x - playerX);
      if (distance > range || normalizedAngleDifference(targetAngle, angle) > arc / 2) return [];
      const optimal = distance >= optimalStart && distance <= optimalEnd;
      return [{
        targetId: target.targetId, x: target.x, y: target.y, optimal,
        damage: Math.max(1, Math.floor(runtime.combat.damage * damageScale *
          (optimal ? 1.45 : 0.38) * (lastFeather ? 1.8 : 1)))
      }];
    });
    const optimalTargets = hitTargets.filter((target) => target.optimal);
    if (optimalTargets.length > 0) {
      state.cycleCount += optimalTargets.length;
      state.targetLedger[-20] = (state.targetLedger[-20] ?? 0) + 1;
      if (runtime.mastery.masterySkill2Id === "feather-rain-formation" ||
          learnedIds.includes("phoenix-brand") || learnedIds.includes("ashen-pursuit")) {
        for (const target of optimalTargets) {
          const existing = state.anchors.find((anchor) =>
            anchor.kind === "phoenix-brand" && anchor.targetId === target.targetId
          );
          const brandLifetime = (learnedIds.includes("phoenix-brand") ? 11_000 :
            learnedIds.includes("sun-chasing-wings") ? 4200 : 7000) *
            Math.pow(1.16, masteryEffectTiers(learnedIds, "surgeStability"));
          if (existing) {
            existing.x = target.x; existing.y = target.y; existing.remainingMs = brandLifetime;
          } else {
            state.anchors.push({ kind: "phoenix-brand", x: target.x, y: target.y,
              targetId: target.targetId, value: 1, remainingMs: brandLifetime });
          }
        }
      }
    } else if (learnedIds.includes("sun-chasing-wings")) {
      state.targetLedger[-20] = 0;
      state.cycleCount = 0;
    }
    state.charges = Math.max(0, state.charges - 1);
    state.resource = state.charges / Math.max(1, state.maxCharges);
    if (state.charges === 0) state.phaseElapsedMs = 0;
    const commands: GongfaRuntimeCommand[] = [{
      kind: "authored-blazing-feather-fan",
      origin: { x: playerX, y: playerY }, angle, arc, range, optimalStart, optimalEnd,
      targets: hitTargets, lastFeather, sourceGongfaId: runtime.gongfaId
    }];
    const brands = state.anchors.filter((anchor) =>
      anchor.kind === "phoenix-brand" && anchor.targetId !== undefined
    );
    if (state.cycleCount >= 3 && brands.length >= 2 &&
        runtime.mastery.masterySkill2Id === "feather-rain-formation" &&
        (runtime.mastery.masterySkill2CooldownRemaining <= 0 || runtime.mastery.masterySkill2Casts === 0)) {
      let bestFrom = brands[0]!;
      let bestTo = brands[1]!;
      let bestTargets = brands;
      for (let i = 0; i < brands.length; i += 1) {
        for (let j = i + 1; j < brands.length; j += 1) {
          const from = brands[i]!; const to = brands[j]!;
          const aligned = brands.filter((brand) => distanceToInfiniteLine(brand, from, to) <= 42);
          if (aligned.length > bestTargets.length) {
            bestFrom = from; bestTo = to; bestTargets = aligned;
          }
        }
      }
      const skill2Stats = skill2RefinementStats(runtime);
      const cooldownMs = Math.floor(authoredSkill2Plans["feather-rain-formation"].cooldownMs * skill2Stats.cadenceScale);
      commands.push({
        kind: "authored-phoenix-horizon",
        from: { x: bestFrom.x, y: bestFrom.y }, to: { x: bestTo.x, y: bestTo.y },
        targetIds: bestTargets.flatMap((brand) => brand.targetId === undefined ? [] : [brand.targetId]),
        damage: Math.max(1, Math.floor(skill2Combat(runtime).damage * 2.1 * skill2Stats.damageScale)),
        executeHealthRatio: 0.18, sourceGongfaId: runtime.gongfaId,
        masteryCast: { skill2Id: "feather-rain-formation", cooldownMs }
      });
      runtime.mastery.masterySkill2CooldownRemaining = cooldownMs;
      state.anchors = state.anchors.filter((anchor) => anchor.kind !== "phoenix-brand");
      state.charges = 0; state.resource = 0; state.cycleCount = 0; state.phaseElapsedMs = 0;
    }
    return commands;
  }
  if (runtime.gongfaId === "drifting-frost-needle") {
    const state = runtime.authored;
    const learnedIds = options.learnedMasteryIds ?? [];
    const targets = options.targets ?? [];
    const playerX = options.playerX ?? 0;
    const playerY = options.playerY ?? 0;
    const existing = state.anchors.filter((anchor) => anchor.kind === "weakpoint");
    const retainedTargetIds = new Set(existing.flatMap((anchor) =>
      anchor.targetId === undefined || anchor.targetId < 0 ? [] : [anchor.targetId]
    ));
    const priorTargetIds = new Set(retainedTargetIds);
    const lone = learnedIds.includes("army-breaking-lone-needle") || learnedIds.includes("piercing-frost");
    const linked = learnedIds.includes("linked-pearl-thread") || learnedIds.includes("frost-flurry");
    const swift = learnedIds.includes("swift-frost-point") || learnedIds.includes("swift-frost");
    const maxNewPoints = lone ? 1 : linked ? 4 : swift ? 2 : 3;
    const lockRange = (swift ? 170 : 255) + masteryEffectTiers(learnedIds, "surgeBuild") * 18;
    let cursor = existing.at(-1) ?? { x: playerX, y: playerY };
    const route: AuthoredTargetFact[] = [];
    const remaining = [...targets];
    while (route.length < maxNewPoints) {
      const nextTarget = remaining
        .filter((target) => !retainedTargetIds.has(target.targetId) &&
          ((route.length === 0 && existing.length === 0) ||
            Math.hypot(target.x - cursor.x, target.y - cursor.y) <= lockRange))
        .sort((a, b) =>
          distanceSquared(a.x, a.y, cursor.x, cursor.y) - distanceSquared(b.x, b.y, cursor.x, cursor.y)
        )[0];
      if (!nextTarget) break;
      route.push(nextTarget);
      retainedTargetIds.add(nextTarget.targetId);
      remaining.splice(remaining.indexOf(nextTarget), 1);
      cursor = nextTarget;
    }
    if (route.length < maxNewPoints && learnedIds.includes("moving-star-acupoint")) {
      const repeatedBoss = targets.find((target) =>
        target.rank === "boss" && priorTargetIds.has(target.targetId)
      );
      if (repeatedBoss) {
        const pointIndex = state.activationCount % 4;
        const offsetAngle = pointIndex * Math.PI / 2;
        route.push({ ...repeatedBoss, x: repeatedBoss.x + Math.cos(offsetAngle) * 22,
          y: repeatedBoss.y + Math.sin(offsetAngle) * 22 });
      }
    }
    if (route.length === 0) {
      if (learnedIds.includes("still-water-focus")) state.anchors = existing.slice(-2);
      else state.anchors = [];
      state.charges = state.anchors.length;
      state.resource = Math.min(1, state.charges / 5);
      return [];
    }
    const firstScale = (lone ? 1.9 : linked ? 0.62 : swift ? 0.8 : 1) *
      (learnedIds.includes("seven-lodge-balance") ? 0.72 : 1);
    const retention = learnedIds.includes("still-water-focus") ? 0.88 : 1;
    const points = route.map((target, index) => ({
      targetId: target.targetId, x: target.x, y: target.y,
      damage: Math.max(1, Math.floor(runtime.combat.damage * firstScale * Math.pow(retention, index)))
    }));
    for (const point of points) {
      if (learnedIds.includes("moving-star-acupoint") && priorTargetIds.has(point.targetId)) continue;
      state.anchors.push({ kind: "weakpoint", x: point.x, y: point.y,
        targetId: point.targetId, value: 1, chainId: state.activationCount++ });
    }
    if (learnedIds.includes("seven-lodge-balance") && state.anchors.length < 5) {
      const pair = state.anchors.slice(-2);
      if (pair.length === 2) state.anchors.push({ kind: "weakpoint",
        x: (pair[0]!.x + pair[1]!.x) / 2, y: (pair[0]!.y + pair[1]!.y) / 2,
        targetId: -1_000_000 - state.activationCount++, value: 0.45 });
    }
    state.anchors = state.anchors.slice(-7);
    state.charges = state.anchors.length;
    state.resource = Math.min(1, state.charges / 5);
    const commands: GongfaRuntimeCommand[] = [{
      kind: "authored-frost-needle-chain", points,
      freezeMs: (learnedIds.includes("frost-sealed-instant") && state.charges >= 5) ||
        (learnedIds.includes("cold-soul-commitment") && state.charges >= 5) ? 950 : 0,
      sourceGongfaId: runtime.gongfaId
    }];
    if (state.charges >= 5 && runtime.mastery.masterySkill2Id === "mirror-needle-constellation" &&
        (runtime.mastery.masterySkill2CooldownRemaining <= 0 || runtime.mastery.masterySkill2Casts === 0)) {
      const routeBack = [...state.anchors].reverse();
      const skill2Stats = skill2RefinementStats(runtime);
      const cooldownMs = Math.floor(authoredSkill2Plans["mirror-needle-constellation"].cooldownMs * skill2Stats.cadenceScale);
      commands.push({
        kind: "authored-reverse-winter-thread",
        points: routeBack.map((point, index) => ({
          targetId: point.targetId ?? -1, x: point.x, y: point.y,
          damage: Math.max(1, Math.floor(skill2Combat(runtime).damage * skill2Stats.damageScale * (0.72 + index * 0.22) *
            (learnedIds.includes("seven-lodge-balance") ? 0.7 : 1)))
        })),
        sourceGongfaId: runtime.gongfaId,
        masteryCast: { skill2Id: "mirror-needle-constellation", cooldownMs }
      });
      runtime.mastery.masterySkill2CooldownRemaining = cooldownMs;
      state.anchors = []; state.charges = 0; state.resource = 0;
    } else if (state.charges >= 5 && learnedIds.includes("cold-soul-commitment")) {
      const last = points.at(-1);
      if (last) last.damage = Math.floor(last.damage * 2.5);
      state.anchors = []; state.charges = 0; state.resource = 0;
    }
    return commands;
  }
  if (runtime.gongfaId === "mist-wraith-canon") {
    const learnedIds = options.learnedMasteryIds ?? [];
    const targets = options.targets ?? [];
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
    const refinedCapacity = runtime.authored.maxCharges + (runtime.skill1Refinements?.countBonus ?? 0);
    const capacity = learnedIds.includes("life-seeking-fierce-wraith") ? Math.min(5, refinedCapacity) :
      learnedIds.includes("lantern-returning-underworld-attendant") ? refinedCapacity + 3 :
        learnedIds.includes("long-banner-soul-call") ? Math.max(1, refinedCapacity - 2) : refinedCapacity;
    runtime.authored.resource = runtime.authored.charges / Math.max(1, capacity);
    if (!soul || retainsSoul) return [{
      kind: "authored-line-strike", style: "soul-guiding-lantern", origin: "player",
      aimMode: "nearest", damage: Math.max(1, Math.floor(runtime.combat.damage * 0.24)),
      width: 8, length: Math.max(220, runtime.combat.range * 0.82), maxHits: 1,
      sourceGongfaId: runtime.gongfaId
    }];
    const playerX = options.playerX ?? 0; const playerY = options.playerY ?? 0;
    const crossingReach = Math.max(240, runtime.combat.range + soul.value * 55);
    const eligibleTargets = targets.filter((target) =>
      distanceSquared(target.x, target.y, playerX, playerY) <= crossingReach ** 2
    );
    const strongest = [...eligibleTargets].sort((a, b) => {
      const rank = (target: AuthoredTargetFact): number => target.rank === "boss" ? 3 : target.rank === "elite" ? 2 : 1;
      return rank(b) * 10 + b.healthRatio - rank(a) * 10 - a.healthRatio;
    })[0];
    const nearest = [...eligibleTargets].sort((a, b) =>
      distanceSquared(a.x, a.y, playerX, playerY) - distanceSquared(b.x, b.y, playerX, playerY)
    )[0];
    const wandering = learnedIds.includes("wandering-mist-host");
    const routeTargets = wandering
      ? eligibleTargets.filter((target) => target.rank === "ordinary").sort((a, b) =>
          distanceSquared(a.x, a.y, playerX, playerY) - distanceSquared(b.x, b.y, playerX, playerY)
        ).slice(0, 3)
      : [learnedIds.includes("life-seeking-fierce-wraith") || soul.value >= 3 ? strongest : nearest].filter(
          (target): target is AuthoredTargetFact => target !== undefined
        );
    const finalTargets = routeTargets.length > 0 ? routeTargets : strongest ? [strongest] : [];
    return [{
      kind: "authored-mist-wraith-crossing",
      from: { x: playerX, y: playerY },
      waypoints: finalTargets.map((target) => ({ x: target.x, y: target.y })),
      targetIds: finalTargets.map((target) => target.targetId),
      damage: Math.max(1, Math.floor(runtime.combat.damage * soul.value *
        (learnedIds.includes("life-seeking-fierce-wraith") ? 1.35 : 1) *
        (wandering ? 0.62 : 1) * (learnedIds.includes("long-banner-soul-call") ? 0.8 : 1))),
      width: 14 + soul.value * 7 + (wandering ? 20 : 0) + (runtime.skill1Refinements?.rangeBonus ?? 0),
      rankPower: soul.value,
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
  if (runtime.gongfaId === "moonfall-tide-ritual") {
    if (runtime.authored.phase !== 0) return [];
    const targets = options.targets ?? [];
    if (targets.length === 0) return [];
    const learnedIds = options.learnedMasteryIds ?? [];
    const density = (target: AuthoredTargetFact): number => targets.reduce((score, other) =>
      score + (distanceSquared(target.x, target.y, other.x, other.y) <= 165 ** 2 ? (other.rank === "boss" ? 3 : other.rank === "elite" ? 2 : 1) : 0), 0);
    const center = [...targets].sort((a, b) => density(b) - density(a))[0]!;
    const twin = learnedIds.includes("twin-moon-crossing");
    runtime.authored.phase = 1;
    runtime.authored.phaseElapsedMs = 0;
    runtime.authored.resource = 0;
    runtime.authored.secondaryResource = 0;
    runtime.authored.charges = 0;
    runtime.authored.anchors = twin ? [
      { kind: "moon", x: center.x - 68, y: center.y, value: 1, chainId: 0 },
      { kind: "moon", x: center.x + 68, y: center.y, value: 1, chainId: 1 }
    ] : [{ kind: "moon", x: center.x, y: center.y, value: 1, chainId: 0 }];
    const radius = learnedIds.includes("sea-suppressing-heavy-moon") ? 92 :
      learnedIds.includes("swift-moon-vessel") ? 205 : twin ? 132 : 152;
    return [{
      kind: "authored-moon-orbit",
      moons: runtime.authored.anchors.filter((anchor) => anchor.kind === "moon").map((moon) => ({ x: moon.x, y: moon.y, radius })),
      orbiters: [], tangentForce: 0, inwardForce: 0, suspend: false, sourceGongfaId: runtime.gongfaId
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
      (learnedIds.includes("life-flame-without-return") ? 1.5 : 1) *
      (1 + masteryEffectTiers(learnedIds, "surgeBuild") * 0.18);
    const asuraChoice = (["undying-asura", "world-burning-asura", "life-hunting-asura"] as const)
      .find((id) => learnedIds.includes(id));
    const asuraActive = runtime.authored.phase === 1;
    const healthBand = asuraActive || healthRatio < 0.2
      ? "critical" as const
      : healthRatio < 0.4
        ? "low" as const
        : healthRatio < 0.7
          ? "mid" as const
          : "high" as const;
    const strikeCount = asuraActive ? 4 : healthBand === "high" ? 2 : healthBand === "mid" ? 3 : 4;
    const asuraDamageScale = !asuraActive
      ? 1
      : asuraChoice === "undying-asura"
        ? 0.84
        : asuraChoice === "world-burning-asura"
          ? 1.55
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
      damage: Math.max(1, Math.floor(runtime.combat.damage * missingHealthScale * asuraDamageScale *
        (learnedIds.includes("six-armed-yaksha") ? 0.62 : shape === "pursuit" ? 0.82 : 1))),
      radius: runtime.combat.auraRadius *
        (shape === "focused" ? 0.62 : shape === "radial" ? 1.08 : 0.82) * asuraRadiusScale,
      staggerMs: Math.max(85, runtime.combat.projectileLifetimeMs *
        Math.pow(0.84, masteryEffectTiers(learnedIds, "surgeStability"))),
      healthCostFractions: [0, 0.06 * costScale, 0.08 * costScale, 0.1 * costScale],
      shape,
      refundFraction,
      ...(asuraChoice ? { asuraChoice } : {}),
      asuraActive,
      healthBand,
      bossDamageScale: shape === "pursuit"
        ? asuraActive && asuraChoice === "life-hunting-asura" ? 0.35 : 0.55
        : 1,
      continuationsRemaining: asuraActive && asuraChoice === "life-hunting-asura" ? 3 : 0,
      armCountBonus: runtime.skill1Refinements?.countBonus ?? 0,
      splitAcrossArms: learnedIds.includes("six-armed-yaksha"),
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
      width: 7 + (runtime.skill1Refinements?.countBonus ?? 0) * 3,
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
    const phaseEmpowered = selectedPhase === phase;
    const phaseSacrificed = selectedPhase !== undefined && !phaseEmpowered;
    const phaseTradeScale = phaseEmpowered ? 1.58 : phaseSacrificed ? 0.68 : 1;
    const controlTradeScale = phaseEmpowered ? 1.55 : phaseSacrificed ? 0.72 : 1;
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
      bandCount: (phase === "ebb" ? 3 : 2) + (phaseEmpowered ? 1 : 0),
      bandWidth: (phase === "ebb" ? 112 : phase === "still" ? 84 : 68) *
        (phaseEmpowered ? 1.22 : phaseSacrificed ? 0.82 : 1),
      force: baseForce * r9ForceScale * controlTradeScale,
      slowMultiplier: phase === "still"
        ? learnedIds.includes("mystic-water-anchors-the-realm") ? 0.24 : phaseEmpowered ? 0.32 : phaseSacrificed ? 0.68 : 0.5
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
    if (runtime.authored.phase === 3) return [];
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
    const sealLifetimeMs = runtime.combat.projectileLifetimeMs * 2.2 *
      Math.pow(1.18, masteryEffectTiers(learnedIds, "surgeBuild"));
    const formation = loneBridge ? "lone-bridge" as const : threeFord ? "three-ford" as const : curving ? "curving-river" as const : "standard" as const;
    const formationCode = formation === "lone-bridge" ? 1 : formation === "three-ford" ? 2 : formation === "curving-river" ? 3 : 0;
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
        x: target.x, y: target.y, value: strength, maxValue: formationCode, remainingMs: sealLifetimeMs
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
          kind: "seal", sealRole: "crossing", chainId, x, y, value: strength, maxValue: formationCode,
          remainingMs: sealLifetimeMs
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
      formation,
      lifetimeMs: sealLifetimeMs,
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
    // Skill 1 only forges/lodges nodes. Ignition and all propagation are
    // advanced from the live topology during tick processing.
    return [{ kind: "crimson-furnace-volley", count: runtime.combat.count }];
  }

  switch (runtime.combat.pattern) {
    case "homing": {
      const learnedMasteryIds = options.learnedMasteryIds ?? [];
      return [{
        kind: "homing-volley",
        count: runtime.combat.count + surgeBonusCount(runtime, learnedMasteryIds)
      }];
    }
    case "wave": {
      const learnedMasteryIds = options.learnedMasteryIds ?? [];
      return [{
        kind: "wave-volley",
        count: Math.max(1, runtime.combat.count + surgeBonusCount(runtime, learnedMasteryIds)),
        returnShots: runtime.combat.returnShots,
        aimMode: "nearest"
      }];
    }
    case "aura":
      if (runtime.gengjin) return [];
      if (!runtime.burningRing) {
        const learnedMasteryIds = options.learnedMasteryIds ?? [];
        let count = runtime.combat.count;
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
  // The corona is a persistent body advanced by tick facts, not an attack
  // volley. The normal attack scheduler must never launch a substitute wave.
  return [];
}

export interface CrimsonTargetFact {
  index: number;
  embedStacks: number;
  distance: number;
  active: boolean;
  linkDistance?: number;
  priorityBody?: boolean;
}

export function selectCrimsonFurnaceTargetIndexes(
  candidates: CrimsonTargetFact[],
  count: number
): number[] {
  return candidates
    .filter((enemy) => enemy.active)
    .sort((a, b) => {
      const bodyPriority = Number(b.priorityBody ?? false) - Number(a.priorityBody ?? false);
      if (bodyPriority !== 0) return bodyPriority;
      const freshPriority = Number(a.embedStacks > 0) - Number(b.embedStacks > 0);
      if (freshPriority !== 0) return freshPriority;
      const connectionPriority = (a.linkDistance ?? 1_000_000_000) - (b.linkDistance ?? 1_000_000_000);
      if (connectionPriority !== 0) return connectionPriority;
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
  if (runtime.gongfaId === "jinfeng-gong" && [
    "heaven-splitting-long-edge", "golden-gale-crosscut", "crescent-wake",
    "unbroken-continuance", "borrowed-turn-edge", "gale-rupture",
    "one-line-to-horizon", "returning-dragon-edge", "formation-breaking-gale-step"
  ].includes(transformationId)) {
    return copyRuntime(runtime);
  }

  if (runtime.gongfaId === "blazing-feather-art") {
    if (transformationId === "swift-molt") {
      const next = copyRuntime(runtime);
      next.combat.cooldownMs = Math.max(180, Math.floor(next.combat.cooldownMs * 0.7));
      return next;
    }
    if (["searing-quill", "feather-storm", "endless-plumage", "combat-molt", "last-feather",
      "phoenix-brand", "sun-chasing-wings", "ashen-pursuit"].includes(transformationId)) {
      return copyRuntime(runtime);
    }
  }

  if (runtime.gongfaId === "drifting-frost-needle") {
    if (transformationId === "swift-frost-point") {
      const next = copyRuntime(runtime);
      next.combat.cooldownMs = Math.max(180, Math.floor(next.combat.cooldownMs * 0.68));
      return next;
    }
    if (["army-breaking-lone-needle", "linked-pearl-thread", "still-water-focus",
      "moving-star-acupoint", "cold-soul-commitment", "reverse-star-trace",
      "seven-lodge-balance", "frost-sealed-instant"].includes(transformationId)) {
      return copyRuntime(runtime);
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
    if (transformationId === "piercing-furnace-needle") {
      const next = copyRuntime(runtime);
      next.combat.count = Math.max(1, next.combat.count - 1);
      next.combat.damage = Math.round(next.combat.damage * 1.2 * 100) / 100;
      return next;
    }

    if (transformationId === "scattered-furnace-needles") {
      const next = copyRuntime(runtime);
      next.combat.count += 2;
      next.combat.damage = Math.round(next.combat.damage * 0.78 * 100) / 100;
      return next;
    }

    if (transformationId === "volatile-furnace-core") {
      const next = copyRuntime(runtime);
      next.combat.cooldownMs = Math.max(280, Math.floor(next.combat.cooldownMs * 0.82));
      return next;
    }

    if (["sealed-leftover-needle", "star-furnace-resonance", "compressed-furnace",
      "furnace-heart-reforge", "myriad-edges-return", "falling-star-forge"].includes(transformationId)) {
      return copyRuntime(runtime);
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
      if (next.gongfaId === "jinfeng-gong") {
        next.authored.targetLedger[-307] = (next.authored.targetLedger[-307] ?? 0) + upgrade.value;
        return { runtime: next };
      }
      break;
    case "galeMomentumDecay":
      if (next.gongfaId === "jinfeng-gong") {
        next.authored.targetLedger[-308] = (next.authored.targetLedger[-308] ?? 1) * upgrade.value;
        return { runtime: next };
      }
      break;
    case "waveSynergy":
      if (next.gongfaId === "jinfeng-gong") {
        next.authored.targetLedger[-309] = (next.authored.targetLedger[-309] ?? 0) + upgrade.value;
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
