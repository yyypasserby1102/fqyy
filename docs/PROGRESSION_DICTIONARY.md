# FQYY Progression Dictionary

This document is the practical dictionary for the game's progression tree. It exists to answer:

- what can a run roll at the start
- what choices can appear after the first `Breakthrough`
- how `Gongfa` progresses through Mastery
- what is real content versus scaffolding

Use this alongside [CONTEXT.md](/home/yiyuny/game-dev/fqyy/CONTEXT.md). `CONTEXT.md` defines terms; this file maps the current progression structure.

## Progression Shape

The first-slice Run is persistent and resumable across play sessions. Its progression currently follows this structure:

- safe checkpoints follow automatic Phase milestones and completed Breakthrough/Gongfa selections; mid-combat Mastery choices do not autosave
- saves contain durable Run state, not live combat entities
- resume reconstructs the next combat segment
- quitting or crashing mid-combat discards the incomplete segment and resumes from the latest safe checkpoint
- death removes the resumable Run save
- each player profile has one active Run save; a new Run requires confirmed abandonment
- settings and future meta progression are stored separately from Run state
- each ordinary Phase milestone advances and autosaves automatically; the Dayuanman Tribulation/Breakthrough remains the explicit checkpoint and there are no manual in-Run save controls
- abandonment clears the active save and grants no victory

1. Choose one of three Cultivator Candidates showing roots and Affinity Grades
2. Start as a `Mortal` with no attack; evade through movement and the shared `Evade` action while routing to the guaranteed `Lingcao`
   - direction and distance are marked from spawn
   - exact valid position may vary deterministically by Run seed
   - only slow melee pursuers spawn before Gongfa 1; no ranged enemies, divers, slows, or hazards
3. Claim the `Lingcao` and Breakthrough into `Lianqi Chuqi`
   - activation is immediate on contact with no channel time
4. Awaken the selected `Linggen`
5. Choose 1 of 3 compatible `Gongfa`
   - enemies, projectiles, spawns, and timers are fully paused during selection
   - the Mortal enemy pack remains and resumes after selection
6. Refine learned `Gongfa` through independent Mastery tracks
7. Advance into `Zhuji` and add a second `Gongfa`
8. Advance into `Jindan` and add a third `Gongfa`

## Realm Tree

Every combat realm contains the ordered Phases `Chuqi -> Zhongqi -> Houqi -> Dayuanman`. Each Phase is one bounded combat segment and safe-checkpoints on completion. Dayuanman leads to the realm's concluding Tribulation.

Qi fills a segmented Realm Progress bar across the four Phases. Reaching an ordinary threshold starts cleanup, then advances automatically with a visible Foundation Growth reward. Clearing Dayuanman unlocks the explicit Tribulation checkpoint, whose defeat triggers the next Breakthrough and Gongfa slot. Gongfa Mastery progresses independently.

At a Phase threshold, new spawns stop and all remaining enemies must be defeated. After the final enemy dies, all remaining Qi Orbs are collected automatically. An ordinary Phase milestone grants Foundation Growth on the top progress bar, resolves queued Mastery Transformation choices, autosaves, and begins the next Phase without pausing; enemies are neither despawned nor carried across. Exact Foundation Growth stats and scaling remain deferred.

Tribulation escalation:

- `Lianqi`: short survival pressure trial
- `Zhuji`: elite encounter with supporting adds
- `Jindan`: single-phase boss
- `Yuanying`: multi-phase Heavenly Tribulation

Phase grammar within every combat realm:

- `Chuqi`: introduce the realm's enemy roster and pressure pattern
- `Zhongqi`: increase density and mix enemy roles
- `Houqi`: add an elite or environmental hazard
- `Dayuanman`: combine all established threats at peak pressure before the Tribulation

Each combat realm has its own arena and enemy identity. All four Phases reuse that arena; the Breakthrough after its Tribulation moves the Run to the next realm's arena.

The first complete normal path uses one fixed arena for each realm. Later replayability may draw from realm-specific arena pools.

Fixed route:

- Mortal opening + `Lianqi`: Fallen Sect Courtyard
- `Zhuji`: Mist Bamboo Valley
- `Jindan`: Burial Ridge
- `Yuanying`: Cloudbreak Summit and the Heavenly Tribulation

Enemy identity:

- Fallen Sect Courtyard: corrupted sect remnants and scavenging beasts; basic melee pressure
- Mist Bamboo Valley: spirit beasts and animated flora; divers, slows, and pathing pressure
- Burial Ridge: corpse cultivators and resentful spirits; ranged curses, summons, and area denial
- Cloudbreak Summit: celestial constructs and tribulation shades; projectiles, collapsing safe zones, and coordinated elites

