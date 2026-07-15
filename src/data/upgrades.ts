import type { GongfaId } from "./gongfa";
import { getGongfaPackage } from "./gongfaPackages";

export type UpgradeEffect =
  | "skill1Damage"
  | "skill1Cooldown"
  | "skill1Count"
  | "skill1Pierce"
  | "skill1Range"
  | "retaliationDamage"
  | "guardBuild"
  | "guardStability"
  | "defensiveSynergy"
  | "heatBuild"
  | "heatDecay"
  | "auraSynergy"
  | "embedThreshold"
  | "pressureBuild"
  | "pressureDecay"
  | "moveSpeed"
  | "maxHealth"
  | "heal"
  | "magnet"
  | "galeMomentumBuild"
  | "galeMomentumDecay"
  | "waveSynergy"
  | "surgeBuild"
  | "surgeStability"
  | "evadeSynergy"
  | "gongfaDamageSynergy"
  | "gongfaPierceSynergy"
  | "gongfaRangeSynergy"
  | "resourcePotency"
  | "skill2Damage"
  | "skill2Coverage"
  | "skill2Cadence";

export interface UpgradeConfig {
  id: string;
  name: string;
  lore: string;
  effect: UpgradeEffect;
  value: number;
  requiredGongfaIds?: GongfaId[];
  maxSelections?: number;
  /** The named mechanic affected; rendered in the codex and never inferred as package-wide. */
  scope: string;
  /** Rank at which this family enters the ordinary refinement pool. */
  unlockRank?: number;
  category: "skill1" | "passive" | "synergy" | "skill2" | "legacy";
}

type BaselineUpgradeSeed = Omit<UpgradeConfig, "scope" | "category"> & {
  scope?: string;
};

