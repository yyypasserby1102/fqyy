# FQYY Game Design

## Elevator Pitch

`FQYY` is a 2D action roguelite with a xiuxian cultivation theme. The player survives escalating monster waves while refining their build through sect techniques, spirit treasures, and breakthrough choices. The target feel is "Vampire Survivors pressure with cultivation progression and readable martial-fantasy spectacle."

`FQYY` is a working title. The game needs a final Chinese title before release.

## Design Pillars

1. Cultivation growth must feel dramatic.
   The player should begin fragile and end a run clearing dense enemy packs with visible mastery spikes.
2. Builds should express schools of cultivation, not generic stat piles.
   Upgrades should naturally group into sword intent, body refinement, talisman control, spirit beast contracts, and elemental arts.
3. Combat readability matters more than ornament.
   Enemy shapes, projectiles, pickups, danger zones, and elite attacks must stay legible during heavy screen pressure.
4. Runs should produce regular decision points.
   The player should get meaningful build choices often enough to steer a run, not just receive passive numerical growth.

## Target Run Structure

- A Run is persistent and can span multiple play sessions through save/resume
- Realm pacing should serve meaningful cultivation growth rather than a fixed short-session duration
- The current six-minute prototype is a test harness, not the target full-run length
- Long-term structure:
  - Early game: establish one primary damage engine and one survival layer
  - Mid game: branch into synergy packages and manage denser enemy behaviors
  - Late game: defeat the final Yuanying combat challenge for the normal ending; the hidden Huashen true-ending path remains a later design problem

### Save And Resume

- Autosave at safe progression boundaries: automatic Phase milestones and completed Breakthrough/Gongfa selections
- Persist durable Run state and the next combat segment, not live enemies, projectiles, or attack timers
- Persist unconsumed Healing Pills as durable ground loot, including their arena positions
- Resume by reconstructing the next combat segment from the latest safe checkpoint
- Quitting or crashing during combat discards only the incomplete segment and resumes from the latest safe checkpoint
- Death ends the Run and removes its resumable save
- Commit death and delete the resumable save before presenting the death screen
- Allow one active Run save per player profile; starting another Run requires confirmed abandonment
- Store settings and future meta progression separately from the active Run
- At each ordinary Phase boundary, autosave and continue automatically; reserve explicit checkpoint actions for the Dayuanman Tribulation/Breakthrough and provide no manual in-Run save controls
- Abandonment clears the active Run save and grants no victory

## Core Gameplay Loop

1. Move through the arena and avoid contact pressure.
2. Begin as a Mortal and evade enemies through movement and the shared Evade action.
3. Choose one of three Cultivator Candidates showing roots and qualitative Affinity Grades.
4. Route toward a guaranteed early Lingcao while under pressure.
5. Claim the Lingcao and Breakthrough into Lianqi Chuqi, awakening the selected Linggen.
6. Select a Gongfa that expresses that Linggen in combat.
7. Accumulate Qi to earn Gongfa Mastery refinements and trigger later realm Breakthroughs.
8. Survive elite fights, boss phases, and later tribulations.
9. Convert run rewards into longer-term unlocks between runs.

## Combat Model

### Player Baseline

- Movement-driven survival
- No Mortal attack; movement and the shared 120-pixel Evade are the only defenses before the first Gongfa
- Evade lasts 200ms, prevents incoming damage during that movement, has a 1.2s cooldown, and requires held directional input
- Health and recovery as scarce resources
- Pickup magnet as an important comfort stat
- Early fragility is intentional so the first breakthrough feels decisive
- The Mortal opening asks the player to route toward a Lingcao under pressure; its direction and distance are marked from spawn
- Lingcao position may vary deterministically by Run seed, but is never hidden from the player
- Before Lingcao, spawn only slow melee pursuers with generous pathing gaps; ranged enemies, divers, slows, and hazards begin after Gongfa 1 is selected

### Weapon Families

These should become the main build identity layer.

- Sword Intent
  Orbiting swords, volleys, piercing blades, returning blades, execution bursts
- Talisman Arts
  Delayed seals, chained explosions, area denial, curse application
- Five Elements
  Fire damage-over-time, ice slows, thunder chains, earth barriers, wood sustain
- Body Cultivation
  Ram attacks, retaliation bursts, defensive scaling, close-range dominance
- Spirit Contracts
  Summoned beasts with autonomous attack patterns and support effects

### Support Systems

- Defensive tools: shields, damage reduction windows, brief invulnerability triggers
- Mobility tools: dash, mist step, blink talismans, move-speed spikes
- Economy tools: larger pickup radius, bonus qi, fate manipulation
- Control tools: slows, knockback, charm, curse zones, pull effects

## Progression Structure

### In-Run Progression

- A guaranteed early Lingcao creates a reliable first power spike without changing the cultivator's innate Linggen
- Automatic ordinary Gongfa Refinements plus structural Transformation choices at mastery milestones
- A three-candidate opening that makes initial Linggen roots and Affinity Grades an informed roguelite choice
- Gongfa selection after Linggen awakening to determine combat expression
- Most later growth should deepen the chosen path rather than flattening all doctrines into one generic pool
- Rare fortunate encounters can introduce limited off-path techniques without replacing the main path
- Later major Breakthroughs when Realm Progress thresholds are reached
- Elite drops that offer treasure-grade upgrades or consumables
- The first slice should contain 3 major Stages, each opening one additional Gongfa slot

Starting a Run presents three Cultivator Candidates with visible roots and qualitative Affinity Grades while exact affinities remain hidden. Choosing one fixes the initial Linggen and enters the Mortal state. Claiming the Lingcao then triggers the first Breakthrough into Lianqi Chuqi, awakens that Linggen, and grants Gongfa 1. Each combat Stage is divided into four ordered Realm Phases: `Chuqi -> Zhongqi -> Houqi -> Dayuanman`.

