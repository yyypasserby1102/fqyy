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

- Autosave at safe progression boundaries: Phase Transitions and completed Breakthrough/Gongfa selections
- Persist durable Run state and the next combat segment, not live enemies, projectiles, or attack timers
- Persist unconsumed Healing Pills as durable ground loot, including their arena positions
- Resume by reconstructing the next combat segment from the latest safe checkpoint
- Quitting or crashing during combat discards only the incomplete segment and resumes from the latest safe checkpoint
- Death ends the Run and removes its resumable save
- Commit death and delete the resumable save before presenting the death screen
- Allow one active Run save per player profile; starting another Run requires confirmed abandonment
- Store settings and future meta progression separately from the active Run
- At each Phase Transition, autosave first and then offer `Continue`, `Return to Title`, and a secondary confirmed `Abandon Run` action; provide no manual in-Run save controls
- Abandonment clears the active Run save and grants no victory

## Core Gameplay Loop

1. Move through the arena and avoid contact pressure.
2. Begin as a Mortal and evade enemies through movement alone.
3. Route toward a guaranteed early Lingcao while under pressure.
4. Collect dropped qi orbs and claim the Lingcao to secure the first major progression spike.
5. Claim the Lingcao and Breakthrough into Lianqi Chuqi, revealing the cultivator's innate Linggen.
6. Select a Gongfa that expresses that Linggen in combat.
7. Accumulate Qi to earn Gongfa Mastery refinements and trigger later realm Breakthroughs.
8. Survive elite fights, boss phases, and later tribulations.
9. Convert run rewards into longer-term unlocks between runs.

## Combat Model

### Player Baseline

- Movement-driven survival
- No Mortal attack, dash, or invulnerability action; movement is the only defense before the first Gongfa
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
- Gongfa Mastery choices when mastery thresholds are reached
- An early first breakthrough that identifies the cultivator's Linggen
- Gongfa selection after root identification to determine combat expression
- Most later growth should deepen the chosen path rather than flattening all doctrines into one generic pool
- Rare fortunate encounters can introduce limited off-path techniques without replacing the main path
- Later major Breakthroughs when Realm Progress thresholds are reached
- Elite drops that offer treasure-grade upgrades or consumables
- The first slice should contain 3 major Stages, each opening one additional Gongfa slot

The Run begins in the Mortal state. Claiming the Lingcao triggers the first Breakthrough into Lianqi Chuqi, reveals Linggen, and grants Gongfa 1. Each combat Stage is then divided into four ordered Realm Phases: `Chuqi -> Zhongqi -> Houqi -> Dayuanman`. Every Phase is one bounded combat segment and ends at a safe checkpoint. Completing Dayuanman leads into that Stage's concluding Tribulation and subsequent Breakthrough. Yuanying follows the same four-Phase structure before the Heavenly Tribulation.

Claiming the Lingcao freezes combat for the Linggen reveal and Gongfa choice but does not remove the enemies pursuing the Mortal. Resume against the same pack so the first Gongfa's power spike is immediately legible.

Lingcao activates immediately on contact with no channel time. Every reveal or one-of-three choice scene fully pauses enemies, projectiles, spawns, and combat timers until resolved.

Qi fills a Realm Progress meter for the current Phase. Filling it starts the Phase cleanup; completing the subsequent Phase Transition advances from Chuqi to Zhongqi, Zhongqi to Houqi, or Houqi to Dayuanman. Filling Dayuanman and clearing its remaining enemies unlocks the Stage's Tribulation; defeating that challenge triggers the Breakthrough into the next Stage and grants the new Gongfa slot. Gongfa Mastery continues independently throughout.

When a Phase reaches its Realm Progress threshold, stop new spawns and require the player to defeat all remaining enemies. After the final enemy dies, automatically collect every Qi Orb still on the arena. The resulting Phase Transition grants automatic Foundation Growth without a reward-choice screen, resolves queued Mastery choices, autosaves durable Run state, and then begins the next Phase. Remaining enemies are never despawned or carried across the boundary. Exact Foundation Growth stats and scaling remain deferred.

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

For the first vertical slice, the first breakthrough should reveal a Linggen profile rather than ask the player to pick a class-like doctrine directly.

