import type { EnemyId } from "../data/enemies";
import type { StageId } from "../data/stages";
import type { EnemyPressureModifiers } from "../entities/Enemy";

export interface TribulationBossProfile {
  id: string;
  stage: StageId;
  name: string;
  subtitle: string;
  enemyId: EnemyId;
  healthMultiplier: number;
  damageMultiplier: number;
  speedMultiplier: number;
  displayScale: number;
  auraColor: number;
  addPool: readonly EnemyId[];
  initialAdds: number;
  addIntervalMs: number;
  addAmount: number;
  maxAdds: number;
  slamIntervalMs: number;
  slamRadius: number;
  slamDamage: number;
}

const stageTribulationBosses: Record<Exclude<StageId, "yuanying">, TribulationBossProfile> = {
  lianqi: {
    id: "stormfeather-calamity",
    stage: "lianqi",
    name: "Stormfeather Calamity",
    subtitle: "A thunder-crowned omen tests whether gathered Qi can endure.",
    enemyId: "bone-crow",
    healthMultiplier: 22,
    damageMultiplier: 1.6,
    speedMultiplier: 0.72,
    displayScale: 1.65,
    auraColor: 0x7fe8ff,
    addPool: ["mist-wolf", "bone-crow"],
    initialAdds: 2,
    addIntervalMs: 8_000,
    addAmount: 1,
    maxAdds: 4,
    slamIntervalMs: 5_200,
    slamRadius: 138,
    slamDamage: 16
  },
  zhuji: {
    id: "gravebound-foundation",
    stage: "zhuji",
    name: "Gravebound Foundation",
    subtitle: "A ruined cultivator rises to crush an unsteady Dao foundation.",
    enemyId: "corpse-cultivator",
    healthMultiplier: 18,
    damageMultiplier: 1.7,
    speedMultiplier: 0.85,
    displayScale: 1.75,
    auraColor: 0xc6a47b,
    addPool: ["bone-crow", "resentful-spirit"],
    initialAdds: 3,
    addIntervalMs: 7_000,
    addAmount: 2,
    maxAdds: 6,
    slamIntervalMs: 4_700,
    slamRadius: 158,
    slamDamage: 24
  },
  jindan: {
    id: "ninefold-thunder-warden",
    stage: "jindan",
    name: "Ninefold Thunder Warden",
    subtitle: "A celestial executioner descends to shatter the newborn Golden Core.",
    enemyId: "celestial-construct",
    healthMultiplier: 16,
    damageMultiplier: 1.8,
    speedMultiplier: 0.95,
    displayScale: 1.9,
    auraColor: 0xf4cf68,
    addPool: ["tribulation-shade", "celestial-construct"],
    initialAdds: 4,
    addIntervalMs: 6_000,
    addAmount: 2,
    maxAdds: 8,
    slamIntervalMs: 4_200,
    slamRadius: 178,
    slamDamage: 34
  }
};

export const finalTribulationBosses: readonly TribulationBossProfile[] = [
  {
    id: "heavenly-judgment-avatar",
    stage: "yuanying",
    name: "Heavenly Judgment Avatar",
    subtitle: "The first thunder seal takes form and hunts the Nascent Soul.",
    enemyId: "celestial-construct",
    healthMultiplier: 10,
    damageMultiplier: 1.2,
    speedMultiplier: 0.78,
    displayScale: 1.95,
    auraColor: 0xaeeaff,
    addPool: ["celestial-construct"],
    initialAdds: 2,
    addIntervalMs: 6_000,
    addAmount: 1,
    maxAdds: 6,
    slamIntervalMs: 4_000,
    slamRadius: 184,
    slamDamage: 28
  },
  {
    id: "myriad-calamity-sovereign",
    stage: "yuanying",
    name: "Myriad Calamity Sovereign",
    subtitle: "The storm grows a will of its own and calls every shadow to judgment.",
    enemyId: "tribulation-shade",
    healthMultiplier: 16,
    damageMultiplier: 1.3,
    speedMultiplier: 0.8,
    displayScale: 2.05,
    auraColor: 0xc89cff,
    addPool: ["tribulation-shade", "celestial-construct"],
    initialAdds: 2,
    addIntervalMs: 6_200,
    addAmount: 1,
    maxAdds: 6,
    slamIntervalMs: 4_000,
    slamRadius: 198,
    slamDamage: 32
  },
  {
    id: "heaven-rending-dao-eye",
    stage: "yuanying",
    name: "Heaven-Rending Dao Eye",
    subtitle: "The final eye opens as the last sanctuary collapses beneath it.",
    enemyId: "celestial-construct",
    healthMultiplier: 18,
    damageMultiplier: 1.4,
    speedMultiplier: 0.9,
    displayScale: 2.15,
    auraColor: 0xffdf78,
    addPool: ["celestial-construct", "tribulation-shade"],
    initialAdds: 3,
    addIntervalMs: 5_400,
    addAmount: 1,
    maxAdds: 8,
    slamIntervalMs: 3_600,
    slamRadius: 215,
    slamDamage: 38
  }
] as const;

export function getStageTribulationBoss(
  stage: Exclude<StageId, "yuanying">
): TribulationBossProfile {
  return stageTribulationBosses[stage];
}

export function getFinalTribulationBoss(phaseIndex: number): TribulationBossProfile {
  return finalTribulationBosses[phaseIndex] ?? finalTribulationBosses[0];
}

export function projectTribulationBossPressure(
  pressure: EnemyPressureModifiers,
  profile: TribulationBossProfile
): EnemyPressureModifiers {
  return {
    healthScale: pressure.healthScale * profile.healthMultiplier,
    contactDamageScale: pressure.contactDamageScale * profile.damageMultiplier,
    speedScale: pressure.speedScale * profile.speedMultiplier
  };
}
