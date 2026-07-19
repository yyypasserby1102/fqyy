import { gongfaConfigs, type GongfaId } from "../data/gongfa";
import { linggenConfigs, type LinggenId } from "../data/linggen";
import { realmPhaseOrder, stageOrder } from "../data/stages";
import { spiritTreasureConfigs, type SpiritTreasureId } from "../data/spiritTreasures";
import type {
  ActiveRunCheckpoint,
  ActiveRunSave,
  HealingPillCheckpoint
} from "./runPersistence";
import type { GongfaMasteryCheckpoint, GongfaRuntime } from "../logic/gongfaRuntime";
import {
  isRunJourneyDecisionLegal,
  type RunJourneyDecision
} from "../logic/runJourney";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function isGongfaId(value: unknown): value is GongfaId {
  return isOneOf(value, Object.keys(gongfaConfigs) as GongfaId[]);
}

function isGongfaIdArray(value: unknown): value is GongfaId[] {
  return Array.isArray(value) && value.every(isGongfaId);
}

function isSpiritTreasureIdArray(value: unknown): value is SpiritTreasureId[] {
  const ids = Object.keys(spiritTreasureConfigs) as SpiritTreasureId[];
  return Array.isArray(value) && value.every((item) => isOneOf(item, ids));
}

function isSpiritTreasureAttunementArray(value: unknown): boolean {
  return Array.isArray(value) && value.every(
    (entry) =>
      isRecord(entry) &&
      isOneOf(entry.id, Object.keys(spiritTreasureConfigs) as SpiritTreasureId[]) &&
      (entry.rank === 1 || entry.rank === 2 || entry.rank === 3)
  );
}

function isLinggenId(value: unknown): value is LinggenId {
  return isOneOf(value, Object.keys(linggenConfigs) as LinggenId[]);
}

function isPositiveIntegerArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => Number.isInteger(item) && item > 0);
}

function isGongfaMasteryCheckpoint(value: unknown): value is GongfaMasteryCheckpoint {
  return (
    isRecord(value) &&
    isGongfaId(value.gongfaId) &&
    isNonNegativeNumber(value.masteryPoints) &&
    isNonNegativeNumber(value.masteryRank) && Number.isInteger(value.masteryRank) &&
    isStringArray(value.masteryLearnedIds) &&
    isStringArray(value.upgradeSelectionIds) &&
    (value.masterySkill2Id === undefined || typeof value.masterySkill2Id === "string") &&
    isNonNegativeNumber(value.masterySkill2CooldownRemaining) &&
    isNonNegativeNumber(value.masterySkill2Casts) &&
    typeof value.masteryChoiceActive === "boolean" &&
    isPositiveIntegerArray(value.masteryPendingRanks)
  );
}

function isGongfaMasteryCheckpointArray(value: unknown): value is GongfaMasteryCheckpoint[] {
  return Array.isArray(value) && value.every(isGongfaMasteryCheckpoint);
}

const combatNumberFields = [
  "tint", "damage", "cooldownMs", "count", "pierce", "projectileSpeed",
  "projectileLifetimeMs", "spreadDeg", "auraRadius", "retaliationDamage", "range",
  "returnShots", "shellBursts"
] as const;

