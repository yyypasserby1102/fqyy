import type { GongfaId } from "../data/gongfa";

export interface GongfaVisualEmphasis {
  visualTier: "founding" | "layered";
  alpha: number;
  depth: number;
}

const LAYERED_ALPHA = [0.82, 0.68, 0.58] as const;

export function getGongfaVisualEmphasis(
  learnedGongfaIds: readonly GongfaId[],
  sourceGongfaId: GongfaId | undefined
): GongfaVisualEmphasis {
  const index = sourceGongfaId === undefined ? -1 : learnedGongfaIds.indexOf(sourceGongfaId);
  if (index <= 0) {
    return { visualTier: "founding", alpha: 1, depth: 12 };
  }

  const layeredIndex = Math.min(index - 1, LAYERED_ALPHA.length - 1);
  return {
    visualTier: "layered",
    alpha: LAYERED_ALPHA[layeredIndex],
    depth: Math.max(9, 12 - index)
  };
}
