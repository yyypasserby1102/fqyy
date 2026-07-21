import Phaser from "phaser";
import type { ChoiceOption, ChoiceVisualMode } from "../data/choices";
import {
  LINGCAO_ANIMATIONS,
  SPIRIT_TREASURE_TINTS,
  WORLD_TEXTURES
} from "../visual/worldVisuals";
import { createGongfaSigil } from "../visual/gongfaSigils";
import { getGongfaVisualIdentity } from "../visual/gongfaVisualIdentity";
import { getSettings, subscribeSettings } from "../persistence/settingsPersistence";
import { getLocale } from "../i18n/runtime";

export class LevelUpPanel {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly panelInset: Phaser.GameObjects.Rectangle;
  private readonly title: Phaser.GameObjects.Text;
  private readonly subtitle: Phaser.GameObjects.Text;
  private readonly awakeningGlow: Phaser.GameObjects.Arc;
  private readonly awakeningSeal: Phaser.GameObjects.Graphics;
  private readonly awakeningHerb: Phaser.GameObjects.Sprite;
  private readonly options: Array<{
    box: Phaser.GameObjects.Rectangle;
    kind: Phaser.GameObjects.Text;
    iconHalo: Phaser.GameObjects.Arc;
    treasureIncoming: Phaser.GameObjects.Sprite;
    treasureOutgoing: Phaser.GameObjects.Sprite;
    sigil?: Phaser.GameObjects.Graphics;
    label: Phaser.GameObjects.Text;
    desc: Phaser.GameObjects.Text;
  }> = [];
  private chooseHandler?: (option: ChoiceOption) => void;
  private currentOptions: ChoiceOption[] = [];
  private visualMode: ChoiceVisualMode = "choice";
  private motionReduced = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const backdrop = scene.add
      .rectangle(0, 0, scene.scale.width, scene.scale.height, 0x02070d, 0.78)
      .setOrigin(0)
      .setInteractive();

    this.panel = scene.add
      .rectangle(scene.scale.width * 0.5, scene.scale.height * 0.5, 900, 460, 0x07111d, 0.97)
      .setStrokeStyle(3, 0x72ced7, 0.72);
    this.panelInset = scene.add
      .rectangle(scene.scale.width * 0.5, scene.scale.height * 0.5, 876, 436)
      .setStrokeStyle(1, 0xd7b96d, 0.38);

    this.awakeningGlow = scene.add
      .circle(scene.scale.width * 0.5, scene.scale.height * 0.5 - 20, 188, 0x7de0d0, 0.08)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setVisible(false);
    this.awakeningSeal = scene.add
      .graphics()
      .setPosition(scene.scale.width * 0.5, scene.scale.height * 0.5 - 20)
      .setVisible(false);
    this.awakeningSeal.lineStyle(2, 0x8de5d9, 0.46);
    this.awakeningSeal.strokeCircle(0, 0, 174);
    this.awakeningSeal.lineStyle(1, 0xd7b96d, 0.42);
    this.awakeningSeal.strokeCircle(0, 0, 154);
    for (let spoke = 0; spoke < 8; spoke += 1) {
      const angle = (Math.PI * 2 * spoke) / 8;
      this.awakeningSeal.lineBetween(
        Math.cos(angle) * 154,
        Math.sin(angle) * 154,
        Math.cos(angle) * 174,
        Math.sin(angle) * 174
      );
    }
    this.awakeningHerb = scene.add
      .sprite(scene.scale.width * 0.5, scene.scale.height * 0.5 - 8, WORLD_TEXTURES.lingcao, 12)
      .setDisplaySize(300, 300)
      .setAlpha(0.16)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setVisible(false)
      .play(LINGCAO_ANIMATIONS.breakthrough);

    this.title = scene.add
      .text(scene.scale.width * 0.5, scene.scale.height * 0.5 - 194, "Breakthrough Choice", {
        fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
        fontSize: "28px",
        color: "#f5e6a8"
      })
      .setOrigin(0.5);

    this.subtitle = scene.add
      .text(scene.scale.width * 0.5, scene.scale.height * 0.5 - 154, "", {
        fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
        fontSize: "15px",
        color: "#9bc4d8",
        align: "center",
        wordWrap: { width: 700 }
      })
      .setOrigin(0.5);

