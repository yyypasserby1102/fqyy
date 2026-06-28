import {
  getCompatibleGongfaIds,
  gongfaConfigs,
  getGongfaSkillTags,
  type GongfaId,
  type GongfaStageState
} from "../data/gongfa";
import { linggenConfigs, type LinggenId } from "../data/linggen";
import { stageOrder, type StageId } from "../data/stages";
import { upgradeConfigs } from "../data/upgrades";

type TransitionKind = "acquire" | "refine" | "transform";

interface FirstBreakthroughInput {
  lingcaoCollected: boolean;
  linggenRevealed: boolean;
}

interface FirstBreakthroughState {
  canReveal: boolean;
  reason: string;
}

interface StageNarrative {
  stage: StageId;
  transitionKind: TransitionKind;
  signatureChange: string;
}

interface MetalBranchSpec {
  id: GongfaId;
  name: string;
  stages: Partial<Record<StageId, StageNarrative>>;
}

interface MetalTreeSpec {
  realmOrder: StageId[];
  branches: MetalBranchSpec[];
}


const metalStageNarratives: Record<
  "yujian-jue" | "jinfeng-gong" | "gengjin-huti",
  Partial<Record<StageId, StageNarrative>>
> = {
  "yujian-jue": {
    lianqi: {
      stage: "lianqi",
      transitionKind: "acquire",
      signatureChange: "acquire the first disciplined flying sword"
    },
    zhuji: {
      stage: "zhuji",
      transitionKind: "refine",
      signatureChange: "stabilize the sword cycle into multi-sword volleys"
    },
    jindan: {
      stage: "jindan",
      transitionKind: "transform",
      signatureChange: "unlock return-blade splits through enemy lines"
    }
  },
  "jinfeng-gong": {
    lianqi: {
      stage: "lianqi",
      transitionKind: "acquire",
      signatureChange: "acquire short frontal cutting waves"
    },
    zhuji: {
      stage: "zhuji",
      transitionKind: "refine",
      signatureChange: "broaden the cutting front into stable lane control"
    },
    jindan: {
      stage: "jindan",
      transitionKind: "transform",
      signatureChange: "leave lingering metal-qi trails after each wave"
    }
  },
  "gengjin-huti": {
    lianqi: {
      stage: "lianqi",
      transitionKind: "acquire",
      signatureChange: "acquire a close defensive aura with retaliation"
    },
    zhuji: {
      stage: "zhuji",
      transitionKind: "refine",
      signatureChange: "stabilize the guard into a dependable defensive zone"
    },
    jindan: {
      stage: "jindan",
      transitionKind: "transform",
      signatureChange: "erupt stored pressure outward as a blade shell"
    }
  }
};

const rootMethodOrder = {
  fire: ["blazing-feather-art", "scarlet-wave-manual", "burning-ring-scripture", "crimson-furnace-sword-art"],
  water: ["drifting-frost-needle", "black-tide-scripture", "ice-mirror-guard"],
  metal: ["yujian-jue", "jinfeng-gong", "gengjin-huti", "crimson-furnace-sword-art"],
  wood: ["green-vine-art", "ironwood-wave-form", "verdant-ring-scripture"]
} as const;

export function getCompatibleGongfaIdsForLinggen(linggenId: LinggenId): GongfaId[] {
  const roots = linggenConfigs[linggenId].roots;
  const compatible = new Set(getCompatibleGongfaIds(roots));
  const ordered: GongfaId[] = [];

  roots.forEach((root) => {
    rootMethodOrder[root].forEach((gongfaId) => {
      if (compatible.has(gongfaId) && !ordered.includes(gongfaId)) {
        ordered.push(gongfaId);
      }
    });
  });

  return ordered;
}

