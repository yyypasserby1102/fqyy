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
    combatRole: "Close-hit mitigation that stores only prevented force for a conserved release.",
    visualMotif: "Layered steel braces, capacity fill, visible fractures, and allocation edges.",
    skill1: { id: "gengjin-guard", name: "Gengjin Brace", description: "Close-source hits are proportionally reduced and the exact prevented force enters a hard, fracture-prone Guard cap.", tags: ["aura", "metal", "defensive"] },
    passive: { name: "Tempered Guard", resource: "Guard", description: "Overflow fractures the brace and briefly disables mitigation; distant attacks never generate Guard." },
    skill2: { id: "blade-shell-rebound", name: "Blade-Shell Rebound", description: "At high Guard and nearby danger, releases exactly the stored total by the chosen law, clears Guard, and repairs fractures.", tags: ["reflect", "metal", "defensive"] }
  },
  "crimson-furnace-sword-art": {
    combatRole: "Forge a visible network across several living enemies, then ignite it from its highest-pressure core.",
    visualMotif: "Solid crimson body-runes, bright furnace links, branching loops, and core-to-edge propagation.",
    skill1: { id: "furnace-needles", name: "Furnace Needles", description: "Automatically embeds fresh threats and bodies that extend the live furnace topology; elites can carry several nodes.", tags: ["homing", "projectile", "explosive", "fire", "metal"] },
    passive: { name: "Crucible Pressure", resource: "Pressure", description: "Pressure is recalculated from simultaneous live nodes, links, branches, and loops; death or separation removes it immediately." },
    skill2: { id: "furnace-cascade", name: "Furnace Cascade", description: "At sufficient live Pressure, ignites every connected furnace and reforges each consumed needle for exactly one follow-up chain.", tags: ["homing", "projectile", "explosive", "fire", "metal"] }
  },
  "blazing-feather-art": {
    combatRole: "Escalating homing volleys that become a fiery aerial barrage.",
    visualMotif: "Orange feather fans, ember motes, and descending phoenix-wing rain.",
    skill1: { id: "blazing-feathers", name: "Blazing Feathers", description: "Homing fire feathers seek nearby enemies and multiply as the Cultivator's Embers rise.", tags: ["homing", "projectile", "fire"] },
    passive: { name: "Ember Plumage", resource: "Embers", description: "Feather hits stoke Embers, adding damage and feathers until the banked heat fades." },
    skill2: { id: "feather-rain-formation", name: "Feather Rain Formation", description: "Successive fans of fire feathers descend on the densest cluster and retarget surviving enemies.", tags: ["homing", "projectile", "fire"] }
  },
  "burning-ring-scripture": {
    combatRole: "A physical broken corona that rewards holding distinct enemies inside a dangerous close band.",
    visualMotif: "Gold-red solid fire arcs orbit the moving Cultivator with large, readable black gaps.",
    skill1: { id: "revolving-flame-ring", name: "Revolving Broken Corona", description: "Persistent flame segments follow the Cultivator; only physical arc contact deals damage and the visible gaps remain harmless.", tags: ["aura", "fire"] },
    passive: { name: "Kindled Heat", resource: "Heat", description: "Each distinct enemy maintained in the danger band contributes Heat once per sample; hits add nothing and retreat cools it rapidly." },
    skill2: { id: "solar-flare-cycle", name: "Sunlit Guard Ring", description: "At full Heat near danger, every gap closes briefly to prevent damage, burn nearby hostile projectiles, and push close enemies before consuming all Heat.", tags: ["aura", "fire", "defensive"] }
  },
  "scarlet-wave-manual": {
    combatRole: "Alternates one preserved left crescent and one mirrored right crescent; only real spatial overlap creates a third moving seam.",
    visualMotif: "Distinct left/right scarlet wave surfaces and a brighter diagonal molten seam that exists only at their intersection.",
    skill1: { id: "scarlet-crescents", name: "Scarlet Twin Tides", description: "Casts and preserves a left crescent, then a mirrored right crescent; separated or expired surfaces fail to Confluence.", tags: ["wave", "fire"] },
    passive: { name: "Yin-Yang Confluence", resource: "Pair State", description: "Shows awaiting-left, awaiting-right, or successful Confluence. Hits and repeated targets add nothing." },
    skill2: { id: "sunset-wave-apex", name: "Sunset Divide", description: "After three Confluences, opposing arena walls meet at the last seam and detonate that entire line once.", tags: ["wave", "fire", "explosive"] }
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
    skill1: { id: "black-tide", name: "World Tide Calendar", description: "A visible cardinal calendar sends Ebb toward its source boundary, fixes Still bands, then drives Flood walls across the arena from that boundary.", tags: ["wave", "water"] },
    passive: { name: "Moon-Guided Tide Order", resource: "Tide Phase", description: "Moving with the current advances world time; moving against it delays time; each full cycle reverses the current." },
    skill2: { id: "moon-tide-vault", name: "Deluge Mandate", description: "After three full cycles, locks one global velocity and carries all ordinary enemies together toward the destination boundary.", tags: ["wave", "water", "defensive"] }
  },
  "ice-mirror-guard": {
    combatRole: "Six finite directional facets physically block attacks, crack, and demand close-danger Evades to repair.",
    visualMotif: "Six cyan glass facets with real angular gaps, visible cracks, and a briefly closed ice-lotus shell.",
    skill1: { id: "ice-mirror-shards", name: "Sixfold Ice Mirrors", description: "Six rotating physical facets fully block only attacks arriving through their occupied angles, then crack and reflect frost back along that direction.", tags: ["aura", "water", "defensive"] },
    passive: { name: "Cold-Mirror Repair", resource: "Intact Facets", description: "Only an Evade performed near danger repairs one cracked facet; distant Evades, hits, and damage dealt repair nothing." },
    skill2: { id: "frozen-lotus-shell", name: "Frozen Lotus Shell", description: "With enough intact facets and nearby danger, facets close into a temporary shell, record incoming directions, then reflect along them and all crack.", tags: ["aura", "water", "defensive"] }
  },
  "green-vine-art": {
    combatRole: "Seeking vine lashes that branch into a pulsing rooted network.",
    visualMotif: "Jade tendril curves, thorn nodes, and luminous linked root paths.",
    skill1: { id: "seeking-vines", name: "Seeking Vines", description: "Living vines curve toward nearby enemies, lashing harder as Vinegrowth accumulates.", tags: ["homing", "projectile", "wood"] },
    passive: { name: "Patient Vinegrowth", resource: "Vinegrowth", description: "Vine hits build Vinegrowth, adding lashes and strength until the living qi recedes." },
    skill2: { id: "verdant-root-network", name: "Verdant Root Network", description: "A rooted enemy anchors branching vine links that pulse through nearby targets and seek replacements.", tags: ["homing", "projectile", "wood"] }
  },
  "verdant-ring-scripture": {
    combatRole: "A behavior scribe whose last three automatic glyphs compile shape, motion, and payoff into one predictable invocation.",
    visualMotif: "Distinct square-root, leaf-route, and triangular-thorn sigils assembling into a jade three-ring mandala.",
    skill1: { id: "verdant-petal-ring", name: "Three-Life Ring Glyphs", description: "Timed samples write Root while still, Leaf while traveling, or Thorn after Evade; the ordered trio invokes automatically.", tags: ["ritual", "wood", "defensive"] },
    passive: { name: "Three-Ring Order", resource: "Glyph Queue", description: "Glyph one selects shape, glyph two selects motion, and glyph three selects bind, repeat, or damage payoff." },
    skill2: { id: "sprout-sun-circle", name: "Sprout-Sun Invocation", description: "The exact Root→Leaf→Thorn order creates fixed roots, sweeping leaves, then one disappearing thorn sun at the player position.", tags: ["ritual", "wood", "defensive"] }
  },
  "ironwood-wave-form": {
    combatRole: "Stop to construct a physical directional rampart, then move to uproot and drive it.",
    visualMotif: "Squared timber beams, visible growth rings, exposed corners, and whole-wall motion.",
    skill1: { id: "ironwood-wave", name: "Ironwood Rampart", description: "Standing still raises a damageable wall toward the densest threat; movement drives a sufficiently stable wall and withers an unfinished one.", tags: ["wave", "wood", "defensive"] },
    passive: { name: "Growth-Ring Stability", resource: "Stability", description: "Stability grows only while stationary behind a live rampart and is fully spent by its drive." },
    skill2: { id: "ironwood-surge-form", name: "Ironwood Citadel", description: "After three strong drives, raises four destructible walls with passable corners; surviving walls later drive outward and clear all construction.", tags: ["wave", "wood", "defensive"] }
  },
  "nine-sun-calamity-seal": {
    combatRole: "Automatically predicts future enemy ground, commits one fixed long-warning sun, and accepts a real miss risk.",
    visualMotif: "Fixed concentric solar warning seals, a shrinking bright center, nine visible omen rings, and one condensed sun impact.",
    skill1: { id: "falling-sun-seal", name: "Falling Sun Seal", description: "Predicts the highest-threat or densest future ground, fixes a visible seal, then lands one center-weighted impact without tracking.", tags: ["ritual", "fire", "explosive"] },
    passive: { name: "Zenith", resource: "Zenith", description: "Zenith rises only while no sun is committed and is spent completely on impact, including a miss." },
    skill2: { id: "heavenly-sun-descent", name: "Nine Suns in One", description: "At nine omens, fixes a huge nine-layer prediction and condenses every omen into one center-heavy impact.", tags: ["ritual", "fire", "explosive"] }
  },
  "mist-wraith-canon": {
    combatRole: "A corpse-route summoner who collects short-lived ranked souls and spends each one on exactly one physical crossing.",
    visualMotif: "Ranked cyan corpse lanterns, a finite trailing soul procession, and boundary-to-boundary funeral roads.",
    skill1: { id: "mist-wraith-retinue", name: "Finite Wraith Crossing", description: "Consumes the oldest collected soul on one committed physical route; without a soul, a weak lantern beam helps create the first corpse.", tags: ["summon", "water", "ailment"] },
    passive: { name: "Water Souls", resource: "Stored Souls", description: "Recent corpses leave expiring ranked souls that must be collected at their death sites; hits create nothing." },
    skill2: { id: "hundred-ghost-procession", name: "Hundred-Ghost Night Crossing", description: "At four stored souls, every soul enters from an automatically chosen arena boundary, crosses once by its law, and is consumed.", tags: ["summon", "water", "ailment"] }
  },
  "heavenfall-body-art": {
    combatRole: "A temporary mobile meteor body whose uninterrupted heading builds Mass for an automatic movement-steered landing.",
    visualMotif: "A growing metal-star body, compressed travel wake, projected landing line, and distinct lance/crater/return impacts.",
    skill1: { id: "falling-star-combination", name: "Falling-Star Body", description: "Continuous movement near danger transforms the body; passing through ordinary enemies deals contact damage on individual cooldowns.", tags: ["melee", "metal", "defensive"] },
    passive: { name: "Meteor Mass", resource: "Mass", description: "Straight uninterrupted travel builds Mass; stopping, sharp turns, and hard impacts shed it. Hits build none." },
    skill2: { id: "star-breaking-descent", name: "Star-Breaking Descent", description: "At full Mass or the form's limit, rise briefly while ordinary movement steers a visible landing preview, then crash and spend all Mass.", tags: ["melee", "metal", "explosive"] }
  },
  "thousand-root-formation": {
    combatRole: "A living-host controller that preserves finite parasitic lineages long enough to mature and erupt.",
    visualMotif: "Internal jade seeds, roots bursting from living bodies, and one crawling Root Mother.",
    skill1: { id: "root-seal-array", name: "Life-Hosted Root Seed", description: "Implants one eligible living enemy with a finite root lineage that ages only while its host survives.", tags: ["ailment", "wood", "summon"] },
    passive: { name: "One-for-One Succession", resource: "Living Lineages", description: "A dead host releases exactly one seed toward another living host; rapid death preserves count but resets maturity." },
    skill2: { id: "myriad-root-killing-field", name: "Myriad Roots Share One Ancestor", description: "Erupts at least four infections, crawls across their host-defined routes, then merges them once into a Root Mother.", tags: ["ailment", "wood", "summon"] }
  },
  "flame-demon-body-art": {
    combatRole: "A close brawler who chooses whether to finish a current-health-burning combination as missing health changes its body and reach.", visualMotif: "Escalating blood-cost numbers, furnace claws and heart strike, then one persistent horned Asura body.",
    skill1: { id: "furnace-blood-combination", name: "Furnace-Blood Combination", description: "A free opener may extend for 6%, 8%, then 10% of current health; leaving melee or Evading ends it without refund.", tags: ["melee", "fire", "ailment"] },
    passive: { name: "Missing-Health Forms", resource: "Health Bands", description: "Lower health reveals a side claw, Furnace-Heart finisher, and finally the full demon body; hits build no meter." },
    skill2: { id: "asura-conflagration", name: "Asura Heart", description: "Below 20% health, a landed full combination irreversibly assumes the selected Asura law and locks recoverable health.", tags: ["melee", "fire", "explosive", "defensive"] }
  },
  "vermilion-bird-covenant": {
    combatRole: "A companion keeper who guides one vulnerable bird through dangerous dives and safe returns.", visualMotif: "One persistent vermilion silhouette, outbound feather routes, a health ring, and one physical egg.",
    skill1: { id: "ember-bird-brood", name: "One Vermilion Bird", description: "Movement heading guides the same vulnerable bird's automatic dive; its real return route must finish safely before Bond or another attack.", tags: ["summon", "fire", "ailment"] },
    passive: { name: "Phoenix Bond", resource: "Bond", description: "Only a dangerous flight followed by a safe return builds Bond; hits alone grant nothing and being downed erases it." },
    skill2: { id: "vermilion-host-descent", name: "Vermilion Rebirth", description: "At full Bond, the bird makes a terminal dive and becomes one damageable egg that can hatch into the same individual.", tags: ["summon", "fire", "ailment", "defensive"] }
  },
  "frozen-river-formation": {
    combatRole: "An indirect route-shaper that assigns finite Cold Debt and awakens a river only when its debtor crosses another seal.", visualMotif: "Distinct origin rings, diamond crossing seals, visible debt tethers, and a silent blue-white prison network.",
    skill1: { id: "underice-snare-array", name: "River-Origin and Crossing Seals", description: "Places harmless seals on predicted pursuit routes; crossing a foreign seal awakens one river and transfers Debt once.", tags: ["trap", "water", "ailment"] },
    passive: { name: "Cold Debt Transfer", resource: "Completed Transfers", description: "Only one-for-one transfers charge the prison; hits, damage, and ordinary freezing never do." },
    skill2: { id: "frozen-river-prison", name: "Frozen River Prison", description: "Links at least three current debtors without pulsing; a debtor must cross another debtor's line to resolve the selected fate.", tags: ["trap", "water", "ailment", "defensive"] }
  },
  "moonfall-tide-ritual": {
    combatRole: "A mobile controller that slowly drags one lagging moon while enemies earn power only by actually orbiting it.", visualMotif: "A lagging indigo moon, readable orbit tracks, captured bodies, and three radically different releases.",
    skill1: { id: "moonfall-collapse", name: "Suspended Moon Tide", description: "A moon forms at the densest group, lags behind movement, and carries nearby enemies in real orbits until its fixed resolution.", tags: ["ritual", "water", "ailment"] },
    passive: { name: "Abyssal Syzygy", resource: "Syzygy", description: "Only actual angular travel completed by enemies that remain in orbit builds Syzygy; escaped unfinished motion is lost." },
    skill2: { id: "moonfall-cataclysm", name: "Moonless Eclipse", description: "After three high-Syzygy resolutions, a giant mobile moon suspends enemies, records their motion, then bends that motion inward once.", tags: ["ritual", "water", "ailment", "defensive"] }
  },
  "sword-burial-formation": {
    combatRole: "A metal trapper that seeds lanes with buried blades and punishes enemies who cross the gravefield.", visualMotif: "Half-buried gold swords, grave seals, and rising blade circles.",
    skill1: { id: "buried-sword-array", name: "Buried Sword Array", description: "Plants sword graves beneath likely routes; each repeatedly erupts when the formation resonates.", tags: ["trap", "metal", "sword"] },
    passive: { name: "Grave-Sword Resonance", resource: "Resonance", description: "Caught enemies deepen Resonance, multiplying and strengthening later sword graves." },
    skill2: { id: "ten-thousand-sword-tomb", name: "Ten-Thousand Sword Tomb", description: "Consecrates a vast gravefield where linked buried swords rise in relentless waves.", tags: ["trap", "metal", "sword"] }
  },
  "heaven-sundering-edict": {
    combatRole: "Draw one automatically chosen physical sword line, fix it in world space, then judge the exact same line after a delay.", visualMotif: "A thin gold physical inscription followed by a brighter white spell judgment on identical coordinates.",
    skill1: { id: "sundering-stroke", name: "Sundering Stroke", description: "Draws the best threat line once, fixes it, then repeats it as delayed spell judgment; enemies must remain on it for the complete hit.", tags: ["ritual", "metal", "sword"] },
    passive: { name: "Judgment Mandate", resource: "Mandate", description: "Only same-target physical-plus-spell hits write Mandate and record line quality." },
    skill2: { id: "supreme-sundering-decree", name: "Supreme Sundering Decree", description: "At full Mandate, extends retained line records to arena boundaries and repeats their exact two-stage judgment.", tags: ["ritual", "metal", "sword"] }
  },
  "myriad-beast-grove": {
    combatRole: "A fixed mixed pack whose Boar, Fox, and Deer must survive and meaningfully assist the same kills.", visualMotif: "Three distinct jade beast bodies, species marks, formation routes, and giant one-action ancestors.",
    skill1: { id: "seed-spirit-pack", name: "Three-Beast Pack", description: "Moving sends one Boar, Fox, and Deer to perform different jobs; standing or Evading recalls the independently living pack without attacking.", tags: ["summon", "wood", "defensive"] },
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
