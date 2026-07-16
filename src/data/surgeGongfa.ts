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
    gongfaId: "ice-mirror-guard",
    resource: "Reflection",
    mechanics: { focusDamageScale: 1.3, focusPierce: 3, focusSpreadScale: 0.72, spreadCount: 3, spreadDegrees: 28, spreadDamageScale: 0.76, quickenCooldownScale: 0.7, quickenDamageScale: 0.8, quickenSpeed: 80, holdFloor: 4, cascadeGain: 2, burstCount: 3, crownPerStack: 1, domainDamageScale: 0.3, updraftStackScale: 1.25 },
    focus: { id: "mirror-edge", name: "Mirror Edge", lore: "Hone the mirror shards into piercing edges." },
    spread: { id: "mirror-spread", name: "Mirror Spread", lore: "Scatter the mirror shards across a broad arc." },
    quicken: { id: "swift-mirror", name: "Swift Mirror", lore: "Turn the mirror faster and swifter." },
    hold: { id: "lasting-reflection", name: "Lasting Reflection", lore: "Well-stoked Reflection no longer fades below half." },
    cascade: { id: "reflection-cascade", name: "Reflection Cascade", lore: "Each hit stokes Reflection twice as fast." },
    burst: { id: "reflection-burst", name: "Refraction Burst", lore: "At full Reflection, the next turn erupts with extra shards." },
    crown: { id: "reflection-crown", name: "Reflection Crown", lore: "Reflection crowns every turn with spectral shards." },
    domain: { id: "reflection-domain", name: "Glacier Domain", lore: "Hits leave a Reflection-scaled mirror field." },
    updraft: { id: "reflection-step", name: "Reflection Step", lore: "Each Evade looses a Reflection-scaled shard burst." }
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
