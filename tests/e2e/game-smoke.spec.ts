import { expect, test } from "@playwright/test";

async function chooseUntil(page: { evaluate: (fn: () => void) => Promise<void> }, predicate: (snapshot: { title: string } | undefined) => boolean): Promise<void> {
  for (let i = 0; i < 10; i += 1) {
    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    if (!snapshot.choice) {
      return;
    }

    if (predicate(snapshot.choice)) {
      return;
    }

    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  }
}

test("boots into game/ui scenes with the dev test harness exposed", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__gameTest));

  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.sceneName).toBe("game");
  expect(snapshot.activeScenes).toContain("game");
  expect(snapshot.activeScenes).toContain("ui");
  expect(snapshot.progression.stage).toBe("lianqi");
});

test("movement updates player position in the real browser game", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__gameTest));

  const before = await page.evaluate(() => window.__gameTest!.getSnapshot());
  await page.keyboard.down("d");
  await page.waitForTimeout(250);
  await page.keyboard.up("d");
  const after = await page.evaluate(() => window.__gameTest!.getSnapshot());

  expect(after.player.x).toBeGreaterThan(before.player.x);
});

test("auto-attacking plus forced enemies produces combat progress", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__gameTest));

  await page.evaluate(() => {
    window.__gameTest!.setRngSeed(1234);
    window.__gameTest!.forceSpawnEnemies(5);
  });
  const before = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(before.counts.enemies).toBeGreaterThanOrEqual(5);

  await page.waitForTimeout(3200);
  const after = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(after.progression.level).toBeGreaterThanOrEqual(before.progression.level);
  expect(after.progression.xp).toBeGreaterThanOrEqual(before.progression.xp);
  expect(after.counts.enemies).toBeGreaterThan(0);
});

test("forced progression can reveal Linggen, choose Gongfa, and show refinement UI", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__gameTest));

  await page.evaluate(() => {
    window.__gameTest!.setRngSeed(9);
    window.__gameTest!.forceSetLinggen("metal");
  });
  await page.evaluate(() => window.__gameTest!.forceClaimLingcao());
  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.choice?.title).toContain("Revealed");
  expect(snapshot.choice?.options.map((option) => option.id)).toEqual([
    "yujian-jue",
    "jinfeng-gong",
    "gengjin-huti"
  ]);

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await page.evaluate(() => window.__gameTest!.forceGainXp(100));
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.gongfa).not.toBe("baseline");
  expect(snapshot.choice?.title).toContain("Refinement");
});

test("dual-root reveals present Gongfa from both compatible root pools", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__gameTest));

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("water-metal");
    window.__gameTest!.forceClaimLingcao();
  });

  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.choice?.options.map((option) => option.id)).toEqual([
    "drifting-frost-needle",
    "yujian-jue",
    "black-tide-scripture"
  ]);
});

test("forced XP advances through Zhuji and Jindan thresholds in-browser", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__gameTest));

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
  });

  await page.evaluate(() => window.__gameTest!.forceGainXp(200));
  await chooseUntil(page, (choice) => choice?.title.includes("Breakthrough") ?? false);
  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");

  if (snapshot.choice) {
    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  }

  await chooseUntil(page, (choice) => choice?.title.includes("Major Breakthrough") ?? false);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("jindan");
  expect(snapshot.progression.level).toBeGreaterThanOrEqual(7);
});

test("crossing into Zhuji shows the realm breakthrough before later refinement choices", async ({
  page
}) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__gameTest));

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceGainXp(200);
  });

  await chooseUntil(page, (choice) => choice?.title.includes("Breakthrough") ?? false);
  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.choice?.title).toContain("Breakthrough");
  expect(snapshot.choice?.options[0]?.title).toContain("Enter Zhuji");
});

test("Yujian Jue gains more swords and return shots across realms", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__gameTest));

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
  });

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.gongfa).toBe("yujian-jue");
  expect(snapshot.combat.count).toBe(1);
  expect(snapshot.combat.returnShots).toBe(0);

  await page.evaluate(() => window.__gameTest!.forceGainXp(200));
  await chooseUntil(page, (choice) => choice?.title.includes("Breakthrough") ?? false);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.combat.count).toBeGreaterThanOrEqual(2);
  expect(snapshot.combat.pierce).toBeGreaterThanOrEqual(2);

  if (snapshot.choice) {
    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  }

  await chooseUntil(page, (choice) => choice?.title.includes("Major Breakthrough") ?? false);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("jindan");
  expect(snapshot.combat.count).toBeGreaterThanOrEqual(3);
  expect(snapshot.combat.returnShots).toBeGreaterThanOrEqual(1);
});

test("Jinfeng Gong broadens at Zhuji and gains lingering follow-up cuts at Jindan", async ({
  page
}) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__gameTest));

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(1);
  });

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.gongfa).toBe("jinfeng-gong");
  expect(snapshot.combat.pattern).toBe("wave");
  expect(snapshot.combat.count).toBe(2);
  expect(snapshot.combat.range).toBe(140);
  expect(snapshot.combat.returnShots).toBe(0);

  await page.evaluate(() => window.__gameTest!.forceGainXp(200));
  await chooseUntil(page, (choice) => choice?.title.includes("Breakthrough") ?? false);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.combat.count).toBeGreaterThanOrEqual(3);
  expect(snapshot.combat.range).toBeGreaterThan(140);
  expect(snapshot.combat.pierce).toBeGreaterThanOrEqual(2);

  if (snapshot.choice) {
    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  }

  await chooseUntil(page, (choice) => choice?.title.includes("Major Breakthrough") ?? false);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("jindan");
  expect(snapshot.combat.count).toBeGreaterThanOrEqual(4);
  expect(snapshot.combat.returnShots).toBeGreaterThanOrEqual(2);
});

test("Gengjin Huti expands aura and retaliation across realms", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__gameTest));

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(2);
  });

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.gongfa).toBe("gengjin-huti");
  expect(snapshot.combat.pattern).toBe("aura");
  expect(snapshot.combat.auraRadius).toBe(92);
  expect(snapshot.combat.retaliationDamage).toBe(8);
  expect(snapshot.combat.shellBursts).toBe(0);

  await page.evaluate(() => window.__gameTest!.forceGainXp(200));
  await chooseUntil(page, (choice) => choice?.title.includes("Breakthrough") ?? false);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.combat.auraRadius).toBeGreaterThan(92);
  expect(snapshot.combat.retaliationDamage).toBeGreaterThan(8);

  if (snapshot.choice) {
    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  }

  await chooseUntil(page, (choice) => choice?.title.includes("Major Breakthrough") ?? false);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("jindan");
  expect(snapshot.combat.auraRadius).toBeGreaterThanOrEqual(128);
  expect(snapshot.combat.retaliationDamage).toBeGreaterThanOrEqual(20);
  expect(snapshot.combat.pierce).toBeGreaterThanOrEqual(2);
  expect(snapshot.combat.shellBursts).toBeGreaterThanOrEqual(1);
});
