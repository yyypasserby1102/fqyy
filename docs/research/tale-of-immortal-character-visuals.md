# Tale of Immortal gameplay-character visual research

Research date: 2026-07-12  
Scope: the in-arena presentation of the player cultivator in *Tale of Immortal* / *鬼谷八荒*, translated into original production guidance for FQYY.

## Executive direction

FQYY should borrow a **visual grammar**, not a character design: an oblique top-down camera; a compact, dark-outlined cultivator with a readable head, hair mass, robe hem, and ground contact; restrained ink-wash scenery; and combat effects that temporarily become the brightest and largest shapes in the frame. The character needs clear idle, run, attack/cast, hit, and evade states even when the sprite occupies only a small fraction of the screen.

The useful lesson is contrast hierarchy. The arena supplies atmosphere, the character supplies orientation, and the Skill supplies the current action. FQYY should implement that hierarchy with its own silhouette, costume construction, animation timing, elemental motifs, and effect geometry.

## Sources and evidence quality

This report prioritizes material published by the developer or publisher:

1. [Official Steam store page](https://store.steampowered.com/app/1468810/_Tale_of_Immortal/) — owned storefront listing for the game by developer 鬼谷工作室 and publishers 鬼谷工作室 / Lightning Games; its gallery contains official trailers and screenshots.
2. [Official Launch Trailer](https://www.youtube.com/watch?v=RZhoxHUNcmg) — published by Lightning Games, the game's publisher. This is the strongest motion reference for combat scale, locomotion, and VFX density.
3. [Official 2021 English trailer](https://www.youtube.com/watch?v=xNGw2v7hhfk) — published by Lightning Games; it includes older continuous gameplay examples useful for checking that the broad presentation language is persistent rather than unique to one encounter.
4. [Official Reborn–Transcendent update trailer](https://www.youtube.com/watch?v=eDm0Uwgkf60) — published by Lightning Games; supplementary evidence for high-power Skill presentation.
5. Official Steam gallery combat stills: [Blighted Tree encounter](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/ss_51db7d9662052c2a6adac07234469780437620a4.1920x1080.jpg) and [large spell encounter](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/ss_cdce5a4b3a09440bf9b70a975ac8ba043e96bfad.1920x1080.jpg). These support spatial, palette, layering, and scale observations, but cannot prove animation timing.
6. Official Steam embedded gameplay clips: [dense combat and Skill vignettes](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/extras/dec8e59fc1f15f8c2cc34d74c95fdbb7.webm) and [customization followed by live combat](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/extras/13dde6e589e058be237a811f2d030ab7.webm). These are direct assets served by the game's official Steam listing.
7. [Ghost Valley Studio's official company site](https://www.dahuangwangluo.com/) — first-party provenance for the studio's official Chinese video posts, including the [launch video](https://www.bilibili.com/video/BV1KV4y1k7Pt/) and [Reborn–Transcendent preview](https://www.bilibili.com/video/BV1vZ4y1i7KC/).

Where a statement below is marked **Observation**, it is directly visible in these sources. **Inference** is an interpretation of why the treatment works. **Recommendation** is an original FQYY production decision, not a claim about *Tale of Immortal*'s implementation.

## Visual-language findings

### Camera and on-screen scale

**Observation.** Combat uses a fixed-looking oblique top-down view. The ground plane dominates; scenery, enemies, and effects surround a player sprite that is intentionally small relative to the arena. In the official 1080p combat stills, humanoids are approximately **4–7% of viewport height**, while bosses and attack shapes occupy much larger areas. The large-spell still retains a similarly broad field of view even while effects fill much of the combat space. ([Blighted Tree still](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/ss_51db7d9662052c2a6adac07234469780437620a4.1920x1080.jpg), [large-spell still](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/ss_cdce5a4b3a09440bf9b70a975ac8ba043e96bfad.1920x1080.jpg))

**Inference.** This scale makes room for bullet patterns and giant mythic creatures, but it creates a persistent player-location problem. The design compensates with a compact high-contrast silhouette, a stable ground relationship, and effects that originate unambiguously from the player.

**Recommendation.** At FQYY's reference viewport, target a standing cultivator height of **7–10% of the visible playfield height**, then validate at the smallest supported viewport. Keep the collision body smaller than the painted robe and sleeves. Use a soft oval contact shadow that remains visible through light effects. Camera zoom must not change between idle, run, and ordinary attacks; reserve any camera emphasis for rare, brief Skill moments.

### Silhouette, proportion, and linework

**Observation.** The combat character reads first as a head/hair mass over a tapered robe shape. Fine facial and clothing details are subordinate at gameplay scale. Character and monster edges use dark, brush-like contours; interior colors are flatter and less contrasty than the outline. Environment linework is also ink-like, which ties the scene together, but background forms are lower-contrast than active combatants. ([Official Steam gallery](https://store.steampowered.com/app/1468810/_Tale_of_Immortal/), [Blighted Tree still](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/ss_51db7d9662052c2a6adac07234469780437620a4.1920x1080.jpg))

**Inference.** Hair, sleeves, and robe hem are more valuable animation handles than facial features. They communicate direction and momentum while surviving downscaling.

**Recommendation.** Build one unmistakable FQYY silhouette from four large masses:

- head and original hair/topknot shape;
- asymmetric shoulder or sash accent that makes facing readable;
- two sleeve masses that open during casting;
- a split or tapered robe hem that separates during running.

Use a 1–2 screen-pixel dark contour at final display size, with selective rather than uniform thickness. Avoid internal lines thinner than one display pixel. Preserve a quiet patch around the face and upper torso so bright effects do not erase the identity anchor.

### Idle, run, facing, and attack states

**Observation.** The official trailers show the player moving continuously across the ground while attacks and Skills fire into the surrounding arena. At 0:05–0:07 in the official Steam customization/combat clip, the humanoid changes position through an enemy group while long sword/projectile streaks, red ground circles, blood splashes, and orange impacts carry the action. The body pose is brief and subordinate at gameplay scale. A full-body martial pose at 0:48–0:52 in the official Steam launch trailer instead uses broad sleeves/robe and pale motion arcs to make the pose legible. ([Steam combat clip](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/extras/13dde6e589e058be237a811f2d030ab7.webm), [official trailer on the Steam page](https://store.steampowered.com/app/1468810/_Tale_of_Immortal/))

**Evidence limit.** The reviewed official media does not establish a reliable exact frame count, frame rate, or whether every gameplay action has four-way or eight-way bespoke art. Those details should not be copied or asserted as facts.

**Inference.** At this camera scale, state changes need strong first-frame differences: robe compression/extension, sleeve opening, and a brief pose hold are easier to read than subtle limb animation. Facing and attack direction may need to be decoupled so an auto-attacking cultivator does not jitter between targets.

**Recommendation.** Author the following FQYY state set:

| State | Production target | Readability cue |
| --- | --- | --- |
| Idle | 4–6 frames, 0.8–1.2 s loop | breathing, sash drift, small sleeve separation; feet stay planted |
| Run | 6–8 frames per directional family, 8–12 fps | clear up/down beat, alternating hem split, hair/sash lag one frame |
| Basic attack | 3 phases: 70–110 ms tell, release frame, 100–160 ms recover | sleeve/weapon points toward attack; muzzle/rune starts outside the body |
| Skill cast | 4 phases: gather, pose hold, release, settle | larger pose and a one-frame silhouette hold before the effect blooms |
| Evade | 3–5 readable frames plus trail | body compresses then stretches; trail follows travel direction |
| Hit | 2–3 frames, short and interrupt-safe | single light/dark value flash plus small opposite-direction recoil |
| Defeat | 6–10 frames or a restrained dissolve | silhouette collapses before particles obscure it |

Start with eight-direction movement if the asset budget permits. If not, use four directional families plus horizontal mirroring, but never mirror calligraphy, talismans, or costume symbols. Cache facing for 120–180 ms during rapid auto-target changes; movement direction controls the legs while aim direction controls upper-body accents and effect emission.

### Skill and spell effects

**Observation.** Official combat media uses effects much larger than the player sprite: projectile streams, lightning, colored bursts, rings, trails, and translucent fields. High-power encounters layer several simultaneous motifs, yet the elemental color and geometric motion of each effect remain legible. Saturated reds, violets, blues, and warm golds stand sharply against grey-green and parchment-toned arenas. The official Steam launch trailer provides concrete examples: a compact cyan cast core at 0:59–1:02; a gold concentric ground seal, vertical energy, and sparks at 1:08–1:11; and a blue-white ultimate with a circular sigil, wind bands, and light pillars at 1:28–1:33. Its 1:39–1:43 climax deliberately lets near-white spectacle overwhelm the body. ([official trailer on Steam](https://store.steampowered.com/app/1468810/_Tale_of_Immortal/), [large-spell still](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/ss_cdce5a4b3a09440bf9b70a975ac8ba043e96bfad.1920x1080.jpg), [Reborn–Transcendent trailer](https://www.youtube.com/watch?v=eDm0Uwgkf60))

**Observation.** Effects combine soft transparent energy with harder graphic marks. The scene can contain bloom-like cores and mist while still using brush-edged arcs, bolts, or projectile silhouettes. ([Official Launch Trailer](https://www.youtube.com/watch?v=RZhoxHUNcmg), [official Steam gallery](https://store.steampowered.com/app/1468810/_Tale_of_Immortal/))

**Inference.** A Skill reads best when it has one dominant motion verb and one dominant shape family. Extra particles add finish only after the core telegraph and damage path are understandable.

**Recommendation.** Give every FQYY Gongfa Skill a four-part effect grammar:

1. **Gather** at the hands, weapon, or feet for 70–180 ms.
2. **Telegraph** the damaging path on the ground, beneath actors.
3. **Deliver** one dominant projectile, wave, ring, beam, or formation above the character layer.
4. **Resolve** with a short impact mark and residue that fades before the next cast becomes visually ambiguous.

Tie each elemental family to an original palette and motion language. Keep the brightest value in the delivery/impact, not in the ambient loop. Element identity should survive greyscale through shape: fire licks and expanding cinders, water ribbons and crescents, wood branching strokes and leaf clusters, metal straight cuts and faceted glints, earth slabs and square seals. These are broad genre motifs; their exact silhouettes and timing must be FQYY's own.

### Layering and occlusion

**Observation.** The official combat stills establish a depth stack: ground painting; ground-attached pools or marks; combatants and large scenery; airborne projectiles and impacts; and a fixed HUD above the playfield. Large boss art can occlude the ground, while bright attacks cross both characters and scenery. ([Blighted Tree still](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/ss_51db7d9662052c2a6adac07234469780437620a4.1920x1080.jpg), [large-spell still](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/ss_cdce5a4b3a09440bf9b70a975ac8ba043e96bfad.1920x1080.jpg))

**Recommendation.** Use this explicit FQYY render order:

1. terrain and noninteractive ink texture;
2. danger telegraphs and ground decals;
3. contact shadows;
4. pickups and low props;
5. actors, y-sorted by feet;
6. actor-attached aura behind/around the torso;
7. projectiles, weapon trails, and delivery geometry;
8. hit sparks and brief foreground particles;
9. selection/player locator and gameplay UI;
10. restrained full-screen flash or vignette.

Effects crossing the cultivator should apply a small transparency notch or masked quiet zone over the head and torso. Do not solve visibility by outlining every particle; protect the player silhouette instead.

### Palette and readability budget

**Observation.** The arena art is predominantly low-saturation ink grey, parchment beige, blue-grey, and muted vegetation color. Combat effects and critical UI use more saturated, luminous color. Dark vignetting and ink-wash borders are used compositionally in several official scenes. ([Official Steam gallery](https://store.steampowered.com/app/1468810/_Tale_of_Immortal/), [large-spell still](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1468810/ss_cdce5a4b3a09440bf9b70a975ac8ba043e96bfad.1920x1080.jpg))

**Recommendation.** Reserve the FQYY scene's contrast budget:

- background: low saturation and compressed value range;
- player: one stable mid/high-value costume patch plus dark contour;
- enemies: coherent darker or warmer masses, distinct from the player accent;
- friendly Skills: saturated family color with a light core;
- enemy danger: a separate warning hue and slower, ground-bound anticipation;
- pickups/UI: colors not reused for routine particle noise.

Test all states at 50% display scale, in greyscale, and under the densest supported enemy/effect count. A reviewer should locate the cultivator in under 250 ms and identify idle/run/cast from a single short loop without HUD help.

## Original FQYY production brief

The first complete character pass should deliver:

- one original cultivator design sheet: front, back, side, three-quarter, palette, and silhouette thumbnail;
- a gameplay sprite atlas for idle, eight-direction run, basic attack/cast, Skill cast, evade, hit, and defeat;
- attachment anchors per frame for feet, torso, both hands, weapon/talisman emission, and overhead aura;
- a persistent contact shadow and optional subtle player locator;
- one basic-attack effect and one high-impact Skill effect built from the gather/telegraph/deliver/resolve grammar;
- an in-engine stress scene with movement, auto-attack, Skill casting, enemy overlap, and maximum expected particle density;
- capture-based review at native and minimum supported viewport sizes.

For the first implementation, prioritize a complete state machine and stable anchors over many costume variants. Hair, sash, and sleeves should have one-beat delayed secondary motion, while the torso stays comparatively stable so emission points do not wobble.

## Acceptance checks

The character visual is not complete until all of these are demonstrated in the running game:

- idle, run, basic attack, Skill cast/effect, evade, hit, and defeat transition without missing frames or snapping scale;
- movement and aim can disagree without facing jitter;
- attack and Skill effects originate from authored anchors rather than the sprite center;
- the player remains findable during the densest supported Skill effect;
- feet and shadow stay registered to the ground through every animation;
- directional sprites do not mirror asymmetric writing or symbols incorrectly;
- the complete atlas has no borrowed or traced source-game asset;
- animation timing is tested at actual gameplay speed, not only in an atlas preview.

## Anti-copy constraints

FQYY must not copy, trace, recolor, or closely reconstruct any *Tale of Immortal* sprite, portrait, costume, hairstyle, icon, projectile, rune, formation, boss, UI frame, animation frame sequence, or exact palette. Do not use screenshots or trailer frames as image-generation references for final assets. Do not imitate a named character or reproduce identifying combinations of silhouette, ornament, and color.

Safe takeaways are abstract and functional: oblique top-down staging, small-character readability, ink-inspired contour hierarchy, quiet scenery versus saturated Skills, garment secondary motion, and layered telegraph/delivery/impact effects. FQYY's cultivator must be designed from its own domain, Gongfa roster, and original shape language, with independently chosen proportions, costume construction, color values, timing, and animation poses.

## Remaining uncertainty

Official promotional footage is edited and may show different versions of the game. It is strong evidence for presentation principles but not a technical specification. Exact sprite dimensions, animation frame counts, blend modes, facing implementation, and sorting rules are not publicly established by the reviewed first-party sources. The numeric targets in this report are therefore FQYY recommendations to prototype and test, not reverse-engineered *Tale of Immortal* values.
