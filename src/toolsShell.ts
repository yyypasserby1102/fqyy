import { gongfaConfigs, type GongfaId, type GongfaPattern } from "./data/gongfa";
import { getGongfaPackage } from "./data/gongfaPackages";
import { firstSliceLinggenPool, linggenConfigs, type RootId } from "./data/linggen";
import {
  MAX_SPIRIT_TREASURE_SLOTS,
  spiritTreasureConfigs,
  type SpiritTreasureEffectKind
} from "./data/spiritTreasures";
import { stageConfigs, stageOrder } from "./data/stages";
import { upgradeConfigs } from "./data/upgrades";
import { masteryTransformationConfigs } from "./logic/mastery";
import {
  addGongfaToBuild,
  addTreasureToBuild,
  changeBuildLinggen,
  createToolsBuild,
  decodeToolsBuild,
  encodeToolsBuild,
  isGongfaCompatible,
  MAX_PLANNED_GONGFA,
  removeGongfaFromBuild,
  removeTreasureFromBuild,
  summarizeToolsBuild,
  type ToolsBuild
} from "./tools/buildPlanner";
import { gongfaVisualIdentities } from "./visual/gongfaVisualIdentity";
import "./toolsShell.css";

type ToolsView = "compendium" | "planner" | "treasures";
const STORAGE_KEY = "fqyy.tools.build.v1";

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string | number
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}

function gongfaSeal(gongfaId: GongfaId, compact = false): HTMLDivElement {
  const identity = gongfaVisualIdentities[gongfaId];
  const seal = element("div", `tools-seal tools-seal--${identity.geometry}${compact ? " tools-seal--compact" : ""}`);
  seal.style.setProperty("--seal-accent", `#${identity.accent.toString(16).padStart(6, "0")}`);
  seal.style.setProperty("--seal-secondary", `#${identity.secondary.toString(16).padStart(6, "0")}`);
  seal.setAttribute("aria-hidden", "true");
  seal.append(element("i"), element("b"));
  return seal;
}

function formatEffect(effect: SpiritTreasureEffectKind, value: number): string {
  const labels: Record<SpiritTreasureEffectKind, string> = {
    maxHealth: "Maximum vitality",
    moveSpeed: "Movement speed",
    magnetRadius: "Qi attraction radius",
    mitigation: "Damage mitigation"
  };
  const display = effect === "mitigation" ? `${Math.round(value * 100)}%` : `+${value}`;
  return `${labels[effect] ?? effect} · ${display}`;
}

function humanize(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readSharedBuild(): ToolsBuild {
  const [, query = ""] = window.location.hash.split("?");
  if (query) return decodeToolsBuild(query);
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? decodeToolsBuild(saved) : createToolsBuild();
  } catch {
    return createToolsBuild();
  }
}

