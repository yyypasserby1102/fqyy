import Phaser from "phaser";
import openingEnemiesUrl from "../../assets/sprites/enemies/export/enemy-opening-atlas.png";
import tribulationEnemiesUrl from "../../assets/sprites/enemies/export/enemy-tribulation-atlas.png";
import projectilesUrl from "../../assets/sprites/projectiles/export/gongfa-projectile-atlas.png";
import projectileImpactsUrl from "../../assets/sprites/projectiles/export/gongfa-projectile-impact-atlas.png";
import type { EnemyId } from "../data/enemies";
import type { ProjectileVisualId } from "../types/combatVisuals";

export const COMBAT_TEXTURES = {
  openingEnemies: "enemy-opening-atlas",
  tribulationEnemies: "enemy-tribulation-atlas",
  projectiles: "gongfa-projectile-atlas",
  projectileImpacts: "gongfa-projectile-impact-atlas"
} as const;

export interface EnemyVisualDefinition {
  texture: string;
  animation: string;
  atlasRow: number;
  displaySize: number;
  collisionRadius: number;
  grounded: boolean;
}

export interface ProjectileVisualDefinition {
  animation: string;
  impactAnimation: string;
  displaySize: number;
  collisionWidth: number;
  collisionHeight: number;
  impactSize: number;
}

export const ENEMY_DEFEAT_ANIMATION = "enemy-defeat-ink";

export const enemyVisualDefinitions: Record<EnemyId, EnemyVisualDefinition> = {
  "jade-rat": {
    texture: COMBAT_TEXTURES.openingEnemies,
    animation: "enemy-jade-rat-pursue",
    atlasRow: 0,
    displaySize: 72,
    collisionRadius: 9.8,
    grounded: true
  },
  "mist-wolf": {
    texture: COMBAT_TEXTURES.openingEnemies,
    animation: "enemy-mist-wolf-pursue",
    atlasRow: 1,
    displaySize: 84,
    collisionRadius: 13.86,
    grounded: true
  },
  "bone-crow": {
    texture: COMBAT_TEXTURES.openingEnemies,
    animation: "enemy-bone-crow-pursue",
    atlasRow: 2,
    displaySize: 80,
    collisionRadius: 11.97,
    grounded: false
  },
  "corpse-cultivator": {
    texture: COMBAT_TEXTURES.openingEnemies,
    animation: "enemy-corpse-cultivator-pursue",
    atlasRow: 3,
    displaySize: 88,
    collisionRadius: 11.9,
    grounded: true
  },
  "resentful-spirit": {
    texture: COMBAT_TEXTURES.tribulationEnemies,
    animation: "enemy-resentful-spirit-pursue",
    atlasRow: 0,
    displaySize: 88,
    collisionRadius: 10.5,
    grounded: false
  },
  "celestial-construct": {
    texture: COMBAT_TEXTURES.tribulationEnemies,
    animation: "enemy-celestial-construct-pursue",
    atlasRow: 1,
    displaySize: 96,
    collisionRadius: 12.852,
    grounded: true
  },
  "tribulation-shade": {
    texture: COMBAT_TEXTURES.tribulationEnemies,
    animation: "enemy-tribulation-shade-pursue",
    atlasRow: 2,
    displaySize: 88,
    collisionRadius: 11.9,
    grounded: false
  }
};

export const projectileVisualDefinitions: Record<
  ProjectileVisualId,
  ProjectileVisualDefinition
> = {
  "flying-sword": {
    animation: "projectile-flying-sword-travel",
    impactAnimation: "impact-flying-sword",
    displaySize: 56,
    collisionWidth: 32,
    collisionHeight: 32,
    impactSize: 70
  },
  "metal-wave": {
    animation: "projectile-metal-wave-travel",
    impactAnimation: "impact-metal-wave",
    displaySize: 64,
    collisionWidth: 56,
    collisionHeight: 24,
    impactSize: 82
  },
  "aura-blade": {
    animation: "projectile-aura-blade-travel",
    impactAnimation: "impact-aura-blade",
    displaySize: 44,
    collisionWidth: 14,
    collisionHeight: 16,
    impactSize: 62
  },
  "qi-bolt": {
    animation: "projectile-qi-bolt-travel",
    impactAnimation: "impact-qi-bolt",
    displaySize: 48,
    collisionWidth: 28,
    collisionHeight: 20,
    impactSize: 72
  }
};

export function preloadCombatVisuals(scene: Phaser.Scene): void {
  const sheet = { frameWidth: 256, frameHeight: 256 };
  scene.load.spritesheet(COMBAT_TEXTURES.openingEnemies, openingEnemiesUrl, sheet);
  scene.load.spritesheet(COMBAT_TEXTURES.tribulationEnemies, tribulationEnemiesUrl, sheet);
  scene.load.spritesheet(COMBAT_TEXTURES.projectiles, projectilesUrl, sheet);
  scene.load.spritesheet(COMBAT_TEXTURES.projectileImpacts, projectileImpactsUrl, sheet);
}

export function createCombatAnimations(scene: Phaser.Scene): void {
  const create = (
    key: string,
    texture: string,
    start: number,
    end: number,
    frameRate: number,
    repeat: number
  ): void => {
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture, { start, end }),
      frameRate,
      repeat
    });
  };

  Object.values(enemyVisualDefinitions).forEach((definition) => {
    create(
      definition.animation,
      definition.texture,
      definition.atlasRow * 4,
      definition.atlasRow * 4 + 3,
      definition.animation.includes("crow") ? 12 : 9,
      -1
    );
  });
  create(ENEMY_DEFEAT_ANIMATION, COMBAT_TEXTURES.tribulationEnemies, 12, 15, 16, 0);

  (Object.keys(projectileVisualDefinitions) as ProjectileVisualId[]).forEach(
    (id, row) => {
      const definition = projectileVisualDefinitions[id];
      create(
        definition.animation,
        COMBAT_TEXTURES.projectiles,
        row * 4,
        row * 4 + 3,
        14,
        -1
      );
      create(
        definition.impactAnimation,
        COMBAT_TEXTURES.projectileImpacts,
        row * 4,
        row * 4 + 3,
        18,
        0
      );
    }
  );
}
