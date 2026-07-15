import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import {
  renderMachinePlaytestMarkdown,
  type MachineChoiceObservation,
  type MachineCheckpoint,
  type MachinePlaytestReport
} from "./helpers/machinePlaytestReport";
import { realmPhaseOrder, stageOrder } from "../../src/data/stages";
import type { SoundCue } from "../../src/audio/SoundFx";
import type { JourneyPresentationKind } from "../../src/ui/JourneyPresentation";
import { ARENA_VARIANTS, type ArenaVariantDefinition } from "../../src/data/arenaVariants";
import type { GongfaId } from "../../src/data/gongfa";

const seed = 2;
const expectedArenas: ArenaVariantDefinition["variantId"][] = stageOrder.map(
  (stage) => ARENA_VARIANTS[stage].variantId
);

test("machine-driven whole Run reaches victory and emits feel evidence", async ({ page }) => {
  test.slow();
  const startedAt = new Date().toISOString();
  const wallStart = performance.now();
  const checkpoints: MachineCheckpoint[] = [];
  const choices: MachineChoiceObservation[] = [];
  const stages = new Set<(typeof stageOrder)[number]>();
  const phases = new Set<(typeof realmPhaseOrder)[number]>();
  const arenaVariants = new Set<ArenaVariantDefinition["variantId"]>();
  const journeyKinds = new Set<JourneyPresentationKind>();
  const phaseMilestones: string[] = [];
  const audioCues = new Set<SoundCue>();
  const realmIdentities = new Map<(typeof stageOrder)[number], {
    stage: (typeof stageOrder)[number];
    label: string;
    accent: number;
  }>();
  const projectileHierarchy = new Map<GongfaId, {
    sourceGongfaId: GongfaId;
    visualTier: "founding" | "layered";
    alpha: number;
    depth: number;
  }>();
  let maxEnemies = 0;
  let persistenceResumes = 0;

  const observe = async (label: string): Promise<MachineCheckpoint> => {
    const { game, ui } = await page.evaluate(() => ({
      game: window.__gameTest!.getSnapshot(),
      ui: window.__gameTest!.getUiSnapshot()
    }));
    stages.add(game.progression.stage);
    phases.add(game.progression.realmPhase);
    if (game.visuals.arena.variantId) arenaVariants.add(game.visuals.arena.variantId);
    if (ui.journeyPresentation.kind !== "hidden") journeyKinds.add(ui.journeyPresentation.kind);
    realmIdentities.set(game.progression.stage, {
      stage: game.progression.stage,
      label: ui.realmIdentity.label,
      accent: ui.realmIdentity.accent
    });
    game.visuals.projectiles.forEach((projectile) => {
      if (!projectile.sourceGongfaId) return;
      projectileHierarchy.set(projectile.sourceGongfaId, {
        sourceGongfaId: projectile.sourceGongfaId,
        visualTier: projectile.visualTier,
        alpha: projectile.alpha,
        depth: projectile.depth
      });
    });
    game.audio.recentCues.forEach((cue) => audioCues.add(cue));
    maxEnemies = Math.max(maxEnemies, game.counts.enemies);
    const checkpoint: MachineCheckpoint = {
      label,
      stage: game.progression.stage,
      phase: game.progression.realmPhase,
      realmProgress: game.progression.realmProgress,
      learnedGongfaCount: game.progression.learnedGongfaIds.length,
      masteryRank: game.progression.masteryRank,
      kills: game.progression.kills,
      health: game.player.health,
      enemyCount: game.counts.enemies,
      arenaVariant: game.visuals.arena.variantId,
      choiceTitle: game.choice?.title ?? "",
      journeyKind: ui.journeyPresentation.kind
    };
    checkpoints.push(checkpoint);
    return checkpoint;
  };

  const recordChoice = async (): Promise<string | undefined> => {
    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    if (!snapshot.choice) return undefined;
    choices.push({
      title: snapshot.choice.title,
      stage: snapshot.progression.stage,
      phase: snapshot.progression.realmPhase,
      optionCount: snapshot.choice.options.length
    });
    return snapshot.choice.title;
  };

  const collectQi = async (qiValue: number): Promise<void> => {
    await page.evaluate((value) => window.__gameTest!.forceSpawnQiOrb(value), qiValue);
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
      maxEnemies = Math.max(maxEnemies, snapshot.counts.enemies);
      if (snapshot.choice?.title.includes("Tribulation")) {
        return;
      }
      if (snapshot.counts.orbs === 0) return;
      if (snapshot.choice) {
        await recordChoice();
        await page.evaluate(() => window.__gameTest!.selectChoice(0));
        continue;
      }
      const orb = snapshot.counts.orbPositions[0];
      if (!orb) {
        await page.waitForTimeout(50);
        continue;
      }
      const dx = orb.x - snapshot.player.x;
      const dy = orb.y - snapshot.player.y;
      const key = Math.abs(dx) >= Math.abs(dy)
        ? dx >= 0 ? "d" : "a"
        : dy >= 0 ? "s" : "w";
      await page.keyboard.down(key);
      await page.waitForTimeout(60);
      await page.keyboard.up(key);
    }
    throw new Error("Machine Run could not collect the forced Qi Orb");
  };

  const reachJourneyChoice = async (): Promise<string> => {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const title = await page.evaluate(() => window.__gameTest!.getSnapshot().choice?.title);
      if (title?.includes("Tribulation")) return title;
      if (title) {
        await recordChoice();
        await page.evaluate(() => window.__gameTest!.selectChoice(0));
        continue;
      }
      await collectQi(26);
      await page.evaluate(() => window.__gameTest!.forceClearEnemies());
    }
    throw new Error("Machine Run did not reach its next journey choice");
  };

  const reachNextRealmPhase = async (): Promise<void> => {
    const before = await page.evaluate(() => window.__gameTest!.getSnapshot().progression);
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const progression = await page.evaluate(() => window.__gameTest!.getSnapshot().progression);
      if (progression.realmPhase !== before.realmPhase) {
        const ui = await page.evaluate(() => window.__gameTest!.getUiSnapshot());
        phaseMilestones.push(`${before.stage}:${before.realmPhase}->${progression.realmPhase}`);
        expect(ui.realmProgressBar).toMatchObject({
          phase: progression.realmPhase,
          completedMilestones: realmPhaseOrder.indexOf(progression.realmPhase)
        });
        expect(ui.realmProgressBar.rewardText).toContain("Foundation Growth +1");
        return;
      }
      await collectQi(26);
      await page.evaluate(() => window.__gameTest!.forceClearEnemies());
    }
    throw new Error(`Machine Run did not advance Realm Phase from ${before.realmPhase}`);
  };

  const resolveCurrentChoices = async (): Promise<void> => {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      if (!(await recordChoice())) return;
      await page.evaluate(() => window.__gameTest!.selectChoice(0));
    }
    throw new Error("Machine Run exceeded the choice-resolution safety bound");
  };

  const sampleCombat = async (label: string): Promise<void> => {
    await page.evaluate(() => window.__gameTest!.forceSpawnHealingPill(100));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.__gameTest!.forceSpawnEnemies(8));
    await page.waitForTimeout(100);
    await observe(label);
    await page.evaluate(() => window.__gameTest!.forceClearEnemies());
  };

  await page.addInitScript((runSeed) => {
    const original = Crypto.prototype.getRandomValues;
    Crypto.prototype.getRandomValues = function seeded<T extends ArrayBufferView | null>(array: T): T {
      if (array instanceof Uint32Array && array.length === 1) {
        array[0] = runSeed;
        return array;
      }
      return original.call(this, array);
    };
  }, seed);
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page.getByRole("button", { name: /Choose Candidate \d+: Fire-Metal Linggen/ }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
  await observe("Mortal opening");

  await page.evaluate(() => window.__gameTest!.forceClaimLingcao());
  await recordChoice();
  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await resolveCurrentChoices();
  await observe("Linggen awakened");
  await sampleCombat("Lianqi combat sample");

  for (const currentStage of stageOrder.slice(0, 3)) {
    for (const phase of realmPhaseOrder.slice(0, 3)) {
      await reachNextRealmPhase();
      await observe(`${currentStage} ${phase} milestone`);
    }
    const title = await reachJourneyChoice();
    await recordChoice();
    await observe(`${currentStage} ${title}`);
    await page.evaluate(() => window.__gameTest!.selectChoice(0));
    await resolveCurrentChoices();
    const entered = await page.evaluate(() => window.__gameTest!.getSnapshot().progression.stage);
    await observe(`Entered ${entered}`);
    await sampleCombat(`${entered} combat sample`);
  }

  expect(await page.evaluate(() => window.__gameTest!.getSnapshot().progression.stage)).toBe("yuanying");
  for (const phase of realmPhaseOrder.slice(0, 3)) {
    await reachNextRealmPhase();
    await observe(`yuanying ${phase} milestone`);
  }
  const heavenlyTitle = await reachJourneyChoice();
  await recordChoice();
  await observe(`yuanying ${heavenlyTitle}`);
  expect(heavenlyTitle).toBe("Yuanying Heavenly Tribulation");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await observe("Heavenly Tribulation started");
  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
  persistenceResumes += 1;
  await observe("Heavenly Tribulation resumed");

  for (let bossPhase = 0; bossPhase < 3; bossPhase += 1) {
    await page.waitForTimeout(250);
    await page.evaluate(() => window.__gameTest!.forceClearEnemies());
    await page.waitForFunction(() => Boolean(window.__gameTest!.getSnapshot().choice));
    const title = await recordChoice();
    await observe(`Boss resolution ${bossPhase + 1}`);
    if (title === "Run Complete") break;
    expect(title).toBe("Yuanying Heavenly Tribulation");
    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  }

  const finalSnapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(finalSnapshot.choice?.title).toBe("Run Complete");
  await observe("Ascendant victory");
  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await page.waitForFunction(() => !window.__gameTest);
  await page.getByRole("button", { name: "Start New Run" }).waitFor();
  const completedRuns = await page.evaluate(() => {
    const raw = window.localStorage.getItem("fqyy.profile.v1");
    return raw ? (JSON.parse(raw) as { completedRuns: number }).completedRuns : 0;
  });

  const report: MachinePlaytestReport = {
    schemaVersion: 2,
    commit: execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim(),
    seed,
    candidate: "Fire-Metal Linggen",
    startedAt,
    wallClockMs: Math.round(performance.now() - wallStart),
    completedRuns,
    persistenceResumes,
    outcome: "victory",
    checkpoints,
    choices,
    observed: {
      stages: stageOrder.filter((stage) => stages.has(stage)),
      phases: realmPhaseOrder.filter((phase) => phases.has(phase)),
      arenaVariants: expectedArenas.filter((arena) => arenaVariants.has(arena)),
      journeyKinds: (["breakthrough", "tribulation", "victory"] as JourneyPresentationKind[])
        .filter((kind) => journeyKinds.has(kind)),
      phaseMilestones,
      audioCues: [...audioCues].sort(),
      learnedGongfaCount: finalSnapshot.progression.learnedGongfaIds.length,
      maxEnemies,
      finalMasteryRank: finalSnapshot.progression.masteryRank,
      gongfaMasteries: finalSnapshot.progression.gongfaMasteries,
      realmIdentities: stageOrder.flatMap((stage) => {
        const identity = realmIdentities.get(stage);
        return identity ? [identity] : [];
      }),
      projectileHierarchy: finalSnapshot.progression.learnedGongfaIds.flatMap((gongfaId) => {
        const hierarchy = projectileHierarchy.get(gongfaId as GongfaId);
        return hierarchy ? [hierarchy] : [];
      })
    }
  };

  expect(report.observed.stages).toEqual(stageOrder);
  expect(report.observed.phases).toEqual(["chuqi", "zhongqi", "houqi", "dayuanman"]);
  expect(report.observed.arenaVariants).toEqual(expectedArenas);
  expect(report.observed.journeyKinds).toEqual(["breakthrough", "tribulation", "victory"]);
  expect(report.observed.phaseMilestones).toHaveLength(12);
  expect(report.observed.audioCues).toEqual(expect.arrayContaining([
    "phase-transition", "breakthrough", "tribulation", "victory"
  ]));
  expect(report.observed.learnedGongfaCount).toBe(4);
  expect(report.choices.length).toBeLessThanOrEqual(24);
  expect(report.choices.some(({ title }) => title === "Phase Transition")).toBe(false);
  expect(
    report.choices
      .map(({ title }) => title.match(/Mastery Rank (\d+)/)?.[1])
      .filter(Boolean)
      .map(Number)
      .every((rank) => [3, 6, 9].includes(rank))
  ).toBe(true);
  expect(report.observed.gongfaMasteries).toHaveLength(4);
  expect(report.observed.gongfaMasteries.some(({ fullyMastered }) => fullyMastered)).toBe(true);
  expect(report.observed.gongfaMasteries.some(({ fullyMastered }) => !fullyMastered)).toBe(true);
  expect(report.observed.realmIdentities).toEqual(
    stageOrder.map((stage) => ({
      stage,
      label: ARENA_VARIANTS[stage].identityLabel,
      accent: ARENA_VARIANTS[stage].primary
    }))
  );
  expect(report.observed.projectileHierarchy).toEqual([
    expect.objectContaining({ visualTier: "founding", alpha: 1, depth: 12 }),
    expect.objectContaining({ visualTier: "layered", alpha: 0.82, depth: 11 }),
    expect.objectContaining({ visualTier: "layered", alpha: 0.68, depth: 10 }),
    expect.objectContaining({ visualTier: "layered", alpha: 0.58, depth: 9 })
  ]);
  expect(report.persistenceResumes).toBe(1);
  expect(report.completedRuns).toBeGreaterThanOrEqual(1);

  const artifactDirectory = process.env.MACHINE_PLAYTEST_ARTIFACTS;
  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await writeFile(join(artifactDirectory, "latest.json"), `${JSON.stringify(report, null, 2)}\n`);
    await writeFile(join(artifactDirectory, "latest.md"), renderMachinePlaytestMarkdown(report));
  }
});
