import Phaser from "phaser";
import type { StageId } from "../data/stages";
import { WORLD_TEXTURES } from "./worldVisuals";

export interface ArenaVariantDefinition {
  variantId: "mist-court" | "foundation-terrace" | "golden-core-sanctum" | "nascent-sky-dais";
  atmosphere: "drifting-mist" | "foundation-dust" | "golden-embers" | "storm-wisps";
  floorTint: number;
  primary: number;
  secondary: number;
  moteColor: number;
  moteCount: number;
  seal: "rings" | "foundation" | "core" | "star";
  atmosphereShape: "mist" | "motes";
}

export const ARENA_VARIANTS: Record<StageId, ArenaVariantDefinition> = {
  lianqi: {
    variantId: "mist-court",
    atmosphere: "drifting-mist",
    floorTint: 0xb8dbe0,
    primary: 0x70d7df,
    secondary: 0x9adbc8,
    moteColor: 0xa9ece7,
    moteCount: 16,
    seal: "rings",
    atmosphereShape: "mist"
  },
  zhuji: {
    variantId: "foundation-terrace",
    atmosphere: "foundation-dust",
    floorTint: 0xc5c3a8,
    primary: 0x63c3b1,
    secondary: 0xc3975d,
    moteColor: 0xd3b477,
    moteCount: 18,
    seal: "foundation",
    atmosphereShape: "motes"
  },
  jindan: {
    variantId: "golden-core-sanctum",
    atmosphere: "golden-embers",
    floorTint: 0xd7c49d,
    primary: 0xe2b65d,
    secondary: 0x8bd3c7,
    moteColor: 0xffd477,
    moteCount: 22,
    seal: "core",
    atmosphereShape: "motes"
  },
  yuanying: {
    variantId: "nascent-sky-dais",
    atmosphere: "storm-wisps",
    floorTint: 0xc7b9df,
    primary: 0xa993ef,
    secondary: 0x72d6e2,
    moteColor: 0xb9a5ff,
    moteCount: 24,
    seal: "star",
    atmosphereShape: "mist"
  }
};

export interface ArenaVisualSnapshot {
  variantId: ArenaVariantDefinition["variantId"] | "";
  atmosphere: ArenaVariantDefinition["atmosphere"] | "";
  atmosphereMoteCount: number;
}

export interface ArenaPresentation {
  floor: Phaser.GameObjects.TileSprite;
  decorationCount: number;
  applyStage(stage: StageId): void;
  getSnapshot(): ArenaVisualSnapshot;
}

