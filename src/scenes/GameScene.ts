import Phaser from "phaser";
import type { ChoiceOption } from "../data/choices";
import { enemyConfigs } from "../data/enemies";
import {
  gongfaConfigs,
  type GongfaConfig,
  type GongfaId,
  type GongfaPattern,
  type GongfaStageState
} from "../data/gongfa";
import { linggenConfigs, rollLinggen, type LinggenConfig, type LinggenId } from "../data/linggen";
import { stageConfigs, type StageId } from "../data/stages";
import { upgradeConfigs } from "../data/upgrades";
import { waveDurationMs } from "../data/waves";
import { Enemy } from "../entities/Enemy";
import { Lingcao } from "../entities/Lingcao";
import { Player } from "../entities/Player";
import { Projectile } from "../entities/Projectile";
import { XPOrb } from "../entities/XPOrb";
import {
  advanceProgressionUntilChoice,
  getCompatibleUpgradeIdsForGongfa,
  getFirstBreakthroughState,
  getPresentedGongfaIdsForLinggen,
  getStageNarrative
} from "../logic/progression";
import { InputController } from "../systems/InputController";
import { SpawnerSystem } from "../systems/SpawnerSystem";
import type { GameSnapshot } from "../types/gameTest";
import { pickUniqueRandom } from "../utils/random";

interface CombatState extends GongfaStageState {
  pattern: GongfaPattern | "baseline";
  projectileTexture: string;
  tint: number;
}

interface RunState {
  level: number;
  xp: number;
  xpToNext: number;
  kills: number;
  elapsedMs: number;
  paused: boolean;
  gameOver: boolean;
  stage: StageId;
  hiddenLinggen: LinggenConfig;
  revealedLinggen?: LinggenConfig;
  lingcaoCollected: boolean;
  mainGongfaId?: GongfaId;
}

