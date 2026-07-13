import Phaser from "phaser";
import type { EnemyConfig } from "../data/enemies";
import {
  COMBAT_TEXTURES,
  ENEMY_DEFEAT_ANIMATION,
  enemyVisualDefinitions,
  type EnemyVisualDefinition,
} from "../visual/combatVisuals";

function getShadowOffsetY(visual: EnemyVisualDefinition): number {
  return visual.displaySize * (visual.grounded ? 0.28 : 0.2);
}

export interface EnemyVisualSnapshot {
  enemyId: EnemyConfig["id"];
  textureKey: string;
  animationKey: string;
  facing: "east" | "west";
  state: "materialize" | "pursue" | "hit" | "defeat";
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  config: EnemyConfig;
  health: number;
  combatTargetId = 0;
  contactCooldownUntil = 0;
  embedStacks = 0;
  embedPower = 0;
  visualState: EnemyVisualSnapshot["state"] = "materialize";

  private readonly shadow: Phaser.GameObjects.Ellipse;
  private deathEffect?: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, config: EnemyConfig) {
    const visual = enemyVisualDefinitions[config.id];
    super(scene, x, y, visual.texture, 0);
    this.config = config;
    this.health = config.maxHealth;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(visual.displaySize, visual.displaySize);
    this.setDepth(5);
    const radius = visual.collisionRadius / this.scaleX;
    this.setCircle(radius, 128 - radius, 128 - radius);
    this.play(visual.animation);

    this.shadow = scene.add
      .ellipse(
        x,
        y + getShadowOffsetY(visual),
        visual.displaySize * (visual.grounded ? 0.52 : 0.34),
        visual.displaySize * 0.14,
        0x101824,
        visual.grounded ? 0.28 : 0.16,
      )
      .setDepth(4);

    this.setAlpha(0.18);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 220,
      ease: "Quad.out",
      onComplete: () => {
        if (this.active) this.visualState = "pursue";
      },
    });
  }

  chase(target: Phaser.Math.Vector2): void {
    if (!this.active) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    body.setVelocity(
      Math.cos(angle) * this.config.speed,
      Math.sin(angle) * this.config.speed,
    );
    this.setFlipX(target.x < this.x);
  }

  receiveDamage(amount: number): boolean {
    if (!this.active) return false;
    this.health -= amount;
    this.visualState = "hit";
    this.setTint(0xfff4dc).setTintMode(Phaser.TintModes.FILL);
    const recoilAngle = this.flipX ? 3 : -3;
    this.scene.tweens.add({
      targets: this,
      angle: recoilAngle,
      yoyo: true,
      duration: 42,
      onComplete: () => {
        if (this.active) this.setAngle(0);
      },
    });
    this.scene.time.delayedCall(90, () => {
      if (this.active) {
        this.clearTint();
        this.setTintMode(Phaser.TintModes.MULTIPLY);
        this.visualState = "pursue";
      }
    });
    return this.health <= 0;
  }

  presentDefeat(): boolean {
    if (!this.active) return false;
    this.visualState = "defeat";
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;
    this.setActive(false);

    this.deathEffect = this.scene.add
      .sprite(this.x, this.y, COMBAT_TEXTURES.tribulationEnemies, 12)
      .setDisplaySize(96, 96)
      .setDepth(12)
      .play(ENEMY_DEFEAT_ANIMATION);
    this.deathEffect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.deathEffect?.destroy();
      this.deathEffect = undefined;
    });

    this.scene.tweens.add({
      targets: [this, this.shadow],
      alpha: 0,
      duration: 220,
      ease: "Quad.in",
      onComplete: () => this.destroy(),
    });
    return true;
  }

  getVisualSnapshot(): EnemyVisualSnapshot {
    return {
      enemyId: this.config.id,
      textureKey: this.texture.key,
      animationKey: this.anims.currentAnim?.key ?? "",
      facing: this.flipX ? "west" : "east",
      state: this.visualState,
    };
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    const visual = enemyVisualDefinitions[this.config.id];
    this.shadow.setPosition(
      this.x,
      this.y + getShadowOffsetY(visual),
    );
  }

  destroy(fromScene?: boolean): void {
    this.shadow?.destroy();
    this.deathEffect?.destroy();
    super.destroy(fromScene);
  }
}
