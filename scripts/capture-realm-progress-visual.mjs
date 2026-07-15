/* global window */
import { chromium } from "@playwright/test";
import { resolveChromiumExecutablePath } from "./playwright-browser.mjs";

const browser = await chromium.launch({
  headless: true,
  ...(resolveChromiumExecutablePath() ? { executablePath: resolveChromiumExecutablePath() } : {})
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript(() => {
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
await page.getByRole("button", { name: /Choose Candidate \d+: Metal Linggen/ }).click();
await page.waitForFunction(() => Boolean(window.__gameTest));
await page.evaluate(() => {
  window.__gameTest.forceClaimLingcao();
  window.__gameTest.selectChoice(0);
  window.__gameTest.forceSpawnQiOrb(100);
});
await page.waitForFunction(() => window.__gameTest.getSnapshot().counts.orbs === 0);
for (let attempt = 0; attempt < 8; attempt += 1) {
  await page.evaluate(() => {
    const choice = window.__gameTest.getSnapshot().choice;
    if (choice?.title.includes("Mastery Rank")) window.__gameTest.selectChoice(0);
    window.__gameTest.forceClearEnemies();
  });
  const phase = await page.evaluate(() => window.__gameTest.getSnapshot().progression.realmPhase);
  if (phase === "zhongqi") break;
  await page.waitForTimeout(100);
}
await page.waitForFunction(() =>
  window.__gameTest.getUiSnapshot().realmProgressBar.phase === "zhongqi"
);
for (let attempt = 0; attempt < 4; attempt += 1) {
  const hasChoice = await page.evaluate(() => Boolean(window.__gameTest.getSnapshot().choice));
  if (!hasChoice) break;
  await page.evaluate(() => window.__gameTest.selectChoice(0));
}
await page.screenshot({ path: "docs/visual-review/realm-progress-bar.png" });
await browser.close();
