import Phaser from "phaser";
import { enemyConfigs, type EnemyId } from "../data/enemies";
import { waveSpawns } from "../data/waves";
import { Enemy } from "../entities/Enemy";
import { pickRandom, randomFloat, randomInt } from "../utils/random";

export class SpawnerSystem {
  private readonly scene: Phaser.Scene;
  private readonly group: Phaser.Physics.Arcade.Group;
  private elapsedMs = 0;
  private currentInterval = 1500;
  private currentAmount = 2;
  private currentPool: EnemyId[] = ["jade-rat"];
  private accumulator = 0;

  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.group = group;
  }

  update(deltaMs: number, playerPosition: Phaser.Math.Vector2): void {
    this.elapsedMs += deltaMs;
    this.accumulator += deltaMs;

    for (const wave of waveSpawns) {
      if (this.elapsedMs >= wave.at) {
        this.currentPool = wave.pool;
        this.currentInterval = wave.intervalMs;
        this.currentAmount = wave.amount;
      }
    }

    if (this.accumulator < this.currentInterval) {
      return;
    }

    this.accumulator = 0;

    for (let i = 0; i < this.currentAmount; i += 1) {
      const enemyId = pickRandom(this.currentPool);
      const config = enemyConfigs[enemyId];
      const spawnPoint = this.getSpawnPoint(playerPosition);
      const enemy = new Enemy(this.scene, spawnPoint.x, spawnPoint.y, config);
      this.group.add(enemy);
    }
  }

  spawnManual(enemyId: EnemyId, x: number, y: number): Enemy {
    const config = enemyConfigs[enemyId];
    const enemy = new Enemy(this.scene, x, y, config);
    this.group.add(enemy);
    return enemy;
  }

  private getSpawnPoint(playerPosition: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const angle = randomFloat() * Math.PI * 2;
    const radius = randomInt(360, 460);
    return new Phaser.Math.Vector2(
      playerPosition.x + Math.cos(angle) * radius,
      playerPosition.y + Math.sin(angle) * radius
    );
  }
}
