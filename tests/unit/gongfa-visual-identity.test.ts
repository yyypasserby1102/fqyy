import { describe, expect, it } from "vitest";
import { gongfaConfigs } from "../../src/data/gongfa";
import { gongfaVisualIdentities } from "../../src/visual/gongfaVisualIdentity";

describe("Gongfa visual identities", () => {
  it("gives every playable Gongfa a distinct cast and impact signature", () => {
    expect(Object.keys(gongfaVisualIdentities).sort()).toEqual(Object.keys(gongfaConfigs).sort());
    const identities = Object.values(gongfaVisualIdentities);
    expect(new Set(identities.map((identity) => identity.motifId)).size).toBe(identities.length);
    expect(new Set(identities.map((identity) => `${identity.geometry}:${identity.spokes}:${identity.accent.toString(16)}`)).size).toBe(identities.length);
    for (const identity of identities) {
      expect(identity.label.length).toBeGreaterThan(5);
      expect(identity.trailStyle.length).toBeGreaterThan(4);
    }
  });
});