Demon Market Outskirts is deferred as a future alternate arena.

Current playable realm ladder:

- `Lianqi`
  - entry: first Breakthrough from Mortal after claiming Lingcao
  - role: unstable opening and first Gongfa acquisition
- `Zhuji`
  - realm-progress threshold: first-slice tuning TBD
  - role: build stabilization through a second Gongfa
- `Jindan`
  - realm-progress threshold: first-slice tuning TBD
  - role: domination spike through a third Gongfa

Deferred realms:

- `Yuanying`: full combat phase; acquire Gongfa 4, build its Mastery, then face the normal-ending Tribulation
- final boss: the celestial `Yuanying Heavenly Tribulation`, using lightning judgment, tribulation shades, and collapsing safe zones; defeat grants the normal ending
- boss progression: shades drop Qi, Mastery continues, choices resolve between phases, and Realm Progress is disabled
- victory: show summary, clear active Run save, write permanent completion record, and end without free roam or endless continuation
- `Huashen`: hidden, difficult, non-combat true ending requiring a complete five-root Linggen; route mechanics deferred

## Linggen Pool

Three Cultivator Candidates are generated at Run start from the playable Linggen pool. Roots and qualitative Affinity Grades are visible, exact affinities remain hidden, and choosing one fixes the Run's initial Linggen:

Candidate names and portraits may vary, but Linggen is their only initial gameplay difference; character-specific stats, talents, and starting items are deferred.

The three profiles are distinct, guarantee at least one single-root and one dual-root Candidate, and draw the third from the remaining pool using reproducible Run randomness.

A profile is Candidate-eligible only when it supports at least three compatible Playable Gongfa. Stat-only or incomplete Gongfa do not count and never enter Run offerings.

### Single-root

- `Metal Linggen`
  - roots: `metal`
  - identity: sharp and efficient

### Dual-root

- `Fire-Metal Linggen`
  - roots: `fire + metal`
  - identity: volatile and offensive

Scaffolded or deferred until every Gongfa required by the profile's offering is authored:

- `Fire Linggen`
  - roots: `fire`
  - identity: aggressive and focused
- `Water Linggen`
  - roots: `water`
  - identity: stable and controlled

- `Water-Metal Linggen`
  - roots: `water + metal`
  - identity: technical and adaptive
- `Water-Wood Linggen`
  - roots: `water + wood`
  - identity: resilient and flexible

### Rule

- Single-root is narrower and more efficient
- Dual-root is broader and more flexible
- Cultivation Efficiency changes realm-advancement and Gongfa-development speed, not direct combat stats
- Narrower Linggen progress faster early; broader Linggen begin closer to the five-root requirement for entering `Huashen`
- Every present root has an integer Root Affinity from `1` to `10`; all affinities in one `Linggen` total exactly `10`
- exact values are hidden; display Affinity Grades `Weak` (1–3), `Medium` (4–6), and `Strong` (7–10)
- any present root satisfies compatible Gongfa requirements regardless of Grade; Grade affects speed only
- Adding a root randomly redistributes the same `10` points without reversing existing roots' relative strength order; ties are allowed
- Example: Fire `10` can become Fire `8` / Water `2` when Water is added
- Realm-advancement speed is derived from the strongest current Root Affinity
- Single-root Gongfa development uses the required root's affinity
- Hybrid Gongfa development uses the arithmetic average of its two required roots' affinities
- Gongfa choice cards show Mastery Speed `Slow` (1–3), `Normal` (4–6), or `Fast` (7–10), using the hidden hybrid average when applicable
- Fast Mastery should reach rank `3` during Chuqi, rank `6` during Zhongqi, rank `9` during Houqi, and rank `10` early in Dayuanman of the acquisition Stage, then become Fully Mastered around the end of the following Stage
- Normal and Slow Mastery Speeds delay the same milestones without changing Gongfa contents or maximum power
- Normal Mastery reaches rank `10` late in Dayuanman of the acquisition Stage and becomes Fully Mastered during the following Stage
- Slow Mastery reaches rank `10` around Zhongqi of the following Stage and becomes Fully Mastered roughly two Stages after acquisition; a Slow Yuanying Gongfa may not unlock Skill 2 before the normal ending
- Realm Progress and Gongfa Mastery are separate meters filled simultaneously by the same Qi pickups
- Every learned Gongfa receives the full base Mastery value from each Qi pickup; Mastery Qi is not divided among Gongfa
- Realm Progress thresholds trigger Phase cleanup; Dayuanman cleanup and Stage Tribulation victory trigger Breakthroughs; ordinary Gongfa Mastery thresholds integrate deterministic Refinements automatically, while ranks `3`, `6`, and `9` trigger Transformation choices
- Qi is not manually allocated between the two meters
- Each combat-Stage Breakthrough adds one Gongfa slot while preserving all learned Gongfa
- Learned Gongfa are excluded from future offerings; if fewer than three compatible unlearned Gongfa remain, show fewer choices rather than duplicates
- Breakthrough offerings are deterministic from Run seed, destination Stage, current Linggen, and learned Gongfa; reload cannot reroll them
- after a Tribulation, advance to the next realm at Chuqi, fill the new Gongfa slot, autosave, then load the next arena
- Gongfa capacity is one at `Lianqi`, two at `Zhuji`, three at `Jindan`, and four at `Yuanying`
- `Yuanying` is a full combat phase with substantial time to develop Gongfa 4 before its final Tribulation grants the normal ending
- `Huashen` adds no Gongfa; its hidden route and five-root completion mechanics are intentionally deferred
- the hidden Huashen path does not block the normal Yuanying ending
- An initial `Linggen` contains one or two roots
- Exceptional later progression can add roots without removing existing ones, up to all five elemental roots; exact mechanics deferred
- An added root changes Cultivation Efficiency immediately and expands `Gongfa` eligibility at the next Stage `Breakthrough`
- Adding a root does not transform any learned `Gongfa`
- Root-adding evolution is not part of the first slice

