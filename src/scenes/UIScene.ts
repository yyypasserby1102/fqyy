import Phaser from "phaser";
import type { ChoicePayload } from "../data/choices";
import { InputController } from "../systems/InputController";
import { formatTime } from "../utils/format";
import { DebugOverlay } from "../ui/DebugOverlay";
import { LevelUpPanel } from "../ui/LevelUpPanel";

interface HudState {
  health: number;
  maxHealth: number;
  level: number;
  xp: number;
  xpToNext: number;
  kills: number;
  elapsedMs: number;
  remainingMs: number;
  paused: boolean;
  gameOver: boolean;
  stageName: string;
  linggenName: string;
  gongfaName: string;
  methodDamage: number;
  methodCount: number;
  methodCooldownMs: number;
  moveSpeed: number;
  enemyKinds: number;
  enemyCount: number;
  orbCount: number;
  lingcaoCollected: boolean;
  message?: string;
}

export class UIScene extends Phaser.Scene {
  private hudText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private pauseText!: Phaser.GameObjects.Text;
  private debugOverlay!: DebugOverlay;
  private levelUpPanel!: LevelUpPanel;
  private inputController!: InputController;
  private levelUpVisible = false;

  constructor() {
    super("ui");
  }

  create(): void {
    this.inputController = new InputController(this);
    this.hudText = this.add
      .text(18, 16, "", {
        fontFamily: "Trebuchet MS, Noto Sans SC, sans-serif",
        fontSize: "18px",
        color: "#f4f8ff",
        lineSpacing: 6
      })
      .setScrollFactor(0)
      .setDepth(220);

    this.messageText = this.add
      .text(18, 148, "", {
        fontFamily: "Trebuchet MS, Noto Sans SC, sans-serif",
        fontSize: "17px",
        color: "#f5e6a8"
      })
      .setScrollFactor(0)
      .setDepth(220);

    this.pauseText = this.add
      .text(this.scale.width * 0.5, 34, "", {
        fontFamily: "Trebuchet MS, Noto Sans SC, sans-serif",
        fontSize: "18px",
        color: "#8ecae6"
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(220);

    this.debugOverlay = new DebugOverlay(this);
    this.levelUpPanel = new LevelUpPanel(this);

    this.events.on("show-choice-panel", this.onShowChoicePanel, this);
    this.events.on("hide-choice-panel", this.onHideChoicePanel, this);
    this.scale.on("resize", this.onResize, this);
  }

  update(): void {
    if (this.inputController.debugPressed) {
      this.debugOverlay.toggle();
    }

    if (this.levelUpVisible) {
      const slot = this.inputController.selectedUpgradeSlot;
      if (slot !== null) {
        this.levelUpPanel.chooseAt(slot);
      }
    }

    const hud = this.registry.get("hud") as HudState | undefined;
    if (!hud) {
      return;
    }

    this.hudText.setText([
      "Cultivator: Outer Peak Wanderer",
      `Realm: ${hud.stageName} Lv.${hud.level}`,
      `Linggen: ${hud.linggenName}`,
      `Gongfa: ${hud.gongfaName}`,
      `Vitality: ${Math.ceil(hud.health)} / ${hud.maxHealth}`,
      `Qi: ${hud.xp} / ${hud.xpToNext}`,
      `Method: ${hud.methodCount} | Damage: ${hud.methodDamage} | Cooldown: ${Math.round(hud.methodCooldownMs)}ms`,
      `Movement: ${hud.moveSpeed} | Kills: ${hud.kills}`,
      `Lingcao: ${hud.lingcaoCollected ? "claimed" : "unclaimed"} | Run Timer: ${formatTime(hud.remainingMs)}`
    ]);

    this.messageText.setText(hud.message ?? "");
    this.pauseText.setText(
      hud.gameOver
        ? "Run Ended"
        : hud.paused
          ? "Paused - ESC to resume"
        : "WASD move | ESC pause | F3 debug | 1/2/3 or click to choose"
    );

    this.debugOverlay.render([
      `elapsed_ms=${Math.round(hud.elapsedMs)}`,
      `enemy_count=${hud.enemyCount}`,
      `orb_count=${hud.orbCount}`,
      `enemy_kinds=${hud.enemyKinds}`,
      `paused=${hud.paused}`,
      `game_over=${hud.gameOver}`
    ]);
  }

  private onShowChoicePanel(payload: ChoicePayload): void {
    this.levelUpVisible = true;
    this.levelUpPanel.show(payload.title, payload.subtitle, payload.options, (option) => {
      this.scene.get("game").events.emit("resolve-choice", option);
    });
  }

  private onHideChoicePanel(): void {
    this.levelUpVisible = false;
    this.levelUpPanel.hide();
  }

  private onResize(gameSize: Phaser.Structs.Size): void {
    this.pauseText.setPosition(gameSize.width * 0.5, 34);
  }
}
