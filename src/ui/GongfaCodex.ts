import Phaser from "phaser";
import type { GongfaId } from "../data/gongfa";
import { getMasteryChoiceDefinition } from "../logic/mastery";
import {
  projectGongfaProgression,
  type GongfaProgressionChoiceState
} from "../logic/gongfaProgression";
import { createGongfaSigil } from "../visual/gongfaSigils";
import { getLocale } from "../i18n/runtime";
import {
  localizeGongfa,
  localizeGongfaPackage,
  localizeMasteryChoice,
  localizeRuntimeText,
  localizeTerm
} from "../i18n/content";

export interface GongfaCodexPath {
  gongfaId: GongfaId;
  rank: number;
  skill2Unlocked: boolean;
  fullyMastered: boolean;
  learnedMasteryIds: string[];
  pendingRanks: number[];
}

export interface GongfaCodexMilestoneSnapshot {
  rank: number;
  selectedNames: string[];
  unselectedNames: string[];
  availableNames: string[];
  futureNames: string[];
}

export interface GongfaCodexSnapshot {
  visible: boolean;
  learnedPathCount: number;
  selectedGongfaId?: GongfaId;
  selectedRank?: number;
  rankText: string;
  skill2Status?: "locked" | "unlocked";
  cardNames: string[];
  transformationNames: string[];
  transformationTradeoffs: string[];
  progressRankCount: number;
  milestones: GongfaCodexMilestoneSnapshot[];
  interactiveControlCount: number;
}

const font = "Noto Sans SC Variable, Trebuchet MS, sans-serif";

export class GongfaCodex {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly backdrop: Phaser.GameObjects.Rectangle;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly ornament: Phaser.GameObjects.Graphics;
  private readonly eyebrow: Phaser.GameObjects.Text;
  private readonly title: Phaser.GameObjects.Text;
  private readonly rank: Phaser.GameObjects.Text;
  private readonly role: Phaser.GameObjects.Text;
  private readonly tabs: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private readonly previousButton: Phaser.GameObjects.Text;
  private readonly nextButton: Phaser.GameObjects.Text;
  private readonly closeButton: Phaser.GameObjects.Text;
  private readonly cards: Array<{
    frame: Phaser.GameObjects.Rectangle;
    kind: Phaser.GameObjects.Text;
    name: Phaser.GameObjects.Text;
    tags: Phaser.GameObjects.Text;
    description: Phaser.GameObjects.Text;
  }> = [];
  private readonly masteryLabel: Phaser.GameObjects.Text;
  private readonly masteryText: Phaser.GameObjects.Text;
  private readonly progressRanks: Phaser.GameObjects.Rectangle[] = [];
  private readonly milestoneCards: Array<{
    frame: Phaser.GameObjects.Rectangle;
    title: Phaser.GameObjects.Text;
    status: Phaser.GameObjects.Text;
    choices: Phaser.GameObjects.Text[];
  }> = [];
  private sigil?: Phaser.GameObjects.Graphics;
  private paths: GongfaCodexPath[] = [];
  private selectedIndex = 0;

