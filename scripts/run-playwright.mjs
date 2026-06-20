import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["playwright", "test"], {
  stdio: "inherit",
  shell: true
});

process.exit(result.status ?? 1);
