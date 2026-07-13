import Phaser from "phaser";
import { createGrayboxTextures } from "../utils/textureFactory";
import {
  createCultivatorAnimations,
  preloadCultivatorVisuals
} from "../visual/cultivatorVisuals";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload(): void {
    preloadCultivatorVisuals(this);
  }

  create(): void {
    createGrayboxTextures(this);
    createCultivatorAnimations(this);
    this.scene.start("game");
    this.scene.start("ui");
  }
}
