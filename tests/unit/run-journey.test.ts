import { describe, expect, it } from "vitest";
import {
  completePhaseTransition,
  completeStageTribulation,
  getCleanupDecision,
  grantRealmQi
} from "../../src/logic/runJourney";

describe("Run journey", () => {
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
});
