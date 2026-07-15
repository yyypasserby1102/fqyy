import {
  createDefaultSettings,
  displayScales,
  getSettings,
  initializeSettings,
  updateSettings,
  type DisplayScale,
  type GameSettings
} from "./persistence/settingsPersistence";
import { dispatchSettingsPanelState } from "./settingsEvents";

function applyDocumentSettings(settings: GameSettings): void {
  document.documentElement.style.setProperty("--fqyy-display-scale", String(settings.displayScale));
  document.documentElement.classList.toggle("reduced-motion", settings.reducedMotion);
}

function field(label: string, control: HTMLElement, output?: HTMLElement): HTMLLabelElement {
  const wrapper = document.createElement("label");
  wrapper.className = "settings-panel__field";
  const heading = document.createElement("span");
  heading.className = "settings-panel__label";
  heading.textContent = label;
  if (output) heading.appendChild(output);
  wrapper.append(heading, control);
  return wrapper;
}

function rangeControl(
  label: string,
  value: number,
  onInput: (value: number) => void
): HTMLLabelElement {
  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = "100";
  input.step = "1";
  input.value = String(Math.round(value * 100));
  input.setAttribute("aria-label", label);
  const output = document.createElement("output");
  output.textContent = `${input.value}%`;
  input.addEventListener("input", () => {
    output.textContent = `${input.value}%`;
    onInput(Number(input.value) / 100);
  });
  return field(label, input, output);
}

function checkControl(label: string, checked: boolean, onChange: (checked: boolean) => void): HTMLLabelElement {
  const wrapper = document.createElement("label");
  wrapper.className = "settings-panel__check";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.addEventListener("change", () => onChange(input.checked));
  const text = document.createElement("span");
  text.textContent = label;
  wrapper.append(input, text);
  return wrapper;
}

export function mountSettingsPanel(container: HTMLElement): void {
  const initial = initializeSettings(window.localStorage);
  applyDocumentSettings(initial);

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "settings-trigger";
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-label", "Open settings");
  trigger.textContent = "⚙ Settings";

  const backdrop = document.createElement("div");
  backdrop.className = "settings-backdrop";
  backdrop.hidden = true;

  const panel = document.createElement("section");
  panel.className = "settings-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "settings-title");

  const heading = document.createElement("div");
  heading.className = "settings-panel__heading";
  const title = document.createElement("h2");
  title.id = "settings-title";
  title.textContent = "Cultivation Settings";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "settings-panel__close";
  close.setAttribute("aria-label", "Close settings");
  close.textContent = "×";
  heading.append(title, close);

  const controls = document.createElement("div");
  controls.className = "settings-panel__controls";
  const persist = (patch: Partial<Omit<GameSettings, "version">>): void => {
    const next = updateSettings(patch, window.localStorage);
    applyDocumentSettings(next);
  };

  const masterControl = rangeControl("Master volume", initial.masterVolume, (value) => persist({ masterVolume: value }));
  const sfxControl = rangeControl("Sound effects", initial.sfxVolume, (value) => persist({ sfxVolume: value }));
  const ambienceControl = rangeControl("Ambience", initial.ambienceVolume, (value) => persist({ ambienceVolume: value }));
  const muteControl = checkControl("Mute all audio", initial.muted, (muted) => persist({ muted }));
  const cameraControl = rangeControl("Camera shake", initial.cameraShake, (cameraShake) => persist({ cameraShake }));
  const cameraInput = cameraControl.querySelector("input");
  if (!(cameraInput instanceof HTMLInputElement)) throw new Error("Missing camera shake control");
  cameraInput.disabled = initial.reducedMotion;
  const motionControl = checkControl("Reduce motion and flashes", initial.reducedMotion, (reducedMotion) => {
    cameraInput.disabled = reducedMotion;
    persist({ reducedMotion });
  });
  controls.append(masterControl, sfxControl, ambienceControl, muteControl, motionControl, cameraControl);

  const scaleSelect = document.createElement("select");
  scaleSelect.setAttribute("aria-label", "Display scale");
  displayScales.forEach((scale) => {
    const option = document.createElement("option");
    option.value = String(scale);
    option.textContent = `${Math.round(scale * 100)}%`;
    option.selected = initial.displayScale === scale;
    scaleSelect.appendChild(option);
  });
  scaleSelect.addEventListener("change", () => persist({ displayScale: Number(scaleSelect.value) as DisplayScale }));
  controls.appendChild(field("Display scale", scaleSelect));

  const actions = document.createElement("div");
  actions.className = "settings-panel__actions";
  const fullscreen = document.createElement("button");
  fullscreen.type = "button";
  fullscreen.textContent = "Enter Fullscreen";
  const syncFullscreen = (): void => {
    fullscreen.textContent = document.fullscreenElement ? "Exit Fullscreen" : "Enter Fullscreen";
  };
  fullscreen.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      fullscreen.textContent = "Fullscreen unavailable";
    }
  });
  document.addEventListener("fullscreenchange", syncFullscreen);

  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "Restore Defaults";
  reset.addEventListener("click", () => {
    updateSettings(createDefaultSettings(), window.localStorage);
    applyDocumentSettings(getSettings());
    window.location.reload();
  });
  actions.append(fullscreen, reset);

  const note = document.createElement("p");
  note.className = "settings-panel__note";
  note.textContent = "Settings save automatically and remain independent of your active Run.";
  panel.append(heading, controls, actions, note);
  backdrop.appendChild(panel);

  const setOpen = (open: boolean): void => {
    backdrop.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    const gameSurface = container.querySelector(".game-surface");
    if (gameSurface instanceof HTMLElement) gameSurface.inert = open;
    dispatchSettingsPanelState(open);
    if (open) close.focus();
    else trigger.focus();
  };
  trigger.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("pointerdown", (event) => {
    if (event.target === backdrop) setOpen(false);
  });
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      const focusable = [...panel.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), select:not(:disabled)")];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  container.append(trigger, backdrop);
}