Candidate names and portraits may differ, but Linggen is their only initial gameplay difference. Do not add character-specific base stats, talents, or starting items until Linggen and Gongfa balance can be evaluated independently.

Generate three distinct Candidate Linggen profiles from the Run seed. Guarantee at least one single-root and one dual-root profile, then draw the third from the remaining pool. Reloading or restarting the same seeded Run must not reroll this opening tradeoff.

A Linggen profile enters the Candidate pool only when it supports at least three compatible Playable Gongfa: complete starting Skill, defining passive, fixed Mastery Pool, three Transformation milestones, functioning Skill 2, and persistence behavior. Stat-only placeholders are not playable content and must never appear in Candidate or Breakthrough offerings.

Claiming the Lingcao freezes combat for the Gongfa choice but does not remove the enemies pursuing the Mortal. Resume against the same pack so the first Gongfa's power spike is immediately legible.

Lingcao activates immediately on contact with no channel time. Every one-of-three choice scene fully pauses enemies, projectiles, spawns, and combat timers until resolved.

Qi fills one segmented Realm Progress bar across Chuqi, Zhongqi, Houqi, and Dayuanman. Filling an ordinary segment starts cleanup, then advances automatically and displays its Foundation Growth reward on the bar. Filling Dayuanman and clearing its remaining enemies unlocks the explicit Stage Tribulation checkpoint; defeating that challenge triggers the Breakthrough into the next Stage and grants the new Gongfa slot. Gongfa Mastery continues independently throughout.

When a Phase reaches its Realm Progress threshold, stop new spawns and require the player to defeat all remaining enemies. After the final enemy dies, automatically collect every Qi Orb still on the arena. The resulting Phase milestone grants Foundation Growth, advances the top progress bar, resolves queued Mastery Transformation choices, autosaves durable Run state, and begins the next Phase without pausing or opening a panel. Remaining enemies are never despawned or carried across the boundary. Exact Foundation Growth stats and scaling remain deferred.

Realm-ending Tribulations escalate in production and mechanical complexity:

- Lianqi: short survival pressure trial
- Zhuji: elite encounter with supporting adds
- Jindan: single-phase boss
- Yuanying: multi-phase Heavenly Tribulation

Every combat Stage uses the same internal Phase grammar:

- Chuqi: introduce that Stage's enemy roster and pressure pattern
- Zhongqi: increase density and mix enemy roles
- Houqi: add an elite or environmental hazard
- Dayuanman: combine all established threats at peak pressure before the Tribulation

Each combat Stage has a distinct arena and enemy identity. Its four Realm Phases reuse that arena with escalating pressure; defeating the Stage's Tribulation and completing the Breakthrough moves the Run to the next realm's arena.

The first complete normal path uses one fixed arena per combat Stage. Later content can provide realm-specific arena pools and choose one arena per Stage for each Run.

Advancing to the next Stage does not modify existing Gongfa, Skills, passives, or Mastery. It opens one additional Gongfa slot. Each completed Realm Phase separately grants automatic Foundation Growth.

The normal Run should span Lianqi -> Zhuji -> Jindan -> Yuanying and end after the Heavenly Tribulation. Huashen remains outside the normal path as a hidden, non-combat true ending.

Mechanical identity by realm:

- Lianqi: unstable survival and first Gongfa acquisition
- Zhuji: build stabilization through a second Gongfa
- Jindan: domination spike through a third Gongfa
- Yuanying: full final combat realm; acquire Gongfa 4, develop it through Mastery, then face the normal-ending Tribulation
- Huashen: non-combat true ascension ending requiring all five roots

### Meta Progression

Keep this light at first. The early goal is replayability through build variety, not heavy grind.

- Unlock new weapon families
- Unlock new upgrade pools
- Unlock new maps and enemy factions
- Minor persistent account bonuses through sect research

## Content Roadmap

### Milestone 1: Strong Vertical Slice

Goal: prove the fantasy and the moment-to-moment loop.

- 1 map
- 3 weapon families
- Authored Mastery improvement pools for the initial Gongfa
- 6 enemy types
- 2 elites
- 1 boss
- 1 major breakthrough event

### Milestone 2: Replayable Alpha

- 2 maps with distinct enemy factions
- 5 weapon families
- Upgrade synergies and evolution mechanics
- Meta unlock track
- Boss modifiers and late-game calamities

### Full-Game Gongfa Volume

Each element needs at least six independently authored single-root Gongfa. A pure-root cultivator acquires four Gongfa by Yuanying, so a pool of six preserves three unlearned choices at every acquisition: `6 -> 5 -> 4 -> 3`. Hybrid Gongfa are additional content and do not count toward this per-element baseline.

## Initial Enemy Direction

The current enemy list is a functional placeholder. The roster should evolve into clearer combat roles.

- Swarmers: weak melee bodies that create crowd pressure
- Bruisers: slower, high-health units that force pathing decisions
- Divers: fast threats that punish greedy routing
- Ranged casters: create projectile patterns and area denial
- Support enemies: buff allies, heal packs, or summon hazards
- Elites: anchor encounters with telegraphed signature mechanics

## Build Archetypes For First Slice

These are the first three builds worth supporting because they are mechanically distinct and easy to read.

### Sword Storm

- Core: multi-sword volleys, pierce, cooldown reduction
- Playstyle: mid-range kiting and burst windows
- Signature evolution: swords split on hit and return through enemies

### Thunder Talisman

- Core: delayed explosive seals and chain lightning
- Playstyle: zone control and pack detonation
- Signature evolution: marked enemies arc thunder to nearby targets

### Jade Body

- Core: max health, retaliation, contact mitigation, short-range shockwaves
- Playstyle: controlled aggression and durability
- Signature evolution: taking damage triggers a cultivation burst instead of collapse

## Breakthrough System

