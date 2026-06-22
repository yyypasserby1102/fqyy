import type { GongfaId } from "./gongfa";

export type UpgradeEffect =
  | "methodDamage"
  | "methodCooldown"
  | "methodCount"
  | "methodPierce"
  | "methodRange"
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
  | "waveSynergy";

export interface UpgradeConfig {
  id: string;
  name: string;
  lore: string;
  effect: UpgradeEffect;
  value: number;
  requiredGongfaIds?: GongfaId[];
  maxSelections?: number;
}

export const upgradeConfigs: UpgradeConfig[] = [
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
    effect: "methodDamage",
    value: 5,
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    maxSelections: 3
  },
  {
    id: "rapid-forging",
    name: "Rapid Forging",
    lore: "Furnace Needles fire 12% faster.",
    effect: "methodCooldown",
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
    effect: "methodRange",
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
    effect: "methodRange",
    value: 14,
    requiredGongfaIds: ["burning-ring-scripture"],
    maxSelections: 3
  },
  {
    id: "rapid-revolution",
    name: "Rapid Revolution",
    lore: "The ring rotates 10% faster.",
    effect: "methodCooldown",
    value: 0.9,
    requiredGongfaIds: ["burning-ring-scripture"],
    maxSelections: 3
  },
  {
    id: "scorching-passage",
    name: "Scorching Passage",
    lore: "+5 burning ring damage.",
    effect: "methodDamage",
    value: 5,
    requiredGongfaIds: ["burning-ring-scripture"],
    maxSelections: 3
  },
  {
    id: "counterflow-ring",
    name: "Counterflow Ring",
    lore: "Add a counter-rotating inner ring.",
    effect: "methodCount",
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
    lore: "+5 Yujian damage.",
    effect: "methodDamage",
    value: 5,
    requiredGongfaIds: ["yujian-jue"],
    maxSelections: 3
  },
  {
    id: "twin-sword-split",
    name: "Twin Sword Split",
    lore: "+1 flying sword per volley.",
    effect: "methodCount",
    value: 1,
    requiredGongfaIds: ["yujian-jue"],
    maxSelections: 3
  },
  {
    id: "refined-sword-channel",
    name: "Refined Sword Channel",
    lore: "Yujian attacks 12% faster.",
    effect: "methodCooldown",
    value: 0.88,
    requiredGongfaIds: ["yujian-jue"],
    maxSelections: 3
  },
  {
    id: "cutting-qi-pressure",
    name: "Cutting Qi Pressure",
    lore: "+6 Jinfeng damage.",
    effect: "methodDamage",
    value: 6,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "broadened-front",
    name: "Broadened Front",
    lore: "+1 cutting wave.",
    effect: "methodCount",
    value: 1,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "long-edge-resonance",
    name: "Long Edge Resonance",
    lore: "+28 Jinfeng range.",
    effect: "methodRange",
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
    effect: "methodDamage",
    value: 5,
    requiredGongfaIds: ["gengjin-huti"],
    maxSelections: 3
  },
  {
    id: "retaliatory-edge",
    name: "Retaliatory Edge",
    lore: "+7 retaliation damage.",
    effect: "retaliationDamage",
    value: 7,
    requiredGongfaIds: ["gengjin-huti"],
    maxSelections: 3
  },
  {
    id: "expanding-shell",
    name: "Expanding Shell",
    lore: "+18 aura radius.",
    effect: "methodRange",
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
