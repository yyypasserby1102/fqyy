import Phaser from "phaser";
import { getLocale } from "../i18n/runtime";
import { localizeRuntimeText } from "../i18n/content";

export interface TribulationBossHudState {
  name: string;
  health: number;
  maxHealth: number;
  enraged: boolean;
  phaseLabel: string;
}

export interface TribulationBossBarSnapshot {
  visible: boolean;
  name: string;
  health: number;
  maxHealth: number;
  enraged: boolean;
  phaseLabel: string;
}

export class TribulationBossBar {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly phaseText: Phaser.GameObjects.Text;
  private snapshot: TribulationBossBarSnapshot = {
    visible: false,
    name: "",
    health: 0,
    maxHealth: 0,
    enraged: false,
    phaseLabel: ""
  };

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(228);
    this.nameText = this.createText(15, "#ffe39a").setOrigin(0.5, 0);
    this.phaseText = this.createText(11, "#d6c9ff").setOrigin(0.5, 0);
  }

  update(boss?: TribulationBossHudState): void {
    this.graphics.clear();
    if (!boss || boss.maxHealth <= 0) {
      this.nameText.setVisible(false);
      this.phaseText.setVisible(false);
      this.snapshot = {
        visible: false,
        name: "",
        health: 0,
        maxHealth: 0,
        enraged: false,
        phaseLabel: ""
      };
      return;
    }

    const centerX = this.scene.scale.width * 0.5;
    const width = Math.min(560, Math.max(260, this.scene.scale.width - 460));
    const x = centerX - width * 0.5;
    const y = 126;
    const ratio = Phaser.Math.Clamp(boss.health / boss.maxHealth, 0, 1);
    const accent = boss.enraged ? 0xff655f : 0xd9b85e;

    this.graphics.fillStyle(0x03070d, 0.94);
    this.graphics.fillRoundedRect(x - 10, y - 28, width + 20, 57, 10);
    this.graphics.lineStyle(boss.enraged ? 2.5 : 1.5, accent, 0.8);
    this.graphics.strokeRoundedRect(x - 10, y - 28, width + 20, 57, 10);
    this.graphics.fillStyle(0x23191b, 1);
    this.graphics.fillRoundedRect(x, y, width, 13, 5);
    this.graphics.fillStyle(accent, 1);
    this.graphics.fillRoundedRect(x + 2, y + 2, Math.max(0, (width - 4) * ratio), 9, 4);

    this.nameText
      .setVisible(true)
      .setPosition(centerX, y - 25)
      .setColor(boss.enraged ? "#ff8e84" : "#ffe39a")
      .setText(localizeRuntimeText(getLocale(), boss.enraged ? `${boss.name} · ENRAGED` : boss.name));
    this.phaseText
      .setVisible(true)
      .setPosition(centerX, y + 16)
      .setText(localizeRuntimeText(getLocale(), boss.phaseLabel));
    this.snapshot = { visible: true, ...boss };
  }

  getSnapshot(): TribulationBossBarSnapshot {
    return { ...this.snapshot };
  }

  private createText(fontSize: number, color: string): Phaser.GameObjects.Text {
    return this.scene.add
      .text(0, 0, "", {
        fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
        fontSize: `${fontSize}px`,
        color,
        letterSpacing: 1.5
      })
      .setScrollFactor(0)
      .setDepth(229);
  }
}
