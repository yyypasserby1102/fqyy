import type { RootId } from "./linggen";
import type { StageId } from "./stages";
import type { ProjectileVisualId } from "../types/combatVisuals";

export type GongfaPattern = "homing" | "wave" | "aura" | "summon" | "melee" | "trap" | "ritual";
export type GongfaTag = GongfaPattern | RootId | "projectile" | "sword" | "defensive" | "explosive" | "ailment" | "reflect";

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
  | "ironwood-wave-form"
  | "nine-sun-calamity-seal"
  | "mist-wraith-canon"
  | "heavenfall-body-art"
  | "thousand-root-formation"
  | "flame-demon-body-art"
  | "vermilion-bird-covenant"
  | "frozen-river-formation"
  | "moonfall-tide-ritual"
  | "sword-burial-formation"
  | "heaven-sundering-edict"
  | "myriad-beast-grove"
  | "ancient-tree-body-art";

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
  projectileTexture: ProjectileVisualId;
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
    lore: "Read one world-scale moon tide; move with or against its cardinal calendar before the whole realm floods.",
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
  },
  "nine-sun-calamity-seal": {
    id: "nine-sun-calamity-seal",
    name: "Nine-Sun Calamity Seal",
    requiredRoots: ["fire"],
    pattern: "ritual",
    title: "Nine-Sun Calamity Seal",
    lore: "Condense a patient sun-seal, then erase one battlefield with descending fire.",
    projectileTexture: "qi-bolt",
    tint: 0xffc247,
    stages: {
      lianqi: { damage: 58, cooldownMs: 2600, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 700, spreadDeg: 0, auraRadius: 74, retaliationDamage: 0, range: 260, returnShots: 2, shellBursts: 0 },
      zhuji: { damage: 86, cooldownMs: 2420, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 660, spreadDeg: 0, auraRadius: 88, retaliationDamage: 0, range: 290, returnShots: 3, shellBursts: 0 },
      jindan: { damage: 128, cooldownMs: 2240, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 620, spreadDeg: 0, auraRadius: 104, retaliationDamage: 0, range: 330, returnShots: 4, shellBursts: 0 },
      yuanying: { damage: 178, cooldownMs: 2080, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 560, spreadDeg: 0, auraRadius: 122, retaliationDamage: 0, range: 370, returnShots: 5, shellBursts: 0 }
    }
  },
  "mist-wraith-canon": {
    id: "mist-wraith-canon",
    name: "Mist Wraith Canon",
    requiredRoots: ["water"],
    pattern: "summon",
    title: "Mist Wraith Canon",
    lore: "Call loyal mist wraiths that orbit, hunt, and drown marked prey in lingering cold.",
    projectileTexture: "qi-bolt",
    tint: 0x75d9ed,
    stages: {
      lianqi: { damage: 9, cooldownMs: 1320, count: 2, pierce: 1, projectileSpeed: 380, projectileLifetimeMs: 1500, spreadDeg: 360, auraRadius: 72, retaliationDamage: 0, range: 280, returnShots: 2, shellBursts: 0 },
      zhuji: { damage: 11, cooldownMs: 1160, count: 3, pierce: 1, projectileSpeed: 410, projectileLifetimeMs: 1650, spreadDeg: 360, auraRadius: 82, retaliationDamage: 0, range: 310, returnShots: 2, shellBursts: 0 },
      jindan: { damage: 14, cooldownMs: 1000, count: 4, pierce: 2, projectileSpeed: 440, projectileLifetimeMs: 1800, spreadDeg: 360, auraRadius: 94, retaliationDamage: 0, range: 340, returnShots: 3, shellBursts: 0 },
      yuanying: { damage: 18, cooldownMs: 880, count: 5, pierce: 2, projectileSpeed: 480, projectileLifetimeMs: 1950, spreadDeg: 360, auraRadius: 108, retaliationDamage: 0, range: 380, returnShots: 3, shellBursts: 0 }
    }
  },
  "heavenfall-body-art": {
    id: "heavenfall-body-art",
    name: "Heavenfall Body Art",
    requiredRoots: ["metal"],
    pattern: "melee",
    title: "Heavenfall Body Art",
    lore: "Forge the body into a falling star: enter the pack, break it, and return every blow.",
    projectileTexture: "aura-blade",
    tint: 0xf0d38a,
    stages: {
      lianqi: { damage: 24, cooldownMs: 1080, count: 2, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 180, spreadDeg: 100, auraRadius: 104, retaliationDamage: 12, range: 0, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 32, cooldownMs: 940, count: 3, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 160, spreadDeg: 120, auraRadius: 120, retaliationDamage: 18, range: 0, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 43, cooldownMs: 820, count: 3, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 140, spreadDeg: 145, auraRadius: 138, retaliationDamage: 28, range: 0, returnShots: 1, shellBursts: 0 },
      yuanying: { damage: 58, cooldownMs: 720, count: 4, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 120, spreadDeg: 170, auraRadius: 158, retaliationDamage: 40, range: 0, returnShots: 1, shellBursts: 0 }
    }
  },
  "thousand-root-formation": {
    id: "thousand-root-formation",
    name: "Myriad-Root Lifebinding Canon",
    requiredRoots: ["wood"],
    pattern: "trap",
    title: "Myriad-Root Lifebinding Canon",
    lore: "Implant one finite root lineage in each living host; let survival, succession, and death decide its maturity.",
    projectileTexture: "aura-blade",
    tint: 0x82c96b,
    stages: {
      lianqi: { damage: 13, cooldownMs: 1560, count: 2, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 2200, spreadDeg: 0, auraRadius: 68, retaliationDamage: 0, range: 270, returnShots: 2, shellBursts: 0 },
      zhuji: { damage: 17, cooldownMs: 1380, count: 3, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 2500, spreadDeg: 0, auraRadius: 78, retaliationDamage: 0, range: 300, returnShots: 2, shellBursts: 0 },
      jindan: { damage: 22, cooldownMs: 1200, count: 4, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 2800, spreadDeg: 0, auraRadius: 90, retaliationDamage: 0, range: 340, returnShots: 3, shellBursts: 0 },
      yuanying: { damage: 28, cooldownMs: 1040, count: 4, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 3200, spreadDeg: 0, auraRadius: 104, retaliationDamage: 0, range: 380, returnShots: 3, shellBursts: 0 }
    }
  },
  "flame-demon-body-art": {
    id: "flame-demon-body-art", name: "Flame-Demon Body Art", requiredRoots: ["fire"], pattern: "melee", title: "Flame-Demon Body Art",
    lore: "Burn life into close violence, answering every wound with a furnace-blood counterstroke.", projectileTexture: "aura-blade", tint: 0xff663f,
    stages: {
      lianqi: { damage: 26, cooldownMs: 1150, count: 2, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 190, spreadDeg: 105, auraRadius: 98, retaliationDamage: 8, range: 0, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 35, cooldownMs: 1000, count: 3, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 170, spreadDeg: 125, auraRadius: 114, retaliationDamage: 13, range: 0, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 47, cooldownMs: 860, count: 3, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 150, spreadDeg: 150, auraRadius: 132, retaliationDamage: 20, range: 0, returnShots: 1, shellBursts: 0 },
      yuanying: { damage: 62, cooldownMs: 750, count: 4, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 130, spreadDeg: 175, auraRadius: 150, retaliationDamage: 30, range: 0, returnShots: 1, shellBursts: 0 }
    }
  },
  "vermilion-bird-covenant": {
    id: "vermilion-bird-covenant", name: "Vermilion Bird Covenant", requiredRoots: ["fire"], pattern: "summon", title: "Vermilion Bird Covenant",
    lore: "Raise ember familiars that circle overhead and dive upon prey in many small flames.", projectileTexture: "qi-bolt", tint: 0xff8a4b,
    stages: {
      lianqi: { damage: 10, cooldownMs: 1380, count: 2, pierce: 1, projectileSpeed: 410, projectileLifetimeMs: 1450, spreadDeg: 360, auraRadius: 68, retaliationDamage: 0, range: 280, returnShots: 2, shellBursts: 0 },
      zhuji: { damage: 12, cooldownMs: 1200, count: 3, pierce: 1, projectileSpeed: 440, projectileLifetimeMs: 1600, spreadDeg: 360, auraRadius: 78, retaliationDamage: 0, range: 310, returnShots: 2, shellBursts: 0 },
      jindan: { damage: 15, cooldownMs: 1040, count: 4, pierce: 2, projectileSpeed: 480, projectileLifetimeMs: 1750, spreadDeg: 360, auraRadius: 90, retaliationDamage: 0, range: 350, returnShots: 3, shellBursts: 0 },
      yuanying: { damage: 19, cooldownMs: 900, count: 5, pierce: 2, projectileSpeed: 520, projectileLifetimeMs: 1900, spreadDeg: 360, auraRadius: 104, retaliationDamage: 0, range: 390, returnShots: 3, shellBursts: 0 }
    }
  },
  "frozen-river-formation": {
    id: "frozen-river-formation", name: "Frozen River Formation", requiredRoots: ["water"], pattern: "trap", title: "Frozen River Formation",
    lore: "Lay invisible cold currents that erupt beneath pursuit routes and repeatedly freeze the crossing.", projectileTexture: "aura-blade", tint: 0x86e9ff,
    stages: {
      lianqi: { damage: 12, cooldownMs: 1600, count: 2, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 2300, spreadDeg: 0, auraRadius: 72, retaliationDamage: 0, range: 280, returnShots: 2, shellBursts: 0 },
      zhuji: { damage: 16, cooldownMs: 1420, count: 3, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 2600, spreadDeg: 0, auraRadius: 84, retaliationDamage: 0, range: 315, returnShots: 2, shellBursts: 0 },
      jindan: { damage: 21, cooldownMs: 1240, count: 4, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 2900, spreadDeg: 0, auraRadius: 96, retaliationDamage: 0, range: 350, returnShots: 3, shellBursts: 0 },
      yuanying: { damage: 27, cooldownMs: 1080, count: 4, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 3300, spreadDeg: 0, auraRadius: 112, retaliationDamage: 0, range: 390, returnShots: 3, shellBursts: 0 }
    }
  },
  "moonfall-tide-ritual": {
    id: "moonfall-tide-ritual", name: "Moonfall Tide Ritual", requiredRoots: ["water"], pattern: "ritual", title: "Moonfall Tide Ritual",
    lore: "Suspend a dark moon over the enemy host, then collapse it into crushing tides and undertow.", projectileTexture: "metal-wave", tint: 0x638fda,
    stages: {
      lianqi: { damage: 50, cooldownMs: 2700, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 760, spreadDeg: 0, auraRadius: 82, retaliationDamage: 0, range: 270, returnShots: 3, shellBursts: 0 },
      zhuji: { damage: 75, cooldownMs: 2500, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 720, spreadDeg: 0, auraRadius: 96, retaliationDamage: 0, range: 300, returnShots: 3, shellBursts: 0 },
      jindan: { damage: 125, cooldownMs: 2300, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 670, spreadDeg: 0, auraRadius: 112, retaliationDamage: 0, range: 340, returnShots: 4, shellBursts: 0 },
      yuanying: { damage: 190, cooldownMs: 2100, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 610, spreadDeg: 0, auraRadius: 130, retaliationDamage: 0, range: 380, returnShots: 5, shellBursts: 0 }
    }
  },
  "sword-burial-formation": {
    id: "sword-burial-formation", name: "Sword-Burial Formation", requiredRoots: ["metal"], pattern: "trap", title: "Sword-Burial Formation",
    lore: "Bury sword seals in the earth and let trespassers awaken a disciplined field of rising blades.", projectileTexture: "flying-sword", tint: 0xc8e8f1,
    stages: {
      lianqi: { damage: 15, cooldownMs: 1700, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 2300, spreadDeg: 0, auraRadius: 66, retaliationDamage: 0, range: 290, returnShots: 2, shellBursts: 0 },
      zhuji: { damage: 20, cooldownMs: 1500, count: 2, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 2600, spreadDeg: 0, auraRadius: 76, retaliationDamage: 0, range: 320, returnShots: 3, shellBursts: 0 },
      jindan: { damage: 24, cooldownMs: 1320, count: 3, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 2900, spreadDeg: 0, auraRadius: 88, retaliationDamage: 0, range: 360, returnShots: 3, shellBursts: 0 },
      yuanying: { damage: 30, cooldownMs: 1160, count: 3, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 3300, spreadDeg: 0, auraRadius: 102, retaliationDamage: 0, range: 400, returnShots: 4, shellBursts: 0 }
    }
  },
  "heaven-sundering-edict": {
    id: "heaven-sundering-edict", name: "Heaven-Sundering Edict", requiredRoots: ["metal"], pattern: "ritual", title: "Heaven-Sundering Edict",
    lore: "Write one merciless stroke across heaven and wait for judgment to cleave the marked ground.", projectileTexture: "flying-sword", tint: 0xe8f4ff,
    stages: {
      lianqi: { damage: 70, cooldownMs: 3000, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 820, spreadDeg: 0, auraRadius: 62, retaliationDamage: 0, range: 300, returnShots: 2, shellBursts: 0 },
      zhuji: { damage: 105, cooldownMs: 2750, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 760, spreadDeg: 0, auraRadius: 72, retaliationDamage: 0, range: 330, returnShots: 2, shellBursts: 0 },
      jindan: { damage: 170, cooldownMs: 2500, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 700, spreadDeg: 0, auraRadius: 84, retaliationDamage: 0, range: 370, returnShots: 2, shellBursts: 0 },
      yuanying: { damage: 250, cooldownMs: 2300, count: 1, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 640, spreadDeg: 0, auraRadius: 96, retaliationDamage: 0, range: 420, returnShots: 3, shellBursts: 0 }
    }
  },
  "myriad-beast-grove": {
    id: "myriad-beast-grove", name: "Myriad Beast Grove", requiredRoots: ["wood"], pattern: "summon", title: "Myriad Beast Grove",
    lore: "Grow seed-spirits into a circling beast host that hunts wherever the cultivator wanders.", projectileTexture: "qi-bolt", tint: 0x9bd46a,
    stages: {
      lianqi: { damage: 11, cooldownMs: 1420, count: 2, pierce: 1, projectileSpeed: 370, projectileLifetimeMs: 1500, spreadDeg: 360, auraRadius: 74, retaliationDamage: 0, range: 275, returnShots: 2, shellBursts: 0 },
      zhuji: { damage: 13, cooldownMs: 1240, count: 3, pierce: 1, projectileSpeed: 400, projectileLifetimeMs: 1650, spreadDeg: 360, auraRadius: 86, retaliationDamage: 0, range: 310, returnShots: 2, shellBursts: 0 },
      jindan: { damage: 16, cooldownMs: 1080, count: 4, pierce: 2, projectileSpeed: 430, projectileLifetimeMs: 1800, spreadDeg: 360, auraRadius: 98, retaliationDamage: 0, range: 345, returnShots: 3, shellBursts: 0 },
      yuanying: { damage: 20, cooldownMs: 940, count: 5, pierce: 2, projectileSpeed: 470, projectileLifetimeMs: 1950, spreadDeg: 360, auraRadius: 112, retaliationDamage: 0, range: 385, returnShots: 3, shellBursts: 0 }
    }
  },
  "ancient-tree-body-art": {
    id: "ancient-tree-body-art", name: "Ancient Tree Body Art", requiredRoots: ["wood"], pattern: "melee", title: "Ancient Tree Body Art",
    lore: "Root the body like an old tree, crushing nearby foes and returning violence through living bark.", projectileTexture: "aura-blade", tint: 0x73a85e,
    stages: {
      lianqi: { damage: 22, cooldownMs: 1200, count: 2, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 210, spreadDeg: 110, auraRadius: 108, retaliationDamage: 10, range: 0, returnShots: 0, shellBursts: 0 },
      zhuji: { damage: 30, cooldownMs: 1050, count: 3, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 190, spreadDeg: 130, auraRadius: 124, retaliationDamage: 16, range: 0, returnShots: 0, shellBursts: 0 },
      jindan: { damage: 41, cooldownMs: 920, count: 3, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 170, spreadDeg: 155, auraRadius: 144, retaliationDamage: 24, range: 0, returnShots: 1, shellBursts: 0 },
      yuanying: { damage: 55, cooldownMs: 800, count: 4, pierce: 0, projectileSpeed: 0, projectileLifetimeMs: 150, spreadDeg: 180, auraRadius: 164, retaliationDamage: 35, range: 0, returnShots: 1, shellBursts: 0 }
    }
  }
};

