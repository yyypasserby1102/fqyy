import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { getGongfaVisualIdentity } from "../../src/visual/gongfaVisualIdentity";

type CandidateLinggenId = "metal" | "water-metal";

const enemyIds = [
  "jade-rat",
  "mist-wolf",
  "bone-crow",
  "corpse-cultivator",
  "resentful-spirit",
  "celestial-construct",
  "tribulation-shade",
] as const;

const enemyVisuals = {
  "jade-rat": ["enemy-opening-atlas", "enemy-jade-rat-pursue"],
  "mist-wolf": ["enemy-opening-atlas", "enemy-mist-wolf-pursue"],
  "bone-crow": ["enemy-opening-atlas", "enemy-bone-crow-pursue"],
  "corpse-cultivator": ["enemy-opening-atlas", "enemy-corpse-cultivator-pursue"],
  "resentful-spirit": [
    "enemy-tribulation-atlas",
    "enemy-resentful-spirit-pursue",
  ],
  "celestial-construct": [
    "enemy-tribulation-atlas",
    "enemy-celestial-construct-pursue",
  ],
  "tribulation-shade": [
    "enemy-tribulation-atlas",
    "enemy-tribulation-shade-pursue",
  ],
} as const;

async function startNewRun(
  page: Page,
  linggenId: CandidateLinggenId = "metal",
) {
  const candidateName =
    linggenId === "metal" ? "Metal Linggen" : "Water-Metal Linggen";
  const seed = linggenId === "metal" ? 2 : 1;
  await page.addInitScript((runSeed) => {
    const original = Crypto.prototype.getRandomValues;
    Crypto.prototype.getRandomValues = function getSeededRandomValues<
      T extends ArrayBufferView | null,
    >(array: T): T {
      if (array instanceof Uint32Array && array.length === 1) {
        array[0] = runSeed;
        return array;
      }
      return original.call(this, array);
    };
  }, seed);
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page
    .getByRole("button", {
      name: new RegExp(`Choose Candidate \\d+: ${candidateName}`),
    })
    .click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
  await page.waitForFunction(() => {
    const snapshot = window.__gameTest?.getSnapshot();
    return snapshot?.activeScenes.includes("game") && snapshot.player.maxHealth > 0;
  });
}

test("combat atlases keep every generated frame padded and registered", async ({
  page,
}) => {
  await startNewRun(page);

  const atlases = await page.evaluate(async () => {
    const measure = async (resourcePattern: string) => {
      const resourceUrl = performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .find(
          (name) => name.includes(resourcePattern) && !name.includes("import"),
        );
      if (!resourceUrl)
        throw new Error(`Missing loaded atlas: ${resourcePattern}`);

      const bitmap = await createImageBitmap(
        await (await fetch(resourceUrl)).blob(),
      );
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas 2D unavailable");
      context.drawImage(bitmap, 0, 0);
      const pixels = context.getImageData(
        0,
        0,
        bitmap.width,
        bitmap.height,
      ).data;
      const frames = [];
      for (let frame = 0; frame < 16; frame += 1) {
        const originX = (frame % 4) * 256;
        const originY = Math.floor(frame / 4) * 256;
        let left = 256;
        let top = 256;
        let right = -1;
        let bottom = -1;
        for (let y = 0; y < 256; y += 1) {
          for (let x = 0; x < 256; x += 1) {
            const alpha =
              pixels[((originY + y) * bitmap.width + originX + x) * 4 + 3];
            if (alpha <= 10) continue;
            left = Math.min(left, x);
            top = Math.min(top, y);
            right = Math.max(right, x);
            bottom = Math.max(bottom, y);
          }
        }
        frames.push({ left, top, right, bottom });
      }
      return { width: bitmap.width, height: bitmap.height, frames };
    };

    return Promise.all([
      measure("enemy-opening-atlas"),
      measure("enemy-tribulation-atlas"),
      measure("gongfa-projectile-atlas"),
      measure("gongfa-projectile-impact-atlas"),
    ]);
  });

  for (const atlas of atlases) {
    expect(atlas.width).toBe(1024);
    expect(atlas.height).toBe(1024);
    for (const frame of atlas.frames) {
      expect(frame.left).toBeGreaterThan(0);
      expect(frame.top).toBeGreaterThan(0);
      expect(frame.right).toBeLessThan(255);
      expect(frame.bottom).toBeLessThan(255);
    }
  }
});

