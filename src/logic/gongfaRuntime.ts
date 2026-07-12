import {
  gongfaConfigs,
  type GongfaId,
  type GongfaPattern,
  type GongfaStageState
} from "../data/gongfa";
import {
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
import { getRank10Skill2Id, hasAvailableGongfaRefinement } from "./mastery";

export interface GongfaCombatState extends GongfaStageState {
  pattern: GongfaPattern;
  projectileTexture: string;
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
      isMoving?: boolean;
      skill2Enabled?: boolean;
      skill2Id?: string;
      learnedMasteryIds?: string[];
    }
  | { kind: "projectile-hit"; damage: number; learnedMasteryIds?: string[] }
  | { kind: "jinfeng-wave-hit"; learnedMasteryIds?: string[] }
  | { kind: "blazing-feather-hit"; learnedMasteryIds?: string[] }
  | { kind: "surge-hit"; learnedMasteryIds?: string[] }
  | { kind: "gengjin-defensive-hit"; learnedMasteryIds?: string[] }
  | { kind: "evade"; learnedMasteryIds?: string[] }
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
  | { kind: "skill2"; skill2Id?: string }
  | { kind: "incoming-damage"; amount: number; skill2Id?: string; learnedMasteryIds?: string[] }
  | { kind: "crimson-detonation"; x: number; y: number; damage: number; fromEmbed: boolean };

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
      masteryCast: MasterySkill2Cast;
    }
  | {
      kind: "blade-shell-rebound";
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
  | "ironwood-surge-form";

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
  }
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
  "ironwood-surge-form": "ironwood-wave-form"
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
  rankUp?: {
    previousRank: number;
    targetRank: number;
  };
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
  }
): GongfaCollectionMasteryResult {
  const byId: Partial<Record<GongfaId, GongfaRuntime>> = { ...collection.byId };
  const rankUps: GongfaCollectionMasteryResult["rankUps"] = [];

  for (const [gongfaId, current] of Object.entries(collection.byId) as Array<
    [GongfaId, GongfaRuntime]
  >) {
    const result = advanceGongfaMasteryProgress(current.mastery, {
      gongfaId,
      points: typeof context.points === "function" ? context.points(gongfaId) : context.points,
      finalBossActive: context.finalBossActive,
      learnedIds: current.mastery.masteryLearnedIds
    });
    byId[gongfaId] = { ...current, mastery: result.state as GongfaMasteryCheckpointFields };
    if (result.rankUp) {
      rankUps.push({ gongfaId, ...result.rankUp });
    }
  }

  return { runtime: { ...collection, byId }, rankUps };
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
    cooldownRemainingMs: nextCooldownRemainingMs,
    readySkill2Id: plan.intent
  };
}

