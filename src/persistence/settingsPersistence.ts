export const settingsStorageKey = "fqyy.settings.v1";

export const displayScales = [0.85, 1, 1.15, 1.3] as const;
export type DisplayScale = (typeof displayScales)[number];

export interface GameSettings {
  version: 1;
  masterVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
  muted: boolean;
  reducedMotion: boolean;
  cameraShake: number;
  displayScale: DisplayScale;
}

type SettingsListener = (settings: GameSettings) => void;
const listeners = new Set<SettingsListener>();
let currentSettings: GameSettings = createDefaultSettings();

export function createDefaultSettings(): GameSettings {
  return {
    version: 1,
    masterVolume: 0.7,
    sfxVolume: 0.55,
    ambienceVolume: 0.5,
    muted: false,
    reducedMotion: false,
    cameraShake: 1,
    displayScale: 1
  };
}

function isUnitInterval(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isDisplayScale(value: unknown): value is DisplayScale {
  return displayScales.some((scale) => scale === value);
}

function isGameSettings(value: unknown): value is GameSettings {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.version === 1 &&
    isUnitInterval(record.masterVolume) &&
    isUnitInterval(record.sfxVolume) &&
    isUnitInterval(record.ambienceVolume) &&
    typeof record.muted === "boolean" &&
    typeof record.reducedMotion === "boolean" &&
    isUnitInterval(record.cameraShake) &&
    isDisplayScale(record.displayScale);
}

export function loadSettings(storage: Storage): GameSettings | null {
  const raw = storage.getItem(settingsStorageKey);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isGameSettings(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSettings(storage: Storage, settings: GameSettings): void {
  storage.setItem(settingsStorageKey, JSON.stringify(settings));
}

export function initializeSettings(storage: Storage): GameSettings {
  currentSettings = loadSettings(storage) ?? createDefaultSettings();
  saveSettings(storage, currentSettings);
  return { ...currentSettings };
}

export function getSettings(): GameSettings {
  return { ...currentSettings };
}

export function updateSettings(
  patch: Partial<Omit<GameSettings, "version">> | GameSettings,
  storage?: Storage
): GameSettings {
  const candidate: GameSettings = { ...currentSettings, ...patch, version: 1 };
  if (!isGameSettings(candidate)) {
    throw new Error("Invalid game settings update");
  }
  currentSettings = candidate;
  if (storage) saveSettings(storage, currentSettings);
  const snapshot = getSettings();
  listeners.forEach((listener) => listener(snapshot));
  return snapshot;
}

export function subscribeSettings(listener: SettingsListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