test("all seven enemy families use their production pursue visuals", async ({
  page,
}) => {
  await startNewRun(page);
  await page.evaluate((ids) => {
    ids.forEach((id) => window.__gameTest!.forceSpawnEnemy(id));
  }, enemyIds);
  await page.waitForFunction(
    (ids) => ids.every((id) =>
      window.__gameTest!.getSnapshot().visuals.enemies.some(
        (enemy) => enemy.enemyId === id && enemy.state === "pursue"
      )
    ),
    enemyIds
  );

  const visuals = await page.evaluate(
    () => window.__gameTest!.getSnapshot().visuals.enemies,
  );
  const movementBehaviors = {
    "jade-rat": "pursuit",
    "mist-wolf": "pounce",
    "bone-crow": "weave",
    "corpse-cultivator": "pursuit",
    "resentful-spirit": "phase-flank",
    "celestial-construct": "celestial-charge",
    "tribulation-shade": "phase-flank"
  } as const;
  for (const enemyId of enemyIds) {
    const visual = visuals.find((candidate) => candidate.enemyId === enemyId);
    expect(visual).toMatchObject({
      enemyId,
      textureKey: enemyVisuals[enemyId][0],
      animationKey: enemyVisuals[enemyId][1],
      state: "pursue",
      movementBehavior: movementBehaviors[enemyId]
    });
  }
});

test("enemy hit and defeat feedback are observable without changing kill rewards", async ({
  page,
}) => {
  await startNewRun(page);
  await page.evaluate(() => window.__gameTest!.forceSpawnEnemy("jade-rat"));
  await page.waitForFunction(() =>
    window.__gameTest!.getSnapshot().visuals.enemies.some(
      (enemy) => enemy.enemyId === "jade-rat" && enemy.state === "pursue"
    )
  );

  let snapshot = await page.evaluate(() => {
    window.__gameTest!.forceDamageEnemy("jade-rat", 1);
    return window.__gameTest!.getSnapshot();
  });
  expect(
    snapshot.visuals.enemies.find((enemy) => enemy.enemyId === "jade-rat")
      ?.state,
  ).toBe("hit");

  const killsBefore = snapshot.progression.kills;
  snapshot = await page.evaluate(() => {
    window.__gameTest!.forceDamageEnemy("jade-rat", 999);
    return window.__gameTest!.getSnapshot();
  });
  expect(
    snapshot.visuals.enemies.find((enemy) => enemy.enemyId === "jade-rat")
      ?.state,
  ).toBe("defeat");
  expect(snapshot.progression.kills).toBe(killsBefore + 1);
  expect(snapshot.counts.orbs).toBeGreaterThan(0);
  await page.waitForFunction(() =>
    !window.__gameTest!.getSnapshot().visuals.enemies.some(
      (enemy) => enemy.enemyId === "jade-rat"
    )
  );
});

test("Jinfeng draws travel-powered ground cuts without substitute projectiles", async ({ page }) => {
  await startNewRun(page);
  await page.evaluate(() => {
    window.__gameTest!.forceEquipGongfa("jinfeng-gong");
    window.__gameTest!.forceSpawnHealingPill(100);
    window.__gameTest!.forceSpawnEnemies(5);
  });
  await page.keyboard.down("d");
  await page.waitForFunction(() => window.__gameTest!.getSnapshot().visuals.gongfaMotifs.some(
    (motif) => motif.startsWith("golden-horizon:movement-ground-")
  ));
  await page.keyboard.up("d");
  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.visuals.projectiles.some((projectile) =>
    projectile.sourceGongfaId === "jinfeng-gong"
  )).toBe(false);
});

test("Crimson Furnace remains the final legacy projectile treatment in this review pair", async ({ page }) => {
  await startNewRun(page);
  const gongfaIds = [
    "crimson-furnace-sword-art"
  ] as const;
  const treatments: Array<{ motifId?: string; trailStyle?: string; silhouette: string }> = [];

  for (const gongfaId of gongfaIds) {
    await page.evaluate((id) => {
      window.__gameTest!.forceClearEnemies();
      window.__gameTest!.forceSpawnHealingPill(100);
      window.__gameTest!.forceEquipGongfa(id);
      window.__gameTest!.forceSpawnEnemies(3);
    }, gongfaId);
    await page.waitForFunction(
      (id) => window.__gameTest!.getSnapshot().visuals.projectiles.some(
        (projectile) => projectile.sourceGongfaId === id && projectile.trailEmissionCount > 0
      ),
      gongfaId
    );
    const treatment = await page.evaluate(
      (id) => window.__gameTest!.getSnapshot().visuals.projectiles.find(
        (projectile) => projectile.sourceGongfaId === id && projectile.trailEmissionCount > 0
      ),
      gongfaId
    );
    expect(treatment).toBeDefined();
    treatments.push({
      motifId: treatment!.motifId,
      trailStyle: treatment!.trailStyle,
      silhouette: `${treatment!.silhouetteScale.x}:${treatment!.silhouetteScale.y}`
    });
  }

  expect(new Set(treatments.map((item) => item.motifId)).size).toBe(1);
  expect(new Set(treatments.map((item) => item.trailStyle)).size).toBe(1);
  expect(new Set(treatments.map((item) => `${item.motifId}:${item.silhouette}`)).size).toBe(1);
});

