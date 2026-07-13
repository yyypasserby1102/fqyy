export type EnemyId =
  | "jade-rat"
  | "mist-wolf"
  | "bone-crow"
  | "corpse-cultivator"
  | "resentful-spirit"
  | "celestial-construct"
  | "tribulation-shade";

export interface EnemyConfig {
  id: EnemyId;
  name: string;
  maxHealth: number;
  speed: number;
  touchDamage: number;
  xpDrop: number;
  weight: number;
  tint: number;
}

export const enemyConfigs: Record<EnemyId, EnemyConfig> = {
  "jade-rat": {
    id: "jade-rat",
    name: "Jade Burrow Rat",
    maxHealth: 18,
    speed: 70,
    touchDamage: 8,
    xpDrop: 1,
    weight: 7,
    tint: 0x6cc17a
  },
  "mist-wolf": {
    id: "mist-wolf",
    name: "Mist Howler",
    maxHealth: 34,
    speed: 90,
    touchDamage: 12,
    xpDrop: 2,
    weight: 4,
    tint: 0x99d0ff
  },
  "bone-crow": {
    id: "bone-crow",
    name: "Bone Crow",
    maxHealth: 24,
    speed: 120,
    touchDamage: 10,
    xpDrop: 2,
    weight: 3,
    tint: 0xe9e1ca
  },
  "corpse-cultivator": {
    id: "corpse-cultivator",
    name: "Corpse Cultivator",
    maxHealth: 40,
    speed: 78,
    touchDamage: 14,
    xpDrop: 3,
    weight: 5,
    tint: 0x9f8b7a
  },
  "resentful-spirit": {
    id: "resentful-spirit",
    name: "Resentful Spirit",
    maxHealth: 30,
    speed: 106,
    touchDamage: 12,
    xpDrop: 3,
    weight: 4,
    tint: 0xbe8cff
  },
  "celestial-construct": {
    id: "celestial-construct",
    name: "Celestial Construct",
    maxHealth: 48,
    speed: 72,
    touchDamage: 16,
    xpDrop: 4,
    weight: 5,
    tint: 0x9cdfff
  },
  "tribulation-shade": {
    id: "tribulation-shade",
    name: "Tribulation Shade",
    maxHealth: 36,
    speed: 118,
    touchDamage: 14,
    xpDrop: 4,
    weight: 4,
    tint: 0xf0d3ff
  }
};