## Gongfa Dictionary

General rules:

- A `Gongfa` is a package of multiple Skills and passive bonuses, not one attack mechanic
- every Gongfa has a Combat Profile across Damage, Survival, and Control; all three must be present while one or two may be emphasized
- Survival may use mitigation, mobility, spacing, or recovery; Control may shape movement, density, targeting, or safe space
- Gongfa passives may affect only their own package or globally improve Cultivator Attributes and compatible Skills from other Gongfa
- thematic global passives provide cross-Gongfa synergy without a generic Qi-upgrade track
- Skills carry explicit tags such as `projectile`, `aura`, `fire`, or `defensive`; global passives target tags rather than all damage
- bonuses from different Gongfa to the same tagged property stack additively from its base value; exceptional formulas must be explicitly authored
- additive synergy has no general cap; only stat-specific safety limits constrain degenerate cooldown, mitigation, or entity-count outcomes
- The pattern listed for each Gongfa describes its starting signature Skill
- A `Gongfa` is offered only if its required roots are included in the selected and awakened `Linggen`
- Most `Gongfa` require one root
- Every supported dual-root profile has a hybrid `Gongfa` requiring both roots
- Hybrid `Gongfa` are independently authored with their own identity and Mastery progression, never generated by combining single-root `Gongfa`
- All learned Gongfa remain active and keep independent Mastery tracks; there are no main and support roles
- A `Gongfa` contains multiple Skills and passive bonuses
- All first-slice Skills activate automatically
- Selecting a Gongfa grants its starting signature Skill and one defining passive immediately; Mastery unlocks or improves the rest of the package
- Each first-slice Gongfa contains exactly two automatic Skills
- Gongfa Mastery is independent and finite for each learned Gongfa
- ordinary Mastery ranks integrate one reproducibly selected Refinement from the Gongfa's available authored pool without pausing combat
- ranks `3`, `6`, and `9` instead offer three milestone-specific Transformations; the chosen Transformation becomes permanent and the other two never return during that Run
- rank `10` automatically unlocks Skill 2; later ordinary ranks automatically integrate remaining authored Refinements for either Skill or the package's passives
- every Gongfa has a fixed, authored Mastery Pool so its total progression budget can be compared with other Gongfa
- generic health, movement, orb-collection, recovery, or procedurally generated upgrades cannot substitute for missing Gongfa-specific Mastery content
- every Mastery effect explicitly scopes itself to a named Skill, the owning Gongfa, the defining passive, a Skill Tag, or a Cultivator Attribute
- whole-package and cross-Gongfa effects are valid only when stated explicitly; ambiguous shared Method stats are prohibited
- initial pool baseline: six starting Refinement families—two Skill 1, two passive, and two synergy/Cultivator Attribute—plus three unique Transformations for each of ranks `3`, `6`, and `9`
- default Transformation roles are Skill-1 behavior at rank `3`, passive/synergy at rank `6`, and a Skill-1/passive capstone at rank `9`; individual Gongfa may deviate while preserving comparable structural value
- Combat Profile axes benchmark outcomes rather than define the three Transformation buttons
- milestone choices preserve comparable killing power while changing delivery, positioning, target preference, conditional payoff, or cross-Gongfa interaction
- no Transformation should dominate both swarm and elite/boss pressure; defensive or control value must help sustain killing output
- rank `10` adds three Skill-2 Refinement families to the same pool
- Skill 2 operates independently while Skill 1 continues and should interact with Skill 1, the defining passive, or both
- Skill 2 should increase the relevance of at least some earlier Mastery decisions; its automatic trigger remains Gongfa-specific rather than restricted to one timing model
- each Refinement family initially has two authored tiers; selecting it advances one tier, and it leaves the pool after Tier `2`
- with the initial pool template, Fully Mastered occurs near rank `22`
- rank `10` adds three Skill-2 improvement families—potency, coverage/count, and activation speed—while unmaxed earlier options remain
- after rank `10`, ordinary ranks continue until every available authored Refinement tier is selected; the Gongfa then becomes Fully Mastered
- a Fully Mastered Gongfa remains active but receives no further Mastery progress or choices from Qi
- simultaneous Mastery choices pause combat once and queue in Gongfa acquisition order; rank-10 unlocks do not open a choice panel
- each rank's options use reproducible randomness derived from Run seed, Gongfa, and rank; checkpoint replay cannot reroll them
- Full-game baseline: at least six single-root Gongfa per element, with hybrid Gongfa additional to that count
- Support `Gongfa` is not a separate slot or system