test("Green Vine renders one geometric tether without seeking projectiles", async ({ page }) => {
  await startNewRun(page);
  await page.evaluate(() => {
    window.__gameTest!.forceEquipGongfa("green-vine-art");
    window.__gameTest!.forceSpawnHealingPill(100);
    window.__gameTest!.forceSpawnEnemies(4);
  });
  await page.waitForFunction(() => window.__gameTest!.getSnapshot().visuals.gongfaMotifs.includes(
    "verdant-knot:two-polarity-tether"
  ));
  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.visuals.projectiles.some((projectile) =>
    projectile.sourceGongfaId === "green-vine-art"
  )).toBe(false);
});

test("Yujian, Blazing Feather, and Drifting Frost render authored bodies without substitute projectiles", async ({ page }) => {
  await startNewRun(page);
  for (const [gongfaId, motif] of [
    ["yujian-jue", "returning-sword-rack:physical-sword-route"],
    ["blazing-feather-art", "phoenix-pinions:optimal-edge-fan"],
    ["drifting-frost-needle", "hoarfrost-stars:weakpoint-zigzag"]
  ] as const) {
    await page.evaluate((id) => {
      window.__gameTest!.forceClearEnemies();
      window.__gameTest!.forceEquipGongfa(id);
      window.__gameTest!.forceSpawnEnemies(4);
    }, gongfaId);
    await page.waitForFunction(
      (expected) => window.__gameTest?.getSnapshot().visuals.gongfaMotifs.includes(expected),
      motif
    );
    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    expect(snapshot.visuals.projectiles.some((projectile) => projectile.sourceGongfaId === gongfaId)).toBe(false);
  }
});

test("Ironwood Wave Form renders a physical rooted wall and driven wall without substitute projectiles", async ({ page }) => {
  await startNewRun(page);
  await page.evaluate(() => {
    window.__gameTest!.forceEquipGongfa("ironwood-wave-form");
    window.__gameTest!.forceSpawnEnemy("jade-rat");
  });
  await page.waitForFunction(() =>
    window.__gameTest!.getSnapshot().visuals.gongfaMotifs.includes("ironwood-rampart:rooted-rampart")
  );
  const enemyCleanupTimer = await page.evaluate(() => window.setInterval(
    () => window.__gameTest?.forceClearEnemies(),
    100
  ));
  await page.waitForTimeout(4200);
  await page.keyboard.down("d");
  await page.waitForFunction(() =>
    window.__gameTest!.getSnapshot().visuals.gongfaMotifs.includes("ironwood-rampart:driven-rampart")
  );
  await page.keyboard.up("d");
  await page.evaluate((timer) => window.clearInterval(timer), enemyCleanupTimer);
  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.visuals.projectiles.some((projectile) => projectile.sourceGongfaId === "ironwood-wave-form")).toBe(false);
  expect(snapshot.visuals.gongfaMotifs.some((motif) => motif.startsWith("forged-brace:"))).toBe(false);
});

test("Crimson Furnace renders living nodes, links, and core propagation instead of radius blasts", async ({ page }) => {
  await startNewRun(page);
  const sustainTimer = await page.evaluate(() => window.setInterval(
    () => window.__gameTest?.forceSpawnHealingPill(100),
    300
  ));
  await page.evaluate(() => {
    window.__gameTest!.forceEquipGongfa("crimson-furnace-sword-art");
    window.__gameTest!.forceSpawnEnemies(5);
  });
  await page.waitForFunction(() =>
    window.__gameTest?.getSnapshot().visuals.gongfaMotifs.includes(
      "living-furnace-network:living-node-network"
    ),
    undefined,
    { timeout: 10_000 }
  );
  await page.waitForFunction(() =>
    window.__gameTest?.getSnapshot().visuals.gongfaMotifs.includes(
      "living-furnace-network:core-propagation"
    ),
    undefined,
    { timeout: 10_000 }
  );
  await page.evaluate((timer) => window.clearInterval(timer), sustainTimer);
  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.visuals.gongfaMotifs.some((motif) => motif.startsWith("crucible-rune:"))).toBe(false);
  expect(snapshot.visuals.gongfaMotifs.some((motif) => motif.startsWith("ironwood-rampart:"))).toBe(false);
});