export function createArenaPresentation(
  scene: Phaser.Scene,
  width: number,
  height: number,
  initialStage: StageId
): ArenaPresentation {
  scene.add.rectangle(0, 0, 6000, 6000, 0x03070d, 1).setOrigin(0.5).setDepth(-30);
  scene.add.rectangle(0, 0, width, height, 0x08111f, 1).setOrigin(0.5).setDepth(-23);

  const floor = scene.add
    .tileSprite(0, 0, width, height, WORLD_TEXTURES.arenaFloor)
    .setOrigin(0.5)
    .setDepth(-22)
    .setAlpha(0.82);
  floor.tileScaleX = 0.58;
  floor.tileScaleY = 0.58;

  const markings = scene.add.graphics().setDepth(-20);
  const cornerGraphics = scene.add.graphics().setDepth(-19);
  const boundary = scene.add.graphics().setDepth(-17);
  const atmosphere = scene.add.container(0, 0).setDepth(-16);
  let currentStage = initialStage;

  const drawGrid = (config: ArenaVariantDefinition): void => {
    markings.lineStyle(1, config.primary, 0.08);
    for (let x = -width / 2 + 256; x < width / 2; x += 256) {
      markings.lineBetween(x, -height / 2, x, height / 2);
    }
    for (let y = -height / 2 + 256; y < height / 2; y += 256) {
      markings.lineBetween(-width / 2, y, width / 2, y);
    }
  };

  const drawSeal = (config: ArenaVariantDefinition): void => {
    markings.lineStyle(3, config.primary, 0.19);
    markings.strokeCircle(0, 0, 270);
    markings.lineStyle(2, config.secondary, 0.18);
    markings.strokeCircle(0, 0, 185);

    const spokeCount = config.seal === "core" ? 12 : 8;
    markings.lineStyle(2, config.primary, 0.14);
    for (let spoke = 0; spoke < spokeCount; spoke += 1) {
      const angle = (Math.PI * 2 * spoke) / spokeCount;
      const innerRadius = config.seal === "core" ? 92 : 188;
      markings.lineBetween(
        Math.cos(angle) * innerRadius,
        Math.sin(angle) * innerRadius,
        Math.cos(angle) * 264,
        Math.sin(angle) * 264
      );
    }

    if (config.seal === "foundation") {
      markings.lineStyle(3, config.secondary, 0.2);
      markings.strokeRect(-126, -126, 252, 252);
      markings.strokeRect(-88, -88, 176, 176);
    } else if (config.seal === "core") {
      markings.fillStyle(config.secondary, 0.1);
      markings.fillCircle(0, 0, 78);
      markings.lineStyle(3, config.secondary, 0.28);
      markings.strokeCircle(0, 0, 78);
    } else if (config.seal === "star") {
      markings.lineStyle(2, config.secondary, 0.24);
      const points = Array.from({ length: 8 }, (_, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 8;
        const radius = index % 2 === 0 ? 142 : 62;
        return new Phaser.Math.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
      });
      points.forEach((point, index) => {
        const next = points[(index + 1) % points.length];
        markings.lineBetween(point.x, point.y, next.x, next.y);
      });
    }
  };

  const drawCorners = (config: ArenaVariantDefinition): void => {
    const inset = 92;
    const corners = [
      [-width / 2 + inset, -height / 2 + inset],
      [width / 2 - inset, -height / 2 + inset],
      [-width / 2 + inset, height / 2 - inset],
      [width / 2 - inset, height / 2 - inset]
    ] as const;
    corners.forEach(([x, y]) => {
      cornerGraphics.fillStyle(0x0b1b29, 0.82);
      cornerGraphics.fillRect(x - 31, y - 31, 62, 62);
      cornerGraphics.lineStyle(3, config.primary, 0.45);
      cornerGraphics.strokeRect(x - 31, y - 31, 62, 62);
      cornerGraphics.fillStyle(config.secondary, 0.16);
      cornerGraphics.fillCircle(x, y, 13);
      cornerGraphics.lineStyle(2, config.secondary, 0.4);
      cornerGraphics.strokeCircle(x, y, 13);
    });
  };

  const drawBoundary = (config: ArenaVariantDefinition): void => {
    boundary.lineStyle(7, 0x07111d, 0.92);
    boundary.strokeRect(-width / 2, -height / 2, width, height);
    boundary.lineStyle(3, config.primary, 0.6);
    boundary.strokeRect(-width / 2 + 7, -height / 2 + 7, width - 14, height - 14);
    boundary.lineStyle(1, config.secondary, 0.4);
    boundary.strokeRect(-width / 2 + 15, -height / 2 + 15, width - 30, height - 30);
  };

  const createAtmosphere = (config: ArenaVariantDefinition): void => {
    atmosphere.list.forEach((child) => scene.tweens.killTweensOf(child));
    atmosphere.removeAll(true);
    for (let index = 0; index < config.moteCount; index += 1) {
      const x = -width / 2 + 70 + ((index * 337) % (width - 140));
      const y = -height / 2 + 60 + ((index * 197) % (height - 120));
      const isMist = config.atmosphereShape === "mist";
      const mote = isMist
        ? scene.add.ellipse(x, y, 28 + (index % 4) * 12, 5 + (index % 3) * 2, config.moteColor, 0.07)
        : scene.add.circle(x, y, 1.5 + (index % 3), config.moteColor, 0.18);
      atmosphere.add(mote);
      scene.tweens.add({
        targets: mote,
        x: x + (isMist ? 90 + (index % 5) * 18 : (index % 2 === 0 ? 18 : -18)),
        y: y - (isMist ? 8 : 42 + (index % 4) * 14),
        alpha: isMist ? 0.16 : 0.42,
        duration: 3_600 + (index % 7) * 620,
        delay: index * 90,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut"
      });
    }
  };

  const applyStage = (stage: StageId): void => {
    currentStage = stage;
    const config = ARENA_VARIANTS[stage];
    floor.setTint(config.floorTint);
    markings.clear();
    cornerGraphics.clear();
    boundary.clear();
    drawGrid(config);
    drawSeal(config);
    drawCorners(config);
    drawBoundary(config);
    createAtmosphere(config);
  };

  applyStage(initialStage);

  return {
    floor,
    decorationCount: 6,
    applyStage,
    getSnapshot: () => {
      const config = ARENA_VARIANTS[currentStage];
      return {
        variantId: config.variantId,
        atmosphere: config.atmosphere,
        atmosphereMoteCount: config.moteCount
      };
    }
  };
}
