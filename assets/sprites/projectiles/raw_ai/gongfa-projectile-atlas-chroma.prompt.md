# Gongfa projectile travel atlas prompt

Generated with the built-in image-generation tool on 2026-07-13.

```text
Use case: stylized-concept
Asset type: production animated projectile atlas for FQYY
Primary request: exact 4-column by 4-row atlas with one centered four-frame east-travel loop per row. Row 1 Flying Sword; row 2 Metal Wave; row 3 Aura Blade; row 4 Qi Bolt.
Style/medium: original polished hand-painted ink-brush VFX/cutout, controlled watercolor cores, crisp opaque silhouettes, elegant and readable at 24–64 gameplay pixels.
Palette: neutral ivory, pale cyan, restrained azure, muted bronze, charcoal line so runtime Gongfa tints remain legible.
Composition: exact stable center and scale within each row, generous padding, no edge contact or baked impact.
Scene/backdrop: flat #ff00ff chroma key without floor, shadows, gradients, texture, dividers, labels, or gutters.
Constraints: no borrowed weapons/effects, character, enemy, hand, scenery, formation, text, runes, watermark, logo, or UI.
```

Production processing uses a border-sampled soft matte, despill, and one-pixel edge contraction. Each complete projectile is extracted from its generated neighborhood, one scale is applied per family, and every frame is centered in a 256 × 256 cell. The export is a padded 1024 × 1024 RGBA atlas.
