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
import titleMountainsUrl from "../assets/environment/export/title-mountains.png";

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

async function launchGame(container: HTMLElement, seed: number): Promise<void> {
  clearElement(container);
  const loading = document.createElement("div");
  loading.className = "run-shell run-shell--loading";
  loading.setAttribute("role", "status");
  loading.setAttribute("aria-live", "polite");
  loading.textContent = "Entering the cultivation arena…";
  container.appendChild(loading);
  setRandomSeed(seed);
  try {
    const { createGame } = await import("./game");
    clearElement(container);
    createGame(container);
  } catch (error) {
    loading.classList.add("run-shell--error");
    loading.textContent = "The arena could not be entered. Reload and try again.";
    console.error(error);
  }
}

export function mountRunShell(container: HTMLElement): void {
  clearElement(container);

  let awaitingAbandonConfirmation = false;
  let pendingCandidateSeed: number | null = null;

  const shell = document.createElement("div");
  shell.className = "run-shell";
  shell.dataset.visualTheme = "cultivation-scroll";
  shell.dataset.mode = "title";
  shell.style.setProperty("--title-mountains", `url(${titleMountainsUrl})`);

  const panel = document.createElement("div");
  panel.className = "run-shell__panel";

  const eyebrow = document.createElement("p");
  eyebrow.className = "run-shell__eyebrow";
  eyebrow.textContent = "Fate · Cultivation · Ascension";

  const title = document.createElement("h1");
  title.className = "run-shell__title";
  title.textContent = "FQYY";

  const subtitle = document.createElement("p");
  subtitle.className = "run-shell__subtitle";
  subtitle.textContent = "A Cultivation Journey";

  const rule = document.createElement("div");
  rule.className = "run-shell__rule";
  rule.setAttribute("aria-hidden", "true");
  rule.textContent = "◇";

  const selectionTitle = document.createElement("h2");
  selectionTitle.className = "run-shell__selection-title";
  selectionTitle.textContent = "Choose Your Cultivator";
  selectionTitle.hidden = true;

  const description = document.createElement("p");
  description.className = "run-shell__description";
  description.textContent =
    "Choose a fate, awaken your Linggen, and cultivate from Mortal breath to the edge of the heavens.";

  const buttonRow = document.createElement("div");
  buttonRow.className = "run-shell__actions";

  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.textContent = "Start New Run";
  startButton.className = "run-shell__button run-shell__button--primary";

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.textContent = "Continue";
  continueButton.className = "run-shell__button";

  const status = document.createElement("p");
  status.className = "run-shell__status";

  const startCandidateRun = (seed: number, candidate: CultivatorCandidate): void => {
    const save = createActiveRunSave(seed, Date.now(), candidate.linggenId);
    saveActiveRun(window.localStorage, save);
    void launchGame(container, save.seed);
  };

  const renderCandidateButtons = (seed: number): void => {
    shell.dataset.mode = "candidates";
    selectionTitle.hidden = false;
    buttonRow.replaceChildren();
    buttonRow.className = "candidate-grid";
    buttonRow.setAttribute("role", "group");
    buttonRow.setAttribute("aria-label", "Choose Cultivator Candidate");
    const candidates = getCultivatorCandidates(seed);

    for (const [index, candidate] of candidates.entries()) {
      const candidateButton = document.createElement("button");
      candidateButton.type = "button";
      candidateButton.className = "candidate-card";
      candidateButton.setAttribute(
        "aria-label",
        `Choose ${candidate.name}: ${candidate.linggenName}`
      );
      candidateButton.style.setProperty(
        "--candidate-accent",
        ["#79d7c8", "#86bcec", "#d3ad6a"][index] ?? "#79d7c8"
      );
      candidateButton.title = `${candidate.roots.join("/")} roots | Grades: ${candidate.affinityGrades.join(", ")}`;

      const indexLabel = document.createElement("span");
      indexLabel.className = "candidate-card__index";
      indexLabel.textContent = `Cultivator ${String(index + 1).padStart(2, "0")}`;
      const name = document.createElement("span");
      name.className = "candidate-card__name";
      name.textContent = candidate.name;
      const linggen = document.createElement("span");
      linggen.className = "candidate-card__linggen";
      linggen.textContent = candidate.linggenName;
      const roots = document.createElement("span");
      roots.className = "candidate-card__roots";
      candidate.roots.forEach((root) => {
        const badge = document.createElement("span");
        badge.className = `candidate-card__root candidate-card__root--${root}`;
        badge.textContent = `${root.charAt(0).toUpperCase()}${root.slice(1)} Root`;
        roots.appendChild(badge);
      });
      const grades = document.createElement("span");
      grades.className = "candidate-card__grades";
      candidate.roots.forEach((root, rootIndex) => {
        const grade = document.createElement("span");
        grade.className = "candidate-card__grade";
        const rootName = `${root.charAt(0).toUpperCase()}${root.slice(1)} Affinity`;
        grade.innerHTML = `<span>${rootName}</span><strong>${candidate.affinityGrades[rootIndex]}</strong>`;
        grades.appendChild(grade);
      });
      const lore = document.createElement("span");
      lore.className = "candidate-card__lore";
      lore.textContent = candidate.lore;
      const choose = document.createElement("span");
      choose.className = "candidate-card__choose";
      choose.textContent = "Choose this fate →";
      candidateButton.append(indexLabel, name, linggen, roots, grades, lore, choose);
      candidateButton.addEventListener("click", () => startCandidateRun(seed, candidate));
      buttonRow.appendChild(candidateButton);
    }

    description.textContent =
      "Three fates answer the call. Their roots and qualitative Affinity Grades are known; exact strengths remain veiled.";
    status.textContent = "Your chosen Linggen is innate. The Lingcao will awaken it inside the arena.";
  };

  const renderButtons = (): void => {
    buttonRow.replaceChildren();
    buttonRow.className = "run-shell__actions";
    buttonRow.removeAttribute("role");
    buttonRow.removeAttribute("aria-label");
    shell.dataset.mode = "title";
    selectionTitle.hidden = true;
    description.textContent =
      "Choose a fate, awaken your Linggen, and cultivate from Mortal breath to the edge of the heavens.";

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
      confirmButton.className = "run-shell__button run-shell__button--danger";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = "Cancel";
      cancelButton.className = "run-shell__button";

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

    void launchGame(container, save.seed);
  });

  renderButtons();
  panel.append(eyebrow, title, subtitle, rule, selectionTitle, description, buttonRow, status);
  shell.appendChild(panel);
  container.appendChild(shell);
}
