import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { UIScene } from "./scenes/UIScene";
import type { GameTestHarness } from "./types/gameTest";
import type { SpiritTreasureId } from "./data/spiritTreasures";
import type { EnemyId } from "./data/enemies";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

function attachGameTestHarness(game: Phaser.Game): void {
  if (import.meta.env.PROD || typeof window === "undefined") {
    return;
  }

  game.events.once("ui-scene-ready", () => {
    const getGameScene = (): GameScene => game.scene.getScene("game") as GameScene;
    const getUiScene = (): UIScene => game.scene.getScene("ui") as UIScene;
    const harness: GameTestHarness = {
      getSnapshot: () => getGameScene().getTestSnapshot(),
      getUiSnapshot: () => getUiScene().getTestSnapshot(),
      forceSpawnEnemies: (count) => getGameScene().forceSpawnEnemies(count),
      forceSpawnEnemy: (enemyId: EnemyId) => getGameScene().forceSpawnEnemy(enemyId),
      selectChoice: (index) => getGameScene().forceSelectChoice(index),
      forceDamagePlayer: (amount: number) => getGameScene().forceDamagePlayer(amount),
      forceDamageEnemy: (enemyId: EnemyId, amount: number) =>
        getGameScene().forceDamageEnemy(enemyId, amount),
      forceClearEnemies: () => getGameScene().forceClearEnemies(),
      forceSpawnQiOrb: (qiValue: number) => getGameScene().forceSpawnQiOrb(qiValue),
      forceSpawnSpiritTreasure: (treasureId: string) =>
        getGameScene().forceSpawnSpiritTreasure(treasureId as SpiritTreasureId),
      forceClaimLingcao: () => getGameScene().forceClaimLingcao(),
      forceSpawnHealingPill: (healAmount = 30) => getGameScene().forceSpawnHealingPill(healAmount),
      forceSpawnPickupShowcase: () => getGameScene().forceSpawnPickupShowcase(),
      forceAdvanceSpawnClock: (deltaMs: number) => getGameScene().forceAdvanceSpawnClock(deltaMs)
    };

    window.__gameTest = harness;
  });
}

export function createGame(parent: HTMLElement): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#071018",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, GameScene, UIScene]
  });

  attachGameTestHarness(game);
  return game;
}
