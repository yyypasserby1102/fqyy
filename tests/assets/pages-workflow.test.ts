import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Pages deployment workflow", () => {
  const workflow = readFileSync(".github/workflows/deploy-pages.yml", "utf8");

  it("uses deterministic release gates instead of the timing-sensitive browser suite", () => {
    expect(workflow).toContain("npm run typecheck");
    expect(workflow).toContain("npm run lint");
    expect(workflow).toContain("npm run test");
    expect(workflow).toContain("npm run verify:release");
    expect(workflow).not.toContain("npm run test:all");
    expect(workflow).not.toContain("playwright install");
  });
});
