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
import { getLocale, t } from "./i18n/runtime";
import { getChineseFontPreloadText, localizeLinggen, localizeTerm } from "./i18n/content";

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
  loading.textContent = t("run.loading");
  container.appendChild(loading);
  setRandomSeed(seed);
  try {
    await document.fonts.load('16px "Noto Sans SC Variable"', getChineseFontPreloadText());
    const { createGame } = await import("./game");
    clearElement(container);
    createGame(container);
  } catch (error) {
    loading.classList.add("run-shell--error");
    loading.textContent = t("run.loadError");
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
  eyebrow.textContent = t("run.eyebrow");

  const title = document.createElement("h1");
  title.className = "run-shell__title";
  title.textContent = t("run.brand");

  const subtitle = document.createElement("p");
  subtitle.className = "run-shell__subtitle";
  subtitle.textContent = t("run.subtitle");

  const rule = document.createElement("div");
  rule.className = "run-shell__rule";
  rule.setAttribute("aria-hidden", "true");
  rule.textContent = "◇";

  const selectionTitle = document.createElement("h2");
  selectionTitle.className = "run-shell__selection-title";
  selectionTitle.textContent = t("run.chooseCultivator");
  selectionTitle.hidden = true;

  const description = document.createElement("p");
  description.className = "run-shell__description";
  description.textContent = t("run.description");

  const buttonRow = document.createElement("div");
  buttonRow.className = "run-shell__actions";

  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.textContent = t("run.start");
  startButton.className = "run-shell__button run-shell__button--primary";

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.textContent = t("run.continue");
  continueButton.className = "run-shell__button";

  const toolsLink = document.createElement("a");
  toolsLink.href = "#tools/compendium";
  toolsLink.textContent = t("run.openTools");
  toolsLink.className = "run-shell__button run-shell__button--tools";

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
    buttonRow.setAttribute("aria-label", t("run.chooseCandidates"));
    const candidates = getCultivatorCandidates(seed);

    for (const [index, candidate] of candidates.entries()) {
      const locale = getLocale();
      const localizedLinggen = localizeLinggen(locale, candidate.linggenId);
      const candidateName = locale === "zh-CN" ? `候选者 ${index + 1}` : candidate.name;
      const candidateButton = document.createElement("button");
      candidateButton.type = "button";
      candidateButton.className = "candidate-card";
      candidateButton.setAttribute(
        "aria-label",
        t("run.chooseCandidate", { name: candidateName, linggen: localizedLinggen.name })
      );
      candidateButton.style.setProperty(
        "--candidate-accent",
        ["#79d7c8", "#86bcec", "#d3ad6a"][index] ?? "#79d7c8"
      );
      candidateButton.title = t("run.candidateTooltip", { roots: candidate.roots.map((root) => localizeTerm(locale, root)).join("/"), grades: candidate.affinityGrades.map((grade) => localizeTerm(locale, grade)).join(", ") });

      const indexLabel = document.createElement("span");
      indexLabel.className = "candidate-card__index";
      indexLabel.textContent = t("run.cultivatorIndex", { index: String(index + 1).padStart(2, "0") });
      const name = document.createElement("span");
      name.className = "candidate-card__name";
      name.textContent = candidateName;
      const linggen = document.createElement("span");
      linggen.className = "candidate-card__linggen";
      linggen.textContent = localizedLinggen.name;
      const roots = document.createElement("span");
      roots.className = "candidate-card__roots";
      candidate.roots.forEach((root) => {
        const badge = document.createElement("span");
        badge.className = `candidate-card__root candidate-card__root--${root}`;
        badge.textContent = t("run.root", { root: localizeTerm(locale, root) });
        roots.appendChild(badge);
      });
      const grades = document.createElement("span");
      grades.className = "candidate-card__grades";
      candidate.roots.forEach((root, rootIndex) => {
        const grade = document.createElement("span");
        grade.className = "candidate-card__grade";
        const rootName = t("run.affinity", { root: localizeTerm(locale, root) });
        grade.innerHTML = `<span>${rootName}</span><strong>${localizeTerm(locale, candidate.affinityGrades[rootIndex])}</strong>`;
        grades.appendChild(grade);
      });
      const lore = document.createElement("span");
      lore.className = "candidate-card__lore";
      lore.textContent = localizedLinggen.lore;
      const choose = document.createElement("span");
      choose.className = "candidate-card__choose";
      choose.textContent = t("run.chooseFate");
      candidateButton.append(indexLabel, name, linggen, roots, grades, lore, choose);
      candidateButton.addEventListener("click", () => startCandidateRun(seed, candidate));
      buttonRow.appendChild(candidateButton);
    }

    description.textContent = t("run.candidatesDescription");
    status.textContent = t("run.linggenInnate");
  };

  const renderButtons = (): void => {
    buttonRow.replaceChildren();
    buttonRow.className = "run-shell__actions";
    buttonRow.removeAttribute("role");
    buttonRow.removeAttribute("aria-label");
    shell.dataset.mode = "title";
    selectionTitle.hidden = true;
    description.textContent = t("run.description");

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
      confirmButton.textContent = t("run.confirmAbandon");
      confirmButton.className = "run-shell__button run-shell__button--danger";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = t("run.cancel");
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
      status.textContent = t("run.abandonFirst");
      return;
    }

    if (showContinue) {
      buttonRow.appendChild(continueButton);
      status.textContent = t("run.activeSaved", { record: t("run.completionRecord", { count: profile.completedRuns }) });
    } else {
      status.textContent = t("run.noActive", { record: t("run.completionRecord", { count: profile.completedRuns }) });
    }

    buttonRow.appendChild(startButton);
    buttonRow.appendChild(toolsLink);
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
      status.textContent = t("run.noActiveStart");
      return;
    }

    void launchGame(container, save.seed);
  });

  renderButtons();
  panel.append(eyebrow, title, subtitle, rule, selectionTitle, description, buttonRow, status);
  shell.appendChild(panel);
  container.appendChild(shell);
}