After the first breakthrough, runs should use a soft-hybrid model: most upgrades reinforce the chosen doctrine, while rare fortunate encounters can add constrained cross-path expression. This better matches xiuxian fiction than either rigid class purity or unrestricted build soup.

The first breakthrough should establish the cultivator's elemental foundation first. Gongfa selection should come immediately afterward, so the player first answers "what roots does this cultivator have?" and then answers "how does this path fight?" For readability, the Gongfa choice should present exactly three compatible options.

A Gongfa should define both the cultivator's combat expression and the way that build scales. Each Gongfa is a complete cultivation package containing multiple Skills and passive bonuses, not a single attack behavior. Its documented core pattern is the starting signature Skill through which the package first becomes visible.

Gongfa passives can be internal or global. Internal passives affect only that Gongfa; global passives improve shared Cultivator Attributes or compatible Skills from other Gongfa. These thematic global effects create cross-Gongfa synergy without restoring a generic Qi-upgrade track.

Every Skill has explicit compatibility tags such as `projectile`, `aura`, `fire`, or `defensive`. Global Gongfa passives target tags rather than applying universal damage multipliers, making cross-package synergies predictable and data-driven.

Gongfa should be gated by required Linggen rather than only by broad profile categories. Most Gongfa should require one root, while more advanced or hybrid methods can require two roots. No Gongfa in the first slice should require more than two roots.

When a dual-root cultivator selects Gongfa, the offering should prefer one unlearned single-root Gongfa from each root and one unlearned hybrid Gongfa requiring both roots. If one category is exhausted, fill its slot with any other compatible unlearned Gongfa. This priority-and-fallback structure keeps both affinities visible without repeating learned Gongfa.

Each hybrid Gongfa should be independently authored with its own combat identity and Mastery progression. Hybrid Gongfa should not be generated by combining arbitrary single-root Gongfa, avoiding a combinatorial content and balance matrix.

The first hybrid Gongfa is `Crimson Furnace Sword Art`, requiring Fire + Metal. Skill 1, `Furnace Needles`, launches focused blades that lodge in enemies and detonate when an embed threshold is reached. It carries the `projectile`, `explosive`, `fire`, and `metal` tags. New blades prioritize enemies that already carry embeds until they are primed, then acquire a new target. A short timeout detonates remaining blades so isolated or weak targets do not waste the setup. Its setup-and-burst identity must remain distinct from adding fire damage to `Yujian Jue`.

`Burning Ring Scripture` is the first authored pure-Fire Gongfa and the Fire option for the first-slice Fire+Metal profile. Skill 1, `Revolving Flame Ring`, forms segmented flames with readable gaps around the cultivator; enemies take damage as rotating segments sweep through them. It carries the `aura` and `fire` tags. Repeated sweeps reward close positioning and sustained exposure, while the gaps preserve risk and distinguish it from `Gengjin Huti`.

Its defining passive, `Kindled Meridians`, builds Heat from aura hits and globally increases activation speed for all `aura`-tagged Skills; Heat decays when no enemies are nearby. Proposed Mastery development adds a second counter-rotating ring whose segment intersections create brief high-damage hot zones. Rank-10 Skill 2, `Solar Flare Cycle`, independently synchronizes the rings into complete circles and releases an expanding fire wave while Skill 1 continues. These effects come from Mastery, not realm advancement.

Pre-rank-10 Mastery pool:

- `Broadened Flame`: wider flame segments
- `Rapid Revolution`: faster ring rotation
- `Scorching Passage`: more Skill 1 damage
- `Counterflow Ring`: add and strengthen the second counter-rotating ring
- `Gathering Heat`: Heat builds faster
- `Banked Ember`: Heat decays slower and gives a stronger global `aura` speed bonus

The first-slice Fire+Metal offering contains `Burning Ring Scripture`, the authored Fire+Metal hybrid, and one of the three Metal Gongfa selected randomly for that run.

