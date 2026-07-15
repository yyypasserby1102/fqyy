import { expect, test } from "@playwright/test";

test("settings persist independently and apply display accessibility immediately", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open settings" }).click();
  await expect(page.getByRole("dialog", { name: "Cultivation Settings" })).toBeVisible();

  await page.getByRole("slider", { name: "Master volume" }).fill("42");
  await page.getByLabel("Mute all audio").check();
  await page.getByRole("slider", { name: "Camera shake" }).fill("0");
  await page.getByLabel("Reduce motion and flashes").check();
  await page.getByLabel("Display scale").selectOption("1.15");

  const stored = await page.evaluate(() => ({
    settings: JSON.parse(window.localStorage.getItem("fqyy.settings.v1") ?? "null"),
    run: window.localStorage.getItem("fqyy.active-run.v1"),
    scale: getComputedStyle(document.documentElement).getPropertyValue("--fqyy-display-scale").trim(),
    reducedMotion: document.documentElement.classList.contains("reduced-motion")
  }));
  expect(stored.settings).toMatchObject({
    masterVolume: 0.42,
    muted: true,
    reducedMotion: true,
    cameraShake: 0,
    displayScale: 1.15
  });
  expect(stored.run).toBeNull();
  expect(stored.scale).toBe("1.15");
  expect(stored.reducedMotion).toBe(true);

  await page.reload();
  await page.getByRole("button", { name: "Open settings" }).click();
  await expect(page.getByRole("slider", { name: "Master volume" })).toHaveValue("42");
  await expect(page.getByLabel("Mute all audio")).toBeChecked();
  await expect(page.getByLabel("Display scale")).toHaveValue("1.15");
});

test("opening settings during play pauses and safely resumes the active Run", async ({ page }) => {
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
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page.getByRole("button", { name: /Choose Candidate \d+: Metal Linggen/ }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
  const runBefore = await page.evaluate(() => window.localStorage.getItem("fqyy.active-run.v1"));

  await page.getByRole("button", { name: "Open settings" }).click();
  await expect.poll(() => page.evaluate(() => window.__gameTest!.getSnapshot().paused)).toBe(true);
  await page.getByRole("button", { name: "Close settings" }).click();
  await expect.poll(() => page.evaluate(() => window.__gameTest!.getSnapshot().paused)).toBe(false);

  expect(await page.evaluate(() => window.localStorage.getItem("fqyy.active-run.v1"))).toBe(runBefore);
});

test("reduced motion reaches canvas atmosphere and cultivation choices", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("fqyy.settings.v1", JSON.stringify({
      version: 1,
      masterVolume: 0.7,
      sfxVolume: 0.55,
      ambienceVolume: 0.5,
      muted: false,
      reducedMotion: true,
      cameraShake: 1,
      displayScale: 1
    }));
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page.getByRole("button", { name: /Choose Candidate \d+:/ }).first().click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
  expect(await page.evaluate(() => window.__gameTest!.getSnapshot().visuals.arena.atmosphereAnimated)).toBe(false);
  await page.evaluate(() => window.__gameTest!.forceClaimLingcao());
  expect(await page.evaluate(() => window.__gameTest!.getUiSnapshot().choicePanel.motionReduced)).toBe(true);
});
