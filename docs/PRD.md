# FQYY First Slice PRD

## Product Goal

Build a playable normal Run path for a xiuxian-themed action roguelite where the player chooses a Cultivator Candidate with a visible `Linggen`, begins weak, accumulates compatible `Gongfa`, advances from `Lianqi` through `Yuanying`, and defeats the Heavenly Tribulation.

## Problem

The current prototype has a competent survival loop, but it still behaves like a generic one-weapon survivor with xiuxian flavor text on top. The project needs a real cultivation progression model that changes how runs are structured and how combat identity emerges.

## Success Criteria

- The opening minute feels intentionally weak and transitions into a meaningful identity reveal.
- Starting a Run offers three Cultivator Candidates showing roots and qualitative Affinity Grades; choosing one fixes the initial `Linggen`.
- Candidate names and portraits may differ, but Linggen is their only initial gameplay difference; character-specific stats, talents, and starting items are deferred.
- Candidate offerings contain three distinct Linggen profiles, guarantee at least one single-root and one dual-root profile, and draw the third from the remaining pool using reproducible Run randomness.
- A Linggen profile becomes Candidate-eligible only after it supports at least three compatible Playable Gongfa with complete Skills, passives, Mastery Pools, Transformations, persistence, and functioning Skill 2 behavior.
- Placeholder or stat-only Gongfa never appear in Candidate compatibility or Breakthrough offerings.
- The player chooses 1 of 3 compatible `Gongfa` when Lingcao awakens that `Linggen` at the first Breakthrough.
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

After choosing one of three Cultivator Candidates, the player starts as a Mortal with no attack and must survive through movement and the shared `Evade` action. Under pressure, the player routes to a guaranteed early `Lingcao`, awakens the selected `Linggen`, and chooses a compatible `Gongfa` that begins the build. Later Breakthroughs preserve every learned Gongfa and add another compatible package.

## Locked Domain Decisions

