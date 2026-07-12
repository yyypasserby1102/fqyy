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
  pendingDecision?: RunJourneyDecision;
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
  | { kind: "journey-choice-accepted" }
  | { kind: "final-boss-phase-cleared" }
  | { kind: "player-died" };

export type RunJourneyCommand =
  | { kind: "present-journey-choice" }
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
  pendingDecision?: RunJourneyDecision;
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

export function getStageBreakthroughDestination(stage: StageId): StageId | undefined {
  return nextStage[stage];
}

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
      gameOver: true,
      pendingDecision: undefined
    },
    commands: [{ kind: "complete-run" }]
  };
}

function presentJourneyDecision(
  state: RunJourneyState,
  decision: RunJourneyDecision
): RunJourneyResult {
  return {
    state: { ...state, pendingDecision: decision },
    commands: [{ kind: "persist-checkpoint" }, { kind: "present-journey-choice" }]
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
    finalBossPhaseIndex: state.finalBossPhaseIndex ?? 0,
    pendingDecision: state.pendingDecision
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

export function isRunJourneyDecisionLegal(
  state: RunJourneyState,
  decision: RunJourneyDecision
): boolean {
  if (decision.kind === "final-boss-phase") {
    return (
      state.finalBossActive === true &&
      state.phaseCleanupActive &&
      decision.nextPhaseIndex === (state.finalBossPhaseIndex ?? 0) + 1 &&
      decision.nextPhaseIndex <= 2
    );
  }

  const cleanupDecision = getCleanupDecision(state);
  if (decision.kind === "yuanying-tribulation") {
    return cleanupDecision?.kind === "tribulation" && cleanupDecision.stage === "yuanying";
  }

  if (decision.kind === "phase-transition") {
    return cleanupDecision?.kind === "phase-transition" && cleanupDecision.nextPhase === decision.nextPhase;
  }
  return cleanupDecision?.kind === "tribulation" && cleanupDecision.stage === decision.stage;
}

export function advanceRunJourney(
  state: RunJourneyState,
  event: RunJourneyEvent
): RunJourneyResult {
  if (event.kind === "player-died") {
    return {
      state: {
        ...state,
        phaseCleanupActive: false,
        finalBossActive: false,
        gameOver: true,
        pendingDecision: undefined
      },
      commands: []
    };
  }

  if (event.kind === "realm-qi-gained") {
    return {
      state: grantRealmQi(state, event.amount),
      commands: []
    };
  }

  if (event.kind === "cleanup-finished") {
    if (state.pendingDecision) {
      return { state, commands: [{ kind: "present-journey-choice" }] };
    }
    if (state.finalBossActive) {
      if ((state.finalBossPhaseIndex ?? 0) >= 2) {
        return completeRun(state);
      }

      const nextPhaseIndex = (state.finalBossPhaseIndex ?? 0) + 1;
      return presentJourneyDecision(state, {
        kind: "final-boss-phase",
        nextPhaseIndex
      });
    }

    const cleanupDecision = getCleanupDecision(state);
    const decision =
      cleanupDecision?.kind === "tribulation" && cleanupDecision.stage === "yuanying"
        ? ({ kind: "yuanying-tribulation" } as const)
        : cleanupDecision;
    return decision ? presentJourneyDecision(state, decision) : { state, commands: [] };
  }

  if (event.kind === "journey-choice-accepted") {
    const decision = state.pendingDecision;
    if (!decision) {
      return { state, commands: [] };
    }

    if (decision.kind === "phase-transition") {
      return {
        state: {
          ...incrementFoundationGrowth(completePhaseTransition(state)),
          pendingDecision: undefined
        },
        commands: [{ kind: "persist-checkpoint" }]
      };
    }

    if (decision.kind === "tribulation") {
      const result = completeStageTribulation(state);
      if (result.outcome === "breakthrough") {
        return {
          state: {
            ...incrementFoundationGrowth(result.state),
            pendingDecision: undefined
          },
          commands: [{ kind: "persist-checkpoint" }]
        };
      }
    }

    if (decision.kind === "yuanying-tribulation") {
      return {
        state: {
          ...state,
          realmProgress: 0,
          phaseCleanupActive: false,
          finalBossActive: true,
          finalBossPhaseIndex: 0,
          gameOver: false,
          pendingDecision: undefined
        },
        commands: [
          { kind: "start-final-boss", phaseIndex: 0 },
          { kind: "persist-checkpoint" }
        ]
      };
    }

    if (decision.kind === "final-boss-phase") {
      return {
        state: {
          ...state,
          phaseCleanupActive: false,
          finalBossActive: true,
          finalBossPhaseIndex: decision.nextPhaseIndex,
          gameOver: false,
          pendingDecision: undefined
        },
        commands: [
          { kind: "advance-final-boss-phase", phaseIndex: decision.nextPhaseIndex },
          { kind: "persist-checkpoint" }
        ]
      };
    }
  }

  if (event.kind === "final-boss-phase-cleared") {
    if (!state.finalBossActive) {
      return { state, commands: [] };
    }
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

  const destination = getStageBreakthroughDestination(state.stage);
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