### Metal Root

This is the most intentional root path right now.

- `Yujian Jue`
  - required roots: `metal`
  - pattern: `homing`
  - fantasy: disciplined flying sword control
  - status: primary first-slice path
- `Jinfeng Gong`
  - required roots: `metal`
  - pattern: `wave`
  - fantasy: frontal cutting-wave pressure
  - status: primary first-slice path
- `Gengjin Huti`
  - required roots: `metal`
  - pattern: `aura`
  - fantasy: defensive metal body with retaliation
  - status: primary first-slice path

#### Metal Mastery Tree

This is the first branch that should be treated as a fully authored reference path.

##### Entry Condition

- selected run-start `Linggen`: `Metal Linggen`
- first `Breakthrough`: awaken `Metal Linggen`
- immediate `Gongfa` choice: exactly one of the three Gongfa below

##### Branch A: Yujian Jue

- starting package
  - Skill tags: `projectile`, `metal`, `sword`
  - core state:
    - one disciplined flying sword
    - low pierce
    - single-target pressure
  - defining passive: `Unbroken Sword Intent`
    - a successful attack cycle grants one stack regardless of hit count
    - maximum 5 stacks; hits refresh duration
    - stacks improve Yujian damage and globally improve flight speed for all `projectile` Skills
    - full stacks grant +1 pierce to every `projectile` Skill
    - taking damage removes two stacks
    - exact percentages and duration remain tuning parameters
  - player fantasy:
    - controlled precision
    - clean kiting
- Mastery development
  - refinement:
    - multiple swords per volley
    - better pierce
    - smoother target clearing
  - intended feeling:
    - the starting Skill becomes reliable rather than improvised
- rank-10 Skill 2
  - behavior:
    - `Returning Sword Formation` targets the densest enemy lane and sends a sword array outward and back through enemies on an independent cooldown
    - normal Skill 1 homing volleys continue operating alongside it
    - the formation uses Yujian damage bonuses and projectile-tag effects from Intent
    - a formation that hits grants or refreshes one Intent stack regardless of hit count
  - intended feeling:
    - battlefield command rather than simple projectile spam
  - Refinement families:
    - `Formation Tempering`: formation damage
    - `Expanded Sword Array`: sword count and coverage
    - `Swift Formation`: activation and return speed
    - each family has two authored tiers
- refinement nodes:
  - `Twin Sword Split`
    - Skill 1 gains more swords per volley
  - `Refined Sword Channel`
    - Skill 1 cycles faster
  - `Sword Intent Sharpening`
    - Yujian Skills gain a stronger damage bonus per Intent stack
  - `Steady Sword Heart`
    - Intent lasts longer, then loses fewer stacks when damaged
  - `Swordborne Steps`
    - Intent grants Cultivator movement speed
  - `Penetrating Intent`
    - Intent grants stronger projectile flight speed and full-stack pierce
  - each family has two authored tiers and an explicit Effect Scope
- rank-3 exclusive Transformations:
  - `Execution Seal`: repeated Skill-1 hits escalate against a marked priority target
  - `Sword Bloom`: the first hit splits into weaker swords seeking different enemies
  - `Reversing Sword Path`: the sword returns through enemies toward the Cultivator after striking
