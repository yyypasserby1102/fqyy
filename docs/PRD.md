# FQYY First Slice PRD

## Product Goal

Build a playable normal Run path for a xiuxian-themed action roguelite where the cultivator begins weak, reveals an innate `Linggen`, accumulates compatible `Gongfa`, advances from `Lianqi` through `Yuanying`, and defeats the Heavenly Tribulation.

## Problem

The current prototype has a competent survival loop, but it still behaves like a generic one-weapon survivor with xiuxian flavor text on top. The project needs a real cultivation progression model that changes how runs are structured and how combat identity emerges.

## Success Criteria

- The opening minute feels intentionally weak and transitions into a meaningful identity reveal.
- The run exposes a hidden `Linggen` at the first `Breakthrough`.
- The player chooses 1 of 3 compatible `Gongfa` immediately after `Linggen` reveal.
- The run advances through `Lianqi`, `Zhuji`, and `Jindan`, adding one Gongfa per realm with visible combat growth.
- At least one root with three concrete `Gongfa` options is playable end to end.
- The implementation is data-driven enough to add new roots and methods without rewriting core scene flow.
- A Run can be saved, closed, and resumed across multiple play sessions without losing cultivation progress.
- Saves occur at safe progression boundaries and persist durable Run state rather than transient combat entities.
- Resume reconstructs the next combat segment from the latest checkpoint; death removes the resumable Run save.
- Quitting or crashing mid-combat rolls back the incomplete segment; death is committed before the death screen and cannot be rolled back.
- Each player profile has one active Run save; starting another requires confirmed abandonment, while settings and future meta progression persist separately.
- Each Phase Transition autosaves before offering `Continue`, `Return to Title`, and confirmed `Abandon Run`; there is no manual in-Run save button.
- Abandonment clears the active save and is not recorded as victory.

## Target Experience

The player starts as a Mortal with no attack or active dodge action and must evade through movement alone. Under pressure, they route to a guaranteed early `Lingcao`, trigger the first `Breakthrough`, discover their innate `Linggen`, and choose a `Gongfa` that begins the build. Later Breakthroughs preserve every learned Gongfa and add another compatible package.

## Locked Domain Decisions

- `Linggen` is innate, determined at run start, and revealed during the first `Breakthrough`.
- The Run begins in the `Mortal` state; claiming the `Lingcao` triggers the first Breakthrough into `Lianqi Chuqi` and grants Gongfa 1.
- The first Breakthrough freezes the pursuing enemy pack during reveal/selection and resumes against the same enemies after Gongfa 1 is chosen.
- Lingcao activates immediately on contact. All reveal and one-of-three choice scenes fully pause combat simulation until resolved.
- Lingcao direction and distance are marked from spawn; its exact valid position may vary deterministically by Run seed.
- The Mortal opening uses only slow melee pursuers with generous gaps; ranged enemies, divers, slows, and hazards are excluded until Gongfa 1 is selected.
- Initial `Linggen` profiles contain one or two roots; no run begins with more than two.
- Exceptional later progression can add roots without removing existing ones, up to all five elemental roots; its exact mechanism is deferred.
- An added root expands compatible upgrades immediately and future `Gongfa` eligibility at the next stage `Breakthrough`, but does not transform the current `Gongfa`.
- Root-adding `Linggen` evolution is outside the first slice.
- Root purity is a tradeoff:
  - Single-root advances realms and develops its `Gongfa` faster early.
  - Dual-root progresses more slowly but has broader access and begins closer to the five-root requirement for `Huashen`.