    this.container = scene.add.container(0, 0, [
      backdrop,
      this.awakeningGlow,
      this.awakeningSeal,
      this.panel,
      this.panelInset,
      this.awakeningHerb,
      this.title,
      this.subtitle
    ]);
    this.container.setDepth(500).setVisible(false);
    const sealTween = scene.tweens.add({
      targets: this.awakeningSeal,
      angle: 360,
      duration: 18_000,
      repeat: -1
    });
    const glowTween = scene.tweens.add({
      targets: this.awakeningGlow,
      scale: 1.08,
      alpha: 0.72,
      duration: 1_800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
    const applyMotion = (): void => {
      const reduced = getSettings().reducedMotion;
      this.motionReduced = reduced;
      sealTween.setTimeScale(reduced ? 0 : 1);
      glowTween.setTimeScale(reduced ? 0 : 1);
      if (reduced) {
        this.awakeningSeal.setAngle(0);
        this.awakeningGlow.setScale(1).setAlpha(0.32);
        this.awakeningHerb.anims.pause();
      } else {
        this.awakeningHerb.anims.resume();
      }
    };
    applyMotion();
    const unsubscribe = subscribeSettings(applyMotion);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);

    for (let i = 0; i < 4; i += 1) {
      const x = scene.scale.width * 0.5 - 315 + i * 210;
      const y = scene.scale.height * 0.5 + 34;
      const box = scene.add
        .rectangle(x, y, 194, 282, 0x0d1d2b, 0.96)
        .setStrokeStyle(2, 0x6fcbd5, 0.7)
        .setInteractive({ useHandCursor: true });
      const kind = scene.add
        .text(x, y - 126, "", {
          fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
          fontSize: "10px",
          color: "#8ed9d4",
          letterSpacing: 1.4
        })
        .setOrigin(0.5);
      const iconHalo = scene.add
        .circle(x, y - 82, 34, 0x0a2530, 0.9)
        .setStrokeStyle(1, 0x72ced7, 0.6);
      const treasureOutgoing = scene.add
        .sprite(x - 23, y - 82, WORLD_TEXTURES.pickups, 8)
        .setDisplaySize(58, 58)
        .setVisible(false);
      const treasureIncoming = scene.add
        .sprite(x + 23, y - 82, WORLD_TEXTURES.pickups, 8)
        .setDisplaySize(62, 62)
        .setVisible(false);
      const label = scene.add
        .text(x, y - 39, "", {
          fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
          fontSize: "17px",
          color: "#f5fbff",
          align: "center",
          wordWrap: { width: 174 }
        })
        .setOrigin(0.5);
      const desc = scene.add
        .text(x, y - 4, "", {
          fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
          fontSize: "11px",
          color: "#a9c8da",
          align: "left",
          lineSpacing: 4,
          wordWrap: { width: 174 }
        })
        .setOrigin(0.5, 0);

      box.on("pointerdown", () => {
        const option = this.currentOptions[i];
        if (option && this.chooseHandler) {
          this.chooseHandler(option);
        }
      });
      box.on("pointerover", () => {
        box.setFillStyle(0x163246, 0.98).setStrokeStyle(3, 0xd7b96d, 0.9);
      });
      box.on("pointerout", () => {
        this.styleOption(i);
      });

      this.container.add([
        box,
        kind,
        iconHalo,
        treasureOutgoing,
        treasureIncoming,
        label,
        desc
      ]);
      this.options.push({
        box,
        kind,
        iconHalo,
        treasureIncoming,
        treasureOutgoing,
        label,
        desc
      });
    }
  }

  private getChoiceFamily(option: ChoiceOption): "gongfa" | "mastery" | "treasure" | "journey" {
    if (option.kind === "gongfa") return "gongfa";
    if (option.kind === "mastery" || option.kind === "upgrade") return "mastery";
    if (option.kind === "spirit-treasure-replace" || option.kind === "spirit-treasure-leave") {
      return "treasure";
    }
    return "journey";
  }

  private getKindLabel(option: ChoiceOption): string {
    const family = this.getChoiceFamily(option);
    if (family === "gongfa") return "GONGFA · 功法";
    if (family === "mastery") return "MASTERY · 蜕变";
    if (family === "treasure") return "LINGBAO · 灵宝";
    return "JOURNEY · 破境";
  }

  private getChoiceDetails(option: ChoiceOption): string {
    let details: string;
    if (option.kind === "gongfa") {
      details = [
        option.playstyle ? `${getLocale() === "zh-CN" ? "【玩法】" : "【HOW TO PLAY】"}\n${option.playstyle}` : "",
        option.gain ? `＋ ${option.gain}` : "",
        option.scope ? `◆ ${option.scope}` : "",
        option.cost ? `◇ ${option.cost}` : ""
      ].filter(Boolean).join("\n");
    } else if (option.kind === "mastery") {
      details = [
        option.playstyle,
        option.gain ? `＋ ${option.gain}` : "",
        option.cost ? `△ ${option.cost}` : "",
        option.scope ? `◎ ${option.scope}` : "",
        option.treasureInteraction ? `◇ ${option.treasureInteraction}` : ""
      ].filter(Boolean).join("\n");
    } else if (option.kind === "spirit-treasure-replace") {
      const resonanceChanges = [
        ...(option.resonanceGained?.map((item) => `✦ +${item}`) ?? []),
        ...(option.resonanceLost?.map((item) => `✦ −${item}`) ?? [])
      ];
      details = [
        option.gain ? `＋ ${option.gain}` : "",
        option.loss ? `－ ${option.loss}` : "",
        ...resonanceChanges,
        ...(option.mechanicsGained?.map((item) => `＋ ${item}`) ?? []),
        ...(option.mechanicsLost?.map((item) => `－ ${item}`) ?? [])
      ].filter(Boolean).join("\n");
    } else {
      details = option.description;
    }
    if (getLocale() !== "zh-CN") return details;
    return details.split("\n").flatMap((line) => {
      if (line.length <= 18) return [line];
      return line.match(/.{1,18}/gu) ?? [line];
    }).join("\n");
  }

