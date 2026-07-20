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
    name: "Core Etching",
    lore: "A connected furnace may ignite with one fewer live node, never below three.",
    effect: "embedThreshold",
    value: -1,
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    maxSelections: 3
  },
  {
    id: "furnace-expansion",
    name: "Long Bellows",
    lore: "Extends the valid distance of visible furnace links without enlarging explosions.",
    effect: "gongfaRangeSynergy",
    value: 18,
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    maxSelections: 3
  },
  {
    id: "rising-pressure",
    name: "Topology Tempering",
    lore: "Each simultaneous node, link, branch, and loop contributes more live Pressure.",
    effect: "pressureBuild",
    value: 0.18,
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    maxSelections: 3
  },
  {
    id: "sealed-crucible",
    name: "Sealed Conduits",
    lore: "Visible furnace links tolerate slightly more separation; Pressure remains topology-bound.",
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
    name: "Rack Tempering",
    lore: "Every physical rack sword gains more force on both its outbound and return path.",
    effect: "resourcePotency",
    value: 1,
    requiredGongfaIds: ["yujian-jue"],
    maxSelections: 3
  },
  {
    id: "twin-sword-split",
    name: "Balanced Scabbards",
    lore: "Balanced fittings shorten each sword's complete physical journey.",
    effect: "skill1Count",
    value: 1,
    requiredGongfaIds: ["yujian-jue"],
    maxSelections: 3
  },
  {
    id: "refined-sword-channel",
    name: "Quick Unsheathing",
    lore: "A ready rack sword is assigned and launched 12% faster.",
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
    name: "Measured Footwork",
    lore: "Traveling Edge lays its next ground cut 12% sooner.",
    effect: "skill1Count",
    value: 1,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "long-edge-resonance",
    name: "Extended Ground Edge",
    lore: "+28 ground-cut length.",
    effect: "skill1Range",
    value: 28,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "gathering-gale",
    name: "Gathering Gale",
    lore: "Each unit of uninterrupted travel builds 12% more Momentum.",
    effect: "galeMomentumBuild",
    value: 0.12,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "unbroken-stride",
    name: "Unbroken Stride",
    lore: "Momentum drains 12% more slowly after the stop grace expires.",
    effect: "galeMomentumDecay",
    value: 0.88,
    requiredGongfaIds: ["jinfeng-gong"],
    maxSelections: 3
  },
  {
    id: "windborne-reach",
    name: "Windborne Reach",
    lore: "Ground cuts become 6% longer-lived and longer; it creates no extra projectile.",
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
    : ["skill1Damage", "skill1Count", "skill1Cooldown", "skill1Pierce", "skill1Range"].includes(seed[3])
      ? "skill1"
      : seed[3] === "surgeBuild" || seed[3] === "surgeStability"
        ? "passive"
        : "synergy"
});

