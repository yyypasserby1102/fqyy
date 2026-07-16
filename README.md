# FQYY

Phaser + Vite + TypeScript xiuxian action roguelite with a first-party cultivation companion tool.

## Current State

- Complete four-Stage Run with 13 playable Gongfa and authored Mastery tracks
- Production combat, arena, character, enemy, pickup, HUD, and Gongfa visuals
- In-game Gongfa Archive for Skills, passives, refinements, and Transformations
- FQYY Cultivator Tools with a searchable canonical Gongfa database, Spirit Treasure archive, and shareable build planner

## Cultivator Tools

Open **FQYY Tools** from the title screen or visit `/#tools/compendium` while the dev server is running. The planner is sourced directly from the game data and enforces Linggen compatibility, four cumulative Gongfa slots, and three Spirit Treasure slots. Shared builds are encoded into the URL.

## Controls

- `WASD` or arrow keys: move
- `Space`: evade in the held movement direction
- `ESC`: pause
- `F3`: debug overlay
- `1`, `2`, `3` or mouse click: choose a breakthrough

## Scripts

- `npm run dev`
- `npm install`
- `npm run build`
- `npm run lint`
- `npm run typecheck`

## Notes

- The project is scaffolded for the Phaser 4 beta package line.
