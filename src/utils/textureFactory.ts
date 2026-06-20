import Phaser from "phaser";

export const textureSpecs = {
  "player-cultivator": { width: 32, height: 32 },
  "flying-sword": { width: 32, height: 32 },
  "qi-bolt": { width: 28, height: 20 },
  "metal-wave": { width: 56, height: 24 },
  "aura-blade": { width: 14, height: 16 },
  "xp-orb": { width: 16, height: 16 },
  lingcao: { width: 32, height: 32 },
  "enemy-rat": { width: 28, height: 28 },
  "enemy-wolf": { width: 36, height: 22 },
  "enemy-crow": { width: 36, height: 18 },
  panel: { width: 360, height: 200 }
} as const;

export function createGrayboxTextures(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();

  graphics.fillStyle(0x9bd3ff);
  graphics.fillCircle(16, 16, 14);
  graphics.generateTexture("player-cultivator", textureSpecs["player-cultivator"].width, textureSpecs["player-cultivator"].height);
  graphics.clear();

  graphics.fillStyle(0x77ffcc);
  graphics.fillTriangle(4, 16, 28, 10, 28, 22);
  graphics.generateTexture("flying-sword", textureSpecs["flying-sword"].width, textureSpecs["flying-sword"].height);
  graphics.clear();

  graphics.fillStyle(0xa8ecff);
  graphics.fillCircle(10, 10, 8);
  graphics.fillStyle(0xe6fbff);
  graphics.fillCircle(18, 10, 5);
  graphics.generateTexture("qi-bolt", textureSpecs["qi-bolt"].width, textureSpecs["qi-bolt"].height);
  graphics.clear();

  graphics.fillStyle(0xd9f1ff);
  graphics.fillTriangle(2, 12, 26, 2, 26, 22);
  graphics.fillTriangle(30, 12, 54, 2, 54, 22);
  graphics.generateTexture("metal-wave", textureSpecs["metal-wave"].width, textureSpecs["metal-wave"].height);
  graphics.clear();

  graphics.fillStyle(0xd6f3ff);
  graphics.fillTriangle(0, 8, 14, 0, 14, 16);
  graphics.generateTexture("aura-blade", textureSpecs["aura-blade"].width, textureSpecs["aura-blade"].height);
  graphics.clear();

  graphics.fillStyle(0x7df9ff);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture("xp-orb", textureSpecs["xp-orb"].width, textureSpecs["xp-orb"].height);
  graphics.clear();

  graphics.fillStyle(0x4fbf77);
  graphics.fillEllipse(14, 18, 22, 18);
  graphics.fillStyle(0x89e07b);
  graphics.fillEllipse(18, 10, 14, 12);
  graphics.fillStyle(0x8b6c42);
  graphics.fillRect(12, 18, 4, 12);
  graphics.generateTexture("lingcao", textureSpecs.lingcao.width, textureSpecs.lingcao.height);
  graphics.clear();

  graphics.fillStyle(0x6cc17a);
  graphics.fillRoundedRect(0, 4, 28, 20, 7);
  graphics.generateTexture("enemy-rat", textureSpecs["enemy-rat"].width, textureSpecs["enemy-rat"].height);
  graphics.clear();

  graphics.fillStyle(0x99d0ff);
  graphics.fillRoundedRect(0, 0, 36, 22, 7);
  graphics.generateTexture("enemy-wolf", textureSpecs["enemy-wolf"].width, textureSpecs["enemy-wolf"].height);
  graphics.clear();

  graphics.fillStyle(0xe9e1ca);
  graphics.fillTriangle(0, 18, 18, 0, 36, 18);
  graphics.generateTexture("enemy-crow", textureSpecs["enemy-crow"].width, textureSpecs["enemy-crow"].height);
  graphics.clear();

  graphics.fillStyle(0x24313d, 0.9);
  graphics.fillRoundedRect(0, 0, 360, 200, 16);
  graphics.generateTexture("panel", textureSpecs.panel.width, textureSpecs.panel.height);
  graphics.destroy();
}
