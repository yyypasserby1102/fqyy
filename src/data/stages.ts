export type StageId = "lianqi" | "zhuji" | "jindan" | "yuanying";
export type RealmPhaseId = "chuqi" | "zhongqi" | "houqi" | "dayuanman";

export interface StageConfig {
  id: StageId;
  name: string;
  message: string;
}

export const stageOrder: StageId[] = ["lianqi", "zhuji", "jindan", "yuanying"];
export const realmPhaseOrder: RealmPhaseId[] = ["chuqi", "zhongqi", "houqi", "dayuanman"];

export const stageConfigs: Record<StageId, StageConfig> = {
  lianqi: {
    id: "lianqi",
    name: "Lianqi",
    message: "Qi is crude and unstable."
  },
  zhuji: {
    id: "zhuji",
    name: "Zhuji",
    message: "Foundation established. The method stabilizes."
  },
  jindan: {
    id: "jindan",
    name: "Jindan",
    message: "Golden core forms. Qi surges outward."
  },
  yuanying: {
    id: "yuanying",
    name: "Yuanying",
    message: "Nascent soul stirs. The skies open."
  }
};
