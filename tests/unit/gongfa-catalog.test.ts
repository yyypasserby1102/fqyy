import { describe, expect, it } from "vitest";
import { gongfaConfigs } from "../../src/data/gongfa";
import { gongfaPackageCatalog } from "../../src/data/gongfaPackages";
import { getRank10Skill2Id } from "../../src/logic/mastery";

describe("Gongfa package catalog", () => {
  it("defines a complete player-facing package for every playable Gongfa", () => {
    expect(Object.keys(gongfaPackageCatalog).sort()).toEqual(
      Object.keys(gongfaConfigs).sort()
    );

    for (const [gongfaId, definition] of Object.entries(gongfaPackageCatalog)) {
      expect(definition.skill1.name.length).toBeGreaterThan(3);
      expect(definition.skill1.description.length).toBeGreaterThan(24);
      expect(definition.passive.name.length).toBeGreaterThan(3);
      expect(definition.passive.resource.length).toBeGreaterThan(2);
      expect(definition.passive.description.length).toBeGreaterThan(24);
      expect(definition.skill2.id).toBe(getRank10Skill2Id(gongfaId as keyof typeof gongfaConfigs));
      expect(definition.skill2.name.length).toBeGreaterThan(3);
      expect(definition.skill2.description.length).toBeGreaterThan(24);
      expect(definition.skill1.tags.length).toBeGreaterThanOrEqual(2);
      expect(definition.skill2.tags.length).toBeGreaterThanOrEqual(2);
      expect(definition.combatRole.length).toBeGreaterThan(12);
      expect(definition.visualMotif.length).toBeGreaterThan(12);
    }
  });

  it("gives every Skill and passive a distinct player-facing identity", () => {
    const packages = Object.values(gongfaPackageCatalog);
    expect(new Set(packages.map(({ skill1 }) => skill1.name)).size).toBe(packages.length);
    expect(new Set(packages.map(({ passive }) => passive.name)).size).toBe(packages.length);
    expect(new Set(packages.map(({ skill2 }) => skill2.name)).size).toBe(packages.length);
    expect(new Set(packages.map(({ visualMotif }) => visualMotif)).size).toBe(packages.length);
  });
});
