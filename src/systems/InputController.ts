import Phaser from "phaser";

export class InputController {
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene) {
    this.keys = scene.input.keyboard!.addKeys(
      "W,A,S,D,UP,LEFT,DOWN,RIGHT,SPACE,ESC,F3,ONE,TWO,THREE"
    ) as Record<string, Phaser.Input.Keyboard.Key>;
  }

  getMovementVector(): Phaser.Math.Vector2 {
    let x = 0;
    let y = 0;

    if (this.keys.A.isDown || this.keys.LEFT.isDown) {
      x -= 1;
    }
    if (this.keys.D.isDown || this.keys.RIGHT.isDown) {
      x += 1;
    }
    if (this.keys.W.isDown || this.keys.UP.isDown) {
      y -= 1;
    }
    if (this.keys.S.isDown || this.keys.DOWN.isDown) {
      y += 1;
    }

    return new Phaser.Math.Vector2(x, y).normalize();
  }

  get pausePressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.ESC);
  }

  get evadePressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
  }

  get debugPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.F3);
  }

  get selectedUpgradeSlot(): number | null {
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)) {
      return 0;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.TWO)) {
      return 1;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.THREE)) {
      return 2;
    }
    return null;
  }
}
