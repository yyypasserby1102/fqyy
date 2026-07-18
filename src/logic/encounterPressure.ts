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

const stagePressure: Record<StageId, Pick<EncounterPressure, "healthScale" | "contactDamageScale" | "concurrentEnemyBudget">> = {
  lianqi: { healthScale: 1, contactDamageScale: 1, concurrentEnemyBudget: 16 },
  zhuji: { healthScale: 1.3, contactDamageScale: 1.15, concurrentEnemyBudget: 18 },
  jindan: { healthScale: 1.9, contactDamageScale: 1.45, concurrentEnemyBudget: 22 },
  yuanying: { healthScale: 2.7, contactDamageScale: 1.75, concurrentEnemyBudget: 26 }
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
    spawnIntervalScale: 0.68,
    spawnAmountBonus: 3,
    enemyBudgetBonus: 12,
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
  const gongfaHealthScale = stage === "jindan" || stage === "yuanying" ? 1.3 : 1.2;

  return {
    healthScale: roundScale(
      stageProfile.healthScale * phaseProfile.healthScale * gongfaHealthScale ** additionalGongfa
    ),
    contactDamageScale: roundScale(
      stageProfile.contactDamageScale *
        phaseProfile.contactDamageScale *
        1.1 ** additionalGongfa
    ),
    speedScale: phaseProfile.speedScale,
    spawnIntervalScale: phaseProfile.spawnIntervalScale,
    spawnAmountBonus: phaseProfile.spawnAmountBonus,
    concurrentEnemyBudget:
      stageProfile.concurrentEnemyBudget + phaseProfile.enemyBudgetBonus + additionalGongfa * 4,
    geometry: phaseProfile.geometry,
    composition:
      stage === "lianqi" && phase === "chuqi" && activeGongfaCount === 0
        ? ["jade-rat"]
        : [...phaseComposition[stage][phase]]
  };
}