- `Linggen` is innate and visibly selected from three Cultivator Candidates at Run start; roots and Affinity Grades are shown while exact affinities remain hidden.
- The Run begins in the `Mortal` state; claiming the `Lingcao` triggers the first Breakthrough into `Lianqi Chuqi` and grants Gongfa 1.
- The first Breakthrough freezes the pursuing enemy pack during reveal/selection and resumes against the same enemies after Gongfa 1 is chosen.
- Lingcao activates immediately on contact. Its Gongfa choice scene fully pauses combat simulation until resolved.
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
- Fast Mastery pacing targets rank 3 during Chuqi, rank 6 during Zhongqi, rank 9 during Houqi, and rank 10 early in Dayuanman of the acquisition Stage; Fully Mastered should occur around the end of the following Stage.
- Normal and Slow Mastery Speeds reach the same fixed milestones later; speed changes timing, never the contents or maximum power of the Gongfa.
- Normal Mastery reaches rank 10 late in Dayuanman of the acquisition Stage and becomes Fully Mastered during the following Stage.
- Slow Mastery reaches rank 10 around Zhongqi of the following Stage and becomes Fully Mastered roughly two Stages after acquisition; a Slow Yuanying Gongfa may not unlock Skill 2 before the normal ending.
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
- `Lingcao` awakens but does not determine or alter the selected `Linggen`.
- `Gongfa` is selected immediately after Lingcao awakens the selected `Linggen`.
- Exactly three compatible `Gongfa` options are presented.
- A dual-root selection prefers one unlearned `Gongfa` from each root and one unlearned hybrid; exhausted categories fall back to any compatible unlearned `Gongfa`.
- Each hybrid `Gongfa` is independently authored rather than generated by fusing single-root `Gongfa`.
- `Gongfa` is a complete cultivation package containing multiple `Skills` and passive bonuses, not a single attack mechanic.
- Every Gongfa has a three-axis Combat Profile covering Damage, Survival, and Control; all three must be present, while one or two may define its focus.
- Survival may come from mitigation, mobility, spacing, or recovery, and Control may come from shaping movement, density, targeting, or safe space; neither requires a dedicated defensive or crowd-control Skill.
- Gongfa passives may be internal or globally improve shared `Cultivator Attributes`/compatible Skills, creating cross-Gongfa synergy.
- Skills carry explicit compatibility tags; global Gongfa passives target tags rather than universally affecting all damage.
- Cross-Gongfa bonuses affecting the same tagged property stack additively from its base value; multiplicative or exceptional formulas require explicit Gongfa-specific authoring.
- Additive synergy has no general player-facing cap. Apply only stat-specific safety limits such as minimum activation intervals, maximum mitigation, and simulation-safe projectile counts.
- Each `Gongfa` has a starting signature `Skill` that establishes its initial combat expression.
- `Gongfa` has required `Linggen`, usually one root and at most two.
- `Gongfa` offers are generated from the cultivator's current roots at selection time, including roots added by earlier progression events.
- Stage advancement does not modify existing `Gongfa`, `Skills`, passives, or Mastery.
- Existing `Gongfa` improve only through their own Mastery tracks; baseline cultivator strength grows separately through automatic `Foundation Growth` at each Phase Transition.
- Gongfa accumulate by combat Stage: one at `Lianqi`, two at `Zhuji`, three at `Jindan`, and four at `Yuanying`.
- All learned `Gongfa` remain active with independent Mastery tracks; they are not divided into main and support roles.
- All first-slice `Skills` activate automatically; manual activation is outside the current control model.
- Selecting a `Gongfa` immediately grants its starting signature `Skill` and one defining passive; further contents unlock through `Gongfa Mastery`.
- Each first-slice `Gongfa` contains exactly two automatic `Skills`.
- Each `Gongfa` has an independent, finite Mastery track bounded by its authored Mastery Pool.
- Ordinary Mastery ranks offer three options drawn without category quotas from that Gongfa's whole available Refinement pool, and the player chooses one; ranks 3, 6, and 9 instead offer milestone-specific Transformations.
- Rank 10 automatically unlocks Skill 2; later choices can improve either Skill or the package's passives.
- Every Gongfa has a fixed, authored Mastery Pool used to balance its progression against other Gongfa; only the offering is randomized, never the effects themselves.
- Generic or procedurally generated upgrades cannot substitute for missing Gongfa-specific Mastery content.
- Every Mastery effect declares an explicit scope: named Skill, owning Gongfa, defining passive, Skill Tag, or Cultivator Attribute. Whole-package and cross-Gongfa effects are allowed only when stated explicitly.
- Remove ambiguous shared Method stats that silently alter multiple Skills.
- Initial authoring baseline per Gongfa: six starting Refinement families—two for Skill 1, two for the defining passive, and two for synergy or Cultivator Attributes—plus three unique Transformations at each of ranks 3, 6, and 9.
- Default Transformation roles are Skill-1 behavior at rank 3, passive or cross-Gongfa synergy at rank 6, and a Skill-1/passive capstone interaction at rank 9. A Gongfa may deviate when its identity requires a different sequence, but must preserve comparable structural value across the three milestones.
- Combat Profile axes are benchmark dimensions, not Transformation menu categories. Each milestone's three choices must retain comparable killing power while changing delivery, positioning, target preference, conditional payoff, or cross-Gongfa interaction.
- No Transformation should dominate both swarm clearing and elite/boss pressure; defensive or control value must support continued killing rather than become a low-output trap.
- Unlocking Skill 2 at rank 10 adds three Skill-2 Refinement families to the same pool.
- Skill 2 is an independent automatic behavior while Skill 1 continues operating. As a baseline, it interacts with Skill 1, the defining passive, or both, and increases the relevance of at least some earlier Mastery decisions rather than acting as an unrelated damage timer.
- Gongfa may deviate creatively in trigger and presentation—timed, cycle, threshold, retaliation, or another authored condition—while preserving that package-level interaction.
- Each Refinement family initially has two authored tiers; selecting it advances one tier, and it leaves the available pool after Tier 2.
- Rank 10 adds Skill 2 potency, coverage/count, and activation-speed improvements while unmaxed earlier options remain available.
- After rank 10, ordinary ranks continue drawing available Refinements until every authored tier is exhausted; the Gongfa then becomes Fully Mastered.
- A Fully Mastered Gongfa remains active but receives no further Mastery progress or choices from Qi.
- Simultaneous Mastery choices pause combat once and resolve sequentially in Gongfa acquisition order; automatic rank-10 unlocks require no panel.
- Mastery options use reproducible randomness derived from Run seed, Gongfa, and rank; replaying a Phase cannot reroll them.

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
- Defining passive: `Kindled Meridians`; aura hits build Heat from unique enemies per cycle with a buildup cap, Heat globally accelerates `aura` Skills, and it decays after a short period without aura damage. Repeated overlap ticks cannot instantly fill Heat.
- Rank-10 Skill 2: `Solar Flare Cycle` independently forms two complete concentric solar rings and releases expanding fire waves while Skill 1 continues. Damage, radius, and wave count scale from current Heat without consuming it, and each enemy builds Heat at most once per activation.
- Skill-2 Refinement families: `Solar Tempering` for damage, `Widened Corona` for radius/wave count, and `Accelerated Cycle` for cooldown/expansion speed. Each has two authored tiers.
- Starting Refinement families: `Scorching Passage` and `Broadened Flame` for Skill 1; `Gathering Heat` and `Banked Ember` for Heat; `Kindled Circulation` and `Ember Step` for aura-tag activation and Cultivator movement. Each has two authored tiers.
- Rank-3 Transformations: `Counterflow Ring` adds a second counter-rotating ring with intersection hot zones; `Condensed Furnace Ring` merges segments into fewer priority-burning hotspots; `Scattered Ember Orbit` makes segment hits leave short-lived burning patches.
- Rank-6 Transformations: `Banked Sun` prevents Heat from decaying below half while enemies remain nearby; `Aura Furnace` lets any aura-tagged Skill hit build Heat; `Meridian Ignition` turns full Heat into a brief high-output aura state before resetting it.
- Rank-9 Transformations: `Perfect Solar Orbit` uses Heat to add segments and close ring gaps; `Sunspot Collapse` periodically condenses the ring onto the highest-health nearby enemy before reforming it; `Phoenix Passage` leaves a temporary Heat-scaled ring copy at the origin of each Evade.

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
- Defining passive: `Unbroken Sword Intent`; a successful Skill-1 attack cycle grants one stack up to five and refreshes its duration. Each stack improves Yujian Skill damage and all `projectile` Skill flight speed; five stacks grant those Skills +1 pierce, and taking damage removes two stacks.
- Scaling: sword count and pierce efficiency
- Support stat: cooldown recovery
- Rank-10 Skill 2: `Returning Sword Formation` independently targets the densest lane, sends a sword array outward and back through enemies, and grants or refreshes one Intent stack when the formation hits while Skill 1 continues.
- Skill-2 Refinement families: `Formation Tempering` for damage, `Expanded Sword Array` for sword count and coverage, and `Swift Formation` for activation and return speed. Each has two authored tiers.
- Starting Refinement families: `Twin Sword Split` and `Refined Sword Channel` for Skill 1; `Sword Intent Sharpening` and `Steady Sword Heart` for the passive; `Swordborne Steps` and `Penetrating Intent` for Cultivator movement and projectile-tag synergy. Each has two authored tiers.
- Rank-3 Transformations: `Execution Seal` makes repeated Skill-1 hits escalate against a marked priority target; `Sword Bloom` splits the first hit into weaker swords seeking different enemies; `Reversing Sword Path` sends the sword back through enemies toward the Cultivator.
- Rank-6 Transformations: `Still Sword Heart` prevents incoming damage from removing Intent; `Myriad Blade Resonance` lets other projectile-tagged Skills build or refresh Intent; `Intent Unleashed` empowers the next Yujian volley at five stacks and consumes those stacks.
- Rank-9 Transformations: `Sword Crown` adds weaker spectral swords based on current Intent; `Intent Domain` leaves short-lived blade fields whose size and duration scale with Intent; `Void-Step Formation` makes the next Skill-1 cycle attack from both ends of an Evade path.

