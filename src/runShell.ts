import { createGame } from "./game";
import { getCultivatorCandidates, type CultivatorCandidate } from "./data/linggen";
import {
  clearActiveRun,
  createActiveRunSave,
  hasActiveRun,
  loadActiveRun,
  saveActiveRun
} from "./persistence/runPersistence";
import { createProfileRecord, loadProfileRecord, saveProfileRecord } from "./persistence/profilePersistence";
import { setRandomSeed } from "./utils/random";

function generateSeed(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] || 1;
  }

  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

function clearElement(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function launchGame(container: HTMLElement, seed: number): void {
  clearElement(container);
  setRandomSeed(seed);
  createGame(container);
}

export function mountRunShell(container: HTMLElement): void {
  clearElement(container);

  let awaitingAbandonConfirmation = false;
  let pendingCandidateSeed: number | null = null;

  const shell = document.createElement("div");
  shell.style.minHeight = "100vh";
  shell.style.display = "flex";
  shell.style.alignItems = "center";
  shell.style.justifyContent = "center";
  shell.style.background = "linear-gradient(180deg, #081019 0%, #111d2b 100%)";
  shell.style.color = "#f4f8ff";
  shell.style.fontFamily = "Trebuchet MS, Noto Sans SC, sans-serif";

  const panel = document.createElement("div");
  panel.style.width = "min(520px, calc(100vw - 48px))";
  panel.style.padding = "32px";
  panel.style.border = "1px solid rgba(142, 202, 230, 0.32)";
  panel.style.borderRadius = "18px";
  panel.style.background = "rgba(7, 16, 24, 0.88)";
  panel.style.boxShadow = "0 24px 80px rgba(0, 0, 0, 0.35)";
  panel.style.textAlign = "center";

  const title = document.createElement("h1");
  title.textContent = "FQYY";
  title.style.margin = "0 0 12px";
  title.style.fontSize = "48px";
  title.style.letterSpacing = "0.12em";

  const subtitle = document.createElement("p");
  subtitle.textContent = "Cultivation Run Shell";
  subtitle.style.margin = "0 0 18px";
  subtitle.style.color = "#a8c4d6";

  const description = document.createElement("p");
  description.textContent =
    "Start a seeded Mortal Run, leave the app, and resume the same durable run record later.";
  description.style.margin = "0 0 24px";
  description.style.lineHeight = "1.5";
  description.style.color = "#d8e4ee";

  const buttonRow = document.createElement("div");
  buttonRow.style.display = "flex";
  buttonRow.style.gap = "12px";
  buttonRow.style.justifyContent = "center";
  buttonRow.style.flexWrap = "wrap";

  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.textContent = "Start New Run";
  startButton.style.padding = "12px 18px";
  startButton.style.border = "0";
  startButton.style.borderRadius = "999px";
  startButton.style.background = "#9fe38c";
  startButton.style.color = "#081019";
  startButton.style.fontWeight = "700";
  startButton.style.cursor = "pointer";

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.textContent = "Continue";
  continueButton.style.padding = "12px 18px";
  continueButton.style.border = "0";
  continueButton.style.borderRadius = "999px";
  continueButton.style.background = "#8ecae6";
  continueButton.style.color = "#081019";
  continueButton.style.fontWeight = "700";
  continueButton.style.cursor = "pointer";

  const status = document.createElement("p");
  status.style.margin = "18px 0 0";
  status.style.minHeight = "1.5em";
  status.style.color = "#f5e6a8";

  const startCandidateRun = (seed: number, candidate: CultivatorCandidate): void => {
    const save = createActiveRunSave(seed, Date.now(), candidate.linggenId);
    saveActiveRun(window.localStorage, save);
    launchGame(container, save.seed);
  };

  const renderCandidateButtons = (seed: number): void => {
    buttonRow.replaceChildren();
    const candidates = getCultivatorCandidates(seed);

    for (const candidate of candidates) {
      const candidateButton = document.createElement("button");
      candidateButton.type = "button";
      candidateButton.textContent = `Choose ${candidate.name}: ${candidate.linggenName}`;
      candidateButton.style.padding = "12px 16px";
      candidateButton.style.border = "1px solid rgba(142, 202, 230, 0.32)";
      candidateButton.style.borderRadius = "14px";
      candidateButton.style.background = "rgba(159, 227, 140, 0.14)";
      candidateButton.style.color = "#f4f8ff";
      candidateButton.style.fontWeight = "700";
      candidateButton.style.cursor = "pointer";
      candidateButton.style.maxWidth = "220px";
      candidateButton.title = `${candidate.roots.join("/")} roots | Grades: ${candidate.affinityGrades.join(", ")}`;
      candidateButton.addEventListener("click", () => startCandidateRun(seed, candidate));
      buttonRow.appendChild(candidateButton);
    }

    status.textContent = "Choose a Cultivator Candidate. Roots and grade labels are visible; exact affinities stay hidden.";
  };

  const renderButtons = (): void => {
    buttonRow.replaceChildren();

    if (pendingCandidateSeed !== null) {
      renderCandidateButtons(pendingCandidateSeed);
      return;
    }

    const activeRun = loadActiveRun(window.localStorage);
    const profile = loadProfileRecord(window.localStorage) ?? createProfileRecord();
    if (!loadProfileRecord(window.localStorage)) {
      saveProfileRecord(window.localStorage, profile);
    }
    const showContinue = activeRun !== null;

    if (awaitingAbandonConfirmation) {
      const confirmButton = document.createElement("button");
      confirmButton.type = "button";
      confirmButton.textContent = "Confirm Abandon Run";
      confirmButton.style.padding = "12px 18px";
      confirmButton.style.border = "0";
      confirmButton.style.borderRadius = "999px";
      confirmButton.style.background = "#ff8d8d";
      confirmButton.style.color = "#081019";
      confirmButton.style.fontWeight = "700";
      confirmButton.style.cursor = "pointer";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = "Cancel";
      cancelButton.style.padding = "12px 18px";
      cancelButton.style.border = "0";
      cancelButton.style.borderRadius = "999px";
      cancelButton.style.background = "#8ecae6";
      cancelButton.style.color = "#081019";
      cancelButton.style.fontWeight = "700";
      cancelButton.style.cursor = "pointer";

      confirmButton.addEventListener("click", () => {
        clearActiveRun(window.localStorage);
        awaitingAbandonConfirmation = false;
        pendingCandidateSeed = generateSeed();
        renderButtons();
      });

      cancelButton.addEventListener("click", () => {
        awaitingAbandonConfirmation = false;
        renderButtons();
      });

      buttonRow.append(confirmButton, cancelButton);
      status.textContent = "Abandon the active Run before starting a new one.";
      return;
    }

    if (showContinue) {
      buttonRow.appendChild(continueButton);
      status.textContent = `An active Run is saved and ready to continue. Completion record: ${profile.completedRuns}.`;
    } else {
      status.textContent = `No active Run found. Completion record: ${profile.completedRuns}.`;
    }

    buttonRow.appendChild(startButton);
  };

  startButton.addEventListener("click", () => {
    if (hasActiveRun(window.localStorage)) {
      awaitingAbandonConfirmation = true;
      renderButtons();
      return;
    }

    const save = createActiveRunSave(generateSeed());
    pendingCandidateSeed = save.seed;
    renderButtons();
  });

  continueButton.addEventListener("click", () => {
    const save = loadActiveRun(window.localStorage);
    if (!save) {
      status.textContent = "No active Run found. Start a new one.";
      return;
    }

    launchGame(container, save.seed);
  });

  renderButtons();
  panel.append(title, subtitle, description, buttonRow, status);
  shell.appendChild(panel);
  container.appendChild(shell);
}
