import { mountRunShell } from "./runShell";
import { mountSettingsPanel } from "./settingsPanel";
import "./runShell.css";

const container = document.getElementById("app");

if (!container) {
  throw new Error("Missing #app container");
}

const gameSurface = document.createElement("main");
gameSurface.className = "game-surface";
container.appendChild(gameSurface);
mountRunShell(gameSurface);
mountSettingsPanel(container);
