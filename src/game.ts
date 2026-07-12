import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { UIScene } from "./scenes/UIScene";
import type { GameTestHarness } from "./types/gameTest";
import type { SpiritTreasureId } from "./data/spiritTreasures";
import type { GongfaId } from "./data/gongfa";
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
    getHudState: () => game.registry.get("hud") as Record<string, unknown>,
    forceSpawnEnemies: (count) => getGameScene().forceSpawnEnemies(count),
    selectChoice: (index) => getGameScene().forceSelectChoice(index),
    setRngSeed: (seed) => setRandomSeed(seed),
    forceDamagePlayer: (amount: number) => getGameScene().forceDamagePlayer(amount),
    forceClearEnemies: () => getGameScene().forceClearEnemies(),
    forceSpawnQiOrb: (qiValue: number) => getGameScene().forceSpawnQiOrb(qiValue),
    forceSpawnSpiritTreasure: (treasureId: string) =>
      getGameScene().forceSpawnSpiritTreasure(treasureId as SpiritTreasureId),
    forceLearnGongfa: (gongfaId: string) =>
      getGameScene().forceLearnGongfa(gongfaId as GongfaId),
    forceClaimLingcao: () => getGameScene().forceClaimLingcao(),
    forceSpawnHealingPill: (healAmount = 30) => getGameScene().forceSpawnHealingPill(healAmount),
    forceAdvanceSpawnClock: (deltaMs: number) => getGameScene().forceAdvanceSpawnClock(deltaMs)
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
