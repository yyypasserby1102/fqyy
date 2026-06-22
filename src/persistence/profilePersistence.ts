export const profileStorageKey = "fqyy.profile.v1";

export interface ProfileSettings {
  soundEnabled: boolean;
  musicVolume: number;
}

export interface ProfileRecord {
  version: 1;
  settings: ProfileSettings;
  completedRuns: number;
}

export function createProfileRecord(): ProfileRecord {
  return {
    version: 1,
    settings: {
      soundEnabled: true,
      musicVolume: 0.7
    },
    completedRuns: 0
  };
}

export function saveProfileRecord(storage: Storage, record: ProfileRecord): void {
  storage.setItem(profileStorageKey, JSON.stringify(record));
}

export function loadProfileRecord(storage: Storage): ProfileRecord | null {
  const raw = storage.getItem(profileStorageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as ProfileRecord;
    if (parsed.version !== 1) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
