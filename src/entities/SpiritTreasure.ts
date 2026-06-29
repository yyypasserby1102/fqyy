import Phaser from "phaser";
import type { SpiritTreasureId } from "../data/spiritTreasures";

export class SpiritTreasure extends Phaser.Physics.Arcade.Image {
  treasureId: SpiritTreasureId;

  constructor(scene: Phaser.Scene, x: number, y: number, treasureId: SpiritTreasureId) {
    super(scene, x, y, "spirit-treasure");
    this.treasureId = treasureId;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(4);
    this.setCircle(9);
  }
}
