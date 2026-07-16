import Phaser from "phaser";
import type { GongfaId } from "../data/gongfa";
import { getMasteryChoiceDefinition } from "../logic/mastery";
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
}

export interface GongfaCodexSnapshot {
  visible: boolean;
  learnedPathCount: number;
  selectedGongfaId?: GongfaId;
  selectedRank?: number;
  skill2Status?: "locked" | "unlocked";
  cardNames: string[];
  transformationNames: string[];
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
  private sigil?: Phaser.GameObjects.Graphics;
  private paths: GongfaCodexPath[] = [];
  private selectedIndex = 0;

  constructor(scene: Phaser.Scene, onRequestClose: () => void = () => undefined) {
    const locale = getLocale();
    this.scene = scene;
    this.backdrop = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x02070d, 0.9).setOrigin(0).setInteractive().on("pointerdown", onRequestClose);
    this.panel = scene.add.rectangle(0, 0, 1120, 610, 0x07131d, 0.99).setStrokeStyle(2, 0x79d8d0, 0.78).setInteractive().on(
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
        frame: scene.add.rectangle(0, 0, 330, 250, i === 1 ? 0x0c2022 : 0x0c1a26, 0.98).setStrokeStyle(1, i === 1 ? 0xd2ad57 : 0x4f8d9d, 0.7),
        kind: this.text("", 11, i === 1 ? "#e4c66e" : "#70cfd0").setLetterSpacing(1.2),
        name: this.text("", 21, "#f2f5ed"),
        tags: this.text("", 12, "#79a9b8"),
        description: this.text("", 14, "#bad0d7")
      });
    }

    const children: Phaser.GameObjects.GameObject[] = [
      this.backdrop, this.panel, this.ornament, this.eyebrow, this.title, this.rank,
      this.role, this.tabs, this.hint, this.previousButton, this.nextButton,
      this.closeButton, this.masteryLabel, this.masteryText
    ];
    for (const card of this.cards) children.push(card.frame, card.kind, card.name, card.tags, card.description);
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
    const signature = (items: GongfaCodexPath[]) => items.map((item) => `${item.gongfaId}:${item.rank}:${item.learnedMasteryIds.join(",")}`).join("|");
    if (signature(paths) === signature(this.paths)) return;
    this.paths = paths.map((path) => ({ ...path, learnedMasteryIds: [...path.learnedMasteryIds] }));
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
    this.eyebrow.setPosition(centerX - 520, centerY - 280);
    this.title.setPosition(centerX - 520, centerY - 244);
    this.rank.setPosition(centerX + 520, centerY - 234).setOrigin(1, 0);
    this.role.setPosition(centerX - 520, centerY - 196).setWordWrapWidth(770);
    this.tabs.setPosition(centerX - 520, centerY - 152);
    this.hint.setPosition(centerX + 520, centerY - 275).setOrigin(1, 0);
    this.previousButton.setPosition(centerX - 520, centerY + 246);
    this.nextButton.setPosition(centerX - 405, centerY + 246);
    this.closeButton.setPosition(centerX + 520, centerY - 202).setOrigin(1, 0);
    this.ornament.clear().lineStyle(1, 0xd1ad5b, 0.4).lineBetween(centerX - 520, centerY - 166, centerX + 520, centerY - 166);
    const startX = centerX - 355;
    this.cards.forEach((card, index) => {
      const x = startX + index * 355;
      const y = centerY + 6;
      card.frame.setPosition(x, y);
      card.kind.setPosition(x - 145, y - 105);
      card.name.setPosition(x - 145, y - 78).setWordWrapWidth(290);
      card.tags.setPosition(x - 145, y - 35).setWordWrapWidth(290);
      card.description.setPosition(x - 145, y + 3).setWordWrapWidth(290);
    });
    this.masteryLabel.setPosition(centerX - 520, centerY + 154);
    this.masteryText.setPosition(centerX - 520, centerY + 180).setWordWrapWidth(1040);
    this.sigil?.setPosition(centerX + 455, centerY + 198);
  }

  getSnapshot(): GongfaCodexSnapshot {
    const selected = this.paths[this.selectedIndex];
    const definition = selected ? localizeGongfaPackage(getLocale(), selected.gongfaId) : undefined;
    return {
      visible: this.visible,
      learnedPathCount: this.paths.length,
      selectedGongfaId: selected?.gongfaId,
      selectedRank: selected?.rank,
      skill2Status: selected ? (selected.skill2Unlocked ? "unlocked" : "locked") : undefined,
      cardNames: definition ? [definition.skill1.name, definition.passive.name, definition.skill2.name] : [],
      transformationNames: selected ? this.getTransformationNames(selected) : []
      ,interactiveControlCount: 3
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
      return;
    }

    const config = localizeGongfa(locale, selected.gongfaId);
    const definition = localizeGongfaPackage(locale, selected.gongfaId);
    this.sigil?.destroy();
    this.sigil = createGongfaSigil(
      this.scene,
      this.scene.scale.width * 0.5 + 455,
      this.scene.scale.height * 0.5 + 198,
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
    const counts = selected.learnedMasteryIds.reduce<Record<string, number>>((result, id) => {
      result[id] = (result[id] ?? 0) + 1;
      return result;
    }, {});
    const refinements = Object.entries(counts)
      .filter(([id]) => getMasteryChoiceDefinition(id)?.kind === "refinement")
      .map(([id, tiers]) => `${localizeMasteryChoice(locale, id).name} ${tiers >= 2 ? "II" : "I"}`);
    const transformations = this.getTransformationNames(selected);
    this.masteryText.setText(localizeRuntimeText(locale,
      refinements.length || transformations.length
        ? [
            `Refinements · ${refinements.join("  ·  ") || "None"}`,
            `Transformations · ${transformations.join("  ·  ") || "Next choice at Rank 3"}`
          ].join("\n")
        : "No refinements integrated yet. The first insight arrives at Mastery Rank 1."
    ));
  }

  private getTransformationNames(path: GongfaCodexPath): string[] {
    return path.learnedMasteryIds
      .map((id) => getMasteryChoiceDefinition(id))
      .filter((item) => item?.kind === "transformation")
      .map((item) => item ? localizeMasteryChoice(getLocale(), item.id).name : "");
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