const subtypeNumberFields = {
  yujian: ["executionSealTriggers", "swordBloomTriggers", "reversingSwordPathTriggers", "intentStacks", "intentDurationRemaining", "intentAppliedDamageBonus", "intentAppliedSpeedBonus", "intentAppliedPierceBonus"],
  jinfeng: ["momentum", "momentumBuildRate", "momentumDecayRate", "momentumWaveBonus", "momentumAppliedRangeBonus", "momentumAppliedSpreadBonus", "momentumAppliedLifetimeBonus", "walkingStormCooldownRemaining"],
  gengjin: ["guardValue", "guardBuildRate", "guardDecayRate", "guardMitigation", "guardMitigationBonus", "guardAppliedRetaliationBonus", "guardAppliedAuraBonus", "guardAppliedDamageBonus", "bladeShellCharge", "bladeShellThreshold", "bladeShellCooldownRemaining", "bladeShellCasts", "gengjinPulseCooldownRemaining"],
  burningRing: ["heat", "heatBuildRate", "heatDecayRate", "heatAppliedCooldownBonus", "heatAuraSpeedBonus", "ringSegments", "counterflowRingSegments", "counterflowRingAppliedSegments", "counterflowRingRadiusBonus", "counterflowRingCooldownRemaining", "solarFlareCooldownRemaining", "solarFlareCasts", "sunspotCooldownRemaining"],
  crimsonFurnace: ["pressure", "pressureBuildRate", "pressureDecayRate", "pressureAppliedRadiusBonus", "pressureRadiusScale", "embedThreshold", "furnaceCascadeCooldownRemaining", "furnaceCascadeCasts", "networkIgnitionCooldownRemaining"],
  blazingFeather: ["emberStacks", "emberDurationRemaining", "emberAppliedDamageBonus"],
  surge: ["stacks", "durationRemaining", "appliedDamageBonus"]
} as const;

type RuntimeSubtype = keyof typeof subtypeNumberFields;

const runtimeSubtypeByGongfa: Record<GongfaId, RuntimeSubtype | undefined> = {
  "yujian-jue": "yujian",
  "jinfeng-gong": "jinfeng",
  "gengjin-huti": "gengjin",
  "burning-ring-scripture": "burningRing",
  "crimson-furnace-sword-art": "crimsonFurnace",
  "blazing-feather-art": undefined,
  "scarlet-wave-manual": "surge",
  "drifting-frost-needle": undefined,
  "black-tide-scripture": "surge",
  "ice-mirror-guard": undefined,
  "green-vine-art": "surge",
  "verdant-ring-scripture": undefined,
  "ironwood-wave-form": undefined,
  "nine-sun-calamity-seal": "surge",
  "mist-wraith-canon": undefined,
  "heavenfall-body-art": "surge",
  "thousand-root-formation": undefined,
  "flame-demon-body-art": undefined,
  "vermilion-bird-covenant": "surge",
  "frozen-river-formation": undefined,
  "moonfall-tide-ritual": "surge",
  "sword-burial-formation": undefined,
  "heaven-sundering-edict": "surge",
  "myriad-beast-grove": "surge",
  "ancient-tree-body-art": "surge"
};

function hasNonNegativeFields(value: unknown, fields: readonly string[]): value is Record<string, unknown> {
  return isRecord(value) && fields.every((field) => isNonNegativeNumber(value[field]));
}

function isRuntimeSubtypeState(runtime: Record<string, unknown>, gongfaId: GongfaId): boolean {
  const expectedSubtype = runtimeSubtypeByGongfa[gongfaId];
  const presentSubtypes = (Object.keys(subtypeNumberFields) as RuntimeSubtype[])
    .filter((subtype) => runtime[subtype] !== undefined);
  // These Gongfa used the shared Surge subtype before their authored redesigns.
  // Accept legacy payloads for migration while new checkpoints carry no subtype.
  if (["drifting-frost-needle", "ice-mirror-guard", "ironwood-wave-form", "flame-demon-body-art", "mist-wraith-canon", "frozen-river-formation", "sword-burial-formation", "thousand-root-formation"].includes(gongfaId) && presentSubtypes.length === 1 && presentSubtypes[0] === "surge") {
    return hasNonNegativeFields(runtime.surge, subtypeNumberFields.surge);
  }
  if (gongfaId === "blazing-feather-art" && presentSubtypes.length === 1 && presentSubtypes[0] === "blazingFeather") {
    return hasNonNegativeFields(runtime.blazingFeather, subtypeNumberFields.blazingFeather);
  }
  if (expectedSubtype === undefined) return presentSubtypes.length === 0;
  if (presentSubtypes.length !== 1 || presentSubtypes[0] !== expectedSubtype) return false;
  const state = runtime[expectedSubtype];
  if (!hasNonNegativeFields(state, subtypeNumberFields[expectedSubtype])) return false;
  if (expectedSubtype === "gengjin" && isRecord(state) &&
      state.isMoving !== undefined && typeof state.isMoving !== "boolean") return false;
  if (expectedSubtype === "yujian") {
    const stacks = state.executionSealStacksByTarget;
    return isRecord(stacks) && Object.values(stacks).every(isNonNegativeNumber);
  }
  return true;
}

