import type { GongfaId } from "./gongfa";

/**
 * The lighter gongfa share a "Surge" passive archetype: hits stoke a named
 * resource (max 6) that boosts the Skill's damage and adds projectiles, and
 * fades over time. Each gongfa supplies its own resource name, base stats
 * (authored in gongfa.ts), and the nine Transformation identities below. The
 * mechanic itself is shared and lives in gongfaRuntime.ts.
 */
export interface SurgeTransformation {
  id: string;
  name: string;
  lore: string;
}

export interface SurgeMechanics {
  focusDamageScale: number;
  focusPierce: number;
  focusSpreadScale: number;
  spreadCount: number;
  spreadDegrees: number;
  spreadDamageScale: number;
  quickenCooldownScale: number;
  quickenDamageScale: number;
  quickenSpeed: number;
  holdFloor: number;
  cascadeGain: number;
  burstCount: number;
  crownPerStack: number;
  domainDamageScale: number;
  updraftStackScale: number;
}

export interface SurgeGongfaSpec {
  gongfaId: GongfaId;
  resource: string;
  mechanics: SurgeMechanics;
  // Rank 3 (structural Skill-1 reshapes).
  focus: SurgeTransformation;
  spread: SurgeTransformation;
  quicken: SurgeTransformation;
  // Rank 6 (Surge control).
  hold: SurgeTransformation;
  cascade: SurgeTransformation;
  burst: SurgeTransformation;
  // Rank 9 (capstones).
  crown: SurgeTransformation;
  domain: SurgeTransformation;
  updraft: SurgeTransformation;
}

