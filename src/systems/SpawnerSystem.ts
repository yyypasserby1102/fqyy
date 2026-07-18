import Phaser from "phaser";
import { enemyConfigs, type EnemyId } from "../data/enemies";
import { stageWaveSpawns } from "../data/waves";
import type { StageId } from "../data/stages";
import { Enemy, type EnemyPresentationOptions } from "../entities/Enemy";
import type { EncounterPressure } from "../logic/encounterPressure";
import { pickRandom, randomFloat, randomInt } from "../utils/random";

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
  private spawnIndex = 0;

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
    pressure: EncounterPressure,
    allowWaveEscalation = true
  ): void {
    this.advanceClock(deltaMs, playerPosition, stage, pressure, allowWaveEscalation);
  }

  advanceClock(
    deltaMs: number,
    playerPosition: Phaser.Math.Vector2,
    stage: StageId,
    pressure: EncounterPressure,
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
    this.currentPool = pressure.composition;

    if (this.accumulator < this.currentInterval * pressure.spawnIntervalScale) {
      return;
    }

    this.accumulator = 0;

    // Soft concurrency cap: stop adding pressure once the arena is full, so a
    // low-DPS early build is not snowballed to death by unbounded accumulation.
    if (this.group.countActive(true) >= pressure.concurrentEnemyBudget) {
      return;
    }

    const spawnAmount = Math.min(
      this.currentAmount + pressure.spawnAmountBonus,
      pressure.concurrentEnemyBudget - this.group.countActive(true)
    );
    for (let i = 0; i < spawnAmount; i += 1) {
      const enemyId = pickRandom(this.currentPool);
      const config = enemyConfigs[enemyId];
      const spawnPoint = this.getSpawnPoint(playerPosition, pressure.geometry, i, spawnAmount);
      const enemy = new Enemy(this.scene, spawnPoint.x, spawnPoint.y, config, pressure);
      this.group.add(enemy);
      this.onSpawn?.(enemy);
    }
  }

  spawnManual(
    enemyId: EnemyId,
    x: number,
    y: number,
    pressure?: EncounterPressure,
    presentation?: EnemyPresentationOptions
  ): Enemy {
    const config = enemyConfigs[enemyId];
    const enemy = new Enemy(this.scene, x, y, config, pressure, presentation);
    this.group.add(enemy);
    this.onSpawn?.(enemy);
    return enemy;
  }

  private getSpawnPoint(
    playerPosition: Phaser.Math.Vector2,
    geometry: EncounterPressure["geometry"],
    batchIndex: number,
    batchSize: number
  ): Phaser.Math.Vector2 {
    const anchor = randomFloat() * Math.PI * 2;
    const sequence = this.spawnIndex++;
    const angle =
      geometry === "ring"
        ? anchor
        : geometry === "pincer"
          ? anchor + (batchIndex % 2) * Math.PI
          : geometry === "flank"
            ? anchor + (batchIndex % 3) * ((Math.PI * 2) / 3)
            : anchor + ((sequence + batchIndex) % Math.max(4, batchSize)) * ((Math.PI * 2) / Math.max(4, batchSize));
    const [minimumRadius, maximumRadius] = geometry === "converge"
      ? [190, 270]
      : geometry === "flank"
        ? [260, 350]
        : geometry === "pincer"
          ? [310, 400]
          : [360, 460];
    const radius = randomInt(minimumRadius, maximumRadius);
    return new Phaser.Math.Vector2(
      playerPosition.x + Math.cos(angle) * radius,
      playerPosition.y + Math.sin(angle) * radius
    );
  }
}
