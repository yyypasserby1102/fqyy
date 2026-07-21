import { expect, test } from "@playwright/test";

test("Chinese is the default and one persisted language selector controls game and tools", async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem("fqyy.localization-test-started")) {
      window.localStorage.removeItem("fqyy.locale.v1");
      window.sessionStorage.setItem("fqyy.localization-test-started", "true");
    }
  });
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByText("一念凡尘", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "开启新征途" })).toBeVisible();

  await page.getByRole("button", { name: "打开设置" }).click();
  await Promise.all([
    page.waitForEvent("load"),
    page.getByRole("combobox", { name: "语言" }).selectOption("en")
  ]);
  await expect(page.getByRole("button", { name: "Start New Run" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.getByRole("link", { name: "Open FQYY Tools" }).click();
  await expect(page.getByRole("heading", { name: "Gongfa Compendium" })).toBeVisible();

  await page.getByRole("button", { name: "Open settings" }).click();
  await Promise.all([
    page.waitForEvent("load"),
    page.getByRole("combobox", { name: "Language" }).selectOption("zh-CN")
  ]);
  await expect(page.getByRole("heading", { name: "功法总览" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");

  await page.reload();
  await expect(page.getByRole("heading", { name: "功法总览" })).toBeVisible();
  await page.getByRole("button", { name: "流派规划" }).click();
  expect(await page.evaluate(() => new URLSearchParams(location.hash.split("?")[1]).get("n")))
    .toBe("Untitled Cultivation");
  await page.getByRole("button", { name: "打开设置" }).click();
  await expect(page.getByRole("combobox", { name: "语言" })).toHaveValue("zh-CN");
});

test("a Chinese run localizes awakening choices, HUD progression, and the Gongfa codex", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("fqyy.locale.v1");
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
  await page.getByRole("button", { name: "开启新征途" }).click();
  await page.getByRole("group", { name: "选择修士候选" }).getByRole("button").first().click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
  expect(await page.evaluate(() => window.__gameTest!.getSnapshot().visuals.lingcao.markerTitle))
    .toBe("灵草");
  await page.evaluate(() => window.__gameTest!.forceClaimLingcao());
  await page.waitForFunction(() => window.__gameTest!.getSnapshot().progression.lingcaoCollected);

  const awakening = await page.evaluate(() => window.__gameTest!.getUiSnapshot().choicePanel as unknown as {
    title: string;
    optionTitles: string[];
  });
  expect(awakening.title).toContain("觉醒");
  expect(awakening.optionTitles.length).toBeGreaterThan(0);
  expect(awakening.optionTitles.join("")).not.toMatch(/[A-Za-z]/);
  if (process.env.GONGFA_CHOICE_CAPTURE) {
    await page.screenshot({ path: process.env.GONGFA_CHOICE_CAPTURE, fullPage: true });
  }

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await expect.poll(() =>
    page.evaluate(() => window.__gameTest!.getUiSnapshot().choicePanel.visible)
  ).toBe(false);
  await page.keyboard.press("g");
  await expect.poll(() => page.evaluate(() => window.__gameTest!.getUiSnapshot().gongfaCodex.visible)).toBe(true);
  const ui = await page.evaluate(() => window.__gameTest!.getUiSnapshot());
  expect(ui.hudText).toContain("功法：");
  expect(ui.gongfaCodex.rankText).toBe("精通第 0 重");
  expect(ui.gongfaCodex.cardNames).toEqual(["御剑出鞘", "剑匣轮转", "万剑归宗"]);
});
