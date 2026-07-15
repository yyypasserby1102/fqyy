import type { SoundCue } from "../../../src/audio/SoundFx";
import type { RealmPhaseId, StageId } from "../../../src/data/stages";
import type { JourneyPresentationKind } from "../../../src/ui/JourneyPresentation";
import type { ArenaVariantDefinition } from "../../../src/data/arenaVariants";

export interface MachineCheckpoint {
  label: string;
  stage: StageId;
  phase: RealmPhaseId;
  realmProgress: number;
  learnedGongfaCount: number;
  masteryRank: number;
  kills: number;
  health: number;
  enemyCount: number;
  arenaVariant: string;
  choiceTitle: string;
  journeyKind: string;
}

export interface MachineChoiceObservation {
  title: string;
  stage: StageId;
  phase: RealmPhaseId;
  optionCount: number;
}

export interface MachinePlaytestReport {
  schemaVersion: 1;
  commit: string;
  seed: number;
  candidate: string;
  startedAt: string;
  wallClockMs: number;
  completedRuns: number;
  persistenceResumes: number;
  outcome: "victory" | "death" | "abandonment";
  checkpoints: MachineCheckpoint[];
  choices: MachineChoiceObservation[];
  observed: {
    stages: StageId[];
    phases: RealmPhaseId[];
    arenaVariants: ArenaVariantDefinition["variantId"][];
    journeyKinds: JourneyPresentationKind[];
    audioCues: SoundCue[];
    learnedGongfaCount: number;
    maxEnemies: number;
    finalMasteryRank: number;
  };
}

function list(values: string[]): string {
  return values.length ? values.join(", ") : "none observed";
}

export function renderMachinePlaytestMarkdown(report: MachinePlaytestReport): string {
  const suggestions: string[] = [];
  if (report.observed.arenaVariants.length === 4 && report.observed.journeyKinds.length >= 4) {
    suggestions.push(
      "**Realm differentiation is present; readability is a human hypothesis.** All four arena variants and the phase/Breakthrough/Tribulation/victory presentation family appeared. Human sessions should verify that each change reads immediately during combat before this is treated as strong realm identity."
    );
  } else {
    suggestions.push(
      "**Realm identity needs investigation.** The machine Run did not observe every arena and journey presentation expected from the full progression."
    );
  }
  if (report.choices.length >= 24) {
    suggestions.push(
      `**Choice cadence is the main human-check.** The accelerated Run surfaced ${report.choices.length} choice panels. That count supports testing for decision fatigue—especially near Realm transitions—but does not prove that the cadence feels excessive.`
    );
  } else {
    suggestions.push(
      `**Choice cadence looks restrained in machine coverage.** ${report.choices.length} choice panels appeared, but human sessions still need to judge whether their timing interrupts combat flow.`
    );
  }
  if (report.observed.learnedGongfaCount === 4) {
    suggestions.push(
      "**Build layering is present; tactical value is ungraded.** The Run retained four learned Gongfa through Yuanying. Human playtests should verify that the fourth path adds a readable tactical layer instead of only more simultaneous effects."
    );
  }
  if (report.observed.audioCues.includes("tribulation") && report.observed.audioCues.includes("victory")) {
    suggestions.push(
      "**Major-beat cues are present; sensory hierarchy needs ears-on validation.** Phase, Breakthrough, Tribulation, and victory cues fired. Human sessions should compare their audible prominence with ordinary hit/cast sounds before judging the mix hierarchy."
    );
  }
  suggestions.push(
    "**Difficulty is intentionally ungraded.** Forced Qi and enemy cleanup prove state flow, persistence, and presentation—not challenge, real pacing, or fairness. Apply numerical balance changes only after the real-time human protocol reaches its evidence threshold."
  );

  return `# Machine whole-Run playtest

Generated from the public browser surface and \`window.__gameTest\` acceleration seam. Machine wall time is diagnostic only and must not be interpreted as game pacing. Coverage facts below seed human-playtest hypotheses; they do not establish subjective readability, mix quality, tactics, or difficulty.

| Measurement | Result |
| --- | --- |
| Commit | ${report.commit} |
| Seed / Candidate | ${report.seed} / ${report.candidate} |
| Outcome | ${report.outcome} |
| Machine wall time | ${(report.wallClockMs / 1000).toFixed(1)} seconds |
| Save/resume cycles | ${report.persistenceResumes} |
| Completed Run record | ${report.completedRuns} |
| Choices observed | ${report.choices.length} |
| Final Gongfa / Mastery | ${report.observed.learnedGongfaCount} / rank ${report.observed.finalMasteryRank} |
| Peak enemies sampled | ${report.observed.maxEnemies} |

## Coverage

- Stages: ${list(report.observed.stages)}
- Realm Phases: ${list(report.observed.phases)}
- Arenas: ${list(report.observed.arenaVariants)}
- Journey presentations: ${list(report.observed.journeyKinds)}
- Audio cues: ${list(report.observed.audioCues)}

## General-feel suggestions

${suggestions.map((suggestion) => `- ${suggestion}`).join("\n")}

## Checkpoint trace

| Checkpoint | Stage / Phase | Progress | Gongfa | Mastery | Enemies | Choice |
| --- | --- | ---: | ---: | ---: | ---: | --- |
${report.checkpoints.map((checkpoint) =>
  `| ${checkpoint.label} | ${checkpoint.stage} / ${checkpoint.phase} | ${checkpoint.realmProgress} | ${checkpoint.learnedGongfaCount} | ${checkpoint.masteryRank} | ${checkpoint.enemyCount} | ${checkpoint.choiceTitle || "—"} |`
).join("\n")}
`;
}
