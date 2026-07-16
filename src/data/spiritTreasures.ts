export type SpiritTreasureId =
  | "jade-heart-pendant"
  | "windstep-talisman"
  | "lodestone-charm"
  | "ironhide-seal"
  | "spiritbloom-vial"
  | "farsight-mirror";

export type SpiritTreasureEffectKind = "maxHealth" | "moveSpeed" | "magnetRadius" | "mitigation";
export type SpiritTreasureSeal = "vitality" | "bulwark" | "harvest" | "perception" | "windwalk";

export interface SpiritTreasureConfig {
  id: SpiritTreasureId;
  name: string;
  lore: string;
  effect: SpiritTreasureEffectKind;
  value: number;
  resonanceSeals: [SpiritTreasureSeal, SpiritTreasureSeal];
  signature: { id: string; name: string; effect: string };
  culmination: { id: string; name: string; effect: string };
}

/** A cultivator can keep three active Spirit Treasures at once. */
export const MAX_SPIRIT_TREASURE_SLOTS = 3;

export const spiritTreasureConfigs: Record<SpiritTreasureId, SpiritTreasureConfig> = {
  "jade-heart-pendant": {
    id: "jade-heart-pendant",
    name: "Jade Heart Pendant",
    lore: "A cool jade warmth steadies the meridians, deepening vitality.",
    effect: "maxHealth",
    value: 30,
    resonanceSeals: ["vitality", "perception"],
    signature: { id: "steady-heart", name: "Steady Heart", effect: "Below 30% vitality, recover 5% max HP once per 30 seconds." },
    culmination: { id: "jade-heart-reborn", name: "Jade Heart Reborn", effect: "Emergency recovery rises to 10% max HP." }
  },
  "windstep-talisman": {
    id: "windstep-talisman",
    name: "Windstep Talisman",
    lore: "Footfalls lighten as if carried on a mountain breeze.",
    effect: "moveSpeed",
    value: 24,
    resonanceSeals: ["windwalk", "harvest"],
    signature: { id: "gale-return", name: "Gale Return", effect: "Evade cooldown is 8% shorter." },
    culmination: { id: "unbound-wind", name: "Unbound Wind", effect: "Evade cooldown is 15% shorter." }
  },
  "lodestone-charm": {
    id: "lodestone-charm",
    name: "Lodestone Charm",
    lore: "Loose Qi drifts toward its bearer of its own accord.",
    effect: "magnetRadius",
    value: 48,
    resonanceSeals: ["harvest", "perception"],
    signature: { id: "qi-pulse", name: "Qi Pulse", effect: "Collecting Qi deals 4 damage in a 160px pulse." },
    culmination: { id: "spirit-tide", name: "Spirit Tide", effect: "Qi Pulse damage rises to 8." }
  },
  "ironhide-seal": {
    id: "ironhide-seal",
    name: "Ironhide Seal",
    lore: "The skin tempers against blows like banded iron.",
    effect: "mitigation",
    value: 0.08,
    resonanceSeals: ["bulwark", "vitality"],
    signature: { id: "iron-reprieve", name: "Iron Reprieve", effect: "A heavy hit opens two seconds of 18% follow-up protection." },
    culmination: { id: "unbroken-seal", name: "Unbroken Seal", effect: "Follow-up protection rises to 30%." }
  },
  "spiritbloom-vial": {
    id: "spiritbloom-vial",
    name: "Spiritbloom Vial",
    lore: "A slow bloom of spirit essence fortifies the body.",
    effect: "maxHealth",
    value: 18,
    resonanceSeals: ["vitality", "bulwark"],
    signature: { id: "second-bloom", name: "Second Bloom", effect: "Healing received is 12% stronger." },
    culmination: { id: "endless-bloom", name: "Endless Bloom", effect: "Healing received is 25% stronger." }
  },
  "farsight-mirror": {
    id: "farsight-mirror",
    name: "Farsight Mirror",
    lore: "Distant Qi glints in the glass and answers the call.",
    effect: "magnetRadius",
    value: 30,
    resonanceSeals: ["perception", "windwalk"],
    signature: { id: "far-strike", name: "Far Strike", effect: "Projectile-tagged hits deal 6% more damage." },
    culmination: { id: "heavenly-sight", name: "Heavenly Sight", effect: "Projectile-tagged hits deal 12% more damage." }
  }
};

export function getSpiritTreasureConfig(id: SpiritTreasureId): SpiritTreasureConfig {
  return spiritTreasureConfigs[id];
}