function isGongfaRuntimeArray(value: unknown): value is GongfaRuntime[] {
  return (
    Array.isArray(value) &&
    value.every(
      (runtime) =>
        isRecord(runtime) &&
        isGongfaId(runtime.gongfaId) &&
        isNonNegativeNumber(runtime.attackCooldownRemaining) &&
        isRecord(runtime.combat) &&
        runtime.combat.pattern === gongfaConfigs[runtime.gongfaId].pattern &&
        typeof runtime.combat.projectileTexture === "string" &&
        hasNonNegativeFields(runtime.combat, combatNumberFields) &&
        isRecord(runtime.mastery) &&
        isGongfaMasteryCheckpoint({ gongfaId: runtime.gongfaId, ...runtime.mastery }) &&
        isRuntimeSubtypeState(runtime, runtime.gongfaId)
    )
  );
}

function isHealingPillCheckpointArray(value: unknown): value is HealingPillCheckpoint[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        isNumber(item.x) &&
        isNumber(item.y) &&
        isNumber(item.healAmount) &&
        item.healAmount > 0
    )
  );
}

function isFinalBossPhaseIndex(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value) && value >= 0 && value <= 2;
}

function isPendingJourneyDecision(value: unknown): value is RunJourneyDecision | undefined {
  if (value === undefined) {
    return true;
  }
  if (!isRecord(value)) {
    return false;
  }
  if (value.kind === "phase-transition") {
    return isOneOf(value.nextPhase, ["zhongqi", "houqi", "dayuanman"] as const);
  }
  if (value.kind === "tribulation") {
    return isOneOf(value.stage, stageOrder);
  }
  if (value.kind === "yuanying-tribulation") {
    return true;
  }
  return value.kind === "final-boss-phase" && isFinalBossPhaseIndex(value.nextPhaseIndex);
}

function isPercent(value: unknown): value is number {
  return isNumber(value) && value >= 0 && value <= 100;
}

function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

function isOptionalPositiveNumber(value: unknown): boolean {
  return value === undefined || isPositiveNumber(value);
}

function isOptionalNonNegativeNumber(value: unknown): boolean {
  return value === undefined || isNonNegativeNumber(value);
}

