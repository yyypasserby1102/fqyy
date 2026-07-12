import { pickRandom } from "../utils/random";
import { gongfaConfigs, type GongfaId } from "./gongfa";

export type RootId = "fire" | "water" | "metal" | "wood";
export type AffinityGrade = "Weak" | "Medium" | "Strong";

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
  rootAffinities: Record<RootId, number>;
  efficiency: number;
  lore: string;
}

export interface CultivatorCandidate {
  id: string;
  name: string;
  linggenId: LinggenId;
  linggenName: string;
  roots: RootId[];
  affinityGrades: AffinityGrade[];
  lore: string;
}

export function getAffinityGrade(value: number): AffinityGrade {
  if (value <= 3) {
    return "Weak";
  }

  if (value <= 6) {
    return "Medium";
  }

  return "Strong";
}

export const linggenConfigs: Record<LinggenId, LinggenConfig> = {
  fire: {
  id: "fire",
  name: "Fire Linggen",
  roots: ["fire"],
  rootAffinities: {
    fire: 10,
    water: 0,
    metal: 0,
    wood: 0
  },
  efficiency: 1.15,
  lore: "A pure fire root. Aggressive, focused, and easier to refine."
  },
  water: {
    id: "water",
    name: "Water Linggen",
    roots: ["water"],
    rootAffinities: {
      fire: 0,
      water: 10,
      metal: 0,
      wood: 0
    },
    efficiency: 1.15,
    lore: "A pure water root. Stable circulation and controlled expression."
  },
  metal: {
    id: "metal",
    name: "Metal Linggen",
    roots: ["metal"],
    rootAffinities: {
      fire: 0,
      water: 0,
      metal: 10,
      wood: 0
    },
    efficiency: 1.18,
    lore: "A pure metal root. Sharp intent, disciplined qi, and efficient methods."
  },
  "fire-metal": {
    id: "fire-metal",
    name: "Fire-Metal Linggen",
    roots: ["fire", "metal"],
    rootAffinities: {
      fire: 6,
      water: 0,
      metal: 4,
      wood: 0
    },
    efficiency: 0.97,
    lore: "Mixed roots of heat and edge. Broad, volatile, and flexible."
  },
  "water-metal": {
    id: "water-metal",
    name: "Water-Metal Linggen",
    roots: ["water", "metal"],
    rootAffinities: {
      fire: 0,
      water: 5,
      metal: 5,
      wood: 0
    },
    efficiency: 0.97,
    lore: "Mixed roots of flow and sharpness. Adaptable and technical."
  },
  "water-wood": {
    id: "water-wood",
    name: "Water-Wood Linggen",
    roots: ["water", "wood"],
    rootAffinities: {
      fire: 0,
      water: 7,
      metal: 0,
      wood: 3
    },
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

function seededIndex(seed: number, salt: number, length: number): number {
  const mixed = (Math.imul(seed >>> 0, 1664525) + Math.imul(salt, 1013904223)) >>> 0;
  return mixed % length;
}

function pickSeededDistinct(
  pool: LinggenId[],
  seed: number,
  salt: number,
  excluded: Set<LinggenId>
): LinggenId {
  const candidates = pool.filter((id) => !excluded.has(id));
  return candidates[seededIndex(seed, salt, candidates.length)];
}

export function getCultivatorCandidates(seed: number): CultivatorCandidate[] {
  const singleRootPool = firstSliceLinggenPool.filter(
    (id) => linggenConfigs[id].roots.length === 1
  );
  const dualRootPool = firstSliceLinggenPool.filter((id) => linggenConfigs[id].roots.length === 2);
  const selected = new Set<LinggenId>();
  const singleRoot = pickSeededDistinct(singleRootPool, seed, 1, selected);
  selected.add(singleRoot);
  const dualRoot = pickSeededDistinct(dualRootPool, seed, 2, selected);
  selected.add(dualRoot);
  selected.add(pickSeededDistinct(firstSliceLinggenPool, seed, 3, selected));

  return Array.from(selected).map((linggenId, index) => {
    const linggen = linggenConfigs[linggenId];
    return {
      id: `candidate-${index + 1}`,
      name: `Candidate ${index + 1}`,
      linggenId,
      linggenName: linggen.name,
      roots: [...linggen.roots],
      affinityGrades: getLinggenAffinityGradeSummary(linggenId),
      lore: linggen.lore
    };
  });
}

export function getLinggenAffinityTotal(linggenId: LinggenId): number {
  return Object.values(linggenConfigs[linggenId].rootAffinities).reduce(
    (total, value) => total + value,
    0
  );
}

export function getLinggenAffinityGradeSummary(linggenId: LinggenId): AffinityGrade[] {
  const config = linggenConfigs[linggenId];
  return config.roots.map((root) => getAffinityGrade(config.rootAffinities[root]));
}

export function getMasterySpeedLabelFromValue(value: number): "Slow" | "Normal" | "Fast" {
  if (value <= 3) {
    return "Slow";
  }

  if (value <= 6) {
    return "Normal";
  }

  return "Fast";
}

export function getGongfaMasterySpeedLabel(
  linggenId: LinggenId,
  gongfaId: GongfaId
): "Slow" | "Normal" | "Fast" {
  const effective = getGongfaEffectiveAffinity(linggenId, gongfaId);

  return getMasterySpeedLabelFromValue(effective);
}

export function getGongfaEffectiveAffinity(linggenId: LinggenId, gongfaId: GongfaId): number {
  const linggen = linggenConfigs[linggenId];
  const requiredRoots = gongfaConfigs[gongfaId].requiredRoots;
  return (
    requiredRoots.reduce((total, root) => total + linggen.rootAffinities[root], 0) /
    requiredRoots.length
  );
}

export function getGongfaMasteryEfficiency(linggenId: LinggenId, gongfaId: GongfaId): number {
  const linggen = linggenConfigs[linggenId];
  const strongestAffinity = Math.max(...Object.values(linggen.rootAffinities));
  return getGongfaEffectiveAffinity(linggenId, gongfaId) / strongestAffinity;
}
