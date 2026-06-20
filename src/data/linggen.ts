import { pickRandom } from "../utils/random";

export type RootId = "fire" | "water" | "metal" | "wood";

export type LinggenId =
  | "fire"
  | "water"
  | "metal"
  | "fire-metal"
  | "water-metal"
  | "water-wood";

export interface LinggenConfig {
  id: LinggenId;
  name: string;
  roots: RootId[];
  efficiency: number;
  lore: string;
}

export const linggenConfigs: Record<LinggenId, LinggenConfig> = {
  fire: {
    id: "fire",
    name: "Fire Linggen",
    roots: ["fire"],
    efficiency: 1.15,
    lore: "A pure fire root. Aggressive, focused, and easier to refine."
  },
  water: {
    id: "water",
    name: "Water Linggen",
    roots: ["water"],
    efficiency: 1.15,
    lore: "A pure water root. Stable circulation and controlled expression."
  },
  metal: {
    id: "metal",
    name: "Metal Linggen",
    roots: ["metal"],
    efficiency: 1.18,
    lore: "A pure metal root. Sharp intent, disciplined qi, and efficient methods."
  },
  "fire-metal": {
    id: "fire-metal",
    name: "Fire-Metal Linggen",
    roots: ["fire", "metal"],
    efficiency: 0.97,
    lore: "Mixed roots of heat and edge. Broad, volatile, and flexible."
  },
  "water-metal": {
    id: "water-metal",
    name: "Water-Metal Linggen",
    roots: ["water", "metal"],
    efficiency: 0.97,
    lore: "Mixed roots of flow and sharpness. Adaptable and technical."
  },
  "water-wood": {
    id: "water-wood",
    name: "Water-Wood Linggen",
    roots: ["water", "wood"],
    efficiency: 0.95,
    lore: "Mixed roots of nourishment and flow. Flexible and resilient."
  }
};

export const firstSliceLinggenPool: LinggenId[] = [
  "fire",
  "water",
  "metal",
  "fire-metal",
  "water-metal",
  "water-wood"
];

export function rollLinggen(): LinggenConfig {
  return linggenConfigs[pickRandom(firstSliceLinggenPool)];
}
