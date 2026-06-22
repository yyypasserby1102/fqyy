import { describe, expect, it } from "vitest";
import {
  getDeterministicMasteryChoiceIds,
  getRank10Skill2Id
} from "../../src/logic/mastery";

describe("mastery progression", () => {
  it("returns deterministic capped choices for a rank and removes learned authored options", () => {
    const first = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: []
    });
    const second = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: []
    });

    expect(first).toEqual(second);
    expect(first).toHaveLength(3);

    const filtered = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: [
        "sword-intent-sharpening",
        "sword-intent-sharpening",
        "sword-intent-sharpening"
      ]
    });

    expect(filtered).not.toContain("sword-intent-sharpening");
  });

  it("maps rank 10 to a dedicated second Skill identifier", () => {
    expect(getRank10Skill2Id("yujian-jue")).toBe("returning-sword-formation");
    expect(getRank10Skill2Id("crimson-furnace-sword-art")).toBe("furnace-cascade");
    expect(getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 10,
      seed: "seed-123",
      learnedIds: []
    })).toEqual(["returning-sword-formation"]);
  });

  it("adds the rank-10 Skill 2 family into the post-rank-10 pool", () => {
    expect(
      getDeterministicMasteryChoiceIds({
        gongfaId: "yujian-jue",
        rank: 11,
        seed: "seed-123",
        learnedIds: []
      })
    ).toContain("returning-sword-formation");
  });

  it("keeps evergreen mastery choices out until authored choices are exhausted", () => {
    const authoredOnly = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: []
    });

    expect(authoredOnly).not.toContain("tempered-meridians");
    expect(authoredOnly).not.toContain("jade-meridian");
    expect(authoredOnly).not.toContain("minor-pill");
    expect(authoredOnly).not.toContain("soul-lure-banner");

    const evergreenFallback = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: [
        "sword-intent-sharpening",
        "twin-sword-split",
        "refined-sword-channel",
        "sword-intent-sharpening",
        "twin-sword-split",
        "refined-sword-channel",
        "sword-intent-sharpening",
        "twin-sword-split",
        "refined-sword-channel"
      ]
    });

    expect(evergreenFallback).toContain("jade-meridian");
    expect(evergreenFallback).not.toContain("sword-intent-sharpening");
  });

  it("removes authored mastery choices once their selection cap is reached", () => {
    const exhausted = getDeterministicMasteryChoiceIds({
      gongfaId: "yujian-jue",
      rank: 1,
      seed: "seed-123",
      learnedIds: [
        "sword-intent-sharpening",
        "sword-intent-sharpening",
        "sword-intent-sharpening"
      ]
    });

    expect(exhausted).not.toContain("sword-intent-sharpening");
    expect(exhausted.length).toBeGreaterThan(0);
  });
});
