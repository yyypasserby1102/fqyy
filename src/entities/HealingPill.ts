import Phaser from "phaser";

export class HealingPill extends Phaser.Physics.Arcade.Image {
  healAmount: number;

  constructor(scene: Phaser.Scene, x: number, y: number, healAmount = 30) {
    super(scene, x, y, "healing-pill");
    this.healAmount = healAmount;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(4);
    this.setCircle(7);
  }
}
