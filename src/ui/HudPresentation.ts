import Phaser from "phaser";
import { getLocale } from "../i18n/runtime";
import { localizeRuntimeText } from "../i18n/content";

interface HudVisualState {
  health: number;
  maxHealth: number;
  stageBreakthroughReady: boolean;
  stageName: string;
  realmIdentityLabel: string;
  realmAccent: number;
}

export class HudPresentation {
  readonly regionNames = ["status", "gongfa", "evade"] as const;

  private readonly panels: Phaser.GameObjects.Graphics;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly gongfaText: Phaser.GameObjects.Text;
  private readonly evadeText: Phaser.GameObjects.Text;
  private readonly vitalityText: Phaser.GameObjects.Text;
  private readonly realmText: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    this.panels = scene.add.graphics().setScrollFactor(0).setDepth(219);
    this.statusText = this.createText(28, 28, 16, "#e8f2f5");
    this.gongfaText = this.createText(scene.scale.width - 346, 28, 16, "#e8f2f5");
    this.evadeText = this.createText(29, scene.scale.height - 47, 15, "#c9f4f2");
    this.vitalityText = this.createText(28, 0, 13, "#f2dfbf");
    this.realmText = this.createText(scene.scale.width * 0.5, 18, 14, "#9fe2e5")
      .setOrigin(0.5, 0);
  }

  update(lines: string[], state: HudVisualState): void {
    const locale = getLocale();
    const statusLines = lines.filter((line, index) =>
      index === 0 ||
      line.startsWith("Qi:") ||
      line.startsWith("Linggen:") ||
      line.startsWith("Lingcao:")
    );
    const gongfaLines = lines.filter(
      (line) =>
        line.startsWith("Gongfa:") ||
        line.startsWith("Mastery:") ||
        line.startsWith("Paths:") ||
        line.startsWith("Gale Momentum:") ||
        line.startsWith("Guard:") ||
        line.startsWith("Spirit Treasures:")
    );
    const evadeLine = lines.find((line) => line.startsWith("Evade:")) ?? "Evade: Ready";

    this.statusText.setText(statusLines.map((line) => localizeRuntimeText(locale, line)));
    const statusHeight = Math.max(150, this.statusText.height + 70);
    this.gongfaText.setText(gongfaLines.map((line) => localizeRuntimeText(locale, line)));
    const gongfaHeight = Math.max(96, this.gongfaText.height + 30);
    const gongfaX = this.scene.scale.width - 364;
    const evadeY = this.scene.scale.height - 60;
    const lowVitality = state.maxHealth > 0 && state.health / state.maxHealth <= 0.25;
    const statusAccent = lowVitality
      ? 0xd7655d
      : state.stageBreakthroughReady
        ? 0xd8b65c
        : state.realmAccent;

    this.realmText
      .setText(localizeRuntimeText(locale, `${state.stageName.toUpperCase()} · ${state.realmIdentityLabel}`))
      .setColor(`#${state.realmAccent.toString(16).padStart(6, "0")}`);

    this.panels.clear();
    this.drawPanel(14, 14, 330, statusHeight, statusAccent);
    this.drawPanel(gongfaX, 14, 350, gongfaHeight, 0x7dcbd5);
    this.drawPanel(14, evadeY, 190, 44, 0x7dcbd5);

    const vitalityRatio = state.maxHealth > 0
      ? Phaser.Math.Clamp(state.health / state.maxHealth, 0, 1)
      : 0;
    const vitalityY = 36 + this.statusText.height;
    this.panels.fillStyle(0x05090f, 0.95);
    this.panels.fillRoundedRect(28, vitalityY + 20, 286, 13, 5);
    this.panels.fillStyle(lowVitality ? 0xd7655d : 0x67c77a, 1);
    this.panels.fillRoundedRect(30, vitalityY + 22, 282 * vitalityRatio, 9, 4);

    this.gongfaText.setPosition(gongfaX + 18, 28);
    this.evadeText.setPosition(29, evadeY + 12).setText(localizeRuntimeText(locale, evadeLine));
    this.vitalityText
      .setPosition(28, vitalityY)
      .setColor(lowVitality ? "#ff9b8f" : "#f2dfbf")
      .setText(localizeRuntimeText(locale, `Vitality ${Math.ceil(state.health)} / ${state.maxHealth}`));
  }

  resize(): void {
    this.gongfaText.setX(this.scene.scale.width - 346);
    this.evadeText.setY(this.scene.scale.height - 48);
    this.realmText.setX(this.scene.scale.width * 0.5);
  }

  private createText(
    x: number,
    y: number,
    fontSize: number,
    color: string
  ): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, y, "", {
        fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
        fontSize: `${fontSize}px`,
        color,
        lineSpacing: 7,
        wordWrap: { width: 310 }
      })
      .setScrollFactor(0)
      .setDepth(220);
  }

  private drawPanel(
    x: number,
    y: number,
    width: number,
    height: number,
    accent: number
  ): void {
    this.panels.fillStyle(0x050d17, 0.86);
    this.panels.fillRoundedRect(x, y, width, height, 12);
    this.panels.lineStyle(2, accent, 0.58);
    this.panels.strokeRoundedRect(x, y, width, height, 12);
    this.panels.lineStyle(1, 0xd7b96d, 0.24);
    this.panels.lineBetween(x + 18, y + 8, x + width - 18, y + 8);
  }
}