Its defining passive, `Crucible Pressure`, builds Pressure from explosions and globally increases radius for all `explosive`-tagged Skills; Pressure decays without explosions. Proposed Mastery development adds coordinated multi-blade volleys whose remaining blades retarget once a target is primed. Rank-10 Skill 2, `Furnace Cascade`, independently detonates all current embeds and scatters heated fragments into nearby enemies to begin chain reactions. These effects come from Mastery, not realm advancement.

Pre-rank-10 Mastery pool:

- `Tempered Needles`: more Skill 1 blade damage
- `Rapid Forging`: faster needle volleys
- `Deep Embedding`: lower detonation threshold
- `Furnace Expansion`: larger Skill 1 explosions
- `Rising Pressure`: Pressure builds faster
- `Sealed Crucible`: Pressure decays slower and gives a stronger global `explosive` radius bonus

Linggen can evolve through exceptional progression that adds roots without removing existing ones. Initial Linggen contain one or two roots, while an evolved Linggen can eventually contain all five. Adding a root should immediately expand compatible offerings but should not mutate any learned Gongfa. At the next Stage Breakthrough, the new Gongfa offering should be generated from the cultivator's current revealed Linggen, including any roots added since the previous selection. The hidden and difficult route to obtaining enough roots for Huashen is intentionally deferred while the normal Yuanying path is designed.

Gongfa are not transformed by Stage changes. Existing packages improve only through their own Mastery tracks; a Breakthrough expands the build by adding another Gongfa. Baseline cultivator strength grows separately through automatic Foundation Growth at each Phase Transition.

Gongfa accumulate with combat realms rather than occupying main and support roles: one at Lianqi, two at Zhuji, three at Jindan, and four at Yuanying. All learned Gongfa remain active and retain independent Mastery tracks. Yuanying is a full combat phase: its fourth Gongfa receives a substantial Mastery-building segment before the final Tribulation ends the normal path. A complete five-root Linggen unlocks the non-combat Huashen true ending, which adds no fifth Gongfa.

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

Tune Mastery so an effective-affinity-10 Gongfa normally reaches rank 10 near Dayuanman of the realm in which it was acquired. Lower-affinity Gongfa reach rank 10 later in proportion to their effective affinity, potentially during the next realm.

Realm Progress and Gongfa Mastery are separate meters fed simultaneously by the same Qi pickups. Every learned Gongfa receives the full base Mastery value rather than splitting it, then its Root Affinities determine its individual progression rate. Realm Progress thresholds trigger Phase cleanup; only completing Dayuanman and defeating the Stage Tribulation triggers a Breakthrough. Gongfa Mastery thresholds trigger Gongfa refinement choices. The player does not manually allocate Qi between the meters.

All first-slice Gongfa Skills activate automatically. Player execution comes from movement and positioning; manual Skill activation is deferred unless the control model is deliberately expanded later.

Selecting a Gongfa immediately grants its starting signature Skill and one defining passive. Each learned Gongfa has its own open-ended, run-long Mastery track. Ranks 1–9 each present three Gongfa-specific improvements and grant one choice. Rank 10 automatically unlocks the second Skill. Ranks 11 and beyond continue presenting three improvements, now able to affect either Skill or the package's passives.

Generate each Mastery rank's three options deterministically from the Run seed, Gongfa, and rank. Replaying a Phase or reloading a checkpoint must reproduce the same options rather than provide a reroll.

Each authored Gongfa improvement has an explicit maximum rank, usually three. Once maxed, that improvement leaves the Gongfa's choice pool.

At rank 10, add three Skill-2-specific improvement families to that Gongfa's existing pool: potency, coverage/count, and activation speed. Unmaxed earlier options remain available. Evergreen fallback begins only after every authored option is maxed.

After all authored improvements are maxed, the three-choice panel falls back to evergreen Skill 1 potency, Skill 2 potency, and passive potency improvements. These use diminishing returns to prevent open-ended Mastery from causing runaway scaling.

If one Qi pickup triggers choices for multiple Gongfa, pause combat once and queue the events in Gongfa acquisition order. Resolve every pending choice before resuming combat. Automatic rank-10 Skill unlocks require no choice panel.

Each first-slice Gongfa contains exactly two automatic Skills. The second Skill unlocks at Mastery rank 10; Mastery continues after that milestone, but later content should add more Skills only after this two-Skill model is proven readable and sustainable.

