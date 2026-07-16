import { mountSettingsPanel } from "./settingsPanel";
import { getLocale, initializeLocale } from "./i18n/runtime";
import "@fontsource-variable/noto-sans-sc";
import "./runShell.css";

const container = document.getElementById("app");

if (!container) {
  throw new Error("Missing #app container");
}

initializeLocale(window.localStorage);

const gameSurface = document.createElement("main");
gameSurface.className = "surface-loading";
gameSurface.textContent = "FQYY";
container.appendChild(gameSurface);

let localeFontReady: Promise<void> | undefined;
const ensureLocaleFont = (): Promise<void> => {
  if (getLocale() !== "zh-CN") return Promise.resolve();
  localeFontReady ??= import("./i18n/content").then(async ({ getChineseFontPreloadText }) => {
    await document.fonts.load('16px "Noto Sans SC Variable"', getChineseFontPreloadText());
  });
  return localeFontReady;
};

const renderSurface = async (): Promise<void> => {
  await ensureLocaleFont();
  if (window.location.hash.startsWith("#tools")) {
    gameSurface.className = "tools-surface";
    const { mountToolsShell } = await import("./toolsShell");
    mountToolsShell(gameSurface);
    return;
  }
  gameSurface.className = "game-surface";
  const { mountRunShell } = await import("./runShell");
  mountRunShell(gameSurface);
};

window.addEventListener("hashchange", () => { void renderSurface(); });
void renderSurface().then(() => mountSettingsPanel(container));
