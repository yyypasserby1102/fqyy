import type { GongfaId } from "./gongfa";
import type { SpiritTreasureId } from "./spiritTreasures";

export type ChoiceKind =
  | "gongfa"
  | "upgrade"
  | "continue"
  | "return-to-title"
  | "abandon-run"
  | "mastery"
  | "spirit-treasure-replace"
  | "spirit-treasure-leave";

export interface ChoiceOption {
  id: string;
  kind: ChoiceKind;
  title: string;
  description: string;
  playstyle?: string;
  gain?: string;
  loss?: string;
  cost?: string;
  scope?: string;
  treasureInteraction?: string;
  resonanceGained?: string[];
  resonanceLost?: string[];
  mechanicsGained?: string[];
  mechanicsLost?: string[];
  gongfaId?: GongfaId;
  spiritTreasureId?: SpiritTreasureId;
  replacedSpiritTreasureId?: SpiritTreasureId;
}

export type ChoiceVisualMode = "choice" | "linggen-awakening";

export interface ChoicePayload {
  title: string;
  subtitle?: string;
  options: ChoiceOption[];
  visualMode?: ChoiceVisualMode;
}