const baselineState: CombatState = {
  pattern: "baseline",
  damage: 9,
  cooldownMs: 1150,
  count: 1,
  pierce: 1,
  projectileSpeed: 360,
  projectileLifetimeMs: 1050,
  spreadDeg: 0,
  auraRadius: 0,
  retaliationDamage: 0,
  range: 0,
  returnShots: 0,
  shellBursts: 0,
  projectileTexture: "qi-bolt",
  tint: 0xb6edff
};

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private orbs!: Phaser.Physics.Arcade.Group;
  private lingcaoGroup!: Phaser.Physics.Arcade.Group;
  private spawner!: SpawnerSystem;
  private combatState: CombatState = { ...baselineState };
  private combatCooldownRemaining = 0;
  private choiceActive = false;
  private currentChoiceTitle?: string;
  private currentChoiceOptions: ChoiceOption[] = [];
  private pendingUpgradeChoice = false;
  private lastMessage?: string;
  private lastAimAngle = 0;
  private runState: RunState = {
    level: 1,
    xp: 0,
    xpToNext: 8,
    kills: 0,
    elapsedMs: 0,
    paused: false,
    gameOver: false,
    stage: "lianqi",
    hiddenLinggen: rollLinggen(),
    lingcaoCollected: false
  };

  constructor() {
    super("game");
  }

  create(): void {
    this.physics.world.setBounds(-2000, -2000, 4000, 4000);
    this.add
      .rectangle(0, 0, 5000, 5000, 0x0c1520, 1)
      .setOrigin(0.5)
      .setDepth(-10);

    this.player = new Player(this, 0, 0);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    this.enemies = this.physics.add.group({ runChildUpdate: false });
    this.projectiles = this.physics.add.group({ runChildUpdate: false });
    this.orbs = this.physics.add.group({ runChildUpdate: false });
    this.lingcaoGroup = this.physics.add.group({ runChildUpdate: false });
    this.inputController = new InputController(this);
    this.spawner = new SpawnerSystem(this, this.enemies);

    this.spawnOpeningLingcao();

    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      (projectileObj, enemyObj) => {
        this.handleProjectileHit(projectileObj as Projectile, enemyObj as Enemy);
      },
      undefined,
      this
    );
    this.physics.add.overlap(this.player, this.orbs, (_playerObj, orbObj) => {
      this.collectOrb(orbObj as XPOrb);
    });
    this.physics.add.overlap(
      this.player,
      this.enemies,
      (_playerObj, enemyObj) => {
        this.handlePlayerContact(enemyObj as Enemy);
      },
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.lingcaoGroup,
      (_playerObj, lingcaoObj) => {
        this.collectLingcao(lingcaoObj as Lingcao);
      },
      undefined,
      this
    );

    this.events.on("resolve-choice", this.resolveChoice, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off("resolve-choice", this.resolveChoice, this);
    });

    this.publishHud("Qi is unstable. Claim the Lingcao and reveal your roots.");
  }

  update(_time: number, delta: number): void {
    if (this.inputController.pausePressed && !this.runState.gameOver && !this.choiceActive) {
      this.togglePause();
    }

    if (this.runState.paused || this.runState.gameOver) {
      this.player.move(new Phaser.Math.Vector2(0, 0));
      return;
    }

    this.runState.elapsedMs += delta;
    this.combatCooldownRemaining -= delta;

    const movement = this.inputController.getMovementVector();
    this.player.move(movement);
    if (movement.lengthSq() > 0) {
      this.lastAimAngle = Phaser.Math.Angle.Between(0, 0, movement.x, movement.y);
    }

    const playerPosition = new Phaser.Math.Vector2(this.player.x, this.player.y);
    this.spawner.update(delta, playerPosition);

    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      enemy.chase(playerPosition);
    });

    this.pullNearbyOrbs();

    if (this.combatCooldownRemaining <= 0) {
      this.fireCurrentMethod();
      this.combatCooldownRemaining = this.combatState.cooldownMs;
    }

    if (this.runState.elapsedMs >= waveDurationMs) {
      this.runState.gameOver = true;
      this.setPausedState(true);
      this.publishHud("Tribulation survived. Outer sect awaits.");
      return;
    }

    this.publishHud();
  }

  private spawnOpeningLingcao(): void {
    const lingcao = new Lingcao(this, 260, -140);
    this.lingcaoGroup.add(lingcao);
    this.add
      .text(lingcao.x, lingcao.y - 28, "Lingcao", {
        fontFamily: "Trebuchet MS, Noto Sans SC, sans-serif",
        fontSize: "14px",
        color: "#9fe38c"
      })
      .setOrigin(0.5)
      .setDepth(12);
  }

  private handleProjectileHit(projectile: Projectile, enemy: Enemy): void {
    const died = enemy.receiveDamage(projectile.damage);
    projectile.pierceRemaining -= 1;

    if (projectile.pierceRemaining <= 0) {
      projectile.destroy();
    }

    if (!died) {
      return;
    }

    this.spawnOrb(enemy.x, enemy.y, enemy.config.xpDrop);
    enemy.destroy();
    this.runState.kills += 1;
  }

  private collectOrb(orb: XPOrb): void {
    this.runState.xp += orb.xpValue;
    orb.destroy();
    this.processProgressionChoices();
    this.publishHud();
  }

  private collectLingcao(lingcao: Lingcao): void {
    const breakthroughState = getFirstBreakthroughState({
      lingcaoCollected: this.runState.lingcaoCollected,
      linggenRevealed: Boolean(this.runState.revealedLinggen)
    });
    if (!breakthroughState.canReveal && this.runState.lingcaoCollected) {
      return;
    }

    this.runState.lingcaoCollected = true;
    lingcao.destroy();
    this.lastMessage = `${this.runState.hiddenLinggen.name} stirs within your meridians.`;
    const nextState = getFirstBreakthroughState({
      lingcaoCollected: this.runState.lingcaoCollected,
      linggenRevealed: Boolean(this.runState.revealedLinggen)
    });
    if (nextState.canReveal) {
      this.offerGongfaChoice();
    }
  }

  private handlePlayerContact(enemy: Enemy): void {
    const now = this.time.now;

    if (enemy.contactCooldownUntil > now) {
      return;
    }

    enemy.contactCooldownUntil = now + 750;
    this.player.applyDamage(enemy.config.touchDamage);

    if (this.combatState.pattern === "aura" && this.combatState.retaliationDamage > 0) {
      this.emitAuraBurst(this.combatState.retaliationDamage, Math.max(4, Math.floor(this.combatState.count / 2)));
    }

    if (this.player.stats.health <= 0) {
      this.runState.gameOver = true;
      this.setPausedState(true);
      this.publishHud("Cultivator fell. Qi scattered.");
      return;
    }

    this.publishHud();
  }

  private spawnOrb(x: number, y: number, xpValue: number): void {
    const orb = new XPOrb(this, x, y, xpValue);
    this.orbs.add(orb);
  }

  private pullNearbyOrbs(): void {
    this.orbs.getChildren().forEach((child) => {
      const orb = child as XPOrb;
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        orb.x,
        orb.y
      );

      if (distance <= this.player.stats.magnetRadius) {
        this.physics.moveToObject(orb, this.player, 280);
      }
    });
  }

  private fireCurrentMethod(): void {
    switch (this.combatState.pattern) {
      case "baseline":
      case "homing":
        this.fireHomingVolley();
        break;
      case "wave":
        this.fireWaveVolley();
        break;
      case "aura":
        this.emitAuraBurst(this.combatState.damage, this.combatState.count);
        break;
    }
  }

  private fireHomingVolley(): void {
    const targets = this.getNearestEnemies(this.combatState.count);
    if (targets.length === 0) {
      return;
    }

    targets.forEach((enemy, index) => {
      this.spawnProjectileAtTarget(
        this.player.x,
        this.player.y - 10 + index * 4,
        enemy,
        this.combatState.damage,
        this.combatState.pierce,
        this.combatState.projectileSpeed,
        this.combatState.projectileLifetimeMs,
        this.combatState.projectileTexture,
        this.combatState.tint
      );
    });

    for (let i = 0; i < this.combatState.returnShots; i += 1) {
      targets.forEach((enemy, index) => {
        this.time.delayedCall(140 + i * 90, () => {
          if (!enemy.active || !this.player.active) {
            return;
          }

          this.spawnProjectileAtTarget(
            this.player.x,
            this.player.y + 12 + index * 5,
            enemy,
            Math.floor(this.combatState.damage * 0.65),
            this.combatState.pierce,
            this.combatState.projectileSpeed + 40,
            this.combatState.projectileLifetimeMs,
            this.combatState.projectileTexture,
            this.combatState.tint
          );
        });
      });
    }
  }

  private fireWaveVolley(): void {
    const angle = this.getAimAngle();
    const count = Math.max(1, this.combatState.count);
    const spreadRad = Phaser.Math.DegToRad(this.combatState.spreadDeg);

    for (let i = 0; i < count; i += 1) {
      const offset = count === 1 ? 0 : Phaser.Math.Linear(-spreadRad / 2, spreadRad / 2, i / (count - 1));
      this.spawnWaveProjectile(
        this.player.x,
        this.player.y,
        angle + offset,
        this.combatState.damage,
        this.combatState.pierce,
        this.combatState.projectileSpeed,
        this.combatState.projectileLifetimeMs,
        1.05
      );
    }

    for (let trail = 0; trail < this.combatState.returnShots; trail += 1) {
      this.time.delayedCall(110 + trail * 90, () => {
        if (!this.player.active) {
          return;
        }

        const delayedAngle = this.getAimAngle();
        for (let i = 0; i < count; i += 1) {
          const offset =
            count === 1
              ? 0
              : Phaser.Math.Linear(-spreadRad / 2, spreadRad / 2, i / (count - 1));
          this.spawnWaveProjectile(
            this.player.x + Math.cos(delayedAngle) * (28 + trail * 16),
            this.player.y + Math.sin(delayedAngle) * (28 + trail * 16),
            delayedAngle + offset,
            Math.floor(this.combatState.damage * 0.55),
            this.combatState.pierce,
            this.combatState.projectileSpeed + 30,
            Math.max(420, this.combatState.projectileLifetimeMs - 180),
            0.85
          );
        }
      });
    }
  }

  private spawnWaveProjectile(
    x: number,
    y: number,
    angle: number,
    damage: number,
    pierce: number,
    speed: number,
    lifetimeMs: number,
    scale: number
  ): void {
    const projectile = new Projectile(this, x, y, this.combatState.projectileTexture);
    projectile.damage = damage;
    projectile.pierceRemaining = pierce;
    projectile.setTint(this.combatState.tint);
    projectile.setAngle(Phaser.Math.RadToDeg(angle));
    projectile.setScale(scale, Math.max(0.72, scale - 0.15));
    this.projectiles.add(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.time.delayedCall(lifetimeMs, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });
  }

  private emitAuraBurst(damage: number, count: number): void {
    const projectileCount = Math.max(4, count);
    for (let i = 0; i < projectileCount; i += 1) {
      const angle = (Math.PI * 2 * i) / projectileCount;
      const projectile = new Projectile(
        this,
        this.player.x + Math.cos(angle) * 10,
        this.player.y + Math.sin(angle) * 10,
        this.combatState.projectileTexture
      );
      projectile.damage = damage;
      projectile.pierceRemaining = this.combatState.pierce;
      projectile.setTint(this.combatState.tint);
      projectile.setScale(0.85);
      this.projectiles.add(projectile);
      const body = projectile.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        Math.cos(angle) * this.combatState.projectileSpeed,
        Math.sin(angle) * this.combatState.projectileSpeed
      );
      this.time.delayedCall(this.combatState.projectileLifetimeMs, () => {
        if (projectile.active) {
          projectile.destroy();
        }
      });
    }

    for (let burst = 0; burst < this.combatState.shellBursts; burst += 1) {
      this.time.delayedCall(150 + burst * 110, () => {
        if (!this.player.active) {
          return;
        }

        this.emitAuraShell(
          Math.floor(damage * 0.75),
          projectileCount + 2 + burst * 2,
          1 + burst * 0.18
        );
      });
    }
  }

  private emitAuraShell(damage: number, count: number, scale: number): void {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const projectile = new Projectile(
        this,
        this.player.x + Math.cos(angle) * 16,
        this.player.y + Math.sin(angle) * 16,
        this.combatState.projectileTexture
      );
      projectile.damage = damage;
      projectile.pierceRemaining = this.combatState.pierce + 1;
      projectile.setTint(this.combatState.tint);
      projectile.setScale(Math.max(0.95, scale));
      this.projectiles.add(projectile);
      const body = projectile.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        Math.cos(angle) * (this.combatState.projectileSpeed + 55),
        Math.sin(angle) * (this.combatState.projectileSpeed + 55)
      );
      this.time.delayedCall(this.combatState.projectileLifetimeMs + 120, () => {
        if (projectile.active) {
          projectile.destroy();
        }
      });
    }
  }

  private spawnProjectileAtTarget(
    x: number,
    y: number,
    enemy: Enemy,
    damage: number,
    pierce: number,
    speed: number,
    lifetimeMs: number,
    texture: string,
    tint: number
  ): void {
    const projectile = new Projectile(this, x, y, texture);
    projectile.damage = damage;
    projectile.pierceRemaining = pierce;
    projectile.setTint(tint);
    projectile.setAngle(
      Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y))
    );
    this.projectiles.add(projectile);
    this.physics.moveToObject(projectile, enemy, speed);
    this.time.delayedCall(lifetimeMs, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });
  }

  private getAimAngle(): number {
    const nearestEnemy = this.getNearestEnemies(1)[0];
    if (nearestEnemy) {
      return Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        nearestEnemy.x,
        nearestEnemy.y
      );
    }

    return this.lastAimAngle;
  }

  private getNearestEnemies(count: number): Enemy[] {
    const enemies = this.enemies.getChildren() as Enemy[];
    return enemies
      .filter((enemy) => enemy.active)
      .sort((a, b) => {
        const distanceA = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
        const distanceB = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
        return distanceA - distanceB;
      })
      .slice(0, count);
  }

  private offerGongfaChoice(): void {
    const linggen = this.runState.hiddenLinggen;
    const selectedIds = getPresentedGongfaIdsForLinggen(linggen.id);
    const options: ChoiceOption[] = selectedIds.map((id) => {
      const gongfa = gongfaConfigs[id];
      return {
        id: gongfa.id,
        kind: "gongfa",
        title: gongfa.name,
        description: gongfa.lore
      };
    });

    this.choiceActive = true;
    this.currentChoiceTitle = `${linggen.name} Revealed`;
    this.currentChoiceOptions = options;
    this.setPausedState(true);
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: linggen.lore,
      options
    });
    this.publishHud(this.lastMessage);
  }

  private offerUpgradeChoice(): void {
    const currentGongfaId = this.runState.mainGongfaId;
    if (!currentGongfaId) {
      return;
    }

    const allowedIds = new Set(getCompatibleUpgradeIdsForGongfa(currentGongfaId));
    const compatibleUpgrades = upgradeConfigs.filter((upgrade) => allowedIds.has(upgrade.id));
    const options = pickUniqueRandom(compatibleUpgrades, 3).map<ChoiceOption>((upgrade) => ({
      id: upgrade.id,
      kind: "upgrade",
      title: upgrade.name,
      description: upgrade.lore
    }));

    this.choiceActive = true;
    this.currentChoiceTitle = `${stageConfigs[this.runState.stage].name} Refinement`;
    this.currentChoiceOptions = options;
    this.setPausedState(true);
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: "Choose a refinement for your current method.",
      options
    });
    this.publishHud(this.lastMessage);
  }

  private offerStageBreakthrough(stageId: StageId, gongfaId: GongfaId): void {
    const narrative = getStageNarrative(gongfaId, stageId);
    const transitionLabel =
      narrative.transitionKind === "transform" ? "Major Breakthrough" : "Breakthrough";
    const options: ChoiceOption[] = [
      {
        id: `${stageId}-continue`,
        kind: "continue",
        title: `Enter ${stageConfigs[stageId].name}`,
        description: narrative.signatureChange
      }
    ];

    this.choiceActive = true;
    this.currentChoiceTitle = `${stageConfigs[stageId].name} ${transitionLabel}`;
    this.currentChoiceOptions = options;
    this.setPausedState(true);
    this.scene.get("ui").events.emit("show-choice-panel", {
      title: this.currentChoiceTitle,
      subtitle: `${stageConfigs[stageId].message} ${narrative.signatureChange}.`,
      options
    });
    this.publishHud(this.lastMessage);
  }

  private resolveChoice(option: ChoiceOption): void {
    if (option.kind === "gongfa") {
      this.applyGongfaChoice(option.id as keyof typeof gongfaConfigs);
    } else if (option.kind === "upgrade") {
      this.applyUpgradeChoice(option.id);
    }

    this.choiceActive = false;
    this.currentChoiceTitle = undefined;
    this.currentChoiceOptions = [];
    this.setPausedState(false);
    this.scene.get("ui").events.emit("hide-choice-panel");
    this.publishHud(this.lastMessage);

    if (option.kind === "continue" && this.pendingUpgradeChoice) {
      this.pendingUpgradeChoice = false;
      this.offerUpgradeChoice();
      return;
    }

    this.processProgressionChoices();
  }

  private applyGongfaChoice(gongfaId: keyof typeof gongfaConfigs): void {
    this.runState.revealedLinggen = this.runState.hiddenLinggen;
    this.runState.mainGongfaId = gongfaId;
    this.applyGongfaStage();
    this.lastMessage = `${gongfaConfigs[gongfaId].name} circulates through your meridians.`;
  }

  private applyUpgradeChoice(upgradeId: string): void {
    const upgrade = upgradeConfigs.find((item) => item.id === upgradeId);
    if (!upgrade) {
      return;
    }

    switch (upgrade.effect) {
      case "methodDamage":
        this.combatState.damage += upgrade.value;
        break;
      case "methodCooldown":
        this.combatState.cooldownMs = Math.max(
          180,
          Math.floor(this.combatState.cooldownMs * upgrade.value)
        );
        break;
      case "methodCount":
        this.combatState.count += upgrade.value;
        break;
      case "methodPierce":
        this.combatState.pierce += upgrade.value;
        break;
      case "methodRange":
        this.combatState.range += upgrade.value;
        this.combatState.auraRadius += upgrade.value;
        break;
      case "retaliationDamage":
        this.combatState.retaliationDamage += upgrade.value;
        break;
      case "moveSpeed":
        this.player.stats.moveSpeed += upgrade.value;
        break;
      case "maxHealth":
        this.player.stats.maxHealth += upgrade.value;
        this.player.heal(upgrade.value);
        break;
      case "heal":
        this.player.heal(upgrade.value);
        break;
      case "magnet":
        this.player.stats.magnetRadius += upgrade.value;
        break;
    }

    this.lastMessage = `${upgrade.name} refined.`;
  }

  private applyGongfaStage(): void {
    const gongfaId = this.runState.mainGongfaId;
    if (!gongfaId) {
      return;
    }

    const gongfa = gongfaConfigs[gongfaId as keyof typeof gongfaConfigs];
    const stageState = gongfa.stages[this.runState.stage];
    this.combatState = this.buildCombatState(gongfa, stageState);
  }

  private buildCombatState(
    gongfa: GongfaConfig,
    stageState: GongfaStageState
  ): CombatState {
    const efficiency = this.runState.hiddenLinggen.efficiency;
    return {
      ...stageState,
      pattern: gongfa.pattern,
      projectileTexture: gongfa.projectileTexture,
      tint: gongfa.tint,
      damage: Math.round(stageState.damage * efficiency),
      cooldownMs: Math.max(220, Math.floor(stageState.cooldownMs / efficiency))
    };
  }

  private togglePause(): void {
    this.setPausedState(!this.runState.paused);
    this.publishHud(this.runState.paused ? "Meditation pause." : undefined);
  }

  private setPausedState(paused: boolean): void {
    this.runState.paused = paused;
    this.physics.world.isPaused = paused;

    if (paused) {
      this.player.move(new Phaser.Math.Vector2(0, 0));
    }
  }

  private publishHud(message?: string): void {
    this.registry.set("hud", {
      health: this.player?.stats.health ?? 100,
      maxHealth: this.player?.stats.maxHealth ?? 100,
      level: this.runState.level,
      xp: this.runState.xp,
      xpToNext: this.runState.xpToNext,
      kills: this.runState.kills,
      elapsedMs: this.runState.elapsedMs,
      remainingMs: Math.max(0, waveDurationMs - this.runState.elapsedMs),
      paused: this.runState.paused,
      gameOver: this.runState.gameOver,
      stageName: stageConfigs[this.runState.stage].name,
      linggenName: this.runState.revealedLinggen?.name ?? "Unrevealed",
      gongfaName:
        this.runState.mainGongfaId
          ? gongfaConfigs[this.runState.mainGongfaId as keyof typeof gongfaConfigs].name
          : "Crude Qi Thread",
      methodDamage: this.combatState.damage,
      methodCount: this.combatState.count,
      methodCooldownMs: this.combatState.cooldownMs,
      moveSpeed: this.player?.stats.moveSpeed ?? 0,
      enemyKinds: Object.keys(enemyConfigs).length,
      enemyCount: this.enemies?.countActive(true) ?? 0,
      orbCount: this.orbs?.countActive(true) ?? 0,
      lingcaoCollected: this.runState.lingcaoCollected,
      message: message ?? this.lastMessage
    });
  }

  getTestSnapshot(): GameSnapshot {
    return {
      sceneName: this.scene.key,
      activeScenes: this.scene.manager.getScenes(true).map((scene) => scene.scene.key),
      player: {
        x: this.player.x,
        y: this.player.y,
        health: this.player.stats.health,
        maxHealth: this.player.stats.maxHealth,
        moveSpeed: this.player.stats.moveSpeed
      },
      progression: {
        level: this.runState.level,
        xp: this.runState.xp,
        xpToNext: this.runState.xpToNext,
        stage: this.runState.stage,
        linggen: this.runState.revealedLinggen?.id ?? "unrevealed",
        gongfa: this.runState.mainGongfaId ?? "baseline",
        lingcaoCollected: this.runState.lingcaoCollected
      },
      combat: {
        pattern: this.combatState.pattern,
        damage: this.combatState.damage,
        count: this.combatState.count,
        cooldownMs: this.combatState.cooldownMs,
        pierce: this.combatState.pierce,
        range: this.combatState.range,
        auraRadius: this.combatState.auraRadius,
        retaliationDamage: this.combatState.retaliationDamage,
        returnShots: this.combatState.returnShots,
        shellBursts: this.combatState.shellBursts
      },
      counts: {
        enemies: this.enemies.countActive(true),
        orbs: this.orbs.countActive(true)
      },
      choice: this.choiceActive && this.currentChoiceTitle
        ? {
            title: this.currentChoiceTitle,
            options: this.currentChoiceOptions
          }
        : undefined
    };
  }

  forceSpawnEnemies(count: number): void {
    const ids = ["jade-rat", "mist-wolf", "bone-crow"] as const;
    for (let i = 0; i < count; i += 1) {
      const enemyId = ids[i % ids.length];
      this.spawner.spawnManual(enemyId, this.player.x + 120 + i * 18, this.player.y + 24);
    }
    this.publishHud(this.lastMessage);
  }

  forceGainXp(amount: number): void {
    this.runState.xp += amount;
    this.processProgressionChoices();
    this.publishHud(this.lastMessage);
  }

  forceSelectChoice(index: number): void {
    if (!this.choiceActive || index < 0 || index >= this.currentChoiceOptions.length) {
      return;
    }
    this.resolveChoice(this.currentChoiceOptions[index]);
  }

  forceClaimLingcao(): void {
    const lingcao = this.lingcaoGroup.getChildren()[0] as Lingcao | undefined;
    if (lingcao?.active) {
      this.collectLingcao(lingcao);
    }
  }

  forceSetLinggen(id: LinggenId): void {
    if (this.runState.revealedLinggen) {
      return;
    }

    this.runState.hiddenLinggen = linggenConfigs[id];
    this.publishHud(this.lastMessage);
  }

  private processProgressionChoices(): void {
    if (this.choiceActive) {
      return;
    }

    const result = advanceProgressionUntilChoice({
      level: this.runState.level,
      xp: this.runState.xp,
      xpToNext: this.runState.xpToNext,
      stage: this.runState.stage,
      mainGongfaId: this.runState.mainGongfaId
    });

    this.runState.level = result.level;
    this.runState.xp = result.xp;
    this.runState.xpToNext = result.xpToNext;

    if (result.stage !== this.runState.stage) {
      this.runState.stage = result.stage;
      this.applyGongfaStage();
      this.lastMessage = stageConfigs[result.stage].message;
    }

    if (!result.pendingChoice) {
      return;
    }

    if (result.pendingChoice.kind === "stage-breakthrough") {
      this.pendingUpgradeChoice = result.pendingUpgradeChoice;
      this.offerStageBreakthrough(
        result.pendingChoice.stageId,
        result.pendingChoice.gongfaId
      );
      return;
    }

    this.offerUpgradeChoice();
  }
}
