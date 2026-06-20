export type StageId = "lianqi" | "zhuji" | "jindan";

export interface StageConfig {
  id: StageId;
  name: string;
  levelRequirement: number;
  message: string;
}

export const stageOrder: StageId[] = ["lianqi", "zhuji", "jindan"];

export const stageConfigs: Record<StageId, StageConfig> = {
  lianqi: {
    id: "lianqi",
    name: "Lianqi",
    levelRequirement: 1,
    message: "Qi is crude and unstable."
  },
  zhuji: {
    id: "zhuji",
    name: "Zhuji",
    levelRequirement: 4,
    message: "Foundation established. The method stabilizes."
  },
  jindan: {
    id: "jindan",
    name: "Jindan",
    levelRequirement: 7,
    message: "Golden core forms. Qi surges outward."
  }
};

export function getStageForLevel(level: number): StageId {
  if (level >= stageConfigs.jindan.levelRequirement) {
    return "jindan";
  }

  if (level >= stageConfigs.zhuji.levelRequirement) {
    return "zhuji";
  }

  return "lianqi";
}
