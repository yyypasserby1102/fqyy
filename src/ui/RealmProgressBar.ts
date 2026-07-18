import Phaser from "phaser";
import type { RealmPhaseId } from "../data/stages";
import type { RunJourneyCommand } from "../logic/runJourney";
import {
  formatRealmMilestoneReward,
  getRealmProgressPresentation,
  REALM_PROGRESS_LABELS
} from "../logic/realmProgressPresentation";
import { getLocale } from "../i18n/runtime";
import { localizeRuntimeText } from "../i18n/content";

export interface RealmProgressBarSnapshot {
  phase: RealmPhaseId;
  phaseLabel: string;
  completedMilestones: number;
  totalProgress: number;
  labels: string[];
  rewardText: string;
}

type PhaseMilestoneCommand = Extract<RunJourneyCommand, { kind: "present-phase-milestone" }>;

export class RealmProgressBar {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly title: Phaser.GameObjects.Text;
  private readonly labels: Phaser.GameObjects.Text[];
  private readonly reward: Phaser.GameObjects.Text;
  private phase: RealmPhaseId = "chuqi";
  private phaseProgress = 0;
  private accent = 0x79d7c8;

  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setScrollFactor(0).setDepth(221);
    this.title = this.createText(13, "#d8f1ef").setOrigin(0.5, 0);
    this.labels = REALM_PROGRESS_LABELS.map(() => this.createText(11, "#a8b9bd").setOrigin(0.5, 0));
    this.reward = this.createText(13, "#f5dda0")
      .setOrigin(0.5, 0)
      .setAlpha(1);
    this.resize();
  }

  update(phase: RealmPhaseId, phaseProgress: number, accent: number): void {
    this.phase = phase;
    this.phaseProgress = phaseProgress;
    this.accent = accent;
    this.draw();
    if (this.reward.alpha === 1 && !this.scene.tweens.isTweening(this.reward)) {
      this.showNextRewardPreview();
    }
  }

  setVisible(visible: boolean): void {
    this.graphics.setVisible(visible);
    this.title.setVisible(visible);
    this.labels.forEach((label) => label.setVisible(visible));
    this.reward.setVisible(visible);
  }

  showMilestone(command: PhaseMilestoneCommand): void {
    this.reward
      .setText(localizeRuntimeText(getLocale(), formatRealmMilestoneReward(command.completedPhase, command.foundationGrowthTransactions)))
      .setAlpha(1);
    this.scene.tweens.killTweensOf(this.reward);
    this.scene.tweens.add({
      targets: this.reward,
      alpha: 0,
      delay: 2400,
      duration: 600,
      ease: "Sine.easeOut",
      onComplete: () => this.showNextRewardPreview()
    });
  }

  getSnapshot(): RealmProgressBarSnapshot {
    const presentation = getRealmProgressPresentation(this.phase, this.phaseProgress);
    return {
      phase: this.phase,
      phaseLabel: localizeRuntimeText(getLocale(), presentation.phaseLabel),
      completedMilestones: presentation.completedMilestones,
      totalProgress: presentation.totalProgress,
      labels: REALM_PROGRESS_LABELS.map((label) => localizeRuntimeText(getLocale(), label)),
      rewardText: this.reward.text
    };
  }

  resize(): void {
    const centerX = this.scene.scale.width * 0.5;
    this.title.setPosition(centerX, 34);
    this.reward.setPosition(centerX, 91);
    this.draw();
  }

  private draw(): void {
    const presentation = getRealmProgressPresentation(this.phase, this.phaseProgress);
    const width = Math.min(460, Math.max(320, this.scene.scale.width - 820));
    const x = (this.scene.scale.width - width) * 0.5;
    const y = 55;
    const segmentWidth = width / (REALM_PROGRESS_LABELS.length - 1);

    this.title
      .setText(localizeRuntimeText(getLocale(), `REALM PROGRESS · ${presentation.phaseLabel} ${Math.round(this.phaseProgress)}%`))
      .setColor(`#${this.accent.toString(16).padStart(6, "0")}`);
    this.graphics.clear();
    this.graphics.fillStyle(0x050d17, 0.9);
    this.graphics.fillRoundedRect(x - 8, y - 5, width + 16, 34, 10);
    this.graphics.fillStyle(0x15242b, 1);
    this.graphics.fillRoundedRect(x, y, width, 8, 4);
    this.graphics.fillStyle(this.accent, 0.95);
    this.graphics.fillRoundedRect(x, y, width * presentation.totalProgress, 8, 4);

    REALM_PROGRESS_LABELS.forEach((label, index) => {
      const markerX = x + segmentWidth * index;
      const complete = index <= presentation.completedMilestones;
      this.graphics.fillStyle(complete ? 0xf5dda0 : 0x51636a, 1);
      this.graphics.fillCircle(markerX, y + 4, complete ? 4 : 3);
      this.labels[index]
        .setText(localizeRuntimeText(getLocale(), label))
        .setPosition(markerX, y + 12)
        .setColor(
          index === presentation.phaseIndex ||
          (index === REALM_PROGRESS_LABELS.length - 1 && presentation.totalProgress >= 1)
            ? "#f5dda0"
            : "#8fa4a9"
        );
    });
  }

  private showNextRewardPreview(): void {
    const presentation = getRealmProgressPresentation(this.phase, this.phaseProgress);
    const nextLabel = REALM_PROGRESS_LABELS[Math.min(
      presentation.completedMilestones + 1,
      REALM_PROGRESS_LABELS.length - 1
    )];
    this.reward
      .setText(localizeRuntimeText(
        getLocale(),
        `NEXT REWARD · +1 damage · +8 max HP/heal · +3 movement · +8 orb radius · ${nextLabel}`
      ))
      .setAlpha(1);
  }

  private createText(fontSize: number, color: string): Phaser.GameObjects.Text {
    return this.scene.add
      .text(0, 0, "", {
        fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
        fontSize: `${fontSize}px`,
        color
      })
      .setScrollFactor(0)
      .setDepth(222);
  }
}
