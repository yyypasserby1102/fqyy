import { describe, expect, it } from "vitest";
import {
  renderMachinePlaytestMarkdown,
  type MachinePlaytestReport
} from "../e2e/helpers/machinePlaytestReport";

describe("machine playtest report", () => {
  it("turns whole-Run evidence into bounded feel suggestions", () => {
    const report: MachinePlaytestReport = {
      schemaVersion: 2,
      commit: "abc1234",
      seed: 2,
      candidate: "Fire-Metal Linggen",
      startedAt: "2026-07-15T00:00:00.000Z",
      wallClockMs: 18_500,
      completedRuns: 1,
      persistenceResumes: 1,
      outcome: "victory",
      checkpoints: [],
      choices: Array.from({ length: 20 }, (_, index) => ({
        title: index % 5 === 0 ? "Lianqi Tribulation" : `Mastery Rank ${index}`,
        stage: "lianqi",
        phase: "chuqi",
        optionCount: 3
      })),
      observed: {
        stages: ["lianqi", "zhuji", "jindan", "yuanying"],
        phases: ["chuqi", "zhongqi", "houqi", "dayuanman"],
        arenaVariants: ["mist-court", "foundation-terrace", "golden-core-sanctum", "nascent-sky-dais"],
        journeyKinds: ["breakthrough", "tribulation", "victory"],
        phaseMilestones: Array.from({ length: 12 }, (_, index) => `milestone-${index + 1}`),
        audioCues: ["phase-transition", "breakthrough", "tribulation", "victory"],
        learnedGongfaCount: 4,
        maxEnemies: 8,
        finalMasteryRank: 20,
        gongfaMasteries: [
          { gongfaId: "burning-ring-scripture", rank: 20, fullyMastered: true },
          { gongfaId: "scarlet-wave-manual", rank: 9, fullyMastered: false },
          { gongfaId: "blazing-feather-art", rank: 6, fullyMastered: false },
          { gongfaId: "crimson-furnace-sword-art", rank: 3, fullyMastered: false }
        ],
        realmIdentities: [
          { stage: "lianqi", label: "Fallen Sect Courtyard · Breath", accent: 0x70d7df },
          { stage: "zhuji", label: "Mist Bamboo Valley · Root", accent: 0x63c3b1 },
          { stage: "jindan", label: "Burial Ridge · Core", accent: 0xe2b65d },
          { stage: "yuanying", label: "Cloudbreak Summit · Soul", accent: 0xa993ef }
        ],
        projectileHierarchy: [
          { sourceGongfaId: "burning-ring-scripture", visualTier: "founding", alpha: 1, depth: 12 },
          { sourceGongfaId: "scarlet-wave-manual", visualTier: "layered", alpha: 0.82, depth: 11 },
          { sourceGongfaId: "blazing-feather-art", visualTier: "layered", alpha: 0.68, depth: 10 },
          { sourceGongfaId: "crimson-furnace-sword-art", visualTier: "layered", alpha: 0.58, depth: 9 }
        ]
      }
    };

    const markdown = renderMachinePlaytestMarkdown(report);

    expect(markdown).toContain("Outcome | victory");
    expect(markdown).toContain("Realm identity is persistently reinforced");
    expect(markdown).toContain("Choice interruptions are materially restrained");
    expect(markdown).toContain("Late-Run growth remains visible across the build");
    expect(markdown).toContain("Four-Gongfa effect hierarchy is enforced");
    expect(markdown).toContain("Difficulty is intentionally ungraded");
    expect(markdown).not.toContain("18.5 seconds means the game is too fast");
  });
});
