import { expect, test } from "@playwright/test";

test("title screen opens the searchable canonical Gongfa compendium", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open FQYY Tools" }).click();

  await expect(page.locator('[data-surface="fqyy-tools"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gongfa Compendium" })).toBeVisible();
  await expect(page.locator(".tools-gongfa-card")).toHaveCount(13);
  await expect(page.locator('[data-gongfa-detail="yujian-jue"]')).toContainText("Flying Sword Volley");
  if (process.env.TOOLS_CAPTURE) {
    await page.screenshot({ path: `${process.env.TOOLS_CAPTURE}-compendium.png`, fullPage: true });
  }

  await page.getByRole("searchbox", { name: "Search Gongfa" }).fill("furnace");
  await expect(page.locator(".tools-gongfa-card:visible")).toHaveCount(2);
  await page.locator(".tools-gongfa-card:visible").filter({ hasText: "Crimson Furnace Sword Art" }).click();
  await expect(page.locator('[data-gongfa-detail="crimson-furnace-sword-art"]')).toContainText("Crucible Pressure");
  await expect(page.locator('[data-gongfa-detail="crimson-furnace-sword-art"]')).toContainText("Jindan");
  await expect(page.locator('[data-gongfa-detail="crimson-furnace-sword-art"]')).toContainText("Yuanying");
  await expect(page.locator('[data-gongfa-detail="crimson-furnace-sword-art"]')).toContainText("Deepens Skill 2 damage");
  await expect(page.locator('[data-gongfa-detail="crimson-furnace-sword-art"]')).toContainText("Focus the needles");

  await page.getByRole("searchbox", { name: "Search Gongfa" }).fill("explosive");
  await expect(page.locator(".tools-gongfa-card").filter({ hasText: "Burning Ring Scripture" })).toBeVisible();
});

test("build planner enforces compatibility and creates a shareable cultivation", async ({ page }) => {
  await page.goto("/#tools/planner");
  await expect(page.getByRole("heading", { name: "Build Planner" })).toBeVisible();

  await page.getByRole("button", { name: /Fire-Metal Linggen/ }).click();
  await page.locator(".tools-choice-card").filter({ hasText: "Crimson Furnace Sword Art" }).click();
  await page.locator(".tools-choice-card").filter({ hasText: "Burning Ring Scripture" }).click();
  await page.locator(".tools-choice-card").filter({ hasText: "Yujian Jue" }).click();
  await page.locator(".tools-treasure-choice").filter({ hasText: "Ironhide Seal" }).click();

  await expect(page.locator(".tools-build-slot--filled")).toHaveCount(3);
  await expect(page.locator(".tools-build-summary")).toContainText("Furnace Cascade");
  await expect(page.locator(".tools-build-summary")).toContainText("#explosive");
  await expect(page.locator(".tools-build-summary")).toContainText("Shared fire core");
  await expect(page.locator(".tools-build-summary")).toContainText("Run-bound support · Ironhide Seal");
  await expect(page.locator(".tools-choice-card").filter({ hasText: "Black Tide Scripture" })).toBeDisabled();
  if (process.env.TOOLS_CAPTURE) {
    await page.evaluate(() => document.querySelector(".tools-surface")?.scrollTo(0, 0));
    await page.screenshot({ path: `${process.env.TOOLS_CAPTURE}-planner.png`, fullPage: true });
  }

  await page.getByRole("button", { name: "Copy Share Link" }).click();
  await expect.poll(() => page.url()).toContain("#tools/planner?");
  await expect.poll(() => page.url()).toContain("crimson-furnace-sword-art");
});

test("compendium and planner remain usable on a narrow mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#tools/compendium");
  await expect(page.getByRole("heading", { name: "Gongfa Compendium" })).toBeVisible();
  await page.getByRole("button", { name: "Build Planner" }).click();
  await expect(page.getByRole("heading", { name: "Build Planner" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  if (process.env.TOOLS_CAPTURE) {
    await page.screenshot({ path: `${process.env.TOOLS_CAPTURE}-mobile.png`, fullPage: true });
  }
});

test("Spirit Treasure archive feeds selections into the planner", async ({ page }) => {
  await page.goto("/#tools/treasures");
  await expect(page.getByRole("heading", { name: "Spirit Treasure Archive" })).toBeVisible();
  await expect(page.locator(".tools-treasure-card")).toHaveCount(6);
  await expect(
    page.locator(".tools-treasure-card").filter({ hasText: "Jade Heart Pendant" })
  ).toContainText("Steady Heart");
  await expect(
    page.locator(".tools-treasure-card").filter({ hasText: "Jade Heart Pendant" })
  ).toContainText("Jade Heart Reborn");
  await expect(
    page.locator(".tools-treasure-card").filter({ hasText: "Jade Heart Pendant" })
  ).toContainText("vitality · perception");

  await page.locator(".tools-treasure-card").filter({ hasText: "Jade Heart Pendant" }).getByRole("button").click();
  await expect(page.getByRole("heading", { name: "Build Planner" })).toBeVisible();
  await expect(page.locator(".tools-treasure-choice[data-selected='true']")).toContainText("Jade Heart Pendant");
});