#### Jinfeng Gong

- Skill 1: movement-aimed `Cutting Front` waves
- Skill tags: `wave`, `metal`
- Defining passive: `Gale Momentum`; movement builds Momentum slowly, moving `Cutting Front` hits and Evade grant larger bursts, and stopping causes rapid decay. Momentum globally improves width and range for `wave` Skills.
- Scaling: wave width and cut damage
- Support stat: range extension
- Rank-10 Skill 2: `Golden Gale Corridor` independently projects a lingering cutting lane in the movement direction; it carries the `wave` tag, scales its width/range from Momentum, and delays Momentum decay when it hits while Skill 1 continues.
- Skill-2 Refinement families: `Corridor Edge` for repeated-hit damage, `Expanding Passage` for width/length/duration, and `Rapid Crosswinds` for activation and cutting frequency. Each has two authored tiers.
- Starting Refinement families: `Cutting Qi Pressure` and `Broadened Front` for Skill 1; `Gathering Gale` and `Unbroken Stride` for Momentum; `Windborne Reach` and `Gale-Fed Footwork` for wave-tag synergy and Cultivator movement. Each has two authored tiers.
- Rank-3 Transformations: `Heaven-Splitting Line` compresses Skill 1 into a long penetrating lane; `Golden Gale Fan` spreads it across a broad frontal arc; `Crescent Wake` periodically leaves cutting crescents along the Cultivator's movement route.
- Rank-6 Transformations: `Unbroken Current` prevents Momentum decay while moving; `Ten-Thousand Wave Resonance` lets any wave-tagged Skill hit build Momentum; `Gale Detonation` spends part of full Momentum to add a crossing wave to the next Cutting Front.
- Rank-9 Transformations: `Endless Horizon` makes Cutting Front grow while traveling based on Momentum; `Walking Storm` creates periodic radial cutting waves at high Momentum; `Gale-Step Severance` cuts a Momentum-scaled corridor along each Evade path.

