import Phaser from "phaser";

export const textureSpecs = {
  "player-cultivator": { width: 32, height: 32 },
  "flying-sword": { width: 32, height: 32 },
  "qi-bolt": { width: 28, height: 20 },
  "metal-wave": { width: 56, height: 24 },
  "aura-blade": { width: 14, height: 16 },
  "qi-orb": { width: 16, height: 16 },
  lingcao: { width: 32, height: 32 },
  "enemy-rat": { width: 28, height: 28 },
  "enemy-wolf": { width: 36, height: 22 },
  "enemy-crow": { width: 36, height: 18 },
  "enemy-cultivator": { width: 34, height: 30 },
  "enemy-spirit": { width: 30, height: 30 },
  "enemy-construct": { width: 34, height: 34 },
  "enemy-shade": { width: 34, height: 34 },
  "healing-pill": { width: 20, height: 20 },
  "spirit-treasure": { width: 18, height: 18 },
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
  graphics.generateTexture("qi-orb", textureSpecs["qi-orb"].width, textureSpecs["qi-orb"].height);
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

  graphics.fillStyle(0x9f8b7a);
  graphics.fillRoundedRect(3, 3, 28, 24, 5);
  graphics.fillStyle(0x5b4d46);
  graphics.fillRect(11, 0, 12, 30);
  graphics.generateTexture("enemy-cultivator", textureSpecs["enemy-cultivator"].width, textureSpecs["enemy-cultivator"].height);
  graphics.clear();

  graphics.fillStyle(0xbe8cff, 0.95);
  graphics.fillCircle(15, 15, 13);
  graphics.fillStyle(0xf1dbff, 0.55);
  graphics.fillTriangle(6, 16, 15, 2, 24, 16);
  graphics.generateTexture("enemy-spirit", textureSpecs["enemy-spirit"].width, textureSpecs["enemy-spirit"].height);
  graphics.clear();

  graphics.fillStyle(0x9cdfff, 0.95);
  graphics.fillRoundedRect(4, 4, 26, 26, 7);
  graphics.fillStyle(0xe9f8ff, 0.75);
  graphics.fillCircle(17, 17, 7);
  graphics.generateTexture("enemy-construct", textureSpecs["enemy-construct"].width, textureSpecs["enemy-construct"].height);
  graphics.clear();

  graphics.fillStyle(0xf0d3ff, 0.94);
  graphics.fillTriangle(16, 0, 33, 18, 16, 34);
  graphics.fillTriangle(18, 0, 0, 18, 18, 34);
  graphics.generateTexture("enemy-shade", textureSpecs["enemy-shade"].width, textureSpecs["enemy-shade"].height);
  graphics.clear();

  graphics.fillStyle(0xff9ccf);
  graphics.fillEllipse(10, 9, 12, 16);
  graphics.fillStyle(0xfff3f8);
  graphics.fillRect(8, 6, 4, 8);
  graphics.generateTexture("healing-pill", textureSpecs["healing-pill"].width, textureSpecs["healing-pill"].height);
  graphics.clear();

  graphics.fillStyle(0xffe08a);
  graphics.fillTriangle(9, 0, 18, 9, 0, 9);
  graphics.fillTriangle(0, 9, 18, 9, 9, 18);
  graphics.fillStyle(0xfff6d8);
  graphics.fillRect(7, 6, 4, 6);
  graphics.generateTexture("spirit-treasure", textureSpecs["spirit-treasure"].width, textureSpecs["spirit-treasure"].height);
  graphics.clear();

  graphics.fillStyle(0x24313d, 0.9);
  graphics.fillRoundedRect(0, 0, 360, 200, 16);
  graphics.generateTexture("panel", textureSpecs.panel.width, textureSpecs.panel.height);
  graphics.destroy();
}
