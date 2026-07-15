import { defineConfig } from "vite";
import { readFileSync } from "node:fs";

const pagesBase = readFileSync(new URL("./deployment-base.txt", import.meta.url), "utf8").trim();

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? pagesBase : "/",
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