  constructor(scene: Phaser.Scene, onRequestClose: () => void = () => undefined) {
    const locale = getLocale();
    this.scene = scene;
    this.backdrop = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x02070d, 0.9).setOrigin(0).setInteractive().on("pointerdown", onRequestClose);
    this.panel = scene.add.rectangle(0, 0, 1120, 690, 0x07131d, 0.99).setStrokeStyle(2, 0x79d8d0, 0.78).setInteractive().on(
      "pointerdown",
      (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => event.stopPropagation()
    );
    this.ornament = scene.add.graphics();
    this.eyebrow = this.text(localizeRuntimeText(locale, "GONGFA ARCHIVE"), 13, "#73d8cf").setLetterSpacing(2);
    this.title = this.text(localizeRuntimeText(locale, "No Gongfa Awakened"), 30, "#f4dfa1");
    this.rank = this.text("", 14, "#96b7c8");
    this.role = this.text(localizeRuntimeText(locale, "Claim the Lingcao to awaken a Linggen and choose a Gongfa."), 15, "#c1d6df");
    this.tabs = this.text("", 14, "#91b8c6");
    this.hint = this.text(localizeRuntimeText(locale, "Keyboard: G close · ← → change path"), 13, "#7899a8");
    this.previousButton = this.control(localizeRuntimeText(locale, "‹ PREVIOUS"), () => this.selectPrevious());
    this.nextButton = this.control(localizeRuntimeText(locale, "NEXT ›"), () => this.selectNext());
    this.closeButton = this.control(localizeRuntimeText(locale, "CLOSE ×"), onRequestClose);
    this.masteryLabel = this.text(localizeRuntimeText(locale, "INTEGRATED MASTERY"), 12, "#d3b969").setLetterSpacing(1.5);
    this.masteryText = this.text(localizeRuntimeText(locale, "No refinements integrated yet."), 14, "#aac3ce");

    for (let i = 0; i < 3; i += 1) {
      this.cards.push({
        frame: scene.add.rectangle(0, 0, 330, 178, i === 1 ? 0x0c2022 : 0x0c1a26, 0.98).setStrokeStyle(1, i === 1 ? 0xd2ad57 : 0x4f8d9d, 0.7),
        kind: this.text("", 11, i === 1 ? "#e4c66e" : "#70cfd0").setLetterSpacing(1.2),
        name: this.text("", 21, "#f2f5ed"),
        tags: this.text("", 12, "#79a9b8"),
        description: this.text("", 14, "#bad0d7")
      });
    }

    for (let rank = 1; rank <= 22; rank += 1) {
      this.progressRanks.push(scene.add.rectangle(0, 0, 39, 13, 0x162a35, 1).setStrokeStyle(1, 0x365462, 0.8));
    }
    for (const rank of [3, 6, 9, 10]) {
      this.milestoneCards.push({
        frame: scene.add.rectangle(0, 0, 250, 116, 0x0a1822, 0.98).setStrokeStyle(1, 0x365462, 0.9),
        title: this.text(`R${rank}`, 12, "#d7e7e8").setLetterSpacing(1),
        status: this.text("", 10, "#7899a8").setLetterSpacing(1),
        choices: Array.from({ length: 3 }, () => this.text("", 11, "#7899a8"))
      });
    }

    const children: Phaser.GameObjects.GameObject[] = [
      this.backdrop, this.panel, this.ornament, this.eyebrow, this.title, this.rank,
      this.role, this.tabs, this.hint, this.previousButton, this.nextButton,
      this.closeButton, this.masteryLabel, this.masteryText
    ];
    for (const card of this.cards) children.push(card.frame, card.kind, card.name, card.tags, card.description);
    children.push(...this.progressRanks);
    for (const milestone of this.milestoneCards) children.push(milestone.frame, milestone.title, milestone.status, ...milestone.choices);
    this.container = scene.add.container(0, 0, children).setDepth(760).setVisible(false);
    this.resize();
  }

  get visible(): boolean {
    return this.container.visible;
  }

  toggle(): boolean {
    if (this.visible) this.hide();
    else this.show();
    return this.visible;
  }

  show(): void {
    this.container.setVisible(true);
    this.render();
  }

  hide(): void {
    this.container.setVisible(false);
  }

  update(paths: GongfaCodexPath[]): void {
    const signature = (items: GongfaCodexPath[]) => items.map((item) => `${item.gongfaId}:${item.rank}:${item.learnedMasteryIds.join(",")}:${item.pendingRanks.join(",")}`).join("|");
    if (signature(paths) === signature(this.paths)) return;
    this.paths = paths.map((path) => ({
      ...path,
      learnedMasteryIds: [...path.learnedMasteryIds],
      pendingRanks: [...path.pendingRanks]
    }));
    this.selectedIndex = Phaser.Math.Clamp(this.selectedIndex, 0, Math.max(0, this.paths.length - 1));
    if (this.visible) this.render();
  }

  selectPrevious(): void {
    if (!this.paths.length) return;
    this.selectedIndex = (this.selectedIndex - 1 + this.paths.length) % this.paths.length;
    this.render();
  }

  selectNext(): void {
    if (!this.paths.length) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.paths.length;
    this.render();
  }

