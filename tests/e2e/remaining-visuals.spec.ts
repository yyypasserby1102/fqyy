import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function startNewRun(page: Page) {
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

test("production pickup and arena assets are padded, opaque, and seamless", async ({ page }) => {
  await startNewRun(page);
  const assets = await page.evaluate(async () => {
    const resource = (pattern: string) => {
      const url = performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .find((name) => name.includes(pattern) && !name.includes("import"));
      if (!url) throw new Error(`Missing loaded asset: ${pattern}`);
      return url;
    };
    const decode = async (pattern: string) => {
      const bitmap = await createImageBitmap(await (await fetch(resource(pattern))).blob());
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

    const pickup = await decode("pickup-atlas");
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
          const alpha = pickup.pixels[((originY + y) * pickup.width + originX + x) * 4 + 3];
          if (alpha <= 10) continue;
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
        }
      }
      frames.push({ left, top, right, bottom });
    }

    const arena = await decode("arena-floor");
    let maxEdgeDelta = 0;
    for (let index = 0; index < 1024; index += 1) {
      for (let channel = 0; channel < 4; channel += 1) {
        maxEdgeDelta = Math.max(
          maxEdgeDelta,
          Math.abs(
            arena.pixels[(index * arena.width) * 4 + channel] -
              arena.pixels[(index * arena.width + arena.width - 1) * 4 + channel]
          ),
          Math.abs(
            arena.pixels[index * 4 + channel] -
              arena.pixels[((arena.height - 1) * arena.width + index) * 4 + channel]
          )
        );
      }
    }
    return {
      pickup: { width: pickup.width, height: pickup.height, frames },
      arena: { width: arena.width, height: arena.height, maxEdgeDelta }
    };
  });

  expect(assets.pickup.width).toBe(1024);
  expect(assets.pickup.height).toBe(1024);
  for (const frame of assets.pickup.frames) {
    expect(frame.left).toBeGreaterThan(0);
    expect(frame.top).toBeGreaterThan(0);
    expect(frame.right).toBeLessThan(255);
    expect(frame.bottom).toBeLessThan(255);
  }
  expect(assets.arena).toEqual({ width: 1024, height: 1024, maxEdgeDelta: 0 });
});

test("Qi Orb, Healing Pill, and Spirit Treasure use animated production pickups", async ({
  page
}) => {
  await startNewRun(page);
  const visuals = await page.evaluate(() => {
    window.__gameTest!.forceSpawnQiOrb(1);
    window.__gameTest!.forceSpawnHealingPill(30);
    window.__gameTest!.forceSpawnSpiritTreasure("jade-heart-pendant");
    return window.__gameTest!.getSnapshot().visuals.pickups;
  });

  expect(visuals.qiOrbs[0]).toEqual({
    textureKey: "pickup-atlas",
    animationKey: "pickup-qi-orb-hover"
  });
  expect(visuals.healingPills[0]).toEqual({
    textureKey: "pickup-atlas",
    animationKey: "pickup-healing-pill-hover"
  });
  expect(visuals.spiritTreasures[0]).toMatchObject({
    treasureId: "jade-heart-pendant",
    textureKey: "pickup-atlas",
    animationKey: "pickup-spirit-treasure-hover"
  });
});

test("all six Spirit Treasure identities keep distinct production colors", async ({ page }) => {
  await startNewRun(page);
  const treasures = await page.evaluate(() => {
    const ids = [
      "jade-heart-pendant",
      "windstep-talisman",
      "lodestone-charm",
      "ironhide-seal",
      "spiritbloom-vial",
      "farsight-mirror"
    ] as const;
    ids.forEach((id) => window.__gameTest!.forceSpawnSpiritTreasure(id));
    return window.__gameTest!.getSnapshot().visuals.pickups.spiritTreasures;
  });

  expect(treasures.map((treasure) => treasure.treasureId).sort()).toEqual([
    "farsight-mirror",
    "ironhide-seal",
    "jade-heart-pendant",
    "lodestone-charm",
    "spiritbloom-vial",
    "windstep-talisman"
  ]);
  expect(new Set(treasures.map((treasure) => treasure.tint)).size).toBe(6);
});

test("pickup collection uses the production breath burst", async ({ page }) => {
  await startNewRun(page);
  await page.evaluate(() => window.__gameTest!.forceSpawnQiOrb(1));
  await page.waitForTimeout(100);
  const effects = await page.evaluate(
    () => window.__gameTest!.getSnapshot().visuals.pickups.collectionEffects
  );
  expect(effects).toContain("pickup-collect-burst");
});

test("Spirit Treasure collection uses the shared gold breath burst", async ({ page }) => {
  await startNewRun(page);
  await page.evaluate(() =>
    window.__gameTest!.forceSpawnSpiritTreasure("jade-heart-pendant")
  );
  await page.waitForTimeout(100);
  const tints = await page.evaluate(
    () => window.__gameTest!.getSnapshot().visuals.pickups.collectionEffectTints
  );
  expect(tints).toContain(0xd7b96d);
});

test("the arena uses its production floor and cultivation landmarks", async ({ page }) => {
  await startNewRun(page);
  const arena = await page.evaluate(() => window.__gameTest!.getSnapshot().visuals.arena);
  expect(arena.floorTextureKey).toBe("arena-floor");
  expect(arena.decorationCount).toBeGreaterThanOrEqual(5);
});

test("the HUD exposes the three production scan regions", async ({ page }) => {
  await startNewRun(page);
  const ui = await page.evaluate(() => window.__gameTest!.getUiSnapshot());
  expect(ui.visualTheme).toBe("ink-jade");
  expect(ui.hudRegions).toEqual(["status", "gongfa", "evade"]);
  expect(ui.hudText).toContain("Vitality:");
  expect(ui.hudText).toContain("Evade:");
});

test("the production choice panel renders all four treasure replacement options", async ({
  page
}) => {
  await startNewRun(page);
  await page.evaluate(() => window.__gameTest!.forceClaimLingcao());
  await page.waitForFunction(() => Boolean(window.__gameTest!.getSnapshot().choice));
  await page.evaluate(() => window.__gameTest!.selectChoice(0));

  for (const id of ["jade-heart-pendant", "windstep-talisman", "lodestone-charm"]) {
    await page.evaluate((treasureId) => {
      window.__gameTest!.forceSpawnSpiritTreasure(treasureId);
    }, id);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.__gameTest!.forceSpawnSpiritTreasure("ironhide-seal"));
  await page.waitForFunction(() =>
    Boolean(window.__gameTest!.getSnapshot().choice?.title.includes("found"))
  );

  expect(await page.evaluate(() => window.__gameTest!.getUiSnapshot().choicePanel)).toEqual({
    visible: true,
    renderedOptionCount: 4,
    mode: "choice"
  });
});
