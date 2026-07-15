import { describe, expect, it } from "vitest";
import {
  renderMachinePlaytestMarkdown,
  type MachinePlaytestReport
} from "../e2e/helpers/machinePlaytestReport";

describe("machine playtest report", () => {
  it("turns whole-Run evidence into bounded feel suggestions", () => {
    const report: MachinePlaytestReport = {
      schemaVersion: 1,
      commit: "abc1234",
      seed: 2,
      candidate: "Fire-Metal Linggen",
      startedAt: "2026-07-15T00:00:00.000Z",
      wallClockMs: 18_500,
      completedRuns: 1,
      persistenceResumes: 1,
      outcome: "victory",
      checkpoints: [],
      choices: Array.from({ length: 28 }, (_, index) => ({
        title: index % 4 === 0 ? "Phase Transition" : `Mastery Rank ${index}`,
        stage: "lianqi",
        phase: "chuqi",
        optionCount: 3
      })),
      observed: {
        stages: ["lianqi", "zhuji", "jindan", "yuanying"],
        phases: ["chuqi", "zhongqi", "houqi", "dayuanman"],
        arenaVariants: ["mist-court", "foundation-terrace", "golden-core-sanctum", "nascent-sky-dais"],
        journeyKinds: ["phase", "breakthrough", "tribulation", "victory"],
        audioCues: ["phase-transition", "breakthrough", "tribulation", "victory"],
        learnedGongfaCount: 4,
        maxEnemies: 8,
        finalMasteryRank: 20
      }
    };

    const markdown = renderMachinePlaytestMarkdown(report);

    expect(markdown).toContain("Outcome | victory");
    expect(markdown).toContain("Realm differentiation is present");
    expect(markdown).toContain("Choice cadence is the main human-check");
    expect(markdown).toContain("Difficulty is intentionally ungraded");
    expect(markdown).not.toContain("18.5 seconds means the game is too fast");
  });
});