Breakthroughs should be more than normal upgrades. They are the clearest expression of the cultivation theme.

- First breakthrough: early in the run, after a short fragile opening phase
- Later cadence: every 4 to 5 levels or at fixed time milestones
- Presentation: pause combat and surface 3 high-impact doctrine choices
- Outcome types:
  - Reveal the first cultivation path of the run
  - Transform a weapon family
  - Add a new subsystem such as dash, summon, or shield
  - Trade risk for power through tribulation-style modifiers

The opening selects a Cultivator Candidate and visible Linggen rather than a class-like doctrine. The first Breakthrough awakens that Linggen and offers compatible Gongfa.

After the first breakthrough, runs should use a soft-hybrid model: most upgrades reinforce the chosen doctrine, while rare fortunate encounters can add constrained cross-path expression. This better matches xiuxian fiction than either rigid class purity or unrestricted build soup.

The first breakthrough should establish the cultivator's elemental foundation first. Gongfa selection should come immediately afterward, so the player first answers "what roots does this cultivator have?" and then answers "how does this path fight?" For readability, the Gongfa choice should present exactly three compatible options.

A Gongfa should define both the cultivator's combat expression and the way that build scales. Each Gongfa is a complete cultivation package containing multiple Skills and passive bonuses, not a single attack behavior. Its documented core pattern is the starting signature Skill through which the package first becomes visible.

Author and benchmark each Gongfa through a three-axis Combat Profile: Damage, Survival, and Control. Every Gongfa must contribute to all three because it operates alone during Lianqi, but one or two axes may be its focus. Survival can emerge from mitigation, mobility, spacing, or recovery; Control can emerge from shaping movement, density, targeting, or safe space. These are contribution axes, not hard roles.

Gongfa passives can be internal or global. Internal passives affect only that Gongfa; global passives improve shared Cultivator Attributes or compatible Skills from other Gongfa. These thematic global effects create cross-Gongfa synergy without restoring a generic Qi-upgrade track.

Every Skill has explicit compatibility tags such as `projectile`, `aura`, `fire`, or `defensive`. Global Gongfa passives target tags rather than applying universal damage multipliers, making cross-package synergies predictable and data-driven.

When different Gongfa improve the same tagged property, add their bonuses against the base value rather than multiplying them together. Exceptional formulas may exist only as explicitly scoped Gongfa behavior, never as an accidental consequence of modifier order.

Do not impose a general cap on additive synergy; strong combinations are part of the survivor-like payoff. Use only stat-specific safety limits—minimum activation intervals, maximum mitigation, and simulation-safe entity counts—to prevent degenerate or unstable states.

Gongfa should be gated by required Linggen rather than only by broad profile categories. Most Gongfa should require one root, while more advanced or hybrid methods can require two roots. No Gongfa in the first slice should require more than two roots.

When a dual-root cultivator selects Gongfa, the offering should prefer one unlearned single-root Gongfa from each root and one unlearned hybrid Gongfa requiring both roots. If one category is exhausted, fill its slot with any other compatible unlearned Gongfa. This priority-and-fallback structure keeps both affinities visible without repeating learned Gongfa.

Each hybrid Gongfa should be independently authored with its own combat identity and Mastery progression. Hybrid Gongfa should not be generated by combining arbitrary single-root Gongfa, avoiding a combinatorial content and balance matrix.

The first hybrid Gongfa is `Crimson Furnace Sword Art`, requiring Fire + Metal. Skill 1, `Furnace Needles`, launches focused blades that lodge in enemies and detonate when an embed threshold is reached. It carries the `projectile`, `explosive`, `fire`, and `metal` tags. New blades prioritize enemies that already carry embeds until they are primed, then acquire a new target. A short timeout detonates remaining blades so isolated or weak targets do not waste the setup. Its setup-and-burst identity must remain distinct from adding fire damage to `Yujian Jue`.

`Burning Ring Scripture` is the first authored pure-Fire Gongfa and the Fire option for the first-slice Fire+Metal profile. Skill 1, `Revolving Flame Ring`, forms segmented flames with readable gaps around the cultivator; enemies take damage as rotating segments sweep through them. It carries the `aura` and `fire` tags. Repeated sweeps reward close positioning and sustained exposure, while the gaps preserve risk and distinguish it from `Gengjin Huti`.

Its defining passive, `Kindled Meridians`, builds Heat from unique enemies hit by aura damage during each cycle, subject to a per-cycle cap. Heat globally increases activation speed for all `aura`-tagged Skills and decays after a short period without aura damage; repeated overlap ticks cannot instantly fill it. Rank-10 Skill 2, `Solar Flare Cycle`, independently forms two complete concentric solar rings and releases expanding fire waves while Skill 1 continues. Damage, radius, and wave count scale from current Heat without consuming it, and each enemy builds Heat at most once per activation.

Solar Flare Cycle has three two-tier Refinement families: `Solar Tempering` for damage, `Widened Corona` for radius and wave count, and `Accelerated Cycle` for cooldown and expansion speed.

Pre-rank-10 Mastery pool:

- `Scorching Passage`: more Skill 1 damage
- `Broadened Flame`: wider flame segments and larger ring radius
- `Gathering Heat`: more Heat from unique targets
- `Banked Ember`: longer delay and slower Heat decay
- `Kindled Circulation`: stronger Heat-based activation speed for all `aura` Skills
- `Ember Step`: Heat grants Cultivator movement speed

Each family has two authored tiers and an explicit Effect Scope. The counter-rotating ring is structural Transformation content rather than a Refinement.

- Rank-3 exclusive Skill-1 Transformations:
  - `Counterflow Ring`: add a second counter-rotating ring whose segment intersections create brief high-damage zones
  - `Condensed Furnace Ring`: merge segments into fewer, denser hotspots that repeatedly burn priority targets
  - `Scattered Ember Orbit`: segment hits leave short-lived burning patches
