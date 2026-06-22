import { expect, test } from "@playwright/test";

async function startNewRun(page: {
  goto: (url: string) => Promise<void>;
  getByRole: (role: string, options: { name: string }) => { click: () => Promise<void> };
  waitForFunction: (fn: () => boolean) => Promise<void>;
}) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
}

function expectHudLines(snapshot: { hud: { lines: string[] } }, expected: string[]): void {
  expect(snapshot.hud.lines).toEqual(expected);
}

test("HUD mirrors the live run state from opening through Gongfa selection", async ({ page }) => {
  await startNewRun(page);

  const opening = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expectHudLines(opening, [
    "Cultivator: Outer Peak Wanderer",
    "Stage: Lianqi",
    "Phase: chuqi | Qi: 0 / 100",
    "Stage breakthrough: waiting",
    "Foundation Growth: 0",
    "Mastery: Rank 0 | Progress 0 / 100 | Skill 2: Locked | Casts: 0",
    "Gale Momentum: 0.00 | Skill Tags: none",
    "Guard: 0.0 | Mitigation: 0% | Blade Shell: 0 (0%)",
    "Linggen: Unrevealed | Grades: Hidden",
    "Gongfa: Crude Qi Thread",
    "Vitality: 100 / 100",
    "Method: 1 | Damage: 9 | Cooldown: 1150ms",
    "Movement: 220 | Kills: 0",
    "Lingcao: unclaimed | Run Timer: 05:59"
  ]);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
  });

  const revealed = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(revealed.choice?.title).toBe("Metal Linggen Revealed");
  expect(revealed.progression.lingcaoCollected).toBe(true);
  expect(revealed.hud.lines[8]).toBe("Linggen: Unrevealed | Grades: Hidden");
  expect(revealed.hud.lines[9]).toBe("Gongfa: Crude Qi Thread");
  expect(revealed.hud.lines[13]).toBe("Lingcao: claimed | Run Timer: 05:59");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));

  const afterChoice = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterChoice.choice).toBeUndefined();
  expect(afterChoice.hud.lines).toEqual([
    "Cultivator: Outer Peak Wanderer",
    "Stage: Lianqi",
    "Phase: chuqi | Qi: 0 / 100",
    "Stage breakthrough: waiting",
    "Foundation Growth: 0",
    "Mastery: Rank 0 | Progress 0 / 100 | Skill 2: Locked | Casts: 0",
    "Gale Momentum: 0.00 | Skill Tags: projectile, metal, sword",
    "Guard: 0.0 | Mitigation: 0% | Blade Shell: 0 (0%)",
    "Linggen: Metal Linggen | Grades: Strong",
    "Gongfa: Yujian Jue",
    "Vitality: 100 / 100",
    "Method: 1 | Damage: 15 | Cooldown: 850ms",
    "Movement: 220 | Kills: 0",
    "Lingcao: claimed | Run Timer: 05:59"
  ]);
});

test("HUD registry state exposes masteryProgress to the live UI payload", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceGrantQi(10);
  });

  const hud = await page.evaluate(() => window.__gameTest!.getHudState());
  expect(hud.masteryProgress).toBeDefined();
  expect(hud.masteryProgress).not.toBe("undefined");
});

test("Qi at 100 marks the current Stage as breakthrough-ready in the live HUD", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceSpawnEnemies(1);
    window.__gameTest!.forceGrantQi(100);
  });

  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("lianqi");
  expect(snapshot.progression.stageBreakthroughReady).toBe(true);
  expect(snapshot.hud.lines).toContain("Stage breakthrough: ready");
});

test("HUD shows mastery gain, rank-up feedback, and the first realm cleanup", async ({
  page
}) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
  });

  await page.evaluate(() => window.__gameTest!.forceGrantQi(10));
  const afterSmallQi = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterSmallQi.progression.masteryProgress).toBeGreaterThan(0);
  expect(afterSmallQi.hud.lines[5]).toContain("Progress ");
  expect(afterSmallQi.message).toBe("Yujian Jue circulates through your meridians.");

  await page.evaluate(() => window.__gameTest!.forceGrantQi(100));
  const afterRankUp = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterRankUp.progression.masteryRank).toBeGreaterThanOrEqual(1);
  expect(afterRankUp.message).toContain("mastery reaches Rank");
  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await page.evaluate(() => window.__gameTest!.selectChoice(0));

  await page.evaluate(() => {
    window.__gameTest!.forceAdvanceRealmProgress(100);
    window.__gameTest!.forceClearEnemies();
  });

  const phaseCleanup = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(phaseCleanup.choice?.title).toBe("Phase Transition");
  expect(phaseCleanup.hud.lines[2]).toBe("Phase: chuqi | Qi: 100 / 100");
  expect(phaseCleanup.hud.lines[3]).toBe("Stage breakthrough: ready");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  const afterPhase = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterPhase.hud.lines[2]).toBe("Phase: zhongqi | Qi: 0 / 100");
  expect(afterPhase.hud.lines[3]).toBe("Stage breakthrough: waiting");
  expect(afterPhase.hud.lines[4]).toBe("Foundation Growth: 1");
});

test("HUD state survives a checkpoint resume without changing the visible progression", async ({
  page
}) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceAdvanceRealmProgress(100);
    window.__gameTest!.forceClearEnemies();
    window.__gameTest!.selectChoice(0);
  });

  const beforeReload = await page.evaluate(() => window.__gameTest!.getSnapshot());

  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));

  const afterReload = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterReload.hud.lines).toEqual(beforeReload.hud.lines);
  expect(afterReload.progression).toEqual(beforeReload.progression);
});