- rank-6 exclusive Transformations:
  - `Still Sword Heart`: incoming damage no longer removes Intent
  - `Myriad Blade Resonance`: other projectile-tagged Skills can build or refresh Intent
  - `Intent Unleashed`: five stacks empower the next Yujian volley and are then consumed
- rank-9 exclusive Transformations:
  - `Sword Crown`: Skill 1 gains weaker spectral swords based on current Intent
  - `Intent Domain`: Skill-1 impacts leave short blade fields whose size and duration scale with Intent
  - `Void-Step Formation`: after Evade, the next Skill-1 cycle attacks from both ends of the Evade path, scaling with Intent

##### Branch B: Jinfeng Gong

- starting package
  - Skill 1: `Cutting Front`
  - Skill tags: `wave`, `metal`
  - core state:
    - short frontal cutting waves
    - route-dependent pressure
    - stronger lane control than tracking
  - defining passive: `Gale Momentum`
    - movement builds Momentum slowly
    - moving `Cutting Front` hits and Evade grant larger Momentum bursts
    - momentum globally increases width and range for all `wave` Skills
    - stopping causes Momentum to decay rapidly
  - player fantasy:
    - face danger and cut a path open
- Mastery development
  - refinement:
    - broader wave fan
    - more wave count
    - better crowd control in front arc
  - intended feeling:
    - the starting Skill becomes assertive instead of tentative
- rank-10 Skill 2: `Golden Gale Corridor`
  - behavior:
    - independently projects a lingering lane in the Cultivator's movement direction while Cutting Front continues
    - repeatedly damages enemies crossing the corridor
    - carries the `wave` tag, scales width/range from Momentum, and delays Momentum decay when it hits
  - intended feeling:
    - the player owns space instead of merely firing through it
  - Refinement families:
    - `Corridor Edge`: repeated-hit damage
    - `Expanding Passage`: width, length, and duration
    - `Rapid Crosswinds`: activation and cutting frequency
    - each family has two authored tiers
- refinement nodes:
  - `Cutting Qi Pressure`
    - more Cutting Front damage
  - `Broadened Front`
    - wider waves and greater wave count
  - `Gathering Gale`
    - stronger Momentum gain from hits and movement
  - `Unbroken Stride`
    - Momentum decays more slowly
  - `Windborne Reach`
    - stronger Momentum scaling for all `wave` Skills
  - `Gale-Fed Footwork`
    - Momentum grants Cultivator movement speed
  - each family has two authored tiers and an explicit Effect Scope
- rank-3 exclusive Transformations:
  - `Heaven-Splitting Line`: compress Cutting Front into a long penetrating lane
  - `Golden Gale Fan`: spread Cutting Front across a broad frontal arc
  - `Crescent Wake`: periodically leave cutting crescents along the Cultivator's movement route
- rank-6 exclusive Transformations:
  - `Unbroken Current`: Momentum no longer decays while the Cultivator is moving
  - `Ten-Thousand Wave Resonance`: hits from any wave-tagged Skill build Momentum
  - `Gale Detonation`: full Momentum partly fuels a second crossing wave on the next Cutting Front
- rank-9 exclusive Transformations:
  - `Endless Horizon`: Cutting Front grows while traveling based on Momentum
  - `Walking Storm`: high Momentum produces periodic radial cutting waves around the moving Cultivator
  - `Gale-Step Severance`: Evade cuts a Momentum-scaled corridor along its path

##### Branch C: Gengjin Huti

- starting package
  - Skill 1: `Gengjin Guard`
  - Skill tags: `aura`, `metal`, `defensive`
  - core state:
    - defensive aura
    - retaliatory close-range edge bursts
    - danger-conversion playstyle
  - defining passive: `Tempered Body`
    - nearby enemies build Guard continuously
    - damage prevented by Guard grants an additional burst; Evading through nearby enemies grants a smaller burst
    - Guard globally improves mitigation plus damage/radius for `defensive` Skills
    - Guard decays outside danger
  - player fantasy:
    - endure pressure and answer it
- Mastery development
  - refinement:
    - stronger guard expression
    - larger aura radius
    - retaliation becomes dependable rather than incidental
  - intended feeling:
    - close-range survival becomes deliberate and stable
