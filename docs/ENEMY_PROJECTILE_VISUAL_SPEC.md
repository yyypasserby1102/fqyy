# Enemy and Projectile Visual Specification

Status: production target for the first complete enemy/projectile pass.  
Style basis: [`PLAYER_VISUAL_SPEC.md`](PLAYER_VISUAL_SPEC.md) and the first-party visual research in [`research/tale-of-immortal-character-visuals.md`](research/tale-of-immortal-character-visuals.md).

## Shared direction

Enemies and projectiles use FQYY's original hand-painted 2D cutout language: pressure-sensitive ink contours, restrained watercolor fills, crisp transparent silhouettes, and a slightly oblique top-down camera. They must complement the Cloudstep Disciple without borrowing a creature, costume, weapon, formation, or effect from _Tale of Immortal_.

Silhouette identifies an enemy before color. Early beasts are low and broad, flying threats are high and narrow, Cultivator-shaped enemies have damaged or unnatural posture, and Tribulation threats use rigid celestial geometry. Saturation increases with danger, while ordinary bodies remain quieter than Gongfa delivery effects.

All production cells are 256 × 256 RGBA. Enemies display at approximately 48–88 px depending on threat class. Projectiles display at approximately 24–64 px and preserve a strong left-to-right travel axis before runtime rotation.

## Enemy roster

### Opening and early-realm atlas

`enemy-opening-atlas.png` is a 4 × 4 sheet with one four-frame pursuit loop per row:

1. **Jade Burrow Rat** — low moss-jade body, stone-plated brow, long ink tail, quick alternating paws;
2. **Mist Howler** — pale blue-gray wolf, vapor mane and tail, long predatory stride;
3. **Bone Crow** — ivory ribbed wings, charcoal feathers, cinnabar eye, alternating wing beats;
4. **Corpse Cultivator** — ruined umber robes, paper-pale skin, broken knot, dragging asymmetrical step.

### Advanced and Tribulation atlas

`enemy-tribulation-atlas.png` is a 4 × 4 sheet:

1. **Resentful Spirit** — translucent violet-white shroud, dark face hollow, curling lower wisp;
2. **Celestial Construct** — cyan-white stone/bronze guardian, square shoulders, luminous core;
3. **Tribulation Shade** — narrow storm-black silhouette split by pale-violet lightning seams;
4. **Enemy defeat ink** — four frames from compact fracture through outward ink fragments and disappearance.

Every pursuit loop keeps a stable visual center while paws, wings, cloth, vapor, or orbiting fragments carry motion. Westward movement mirrors eastward-facing art. The runtime may rotate flying/abstract enemies slightly toward motion but never rotates upright humanoids.

## Enemy runtime states

- **materialize**: 220 ms ink wash from low alpha into the pursuit loop while gameplay collision remains fixed;
- **pursue**: the authored four-frame loop, 8–12 fps by species;
- **hit**: 90 ms white/cinnabar flash with a small recoil, without restarting pursuit facing;
- **defeat**: collision disables immediately, the common defeat-ink animation plays over a 220 ms body dissolve, then the enemy is destroyed;
- **depth**: contact shadow behind ground enemies, body at actor depth, defeat fragments above the body.

Gameplay health, movement speed, damage, spawn timing, drops, and collision radii remain independent from painted bounds.

## Projectile atlas

`gongfa-projectile-atlas.png` is a 4 × 4 sheet with one four-frame travel loop per row:

1. **Flying sword** — original narrow bronze/ivory talismanless blade with cyan edge wake;
2. **Metal wave** — broad double cutting front made from pale ink crescents;
3. **Aura blade** — compact leaf-shaped defensive shard with a dense white core;
4. **Qi bolt** — rounded breath-light comet with a dry-brush tail.

Artwork is neutral ivory/cyan so existing Gongfa tint families remain mechanically legible. Runtime rotation follows velocity. Animation phase is cosmetic and never changes collision, speed, lifetime, pierce, or targeting.

## Projectile impact atlas

`gongfa-projectile-impact-atlas.png` is a 4 × 4 sheet, matching the projectile rows. Each row is a four-frame, non-looping impact:

1. sword line-cut and sparks;
2. metal-wave split crescent;
3. aura-blade radial chip burst;
4. qi-bolt circular breath splash.

An impact appears whenever a projectile applies base damage. It inherits the projectile tint, is centered on the enemy hit point, plays above enemy bodies for 160–240 ms, and destroys itself on animation completion. Projectiles that lodge may leave their travel sprite embedded until their existing mechanic removes it.

## Layer order

1. terrain and arena grid;
2. enemy contact shadows and spawn telegraphs;
3. enemy bodies;
4. Cultivator and attached casting effects;
5. projectiles;
6. projectile impacts, hit sparks, and enemy defeat ink;
7. damage numbers and HUD.

## Acceptance

- All seven configured enemy IDs use production atlas frames in the running game; no enemy graybox texture or configuration tint is visible on its body.
- Each enemy visibly materializes, pursues, reacts to damage, and dissolves on defeat while gameplay drops/counts remain correct.
- All four configured projectile texture IDs use animated production frames, rotate with travel, preserve existing Gongfa tint differentiation, and create the matching impact family on hit.
- Painted bounds never define physics bodies; enemy and projectile collision behavior remains unchanged.
- Every atlas is original, transparent, padded inside each 256 × 256 cell, and free of key-color fringe.
- Browser captures prove early-realm enemies, advanced/Tribulation enemies, all projectile families, hit impacts, and enemy defeat at gameplay scale.
- Typecheck, lint, unit/asset tests, and the complete browser suite pass.
