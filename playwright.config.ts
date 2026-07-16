import { defineConfig } from "@playwright/test";
import { buildBrowserEnv, resolveChromiumExecutablePath } from "./scripts/playwright-browser.mjs";

const chromiumExecutablePath = resolveChromiumExecutablePath();

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  // The graybox Phaser/canvas specs are timing-sensitive and occasionally time
  // out under parallel-worker contention (different test each run, all pass in
  // isolation). Retry so a single load-induced flake doesn't fail the suite.
  retries: 2,
  use: {
    baseURL: "http://127.0.0.1:4173",
    // Existing gameplay specifications assert the canonical English copy.
    // Localization specs clear this value to exercise the fresh-player
    // Chinese default explicitly.
    storageState: {
      cookies: [],
      origins: [{
        origin: "http://127.0.0.1:4173",
        localStorage: [{ name: "fqyy.locale.v1", value: '"en"' }]
      }]
    },
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
