export const localeMetadata = {
  "zh-CN": { selfName: "简体中文" },
  en: { selfName: "English" }
} as const;
export type Locale = keyof typeof localeMetadata;
export const supportedLocales = Object.keys(localeMetadata) as Locale[];

export const defaultLocale: Locale = "zh-CN";
export const localeStorageKey = "fqyy.locale.v1";

export interface LocaleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface LocaleStore {
  get(): Locale;
  set(locale: Locale): Locale;
}

export function resolveLocale(value: unknown): Locale {
  return supportedLocales.includes(value as Locale) ? value as Locale : defaultLocale;
}

function loadLocale(storage: LocaleStorage): Locale {
  const saved = storage.getItem(localeStorageKey);
  if (!saved) return defaultLocale;
  try {
    return resolveLocale(JSON.parse(saved));
  } catch {
    return defaultLocale;
  }
}

export function createLocaleStore(storage: LocaleStorage): LocaleStore {
  let current = loadLocale(storage);
  return {
    get: () => current,
    set: (locale) => {
      current = resolveLocale(locale);
      storage.setItem(localeStorageKey, JSON.stringify(current));
      return current;
    }
  };
}
