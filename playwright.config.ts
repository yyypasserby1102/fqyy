import { defineConfig } from "@playwright/test";
import { buildBrowserEnv, resolveChromiumExecutablePath } from "./scripts/playwright-browser.mjs";

const chromiumExecutablePath = resolveChromiumExecutablePath();

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    launchOptions: {
      ...(chromiumExecutablePath
        ? {
            executablePath: chromiumExecutablePath
          }
        : {}),
      env: buildBrowserEnv()
    }
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 60_000
  }
});
