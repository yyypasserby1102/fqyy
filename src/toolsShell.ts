import { gongfaConfigs, type GongfaId, type GongfaPattern } from "./data/gongfa";
import { firstSliceLinggenPool, type RootId } from "./data/linggen";
import {
  MAX_SPIRIT_TREASURE_SLOTS,
  spiritTreasureConfigs,
  type SpiritTreasureEffectKind
} from "./data/spiritTreasures";
import { stageOrder } from "./data/stages";
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
import { t } from "./i18n/runtime";
import { getLocale } from "./i18n/runtime";
import {
  localizeBuildSynergy,
  localizeGongfa,
  localizeGongfaPackage,
  localizeLinggen,
  localizeMasteryChoice,
  localizeSpiritTreasure,
  localizeStage,
  localizeTerm,
  localizeUpgrade
} from "./i18n/content";
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

function effectLabel(effect: SpiritTreasureEffectKind): string {
  const labels: Record<SpiritTreasureEffectKind, string> = {
    maxHealth: t("effect.maxHealth"),
    moveSpeed: t("effect.moveSpeed"),
    magnetRadius: t("effect.magnetRadius"),
    mitigation: t("effect.mitigation")
  };
  return labels[effect] ?? effect;
}

function formatEffect(effect: SpiritTreasureEffectKind, value: number): string {
  const display = effect === "mitigation" ? `${Math.round(value * 100)}%` : `+${value}`;
  return `${effectLabel(effect)} · ${display}`;
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
  const locale = getLocale();
  let view: ToolsView = window.location.hash.startsWith("#tools/planner")
    ? "planner"
    : window.location.hash.startsWith("#tools/treasures")
      ? "treasures"
      : "compendium";
  let build = readSharedBuild();
  const displayBuildName = (): string =>
    build.name === "Untitled Cultivation" ? t("tools.planner.untitled") : build.name;
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
    brand.append(element("span", "tools-brand__mark", "FQYY"), element("span", "tools-brand__name", t("tools.brand")));
    const nav = element("nav", "tools-nav");
    nav.setAttribute("aria-label", t("tools.sections"));
    for (const [id, label] of [["compendium", t("tools.nav.gongfa")], ["planner", t("tools.nav.planner")], ["treasures", t("tools.nav.treasures")]] as const) {
      const button = element("button", "tools-nav__button", label);
      button.type = "button";
      button.dataset.active = String(view === id);
      button.addEventListener("click", () => setView(id));
      nav.append(button);
    }
    const gameLink = element("a", "tools-game-link", t("tools.returnGame"));
    gameLink.href = "#game";
    header.append(brand, nav, gameLink);
    return header;
  };

  const renderDetail = (gongfaId: GongfaId): HTMLElement => {
    const config = localizeGongfa(locale, gongfaId);
    const packageInfo = localizeGongfaPackage(locale, gongfaId);
    const identity = gongfaVisualIdentities[gongfaId];
    const panel = element("aside", "tools-detail");
    panel.dataset.gongfaDetail = gongfaId;
    const head = element("div", "tools-detail__head");
    head.append(gongfaSeal(gongfaId), element("div"));
    const headingCopy = head.lastElementChild as HTMLElement;
    headingCopy.append(
      element("p", "tools-kicker", `${config.requiredRoots.map((root) => localizeTerm(locale, root)).join(" + ")} · ${localizeTerm(locale, config.pattern)}`),
      element("h2", "", config.name),
      element("p", "tools-detail__role", packageInfo.combatRole)
    );
    panel.append(head);

    const skillGrid = element("div", "tools-skill-grid");
    const skills = [
      [t("tools.skill1"), packageInfo.skill1.name, packageInfo.skill1.description, packageInfo.skill1.tags],
      [t("tools.passive", { resource: packageInfo.passive.resource }), packageInfo.passive.name, packageInfo.passive.description, []],
      [t("tools.skill2"), packageInfo.skill2.name, packageInfo.skill2.description, packageInfo.skill2.tags]
    ] as const;
    for (const [kind, name, description, tags] of skills) {
      const card = element("article", "tools-skill-card");
      card.append(element("span", "tools-kicker", kind), element("h3", "", name));
      if (tags.length) card.append(element("p", "tools-tags", tags.map((tag) => `#${localizeTerm(locale, tag)}`).join("  ")));
      card.append(element("p", "", description));
      skillGrid.append(card);
    }
    panel.append(skillGrid);

    const stats = element("section", "tools-detail__section");
    stats.append(element("h3", "", t("tools.stageFoundations")));
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
      card.append(element("h4", "", localizeStage(locale, stageId).name));
      if (!authoredStage) card.append(element("small", "tools-stage-card__inheritance", t("tools.inherited")));
      const values: Array<[string, string | number]> = [
        [localizeTerm(locale, "Damage"), stage.damage], [localizeTerm(locale, "Cadence"), `${stage.cooldownMs}ms`], [localizeTerm(locale, "Count"), stage.count], [localizeTerm(locale, "Pierce"), stage.pierce]
      ];
      if (config.pattern === "homing") values.push([localizeTerm(locale, "Speed"), stage.projectileSpeed], [localizeTerm(locale, "Lifetime"), `${stage.projectileLifetimeMs}ms`], [localizeTerm(locale, "Spread"), `${stage.spreadDeg}°`]);
      if (config.pattern === "wave") values.push([localizeTerm(locale, "Range"), stage.range], [localizeTerm(locale, "Spread"), `${stage.spreadDeg}°`], [localizeTerm(locale, "Returns"), stage.returnShots]);
      if (config.pattern === "aura") values.push([localizeTerm(locale, "Aura"), stage.auraRadius], [localizeTerm(locale, "Retaliate"), stage.retaliationDamage], [localizeTerm(locale, "Shells"), stage.shellBursts]);
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
    mastery.append(element("h3", "", t("tools.masteryPool", { count: refinements.length })));
    const rows = element("div", "tools-refinement-list");
    for (const sourceItem of refinements) {
      const item = localizeUpgrade(locale, sourceItem.id);
      const row = element("div", "tools-refinement");
      row.append(
        element("span", `tools-pill tools-pill--${item.category}`, localizeTerm(locale, item.category).toUpperCase()),
        element("strong", "", item.name),
        element("p", "", item.lore),
        element("small", "", locale === "zh-CN"
          ? `${item.scope} · 最多 ${item.maxSelections ?? 1} 层${item.unlockRank ? ` · 第 ${item.unlockRank} 重后可得` : ""}`
          : `${item.scope} · ${humanize(item.effect)} ${item.value} · ${item.maxSelections ?? 1} tiers${item.unlockRank ? ` · Rank ${item.unlockRank}` : ""}`)
      );
      rows.append(row);
    }
    mastery.append(rows);
    panel.append(mastery);

    const transformations = masteryTransformationConfigs.filter((item) => item.requiredGongfaIds?.includes(gongfaId));
    const transform = element("section", "tools-detail__section");
    transform.append(element("h3", "", t("tools.transformations")));
    const groups = element("div", "tools-transform-groups");
    for (const rank of [3, 6, 9]) {
      const group = element("div", "tools-transform-group");
      group.append(element("span", "tools-kicker", t("tools.rank", { rank })));
      for (const sourceItem of transformations.filter((candidate) => candidate.milestoneRank === rank)) {
        const item = localizeMasteryChoice(locale, sourceItem.id);
        const choice = element("article");
        choice.append(element("strong", "", item.name), element("p", "", item.lore));
        group.append(choice);
      }
      groups.append(group);
    }
    transform.append(groups);
    panel.append(transform, element("p", "tools-motif-note", locale === "zh-CN" ? "功法印记 · 灵力轨迹" : `${identity.label} · ${identity.trailStyle}`));
    return panel;
  };

  const renderCompendium = (): HTMLElement => {
    const page = element("main", "tools-page");
    const hero = element("section", "tools-hero");
    const copy = element("div");
    copy.append(element("p", "tools-kicker", t("tools.compendium.kicker")), element("h1", "", t("tools.compendium.title")), element("p", "", t("tools.compendium.description")));
    const metrics = element("div", "tools-metrics");
    for (const [value, label] of [[Object.keys(gongfaConfigs).length, t("tools.metric.gongfa")], [upgradeConfigs.filter((item) => item.category !== "legacy").length, t("tools.metric.refinements")], [masteryTransformationConfigs.length, t("tools.metric.transformations")]]) {
      const metric = element("div"); metric.append(element("strong", "", String(value)), element("span", "", label)); metrics.append(metric);
    }
    hero.append(copy, metrics);
    page.append(hero);

    const filters = element("section", "tools-filters");
    const search = element("input", "tools-search") as HTMLInputElement;
    search.type = "search";
    search.placeholder = t("tools.search.placeholder");
    search.setAttribute("aria-label", t("tools.search.label"));
    const rootButtons = element("div", "tools-filter-group");
    for (const rootId of ["all", "fire", "water", "metal", "wood"] as const) {
      const button = element("button", "tools-chip", rootId === "all" ? t("tools.filter.allRoots") : localizeTerm(locale, rootId));
      button.type = "button";
      button.dataset.active = String(rootFilter === rootId);
      button.addEventListener("click", () => { rootFilter = rootId; render(); });
      rootButtons.append(button);
    }
    const pattern = element("select", "tools-select") as HTMLSelectElement;
    pattern.setAttribute("aria-label", t("tools.filter.pattern"));
    for (const value of ["all", "homing", "wave", "aura"] as const) {
      const option = element("option", "", value === "all" ? t("tools.filter.allPatterns") : localizeTerm(locale, value));
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
    for (const sourceConfig of Object.values(gongfaConfigs)) {
      const config = localizeGongfa(locale, sourceConfig.id);
      if (rootFilter !== "all" && !config.requiredRoots.includes(rootFilter)) continue;
      if (patternFilter !== "all" && config.pattern !== patternFilter) continue;
      const packageInfo = localizeGongfaPackage(locale, config.id);
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
        ...searchableRefinements.flatMap((item) => {
          const localized = localizeUpgrade(locale, item.id);
          return [item.name, item.lore, item.scope, localized.name, localized.lore, localized.scope];
        }),
        ...searchableTransformations.flatMap((item) => {
          const localized = localizeMasteryChoice(locale, item.id);
          return [item.name, item.lore, localized.name, localized.lore];
        })
      ].join(" ").toLowerCase();
      card.append(gongfaSeal(config.id, true));
      const body = element("span", "tools-gongfa-card__body");
      body.append(element("span", "tools-kicker", `${config.requiredRoots.map((root) => localizeTerm(locale, root)).join(" + ")} · ${localizeTerm(locale, config.pattern)}`), element("strong", "", config.name), element("small", "", packageInfo.combatRole));
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
    copy.append(element("p", "tools-kicker", t("tools.planner.kicker")), element("h1", "", t("tools.planner.title")), element("p", "", t("tools.planner.description")));
    const actions = element("div", "tools-planner-actions");
    const save = element("button", "tools-action", t("tools.planner.save")); save.type = "button";
    save.addEventListener("click", () => { window.localStorage.setItem(STORAGE_KEY, encodeToolsBuild(build)); statusMessage = t("tools.planner.saved"); render(); });
    const share = element("button", "tools-action tools-action--gold", t("tools.planner.share")); share.type = "button";
    share.addEventListener("click", async () => {
      const url = `${window.location.origin}${window.location.pathname}#tools/planner?${encodeToolsBuild(build)}`;
      window.history.replaceState(null, "", url);
      try { await navigator.clipboard.writeText(url); statusMessage = t("tools.planner.copied"); }
      catch { statusMessage = t("tools.planner.addressBar"); }
      render();
    });
    actions.append(save, share);
    hero.append(copy, actions);
    page.append(hero);

    if (statusMessage) page.append(element("p", "tools-status", statusMessage));
    const layout = element("div", "tools-planner-layout");
    const editor = element("div", "tools-planner-editor");

    const identitySection = element("section", "tools-builder-section");
    identitySection.append(element("span", "tools-step", "01"), element("h2", "", t("tools.planner.foundation")));
    const name = element("input", "tools-build-name") as HTMLInputElement;
    name.value = build.name === "Untitled Cultivation" ? "" : build.name;
    name.placeholder = t("tools.planner.untitled");
    name.maxLength = 64;
    name.setAttribute("aria-label", t("tools.planner.buildName"));
    name.addEventListener("input", () => { build = { ...build, name: name.value || "Untitled Cultivation" }; });
    const linggenGrid = element("div", "tools-linggen-grid");
    for (const linggenId of firstSliceLinggenPool) {
      const config = localizeLinggen(locale, linggenId);
      const button = element("button", "tools-linggen-card") as HTMLButtonElement;
      button.type = "button";
      button.dataset.selected = String(build.linggenId === linggenId);
      button.append(element("strong", "", config.name), element("span", "", config.roots.map((root) => localizeTerm(locale, root)).join(" + ")), element("small", "", config.lore));
      button.addEventListener("click", () => { build = changeBuildLinggen(build, linggenId); render(); });
      linggenGrid.append(button);
    }
    identitySection.append(name, linggenGrid);
    editor.append(identitySection);

    const gongfaSection = element("section", "tools-builder-section");
    gongfaSection.append(element("span", "tools-step", "02"), element("h2", "", t("tools.planner.sequence", { current: build.gongfaIds.length, max: MAX_PLANNED_GONGFA })));
    const slots = element("div", "tools-build-slots");
    for (let index = 0; index < MAX_PLANNED_GONGFA; index += 1) {
      const id = build.gongfaIds[index];
      const slot = element("div", `tools-build-slot${id ? " tools-build-slot--filled" : ""}`);
      if (id) {
        const localized = localizeGongfa(locale, id);
        slot.append(gongfaSeal(id, true), element("span", "", localized.name));
        const remove = element("button", "", "×"); remove.type = "button"; remove.setAttribute("aria-label", t("tools.planner.remove", { name: localized.name }));
        remove.addEventListener("click", () => { build = removeGongfaFromBuild(build, id); render(); }); slot.append(remove);
      } else slot.append(element("span", "", t("tools.planner.stageSlot", { index: index + 1 })));
      slots.append(slot);
    }
    const compatible = element("div", "tools-choice-grid");
    for (const sourceConfig of Object.values(gongfaConfigs)) {
      const config = localizeGongfa(locale, sourceConfig.id);
      const allowed = isGongfaCompatible(build.linggenId, config.id);
      const selected = build.gongfaIds.includes(config.id);
      const button = element("button", "tools-choice-card") as HTMLButtonElement;
      button.type = "button"; button.disabled = !allowed || (build.gongfaIds.length >= MAX_PLANNED_GONGFA && !selected); button.dataset.selected = String(selected);
      button.append(gongfaSeal(config.id, true), element("strong", "", config.name), element("small", "", allowed ? localizeGongfaPackage(locale, config.id).combatRole : t("tools.planner.requires", { roots: config.requiredRoots.map((root) => localizeTerm(locale, root)).join(" + ") })));
      button.addEventListener("click", () => { build = selected ? removeGongfaFromBuild(build, config.id) : addGongfaToBuild(build, config.id); render(); });
      compatible.append(button);
    }
    gongfaSection.append(slots, compatible);
    editor.append(gongfaSection);

    const treasureSection = element("section", "tools-builder-section");
    treasureSection.append(element("span", "tools-step", "03"), element("h2", "", t("tools.planner.treasures", { current: build.treasureIds.length, max: MAX_SPIRIT_TREASURE_SLOTS })));
    const treasureChoices = element("div", "tools-treasure-choice-grid");
    for (const sourceTreasure of Object.values(spiritTreasureConfigs)) {
      const treasure = localizeSpiritTreasure(locale, sourceTreasure.id);
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
    aside.append(element("p", "tools-kicker", t("tools.planner.identity")), element("h2", "", displayBuildName()));
    const summaryLinggen = element("div", "tools-summary-linggen");
    summaryLinggen.append(element("span", "", localizeLinggen(locale, build.linggenId).name), element("strong", "", summary.roots.map((root) => localizeTerm(locale, root)).join(" + ")));
    aside.append(summaryLinggen);
    const summarySlots = element("div", "tools-summary-paths");
    build.gongfaIds.forEach((id, index) => {
      const row = element("div"); row.append(element("span", "", `0${index + 1}`), gongfaSeal(id, true), element("strong", "", localizeGongfa(locale, id).name)); summarySlots.append(row);
    });
    if (!build.gongfaIds.length) summarySlots.append(element("p", "tools-empty", t("tools.planner.emptyIdentity")));
    aside.append(summarySlots);
    const identity = element("section", "tools-summary-section");
    identity.append(element("h3", "", t("tools.planner.combatLanguage")), element("p", "tools-tags", [...summary.patterns, ...summary.tags].map((tag) => `#${localizeTerm(locale, tag)}`).join("  ") || t("tools.planner.noSkills")));
    aside.append(identity);
    const skillList = element("section", "tools-summary-section");
    skillList.append(element("h3", "", t("tools.planner.plannedSkills")));
    const list = element("ol"); build.gongfaIds.flatMap((id) => {
      const packageInfo = localizeGongfaPackage(locale, id);
      return [packageInfo.skill1.name, packageInfo.skill2.name];
    }).forEach((skill) => list.append(element("li", "", skill))); skillList.append(list);
    aside.append(skillList);
    const synergyList = element("section", "tools-summary-section tools-summary-synergies");
    synergyList.append(element("h3", "", t("tools.planner.synergy")));
    if (!summary.synergies.length) synergyList.append(element("p", "tools-empty", t("tools.planner.emptySynergy")));
    summary.synergies.map((synergy) => localizeBuildSynergy(locale, synergy)).forEach((synergy) => {
      const item = element("article");
      item.append(element("strong", "", synergy.title), element("p", "", synergy.description));
      synergyList.append(item);
    });
    if (build.treasureIds.length) synergyList.append(element("p", "tools-summary-treasures", t("tools.planner.runSupport", { names: build.treasureIds.map((id) => localizeSpiritTreasure(locale, id).name).join(" · ") })));
    aside.append(synergyList);
    layout.append(editor, aside);
    page.append(layout);
    return page;
  };

  const renderTreasures = (): HTMLElement => {
    const page = element("main", "tools-page");
    const hero = element("section", "tools-hero tools-hero--compact");
    const copy = element("div"); copy.append(element("p", "tools-kicker", t("tools.treasures.kicker")), element("h1", "", t("tools.treasures.title")), element("p", "", t("tools.treasures.description", { count: MAX_SPIRIT_TREASURE_SLOTS }))); hero.append(copy);
    page.append(hero);
    const grid = element("section", "tools-treasure-grid");
    for (const sourceTreasure of Object.values(spiritTreasureConfigs)) {
      const treasure = localizeSpiritTreasure(locale, sourceTreasure.id);
      const card = element("article", "tools-treasure-card");
      card.append(
        element("span", "tools-treasure-gem tools-treasure-gem--large", "◇"),
        element("p", "tools-kicker", effectLabel(treasure.effect)),
        element("h2", "", treasure.name),
        element("strong", "tools-treasure-effect", formatEffect(treasure.effect, treasure.value)),
        element("p", "", treasure.lore),
        element("p", "tools-tags", treasure.resonanceSeals.map((seal) => localizeTerm(locale, seal)).join(" · ")),
        element("strong", "", `${localizeTerm(locale, "Attunement")} 2 · ${treasure.signature.name}`),
        element("p", "", treasure.signature.effect),
        element("strong", "", `${localizeTerm(locale, "Attunement")} 3 · ${treasure.culmination.name}`),
        element("p", "", treasure.culmination.effect)
      );
      const plan = element("button", "tools-action", t("tools.treasures.plan")); plan.type = "button";
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
