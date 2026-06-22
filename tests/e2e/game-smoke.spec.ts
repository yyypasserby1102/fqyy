import { expect, test } from "@playwright/test";

async function chooseUntil(page: { evaluate: (fn: () => void) => Promise<void> }, predicate: (snapshot: { title: string } | undefined) => boolean): Promise<void> {
  for (let i = 0; i < 10; i += 1) {
    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    if (!snapshot.choice) {
      return;
    }

    if (predicate(snapshot.choice)) {
      return;
    }

    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  }
}

async function startNewRun(page: {
  goto: (url: string) => Promise<void>;
  getByRole: (role: string, options: { name: string }) => { click: () => Promise<void> };
  waitForFunction: (fn: () => boolean) => Promise<void>;
}) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start New Run" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));
}

async function advanceOneStage(page: { evaluate: (fn: () => void) => Promise<void> }) {
  for (let phase = 0; phase < 4; phase += 1) {
    await page.evaluate(() => {
      window.__gameTest!.forceAdvanceRealmProgress(100);
      window.__gameTest!.forceClearEnemies();
    });
    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  }

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
}

test("boots into game/ui scenes with the dev test harness exposed", async ({ page }) => {
  await startNewRun(page);

  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.sceneName).toBe("game");
  expect(snapshot.activeScenes).toContain("game");
  expect(snapshot.activeScenes).toContain("ui");
  expect(snapshot.progression.stage).toBe("lianqi");
});

test("movement updates player position in the real browser game", async ({ page }) => {
  await startNewRun(page);

  const before = await page.evaluate(() => window.__gameTest!.getSnapshot());
  await page.keyboard.down("d");
  await page.waitForTimeout(250);
  await page.keyboard.up("d");
  const after = await page.evaluate(() => window.__gameTest!.getSnapshot());

  expect(after.player.x).toBeGreaterThan(before.player.x);
});

test("the Mortal opening only spawns slow melee pursuers before Gongfa 1", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceAdvanceSpawnClock(5_000);
  });

  const beforeBreakthrough = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(Object.keys(beforeBreakthrough.counts.enemyIds)).toEqual(["jade-rat"]);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceAdvanceSpawnClock(100_000);
  });

  const afterBreakthrough = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(Object.keys(afterBreakthrough.counts.enemyIds)).toEqual(
    expect.arrayContaining(["jade-rat", "mist-wolf"])
  );
});

test("Lingcao reveal pauses the scene until a Gongfa is chosen", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSpawnEnemies(2);
  });

  const beforeReveal = await page.evaluate(() => window.__gameTest!.getSnapshot());

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
  });

  await page.waitForTimeout(1000);

  const duringReveal = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(duringReveal.counts.enemies).toBe(beforeReveal.counts.enemies);
  expect(duringReveal.counts.orbs).toBe(beforeReveal.counts.orbs);
  expect(duringReveal.choice?.title).toContain("Revealed");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await page.waitForTimeout(1000);

  const afterChoice = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterChoice.choice).toBeUndefined();
});

test("choosing a Gongfa enables combat progress against forced enemies", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
  });

  await page.evaluate(() => {
    window.__gameTest!.setRngSeed(1234);
    window.__gameTest!.forceSpawnEnemies(5);
  });
  const before = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(before.counts.enemies).toBeGreaterThanOrEqual(5);

  await page.waitForTimeout(5000);
  const after = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(after.progression.realmProgress).toBeGreaterThanOrEqual(before.progression.realmProgress);
  expect(after.progression.masteryPoints).toBeGreaterThanOrEqual(before.progression.masteryPoints);
  expect(after.counts.enemies).toBeGreaterThan(0);
});

test("Yujian Jue shows deterministic mastery rank-ups and a rank-10 skill unlock", async ({
  page
}) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceAdvanceMasteryProgress(100);
  });

  const firstRankUp = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(firstRankUp.progression.gongfa).toBe("yujian-jue");
  expect(firstRankUp.progression.masteryRank).toBeGreaterThanOrEqual(1);
  expect(firstRankUp.choice?.title).toContain("Mastery");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await page.evaluate(() => window.__gameTest!.forceAdvanceMasteryProgress(1000));

  const rank10 = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(rank10.progression.masteryRank).toBeGreaterThanOrEqual(10);
  expect(rank10.progression.masterySkill2).toBe("returning-sword-formation");
});