export function mountToolsShell(container: HTMLElement): void {
  let view: ToolsView = window.location.hash.startsWith("#tools/planner")
    ? "planner"
    : window.location.hash.startsWith("#tools/treasures")
      ? "treasures"
      : "compendium";
  let build = readSharedBuild();
  let selectedGongfaId = build.gongfaIds[0] ?? ("yujian-jue" as GongfaId);
  let rootFilter: RootId | "all" = "all";
  let patternFilter: GongfaPattern | "all" = "all";
  let statusMessage = "";

  const root = element("div", "tools-shell");
  root.dataset.surface = "fqyy-tools";
  container.replaceChildren(root);

  const setView = (next: ToolsView): void => {
    view = next;
    const suffix = next === "planner" ? `?${encodeToolsBuild(build)}` : "";
    window.history.replaceState(null, "", `#tools/${next}${suffix}`);
    render();
  };

  const renderHeader = (): HTMLElement => {
    const header = element("header", "tools-header");
    const brand = element("div", "tools-brand");
    brand.append(element("span", "tools-brand__mark", "FQYY"), element("span", "tools-brand__name", "Cultivator Tools"));
    const nav = element("nav", "tools-nav");
    nav.setAttribute("aria-label", "Tools sections");
    for (const [id, label] of [["compendium", "Gongfa"], ["planner", "Build Planner"], ["treasures", "Treasures"]] as const) {
      const button = element("button", "tools-nav__button", label);
      button.type = "button";
      button.dataset.active = String(view === id);
      button.addEventListener("click", () => setView(id));
      nav.append(button);
    }
    const gameLink = element("a", "tools-game-link", "← Return to Game");
    gameLink.href = "#game";
    header.append(brand, nav, gameLink);
    return header;
  };

  const renderDetail = (gongfaId: GongfaId): HTMLElement => {
    const config = gongfaConfigs[gongfaId];
    const packageInfo = getGongfaPackage(gongfaId);
    const identity = gongfaVisualIdentities[gongfaId];
    const panel = element("aside", "tools-detail");
    panel.dataset.gongfaDetail = gongfaId;
    const head = element("div", "tools-detail__head");
    head.append(gongfaSeal(gongfaId), element("div"));
    const headingCopy = head.lastElementChild as HTMLElement;
    headingCopy.append(
      element("p", "tools-kicker", `${config.requiredRoots.join(" + ")} · ${config.pattern}`),
      element("h2", "", config.name),
      element("p", "tools-detail__role", packageInfo.combatRole)
    );
    panel.append(head);

    const skillGrid = element("div", "tools-skill-grid");
    const skills = [
      ["Skill 1", packageInfo.skill1.name, packageInfo.skill1.description, packageInfo.skill1.tags],
      [`Passive · ${packageInfo.passive.resource}`, packageInfo.passive.name, packageInfo.passive.description, []],
      ["Skill 2 · Rank 10", packageInfo.skill2.name, packageInfo.skill2.description, packageInfo.skill2.tags]
    ] as const;
    for (const [kind, name, description, tags] of skills) {
      const card = element("article", "tools-skill-card");
      card.append(element("span", "tools-kicker", kind), element("h3", "", name));
      if (tags.length) card.append(element("p", "tools-tags", tags.map((tag) => `#${tag}`).join("  ")));
      card.append(element("p", "", description));
      skillGrid.append(card);
    }
    panel.append(skillGrid);

    const stats = element("section", "tools-detail__section");
    stats.append(element("h3", "", "Canonical Stage Foundations"));
    const stageGrid = element("div", "tools-stage-grid");
    for (const [stageIndex, stageId] of stageOrder.entries()) {
      const authoredStage = config.stages[stageId];
      const stage = authoredStage ?? stageOrder
        .slice(0, stageIndex)
        .reverse()
        .map((previousId) => config.stages[previousId])
        .find((candidate) => candidate !== undefined);
      if (!stage) continue;
      const card = element("article", "tools-stage-card");
      card.append(element("h4", "", stageConfigs[stageId].name));
      if (!authoredStage) card.append(element("small", "tools-stage-card__inheritance", "Inherited foundation"));
      const values: Array<[string, string | number]> = [
        ["Damage", stage.damage], ["Cadence", `${stage.cooldownMs}ms`], ["Count", stage.count], ["Pierce", stage.pierce]
      ];
      if (config.pattern === "homing") values.push(["Speed", stage.projectileSpeed], ["Lifetime", `${stage.projectileLifetimeMs}ms`], ["Spread", `${stage.spreadDeg}°`]);
      if (config.pattern === "wave") values.push(["Range", stage.range], ["Spread", `${stage.spreadDeg}°`], ["Returns", stage.returnShots]);
      if (config.pattern === "aura") values.push(["Aura", stage.auraRadius], ["Retaliate", stage.retaliationDamage], ["Shells", stage.shellBursts]);
      for (const [label, value] of values) {
        const stat = element("div", "tools-stat");
        stat.append(element("span", "", label), element("strong", "", value));
        card.append(stat);
      }
      stageGrid.append(card);
    }
    stats.append(stageGrid);
    panel.append(stats);

    const refinements = upgradeConfigs.filter((item) => item.requiredGongfaIds?.includes(gongfaId) && item.category !== "legacy");
    const mastery = element("section", "tools-detail__section");
    mastery.append(element("h3", "", `Mastery Pool · ${refinements.length} Refinements`));
    const rows = element("div", "tools-refinement-list");
    for (const item of refinements) {
      const row = element("div", "tools-refinement");
      row.append(
        element("span", `tools-pill tools-pill--${item.category}`, item.category.toUpperCase()),
        element("strong", "", item.name),
        element("p", "", item.lore),
        element("small", "", `${item.scope} · ${humanize(item.effect)} ${item.value} · ${item.maxSelections ?? 1} tiers${item.unlockRank ? ` · Rank ${item.unlockRank}` : ""}`)
      );
      rows.append(row);
    }
    mastery.append(rows);
    panel.append(mastery);

    const transformations = masteryTransformationConfigs.filter((item) => item.requiredGongfaIds?.includes(gongfaId));
    const transform = element("section", "tools-detail__section");
    transform.append(element("h3", "", "Mastery Transformations"));
    const groups = element("div", "tools-transform-groups");
    for (const rank of [3, 6, 9]) {
      const group = element("div", "tools-transform-group");
      group.append(element("span", "tools-kicker", `Rank ${rank}`));
      for (const item of transformations.filter((candidate) => candidate.milestoneRank === rank)) {
        const choice = element("article");
        choice.append(element("strong", "", item.name), element("p", "", item.lore));
        group.append(choice);
      }
      groups.append(group);
    }
    transform.append(groups);
    panel.append(transform, element("p", "tools-motif-note", `${identity.label} · ${identity.trailStyle}`));
    return panel;
  };

  const renderCompendium = (): HTMLElement => {
    const page = element("main", "tools-page");
    const hero = element("section", "tools-hero");
    const copy = element("div");
    copy.append(element("p", "tools-kicker", "Canonical Game Database"), element("h1", "", "Gongfa Compendium"), element("p", "", "Explore every cultivation path, active Skill, passive engine, Mastery Refinement, and Mastery Transformation."));
    const metrics = element("div", "tools-metrics");
    for (const [value, label] of [[Object.keys(gongfaConfigs).length, "Gongfa"], [upgradeConfigs.filter((item) => item.category !== "legacy").length, "Refinements"], [masteryTransformationConfigs.length, "Transformations"]]) {
      const metric = element("div"); metric.append(element("strong", "", String(value)), element("span", "", label)); metrics.append(metric);
    }
    hero.append(copy, metrics);
    page.append(hero);

    const filters = element("section", "tools-filters");
    const search = element("input", "tools-search") as HTMLInputElement;
    search.type = "search";
    search.placeholder = "Search Gongfa, Skill, passive, tag…";
    search.setAttribute("aria-label", "Search Gongfa");
    const rootButtons = element("div", "tools-filter-group");
    for (const rootId of ["all", "fire", "water", "metal", "wood"] as const) {
      const button = element("button", "tools-chip", rootId === "all" ? "All Roots" : rootId);
      button.type = "button";
      button.dataset.active = String(rootFilter === rootId);
      button.addEventListener("click", () => { rootFilter = rootId; render(); });
      rootButtons.append(button);
    }
    const pattern = element("select", "tools-select") as HTMLSelectElement;
    pattern.setAttribute("aria-label", "Filter by combat pattern");
    for (const value of ["all", "homing", "wave", "aura"] as const) {
      const option = element("option", "", value === "all" ? "All Patterns" : value);
      option.value = value;
      option.selected = patternFilter === value;
      pattern.append(option);
    }
    pattern.addEventListener("change", () => { patternFilter = pattern.value as GongfaPattern | "all"; render(); });
    filters.append(search, rootButtons, pattern);
    page.append(filters);

    const workspace = element("section", "tools-workspace");
    const list = element("div", "tools-gongfa-list");
    const cards: HTMLElement[] = [];
    for (const config of Object.values(gongfaConfigs)) {
      if (rootFilter !== "all" && !config.requiredRoots.includes(rootFilter)) continue;
      if (patternFilter !== "all" && config.pattern !== patternFilter) continue;
      const packageInfo = getGongfaPackage(config.id);
      const searchableRefinements = upgradeConfigs.filter((item) => item.requiredGongfaIds?.includes(config.id));
      const searchableTransformations = masteryTransformationConfigs.filter((item) => item.requiredGongfaIds?.includes(config.id));
      const card = element("button", "tools-gongfa-card") as HTMLButtonElement;
      card.type = "button";
      card.dataset.selected = String(selectedGongfaId === config.id);
      card.dataset.search = [
        config.name,
        config.lore,
        packageInfo.combatRole,
        packageInfo.skill1.name,
        packageInfo.skill1.description,
        packageInfo.skill1.tags.join(" "),
        packageInfo.skill2.name,
        packageInfo.skill2.description,
        packageInfo.skill2.tags.join(" "),
        packageInfo.passive.name,
        packageInfo.passive.description,
        ...searchableRefinements.flatMap((item) => [item.name, item.lore, item.scope]),
        ...searchableTransformations.flatMap((item) => [item.name, item.lore])
      ].join(" ").toLowerCase();
      card.append(gongfaSeal(config.id, true));
      const body = element("span", "tools-gongfa-card__body");
      body.append(element("span", "tools-kicker", `${config.requiredRoots.join(" + ")} · ${config.pattern}`), element("strong", "", config.name), element("small", "", packageInfo.combatRole));
      card.append(body, element("span", "tools-gongfa-card__arrow", "›"));
      card.addEventListener("click", () => { selectedGongfaId = config.id; render(); });
      cards.push(card);
      list.append(card);
    }
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      cards.forEach((card) => { card.hidden = !card.dataset.search?.includes(query); });
    });
    workspace.append(list, renderDetail(selectedGongfaId));
    page.append(workspace);
    return page;
  };

  const renderPlanner = (): HTMLElement => {
    const page = element("main", "tools-page tools-page--planner");
    const hero = element("section", "tools-hero tools-hero--compact");
    const copy = element("div");
    copy.append(element("p", "tools-kicker", "Cultivation Loadout Lab"), element("h1", "", "Build Planner"), element("p", "", "Choose an innate Linggen, plan four cumulative Gongfa, and prepare three Spirit Treasures."));
    const actions = element("div", "tools-planner-actions");
    const save = element("button", "tools-action", "Save Build"); save.type = "button";
    save.addEventListener("click", () => { window.localStorage.setItem(STORAGE_KEY, encodeToolsBuild(build)); statusMessage = "Build saved in this browser."; render(); });
    const share = element("button", "tools-action tools-action--gold", "Copy Share Link"); share.type = "button";
    share.addEventListener("click", async () => {
      const url = `${window.location.origin}${window.location.pathname}#tools/planner?${encodeToolsBuild(build)}`;
      window.history.replaceState(null, "", url);
      try { await navigator.clipboard.writeText(url); statusMessage = "Share link copied."; }
      catch { statusMessage = "Share link placed in the address bar."; }
      render();
    });
    actions.append(save, share);
    hero.append(copy, actions);
    page.append(hero);

    if (statusMessage) page.append(element("p", "tools-status", statusMessage));
    const layout = element("div", "tools-planner-layout");
    const editor = element("div", "tools-planner-editor");

    const identitySection = element("section", "tools-builder-section");
    identitySection.append(element("span", "tools-step", "01"), element("h2", "", "Cultivator Foundation"));
    const name = element("input", "tools-build-name") as HTMLInputElement;
    name.value = build.name;
    name.maxLength = 64;
    name.setAttribute("aria-label", "Build name");
    name.addEventListener("input", () => { build = { ...build, name: name.value || "Untitled Cultivation" }; });
    const linggenGrid = element("div", "tools-linggen-grid");
    for (const linggenId of firstSliceLinggenPool) {
      const config = linggenConfigs[linggenId];
      const button = element("button", "tools-linggen-card") as HTMLButtonElement;
      button.type = "button";
      button.dataset.selected = String(build.linggenId === linggenId);
      button.append(element("strong", "", config.name), element("span", "", config.roots.join(" + ")), element("small", "", config.lore));
      button.addEventListener("click", () => { build = changeBuildLinggen(build, linggenId); render(); });
      linggenGrid.append(button);
    }
    identitySection.append(name, linggenGrid);
    editor.append(identitySection);

    const gongfaSection = element("section", "tools-builder-section");
    gongfaSection.append(element("span", "tools-step", "02"), element("h2", "", `Gongfa Sequence · ${build.gongfaIds.length}/${MAX_PLANNED_GONGFA}`));
    const slots = element("div", "tools-build-slots");
    for (let index = 0; index < MAX_PLANNED_GONGFA; index += 1) {
      const id = build.gongfaIds[index];
      const slot = element("div", `tools-build-slot${id ? " tools-build-slot--filled" : ""}`);
      if (id) {
        slot.append(gongfaSeal(id, true), element("span", "", gongfaConfigs[id].name));
        const remove = element("button", "", "×"); remove.type = "button"; remove.setAttribute("aria-label", `Remove ${gongfaConfigs[id].name}`);
        remove.addEventListener("click", () => { build = removeGongfaFromBuild(build, id); render(); }); slot.append(remove);
      } else slot.append(element("span", "", `Stage slot ${index + 1}`));
      slots.append(slot);
    }
    const compatible = element("div", "tools-choice-grid");
    for (const config of Object.values(gongfaConfigs)) {
      const allowed = isGongfaCompatible(build.linggenId, config.id);
      const selected = build.gongfaIds.includes(config.id);
      const button = element("button", "tools-choice-card") as HTMLButtonElement;
      button.type = "button"; button.disabled = !allowed || (build.gongfaIds.length >= MAX_PLANNED_GONGFA && !selected); button.dataset.selected = String(selected);
      button.append(gongfaSeal(config.id, true), element("strong", "", config.name), element("small", "", allowed ? getGongfaPackage(config.id).combatRole : `Requires ${config.requiredRoots.join(" + ")}`));
      button.addEventListener("click", () => { build = selected ? removeGongfaFromBuild(build, config.id) : addGongfaToBuild(build, config.id); render(); });
      compatible.append(button);
    }
    gongfaSection.append(slots, compatible);
    editor.append(gongfaSection);

    const treasureSection = element("section", "tools-builder-section");
    treasureSection.append(element("span", "tools-step", "03"), element("h2", "", `Spirit Treasures · ${build.treasureIds.length}/${MAX_SPIRIT_TREASURE_SLOTS}`));
    const treasureChoices = element("div", "tools-treasure-choice-grid");
    for (const treasure of Object.values(spiritTreasureConfigs)) {
      const selected = build.treasureIds.includes(treasure.id);
      const button = element("button", "tools-treasure-choice") as HTMLButtonElement;
      button.type = "button"; button.dataset.selected = String(selected); button.disabled = build.treasureIds.length >= MAX_SPIRIT_TREASURE_SLOTS && !selected;
      button.append(element("span", "tools-treasure-gem", "◇"), element("strong", "", treasure.name), element("small", "", formatEffect(treasure.effect, treasure.value)));
      button.addEventListener("click", () => { build = selected ? removeTreasureFromBuild(build, treasure.id) : addTreasureToBuild(build, treasure.id); render(); });
      treasureChoices.append(button);
    }
    treasureSection.append(treasureChoices);
    editor.append(treasureSection);

    const summary = summarizeToolsBuild(build);
    const aside = element("aside", "tools-build-summary");
    aside.append(element("p", "tools-kicker", "Live Build Identity"), element("h2", "", build.name));
    const summaryLinggen = element("div", "tools-summary-linggen");
    summaryLinggen.append(element("span", "", linggenConfigs[build.linggenId].name), element("strong", "", summary.roots.join(" + ")));
    aside.append(summaryLinggen);
    const summarySlots = element("div", "tools-summary-paths");
    build.gongfaIds.forEach((id, index) => {
      const row = element("div"); row.append(element("span", "", `0${index + 1}`), gongfaSeal(id, true), element("strong", "", gongfaConfigs[id].name)); summarySlots.append(row);
    });
    if (!build.gongfaIds.length) summarySlots.append(element("p", "tools-empty", "Choose a Gongfa to reveal this build's identity."));
    aside.append(summarySlots);
    const identity = element("section", "tools-summary-section");
    identity.append(element("h3", "", "Combat Language"), element("p", "tools-tags", [...summary.patterns, ...summary.tags].map((tag) => `#${tag}`).join("  ") || "No Skills selected"));
    aside.append(identity);
    const skillList = element("section", "tools-summary-section");
    skillList.append(element("h3", "", "Planned Skills"));
    const list = element("ol"); summary.skillNames.forEach((skill) => list.append(element("li", "", skill))); skillList.append(list);
    aside.append(skillList);
    const synergyList = element("section", "tools-summary-section tools-summary-synergies");
    synergyList.append(element("h3", "", "Synergy Readout"));
    if (!summary.synergies.length) synergyList.append(element("p", "tools-empty", "Add a second Gongfa or a supporting Treasure to reveal build relationships."));
    summary.synergies.forEach((synergy) => {
      const item = element("article");
      item.append(element("strong", "", synergy.title), element("p", "", synergy.description));
      synergyList.append(item);
    });
    if (summary.treasureNames.length) synergyList.append(element("p", "tools-summary-treasures", `Run-bound support · ${summary.treasureNames.join(" · ")}`));
    aside.append(synergyList);
    layout.append(editor, aside);
    page.append(layout);
    return page;
  };

  const renderTreasures = (): HTMLElement => {
    const page = element("main", "tools-page");
    const hero = element("section", "tools-hero tools-hero--compact");
    const copy = element("div"); copy.append(element("p", "tools-kicker", "World Relics"), element("h1", "", "Spirit Treasure Archive"), element("p", "", `Compare every Run-bound treasure before deciding which ${MAX_SPIRIT_TREASURE_SLOTS} deserve a place in your Run.`)); hero.append(copy);
    page.append(hero);
    const grid = element("section", "tools-treasure-grid");
    for (const treasure of Object.values(spiritTreasureConfigs)) {
      const card = element("article", "tools-treasure-card");
      card.append(element("span", "tools-treasure-gem tools-treasure-gem--large", "◇"), element("p", "tools-kicker", treasure.effect), element("h2", "", treasure.name), element("strong", "tools-treasure-effect", formatEffect(treasure.effect, treasure.value)), element("p", "", treasure.lore));
      const plan = element("button", "tools-action", "Plan with this Treasure"); plan.type = "button";
      plan.addEventListener("click", () => { build = addTreasureToBuild(build, treasure.id); setView("planner"); }); card.append(plan); grid.append(card);
    }
    page.append(grid);
    return page;
  };

  const render = (): void => {
    root.replaceChildren(renderHeader(), view === "compendium" ? renderCompendium() : view === "planner" ? renderPlanner() : renderTreasures());
  };

  render();
}