export function recordMasterySkill2Cast(
  state: MasterySkill2CastState,
  command: GongfaRuntimeCommand
): MasterySkill2CastState {
  if (!("masteryCast" in command)) {
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
  const targetRank = Math.floor(next.masteryPoints / 100);
  if (targetRank <= state.masteryRank) {
    return { state: next };
  }

  next.masteryRank = targetRank;
  for (let rank = previousRank + 1; rank <= targetRank; rank += 1) {
    if (rank === 10) {
      next.masterySkill2Id = getRank10Skill2Id(context.gongfaId);
      next.masterySkill2CooldownRemaining = getAuthoredSkill2CooldownMs(next.masterySkill2Id);
      continue;
    }

    if (!next.masteryPendingRanks.includes(rank)) {
      next.masteryPendingRanks.push(rank);
    }
  }

  next.masteryChoiceActive = context.finalBossActive ? false : next.masteryPendingRanks.length > 0;

  return {
    state: next,
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

function buildGenericTimedSkill2Commands(
  runtime: GongfaRuntime,
  skill2: AuthoredSkill2Plan
): GongfaRuntimeCommand[] {
  const masteryCast: MasterySkill2Cast = {
    skill2Id: skill2.intent,
    cooldownMs: skill2.cooldownMs
  };
  const commands: GongfaRuntimeCommand[] = [
    {
      kind: "mastery-skill2-cast",
      masteryCast
    }
  ];

  if (runtime.combat.pattern === "homing") {
    commands.push({
      kind: "homing-volley",
      count: Math.max(2, runtime.combat.count + 2),
      transformationTriggers: emptyYujianTransformationTriggers
    });
    return commands;
  }

  if (runtime.combat.pattern === "wave") {
    commands.push({
      kind: "wave-volley",
      count: Math.max(3, runtime.combat.count + 2),
      returnShots: runtime.combat.returnShots + 1,
      aimMode: "nearest"
    });
    return commands;
  }

  commands.push({
    kind: "aura-burst",
    damage: Math.max(1, Math.floor(runtime.combat.damage * 1.35)),
    count: Math.max(8, runtime.combat.count + 4)
  });
  return commands;
}

function buildCrimsonFragmentSpec(runtime: GongfaRuntime): CrimsonFragmentSpec {
  return {
    radius: 220,
    maxTargets: 2,
    delayMs: 100,
    delayStepMs: 60,
    damage: Math.max(4, Math.floor(runtime.combat.damage * 0.45)),
    speed: runtime.combat.projectileSpeed + 80,
    lifetimeMs: Math.max(420, runtime.combat.projectileLifetimeMs - 120)
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
  intentAppliedPierceBonus: 0
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
  if (state.stacks >= MAX_SURGE_STACKS && learned(learnedMasteryIds, SURGE_BURST_IDS)) {
    bonus += 3;
  }
  if (learned(learnedMasteryIds, SURGE_CROWN_IDS)) {
    bonus += state.stacks;
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
  const desiredDamageBonus = state.intentStacks * 2;
  const desiredSpeedBonus = state.intentStacks * 24;
  const desiredPierceBonus = state.intentStacks >= 5 ? 1 : 0;

  runtime.combat.damage += desiredDamageBonus - state.intentAppliedDamageBonus;
  runtime.combat.projectileSpeed += desiredSpeedBonus - state.intentAppliedSpeedBonus;
  runtime.combat.pierce += desiredPierceBonus - state.intentAppliedPierceBonus;

  state.intentAppliedDamageBonus = desiredDamageBonus;
  state.intentAppliedSpeedBonus = desiredSpeedBonus;
  state.intentAppliedPierceBonus = desiredPierceBonus;
}

function copyRuntime(runtime: GongfaRuntime): GongfaRuntime {
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
    surge: runtime.surge ? { ...runtime.surge } : undefined
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

  const runtime: GongfaRuntime = {
    gongfaId: input.gongfaId,
    attackCooldownRemaining: 0,
    mastery: {
      ...createEmptyGongfaMastery(),
      ...input.mastery,
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
      : undefined
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

  if (facts.sourceGongfaId === "blazing-feather-art" && next.blazingFeather) {
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

  if (facts.sourceGongfaId && surgeGongfaIdSet.has(facts.sourceGongfaId) && next.surge) {
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

  return 0;
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
      const skillResult = advanceGongfaRuntime(next, { kind: "skill2" });
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
    const intentGain = event.learnedMasteryIds.includes("myriad-blade-resonance") ? 2 : 1;
    state.intentStacks = Math.min(5, state.intentStacks + intentGain);
    state.intentDurationRemaining = INTENT_DURATION_MS;
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
    if (event.skill2Id === "returning-sword-formation" && next.yujian) {
      commands.push({
        kind: "returning-sword-formation",
        count: Math.max(1, next.combat.count),
        opening: {
          damage: Math.floor(next.combat.damage * 0.72),
          pierce: next.combat.pierce + 1,
          speed: next.combat.projectileSpeed + 55,
          lifetimeMs: next.combat.projectileLifetimeMs + 280
        },
        returnPath: {
          delayMs: 240,
          damage: Math.floor(next.combat.damage * 0.58),
          pierce: next.combat.pierce + 1,
          speed: next.combat.projectileSpeed + 75,
          lifetimeMs: next.combat.projectileLifetimeMs + 340
        },
        masteryCast: {
          skill2Id: "returning-sword-formation",
          cooldownMs: authoredSkill2Plans["returning-sword-formation"].cooldownMs
        }
      });
    }
    if (event.skill2Id === "golden-gale-corridor" && next.jinfeng) {
      commands.push({
        kind: "golden-gale-corridor",
        burstCount: 3,
        burstDelayMs: 180,
        laneCount: Math.max(3, Math.min(5, 3 + Math.floor(next.combat.count / 2))),
        spreadDeg: Math.max(8, next.combat.spreadDeg * 0.4),
        forwardOffset: {
          start: 32,
          step: 26
        },
        sidewaysSpacing: 12,
        projectile: {
          damage: Math.floor(next.combat.damage * 0.8),
          pierce: next.combat.pierce + 1,
          speed: next.combat.projectileSpeed + 25,
          lifetimeMs: next.combat.projectileLifetimeMs + Math.floor(next.combat.range * 0.9),
          scale: 0.92
        },
        masteryCast: {
          skill2Id: "golden-gale-corridor",
          cooldownMs: authoredSkill2Plans["golden-gale-corridor"].cooldownMs
        }
      });
    }
    if (event.skill2Id === "furnace-cascade" && next.crimsonFurnace) {
      next.crimsonFurnace.furnaceCascadeCasts += 1;
      commands.push({
        kind: "furnace-cascade",
        sourceDamage: {
          embedPowerMultiplier: 1,
          stackDamage: 3
        },
        fragment: buildCrimsonFragmentSpec(next),
        masteryCast: {
          skill2Id: "furnace-cascade",
          cooldownMs: authoredSkill2Plans["furnace-cascade"].cooldownMs
        }
      });
    }
    const skill2 = getAuthoredSkill2Plan(event.skill2Id);
    if (
      skill2?.trigger === "timed" &&
      skill2GongfaIds[skill2.intent] === next.gongfaId &&
      !commands.some((command) => "masteryCast" in command)
    ) {
      commands.push(...buildGenericTimedSkill2Commands(next, skill2));
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
    const gain = event.learnedMasteryIds.includes("ember-cascade") ? 2 : 1;
    state.emberStacks = Math.min(MAX_EMBER_STACKS, state.emberStacks + gain);
    state.emberDurationRemaining = EMBER_DURATION_MS;
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
    const gain = learned(event.learnedMasteryIds, SURGE_CASCADE_IDS) ? 2 : 1;
    state.stacks = Math.min(MAX_SURGE_STACKS, state.stacks + gain);
    state.durationRemaining = SURGE_DURATION_MS;
    syncSurgeCombat(next);
    // Domain: hits leave a stack-scaled field.
    if (learned(event.learnedMasteryIds, SURGE_DOMAIN_IDS) && state.stacks > 0) {
      commands.push({
        kind: "aura-burst",
        damage: Math.max(1, Math.floor(next.combat.damage * 0.35)),
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
      const count = Math.max(1, next.combat.count + next.surge.stacks);
      if (next.combat.pattern === "wave") {
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
          masteryCast: {
            skill2Id: "blade-shell-rebound",
            cooldownMs: authoredSkill2Plans["blade-shell-rebound"].cooldownMs
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
      const floor = learned(surgeLearned, SURGE_HOLD_IDS) && next.surge.stacks >= 3 ? 3 : 0;
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
          masteryCast: {
            skill2Id: "blade-shell-rebound",
            cooldownMs: authoredSkill2Plans["blade-shell-rebound"].cooldownMs
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
    state.solarFlareCooldownRemaining = Math.max(
      0,
      state.solarFlareCooldownRemaining - Math.max(0, event.deltaMs)
    );
    if (state.solarFlareCooldownRemaining === 0) {
      state.solarFlareCasts += 1;
      state.solarFlareCooldownRemaining = skill2.cooldownMs;
      commands.push({
        kind: "solar-flare-cycle",
        segmentCount: Math.max(
          6,
          state.ringSegments + state.counterflowRingAppliedSegments
        ),
        ringRadius: 32 + Math.floor(state.heat * 0.3) + state.counterflowRingRadiusBonus,
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
  options: { learnedMasteryIds?: string[] } = {}
): GongfaRuntimeCommand[] {
  options = {
    learnedMasteryIds: options.learnedMasteryIds ?? runtime.mastery.masteryLearnedIds
  };
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
      next.combat.damage += 4;
      return next;
    }

    if (transformationId === "feather-storm") {
      const next = copyRuntime(runtime);
      next.combat.count += 3;
      next.combat.spreadDeg += 18;
      return next;
    }

    if (transformationId === "swift-molt") {
      const next = copyRuntime(runtime);
      next.combat.cooldownMs = Math.max(180, Math.floor(next.combat.cooldownMs * 0.78));
      next.combat.projectileSpeed += 80;
      return next;
    }
  }

  if (runtime.surge) {
    if (SURGE_FOCUS_IDS.has(transformationId)) {
      const next = copyRuntime(runtime);
      next.combat.pierce += 2;
      next.combat.count = Math.max(1, next.combat.count - 1);
      next.combat.damage += 4;
      return next;
    }
    if (SURGE_SPREAD_IDS.has(transformationId)) {
      const next = copyRuntime(runtime);
      next.combat.count += 2;
      next.combat.spreadDeg += 18;
      return next;
    }
    if (SURGE_QUICKEN_IDS.has(transformationId)) {
      const next = copyRuntime(runtime);
      next.combat.cooldownMs = Math.max(180, Math.floor(next.combat.cooldownMs * 0.8));
      next.combat.projectileSpeed += 60;
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

  switch (upgrade.effect) {
    case "methodDamage":
      next.combat.damage += upgrade.value;
      return { runtime: next };
    case "methodCooldown":
      next.combat.cooldownMs = Math.max(180, Math.floor(next.combat.cooldownMs * upgrade.value));
      return { runtime: next };
    case "methodCount":
      next.combat.count += upgrade.value;
      if (upgradeId === "counterflow-ring" && next.burningRing) {
        next.burningRing.counterflowRingSegments += 1;
        next.burningRing.counterflowRingAppliedSegments =
          next.burningRing.counterflowRingSegments;
      }
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
