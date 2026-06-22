import type { RealmPhaseId } from "../persistence/runPersistence";
import type { StageId } from "../data/stages";

export interface RunJourneyState {
  stage: StageId;
  realmPhase: RealmPhaseId;
  realmProgress: number;
  phaseCleanupActive: boolean;
}

export type CleanupDecision =
  | { kind: "phase-transition"; nextPhase: Exclude<RealmPhaseId, "chuqi"> }
  | { kind: "tribulation"; stage: StageId };

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
      stage: destination,
      realmPhase: "chuqi",
      realmProgress: 0,
      phaseCleanupActive: false
    }
  };
}
