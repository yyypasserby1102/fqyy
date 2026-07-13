import Phaser from "phaser";
import type { GongfaId } from "../data/gongfa";
import type { Enemy } from "./Enemy";

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  damage = 0;
  pierceRemaining = 0;
  sourceGongfaId?: GongfaId;
  skill2ActivationId?: number;
  sourceIsCascadeFragment = false;
  lodgedEnemy?: Enemy;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(8);
  }
}