test("mastery rank-up choices survive reload with deterministic options", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceAdvanceMasteryProgress(100);
  });

  const beforeReload = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(beforeReload.choice?.title).toContain("Mastery");
  const optionIds = beforeReload.choice?.options.map((option) => option.id);

  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => (window.__gameTest?.getSnapshot().player.maxHealth ?? 0) > 0);

  const afterReload = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterReload.choice?.title).toBe(beforeReload.choice?.title);
  expect(afterReload.choice?.options.map((option) => option.id)).toEqual(optionIds);
  expect(afterReload.progression.masteryRank).toBe(beforeReload.progression.masteryRank);
});

test("a checkpoint resume preserves a selected mastery improvement", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceAdvanceMasteryProgress(100);
    window.__gameTest!.selectChoice(0);
  });
  const beforeReload = await page.evaluate(() => window.__gameTest!.getSnapshot());

  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => (window.__gameTest?.getSnapshot().player.maxHealth ?? 0) > 0);

  const afterReload = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterReload.combat).toEqual(beforeReload.combat);
});

test("multiple mastery rank-ups are queued in acquisition order", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceAdvanceMasteryProgress(250);
  });

  const firstPanel = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(firstPanel.choice?.title).toContain("Mastery Rank 1");
  expect(firstPanel.progression.masteryRank).toBe(2);

  await page.evaluate(() => window.__gameTest!.selectChoice(0));

  const secondPanel = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(secondPanel.choice?.title).toContain("Mastery Rank 2");
  expect(secondPanel.progression.masteryRank).toBe(2);
});

test("granted Qi advances Gongfa Mastery without a generic level-up", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.setRngSeed(9);
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceSpawnEnemies(2);
  });
  const beforeReveal = await page.evaluate(() => window.__gameTest!.getSnapshot());
  await page.evaluate(() => window.__gameTest!.forceClaimLingcao());
  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.counts.enemies).toBe(beforeReveal.counts.enemies);
  expect(snapshot.choice?.title).toContain("Revealed");
  expect(snapshot.choice?.options.map((option) => option.id)).toEqual([
    "yujian-jue",
    "jinfeng-gong",
    "gengjin-huti"
  ]);
  expect(snapshot.choice?.options.every((option) => option.description.includes("Mastery Speed"))).toBe(
    true
  );

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  const afterChoice = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterChoice.counts.enemies).toBe(beforeReveal.counts.enemies);
  await page.evaluate(() => window.__gameTest!.forceGrantQi(10));
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.gongfa).not.toBe("baseline");
  expect(snapshot.progression.masteryProgress).toBeGreaterThan(0);
  expect(snapshot.message).toBeDefined();

  await page.evaluate(() => window.__gameTest!.forceGrantQi(100));
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.masteryRank).toBeGreaterThanOrEqual(1);
  expect(snapshot.choice?.title).toContain("Mastery Rank");
  expect(snapshot.message).toContain("mastery reaches Rank");
});

test("dual-root reveals present Gongfa from both compatible root pools", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("water-metal");
    window.__gameTest!.forceClaimLingcao();
  });

  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.choice?.options.map((option) => option.id)).toEqual([
    "drifting-frost-needle",
    "yujian-jue",
    "black-tide-scripture"
  ]);
});

for (const [choiceIndex, expectedGongfa] of [
  [0, "burning-ring-scripture"],
  [1, "yujian-jue"],
  [2, "crimson-furnace-sword-art"]
] as const) {
  test(`Fire-Metal reveal deterministically accepts ${expectedGongfa}`, async ({ page }) => {
    const expectedOptionIds = [
      "burning-ring-scripture",
      "yujian-jue",
      "crimson-furnace-sword-art"
    ];

    await startNewRun(page);

    await page.evaluate(() => {
      window.__gameTest!.setRngSeed(17);
      window.__gameTest!.forceSetLinggen("fire-metal");
      window.__gameTest!.forceClaimLingcao();
    });

    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    expect(snapshot.choice?.title).toContain("Revealed");
    expect(snapshot.choice?.options.map((option) => option.id)).toEqual(expectedOptionIds);
    expect(snapshot.choice?.options.every((option) => option.description.includes("Mastery Speed"))).toBe(
      true
    );

    await page.evaluate((index) => window.__gameTest!.selectChoice(index), choiceIndex);
    const afterChoice = await page.evaluate(() => window.__gameTest!.getSnapshot());
    expect(afterChoice.progression.gongfa).toBe(expectedGongfa);
    expect(afterChoice.progression.linggen).toBe("fire-metal");
    expect(afterChoice.progression.linggenGrades).toBe("Medium, Medium");
  });
}