- Rank-6 exclusive passive Transformations:
  - `Banked Sun`: Heat cannot decay below half while enemies remain nearby
  - `Aura Furnace`: hits from any aura-tagged Skill build Heat
  - `Meridian Ignition`: full Heat starts a brief high-output aura state, then resets
- Rank-9 exclusive capstone Transformations:
  - `Perfect Solar Orbit`: Heat adds flame segments and progressively closes the ring's gaps
  - `Sunspot Collapse`: periodically condense the ring onto the highest-health nearby enemy, then reform around the Cultivator
  - `Phoenix Passage`: Evade leaves a temporary ring copy whose duration and power scale from Heat

The first-slice Fire+Metal offering contains `Burning Ring Scripture`, the authored Fire+Metal hybrid, and one of the three Metal Gongfa selected randomly for that run.

Its defining passive, `Crucible Pressure`, builds Pressure from explosions and globally increases radius for all `explosive`-tagged Skills; Pressure decays without explosions. Proposed Mastery development adds coordinated multi-blade volleys whose remaining blades retarget once a target is primed. Rank-10 Skill 2, `Furnace Cascade`, independently detonates all current embeds and scatters heated fragments into nearby enemies to begin chain reactions. These effects come from Mastery, not realm advancement.

Pre-rank-10 Mastery pool:

- `Tempered Needles`: more Skill 1 blade damage
- `Rapid Forging`: faster needle volleys
- `Deep Embedding`: lower detonation threshold
- `Furnace Expansion`: larger Skill 1 explosions
- `Rising Pressure`: Pressure builds faster
- `Sealed Crucible`: Pressure decays slower and gives a stronger global `explosive` radius bonus

### Additional Rank-10 Skill 2 Designs

These eight designs complete the declared Skill-2 contract for the remaining Gongfa. Each Skill operates independently while Skill 1 continues, produces a visible combat event, and interacts with the owning resource. A successful cast is counted only when its described world effect is emitted.

#### Blazing Feather Art — Feather Rain Formation

- Trigger: independent timed activation.
- Effect: mark the densest enemy cluster, then rain successive fans of homing fire feathers into that area. Each fan retargets living enemies before falling.
- Tags and interaction: `projectile`, `fire`; Embers add feathers and damage. Formation hits stoke Embers at most once per target per activation.
- Observable cast: at least one rain fan containing one or more feathers is emitted. With no target, cooldown remains ready and the cast is not counted.
- Two-tier Refinements: `Rain Tempering` increases damage; `Expanded Plumage` increases fan count and area; `Swift Descent` reduces cooldown and delay between fans.

#### Scarlet Wave Manual — Sunset Wave Apex

- Trigger: independent timed activation.
- Effect: launch two long scarlet crescent walls from opposite sides of the Cultivator's facing lane. They cross at the densest enemy line and deal a second hit where they overlap.
- Tags and interaction: `wave`, `fire`; Scorch increases width, distance, and overlap damage. A hit refreshes Scorch once per activation.
- Observable cast: both opposing walls are emitted. With no valid lane target, cooldown remains ready and the cast is not counted.
- Two-tier Refinements: `Apex Tempering` increases damage; `Broadened Sunset` increases width and distance; `Hastened Dusk` reduces cooldown and increases speed.

#### Drifting Frost Needle — Mirror Needle Constellation

- Trigger: independent timed activation.
- Effect: form a visible orbit of frost needles, distribute them across nearby enemies, then release staggered homing volleys. Needles retarget if their target dies before launch.
- Tags and interaction: `projectile`, `water`; Frost adds needles and pierce. Each enemy hit contributes Frost at most once per activation.
- Observable cast: the orbit appears and releases at least one needle. With no target, cooldown remains ready and the cast is not counted.
- Two-tier Refinements: `Constellation Tempering` increases damage; `Expanded Constellation` increases needle count and coverage; `Swift Alignment` reduces cooldown and stagger delay.

#### Black Tide Scripture — Moon Tide Vault

- Trigger: independent timed activation.
- Effect: send a circular tide outward, then pull it back toward the Cultivator. The outward surge pushes enemies away; the return pulls survivors inward and damages them again.
- Tags and interaction: `wave`, `water`; Tide increases radius, control strength, and return damage. Each leg refreshes Tide at most once per enemy.
- Observable cast: both outward and return phases are scheduled. It may cast without a target because it creates immediate defensive space.
- Two-tier Refinements: `Vault Tempering` increases damage; `Rising Moon` increases radius and control; `Turning Tide` reduces cooldown and reversal delay.

#### Ice Mirror Guard — Frozen Lotus Shell

- Trigger: independent timed activation.
- Effect: assemble a rotating lotus of mirror petals around the Cultivator. Petals damage and push nearby enemies, then shatter outward as aimed frost shards when the duration ends or all petals strike.
- Tags and interaction: `aura`, `water`, `defensive`; Reflection adds petals, radius, and shard damage. Hits refresh Reflection at most once per target per activation.
- Observable cast: at least one lotus petal is created, so the Skill always establishes visible defensive space.
- Two-tier Refinements: `Lotus Tempering` increases damage; `Layered Lotus` increases petals and radius; `Rapid Reflection` reduces cooldown and time before shattering.

#### Green Vine Art — Verdant Root Network

- Trigger: independent timed activation requiring a nearby enemy.
- Effect: root the nearest enemy and spread visible vine links to additional enemies. Pulses damage every linked target; when one dies, its link seeks a new enemy in range.
- Tags and interaction: `projectile`, `wood`; Vinegrowth increases links, damage, and reach. Each pulse stokes Vinegrowth once if any link hits.
- Observable cast: a root anchor and at least one damaging link are created. With no target, cooldown remains ready and the cast is not counted.
- Two-tier Refinements: `Root Tempering` increases damage; `Branching Network` increases links and reach; `Quickened Sap` reduces cooldown and pulse interval.

