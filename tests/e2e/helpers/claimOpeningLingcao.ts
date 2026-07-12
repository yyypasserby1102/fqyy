import type { Page } from "@playwright/test";

export async function claimOpeningLingcao(page: Page): Promise<void> {
  await page.evaluate(() => window.__gameTest!.forceClaimLingcao());
  await page.waitForFunction(() => window.__gameTest!.getSnapshot().progression.lingcaoCollected);
}