test("forced Qi cannot skip Realm Phases or a Stage Tribulation", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
  });

  await page.evaluate(() => window.__gameTest!.forceGrantQi(10_000));
  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("lianqi");
  expect(snapshot.progression.realmPhase).toBe("chuqi");
  expect(snapshot.progression.realmProgress).toBe(100);
});

test("Qi cannot change Stage before Realm Phases and Tribulation are complete", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceGrantQi(10_000);
  });
  await chooseUntil(page, (choice) => choice?.title.includes("Breakthrough") ?? false);

  const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("lianqi");
  expect(snapshot.progression.realmPhase).toBe("chuqi");
});

test("Lianqi Dayuanman requires its Tribulation before the Zhuji Breakthrough", async ({
  page
}) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
  });

  for (let phase = 0; phase < 3; phase += 1) {
    await page.evaluate(() => {
      window.__gameTest!.forceAdvanceRealmProgress(100);
      window.__gameTest!.forceClearEnemies();
      window.__gameTest!.selectChoice(0);
    });
  }
  await page.evaluate(() => {
    window.__gameTest!.forceAdvanceRealmProgress(100);
    window.__gameTest!.forceClearEnemies();
  });

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("lianqi");
  expect(snapshot.progression.realmPhase).toBe("dayuanman");
  expect(snapshot.choice?.title).toBe("Lianqi Tribulation");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.progression.realmPhase).toBe("chuqi");
  expect(snapshot.choice?.title).toContain("Revealed");
});

test("Lianqi cleans up through all phases and persists a second Gongfa in Zhuji", async ({
  page
}) => {
  const advancePhase = async () => {
    await page.evaluate(() => {
      window.__gameTest!.forceSpawnEnemies(1);
      window.__gameTest!.forceAdvanceRealmProgress(100);
      window.__gameTest!.forceClearEnemies();
    });

    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    expect(snapshot.choice?.title).toBe("Phase Transition");
    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  };

  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.setRngSeed(21);
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
  });

  await advancePhase();
  await advancePhase();
  await advancePhase();

  const afterDayuanman = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterDayuanman.progression.stage).toBe("lianqi");
  expect(afterDayuanman.progression.realmPhase).toBe("dayuanman");

  await page.evaluate(() => {
    window.__gameTest!.forceAdvanceRealmProgress(100);
    window.__gameTest!.forceClearEnemies();
  });

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("lianqi");
  expect(snapshot.choice?.title).toBe("Lianqi Tribulation");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.choice?.title).toContain("Revealed");
  expect(snapshot.progression.learnedGongfaIds).toHaveLength(1);

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await chooseUntil(page, () => false);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.progression.learnedGongfaIds).toHaveLength(2);

  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.progression.learnedGongfaIds).toHaveLength(2);
});

test("Zhuji breakthrough persists a third Gongfa choice into Jindan", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.setRngSeed(17);
    window.__gameTest!.forceSetLinggen("fire-metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
  });

  await advanceOneStage(page);
  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.progression.learnedGongfaIds).toHaveLength(2);

  await advanceOneStage(page);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("jindan");
  expect(snapshot.progression.learnedGongfaIds).toHaveLength(3);

  await advanceOneStage(page);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("yuanying");
  expect(snapshot.progression.learnedGongfaIds).toHaveLength(4);

  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("yuanying");
  expect(snapshot.progression.learnedGongfaIds).toHaveLength(4);
});

