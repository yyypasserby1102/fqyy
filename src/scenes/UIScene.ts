import Phaser from "phaser";
import type { ChoicePayload } from "../data/choices";
import { InputController } from "../systems/InputController";
import { DebugOverlay } from "../ui/DebugOverlay";
import { LevelUpPanel } from "../ui/LevelUpPanel";
import { buildHudLines } from "../logic/hudPresentation";
import type { UiSnapshot } from "../types/gameTest";
import { HudPresentation } from "../ui/HudPresentation";
import {
  JourneyPresentation,
  type JourneyPresentationPayload
} from "../ui/JourneyPresentation";
import { RealmProgressBar } from "../ui/RealmProgressBar";
import type { RunJourneyCommand } from "../logic/runJourney";
import type { RealmPhaseId } from "../data/stages";
import { GongfaCodex, type GongfaCodexPath } from "../ui/GongfaCodex";
import { getLocale } from "../i18n/runtime";
import { localizeChoicePayload, localizeRuntimeText } from "../i18n/content";
import {
  TribulationBossBar,
  type TribulationBossHudState
} from "../ui/TribulationBossBar";

interface HudState {
  health: number;
  maxHealth: number;
  realmPhase: string;
  realmProgress: number;
  stageBreakthroughReady: boolean;
  foundationGrowthTransactions: number;
  masteryPoints: number;
  masteryProgress: number;
  masteryRank: number;
  masterySkill2?: string;
  masterySkill2Casts: number;
  masteryFullyMastered: boolean;
  gongfaPaths: string;
  gongfaMechanicStatus?: string;
  gongfaCodexPaths: GongfaCodexPath[];
  galeMomentum: number;
  guard: number;
  guardMitigation: number;
  bladeShellCharge: number;
  bladeShellCasts: number;
  skillTags: string;
  kills: number;
  elapsedMs: number;
  paused: boolean;
  gameOver: boolean;
  stageName: string;
  realmIdentityLabel: string;
  realmAccent: number;
  linggenName: string;
  linggenGrades: string;
  gongfaName: string;
  methodDamage: number;
  methodCount: number;
  methodCooldownMs: number;
  moveSpeed: number;
  evadeActive: boolean;
  evadeCooldownRemainingMs: number;
  enemyKinds: number;
  enemyCount: number;
  orbCount: number;
  lingcaoCollected: boolean;
  spiritTreasures: string;
  message?: string;
  boss?: TribulationBossHudState;
}

export class UIScene extends Phaser.Scene {
  private hudText!: Phaser.GameObjects.Text;
  private hudPresentation!: HudPresentation;
  private messageText!: Phaser.GameObjects.Text;
  private pauseText!: Phaser.GameObjects.Text;
  private debugOverlay?: DebugOverlay;
  private levelUpPanel!: LevelUpPanel;
  private journeyPresentation!: JourneyPresentation;
  private realmProgressBar!: RealmProgressBar;
  private tribulationBossBar!: TribulationBossBar;
  private gongfaCodex!: GongfaCodex;
  private gongfaArchiveButton!: Phaser.GameObjects.Text;
  private inputController!: InputController;
  private levelUpVisible = false;

  constructor() {
    super("ui");
  }

