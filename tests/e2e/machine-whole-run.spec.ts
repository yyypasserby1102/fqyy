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

test("machine square-kiting takes pressure without becoming an unavoidable death", async ({ page }) => {
  test.skip(!process.env.MACHINE_PLAYTEST_ARTIFACTS, "Dedicated one-worker machine-playtest only");
  test.setTimeout(70_000);
  await page.addInitScript(() => {
    let state = 1_337;
    Math.random = () => {
      state = (state * 16_807) % 2_147_483_647;
      return (state - 1) / 2_147_483_646;
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page.getByRole("button", { name: /Choose Candidate \d+:/ }).first().click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
  await page.evaluate(() => {
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceSetIncomingDamageDisabled(true);
  });

  for (let phase = 0; phase < 3; phase += 1) {
    const before = await page.evaluate(() => window.__gameTest!.getSnapshot().progression.realmPhase);
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await page.evaluate(() => window.__gameTest!.forceSpawnQiOrb(100));
      for (let movement = 0; movement < 30; movement += 1) {
        const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
        if (snapshot.choice && !snapshot.choice.title.includes("Tribulation")) {
          await page.evaluate(() => window.__gameTest!.selectChoice(0));
          continue;
        }
        const orb = snapshot.counts.orbPositions[0];
        if (!orb) break;
        const dx = orb.x - snapshot.player.x;
        const dy = orb.y - snapshot.player.y;
        const key = Math.abs(dx) >= Math.abs(dy)
          ? dx >= 0 ? "d" : "a"
          : dy >= 0 ? "s" : "w";
        await page.keyboard.down(key);
        await page.waitForTimeout(50);
        await page.keyboard.up(key);
      }
      await page.evaluate(() => window.__gameTest!.forceClearEnemies());
      const current = await page.evaluate(() => window.__gameTest!.getSnapshot().progression.realmPhase);
      if (current !== before) break;
    }
  }
  await expect.poll(() => page.evaluate(
    () => window.__gameTest!.getSnapshot().progression.realmPhase
  )).toBe("dayuanman");
  await page.evaluate(() => {
    window.__gameTest!.forceClearEnemies();
    window.__gameTest!.forceSpawnHealingPill(10_000);
    window.__gameTest!.forceSetIncomingDamageDisabled(false);
    window.__gameTest!.forceSpawnEnemies(8);
  });
  await page.waitForFunction(() => window.__gameTest!.getSnapshot().counts.enemies >= 6);

  const samples: Array<{ elapsedMs: number; health: number; enemies: number }> = [];
  const started = performance.now();
  const tightSquare = Array.from({ length: 2 }, () => ["d", "s", "a", "w"]).flat();
  for (const key of tightSquare) {
    await page.keyboard.down(key);
    await page.waitForTimeout(420);
    await page.keyboard.up(key);
    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    samples.push({
      elapsedMs: Math.round(performance.now() - started),
      health: snapshot.player.health,
      enemies: snapshot.counts.enemies
    });
    if (snapshot.gameOver) break;
  }

  const final = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(Math.min(...samples.map((sample) => sample.health))).toBeLessThan(final.player.maxHealth);
  expect(final.player.health).toBeGreaterThan(0);
  expect(Math.max(...samples.map((sample) => sample.enemies))).toBeGreaterThanOrEqual(6);

  const artifacts = process.env.MACHINE_PLAYTEST_ARTIFACTS;
  if (artifacts) {
    await mkdir(artifacts, { recursive: true });
    await writeFile(join(artifacts, "anti-kiting.json"), JSON.stringify({
      pattern: "clockwise-square",
      stage: final.progression.stage,
      phase: final.progression.realmPhase,
      durationMs: Math.round(performance.now() - started),
      maxHealth: final.player.maxHealth,
      finalHealth: final.player.health,
      survived: !final.gameOver,
      samples
    }, null, 2));
  }
});

test("machine-driven whole Run reaches victory and emits feel evidence", async ({ page }) => {
  test.skip(!process.env.MACHINE_PLAYTEST_ARTIFACTS, "Dedicated one-worker machine-playtest only");
  test.setTimeout(240_000);
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
    const before = await page.evaluate(() => window.__gameTest!.getSnapshot().progression);
    await page.evaluate((value) => window.__gameTest!.forceSpawnQiOrb(value), qiValue);
    for (let attempt = 0; attempt < 70; attempt += 1) {
      const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
      maxEnemies = Math.max(maxEnemies, snapshot.counts.enemies);
      if (
        snapshot.progression.stage !== before.stage ||
        snapshot.progression.realmPhase !== before.realmPhase ||
        snapshot.progression.realmProgress !== before.realmProgress ||
        snapshot.progression.masteryPoints !== before.masteryPoints ||
        snapshot.progression.masteryRank !== before.masteryRank
      ) {
        return;
      }
      if (snapshot.choice?.title.includes("Tribulation")) {
        return;
      }
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
    const final = await page.evaluate(() => window.__gameTest!.getSnapshot());
    throw new Error(`Machine Run could not collect the forced Qi Orb: ${JSON.stringify({
      stage: final.progression.stage,
      phase: final.progression.realmPhase,
      progress: final.progression.realmProgress,
      paused: final.paused,
      choice: final.choice?.title,
      orbs: final.counts.orbPositions,
      player: { x: final.player.x, y: final.player.y },
      tribulationActive: final.encounter.tribulationActive,
      enemies: final.counts.enemies
    })}`);
  };

  const reachJourneyChoice = async (finishFoundingMastery = false): Promise<string> => {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const title = await page.evaluate(() => window.__gameTest!.getSnapshot().choice?.title);
      if (title?.includes("Tribulation")) return title;
      if (title) {
        await recordChoice();
        await page.evaluate(() => window.__gameTest!.selectChoice(0));
        continue;
      }
      await collectQi(26);
      if (finishFoundingMastery) {
        for (let masteryAttempt = 0; masteryAttempt < 8; masteryAttempt += 1) {
          const progression = await page.evaluate(() => window.__gameTest!.getSnapshot().progression);
          if (progression.realmProgress < 100 || progression.masteryRank >= 22) break;
          await collectQi(26);
        }
      }
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
        expect(ui.realmProgressBar.rewardText).toContain("+1 damage");
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
    for (let sample = 0; sample < 12; sample += 1) {
      await page.waitForTimeout(100);
      const game = await page.evaluate(() => window.__gameTest!.getSnapshot());
      game.visuals.projectiles.forEach((projectile) => {
        if (!projectile.sourceGongfaId) return;
        projectileHierarchy.set(projectile.sourceGongfaId, {
          sourceGongfaId: projectile.sourceGongfaId,
          visualTier: projectile.visualTier,
          alpha: projectile.alpha,
          depth: projectile.depth
        });
      });
    }
    await observe(label);
    await page.evaluate(() => window.__gameTest!.forceClearEnemies());
  };

  const fightUntil = async (done: () => Promise<boolean>, label: string): Promise<void> => {
    for (let attempt = 0; attempt < 180; attempt += 1) {
      const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
      if (snapshot.gameOver) throw new Error(`${label} killed the movement/Evade machine build`);
      if (snapshot.choice?.title.includes("Mastery Rank")) {
        await recordChoice();
        await page.evaluate(() => window.__gameTest!.selectChoice(0));
        continue;
      }
      if (await done()) return;
      if (attempt > 0 && attempt % 4 === 0 && snapshot.encounter.boss) {
        await page.evaluate(() => window.__gameTest!.forceDamageBoss(10_000));
      }
      const nearest = snapshot.counts.enemyPositions.reduce<
        (typeof snapshot.counts.enemyPositions)[number] | undefined
      >((best, enemy) => {
        if (!best) return enemy;
        const bestDistance = Math.hypot(best.x - snapshot.player.x, best.y - snapshot.player.y);
        const enemyDistance = Math.hypot(enemy.x - snapshot.player.x, enemy.y - snapshot.player.y);
        return enemyDistance < bestDistance ? enemy : best;
      }, undefined);
      const dx = (nearest?.x ?? snapshot.player.x) - snapshot.player.x;
      const dy = (nearest?.y ?? snapshot.player.y) - snapshot.player.y;
      const distance = Math.hypot(dx, dy);
      const key = distance > 48
        ? Math.abs(dx) >= Math.abs(dy)
          ? dx >= 0 ? "d" : "a"
          : dy >= 0 ? "s" : "w"
        : attempt % 2 === 0
          ? dy >= 0 ? "a" : "d"
          : dx >= 0 ? "s" : "w";
      await page.keyboard.down(key);
      await page.keyboard.press("Space");
      await page.waitForTimeout(250);
      await page.keyboard.up(key);
    }
    const final = await page.evaluate(() => window.__gameTest!.getSnapshot());
    throw new Error(`${label} did not resolve through production combat: ${JSON.stringify({
      enemies: final.counts.enemies,
      projectiles: final.counts.projectiles,
      health: final.player.health,
      player: { x: final.player.x, y: final.player.y },
      enemyPositions: final.counts.enemyPositions,
      paused: final.paused,
      choice: final.choice?.title,
      gongfa: final.progression.gongfa,
      combat: final.combat
    })}`);
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
  await page.evaluate(() => window.__gameTest!.selectChoice(1));
  await resolveCurrentChoices();
  await page.evaluate(() => window.__gameTest!.forceSetIncomingDamageDisabled(true));
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
    await page.waitForFunction(() => window.__gameTest!.getSnapshot().encounter.tribulationActive);
    await observe(`${currentStage} Tribulation combat`);
    await fightUntil(
      () => page.evaluate((stage) => window.__gameTest!.getSnapshot().progression.stage !== stage, currentStage),
      `${currentStage} Tribulation`
    );
    await page.waitForFunction(
      (stage) => window.__gameTest!.getSnapshot().progression.stage !== stage,
      currentStage
    );
    await resolveCurrentChoices();
    const entered = await page.evaluate(() => window.__gameTest!.getSnapshot().progression.stage);
    await observe(`Entered ${entered}`);
    await sampleCombat(`${entered} combat sample`);
  }

  expect(await page.evaluate(() => window.__gameTest!.getSnapshot().progression.stage)).toBe("yuanying");
  while (
    (await page.evaluate(() => window.__gameTest!.getSnapshot().progression.realmPhase)) !==
    "dayuanman"
  ) {
    const phase = await page.evaluate(
      () => window.__gameTest!.getSnapshot().progression.realmPhase
    );
    await reachNextRealmPhase();
    await observe(`yuanying ${phase} milestone`);
  }
  const heavenlyTitle = await reachJourneyChoice(true);
  await recordChoice();
  await observe(`yuanying ${heavenlyTitle}`);
  expect(heavenlyTitle).toBe("Yuanying Heavenly Tribulation");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await observe("Heavenly Tribulation started");
  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
  await page.evaluate(() => window.__gameTest!.forceSetIncomingDamageDisabled(true));
  persistenceResumes += 1;
  await observe("Heavenly Tribulation resumed");

  for (let bossPhase = 0; bossPhase < 3; bossPhase += 1) {
    await fightUntil(
      () => page.evaluate(() => Boolean(window.__gameTest!.getSnapshot().choice)),
      `Heavenly Tribulation phase ${bossPhase + 1}`
    );
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
  expect(report.observed.projectileHierarchy.length).toBeLessThanOrEqual(
    report.observed.learnedGongfaCount
  );
  expect(report.persistenceResumes).toBe(1);
  expect(report.completedRuns).toBeGreaterThanOrEqual(1);

  const artifactDirectory = process.env.MACHINE_PLAYTEST_ARTIFACTS;
  if (artifactDirectory) {
    await mkdir(artifactDirectory, { recursive: true });
    await writeFile(join(artifactDirectory, "latest.json"), `${JSON.stringify(report, null, 2)}\n`);
    await writeFile(join(artifactDirectory, "latest.md"), renderMachinePlaytestMarkdown(report));
  }
});
