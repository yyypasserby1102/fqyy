import type { RealmPhaseId } from "../data/stages";

export type CultivatorPhaseRegalia =
  | "qi-knot"
  | "shoulder-crest"
  | "flowing-mantle"
  | "lotus-crown";

export interface CultivatorPhaseVisualProfile {
  phase: RealmPhaseId;
  primaryColor: number;
  secondaryColor: number;
  ringCount: number;
  orbitingMotes: number;
  regalia: CultivatorPhaseRegalia;
}

const phaseVisualProfiles: Record<RealmPhaseId, CultivatorPhaseVisualProfile> = {
  chuqi: {
    phase: "chuqi",
    primaryColor: 0x64c9a7,
    secondaryColor: 0xd2f4df,
    ringCount: 1,
    orbitingMotes: 0,
    regalia: "qi-knot"
  },
  zhongqi: {
    phase: "zhongqi",
    primaryColor: 0x62bde9,
    secondaryColor: 0xd7f3ff,
    ringCount: 2,
    orbitingMotes: 2,
    regalia: "shoulder-crest"
  },
  houqi: {
    phase: "houqi",
    primaryColor: 0xa98ce8,
    secondaryColor: 0xf0ddff,
    ringCount: 2,
    orbitingMotes: 4,
    regalia: "flowing-mantle"
  },
  dayuanman: {
    phase: "dayuanman",
    primaryColor: 0xf1c85b,
    secondaryColor: 0xfff3bd,
    ringCount: 3,
    orbitingMotes: 6,
    regalia: "lotus-crown"
  }
};

export function getCultivatorPhaseVisualProfile(
  phase: RealmPhaseId
): CultivatorPhaseVisualProfile {
  return { ...phaseVisualProfiles[phase] };
}
