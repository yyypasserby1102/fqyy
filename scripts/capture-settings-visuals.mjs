import { chromium } from "@playwright/test";
import { resolveChromiumExecutablePath } from "./playwright-browser.mjs";

const browser = await chromium.launch({
  headless: true,
  ...(resolveChromiumExecutablePath() ? { executablePath: resolveChromiumExecutablePath() } : {})
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(process.argv[2] ?? "http://127.0.0.1:4173");
await page.getByRole("button", { name: "Open settings" }).click();
await page.screenshot({ path: "docs/visual-review/settings-panel.png" });
await page.getByLabel("Reduce motion and flashes").check();
await page.getByLabel("Display scale").selectOption("1.15");
await page.screenshot({ path: "docs/visual-review/settings-accessibility.png" });
await browser.close();