function isActiveRunCheckpoint(value: unknown): value is ActiveRunCheckpoint {
  if (!isRecord(value)) {
    return false;
  }

  const requiredNumbers = [
    "realmProgress",
    "foundationGrowthTransactions",
    "masteryPoints",
    "masteryRank",
    "masterySkill2CooldownRemaining",
    "masterySkill2Casts",
    "galeMomentum",
    "galeMomentumBuildRate",
    "galeMomentumDecayRate",
    "galeMomentumWaveBonus",
    "galeMomentumAppliedRangeBonus",
    "galeMomentumAppliedSpreadBonus",
    "galeMomentumAppliedLifetimeBonus",
    "heat",
    "heatBuildRate",
    "heatDecayRate",
    "heatAppliedCooldownBonus",
    "heatAuraSpeedBonus",
    "ringSegments",
    "counterflowRingSegments",
    "counterflowRingAppliedSegments",
    "counterflowRingRadiusBonus",
    "counterflowRingCooldownRemaining",
    "solarFlareCooldownRemaining",
    "solarFlareCasts",
    "crimsonPressure",
    "crimsonPressureBuildRate",
    "crimsonPressureDecayRate",
    "crimsonPressureAppliedRadiusBonus",
    "crimsonPressureRadiusScale",
    "crimsonEmbedThreshold",
    "furnaceCascadeCooldownRemaining",
    "furnaceCascadeCasts",
    "guardValue",
    "guardBuildRate",
    "guardDecayRate",
    "guardMitigation",
    "guardAppliedRetaliationBonus",
    "guardAppliedAuraBonus",
    "guardAppliedDamageBonus",
    "bladeShellCharge",
    "bladeShellThreshold",
    "bladeShellCooldownRemaining",
    "bladeShellCasts",
    "lingcaoX",
    "lingcaoY",
    "kills",
    "elapsedMs"
  ];

  if (!requiredNumbers.every((key) => isNumber(value[key]))) {
    return false;
  }

  if (!isPercent(value.realmProgress)) {
    return false;
  }

  if (
    !isNonNegativeNumber(value.foundationGrowthTransactions) ||
    !isNonNegativeNumber(value.masteryPoints) ||
    !isNonNegativeNumber(value.masteryRank) ||
    !isNonNegativeNumber(value.masterySkill2CooldownRemaining) ||
    !isNonNegativeNumber(value.masterySkill2Casts) ||
    !isNonNegativeNumber(value.kills) ||
    !isNonNegativeNumber(value.elapsedMs)
  ) {
    return false;
  }
  if (
    value.foundationGrowthAppliedTransactions !== undefined &&
    !isNonNegativeNumber(value.foundationGrowthAppliedTransactions)
  ) {
    return false;
  }

  if (
    !isOptionalNonNegativeNumber(value.playerHealth) ||
    !isOptionalPositiveNumber(value.playerMaxHealth) ||
    !isOptionalPositiveNumber(value.playerMoveSpeed) ||
    !isOptionalNonNegativeNumber(value.playerMagnetRadius) ||
    !isOptionalNonNegativeNumber(value.playerDamageReduction)
  ) {
    return false;
  }

  if (
    !isOneOf(value.stage, stageOrder) ||
    !isOneOf(value.realmPhase, realmPhaseOrder) ||
    typeof value.phaseCleanupActive !== "boolean" ||
    typeof value.masteryChoiceActive !== "boolean" ||
    !isLinggenId(value.hiddenLinggenId) ||
    typeof value.lingcaoCollected !== "boolean" ||
    typeof value.lingcaoMarker !== "string" ||
    !isStringArray(value.masteryLearnedIds) ||
    !isGongfaIdArray(value.learnedGongfaIds) ||
    !isPositiveIntegerArray(value.masteryPendingRanks) ||
    !isHealingPillCheckpointArray(value.healingPills)
  ) {
    return false;
  }

  if (value.upgradeSelectionIds !== undefined && !isStringArray(value.upgradeSelectionIds)) {
    return false;
  }

  if (
    value.gongfaMasteries !== undefined &&
    !isGongfaMasteryCheckpointArray(value.gongfaMasteries)
  ) {
    return false;
  }

  if (value.gongfaRuntimes !== undefined && !isGongfaRuntimeArray(value.gongfaRuntimes)) {
    return false;
  }

  if (value.masterySkill2Id !== undefined && typeof value.masterySkill2Id !== "string") {
    return false;
  }

  if (value.revealedLinggenId !== undefined && !isLinggenId(value.revealedLinggenId)) {
    return false;
  }

  if (value.mainGongfaId !== undefined && !isGongfaId(value.mainGongfaId)) {
    return false;
  }

  if (value.guardMitigationBonus !== undefined && !isNumber(value.guardMitigationBonus)) {
    return false;
  }

  if (value.finalBossActive !== undefined && typeof value.finalBossActive !== "boolean") {
    return false;
  }

  if (value.tribulationActive !== undefined && typeof value.tribulationActive !== "boolean") {
    return false;
  }

  if (value.finalBossPhaseIndex !== undefined && !isFinalBossPhaseIndex(value.finalBossPhaseIndex)) {
    return false;
  }

  if (!isPendingJourneyDecision(value.pendingDecision)) {
    return false;
  }
  if (
    value.pendingDecision !== undefined &&
    !isRunJourneyDecisionLegal(
      {
        stage: value.stage,
        realmPhase: value.realmPhase,
        realmProgress: value.realmProgress,
        phaseCleanupActive: value.phaseCleanupActive,
        finalBossActive: value.finalBossActive as boolean | undefined,
        finalBossPhaseIndex: value.finalBossPhaseIndex as number | undefined
      },
      value.pendingDecision
    )
  ) {
    return false;
  }

  if (value.spiritTreasureIds !== undefined && !isSpiritTreasureIdArray(value.spiritTreasureIds)) {
    return false;
  }
  if (
    value.spiritTreasureAttunements !== undefined &&
    !isSpiritTreasureAttunementArray(value.spiritTreasureAttunements)
  ) {
    return false;
  }

  return true;
}

