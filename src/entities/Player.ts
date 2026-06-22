import Phaser from "phaser";

export interface PlayerStats {
  moveSpeed: number;
  maxHealth: number;
  health: number;
  magnetRadius: number;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  stats: PlayerStats = {
    moveSpeed: 220,
    maxHealth: 100,
    health: 100,
    magnetRadius: 90
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player-cultivator");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.setCircle(12);
    this.setDrag(900, 900);
    this.setMaxVelocity(this.stats.moveSpeed, this.stats.moveSpeed);
  }

  move(input: Phaser.Math.Vector2, speed = this.stats.moveSpeed): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocity(speed, speed);
    body.setVelocity(input.x * speed, input.y * speed);
  }

  applyDamage(amount: number): void {
    this.stats.health = Math.max(0, this.stats.health - amount);
    this.setTint(0xff8d8d);
    this.scene.time.delayedCall(70, () => {
      if (this.active) {
        this.clearTint();
      }
    });
  }

  heal(amount: number): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }
}
