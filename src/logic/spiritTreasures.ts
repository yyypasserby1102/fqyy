import {
  MAX_SPIRIT_TREASURE_SLOTS,
  spiritTreasureConfigs,
  type SpiritTreasureEffectKind,
  type SpiritTreasureId,
  type SpiritTreasureSeal
} from "../data/spiritTreasures";

/** A Spirit Treasure drops every this-many enemy defeats. */
export const SPIRIT_TREASURE_DROP_INTERVAL = 30;

export type SpiritTreasureAttunementRank = 1 | 2 | 3;
export interface SpiritTreasureAttunement {
  id: SpiritTreasureId;
  rank: SpiritTreasureAttunementRank;
}

export type SpiritTreasureResonance = SpiritTreasureSeal;

export type SpiritTreasureAttunementResult =
  | { kind: "attuned"; active: SpiritTreasureAttunement[] }
  | {
      kind: "replace-required";
      active: SpiritTreasureAttunement[];
      offeredId: SpiritTreasureId;
    };

export function attuneSpiritTreasure(
  active: SpiritTreasureAttunement[],
  offeredId: SpiritTreasureId
): SpiritTreasureAttunementResult {
  const held = active.find((entry) => entry.id === offeredId);
  if (held) {
    return {
      kind: "attuned",
      active: active.map((entry) =>
        entry.id === offeredId
          ? {
              ...entry,
              rank: Math.min(3, entry.rank + 1) as SpiritTreasureAttunementRank
            }
          : entry
      )
    };
  }
  if (active.length >= MAX_SPIRIT_TREASURE_SLOTS) {
    return { kind: "replace-required", active, offeredId };
  }
  return { kind: "attuned", active: [...active, { id: offeredId, rank: 1 }] };
}

export function projectSpiritTreasureState(active: SpiritTreasureAttunement[]): {
  effects: SpiritTreasureEffectTotals;
  signatures: string[];
  resonances: SpiritTreasureResonance[];
} {
  const effects: SpiritTreasureEffectTotals = {
    maxHealth: 0,
    moveSpeed: 0,
    magnetRadius: 0,
    mitigation: 0
  };
  const signatures: string[] = [];
  const sealCounts = new Map<SpiritTreasureResonance, number>();
  for (const entry of active) {
    const config = spiritTreasureConfigs[entry.id];
    const multiplier = entry.rank === 1 ? 1 : entry.rank === 2 ? 1.5 : 2;
    effects[config.effect] += config.value * multiplier;
    config.resonanceSeals.forEach((seal) => sealCounts.set(seal, (sealCounts.get(seal) ?? 0) + 1));
    if (entry.rank >= 2) signatures.push(`${entry.id}:${config.signature.id}`);
    if (entry.rank >= 3) signatures.push(`${entry.id}:${config.culmination.id}`);
  }
  return {
    effects,
    signatures,
    resonances: [...sealCounts.entries()]
      .filter(([, count]) => count >= 2)
      .map(([seal]) => seal)
  };
}

export interface SpiritTreasureResonanceModifiers {
  healingMultiplier: number;
  emergencyHealFraction: number;
  bulwarkGuardMultiplier: number;
  harvestPulseDamage: number;
  projectileDamageMultiplier: number;
  evadeCooldownMultiplier: number;
}

export function projectSpiritTreasureResonanceModifiers(
  resonances: SpiritTreasureResonance[],
  attunements: SpiritTreasureAttunement[] = []
): SpiritTreasureResonanceModifiers {
  const active = new Set(resonances);
  const rankOf = (id: SpiritTreasureId) =>
    attunements.find((entry) => entry.id === id)?.rank ?? 0;
  const jadeRank = rankOf("jade-heart-pendant");
  const windRank = rankOf("windstep-talisman");
  const lodestoneRank = rankOf("lodestone-charm");
  const ironhideRank = rankOf("ironhide-seal");
  const vialRank = rankOf("spiritbloom-vial");
  const mirrorRank = rankOf("farsight-mirror");
  return {
    healingMultiplier:
      active.has("vitality") || vialRank >= 3 ? 1.25 : vialRank >= 2 ? 1.12 : 1,
    emergencyHealFraction:
      active.has("vitality") || jadeRank >= 3 ? 0.1 : jadeRank >= 2 ? 0.05 : 0,
    bulwarkGuardMultiplier:
      active.has("bulwark") || ironhideRank >= 3 ? 0.7 : ironhideRank >= 2 ? 0.82 : 1,
    harvestPulseDamage:
      active.has("harvest") || lodestoneRank >= 3 ? 8 : lodestoneRank >= 2 ? 4 : 0,
    projectileDamageMultiplier:
      active.has("perception") || mirrorRank >= 3 ? 1.12 : mirrorRank >= 2 ? 1.06 : 1,
    evadeCooldownMultiplier:
      active.has("windwalk") || windRank >= 3 ? 0.85 : windRank >= 2 ? 0.92 : 1
  };
}

