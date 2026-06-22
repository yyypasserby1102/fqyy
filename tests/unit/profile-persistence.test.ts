import { describe, expect, it } from "vitest";
import { createActiveRunSave, saveActiveRun, loadActiveRun } from "../../src/persistence/runPersistence";
import {
  createProfileRecord,
  loadProfileRecord,
  profileStorageKey,
  saveProfileRecord
} from "../../src/persistence/profilePersistence";

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

describe("profile persistence", () => {
  it("stores completion/profile data separately from the active Run save", () => {
    const storage = createMemoryStorage();

    saveProfileRecord(storage, createProfileRecord());
    saveActiveRun(storage, createActiveRunSave(123, 456));

    expect(loadProfileRecord(storage)).toEqual({
      version: 1,
      settings: {
        soundEnabled: true,
        musicVolume: 0.7
      },
      completedRuns: 0
    });
    expect(loadActiveRun(storage)?.seed).toBe(123);
    expect(storage.getItem(profileStorageKey)).toContain('"version":1');
  });
});
