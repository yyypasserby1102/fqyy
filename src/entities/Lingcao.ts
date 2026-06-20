import Phaser from "phaser";

export class Lingcao extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "lingcao");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(7);
    this.setCircle(10);
  }
}