  resize(): void {
    const { width, height } = this.scene.scale;
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    this.backdrop.setSize(width, height);
    this.panel.setPosition(centerX, centerY);
    this.eyebrow.setPosition(centerX - 520, centerY - 325);
    this.title.setPosition(centerX - 520, centerY - 292);
    this.rank.setPosition(centerX + 520, centerY - 282).setOrigin(1, 0);
    this.role.setPosition(centerX - 520, centerY - 247).setWordWrapWidth(770);
    this.tabs.setPosition(centerX - 520, centerY - 207);
    this.hint.setPosition(centerX + 520, centerY - 322).setOrigin(1, 0);
    this.previousButton.setPosition(centerX - 520, centerY + 300);
    this.nextButton.setPosition(centerX - 405, centerY + 300);
    this.closeButton.setPosition(centerX + 520, centerY - 250).setOrigin(1, 0);
    this.ornament.clear().lineStyle(1, 0xd1ad5b, 0.4).lineBetween(centerX - 520, centerY - 220, centerX + 520, centerY - 220);
    const startX = centerX - 355;
    this.cards.forEach((card, index) => {
      const x = startX + index * 355;
      const y = centerY - 116;
      card.frame.setPosition(x, y);
      card.kind.setPosition(x - 145, y - 72);
      card.name.setPosition(x - 145, y - 48).setWordWrapWidth(290);
      card.tags.setPosition(x - 145, y - 12).setWordWrapWidth(290);
      card.description.setPosition(x - 145, y + 17).setWordWrapWidth(290);
    });
    this.masteryLabel.setPosition(centerX - 520, centerY - 16);
    this.progressRanks.forEach((node, index) => node.setPosition(centerX - 500 + index * 47.5, centerY + 17));
    this.milestoneCards.forEach((card, index) => {
      const x = centerX - 390 + index * 260;
      const y = centerY + 103;
      card.frame.setPosition(x, y);
      card.title.setPosition(x - 112, y - 48);
      card.status.setPosition(x + 112, y - 47).setOrigin(1, 0);
      card.choices.forEach((choice, choiceIndex) => choice.setPosition(x - 112, y - 20 + choiceIndex * 24).setWordWrapWidth(224));
    });
    this.masteryText.setPosition(centerX - 520, centerY + 174).setWordWrapWidth(1040);
    this.sigil?.setPosition(centerX + 475, centerY + 254);
  }

  getSnapshot(): GongfaCodexSnapshot {
    const selected = this.paths[this.selectedIndex];
    const definition = selected ? localizeGongfaPackage(getLocale(), selected.gongfaId) : undefined;
    const progression = selected ? this.getProgressionSnapshot(selected) : [];
    return {
      visible: this.visible,
      learnedPathCount: this.paths.length,
      selectedGongfaId: selected?.gongfaId,
      selectedRank: selected?.rank,
      rankText: this.rank.text,
      skill2Status: selected ? (selected.skill2Unlocked ? "unlocked" : "locked") : undefined,
      cardNames: definition ? [definition.skill1.name, definition.passive.name, definition.skill2.name] : [],
      transformationNames: selected ? this.getTransformations(selected).map((item) => item.name) : [],
      transformationTradeoffs: selected
        ? this.getTransformations(selected).map((item) => `${item.gain} / ${item.cost}`)
        : [],
      progressRankCount: selected ? 22 : 0,
      milestones: progression,
      interactiveControlCount: 3
    };
  }

