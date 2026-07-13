import Phaser from "phaser";
import type { GongfaId } from "../data/gongfa";
import {
  COMBAT_TEXTURES,
  projectileVisualDefinitions
} from "../visual/combatVisuals";
import type { ProjectileVisualId } from "../types/combatVisuals";
import type { Enemy } from "./Enemy";

export interface ProjectileVisualSnapshot {
  logicalTexture: ProjectileVisualId;
  textureKey: string;
  animationKey: string;
  angle: number;
}

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  damage = 0;
  pierceRemaining = 0;
  sourceGongfaId?: GongfaId;
  skill2ActivationId?: number;
  sourceIsCascadeFragment = false;
  lodgedEnemy?: Enemy;
  readonly logicalTexture: ProjectileVisualId;

  private readonly baseScale: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: ProjectileVisualId) {
    const visual = projectileVisualDefinitions[texture];
    super(scene, x, y, COMBAT_TEXTURES.projectiles, 0);
    this.logicalTexture = texture;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(11);
    this.setDisplaySize(visual.displaySize, visual.displaySize);
    this.baseScale = this.scaleX;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(
      visual.collisionWidth / this.baseScale,
      visual.collisionHeight / this.baseScale,
      true
    );
    this.play(visual.animation);
  }

  setVisualScale(x: number, y = x): this {
    this.setScale(this.baseScale * x, this.baseScale * y);
    return this;
  }

  getVisualSnapshot(): ProjectileVisualSnapshot {
    return {
      logicalTexture: this.logicalTexture,
      textureKey: this.texture.key,
      animationKey: this.anims.currentAnim?.key ?? "",
      angle: this.angle
    };
  }
}
