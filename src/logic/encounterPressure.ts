import type { RealmPhaseId, StageId } from "../data/stages";
import type { EnemyId } from "../data/enemies";

export type EncounterGeometry = "ring" | "pincer" | "flank" | "converge";

export interface EncounterPressure {
  healthScale: number;
  contactDamageScale: number;
  speedScale: number;
  spawnIntervalScale: number;
  spawnAmountBonus: number;
  concurrentEnemyBudget: number;
  geometry: EncounterGeometry;
  composition: EnemyId[];
}

const stagePressure: Record<StageId, Pick<EncounterPressure, "healthScale" | "contactDamageScale" | "speedScale" | "concurrentEnemyBudget">> = {
  lianqi: { healthScale: 1, contactDamageScale: 1, speedScale: 1, concurrentEnemyBudget: 16 },
  zhuji: { healthScale: 1.9, contactDamageScale: 1.4, speedScale: 1.06, concurrentEnemyBudget: 22 },
  jindan: { healthScale: 4.2, contactDamageScale: 1.75, speedScale: 1.14, concurrentEnemyBudget: 30 },
  yuanying: { healthScale: 6.4, contactDamageScale: 2.2, speedScale: 1.22, concurrentEnemyBudget: 38 }
};

const phasePressure: Record<RealmPhaseId, Omit<EncounterPressure, "concurrentEnemyBudget" | "composition"> & { enemyBudgetBonus: number }> = {
  chuqi: {
    healthScale: 1,
    contactDamageScale: 1,
    speedScale: 1,
    spawnIntervalScale: 1,
    spawnAmountBonus: 0,
    enemyBudgetBonus: 0,
    geometry: "ring"
  },
  zhongqi: {
    healthScale: 1.15,
    contactDamageScale: 1.1,
    speedScale: 1.15,
    spawnIntervalScale: 0.84,
    spawnAmountBonus: 1,
    enemyBudgetBonus: 4,
    geometry: "pincer"
  },
  houqi: {
    healthScale: 1.3,
    contactDamageScale: 1.2,
    speedScale: 1.35,
    spawnIntervalScale: 0.68,
    spawnAmountBonus: 3,
    enemyBudgetBonus: 8,
    geometry: "flank"
  },
  dayuanman: {
    healthScale: 1.4,
    contactDamageScale: 1.25,
    speedScale: 1.55,
    spawnIntervalScale: 0.54,
    spawnAmountBonus: 5,
    enemyBudgetBonus: 14,
    geometry: "converge"
  }
};

const phaseComposition: Record<StageId, Record<RealmPhaseId, EnemyId[]>> = {
  lianqi: {
    chuqi: ["jade-rat", "mist-wolf"],
    zhongqi: ["jade-rat", "mist-wolf"],
    houqi: ["mist-wolf", "bone-crow"],
    dayuanman: ["jade-rat", "mist-wolf", "bone-crow"]
  },
  zhuji: {
    chuqi: ["jade-rat", "mist-wolf"],
    zhongqi: ["mist-wolf", "bone-crow"],
    houqi: ["bone-crow", "corpse-cultivator"],
    dayuanman: ["mist-wolf", "bone-crow", "corpse-cultivator"]
  },
  jindan: {
    chuqi: ["corpse-cultivator"],
    zhongqi: ["corpse-cultivator", "resentful-spirit"],
    houqi: ["resentful-spirit", "bone-crow"],
    dayuanman: ["corpse-cultivator", "resentful-spirit", "bone-crow"]
  },
  yuanying: {
    chuqi: ["celestial-construct"],
    zhongqi: ["celestial-construct", "tribulation-shade"],
    houqi: ["tribulation-shade", "bone-crow"],
    dayuanman: ["celestial-construct", "tribulation-shade", "bone-crow"]
  }
};

function roundScale(value: number): number {
  return Math.round(value * 100) / 100;
}

export function projectEncounterPressure(
  stage: StageId,
  phase: RealmPhaseId,
  activeGongfaCount: number
): EncounterPressure {
  const stageProfile = stagePressure[stage];
  const phaseProfile = phasePressure[phase];
  const additionalGongfa = Math.max(0, activeGongfaCount - 1);
  const gongfaHealthScale: Record<StageId, number> = {
    lianqi: 1.2,
    zhuji: 1.5,
    jindan: 1.85,
    yuanying: 2.05
  };
  const stageSpawnIntervalScale: Record<StageId, number> = {
    lianqi: 1,
    zhuji: 0.94,
    jindan: 0.82,
    yuanying: 0.7
  };

  return {
    healthScale: roundScale(
      stageProfile.healthScale * phaseProfile.healthScale * gongfaHealthScale[stage] ** additionalGongfa
    ),
    contactDamageScale: roundScale(
      stageProfile.contactDamageScale *
        phaseProfile.contactDamageScale *
        1.08 ** additionalGongfa
    ),
    speedScale: roundScale(stageProfile.speedScale * phaseProfile.speedScale),
    spawnIntervalScale: roundScale(phaseProfile.spawnIntervalScale * stageSpawnIntervalScale[stage]),
    spawnAmountBonus: phaseProfile.spawnAmountBonus,
    concurrentEnemyBudget:
      stageProfile.concurrentEnemyBudget + phaseProfile.enemyBudgetBonus + additionalGongfa * 5,
    geometry: phaseProfile.geometry,
    composition:
      stage === "lianqi" && phase === "chuqi" && activeGongfaCount === 0
        ? ["jade-rat"]
        : [...phaseComposition[stage][phase]]
  };
}
