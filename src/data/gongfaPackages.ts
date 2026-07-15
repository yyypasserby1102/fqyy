import type { GongfaId, GongfaTag } from "./gongfa";

export interface GongfaSkillDefinition {
  id: string;
  name: string;
  description: string;
  tags: GongfaTag[];
}

export interface GongfaPassiveDefinition {
  name: string;
  resource: string;
  description: string;
}

export interface GongfaPackageDefinition {
  combatRole: string;
  visualMotif: string;
  skill1: GongfaSkillDefinition;
  passive: GongfaPassiveDefinition;
  skill2: GongfaSkillDefinition;
}

/**
 * The player-facing contract for every playable Gongfa. Runtime code owns the
 * numbers; this catalog owns the language used by selection, HUD, and codex UI.
 */
export const gongfaPackageCatalog: Record<GongfaId, GongfaPackageDefinition> = {
  "yujian-jue": {
    combatRole: "Precision sword volleys for mobile mid-range pack thinning.",
    visualMotif: "Pale-blue sword seals, disciplined lines, and returning blade arcs.",
    skill1: { id: "flying-sword-volley", name: "Flying Sword Volley", description: "Ordered flying swords seek nearby enemies, piercing priority targets in disciplined bursts.", tags: ["homing", "projectile", "metal", "sword"] },
    passive: { name: "Unbroken Sword Intent", resource: "Intent", description: "Successful volleys build Intent, empowering Yujian damage and all projectile-tagged Skills." },
    skill2: { id: "returning-sword-formation", name: "Returning Sword Formation", description: "A sword array crosses the densest enemy lane, then reverses through it while refreshing Intent.", tags: ["homing", "projectile", "metal", "sword"] }
  },
  "jinfeng-gong": {
    combatRole: "Movement-aimed cutting lanes that reward assertive positioning.",
    visualMotif: "Gold-white wind crescents, long horizon cuts, and streaming wake lines.",
    skill1: { id: "cutting-front", name: "Cutting Front", description: "Frontal metal-qi waves cut along the Cultivator's movement direction and widen with Momentum.", tags: ["wave", "metal"] },
    passive: { name: "Gale Momentum", resource: "Momentum", description: "Movement, wave hits, and Evade build Momentum, extending the width and range of wave-tagged Skills." },
    skill2: { id: "golden-gale-corridor", name: "Golden Gale Corridor", description: "A lingering cutting corridor repeatedly severs enemies in the movement lane and sustains Momentum.", tags: ["wave", "metal"] }
  },
  "gengjin-huti": {
    combatRole: "Close defensive pressure that converts danger into retaliation.",
    visualMotif: "Steel-blue guard rings, faceted shields, and radial blade eruptions.",
    skill1: { id: "gengjin-guard", name: "Gengjin Guard", description: "A close defensive aura releases retaliatory metal edges when enemies enter or strike nearby.", tags: ["aura", "metal", "defensive"] },
    passive: { name: "Tempered Body", resource: "Guard", description: "Nearby danger and prevented damage build Guard, improving mitigation and defensive-tagged Skills." },
    skill2: { id: "blade-shell-rebound", name: "Blade Shell", description: "Prevented damage and close Evades charge a Guard-scaled shell that erupts in a radial blade burst.", tags: ["aura", "metal", "defensive"] }
  },
  "crimson-furnace-sword-art": {
    combatRole: "Embed-and-detonate setup that chains explosive priority bursts.",
    visualMotif: "Crimson furnace sigils, heated needle trails, and black-core detonations.",
    skill1: { id: "furnace-needles", name: "Furnace Needles", description: "Focused heated blades lodge in enemies and detonate together when their embed threshold is reached.", tags: ["homing", "projectile", "explosive", "fire", "metal"] },
    passive: { name: "Crucible Pressure", resource: "Pressure", description: "Explosions build Pressure, expanding the radius of every explosive-tagged Skill." },
    skill2: { id: "furnace-cascade", name: "Furnace Cascade", description: "All current embeds detonate at once and scatter heated fragments that begin new chain reactions.", tags: ["homing", "projectile", "explosive", "fire", "metal"] }
  },
  "blazing-feather-art": {
    combatRole: "Escalating homing volleys that become a fiery aerial barrage.",
    visualMotif: "Orange feather fans, ember motes, and descending phoenix-wing rain.",
    skill1: { id: "blazing-feathers", name: "Blazing Feathers", description: "Homing fire feathers seek nearby enemies and multiply as the Cultivator's Embers rise.", tags: ["homing", "projectile", "fire"] },
    passive: { name: "Ember Plumage", resource: "Embers", description: "Feather hits stoke Embers, adding damage and feathers until the banked heat fades." },
    skill2: { id: "feather-rain-formation", name: "Feather Rain Formation", description: "Successive fans of fire feathers descend on the densest cluster and retarget surviving enemies.", tags: ["homing", "projectile", "fire"] }
  },
  "burning-ring-scripture": {
    combatRole: "Risky close orbit that rewards sustained contact with enemy packs.",
    visualMotif: "Segmented orange solar rings, counter-rotation, and expanding coronas.",
    skill1: { id: "revolving-flame-ring", name: "Revolving Flame Ring", description: "Flame segments rotate around the Cultivator, repeatedly scorching enemies while leaving readable gaps.", tags: ["aura", "fire"] },
    passive: { name: "Kindled Meridians", resource: "Heat", description: "Unique aura targets build Heat, accelerating all aura-tagged Skills until it decays." },
    skill2: { id: "solar-flare-cycle", name: "Solar Flare Cycle", description: "Two complete solar rings form and release Heat-scaled waves while the flame ring keeps turning.", tags: ["aura", "fire", "explosive"] }
  },
  "scarlet-wave-manual": {
    combatRole: "Broad fire crescents that control lanes and reward repeated sweeps.",
    visualMotif: "Scarlet crescent walls, molten overlap seams, and cinder wakes.",
    skill1: { id: "scarlet-crescents", name: "Scarlet Crescents", description: "Scorching fire waves roll forward in a broad fan, building pressure across an enemy lane.", tags: ["wave", "fire"] },
    passive: { name: "Rolling Scorch", resource: "Scorch", description: "Wave hits build Scorch, strengthening and multiplying later scarlet crescents before it fades." },
    skill2: { id: "sunset-wave-apex", name: "Sunset Wave Apex", description: "Opposing crescent walls cross at the densest enemy line and strike twice along their molten seam.", tags: ["wave", "fire"] }
  },
  "drifting-frost-needle": {
    combatRole: "Cold precision volleys that gain coverage and piercing pressure.",
    visualMotif: "Cyan needle constellations, ice-star glints, and hoarfrost trails.",
    skill1: { id: "drifting-frost-needles", name: "Drifting Frost Needles", description: "Cold needles curve toward exposed enemies and gather piercing force as Frost rises.", tags: ["homing", "projectile", "water"] },
    passive: { name: "Gathering Hoarfrost", resource: "Frost", description: "Needle hits gather Frost, adding damage and projectiles before the cold concentration fades." },
    skill2: { id: "mirror-needle-constellation", name: "Mirror Needle Constellation", description: "An orbiting constellation distributes staggered frost needles across nearby enemies and retargets the fallen.", tags: ["homing", "projectile", "water"] }
  },
  "black-tide-scripture": {
    combatRole: "Heavy water fronts that push outward and pull survivors back.",
    visualMotif: "Deep-blue moon arcs, dark water bands, and reversing tidal rings.",
    skill1: { id: "black-tide", name: "Black Tide", description: "Layered water-qi surges crush forward in a broad front and swell with accumulated Tide.", tags: ["wave", "water"] },
    passive: { name: "Moon-Drawn Tide", resource: "Tide", description: "Wave hits raise Tide, empowering the force and breadth of later surges until it ebbs." },
    skill2: { id: "moon-tide-vault", name: "Moon Tide Vault", description: "A circular tide drives enemies outward before reversing to pull survivors inward for a second strike.", tags: ["wave", "water", "defensive"] }
  },
  "ice-mirror-guard": {
    combatRole: "Reflective close defense that blooms into aimed frost shrapnel.",
    visualMotif: "Cyan mirror petals, glass facets, and a shattering lotus silhouette.",
    skill1: { id: "ice-mirror-shards", name: "Ice Mirror Shards", description: "Rotating mirror shards cut nearby enemies and harden the Cultivator's reflective perimeter.", tags: ["aura", "water", "defensive"] },
    passive: { name: "Cold Reflection", resource: "Reflection", description: "Mirror hits build Reflection, strengthening and multiplying the shards before their clarity fades." },
    skill2: { id: "frozen-lotus-shell", name: "Frozen Lotus Shell", description: "A defensive lotus of mirror petals rotates around the Cultivator, then shatters into aimed frost shards.", tags: ["aura", "water", "defensive"] }
  },
  "green-vine-art": {
    combatRole: "Seeking vine lashes that branch into a pulsing rooted network.",
    visualMotif: "Jade tendril curves, thorn nodes, and luminous linked root paths.",
    skill1: { id: "seeking-vines", name: "Seeking Vines", description: "Living vines curve toward nearby enemies, lashing harder as Vinegrowth accumulates.", tags: ["homing", "projectile", "wood"] },
    passive: { name: "Patient Vinegrowth", resource: "Vinegrowth", description: "Vine hits build Vinegrowth, adding lashes and strength until the living qi recedes." },
    skill2: { id: "verdant-root-network", name: "Verdant Root Network", description: "A rooted enemy anchors branching vine links that pulse through nearby targets and seek replacements.", tags: ["homing", "projectile", "wood"] }
  },
  "verdant-ring-scripture": {
    combatRole: "Stationary growth zones that turn close space into a thorn bloom.",
    visualMotif: "Leaf-green petal rings, sprouting spokes, and a bright sunburst bloom.",
    skill1: { id: "verdant-petal-ring", name: "Verdant Petal Ring", description: "A rotating halo of leaf blades cuts nearby enemies and flourishes as Bloom rises.", tags: ["aura", "wood"] },
    passive: { name: "Returning Spring", resource: "Bloom", description: "Petal hits build Bloom, expanding and multiplying the living ring before the season turns." },
    skill2: { id: "sprout-sun-circle", name: "Sprout-Sun Circle", description: "A planted circle raises repeated thorn spokes before opening into one full damaging bloom.", tags: ["aura", "wood"] }
  },
  "ironwood-wave-form": {
    combatRole: "Dense timber ramparts that shove a lane and splinter on return.",
    visualMotif: "Dark-green growth rings, squared timber fronts, and diagonal splinters.",
    skill1: { id: "ironwood-wave", name: "Ironwood Wave", description: "A thick wooden front drives through an enemy lane with the weight of accumulated Heartwood.", tags: ["wave", "wood"] },
    passive: { name: "Deep Heartwood", resource: "Heartwood", description: "Wave hits deepen Heartwood, adding force and breadth until the stored strength fades." },
    skill2: { id: "ironwood-surge-form", name: "Ironwood Surge Form", description: "A timber rampart repeatedly shoves enemies forward, then splinters into two diagonal return waves.", tags: ["wave", "wood", "defensive"] }
  }
};

export function getGongfaPackage(gongfaId: GongfaId): GongfaPackageDefinition {
  return gongfaPackageCatalog[gongfaId];
}
