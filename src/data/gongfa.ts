import type { RootId } from "./linggen";
import type { StageId } from "./stages";

export type GongfaPattern = "homing" | "wave" | "aura";
export type GongfaTag = GongfaPattern | RootId | "projectile" | "sword" | "defensive" | "explosive";

export type GongfaId =
  | "yujian-jue"
  | "jinfeng-gong"
  | "gengjin-huti"
  | "crimson-furnace-sword-art"
  | "blazing-feather-art"
  | "burning-ring-scripture"
  | "scarlet-wave-manual"
  | "drifting-frost-needle"
  | "black-tide-scripture"
  | "ice-mirror-guard"
  | "green-vine-art"
  | "verdant-ring-scripture"
  | "ironwood-wave-form";

export interface GongfaStageState {
  damage: number;
  cooldownMs: number;
  count: number;
  pierce: number;
  projectileSpeed: number;
  projectileLifetimeMs: number;
  spreadDeg: number;
  auraRadius: number;
  retaliationDamage: number;
  range: number;
  returnShots: number;
  shellBursts: number;
}

export interface GongfaConfig {
  id: GongfaId;
  name: string;
  requiredRoots: RootId[];
  pattern: GongfaPattern;
  title: string;
  lore: string;
  projectileTexture: string;
  tint: number;
  stages: Partial<Record<StageId, GongfaStageState>>;
}

const defaultProjectileSpeed = 430;
const defaultProjectileLifetime = 1400;

