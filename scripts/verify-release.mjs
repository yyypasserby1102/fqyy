import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url);
const pagesBase = (await readFile(new URL("../deployment-base.txt", import.meta.url), "utf8")).trim();
const html = await readFile(new URL("index.html", dist), "utf8");
const manifest = JSON.parse(await readFile(new URL("manifest.webmanifest", dist), "utf8"));
const assets = await readdir(new URL("assets/", dist));

const failures = [];
if (!html.includes(`${pagesBase}assets/`)) failures.push("GitHub Pages asset base is missing");
if (!html.includes(`${pagesBase}manifest.webmanifest`)) failures.push("manifest link is not deployment-safe");
if (manifest.name !== "FQYY — A Cultivation Journey") failures.push("web manifest is malformed");
if (!assets.some((name) => name.startsWith("game-") && name.endsWith(".js"))) {
  failures.push("lazy game chunk is missing");
}

for (const name of assets.filter((entry) => entry.endsWith(".js"))) {
  const size = (await stat(join(dist.pathname, "assets", name))).size;
  if (name.startsWith("index-") && size > 75_000) failures.push(`opening chunk exceeds 75 kB: ${name}`);
  if (name.startsWith("game-") && size > 2_100_000) failures.push(`game chunk exceeds 2.1 MB: ${name}`);
}

if (failures.length) {
  throw new Error(`Release verification failed:\n- ${failures.join("\n- ")}`);
}

console.log(`Release verified: ${assets.length} assets, deployment base ${pagesBase}.`);
