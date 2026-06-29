import { describe, expect, it } from "vitest";
import {
  activeRunStorageKey,
  clearActiveRun,
  createActiveRunCheckpoint,
  createActiveRunSave,
  hasActiveRun,
  loadActiveRun,
  saveActiveRun
} from "../../src/persistence/runPersistence";

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear() {
      entries.clear();
    },
    getItem(key: string) {
      return entries.has(key) ? entries.get(key)! : null;
    },
    key(index: number) {
      return Array.from(entries.keys())[index] ?? null;
    },
    removeItem(key: string) {
      entries.delete(key);
    },
    setItem(key: string, value: string) {
      entries.set(key, value);
    }
  };
}

function createValidCheckpoint() {
  return {
    stage: "lianqi",
    realmPhase: "chuqi",
    realmProgress: 0,
    phaseCleanupActive: false,
    foundationGrowthTransactions: 0,
    masteryPoints: 0,
    masteryRank: 0,
    masteryLearnedIds: [],
    upgradeSelectionIds: [],
    masterySkill2CooldownRemaining: 0,
    masterySkill2Casts: 0,
    masteryChoiceActive: false,
    masteryPendingRanks: [],
    learnedGongfaIds: [],
    galeMomentum: 0,
    galeMomentumBuildRate: 0,
    galeMomentumDecayRate: 0,
    galeMomentumWaveBonus: 0,
    galeMomentumAppliedRangeBonus: 0,
    galeMomentumAppliedSpreadBonus: 0,
    galeMomentumAppliedLifetimeBonus: 0,
    heat: 0,
    heatBuildRate: 0,
    heatDecayRate: 0,
    heatAppliedCooldownBonus: 0,
    heatAuraSpeedBonus: 0,
    ringSegments: 0,
    counterflowRingSegments: 0,
    counterflowRingAppliedSegments: 0,
    counterflowRingRadiusBonus: 0,
    counterflowRingCooldownRemaining: 0,
    solarFlareCooldownRemaining: 0,
    solarFlareCasts: 0,
    crimsonPressure: 0,
    crimsonPressureBuildRate: 0,
    crimsonPressureDecayRate: 0,
    crimsonPressureAppliedRadiusBonus: 0,
    crimsonPressureRadiusScale: 0.45,
    crimsonEmbedThreshold: 3,
    furnaceCascadeCooldownRemaining: 0,
    furnaceCascadeCasts: 0,
    guardValue: 0,
    guardBuildRate: 0,
    guardDecayRate: 0,
    guardMitigation: 0,
    guardMitigationBonus: 0,
    guardAppliedRetaliationBonus: 0,
    guardAppliedAuraBonus: 0,
    guardAppliedDamageBonus: 0,
    bladeShellCharge: 0,
    bladeShellThreshold: 100,
    bladeShellCooldownRemaining: 0,
    bladeShellCasts: 0,
    hiddenLinggenId: "metal",
    lingcaoCollected: false,
    lingcaoMarker: "opening",
    lingcaoX: 0,
    lingcaoY: 0,
    healingPills: [],
    mainGongfaId: "yujian-jue",
    kills: 0,
    elapsedMs: 0,
    finalBossActive: false,
    finalBossPhaseIndex: 0,
    spiritTreasureIds: []
  };
}

