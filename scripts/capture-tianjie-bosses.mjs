/* global window */
import { chromium } from "@playwright/test";
import { resolveChromiumExecutablePath } from "./playwright-browser.mjs";

const browser = await chromium.launch({
  headless: true,
  ...(resolveChromiumExecutablePath() ? { executablePath: resolveChromiumExecutablePath() } : {})
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript(() => {
  window.localStorage.setItem("fqyy.locale.v1", '"en"');
  const original = Crypto.prototype.getRandomValues;
  Crypto.prototype.getRandomValues = function seeded(array) {
    if (array instanceof Uint32Array && array.length === 1) {
      array[0] = 2;
      return array;
    }
    return original.call(this, array);
  };
});
await page.goto(process.argv[2] ?? "http://127.0.0.1:4173");
await page.getByRole("button", { name: "Start New Run" }).click();
await page.getByRole("button", { name: /Choose Candidate \d+: Fire-Metal Linggen/ }).click();
await page.waitForFunction(() => Boolean(window.__gameTest));
await page.evaluate(() => {
  window.__gameTest.forceClaimLingcao();
  window.__gameTest.selectChoice(0);
});

async function settleChoice() {
  await page.evaluate(() => {
    const choice = window.__gameTest.getSnapshot().choice;
    if (choice) window.__gameTest.selectChoice(0);
  });
}

async function advanceUntilBoss() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const snapshot = await page.evaluate(() => window.__gameTest.getSnapshot());
    if (snapshot.encounter.boss) return snapshot.encounter.boss;
    if (snapshot.choice) {
      await settleChoice();
    } else {
      await page.evaluate(() => {
        window.__gameTest.forceSpawnQiOrb(40);
        window.__gameTest.forceClearEnemies();
      });
    }
    await page.waitForTimeout(60);
  }
  throw new Error("Tianjie boss did not appear");
}

async function capturePaused(path) {
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => window.__gameTest.getSnapshot().paused);
  await page.waitForFunction(() => !window.__gameTest.getUiSnapshot().journeyPresentation.visible);
  await page.screenshot({ path });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !window.__gameTest.getSnapshot().paused);
}

await advanceUntilBoss();
await capturePaused("docs/visual-review/tianjie-lianqi-boss.png");

for (let stageClear = 0; stageClear < 3; stageClear += 1) {
  await page.evaluate(() => window.__gameTest.forceClearEnemies());
  await page.waitForTimeout(100);
  await advanceUntilBoss();
}

// The fourth encounter is the first Yuanying form. Clear two forms to reveal
// the final Dao Eye together with its visible collapsing safe zone.
for (let phase = 0; phase < 2; phase += 1) {
  await page.evaluate(() => window.__gameTest.forceClearEnemies());
  await page.waitForTimeout(100);
  await settleChoice();
  await page.waitForFunction(() => Boolean(window.__gameTest.getSnapshot().encounter.boss));
}
await page.waitForTimeout(100);
await capturePaused("docs/visual-review/tianjie-yuanying-final-boss.png");

await browser.close();