export const gongfaConfigs: Record<GongfaId, GongfaConfig> = {
  "yujian-jue": {
    id: "yujian-jue",
    name: "Yujian Jue",
    requiredRoots: ["metal"],
    pattern: "homing",
    title: "Yujian Jue",
    lore: "Flying swords answer disciplined metal qi.",
    projectileTexture: "flying-sword",
    tint: 0xb7e3ff,
    stages: {
      lianqi: {
        damage: 15,
        cooldownMs: 850,
        count: 1,
        pierce: 1,
        projectileSpeed: defaultProjectileSpeed,
        projectileLifetimeMs: defaultProjectileLifetime,
        spreadDeg: 6,
        auraRadius: 0,
        retaliationDamage: 0,
        range: 0,
        returnShots: 0,
        shellBursts: 0
      },
      zhuji: {
        damage: 19,
        cooldownMs: 720,
        count: 2,
        pierce: 2,
        projectileSpeed: 470,
        projectileLifetimeMs: 1500,
        spreadDeg: 8,
        auraRadius: 0,
        retaliationDamage: 0,
        range: 0,
        returnShots: 0,
        shellBursts: 0
      },
      jindan: {
        damage: 24,
        cooldownMs: 620,
        count: 3,
        pierce: 2,
        projectileSpeed: 520,
        projectileLifetimeMs: 1550,
        spreadDeg: 10,
        auraRadius: 0,
        retaliationDamage: 0,
        range: 0,
        returnShots: 1,
        shellBursts: 0
      }
    }
  },
  "jinfeng-gong": {
    id: "jinfeng-gong",
    name: "Jinfeng Gong",
    requiredRoots: ["metal"],
    pattern: "wave",
    title: "Jinfeng Gong",
    lore: "Metal qi bursts outward in sharp cutting fronts.",
    projectileTexture: "metal-wave",
    tint: 0xdcefff,
    stages: {
      lianqi: {
        damage: 20,
        cooldownMs: 880,
        count: 2,
        pierce: 1,
        projectileSpeed: 360,
        projectileLifetimeMs: 750,
        spreadDeg: 18,
        auraRadius: 0,
        retaliationDamage: 0,
        range: 140,
        returnShots: 0,
        shellBursts: 0
      },
      zhuji: {
        damage: 26,
        cooldownMs: 740,
        count: 3,
        pierce: 2,
        projectileSpeed: 390,
        projectileLifetimeMs: 860,
        spreadDeg: 28,
        auraRadius: 0,
        retaliationDamage: 0,
        range: 180,
        returnShots: 0,
        shellBursts: 0
      },
      jindan: {
        damage: 32,
        cooldownMs: 660,
        count: 4,
        pierce: 2,
        projectileSpeed: 420,
        projectileLifetimeMs: 960,
        spreadDeg: 34,
        auraRadius: 0,
        retaliationDamage: 0,
        range: 220,
        returnShots: 2,
        shellBursts: 0
      }
    }
  },
  "gengjin-huti": {
    id: "gengjin-huti",
    name: "Gengjin Huti",
    requiredRoots: ["metal"],
    pattern: "aura",
    title: "Gengjin Huti",
    lore: "Harden the body and answer pressure with metal-edged retaliation.",
    projectileTexture: "aura-blade",
    tint: 0xcde8ff,
    stages: {
      lianqi: {
        damage: 9,
        cooldownMs: 1000,
        count: 6,
        pierce: 1,
        projectileSpeed: 280,
        projectileLifetimeMs: 420,
        spreadDeg: 360,
        auraRadius: 92,
        retaliationDamage: 8,
        range: 0,
        returnShots: 0,
        shellBursts: 0
      },
      zhuji: {
        damage: 13,
        cooldownMs: 820,
        count: 8,
        pierce: 1,
        projectileSpeed: 300,
        projectileLifetimeMs: 460,
        spreadDeg: 360,
        auraRadius: 108,
        retaliationDamage: 14,
        range: 0,
        returnShots: 0,
        shellBursts: 0
      },
      jindan: {
        damage: 18,
        cooldownMs: 700,
        count: 10,
        pierce: 2,
        projectileSpeed: 320,
        projectileLifetimeMs: 520,
        spreadDeg: 360,
        auraRadius: 128,
        retaliationDamage: 20,
        range: 0,
        returnShots: 0,
        shellBursts: 1
      }
    }
  },
  "crimson-furnace-sword-art": {
    id: "crimson-furnace-sword-art",
    name: "Crimson Furnace Sword Art",
    requiredRoots: ["fire", "metal"],
    pattern: "homing",
    title: "Crimson Furnace Sword Art",
    lore: "Focused blades embed into a crucible of heat and shrapnel.",
    projectileTexture: "qi-bolt",
    tint: 0xff8d6b,
    stages: {
      lianqi: {
        damage: 14,
        cooldownMs: 880,
        count: 2,
        pierce: 1,
        projectileSpeed: 450,
        projectileLifetimeMs: 900,
        spreadDeg: 8,
        auraRadius: 0,
        retaliationDamage: 0,
        range: 52,
        returnShots: 0,
        shellBursts: 0
      },
      zhuji: {
        damage: 18,
        cooldownMs: 760,
        count: 3,
        pierce: 1,
        projectileSpeed: 480,
        projectileLifetimeMs: 980,
        spreadDeg: 10,
        auraRadius: 0,
        retaliationDamage: 0,
        range: 62,
        returnShots: 0,
        shellBursts: 0
      },
      jindan: {
        damage: 23,
        cooldownMs: 650,
        count: 4,
        pierce: 1,
        projectileSpeed: 510,
        projectileLifetimeMs: 1050,
        spreadDeg: 12,
        auraRadius: 0,
        retaliationDamage: 0,
        range: 72,
        returnShots: 0,
        shellBursts: 0
      }
    }
  },
  "blazing-feather-art": {
    id: "blazing-feather-art",
    name: "Blazing Feather Art",
    requiredRoots: ["fire"],
    pattern: "homing",
    title: "Blazing Feather Art",
    lore: "Condense fierce fire qi into blazing feathers.",
    projectileTexture: "qi-bolt",
    tint: 0xff9b61,
    stages: {
      lianqi: { damage: 14, cooldownMs: 820, count: 1, pierce: 1, projectileSpeed: 440, projectileLifetimeMs: 1300, spreadDeg: 10, auraRadius: 0, retaliationDamage: 0, range: 0, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 18, cooldownMs: 690, count: 2, pierce: 1, projectileSpeed: 470, projectileLifetimeMs: 1400, spreadDeg: 14, auraRadius: 0, retaliationDamage: 0, range: 0, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 24, cooldownMs: 580, count: 3, pierce: 1, projectileSpeed: 510, projectileLifetimeMs: 1450, spreadDeg: 16, auraRadius: 0, retaliationDamage: 0, range: 0, returnShots: 1, shellBursts: 0 }
    }
  },
  "burning-ring-scripture": {
    id: "burning-ring-scripture",
    name: "Burning Ring Scripture",
    requiredRoots: ["fire"],
    pattern: "aura",
    title: "Burning Ring Scripture",
    lore: "Coat the body in rotating heat and punish proximity.",
    projectileTexture: "aura-blade",
    tint: 0xff8b4f,
    stages: {
      lianqi: { damage: 8, cooldownMs: 980, count: 6, pierce: 1, projectileSpeed: 290, projectileLifetimeMs: 420, spreadDeg: 360, auraRadius: 90, retaliationDamage: 10, range: 0, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 12, cooldownMs: 820, count: 8, pierce: 1, projectileSpeed: 300, projectileLifetimeMs: 470, spreadDeg: 360, auraRadius: 110, retaliationDamage: 15, range: 0, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 17, cooldownMs: 700, count: 10, pierce: 1, projectileSpeed: 320, projectileLifetimeMs: 520, spreadDeg: 360, auraRadius: 130, retaliationDamage: 22, range: 0, returnShots: 0, shellBursts: 0 }
    }
  },
  "scarlet-wave-manual": {
    id: "scarlet-wave-manual",
    name: "Scarlet Wave Manual",
    requiredRoots: ["fire"],
    pattern: "wave",
    title: "Scarlet Wave Manual",
    lore: "Fire qi spills forward in scorching crescents.",
    projectileTexture: "metal-wave",
    tint: 0xff7a45,
    stages: {
      lianqi: { damage: 19, cooldownMs: 860, count: 2, pierce: 1, projectileSpeed: 370, projectileLifetimeMs: 760, spreadDeg: 20, auraRadius: 0, retaliationDamage: 0, range: 150, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 25, cooldownMs: 730, count: 3, pierce: 2, projectileSpeed: 400, projectileLifetimeMs: 860, spreadDeg: 28, auraRadius: 0, retaliationDamage: 0, range: 190, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 31, cooldownMs: 650, count: 4, pierce: 2, projectileSpeed: 430, projectileLifetimeMs: 940, spreadDeg: 34, auraRadius: 0, retaliationDamage: 0, range: 230, returnShots: 0, shellBursts: 0 }
    }
  },
  "drifting-frost-needle": {
    id: "drifting-frost-needle",
    name: "Drifting Frost Needle",
    requiredRoots: ["water"],
    pattern: "homing",
    title: "Drifting Frost Needle",
    lore: "Water qi becomes cold needles that curve toward weakness.",
    projectileTexture: "qi-bolt",
    tint: 0x8fe3ff,
    stages: {
      lianqi: { damage: 13, cooldownMs: 800, count: 1, pierce: 1, projectileSpeed: 450, projectileLifetimeMs: 1350, spreadDeg: 10, auraRadius: 0, retaliationDamage: 0, range: 0, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 17, cooldownMs: 680, count: 2, pierce: 2, projectileSpeed: 480, projectileLifetimeMs: 1450, spreadDeg: 14, auraRadius: 0, retaliationDamage: 0, range: 0, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 22, cooldownMs: 560, count: 3, pierce: 2, projectileSpeed: 520, projectileLifetimeMs: 1500, spreadDeg: 16, auraRadius: 0, retaliationDamage: 0, range: 0, returnShots: 1, shellBursts: 0 }
    }
  },
  "black-tide-scripture": {
    id: "black-tide-scripture",
    name: "Black Tide Scripture",
    requiredRoots: ["water"],
    pattern: "wave",
    title: "Black Tide Scripture",
    lore: "Compressed water qi rolls outward in layered tides.",
    projectileTexture: "metal-wave",
    tint: 0x72c9ff,
    stages: {
      lianqi: { damage: 18, cooldownMs: 900, count: 2, pierce: 1, projectileSpeed: 350, projectileLifetimeMs: 780, spreadDeg: 20, auraRadius: 0, retaliationDamage: 0, range: 150, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 23, cooldownMs: 760, count: 3, pierce: 2, projectileSpeed: 380, projectileLifetimeMs: 860, spreadDeg: 28, auraRadius: 0, retaliationDamage: 0, range: 190, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 29, cooldownMs: 660, count: 4, pierce: 2, projectileSpeed: 410, projectileLifetimeMs: 940, spreadDeg: 34, auraRadius: 0, retaliationDamage: 0, range: 235, returnShots: 0, shellBursts: 0 }
    }
  },
  "ice-mirror-guard": {
    id: "ice-mirror-guard",
    name: "Ice Mirror Guard",
    requiredRoots: ["water"],
    pattern: "aura",
    title: "Ice Mirror Guard",
    lore: "Cold water qi forms defensive mirrors that shatter outward.",
    projectileTexture: "aura-blade",
    tint: 0x90eaff,
    stages: {
      lianqi: { damage: 8, cooldownMs: 980, count: 6, pierce: 1, projectileSpeed: 270, projectileLifetimeMs: 420, spreadDeg: 360, auraRadius: 94, retaliationDamage: 9, range: 0, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 12, cooldownMs: 820, count: 8, pierce: 1, projectileSpeed: 290, projectileLifetimeMs: 470, spreadDeg: 360, auraRadius: 112, retaliationDamage: 14, range: 0, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 17, cooldownMs: 700, count: 10, pierce: 2, projectileSpeed: 310, projectileLifetimeMs: 520, spreadDeg: 360, auraRadius: 132, retaliationDamage: 20, range: 0, returnShots: 0, shellBursts: 0 }
    }
  },
  "green-vine-art": {
    id: "green-vine-art",
    name: "Green Vine Art",
    requiredRoots: ["wood"],
    pattern: "homing",
    title: "Green Vine Art",
    lore: "Wood qi lashes outward in living tendrils.",
    projectileTexture: "qi-bolt",
    tint: 0x8fdc7b,
    stages: {
      lianqi: { damage: 12, cooldownMs: 840, count: 1, pierce: 1, projectileSpeed: 430, projectileLifetimeMs: 1320, spreadDeg: 10, auraRadius: 0, retaliationDamage: 0, range: 0, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 16, cooldownMs: 700, count: 2, pierce: 1, projectileSpeed: 470, projectileLifetimeMs: 1420, spreadDeg: 14, auraRadius: 0, retaliationDamage: 0, range: 0, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 21, cooldownMs: 590, count: 3, pierce: 2, projectileSpeed: 500, projectileLifetimeMs: 1480, spreadDeg: 16, auraRadius: 0, retaliationDamage: 0, range: 0, returnShots: 1, shellBursts: 0 }
    }
  },
  "verdant-ring-scripture": {
    id: "verdant-ring-scripture",
    name: "Verdant Ring Scripture",
    requiredRoots: ["wood"],
    pattern: "aura",
    title: "Verdant Ring Scripture",
    lore: "Wood qi circles the body and bursts into thorned growth.",
    projectileTexture: "aura-blade",
    tint: 0x94dc87,
    stages: {
      lianqi: { damage: 8, cooldownMs: 1000, count: 6, pierce: 1, projectileSpeed: 275, projectileLifetimeMs: 420, spreadDeg: 360, auraRadius: 96, retaliationDamage: 8, range: 0, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 11, cooldownMs: 840, count: 8, pierce: 1, projectileSpeed: 295, projectileLifetimeMs: 470, spreadDeg: 360, auraRadius: 114, retaliationDamage: 13, range: 0, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 16, cooldownMs: 720, count: 10, pierce: 2, projectileSpeed: 315, projectileLifetimeMs: 520, spreadDeg: 360, auraRadius: 134, retaliationDamage: 19, range: 0, returnShots: 0, shellBursts: 0 }
    }
  },
  "ironwood-wave-form": {
    id: "ironwood-wave-form",
    name: "Ironwood Wave Form",
    requiredRoots: ["wood"],
    pattern: "wave",
    title: "Ironwood Wave Form",
    lore: "Wood qi unfolds forward in layered rib-like slashes.",
    projectileTexture: "metal-wave",
    tint: 0x74b75f,
    stages: {
      lianqi: { damage: 17, cooldownMs: 910, count: 2, pierce: 1, projectileSpeed: 340, projectileLifetimeMs: 780, spreadDeg: 20, auraRadius: 0, retaliationDamage: 0, range: 145, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 22, cooldownMs: 770, count: 3, pierce: 2, projectileSpeed: 370, projectileLifetimeMs: 860, spreadDeg: 28, auraRadius: 0, retaliationDamage: 0, range: 185, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 28, cooldownMs: 670, count: 4, pierce: 2, projectileSpeed: 400, projectileLifetimeMs: 940, spreadDeg: 34, auraRadius: 0, retaliationDamage: 0, range: 225, returnShots: 0, shellBursts: 0 }
    }
  }
};

for (const gongfa of Object.values(gongfaConfigs)) {
  gongfa.stages.yuanying ??= gongfa.stages.jindan;
}

export function getCompatibleGongfaIds(roots: RootId[]): GongfaId[] {
  return (Object.values(gongfaConfigs) as GongfaConfig[])
    .filter((gongfa) => gongfa.requiredRoots.every((root) => roots.includes(root)))
    .map((gongfa) => gongfa.id);
}

export function getGongfaSkillTags(gongfaId: GongfaId): GongfaTag[] {
  switch (gongfaId) {
    case "yujian-jue":
      return ["projectile", "metal", "sword"];
    case "jinfeng-gong":
      return ["wave", "metal"];
    case "gengjin-huti":
      return ["aura", "metal", "defensive"];
    case "crimson-furnace-sword-art":
      return ["projectile", "explosive", "fire", "metal"];
    case "burning-ring-scripture":
      return ["aura", "fire"];
    default: {
      const gongfa = gongfaConfigs[gongfaId];
      return [gongfa.pattern, ...gongfa.requiredRoots];
    }
  }
}
