import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function startNewRun(page: Page) {
  await page.addInitScript((runSeed) => {
    const original = Crypto.prototype.getRandomValues;
    Crypto.prototype.getRandomValues = function getSeededRandomValues<T extends ArrayBufferView | null>(array: T): T {
      if (array instanceof Uint32Array && array.length === 1) {
        array[0] = runSeed;
        return array;
      }
      return original.call(this, array);
    };
  }, 2);
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page.getByRole("button", { name: /Choose Candidate \d+: Metal Linggen/ }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
}

function expectHudLines(snapshot: { hud: { lines: string[] } }, expected: string[]): void {
  expect(snapshot.hud.lines).toEqual(expected);
}

async function collectQiOrb(page: Page, qiValue: number): Promise<void> {
  await page.evaluate((value) => window.__gameTest!.forceSpawnQiOrb(value), qiValue);
  for (let i = 0; i < 12; i += 1) {
    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    if (snapshot.counts.orbs === 0) {
      return;
    }

    const [orb] = snapshot.counts.orbPositions;
    if (!orb) {
      await page.waitForTimeout(60);
      continue;
    }

    const dx = orb.x - snapshot.player.x;
    const dy = orb.y - snapshot.player.y;
    const key = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? "d" : "a") : dy >= 0 ? "s" : "w";
    await page.keyboard.down(key);
    await page.waitForTimeout(60);
    await page.keyboard.up(key);
  }

  await page.waitForFunction(() => window.__gameTest!.getSnapshot().counts.orbs === 0);
}

async function claimOpeningLingcao(page: Page): Promise<void> {
  for (let i = 0; i < 80; i += 1) {
    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    if (snapshot.progression.lingcaoCollected) {
      return;
    }

    const [lingcao] = snapshot.counts.lingcaoPositions;
    if (!lingcao) {
      await page.waitForTimeout(25);
      continue;
    }

    const dx = lingcao.x - snapshot.player.x;
    const dy = lingcao.y - snapshot.player.y;
    const key = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? "d" : "a") : dy >= 0 ? "s" : "w";
    await page.keyboard.down(key);
    await page.waitForTimeout(45);
    await page.keyboard.up(key);
  }

  await page.waitForFunction(() => window.__gameTest!.getSnapshot().progression.lingcaoCollected);
}

async function resolveMasteryChoices(page: Page): Promise<void> {
  for (let i = 0; i < 20; i += 1) {
    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    if (!snapshot.choice?.title.includes("Mastery Rank")) {
      return;
    }
    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  }
}

async function reachPhaseChoiceThroughQi(page: Page): Promise<void> {
  const existing = await page.evaluate(() => window.__gameTest!.getSnapshot().choice?.title);
  if (existing === "Phase Transition") {
    return;
  }

  await collectQiOrb(page, 100);
  await page.evaluate(() => window.__gameTest!.forceClearEnemies());
  await resolveMasteryChoices(page);
  await page.evaluate(() => window.__gameTest!.forceClearEnemies());
  await page.waitForFunction(() => window.__gameTest!.getSnapshot().choice?.title === "Phase Transition");
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
    "Evade: Ready",
    "Lingcao: unclaimed",
    "Spirit Treasures: none"
  ]);
  await claimOpeningLingcao(page);

  const revealed = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(revealed.choice?.title).toBe("Metal Linggen Revealed");
  expect(revealed.progression.lingcaoCollected).toBe(true);
  expect(revealed.hud.lines[8]).toBe("Linggen: Unrevealed | Grades: Hidden");
  expect(revealed.hud.lines[9]).toBe("Gongfa: Crude Qi Thread");
  expect(revealed.hud.lines[14]).toBe("Lingcao: claimed");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));

  const afterChoice = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterChoice.choice).toBeUndefined();
  expect(afterChoice.hud.lines.slice(0, 14)).toEqual([
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
    "Evade: Ready"
  ]);
  expect(afterChoice.hud.lines[14]).toBe("Lingcao: claimed");
});