test("Yuanying phases lead into the Heavenly Tribulation and complete the Run", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.setRngSeed(17);
    window.__gameTest!.forceSetLinggen("fire-metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
  });

  await advanceOneStage(page);
  await advanceOneStage(page);
  await advanceOneStage(page);

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("yuanying");
  expect(snapshot.progression.learnedGongfaIds).toHaveLength(4);

  const advanceYuanyingPhase = async () => {
    await page.evaluate(() => {
      window.__gameTest!.forceSpawnEnemies(1);
      window.__gameTest!.forceAdvanceRealmProgress(100);
      window.__gameTest!.forceClearEnemies();
    });

    const phaseSnapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    expect(phaseSnapshot.choice?.title).toBe("Phase Transition");
    await page.evaluate(() => window.__gameTest!.selectChoice(0));
  };

  await advanceYuanyingPhase();
  await advanceYuanyingPhase();
  await advanceYuanyingPhase();

  await page.evaluate(() => {
    window.__gameTest!.forceSpawnEnemies(1);
    window.__gameTest!.forceAdvanceRealmProgress(100);
    window.__gameTest!.forceClearEnemies();
  });

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("yuanying");
  expect(snapshot.progression.realmPhase).toBe("dayuanman");
  expect(snapshot.choice?.title).toBe("Yuanying Heavenly Tribulation");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await page.waitForTimeout(250);
  await page.evaluate(() => window.__gameTest!.forceClearEnemies());
  await page.waitForFunction(() => Boolean(window.__gameTest!.getSnapshot().choice));

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.finalBossActive).toBe(true);
  expect(snapshot.choice?.title).toBe("Yuanying Heavenly Tribulation");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await page.waitForTimeout(250);
  await page.evaluate(() => window.__gameTest!.forceClearEnemies());
  await page.waitForFunction(() => Boolean(window.__gameTest!.getSnapshot().choice));

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.choice?.title).toBe("Yuanying Heavenly Tribulation");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await page.waitForTimeout(250);
  await page.evaluate(() => window.__gameTest!.forceClearEnemies());
  await page.waitForFunction(() => Boolean(window.__gameTest!.getSnapshot().choice));

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.choice?.title).toBe("Run Complete");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));
  await page.waitForFunction(() => !window.__gameTest);
  await page.getByRole("button", { name: "Start New Run" }).waitFor();

  const completedRuns = await page.evaluate(() => {
    const raw = window.localStorage.getItem("fqyy.profile.v1");
    return raw ? (JSON.parse(raw) as { completedRuns: number }).completedRuns : 0;
  });
  expect(completedRuns).toBeGreaterThanOrEqual(1);
  await expect(page.getByRole("button", { name: "Continue" })).toHaveCount(0);
});

test("Healing Pills heal on contact, persist when untouched, and survive phase checkpoints", async ({
  page
}) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSpawnHealingPill(24);
  });

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.counts.healingPills).toBe(1);
  expect(snapshot.player.health).toBe(snapshot.player.maxHealth);

  await page.evaluate(() => window.__gameTest!.forceDamagePlayer(20));
  await page.waitForTimeout(400);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.player.health).toBeGreaterThan(80);
  expect(snapshot.counts.healingPills).toBe(0);

  await page.evaluate(() => {
    window.__gameTest!.forceSpawnHealingPill(18);
  });
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  const positionsBefore = snapshot.counts.healingPillPositions;
  expect(positionsBefore).toHaveLength(1);

  await page.evaluate(() => {
    window.__gameTest!.forceSpawnEnemies(1);
    window.__gameTest!.forceAdvanceRealmProgress(100);
    window.__gameTest!.forceClearEnemies();
  });
  await page.waitForFunction(
    () => window.__gameTest!.getSnapshot().choice?.title === "Phase Transition"
  );
  await page.evaluate(() => window.__gameTest!.selectChoice(0));

  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.counts.healingPills).toBe(1);
  expect(snapshot.counts.healingPillPositions).toEqual(positionsBefore);
});

test("Stage Breakthroughs preserve Yujian Jue instead of upgrading it", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
  });

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.gongfa).toBe("yujian-jue");
  expect(snapshot.combat.count).toBe(1);
  expect(snapshot.combat.returnShots).toBe(0);

  await advanceOneStage(page);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.combat.count).toBe(1);
  expect(snapshot.combat.returnShots).toBe(0);

  await advanceOneStage(page);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("jindan");
  expect(snapshot.combat.count).toBe(1);
  expect(snapshot.combat.returnShots).toBe(0);
});

