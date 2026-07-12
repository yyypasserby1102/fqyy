import { upgradeConfigs } from "../data/upgrades";
import type { GongfaId } from "../data/gongfa";
import { surgeGongfaSpecs, type SurgeTransformation } from "../data/surgeGongfa";

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

function buildSurgeTransformations(): MasteryChoiceDefinition[] {
  const result: MasteryChoiceDefinition[] = [];
  for (const spec of surgeGongfaSpecs) {
    const entry = (item: SurgeTransformation, rank: number): MasteryChoiceDefinition => ({
      id: item.id,
      name: item.name,
      lore: item.lore,
      kind: "transformation",
      requiredGongfaIds: [spec.gongfaId],
      milestoneRank: rank,
      exclusivityGroup: `${spec.gongfaId}:rank-${rank}`
    });
    result.push(entry(spec.focus, 3), entry(spec.spread, 3), entry(spec.quicken, 3));
    result.push(entry(spec.hold, 6), entry(spec.cascade, 6), entry(spec.burst, 6));
    result.push(entry(spec.crown, 9), entry(spec.domain, 9), entry(spec.updraft, 9));
  }
  return result;
}

export const masteryTransformationConfigs: MasteryChoiceDefinition[] = [
  {
    id: "searing-feathers",
    name: "Searing Feathers",
    lore: "Condense the feathers into fewer, armor-piercing blazing shafts.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 3,
    exclusivityGroup: "blazing-feather-art:rank-3"
  },
  {
    id: "feather-storm",
    name: "Feather Storm",
    lore: "Loose a wide flurry of blazing feathers each cycle.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 3,
    exclusivityGroup: "blazing-feather-art:rank-3"
  },
  {
    id: "swift-molt",
    name: "Swift Molt",
    lore: "Shed feathers faster and swifter, quickening the barrage.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 3,
    exclusivityGroup: "blazing-feather-art:rank-3"
  },
  {
    id: "banked-embers",
    name: "Banked Embers",
    lore: "Well-stoked Embers no longer fade below half.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 6,
    exclusivityGroup: "blazing-feather-art:rank-6"
  },
  {
    id: "ember-cascade",
    name: "Ember Cascade",
    lore: "Each feather hit stokes Embers twice as fast.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 6,
    exclusivityGroup: "blazing-feather-art:rank-6"
  },
  {
    id: "ember-burst",
    name: "Ember Burst",
    lore: "At full Embers, the next volley erupts with extra feathers.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 6,
    exclusivityGroup: "blazing-feather-art:rank-6"
  },
  {
    id: "phoenix-ascendant",
    name: "Phoenix Ascendant",
    lore: "Embers crown every volley with spectral blazing feathers.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 9,
    exclusivityGroup: "blazing-feather-art:rank-9"
  },
  {
    id: "searing-domain",
    name: "Searing Domain",
    lore: "Feather hits leave Ember-scaled blazing fields.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 9,
    exclusivityGroup: "blazing-feather-art:rank-9"
  },
  {
    id: "molten-updraft",
    name: "Molten Updraft",
    lore: "Each Evade looses an Ember-scaled burst of feathers.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 9,
    exclusivityGroup: "blazing-feather-art:rank-9"
  },
  ...buildSurgeTransformations(),
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
    id: "still-sword-heart",
    name: "Still Sword Heart",
    lore: "Incoming damage no longer scatters accumulated Sword Intent.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 6,
    exclusivityGroup: "yujian-jue:rank-6"
  },
  {
    id: "myriad-blade-resonance",
    name: "Myriad Blade Resonance",
    lore: "Projectile-tagged hits feed Sword Intent far faster.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 6,
    exclusivityGroup: "yujian-jue:rank-6"
  },
  {
    id: "intent-unleashed",
    name: "Intent Unleashed",
    lore: "At full Intent, the next sword volley erupts with extra blades.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 6,
    exclusivityGroup: "yujian-jue:rank-6"
  },
  {
    id: "sword-crown",
    name: "Sword Crown",
    lore: "Current Intent crowns the volley with weaker spectral swords.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 9,
    exclusivityGroup: "yujian-jue:rank-9"
  },
  {
    id: "intent-domain",
    name: "Intent Domain",
    lore: "Hits leave short-lived blade fields that scale with Intent.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 9,
    exclusivityGroup: "yujian-jue:rank-9"
  },
  {
    id: "void-step-formation",
    name: "Void-Step Formation",
    lore: "Each Evade looses an extra sword volley from its path.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 9,
    exclusivityGroup: "yujian-jue:rank-9"
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
  },
  {
    id: "endless-horizon",
    name: "Endless Horizon",
    lore: "Cutting Front keeps growing as it travels, scaled by Momentum.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 9,
    exclusivityGroup: "jinfeng-gong:rank-9"
  },
  {
    id: "walking-storm",
    name: "Walking Storm",
    lore: "At high Momentum, periodic radial cutting waves erupt around the Cultivator.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 9,
    exclusivityGroup: "jinfeng-gong:rank-9"
  },
  {
    id: "gale-step-severance",
    name: "Gale-Step Severance",
    lore: "Each Evade cuts a Momentum-scaled corridor along its path.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 9,
    exclusivityGroup: "jinfeng-gong:rank-9"
  },
  {
    id: "rebounding-edge",
    name: "Rebounding Edge",
    lore: "Guard launches a focused blade at the source of prevented damage.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 3,
    exclusivityGroup: "gengjin-huti:rank-3"
  },
  {
    id: "hundred-blade-halo",
    name: "Hundred-Blade Halo",
    lore: "Guard fuels a denser rotating close-range blade halo.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 3,
    exclusivityGroup: "gengjin-huti:rank-3"
  },
  {
    id: "iron-wake",
    name: "Iron Wake",
    lore: "Each Evade leaves a temporary cutting wall along its path.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 3,
    exclusivityGroup: "gengjin-huti:rank-3"
  },
  {
    id: "immovable-mountain",
    name: "Immovable Mountain",
    lore: "Standing still greatly increases Guard gain and defensive output.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 6,
    exclusivityGroup: "gengjin-huti:rank-6"
  },
  {
    id: "flowing-iron-body",
    name: "Flowing Iron Body",
    lore: "Each Evade grants Guard and releases a defensive shockwave.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 6,
    exclusivityGroup: "gengjin-huti:rank-6"
  },
  {
    id: "ten-thousand-armor-resonance",
    name: "Ten-Thousand Armor Resonance",
    lore: "Any defensive-tagged Skill hit builds Guard.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 6,
    exclusivityGroup: "gengjin-huti:rank-6"
  },
  {
    id: "gengjin-fortress",
    name: "Gengjin Fortress",
    lore: "Current Guard manifests as orbiting defensive blades.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 9,
    exclusivityGroup: "gengjin-huti:rank-9"
  },
  {
    id: "iron-gravity-domain",
    name: "Iron Gravity Domain",
    lore: "At high Guard, pull nearby enemies into repeated aura bursts.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 9,
    exclusivityGroup: "gengjin-huti:rank-9"
  },
  {
    id: "unbroken-advance",
    name: "Unbroken Advance",
    lore: "High-Guard movement strikes nearby enemies and empowers Evade.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 9,
    exclusivityGroup: "gengjin-huti:rank-9"
  },
  {
    // Counterflow Ring keeps its existing effect in upgradeConfigs (durable,
    // checkpointed runtime state); registering it here promotes it from an
    // ordinary refinement to its proper rank-3 Transformation milestone.
    id: "counterflow-ring",
    name: "Counterflow Ring",
    lore: "Add a second counter-rotating ring with intersection hot zones.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 3,
    exclusivityGroup: "burning-ring-scripture:rank-3"
  },
  {
    id: "condensed-furnace-ring",
    name: "Condensed Furnace Ring",
    lore: "Merge segments into fewer, fiercer priority-burning hotspots.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 3,
    exclusivityGroup: "burning-ring-scripture:rank-3"
  },
  {
    id: "scattered-ember-orbit",
    name: "Scattered Ember Orbit",
    lore: "Segment hits leave short-lived burning patches in the ring's wake.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 3,
    exclusivityGroup: "burning-ring-scripture:rank-3"
  },
  {
    id: "banked-sun",
    name: "Banked Sun",
    lore: "Heat no longer bleeds below half once it is stoked.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 6,
    exclusivityGroup: "burning-ring-scripture:rank-6"
  },
  {
    id: "aura-furnace",
    name: "Aura Furnace",
    lore: "Any aura-tagged Skill hit stokes markedly more Heat.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 6,
    exclusivityGroup: "burning-ring-scripture:rank-6"
  },
  {
    id: "meridian-ignition",
    name: "Meridian Ignition",
    lore: "Full Heat ignites into a brief high-output burst, then resets.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 6,
    exclusivityGroup: "burning-ring-scripture:rank-6"
  },
  {
    id: "perfect-solar-orbit",
    name: "Perfect Solar Orbit",
    lore: "Heat adds ring segments and closes the orbit's gaps.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 9,
    exclusivityGroup: "burning-ring-scripture:rank-9"
  },
  {
    id: "sunspot-collapse",
    name: "Sunspot Collapse",
    lore: "Periodically condense the ring onto the sturdiest nearby enemy.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 9,
    exclusivityGroup: "burning-ring-scripture:rank-9"
  },
  {
    id: "phoenix-passage",
    name: "Phoenix Passage",
    lore: "Each Evade leaves a temporary Heat-scaled ring copy at its origin.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 9,
    exclusivityGroup: "burning-ring-scripture:rank-9"
  },
  {
    id: "crimson-piercing-needles",
    name: "Piercing Furnace Needles",
    lore: "Focus the needles into a deeper-piercing line.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 3,
    exclusivityGroup: "crimson-furnace-sword-art:rank-3"
  },
  {
    id: "scattered-needles",
    name: "Scattered Furnace Needles",
    lore: "Loose a broader spray of embedding needles.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 3,
    exclusivityGroup: "crimson-furnace-sword-art:rank-3"
  },
  {
    id: "volatile-embeds",
    name: "Volatile Embeds",
    lore: "Embeds reach detonation with fewer needles.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 3,
    exclusivityGroup: "crimson-furnace-sword-art:rank-3"
  },
  {
    id: "sustained-crucible",
    name: "Sustained Crucible",
    lore: "Crucible Pressure bleeds away far more slowly.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 6,
    exclusivityGroup: "crimson-furnace-sword-art:rank-6"
  },
  {
    id: "resonant-crucible",
    name: "Resonant Crucible",
    lore: "Each detonation builds markedly more Pressure.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 6,
    exclusivityGroup: "crimson-furnace-sword-art:rank-6"
  },
  {
    id: "overpressure-detonation",
    name: "Overpressure Detonation",
    lore: "Pressure swells explosion radius far more sharply.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 6,
    exclusivityGroup: "crimson-furnace-sword-art:rank-6"
  },
  {
    id: "furnace-heart",
    name: "Furnace Heart",
    lore: "Crucible Pressure adds extra needles to every volley.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 9,
    exclusivityGroup: "crimson-furnace-sword-art:rank-9"
  },
  {
    id: "relentless-needles",
    name: "Relentless Needles",
    lore: "High Pressure looses a second needle volley.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 9,
    exclusivityGroup: "crimson-furnace-sword-art:rank-9"
  },
  {
    id: "crucible-nova",
    name: "Crucible Nova",
    lore: "Full Pressure erupts in a furnace nova, then resets.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 9,
    exclusivityGroup: "crimson-furnace-sword-art:rank-9"
  }
];

const transformationIdSet = new Set(masteryTransformationConfigs.map((item) => item.id));

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
    // An upgrade that is also a milestone Transformation (e.g. counterflow-ring)
    // is offered only at its milestone, never in the ordinary refinement pool.
    .filter((upgrade) => !transformationIdSet.has(upgrade.id))
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

export function hasAvailableGongfaRefinement(
  gongfaId: GongfaId,
  learnedIds: string[]
): boolean {
  const learnedCounts = learnedIds.reduce<Record<string, number>>((counts, id) => {
    counts[id] = (counts[id] ?? 0) + 1;
    return counts;
  }, {});

  return upgradeConfigs
    .filter((upgrade) => upgrade.requiredGongfaIds?.includes(gongfaId))
    .filter((upgrade) => !transformationIdSet.has(upgrade.id))
    .some((upgrade) => (learnedCounts[upgrade.id] ?? 0) < (upgrade.maxSelections ?? Infinity));
}
