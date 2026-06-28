import { upgradeConfigs } from "../data/upgrades";
import type { GongfaId } from "../data/gongfa";

export interface MasteryChoiceContext {
  gongfaId: GongfaId;
  rank: number;
  seed: string;
  learnedIds: string[];
}

export type MasteryChoiceKind = "refinement" | "transformation" | "skill2";

export interface MasteryChoiceDefinition {
  id: string;
  name: string;
  lore: string;
  kind: MasteryChoiceKind;
  requiredGongfaIds?: GongfaId[];
  milestoneRank?: number;
  exclusivityGroup?: string;
}

export const masteryTransformationConfigs: MasteryChoiceDefinition[] = [
  {
    id: "execution-seal",
    name: "Execution Seal",
    lore: "Repeated Yujian Skill 1 hits escalate against a marked priority target.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 3,
    exclusivityGroup: "yujian-jue:rank-3"
  },
  {
    id: "sword-bloom",
    name: "Sword Bloom",
    lore: "The first Yujian Skill 1 hit splits into weaker swords seeking different enemies.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 3,
    exclusivityGroup: "yujian-jue:rank-3"
  },
  {
    id: "reversing-sword-path",
    name: "Reversing Sword Path",
    lore: "Yujian Skill 1 swords return back through enemies toward the Cultivator.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 3,
    exclusivityGroup: "yujian-jue:rank-3"
  },
  {
    id: "heaven-splitting-line",
    name: "Heaven-Splitting Line",
    lore: "Compress Cutting Front into a single long penetrating lane.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 3,
    exclusivityGroup: "jinfeng-gong:rank-3"
  },
  {
    id: "golden-gale-fan",
    name: "Golden Gale Fan",
    lore: "Spread Cutting Front across a broad frontal arc of blades.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 3,
    exclusivityGroup: "jinfeng-gong:rank-3"
  },
  {
    id: "crescent-wake",
    name: "Crescent Wake",
    lore: "Trail cutting crescents along the Cultivator's movement route at speed.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 3,
    exclusivityGroup: "jinfeng-gong:rank-3"
  },
  {
    id: "unbroken-current",
    name: "Unbroken Current",
    lore: "Momentum no longer bleeds away when the Cultivator stops.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 6,
    exclusivityGroup: "jinfeng-gong:rank-6"
  },
  {
    id: "ten-thousand-wave-resonance",
    name: "Ten-Thousand Wave Resonance",
    lore: "Every wave-tagged Skill hit feeds Momentum.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 6,
    exclusivityGroup: "jinfeng-gong:rank-6"
  },
  {
    id: "gale-detonation",
    name: "Gale Detonation",
    lore: "At full Momentum, spend part of it to launch a crossing cutting wave.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 6,
    exclusivityGroup: "jinfeng-gong:rank-6"
  }
];

const rank10Skill2Ids: Record<GongfaId, string> = {
  "yujian-jue": "returning-sword-formation",
  "jinfeng-gong": "golden-gale-corridor",
  "gengjin-huti": "blade-shell-rebound",
  "crimson-furnace-sword-art": "furnace-cascade",
  "blazing-feather-art": "feather-rain-formation",
  "burning-ring-scripture": "solar-flare-cycle",
  "scarlet-wave-manual": "sunset-wave-apex",
  "drifting-frost-needle": "mirror-needle-constellation",
  "black-tide-scripture": "moon-tide-vault",
  "ice-mirror-guard": "frozen-lotus-shell",
  "green-vine-art": "verdant-root-network",
  "verdant-ring-scripture": "sprout-sun-circle",
  "ironwood-wave-form": "ironwood-surge-form"
};

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getRank10Skill2Id(gongfaId: GongfaId): string {
  return rank10Skill2Ids[gongfaId];
}

