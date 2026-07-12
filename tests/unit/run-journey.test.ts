import { describe, expect, it } from "vitest";
import {
  advanceRunJourney,
  completePhaseTransition,
  completeStageTribulation,
  createRunJourneyStateFromCheckpoint,
  getStageBreakthroughDestination,
  getCleanupDecision,
  grantRealmQi,
  projectRunJourneyCheckpointFields
} from "../../src/logic/runJourney";

describe("Run journey", () => {
  it("owns the legal Stage breakthrough destinations", () => {
    expect(getStageBreakthroughDestination("lianqi")).toBe("zhuji");
    expect(getStageBreakthroughDestination("zhuji")).toBe("jindan");
    expect(getStageBreakthroughDestination("jindan")).toBe("yuanying");
    expect(getStageBreakthroughDestination("yuanying")).toBeUndefined();
  });

  it("owns durable journey checkpoint projection and restoration", () => {
    const state = {
      stage: "jindan" as const,
      realmPhase: "houqi" as const,
      realmProgress: 42,
      phaseCleanupActive: false,
      foundationGrowthTransactions: 5,
      finalBossActive: true,
      finalBossPhaseIndex: 1,
      pendingDecision: { kind: "final-boss-phase" as const, nextPhaseIndex: 2 },
      gameOver: false
    };

    const checkpoint = projectRunJourneyCheckpointFields(state);

    expect(checkpoint).toEqual({
      stage: "jindan",
      realmPhase: "houqi",
      realmProgress: 42,
      phaseCleanupActive: false,
      foundationGrowthTransactions: 5,
      finalBossActive: true,
      finalBossPhaseIndex: 1,
      pendingDecision: { kind: "final-boss-phase", nextPhaseIndex: 2 }
    });
    expect(createRunJourneyStateFromCheckpoint(checkpoint)).toEqual(state);
  });

  it("drives Realm Progress cleanup and phase transition through runtime events", () => {
    const initial = {
      stage: "lianqi" as const,
      realmPhase: "chuqi" as const,
      realmProgress: 0,
      phaseCleanupActive: false,
      foundationGrowthTransactions: 0,
      finalBossActive: false,
      finalBossPhaseIndex: 0,
      gameOver: false
    };

    const progress = advanceRunJourney(initial, {
      kind: "realm-qi-gained",
      amount: 100
    });

    expect(progress.state).toMatchObject({
      realmProgress: 100,
      phaseCleanupActive: true
    });
    expect(progress.commands).toEqual([]);

    const cleanup = advanceRunJourney(progress.state, {
      kind: "cleanup-finished"
    });

    expect(cleanup.commands).toEqual([
      { kind: "present-journey-choice" },
      { kind: "persist-checkpoint" }
    ]);

    const accepted = advanceRunJourney(cleanup.state, {
      kind: "journey-choice-accepted"
    });

    expect(accepted.state).toMatchObject({
      stage: "lianqi",
      realmPhase: "zhongqi",
      realmProgress: 0,
      phaseCleanupActive: false,
      foundationGrowthTransactions: 1
    });
    expect(accepted.commands).toEqual([{ kind: "persist-checkpoint" }]);
  });

  it("owns a pending journey decision until its legal acceptance", () => {
    const cleanupReady = {
      stage: "lianqi" as const,
      realmPhase: "chuqi" as const,
      realmProgress: 100,
      phaseCleanupActive: true,
      foundationGrowthTransactions: 0,
      finalBossActive: false,
      finalBossPhaseIndex: 0,
      gameOver: false
    };

    const presented = advanceRunJourney(cleanupReady, { kind: "cleanup-finished" });
    expect(presented.state).toMatchObject({
      pendingDecision: { kind: "phase-transition", nextPhase: "zhongqi" }
    });
    expect(presented.commands).toEqual([
      { kind: "present-journey-choice" },
      { kind: "persist-checkpoint" }
    ]);

    const accepted = advanceRunJourney(presented.state, {
      kind: "journey-choice-accepted"
    });
    expect(accepted.state).toMatchObject({
      realmPhase: "zhongqi",
      pendingDecision: undefined
    });

    expect(
      advanceRunJourney(cleanupReady, { kind: "journey-choice-accepted" })
    ).toEqual({ state: cleanupReady, commands: [] });
  });

  it("drives Stage Tribulation breakthroughs through runtime events", () => {
    const ready = {
      stage: "lianqi" as const,
      realmPhase: "dayuanman" as const,
      realmProgress: 100,
      phaseCleanupActive: true,
      foundationGrowthTransactions: 2,
      finalBossActive: false,
      finalBossPhaseIndex: 0,
      gameOver: false
    };

    const cleanup = advanceRunJourney(ready, {
      kind: "cleanup-finished"
    });

    expect(cleanup.commands).toEqual([
      { kind: "present-journey-choice" },
      { kind: "persist-checkpoint" }
    ]);

    const accepted = advanceRunJourney(cleanup.state, {
      kind: "journey-choice-accepted"
    });

    expect(accepted.state).toMatchObject({
      stage: "zhuji",
      realmPhase: "chuqi",
      realmProgress: 0,
      phaseCleanupActive: false,
      foundationGrowthTransactions: 3
    });
    expect(accepted.commands).toEqual([{ kind: "persist-checkpoint" }]);
  });

  it("starts the Yuanying Heavenly Tribulation through runtime events", () => {
    const ready = {
      stage: "yuanying" as const,
      realmPhase: "dayuanman" as const,
      realmProgress: 100,
      phaseCleanupActive: true,
      foundationGrowthTransactions: 7,
      finalBossActive: false,
      finalBossPhaseIndex: 0,
      gameOver: false
    };

    const cleanup = advanceRunJourney(ready, {
      kind: "cleanup-finished"
    });

    expect(cleanup.commands).toEqual([
      { kind: "present-journey-choice" },
      { kind: "persist-checkpoint" }
    ]);

    const accepted = advanceRunJourney(cleanup.state, {
      kind: "journey-choice-accepted"
    });

    expect(accepted.state).toMatchObject({
      stage: "yuanying",
      realmPhase: "dayuanman",
      realmProgress: 0,
      phaseCleanupActive: false,
      foundationGrowthTransactions: 7,
      finalBossActive: true,
      finalBossPhaseIndex: 0,
      gameOver: false
    });
    expect(accepted.commands).toEqual([
      { kind: "start-final-boss", phaseIndex: 0 },
      { kind: "persist-checkpoint" }
    ]);
  });

  it("advances final boss phases through runtime events", () => {
    const phaseCleared = {
      stage: "yuanying" as const,
      realmPhase: "dayuanman" as const,
      realmProgress: 0,
      phaseCleanupActive: false,
      foundationGrowthTransactions: 7,
      finalBossActive: true,
      finalBossPhaseIndex: 0,
      gameOver: false
    };

    const cleanup = advanceRunJourney(phaseCleared, {
      kind: "final-boss-phase-cleared"
    });

    expect(cleanup.state).toMatchObject({
      finalBossActive: true,
      finalBossPhaseIndex: 0,
      phaseCleanupActive: true
    });
    expect(cleanup.commands).toEqual([
      { kind: "present-journey-choice" },
      { kind: "persist-checkpoint" }
    ]);

    const accepted = advanceRunJourney(cleanup.state, {
      kind: "journey-choice-accepted"
    });

    expect(accepted.state).toMatchObject({
      finalBossActive: true,
      finalBossPhaseIndex: 1,
      phaseCleanupActive: false,
      gameOver: false
    });
    expect(accepted.commands).toEqual([
      { kind: "advance-final-boss-phase", phaseIndex: 1 },
      { kind: "persist-checkpoint" }
    ]);
  });

  it("completes the Run after the final Yuanying Tribulation phase clears", () => {
    const finalPhaseCleared = {
      stage: "yuanying" as const,
      realmPhase: "dayuanman" as const,
      realmProgress: 0,
      phaseCleanupActive: false,
      foundationGrowthTransactions: 7,
      finalBossActive: true,
      finalBossPhaseIndex: 2,
      gameOver: false
    };

    const result = advanceRunJourney(finalPhaseCleared, {
      kind: "final-boss-phase-cleared"
    });

    expect(result.state).toMatchObject({
      finalBossActive: false,
      finalBossPhaseIndex: 2,
      phaseCleanupActive: false,
      gameOver: true
    });
    expect(result.commands).toEqual([
      { kind: "complete-run" }
    ]);
  });

  it("completes the Run if final boss cleanup is resolved from an already-cleared final phase", () => {
    const result = advanceRunJourney(
      {
        stage: "yuanying",
        realmPhase: "dayuanman",
        realmProgress: 0,
        phaseCleanupActive: true,
        foundationGrowthTransactions: 7,
        finalBossActive: true,
        finalBossPhaseIndex: 2,
        gameOver: false
      },
      {
        kind: "cleanup-finished"
      }
    );

    expect(result.state).toMatchObject({
      finalBossActive: false,
      finalBossPhaseIndex: 2,
      phaseCleanupActive: false,
      gameOver: true
    });
    expect(result.commands).toEqual([{ kind: "complete-run" }]);
  });

  it("caps Realm Progress and starts cleanup without changing Stage or Realm Phase", () => {
    const result = grantRealmQi(
      {
        stage: "lianqi",
        realmPhase: "chuqi",
        realmProgress: 0,
        phaseCleanupActive: false
      },
      10_000
    );

    expect(result).toEqual({
      stage: "lianqi",
      realmPhase: "chuqi",
      realmProgress: 100,
      phaseCleanupActive: true
    });
  });

  it("ignores non-positive Qi and does not progress while cleanup is active", () => {
    const state = {
      stage: "lianqi" as const,
      realmPhase: "chuqi" as const,
      realmProgress: 40,
      phaseCleanupActive: false
    };
    const cleanup = {
      ...state,
      realmProgress: 100,
      phaseCleanupActive: true
    };

    expect(grantRealmQi(state, 0)).toBe(state);
    expect(grantRealmQi(state, -5)).toBe(state);
    expect(grantRealmQi(cleanup, 10)).toBe(cleanup);
  });

  it("does not choose cleanup work before a phase is complete", () => {
    expect(
      getCleanupDecision({
        stage: "lianqi",
        realmPhase: "chuqi",
        realmProgress: 99,
        phaseCleanupActive: true
      })
    ).toBeUndefined();
    expect(
      getCleanupDecision({
        stage: "lianqi",
        realmPhase: "chuqi",
        realmProgress: 100,
        phaseCleanupActive: false
      })
    ).toBeUndefined();
  });

  it("advances Realm Phases in order after cleanup", () => {
    const cleaned = {
      stage: "lianqi" as const,
      realmPhase: "chuqi" as const,
      realmProgress: 100,
      phaseCleanupActive: true
    };

    expect(getCleanupDecision(cleaned)).toEqual({
      kind: "phase-transition",
      nextPhase: "zhongqi"
    });
    expect(completePhaseTransition(cleaned)).toEqual({
      stage: "lianqi",
      realmPhase: "zhongqi",
      realmProgress: 0,
      phaseCleanupActive: false
    });
  });

  it("changes Stage only after Dayuanman cleanup and Tribulation victory", () => {
    const dayuanman = {
      stage: "lianqi" as const,
      realmPhase: "dayuanman" as const,
      realmProgress: 100,
      phaseCleanupActive: true
    };

    expect(getCleanupDecision(dayuanman)).toEqual({
      kind: "tribulation",
      stage: "lianqi"
    });
    expect(completeStageTribulation(dayuanman)).toEqual({
      outcome: "breakthrough",
      state: {
        stage: "zhuji",
        realmPhase: "chuqi",
        realmProgress: 0,
        phaseCleanupActive: false
      }
    });
  });

  it("applies the same Stage Tribulation rule through Zhuji, Jindan, and Yuanying", () => {
    const zhuji = {
      stage: "zhuji" as const,
      realmPhase: "dayuanman" as const,
      realmProgress: 100,
      phaseCleanupActive: true
    };
    const jindan = {
      stage: "jindan" as const,
      realmPhase: "dayuanman" as const,
      realmProgress: 100,
      phaseCleanupActive: true
    };
    const yuanying = {
      stage: "yuanying" as const,
      realmPhase: "dayuanman" as const,
      realmProgress: 100,
      phaseCleanupActive: true
    };

    expect(getCleanupDecision(zhuji)).toEqual({
      kind: "tribulation",
      stage: "zhuji"
    });
    expect(completeStageTribulation(zhuji)).toEqual({
      outcome: "breakthrough",
      state: {
        stage: "jindan",
        realmPhase: "chuqi",
        realmProgress: 0,
        phaseCleanupActive: false
      }
    });

    expect(getCleanupDecision(jindan)).toEqual({
      kind: "tribulation",
      stage: "jindan"
    });
    expect(completeStageTribulation(jindan)).toEqual({
      outcome: "breakthrough",
      state: {
        stage: "yuanying",
        realmPhase: "chuqi",
        realmProgress: 0,
        phaseCleanupActive: false
      }
    });

    expect(getCleanupDecision(yuanying)).toEqual({
      kind: "tribulation",
      stage: "yuanying"
    });
    expect(completeStageTribulation(yuanying)).toEqual({
      outcome: "normal-ending",
      state: yuanying
    });
  });

  it("throws when transition completion is called before the matching cleanup decision", () => {
    const notReady = {
      stage: "lianqi" as const,
      realmPhase: "chuqi" as const,
      realmProgress: 40,
      phaseCleanupActive: false
    };
    const phaseReady = {
      ...notReady,
      realmProgress: 100,
      phaseCleanupActive: true
    };

    expect(() => completePhaseTransition(notReady)).toThrow(
      "Realm Phase transition"
    );
    expect(() => completeStageTribulation(phaseReady)).toThrow(
      "Stage Tribulation"
    );
  });
});
