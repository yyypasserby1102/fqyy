import type { ChoiceOption } from "../data/choices";
import type { LinggenId } from "../data/linggen";

export interface GameSnapshot {
  sceneName: string;
  activeScenes: string[];
  player: {
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    moveSpeed: number;
  };
  progression: {
    level: number;
    xp: number;
    xpToNext: number;
    stage: string;
    linggen: string;
    gongfa: string;
    lingcaoCollected: boolean;
  };
  combat: {
    pattern: string;
    damage: number;
    count: number;
    cooldownMs: number;
    pierce: number;
    range: number;
    auraRadius: number;
    retaliationDamage: number;
    returnShots: number;
    shellBursts: number;
  };
  counts: {
    enemies: number;
    orbs: number;
  };
  choice?: {
    title: string;
    options: ChoiceOption[];
  };
}

export interface GameTestHarness {
  getSnapshot(): GameSnapshot;
  forceSpawnEnemies(count: number): void;
  forceGainXp(amount: number): void;
  selectChoice(index: number): void;
  setRngSeed(seed: number): void;
  forceClaimLingcao(): void;
  forceSetLinggen(id: LinggenId): void;
}