export function getMasteryChoiceDefinition(id: string): MasteryChoiceDefinition | undefined {
  const transformation = masteryTransformationConfigs.find((item) => item.id === id);
  if (transformation) {
    return transformation;
  }

  const upgrade = upgradeConfigs.find((item) => item.id === id);
  if (upgrade) {
    return {
      id: upgrade.id,
      name: upgrade.name,
      lore: upgrade.lore,
      kind: "refinement",
      requiredGongfaIds: upgrade.requiredGongfaIds
    };
  }

  const skill2Entry = Object.entries(rank10Skill2Ids).find(([, skill2Id]) => skill2Id === id);
  if (skill2Entry) {
    return {
      id,
      name: id,
      lore: "Unlock this Gongfa's second Skill.",
      kind: "skill2",
      requiredGongfaIds: [skill2Entry[0] as GongfaId],
      milestoneRank: 10
    };
  }

  return undefined;
}

export function hasMasteryTransformation(
  learnedIds: string[],
  transformationId: string
): boolean {
  return learnedIds.includes(transformationId);
}

function getMilestoneTransformationIds(context: MasteryChoiceContext): string[] | undefined {
  const transformations = masteryTransformationConfigs.filter(
    (transformation) =>
      transformation.milestoneRank === context.rank &&
      transformation.requiredGongfaIds?.includes(context.gongfaId)
  );
  if (transformations.length === 0) {
    return undefined;
  }

  const learned = new Set(context.learnedIds);
  const chosenGroup = transformations.find(
    (transformation) =>
      transformation.exclusivityGroup && learned.has(transformation.id)
  )?.exclusivityGroup;

  if (chosenGroup) {
    return [];
  }

  return transformations
    .filter((transformation) => !learned.has(transformation.id))
    .map((transformation) => transformation.id);
}

export function getDeterministicMasteryChoiceIds(
  context: MasteryChoiceContext
): string[] {
  const milestoneTransformationIds = getMilestoneTransformationIds(context);
  if (milestoneTransformationIds) {
    return milestoneTransformationIds;
  }

  if (context.rank === 10) {
    return [getRank10Skill2Id(context.gongfaId)];
  }

  const skill2Id = getRank10Skill2Id(context.gongfaId);
  const learnedCounts = context.learnedIds.reduce<Record<string, number>>((counts, id) => {
    counts[id] = (counts[id] ?? 0) + 1;
    return counts;
  }, {});

  const authoredPool = upgradeConfigs
    .filter((upgrade) => upgrade.requiredGongfaIds?.includes(context.gongfaId))
    .filter((upgrade) => {
      const limit = upgrade.maxSelections ?? Infinity;
      return (learnedCounts[upgrade.id] ?? 0) < limit;
    })
    .map((upgrade) => upgrade.id);

  const evergreenPool = upgradeConfigs
    .filter((upgrade) => !upgrade.requiredGongfaIds)
    .filter((upgrade) => {
      const limit = upgrade.maxSelections ?? Infinity;
      return (learnedCounts[upgrade.id] ?? 0) < limit;
    })
    .map((upgrade) => upgrade.id);

  if (context.rank > 10 && (learnedCounts[skill2Id] ?? 0) < 1) {
    const remaining = [...authoredPool, ...evergreenPool].filter((id) => id !== skill2Id);
    const result = [skill2Id];

    if (remaining.length === 0) {
      return result;
    }

    const startIndex = hashString(`${context.seed}:${context.gongfaId}:${context.rank}`) % remaining.length;
    for (let offset = 0; offset < remaining.length && result.length < 3; offset += 1) {
      const candidate = remaining[(startIndex + offset) % remaining.length];
      if (!result.includes(candidate)) {
        result.push(candidate);
      }
    }

    return result;
  }

  const pool = authoredPool.length > 0 ? authoredPool : evergreenPool;
  if (pool.length === 0) {
    return [];
  }

  const startIndex = hashString(`${context.seed}:${context.gongfaId}:${context.rank}`) % pool.length;
  const result: string[] = [];

  for (let offset = 0; offset < pool.length && result.length < 3; offset += 1) {
    const candidate = pool[(startIndex + offset) % pool.length];
    if (!result.includes(candidate)) {
      result.push(candidate);
    }
  }

  return result;
}