At every combat-Stage Breakthrough, the cultivator keeps all learned Gongfa and selects one additional compatible, unlearned Gongfa for the newly opened slot. Learned Gongfa are excluded from later offerings. If fewer than three compatible unlearned Gongfa remain, the panel presents fewer choices rather than duplicates. Roots added during the run expand later offerings. The Huashen transition ends the run instead of opening another slot.

Generate each Breakthrough offering deterministically from the Run seed, destination Stage, current Linggen, and learned Gongfa. Closing or reloading before selection must reproduce the same offering.

After a realm-ending Tribulation, resolve the Breakthrough transaction in this order: advance to the next realm at Chuqi, open and fill its Gongfa slot, autosave the complete new-realm state, then load the next realm's arena. Never enter the arena before its Gongfa selection is resolved.

For the first vertical slice, the active Linggen pool should contain one single-root profile and one dual-root profile. This validates both selection flows with the minimum coherent content.

Recommended first-slice Linggen pool:

- Single-root: Metal
- Dual-root: Fire+Metal

Pure Fire, pure Water, Water+Metal, and Water+Wood remain scaffolded or deferred. A profile becomes playable only when every Gongfa needed by its three-choice offering is authored.

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
  - taking damage clears all stacks; exact values and duration remain tuning parameters
- Scaling stat: sword count and pierce efficiency
- Support stat: cooldown recovery
- Rank-10 Skill 2: an independently timed sword formation sweeps outward and returns through enemy lines while normal homing volleys continue
- Intended play pattern: kiting, target selection, and efficient pack thinning from mid-range
- Pre-rank-10 Mastery pool:
  - `Twin Sword Split`: more Skill 1 swords
  - `Refined Sword Channel`: faster Skill 1 cycling
  - `Penetrating Edge`: more Skill 1 pierce
  - `Sword Intent Sharpening`: stronger Intent damage bonus
  - `Steady Sword Heart`: longer Intent duration
  - `Tempered Focus`: taking damage removes fewer Intent stacks

#### Jinfeng Gong

- Skill 1 — `Cutting Front`: repeated frontal metal-qi waves aimed in the cultivator's movement direction
- Skill tags: `wave`, `metal`
- Defining passive — `Gale Momentum`: sustained movement builds momentum that globally increases width and range for all `wave`-tagged Skills; stopping causes decay
- Scaling stat: wave width and cut damage
- Support stat: range extension
- Rank-10 Skill 2 — `Golden Gale Corridor`: independently creates a lingering lane of cutting qi that repeatedly damages enemies crossing it
- Intended play pattern: assertive lane-clearing with deliberate positioning instead of passive orbiting damage
- Pre-rank-10 Mastery pool:
  - `Cutting Qi Pressure`: more Cutting Front damage
  - `Broadened Front`: wider waves
  - `Long Edge Resonance`: longer wave range
  - `Gathering Gale`: momentum builds faster
  - `Unbroken Stride`: momentum decays more slowly
  - `Windborne Reach`: stronger global width/range bonus for other `wave` Skills

#### Gengjin Huti

- Skill 1 — `Gengjin Guard`: a close defensive aura that releases retaliatory edge bursts when enemies enter or damage the cultivator
- Skill tags: `aura`, `metal`, `defensive`
- Defining passive — `Tempered Body`: nearby enemies build Guard stacks that globally improve mitigation and `defensive` Skill potency; stacks decay outside danger
- Scaling stat: retaliation damage and guard stability
- Support stat: max health or damage reduction efficiency
- Rank-10 Skill 2 — `Blade Shell`: independently stores a portion of pressure endured and automatically erupts outward at a threshold
- Intended play pattern: controlled close-range survival that turns danger into counter-pressure
- Pre-rank-10 Mastery pool:
  - `Guard Pressure`: more aura damage
  - `Retaliatory Edge`: stronger retaliation bursts
  - `Expanding Guard`: larger aura radius
  - `Hardened Meridians`: more mitigation per Guard stack
  - `Threat Awareness`: Guard builds faster around nearby enemies
  - `Lasting Temper`: slower Guard decay and stronger global `defensive` Skill potency

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
