import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { claimOpeningLingcao } from "./helpers/claimOpeningLingcao";

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
  for (const enemyId of enemyIds) {
    const visual = visuals.find((candidate) => candidate.enemyId === enemyId);
    expect(visual).toMatchObject({
      enemyId,
      textureKey: enemyVisuals[enemyId][0],
      animationKey: enemyVisuals[enemyId][1],
      state: "pursue",
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

for (const visualCase of [
  {
    linggen: "metal",
    choiceIndex: 0,
    gongfa: "yujian-jue",
    projectile: "flying-sword",
    travel: "projectile-flying-sword-travel",
    impact: "impact-flying-sword",
  },
  {
    linggen: "metal",
    choiceIndex: 1,
    gongfa: "jinfeng-gong",
    projectile: "metal-wave",
    travel: "projectile-metal-wave-travel",
    impact: "impact-metal-wave",
  },
  {
    linggen: "metal",
    choiceIndex: 2,
    gongfa: "gengjin-huti",
    projectile: "aura-blade",
    travel: "projectile-aura-blade-travel",
    impact: "impact-aura-blade",
  },
  {
    linggen: "water-metal",
    choiceIndex: 0,
    gongfa: "drifting-frost-needle",
    projectile: "qi-bolt",
    travel: "projectile-qi-bolt-travel",
    impact: "impact-qi-bolt",
  },
] as const) {
  test(`${visualCase.gongfa} uses its production travel and impact family`, async ({
    page,
  }) => {
    await startNewRun(page, visualCase.linggen);
    await claimOpeningLingcao(page);
    await page.evaluate(
      (index) => window.__gameTest!.selectChoice(index),
      visualCase.choiceIndex,
    );
    await page.evaluate(() => {
      window.__gameTest!.forceSpawnEnemy("celestial-construct");
      window.__gameTest!.forceSpawnEnemy("celestial-construct");
      window.__gameTest!.forceSpawnEnemy("celestial-construct");
    });

    await page.waitForFunction(
      ({ projectile, travel }) =>
        window
          .__gameTest!.getSnapshot()
          .visuals.projectiles.some(
            (visual) =>
              visual.logicalTexture === projectile &&
              visual.textureKey === "gongfa-projectile-atlas" &&
              visual.animationKey === travel,
          ),
      { projectile: visualCase.projectile, travel: visualCase.travel },
    );
    const travelAngles = await page.evaluate(
      (logicalTexture) =>
        window
          .__gameTest!.getSnapshot()
          .visuals.projectiles.filter(
            (visual) => visual.logicalTexture === logicalTexture,
          )
          .map((visual) => visual.angle),
      visualCase.projectile,
    );
    expect(travelAngles.some((angle) => Math.abs(angle) > 5)).toBe(true);
    await page.waitForFunction(
      (impact) =>
        window
          .__gameTest!.getSnapshot()
          .visuals.projectileImpacts.includes(impact),
      visualCase.impact,
    );
  });
}
