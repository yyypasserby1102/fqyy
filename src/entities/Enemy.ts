import Phaser from "phaser";
import type { EnemyConfig } from "../data/enemies";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  config: EnemyConfig;
  health: number;
  contactCooldownUntil = 0;
  embedStacks = 0;
  embedPower = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: EnemyConfig) {
    super(scene, x, y, config.texture);
    this.config = config;
    this.health = config.maxHealth;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setTint(config.tint);
    this.setScale(config.scale);
    this.setDepth(5);
    this.setCircle(Math.max(this.width, this.height) * 0.35);
  }

  chase(target: Phaser.Math.Vector2): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    body.setVelocity(
      Math.cos(angle) * this.config.speed,
      Math.sin(angle) * this.config.speed
    );
  }

  receiveDamage(amount: number): boolean {
    this.health -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(40, () => {
      if (this.active) {
        this.clearTint();
        this.setTint(this.config.tint);
      }
    });
    return this.health <= 0;
  }
}
