import type { Page } from "@playwright/test";

export async function claimOpeningLingcao(page: Page): Promise<void> {
  for (let i = 0; i < 120; i += 1) {
    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    if (snapshot.progression.lingcaoCollected) {
      return;
    }

    const [lingcao] = snapshot.counts.lingcaoPositions;
    if (!lingcao) {
      await page.waitForTimeout(25);
      continue;
    }

    const keys = [
      Math.abs(lingcao.x - snapshot.player.x) > 8
        ? lingcao.x >= snapshot.player.x
          ? "d"
          : "a"
        : undefined,
      Math.abs(lingcao.y - snapshot.player.y) > 8
        ? lingcao.y >= snapshot.player.y
          ? "s"
          : "w"
        : undefined
    ].filter((key): key is string => Boolean(key));
    for (const key of keys) {
      await page.keyboard.down(key);
    }
    await page.waitForTimeout(55);
    for (const key of keys) {
      await page.keyboard.up(key);
    }
  }

  await page.waitForFunction(() => window.__gameTest!.getSnapshot().progression.lingcaoCollected);
}
