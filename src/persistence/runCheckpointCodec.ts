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

function isLinggenId(value: unknown): value is LinggenId {
  return isOneOf(value, Object.keys(linggenConfigs) as LinggenId[]);
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(isNumber);
}

function isGongfaMasteryCheckpoint(value: unknown): value is GongfaMasteryCheckpoint {
  return (
    isRecord(value) &&
    isGongfaId(value.gongfaId) &&
    isNonNegativeNumber(value.masteryPoints) &&
    isNonNegativeNumber(value.masteryRank) &&
    isStringArray(value.masteryLearnedIds) &&
    isStringArray(value.upgradeSelectionIds) &&
    (value.masterySkill2Id === undefined || typeof value.masterySkill2Id === "string") &&
    isNonNegativeNumber(value.masterySkill2CooldownRemaining) &&
    isNonNegativeNumber(value.masterySkill2Casts) &&
    typeof value.masteryChoiceActive === "boolean" &&
    isNumberArray(value.masteryPendingRanks)
  );
}

function isGongfaMasteryCheckpointArray(value: unknown): value is GongfaMasteryCheckpoint[] {
  return Array.isArray(value) && value.every(isGongfaMasteryCheckpoint);
}

function isGongfaRuntimeArray(value: unknown): value is GongfaRuntime[] {
  return (
    Array.isArray(value) &&
    value.every(
      (runtime) =>
        isRecord(runtime) &&
        isGongfaId(runtime.gongfaId) &&
        isNumber(runtime.attackCooldownRemaining) &&
        isRecord(runtime.combat) &&
        typeof runtime.combat.pattern === "string" &&
        typeof runtime.combat.projectileTexture === "string" &&
        Object.entries(runtime.combat).every(
          ([key, field]) =>
            key === "pattern" || key === "projectileTexture" || isNumber(field)
        ) &&
        isRecord(runtime.mastery) &&
        isGongfaMasteryCheckpoint({ gongfaId: runtime.gongfaId, ...runtime.mastery }) &&
        [
          runtime.yujian,
          runtime.jinfeng,
          runtime.gengjin,
          runtime.burningRing,
          runtime.crimsonFurnace,
          runtime.blazingFeather,
          runtime.surge
        ].every((state) => state === undefined || isRecord(state))
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
    !isNumberArray(value.masteryPendingRanks) ||
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

  if (value.finalBossPhaseIndex !== undefined && !isFinalBossPhaseIndex(value.finalBossPhaseIndex)) {
    return false;
  }

  if (value.spiritTreasureIds !== undefined && !isSpiritTreasureIdArray(value.spiritTreasureIds)) {
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
