import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { UIScene } from "./scenes/UIScene";
import type { LinggenId } from "./data/linggen";
import type { GameTestHarness } from "./types/gameTest";
import { setRandomSeed } from "./utils/random";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

function attachGameTestHarness(game: Phaser.Game): void {
  if (import.meta.env.PROD || typeof window === "undefined") {
    return;
  }

  const getGameScene = (): GameScene => game.scene.getScene("game") as GameScene;
  const harness: GameTestHarness = {
    getSnapshot: () => getGameScene().getTestSnapshot(),
    forceSpawnEnemies: (count) => getGameScene().forceSpawnEnemies(count),
    forceGainXp: (amount) => getGameScene().forceGainXp(amount),
    selectChoice: (index) => getGameScene().forceSelectChoice(index),
    setRngSeed: (seed) => setRandomSeed(seed),
    forceClaimLingcao: () => getGameScene().forceClaimLingcao(),
    forceSetLinggen: (id: LinggenId) => getGameScene().forceSetLinggen(id)
  };

  window.__gameTest = harness;
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
