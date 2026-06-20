export type ChoiceKind = "gongfa" | "upgrade" | "continue";

export interface ChoiceOption {
  id: string;
  kind: ChoiceKind;
  title: string;
  description: string;
}

export interface ChoicePayload {
  title: string;
  subtitle?: string;
  options: ChoiceOption[];
}
