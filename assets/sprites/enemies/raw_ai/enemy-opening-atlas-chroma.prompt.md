# Opening and early-realm enemy atlas prompt

Generated with the built-in image-generation tool on 2026-07-13.

```text
Use case: stylized-concept
Asset type: production 2D game enemy sprite atlas for FQYY
Primary request: exact 4-column by 4-row atlas with one original four-frame east-facing pursuit loop per row. Row 1 Jade Burrow Rat; row 2 Mist Howler; row 3 Bone Crow; row 4 Corpse Cultivator.
Style/medium: polished hand-painted 2D game cutout, slightly oblique top-down three-quarter camera, pressure-sensitive dark ink contours, controlled watercolor fills, crisp silhouettes, restrained bodies with small warm landmarks.
Composition: identical scale and stable center within each row; generous padding; shared contact baseline for ground enemies; shared flight height for the crow.
Scene/backdrop: requested flat #ff00ff chroma key with no floor, shadows, gradients, texture, dividers, labels, or gutters.
Constraints: original FQYY designs only; no borrowed creatures, costumes, frames, text, runes, props, projectiles, watermark, or UI.
```

The generator returned a flat neon-green key rather than the requested magenta. Production processing sampled that returned border color, used a soft matte, despill, and one-pixel edge contraction, then extracted the 16 complete figures from their generated neighborhoods. Each row uses one common scale and stable registration: ground rows end at source-cell `y = 210`, while the crow row remains vertically centered. The final export is a padded 1024 × 1024 RGBA atlas with 256 × 256 frames.