  private render(): void {
    const locale = getLocale();
    const selected = this.paths[this.selectedIndex];
    if (!selected) {
      this.sigil?.destroy();
      this.sigil = undefined;
      this.title.setText(localizeRuntimeText(locale, "No Gongfa Awakened"));
      this.rank.setText(localizeRuntimeText(locale, "MORTAL"));
      this.role.setText(localizeRuntimeText(locale, "Claim the Lingcao to awaken a Linggen and choose a Gongfa."));
      this.tabs.setText(localizeRuntimeText(locale, "The archive will record every learned path."));
      this.cards.forEach((card) => {
        card.kind.setText(localizeRuntimeText(locale, "SEALED")); card.name.setText(localizeRuntimeText(locale, "Unknown")); card.tags.setText(""); card.description.setText(localizeRuntimeText(locale, "This meridian has not yet opened."));
      });
      this.masteryText.setText(localizeRuntimeText(locale, "No refinements integrated yet."));
      this.progressRanks.forEach((node) => node.setFillStyle(0x162a35).setStrokeStyle(1, 0x365462, 0.8));
      this.milestoneCards.forEach((card) => {
        card.status.setText(localizeRuntimeText(locale, "FUTURE"));
        card.choices.forEach((choice) => choice.setText(""));
      });
      return;
    }

    const config = localizeGongfa(locale, selected.gongfaId);
    const definition = localizeGongfaPackage(locale, selected.gongfaId);
    this.sigil?.destroy();
    this.sigil = createGongfaSigil(
      this.scene,
      this.scene.scale.width * 0.5 + 455,
      this.scene.scale.height * 0.5 + 254,
      selected.gongfaId,
      72,
      0.16
    );
    this.container.addAt(this.sigil, 3);
    this.title.setText(config.name);
    this.rank.setText(localizeRuntimeText(locale, selected.fullyMastered ? `RANK ${selected.rank} · FULLY MASTERED` : `MASTERY RANK ${selected.rank}`));
    this.role.setText(definition.combatRole);
    this.tabs.setText(this.paths.map((path, index) => `${index === this.selectedIndex ? "◆" : "◇"} ${localizeGongfa(locale, path.gongfaId).name}`).join("   "));
    const content = [
      { kind: localizeRuntimeText(locale, "SKILL 1 · ACTIVE"), skill: definition.skill1, description: definition.skill1.description },
      { kind: `${localizeRuntimeText(locale, "PASSIVE")} · ${definition.passive.resource}`, skill: { ...definition.skill1, name: definition.passive.name, tags: [] }, description: definition.passive.description },
      { kind: localizeRuntimeText(locale, selected.skill2Unlocked ? "SKILL 2 · ACTIVE" : "SKILL 2 · UNLOCKS RANK 10"), skill: definition.skill2, description: selected.skill2Unlocked ? definition.skill2.description : localizeRuntimeText(locale, `Sealed. ${definition.skill2.description}`) }
    ];
    content.forEach((item, index) => {
      const card = this.cards[index];
      card.kind.setText(item.kind);
      card.name.setText(item.skill.name);
      card.tags.setText(item.skill.tags.length ? item.skill.tags.map((tag) => `#${localizeTerm(locale, tag)}`).join("  ") : `${localizeRuntimeText(locale, "RESOURCE")} · ${definition.passive.resource}`);
      card.description.setText(item.description);
      card.frame.setAlpha(index === 2 && !selected.skill2Unlocked ? 0.62 : 1);
    });
    this.renderProgression(selected);
    const counts = selected.learnedMasteryIds.reduce<Record<string, number>>((result, id) => {
      result[id] = (result[id] ?? 0) + 1;
      return result;
    }, {});
    const refinements = Object.entries(counts)
      .filter(([id]) => getMasteryChoiceDefinition(id)?.kind === "refinement")
      .map(([id, tiers]) => `${localizeMasteryChoice(locale, id).name} ${tiers >= 2 ? "II" : "I"}`);
    this.masteryText.setText(localizeRuntimeText(locale,
      refinements.length
        ? `Refinements · ${refinements.join("  ·  ")}`
        : "No refinements integrated yet. The first insight arrives at Mastery Rank 1."
    ));
  }

