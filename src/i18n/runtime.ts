import { createLocaleStore, defaultLocale, type Locale, type LocaleStorage } from "./locale";
import { translate, type MessageKey } from "./messages";

let currentLocale: Locale = defaultLocale;
let store: ReturnType<typeof createLocaleStore> | null = null;

export function initializeLocale(storage: LocaleStorage): Locale {
  store = createLocaleStore(storage);
  currentLocale = store.get();
  applyDocumentLocale();
  return currentLocale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): Locale {
  currentLocale = store?.set(locale) ?? locale;
  applyDocumentLocale();
  return currentLocale;
}

export function t(key: MessageKey, variables?: Record<string, string | number>): string {
  return translate(currentLocale, key, variables);
}

function applyDocumentLocale(): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = currentLocale;
  document.title = t("app.title");
}