for (const gongfa of Object.values(gongfaConfigs)) {
  const jindan = gongfa.stages.jindan;
  if (!gongfa.stages.yuanying && jindan) {
    gongfa.stages.yuanying = {
      ...jindan,
      damage: Math.round(jindan.damage * 1.18),
      cooldownMs: Math.max(180, Math.floor(jindan.cooldownMs * 0.92)),
      projectileSpeed: jindan.projectileSpeed > 0 ? jindan.projectileSpeed + 30 : 0,
      projectileLifetimeMs: Math.floor(jindan.projectileLifetimeMs * 1.06),
      auraRadius: Math.round(jindan.auraRadius * 1.08),
      range: Math.round(jindan.range * 1.08),
      retaliationDamage: Math.round(jindan.retaliationDamage * 1.15)
    };
  }
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
    case "nine-sun-calamity-seal":
      return ["ritual", "fire", "explosive", "ailment"];
    case "mist-wraith-canon":
      return ["summon", "water", "projectile", "ailment"];
    case "heavenfall-body-art":
      return ["melee", "metal", "defensive", "reflect"];
    case "thousand-root-formation":
      return ["trap", "wood", "summon"];
    default: {
      const gongfa = gongfaConfigs[gongfaId];
      return [gongfa.pattern, ...gongfa.requiredRoots];
    }
  }
}
