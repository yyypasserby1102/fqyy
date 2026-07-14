import Phaser from "phaser";

export type JourneyPresentationKind =
  | "phase"
  | "breakthrough"
  | "tribulation"
  | "victory";

export interface JourneyPresentationPayload {
  kind: JourneyPresentationKind;
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: number;
}

export interface JourneyPresentationSnapshot {
  visible: boolean;
  kind: JourneyPresentationKind | "hidden";
  title: string;
  subtitle: string;
  sequenceCount: number;
}

const DEFAULT_ACCENTS: Record<JourneyPresentationKind, number> = {
  phase: 0x79d7c8,
  breakthrough: 0xd7b96d,
  tribulation: 0x9c8cff,
  victory: 0xffdf8a
};

export class JourneyPresentation {
  private readonly container: Phaser.GameObjects.Container;
  private readonly veil: Phaser.GameObjects.Rectangle;
  private readonly band: Phaser.GameObjects.Rectangle;
  private readonly upperRule: Phaser.GameObjects.Rectangle;
  private readonly lowerRule: Phaser.GameObjects.Rectangle;
  private readonly seal: Phaser.GameObjects.Graphics;
  private readonly eyebrow: Phaser.GameObjects.Text;
  private readonly title: Phaser.GameObjects.Text;
  private readonly subtitle: Phaser.GameObjects.Text;
  private hideTimer?: Phaser.Time.TimerEvent;
  private kind: JourneyPresentationKind | "hidden" = "hidden";
  private sequenceCount = 0;

  constructor(private readonly scene: Phaser.Scene) {
    const centerX = scene.scale.width * 0.5;
    const centerY = scene.scale.height * 0.5;
    this.veil = scene.add
      .rectangle(centerX, centerY, scene.scale.width, scene.scale.height, 0x02060b, 0.34)
      .setScrollFactor(0);
    this.band = scene.add
      .rectangle(centerX, centerY, Math.min(900, scene.scale.width - 48), 162, 0x06111c, 0.94)
      .setStrokeStyle(1, 0x79d7c8, 0.65)
      .setScrollFactor(0);
    this.upperRule = scene.add.rectangle(centerX, centerY - 68, 720, 1, 0x79d7c8, 0.6);
    this.lowerRule = scene.add.rectangle(centerX, centerY + 68, 720, 1, 0xd7b96d, 0.38);
    this.seal = scene.add.graphics().setPosition(centerX - 330, centerY);
    this.eyebrow = scene.add
      .text(centerX, centerY - 47, "REALM PHASE", {
        fontFamily: "Trebuchet MS, Noto Sans SC, sans-serif",
        fontSize: "11px",
        color: "#9dd9d7",
        letterSpacing: 4
      })
      .setOrigin(0.5);
    this.title = scene.add
      .text(centerX, centerY - 10, "", {
        fontFamily: "Georgia, Noto Serif SC, serif",
        fontSize: "34px",
        color: "#f5e7bd",
        align: "center"
      })
      .setOrigin(0.5);
    this.subtitle = scene.add
      .text(centerX, centerY + 35, "", {
        fontFamily: "Trebuchet MS, Noto Sans SC, sans-serif",
        fontSize: "14px",
        color: "#b7cbd0",
        align: "center",
        wordWrap: { width: 680 }
      })
      .setOrigin(0.5);
    this.container = scene.add.container(0, 0, [
      this.veil,
      this.band,
      this.upperRule,
      this.lowerRule,
      this.seal,
      this.eyebrow,
      this.title,
      this.subtitle
    ]);
    this.container.setDepth(600).setScrollFactor(0).setVisible(false);
  }

  show(payload: JourneyPresentationPayload): void {
    this.hideTimer?.remove(false);
    this.scene.tweens.killTweensOf(this.container);
    this.kind = payload.kind;
    this.sequenceCount += 1;
    const accent = payload.accent ?? DEFAULT_ACCENTS[payload.kind];
    this.band.setStrokeStyle(payload.kind === "tribulation" ? 2 : 1, accent, 0.72);
    this.upperRule.setFillStyle(accent, 0.65);
    this.eyebrow.setText(payload.eyebrow).setColor(`#${accent.toString(16).padStart(6, "0")}`);
    this.title.setText(payload.title);
    this.subtitle.setText(payload.subtitle);
    this.drawSeal(accent, payload.kind);
    this.container.setVisible(true).setAlpha(0).setY(18);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      y: 0,
      duration: 260,
      ease: "Cubic.out"
    });
    this.hideTimer = this.scene.time.delayedCall(payload.kind === "victory" ? 2800 : 1900, () => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        y: -12,
        duration: 360,
        ease: "Cubic.in",
        onComplete: () => this.container.setVisible(false)
      });
    });
  }

  resize(): void {
    const centerX = this.scene.scale.width * 0.5;
    const centerY = this.scene.scale.height * 0.5;
    this.veil.setPosition(centerX, centerY).setSize(this.scene.scale.width, this.scene.scale.height);
    this.band.setPosition(centerX, centerY).setSize(Math.min(900, this.scene.scale.width - 32), 162);
    this.upperRule.setPosition(centerX, centerY - 68).setDisplaySize(Math.min(720, this.scene.scale.width - 90), 1);
    this.lowerRule.setPosition(centerX, centerY + 68).setDisplaySize(Math.min(720, this.scene.scale.width - 90), 1);
    this.seal.setPosition(Math.max(54, centerX - 330), centerY);
    this.eyebrow.setPosition(centerX, centerY - 47);
    this.title.setPosition(centerX, centerY - 10);
    this.subtitle.setPosition(centerX, centerY + 35).setWordWrapWidth(Math.max(260, this.scene.scale.width - 120));
  }

  getSnapshot(): JourneyPresentationSnapshot {
    return {
      visible: this.container.visible,
      kind: this.kind,
      title: this.title.text,
      subtitle: this.subtitle.text,
      sequenceCount: this.sequenceCount
    };
  }

  private drawSeal(accent: number, kind: JourneyPresentationKind): void {
    this.seal.clear();
    this.seal.lineStyle(1, accent, 0.5);
    this.seal.strokeCircle(0, 0, 33);
    this.seal.strokeCircle(0, 0, 25);
    const points = kind === "tribulation" ? 6 : kind === "victory" ? 8 : 4;
    for (let index = 0; index < points; index += 1) {
      const angle = (Math.PI * 2 * index) / points;
      this.seal.lineBetween(
        Math.cos(angle) * 12,
        Math.sin(angle) * 12,
        Math.cos(angle) * 32,
        Math.sin(angle) * 32
      );
    }
  }
}