function normalizeActiveRunCheckpoint(checkpoint: ActiveRunCheckpoint): ActiveRunCheckpoint {
  const legacyPrimaryMastery = checkpoint.mainGongfaId
    ? [{
        gongfaId: checkpoint.mainGongfaId,
        masteryPoints: checkpoint.masteryPoints,
        masteryRank: checkpoint.masteryRank,
        masteryLearnedIds: [...checkpoint.masteryLearnedIds],
        upgradeSelectionIds: [...(checkpoint.upgradeSelectionIds ?? [])],
        masterySkill2Id: checkpoint.masterySkill2Id,
        masterySkill2CooldownRemaining: checkpoint.masterySkill2CooldownRemaining,
        masterySkill2Casts: checkpoint.masterySkill2Casts,
        masteryChoiceActive: checkpoint.masteryChoiceActive,
        masteryPendingRanks: [...checkpoint.masteryPendingRanks]
      }]
    : [];
  return {
    ...checkpoint,
    upgradeSelectionIds: checkpoint.upgradeSelectionIds ?? [],
    guardMitigationBonus: checkpoint.guardMitigationBonus ?? 0,
    foundationGrowthAppliedTransactions:
      checkpoint.foundationGrowthAppliedTransactions ?? 0,
    finalBossActive: checkpoint.finalBossActive ?? false,
    finalBossPhaseIndex: checkpoint.finalBossPhaseIndex ?? 0,
    spiritTreasureIds: checkpoint.spiritTreasureIds ?? [],
    gongfaMasteries: checkpoint.gongfaMasteries ?? legacyPrimaryMastery
  };
}

export function decodeActiveRunCheckpoint(value: unknown): ActiveRunCheckpoint | null {
  if (!isActiveRunCheckpoint(value)) {
    return null;
  }

  return normalizeActiveRunCheckpoint(value);
}

export function decodeActiveRunSave(value: unknown): ActiveRunSave | null {
  if (!isRecord(value)) {
    return null;
  }

  const checkpoint =
    value.checkpoint === undefined ? undefined : decodeActiveRunCheckpoint(value.checkpoint);

  if (
    value.version === 0 &&
    typeof value.seed === "number" &&
    typeof value.startedAt === "number" &&
    checkpoint !== null
  ) {
    return {
      version: 1,
      seed: value.seed,
      startedAt: value.startedAt,
      lifecycle: "mortal",
      checkpoint
    };
  }

  if (
    value.version !== 1 ||
    typeof value.seed !== "number" ||
    typeof value.startedAt !== "number" ||
    value.lifecycle !== "mortal" ||
    checkpoint === null
  ) {
    return null;
  }

  if (value.selectedLinggenId !== undefined && !isLinggenId(value.selectedLinggenId)) {
    return null;
  }

  return {
    version: 1,
    seed: value.seed,
    startedAt: value.startedAt,
    lifecycle: "mortal",
    ...(value.selectedLinggenId ? { selectedLinggenId: value.selectedLinggenId } : {}),
    checkpoint
  };
}

export function encodeActiveRunSave(save: ActiveRunSave): string {
  return JSON.stringify(save);
}
