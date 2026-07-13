# Advanced enemy and defeat atlas prompt

Generated with the built-in image-generation tool on 2026-07-13.

```text
Use case: stylized-concept
Asset type: production 2D game enemy and defeat-VFX atlas for FQYY
Primary request: exact 4-column by 4-row atlas. Rows 1–3 are original four-frame pursuit loops for Resentful Spirit, Celestial Construct, and Tribulation Shade. Row 4 is a centered four-frame enemy defeat-ink sequence from fracture through fading fragments.
Style/medium: polished hand-painted 2D game cutout/VFX, oblique top-down camera, pressure-sensitive ink, restrained watercolor, crisp separable silhouettes, low-saturation bodies with controlled luminous accents.
Composition: stable row scale and center, complete padded silhouettes, shared Construct foot line, stable Spirit/Shade hover centers, centered expanding defeat effect.
Scene/backdrop: flat #00ff00 chroma key without floor, shadows, gradients, texture, dividers, labels, or gutters.
Constraints: original FQYY designs only; no borrowed enemies, formations, assets, text, runes, props, projectiles, watermark, or UI.
```

Production processing uses a border-sampled soft matte, despill, and one-pixel edge contraction. It extracts each complete figure/effect from the generated neighborhoods, applies one common scale per row, and registers the Construct at source-cell `y = 210` while keeping hovering enemies and defeat ink centered. The export is a padded 1024 × 1024 RGBA atlas with 256 × 256 frames.
