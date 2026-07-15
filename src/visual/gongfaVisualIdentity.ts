import type { GongfaId } from "../data/gongfa";

export type GongfaSigilGeometry =
  | "sword-seal"
  | "corridor"
  | "facets"
  | "furnace"
  | "wings"
  | "solar"
  | "crescent"
  | "constellation"
  | "tide"
  | "lotus"
  | "roots"
  | "bloom"
  | "rings";

export interface GongfaVisualIdentity {
  motifId: string;
  label: string;
  geometry: GongfaSigilGeometry;
  accent: number;
  secondary: number;
  spokes: number;
  trailStyle: string;
}

export const gongfaVisualIdentities: Record<GongfaId, GongfaVisualIdentity> = {
  "yujian-jue": { motifId: "ordered-sword-seal", label: "Ordered sword seal", geometry: "sword-seal", accent: 0xb7e3ff, secondary: 0xf4f8ff, spokes: 5, trailStyle: "straight blade script" },
  "jinfeng-gong": { motifId: "golden-horizon", label: "Golden cutting horizon", geometry: "corridor", accent: 0xf2d273, secondary: 0xdcefff, spokes: 3, trailStyle: "parallel wind ribbons" },
  "gengjin-huti": { motifId: "tempered-facets", label: "Tempered guard facets", geometry: "facets", accent: 0xaed7e5, secondary: 0xffffff, spokes: 8, trailStyle: "angular shield echoes" },
  "crimson-furnace-sword-art": { motifId: "crucible-rune", label: "Crimson crucible rune", geometry: "furnace", accent: 0xff654f, secondary: 0xffc05c, spokes: 4, trailStyle: "black-core ember sparks" },
  "blazing-feather-art": { motifId: "phoenix-pinions", label: "Phoenix feather pinions", geometry: "wings", accent: 0xff9b61, secondary: 0xffdc79, spokes: 7, trailStyle: "falling ember barbs" },
  "burning-ring-scripture": { motifId: "revolving-corona", label: "Revolving solar corona", geometry: "solar", accent: 0xff8b4f, secondary: 0xffef9a, spokes: 10, trailStyle: "segmented solar orbit" },
  "scarlet-wave-manual": { motifId: "sunset-crossing", label: "Crossing sunset crescents", geometry: "crescent", accent: 0xff5f42, secondary: 0xffbb69, spokes: 2, trailStyle: "molten crescent wake" },
  "drifting-frost-needle": { motifId: "hoarfrost-stars", label: "Hoarfrost needle stars", geometry: "constellation", accent: 0x8fe3ff, secondary: 0xe8fbff, spokes: 6, trailStyle: "crystal point glints" },
  "black-tide-scripture": { motifId: "moon-tide-vault", label: "Moon-drawn tide vault", geometry: "tide", accent: 0x4da8ef, secondary: 0xa8e7ff, spokes: 3, trailStyle: "reversing dark-water bands" },
  "ice-mirror-guard": { motifId: "mirror-lotus", label: "Faceted mirror lotus", geometry: "lotus", accent: 0x90eaff, secondary: 0xf0ffff, spokes: 8, trailStyle: "shattered glass petals" },
  "green-vine-art": { motifId: "verdant-knot", label: "Branching verdant knot", geometry: "roots", accent: 0x72cf75, secondary: 0xcaf59d, spokes: 5, trailStyle: "seeking tendril curls" },
  "verdant-ring-scripture": { motifId: "sprout-sun", label: "Sprouting sun bloom", geometry: "bloom", accent: 0x9bdd70, secondary: 0xf0e99a, spokes: 9, trailStyle: "opening leaf-petal halo" },
  "ironwood-wave-form": { motifId: "heartwood-rampart", label: "Heartwood growth rampart", geometry: "rings", accent: 0x548f56, secondary: 0xc3b477, spokes: 4, trailStyle: "squared timber splinters" }
};

export function getGongfaVisualIdentity(gongfaId: GongfaId): GongfaVisualIdentity {
  return gongfaVisualIdentities[gongfaId];
}
