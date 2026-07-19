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
    combatRole: "A world-current controller whose Ebb, Still, and Flood calendar is accelerated or delayed by movement.",
    visualMotif: "Arena-wide cardinal black-water bands, one compass flow, and a boundary-draining deluge.",
    skill1: { id: "black-tide", name: "World Tide Calendar", description: "Automatically applies Ebb pull, Still slow, or Flood walls across the arena according to one visible cardinal phase.", tags: ["wave", "water"] },
    passive: { name: "Moon-Guided Tide Order", resource: "Tide Phase", description: "Moving with the current advances world time; moving against it delays time; each full cycle reverses the current." },
    skill2: { id: "moon-tide-vault", name: "Deluge Mandate", description: "After three full cycles, locks one global velocity and carries all ordinary enemies together toward the destination boundary.", tags: ["wave", "water", "defensive"] }
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
  },
  "nine-sun-calamity-seal": {
    combatRole: "Slow, telegraphed ritual casting that pays off in enormous area damage and lingering burns.",
    visualMotif: "Gold-red sun seals, converging rays, and a blackened impact corona.",
    skill1: { id: "falling-sun-seal", name: "Falling Sun Seal", description: "Marks the densest enemy cluster before a condensed sun descends for one devastating strike and repeated burn pulses.", tags: ["ritual", "fire", "explosive", "ailment"] },
    passive: { name: "Calamity Cycle", resource: "Zenith", description: "Enemies struck by sunfire build Zenith, empowering the next patient cast rather than rewarding constant small hits." },
    skill2: { id: "heavenly-sun-descent", name: "Heavenly Sun Descent", description: "A vast sun seal charges over the battlefield, then falls in a single boss-breaking detonation with a long inferno aftermath.", tags: ["ritual", "fire", "explosive", "ailment"] }
  },
  "mist-wraith-canon": {
    combatRole: "Summoner pressure: orbiting familiars independently hunt targets and apply repeated drowning frost.",
    visualMotif: "Pale-cyan spirit lanterns, flowing tails, and concentric mist ripples.",
    skill1: { id: "mist-wraith-retinue", name: "Mist-Wraith Retinue", description: "Summons orbiting water spirits that choose their own prey and fire several chill bolts before dissolving.", tags: ["summon", "water", "projectile", "ailment"] },
    passive: { name: "Ghost-Tide Covenant", resource: "Covenant", description: "Wraith hits deepen Covenant, calling additional spirits and strengthening their independent volleys." },
    skill2: { id: "hundred-ghost-procession", name: "Hundred-Ghost Procession", description: "Calls a procession of empowered wraiths that circle the Cultivator and saturate the arena with seeking frost bolts.", tags: ["summon", "water", "projectile", "ailment"] }
  },
  "heavenfall-body-art": {
    combatRole: "A temporary mobile meteor body whose uninterrupted heading builds Mass for an automatic movement-steered landing.",
    visualMotif: "A growing metal-star body, compressed travel wake, projected landing line, and distinct lance/crater/return impacts.",
    skill1: { id: "falling-star-combination", name: "Falling-Star Body", description: "Continuous movement near danger transforms the body; passing through ordinary enemies deals contact damage on individual cooldowns.", tags: ["melee", "metal", "defensive"] },
    passive: { name: "Meteor Mass", resource: "Mass", description: "Straight uninterrupted travel builds Mass; stopping, sharp turns, and hard impacts shed it. Hits build none." },
    skill2: { id: "star-breaking-descent", name: "Star-Breaking Descent", description: "At full Mass or the form's limit, crash along the current movement heading and spend all Mass.", tags: ["melee", "metal", "explosive"] }
  },
  "thousand-root-formation": {
    combatRole: "A living-host controller that preserves finite parasitic lineages long enough to mature and erupt.",
    visualMotif: "Internal jade seeds, roots bursting from living bodies, and one crawling Root Mother.",
    skill1: { id: "root-seal-array", name: "Life-Hosted Root Seed", description: "Implants one eligible living enemy with a finite root lineage that ages only while its host survives.", tags: ["ailment", "wood", "summon"] },
    passive: { name: "One-for-One Succession", resource: "Living Lineages", description: "A dead host releases exactly one seed toward another living host; rapid death preserves count but resets maturity." },
    skill2: { id: "myriad-root-killing-field", name: "Myriad Roots Share One Ancestor", description: "Erupts at least four infections, crawls across their host-defined routes, then merges them once into a Root Mother.", tags: ["ailment", "wood", "summon"] }
  },
  "flame-demon-body-art": {
    combatRole: "An aggressive close-range brawler that turns repeated contact into a crushing fiery finisher.", visualMotif: "Blood-red furnace fists, horned flame arcs, and scorched impact rings.",
    skill1: { id: "furnace-blood-combination", name: "Furnace-Blood Combination", description: "Chains close fiery blows into a broad finishing smash that ignites survivors.", tags: ["melee", "fire", "ailment"] },
    passive: { name: "Demon-Heart Reprisal", resource: "Wrath", description: "Melee hits and returned contact force build Wrath, empowering the next combination." },
    skill2: { id: "asura-conflagration", name: "Asura Conflagration", description: "Assumes an asura stance and unleashes a furious sequence of point-blank detonating strikes.", tags: ["melee", "fire", "explosive", "reflect"] }
  },
  "vermilion-bird-covenant": {
    combatRole: "A companion keeper who guides one vulnerable bird through dangerous dives and safe returns.", visualMotif: "One persistent vermilion silhouette, outbound feather routes, a health ring, and one physical egg.",
    skill1: { id: "ember-bird-brood", name: "One Vermilion Bird", description: "The same living bird automatically dives along movement-guided routes, then must return safely before attacking again.", tags: ["summon", "fire", "ailment"] },
    passive: { name: "Phoenix Bond", resource: "Bond", description: "Only a dangerous flight followed by a safe return builds Bond; hits alone grant nothing and being downed erases it." },
    skill2: { id: "vermilion-host-descent", name: "Vermilion Rebirth", description: "At full Bond, the bird makes a terminal dive and becomes one damageable egg that can hatch into the same individual.", tags: ["summon", "fire", "ailment", "defensive"] }
  },
  "frozen-river-formation": {
    combatRole: "A control trapper that freezes pursuit lanes beneath persistent, overlapping river seals.", visualMotif: "Cracked ice channels, pale river knots, and blue-white frost pulses.",
    skill1: { id: "underice-snare-array", name: "Under-Ice Snare Array", description: "Plants icy river seals along enemy routes; each awakens in repeated freezing pulses.", tags: ["trap", "water", "ailment"] },
    passive: { name: "Winter Current", resource: "Rime", description: "Enemies caught in the array build Rime, widening and prolonging later traps." },
    skill2: { id: "frozen-river-prison", name: "Frozen River Prison", description: "Locks a broad region beneath interlinked ice channels that erupt in sequence.", tags: ["trap", "water", "ailment", "defensive"] }
  },
  "moonfall-tide-ritual": {
    combatRole: "A patient caster that trades frequency for immense tidal impacts and lingering undertow.", visualMotif: "Dark moon discs, converging blue tides, and abyssal impact halos.",
    skill1: { id: "moonfall-collapse", name: "Moonfall Collapse", description: "Marks a crowded region before a moon-heavy tide collapses for one enormous strike and echoing pulses.", tags: ["ritual", "water", "explosive", "ailment"] },
    passive: { name: "Abyssal Syzygy", resource: "Syzygy", description: "Tidal damage aligns Syzygy, greatly strengthening the next deliberate ritual." },
    skill2: { id: "moonfall-cataclysm", name: "Moonfall Cataclysm", description: "Draws down an abyssal moon that crushes a vast region and leaves a consuming undertow.", tags: ["ritual", "water", "explosive", "ailment"] }
  },
  "sword-burial-formation": {
    combatRole: "A metal trapper that seeds lanes with buried blades and punishes enemies who cross the gravefield.", visualMotif: "Half-buried gold swords, grave seals, and rising blade circles.",
    skill1: { id: "buried-sword-array", name: "Buried Sword Array", description: "Plants sword graves beneath likely routes; each repeatedly erupts when the formation resonates.", tags: ["trap", "metal", "sword"] },
    passive: { name: "Grave-Sword Resonance", resource: "Resonance", description: "Caught enemies deepen Resonance, multiplying and strengthening later sword graves." },
    skill2: { id: "ten-thousand-sword-tomb", name: "Ten-Thousand Sword Tomb", description: "Consecrates a vast gravefield where linked buried swords rise in relentless waves.", tags: ["trap", "metal", "sword"] }
  },
  "heaven-sundering-edict": {
    combatRole: "A long-cadence execution caster built around precise, enormous single-event damage.", visualMotif: "White-gold mandate script, divided heavens, and razor-straight judgment rays.",
    skill1: { id: "sundering-stroke", name: "Sundering Stroke", description: "Writes a mandate over the densest enemy group, then cleaves the marked ground in one decisive stroke.", tags: ["ritual", "metal", "sword", "explosive"] },
    passive: { name: "Judgment Mandate", resource: "Mandate", description: "Targets judged by metal damage accumulate Mandate for the next execution." },
    skill2: { id: "supreme-sundering-decree", name: "Supreme Sundering Decree", description: "Pronounces a supreme decree that divides a vast battlefield line with boss-breaking force.", tags: ["ritual", "metal", "sword", "explosive"] }
  },
  "myriad-beast-grove": {
    combatRole: "A fixed mixed pack whose Boar, Fox, and Deer must survive and meaningfully assist the same kills.", visualMotif: "Three distinct jade beast bodies, species marks, formation routes, and giant one-action ancestors.",
    skill1: { id: "seed-spirit-pack", name: "Three-Beast Pack", description: "Maintains exactly one Boar, Fox, and Deer with independent health, position, target logic, and seed rebirth.", tags: ["summon", "wood", "defensive"] },
    passive: { name: "Wildwood Kinship", resource: "Kinship", description: "Kills assisted by different living species build Kinship; three-species kills heal the pack." },
    skill2: { id: "myriad-beast-stampede", name: "Ancestral Menagerie", description: "At full Kinship, each currently living species calls one giant ancestor action, then vanishes.", tags: ["summon", "wood", "explosive"] }
  },
  "ancient-tree-body-art": {
    combatRole: "A stationary transformation that replaces attacks with growing root, branch, and canopy layers.", visualMotif: "Visible growth rings, radial branch sectors, an outer canopy, and one immovable world-tree trunk.",
    skill1: { id: "old-growth-combination", name: "Ancient Tree Body", description: "Standing near danger roots the body; rooted time alone grows Rings and expands three automatic attack layers.", tags: ["melee", "wood", "defensive"] },
    passive: { name: "Growth Rings", resource: "Rings", description: "Only rooted time grows Rings; uprooting removes every Ring and takes longer at greater age." },
    skill2: { id: "world-tree-incarnation", name: "World-Tree Incarnation", description: "At maximum Rings, become an immovable timed world-tree, then forcibly return mobile with zero Rings.", tags: ["melee", "wood", "defensive"] }
  }
};

export function getGongfaPackage(gongfaId: GongfaId): GongfaPackageDefinition {
  return gongfaPackageCatalog[gongfaId];
}
