import Phaser from "phaser";
import { enemyConfigs, type EnemyId } from "../data/enemies";
import { stageWaveSpawns } from "../data/waves";
import type { StageId } from "../data/stages";
import { Enemy } from "../entities/Enemy";
import { pickRandom, randomFloat, randomInt } from "../utils/random";

const MAX_CONCURRENT_ENEMIES = 18;

export class SpawnerSystem {
  private readonly scene: Phaser.Scene;
  private readonly group: Phaser.Physics.Arcade.Group;
  private elapsedMs = 0;
  private currentInterval = 1500;
  private currentAmount = 2;
  private currentPool: EnemyId[] = ["jade-rat"];
  private accumulator = 0;
  private currentStage: StageId = "lianqi";
  private readonly onSpawn?: (enemy: Enemy) => void;

  constructor(
    scene: Phaser.Scene,
    group: Phaser.Physics.Arcade.Group,
    onSpawn?: (enemy: Enemy) => void
  ) {
    this.scene = scene;
    this.group = group;
    this.onSpawn = onSpawn;
  }

  update(
    deltaMs: number,
    playerPosition: Phaser.Math.Vector2,
    stage: StageId,
    allowWaveEscalation = true
  ): void {
    this.advanceClock(deltaMs, playerPosition, stage, allowWaveEscalation);
  }

  advanceClock(
    deltaMs: number,
    playerPosition: Phaser.Math.Vector2,
    stage: StageId,
    allowWaveEscalation: boolean
  ): void {
    if (stage !== this.currentStage) {
      this.currentStage = stage;
      this.elapsedMs = 0;
      this.accumulator = 0;
      const waves = stageWaveSpawns[stage];
      const firstWave = waves[0];
      this.currentPool = firstWave.pool;
      this.currentInterval = firstWave.intervalMs;
      this.currentAmount = firstWave.amount;
    }

    this.elapsedMs += deltaMs;
    this.accumulator += deltaMs;

    if (allowWaveEscalation) {
      for (const wave of stageWaveSpawns[stage]) {
        if (this.elapsedMs >= wave.at) {
          this.currentPool = wave.pool;
          this.currentInterval = wave.intervalMs;
          this.currentAmount = wave.amount;
        }
      }
    }

    if (this.accumulator < this.currentInterval) {
      return;
    }

    this.accumulator = 0;

    // Soft concurrency cap: stop adding pressure once the arena is full, so a
    // low-DPS early build is not snowballed to death by unbounded accumulation.
    if (this.group.countActive(true) >= MAX_CONCURRENT_ENEMIES) {
      return;
    }

    for (let i = 0; i < this.currentAmount; i += 1) {
      const enemyId = pickRandom(this.currentPool);
      const config = enemyConfigs[enemyId];
      const spawnPoint = this.getSpawnPoint(playerPosition);
      const enemy = new Enemy(this.scene, spawnPoint.x, spawnPoint.y, config);
      this.group.add(enemy);
      this.onSpawn?.(enemy);
    }
  }

  spawnManual(enemyId: EnemyId, x: number, y: number): Enemy {
    const config = enemyConfigs[enemyId];
    const enemy = new Enemy(this.scene, x, y, config);
    this.group.add(enemy);
    this.onSpawn?.(enemy);
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
