import type { RealmPhaseId, StageId } from "../data/stages";

export interface RunJourneyState {
  stage: StageId;
  realmPhase: RealmPhaseId;
  realmProgress: number;
  phaseCleanupActive: boolean;
  foundationGrowthTransactions?: number;
  finalBossActive?: boolean;
  finalBossPhaseIndex?: number;
  gameOver?: boolean;
}

export type CleanupDecision =
  | { kind: "phase-transition"; nextPhase: Exclude<RealmPhaseId, "chuqi"> }
  | { kind: "tribulation"; stage: StageId };

export type RunJourneyDecision =
  | CleanupDecision
  | { kind: "yuanying-tribulation" }
  | { kind: "final-boss-phase"; nextPhaseIndex: number };

export type RunJourneyEvent =
  | { kind: "realm-qi-gained"; amount: number }
  | { kind: "cleanup-finished" }
  | { kind: "journey-choice-accepted"; decision: RunJourneyDecision }
  | { kind: "final-boss-phase-cleared" };

export type RunJourneyCommand =
  | { kind: "present-journey-choice"; decision: RunJourneyDecision }
  | { kind: "persist-checkpoint" }
  | { kind: "start-final-boss"; phaseIndex: number }
  | { kind: "advance-final-boss-phase"; phaseIndex: number }
  | { kind: "complete-run" };

export interface RunJourneyResult {
  state: RunJourneyState;
  commands: RunJourneyCommand[];
}

export interface RunJourneyCheckpointFields {
  stage: StageId;
  realmPhase: RealmPhaseId;
  realmProgress: number;
  phaseCleanupActive: boolean;
  foundationGrowthTransactions: number;
  finalBossActive: boolean;
  finalBossPhaseIndex: number;
}

const nextRealmPhase: Partial<Record<RealmPhaseId, RealmPhaseId>> = {
  chuqi: "zhongqi",
  zhongqi: "houqi",
  houqi: "dayuanman"
};

const nextStage: Partial<Record<StageId, StageId>> = {
  lianqi: "zhuji",
  zhuji: "jindan",
  jindan: "yuanying"
};

function incrementFoundationGrowth(state: RunJourneyState): RunJourneyState {
  return {
    ...state,
    foundationGrowthTransactions: (state.foundationGrowthTransactions ?? 0) + 1
  };
}

function completeRun(state: RunJourneyState): RunJourneyResult {
  return {
    state: {
      ...state,
      phaseCleanupActive: false,
      finalBossActive: false,
      gameOver: true
    },
    commands: [{ kind: "complete-run" }]
  };
}

export function projectRunJourneyCheckpointFields(
  state: RunJourneyState
): RunJourneyCheckpointFields {
  return {
    stage: state.stage,
    realmPhase: state.realmPhase,
    realmProgress: state.realmProgress,
    phaseCleanupActive: state.phaseCleanupActive,
    foundationGrowthTransactions: state.foundationGrowthTransactions ?? 0,
    finalBossActive: state.finalBossActive ?? false,
    finalBossPhaseIndex: state.finalBossPhaseIndex ?? 0
  };
}

export function createRunJourneyStateFromCheckpoint(
  checkpoint: RunJourneyCheckpointFields
): RunJourneyState {
  return {
    ...checkpoint,
    gameOver: false
  };
}

