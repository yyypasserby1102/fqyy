import Phaser from "phaser";
import type { GongfaId } from "../data/gongfa";
import {
  COMBAT_TEXTURES,
  projectileVisualDefinitions
} from "../visual/combatVisuals";
import type { ProjectileVisualId } from "../types/combatVisuals";
import type { Enemy } from "./Enemy";
import type { GongfaVisualEmphasis } from "../logic/combatVisualHierarchy";
import { getGongfaVisualIdentity } from "../visual/gongfaVisualIdentity";

export interface ProjectileVisualSnapshot {
  logicalTexture: ProjectileVisualId;
  textureKey: string;
  animationKey: string;
  angle: number;
  sourceGongfaId?: GongfaId;
  visualTier: GongfaVisualEmphasis["visualTier"];
  alpha: number;
  depth: number;
  motifId?: string;
  trailStyle?: string;
  trailEmissionCount: number;
  silhouetteScale: { x: number; y: number };
}

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  damage = 0;
  pierceRemaining = 0;
  private sourceGongfa?: GongfaId;
  skill2ActivationId?: number;
  sourceIsCascadeFragment = false;
  lodgedEnemy?: Enemy;
  readonly logicalTexture: ProjectileVisualId;
  private visualTier: GongfaVisualEmphasis["visualTier"] = "founding";

  private readonly baseScale: number;
  private identityScaleX = 1;
  private identityScaleY = 1;
  private trailCooldownMs = 0;
  private trailEmissionCount = 0;

  get sourceGongfaId(): GongfaId | undefined {
    return this.sourceGongfa;
  }

  set sourceGongfaId(value: GongfaId | undefined) {
    this.sourceGongfa = value;
    if (!value) return;
    const geometry = getGongfaVisualIdentity(value).geometry;
    const silhouette: Record<typeof geometry, readonly [number, number]> = {
      "sword-seal": [1.12, 0.72], corridor: [1.35, 0.62], facets: [0.9, 0.9],
      furnace: [0.76, 1.08], wings: [1.08, 0.56], solar: [1, 1], crescent: [1.28, 0.7],
      constellation: [0.62, 1.12], tide: [1.42, 0.68], lotus: [0.94, 0.94],
      roots: [0.72, 1.2], bloom: [1.08, 1.08], rings: [1.5, 0.76],
      calamity: [1.18, 1.18], wraiths: [0.72, 1.16], impact: [1.24, 0.82],
      orbit: [1.08, 1.08], formation: [1.12, 1.12]
    };
    [this.identityScaleX, this.identityScaleY] = silhouette[geometry];
    this.setScale(
      this.baseScale * this.identityScaleX,
      this.baseScale * this.identityScaleY
    );
    this.setBlendMode(geometry === "furnace" || geometry === "tide" ? Phaser.BlendModes.SCREEN : Phaser.BlendModes.ADD);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, texture: ProjectileVisualId) {
    const visual = projectileVisualDefinitions[texture];
    super(scene, x, y, COMBAT_TEXTURES.projectiles, 0);
    this.logicalTexture = texture;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(11);
    this.setDisplaySize(visual.displaySize, visual.displaySize);
    this.baseScale = this.scaleX;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(
      visual.collisionWidth / this.baseScale,
      visual.collisionHeight / this.baseScale,
      true
    );
    this.play(visual.animation);
  }

  setVisualScale(x: number, y = x): this {
    this.setScale(
      this.baseScale * x * this.identityScaleX,
      this.baseScale * y * this.identityScaleY
    );
    return this;
  }

  applyVisualEmphasis(emphasis: GongfaVisualEmphasis): this {
    this.visualTier = emphasis.visualTier;
    return this.setAlpha(emphasis.alpha).setDepth(emphasis.depth);
  }

  override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.sourceGongfa || !this.active) return;
    this.trailCooldownMs -= delta;
    if (this.trailCooldownMs > 0) return;

    const identity = getGongfaVisualIdentity(this.sourceGongfa);
    const alpha = this.visualTier === "founding" ? 0.34 : 0.2;
    const echo = this.drawIdentityTrail(identity.accent, identity.secondary, alpha)
      .setPosition(this.x, this.y)
      .setScale(this.identityScaleX, this.identityScaleY)
      .setRotation(this.rotation)
      .setDepth(this.depth - 1)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({
      targets: echo,
      alpha: 0,
      scaleX: 0.25,
      scaleY: 0.25,
      duration: this.visualTier === "founding" ? 170 : 120,
      onComplete: () => echo.destroy()
    });
    this.trailEmissionCount += 1;
    this.trailCooldownMs = this.visualTier === "founding" ? 72 : 110;
  }

  private drawIdentityTrail(accent: number, secondary: number, alpha: number): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    const geometry = getGongfaVisualIdentity(this.sourceGongfa!).geometry;
    graphics.fillStyle(accent, alpha).lineStyle(2, secondary, alpha * 0.9);
    switch (geometry) {
      case "sword-seal": graphics.fillRect(-8, -1.5, 16, 3); graphics.lineBetween(2, -5, 2, 5); break;
      case "corridor": graphics.lineBetween(-10, -4, 9, -4); graphics.lineBetween(-10, 4, 9, 4); break;
      case "facets": graphics.strokeTriangle(-7, 0, 0, -7, 7, 0); graphics.strokeTriangle(-7, 0, 0, 7, 7, 0); break;
      case "furnace": graphics.fillCircle(0, 0, 6); graphics.fillStyle(0x120607, alpha).fillCircle(0, 0, 2.5); break;
      case "wings": graphics.fillTriangle(-9, 0, -1, -5, -2, 2); graphics.fillTriangle(9, 0, 1, -5, 2, 2); break;
      case "solar": graphics.strokeCircle(0, 0, 6); graphics.fillCircle(0, 0, 2); break;
      case "crescent": graphics.beginPath().arc(0, 0, 7, -1.1, 1.1).strokePath(); graphics.beginPath().arc(-3, 0, 7, -1, 1).strokePath(); break;
      case "constellation": graphics.fillCircle(-6, 3, 1.5); graphics.fillCircle(0, -4, 1.5); graphics.fillCircle(6, 2, 1.5); graphics.lineBetween(-6, 3, 0, -4); graphics.lineBetween(0, -4, 6, 2); break;
      case "tide": graphics.beginPath().moveTo(-10, 2).lineTo(-6, -3).lineTo(-2, 2).lineTo(2, 6).lineTo(6, 1).lineTo(10, 3).strokePath(); break;
      case "lotus": for (let i = 0; i < 4; i += 1) graphics.strokeEllipse(Math.cos(i * Math.PI / 2) * 3, Math.sin(i * Math.PI / 2) * 3, 5, 9); break;
      case "roots": graphics.lineBetween(-9, 0, 8, 0); graphics.lineBetween(-2, 0, 3, -6); graphics.lineBetween(1, 0, 6, 6); break;
      case "bloom": for (let i = 0; i < 6; i += 1) graphics.fillCircle(Math.cos(i * Math.PI / 3) * 5, Math.sin(i * Math.PI / 3) * 5, 2); break;
      case "rings": graphics.strokeRect(-8, -5, 16, 10); graphics.strokeRect(-4, -2.5, 8, 5); break;
    }
    return graphics;
  }

  getVisualSnapshot(): ProjectileVisualSnapshot {
    const identity = this.sourceGongfaId
      ? getGongfaVisualIdentity(this.sourceGongfaId)
      : undefined;
    return {
      logicalTexture: this.logicalTexture,
      textureKey: this.texture.key,
      animationKey: this.anims.currentAnim?.key ?? "",
      angle: this.angle,
      sourceGongfaId: this.sourceGongfaId,
      visualTier: this.visualTier,
      alpha: this.alpha,
      depth: this.depth,
      motifId: identity?.motifId,
      trailStyle: identity?.trailStyle,
      trailEmissionCount: this.trailEmissionCount,
      silhouetteScale: { x: this.identityScaleX, y: this.identityScaleY }
    };
  }
}