export const surgeGongfaSpecs: SurgeGongfaSpec[] = [
  {
    gongfaId: "scarlet-wave-manual",
    resource: "Scorch",
    mechanics: { focusDamageScale: 1.38, focusPierce: 2, focusSpreadScale: 0.62, spreadCount: 3, spreadDegrees: 26, spreadDamageScale: 0.78, quickenCooldownScale: 0.74, quickenDamageScale: 0.84, quickenSpeed: 70, holdFloor: 3, cascadeGain: 2, burstCount: 3, crownPerStack: 1, domainDamageScale: 0.32, updraftStackScale: 1 },
    focus: { id: "lancing-crescent", name: "Lancing Crescent", lore: "Compress the crescents into a deep-piercing scarlet lance." },
    spread: { id: "wide-crescent", name: "Wide Crescent", lore: "Spread the crescents across a broad scorching arc." },
    quicken: { id: "rolling-heat", name: "Rolling Heat", lore: "Roll the waves out faster and swifter." },
    hold: { id: "lasting-scorch", name: "Lasting Scorch", lore: "Well-stoked Scorch no longer fades below half." },
    cascade: { id: "spreading-scorch", name: "Spreading Scorch", lore: "Each wave hit stokes Scorch twice as fast." },
    burst: { id: "scorch-detonation", name: "Scorch Detonation", lore: "At full Scorch, the next wave erupts with extra crescents." },
    crown: { id: "sunfire-crescents", name: "Sunfire Crescents", lore: "Scorch crowns every wave with spectral crescents." },
    domain: { id: "cinder-trail", name: "Cinder Trail", lore: "Wave hits leave a Scorch-scaled cinder field." },
    updraft: { id: "heatwave-step", name: "Heatwave Step", lore: "Each Evade looses a Scorch-scaled wave." }
  },
  {
    gongfaId: "drifting-frost-needle",
    resource: "Frost",
    mechanics: { focusDamageScale: 1.32, focusPierce: 3, focusSpreadScale: 0.7, spreadCount: 2, spreadDegrees: 30, spreadDamageScale: 0.82, quickenCooldownScale: 0.68, quickenDamageScale: 0.8, quickenSpeed: 90, holdFloor: 2, cascadeGain: 2, burstCount: 4, crownPerStack: 1, domainDamageScale: 0.3, updraftStackScale: 1 },
    focus: { id: "piercing-frost", name: "Piercing Frost", lore: "Hone the needles into deep-piercing frozen shards." },
    spread: { id: "frost-flurry", name: "Frost Flurry", lore: "Scatter a wide flurry of frost needles." },
    quicken: { id: "swift-frost", name: "Swift Frost", lore: "Loose frost needles faster and swifter." },
    hold: { id: "lasting-frost", name: "Lasting Frost", lore: "Well-stoked Frost no longer fades below half." },
    cascade: { id: "frost-cascade", name: "Frost Cascade", lore: "Each needle hit stokes Frost twice as fast." },
    burst: { id: "frost-burst", name: "Frostfall Burst", lore: "At full Frost, the next volley erupts with extra needles." },
    crown: { id: "frost-crown", name: "Frost Crown", lore: "Frost crowns every volley with spectral needles." },
    domain: { id: "frost-domain", name: "Hoarfrost Domain", lore: "Needle hits leave a Frost-scaled frozen field." },
    updraft: { id: "frost-step", name: "Frost Step", lore: "Each Evade looses a Frost-scaled needle volley." }
  },
  {
    gongfaId: "black-tide-scripture",
    resource: "Tide",
    mechanics: { focusDamageScale: 1.45, focusPierce: 2, focusSpreadScale: 0.58, spreadCount: 2, spreadDegrees: 20, spreadDamageScale: 0.84, quickenCooldownScale: 0.76, quickenDamageScale: 0.86, quickenSpeed: 50, holdFloor: 3, cascadeGain: 3, burstCount: 2, crownPerStack: 1, domainDamageScale: 0.4, updraftStackScale: 1 },
    focus: { id: "crushing-tide", name: "Crushing Tide", lore: "Channel the tide into a single crushing surge." },
    spread: { id: "tide-spread", name: "Tide Spread", lore: "Spread the tide across a broad front." },
    quicken: { id: "swift-tide", name: "Swift Tide", lore: "Surge the tide faster and swifter." },
    hold: { id: "lasting-tide", name: "Lasting Tide", lore: "Well-stoked Tide no longer fades below half." },
    cascade: { id: "tide-cascade", name: "Tide Cascade", lore: "Each hit stokes Tide twice as fast." },
    burst: { id: "tide-burst", name: "Tidal Burst", lore: "At full Tide, the next surge erupts with extra force." },
    crown: { id: "tide-crown", name: "Tide Crown", lore: "Tide crowns every surge with spectral water." },
    domain: { id: "tide-domain", name: "Abyssal Domain", lore: "Hits leave a Tide-scaled drowning field." },
    updraft: { id: "tide-step", name: "Tide Step", lore: "Each Evade looses a Tide-scaled surge." }
  },
  {
    gongfaId: "green-vine-art",
    resource: "Vinegrowth",
    mechanics: { focusDamageScale: 1.4, focusPierce: 2, focusSpreadScale: 0.6, spreadCount: 2, spreadDegrees: 32, spreadDamageScale: 0.8, quickenCooldownScale: 0.75, quickenDamageScale: 0.85, quickenSpeed: 55, holdFloor: 3, cascadeGain: 3, burstCount: 3, crownPerStack: 1.25, domainDamageScale: 0.36, updraftStackScale: 1 },
    focus: { id: "thorned-vines", name: "Thorned Vines", lore: "Harden the vines into piercing thorned lashes." },
    spread: { id: "vine-spread", name: "Vine Spread", lore: "Spread the vines across a broad thicket." },
    quicken: { id: "swift-vines", name: "Swift Vines", lore: "Lash the vines faster and swifter." },
    hold: { id: "lasting-growth", name: "Lasting Growth", lore: "Well-stoked Vinegrowth no longer fades below half." },
    cascade: { id: "growth-cascade", name: "Growth Cascade", lore: "Each hit stokes Vinegrowth twice as fast." },
    burst: { id: "growth-burst", name: "Overgrowth Burst", lore: "At full Vinegrowth, the next lash erupts with extra vines." },
    crown: { id: "growth-crown", name: "Verdant Crown", lore: "Vinegrowth crowns every lash with spectral vines." },
    domain: { id: "growth-domain", name: "Bramble Domain", lore: "Hits leave a Vinegrowth-scaled bramble field." },
    updraft: { id: "growth-step", name: "Vine Step", lore: "Each Evade looses a Vinegrowth-scaled vine lash." }
  },
  {
    gongfaId: "verdant-ring-scripture",
    resource: "Bloom",
    mechanics: { focusDamageScale: 1.34, focusPierce: 2, focusSpreadScale: 0.68, spreadCount: 3, spreadDegrees: 34, spreadDamageScale: 0.76, quickenCooldownScale: 0.7, quickenDamageScale: 0.82, quickenSpeed: 65, holdFloor: 4, cascadeGain: 2, burstCount: 4, crownPerStack: 1, domainDamageScale: 0.34, updraftStackScale: 1.25 },
    focus: { id: "piercing-bloom", name: "Piercing Bloom", lore: "Sharpen the ring petals into piercing blades." },
    spread: { id: "bloom-spread", name: "Bloom Spread", lore: "Open the ring into a broad blooming halo." },
    quicken: { id: "swift-bloom", name: "Swift Bloom", lore: "Turn the bloom faster and swifter." },
    hold: { id: "lasting-bloom", name: "Lasting Bloom", lore: "Well-stoked Bloom no longer fades below half." },
    cascade: { id: "bloom-cascade", name: "Bloom Cascade", lore: "Each hit stokes Bloom twice as fast." },
    burst: { id: "bloom-burst", name: "Flourish Burst", lore: "At full Bloom, the next ring erupts with extra petals." },
    crown: { id: "bloom-crown", name: "Bloom Crown", lore: "Bloom crowns every ring with spectral petals." },
    domain: { id: "bloom-domain", name: "Verdant Domain", lore: "Hits leave a Bloom-scaled flowering field." },
    updraft: { id: "bloom-step", name: "Bloom Step", lore: "Each Evade looses a Bloom-scaled petal burst." }
  },
  {
    gongfaId: "ironwood-wave-form",
    resource: "Heartwood",
    mechanics: { focusDamageScale: 1.5, focusPierce: 3, focusSpreadScale: 0.55, spreadCount: 2, spreadDegrees: 18, spreadDamageScale: 0.86, quickenCooldownScale: 0.78, quickenDamageScale: 0.88, quickenSpeed: 45, holdFloor: 3, cascadeGain: 2, burstCount: 2, crownPerStack: 1.5, domainDamageScale: 0.42, updraftStackScale: 0.75 },
    focus: { id: "ironwood-spear", name: "Ironwood Spear", lore: "Condense the wave into a piercing ironwood spear." },
    spread: { id: "ironwood-spread", name: "Ironwood Spread", lore: "Spread the wave into a broad ironwood front." },
    quicken: { id: "swift-ironwood", name: "Swift Ironwood", lore: "Drive the wave faster and swifter." },
    hold: { id: "lasting-heartwood", name: "Lasting Heartwood", lore: "Well-stoked Heartwood no longer fades below half." },
    cascade: { id: "heartwood-cascade", name: "Heartwood Cascade", lore: "Each hit stokes Heartwood twice as fast." },
    burst: { id: "heartwood-burst", name: "Ironwood Burst", lore: "At full Heartwood, the next wave erupts with extra force." },
    crown: { id: "heartwood-crown", name: "Heartwood Crown", lore: "Heartwood crowns every wave with spectral timber." },
    domain: { id: "heartwood-domain", name: "Ironwood Domain", lore: "Hits leave a Heartwood-scaled splintering field." },
    updraft: { id: "heartwood-step", name: "Ironwood Step", lore: "Each Evade looses a Heartwood-scaled wave." }
  },
  {
    gongfaId: "nine-sun-calamity-seal",
    resource: "Zenith",
    mechanics: { focusDamageScale: 1.65, focusPierce: 0, focusSpreadScale: 1, spreadCount: 1, spreadDegrees: 0, spreadDamageScale: 0.72, quickenCooldownScale: 0.78, quickenDamageScale: 0.9, quickenSpeed: 0, holdFloor: 2, cascadeGain: 2, burstCount: 1, crownPerStack: 0.34, domainDamageScale: 0.5, updraftStackScale: 0.25 },
    focus: { id: "solitary-judgment", name: "Solitary Judgment", lore: "Narrow the calamity seal and magnify its central annihilation." },
    spread: { id: "twin-sun-omen", name: "Twin-Sun Omen", lore: "Split each cast into two smaller overlapping sun seals." },
    quicken: { id: "swift-eclipse", name: "Swift Eclipse", lore: "Shorten the omen and call each falling sun sooner." },
    hold: { id: "fixed-zenith", name: "Fixed Zenith", lore: "Once raised, Zenith no longer falls below one third." },
    cascade: { id: "scorching-ascension", name: "Scorching Ascension", lore: "Every enemy caught raises Zenith more quickly." },
    burst: { id: "zenith-overflow", name: "Zenith Overflow", lore: "At full Zenith, the next ritual calls a second falling sun." },
    crown: { id: "ninefold-descent", name: "Ninefold Descent", lore: "Zenith adds smaller satellite impacts around every calamity." },
    domain: { id: "sunscar-domain", name: "Sunscar Domain", lore: "The impact leaves a stronger and longer burning scar." },
    updraft: { id: "eclipse-step", name: "Eclipse Step", lore: "Evade plants a small delayed sun seal at the departure point." }
  },
  {
    gongfaId: "mist-wraith-canon",
    resource: "Covenant",
    mechanics: { focusDamageScale: 1.35, focusPierce: 2, focusSpreadScale: 0.7, spreadCount: 2, spreadDegrees: 0, spreadDamageScale: 0.82, quickenCooldownScale: 0.7, quickenDamageScale: 0.82, quickenSpeed: 80, holdFloor: 3, cascadeGain: 2, burstCount: 3, crownPerStack: 0.6, domainDamageScale: 0.3, updraftStackScale: 0.75 },
    focus: { id: "drowned-executioner", name: "Drowned Executioner", lore: "Call fewer, fiercer wraiths that pursue one marked quarry." },
    spread: { id: "wandering-retinue", name: "Wandering Retinue", lore: "Call a larger retinue that divides itself across the battlefield." },
    quicken: { id: "restless-dead", name: "Restless Dead", lore: "Wraiths answer the covenant more often but strike more lightly." },
    hold: { id: "unbroken-covenant", name: "Unbroken Covenant", lore: "A mature Covenant no longer ebbs below half." },
    cascade: { id: "ghost-tide-confluence", name: "Ghost-Tide Confluence", lore: "Each wraith hit deepens the Covenant twice." },
    burst: { id: "hungry-procession", name: "Hungry Procession", lore: "At full Covenant, extra hungry spirits join the next retinue." },
    crown: { id: "ancestral-host", name: "Ancestral Host", lore: "Covenant manifests spectral companions beside every summoned wraith." },
    domain: { id: "drowning-mist", name: "Drowning Mist", lore: "Wraith hits leave patches of spirit-chilling mist." },
    updraft: { id: "ghost-step", name: "Ghost Step", lore: "Evade calls a Covenant-scaled wraith from the fading afterimage." }
  },
  {
    gongfaId: "heavenfall-body-art",
    resource: "Reprisal",
    mechanics: { focusDamageScale: 1.5, focusPierce: 0, focusSpreadScale: 0.65, spreadCount: 1, spreadDegrees: 28, spreadDamageScale: 0.84, quickenCooldownScale: 0.72, quickenDamageScale: 0.84, quickenSpeed: 0, holdFloor: 3, cascadeGain: 2, burstCount: 2, crownPerStack: 0.5, domainDamageScale: 0.42, updraftStackScale: 0.8 },
    focus: { id: "mountain-breaking-fist", name: "Mountain-Breaking Fist", lore: "Compress the combination into one narrow, crushing finisher." },
    spread: { id: "army-sweeping-form", name: "Army-Sweeping Form", lore: "Broaden every strike to cleave a wider circle at lower force." },
    quicken: { id: "meteor-chain", name: "Meteor Chain", lore: "Cycle the close combination faster with lighter individual blows." },
    hold: { id: "unyielding-reprisal", name: "Unyielding Reprisal", lore: "Once roused, Reprisal no longer falls below half." },
    cascade: { id: "returning-force", name: "Returning Force", lore: "Each reflected or melee hit builds Reprisal twice." },
    burst: { id: "wrathful-finisher", name: "Wrathful Finisher", lore: "At full Reprisal, the next finisher erupts twice." },
    crown: { id: "vajra-incarnation", name: "Vajra Incarnation", lore: "Reprisal adds spectral fists to every close combination." },
    domain: { id: "crater-domain", name: "Crater Domain", lore: "Finishers leave a damaging ring of broken ground." },
    updraft: { id: "falling-star-step", name: "Falling-Star Step", lore: "Evade ends with a Reprisal-scaled shoulder strike." }
  },
  {
    gongfaId: "thousand-root-formation",
    resource: "Growth",
    mechanics: { focusDamageScale: 1.42, focusPierce: 0, focusSpreadScale: 0.7, spreadCount: 2, spreadDegrees: 0, spreadDamageScale: 0.8, quickenCooldownScale: 0.75, quickenDamageScale: 0.86, quickenSpeed: 0, holdFloor: 3, cascadeGain: 2, burstCount: 3, crownPerStack: 0.5, domainDamageScale: 0.38, updraftStackScale: 0.75 },
    focus: { id: "execution-root", name: "Execution Root", lore: "Concentrate fewer seals beneath the strongest nearby enemy." },
    spread: { id: "wildwood-array", name: "Wildwood Array", lore: "Scatter more root seals across a much wider hunting ground." },
    quicken: { id: "springing-snare", name: "Springing Snare", lore: "Plant and awaken lighter root traps more rapidly." },
    hold: { id: "evergreen-growth", name: "Evergreen Growth", lore: "A mature formation retains half its Growth between waves." },
    cascade: { id: "feeding-roots", name: "Feeding Roots", lore: "Each newly trapped enemy feeds Growth twice." },
    burst: { id: "overgrowth-array", name: "Overgrowth Array", lore: "At full Growth, the next cast plants additional root seals." },
    crown: { id: "forest-without-end", name: "Forest Without End", lore: "Growth sprouts satellite roots around every planted seal." },
    domain: { id: "ancient-grove-domain", name: "Ancient Grove Domain", lore: "Root pulses leave behind smaller persistent thorn fields." },
    updraft: { id: "rooted-step", name: "Rooted Step", lore: "Evade plants a Growth-scaled snare at the departure point." }
  },
  {
    gongfaId: "flame-demon-body-art", resource: "Wrath",
    mechanics: { focusDamageScale: 1.52, focusPierce: 0, focusSpreadScale: 0.66, spreadCount: 1, spreadDegrees: 30, spreadDamageScale: 0.84, quickenCooldownScale: 0.72, quickenDamageScale: 0.84, quickenSpeed: 0, holdFloor: 3, cascadeGain: 2, burstCount: 2, crownPerStack: 0.5, domainDamageScale: 0.42, updraftStackScale: 0.8 },
    focus: { id: "demon-fist", name: "Demon Fist", lore: "Condense the combination into one furnace-breaking punch." }, spread: { id: "burning-sweep", name: "Burning Sweep", lore: "Broaden every blow into a fiery crowd-cleaving arc." }, quicken: { id: "bloodrush-chain", name: "Bloodrush Chain", lore: "Trade individual force for a faster combination." },
    hold: { id: "banked-wrath", name: "Banked Wrath", lore: "Mature Wrath no longer falls below half." }, cascade: { id: "wrath-return", name: "Wrath Return", lore: "Melee and reflected hits build Wrath twice." }, burst: { id: "asura-burst", name: "Asura Burst", lore: "Full Wrath repeats the next finisher." },
    crown: { id: "demon-incarnation", name: "Demon Incarnation", lore: "Wrath manifests spectral furnace fists." }, domain: { id: "furnace-crater", name: "Furnace Crater", lore: "Finishers leave burning broken ground." }, updraft: { id: "bloodfire-step", name: "Bloodfire Step", lore: "Evade ends with a Wrath-scaled shoulder strike." }
  },
  {
    gongfaId: "vermilion-bird-covenant", resource: "Plumage",
    mechanics: { focusDamageScale: 1.36, focusPierce: 2, focusSpreadScale: 0.7, spreadCount: 2, spreadDegrees: 0, spreadDamageScale: 0.82, quickenCooldownScale: 0.7, quickenDamageScale: 0.82, quickenSpeed: 80, holdFloor: 3, cascadeGain: 2, burstCount: 3, crownPerStack: 0.6, domainDamageScale: 0.3, updraftStackScale: 0.75 },
    focus: { id: "phoenix-hunter", name: "Phoenix Hunter", lore: "Call fewer, fiercer birds against one quarry." }, spread: { id: "scattered-brood", name: "Scattered Brood", lore: "Call a larger brood that divides across the field." }, quicken: { id: "swift-hatching", name: "Swift Hatching", lore: "Call lighter ember birds more often." },
    hold: { id: "banked-plumage-covenant", name: "Banked Plumage", lore: "Mature Plumage no longer falls below half." }, cascade: { id: "ember-kinship", name: "Ember Kinship", lore: "Each spirit hit gathers Plumage twice." }, burst: { id: "brood-burst", name: "Brood Burst", lore: "Full Plumage adds birds to the next brood." },
    crown: { id: "vermilion-crown", name: "Vermilion Crown", lore: "Plumage manifests spectral companions." }, domain: { id: "ash-nest-domain", name: "Ash-Nest Domain", lore: "Spirit hits leave burning nests." }, updraft: { id: "phoenix-step", name: "Phoenix Step", lore: "Evade hatches a Plumage-scaled bird." }
  },
  {
    gongfaId: "frozen-river-formation", resource: "Rime",
    mechanics: { focusDamageScale: 1.44, focusPierce: 0, focusSpreadScale: 0.7, spreadCount: 2, spreadDegrees: 0, spreadDamageScale: 0.8, quickenCooldownScale: 0.75, quickenDamageScale: 0.86, quickenSpeed: 0, holdFloor: 3, cascadeGain: 2, burstCount: 3, crownPerStack: 0.5, domainDamageScale: 0.38, updraftStackScale: 0.75 },
    focus: { id: "glacier-snare", name: "Glacier Snare", lore: "Concentrate seals beneath the strongest enemy." }, spread: { id: "braided-river", name: "Braided River", lore: "Scatter more seals across a wider riverbed." }, quicken: { id: "flash-freeze-array", name: "Flash-Freeze Array", lore: "Plant lighter traps more rapidly." },
    hold: { id: "perennial-rime", name: "Perennial Rime", lore: "Mature Rime persists between waves." }, cascade: { id: "feeding-winter", name: "Feeding Winter", lore: "Newly trapped enemies build Rime twice." }, burst: { id: "icebreak-burst", name: "Icebreak Burst", lore: "Full Rime plants extra ice seals." },
    crown: { id: "frozen-delta", name: "Frozen Delta", lore: "Rime sprouts satellite ice channels." }, domain: { id: "permafrost-domain", name: "Permafrost Domain", lore: "Pulses leave persistent frozen ground." }, updraft: { id: "rime-step", name: "Rime Step", lore: "Evade plants a Rime-scaled snare." }
  },
  {
    gongfaId: "moonfall-tide-ritual", resource: "Syzygy",
    mechanics: { focusDamageScale: 1.66, focusPierce: 0, focusSpreadScale: 1, spreadCount: 1, spreadDegrees: 0, spreadDamageScale: 0.72, quickenCooldownScale: 0.78, quickenDamageScale: 0.9, quickenSpeed: 0, holdFloor: 2, cascadeGain: 2, burstCount: 1, crownPerStack: 0.34, domainDamageScale: 0.5, updraftStackScale: 0.25 },
    focus: { id: "singular-moonfall", name: "Singular Moonfall", lore: "Narrow the tide and magnify its central collapse." }, spread: { id: "twin-moon-tide", name: "Twin-Moon Tide", lore: "Split each ritual into overlapping moonfalls." }, quicken: { id: "swift-syzygy", name: "Swift Syzygy", lore: "Align and collapse the tide sooner." },
    hold: { id: "fixed-syzygy", name: "Fixed Syzygy", lore: "Raised Syzygy retains one third." }, cascade: { id: "rising-syzygy", name: "Rising Syzygy", lore: "Caught enemies align Syzygy faster." }, burst: { id: "eclipse-overflow", name: "Eclipse Overflow", lore: "Full Syzygy calls a second moonfall." },
    crown: { id: "moonlit-cataclysm", name: "Moonlit Cataclysm", lore: "Syzygy adds satellite tidal impacts." }, domain: { id: "abyss-domain", name: "Abyss Domain", lore: "Impacts leave a stronger undertow." }, updraft: { id: "undertow-step", name: "Undertow Step", lore: "Evade plants a delayed moon seal." }
  },
  {
    gongfaId: "sword-burial-formation", resource: "Resonance",
    mechanics: { focusDamageScale: 1.46, focusPierce: 0, focusSpreadScale: 0.7, spreadCount: 2, spreadDegrees: 0, spreadDamageScale: 0.8, quickenCooldownScale: 0.75, quickenDamageScale: 0.86, quickenSpeed: 0, holdFloor: 3, cascadeGain: 2, burstCount: 3, crownPerStack: 0.5, domainDamageScale: 0.38, updraftStackScale: 0.75 },
    focus: { id: "execution-tomb", name: "Execution Tomb", lore: "Concentrate graves beneath one strong enemy." }, spread: { id: "scattered-sword-graves", name: "Scattered Sword Graves", lore: "Seed a wider battlefield with buried blades." }, quicken: { id: "swift-burial", name: "Swift Burial", lore: "Plant lighter sword graves more rapidly." },
    hold: { id: "unbroken-resonance", name: "Unbroken Resonance", lore: "Mature Resonance persists between waves." }, cascade: { id: "grave-echo", name: "Grave Echo", lore: "Newly caught enemies resonate twice." }, burst: { id: "sword-tomb-burst", name: "Sword-Tomb Burst", lore: "Full Resonance plants extra graves." },
    crown: { id: "burial-crown", name: "Burial Crown", lore: "Resonance raises satellite swords." }, domain: { id: "gravefield-domain", name: "Gravefield Domain", lore: "Eruptions leave spectral sword ground." }, updraft: { id: "buried-step", name: "Buried Step", lore: "Evade plants a Resonance-scaled grave." }
  },
  {
    gongfaId: "heaven-sundering-edict", resource: "Mandate",
    mechanics: { focusDamageScale: 1.68, focusPierce: 0, focusSpreadScale: 1, spreadCount: 1, spreadDegrees: 0, spreadDamageScale: 0.72, quickenCooldownScale: 0.78, quickenDamageScale: 0.9, quickenSpeed: 0, holdFloor: 2, cascadeGain: 2, burstCount: 1, crownPerStack: 0.34, domainDamageScale: 0.5, updraftStackScale: 0.25 },
    focus: { id: "single-heaven-stroke", name: "Single Heaven Stroke", lore: "Narrow the decree into one supreme judgment." }, spread: { id: "crossed-edicts", name: "Crossed Edicts", lore: "Write two overlapping sundering strokes." }, quicken: { id: "swift-mandate", name: "Swift Mandate", lore: "Pronounce a lighter judgment sooner." },
    hold: { id: "fixed-mandate", name: "Fixed Mandate", lore: "Raised Mandate retains one third." }, cascade: { id: "judgment-accumulation", name: "Judgment Accumulation", lore: "Judged enemies build Mandate faster." }, burst: { id: "mandate-overflow", name: "Mandate Overflow", lore: "Full Mandate repeats the decree." },
    crown: { id: "nine-heaven-decree", name: "Nine-Heaven Decree", lore: "Mandate adds satellite judgment rays." }, domain: { id: "sundering-domain", name: "Sundering Domain", lore: "Judgment leaves cutting metal scripture." }, updraft: { id: "edict-step", name: "Edict Step", lore: "Evade writes a delayed small edict." }
  },
  {
    gongfaId: "myriad-beast-grove", resource: "Kinship",
    mechanics: { focusDamageScale: 1.35, focusPierce: 2, focusSpreadScale: 0.7, spreadCount: 2, spreadDegrees: 0, spreadDamageScale: 0.82, quickenCooldownScale: 0.7, quickenDamageScale: 0.82, quickenSpeed: 80, holdFloor: 3, cascadeGain: 2, burstCount: 3, crownPerStack: 0.6, domainDamageScale: 0.3, updraftStackScale: 0.75 },
    focus: { id: "alpha-spirit", name: "Alpha Spirit", lore: "Call fewer, stronger spirits against one quarry." }, spread: { id: "teeming-grove", name: "Teeming Grove", lore: "Call a larger pack across the field." }, quicken: { id: "swift-germination", name: "Swift Germination", lore: "Germinate lighter spirits more often." },
    hold: { id: "unbroken-kinship", name: "Unbroken Kinship", lore: "Mature Kinship no longer falls below half." }, cascade: { id: "pack-confluence", name: "Pack Confluence", lore: "Spirit hits build Kinship twice." }, burst: { id: "wild-host-burst", name: "Wild-Host Burst", lore: "Full Kinship adds spirits to the next pack." },
    crown: { id: "ancestral-menagerie", name: "Ancestral Menagerie", lore: "Kinship manifests ancestral companions." }, domain: { id: "hunting-ground-domain", name: "Hunting-Ground Domain", lore: "Spirit hits leave thorny hunting ground." }, updraft: { id: "beast-step", name: "Beast Step", lore: "Evade calls a Kinship-scaled spirit." }
  },
  {
    gongfaId: "ancient-tree-body-art", resource: "Bark",
    mechanics: { focusDamageScale: 1.5, focusPierce: 0, focusSpreadScale: 0.65, spreadCount: 1, spreadDegrees: 28, spreadDamageScale: 0.84, quickenCooldownScale: 0.72, quickenDamageScale: 0.84, quickenSpeed: 0, holdFloor: 3, cascadeGain: 2, burstCount: 2, crownPerStack: 0.5, domainDamageScale: 0.42, updraftStackScale: 0.8 },
    focus: { id: "worldroot-fist", name: "Worldroot Fist", lore: "Condense the combination into one crushing root fist." }, spread: { id: "canopy-sweep", name: "Canopy Sweep", lore: "Broaden every strike to sweep a wider circle." }, quicken: { id: "ringed-combination", name: "Ringed Combination", lore: "Cycle lighter old-growth blows more rapidly." },
    hold: { id: "evergreen-bark", name: "Evergreen Bark", lore: "Mature Bark no longer falls below half." }, cascade: { id: "returning-growth", name: "Returning Growth", lore: "Melee and reflected hits thicken Bark twice." }, burst: { id: "old-god-finisher", name: "Old-God Finisher", lore: "Full Bark repeats the next finisher." },
    crown: { id: "world-tree-body", name: "World-Tree Body", lore: "Bark manifests spectral root fists." }, domain: { id: "rootcrater-domain", name: "Rootcrater Domain", lore: "Finishers leave damaging root ground." }, updraft: { id: "timber-step", name: "Timber Step", lore: "Evade ends with a Bark-scaled strike." }
  }
];