describe("run persistence", () => {
  it("creates a durable active-run record without transient combat fields", () => {
    const save = createActiveRunSave(42, 1234567890);

    expect(save).toEqual({
      version: 1,
      seed: 42,
      startedAt: 1234567890,
      lifecycle: "mortal"
    });
    expect(Object.keys(save).sort()).toEqual([
      "lifecycle",
      "seed",
      "startedAt",
      "version"
    ]);
  });

  it("persists the selected candidate Linggen before the first checkpoint exists", () => {
    const storage = createMemoryStorage();
    const save = createActiveRunSave(42, 1234567890, "metal");

    saveActiveRun(storage, save);

    expect(loadActiveRun(storage)).toEqual({
      version: 1,
      seed: 42,
      startedAt: 1234567890,
      lifecycle: "mortal",
      selectedLinggenId: "metal"
    });
  });

  it("round-trips the active run through storage and clears it again", () => {
    const storage = createMemoryStorage();
    const save = createActiveRunSave(7, 99);

    expect(hasActiveRun(storage)).toBe(false);
    saveActiveRun(storage, save);

    expect(storage.getItem(activeRunStorageKey)).toContain('"seed":7');
    expect(loadActiveRun(storage)).toEqual(save);
    expect(hasActiveRun(storage)).toBe(true);

    clearActiveRun(storage);

    expect(storage.getItem(activeRunStorageKey)).toBeNull();
    expect(loadActiveRun(storage)).toBeNull();
    expect(hasActiveRun(storage)).toBe(false);
  });

  it("creates checkpoints through the same validation and defaulting path used by loading", () => {
    const checkpoint = createValidCheckpoint();
    const { finalBossActive, finalBossPhaseIndex, guardMitigationBonus, ...legacyShape } =
      checkpoint;
    void finalBossActive;
    void finalBossPhaseIndex;
    void guardMitigationBonus;

    expect(createActiveRunCheckpoint(legacyShape)).toMatchObject({
      finalBossActive: false,
      finalBossPhaseIndex: 0,
      guardMitigationBonus: 0
    });
    expect(() =>
      createActiveRunCheckpoint({
        ...checkpoint,
        realmProgress: 101
      })
    ).toThrow("Invalid active Run checkpoint");
  });

  it("defaults fields added after older checkpoints were written", () => {
    const storage = createMemoryStorage();
    const checkpoint = createValidCheckpoint();
    const {
      finalBossActive,
      finalBossPhaseIndex,
      guardMitigationBonus,
      upgradeSelectionIds,
      ...legacyCheckpoint
    } = checkpoint;
    void finalBossActive;
    void finalBossPhaseIndex;
    void guardMitigationBonus;
    void upgradeSelectionIds;

    storage.setItem(
      activeRunStorageKey,
      JSON.stringify({
        version: 1,
        seed: 7,
        startedAt: 99,
        lifecycle: "mortal",
        checkpoint: legacyCheckpoint
      })
    );

    expect(loadActiveRun(storage)?.checkpoint).toMatchObject({
      finalBossActive: false,
      finalBossPhaseIndex: 0,
      guardMitigationBonus: 0,
      upgradeSelectionIds: []
    });
  });

  it("migrates legacy v0 active-run envelopes into the current durable shape", () => {
    const storage = createMemoryStorage();
    const checkpoint = createValidCheckpoint();

    storage.setItem(
      activeRunStorageKey,
      JSON.stringify({
        version: 0,
        seed: 7,
        startedAt: 99,
        checkpoint
      })
    );

    expect(loadActiveRun(storage)).toEqual({
      version: 1,
      seed: 7,
      startedAt: 99,
      lifecycle: "mortal",
      checkpoint
    });
  });

  it("allows a checkpointed player at zero health while rejecting negative stats", () => {
    const storage = createMemoryStorage();
    const checkpoint = {
      ...createValidCheckpoint(),
      playerHealth: 0,
      playerMaxHealth: 100,
      playerMoveSpeed: 220,
      playerMagnetRadius: 100
    };

    storage.setItem(
      activeRunStorageKey,
      JSON.stringify({
        version: 1,
        seed: 7,
        startedAt: 99,
        lifecycle: "mortal",
        checkpoint
      })
    );

    expect(loadActiveRun(storage)?.checkpoint?.playerHealth).toBe(0);
  });

  it("rejects active-run records with malformed checkpoints", () => {
    const storage = createMemoryStorage();
    storage.setItem(activeRunStorageKey, JSON.stringify([]));
    expect(loadActiveRun(storage)).toBeNull();

    storage.setItem(
      activeRunStorageKey,
      JSON.stringify({
        version: 1,
        seed: 7,
        startedAt: 99,
        lifecycle: "mortal",
        checkpoint: {}
      })
    );

    expect(loadActiveRun(storage)).toBeNull();
    expect(hasActiveRun(storage)).toBe(false);

    storage.setItem(
      activeRunStorageKey,
      JSON.stringify({
        version: 1,
        seed: 7,
        startedAt: 99,
        lifecycle: "mortal",
        checkpoint: []
      })
    );
    expect(loadActiveRun(storage)).toBeNull();
  });

  it("rejects active-run records with malformed envelope fields", () => {
    const storage = createMemoryStorage();

    [
      { version: 2 },
      { seed: "7" },
      { startedAt: "99" },
      { lifecycle: "finished" }
    ].forEach((patch) => {
      storage.setItem(
        activeRunStorageKey,
        JSON.stringify({
          version: 1,
          seed: 7,
          startedAt: 99,
          lifecycle: "mortal",
          ...patch
        })
      );

      expect(loadActiveRun(storage)).toBeNull();
    });
  });

  it("rejects checkpoints with invalid domain ids", () => {
    const storage = createMemoryStorage();
    storage.setItem(
      activeRunStorageKey,
      JSON.stringify({
        version: 1,
        seed: 7,
        startedAt: 99,
        lifecycle: "mortal",
        checkpoint: {
          ...createValidCheckpoint(),
          stage: "banana"
        }
      })
    );

    expect(loadActiveRun(storage)).toBeNull();

    storage.setItem(
      activeRunStorageKey,
      JSON.stringify({
        version: 1,
        seed: 7,
        startedAt: 99,
        lifecycle: "mortal",
        checkpoint: {
          ...createValidCheckpoint(),
          realmPhase: "not-a-phase"
        }
      })
    );

    expect(loadActiveRun(storage)).toBeNull();

    storage.setItem(
      activeRunStorageKey,
      JSON.stringify({
        version: 1,
        seed: 7,
        startedAt: 99,
        lifecycle: "mortal",
        checkpoint: {
          ...createValidCheckpoint(),
          hiddenLinggenId: "fake-linggen"
        }
      })
    );

    expect(loadActiveRun(storage)).toBeNull();

    storage.setItem(
      activeRunStorageKey,
      JSON.stringify({
        version: 1,
        seed: 7,
        startedAt: 99,
        lifecycle: "mortal",
        checkpoint: {
          ...createValidCheckpoint(),
          mainGongfaId: "fake-gongfa"
        }
      })
    );

    expect(loadActiveRun(storage)).toBeNull();
  });

  it("rejects checkpoints with malformed optional and nested collections", () => {
    const storage = createMemoryStorage();

    [
      { upgradeSelectionIds: [123] },
      { masterySkill2Id: 10 },
      { revealedLinggenId: "fake-linggen" },
      { guardMitigationBonus: "0.1" },
      { learnedGongfaIds: ["fake-gongfa"] },
      { masteryPendingRanks: ["1"] },
      { finalBossActive: "false" },
      { finalBossPhaseIndex: "0" },
      { finalBossPhaseIndex: -1 },
      { finalBossPhaseIndex: 3 },
      { realmProgress: -1 },
      { realmProgress: 101 },
      { foundationGrowthTransactions: -1 },
      { masteryPoints: -1 },
      { masteryRank: -1 },
      { masterySkill2CooldownRemaining: -1 },
      { masterySkill2Casts: -1 },
      { kills: -1 },
      { elapsedMs: -1 },
      { playerHealth: -1 },
      { playerMaxHealth: 0 },
      { playerMoveSpeed: -1 },
      { playerMagnetRadius: -1 },
      { healingPills: [{ x: 1, y: 2 }] },
      { healingPills: [{ x: 1, y: 2, healAmount: 0 }] },
      { healingPills: [{ x: 1, y: 2, healAmount: -5 }] }
    ].forEach((patch) => {
      storage.setItem(
        activeRunStorageKey,
        JSON.stringify({
          version: 1,
          seed: 7,
          startedAt: 99,
          lifecycle: "mortal",
          checkpoint: {
            ...createValidCheckpoint(),
            ...patch
          }
        })
      );

      expect(loadActiveRun(storage)).toBeNull();
    });
  });

  it("loads a valid active-run checkpoint and rejects invalid raw JSON", () => {
    const storage = createMemoryStorage();
    const checkpoint = createValidCheckpoint();

    storage.setItem(
      activeRunStorageKey,
      JSON.stringify({
        version: 1,
        seed: 7,
        startedAt: 99,
        lifecycle: "mortal",
        checkpoint
      })
    );

    expect(loadActiveRun(storage)).toEqual({
      version: 1,
      seed: 7,
      startedAt: 99,
      lifecycle: "mortal",
      checkpoint
    });

    storage.setItem(activeRunStorageKey, "{bad json");
    expect(loadActiveRun(storage)).toBeNull();
  });
});