const baselineUpgradeConfigs: BaselineUpgradeSeed[] = [
  // Legacy checkpoint compatibility only. These generic utilities are never
  // offered by Gongfa Mastery; new growth comes from authored Gongfa content,
  // Foundation Growth, Spirit Treasures, and world Healing Pills.
  {
    id: "tempered-meridians",
    name: "Tempered Meridians",
    lore: "+22 move speed.",
    effect: "moveSpeed",
    value: 22
  },
  {
    id: "jade-meridian",
    name: "Jade Meridian",
    lore: "+18 maximum health and heal the same amount.",
    effect: "maxHealth",
    value: 18
  },
  {
    id: "minor-pill",
    name: "Spirit Rejuvenation Pill",
    lore: "Recover 28 health now.",
    effect: "heal",
    value: 28
  },
  {
    id: "soul-lure-banner",
    name: "Soul Lure Banner",
    lore: "+32 orb pickup range.",
    effect: "magnet",
    value: 32
  },
  {
    id: "tempered-needles",
    name: "Tempered Needles",
    lore: "+5 Furnace Needle damage.",
    effect: "skill1Damage",
    value: 5,
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    maxSelections: 3
  },
  {
    id: "rapid-forging",
    name: "Rapid Forging",
    lore: "Furnace Needles fire 12% faster.",
    effect: "skill1Cooldown",
    value: 0.88,
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    maxSelections: 3
  },
  {
    id: "deep-embedding",
    name: "Deep Embedding",
    lore: "Needles detonate at fewer embeds.",
    effect: "embedThreshold",
    value: -1,
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    maxSelections: 3
  },
  {
    id: "furnace-expansion",
    name: "Furnace Expansion",
    lore: "+18 explosion radius.",
    effect: "gongfaRangeSynergy",
    value: 18,
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    maxSelections: 3
  },
  {
    id: "rising-pressure",
    name: "Rising Pressure",
    lore: "Pressure builds faster from explosions.",
    effect: "pressureBuild",
    value: 0.18,
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    maxSelections: 3
  },
  {
    id: "sealed-crucible",
    name: "Sealed Crucible",
    lore: "Pressure decays slower and strengthens explosive radius.",
    effect: "pressureDecay",
    value: 0.84,
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    maxSelections: 3
  },
  {
    id: "broadened-flame",
    name: "Broadened Flame",
    lore: "+14 burning ring radius.",
    effect: "skill1Range",
    value: 14,
    requiredGongfaIds: ["burning-ring-scripture"],
    maxSelections: 3
  },
  {
    id: "rapid-revolution",
    name: "Kindled Circulation",
    lore: "Heat strengthens the cadence of the entire Burning Ring package.",
    effect: "auraSynergy",
    value: 0.08,
    requiredGongfaIds: ["burning-ring-scripture"],
    maxSelections: 3
  },
  {
    id: "scorching-passage",
    name: "Scorching Passage",
    lore: "+5 burning ring damage.",
    effect: "skill1Damage",
    value: 5,
    requiredGongfaIds: ["burning-ring-scripture"],
    maxSelections: 3
  },
  {
    id: "counterflow-ring",
    name: "Counterflow Ring",
    lore: "Add a counter-rotating inner ring.",
    effect: "skill1Count",
    value: 1,
    requiredGongfaIds: ["burning-ring-scripture"],
    maxSelections: 3
  },
  {
    id: "gathering-heat",
    name: "Gathering Heat",
    lore: "Heat builds faster near burning targets.",
    effect: "heatBuild",
    value: 0.18,
    requiredGongfaIds: ["burning-ring-scripture"],
    maxSelections: 3
  },
  {
    id: "banked-ember",
    name: "Banked Ember",
    lore: "Heat decays slower and strengthens aura cadence.",
    effect: "auraSynergy",
    value: 0.08,
    requiredGongfaIds: ["burning-ring-scripture"],
    maxSelections: 3
  },
  {
    id: "sword-intent-sharpening",
    name: "Sword Intent Sharpening",
    lore: "Each Intent stack adds more force to both Yujian Skills.",
    effect: "resourcePotency",
    value: 1,
    requiredGongfaIds: ["yujian-jue"],
    maxSelections: 3
  },
  {
    id: "twin-sword-split",
    name: "Twin Sword Split",
    lore: "+1 flying sword per volley.",
    effect: "skill1Count",
    value: 1,
    requiredGongfaIds: ["yujian-jue"],
    maxSelections: 3
  },
  {
    id: "refined-sword-channel",
    name: "Refined Sword Channel",
    lore: "Yujian attacks 12% faster.",
    effect: "skill1Cooldown",
    value: 0.88,
    requiredGongfaIds: ["yujian-jue"],
    maxSelections: 3
  },
  {
    id: "cutting-qi-pressure",
    name: "Cutting Qi Pressure",
    lore: "+6 Jinfeng damage.",
    effect: "skill1Damage",
    value: 6,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "broadened-front",
    name: "Broadened Front",
    lore: "+1 cutting wave.",
    effect: "skill1Count",
    value: 1,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "long-edge-resonance",
    name: "Long Edge Resonance",
    lore: "+28 Jinfeng range.",
    effect: "gongfaRangeSynergy",
    value: 28,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "gathering-gale",
    name: "Gathering Gale",
    lore: "Jinfeng momentum builds faster while you keep moving.",
    effect: "galeMomentumBuild",
    value: 0.12,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "unbroken-stride",
    name: "Unbroken Stride",
    lore: "Jinfeng momentum decays more slowly when you pause.",
    effect: "galeMomentumDecay",
    value: 0.88,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "windborne-reach",
    name: "Windborne Reach",
    lore: "All wave Skills gain stronger width and range from momentum.",
    effect: "waveSynergy",
    value: 0.06,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "guard-pressure",
    name: "Guard Pressure",
    lore: "+5 Gengjin aura damage.",
    effect: "skill1Damage",
    value: 5,
    requiredGongfaIds: ["gengjin-huti"],
    maxSelections: 3
  },
  {
    id: "retaliatory-edge",
    name: "Retaliatory Edge",
    lore: "Guard pressure empowers both Gengjin Skills.",
    effect: "gongfaDamageSynergy",
    value: 3,
    requiredGongfaIds: ["gengjin-huti"],
    maxSelections: 3
  },
  {
    id: "expanding-shell",
    name: "Expanding Shell",
    lore: "+18 aura radius.",
    effect: "skill1Range",
    value: 18,
    requiredGongfaIds: ["gengjin-huti"],
    maxSelections: 3
  },
  {
    id: "lasting-temper",
    name: "Lasting Temper",
    lore: "Guard builds faster near enemies.",
    effect: "guardBuild",
    value: 0.18,
    requiredGongfaIds: ["gengjin-huti"],
    maxSelections: 3
  },
  {
    id: "bulwark-reflection",
    name: "Bulwark Reflection",
    lore: "Guard decays more slowly outside danger.",
    effect: "guardStability",
    value: 0.84,
    requiredGongfaIds: ["gengjin-huti"],
    maxSelections: 3
  },
  {
    id: "unyielding-shield",
    name: "Unyielding Shield",
    lore: "Defensive Skills scale harder from Guard.",
    effect: "defensiveSynergy",
    value: 0.08,
    requiredGongfaIds: ["gengjin-huti"],
    maxSelections: 3
  }
];