test("Gengjin Huti renders a persistent forged brace without substitute projectiles", async ({ page }) => {
  await startNewRun(page);
  await page.evaluate(() => {
    window.__gameTest!.forceEquipGongfa("gengjin-huti");
    window.__gameTest!.forceCloseDamagePlayer(20, 42);
  });
  await page.waitForFunction(() =>
    window.__gameTest!.getSnapshot().visuals.gongfaMotifs.some(
      (motif) => motif.startsWith("forged-brace:tempered-brace:")
    )
  );
  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.guard).toBe(6);
  expect(snapshot.progression.guardCapacity).toBe(100);
  expect(snapshot.visuals.projectiles.some((projectile) => projectile.sourceGongfaId === "gengjin-huti")).toBe(false);
  expect(snapshot.visuals.gongfaMotifs.some((motif) => motif.startsWith("mirror-lotus:"))).toBe(false);
});

test("Ice Mirror Guard renders persistent directional facets without substitute projectiles", async ({ page }) => {
  await startNewRun(page);
  await page.evaluate(() => {
    window.__gameTest!.forceEquipGongfa("ice-mirror-guard");
    window.__gameTest!.forceSpawnEnemies(2);
  });
  await page.waitForFunction(() =>
    window.__gameTest!.getSnapshot().visuals.gongfaMotifs.includes("mirror-lotus:directional-facets")
  );
  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.visuals.projectiles.some((projectile) =>
    projectile.sourceGongfaId === "ice-mirror-guard"
  )).toBe(false);
});

test("Black Tide renders a persistent cardinal calendar and world-phase fronts", async ({ page }) => {
  await startNewRun(page);
  await page.evaluate(() => {
    window.__gameTest!.forceEquipGongfa("black-tide-scripture");
    window.__gameTest!.forceSpawnEnemies(3);
  });
  await page.waitForFunction(() => {
    const motifs = window.__gameTest!.getSnapshot().visuals.gongfaMotifs;
    return motifs.some((motif) => motif.startsWith("world-cardinal-tide:cardinal-compass-")) &&
      motifs.some((motif) => motif.startsWith("world-cardinal-tide:world-ebb-"));
  });
  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.visuals.projectiles.some((projectile) => projectile.sourceGongfaId === "black-tide-scripture")).toBe(false);
});

test("all twelve archetype Gongfa execute their authored attacks and cast motifs", async ({ page }) => {
  await startNewRun(page);
  const cases = [
    "nine-sun-calamity-seal", "mist-wraith-canon", "heavenfall-body-art",
    "thousand-root-formation", "flame-demon-body-art", "vermilion-bird-covenant",
    "frozen-river-formation", "moonfall-tide-ritual", "sword-burial-formation",
    "heaven-sundering-edict", "myriad-beast-grove", "ancient-tree-body-art"
  ] as const;

  for (const gongfaId of cases) {
    const motif = getGongfaVisualIdentity(gongfaId).motifId;
    await page.evaluate((id) => {
      window.__gameTest!.forceClearEnemies();
      window.__gameTest!.forceSpawnHealingPill(100);
      window.__gameTest!.forceEquipGongfa(id);
      window.__gameTest!.forceSpawnEnemies(10);
    }, gongfaId);
    if (["heavenfall-body-art", "vermilion-bird-covenant", "myriad-beast-grove"].includes(gongfaId)) {
      await page.keyboard.down("d");
    }
    await expect.poll(
      () => page.evaluate((expectedMotif) => window.__gameTest!.getSnapshot().visuals.gongfaMotifs.some(
        (observed) => observed.startsWith(`${expectedMotif}:`)
      ), motif),
      { timeout: 8_000, message: `${gongfaId} should emit its ${motif} motif` }
    ).toBe(true);
    await page.keyboard.up("d");
    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    expect(snapshot.progression.gongfa).toBe(gongfaId);
    expect(snapshot.visuals.gongfaMotifs.some((observed) => observed.startsWith(`${motif}:`))).toBe(true);
  }
});
