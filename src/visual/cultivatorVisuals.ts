import Phaser from "phaser";
import locomotionUrl from "../../assets/sprites/player/export/player-locomotion.png";
import actionsUrl from "../../assets/sprites/player/export/player-actions.png";
import vfxUrl from "../../assets/sprites/player/export/player-cultivation-vfx.png";

export const CULTIVATOR_TEXTURES = {
  locomotion: "cultivator-locomotion",
  actions: "cultivator-actions",
  vfx: "cultivator-vfx"
} as const;

export const CULTIVATOR_ANIMATIONS = {
  idle: "cultivator-idle",
  runEast: "cultivator-run-east",
  runSouth: "cultivator-run-south",
  runNorth: "cultivator-run-north",
  attack: "cultivator-attack",
  skill: "cultivator-skill",
  evade: "cultivator-evade",
  hit: "cultivator-hit",
  defeat: "cultivator-defeat",
  attackVfx: "cultivator-attack-vfx",
  skillGatherVfx: "cultivator-skill-gather-vfx",
  skillReleaseVfx: "cultivator-skill-release-vfx",
  evadeVfx: "cultivator-evade-vfx",
  hitVfx: "cultivator-hit-vfx"
} as const;

export function preloadCultivatorVisuals(scene: Phaser.Scene): void {
  const sheet = { frameWidth: 256, frameHeight: 256 };
  scene.load.spritesheet(CULTIVATOR_TEXTURES.locomotion, locomotionUrl, sheet);
  scene.load.spritesheet(CULTIVATOR_TEXTURES.actions, actionsUrl, sheet);
  scene.load.spritesheet(CULTIVATOR_TEXTURES.vfx, vfxUrl, sheet);
}

export function createCultivatorAnimations(scene: Phaser.Scene): void {
  const create = (
    key: string,
    texture: string,
    start: number,
    end: number,
    frameRate: number,
    repeat = -1
  ): void => {
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture, { start, end }),
      frameRate,
      repeat
    });
  };

  create(
    CULTIVATOR_ANIMATIONS.idle,
    CULTIVATOR_TEXTURES.locomotion,
    0,
    3,
    1000 / 240
  );
  create(CULTIVATOR_ANIMATIONS.runEast, CULTIVATOR_TEXTURES.locomotion, 4, 7, 11);
  create(CULTIVATOR_ANIMATIONS.runSouth, CULTIVATOR_TEXTURES.locomotion, 8, 11, 11);
  create(CULTIVATOR_ANIMATIONS.runNorth, CULTIVATOR_TEXTURES.locomotion, 12, 15, 11);
  create(CULTIVATOR_ANIMATIONS.attack, CULTIVATOR_TEXTURES.actions, 0, 3, 13, 0);
  create(CULTIVATOR_ANIMATIONS.skill, CULTIVATOR_TEXTURES.actions, 4, 7, 8, 0);
  create(CULTIVATOR_ANIMATIONS.evade, CULTIVATOR_TEXTURES.actions, 8, 11, 20, 0);
  create(CULTIVATOR_ANIMATIONS.hit, CULTIVATOR_TEXTURES.actions, 12, 13, 12, 0);
  create(CULTIVATOR_ANIMATIONS.defeat, CULTIVATOR_TEXTURES.actions, 14, 15, 4, 0);
  create(CULTIVATOR_ANIMATIONS.attackVfx, CULTIVATOR_TEXTURES.vfx, 0, 3, 16, 0);
  create(CULTIVATOR_ANIMATIONS.skillGatherVfx, CULTIVATOR_TEXTURES.vfx, 4, 7, 10, 0);
  create(CULTIVATOR_ANIMATIONS.skillReleaseVfx, CULTIVATOR_TEXTURES.vfx, 8, 11, 12, 0);
  create(CULTIVATOR_ANIMATIONS.evadeVfx, CULTIVATOR_TEXTURES.vfx, 12, 13, 16, 0);
  create(CULTIVATOR_ANIMATIONS.hitVfx, CULTIVATOR_TEXTURES.vfx, 14, 15, 14, 0);
}