export function advanceRunJourney(
  state: RunJourneyState,
  event: RunJourneyEvent
): RunJourneyResult {
  if (event.kind === "realm-qi-gained") {
    return {
      state: grantRealmQi(state, event.amount),
      commands: []
    };
  }

  if (event.kind === "cleanup-finished") {
    if (state.finalBossActive) {
      if ((state.finalBossPhaseIndex ?? 0) >= 2) {
        return completeRun(state);
      }

      const nextPhaseIndex = (state.finalBossPhaseIndex ?? 0) + 1;
      return {
        state,
        commands: [
          {
            kind: "present-journey-choice",
            decision: { kind: "final-boss-phase", nextPhaseIndex }
          }
        ]
      };
    }

    const cleanupDecision = getCleanupDecision(state);
    const decision =
      cleanupDecision?.kind === "tribulation" && cleanupDecision.stage === "yuanying"
        ? ({ kind: "yuanying-tribulation" } as const)
        : cleanupDecision;
    return {
      state,
      commands: decision ? [{ kind: "present-journey-choice", decision }] : []
    };
  }

  if (event.kind === "journey-choice-accepted") {
    if (event.decision.kind === "phase-transition") {
      return {
        state: incrementFoundationGrowth(completePhaseTransition(state)),
        commands: [{ kind: "persist-checkpoint" }]
      };
    }

    if (event.decision.kind === "tribulation") {
      const result = completeStageTribulation(state);
      if (result.outcome === "breakthrough") {
        return {
          state: incrementFoundationGrowth(result.state),
          commands: [{ kind: "persist-checkpoint" }]
        };
      }
    }

    if (event.decision.kind === "yuanying-tribulation") {
      return {
        state: {
          ...state,
          realmProgress: 0,
          phaseCleanupActive: false,
          finalBossActive: true,
          finalBossPhaseIndex: 0,
          gameOver: false
        },
        commands: [
          { kind: "start-final-boss", phaseIndex: 0 },
          { kind: "persist-checkpoint" }
        ]
      };
    }

    if (event.decision.kind === "final-boss-phase") {
      return {
        state: {
          ...state,
          phaseCleanupActive: false,
          finalBossActive: true,
          finalBossPhaseIndex: event.decision.nextPhaseIndex,
          gameOver: false
        },
        commands: [
          { kind: "advance-final-boss-phase", phaseIndex: event.decision.nextPhaseIndex },
          { kind: "persist-checkpoint" }
        ]
      };
    }
  }

  if (event.kind === "final-boss-phase-cleared") {
    if (state.finalBossActive && (state.finalBossPhaseIndex ?? 0) >= 2) {
      return completeRun(state);
    }

    const clearedState = {
      ...state,
      phaseCleanupActive: true
    };
    return advanceRunJourney(clearedState, { kind: "cleanup-finished" });
  }

  return { state, commands: [] };
}

export function grantRealmQi(state: RunJourneyState, amount: number): RunJourneyState {
  if (amount <= 0 || state.phaseCleanupActive) {
    return state;
  }

  const realmProgress = Math.min(100, state.realmProgress + amount);
  return {
    ...state,
    realmProgress,
    phaseCleanupActive: realmProgress >= 100
  };
}

export function getCleanupDecision(state: RunJourneyState): CleanupDecision | undefined {
  if (!state.phaseCleanupActive || state.realmProgress < 100) {
    return undefined;
  }

  const nextPhase = nextRealmPhase[state.realmPhase];
  return nextPhase
    ? { kind: "phase-transition", nextPhase: nextPhase as Exclude<RealmPhaseId, "chuqi"> }
    : { kind: "tribulation", stage: state.stage };
}

export function completePhaseTransition(state: RunJourneyState): RunJourneyState {
  const decision = getCleanupDecision(state);
  if (!decision || decision.kind !== "phase-transition") {
    throw new Error("The Run is not ready for a Realm Phase transition.");
  }

  return {
    ...state,
    realmPhase: decision.nextPhase,
    realmProgress: 0,
    phaseCleanupActive: false
  };
}

export function completeStageTribulation(
  state: RunJourneyState
):
  | { outcome: "breakthrough"; state: RunJourneyState }
  | { outcome: "normal-ending"; state: RunJourneyState } {
  const decision = getCleanupDecision(state);
  if (!decision || decision.kind !== "tribulation") {
    throw new Error("The Run is not ready to complete a Stage Tribulation.");
  }

  const destination = nextStage[state.stage];
  if (!destination) {
    return { outcome: "normal-ending", state };
  }

  return {
    outcome: "breakthrough",
    state: {
      ...state,
      stage: destination,
      realmPhase: "chuqi",
      realmProgress: 0,
      phaseCleanupActive: false
    }
  };
}