- Cultivation Efficiency affects progression speed, not direct damage or attack cooldown.
- Each present root has an integer Root Affinity from 1 to 10, and all Root Affinities in a `Linggen` total exactly 10.
- Adding a root randomly redistributes those 10 points without reversing the relative order of existing roots; ties are allowed.
- Exact Root Affinity values are hidden; the UI shows `Weak` (1–3), `Medium` (4–6), or `Strong` (7–10).
- Any present root satisfies Gongfa requirements regardless of Grade; Grade affects progression speed only.
- Realm-advancement speed is derived from the strongest current Root Affinity.
- A single-root `Gongfa` develops according to its required root's affinity; a hybrid `Gongfa` uses the arithmetic average of its required roots' affinities.
- Gongfa choice cards show qualitative Mastery Speed: `Slow` (1–3), `Normal` (4–6), or `Fast` (7–10), using the hybrid average when applicable.
- Mastery pacing targets rank 10 near Dayuanman of the acquisition realm for effective affinity 10; lower affinities reach it proportionally later.
- Realm Progress and `Gongfa Mastery` are separate meters filled simultaneously by the same Qi pickups.
- Every learned `Gongfa` receives the full base Mastery value from each Qi pickup; Mastery Qi is not divided between Gongfa.
- Realm Progress thresholds trigger Phase cleanup. Completing `Dayuanman` and defeating the Stage Tribulation triggers `Breakthrough`; `Gongfa Mastery` thresholds trigger Gongfa refinement choices.
- The player does not manually allocate Qi between the meters.
- Each combat-Stage `Breakthrough` adds one `Gongfa` slot and preserves all learned `Gongfa`.
- Each combat Stage contains four ordered Realm Phases: `Chuqi`, `Zhongqi`, `Houqi`, and `Dayuanman`.
- Each Realm Phase is one bounded combat segment with a safe checkpoint on completion; Dayuanman leads to the Stage's concluding Tribulation.
- Qi fills Realm Progress for the current Phase; reaching a threshold starts cleanup, and completing the Phase Transition advances through the four Phases. Clearing Dayuanman unlocks the Tribulation.
- At a Phase threshold, new spawns stop and remaining enemies must be cleared; the resulting Phase Transition resolves queued choices and autosaves before the next Phase.
- Each Phase Transition grants a small automatic `Foundation Growth` increase without a reward-choice screen; exact stats and scaling are deferred.
- After the final cleanup enemy dies, all remaining Qi Orbs are collected automatically before choices resolve.
- Non-Qi loot is limited to Run-bound `Spirit Treasures` and `Healing Pills`; Reroll Tokens are deferred.
- Healing Pills restore missing health immediately on contact, remain unconsumed at full health, and are never stored in inventory.
- Unconsumed Healing Pills persist across Phase Transitions as durable positioned loot and respawn on resume.
- The cultivator has three active `Spirit Treasure` slots; acquiring a fourth requires replacing one or leaving it behind.
- Defeating the Tribulation triggers the next Breakthrough and Gongfa slot while Gongfa Mastery remains independent.
- Tribulations escalate by realm: Lianqi survival trial, Zhuji elite plus adds, Jindan single-phase boss, and Yuanying multi-phase Heavenly Tribulation.
- Realm Phases share a progression grammar: Chuqi introduces threats, Zhongqi mixes them at higher density, Houqi adds elite/environmental pressure, and Dayuanman combines them before the Tribulation.
- Each combat realm has a distinct arena and enemy identity; its four Phases reuse that arena, and Breakthrough moves the Run to the next realm's arena.
- The first complete normal path uses a fixed four-arena sequence; later versions may select from realm-specific arena pools.
- Fixed route: Fallen Sect Courtyard (Mortal/Lianqi), Mist Bamboo Valley (Zhuji), Burial Ridge (Jindan), and Cloudbreak Summit (Yuanying).
- Enemy factions progress from corrupted sect remnants, to bamboo-valley spirits, to burial-ridge undead, to celestial tribulation forces with increasingly complex pressure roles.
- Learned `Gongfa` are excluded from later offerings; fewer than three choices are shown if the compatible unlearned pool is smaller.
- Breakthrough Gongfa offerings are deterministic from Run seed, destination Stage, current Linggen, and learned Gongfa; reload cannot reroll them.
- After a Tribulation, advance to the next realm at Chuqi, select the new Gongfa, autosave the complete state, and only then enter the next arena.
- `Yuanying` is a full combat Stage: it grants Gongfa 4, provides a substantial Mastery-building segment, and ends with the final Tribulation for the normal ending.
- The final boss is the celestial `Yuanying Heavenly Tribulation`, using lightning judgment, tribulation shades, and collapsing safe zones to test single-target pressure, crowd control, and movement.
- Tribulation shades drop Qi and Mastery continues during the boss; choice events resolve only between phases, and Realm Progress is disabled.
- Victory ends the Run after a summary, clears the active save, and writes a permanent completion record; there is no post-victory continuation.
- `Huashen` is a hidden, difficult, non-combat true ending requiring a complete five-root `Linggen`; its discovery and root-completion mechanics are deferred.
- The hidden Huashen path does not prevent the normal `Yuanying` ending.
- `Lingcao` accelerates the first reveal but does not affect `Linggen`.
- `Gongfa` is selected immediately after `Linggen` reveal.
- Exactly three compatible `Gongfa` options are presented.
- A dual-root selection prefers one unlearned `Gongfa` from each root and one unlearned hybrid; exhausted categories fall back to any compatible unlearned `Gongfa`.
- Each hybrid `Gongfa` is independently authored rather than generated by fusing single-root `Gongfa`.
- `Gongfa` is a complete cultivation package containing multiple `Skills` and passive bonuses, not a single attack mechanic.
- Gongfa passives may be internal or globally improve shared `Cultivator Attributes`/compatible Skills, creating cross-Gongfa synergy.
- Skills carry explicit compatibility tags; global Gongfa passives target tags rather than universally affecting all damage.
- Each `Gongfa` has a starting signature `Skill` that establishes its initial combat expression.
- `Gongfa` has required `Linggen`, usually one root and at most two.
- `Gongfa` offers are generated from the currently revealed roots at selection time, including roots added by earlier progression events.
- Stage advancement does not modify existing `Gongfa`, `Skills`, passives, or Mastery.
- Existing `Gongfa` improve only through their own Mastery tracks; baseline cultivator strength grows separately through automatic `Foundation Growth` at each Phase Transition.
- Gongfa accumulate by combat Stage: one at `Lianqi`, two at `Zhuji`, three at `Jindan`, and four at `Yuanying`.
- All learned `Gongfa` remain active with independent Mastery tracks; they are not divided into main and support roles.
- All first-slice `Skills` activate automatically; manual activation is outside the current control model.
- Selecting a `Gongfa` immediately grants its starting signature `Skill` and one defining passive; further contents unlock through `Gongfa Mastery`.
- Each first-slice `Gongfa` contains exactly two automatic `Skills`.
- Each `Gongfa` has an open-ended, run-long Mastery track.
- Ranks 1–9 and ranks after 10 each offer three improvements from that `Gongfa`, and the player chooses one.
- Rank 10 automatically unlocks Skill 2; later choices can improve either Skill or the package's passives.
- Each authored improvement has a maximum rank, usually three, and is removed from the choice pool once maxed.
- Rank 10 adds Skill 2 potency, coverage/count, and activation-speed improvements while unmaxed earlier options remain available.
- After authored improvements are exhausted, three evergreen diminishing-return options improve Skill 1, Skill 2, or passive potency.
- Simultaneous Mastery choices pause combat once and resolve sequentially in Gongfa acquisition order; automatic rank-10 unlocks require no panel.
- Mastery options are deterministic from Run seed, Gongfa, and rank; replaying a Phase cannot reroll them.

