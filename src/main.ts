import { mountSettingsPanel } from "./settingsPanel";
import { initializeLocale } from "./i18n/runtime";
import "@fontsource-variable/noto-sans-sc";
import "./runShell.css";

const container = document.getElementById("app");

if (!container) {
  throw new Error("Missing #app container");
}

initializeLocale(window.localStorage);

const gameSurface = document.createElement("main");
container.appendChild(gameSurface);

const renderSurface = async (): Promise<void> => {
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
void renderSurface();
mountSettingsPanel(container);
