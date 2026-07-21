import Phaser from "phaser";
import type { EnemyConfig } from "../data/enemies";
import {
  COMBAT_TEXTURES,
  ENEMY_DEFEAT_ANIMATION,
  enemyVisualDefinitions,
  type EnemyVisualDefinition,
} from "../visual/combatVisuals";
import {
  getEnemyMovementBehavior,
  projectEnemyMovement,
  type EnemyMovementBehavior,
  type EnemyMovementMode
} from "../logic/enemyMovement";

function getShadowOffsetY(visual: EnemyVisualDefinition): number {
  return visual.displaySize * (visual.grounded ? 0.28 : 0.2);
}

export interface EnemyVisualSnapshot {
  enemyId: EnemyConfig["id"];
  textureKey: string;
  animationKey: string;
  facing: "east" | "west";
  state: "materialize" | "pursue" | "hit" | "defeat";
  role: "normal" | "tribulation-boss";
  displayName: string;
  health: number;
  maxHealth: number;
  healthRatio: number;
  healthBarVisible: boolean;
  enraged: boolean;
  movementBehavior: EnemyMovementBehavior;
  movementMode: EnemyMovementMode;
}

export interface EnemyPressureModifiers {
  healthScale: number;
  contactDamageScale: number;
  speedScale: number;
}