test("Stage Breakthroughs preserve Jinfeng Gong while Mastery remains independent", async ({
  page
}) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(1);
  });

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.gongfa).toBe("jinfeng-gong");
  expect(snapshot.combat.pattern).toBe("wave");
  expect(snapshot.progression.skillTags).toEqual(["wave", "metal"]);
  expect(snapshot.progression.galeMomentum).toBe(0);
  expect(snapshot.combat.count).toBe(2);
  expect(snapshot.combat.range).toBe(140);
  expect(snapshot.combat.returnShots).toBe(0);

  await page.keyboard.down("d");
  await page.waitForTimeout(700);
  await page.keyboard.up("d");

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.galeMomentum).toBeGreaterThan(0);
  expect(snapshot.combat.range).toBeGreaterThan(140);

  await advanceOneStage(page);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.combat.count).toBe(2);
  expect(snapshot.combat.returnShots).toBe(0);

  await advanceOneStage(page);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("jindan");
  expect(snapshot.combat.count).toBe(2);
  expect(snapshot.combat.returnShots).toBe(0);

  await page.evaluate(() => window.__gameTest!.forceAdvanceMasteryProgress(1000));
  await chooseUntil(page, () => false);

  const beforeSkill2Window = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(beforeSkill2Window.progression.masteryRank).toBeGreaterThanOrEqual(10);
  expect(beforeSkill2Window.progression.masterySkill2).toBe("golden-gale-corridor");

  await page.waitForTimeout(3200);

  const afterSkill2Window = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterSkill2Window.progression.masterySkill2Casts).toBeGreaterThan(
    beforeSkill2Window.progression.masterySkill2Casts
  );
});

test("Stage Breakthroughs preserve Gengjin Huti while Mastery remains independent", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(2);
  });

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.gongfa).toBe("gengjin-huti");
  expect(snapshot.combat.pattern).toBe("aura");
  expect(snapshot.progression.skillTags).toEqual(["aura", "metal", "defensive"]);
  expect(snapshot.progression.guard).toBe(0);
  expect(snapshot.progression.guardMitigation).toBe(0);
  expect(snapshot.combat.auraRadius).toBe(92);
  expect(snapshot.combat.retaliationDamage).toBeGreaterThanOrEqual(8);
  expect(snapshot.combat.shellBursts).toBe(0);

  await page.evaluate(() => {
    window.__gameTest!.forceSpawnEnemies(4);
  });
  await page.waitForTimeout(1200);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.guard).toBeGreaterThan(0);
  expect(snapshot.progression.guardMitigation).toBeGreaterThan(0);
  expect(snapshot.combat.retaliationDamage).toBeGreaterThan(8);

  const beforeMitigatedDamage = snapshot.player.health;
  await page.evaluate(() => window.__gameTest!.forceDamagePlayer(20));
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(beforeMitigatedDamage - snapshot.player.health).toBeLessThan(20);

  await advanceOneStage(page);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.combat.auraRadius).toBe(92);
  expect(snapshot.combat.shellBursts).toBe(0);

  await advanceOneStage(page);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("jindan");
  expect(snapshot.combat.auraRadius).toBe(92);
  expect(snapshot.combat.shellBursts).toBe(0);

  await page.evaluate(() => window.__gameTest!.forceAdvanceMasteryProgress(1000));
  await chooseUntil(page, () => false);
  await page.waitForTimeout(120);
  await chooseUntil(page, () => false);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.masteryRank).toBeGreaterThanOrEqual(10);
  expect(snapshot.progression.masterySkill2).toBe("blade-shell-rebound");

  await page.evaluate(() => {
    window.__gameTest!.forceSpawnEnemies(8);
    window.__gameTest!.forceDamagePlayer(40);
    window.__gameTest!.forceDamagePlayer(40);
  });
  await page.waitForTimeout(1000);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.bladeShellCasts).toBeGreaterThan(0);
});

test("Burning Ring Scripture builds Heat and unlocks Solar Flare Cycle", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("fire");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(2);
  });

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.gongfa).toBe("burning-ring-scripture");
  expect(snapshot.progression.skillTags).toEqual(["aura", "fire"]);
  expect(snapshot.progression.heat).toBe(0);
  expect(snapshot.combat.auraRadius).toBe(90);
  expect(snapshot.combat.retaliationDamage).toBeGreaterThanOrEqual(10);
  expect(snapshot.combat.segmentCount).toBe(6);

  await page.evaluate(() => {
    window.__gameTest!.forceSpawnEnemies(4);
  });
  const beforeHeatCooldown = snapshot.combat.cooldownMs;
  await page.waitForTimeout(1200);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.heat).toBeGreaterThan(0);
  expect(snapshot.progression.heat).toBeLessThanOrEqual(100);
  expect(snapshot.combat.cooldownMs).toBeLessThan(beforeHeatCooldown);

  await advanceOneStage(page);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("zhuji");
  expect(snapshot.combat.segmentCount).toBe(6);

  await advanceOneStage(page);
  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.stage).toBe("jindan");
  expect(snapshot.combat.returnShots).toBe(0);

  await page.evaluate(() => window.__gameTest!.forceAdvanceMasteryProgress(1000));
  await chooseUntil(page, () => false);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.masteryRank).toBeGreaterThanOrEqual(10);
  expect(snapshot.progression.masterySkill2).toBe("solar-flare-cycle");

  await page.waitForTimeout(3200);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.masterySkill2Casts).toBeGreaterThan(0);
});

