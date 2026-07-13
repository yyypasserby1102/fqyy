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