export function getPresentedGongfaIdsForLinggen(
  linggenId: LinggenId,
  learnedIds: GongfaId[] = []
): GongfaId[] {
  const learned = new Set(learnedIds);
  const ordered = getCompatibleGongfaIdsForLinggen(linggenId).filter((gongfaId) => !learned.has(gongfaId));
  if (linggenId === "fire-metal") {
    const firePick =
      ordered.find((gongfaId) => gongfaId === "burning-ring-scripture") ??
      ordered.find((gongfaId) => gongfaId === "scarlet-wave-manual") ??
      ordered.find((gongfaId) => gongfaId === "blazing-feather-art");
    const metalPick = ordered.find(
      (gongfaId) => gongfaId === "yujian-jue" || gongfaId === "jinfeng-gong" || gongfaId === "gengjin-huti"
    );
    const hybrid = ordered.find((gongfaId) => gongfaId === "crimson-furnace-sword-art");
    const picks = [firePick, metalPick, hybrid].filter((gongfaId) => gongfaId !== undefined) as GongfaId[];
    return picks.length >= 3 ? picks.slice(0, 3) : ordered.slice(0, 3);
  }

  if (ordered.length <= 3) {
    return ordered;
  }

  const roots = linggenConfigs[linggenId].roots;
  const pools = roots.map((root) =>
    rootMethodOrder[root].filter((gongfaId) => ordered.includes(gongfaId))
  );
  const picks: GongfaId[] = [];
  const indices = pools.map(() => 0);

  while (picks.length < 3) {
    let madeProgress = false;

    for (let rootIndex = 0; rootIndex < pools.length && picks.length < 3; rootIndex += 1) {
      const pool = pools[rootIndex];
      const nextIndex = indices[rootIndex];
      const candidate = pool[nextIndex];
      if (!candidate) {
        continue;
      }

      indices[rootIndex] += 1;
      picks.push(candidate);
      madeProgress = true;
    }

    if (!madeProgress) {
      break;
    }
  }

  for (const gongfaId of ordered) {
    if (picks.length >= 3) {
      break;
    }
    if (!picks.includes(gongfaId)) {
      picks.push(gongfaId);
    }
  }

  return picks;
}

export function getMetalBranchSpec(): MetalTreeSpec {
  const branchIds = [
    "yujian-jue",
    "jinfeng-gong",
    "gengjin-huti"
  ] as const;

  return {
    realmOrder: [...stageOrder],
    branches: branchIds.map((id) => ({
      id,
      name: gongfaConfigs[id].name,
      stages: metalStageNarratives[id]
    }))
  };
}

export function getStageProgressionSummary(gongfaId: GongfaId): Record<StageId, StageNarrative> {
  if (gongfaId in metalStageNarratives) {
    const stages = metalStageNarratives[gongfaId as keyof typeof metalStageNarratives];
    return {
      lianqi: stages.lianqi as StageNarrative,
      zhuji: stages.zhuji as StageNarrative,
      jindan: stages.jindan as StageNarrative,
      yuanying:
        stages.yuanying ?? {
          stage: "yuanying",
          transitionKind: "transform",
          signatureChange: `transform ${gongfaConfigs[gongfaId].name} into a nascent-soul manifestation`
        }
    };
  }

  return {
    lianqi: {
      stage: "lianqi",
      transitionKind: "acquire",
      signatureChange: `acquire ${gongfaConfigs[gongfaId].name}`
    },
    zhuji: {
      stage: "zhuji",
      transitionKind: "refine",
      signatureChange: `refine ${gongfaConfigs[gongfaId].name} into stable combat expression`
    },
    jindan: {
      stage: "jindan",
      transitionKind: "transform",
      signatureChange: `transform ${gongfaConfigs[gongfaId].name} into a higher-order manifestation`
    },
    yuanying: {
      stage: "yuanying",
      transitionKind: "transform",
      signatureChange: `transform ${gongfaConfigs[gongfaId].name} into a nascent-soul manifestation`
    }
  };
}

export function getStageNarrative(gongfaId: GongfaId, stageId: StageId): StageNarrative {
  return getStageProgressionSummary(gongfaId)[stageId];
}

export function getGongfaStageState(gongfaId: GongfaId, stageId: StageId): GongfaStageState {
  return gongfaConfigs[gongfaId].stages[stageId] ?? gongfaConfigs[gongfaId].stages.jindan!;
}

export { getGongfaSkillTags };

export function getCompatibleUpgradeIdsForGongfa(gongfaId: GongfaId): string[] {
  const specific = upgradeConfigs
    .filter((upgrade) => upgrade.requiredGongfaIds?.includes(gongfaId))
    .map((upgrade) => upgrade.id);
  const generic = upgradeConfigs
    .filter((upgrade) => !upgrade.requiredGongfaIds)
    .map((upgrade) => upgrade.id);

  return [...specific, ...generic];
}

export function getFirstBreakthroughState(
  input: FirstBreakthroughInput
): FirstBreakthroughState {
  if (input.linggenRevealed) {
    return {
      canReveal: false,
      reason: "Linggen is already revealed."
    };
  }

  if (!input.lingcaoCollected) {
    return {
      canReveal: false,
      reason: "Lingcao has not been claimed yet."
    };
  }

  return {
    canReveal: true,
    reason: "Lingcao has been claimed and the first breakthrough can begin."
  };
}