test("Crimson Furnace Sword Art embeds targets, falls back on timeout, and unlocks Furnace Cascade", async ({
  page
}) => {
  await startNewRun(page);

  const chooseOptionById = async (optionId: string) => {
    const snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
    const choiceIndex = snapshot.choice?.options.findIndex((option) => option.id === optionId) ?? -1;
    expect(choiceIndex).toBeGreaterThanOrEqual(0);
    await page.evaluate((index) => {
      window.__gameTest!.selectChoice(index);
    }, choiceIndex);
  };

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("fire-metal");
    window.__gameTest!.forceClaimLingcao();
  });
  await chooseOptionById("crimson-furnace-sword-art");

  let snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.gongfa).toBe("crimson-furnace-sword-art");
  expect(snapshot.progression.skillTags).toEqual([
    "projectile",
    "explosive",
    "fire",
    "metal"
  ]);
  expect(snapshot.progression.pressure).toBe(0);
  expect(snapshot.combat.range).toBeGreaterThan(0);

  await page.evaluate(() => {
    window.__gameTest!.forceSpawnEnemies(2);
  });
  await page.waitForTimeout(1100);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.embeddedEnemies).toBeGreaterThan(0);
  const beforePressure = snapshot.progression.pressure;
  const beforeRange = snapshot.combat.range;

  await page.waitForTimeout(1300);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.pressure).toBeGreaterThan(beforePressure);
  expect(snapshot.combat.range).toBeGreaterThan(beforeRange);

  await page.evaluate(() => window.__gameTest!.forceAdvanceMasteryProgress(1000));
  await chooseUntil(page, () => false);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.masteryRank).toBeGreaterThanOrEqual(10);
  expect(snapshot.progression.masterySkill2).toBe("furnace-cascade");

  await page.waitForTimeout(400);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  const beforeCascadePressure = snapshot.progression.pressure;

  await page.waitForTimeout(3000);

  snapshot = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(snapshot.progression.furnaceCascadeCasts).toBeGreaterThan(0);
  expect(snapshot.progression.pressure).toBeGreaterThan(beforeCascadePressure);
});

test("Start New Run persists a mortal shell that Continue restores after reload", async ({
  page
}) => {
  await startNewRun(page);

  const beforeReload = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(beforeReload.progression.stage).toBe("lianqi");
  expect(beforeReload.progression.gongfa).toBe("baseline");
  expect(beforeReload.progression.linggen).toBe("unrevealed");
  expect(beforeReload.progression.lingcaoMarker).toMatch(/\d+m /);

  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));

  const afterReload = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterReload.progression.stage).toBe(beforeReload.progression.stage);
  expect(afterReload.progression.gongfa).toBe(beforeReload.progression.gongfa);
  expect(afterReload.progression.linggen).toBe(beforeReload.progression.linggen);
  expect(afterReload.progression.lingcaoCollected).toBe(beforeReload.progression.lingcaoCollected);
  expect(afterReload.progression.lingcaoMarker).toBe(beforeReload.progression.lingcaoMarker);
  expect(afterReload.player.maxHealth).toBe(beforeReload.player.maxHealth);
  expect(afterReload.player.moveSpeed).toBe(beforeReload.player.moveSpeed);
});

