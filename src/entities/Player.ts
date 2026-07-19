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
import type { RealmPhaseId } from "../data/stages";
import { getSettings } from "../persistence/settingsPersistence";
import {
  getCultivatorPhaseVisualProfile,
  type CultivatorPhaseRegalia,
  type CultivatorPhaseVisualProfile
} from "../visual/cultivatorPhaseVisuals";

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
  cultivationPhase: RealmPhaseId;
  phaseRegalia: CultivatorPhaseRegalia;
  phaseAuraColor: number;
  phaseRingCount: number;
  phaseOrbitingMotes: number;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private recoveryCeilingRatio = 1;
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
  private readonly phaseAuraBack: Phaser.GameObjects.Graphics;
  private readonly phaseRegaliaFront: Phaser.GameObjects.Graphics;
  private readonly activeEffects = new Set<Phaser.GameObjects.Sprite>();
  private phaseVisualProfile: CultivatorPhaseVisualProfile =
    getCultivatorPhaseVisualProfile("chuqi");
  private phaseVisualElapsedMs = 0;

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
    this.phaseAuraBack = scene.add.graphics().setDepth(9.25);
    this.phaseAuraBack.setBlendMode(Phaser.BlendModes.ADD);
    this.phaseRegaliaFront = scene.add.graphics().setDepth(10.25);
    this.phaseRegaliaFront.setBlendMode(Phaser.BlendModes.ADD);
    this.syncPresentation();
    this.renderPhasePresentation();
  }

  move(input: Phaser.Math.Vector2, speed = this.stats.moveSpeed): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocity(speed, speed);
    body.setVelocity(input.x * speed, input.y * speed);
  }

  advanceVisual(deltaMs: number, movement: CultivatorVector): void {
    this.phaseVisualElapsedMs += Math.max(0, deltaMs);
    this.visualState = advanceCultivatorVisualState(this.visualState, {
      kind: "tick",
      deltaMs,
      movement
    });
    this.syncPresentation();
    this.renderPhasePresentation();
  }

  setCultivationPhase(phase: RealmPhaseId): void {
    if (this.phaseVisualProfile.phase === phase) return;
    this.phaseVisualProfile = getCultivatorPhaseVisualProfile(phase);
    this.phaseVisualElapsedMs = 0;
    this.renderPhasePresentation();
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
        .filter(Boolean),
      cultivationPhase: this.phaseVisualProfile.phase,
      phaseRegalia: this.phaseVisualProfile.regalia,
      phaseAuraColor: this.phaseVisualProfile.primaryColor,
      phaseRingCount: this.phaseVisualProfile.ringCount,
      phaseOrbitingMotes: this.phaseVisualProfile.orbitingMotes
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
    this.stats.health = Math.min(
      this.stats.maxHealth * this.recoveryCeilingRatio,
      this.stats.health + amount
    );
  }

  lockRecoveryCeiling(ratio: number): void {
    this.recoveryCeilingRatio = Math.min(this.recoveryCeilingRatio, Phaser.Math.Clamp(ratio, 0.01, 1));
    this.stats.health = Math.min(this.stats.health, this.stats.maxHealth * this.recoveryCeilingRatio);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.shadow.setPosition(this.x, this.y + 30);
    this.locator.setPosition(this.x, this.y + 27);
    this.phaseAuraBack.setPosition(this.x, this.y);
    this.phaseRegaliaFront.setPosition(this.x, this.y);
    this.activeEffects.forEach((effect) => {
      if (effect.getData("followPlayer")) {
        effect.setPosition(this.x, this.y - 6);
      }
    });
  }

  destroy(fromScene?: boolean): void {
    this.shadow?.destroy();
    this.locator?.destroy();
    this.phaseAuraBack?.destroy();
    this.phaseRegaliaFront?.destroy();
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

  private renderPhasePresentation(): void {
    const profile = this.phaseVisualProfile;
    const reducedMotion = getSettings().reducedMotion;
    const time = reducedMotion ? 0 : this.phaseVisualElapsedMs / 1000;
    const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 2.4) * 0.05;
    const back = this.phaseAuraBack;
    const front = this.phaseRegaliaFront;

    back.clear().setPosition(this.x, this.y);
    front.clear().setPosition(this.x, this.y);

    for (let ring = 0; ring < profile.ringCount; ring += 1) {
      const width = (52 + ring * 13) * pulse;
      const height = (17 + ring * 4) * pulse;
      back.lineStyle(1.4 + ring * 0.35, profile.primaryColor, 0.42 - ring * 0.06);
      back.strokeEllipse(0, 28, width, height);
    }

    for (let mote = 0; mote < profile.orbitingMotes; mote += 1) {
      const angle = time * (0.75 + profile.orbitingMotes * 0.04) +
        (Math.PI * 2 * mote) / profile.orbitingMotes;
      const x = Math.cos(angle) * (30 + profile.ringCount * 3);
      const y = -5 + Math.sin(angle) * 18;
      const target = y > -5 ? front : back;
      target.fillStyle(profile.secondaryColor, 0.82);
      target.fillCircle(x, y, mote % 2 === 0 ? 2.5 : 1.8);
      target.lineStyle(1, profile.primaryColor, 0.58);
      target.strokeCircle(x, y, 4.5);
    }

    if (profile.regalia === "qi-knot") {
      front.fillStyle(profile.primaryColor, 0.9);
      front.fillCircle(0, 8, 3.5);
      front.lineStyle(2, profile.secondaryColor, 0.72);
      front.lineBetween(-1, 11, -7, 21);
      front.lineBetween(1, 11, 7, 21);
      return;
    }

    if (profile.regalia === "shoulder-crest") {
      front.lineStyle(3, profile.primaryColor, 0.82);
      front.arc(-18, -8, 8, Math.PI * 1.08, Math.PI * 1.92);
      front.arc(18, -8, 8, Math.PI * 1.08, Math.PI * 1.92);
      front.fillStyle(profile.secondaryColor, 0.9);
      front.fillTriangle(-24, -10, -18, -17, -13, -9);
      front.fillTriangle(24, -10, 18, -17, 13, -9);
      return;
    }

    if (profile.regalia === "flowing-mantle") {
      back.lineStyle(4, profile.primaryColor, 0.48);
      back.lineBetween(-20, -10, -31, 27);
      back.lineBetween(20, -10, 31, 27);
      back.lineStyle(2, profile.secondaryColor, 0.6);
      back.lineBetween(-25, 4, -37, 30);
      back.lineBetween(25, 4, 37, 30);
      front.fillStyle(profile.secondaryColor, 0.92);
      front.fillTriangle(0, -15, -5, -7, 5, -7);
      front.lineStyle(2, profile.primaryColor, 0.82);
      front.strokeCircle(0, -10, 7);
      return;
    }

    front.lineStyle(2.4, profile.primaryColor, 0.84);
    front.strokeEllipse(0, -38, 38 * pulse, 12 * pulse);
    front.fillStyle(profile.secondaryColor, 0.88);
    front.fillTriangle(0, -50, -7, -38, 7, -38);
    front.fillTriangle(-11, -47, -16, -35, -5, -38);
    front.fillTriangle(11, -47, 16, -35, 5, -38);
    for (let ray = 0; ray < 5; ray += 1) {
      const angle = -Math.PI + (Math.PI * ray) / 4;
      front.lineStyle(1.5, profile.secondaryColor, 0.64);
      front.lineBetween(
        Math.cos(angle) * 24,
        -38 + Math.sin(angle) * 7,
        Math.cos(angle) * 31,
        -38 + Math.sin(angle) * 11
      );
    }
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