- rank-10 Skill 2: `Blade Shell`
  - behavior:
    - charges from damage prevented by Guard and close Evades without requiring health loss
    - automatically erupts outward at a threshold while Skill 1 continues
    - damage, radius, and blade count scale from current Guard
    - charge resets after eruption
    - defensive posture becomes offensive inevitability
  - intended feeling:
    - enemies commit into your domain and pay for it
  - Refinement families:
    - `Tempered Shell`: eruption damage
    - `Layered Eruption`: blade count and coverage
    - `Rapid Reforging`: charge gain and threshold frequency
    - each family has two authored tiers
- refinement nodes:
  - `Guard Pressure`
    - more aura and edge-burst damage
  - `Expanding Guard`
    - larger aura radius
  - `Lasting Temper`
    - stronger Guard gain from proximity, prevented damage, and Evade
  - `Bulwark Reflection`
    - slower Guard decay
  - `Unyielding Shield`
    - stronger Guard scaling for all `defensive` Skills
  - `Iron Meridian`
    - greater Cultivator maximum health
  - each family has two authored tiers and an explicit Effect Scope
- rank-3 exclusive Transformations:
  - `Rebounding Edge`: prevented damage launches a focused blade toward its source
  - `Hundred-Blade Halo`: Guard becomes a rotating close-range blade halo
  - `Iron Wake`: Evade leaves a temporary cutting wall along its path
- rank-6 exclusive Transformations:
  - `Immovable Mountain`: standing still greatly increases Guard gain and defensive-Skill damage
  - `Flowing Iron Body`: Evade grants a stronger Guard burst and releases a defensive shockwave
  - `Ten-Thousand Armor Resonance`: hits from any defensive-tagged Skill build Guard
- rank-9 exclusive Transformations:
  - `Gengjin Fortress`: current Guard controls orbiting defensive blades
  - `Iron Gravity Domain`: high Guard pulls nearby enemies into repeated aura bursts
  - `Unbroken Advance`: high-Guard movement damages and pushes enemies while empowering Evade

##### Authoring Goal

The `Metal` tree should become the benchmark for all later branches:

- each `Gongfa` must feel different by minute 2
- Mastery ranks must develop the whole package rather than only increase numbers
- rank 10 must add a distinct second Skill, after which Mastery improvements continue

The current three Metal Gongfa are sufficient only for the vertical slice. A full pure-root path needs at least six Gongfa so the four acquisitions through Yuanying can each present three unlearned choices.

### Fire Root

- `Blazing Feather Art`
  - required roots: `fire`
  - pattern: `homing`
  - fantasy: blazing feather shots
  - rank-10 Skill 2: `Feather Rain Formation`, successive fans of retargeting homing feathers whose count and damage scale from Embers
  - status: Skill-2 behavior authored; full package implementation remains incomplete
- `Burning Ring Scripture`
  - required roots: `fire`
  - Skill 1: `Revolving Flame Ring`
  - Skill tags: `aura`, `fire`
  - fantasy: segmented rotating flame ring that rewards close positioning and sustained exposure
  - starting Skill: enemies take damage when rotating flame segments sweep through them; readable gaps preserve positioning risk
  - defining passive: `Kindled Meridians`
    - aura hits build Heat from unique enemies per cycle, subject to a buildup cap
    - Heat globally increases activation speed for all `aura` Skills
    - Heat decays after a short period without aura damage
    - repeated overlap ticks cannot instantly fill Heat
  - Mastery development: add a counter-rotating ring at a different radius; segment intersections create brief high-damage hot zones
  - rank-10 Skill 2: `Solar Flare Cycle`
    - independently form two complete concentric solar rings and release expanding fire waves while Skill 1 continues
    - damage, radius, and wave count scale from current Heat without consuming it
    - each enemy builds Heat at most once per activation
  - Skill-2 Refinement families:
    - `Solar Tempering`: damage
    - `Widened Corona`: radius and wave count
    - `Accelerated Cycle`: cooldown and expansion speed
    - each family has two authored tiers
  - pre-rank-10 Mastery pool:
    - `Scorching Passage`: more Skill 1 damage
    - `Broadened Flame`: wider flame segments and larger ring radius
    - `Gathering Heat`: more Heat from unique targets
    - `Banked Ember`: longer delay and slower Heat decay
    - `Kindled Circulation`: stronger Heat-based activation speed for all `aura` Skills
    - `Ember Step`: Heat grants Cultivator movement speed
    - each family has two authored tiers and an explicit Effect Scope
    - the counter-rotating ring is structural Transformation content rather than a Refinement
  - rank-3 exclusive Transformations:
    - `Counterflow Ring`: add a second counter-rotating ring with intersection hot zones
    - `Condensed Furnace Ring`: merge segments into fewer priority-burning hotspots
    - `Scattered Ember Orbit`: segment hits leave short-lived burning patches
  - rank-6 exclusive Transformations:
    - `Banked Sun`: Heat cannot decay below half while enemies remain nearby
    - `Aura Furnace`: hits from any aura-tagged Skill build Heat
    - `Meridian Ignition`: full Heat starts a brief high-output aura state, then resets
  - rank-9 exclusive Transformations:
    - `Perfect Solar Orbit`: Heat adds flame segments and closes the ring's gaps
    - `Sunspot Collapse`: periodically condense the ring onto the highest-health nearby enemy before reforming it
    - `Phoenix Passage`: Evade leaves a temporary Heat-scaled ring copy at its origin
  - status: authored first-slice option for `Fire-Metal Linggen`
