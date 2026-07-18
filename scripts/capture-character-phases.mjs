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
await page.getByRole("button", { name: /Choose Candidate \d+: Metal Linggen/ }).click();
await page.waitForFunction(() => Boolean(window.__gameTest));
await page.evaluate(() => {
  window.__gameTest.forceClaimLingcao();
  window.__gameTest.selectChoice(0);
  window.__gameTest.forceClearEnemies();
});

const phases = ["chuqi", "zhongqi", "houqi", "dayuanman"];
const clip = { x: 430, y: 205, width: 420, height: 310 };

async function settleForCapture() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const settled = await page.evaluate(() => {
      const choice = window.__gameTest.getSnapshot().choice;
      if (choice) window.__gameTest.selectChoice(0);
      window.__gameTest.forceClearEnemies();
      const snapshot = window.__gameTest.getSnapshot();
      const ui = window.__gameTest.getUiSnapshot();
      return !snapshot.choice &&
        !ui.journeyPresentation.visible &&
        snapshot.player.visual.mode === "idle" &&
        snapshot.player.visual.activeVfx.length === 0 &&
        snapshot.counts.enemies === 0 &&
        snapshot.counts.projectiles === 0 &&
        snapshot.visuals.projectileImpacts.length === 0 &&
        snapshot.visuals.pickups.collectionEffects.length === 0 &&
        snapshot.visuals.lingcao.collectionEffects.length === 0;
    });
    if (settled) return;
    await page.waitForTimeout(60);
  }
  throw new Error("Character did not reach an unobstructed idle presentation");
}

for (const [index, phase] of phases.entries()) {
  await page.waitForFunction(
    (expectedPhase) =>
      window.__gameTest.getSnapshot().progression.realmPhase === expectedPhase &&
      !window.__gameTest.getSnapshot().choice,
    phase
  );
  await settleForCapture();
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => window.__gameTest.getSnapshot().paused);
  await page.screenshot({
    path: `docs/visual-review/character-${phase}.png`,
    clip
  });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !window.__gameTest.getSnapshot().paused);

  if (index === phases.length - 1) break;
  await page.evaluate(() => window.__gameTest.forceSpawnQiOrb(30));
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await page.evaluate(() => {
      const choice = window.__gameTest.getSnapshot().choice;
      if (choice) window.__gameTest.selectChoice(0);
      window.__gameTest.forceClearEnemies();
    });
    const currentPhase = await page.evaluate(
      () => window.__gameTest.getSnapshot().progression.realmPhase
    );
    if (currentPhase !== phase) break;
    await page.waitForTimeout(60);
  }
}

await browser.close();