export function projectSpiritTreasureReplacement(
  active: SpiritTreasureAttunement[],
  replacedId: SpiritTreasureId,
  offeredId: SpiritTreasureId
): {
  gain: string;
  loss: string;
  resonanceGained: SpiritTreasureResonance[];
  resonanceLost: SpiritTreasureResonance[];
  mechanicsGained: string[];
  mechanicsLost: string[];
} {
  const after = active.map((entry) =>
    entry.id === replacedId ? ({ id: offeredId, rank: 1 } as const) : entry
  );
  const beforeState = projectSpiritTreasureState(active);
  const afterState = projectSpiritTreasureState(after);
  const deltas = (Object.keys(beforeState.effects) as SpiritTreasureEffectKind[]).map((effect) => ({
    effect,
    delta: afterState.effects[effect] - beforeState.effects[effect]
  }));
  const gain = deltas.find(({ delta }) => delta > 0);
  const loss = deltas.find(({ delta }) => delta < 0);
  const mechanics = (entries: SpiritTreasureAttunement[]) => entries.flatMap((entry) => {
    const config = spiritTreasureConfigs[entry.id];
    return [
      ...(entry.rank >= 2 ? [`A2 ${config.signature.name}`] : []),
      ...(entry.rank >= 3 ? [`A3 ${config.culmination.name}`] : [])
    ];
  });
  const beforeMechanics = mechanics(active);
  const afterMechanics = mechanics(after);
  return {
    gain: gain ? `+${gain.delta} ${gain.effect}` : "No primary gain",
    loss: loss ? `${loss.delta} ${loss.effect}` : "No primary loss",
    resonanceGained: afterState.resonances.filter(
      (resonance) => !beforeState.resonances.includes(resonance)
    ),
    resonanceLost: beforeState.resonances.filter(
      (resonance) => !afterState.resonances.includes(resonance)
    ),
    mechanicsGained: afterMechanics.filter((mechanic) => !beforeMechanics.includes(mechanic)),
    mechanicsLost: beforeMechanics.filter((mechanic) => !afterMechanics.includes(mechanic))
  };
}

/**
 * Deterministic Spirit Treasure loot: every SPIRIT_TREASURE_DROP_INTERVAL
 * defeats drops the next treasure in a fixed rotation. Deterministic (no RNG)
 * so it never perturbs the run's seeded sequence. Returns undefined on
 * non-drop kills.
 */
export function spiritTreasureDropForKill(killCount: number): SpiritTreasureId | undefined {
  if (killCount <= 0 || killCount % SPIRIT_TREASURE_DROP_INTERVAL !== 0) {
    return undefined;
  }
  const ids = Object.keys(spiritTreasureConfigs) as SpiritTreasureId[];
  return ids[(killCount / SPIRIT_TREASURE_DROP_INTERVAL - 1) % ids.length];
}

export type SpiritTreasureEffectTotals = Record<SpiritTreasureEffectKind, number>;

export type SpiritTreasureAcquisition =
  // The treasure was stored: either an empty slot was filled, or it was already
  // held (a no-op). `activeIds` is the resulting set.
  | { kind: "stored"; activeIds: SpiritTreasureId[] }
  // All three slots are full: the player must replace one or leave the treasure.
  // `activeIds` is unchanged.
  | { kind: "replace-required"; activeIds: SpiritTreasureId[]; offeredId: SpiritTreasureId };

/**
 * Resolve contact with a Spirit Treasure. Fills an empty slot when there is
 * room (or no-ops when already held); otherwise signals that a replacement
 * choice is required, since a cultivator keeps at most three.
 */
export function offerSpiritTreasure(
  activeIds: SpiritTreasureId[],
  offeredId: SpiritTreasureId
): SpiritTreasureAcquisition {
  if (activeIds.includes(offeredId)) {
    return { kind: "stored", activeIds };
  }

  if (activeIds.length < MAX_SPIRIT_TREASURE_SLOTS) {
    return { kind: "stored", activeIds: [...activeIds, offeredId] };
  }

  return { kind: "replace-required", activeIds, offeredId };
}

/** Swap an held treasure for the offered one, preserving slot order. */
export function replaceSpiritTreasure(
  activeIds: SpiritTreasureId[],
  replacedId: SpiritTreasureId,
  offeredId: SpiritTreasureId
): SpiritTreasureId[] {
  if (!activeIds.includes(replacedId) || activeIds.includes(offeredId)) {
    return activeIds;
  }
  return activeIds.map((id) => (id === replacedId ? offeredId : id));
}

/** Sum the Cultivator Attribute bonuses granted by the active treasures. */
export function aggregateSpiritTreasureEffects(
  activeIds: SpiritTreasureId[]
): SpiritTreasureEffectTotals {
  const totals: SpiritTreasureEffectTotals = {
    maxHealth: 0,
    moveSpeed: 0,
    magnetRadius: 0,
    mitigation: 0
  };

  for (const id of activeIds) {
    const config = spiritTreasureConfigs[id];
    totals[config.effect] += config.value;
  }

  return totals;
}
