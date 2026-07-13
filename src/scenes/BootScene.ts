import Phaser from "phaser";
import { createGrayboxTextures } from "../utils/textureFactory";
import {
  createCultivatorAnimations,
  preloadCultivatorVisuals
} from "../visual/cultivatorVisuals";
import {
  createCombatAnimations,
  preloadCombatVisuals
} from "../visual/combatVisuals";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload(): void {
    preloadCultivatorVisuals(this);
    preloadCombatVisuals(this);
  }

  create(): void {
    createGrayboxTextures(this);
    createCultivatorAnimations(this);
    createCombatAnimations(this);
    this.scene.start("game");
    this.scene.start("ui");
  }
}
