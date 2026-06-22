import { upgradeConfigs } from "../data/upgrades";
import type { GongfaId } from "../data/gongfa";

export interface MasteryChoiceContext {
  gongfaId: GongfaId;
  rank: number;
  seed: string;
  learnedIds: string[];
}

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

export function getDeterministicMasteryChoiceIds(
  context: MasteryChoiceContext
): string[] {
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
