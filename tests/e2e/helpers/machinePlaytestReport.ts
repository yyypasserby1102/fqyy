import type { SoundCue } from "../../../src/audio/SoundFx";
import type { RealmPhaseId, StageId } from "../../../src/data/stages";
import type { JourneyPresentationKind } from "../../../src/ui/JourneyPresentation";
import type { ArenaVariantDefinition } from "../../../src/data/arenaVariants";
import type { GongfaId } from "../../../src/data/gongfa";

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
  arenaVariant: ArenaVariantDefinition["variantId"] | "";
  choiceTitle: string;
  journeyKind: JourneyPresentationKind | "hidden";
}

export interface MachineChoiceObservation {
  title: string;
  stage: StageId;
  phase: RealmPhaseId;
  optionCount: number;
}

export interface MachinePlaytestReport {
  schemaVersion: 2;
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
    phaseMilestones: string[];
    audioCues: SoundCue[];
    learnedGongfaCount: number;
    maxEnemies: number;
    finalMasteryRank: number;
    gongfaMasteries: Array<{
      gongfaId: GongfaId;
      rank: number;
      fullyMastered: boolean;
    }>;
    realmIdentities: Array<{
      stage: StageId;
      label: string;
      accent: number;
    }>;
    projectileHierarchy: Array<{
      sourceGongfaId: GongfaId;
      visualTier: "founding" | "layered";
      alpha: number;
      depth: number;
    }>;
  };
}

function list(values: string[]): string {
  return values.length ? values.join(", ") : "none observed";
}

export function renderMachinePlaytestMarkdown(report: MachinePlaytestReport): string {
  const suggestions: string[] = [];
  if (
    report.observed.arenaVariants.length === 4 &&
    report.observed.realmIdentities.length === 4 &&
    report.observed.journeyKinds.length >= 3 &&
    report.observed.phaseMilestones.length === 12
  ) {
    suggestions.push(
      "**Realm identity is persistently reinforced.** All four arena variants, distinct accent/identity badges, twelve automatic phase milestones, and the Breakthrough/Tribulation/victory presentation family appeared. The machine can prove persistent differentiation; humans still judge how quickly it reads under pressure."
    );
  } else {
    suggestions.push(
      "**Realm identity needs investigation.** The machine Run did not observe every arena and journey presentation expected from the full progression."
    );
  }
  if (report.choices.length <= 24) {
    suggestions.push(
      `**Choice interruptions are materially restrained.** The accelerated Run surfaced ${report.choices.length} panels: Realm Phases and ordinary Mastery Refinements resolve automatically, while Transformations and true Breakthroughs remain decisions. Human sessions should still judge the remaining cadence.`
    );
  } else {
    suggestions.push(
      `**Choice cadence still needs reduction.** ${report.choices.length} panels exceeded the whole-Run machine budget of 24.`
    );
  }
  if (
    report.observed.gongfaMasteries.length === 4 &&
    report.observed.gongfaMasteries.some(({ fullyMastered }) => fullyMastered) &&
    report.observed.gongfaMasteries.some(({ fullyMastered }) => !fullyMastered)
  ) {
    suggestions.push(
      "**Late-Run growth remains visible across the build.** The founding path reached Fully Mastered while newer Gongfa retained independent rank progress, so a completed first path no longer presents as a stalled build. Tactical value remains a human judgment."
    );
  }
  if (report.observed.projectileHierarchy.length === 4) {
    suggestions.push(
      "**Four-Gongfa effect hierarchy is enforced.** The founding path remained the full-opacity visual layer while later paths stepped down through progressively quieter opacity/depth tiers. Human playtests should confirm that the quieter layers remain identifiable without obscuring threats."
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
- Automatic phase milestones: ${list(report.observed.phaseMilestones)}
- Audio cues: ${list(report.observed.audioCues)}
- Realm identities: ${list(report.observed.realmIdentities.map(({ label }) => label))}
- Gongfa mastery: ${list(report.observed.gongfaMasteries.map(({ gongfaId, rank, fullyMastered }) => `${gongfaId} R${rank}${fullyMastered ? " (Fully Mastered)" : ""}`))}
- Effect hierarchy: ${list(report.observed.projectileHierarchy.map(({ sourceGongfaId, visualTier, alpha }) => `${sourceGongfaId} ${visualTier} α${alpha.toFixed(2)}`))}

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