- `Scarlet Wave Manual`
  - required roots: `fire`
  - pattern: `wave`
  - fantasy: scorching crescents
  - rank-10 Skill 2: `Sunset Wave Apex`, opposing crescent walls that cross for a second hit and scale from Scorch
  - status: Skill-2 behavior authored; full package implementation remains incomplete

### Water Root

- `Drifting Frost Needle`
  - required roots: `water`
  - pattern: `homing`
  - fantasy: curved frost needles
  - rank-10 Skill 2: `Mirror Needle Constellation`, an orbit that releases staggered retargeting frost needles and scales from Frost
  - status: Skill-2 behavior authored; full package implementation remains incomplete
- `Black Tide Scripture`
  - required roots: `water`
  - pattern: `wave`
  - fantasy: layered water tides
  - rank-10 Skill 2: `Moon Tide Vault`, an expanding push wave followed by a returning pull wave that scales from Tide
  - status: Skill-2 behavior authored; full package implementation remains incomplete
- `Ice Mirror Guard`
  - required roots: `water`
  - pattern: `aura`
  - fantasy: defensive cold mirrors
  - rank-10 Skill 2: `Frozen Lotus Shell`, a defensive mirror-petal lotus that shatters into aimed frost shards
  - status: Skill-2 behavior authored; full package implementation remains incomplete

### Wood Root

Wood is deferred content for the future `Water-Wood` dual-root profile.

- `Green Vine Art`
  - required roots: `wood`
  - pattern: `homing`
  - fantasy: living vine lashes
  - rank-10 Skill 2: `Verdant Root Network`, a pulsing, retargeting network of damaging vine links that scales from Vinegrowth
  - status: Skill-2 behavior authored; full package implementation remains incomplete
- `Verdant Ring Scripture`
  - required roots: `wood`
  - pattern: `aura`
  - fantasy: thorned growth ring
  - rank-10 Skill 2: `Sprout-Sun Circle`, a planted thorn circle ending in a full Bloom-scaled damaging ring
  - status: Skill-2 behavior authored; full package implementation remains incomplete
- `Ironwood Wave Form`
  - required roots: `wood`
  - pattern: `wave`
  - fantasy: rib-like slashing fronts
  - rank-10 Skill 2: `Ironwood Surge Form`, a pushing rampart that splinters into diagonal return waves and scales from Heartwood
  - status: Skill-2 behavior authored; full package implementation remains incomplete

### Hybrid Gongfa

#### Fire + Metal

- `Crimson Furnace Sword Art`
  - required roots: `fire + metal`
  - Skill 1: `Furnace Needles`; launch focused blades that lodge in enemies and detonate at an embed threshold
  - Skill tags: `projectile`, `explosive`, `fire`, `metal`
  - targeting: prioritize enemies with existing embeds until primed, then acquire a new nearby target
  - fallback: remaining blades detonate after a short timeout
  - defining passive: `Crucible Pressure`
    - explosions build Pressure
    - Pressure globally increases radius for all `explosive` Skills
    - Pressure decays without explosions
  - upgrade hooks: lower threshold, higher embed cap, wider or propagating explosions
  - Mastery development: coordinated multi-blade volleys; remaining blades retarget immediately once the current target is primed
  - rank-10 Skill 2: `Furnace Cascade`; independently detonate all current embeds and scatter heated fragments into nearby enemies to begin chain reactions
  - pre-rank-10 Mastery pool:
    - `Tempered Needles`: more Skill 1 blade damage
    - `Rapid Forging`: faster needle volleys
    - `Deep Embedding`: lower detonation threshold
    - `Furnace Expansion`: larger Skill 1 explosions
    - `Rising Pressure`: Pressure builds faster
    - `Sealed Crucible`: Pressure decays slower and gives a stronger global `explosive` radius bonus
  - identity constraint: must not feel like `Yujian Jue` with added fire damage
  - status: first hybrid design target

## Compatibility Tree