#### Gengjin Huti

- Skill 1: `Gengjin Guard`, a close aura with retaliatory edge bursts
- Skill tags: `aura`, `metal`, `defensive`
- Defining passive: `Tempered Body`; nearby enemies build Guard continuously, damage prevented by Guard grants a larger burst, and Evading through nearby enemies grants a smaller burst. Guard improves mitigation plus the damage/radius of `defensive` Skills and decays outside danger.
- Scaling: retaliation damage and guard stability
- Support stat: max health or mitigation efficiency
- Rank-10 Skill 2: `Blade Shell` charges from damage prevented by Guard and close Evades, then automatically erupts in a defensive-tagged blade burst whose damage, radius, and count scale with current Guard; it never requires losing health.
- Skill-2 Refinement families: `Tempered Shell` for eruption damage, `Layered Eruption` for blade count/coverage, and `Rapid Reforging` for charge gain/frequency. Each has two authored tiers.
- Starting Refinement families: `Guard Pressure` and `Expanding Guard` for Skill 1; `Lasting Temper` and `Bulwark Reflection` for Guard; `Unyielding Shield` and `Iron Meridian` for defensive-tag synergy and maximum health. Each has two authored tiers.
- Rank-3 Transformations: `Rebounding Edge` launches a focused blade toward the source of prevented damage; `Hundred-Blade Halo` turns Guard into a rotating close-range blade halo; `Iron Wake` leaves a temporary cutting wall along each Evade path.
- Rank-6 Transformations: `Immovable Mountain` greatly increases Guard gain and defensive-Skill damage while standing still; `Flowing Iron Body` makes Evade grant more Guard and release a defensive shockwave; `Ten-Thousand Armor Resonance` lets any defensive-tagged Skill hit build Guard.
- Rank-9 Transformations: `Gengjin Fortress` turns current Guard into orbiting defensive blades; `Iron Gravity Domain` pulls nearby enemies into repeated aura bursts at high Guard; `Unbroken Advance` makes high-Guard movement damage and push enemies while empowering Evade as a breakthrough strike.

## Gameplay Flow

1. Choose one of three Cultivator Candidates showing roots and Affinity Grades.
2. Spawn as that `Mortal` with movement and `Evade` as the only defenses.
3. Survive early enemy pressure and route toward a guaranteed `Lingcao`.
4. Claim the `Lingcao`, awaken the selected `Linggen`, and Breakthrough into `Lianqi Chuqi`.
5. Present exactly three compatible `Gongfa` choices.
6. Reach `Gongfa Mastery` thresholds and choose refinements that deepen the selected `Gongfa`.
7. Reach `Zhuji` and select a second compatible, unlearned `Gongfa`; existing packages remain unchanged.
8. Reach `Jindan` and select a third compatible, unlearned `Gongfa`; existing packages remain unchanged.
9. Finish the run under high-pressure late-game conditions.

## Implementation Scope

### Must Have

- Seeded generation of three visible Cultivator Candidates at Run start
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
