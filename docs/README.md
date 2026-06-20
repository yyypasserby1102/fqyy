# FQYY MVP

Graybox 2D action roguelite prototype with a xiuxian cultivation theme.

## Design Docs

- `GAME_DESIGN.md`: core pillars, run structure, content roadmap, and first-slice combat direction
- `PRD.md`: product requirements for the current vertical slice
- `PROGRESSION_DICTIONARY.md`: current progression tree for realms, roots, Gongfa, and upgrades

## MVP Scope

- WASD and arrow-key movement
- Auto-attacking flying swords
- Spirit beast spawner and wave escalation
- Health, damage, XP orbs, level-up choices
- Pause state and debug overlay
- Primitive placeholder textures generated at runtime

## Folder Notes

- `src/scenes`: boot, game loop, UI scene
- `src/entities`: player, enemies, projectiles, pickups
- `src/systems`: input and spawning systems
- `src/data`: data-driven configs for enemies, upgrades, waves, weapons
- `src/ui`: HUD panels and debug overlay
- `docs`: art workflow and prompt references