  private renderProgression(path: GongfaCodexPath): void {
    const locale = getLocale();
    const progression = projectGongfaProgression({ ...path });
    progression.ranks.forEach((rank, index) => {
      const node = this.progressRanks[index];
      if (rank.state === "completed") node.setFillStyle(0x3f9f8e).setStrokeStyle(1, 0x8fe0cf, 1);
      else if (rank.state === "current") node.setFillStyle(0xd2ad57).setStrokeStyle(2, 0xffe49a, 1);
      else node.setFillStyle(0x162a35).setStrokeStyle(1, 0x365462, 0.8);
    });
    progression.milestones.forEach((milestone, index) => {
      const card = this.milestoneCards[index];
      const aggregate = milestone.choices.some((choice) => choice.state === "selected")
        ? "selected"
        : milestone.choices.some((choice) => choice.state === "available") ? "available" : "future";
      const style = this.choiceStyle(aggregate);
      const label = milestone.rank === 10 ? "SECOND SKILL" : milestone.rank === 3 ? "SKILL FORM" : milestone.rank === 6 ? "PASSIVE PATH" : "CAPSTONE PATH";
      card.title.setText(`R${milestone.rank} · ${localizeRuntimeText(locale, label)}`);
      card.status.setText(localizeRuntimeText(locale, aggregate.toUpperCase())).setColor(style.color);
      card.frame.setStrokeStyle(aggregate === "selected" ? 2 : 1, style.stroke, 0.95).setFillStyle(style.fill, 0.98);
      card.choices.forEach((text, choiceIndex) => {
        const choice = milestone.choices[choiceIndex];
        if (!choice) {
          text.setText("");
          return;
        }
        const choiceStyle = this.choiceStyle(choice.state);
        const prefix = choice.state === "selected" ? "◆" : choice.state === "unselected" ? "×" : choice.state === "available" ? "◈" : "◇";
        const name = milestone.rank === 10
          ? localizeGongfaPackage(locale, path.gongfaId).skill2.name
          : localizeMasteryChoice(locale, choice.id).name;
        text.setText(`${prefix} ${name}`).setColor(choiceStyle.color).setAlpha(choice.state === "unselected" ? 0.55 : 1);
      });
    });
  }

  private choiceStyle(state: GongfaProgressionChoiceState): { color: string; fill: number; stroke: number } {
    if (state === "selected") return { color: "#f4d77d", fill: 0x18251f, stroke: 0xd2ad57 };
    if (state === "unselected") return { color: "#8a7880", fill: 0x17151c, stroke: 0x58434d };
    if (state === "available") return { color: "#83eee1", fill: 0x0c272a, stroke: 0x63d9cf };
    return { color: "#7899a8", fill: 0x0a1822, stroke: 0x365462 };
  }

  private getProgressionSnapshot(path: GongfaCodexPath): GongfaCodexMilestoneSnapshot[] {
    const locale = getLocale();
    return projectGongfaProgression({ ...path }).milestones.map((milestone) => {
      const names = (state: GongfaProgressionChoiceState): string[] => milestone.choices
        .filter((choice) => choice.state === state)
        .map((choice) => milestone.rank === 10
          ? localizeGongfaPackage(locale, path.gongfaId).skill2.name
          : localizeMasteryChoice(locale, choice.id).name);
      return {
        rank: milestone.rank,
        selectedNames: names("selected"),
        unselectedNames: names("unselected"),
        availableNames: names("available"),
        futureNames: names("future")
      };
    });
  }

  private getTransformationNames(path: GongfaCodexPath): string[] {
    return this.getTransformations(path).map((item) => item.name);
  }

  private getTransformations(path: GongfaCodexPath): Array<{ name: string; gain: string; cost: string }> {
    return path.learnedMasteryIds
      .map((id) => getMasteryChoiceDefinition(id))
      .filter((item) => item?.kind === "transformation")
      .map((item) => {
        const localized = localizeMasteryChoice(getLocale(), item!.id);
        return {
          name: localized.name,
          gain: localized.gain ?? localized.lore,
          cost: localized.cost ?? ""
        };
      });
  }

  private text(value: string, size: number, color: string): Phaser.GameObjects.Text {
    return this.scene.add.text(0, 0, value, { fontFamily: font, fontSize: `${size}px`, color, lineSpacing: 5 });
  }

  private control(value: string, onPress: () => void): Phaser.GameObjects.Text {
    return this.text(value, 12, "#d9f5f1")
      .setPadding(9, 6, 9, 6)
      .setBackgroundColor("#12313a")
      .setInteractive({ useHandCursor: true })
      .on("pointerover", function (this: Phaser.GameObjects.Text) { this.setBackgroundColor("#1d5360"); })
      .on("pointerout", function (this: Phaser.GameObjects.Text) { this.setBackgroundColor("#12313a"); })
      .on("pointerdown", onPress);
  }
}
