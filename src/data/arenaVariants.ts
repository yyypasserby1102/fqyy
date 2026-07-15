import type { StageId } from "./stages";

export interface ArenaVariantDefinition {
  variantId: "mist-court" | "foundation-terrace" | "golden-core-sanctum" | "nascent-sky-dais";
  atmosphere: "drifting-mist" | "foundation-dust" | "golden-embers" | "storm-wisps";
  floorTint: number;
  primary: number;
  secondary: number;
  moteColor: number;
  moteCount: number;
  seal: "rings" | "foundation" | "core" | "star";
  atmosphereShape: "mist" | "motes";
  identityLabel: string;
}

export const ARENA_VARIANTS: Record<StageId, ArenaVariantDefinition> = {
  lianqi: {
    variantId: "mist-court", atmosphere: "drifting-mist", floorTint: 0xb8dbe0,
    primary: 0x70d7df, secondary: 0x9adbc8, moteColor: 0xa9ece7, moteCount: 16,
    seal: "rings", atmosphereShape: "mist", identityLabel: "Fallen Sect Courtyard · Breath"
  },
  zhuji: {
    variantId: "foundation-terrace", atmosphere: "foundation-dust", floorTint: 0xc5c3a8,
    primary: 0x63c3b1, secondary: 0xc3975d, moteColor: 0xd3b477, moteCount: 18,
    seal: "foundation", atmosphereShape: "motes", identityLabel: "Mist Bamboo Valley · Root"
  },
  jindan: {
    variantId: "golden-core-sanctum", atmosphere: "golden-embers", floorTint: 0xd7c49d,
    primary: 0xe2b65d, secondary: 0x8bd3c7, moteColor: 0xffd477, moteCount: 22,
    seal: "core", atmosphereShape: "motes", identityLabel: "Burial Ridge · Core"
  },
  yuanying: {
    variantId: "nascent-sky-dais", atmosphere: "storm-wisps", floorTint: 0xc7b9df,
    primary: 0xa993ef, secondary: 0x72d6e2, moteColor: 0xb9a5ff, moteCount: 24,
    seal: "star", atmosphereShape: "mist", identityLabel: "Cloudbreak Summit · Soul"
  }
};
