import type { EnemyId } from "./enemies";
import type { StageId } from "./stages";

export interface WaveSpawn {
  at: number;
  pool: EnemyId[];
  intervalMs: number;
  amount: number;
}

const lianqiWaveSpawns: WaveSpawn[] = [
  {
    at: 0,
    pool: ["jade-rat"],
    intervalMs: 1500,
    amount: 2
  },
  {
    at: 45_000,
    pool: ["jade-rat", "mist-wolf"],
    intervalMs: 1200,
    amount: 3
  },
  {
    at: 95_000,
    pool: ["mist-wolf", "bone-crow"],
    intervalMs: 1050,
    amount: 4
  },
  {
    at: 160_000,
    pool: ["jade-rat", "mist-wolf", "bone-crow"],
    intervalMs: 900,
    amount: 5
  }
];

const jindanWaveSpawns: WaveSpawn[] = [
  {
    at: 0,
    pool: ["corpse-cultivator"],
    intervalMs: 1500,
    amount: 2
  },
  {
    at: 45_000,
    pool: ["corpse-cultivator", "resentful-spirit"],
    intervalMs: 1200,
    amount: 3
  },
  {
    at: 95_000,
    pool: ["resentful-spirit", "bone-crow"],
    intervalMs: 1050,
    amount: 4
  },
  {
    at: 160_000,
    pool: ["corpse-cultivator", "resentful-spirit", "bone-crow"],
    intervalMs: 900,
    amount: 5
  }
];

const yuanyingWaveSpawns: WaveSpawn[] = [
  {
    at: 0,
    pool: ["celestial-construct"],
    intervalMs: 1450,
    amount: 2
  },
  {
    at: 45_000,
    pool: ["celestial-construct", "tribulation-shade"],
    intervalMs: 1150,
    amount: 3
  },
  {
    at: 95_000,
    pool: ["tribulation-shade", "celestial-construct"],
    intervalMs: 1000,
    amount: 4
  },
  {
    at: 160_000,
    pool: ["celestial-construct", "tribulation-shade"],
    intervalMs: 850,
    amount: 5
  }
];

export const waveSpawns: WaveSpawn[] = lianqiWaveSpawns;

export const stageWaveSpawns: Record<StageId, WaveSpawn[]> = {
  lianqi: lianqiWaveSpawns,
  zhuji: lianqiWaveSpawns,
  jindan: jindanWaveSpawns,
  yuanying: yuanyingWaveSpawns
};