const missingStartingFamilies: Array<readonly [GongfaId, FamilySeed[]]> = [
  ["yujian-jue", [
    ["steady-sword-heart", "Returning Thread", "Every sword's homeward route completes more cleanly and quickly.", "surgeStability", 0.84, "Passive: Sword-Rack Rotation"],
    ["swordborne-steps", "Sword-Catching Steps", "Evade slightly shortens every live return without creating a sword.", "evadeSynergy", 1, "Cultivator Evade → Passive: Sword-Rack Rotation"],
    ["penetrating-intent", "Crossing Edge", "Physical sword routes and Myriad Swords Return cut more strongly at crossings.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"]
  ]],
  ["burning-ring-scripture", [
    ["ember-step", "Wheel-Turning Step", "Every Evade advances the existing broken corona by one sixth-turn without creating Heat or another attack.", "evadeSynergy", 8, "Cultivator Evade → Skill 1: Revolving Broken Corona"]
  ]],
  ["blazing-feather-art", [
    ["tempered-plumage", "Tempered Plumage", "Ideal-edge hits of Blazing Feather Fan strike with greater force.", "skill1Damage", 4, "Skill 1: Blazing Feather Fan"],
    ["expanded-plumage", "Expanded Plumage", "The fan edge covers a slightly broader firing shape.", "skill1Range", 18, "Skill 1: Blazing Feather Fan"],
    ["swift-pinions", "Horizon-Fed Pinions", "Both the ideal fan edge and Phoenix Horizon gain force.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["piercing-quills", "Phoenix Quills", "Every ideal edge and the final corridor gain piercing force.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["ember-kindling", "Fitted Feather Case", "The quiver reloads with a more stable combat rhythm.", "surgeBuild", 0.18, "Passive: Molting Quiver"],
    ["banked-plumage", "Long-Lived Brand", "Phoenix Brands remain legible longer before fading.", "surgeStability", 0.84, "Passive: Molting Quiver"]
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
    ["frost-tempering", "Frost Tempering", "Frost Star Needle preserves more force across real weak points.", "skill1Damage", 4, "Skill 1: Frost Star Needle"],
    ["needle-flurry", "Extended Meridian", "The needle can maintain a longer acquisition reach.", "skill1Range", 18, "Skill 1: Frost Star Needle"],
    ["quickened-current", "Frozen Meridian", "Both the outbound zigzag and Reverse Winter Thread gain force.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["crystal-point", "Crystal Point", "Real weak-point hits retain additional piercing force.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["deepening-frost", "Clear Acupoint", "The needle reacquires its next distinct point sooner.", "surgeBuild", 0.18, "Passive: Cold-Star Focus"],
    ["lingering-winter", "Lingering Star Trace", "Death-preserved route points remain visible longer.", "surgeStability", 0.84, "Passive: Cold-Star Focus"]
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
    ["heartwood-tempering", "Rampart Tempering", "Driven Ironwood walls strike with greater force.", "skill1Damage", 5, "Skill 1: Ironwood Rampart"],
    ["growth-rings", "Dense Growth Rings", "Each constructed wall gains another durability ring.", "skill1Count", 1, "Skill 1: Ironwood Rampart"],
    ["heartwood-resonance", "Citadel Resonance", "Ironwood Rampart and Ironwood Citadel gain force without changing Stability sources.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["splintered-edge", "Driving Edge", "Driven walls gain stronger penetration and push.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["deepening-heartwood", "Deepening Rings", "Stationary time grows Stability more rapidly.", "surgeBuild", 0.18, "Passive: Growth-Ring Stability"],
    ["old-growth", "Seasoned Bracing", "Enemy pressure erodes wall durability more slowly.", "surgeStability", 0.84, "Passive: Growth-Ring Stability"]
  ]],
  ["nine-sun-calamity-seal", [
    ["sun-seal-tempering", "Sun-Seal Tempering", "Falling Sun Seal strikes with greater ritual force.", "skill1Damage", 12, "Skill 1: Falling Sun Seal"],
    ["twin-omen-script", "Twin Omen Script", "Each ritual gains another smaller impact seal.", "skill1Count", 1, "Skill 1: Falling Sun Seal"],
    ["zenith-conduction", "Zenith Conduction", "Zenith empowers both calamity rituals.", "gongfaDamageSynergy", 4, "Owning Gongfa: both Skills"],
    ["widened-sunscar", "Widened Sunscar", "Every sun seal claims a broader impact ground.", "gongfaRangeSynergy", 12, "Owning Gongfa: both Skills"],
    ["rising-zenith", "Rising Zenith", "Each burned enemy raises Zenith faster.", "surgeBuild", 0.18, "Passive: Calamity Cycle"],
    ["fixed-noon", "Fixed Noon", "Zenith fades more slowly between rituals.", "surgeStability", 0.84, "Passive: Calamity Cycle"]
  ]],
  ["mist-wraith-canon", [
    ["wraith-tempering", "Wraith Tempering", "Each consumed soul crossing strikes harder.", "skill1Damage", 4, "Skill 1: Finite Wraith Crossing"],
    ["expanded-retinue", "Expanded Procession", "Adds one visible stored-soul slot without creating a soul.", "skill1Count", 1, "Passive: Water Souls"],
    ["ghost-tide-conduction", "Funeral Conduction", "Strengthens both ordinary crossings and Hundred-Ghost Night Crossing.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["deepwater-bolts", "Broad Spirit Road", "Widens each ordinary crossing by 10 without adding hits or souls.", "gongfaRangeSynergy", 10, "Skill 1: Finite Wraith Crossing"],
    ["quickened-covenant", "Deep Soul Vessel", "Collected souls remain in the procession 18% longer.", "surgeBuild", 0.18, "Passive: Water Souls"],
    ["remembered-oath", "Lingering Corpse Light", "Uncollected corpse souls remain visible 16% longer.", "surgeStability", 0.84, "Passive: Water Souls"]
  ]],
  ["heavenfall-body-art", [
    ["vajra-tempering", "Vajra Tempering", "Falling-Star Combination strikes with greater force.", "skill1Damage", 7, "Skill 1: Falling-Star Combination"],
    ["linked-fists", "Linked Fists", "Add another blow to the close combination.", "skill1Count", 1, "Skill 1: Falling-Star Combination"],
    ["reprisal-conduction", "Reprisal Conduction", "Reprisal empowers both body-art Skills.", "gongfaDamageSynergy", 3, "Owning Gongfa: both Skills"],
    ["wider-crater", "Wider Crater", "Every body-art strike reaches farther around the Cultivator.", "gongfaRangeSynergy", 10, "Owning Gongfa: both Skills"],
    ["returning-breath", "Returning Breath", "Melee and reflected hits build Reprisal faster.", "surgeBuild", 0.18, "Passive: Returning Heaven"],
    ["tempered-anger", "Tempered Anger", "Reprisal fades more slowly outside danger.", "surgeStability", 0.84, "Passive: Returning Heaven"]
  ]],
  ["thousand-root-formation", [
    ["root-seal-tempering", "Lineage Tempering", "One-shot Sprout and Mature transitions strike harder.", "skill1Damage", 5, "Skill 1: Life-Hosted Root Seed"],
    ["branching-array", "Many-Limbed Maturity", "A Body-Borrowing mature root reaches one additional distinct body without creating another lineage.", "skill1Count", 1, "Rank 3: Body-Borrowing Branch Root"],
    ["growth-conduction", "Ancestor Conduction", "Strengthens both host-stage transitions and the single Root-Mother merge.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["wider-rootweb", "Longer Living Roots", "Extends mature branch reach and Root-Mother crawl routes; nothing is planted on the floor.", "gongfaRangeSynergy", 10, "Owning Gongfa: both Skills"],
    ["fertile-ground", "Quickened Lifeblood", "Host survival time matures each existing lineage 18% faster; hits add no age.", "surgeBuild", 0.18, "Passive: One-for-One Succession"],
    ["deep-burial", "Tenacious Seed", "A hostless seed struggles 16% longer at its corpse before withering.", "surgeStability", 0.84, "Passive: One-for-One Succession"]
  ]],
  ["flame-demon-body-art", [
    ["demon-fist-tempering", "Demon-Fist Tempering", "Furnace-Blood blows strike harder.", "skill1Damage", 7, "Skill 1: Furnace-Blood Combination"],
    ["linked-demon-fists", "Dense Furnace Forms", "Adds one more visible arm to multi-direction body forms; health costs are unchanged.", "skill1Count", 1, "Skill 1: Furnace-Blood Combination"],
    ["wrath-conduction", "Blood-Furnace Conduction", "Strengthens both human and irreversible Asura combinations.", "gongfaDamageSynergy", 3, "Owning Gongfa: both Skills"],
    ["wider-bloodcrater", "Long Furnace Reach", "Expands every close body arc by 10 without changing pursuit distance.", "gongfaRangeSynergy", 10, "Skill 1: Furnace-Blood Combination"],
    ["rising-wrath", "Hardened Blood Channels", "Missing-health form power rises 18% more strongly.", "surgeBuild", 0.18, "Passive: Missing-Health Forms"],
    ["banked-wrath", "Steady Furnace Pulse", "The delay between paid strikes is 16% shorter, reducing exposure but not cost.", "surgeStability", 0.84, "Skill 1: Furnace-Blood Combination"]
  ]],
  ["vermilion-bird-covenant", [
    ["ember-spirit-tempering", "Ember-Spirit Tempering", "Ember birds scorch harder.", "skill1Damage", 4, "Skill 1: Ember-Bird Brood"],
    ["expanded-brood", "Expanded Brood", "Calls another ember bird.", "skill1Count", 1, "Skill 1: Ember-Bird Brood"],
    ["plumage-conduction", "Plumage Conduction", "Plumage empowers both summoning Skills.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["phoenix-pinions", "Phoenix Pinions", "Spirit attacks pierce another target.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["gathering-plumage", "Gathering Plumage", "Spirit hits gather Plumage faster.", "surgeBuild", 0.18, "Passive: Phoenix Covenant"],
    ["undying-covenant", "Undying Covenant", "Plumage fades more slowly.", "surgeStability", 0.84, "Passive: Phoenix Covenant"]
  ]],
  ["frozen-river-formation", [
    ["river-seal-tempering", "River-Seal Tempering", "A successfully awakened one-shot river strikes harder.", "skill1Damage", 5, "Skill 1: River-Origin and Crossing Seals"],
    ["branching-river", "More Debt Ledgers", "May maintain another independent origin-and-crossing chain.", "skill1Count", 1, "Skill 1: River-Origin and Crossing Seals"],
    ["rime-conduction", "Debt Conduction", "Strengthens both awakened rivers and crossing-resolved prison fates.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["wider-icefield", "Wider Riverbed", "Widens awakened segments without enlarging seal trigger distance.", "gongfaRangeSynergy", 10, "Owning Gongfa: both Skills"],
    ["deepening-rime", "Legible Pursuit", "Extends the life of unspent crossing seals; it does not grant transfer progress.", "surgeBuild", 0.18, "Passive: Cold Debt Transfer"],
    ["perennial-winter", "Patient Creditor", "Extends a waiting Debt before it expires; the prison still needs real crossings.", "surgeStability", 0.84, "Passive: Cold Debt Transfer"]
  ]],
  ["moonfall-tide-ritual", [
    ["moonfall-tempering", "Moonfall Tempering", "Moonfall strikes with greater force.", "skill1Damage", 12, "Skill 1: Moonfall Collapse"],
    ["twin-moon-omens", "Twin Moon Omens", "Adds another smaller impact.", "skill1Count", 1, "Skill 1: Moonfall Collapse"],
    ["syzygy-conduction", "Syzygy Conduction", "Syzygy empowers both rituals.", "gongfaDamageSynergy", 4, "Owning Gongfa: both Skills"],
    ["wider-undertow", "Wider Undertow", "Moonfall claims a broader region.", "gongfaRangeSynergy", 12, "Owning Gongfa: both Skills"],
    ["rising-syzygy", "Rising Syzygy", "Tidal damage aligns Syzygy faster.", "surgeBuild", 0.18, "Passive: Abyssal Syzygy"],
    ["fixed-syzygy", "Fixed Syzygy", "Syzygy fades more slowly.", "surgeStability", 0.84, "Passive: Abyssal Syzygy"]
  ]],
  ["sword-burial-formation", [
    ["grave-sword-tempering", "Grave-Sword Tempering", "Each finite grave sword rises with greater force.", "skill1Damage", 5, "Passive: Corpse-Bound Grave Swords"],
    ["scattered-graves", "Broad Funeral Form", "Adds one visible blade arm to the same weak Funeral Sword line; it creates no grave inventory.", "skill1Count", 1, "Skill 1: Funeral Sword"],
    ["resonance-conduction", "Burial Conduction", "Strengthens both ordinary grave rises and the full Sword Tomb.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["wider-gravefield", "Longer Burial Lines", "Extends a risen sword's fixed recorded route without widening its trigger.", "gongfaRangeSynergy", 10, "Owning Gongfa: both Skills"],
    ["deepening-resonance", "Clear Grave Inscription", "Makes recorded burial directions easier to read; deaths still create exactly one sword.", "surgeBuild", 0.18, "Passive: Corpse-Bound Grave Swords"],
    ["unbroken-resonance", "Hardened Grave Seal", "Strengthens sealed inventory without making any sword reusable.", "surgeStability", 0.84, "Passive: Corpse-Bound Grave Swords"]
  ]],
  ["heaven-sundering-edict", [
    ["edict-tempering", "Edict Tempering", "Sundering Stroke judges harder.", "skill1Damage", 12, "Skill 1: Sundering Stroke"],
    ["crossed-edicts", "Crossed Edicts", "Adds another judgment stroke.", "skill1Count", 1, "Skill 1: Sundering Stroke"],
    ["mandate-conduction", "Mandate Conduction", "Mandate empowers both edicts.", "gongfaDamageSynergy", 4, "Owning Gongfa: both Skills"],
    ["broader-judgment", "Broader Judgment", "Edicts claim a broader ground.", "gongfaRangeSynergy", 12, "Owning Gongfa: both Skills"],
    ["rising-mandate", "Rising Mandate", "Judgment builds Mandate faster.", "surgeBuild", 0.18, "Passive: Judgment Mandate"],
    ["fixed-mandate", "Fixed Mandate", "Mandate fades more slowly.", "surgeStability", 0.84, "Passive: Judgment Mandate"]
  ]],
  ["myriad-beast-grove", [
    ["seed-spirit-tempering", "Beast-Soul Tempering", "Each of the fixed three beasts strikes harder.", "skill1Damage", 4, "Skill 1: Three-Beast Pack"],
    ["teeming-grove", "Swift Seed Rebirth", "The same downed species reforms from its seed sooner.", "skill1Count", 1, "Skill 1: Three-Beast Pack"],
    ["kinship-conduction", "Kinship Conduction", "Cooperative kills empower both pack and ancestor actions.", "gongfaDamageSynergy", 2, "Owning Gongfa: both Skills"],
    ["thorned-pack", "Broad Hunting Trails", "Species signature actions cover a slightly broader route.", "gongfaPierceSynergy", 1, "Owning Gongfa: both Skills"],
    ["growing-kinship", "Clear Species Marks", "Distinct assist marks remain easy to read until that prey dies.", "surgeBuild", 0.18, "Passive: Wildwood Kinship"],
    ["ancestral-kinship", "Deep Ancestral Memory", "Ancestral forms emerge with a more stable signature action.", "surgeStability", 0.84, "Skill 2: Ancestral Menagerie"]
  ]],
  ["ancient-tree-body-art", [
    ["old-growth-tempering", "Old-Growth Tempering", "Root, branch, and canopy strikes deal more damage.", "skill1Damage", 7, "Skill 1: Ancient Tree Body"],
    ["ringed-combination", "Many-Branch Crown", "Adds one more rotating branch sector without adding a Ring.", "skill1Count", 1, "Skill 1: Ancient Tree Body"],
    ["bark-conduction", "Worldwood Conduction", "Strengthens both the three-layer tree cycle and World-Tree law.", "gongfaDamageSynergy", 3, "Owning Gongfa: both Skills"],
    ["wider-rootcrater", "Broad Root and Crown", "Expands the inner root zone and outer canopy by 10.", "gongfaRangeSynergy", 10, "Skill 1: Ancient Tree Body"],
    ["living-bark", "Quickened Cambium", "Rooted time grows each Ring 18% faster.", "surgeBuild", 0.18, "Passive: Growth Rings"],
    ["evergreen-bark", "Loose-Root Practice", "Uprooting completes 16% faster without preserving Rings.", "surgeStability", 0.84, "Passive: Growth Rings"]
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
  "ironwood-wave-form": ["Surge Tempering", "Broad Trunk", "Driving Rings"],
  "nine-sun-calamity-seal": ["Descent Tempering", "World-Sized Omen", "Swift Apocalypse"],
  "mist-wraith-canon": ["Procession Tempering", "Countless Ghosts", "Hastened Crossing"],
  "heavenfall-body-art": ["Descent Tempering", "Wider Crater", "Swift Reprisal"],
  "thousand-root-formation": ["Killing-Field Tempering", "Endless Rootweb", "Quickened Germination"],
  "flame-demon-body-art": ["Asura Tempering", "Wider Conflagration", "Swift Wrath"],
  "vermilion-bird-covenant": ["Host Tempering", "Countless Pinions", "Swift Descent"],
  "frozen-river-formation": ["Prison Tempering", "Endless River", "Flash Freeze"],
  "moonfall-tide-ritual": ["Cataclysm Tempering", "Abyssal Moon", "Swift Syzygy"],
  "sword-burial-formation": ["Sword-Tomb Tempering", "Endless Graves", "Swift Burial"],
  "heaven-sundering-edict": ["Decree Tempering", "Supreme Judgment", "Swift Mandate"],
  "myriad-beast-grove": ["Stampede Tempering", "Ancestral Host", "Swift Germination"],
  "ancient-tree-body-art": ["Incarnation Tempering", "Worldroot Crater", "Swift Growth"]
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
