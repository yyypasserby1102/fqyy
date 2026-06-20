import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { chromium } from "playwright";

const SYSTEM_LIBRARY_PATHS = [
  "/snap/chromium/current/usr/lib/x86_64-linux-gnu",
  "/snap/chromium/current/usr/lib",
  "/snap/gnome-46-2404/current/usr/lib/x86_64-linux-gnu",
  "/snap/mesa-2404/current/usr/lib/x86_64-linux-gnu",
  "/snap/cups/current/usr/lib/x86_64-linux-gnu",
  "/usr/lib/x86_64-linux-gnu",
  "/usr/lib",
  "/lib/x86_64-linux-gnu",
  "/lib"
];

const SYSTEM_BROWSER_CANDIDATES = [
  "/snap/chromium/current/usr/lib/chromium-browser/chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable"
];

const BUNDLED_CHROMIUM_EXECUTABLE_PATH = (() => {
  const savedPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  try {
    delete process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    return chromium.executablePath();
  } finally {
    if (savedPath === undefined) {
      delete process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    } else {
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = savedPath;
    }
  }
})();

function dedupePaths(paths) {
  return [...new Set(paths.filter(Boolean))];
}

function appendLibraryPath(existingPath) {
  return dedupePaths([
    ...SYSTEM_LIBRARY_PATHS,
    ...(existingPath ? existingPath.split(":") : [])
  ]).join(":");
}

function candidateBrowserPaths() {
  return dedupePaths([
    ...SYSTEM_BROWSER_CANDIDATES,
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    BUNDLED_CHROMIUM_EXECUTABLE_PATH,
    "/snap/bin/chromium"
  ]);
}

function canRunBrowser(browserPath) {
  const result = spawnSync(
    browserPath,
    ["--headless", "--no-sandbox", "--disable-gpu", "--dump-dom", "about:blank"],
    {
      stdio: "pipe",
      timeout: 10_000,
      env: {
        ...process.env,
        HOME: process.env.HOME ?? ".",
        XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR ?? "/tmp",
        LD_LIBRARY_PATH: appendLibraryPath(process.env.LD_LIBRARY_PATH)
      }
    }
  );

  if (result.status === 0) {
    return {
      ok: true,
      browserPath
    };
  }

  const stderr = Buffer.isBuffer(result.stderr)
    ? result.stderr.toString("utf8")
    : String(result.stderr ?? "");
  const stdout = Buffer.isBuffer(result.stdout)
    ? result.stdout.toString("utf8")
    : String(result.stdout ?? "");
  return {
    ok: false,
    reason: [stdout, stderr]
      .join("\n")
      .trim()
      .slice(0, 400) || "Browser launch probe failed."
  };
}

export function resolveChromiumExecutablePath() {
  for (const browserPath of candidateBrowserPaths()) {
    if (!fs.existsSync(browserPath)) {
      continue;
    }

    const launched = canRunBrowser(browserPath);
    if (launched.ok) {
      return launched.browserPath;
    }
  }

  return null;
}

export function buildBrowserEnv() {
  return {
    ...process.env,
    LD_LIBRARY_PATH: appendLibraryPath(process.env.LD_LIBRARY_PATH)
  };
}
