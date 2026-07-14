import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function seedMetal(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const original = Crypto.prototype.getRandomValues;
    Crypto.prototype.getRandomValues = function seeded<T extends ArrayBufferView | null>(array: T): T {
      if (array instanceof Uint32Array && array.length === 1) {
        array[0] = 2;
        return array;
      }
      return original.call(this, array);
    };
  });
}

async function gameplayResources(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) =>
        /(?:phaser|game\.ts|BootScene|GameScene|player-locomotion|enemy-opening-atlas|arena-floor)/i.test(name)
      )
  );
}

test("the opening shell defers Phaser and gameplay textures until a Cultivator is chosen", async ({
  page
}) => {
  await seedMetal(page);
  await page.goto("/");
  expect(await gameplayResources(page)).toEqual([]);

  await page.getByRole("button", { name: "Start New Run" }).click();
  expect(await gameplayResources(page)).toEqual([]);

  await page.getByRole("button", { name: /Choose Candidate \d+: Metal Linggen/ }).click();
  await expect(page.getByRole("status")).toContainText("Entering the cultivation arena");
  await page.waitForFunction(() => Boolean(window.__gameTest));
  expect(await gameplayResources(page)).not.toEqual([]);
});

test("a failed lazy game handoff leaves an accessible recovery message", async ({ page }) => {
  await seedMetal(page);
  await page.route("**/src/game.ts", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page.getByRole("button", { name: /Choose Candidate \d+: Metal Linggen/ }).click();
  await expect(page.getByRole("status")).toContainText(
    "The arena could not be entered"
  );
});

test("a Run exposes realm ambience and distinct opening audio cues", async ({ page }) => {
  await seedMetal(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page.getByRole("button", { name: /Choose Candidate \d+: Metal Linggen/ }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
  await page.waitForFunction(
    () => (window.__gameTest?.getSnapshot().player.maxHealth ?? 0) > 0
  );

  let audio = await page.evaluate(() => window.__gameTest!.getSnapshot().audio);
  expect(audio).toMatchObject({ ambience: "lianqi" });

  await page.evaluate(() => window.__gameTest!.forceClaimLingcao());
  audio = await page.evaluate(() => window.__gameTest!.getSnapshot().audio);
  expect(audio.lastCue).toBe("choice-open");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  audio = await page.evaluate(() => window.__gameTest!.getSnapshot().audio);
  expect(audio.recentCues).toContain("breakthrough");
  expect(audio.cueCount).toBeGreaterThanOrEqual(2);
});

test("combat and Run pickups produce distinct restrained cue families", async ({ page }) => {
  await seedMetal(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page.getByRole("button", { name: /Choose Candidate \d+: Metal Linggen/ }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
  await page.evaluate(() => {
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceSpawnEnemies(1);
  });
  await page.waitForFunction(() =>
    window.__gameTest!.getSnapshot().audio.recentCues.includes("cast")
  );

  await page.keyboard.down("d");
  await page.keyboard.press("Space");
  await page.keyboard.up("d");
  await page.waitForFunction(
    () => !window.__gameTest!.getSnapshot().player.evade.active
  );
  await page.evaluate(() => {
    window.__gameTest!.forceDamagePlayer(20);
    window.__gameTest!.forceSpawnHealingPill(24);
    window.__gameTest!.forceSpawnSpiritTreasure("jade-heart-pendant");
  });
  await page.waitForFunction(() => {
    const cues = window.__gameTest!.getSnapshot().audio.recentCues;
    return cues.includes("healing-pill") && cues.includes("spirit-treasure");
  });

  const cues = await page.evaluate(
    () => window.__gameTest!.getSnapshot().audio.recentCues
  );
  expect(cues).toEqual(
    expect.arrayContaining(["cast", "evade", "healing-pill", "spirit-treasure"])
  );
});
