import Phaser from "phaser";
import { LINGCAO_ANIMATIONS, WORLD_TEXTURES } from "../visual/worldVisuals";

export type LingcaoVisualState = "idle" | "resonance";

export class Lingcao extends Phaser.Physics.Arcade.Sprite {
  private visualState: LingcaoVisualState = "idle";
  private readonly markerObjects: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, WORLD_TEXTURES.lingcao, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(7);
    this.setDisplaySize(54, 54);
    const radius = 10 / this.scaleX;
    const legacyCenterOffset = 6 / this.scaleX;
    this.setCircle(
      radius,
      128 - radius - legacyCenterOffset,
      128 - radius - legacyCenterOffset
    );
    this.play(LINGCAO_ANIMATIONS.idle);
  }

  setWorldMarker(marker: string): void {
    const markerY = this.y - 58;
    const panel = this.scene.add
      .rectangle(this.x, markerY, 166, 38, 0x06111b, 0.9)
      .setStrokeStyle(1, 0x76d2cf, 0.7)
      .setDepth(11);
    const title = this.scene.add
      .text(this.x, markerY - 7, "LINGCAO", {
        fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
        fontSize: "11px",
        color: "#b9f0c8",
        letterSpacing: 2
      })
      .setOrigin(0.5)
      .setDepth(12);
    const direction = this.scene.add
      .text(this.x, markerY + 9, marker, {
        fontFamily: "Noto Sans SC Variable, Trebuchet MS, sans-serif",
        fontSize: "12px",
        color: "#dce9e7"
      })
      .setOrigin(0.5)
      .setDepth(12);
    const tether = this.scene.add.graphics().setDepth(10);
    tether.lineStyle(1, 0x76d2cf, 0.5);
    tether.lineBetween(this.x, markerY + 19, this.x, this.y - 25);
    tether.fillStyle(0xd7b96d, 0.8);
    tether.fillCircle(this.x, this.y - 24, 2.5);
    this.markerObjects.push(panel, title, direction, tether);
  }

  setResonating(resonating: boolean): void {
    const nextState: LingcaoVisualState = resonating ? "resonance" : "idle";
    if (nextState === this.visualState) return;
    this.visualState = nextState;
    this.play(
      resonating ? LINGCAO_ANIMATIONS.resonance : LINGCAO_ANIMATIONS.idle,
      true
    );
  }

  getVisualSnapshot(): {
    textureKey: string;
    animationKey: string;
    state: LingcaoVisualState;
    collisionCenterOffsetX: number;
    collisionCenterOffsetY: number;
  } {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return {
      textureKey: this.texture.key,
      animationKey: this.anims.currentAnim?.key ?? "",
      state: this.visualState,
      collisionCenterOffsetX: body.center.x - this.x,
      collisionCenterOffsetY: body.center.y - this.y
    };
  }

  destroy(fromScene?: boolean): void {
    this.markerObjects.forEach((object) => object.destroy());
    this.markerObjects.length = 0;
    super.destroy(fromScene);
  }
}