#### Verdant Ring Scripture — Sprout-Sun Circle

- Trigger: independent timed activation.
- Effect: plant a stationary circle at the Cultivator's location. It repeatedly raises thorn spokes, then ends in a full blooming ring that damages enemies across the circle.
- Tags and interaction: `aura`, `wood`; Bloom increases radius, spoke count, and final damage. Each activation stokes Bloom at most once per enemy.
- Observable cast: the circle and at least one thorn spoke appear even when no enemy is inside it.
- Two-tier Refinements: `Sunroot Tempering` increases damage; `Fuller Circle` increases radius and spokes; `Early Spring` reduces cooldown and time to the final bloom.

#### Ironwood Wave Form — Ironwood Surge Form

- Trigger: independent timed activation.
- Effect: drive a thick ironwood rampart in the held movement direction. It repeatedly damages and pushes enemies, then splinters into two diagonal return waves at maximum range.
- Tags and interaction: `wave`, `wood`; Heartwood increases width, push strength, and splinter damage. Hits refresh Heartwood once per activation.
- Observable cast: the rampart and scheduled splinter waves are emitted. Without held movement, use the last movement direction; if none exists, cooldown remains ready and the cast is not counted.
- Two-tier Refinements: `Heartwood Tempering` increases damage; `Broad Trunk` increases width, distance, and push; `Surging Rings` reduces cooldown and increases speed.

Linggen can evolve through exceptional progression that adds roots without removing existing ones. Initial Linggen contain one or two roots, while an evolved Linggen can eventually contain all five. Adding a root should immediately expand compatible offerings but should not mutate any learned Gongfa. At the next Stage Breakthrough, the new Gongfa offering should be generated from the cultivator's current Linggen, including any roots added since the previous selection. The hidden and difficult route to obtaining enough roots for Huashen is intentionally deferred while the normal Yuanying path is designed.

Gongfa are not transformed by Stage changes. Existing packages improve only through their own Mastery tracks; a Breakthrough expands the build by adding another Gongfa. Baseline cultivator strength grows separately through automatic Foundation Growth at each Phase Transition.

Gongfa accumulate with combat realms rather than occupying main and support roles: one at Lianqi, two at Zhuji, three at Jindan, and four at Yuanying. All learned Gongfa remain active and retain independent Mastery tracks. Yuanying is a full combat phase: its fourth Gongfa receives a substantial Mastery-building segment before the final Tribulation ends the normal path. A complete five-root Linggen unlocks the non-combat Huashen true ending, which adds no fifth Gongfa.

The gameplay packages have no main/support roles, but their overlapping effects use a presentation hierarchy: the founding Gongfa remains the full-opacity primary visual layer, while the second through fourth Gongfa use progressively quieter opacity and depth tiers. This must never alter damage, collision, timing, or progression. The HUD lists every path and its Mastery rank so quieter effects remain attributable.

Every combat Stage keeps a persistent realm identity during play: a distinct arena variant, accent color, and fixed identity badge. Transition banners reinforce the change but are not the only place the new realm is named.

The final boss is the `Yuanying Heavenly Tribulation`, a celestial/environmental encounter rather than a mortal antagonist. Defeating it is required for the normal ending. Its phases use lightning judgment, summoned tribulation shades, and collapsing safe zones to test single-target pressure, crowd control, and movement so all four active Gongfa can contribute.

During the Heavenly Tribulation, summoned shades continue dropping Qi and all Gongfa Mastery tracks continue accumulating. Choice events are banked during active attacks and resolved between boss phases. Realm Progress is disabled for the final encounter because Yuanying is the last combat Stage.

Defeating the Heavenly Tribulation ends the Run after a victory summary. Clear the active Run save and write a permanent completion record. The normal ending has no post-victory free roam or endless continuation.

For scope control and readability, the first slice should only support initial single-root and dual-root profiles. Root-adding evolution toward three, four, or five roots belongs to later content.

Root purity should create tradeoffs rather than a flat rarity ladder. Single-root cultivators should feel more specialized and efficient within one doctrine, while dual-root cultivators should gain broader access and hybrid potential at the cost of peak efficiency.

Cultivation Efficiency governs how quickly the cultivator advances realms and develops learned Gongfa; it must not directly modify damage or attack cooldown. Narrower Linggen progress faster early, while broader Linggen begin closer to the long-term requirement that all five roots be present before entering Huashen. This makes root breadth a time-horizon tradeoff rather than a universal combat penalty.

Every present root has an integer Root Affinity from 1 to 10, and all affinities in a Linggen always total exactly 10. Adding a root randomly redistributes the same 10 points without reversing the relative strength order of existing roots; ties are allowed. For example, an initial Fire affinity of 10 can become Fire 8 / Water 2 after Water is added.

Root Affinity numbers are hidden from players. Display only Affinity Grades: `Weak` for 1–3, `Medium` for 4–6, and `Strong` for 7–10. For example, internal Fire 8 / Metal 2 is shown as Strong Fire / Weak Metal.

Any present root satisfies Gongfa compatibility regardless of Grade. Weak roots unlock their Gongfa normally but develop those packages more slowly.

Realm-advancement speed is derived from the strongest current Root Affinity. Thus Fire 8 / Water 2 advances faster than Fire 6 / Water 4, while a single-root affinity of 10 is fastest. The exact multiplier curve is a balance parameter, not a direct combat modifier.

Gongfa-development speed is derived from the affinities required by that Gongfa. A single-root Gongfa uses its required root's affinity. A hybrid Gongfa uses the arithmetic average of its two required roots; for example, Fire 8 / Metal 2 develops `Crimson Furnace Sword Art` at affinity 5.

Every Gongfa choice card shows qualitative Mastery Speed based on that effective affinity: `Slow` for 1–3, `Normal` for 4–6, and `Fast` for 7–10. Hybrid cards calculate the hidden average for the player.

