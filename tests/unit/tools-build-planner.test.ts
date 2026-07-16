import { describe, expect, it } from "vitest";
import {
  addGongfaToBuild,
  addTreasureToBuild,
  createToolsBuild,
  decodeToolsBuild,
  encodeToolsBuild,
  summarizeToolsBuild
} from "../../src/tools/buildPlanner";

describe("FQYY Tools build planner", () => {
  it("enforces Linggen compatibility and the four-Gongfa limit", () => {
    let build = createToolsBuild("fire-metal");
    build = addGongfaToBuild(build, "crimson-furnace-sword-art");
    build = addGongfaToBuild(build, "burning-ring-scripture");
    build = addGongfaToBuild(build, "yujian-jue");
    build = addGongfaToBuild(build, "jinfeng-gong");

    expect(build.gongfaIds).toHaveLength(4);
    expect(addGongfaToBuild(build, "gengjin-huti")).toEqual(build);
    expect(addGongfaToBuild(build, "black-tide-scripture")).toEqual(build);
  });

  it("enforces three unique Spirit Treasure slots", () => {
    let build = createToolsBuild("metal");
    build = addTreasureToBuild(build, "jade-heart-pendant");
    build = addTreasureToBuild(build, "windstep-talisman");
    build = addTreasureToBuild(build, "ironhide-seal");

    expect(addTreasureToBuild(build, "farsight-mirror")).toEqual(build);
    expect(addTreasureToBuild(build, "ironhide-seal")).toEqual(build);
  });

  it("round-trips a shareable build and rejects incompatible URL data", () => {
    const build = {
      ...createToolsBuild("water-wood"),
      name: "Moonlit Garden",
      gongfaIds: ["black-tide-scripture", "green-vine-art"] as const,
      treasureIds: ["jade-heart-pendant"] as const
    };

    expect(decodeToolsBuild(encodeToolsBuild(build))).toEqual(build);
    expect(decodeToolsBuild("l=metal&g=black-tide-scripture")).toEqual(createToolsBuild("metal"));
  });

  it("summarizes patterns, roots, tags, and every selected skill", () => {
    const summary = summarizeToolsBuild({
      ...createToolsBuild("fire-metal"),
      gongfaIds: ["crimson-furnace-sword-art", "burning-ring-scripture"]
    });

    expect(summary.roots).toEqual(["fire", "metal"]);
    expect(summary.patterns).toEqual(["aura", "homing"]);
    expect(summary.tags).toContain("explosive");
    expect(summary.skillNames).toEqual([
      "Furnace Needles",
      "Furnace Cascade",
      "Revolving Flame Ring",
      "Solar Flare Cycle"
    ]);
    expect(summary.synergies.map((item) => item.title)).toContain("Shared fire core");
    expect(summary.synergies.map((item) => item.title)).toContain("Layered engagement");
  });
});