  create(): void {
    this.inputController = new InputController(this);
    this.hudPresentation = new HudPresentation(this);
    this.hudText = this.add
      .text(18, 44, "", {
        fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
        fontSize: "18px",
        color: "#f4f8ff",
        lineSpacing: 6
      })
      .setScrollFactor(0)
      .setDepth(220)
      .setVisible(false);

    this.messageText = this.add
      .text(this.scale.width * 0.5, this.scale.height - 28, "", {
        fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
        fontSize: "17px",
        color: "#f5e6a8",
        align: "center"
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(220);

    this.pauseText = this.add
      .text(this.scale.width * 0.5, 116, "", {
        fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
        fontSize: "15px",
        color: "#8ecae6"
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(220);

    if (import.meta.env.DEV) {
      this.debugOverlay = new DebugOverlay(this);
    }
    this.levelUpPanel = new LevelUpPanel(this);
    this.journeyPresentation = new JourneyPresentation(this);
    this.realmProgressBar = new RealmProgressBar(this);
    this.tribulationBossBar = new TribulationBossBar(this);
    this.gongfaCodex = new GongfaCodex(this, () => this.setGongfaCodexVisible(false));
    this.gongfaArchiveButton = this.add
      .text(this.scale.width - 18, this.scale.height - 18, localizeRuntimeText(getLocale(), "G · GONGFA"), {
        fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
        fontSize: "13px",
        color: "#d8f4ef",
        backgroundColor: "#12313a",
        padding: { x: 12, y: 7 }
      })
      .setOrigin(1)
      .setDepth(240)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (!this.levelUpVisible) this.setGongfaCodexVisible(!this.gongfaCodex.visible);
      });

    this.events.on("show-choice-panel", this.onShowChoicePanel, this);
    this.events.on("hide-choice-panel", this.onHideChoicePanel, this);
    this.events.on("show-journey-presentation", this.onShowJourneyPresentation, this);
    this.events.on("show-phase-milestone", this.onShowPhaseMilestone, this);
    this.scale.on("resize", this.onResize, this);
    this.game.events.emit("ui-scene-ready");
  }

  update(): void {
    if (this.inputController.gongfaCodexPressed && !this.levelUpVisible) {
      this.setGongfaCodexVisible(!this.gongfaCodex.visible);
    }

    if (this.gongfaCodex.visible) {
      if (this.inputController.previousTabPressed) this.gongfaCodex.selectPrevious();
      if (this.inputController.nextTabPressed) this.gongfaCodex.selectNext();
    }

    if (import.meta.env.DEV && this.inputController.debugPressed) {
      this.debugOverlay?.toggle();
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
    this.gongfaCodex.update(hud.gongfaCodexPaths ?? []);

    const hudLines = buildHudLines({
        stageName: hud.stageName,
        realmPhase: hud.realmPhase,
        realmProgress: hud.realmProgress,
        stageBreakthroughReady: hud.stageBreakthroughReady,
        foundationGrowthTransactions: hud.foundationGrowthTransactions,
        masteryRank: hud.masteryRank,
        masteryProgress: hud.masteryProgress,
        masterySkill2: hud.masterySkill2,
        masterySkill2Casts: hud.masterySkill2Casts,
        masteryFullyMastered: hud.masteryFullyMastered,
        gongfaPaths: hud.gongfaPaths,
        gongfaMechanicStatus: hud.gongfaMechanicStatus,
        galeMomentum: hud.galeMomentum,
        skillTags: hud.skillTags,
        guard: hud.guard,
        guardMitigation: hud.guardMitigation,
        bladeShellCasts: hud.bladeShellCasts,
        bladeShellCharge: hud.bladeShellCharge,
        linggenName: hud.linggenName,
        linggenGrades: hud.linggenGrades,
        gongfaName: hud.gongfaName,
        health: hud.health,
        maxHealth: hud.maxHealth,
        methodCount: hud.methodCount,
        methodDamage: hud.methodDamage,
        methodCooldownMs: hud.methodCooldownMs,
        moveSpeed: hud.moveSpeed,
        evadeActive: hud.evadeActive,
        evadeCooldownRemainingMs: hud.evadeCooldownRemainingMs,
        kills: hud.kills,
        lingcaoCollected: hud.lingcaoCollected,
        spiritTreasures: hud.spiritTreasures
      });
    this.hudText.setText(hudLines.map((line) => localizeRuntimeText(getLocale(), line)));
    this.hudPresentation.update(hudLines, hud);
    this.realmProgressBar.update(hud.realmPhase as RealmPhaseId, hud.realmProgress, hud.realmAccent);
    this.realmProgressBar.setVisible(!hud.boss);
    this.tribulationBossBar.update(hud.boss);

    this.messageText.setText(localizeRuntimeText(getLocale(), hud.message ?? ""));
    this.pauseText.setText(localizeRuntimeText(getLocale(),
      hud.gameOver
        ? "Run Ended"
        : hud.paused
          ? "Paused - ESC to resume"
          : ""
    ));

    if (import.meta.env.DEV) {
      this.debugOverlay?.render([
        `elapsed_ms=${Math.round(hud.elapsedMs)}`,
        `enemy_count=${hud.enemyCount}`,
        `orb_count=${hud.orbCount}`,
        `enemy_kinds=${hud.enemyKinds}`,
        `paused=${hud.paused}`,
        `game_over=${hud.gameOver}`
      ]);
    }
  }

  getTestSnapshot(): UiSnapshot {
    const hud = this.registry.get("hud") as HudState | undefined;
    return {
      masteryProgress: hud?.masteryProgress,
      hudText: this.hudText?.text ?? "",
      visualTheme: "ink-jade",
      hudRegions: [...this.hudPresentation.regionNames],
      realmIdentity: {
        label: hud?.realmIdentityLabel ?? "",
        accent: hud?.realmAccent ?? 0
      },
      realmProgressBar: this.realmProgressBar.getSnapshot(),
      bossBar: this.tribulationBossBar.getSnapshot(),
      choicePanel: this.levelUpPanel.getSnapshot(),
      journeyPresentation: this.journeyPresentation.getSnapshot(),
      gongfaCodex: this.gongfaCodex.getSnapshot()
    };
  }

  private onShowChoicePanel(payload: ChoicePayload): void {
    if (this.gongfaCodex.visible) {
      this.gongfaCodex.hide();
    }
    this.levelUpVisible = true;
    const localized = localizeChoicePayload(getLocale(), payload);
    this.levelUpPanel.show(
      localized.title,
      localized.subtitle,
      localized.options,
      (option) => {
        this.scene.get("game").events.emit("resolve-choice", option);
      },
      payload.visualMode
    );
  }

  private onHideChoicePanel(): void {
    this.levelUpVisible = false;
    this.levelUpPanel.hide();
  }

  private onShowJourneyPresentation(payload: JourneyPresentationPayload): void {
    this.journeyPresentation.show({
      ...payload,
      eyebrow: localizeRuntimeText(getLocale(), payload.eyebrow),
      title: localizeRuntimeText(getLocale(), payload.title),
      subtitle: localizeRuntimeText(getLocale(), payload.subtitle)
    });
  }

  private onShowPhaseMilestone(
    command: Extract<RunJourneyCommand, { kind: "present-phase-milestone" }>
  ): void {
    this.realmProgressBar.showMilestone(command);
  }

  private onResize(gameSize: Phaser.Structs.Size): void {
    this.hudPresentation.resize();
    this.journeyPresentation.resize();
    this.realmProgressBar.resize();
    this.gongfaCodex.resize();
    this.pauseText.setPosition(gameSize.width * 0.5, 116);
    this.messageText.setPosition(gameSize.width * 0.5, gameSize.height - 28);
    this.gongfaArchiveButton.setPosition(gameSize.width - 18, gameSize.height - 18);
  }

  private setGongfaCodexVisible(visible: boolean): void {
    if (visible) {
      this.gongfaCodex.show();
      this.scene.pause("game");
      return;
    }
    this.gongfaCodex.hide();
    const gameScene = this.scene.get("game");
    const gameHud = this.registry.get("hud") as HudState | undefined;
    if (!gameHud?.paused && gameScene.scene.isPaused()) this.scene.resume("game");
  }
}
