import { expect, test } from "@playwright/test";
import { claimOpeningLingcao } from "./helpers/claimOpeningLingcao";

test("Gongfa codex exposes the learned Skill, passive, and locked Skill 2", async ({ page }) => {
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
  await claimOpeningLingcao(page);
  await page.evaluate(() => window.__gameTest!.selectChoice(0));

  await page.keyboard.press("g");
  await expect.poll(async () => (await page.evaluate(() => window.__gameTest!.getUiSnapshot())).gongfaCodex.visible).toBe(true);

  const codex = (await page.evaluate(() => window.__gameTest!.getUiSnapshot())).gongfaCodex;
  expect(codex).toMatchObject({
    learnedPathCount: 1,
    selectedGongfaId: "yujian-jue",
    selectedRank: 0,
    skill2Status: "locked",
    cardNames: ["Sword Unsheathing", "Sword-Rack Rotation", "Myriad Swords Return"],
    progressRankCount: 22,
    interactiveControlCount: 3
  });
  expect(codex.milestones.map((milestone) => milestone.rank)).toEqual([3, 6, 9, 10]);
  expect(codex.milestones.flatMap((milestone) => milestone.futureNames).length).toBeGreaterThan(0);
  expect(codex.milestones.flatMap((milestone) => milestone.selectedNames)).toEqual([]);
  if (process.env.GONGFA_CODEX_CAPTURE) {
    await page.screenshot({ path: process.env.GONGFA_CODEX_CAPTURE, fullPage: true });
  }

  await page.keyboard.press("g");
  await expect.poll(async () => (await page.evaluate(() => window.__gameTest!.getUiSnapshot())).gongfaCodex.visible).toBe(false);
});

test("the visible Gongfa control opens the archive with pointer input", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page.getByRole("button", { name: /Choose Candidate \d+:/ }).first().click();
  await page.waitForFunction(() => Boolean(window.__gameTest));

  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Game canvas was not visible");
  await canvas.click({ position: { x: box.width - 58, y: box.height - 22 } });
  await expect.poll(async () => (await page.evaluate(() => window.__gameTest!.getUiSnapshot())).gongfaCodex.visible).toBe(true);

  await canvas.click({ position: { x: 12, y: 12 } });
  await expect.poll(async () => (await page.evaluate(() => window.__gameTest!.getUiSnapshot())).gongfaCodex.visible).toBe(false);
});
