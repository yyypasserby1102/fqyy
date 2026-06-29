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
}

export interface ChoicePayload {
  title: string;
  subtitle?: string;
  options: ChoiceOption[];
}
