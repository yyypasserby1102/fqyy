# Player cultivation VFX atlas prompt

Generated with the built-in image-generation tool on 2026-07-12. The generated action atlas was supplied only as a palette, ink-weight, camera, and scale reference; the character was explicitly excluded.

```text
Use case: stylized-concept
Asset type: production 2D game VFX sprite atlas
Input images: Image 1 is a palette, ink-line weight, watercolor rendering, gameplay camera, and source-scale reference only. Do not include the character or any body part.
Primary request: create one exact 4-column by 4-row animation atlas of original cultivation combat effects for FQYY. Sixteen equal square cells, read left-to-right. Row 1: east-directed basic-attack casting effect in four phases—small ivory-cyan hand-light gather centered slightly left, narrow brush seal stretching east, sharp cyan-gold release crescent moving east, three fading brush sparks. Row 2: centered major-Skill gather in four phases—tiny breath-light seed, two curling cyan brush arcs, near-complete circular current with four gold motes, bright complete gathered ring with a quiet empty center. Row 3: centered major-Skill release in four phases—compact cyan-gold ink ring, medium expanding ring, large expanding ring with four pointed brush accents, widest thinning ring and fading gold flecks; preserve a quiet low-opacity empty center in every frame so a protagonist remains readable when composited above it. Row 4: cell 1 compact eastward dry-brush Evade streak, cell 2 longer eastward Evade streak with two pale afterimage slashes, cell 3 small ivory-cyan hit spark, cell 4 stronger cinnabar-gold impact burst.
Style/medium: original hand-painted 2D game VFX, energetic Chinese ink-brush geometry with controlled watercolor cores, crisp graphic silhouettes, hard readable impact shapes, polished production game art, matching Image 1 without copying any existing game effect. Effects must remain legible at 72-pixel character scale.
Composition/framing: precisely aligned 4x4 atlas; each effect centered consistently in its own equal square cell; generous padding; no frame overlaps; no dividers, borders, labels, numbers, or guide marks. Directional effects point east. Circular effects remain centered.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background across the entire atlas for background removal. One uniform color only, with no shadows, gradients, texture, floor plane, reflections, lighting variation, cell boundaries, or gutters.
Color palette: luminous ivory, pale cyan, deep azure edge, restrained warm gold, and cinnabar only for the strong hit; do not use magenta, pink, purple, or #ff00ff anywhere in an effect.
Constraints: original effect geometry only; exact 4x4 grid; one consistent ink/watercolor VFX language; mostly opaque brush shapes with clean separable edges suitable for chroma keying; no character; no weapons; no scenery; no legible runes, calligraphy, text, watermark, logos, or icons; no baked contact shadows.
Avoid: borrowed or recognizable Tale of Immortal formations/projectiles; smoky clouds that merge into the key background; full-cell glow haze; soft fuzzy magenta spill; cropped rings or streaks; perspective changes; extra objects.
```

The raw output was 1254×1254. Production export processing removes the sampled magenta key with a soft matte, despill, and one-pixel edge contraction, crops one source pixel per edge, then downsamples to 1024×1024 (256×256 frames).