const SURGE_GONGFA_BY_ID = new Map(surgeGongfaSpecs.map((spec) => [spec.gongfaId, spec]));

export function getSurgeGongfaSpec(gongfaId: GongfaId): SurgeGongfaSpec | undefined {
  return SURGE_GONGFA_BY_ID.get(gongfaId);
}

/** Collect one transformation id per gongfa for a given Surge behaviour slot. */
function collect(slot: keyof Omit<SurgeGongfaSpec, "gongfaId" | "resource" | "mechanics">): Set<string> {
  return new Set(surgeGongfaSpecs.map((spec) => spec[slot].id));
}

export const SURGE_FOCUS_IDS = collect("focus");
export const SURGE_SPREAD_IDS = collect("spread");
export const SURGE_QUICKEN_IDS = collect("quicken");
export const SURGE_HOLD_IDS = collect("hold");
export const SURGE_CASCADE_IDS = collect("cascade");
export const SURGE_BURST_IDS = collect("burst");
export const SURGE_CROWN_IDS = collect("crown");
export const SURGE_DOMAIN_IDS = collect("domain");
export const SURGE_UPDRAFT_IDS = collect("updraft");

export function surgeGongfaIds(): Set<string> {
  return new Set(surgeGongfaSpecs.map((spec) => spec.gongfaId));
}