Tune Fast Mastery so a newly acquired Gongfa reaches rank 3 during Chuqi, rank 6 during Zhongqi, rank 9 during Houqi, and rank 10 early in Dayuanman of its acquisition Stage. It should become Fully Mastered around the end of the following Stage. Normal and Slow Mastery Speeds delay the same milestones without changing the Gongfa's contents or maximum power.

Normal Mastery should reach rank 10 late in Dayuanman of the acquisition Stage and become Fully Mastered during the following Stage. Slow Mastery should reach rank 10 around Zhongqi of the following Stage and become Fully Mastered roughly two Stages after acquisition. A Slow Gongfa acquired in Yuanying may therefore finish the normal ending without unlocking Skill 2.

Realm Progress and Gongfa Mastery are separate meters fed simultaneously by the same Qi pickups. Every learned Gongfa receives the full base Mastery value rather than splitting it, then its Root Affinities determine its individual progression rate. Realm Progress thresholds trigger Phase cleanup; only completing Dayuanman and defeating the Stage Tribulation triggers a Breakthrough. Ordinary Gongfa Mastery thresholds integrate a deterministic Refinement automatically; ranks 3, 6, and 9 trigger structural Transformation choices. The player does not manually allocate Qi between the meters.

All first-slice Gongfa Skills activate automatically. Player execution comes from movement and positioning; manual Skill activation is deferred unless the control model is deliberately expanded later.

Selecting a Gongfa immediately grants its starting signature Skill and one defining passive. Each learned Gongfa has its own independent, finite Mastery track. Ordinary ranks deterministically integrate one available Refinement without stopping combat. Ranks 3, 6, and 9 instead present three milestone-specific Transformations, of which one is chosen permanently. Rank 10 automatically unlocks the second Skill.

Select each ordinary Refinement and draw each Transformation offering using reproducible randomness derived from the Run seed, Gongfa, and rank. Replaying a Phase or reloading a checkpoint must reproduce the same integration or options rather than provide a reroll.

Each Gongfa owns a fixed, authored Mastery Pool so its total progression budget can be balanced against other Gongfa. The deterministic selection order is randomized, but effects are never generated and generic health, movement, orb-collection, or recovery upgrades cannot substitute for missing Gongfa content. Those needs belong to Foundation Growth, Spirit Treasures, and Healing Pills. Each Refinement family advances one tier when integrated and leaves the available pool after its final tier.

Every Mastery effect declares an explicit scope: a named Skill, the owning Gongfa, its defining passive, a Skill Tag, or a Cultivator Attribute. Whole-package and cross-Gongfa effects remain valid when stated explicitly. Do not encode improvements through ambiguous shared Method damage, count, or cooldown fields that silently modify multiple Skills.

Use the same initial authoring budget for every Gongfa: six two-tier starting Refinement families split into two Skill-1, two passive, and two synergy/Cultivator-Attribute families; three unique Transformations at each of ranks 3, 6, and 9; and three two-tier Skill-2 Refinement families added at rank 10. Individual offerings still draw from the whole currently available Refinement pool without category quotas. This places Fully Mastered near rank 22.

Use Skill-1 behavior at rank 3, passive or cross-Gongfa synergy at rank 6, and a Skill-1/passive capstone interaction at rank 9 as the default Transformation sequence. This is a balancing template rather than a hard schema: an individual Gongfa may reorder or reinterpret the milestones to preserve its identity, provided all three choices at each milestone remain structurally meaningful and the total value stays comparable.

Do not turn Damage, Survival, and Control into the three Transformation buttons. Survivor-like players correctly favor damage when a defensive option sacrifices killing speed. Instead, every Transformation must preserve comparable offensive viability while changing its delivery: concentrated elite pressure, broad swarm coverage, or a conditional engine based on movement, retaliation, status, or Gongfa synergy. No option should dominate both swarm and boss benchmarks.

At rank 10, add three Skill-2-specific improvement families to that Gongfa's existing pool: potency, coverage/count, and activation speed. Unmaxed earlier options remain available.

After rank 10, ordinary ranks continue integrating the remaining Refinements automatically until every available authored tier is complete. The Gongfa then becomes Fully Mastered, remains active, and receives no further Mastery progress or choices from Qi. The HUD shows the full Gongfa roster, marking completed paths while newer paths continue to gain ranks.

If one Qi pickup triggers Transformation choices for multiple Gongfa, pause combat once and queue the events in Gongfa acquisition order. Resolve every pending Transformation before resuming combat. Ordinary Refinements and rank-10 Skill unlocks require no choice panel.

Each playable Gongfa contains exactly two automatic Skills. The second Skill unlocks at Mastery rank 10; Mastery continues after that milestone, but later content should add more Skills only after this two-Skill model is proven readable and sustainable.

Press `G` during a Run to open the Gongfa Archive. It pauses combat and presents every learned path with its Skill 1, defining passive/resource, Skill 2 lock state, current rank, integrated Refinement tiers, and permanent Transformations. Left and right switch learned paths. Combat uses the same package catalog for names, tags, and thirteen distinct cast/impact motifs so inspection and world presentation cannot drift apart.

Skill 2 operates independently while Skill 1 continues. As an authoring baseline, it must interact with Skill 1, the defining passive, or both, and make at least some earlier Refinements or Transformations more valuable. Its trigger may be timed, cyclical, threshold-based, retaliatory, or another Gongfa-specific condition; this baseline should not suppress creative package identities.

At every combat-Stage Breakthrough, the cultivator keeps all learned Gongfa and selects one additional compatible, unlearned Gongfa for the newly opened slot. Learned Gongfa are excluded from later offerings. If fewer than three compatible unlearned Gongfa remain, the panel presents fewer choices rather than duplicates. Roots added during the run expand later offerings. The Huashen transition ends the run instead of opening another slot.

