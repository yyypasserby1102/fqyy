import type { GongfaId } from "./gongfa";

export type UpgradeEffect =
  | "methodDamage"
  | "methodCooldown"
  | "methodCount"
  | "methodPierce"
  | "methodRange"
  | "retaliationDamage"
  | "moveSpeed"
  | "maxHealth"
  | "heal"
  | "magnet";

export interface UpgradeConfig {
  id: string;
  name: string;
  lore: string;
  effect: UpgradeEffect;
  value: number;
  requiredGongfaIds?: GongfaId[];
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
    id: "sword-intent-sharpening",
    name: "Sword Intent Sharpening",
    lore: "+5 Yujian damage.",
    effect: "methodDamage",
    value: 5,
    requiredGongfaIds: ["yujian-jue"]
  },
  {
    id: "twin-sword-split",
    name: "Twin Sword Split",
    lore: "+1 flying sword per volley.",
    effect: "methodCount",
    value: 1,
    requiredGongfaIds: ["yujian-jue"]
  },
  {
    id: "refined-sword-channel",
    name: "Refined Sword Channel",
    lore: "Yujian attacks 12% faster.",
    effect: "methodCooldown",
    value: 0.88,
    requiredGongfaIds: ["yujian-jue"]
  },
  {
    id: "cutting-qi-pressure",
    name: "Cutting Qi Pressure",
    lore: "+6 Jinfeng damage.",
    effect: "methodDamage",
    value: 6,
    requiredGongfaIds: ["jinfeng-gong"]
  },
  {
    id: "broadened-front",
    name: "Broadened Front",
    lore: "+1 cutting wave.",
    effect: "methodCount",
    value: 1,
    requiredGongfaIds: ["jinfeng-gong"]
  },
  {
    id: "long-edge-resonance",
    name: "Long Edge Resonance",
    lore: "+28 Jinfeng range.",
    effect: "methodRange",
    value: 28,
    requiredGongfaIds: ["jinfeng-gong"]
  },
  {
    id: "guard-pressure",
    name: "Guard Pressure",
    lore: "+5 Gengjin aura damage.",
    effect: "methodDamage",
    value: 5,
    requiredGongfaIds: ["gengjin-huti"]
  },
  {
    id: "retaliatory-edge",
    name: "Retaliatory Edge",
    lore: "+7 retaliation damage.",
    effect: "retaliationDamage",
    value: 7,
    requiredGongfaIds: ["gengjin-huti"]
  },
  {
    id: "expanding-shell",
    name: "Expanding Shell",
    lore: "+18 aura radius.",
    effect: "methodRange",
    value: 18,
    requiredGongfaIds: ["gengjin-huti"]
  }
];
