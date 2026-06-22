import { describe, expect, it } from "vitest";
import {
  activeRunStorageKey,
  clearActiveRun,
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
});
