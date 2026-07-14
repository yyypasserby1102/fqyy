import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function startMetalRun(page: Page) {
  await page.addInitScript(() => {
    const original = Crypto.prototype.getRandomValues;
    Crypto.prototype.getRandomValues = function getSeededRandomValues<
      T extends ArrayBufferView | null
    >(array: T): T {
      if (array instanceof Uint32Array && array.length === 1) {
        array[0] = 2;
        return array;
      }
      return original.call(this, array);
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page
    .getByRole("button", { name: /Choose Candidate \d+: Metal Linggen/ })
    .click();
  await page.waitForFunction(
    () => (window.__gameTest?.getSnapshot().player.maxHealth ?? 0) > 0
  );
}

test("the title presents the production cultivation-scroll shell", async ({ page }) => {
  await page.goto("/");

  const shell = page.locator('[data-visual-theme="cultivation-scroll"]');
  await expect(shell).toBeVisible();
  await expect(page).toHaveTitle("FQYY - A Cultivation Journey");
  await expect(page.getByRole("heading", { name: "FQYY" })).toBeVisible();
  await expect(page.getByText("A Cultivation Journey", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start New Run" })).toBeVisible();

  const backgroundImage = await shell.evaluate(
    (element) => getComputedStyle(element).backgroundImage
  );
  expect(backgroundImage).toContain("title-mountains");
});

test("Candidate selection presents three readable fates without exact Affinity values", async ({
  page
}) => {
  await page.addInitScript(() => {
    const original = Crypto.prototype.getRandomValues;
    Crypto.prototype.getRandomValues = function getSeededRandomValues<
      T extends ArrayBufferView | null
    >(array: T): T {
      if (array instanceof Uint32Array && array.length === 1) {
        array[0] = 2;
        return array;
      }
      return original.call(this, array);
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();

  await expect(page.getByRole("heading", { name: "Choose Your Cultivator" })).toBeVisible();
  const candidates = page.getByRole("group", { name: "Choose Cultivator Candidate" });
  const cards = candidates.getByRole("button");
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) {
    await expect(card.locator(".candidate-card__name")).not.toBeEmpty();
    await expect(card.locator(".candidate-card__linggen")).toContainText("Linggen");
    await expect(card.locator(".candidate-card__root").first()).toContainText("Root");
    await expect(card.locator(".candidate-card__grade").first()).toContainText(
      /Weak|Medium|Strong/
    );
    await expect(card).not.toContainText(/Affinity\s*:?\s*\d/);
  }

  await page.setViewportSize({ width: 600, height: 900 });
  const columns = await candidates.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns
  );
  expect(columns.trim().split(/\s+/)).toHaveLength(1);
});

test("the opening Lingcao uses its production breathing animation", async ({ page }) => {
  await startMetalRun(page);
  const lingcao = await page.evaluate(() => window.__gameTest!.getSnapshot().visuals.lingcao);
  expect(lingcao).toMatchObject({
    textureKey: "lingcao-atlas",
    animationKey: "lingcao-idle",
    state: "idle"
  });
  expect(lingcao.collisionCenterOffsetX).toBeCloseTo(-6, 3);
  expect(lingcao.collisionCenterOffsetY).toBeCloseTo(-6, 3);
});

test("the Lingcao resonates when the Cultivator approaches", async ({ page }) => {
  await startMetalRun(page);
  await page.keyboard.down("d");
  await page.keyboard.down("w");
  try {
    await page.waitForFunction(
      () => window.__gameTest!.getSnapshot().visuals.lingcao.state === "resonance"
    );
  } finally {
    await page.keyboard.up("w");
    await page.keyboard.up("d");
  }
  expect(
    await page.evaluate(
      () => window.__gameTest!.getSnapshot().visuals.lingcao.animationKey
    )
  ).toBe("lingcao-resonance");
});

test("claiming Lingcao blooms into the animated Linggen awakening", async ({ page }) => {
  await startMetalRun(page);
  await page.evaluate(() => window.__gameTest!.forceClaimLingcao());
  expect(
    await page.evaluate(() => window.__gameTest!.getSnapshot().progression.lingcaoCollected)
  ).toBe(true);

  const presentation = await page.evaluate(() => ({
    lingcao: window.__gameTest!.getSnapshot().visuals.lingcao,
    choicePanel: window.__gameTest!.getUiSnapshot().choicePanel,
    choiceTitle: window.__gameTest!.getSnapshot().choice?.title
  }));
  expect(presentation.lingcao.collectionEffects).toContain("lingcao-collect-bloom");
  expect(presentation.choicePanel).toMatchObject({
    visible: true,
    renderedOptionCount: 3,
    mode: "linggen-awakening"
  });
  expect(presentation.choiceTitle).toBe("Metal Linggen Revealed");
});

test("Lianqi opens in the atmospheric mist-court arena", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await startMetalRun(page);
  expect(pageErrors).toEqual([]);
  const arena = await page.evaluate(() => window.__gameTest!.getSnapshot().visuals.arena);
  expect(arena).toMatchObject({
    variantId: "mist-court",
    atmosphere: "drifting-mist",
    floorTextureKey: "arena-floor"
  });
  expect(arena.atmosphereMoteCount).toBeGreaterThanOrEqual(12);
});

test("production opening raster assets are padded and opaque where required", async ({
  page
}) => {
  await startMetalRun(page);
  const assets = await page.evaluate(async () => {
    const resource = (pattern: string) => {
      const url = performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .find((name) => name.includes(pattern) && !name.includes("import"));
      if (!url) throw new Error(`Missing loaded asset: ${pattern}`);
      return url;
    };
    const decode = async (url: string) => {
      const bitmap = await createImageBitmap(await (await fetch(url)).blob());
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas 2D unavailable");
      context.drawImage(bitmap, 0, 0);
      return {
        width: bitmap.width,
        height: bitmap.height,
        pixels: [...context.getImageData(0, 0, bitmap.width, bitmap.height).data]
      };
    };

    const lingcao = await decode(resource("lingcao-atlas"));
    const frames = [];
    for (let frame = 0; frame < 16; frame += 1) {
      const originX = (frame % 4) * 256;
      const originY = Math.floor(frame / 4) * 256;
      let left = 256;
      let top = 256;
      let right = -1;
      let bottom = -1;
      for (let y = 0; y < 256; y += 1) {
        for (let x = 0; x < 256; x += 1) {
          const alpha = lingcao.pixels[((originY + y) * lingcao.width + originX + x) * 4 + 3];
          if (alpha <= 10) continue;
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
        }
      }
      frames.push({ left, top, right, bottom });
    }

    const title = await decode(resource("title-mountains"));
    const transparentTitlePixels = title.pixels.filter(
      (_value, index) => index % 4 === 3 && title.pixels[index] !== 255
    ).length;
    return {
      lingcao: { width: lingcao.width, height: lingcao.height, frames },
      title: { width: title.width, height: title.height, transparentTitlePixels }
    };
  });

  expect(assets.lingcao.width).toBe(1024);
  expect(assets.lingcao.height).toBe(1024);
  for (const frame of assets.lingcao.frames) {
    expect(frame.left).toBeGreaterThan(0);
    expect(frame.top).toBeGreaterThan(0);
    expect(frame.right).toBeLessThan(255);
    expect(frame.bottom).toBeLessThan(255);
  }
  expect(assets.title.width).toBeGreaterThanOrEqual(1280);
  expect(assets.title.height).toBeGreaterThanOrEqual(720);
  expect(assets.title.transparentTitlePixels).toBe(0);
});