Generate each Breakthrough offering deterministically from the Run seed, destination Stage, current Linggen, and learned Gongfa. Closing or reloading before selection must reproduce the same offering.

After a realm-ending Tribulation, resolve the Breakthrough transaction in this order: advance to the next realm at Chuqi, open and fill its Gongfa slot, autosave the complete new-realm state, then load the next realm's arena. Never enter the arena before its Gongfa selection is resolved.

For the first vertical slice, the active Linggen pool should contain one single-root profile and one dual-root profile. This validates both selection flows with the minimum coherent content.

Recommended first-slice Linggen pool:

- Single-root: Metal
- Dual-root: Fire+Metal

The current Candidate pool includes pure Fire, pure Water, pure Metal, Fire+Metal, Water+Metal, and Water+Wood. Every offered Gongfa satisfies the complete package contract: two Skills, a defining passive, the fixed Rank-22 Mastery track, persistence, and a distinct visual identity. A future profile becomes playable only when every Gongfa needed by its offering reaches the same bar.

## First Root To Fully Design

The first fully authored root for the vertical slice should be `Metal`.

Initial Metal Gongfa trio:

- `Yujian Jue`: controlled flying swords, precision, pierce
- `Jinfeng Gong`: short-range cutting waves, frontal pressure
- `Gengjin Huti`: defensive metal body with retaliatory edges

### Metal Gongfa Definitions

#### Yujian Jue

- Primary attack behavior: auto-targeted flying sword volleys that seek nearby enemies in ordered bursts
- Skill tags: `projectile`, `metal`, `sword`
- Defining passive: `Unbroken Sword Intent`
  - an attack cycle that hits at least one enemy grants one stack, regardless of hit count
  - maximum 5 stacks; successful hits refresh their duration
  - stacks slightly improve Yujian damage and globally improve flight speed for all `projectile`-tagged Skills
  - at 5 stacks, every `projectile`-tagged Skill gains +1 pierce
  - taking damage removes two stacks; exact values and duration remain tuning parameters
- Scaling stat: sword count and pierce efficiency
- Support stat: cooldown recovery
- Rank-10 Skill 2 — `Returning Sword Formation`:
  - activates on an independent cooldown while Skill 1 continues
  - targets the densest enemy lane and sends a sword array outward, then back through enemies
  - uses Yujian damage bonuses and projectile-tag effects from Intent
  - a formation that hits grants or refreshes one Intent stack regardless of hit count
- Skill-2 Refinement families:
  - `Formation Tempering`: formation damage
  - `Expanded Sword Array`: sword count and coverage
  - `Swift Formation`: activation and return speed
  - each family has two authored tiers
- Intended play pattern: kiting, target selection, and efficient pack thinning from mid-range
- Pre-rank-10 Mastery pool:
  - `Twin Sword Split`: more Skill 1 swords
  - `Refined Sword Channel`: faster Skill 1 cycling
  - `Sword Intent Sharpening`: stronger Intent damage bonus
  - `Steady Sword Heart`: longer Intent duration, then reduced stack loss
  - `Swordborne Steps`: Intent grants Cultivator movement speed
  - `Penetrating Intent`: stronger projectile flight speed and full-stack pierce

Each family has two authored tiers and an explicit Effect Scope.

- Rank-3 exclusive Skill-1 Transformations:
  - `Execution Seal`: mark a priority target and escalate repeated Skill-1 pressure until it dies
  - `Sword Bloom`: split the first hit into weaker swords that seek different enemies
  - `Reversing Sword Path`: return the sword through enemies toward the Cultivator after its strike
- Rank-6 exclusive passive Transformations:
  - `Still Sword Heart`: incoming damage no longer removes Intent
  - `Myriad Blade Resonance`: other projectile-tagged Skills can build or refresh Intent
  - `Intent Unleashed`: five stacks empower the next Yujian volley and are then consumed
- Rank-9 exclusive capstone Transformations:
  - `Sword Crown`: Skill 1 gains weaker spectral swords based on current Intent
  - `Intent Domain`: Skill-1 impacts leave short blade fields whose size and duration scale with Intent
  - `Void-Step Formation`: after Evade, the next Skill-1 cycle attacks from both the start and endpoint, scaling with Intent

#### Jinfeng Gong

- Skill 1 — `Cutting Front`: repeated frontal metal-qi waves aimed in the cultivator's movement direction
- Skill tags: `wave`, `metal`
- Defining passive — `Gale Momentum`: movement builds Momentum slowly, moving `Cutting Front` hits and Evade grant larger bursts, and stopping causes rapid decay; Momentum globally increases width and range for all `wave`-tagged Skills
- Scaling stat: wave width and cut damage
- Support stat: range extension
- Rank-10 Skill 2 — `Golden Gale Corridor`:
  - activates independently while Cutting Front continues
  - projects a lingering corridor in the Cultivator's movement direction
  - repeatedly cuts enemies crossing or following the lane
  - carries the `wave` tag, so Momentum increases its width and range
  - successful corridor hits delay Momentum decay
- Skill-2 Refinement families:
  - `Corridor Edge`: repeated-hit damage
  - `Expanding Passage`: width, length, and duration
  - `Rapid Crosswinds`: activation and cutting frequency
  - each family has two authored tiers
- Intended play pattern: assertive lane-clearing with deliberate positioning instead of passive orbiting damage
- Pre-rank-10 Mastery pool:
  - `Cutting Qi Pressure`: more Cutting Front damage
  - `Broadened Front`: wider waves and greater wave count
  - `Gathering Gale`: stronger Momentum gain from hits and movement
  - `Unbroken Stride`: Momentum decays more slowly
  - `Windborne Reach`: stronger Momentum scaling for all `wave` Skills
  - `Gale-Fed Footwork`: Momentum grants Cultivator movement speed

