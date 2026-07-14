# Protagonist browser visual review

These captures were produced from the running Chromium game at a 1280 × 720 viewport on 2026-07-13. Each image is a 420 × 310 gameplay crop centered on the player. They are acceptance evidence for [`PLAYER_VISUAL_SPEC.md`](../PLAYER_VISUAL_SPEC.md), not source art.

| State | Browser evidence |
| --- | --- |
| Normal/idle | [`idle.png`](idle.png) |
| East run | [`run-east.png`](run-east.png) |
| Evade | [`evade.png`](evade.png) |
| Basic attack and casting VFX | [`attack.png`](attack.png) |
| Hit recoil and spark | [`hit.png`](hit.png) |
| Skill gather | [`skill-gather.png`](skill-gather.png) |
| Skill release | [`skill-release.png`](skill-release.png) |
| Defeat collapse/fade | [`defeat.png`](defeat.png) |

The capture run used the public `window.__gameTest` browser harness only to select deterministic progression, spawn targets, and apply damage. Movement, Evade, ordinary attacks, Skill 2 timing, hit presentation, and defeat presentation all ran through their production gameplay paths.

Atlas registration was checked separately after chroma removal: all production frames are 256 × 256 RGBA cells; locomotion, action, and hit frames have a common `y = 210` lowest opaque point; only the two lower defeat poses use `y = 218`. No production figure touches a cell edge.

## Enemy and projectile browser review

These captures were produced from the same running Chromium game and public test harness. The roster capture shows all seven production enemy families together at gameplay scale. The remaining captures show enemy feedback plus all four live projectile families and representative matching impacts.

| State | Browser evidence |
| --- | --- |
| Seven-enemy roster | [`enemy-roster.png`](enemy-roster.png) |
| Enemy filled hit flash | [`enemy-hit.png`](enemy-hit.png) |
| Enemy defeat ink | [`enemy-defeat.png`](enemy-defeat.png) |
| Flying-sword travel | [`projectile-flying-sword.png`](projectile-flying-sword.png) |
| Metal-wave travel | [`projectile-metal-wave.png`](projectile-metal-wave.png) |
| Aura-blade travel | [`projectile-aura-blade.png`](projectile-aura-blade.png) |
| Qi-bolt travel | [`projectile-qi-bolt.png`](projectile-qi-bolt.png) |
| Metal-wave impact | [`impact-metal-wave.png`](impact-metal-wave.png) |
| Aura-blade impact | [`impact-aura-blade.png`](impact-aura-blade.png) |

`tests/e2e/combat-visuals.spec.ts` provides deterministic browser proof for all seven enemy texture/animation mappings, hit and defeat state transitions, all four projectile travel families, all four matching impact families, and decoded alpha padding for every frame in all four combat atlases. Source prompts and untouched generations remain beside the normalized exports under `assets/sprites/enemies/raw_ai/` and `assets/sprites/projectiles/raw_ai/`.

## Remaining visual pass review

These full-game captures cover the final pickup, arena, and HUD graybox replacements described in [`REMAINING_VISUAL_SPEC.md`](../REMAINING_VISUAL_SPEC.md). The low-Vitality image is intentionally cropped to the status region so its cinnabar hierarchy can be inspected at native scale.

| State | Browser evidence |
| --- | --- |
| Painted arena, three-region HUD, Qi Orb, Healing Pill, and all six Spirit Treasure colors | [`world-pickups-hud.png`](world-pickups-hud.png) |
| Low-Vitality status treatment | [`hud-low-vitality.png`](hud-low-vitality.png) |
| Four-option Spirit Treasure replacement choice | [`choice-panel.png`](choice-panel.png) |

`tests/e2e/remaining-visuals.spec.ts` checks the production texture and animation mappings, all six stable Treasure tints, collection burst, arena landmarks, HUD regions, four-option choice rendering, per-frame pickup padding, and exact arena-edge continuity. The browser harness only creates deterministic gameplay states; every captured object and panel uses its production rendering path.

## Opening, Lingcao, and realm-atmosphere review

These 1280 × 720 browser captures cover the opening-to-awakening journey and the four stage-specific arena presentations described in [`OPENING_ATMOSPHERE_VISUAL_SPEC.md`](../OPENING_ATMOSPHERE_VISUAL_SPEC.md).

| State | Browser evidence |
| --- | --- |
| Painted title shell | [`title-shell.png`](title-shell.png) |
| Responsive three-candidate selection | [`candidate-selection.png`](candidate-selection.png) |
| Lingcao resonance and world marker | [`lingcao-approach.png`](lingcao-approach.png) |
| First Linggen awakening choice | [`linggen-awakening.png`](linggen-awakening.png) |
| Lianqi mist court | [`arena-lianqi.png`](arena-lianqi.png) |
| Zhuji foundation terrace | [`arena-zhuji.png`](arena-zhuji.png) |
| Jindan golden-core sanctum | [`arena-jindan.png`](arena-jindan.png) |
| Yuanying nascent-sky dais | [`arena-yuanying.png`](arena-yuanying.png) |
| Zhuji Stage Breakthrough banner | [`realm-breakthrough.png`](realm-breakthrough.png) |
| Heavenly Tribulation arrival | [`heavenly-tribulation.png`](heavenly-tribulation.png) |

`tests/e2e/opening-atmosphere.spec.ts` verifies the production opening shell, qualitative candidate information, narrow-viewport layout, Lingcao idle/resonance/collection states, awakening mode, realm variant snapshots, and decoded source padding. The stage captures advance through the real progression choices; the harness is used only to make the run deterministic and accelerate collection.

The transition captures additionally verify the non-blocking UI-scene presentation introduced by [`SENSORY_PERFORMANCE_SPEC.md`](../SENSORY_PERFORMANCE_SPEC.md). The banner continues animating while the gameplay scene or its Gongfa choice is paused; the Heavenly Tribulation warning leaves all three HUD scan regions readable.
