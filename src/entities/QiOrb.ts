import Phaser from "phaser";

export class QiOrb extends Phaser.Physics.Arcade.Image {
  qiValue: number;

  constructor(scene: Phaser.Scene, x: number, y: number, qiValue: number) {
    super(scene, x, y, "qi-orb");
    this.qiValue = qiValue;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(4);
    this.setCircle(6);
  }
}