export interface EnemyPresentationOptions {
  role?: EnemyVisualSnapshot["role"];
  displayName?: string;
  displayScale?: number;
  auraColor?: number;
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  config: EnemyConfig;
  health: number;
  readonly maxHealth: number;
  combatTargetId = 0;
  contactCooldownUntil = 0;
  embedStacks = 0;
  embedPower = 0;
  readonly touchDamage: number;
  readonly chaseSpeed: number;
  readonly role: EnemyVisualSnapshot["role"];
  readonly displayName: string;
  visualState: EnemyVisualSnapshot["state"] = "materialize";

  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly healthBar: Phaser.GameObjects.Graphics;
  private readonly bossAura?: Phaser.GameObjects.Graphics;
  private readonly bossAuraColor: number;
  private movementElapsedMs = 0;
  private movementMode: EnemyMovementMode = "pursue";
  private movementSlowMultiplier = 1;
  private movementSlowUntil = 0;
  private forcedVelocityX = 0;
  private forcedVelocityY = 0;
  private forcedVelocityUntil = 0;
  private deathEffect?: Phaser.GameObjects.Sprite;
  private healthBarVisibleUntil = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: EnemyConfig,
    pressure: EnemyPressureModifiers = {
      healthScale: 1,
      contactDamageScale: 1,
      speedScale: 1
    },
    presentation: EnemyPresentationOptions = {}
  ) {
    const visual = enemyVisualDefinitions[config.id];
    super(scene, x, y, visual.texture, 0);
    this.config = config;
    this.maxHealth = config.maxHealth * pressure.healthScale;
    this.health = this.maxHealth;
    this.touchDamage = config.touchDamage * pressure.contactDamageScale;
    this.chaseSpeed = config.speed * pressure.speedScale;
    this.role = presentation.role ?? "normal";
    this.displayName = presentation.displayName ?? config.name;
    this.bossAuraColor = presentation.auraColor ?? config.tint;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const displayScale = presentation.displayScale ?? 1;
    this.setDisplaySize(visual.displaySize * displayScale, visual.displaySize * displayScale);
    this.setDepth(5);
    const radius = (visual.collisionRadius * displayScale) / this.scaleX;
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

    this.healthBar = scene.add.graphics().setDepth(13).setVisible(false);

    if (this.role === "tribulation-boss") {
      this.bossAura = scene.add.graphics().setDepth(4.5);
      this.bossAura.setBlendMode(Phaser.BlendModes.ADD);
      this.renderBossAura(0);
    }

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
    if (this.scene.time.now >= this.movementSlowUntil) {
      this.movementSlowMultiplier = 1;
    }
    if (this.scene.time.now < this.forcedVelocityUntil) {
      body.setVelocity(this.forcedVelocityX, this.forcedVelocityY);
      this.movementMode = "pursue";
      return;
    }
    const movement = projectEnemyMovement({
      // Boss challenge comes from slams, adds, enrage, and arena hazards. Keep
      // the large boss body on a readable pursuit line so aimed Gongfa do not
      // whiff against an oversized target that also inherits an add's weave.
      enemyId: this.role === "tribulation-boss" ? "jade-rat" : this.config.id,
      elapsedMs: this.movementElapsedMs,
      sourceX: this.x,
      sourceY: this.y,
      targetX: target.x,
      targetY: target.y,
      speed: this.chaseSpeed * (this.isEnraged ? 1.22 : 1) * this.movementSlowMultiplier
    });
    body.setVelocity(movement.velocityX, movement.velocityY);
    this.movementMode = movement.mode;
    this.setFlipX(target.x < this.x);
  }

  receiveDamage(amount: number): boolean {
    if (!this.active) return false;
    const appliedDamage = Math.max(0, amount);
    this.health -= appliedDamage;
    this.healthBarVisibleUntil = this.scene.time.now + 1_600;
    this.renderHealthBar();
    this.presentDamageFeedback(appliedDamage);
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

  applySlow(multiplier: number, durationMs: number): void {
    if (!this.active || durationMs <= 0) return;
    this.movementSlowMultiplier = Math.min(
      this.movementSlowMultiplier,
      Phaser.Math.Clamp(multiplier, 0.1, 1)
    );
    this.movementSlowUntil = Math.max(this.movementSlowUntil, this.scene.time.now + durationMs);
  }

  applyForcedVelocity(angle: number, speed: number, durationMs: number): void {
    if (!this.active || durationMs <= 0) return;
    this.forcedVelocityX = Math.cos(angle) * speed;
    this.forcedVelocityY = Math.sin(angle) * speed;
    this.forcedVelocityUntil = Math.max(this.forcedVelocityUntil, this.scene.time.now + durationMs);
  }

  presentDefeat(): boolean {
    if (!this.active) return false;
    this.visualState = "defeat";
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;
    this.setActive(false);
    this.healthBar.setVisible(false);

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
      role: this.role,
      displayName: this.displayName,
      health: Math.max(0, this.health),
      maxHealth: this.maxHealth,
      healthRatio: this.maxHealth > 0 ? Math.max(0, this.health / this.maxHealth) : 0,
      healthBarVisible: this.healthBar.visible,
      enraged: this.isEnraged,
      movementBehavior: this.role === "tribulation-boss"
        ? "pursuit"
        : getEnemyMovementBehavior(this.config.id),
      movementMode: this.movementMode
    };
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.movementElapsedMs += Math.max(0, delta);
    const visual = enemyVisualDefinitions[this.config.id];
    this.shadow.setPosition(
      this.x,
      this.y + getShadowOffsetY(visual),
    );
    if (this.bossAura) {
      this.bossAura.setPosition(this.x, this.y);
      this.renderBossAura(time);
    }
    this.healthBar.setPosition(this.x, this.y);
    if (this.healthBar.visible && time >= this.healthBarVisibleUntil) {
      this.healthBar.setVisible(false);
    }
  }

  destroy(fromScene?: boolean): void {
    this.shadow?.destroy();
    this.healthBar?.destroy();
    this.bossAura?.destroy();
    this.deathEffect?.destroy();
    super.destroy(fromScene);
  }

  get isEnraged(): boolean {
    return this.role === "tribulation-boss" && this.health / this.maxHealth <= 0.5;
  }

  private renderBossAura(timeMs: number): void {
    if (!this.bossAura) return;
    const visual = enemyVisualDefinitions[this.config.id];
    const pulse = 1 + Math.sin(timeMs / 180) * 0.06;
    const radiusX = visual.displaySize * 0.72 * pulse;
    const radiusY = visual.displaySize * 0.25 * pulse;
    this.bossAura.clear();
    this.bossAura.lineStyle(this.isEnraged ? 4 : 3, this.bossAuraColor, this.isEnraged ? 0.92 : 0.7);
    this.bossAura.strokeEllipse(0, getShadowOffsetY(visual), radiusX, radiusY);
    for (let spoke = 0; spoke < 8; spoke += 1) {
      const angle = (Math.PI * 2 * spoke) / 8 + timeMs / 1200;
      this.bossAura.lineStyle(2, this.bossAuraColor, 0.5);
      this.bossAura.lineBetween(
        Math.cos(angle) * radiusX * 0.42,
        getShadowOffsetY(visual) + Math.sin(angle) * radiusY * 0.42,
        Math.cos(angle) * radiusX * 0.62,
        getShadowOffsetY(visual) + Math.sin(angle) * radiusY * 0.62
      );
    }
  }

  private renderHealthBar(): void {
    const width = this.role === "tribulation-boss" ? 104 : 46;
    const height = this.role === "tribulation-boss" ? 8 : 6;
    const y = -this.displayHeight * 0.62;
    const ratio = Phaser.Math.Clamp(this.health / Math.max(1, this.maxHealth), 0, 1);
    const fill = ratio > 0.55 ? 0x73db78 : ratio > 0.25 ? 0xf0c95a : 0xef6a67;
    this.healthBar
      .setPosition(this.x, this.y)
      .setVisible(true)
      .clear()
      .fillStyle(0x101820, 0.92)
      .fillRoundedRect(-width / 2 - 2, y - 2, width + 4, height + 4, 3)
      .fillStyle(0x351c25, 0.96)
      .fillRoundedRect(-width / 2, y, width, height, 2)
      .fillStyle(fill, 1)
      .fillRoundedRect(-width / 2, y, width * ratio, height, 2)
      .lineStyle(1, 0xfff0c2, 0.72)
      .strokeRoundedRect(-width / 2 - 1, y - 1, width + 2, height + 2, 3);
  }

  private presentDamageFeedback(amount: number): void {
    if (amount <= 0) return;
    const visual = enemyVisualDefinitions[this.config.id];
    const label = this.scene.add
      .text(this.x, this.y - visual.displaySize * 0.42, `-${Math.max(1, Math.round(amount))}`, {
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: this.role === "tribulation-boss" ? "19px" : "15px",
        fontStyle: "bold",
        color: "#fff0a8",
        stroke: "#351808",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(20);
    const impact = this.scene.add
      .circle(this.x, this.y, Math.max(18, this.displayWidth * 0.28), 0xffe68a, 0.08)
      .setStrokeStyle(3, 0xfff5c8, 0.9)
      .setDepth(14);
    this.scene.tweens.add({
      targets: label,
      y: label.y - 34,
      alpha: 0,
      duration: 560,
      ease: "Cubic.out",
      onComplete: () => label.destroy()
    });
    this.scene.tweens.add({
      targets: impact,
      scale: 1.55,
      alpha: 0,
      duration: 190,
      ease: "Quad.out",
      onComplete: () => impact.destroy()
    });
  }
}
