import { mountRunShell } from "./runShell";
import { mountSettingsPanel } from "./settingsPanel";
import "./runShell.css";

const container = document.getElementById("app");

if (!container) {
  throw new Error("Missing #app container");
}

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
  mountRunShell(gameSurface);
};

window.addEventListener("hashchange", () => { void renderSurface(); });
void renderSurface();
mountSettingsPanel(container);
