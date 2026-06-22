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
  texture: string;
  maxHealth: number;
  speed: number;
  touchDamage: number;
  xpDrop: number;
  weight: number;
  tint: number;
  scale: number;
}

export const enemyConfigs: Record<EnemyId, EnemyConfig> = {
  "jade-rat": {
    id: "jade-rat",
    name: "Jade Burrow Rat",
    texture: "enemy-rat",
    maxHealth: 18,
    speed: 70,
    touchDamage: 8,
    xpDrop: 1,
    weight: 7,
    tint: 0x6cc17a,
    scale: 1
  },
  "mist-wolf": {
    id: "mist-wolf",
    name: "Mist Howler",
    texture: "enemy-wolf",
    maxHealth: 34,
    speed: 90,
    touchDamage: 12,
    xpDrop: 2,
    weight: 4,
    tint: 0x99d0ff,
    scale: 1.1
  },
  "bone-crow": {
    id: "bone-crow",
    name: "Bone Crow",
    texture: "enemy-crow",
    maxHealth: 24,
    speed: 120,
    touchDamage: 10,
    xpDrop: 2,
    weight: 3,
    tint: 0xe9e1ca,
    scale: 0.95
  },
  "corpse-cultivator": {
    id: "corpse-cultivator",
    name: "Corpse Cultivator",
    texture: "enemy-cultivator",
    maxHealth: 40,
    speed: 78,
    touchDamage: 14,
    xpDrop: 3,
    weight: 5,
    tint: 0x9f8b7a,
    scale: 1
  },
  "resentful-spirit": {
    id: "resentful-spirit",
    name: "Resentful Spirit",
    texture: "enemy-spirit",
    maxHealth: 30,
    speed: 106,
    touchDamage: 12,
    xpDrop: 3,
    weight: 4,
    tint: 0xbe8cff,
    scale: 1
  },
  "celestial-construct": {
    id: "celestial-construct",
    name: "Celestial Construct",
    texture: "enemy-construct",
    maxHealth: 48,
    speed: 72,
    touchDamage: 16,
    xpDrop: 4,
    weight: 5,
    tint: 0x9cdfff,
    scale: 1.08
  },
  "tribulation-shade": {
    id: "tribulation-shade",
    name: "Tribulation Shade",
    texture: "enemy-shade",
    maxHealth: 36,
    speed: 118,
    touchDamage: 14,
    xpDrop: 4,
    weight: 4,
    tint: 0xf0d3ff,
    scale: 1
  }
};