test("first breakthrough saves a resumable Lianqi run after Gongfa selection", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
  });

  const beforeReload = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(beforeReload.progression.stage).toBe("lianqi");
  expect(beforeReload.progression.gongfa).toBe("yujian-jue");
  expect(beforeReload.progression.linggen).toBe("metal");
  expect(beforeReload.progression.linggenGrades).toBe("Strong");
  expect(beforeReload.progression.lingcaoCollected).toBe(true);

  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));

  const afterReload = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterReload.progression.stage).toBe("lianqi");
  expect(afterReload.progression.gongfa).toBe("yujian-jue");
  expect(afterReload.progression.linggen).toBe("metal");
  expect(afterReload.progression.linggenGrades).toBe("Strong");
  expect(afterReload.progression.lingcaoCollected).toBe(true);
});

test("death removes the active run save so Continue disappears after reload", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceDamagePlayer(999);
  });

  const afterDeath = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterDeath.progression.stage).toBe("lianqi");
  expect(afterDeath.player.health).toBe(0);

  await page.reload();
  await page.waitForFunction(() => document.querySelector("button"));
  const continueButton = await page.getByRole("button", { name: "Continue" });
  await expect(continueButton).toHaveCount(0);
});

test("Lianqi Chuqi transitions to Zhongqi after Qi reaches the checkpoint and resumes from the checkpoint", async ({
  page
}) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceSpawnEnemies(1);
    window.__gameTest!.forceSpawnQiOrb(1);
    window.__gameTest!.forceAdvanceRealmProgress(100);
    window.__gameTest!.forceClearEnemies();
  });

  const beforeReload = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(beforeReload.progression.stage).toBe("lianqi");
  expect(beforeReload.progression.realmPhase).toBe("chuqi");
  expect(beforeReload.progression.realmProgress).toBe(100);
  expect(beforeReload.progression.foundationGrowthTransactions).toBe(0);
  expect(beforeReload.choice?.title).toBe("Phase Transition");
  expect(beforeReload.choice?.options.map((option) => option.title)).toEqual([
    "Continue to zhongqi",
    "Return to Title",
    "Abandon Run"
  ]);
  expect(beforeReload.counts.orbs).toBe(1);
  expect(beforeReload.progression.realmProgress).toBeGreaterThanOrEqual(1);

  await page.reload();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForFunction(() => Boolean(window.__gameTest));

  const resumed = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(resumed.choice?.title).toBe("Phase Transition");
  expect(resumed.progression.stage).toBe("lianqi");
  expect(resumed.progression.realmPhase).toBe("chuqi");

  await page.evaluate(() => window.__gameTest!.selectChoice(0));

  const afterChoice = await page.evaluate(() => window.__gameTest!.getSnapshot());
  expect(afterChoice.progression.stage).toBe("lianqi");
  expect(afterChoice.progression.realmPhase).toBe("zhongqi");
  expect(afterChoice.progression.realmProgress).toBe(0);
  expect(afterChoice.progression.foundationGrowthTransactions).toBe(1);
  expect(afterChoice.counts.orbs).toBe(0);
  expect(afterChoice.choice).toBeUndefined();
});

test("phase transition return to title keeps the active save on the shell", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceSpawnEnemies(1);
    window.__gameTest!.forceAdvanceRealmProgress(100);
    window.__gameTest!.forceClearEnemies();
  });

  await page.evaluate(() => window.__gameTest!.selectChoice(1));
  await page.waitForFunction(() => Boolean(document.querySelector("button")));

  const continueButton = page.getByRole("button", { name: "Continue" });
  await expect(continueButton).toHaveCount(1);
});

test("phase transition abandon run deletes the active save on the shell", async ({ page }) => {
  await startNewRun(page);

  await page.evaluate(() => {
    window.__gameTest!.forceSetLinggen("metal");
    window.__gameTest!.forceClaimLingcao();
    window.__gameTest!.selectChoice(0);
    window.__gameTest!.forceSpawnEnemies(1);
    window.__gameTest!.forceAdvanceRealmProgress(100);
    window.__gameTest!.forceClearEnemies();
  });

  await page.evaluate(() => window.__gameTest!.selectChoice(2));
  await page.waitForFunction(() => Boolean(document.querySelector("button")));

  const continueButton = page.getByRole("button", { name: "Continue" });
  await expect(continueButton).toHaveCount(0);
});

test("starting a new run with an active save requires an abandon confirmation", async ({
  page
}) => {
  await startNewRun(page);
  await page.reload();

  await page.getByRole("button", { name: "Start New Run" }).click();
  await expect(page.getByRole("button", { name: "Confirm Abandon Run" })).toHaveCount(1);

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("button", { name: "Continue" })).toHaveCount(1);
});
