# Gongfa projectile impact atlas prompt

Generated with the built-in image-generation tool on 2026-07-13.

```text
Use case: stylized-concept
Asset type: production animated projectile-impact VFX atlas for FQYY
Primary request: exact 4-column by 4-row atlas with one centered four-frame non-looping impact per row. Row 1 Flying Sword line-cut; row 2 Metal Wave split crescent; row 3 Aura Blade radial chip burst; row 4 Qi Bolt breath-light splash.
Style/medium: original polished hand-painted ink-brush VFX with controlled watercolor cores, crisp separable shapes, clear expand-and-dissipate timing.
Palette: neutral ivory, pale cyan, restrained azure, muted bronze, charcoal, with minimal cinnabar at peak contact so runtime tints remain clear.
Composition: exact stable center, generous padding, no projectile body or edge contact.
Scene/backdrop: flat #ff00ff chroma key without floor, shadows, gradients, texture, dividers, labels, or gutters.
Constraints: no borrowed effects, character, enemy, weapon, scenery, formation, text, runes, watermark, logo, or UI.
```

The generator returned a 1448 × 1086 composition with four visual columns and rows. Production processing uses a border-sampled soft matte, despill, and one-pixel edge contraction, extracts each effect from its actual generated neighborhood, applies one scale per impact family, and centers it in a 256 × 256 frame. The export is a padded 1024 × 1024 RGBA atlas.
