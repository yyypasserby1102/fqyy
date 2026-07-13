import Phaser from "phaser";
import {
  advanceCultivatorVisualState,
  createCultivatorVisualState,
  type CultivatorVisualEvent,
  type CultivatorVisualState,
  type CultivatorVector
} from "../logic/cultivatorVisualState";
import {
  CULTIVATOR_ANIMATIONS,
  CULTIVATOR_TEXTURES
} from "../visual/cultivatorVisuals";

export interface PlayerStats {
  moveSpeed: number;
  maxHealth: number;
  health: number;
  magnetRadius: number;
  damageReduction: number;
}

export interface PlayerVisualSnapshot {
  mode: CultivatorVisualState["mode"];
  facing: CultivatorVisualState["facing"];
  animationKey: string;
  activeVfx: string[];
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  stats: PlayerStats = {
    moveSpeed: 220,
    maxHealth: 120,
    health: 120,
    magnetRadius: 90,
    damageReduction: 0
  };

  private visualState = createCultivatorVisualState();
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly locator: Phaser.GameObjects.Ellipse;
  private readonly activeEffects = new Set<Phaser.GameObjects.Sprite>();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, CULTIVATOR_TEXTURES.locomotion, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.setDisplaySize(96, 96);
    // Keep gameplay contact close to the logical player position; the painted
    // frame has generous transparent margins and should not define collisions.
    this.setCircle(32, 96, 126);
    this.setDrag(900, 900);
    this.setMaxVelocity(this.stats.moveSpeed, this.stats.moveSpeed);

    this.shadow = scene.add.ellipse(x, y + 30, 46, 15, 0x101824, 0.34).setDepth(8);
    this.locator = scene.add
      .ellipse(x, y + 27, 40, 15, 0x000000, 0)
      .setStrokeStyle(2, 0xe9c76b, 0.72)
      .setDepth(9);
    this.syncPresentation();
  }

  move(input: Phaser.Math.Vector2, speed = this.stats.moveSpeed): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocity(speed, speed);
    body.setVelocity(input.x * speed, input.y * speed);
  }

  advanceVisual(deltaMs: number, movement: CultivatorVector): void {
    this.visualState = advanceCultivatorVisualState(this.visualState, {
      kind: "tick",
      deltaMs,
      movement
    });
    this.syncPresentation();
  }

  presentAttack(direction: CultivatorVector): void {
    if (this.tryAdvanceVisualState({ kind: "attack", direction })) {
      this.spawnDirectionalEffect(CULTIVATOR_ANIMATIONS.attackVfx, direction, 112, 34);
    }
  }

  presentSkill(direction: CultivatorVector): void {
    if (!this.tryAdvanceVisualState({ kind: "skill", direction })) return;
    this.spawnEffect(CULTIVATOR_ANIMATIONS.skillGatherVfx, 142, 0, 0, true, 9.5);
    this.scene.time.delayedCall(300, () => {
      if (this.active && this.visualState.mode === "skill") {
        this.spawnDirectionalEffect(
          CULTIVATOR_ANIMATIONS.skillReleaseVfx,
          direction,
          186,
          18,
          10.5
        );
      }
    });
  }

  presentEvade(direction: CultivatorVector): void {
    if (this.tryAdvanceVisualState({ kind: "evade", direction })) {
      this.spawnDirectionalEffect(CULTIVATOR_ANIMATIONS.evadeVfx, direction, 112, -12, 9.5);
    }
  }

  presentHit(): void {
    if (this.tryAdvanceVisualState({ kind: "hit" })) {
      this.spawnEffect(CULTIVATOR_ANIMATIONS.hitVfx, 98, 0, -8, true);
    }
  }

  presentDefeat(): void {
    if (!this.tryAdvanceVisualState({ kind: "defeat" })) return;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      delay: 300,
      duration: 220,
      ease: "Sine.easeIn"
    });
  }

  getVisualSnapshot(): PlayerVisualSnapshot {
    return {
      mode: this.visualState.mode,
      facing: this.visualState.facing,
      animationKey: this.anims.currentAnim?.key ?? "",
      activeVfx: [...this.activeEffects]
        .filter((effect) => effect.active)
        .map((effect) => effect.anims.currentAnim?.key ?? "")
        .filter(Boolean)
    };
  }

  applyDamage(amount: number): void {
    const mitigated = Math.max(1, Math.floor(amount * (1 - this.stats.damageReduction)));
    this.stats.health = Math.max(0, this.stats.health - mitigated);
    this.presentHit();
    this.setTint(0xff8d8d);
    this.scene.time.delayedCall(70, () => {
      if (this.active) this.clearTint();
    });
  }

  heal(amount: number): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.shadow.setPosition(this.x, this.y + 30);
    this.locator.setPosition(this.x, this.y + 27);
    this.activeEffects.forEach((effect) => {
      if (effect.getData("followPlayer")) {
        effect.setPosition(this.x, this.y - 6);
      }
    });
  }

  destroy(fromScene?: boolean): void {
    this.shadow?.destroy();
    this.locator?.destroy();
    this.activeEffects.forEach((effect) => effect.destroy());
    this.activeEffects.clear();
    super.destroy(fromScene);
  }

  private tryAdvanceVisualState(
    event: Exclude<CultivatorVisualEvent, { kind: "tick" }>
  ): boolean {
    const next = advanceCultivatorVisualState(this.visualState, event);
    if (next === this.visualState) return false;
    this.visualState = next;
    this.syncPresentation();
    return true;
  }

  private syncPresentation(): void {
    const { mode, facing } = this.visualState;
    let animationKey: string;
    if (mode === "run") {
      animationKey = facing === "north"
        ? CULTIVATOR_ANIMATIONS.runNorth
        : facing === "south"
          ? CULTIVATOR_ANIMATIONS.runSouth
          : CULTIVATOR_ANIMATIONS.runEast;
    } else {
      animationKey = CULTIVATOR_ANIMATIONS[mode];
    }
    if (this.anims.currentAnim?.key !== animationKey) this.play(animationKey, true);
    this.setFlipX(facing === "west");
    this.locator.setStrokeStyle(
      2,
      0xe9c76b,
      mode === "skill" || mode === "evade" ? 0.98 : 0.72
    );
  }

  private spawnDirectionalEffect(
    animationKey: string,
    direction: CultivatorVector,
    size: number,
    distance: number,
    depth = 10.5
  ): void {
    const length = Math.hypot(direction.x, direction.y) || 1;
    const x = direction.x / length;
    const y = direction.y / length;
    const effect = this.spawnEffect(
      animationKey,
      size,
      x * distance,
      y * distance - 5,
      false,
      depth
    );
    effect.setRotation(Math.atan2(y, x));
  }

  private spawnEffect(
    animationKey: string,
    size: number,
    offsetX: number,
    offsetY: number,
    followPlayer = false,
    depth = 10.5
  ): Phaser.GameObjects.Sprite {
    const effect = this.scene.add
      .sprite(this.x + offsetX, this.y + offsetY, CULTIVATOR_TEXTURES.vfx)
      .setDisplaySize(size, size)
      .setDepth(depth)
      .setData("followPlayer", followPlayer);
    this.activeEffects.add(effect);
    effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.activeEffects.delete(effect);
      effect.destroy();
    });
    effect.play(animationKey);
    return effect;
  }
}