type FamilySeed = readonly [
  id: string,
  name: string,
  lore: string,
  effect: UpgradeEffect,
  value: number,
  scope: string
];

const family = (gongfaId: GongfaId, seed: FamilySeed, unlockRank = 0): UpgradeConfig => ({
  id: seed[0],
  name: seed[1],
  lore: seed[2],
  effect: seed[3],
  value: seed[4],
  scope: seed[5] === "Owning Gongfa: both Skills"
    ? `Skills: ${getGongfaPackage(gongfaId).skill1.name} + ${getGongfaPackage(gongfaId).skill2.name}`
    : seed[5],
  requiredGongfaIds: [gongfaId],
  maxSelections: 2,
  unlockRank,
  category: unlockRank >= 10
    ? "skill2"
    : seed[3] === "skill1Damage" || seed[3] === "skill1Count"
      ? "skill1"
      : seed[3] === "surgeBuild" || seed[3] === "surgeStability"
        ? "passive"
        : "synergy"
});

const missingStartingFamilies: Array<readonly [GongfaId, FamilySeed[]]> = [
  ["yujian-jue", [
    ["steady-sword-heart", "Steady Sword Heart", "Intent lingers longer between successful volleys.", "surgeStability", 0.84, "Passive: Unbroken Sword Intent"],
    ["swordborne-steps", "Swordborne Steps", "Every Evade gathers one stack of Sword Intent.", "evadeSynergy", 1, "Cultivator Evade → Passive: Unbroken Sword Intent"],
    ["penetrating-intent", "Penetrating Intent", "Intent drives both Yujian Skills through additional targets.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"]
  ]],
  ["burning-ring-scripture", [
    ["ember-step", "Ember Step", "Every Evade kindles Heat for the entire Burning Ring package.", "evadeSynergy", 8, "Cultivator Evade → Passive: Kindled Meridians"]
  ]],
  ["blazing-feather-art", [
    ["tempered-plumage", "Tempered Plumage", "Blazing Feathers strike with greater force.", "skill1Damage", 4, "Skill 1: Blazing Feathers"],
    ["expanded-plumage", "Expanded Plumage", "Each volley releases another blazing feather.", "skill1Count", 1, "Skill 1: Blazing Feathers"],
    ["swift-pinions", "Ember-Fed Pinions", "Embers empower both Blazing Feathers and Feather Rain Formation.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["piercing-quills", "Phoenix Quills", "Every Skill in the Blazing Feather package gains piercing force.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["ember-kindling", "Ember Kindling", "Feather hits stoke Embers more rapidly.", "surgeBuild", 0.18, "Passive: Ember Plumage"],
    ["banked-plumage", "Banked Plumage", "Embers take longer to fade between hits.", "surgeStability", 0.84, "Passive: Ember Plumage"]
  ]],
  ["scarlet-wave-manual", [
    ["scarlet-tempering", "Scarlet Tempering", "Scarlet Crescents burn with greater force.", "skill1Damage", 5, "Skill 1: Scarlet Crescents"],
    ["layered-crescents", "Layered Crescents", "Each sweep gains another scarlet wave.", "skill1Count", 1, "Skill 1: Scarlet Crescents"],
    ["rolling-dusk", "Rolling Dusk", "Scorch empowers both Scarlet Crescents and Sunset Wave Apex.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["lancing-heat", "Lancing Heat", "Every Skill in the Scarlet Wave package gains piercing force.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["scorch-kindling", "Scorch Kindling", "Wave hits build Scorch more rapidly.", "surgeBuild", 0.18, "Passive: Rolling Scorch"],
    ["lasting-cinders", "Lasting Cinders", "Scorch takes longer to fade between sweeps.", "surgeStability", 0.84, "Passive: Rolling Scorch"]
  ]],
  ["drifting-frost-needle", [
    ["frost-tempering", "Frost Tempering", "Drifting Frost Needles strike with greater force.", "skill1Damage", 4, "Skill 1: Drifting Frost Needles"],
    ["needle-flurry", "Needle Flurry", "Each volley gains another frost needle.", "skill1Count", 1, "Skill 1: Drifting Frost Needles"],
    ["quickened-current", "Frozen Meridian", "Frost empowers both Drifting Needles and Mirror Needle Constellation.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["crystal-point", "Crystal Point", "Every Skill in the Frost Needle package gains piercing force.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["deepening-frost", "Deepening Frost", "Needle hits gather Frost more rapidly.", "surgeBuild", 0.18, "Passive: Gathering Hoarfrost"],
    ["lingering-winter", "Lingering Winter", "Frost takes longer to thaw between volleys.", "surgeStability", 0.84, "Passive: Gathering Hoarfrost"]
  ]],
  ["black-tide-scripture", [
    ["tide-tempering", "Tide Tempering", "Black Tide surges strike with greater force.", "skill1Damage", 5, "Skill 1: Black Tide"],
    ["layered-tide", "Layered Tide", "Each activation gains another water front.", "skill1Count", 1, "Skill 1: Black Tide"],
    ["quickening-moon", "Moonlit Depth", "Tide empowers both Black Tide and Moon Tide Vault.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["undertow-edge", "Undertow Edge", "Every Skill in the Black Tide package gains piercing force.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["rising-tide", "Rising Tide", "Wave hits raise Tide more rapidly.", "surgeBuild", 0.18, "Passive: Moon-Drawn Tide"],
    ["high-water-mark", "High-Water Mark", "Tide ebbs more slowly between surges.", "surgeStability", 0.84, "Passive: Moon-Drawn Tide"]
  ]],
  ["ice-mirror-guard", [
    ["mirror-tempering", "Mirror Tempering", "Ice Mirror Shards cut with greater force.", "skill1Damage", 4, "Skill 1: Ice Mirror Shards"],
    ["faceted-guard", "Faceted Guard", "The mirror orbit gains another cutting shard.", "skill1Count", 1, "Skill 1: Ice Mirror Shards"],
    ["turning-mirror", "Turning Mirror", "Reflection empowers both Ice Mirror Shards and Frozen Lotus Shell.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["refracted-edge", "Refracted Edge", "Every Skill in the Ice Mirror package gains piercing force.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["clear-reflection", "Clear Reflection", "Shard hits build Reflection more rapidly.", "surgeBuild", 0.18, "Passive: Cold Reflection"],
    ["unclouded-glass", "Unclouded Glass", "Reflection fades more slowly outside danger.", "surgeStability", 0.84, "Passive: Cold Reflection"]
  ]],
  ["green-vine-art", [
    ["thorn-tempering", "Thorn Tempering", "Seeking Vines lash with greater force.", "skill1Damage", 4, "Skill 1: Seeking Vines"],
    ["branching-lashes", "Branching Lashes", "Each cycle grows another seeking vine.", "skill1Count", 1, "Skill 1: Seeking Vines"],
    ["quickened-sap", "Verdant Conduction", "Vinegrowth empowers both Seeking Vines and Verdant Root Network.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["iron-thorns", "Iron Thorns", "Every Skill in the Green Vine package gains piercing force.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["patient-growth", "Patient Growth", "Vine hits build Vinegrowth more rapidly.", "surgeBuild", 0.18, "Passive: Patient Vinegrowth"],
    ["deep-roots", "Deep Roots", "Vinegrowth recedes more slowly between lashes.", "surgeStability", 0.84, "Passive: Patient Vinegrowth"]
  ]],
  ["verdant-ring-scripture", [
    ["petal-tempering", "Petal Tempering", "Verdant Petal Rings cut with greater force.", "skill1Damage", 4, "Skill 1: Verdant Petal Ring"],
    ["fuller-petals", "Fuller Petals", "The living halo gains another leaf blade.", "skill1Count", 1, "Skill 1: Verdant Petal Ring"],
    ["turning-spring", "Turning Spring", "Bloom empowers both Verdant Petal Ring and Sprout-Sun Circle.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["thorned-petals", "Thorned Petals", "Every Skill in the Verdant Ring package gains piercing force.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["early-bloom", "Early Bloom", "Petal hits build Bloom more rapidly.", "surgeBuild", 0.18, "Passive: Returning Spring"],
    ["long-spring", "Long Spring", "Bloom fades more slowly between cycles.", "surgeStability", 0.84, "Passive: Returning Spring"]
  ]],
  ["ironwood-wave-form", [
    ["heartwood-tempering", "Heartwood Tempering", "Ironwood Waves strike with greater force.", "skill1Damage", 5, "Skill 1: Ironwood Wave"],
    ["growth-rings", "Growth Rings", "Each drive gains another timber front.", "skill1Count", 1, "Skill 1: Ironwood Wave"],
    ["heartwood-resonance", "Heartwood Resonance", "Heartwood empowers both Ironwood Wave and Ironwood Surge Form.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["splintered-edge", "Splintered Edge", "Every Skill in the Ironwood package gains piercing force.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["deepening-heartwood", "Deepening Heartwood", "Wave hits deepen Heartwood more rapidly.", "surgeBuild", 0.18, "Passive: Deep Heartwood"],
    ["old-growth", "Old Growth", "Heartwood fades more slowly between drives.", "surgeStability", 0.84, "Passive: Deep Heartwood"]
  ]]
];

const skill2FamilyNames: Record<GongfaId, readonly [string, string, string]> = {
  "yujian-jue": ["Formation Tempering", "Expanded Sword Array", "Swift Formation"],
  "jinfeng-gong": ["Corridor Edge", "Expanding Passage", "Rapid Crosswinds"],
  "gengjin-huti": ["Tempered Shell", "Layered Eruption", "Rapid Reforging"],
  "crimson-furnace-sword-art": ["Cascade Tempering", "Scattering Furnace", "Rapid Cascade"],
  "blazing-feather-art": ["Rain Tempering", "Expanded Plumage", "Swift Descent"],
  "burning-ring-scripture": ["Solar Tempering", "Widened Corona", "Accelerated Cycle"],
  "scarlet-wave-manual": ["Apex Tempering", "Broadened Sunset", "Hastened Dusk"],
  "drifting-frost-needle": ["Constellation Tempering", "Expanded Constellation", "Swift Alignment"],
  "black-tide-scripture": ["Vault Tempering", "Rising Moon", "Turning Tide"],
  "ice-mirror-guard": ["Lotus Tempering", "Layered Lotus", "Rapid Reflection"],
  "green-vine-art": ["Root Tempering", "Branching Network", "Quickened Sap"],
  "verdant-ring-scripture": ["Sunroot Tempering", "Fuller Circle", "Early Spring"],
  "ironwood-wave-form": ["Surge Tempering", "Broad Trunk", "Driving Rings"]
};

const slug = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const extraStarting = missingStartingFamilies.flatMap(([gongfaId, seeds]) => seeds.map((seed) => family(gongfaId, seed)));
const skill2Families = (Object.entries(skill2FamilyNames) as Array<[GongfaId, readonly [string, string, string]]>).flatMap(([gongfaId, names]) => [
  family(gongfaId, [`${gongfaId}-${slug(names[0])}`, names[0], "Deepens Skill 2 damage and resource conversion.", "skill2Damage", 0.15, `Skill 2: ${getGongfaPackage(gongfaId).skill2.name}`], 10),
  family(gongfaId, [`${gongfaId}-${slug(names[1])}`, names[1], "Expands Skill 2 coverage and world presence.", "skill2Coverage", 1, `Skill 2: ${getGongfaPackage(gongfaId).skill2.name}`], 10),
  family(gongfaId, [`${gongfaId}-${slug(names[2])}`, names[2], "Quickens Skill 2 activation and internal cadence.", "skill2Cadence", 0.12, `Skill 2: ${getGongfaPackage(gongfaId).skill2.name}`], 10)
]);

const skill1FamilyIds = new Set([
  "tempered-needles", "rapid-forging", "broadened-flame", "scorching-passage",
  "twin-sword-split", "refined-sword-channel", "cutting-qi-pressure", "broadened-front",
  "guard-pressure", "expanding-shell"
]);
const passiveFamilyIds = new Set([
  "rising-pressure", "sealed-crucible", "gathering-heat", "banked-ember",
  "sword-intent-sharpening", "steady-sword-heart", "gathering-gale", "unbroken-stride",
  "lasting-temper", "bulwark-reflection"
]);
const baselineCategory = (upgrade: BaselineUpgradeSeed): UpgradeConfig["category"] => {
  if (!upgrade.requiredGongfaIds || upgrade.id === "counterflow-ring") return "legacy";
  if (skill1FamilyIds.has(upgrade.id)) return "skill1";
  if (passiveFamilyIds.has(upgrade.id)) return "passive";
  return "synergy";
};

const explicitScope = (
  upgrade: BaselineUpgradeSeed,
  category: UpgradeConfig["category"]
): string => {
  if (upgrade.scope) return upgrade.scope;
  const gongfaId = upgrade.requiredGongfaIds?.[0];
  if (!gongfaId) return `Cultivator Attribute: ${upgrade.name}`;
  if (upgrade.id === "counterflow-ring") return "Skill 1: Revolving Flame Ring";
  const definition = getGongfaPackage(gongfaId);
  if (category === "skill1") return `Skill 1: ${definition.skill1.name}`;
  if (category === "passive") return `Passive: ${definition.passive.name}`;
  return `Owning Gongfa: ${definition.skill1.name} ↔ ${definition.passive.name}`;
};

const finalizeBaseline = (upgrade: BaselineUpgradeSeed): UpgradeConfig => {
  const category = baselineCategory(upgrade);
  return {
    ...upgrade,
    maxSelections: upgrade.requiredGongfaIds ? 2 : upgrade.maxSelections,
    category,
    scope: explicitScope(upgrade, category)
  };
};

export const upgradeConfigs: UpgradeConfig[] = [
  ...baselineUpgradeConfigs.map(finalizeBaseline),
  ...extraStarting,
  ...skill2Families
];