## First-Slice Realm Arc

- `Lianqi`: unstable survival and first `Gongfa` acquisition
- `Zhuji`: build stabilization through a second `Gongfa`
- `Jindan`: domination spike through a third `Gongfa`

Long-term progression continues to a full `Yuanying` combat phase. The fourth Gongfa is acquired on entry and receives substantial time to gain Mastery before the final Tribulation grants the normal ending. `Huashen` is a hidden and difficult non-combat true ending requiring a complete five-root Linggen; its route is deferred and it adds no fifth Gongfa.

The normal Run path ends after the `Yuanying` Heavenly Tribulation. `Huashen` remains a hidden, non-combat true ending whose discovery and five-root completion mechanics are out of scope.

## First-Slice Linggen Pool

- Single-root:
  - Metal
- Dual-root:
  - Fire + Metal

Pure `Fire`, pure `Water`, `Water + Metal`, and `Water + Wood` are scaffolded or deferred until every `Gongfa` needed by their three-choice offering is authored.

## First Fully Authored Root

The first fully playable root is `Metal`.

The full-game content target is at least six single-root `Gongfa` per element, plus separately authored hybrids. The first slice intentionally proves the system with a smaller pool.

`Burning Ring Scripture` is also authored as the pure-Fire option required by the playable `Fire + Metal` profile. It uses a rotating heat aura that rewards close positioning and sustained exposure.

- Skill 1: `Revolving Flame Ring`
- Skill tags: `aura`, `fire`
- Defining passive: `Kindled Meridians`; aura hits build Heat that globally accelerates `aura` Skills and decays outside danger
- Rank-10 Skill 2: `Solar Flare Cycle`, an independently timed full-ring synchronization and expanding fire wave
- Pre-rank-10 Mastery develops ring geometry/damage, the counter-rotating ring, and Heat generation, retention, or global aura synergy

The `Fire + Metal` choice set contains `Burning Ring Scripture`, the hybrid `Crimson Furnace Sword Art`, and one randomly selected Metal `Gongfa`.

`Crimson Furnace Sword Art` package:

- Skill 1: `Furnace Needles`, focused blades that embed and detonate
- Skill tags: `projectile`, `explosive`, `fire`, `metal`
- Defining passive: `Crucible Pressure`; explosions build Pressure that globally increases `explosive` Skill radius
- Rank-10 Skill 2: `Furnace Cascade`, which detonates existing embeds and scatters chain-starting heated fragments
- Pre-rank-10 Mastery develops needle damage/cycling, embed thresholds, explosion size, and Pressure generation, retention, or global explosive synergy

### Metal Gongfa Trio

#### Yujian Jue