  private styleOption(index: number): void {
    const option = this.currentOptions[index];
    const slot = this.options[index];
    if (!option || !slot) return;
    const family = this.getChoiceFamily(option);
    if (family === "gongfa") {
      const accent = option.gongfaId ? getGongfaVisualIdentity(option.gongfaId).accent : 0x72ced7;
      slot.box.setFillStyle(0x0a2028, 0.98).setStrokeStyle(2, accent, 0.82);
      slot.iconHalo.setFillStyle(0x0b2930, 0.94).setStrokeStyle(1, accent, 0.7);
      slot.kind.setColor("#8fe6df");
    } else if (family === "mastery") {
      slot.box.setFillStyle(0x171529, 0.98).setStrokeStyle(2, 0xb89be8, 0.82);
      slot.iconHalo.setFillStyle(0x251c3b, 0.94).setStrokeStyle(1, 0xc5a7f0, 0.72);
      slot.kind.setColor("#d2b9f4");
    } else if (family === "treasure") {
      const accent = option.spiritTreasureId
        ? SPIRIT_TREASURE_TINTS[option.spiritTreasureId]
        : 0xd7b96d;
      slot.box.setFillStyle(0x192016, 0.98).setStrokeStyle(2, accent, 0.84);
      slot.iconHalo.setFillStyle(0x2a2815, 0.94).setStrokeStyle(1, accent, 0.72);
      slot.kind.setColor("#ead485");
    } else {
      slot.box.setFillStyle(0x0d1d2b, 0.96).setStrokeStyle(2, 0x6fcbd5, 0.7);
      slot.iconHalo.setFillStyle(0x102735, 0.94).setStrokeStyle(1, 0x72ced7, 0.6);
      slot.kind.setColor("#8ed9d4");
    }
  }

  private renderOptionVisual(
    index: number,
    option: ChoiceOption,
    x: number,
    y: number,
    largeThreeChoice: boolean
  ): void {
    const slot = this.options[index];
    slot.sigil?.destroy();
    slot.sigil = undefined;
    slot.treasureIncoming.setVisible(false).setAlpha(1);
    slot.treasureOutgoing.setVisible(false).setAlpha(1);
    const family = this.getChoiceFamily(option);
    const iconY = y - (largeThreeChoice ? 168 : 82);
    if ((family === "gongfa" || family === "mastery") && option.gongfaId) {
      const sigil = createGongfaSigil(
        this.scene,
        x,
        iconY,
        option.gongfaId,
        family === "gongfa" ? 31 : 27,
        family === "gongfa" ? 1 : 0.76
      );
      this.container.add(sigil);
      slot.sigil = sigil;
    } else if (family === "treasure" && option.spiritTreasureId) {
      const incomingX = option.replacedSpiritTreasureId ? x + 23 : x;
      slot.treasureIncoming
        .setPosition(incomingX, iconY)
        .setTint(SPIRIT_TREASURE_TINTS[option.spiritTreasureId])
        .setVisible(true);
      if (option.replacedSpiritTreasureId) {
        slot.treasureOutgoing
          .setPosition(x - 23, iconY)
          .setTint(SPIRIT_TREASURE_TINTS[option.replacedSpiritTreasureId])
          .setAlpha(0.48)
          .setVisible(true);
      }
    }
  }

