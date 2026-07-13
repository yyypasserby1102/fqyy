# Player action atlas prompt

Generated with the built-in image-generation tool on 2026-07-12. The generated locomotion atlas was supplied only as an identity, costume, camera, scale, and rendering reference.

```text
Use case: stylized-concept
Asset type: production 2D game sprite atlas, protagonist actions
Input images: Image 1 is an identity, costume, camera, rendering, scale, and registration reference only; create a new action atlas with the exact same original Cloudstep Disciple.
Primary request: create one exact 4-column by 4-row action animation atlas. Sixteen equal square cells, read left-to-right. Row 1: east-facing basic attack in four phases—compact hand-seal gather, leading ivory sleeve points east, decisive release pose, controlled recover. Row 2: east-facing major Skill cast in four phases—low gather with both hands, sleeves open into a larger silhouette, strong held release pose, quiet settle. Row 3: east-facing Evade in four phases—body compresses, long horizontal stretch, low trailing stride, balanced recover. Row 4: cell 1 short hit recoil east, cell 2 stronger hit recoil, cell 3 beginning defeat with knees and torso collapsing, cell 4 final low collapsed silhouette.
Subject invariants: exactly the same androgynous young adult cultivator from Image 1; same face, high looped knot, split black ponytail, asymmetric indigo shoulder mantle, wide ivory sleeves, charcoal forked robe hem, cinnabar braided sash, bronze clasp, proportions, and palette. No weapon, writing, or symbols.
Style/medium: same hand-painted 2D game cutout as Image 1, oblique top-down three-quarter gameplay view, dark pressure-sensitive ink contour, restrained watercolor fills, simplified face and fingers, crisp opaque silhouette, polished production game art, not pixel art and not anime cel art.
Composition/framing: precisely aligned sprite sheet; identical scale in all cells and matching Image 1; generous padding; standing action feet share one baseline; no overlaps, dividers, borders, labels, numbers, or guides; character occupies about 70 percent of each cell height. Defeat cells may sit lower but may not cross cell boundaries.
Motion: strong first-frame state differences with stable torso registration; sleeves, robe hem, ponytail, and sash provide secondary motion. No magical effects baked into this sheet.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background across the entire atlas for background removal. One uniform color only, with no shadows, gradients, texture, floor plane, reflections, lighting variation, cell boundaries, or gutters.
Color palette: exactly match Image 1; do not use green anywhere in the character.
Constraints: original design only; exact 4x4 grid; one consistent identity, costume, camera, lighting, scale, and baseline; crisp edges; no cast/contact shadow; no glow; no particles; no text; no watermark; no logos; no calligraphy; no props.
Avoid: changing identity or costume; borrowed Tale of Immortal poses/assets; front-facing attack rows; perspective or zoom changes; cropped hair, sleeves, sash, or feet; duplicated frozen poses; key-color spill; background objects.
```

The raw output was 1254×1254. Production export processing removes the sampled green key with a soft matte, despill, and one-pixel edge contraction. It then extracts the complete figures from their generated row/column neighborhoods, applies the same `0.69` production scale as locomotion, and centers each figure horizontally. Standing, action, and hit frames register at source-cell `y = 210`; only the two deliberately low defeat silhouettes use `y = 218` to retain their collapse progression. The result is a 1024×1024 RGBA atlas with 256×256 frames and no cell-edge contact.
