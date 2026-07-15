import { beforeEach, describe, expect, it } from "vitest";
import {
  createDefaultSettings,
  loadSettings,
  saveSettings,
  settingsStorageKey,
  updateSettings
} from "../../src/persistence/settingsPersistence";

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>();
  return {
    get length() { return entries.size; },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => entries.delete(key),
    setItem: (key, value) => entries.set(key, value)
  };
}

describe("settings persistence", () => {
  beforeEach(() => updateSettings(createDefaultSettings()));

  it("stores production settings independently from an active Run", () => {
    const storage = createMemoryStorage();
    const settings = { ...createDefaultSettings(), muted: true, displayScale: 1.15 as const };
    saveSettings(storage, settings);
    storage.setItem("fqyy.active-run.v1", "run-data");

    expect(loadSettings(storage)).toEqual(settings);
    expect(storage.getItem(settingsStorageKey)).toContain('"muted":true');
    expect(storage.getItem("fqyy.active-run.v1")).toBe("run-data");
  });

  it("rejects malformed or out-of-range records", () => {
    const storage = createMemoryStorage();
    storage.setItem(settingsStorageKey, JSON.stringify({ ...createDefaultSettings(), masterVolume: 2 }));
    expect(loadSettings(storage)).toBeNull();
    storage.setItem(settingsStorageKey, "{bad json");
    expect(loadSettings(storage)).toBeNull();
  });

  it("updates only declared settings and keeps values bounded", () => {
    const settings = updateSettings({ masterVolume: 0.42, cameraShake: 0 });
    expect(settings.masterVolume).toBe(0.42);
    expect(settings.cameraShake).toBe(0);
    expect(settings.sfxVolume).toBe(createDefaultSettings().sfxVolume);
  });
});
