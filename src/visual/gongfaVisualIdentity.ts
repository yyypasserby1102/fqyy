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
  | "rings"
  | "calamity"
  | "wraiths"
  | "impact"
  | "formation";

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
  "black-tide-scripture": { motifId: "world-cardinal-tide", label: "World-scale cardinal tide", geometry: "tide", accent: 0x286da8, secondary: 0xa8e7ff, spokes: 4, trailStyle: "arena-wide parallel black-water bands" },
  "ice-mirror-guard": { motifId: "mirror-lotus", label: "Faceted mirror lotus", geometry: "lotus", accent: 0x90eaff, secondary: 0xf0ffff, spokes: 8, trailStyle: "shattered glass petals" },
  "green-vine-art": { motifId: "verdant-knot", label: "Branching verdant knot", geometry: "roots", accent: 0x72cf75, secondary: 0xcaf59d, spokes: 5, trailStyle: "seeking tendril curls" },
  "verdant-ring-scripture": { motifId: "sprout-sun", label: "Sprouting sun bloom", geometry: "bloom", accent: 0x9bdd70, secondary: 0xf0e99a, spokes: 9, trailStyle: "opening leaf-petal halo" },
  "ironwood-wave-form": { motifId: "heartwood-rampart", label: "Heartwood growth rampart", geometry: "rings", accent: 0x548f56, secondary: 0xc3b477, spokes: 4, trailStyle: "squared timber splinters" },
  "nine-sun-calamity-seal": { motifId: "fixed-nine-layer-sun", label: "Fixed future-ground solar prediction", geometry: "calamity", accent: 0xffc247, secondary: 0xff6847, spokes: 9, trailStyle: "nine omen rings collapsing into one sun" },
  "mist-wraith-canon": { motifId: "mist-wraith-retinue", label: "Orbiting mist retinue", geometry: "wraiths", accent: 0x75d9ed, secondary: 0xe5fbff, spokes: 6, trailStyle: "curling spirit tails" },
  "heavenfall-body-art": { motifId: "mobile-meteor-mass", label: "Mass-building falling-star body", geometry: "impact", accent: 0xf0d38a, secondary: 0xffffff, spokes: 5, trailStyle: "compressed meteor wake and projected landing" },
  "thousand-root-formation": { motifId: "lifebound-root-lineages", label: "Living host root lineages", geometry: "roots", accent: 0x5fbd63, secondary: 0xdff0a0, spokes: 5, trailStyle: "body-bursting roots converging into one mother" },
  "flame-demon-body-art": { motifId: "furnace-blood-fists", label: "Furnace-blood combination", geometry: "impact", accent: 0xe94b35, secondary: 0xffb14f, spokes: 6, trailStyle: "horned flame impact arcs" },
  "vermilion-bird-covenant": { motifId: "single-vermilion-companion", label: "One living Vermilion bird", geometry: "wings", accent: 0xff4f36, secondary: 0xffd168, spokes: 2, trailStyle: "one outbound-and-return feather route" },
  "frozen-river-formation": { motifId: "underice-river-array", label: "Under-ice river array", geometry: "formation", accent: 0x69cfe8, secondary: 0xe1fbff, spokes: 6, trailStyle: "cracked frost channels" },
  "moonfall-tide-ritual": { motifId: "abyssal-moonfall", label: "Abyssal moonfall", geometry: "calamity", accent: 0x5688d8, secondary: 0xbfeaff, spokes: 8, trailStyle: "converging dark tides" },
  "sword-burial-formation": { motifId: "buried-sword-tomb", label: "Buried sword tomb", geometry: "formation", accent: 0xd9c887, secondary: 0xf5f1dd, spokes: 10, trailStyle: "rising grave blades" },
  "heaven-sundering-edict": { motifId: "fixed-double-judgment-line", label: "Physical line and exact delayed spell echo", geometry: "sword-seal", accent: 0xf0df9e, secondary: 0xffffff, spokes: 2, trailStyle: "one fixed world-space line written twice" },
  "myriad-beast-grove": { motifId: "three-beast-kinship", label: "Boar Fox Deer hunting formation", geometry: "formation", accent: 0x6fbd61, secondary: 0xd7eda0, spokes: 3, trailStyle: "three species-specific hunting routes" },
  "ancient-tree-body-art": { motifId: "rooted-growth-rings", label: "Root trunk canopy transformation", geometry: "rings", accent: 0x688b4b, secondary: 0xd1bd79, spokes: 7, trailStyle: "age rings and occupied branch sectors" }
};

export function getGongfaVisualIdentity(gongfaId: GongfaId): GongfaVisualIdentity {
  return gongfaVisualIdentities[gongfaId];
}