  show(
    title: string,
    subtitle: string | undefined,
    options: ChoiceOption[],
    onChoose: (option: ChoiceOption) => void,
    visualMode: ChoiceVisualMode = "choice"
  ): void {
    this.currentOptions = options;
    this.chooseHandler = onChoose;
    this.title.setText(title);
    this.subtitle.setText(subtitle ?? "");
    this.visualMode = visualMode;
    const awakening = visualMode === "linggen-awakening";
    this.awakeningGlow.setVisible(awakening);
    this.awakeningSeal.setVisible(awakening);
    this.awakeningHerb.setVisible(awakening);
    this.title.setColor(awakening ? "#ffe3a0" : "#f5e6a8");
    this.container.setVisible(true);

    const largeThreeChoice = options.length === 3;
    this.panel.setSize(largeThreeChoice ? 1240 : 900, largeThreeChoice ? 680 : 460);
    this.panelInset.setSize(largeThreeChoice ? 1216 : 876, largeThreeChoice ? 656 : 436);
    this.title.setPosition(this.scene.scale.width * 0.5, largeThreeChoice ? 43 : this.scene.scale.height * 0.5 - 194);
    this.subtitle.setPosition(this.scene.scale.width * 0.5, largeThreeChoice ? 82 : this.scene.scale.height * 0.5 - 154);
    this.subtitle.setWordWrapWidth(largeThreeChoice ? 1120 : 700);
    const spacing = options.length === 4 ? 210 : largeThreeChoice ? 400 : 270;
    const startX = this.title.x - ((options.length - 1) * spacing) / 2;
    const optionWidth = options.length === 4 ? 194 : largeThreeChoice ? 380 : 244;
    const optionHeight = largeThreeChoice ? 470 : 282;
    const optionY = largeThreeChoice ? 410 : this.scene.scale.height * 0.5 + 34;

    options.forEach((option, index) => {
      const slot = this.options[index];
      const x = startX + index * spacing;
      slot.box.setPosition(x, optionY);
      slot.kind.setPosition(x, optionY - (largeThreeChoice ? 216 : 126));
      slot.iconHalo.setPosition(x, optionY - (largeThreeChoice ? 168 : 82));
      slot.label.setPosition(x, optionY - (largeThreeChoice ? 112 : 39));
      slot.desc.setPosition(x, optionY - (largeThreeChoice ? 72 : 4));
      slot.box.setSize(optionWidth, optionHeight);
      slot.label.setWordWrapWidth(optionWidth - 20);
      slot.desc.setWordWrapWidth(optionWidth - 24);
      slot.kind.setFontSize(largeThreeChoice ? 14 : 10);
      slot.label.setFontSize(largeThreeChoice ? 23 : 17);
      slot.desc.setFontSize(largeThreeChoice ? 17 : 11).setLineSpacing(largeThreeChoice ? 7 : 4);
      slot.kind.setText(this.getKindLabel(option));
      slot.label.setText(`${index + 1}. ${option.title}`);
      slot.desc.setText(this.getChoiceDetails(option));
      this.renderOptionVisual(index, option, x, optionY, largeThreeChoice);
      this.styleOption(index);
      slot.box.setVisible(true);
      slot.kind.setVisible(true);
      slot.iconHalo.setVisible(true);
      slot.label.setVisible(true);
      slot.desc.setVisible(true);
    });

    for (let i = options.length; i < this.options.length; i += 1) {
      const slot = this.options[i];
      slot.sigil?.destroy();
      slot.sigil = undefined;
      slot.box.setVisible(false);
      slot.kind.setVisible(false);
      slot.iconHalo.setVisible(false);
      slot.treasureIncoming.setVisible(false);
      slot.treasureOutgoing.setVisible(false);
      slot.label.setVisible(false);
      slot.desc.setVisible(false);
    }
  }

  hide(): void {
    this.currentOptions = [];
    this.chooseHandler = undefined;
    this.container.setVisible(false);
  }

  chooseAt(index: number): void {
    const option = this.currentOptions[index];
    if (option && this.chooseHandler) {
      this.chooseHandler(option);
    }
  }

  getSnapshot(): {
    visible: boolean;
    renderedOptionCount: number;
    mode: ChoiceVisualMode | "hidden";
    motionReduced: boolean;
    title: string;
    subtitle: string;
    optionTitles: string[];
    optionKinds: ChoiceOption["kind"][];
    optionVisuals: string[];
    optionWidths: number[];
    descriptionFontSizes: number[];
  } {
    return {
      visible: this.container.visible,
      renderedOptionCount: this.options.filter((option) => option.box.visible).length,
      mode: this.container.visible ? this.visualMode : "hidden",
      motionReduced: this.motionReduced,
      title: this.title.text,
      subtitle: this.subtitle.text,
      optionTitles: this.currentOptions.map((option) => option.title),
      optionKinds: this.currentOptions.map((option) => option.kind),
      optionWidths: this.currentOptions.map((_, index) => this.options[index]?.box.width ?? 0),
      descriptionFontSizes: this.currentOptions.map((_, index) =>
        Number.parseFloat(String(this.options[index]?.desc.style.fontSize ?? 0))
      ),
      optionVisuals: this.currentOptions.map((option) => {
        if (option.gongfaId) return `gongfa:${option.gongfaId}`;
        if (option.spiritTreasureId) return `lingbao:${option.spiritTreasureId}`;
        return this.getChoiceFamily(option);
      })
    };
  }
}
