# FQYY Protagonist Visual Specification

Status: production target for the first complete protagonist pass.  
Research basis: [Tale of Immortal gameplay-character visual research](research/tale-of-immortal-character-visuals.md).

## Original character direction

The protagonist is the **Cloudstep Disciple**, a universal gameplay Cultivator shared by the current placeholder Cultivator Candidates. The design is original to FQYY and must not reuse a character, costume, symbol, frame, or effect from *Tale of Immortal*.

The silhouette uses four readable masses: a high looped knot with a split black ponytail, an asymmetric indigo shoulder mantle, two wide ivory sleeves, and a forked charcoal robe hem. A cinnabar braided sash and small bronze clasp supply warm landmarks. There is no calligraphy or mirrored symbol on the costume.

The rendering style is a hand-painted 2D cutout: dark pressure-sensitive ink contour, restrained watercolor interior washes, simplified face and fingers, and crisp opaque edges at gameplay scale. It is not pixel art, anime cel art, 3D, or a portrait illustration.

## Camera and dimensions

- View: oblique top-down three-quarter gameplay view.
- Source atlas cells: 256 × 256 transparent PNG.
- Display height: 72 px at the reference camera zoom, approximately 8% of a 900 px playfield.
- Registration: feet at `(128, 210)` in every cell; art may extend into sleeves and hair but the feet never jump.
- Physics: retain the existing independent 12 px radius collision body (32 source px at the 0.375 display scale).
- Contact shadow: separate soft ink oval below the actor, never baked into a frame.
- Facing: authored north, south, and east families; west mirrors east because the costume contains no writing.

## Atlases

### Locomotion atlas

`player-locomotion.png` is a 4 × 4 sheet, read left-to-right:

1. idle, four-frame 960 ms loop;
2. east run, four-frame 360 ms loop;
3. south run, four-frame 360 ms loop;
4. north run, four-frame 360 ms loop.

Idle keeps the feet planted while the shoulders breathe and the sash drifts. Run uses a clear down/up beat, alternating robe split, and one-frame hair/sash lag.

### Action atlas

`player-actions.png` is a 4 × 4 sheet, read left-to-right:

1. east basic attack: gather, sleeve lead, release, recover;
2. east Skill cast: gather, open silhouette, held release, settle;
3. east Evade: compress, stretch, trail pose, recover;
4. hit/defeat poses: two hit frames followed by two collapse frames.

Attacks may mirror horizontally. Aim changes do not restart an action already in progress.

### Cultivation effect atlas

`player-cultivation-vfx.png` is a 4 × 4 sheet:

1. basic-attack hand seal: compact ivory/cyan gather to sharp release;
2. Skill gather: expanding circular breath and four brush motes;
3. Skill release: large cyan-gold ink ring with a protected quiet center;
4. Evade/hit: directional dry-brush streak and short impact spark.

Effects contain no legible rune or borrowed formation. Gongfa projectiles remain mechanically distinct; this atlas communicates the protagonist's casting state and origin.

## Runtime state rules

Visual priority is `defeat > hit > skill > attack > evade > run > idle`.

- Movement selects run direction and updates cached facing.
- Auto-attacks use the nearest target direction when available, but facing is cached during the action to prevent jitter.
- Ordinary attack presentation lasts 220–320 ms and does not stop movement.
- Skill presentation lasts 420–620 ms and includes a brief held silhouette before release.
- Evade follows its gameplay direction and adds a trailing afterimage.
- Hit flashes and recoils without permanently replacing the current facing.
- Defeat collapses the silhouette before fading it; gameplay-over handling remains authoritative.

## Layer order

1. terrain;
2. ground telegraphs;
3. contact shadow;
4. player locator ring;
5. protagonist;
6. behind/attached gather aura;
7. projectiles and Skill delivery;
8. hit sparks and foreground residue;
9. HUD.

The Skill release keeps a low-opacity center over the head and torso. The locator ring is subtle during ordinary play and brightens only during dense effects, Evade, and Skill casting.

## Acceptance

- Idle, north/south/east/west run, attack, Skill cast/effect, Evade, hit, and defeat are observable in the running game.
- Feet, shadow, collision body, and VFX origin remain registered across every state.
- Movement and aim can disagree without rapid facing jitter.
- The player remains locatable under the densest supported Skill effect.
- The three production atlases are original, transparent, and free of key-color fringe.
- Browser captures prove the normal, moving, attacking, and Skill-casting states at gameplay scale.
- Typecheck, lint, unit tests, and browser tests pass.

Browser acceptance evidence is indexed in [`visual-review/README.md`](visual-review/README.md).
