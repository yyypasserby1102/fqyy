# Opening and Atmosphere Visual Specification

Status: production target for the Lingcao, Breakthrough, run shell, Candidate selection, and realm-arena atmosphere pass.

Style basis: [`PLAYER_VISUAL_SPEC.md`](PLAYER_VISUAL_SPEC.md), [`ENEMY_PROJECTILE_VISUAL_SPEC.md`](ENEMY_PROJECTILE_VISUAL_SPEC.md), and [`REMAINING_VISUAL_SPEC.md`](REMAINING_VISUAL_SPEC.md).

## Shared direction

The opening should feel like entering a painted cultivation scroll rather than a utility launcher. Ink-dark negative space, mist-softened mountains, cyan jade rules, parchment text, and restrained gold milestones carry through the DOM shell and Phaser UI. The treatment remains original to FQYY.

Visual changes must not alter seeded Candidate generation, selected Linggen, exact hidden Affinities, Lingcao position or collision, immediate collection, paused choice behavior, Gongfa eligibility, arena bounds, navigation, persistence, or Stage progression.

## 1. Lingcao

The guaranteed opening Lingcao becomes a four-frame hand-painted spirit herb: pale jade leaves, warm stem, blue-white dew, and a readable crescent silhouette at 54 px. Four resonance frames intensify its aura when the Cultivator approaches without changing the collision radius. Collection leaves a four-frame jade-and-gold bloom at the herb's world position while the choice freezes combat.

The world marker uses a compact ink label and a thin guidance tether rather than two unframed text lines. Direction and distance remain continuously readable.

## 2. Linggen awakening and Breakthrough

The first Gongfa choice is explicitly presented as a Linggen awakening: dimmed arena, breathing elemental halo, double cultivation seal, gold title, visible Linggen lore, and three ink-jade Gongfa cards. The effect must remain animated while the gameplay scene is paused. Choosing a Gongfa closes the presentation, restores combat, and plays the existing breakthrough feedback.

Later Stage Breakthrough choices reuse the production ink-jade panel without falsely presenting another first awakening.

## 3. Title and Run shell

The title screen uses a full-viewport painted mountain-and-mist backdrop with dark edge falloff and a centered scroll-like command panel. It presents `FQYY`, `A Cultivation Journey`, the Run status, and strong Start/Continue hierarchy. Abandon confirmation remains explicit and accessible.

The production page title must no longer describe the game as a graybox.

## 4. Cultivator Candidate selection

Candidate selection expands into three equal cards at desktop width and a single-column stack on narrow screens. Every card visibly contains Candidate name, Linggen name, root badges, qualitative Affinity Grades, and lore. Exact Affinity values remain hidden. Whole-card selection remains keyboard and pointer accessible, and existing accessible button names remain stable.

Cosmetic framing may differ by card index, but Linggen remains the only gameplay difference.

## 5. Realm arena variants and atmosphere

All four combat Stages retain the same physical arena and quiet painted base material but receive a distinct production treatment that changes when the Stage changes:

- Lianqi — `mist-court`: cool cyan seal, low drifting mist motes, sparse jade glints.
- Zhuji — `foundation-terrace`: teal-and-bronze geometry, grounded corner monoliths, rising dust motes.
- Jindan — `golden-core-sanctum`: amber inner rings, core-like radial marks, slow gold embers.
- Yuanying — `nascent-sky-dais`: violet-cyan celestial geometry, star points, storm wisps.

Atmosphere remains below actors and major VFX, never affects physics, and stays restrained enough to preserve enemy, projectile, pickup, and HUD contrast. Stage changes update the live arena; resumed Runs load the correct variant directly.

## Production assets

- `lingcao-atlas.png`: 4 × 4 sheet, 256 × 256 transparent RGBA cells.
  - row 1: idle breathing;
  - row 2: proximity resonance;
  - row 3: collection bloom;
  - row 4: breakthrough halo accents.
- `title-mountains.png`: opaque landscape backdrop without text, logos, UI, or characters.

Untouched generations and exact prompts live beside normalized exports under `assets/`.

## Acceptance

- The DOM title shell and Candidate flow use the production scroll theme at desktop and narrow widths while preserving accessible controls and seeded behavior.
- Candidate cards visibly expose names, roots, qualitative Grades, and lore without exact Affinity values.
- The running browser game uses the production Lingcao atlas for idle, resonance, and collection; no graybox Lingcao body remains visible.
- The first reveal uses the animated `linggen-awakening` choice treatment and preserves immediate collection plus full combat pause.
- Lianqi, Zhuji, Jindan, and Yuanying each report and visibly render their specified arena variant and atmosphere, with unchanged arena bounds.
- The Lingcao atlas is padded and transparent; the title backdrop is opaque and large enough for a 1280 × 720 crop.
- Browser captures prove title, Candidate selection, Lingcao approach, Linggen awakening, and all four realm variants at gameplay scale.
- Typecheck, lint, unit tests, production build, and the complete browser suite pass.