- Behavior: auto-targeted flying sword volleys
- Skill tags: `projectile`, `metal`, `sword`
- Defining passive: `Unbroken Sword Intent`; hits build up to five stacks, Yujian gains damage, all `projectile` Skills gain flight speed and full-stack pierce, and taking damage clears the stacks
- Scaling: sword count and pierce efficiency
- Support stat: cooldown recovery
- Rank-10 Skill 2: an independently timed sword formation sweeps outward and returns while Skill 1's homing volleys continue
- Pre-rank-10 Mastery improves sword count, cycling, pierce, Intent damage, Intent duration, or stack retention on damage

#### Jinfeng Gong

- Skill 1: movement-aimed `Cutting Front` waves
- Skill tags: `wave`, `metal`
- Defining passive: `Gale Momentum`; sustained movement globally improves width and range for `wave` Skills, while stopping causes decay
- Scaling: wave width and cut damage
- Support stat: range extension
- Rank-10 Skill 2: `Golden Gale Corridor`, an independently timed lingering lane of cutting qi
- Pre-rank-10 Mastery improves Cutting Front damage/shape and Gale Momentum buildup, retention, or global wave synergy

#### Gengjin Huti

- Skill 1: `Gengjin Guard`, a close aura with retaliatory edge bursts
- Skill tags: `aura`, `metal`, `defensive`
- Defining passive: `Tempered Body`; nearby enemies build Guard that globally improves mitigation and `defensive` Skill potency
- Scaling: retaliation damage and guard stability
- Support stat: max health or mitigation efficiency
- Rank-10 Skill 2: `Blade Shell`, which stores endured pressure and erupts automatically at a threshold
- Pre-rank-10 Mastery develops aura damage/radius, retaliation, Guard mitigation, buildup, decay, and global defensive synergy

## Gameplay Flow

1. Spawn as a `Mortal` with movement as the only defense.
2. Survive early enemy pressure and route toward a guaranteed `Lingcao`.
3. Claim the `Lingcao` and Breakthrough into `Lianqi Chuqi`.
4. Reveal hidden `Linggen`.
5. Present exactly three compatible `Gongfa` choices.
6. Reach `Gongfa Mastery` thresholds and choose refinements that deepen the selected `Gongfa`.
7. Reach `Zhuji` and select a second compatible, unlearned `Gongfa`; existing packages remain unchanged.
8. Reach `Jindan` and select a third compatible, unlearned `Gongfa`; existing packages remain unchanged.
9. Finish the run under high-pressure late-game conditions.

## Implementation Scope

### Must Have

- Hidden `Linggen` generation at run start
- First `Breakthrough` flow: reveal -> `Gongfa` choice
- Data model for roots, profiles, realms, Gongfa packages, Skills, passives, and Mastery
- Stage progression for `Lianqi`, `Zhuji`, `Jindan`
- One fully implemented root with three playable `Gongfa`
- HUD updates for realm, root, Gongfa, and Mastery state
- Graybox visuals for the new systems

### Should Have

- A visible `Lingcao` world object or equivalent scripted opening trigger
- Realm-specific messaging for breakthroughs
- `Gongfa`-specific Mastery refinement pools

### Out of Scope

- Full five-element content matrix
- Root-adding `Linggen` evolution
- Pure `Fire` and pure `Water` profiles
- `Water + Metal` and `Water + Wood` profiles
- `Yuanying` and `Huashen`
- Meta progression and account-level unlock economy
- Final Chinese game title
- Exact `Foundation Growth` stats and scaling
- Exact `Spirit Treasure` effects and acquisition/replacement interaction

## Technical Direction

- Keep the current Phaser scene structure.
- Move progression identity into data:
  - `linggen.ts`
  - `gongfa.ts`
  - `stages.ts`
- Replace the current upgrade-only identity loop with explicit breakthrough phases.
- Reuse the existing three-choice panel for both root revelation and `Gongfa` selection, with event payloads generalized beyond upgrades.
- Preserve the current graybox texture approach for speed.
- Treat Run state as persistent serializable data rather than state owned only by the active scene.
- Define explicit safe checkpoints at Phase Transitions and completed Breakthrough/Gongfa selections; mid-combat Mastery choices do not autosave, and live enemies/projectiles are never serialized.

## Risks

- Overloading the current choice panel with multiple event types without a proper schema
- Building too many roots before one complete root is satisfying
- Balancing Foundation Growth so it matters without overshadowing Gongfa Mastery
- Making the opening too weak or too long before the first reveal

## Milestones

1. PRD and issue breakdown
2. Core progression skeleton: `Linggen`, `Breakthrough`, `Gongfa`, `Stage`
3. One complete `Metal` path with three methods
4. Realm reward and additional-Gongfa pass for `Zhuji` and `Jindan`
5. Additional roots after the vertical slice feels coherent