Each family has two authored tiers and an explicit Effect Scope.

- Rank-3 exclusive Skill-1 Transformations:
  - `Heaven-Splitting Line`: compress Cutting Front into a long, narrow, highly penetrating lane
  - `Golden Gale Fan`: spread Cutting Front across a broad frontal arc
  - `Crescent Wake`: periodically leave cutting crescents behind along the Cultivator's movement route
- Rank-6 exclusive passive Transformations:
  - `Unbroken Current`: Momentum no longer decays while the Cultivator is moving
  - `Ten-Thousand Wave Resonance`: hits from any wave-tagged Skill build Momentum
  - `Gale Detonation`: full Momentum empowers the next Cutting Front with a second crossing wave and is partly consumed
- Rank-9 exclusive capstone Transformations:
  - `Endless Horizon`: Cutting Front grows wider and stronger while traveling, scaled by Momentum
  - `Walking Storm`: high Momentum produces periodic radial cutting waves around the moving Cultivator
  - `Gale-Step Severance`: Evade cuts a damaging corridor between its start and endpoint, scaled by Momentum

#### Gengjin Huti

- Skill 1 — `Gengjin Guard`: a close defensive aura that releases retaliatory edge bursts when enemies enter or damage the cultivator
- Skill tags: `aura`, `metal`, `defensive`
- Defining passive — `Tempered Body`: nearby enemies build Guard continuously, damage prevented by Guard grants an additional burst, and Evading through nearby enemies grants a smaller burst; Guard improves mitigation plus damage/radius for all `defensive` Skills and decays outside danger
- Scaling stat: retaliation damage and guard stability
- Support stat: max health or damage reduction efficiency
- Rank-10 Skill 2 — `Blade Shell`:
  - charges from damage prevented by Guard and from close Evades, never requiring health loss
  - automatically erupts at its threshold while Skill 1 continues
  - carries the `defensive` tag and scales damage, radius, and blade count from current Guard
  - resets its charge after eruption
- Skill-2 Refinement families:
  - `Tempered Shell`: eruption damage
  - `Layered Eruption`: blade count and coverage
  - `Rapid Reforging`: charge gain and threshold frequency
  - each family has two authored tiers
- Intended play pattern: controlled close-range survival that turns danger into counter-pressure
- Pre-rank-10 Mastery pool:
  - `Guard Pressure`: more aura and edge-burst damage
  - `Expanding Guard`: larger aura radius
  - `Lasting Temper`: stronger Guard gain from proximity, prevented damage, and Evade
  - `Bulwark Reflection`: slower Guard decay
  - `Unyielding Shield`: stronger Guard scaling for all `defensive` Skills
  - `Iron Meridian`: greater Cultivator maximum health

Each family has two authored tiers and an explicit Effect Scope.

- Rank-3 exclusive Skill-1 Transformations:
  - `Rebounding Edge`: prevented damage launches a focused blade toward its source
  - `Hundred-Blade Halo`: Guard becomes a rotating close-range blade halo
  - `Iron Wake`: Evade leaves a temporary cutting wall along its path
- Rank-6 exclusive passive Transformations:
  - `Immovable Mountain`: standing still greatly increases Guard gain and defensive-Skill damage
  - `Flowing Iron Body`: Evade grants a stronger Guard burst and releases a defensive shockwave
  - `Ten-Thousand Armor Resonance`: hits from any defensive-tagged Skill build Guard
- Rank-9 exclusive capstone Transformations:
  - `Gengjin Fortress`: current Guard controls the number and strength of orbiting defensive blades
  - `Iron Gravity Domain`: high Guard pulls nearby enemies into repeated aura bursts
  - `Unbroken Advance`: high-Guard movement damages and pushes enemies; Evade becomes a stronger breakthrough strike

## Economy And Rewards

- Common drops: qi orbs
- Elite drops: Spirit Treasure or Healing Pill
- Boss rewards: sect scripture, map unlock, new doctrine

Healing Pills restore missing health immediately on contact and are not stored in inventory. A full-health cultivator leaves the pickup unconsumed.
Unused Healing Pills persist across Phase Transitions and respawn at their saved arena positions when a Run resumes.

The cultivator has three active Spirit Treasure slots. A fourth Treasure requires replacing an equipped Treasure or leaving the new one behind; Treasures never stack without limit.

## Map Direction

The first map should communicate "cultivation world" immediately without depending on high-detail art.

- Fallen sect courtyard
- Broken spirit lanterns
- Cracked jade tiles
- Sparse fog banks and drifting talisman ash

Fixed normal-path route:

- Mortal opening + Lianqi: Fallen Sect Courtyard
- Zhuji: Mist Bamboo Valley
- Jindan: Burial Ridge
- Yuanying: Cloudbreak Summit, ending in the Heavenly Tribulation

Initial enemy identity by arena:

- Fallen Sect Courtyard: corrupted sect remnants and scavenging beasts; basic melee pressure
- Mist Bamboo Valley: spirit beasts and animated flora; divers, slows, and pathing pressure
- Burial Ridge: corpse cultivators and resentful spirits; ranged curses, summons, and area denial
- Cloudbreak Summit: celestial constructs and tribulation shades; projectiles, collapsing safe zones, and coordinated elites

Future maps:

- Demon market outskirts

## Tone

- Serious martial-fantasy framing
- Clean and readable language in combat UI
- Short item lore lines with sect flavor, not comedy writing

## Immediate Design Tasks

1. Expand the current one-weapon prototype into three distinct weapon families.
2. Replace the generic Qi-upgrade track with Gongfa Mastery refinements and external utility rewards.
3. Replace the six-minute timer with the persistent Mortal-to-Jindan Phase and Tribulation structure.
4. Redesign the enemy roster around combat roles instead of only stat variation.
5. Add one breakthrough event that materially changes how the run plays.
