# Sprite Workflow

This project starts as a graybox MVP. Real art should be added only after the combat loop feels right.

## Source Of Truth

- Keep `.aseprite` files in `assets/sprites/<category>/source/`.
- Store raw AI generations in `assets/sprites/<category>/raw_ai/`.
- Export production PNG sheets to `assets/sprites/<category>/export/`.
- Phaser imports only exported PNG assets. Do not edit exported files directly.

## AI-Assisted Pipeline

1. Generate drafts at the source resolution and camera view defined by the asset's production spec.
2. Save untouched outputs in `raw_ai/` with the prompt text beside them.
3. Clean silhouette, palette, readability, and animation spacing in Aseprite.
4. Normalize each sprite to a consistent baseline and directional readability.
5. Export PNG sprite sheets from Aseprite into `export/`.
6. Import the exported PNGs into Phaser and bind them in preload/bootstrap code.
7. If gameplay readability changes, edit the `.aseprite` file and re-export. The `.aseprite` file stays authoritative.

## Xiuxian Art Rules

- Favor readable side-view silhouettes over ornate detail.
- Weapons and talismans should read clearly at gameplay scale before decorative flourishes.
- Cultivators should feel mobile and lightly elevated, not heavily armored.
- Spirit beasts should use exaggerated horns, tails, whiskers, feathers, or aura shapes to separate enemy types quickly.
- Qi, pills, and breakthroughs should use color-coded shapes so rewards are legible under combat pressure.
- The protagonist follows `docs/PLAYER_VISUAL_SPEC.md`: hand-painted oblique cutout art at a 256x256 source-cell resolution. The older 64x64 pixel-art target remains suitable only for optional low-resolution enemy drafts.

## Graybox Transition Checklist

- Replace primitive player shape with the complete protagonist locomotion/action/VFX atlases in `docs/PLAYER_VISUAL_SPEC.md`.
- Replace each enemy primitive with one readable 64x64 spirit beast sheet.
- Replace flying sword triangle with a sword slash sheet plus hit VFX.
- Replace XP orb circle with a qi orb pickup animation.
- Keep collision boxes independent from final art dimensions.
