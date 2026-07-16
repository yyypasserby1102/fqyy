import { gongfaConfigs, type GongfaId, type GongfaPattern, type GongfaTag } from "../data/gongfa";
import { getGongfaPackage } from "../data/gongfaPackages";
import { linggenConfigs, type LinggenId, type RootId } from "../data/linggen";
import {
  MAX_SPIRIT_TREASURE_SLOTS,
  spiritTreasureConfigs,
  type SpiritTreasureId
} from "../data/spiritTreasures";

export const MAX_PLANNED_GONGFA = 4;

export interface ToolsBuild {
  name: string;
  linggenId: LinggenId;
  gongfaIds: GongfaId[];
  treasureIds: SpiritTreasureId[];
}

export interface ToolsBuildSummary {
  roots: RootId[];
  patterns: GongfaPattern[];
  tags: GongfaTag[];
  skillNames: string[];
  treasureNames: string[];
  synergies: Array<{ title: string; description: string }>;
}

export function createToolsBuild(linggenId: LinggenId = "metal"): ToolsBuild {
  return { name: "Untitled Cultivation", linggenId, gongfaIds: [], treasureIds: [] };
}

export function isGongfaCompatible(linggenId: LinggenId, gongfaId: GongfaId): boolean {
  const roots = linggenConfigs[linggenId].roots;
  return gongfaConfigs[gongfaId].requiredRoots.every((root) => roots.includes(root));
}

export function addGongfaToBuild(build: ToolsBuild, gongfaId: GongfaId): ToolsBuild {
  if (
    build.gongfaIds.includes(gongfaId) ||
    build.gongfaIds.length >= MAX_PLANNED_GONGFA ||
    !isGongfaCompatible(build.linggenId, gongfaId)
  ) return build;
  return { ...build, gongfaIds: [...build.gongfaIds, gongfaId] };
}

export function removeGongfaFromBuild(build: ToolsBuild, gongfaId: GongfaId): ToolsBuild {
  return { ...build, gongfaIds: build.gongfaIds.filter((id) => id !== gongfaId) };
}

export function addTreasureToBuild(build: ToolsBuild, treasureId: SpiritTreasureId): ToolsBuild {
  if (build.treasureIds.includes(treasureId) || build.treasureIds.length >= MAX_SPIRIT_TREASURE_SLOTS) return build;
  return { ...build, treasureIds: [...build.treasureIds, treasureId] };
}

export function removeTreasureFromBuild(build: ToolsBuild, treasureId: SpiritTreasureId): ToolsBuild {
  return { ...build, treasureIds: build.treasureIds.filter((id) => id !== treasureId) };
}

export function changeBuildLinggen(build: ToolsBuild, linggenId: LinggenId): ToolsBuild {
  return {
    ...build,
    linggenId,
    gongfaIds: build.gongfaIds.filter((gongfaId) => isGongfaCompatible(linggenId, gongfaId))
  };
}

export function summarizeToolsBuild(build: ToolsBuild): ToolsBuildSummary {
  const packages = build.gongfaIds.map(getGongfaPackage);
  const patterns = Array.from(new Set(build.gongfaIds.map((id) => gongfaConfigs[id].pattern))).sort();
  const tagSets = packages.map((item) => new Set([...item.skill1.tags, ...item.skill2.tags]));
  const sharedTags = Array.from(new Set(tagSets.flatMap((tags) => [...tags]))).filter(
    (tag) => tagSets.filter((tags) => tags.has(tag)).length >= 2
  );
  const treasures = build.treasureIds.map((id) => spiritTreasureConfigs[id]);
  const synergies = sharedTags.map((tag) => ({
    title: `Shared ${tag} core`,
    description: `${tagSets.filter((tags) => tags.has(tag)).length} Gongfa speak the same #${tag} combat language, giving the build a coherent delivery profile.`
  }));
  if (patterns.includes("wave") && treasures.some((item) => item.effect === "moveSpeed")) {
    synergies.push({ title: "Mobile wave front", description: "Movement speed supports the lane positioning demanded by wave Gongfa." });
  }
  if (
    (patterns.includes("aura") || tagSets.some((tags) => tags.has("defensive"))) &&
    treasures.some((item) => item.effect === "mitigation" || item.effect === "maxHealth")
  ) {
    synergies.push({ title: "Close-range foundation", description: "Defensive treasure support helps aura and defensive Gongfa remain in their preferred danger zone." });
  }
  if (patterns.length >= 2) {
    synergies.push({ title: "Layered engagement", description: `${patterns.join(" + ")} patterns cover different positions instead of competing for one attack lane.` });
  }
  return {
    roots: [...linggenConfigs[build.linggenId].roots].sort(),
    patterns,
    tags: Array.from(new Set(packages.flatMap((item) => [...item.skill1.tags, ...item.skill2.tags]))).sort(),
    skillNames: packages.flatMap((item) => [item.skill1.name, item.skill2.name]),
    treasureNames: treasures.map((item) => item.name),
    synergies
  };
}

function isLinggenId(value: string | null): value is LinggenId {
  return value !== null && value in linggenConfigs;
}

function isGongfaId(value: string): value is GongfaId {
  return value in gongfaConfigs;
}

function isTreasureId(value: string): value is SpiritTreasureId {
  return value in spiritTreasureConfigs;
}

export function encodeToolsBuild(build: ToolsBuild): string {
  const params = new URLSearchParams();
  params.set("n", build.name);
  params.set("l", build.linggenId);
  if (build.gongfaIds.length) params.set("g", build.gongfaIds.join(","));
  if (build.treasureIds.length) params.set("t", build.treasureIds.join(","));
  return params.toString();
}

export function decodeToolsBuild(value: string): ToolsBuild {
  const params = new URLSearchParams(value);
  const linggenId = isLinggenId(params.get("l")) ? params.get("l") as LinggenId : "metal";
  let build = { ...createToolsBuild(linggenId), name: params.get("n")?.slice(0, 64) || "Untitled Cultivation" };
  for (const value of params.get("g")?.split(",") ?? []) {
    if (isGongfaId(value)) build = addGongfaToBuild(build, value);
  }
  for (const value of params.get("t")?.split(",") ?? []) {
    if (isTreasureId(value)) build = addTreasureToBuild(build, value);
  }
  return build;
}
