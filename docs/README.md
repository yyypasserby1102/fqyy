# FQYY

Browser-based 2D action roguelite with a xiuxian cultivation theme, persistent Runs, four combat Stages, authored Gongfa progression, and a complete normal-ending Heavenly Tribulation.

## Design Docs

- `GAME_DESIGN.md`: core pillars, run structure, content roadmap, and first-slice combat direction
- `PRD.md`: product requirements for the current vertical slice
- `PROGRESSION_DICTIONARY.md`: current progression tree for realms, roots, Gongfa, and upgrades
- `SENSORY_PERFORMANCE_SPEC.md`: transition, audio, playtest, and loading requirements
- `FULL_RUN_PLAYTEST_2026-07-14.md`: end-to-end journey and loading audit

## Current Scope

- WASD and arrow-key movement
- Spacebar evade in the held movement direction
- Four cumulative auto-attacking Gongfa slots with independent Mastery
- Stage-specific arenas, enemy waves, and realm ambience
- Qi Orbs, Healing Pills, Spirit Treasures, Breakthroughs, and cultivation choices
- Pause state and debug overlay
- Painted production sprites, VFX, HUD, title shell, and transition presentation
- Lazy-loaded Phaser runtime and gameplay textures after Candidate selection
- Synthesized combat, pickup, UI, Breakthrough, and Tribulation audio

## Folder Notes

- `src/scenes`: boot, game loop, UI scene
- `src/entities`: player, enemies, projectiles, pickups
- `src/systems`: input and spawning systems
- `src/data`: data-driven configs for enemies, upgrades, waves, weapons
- `src/ui`: HUD, choice, journey-presentation, and debug overlays
- `docs`: art workflow and prompt references