test("HUD shows evade readiness, active invulnerability, and cooldown", async ({ page }) => {
  await startNewRun(page);
  expect((await page.evaluate(() => window.__gameTest!.getSnapshot())).hud.lines).toContain(
    "Evade: Ready"
  );

  await page.keyboard.down("d");
  await page.keyboard.down("Space");
  await page.waitForTimeout(30);
  await page.keyboard.up("Space");
  await page.keyboard.up("d");
  expect((await page.evaluate(() => window.__gameTest!.getSnapshot())).hud.lines).toContain(
    "Evade: Active"
  );

  await page.waitForFunction(() => {
    const evadeLine = window.__gameTest!
      .getSnapshot()
      .hud.lines.find((line) => line.startsWith("Evade: "));
    return Boolean(evadeLine && /^Evade: \d\.\ds$/.test(evadeLine));
  });
  const coolingDown = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(coolingDown.hud.lines.find((line) => line.startsWith("Evade: "))).toMatch(
    /^Evade: \d\.\ds$/
  );

  await page.waitForFunction(() =>
    window.__gameTest!.getSnapshot().hud.lines.includes("Evade: Ready")
  );
  expect((await page.evaluate(() => window.__gameTest!.getSnapshot())).hud.lines).toContain(
    "Evade: Ready"
  );
});

test("HUD registry state exposes masteryProgress to the live UI payload", async ({ page }) => {
  await startNewRun(page);
  await claimOpeningLingcao(page);
  await page.evaluate(() => {
    window.__gameTest!.selectChoice(0);
  });
  await collectQiOrb(page, 10);

  const hud = await page.evaluate(() => window.__gameTest!.getHudState());
  expect(hud.masteryProgress).toBeDefined();
  expect(hud.masteryProgress).not.toBe("undefined");
});

test("Qi at 100 marks the current Stage as breakthrough-ready in the live HUD", async ({ page }) => {
  await startNewRun(page);
  await claimOpeningLingcao(page);
  await page.evaluate(() => {
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceSpawnEnemies(1);
  });
  await collectQiOrb(page, 100);

  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("lianqi");
  expect(snapshot.progression.stageBreakthroughReady).toBe(true);
  expect(snapshot.hud.lines).toContain("Stage breakthrough: ready");
});

test("HUD shows mastery gain, rank-up feedback, and the first realm cleanup", async ({
  page
}) => {
  await startNewRun(page);
  await claimOpeningLingcao(page);
  await page.evaluate(() => {
    window.__gameTest!.selectChoice(0);
  });

  await collectQiOrb(page, 10);
  const afterSmallQi = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterSmallQi.progression.masteryProgress).toBeGreaterThan(0);
  expect(afterSmallQi.hud.lines[5]).toContain("Progress ");
  expect(afterSmallQi.message).toBe("Yujian Jue circulates through your meridians.");

  await collectQiOrb(page, 100);
  const afterRankUp = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterRankUp.progression.masteryRank).toBeGreaterThanOrEqual(1);
  expect(afterRankUp.message).toContain("mastery reaches Rank");
  while (true) {
    const masterySnapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    if (!masterySnapshot.choice?.title?.includes("Mastery Rank")) {
      break;
    }

    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  }

  await reachPhaseChoiceThroughQi(page);

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
  await claimOpeningLingcao(page);
  await page.evaluate(() => {
    window.__gameTest!.selectChoice(0);
  });
  await reachPhaseChoiceThroughQi(page);
  await page.evaluate(() => window.__gameTest!.selectChoice(0));

  const beforeReload = await page.evaluate(() => window.__gameTest!.getSnapshot());

  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));

  const afterReload = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterReload.hud.lines).toEqual(beforeReload.hud.lines);
  expect(afterReload.progression).toEqual(beforeReload.progression);
});