This is the current practical lookup for what a selected and awakened `Linggen` can roll from the `Gongfa` pool.

- `Fire`
  - `Blazing Feather Art`
  - `Burning Ring Scripture`
  - `Scarlet Wave Manual`
- `Water`
  - `Drifting Frost Needle`
  - `Black Tide Scripture`
  - `Ice Mirror Guard`
- `Metal`
  - `Yujian Jue`
  - `Jinfeng Gong`
  - `Gengjin Huti`
- `Fire + Metal`
  - `Burning Ring Scripture` as the offered `Fire` Gongfa
  - one of the three authored `Metal` Gongfa, selected randomly for the run
  - `Crimson Furnace Sword Art` as the guaranteed hybrid Gongfa

Deferred compatibility branches:

- `Water + Metal`
  - one offered `Water` Gongfa
  - one offered `Metal` Gongfa
  - one guaranteed `Water + Metal` hybrid Gongfa
- `Water + Wood`
  - one offered `Water` Gongfa
  - one offered `Wood` Gongfa
  - one guaranteed `Water + Wood` hybrid Gongfa

Current choice rule:

- after reveal, the game shows exactly `3` compatible `Gongfa`
- dual-root profiles prefer one unlearned single-root option from each root plus one unlearned hybrid
- if a category is exhausted, fill from any compatible unlearned Gongfa without repeating learned Gongfa

## Gongfa Mastery Progression

Gongfa do not have realm-specific forms. A Stage Breakthrough leaves every learned Gongfa, Skill, passive, and Mastery rank unchanged, then opens a slot for one additional Gongfa. Existing packages change only through their own finite Mastery tracks. Baseline cultivator strength grows separately through automatic Foundation Growth at each Phase Transition.

Current mechanical fields in data:

- `damage`
- `cooldownMs`
- `count`
- `pierce`
- `projectileSpeed`
- `projectileLifetimeMs`
- `spreadDeg`
- `auraRadius`
- `retaliationDamage`
- `range`
- `returnShots`

These fields describe the current implementation schema, which still encodes the obsolete realm-bound model and will need migration to package Skills, passives, and Mastery ranks.

## Reward And Refinement Tree

Qi drives only Realm Progress and Gongfa Mastery. There is no separate cultivator level or generic Qi-upgrade track.

### Gongfa Mastery refinements

Ordinary Mastery ranks automatically integrate one deterministic Refinement from the Gongfa's fixed pool; ranks `3`, `6`, and `9` offer three exclusive Transformations, and rank `10` automatically unlocks Skill 2. Later ordinary ranks continue until every available Refinement tier is integrated and the Gongfa becomes Fully Mastered.

Examples from the current `Metal` path:

- `Yujian Jue`
  - more damage
  - more sword count
  - faster cooldown
- `Jinfeng Gong`
  - more damage
  - more wave count
  - more range
- `Gengjin Huti`
  - more aura damage
  - more retaliation damage
  - more aura radius

### External utility rewards

Generic utility does not appear in Gongfa Mastery choices:

- movement speed
- max health
- healing
- orb magnet

These effects come from Spirit Treasures, Healing Pills, elite rewards, and Fortunate Encounters. Reroll Tokens are not part of the current scope.

Healing Pills are immediate world pickups: contact restores missing health, full health does not consume them, and they never enter inventory.
Unused Healing Pills are durable ground loot saved with their positions across Phase Transitions and Run resume.

The cultivator has three active Spirit Treasure slots. A fourth Treasure must replace an equipped Treasure or remain uncollected.

## What Is Actually Finished

Currently authored enough to be judged:

- Cultivator Candidate selection and Linggen awakening structure
- realm ladder through `Jindan`
- generalized `Gongfa` selection flow
- `Metal` as the main design target

Currently present but not yet trustworthy as final design:

- `Fire` methods
- `Water` methods
- `Wood` methods
- late-stage feel of `Zhuji` and `Jindan`

Currently unresolved:

- exact triggers and rewards for `Linggen` evolution events
- authored identities for each dual-root hybrid `Gongfa`
- discovery and root-completion mechanics for the hidden Huashen path
- exact Huashen ascension presentation and rewards
- exact Spirit Treasure effects and acquisition/replacement interaction
- exact Foundation Growth stats and scaling

## Recommended Use

When discussing new content, specify it in this order:

1. `Linggen`
2. realm
3. `Gongfa`
4. upgrade/refinement

Example:

- not: "add a cool sword skill"
- yes: "`Metal Linggen`, `Zhuji`, `Yujian Jue`, new refinement that adds a return-blade split"
