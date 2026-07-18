import { describe, expect, it } from "vitest";
import { realmPhaseOrder } from "../../src/data/stages";
import { getCultivatorPhaseVisualProfile } from "../../src/visual/cultivatorPhaseVisuals";

describe("cultivator phase visuals", () => {
  it("gives every Realm Phase a distinct color and regalia silhouette", () => {
    const profiles = realmPhaseOrder.map(getCultivatorPhaseVisualProfile);

    expect(new Set(profiles.map(({ primaryColor }) => primaryColor)).size).toBe(4);
    expect(new Set(profiles.map(({ regalia }) => regalia)).size).toBe(4);
    expect(profiles.map(({ regalia }) => regalia)).toEqual([
      "qi-knot",
      "shoulder-crest",
      "flowing-mantle",
      "lotus-crown"
    ]);
  });

  it("builds visible Qi density toward Dayuanman", () => {
    const profiles = realmPhaseOrder.map(getCultivatorPhaseVisualProfile);

    expect(profiles.map(({ ringCount }) => ringCount)).toEqual([1, 2, 2, 3]);
    expect(profiles.map(({ orbitingMotes }) => orbitingMotes)).toEqual([0, 2, 4, 6]);
  });
});
