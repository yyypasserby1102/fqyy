# Player locomotion atlas prompt

Generated with the built-in image-generation tool on 2026-07-12.

```text
Use case: stylized-concept
Asset type: production 2D game sprite atlas, protagonist locomotion
Primary request: create one exact 4-column by 4-row animation atlas for an original xiuxian action-roguelite protagonist called the Cloudstep Disciple. Sixteen equal square cells, read left-to-right. Row 1: four subtle idle breathing frames, feet planted. Row 2: four running-east frames with a clear down/up beat. Row 3: four running-south-toward-camera frames. Row 4: four running-north-away-from-camera frames.
Subject: the same androgynous young adult cultivator in every cell; high looped knot with split black ponytail; asymmetric indigo shoulder mantle; wide ivory sleeves; charcoal inner robe with a forked hem; cinnabar braided waist sash; small bronze clasp; no weapon; no writing or symbols.
Style/medium: hand-painted 2D game cutout, oblique top-down three-quarter gameplay view, dark pressure-sensitive ink contour, restrained watercolor interior washes, simplified facial detail, crisp opaque silhouette, polished production game art, not pixel art and not anime cel art.
Composition/framing: precisely aligned sprite sheet; character identical size in all cells; generous padding inside every cell; feet on exactly the same baseline within each cell; no frame overlaps; no dividers, borders, labels, numbers, or guide marks. Character occupies about 70 percent of each cell height.
Motion: garment-led animation; upright stable torso; robe hem alternates during running; ponytail and sash lag one frame; poses must form usable continuous loops.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background across the entire atlas for background removal. One uniform color only, with no shadows, gradients, texture, floor plane, reflections, lighting variation, cell boundaries, or gutters.
Color palette: ivory, indigo blue, charcoal black, cinnabar red, muted bronze, natural skin; do not use green anywhere in the character.
Constraints: original design only; exact 4x4 grid; one consistent identity, costume, scale, camera, lighting, and baseline; crisp edges; no cast shadow or contact shadow baked into frames; no glow; no particles; no text; no watermark; no logos; no calligraphy; no extra props.
Avoid: any copied or recognizable Tale of Immortal character/costume/frame; portraits; perspective changes; zoom changes; duplicated frozen poses; cropped hair or feet; soft fuzzy green spill; background objects.
```

The first 1254×1254 output clipped parts of the south/north rows at generated cell boundaries. On 2026-07-13, the built-in image-generation tool regenerated the atlas using that output only as the original-character reference, with stricter per-cell padding and a shared foot baseline.

Production export processing removes the sampled green key with a soft matte, despill, and one-pixel edge contraction. It extracts each complete figure from the generated row/column neighborhoods, applies one common `0.69` scale, centers each figure horizontally, and registers its lowest opaque point at source-cell `y = 210`. The resulting 1024×1024 RGBA atlas has 256×256 frames, 164–193 px figure heights, and no cell-edge contact.
