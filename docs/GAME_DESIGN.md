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

- Session length: 12 to 18 minutes for a standard run
- Current MVP length: 6 minutes
- Long-term structure:
  - Early game: establish one primary damage engine and one survival layer
  - Mid game: branch into synergy packages and manage denser enemy behaviors
  - Late game: defeat the final Yuanying combat challenge for the normal ending, or complete the optional five-root path to reach the non-combat Huashen true ending

## Core Gameplay Loop

1. Move through the arena and avoid contact pressure.
2. Survive the opening with a weak baseline self-defense tool.
3. Route toward a guaranteed early Lingcao while under pressure.
4. Collect dropped qi orbs and claim the Lingcao to secure the first major progression spike.
5. Reach an early breakthrough that reveals the cultivator's innate Linggen.
6. Select a Gongfa that expresses that Linggen in combat.
7. Accumulate Qi to earn Gongfa Mastery refinements and trigger later realm Breakthroughs.
8. Survive elite fights, boss phases, and later tribulations.
9. Convert run rewards into longer-term unlocks between runs.

## Combat Model

### Player Baseline

- Movement-driven survival
- Minimal baseline self-defense rather than a fully expressive starting kit
- Health and recovery as scarce resources
- Pickup magnet as an important comfort stat
- Early fragility is intentional so the first breakthrough feels decisive
- The opening minute should ask the player to contest a known Lingcao location under pressure

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
- Economy tools: larger pickup radius, bonus qi, rerolls, fate manipulation
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

Advancing to the next Stage does not modify existing Gongfa, Skills, passives, or Mastery. It opens one additional Gongfa slot. Separate realm-wide improvements are deferred and out of scope for the first slice.

For the first vertical slice, the run should span Lianqi -> Zhuji -> Jindan. Yuanying and Huashen should remain outside the first slice so later realms retain their narrative and mechanical weight.

Mechanical identity by realm:

- Lianqi: unstable survival and first Gongfa acquisition
- Zhuji: build stabilization through a second Gongfa
- Jindan: domination spike through a third Gongfa
- Yuanying: final combat realm with four active Gongfa
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
- 12 to 18 common upgrades
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

Gongfa should be gated by required Linggen rather than only by broad profile categories. Most Gongfa should require one root, while more advanced or hybrid methods can require two roots. No Gongfa in the first slice should require more than two roots.

When a dual-root cultivator selects Gongfa, the offering should prefer one unlearned single-root Gongfa from each root and one unlearned hybrid Gongfa requiring both roots. If one category is exhausted, fill its slot with any other compatible unlearned Gongfa. This priority-and-fallback structure keeps both affinities visible without repeating learned Gongfa.

Each hybrid Gongfa should be independently authored with its own combat identity and Mastery progression. Hybrid Gongfa should not be generated by combining arbitrary single-root Gongfa, avoiding a combinatorial content and balance matrix.

The first hybrid Gongfa is `Crimson Furnace Sword Art`, requiring Fire + Metal. Its starting signature Skill launches metal blades that lodge in enemies and detonate when an embed threshold is reached. New blades prioritize enemies that already carry embeds until they are primed, then acquire a new target. A short timeout detonates remaining blades so isolated or weak targets do not waste the setup. Its setup-and-burst identity must remain distinct from adding fire damage to `Yujian Jue`.

`Burning Ring Scripture` is the first authored pure-Fire Gongfa and the Fire option for the first-slice Fire+Metal profile. Its starting signature Skill forms a segmented flame ring with readable gaps around the cultivator; enemies take damage as rotating segments sweep through them. Repeated sweeps reward close positioning and sustained exposure, while the gaps preserve risk and distinguish it from `Gengjin Huti`.

Proposed Mastery development for `Burning Ring Scripture` adds a second counter-rotating ring whose segment intersections create brief high-damage hot zones. Its rank-10 Skill candidate synchronizes both rings into complete circles and releases an expanding fire wave before returning to the segmented pattern. These effects come from Mastery, not realm advancement.

The first-slice Fire+Metal offering contains `Burning Ring Scripture`, the authored Fire+Metal hybrid, and one of the three Metal Gongfa selected randomly for that run.

Proposed Mastery development for `Crimson Furnace Sword Art` adds coordinated multi-blade volleys whose remaining blades retarget once a target is primed. Its rank-10 Skill candidate ejects heated fragments from detonations into nearby enemies, where they count as embeds and can trigger short chain reactions. These effects come from Mastery, not realm advancement.

Linggen can evolve through optional root-awakening challenges that add roots without removing existing ones. Initial Linggen contain one or two roots, while an evolved Linggen can eventually contain all five. Adding a root should immediately expand compatible offerings but should not mutate any learned Gongfa. At the next Stage Breakthrough, the new Gongfa offering should be generated from the cultivator's current revealed Linggen, including any roots added since the previous selection.

Gongfa are not transformed by Stage changes. Existing packages improve only through their own Mastery tracks; a Breakthrough expands the build by adding another Gongfa. Separate realm-wide improvements may be designed later but are not part of the first slice.

Gongfa accumulate with combat realms rather than occupying main and support roles: one at Lianqi, two at Zhuji, three at Jindan, and four at Yuanying. All learned Gongfa remain active and retain independent Mastery tracks. Yuanying ends the normal combat path. A complete five-root Linggen unlocks the non-combat Huashen true ending, which adds no fifth Gongfa.

For scope control and readability, the first slice should only support initial single-root and dual-root profiles. Root-adding evolution toward three, four, or five roots belongs to later content.

Root purity should create tradeoffs rather than a flat rarity ladder. Single-root cultivators should feel more specialized and efficient within one doctrine, while dual-root cultivators should gain broader access and hybrid potential at the cost of peak efficiency.

Cultivation Efficiency governs how quickly the cultivator advances realms and develops learned Gongfa; it must not directly modify damage or attack cooldown. Narrower Linggen progress faster early, while broader Linggen begin closer to the long-term requirement that all five roots be present before entering Huashen. This makes root breadth a time-horizon tradeoff rather than a universal combat penalty.

Every present root has an integer Root Affinity from 1 to 10, and all affinities in a Linggen always total exactly 10. Adding a root randomly redistributes the same 10 points without reversing the relative strength order of existing roots; ties are allowed. For example, an initial Fire affinity of 10 can become Fire 8 / Water 2 after Water is added.

Realm-advancement speed is derived from the strongest current Root Affinity. Thus Fire 8 / Water 2 advances faster than Fire 6 / Water 4, while a single-root affinity of 10 is fastest. The exact multiplier curve is a balance parameter, not a direct combat modifier.

Gongfa-development speed is derived from the affinities required by that Gongfa. A single-root Gongfa uses its required root's affinity. A hybrid Gongfa uses the arithmetic average of its two required roots; for example, Fire 8 / Metal 2 develops `Crimson Furnace Sword Art` at affinity 5.

Realm Progress and Gongfa Mastery are separate meters fed simultaneously by the same Qi pickups. Every learned Gongfa receives the full base Mastery value rather than splitting it, then its Root Affinities determine its individual progression rate. Realm thresholds trigger Breakthroughs; Gongfa Mastery thresholds trigger Gongfa refinement choices. The player does not manually allocate Qi between the meters.

All first-slice Gongfa Skills activate automatically. Player execution comes from movement and positioning; manual Skill activation is deferred unless the control model is deliberately expanded later.

Selecting a Gongfa immediately grants its starting signature Skill and one defining passive. Each learned Gongfa has its own open-ended, run-long Mastery track. Ranks 1–9 each present three Gongfa-specific improvements and grant one choice. Rank 10 automatically unlocks the second Skill. Ranks 11 and beyond continue presenting three improvements, now able to affect either Skill or the package's passives.

Each authored Gongfa improvement has an explicit maximum rank, usually three. Once maxed, that improvement leaves the Gongfa's choice pool.

After all authored improvements are maxed, the three-choice panel falls back to evergreen Skill 1 potency, Skill 2 potency, and passive potency improvements. These use diminishing returns to prevent open-ended Mastery from causing runaway scaling.

If one Qi pickup triggers choices for multiple Gongfa, pause combat once and queue the events in Gongfa acquisition order. Resolve every pending choice before resuming combat. Automatic rank-10 Skill unlocks require no choice panel.

Each first-slice Gongfa contains exactly two automatic Skills. The second Skill unlocks at Mastery rank 10; Mastery continues after that milestone, but later content should add more Skills only after this two-Skill model is proven readable and sustainable.

At every combat-Stage Breakthrough, the cultivator keeps all learned Gongfa and selects one additional compatible, unlearned Gongfa for the newly opened slot. Learned Gongfa are excluded from later offerings. If fewer than three compatible unlearned Gongfa remain, the panel presents fewer choices rather than duplicates. Roots added during the run expand later offerings. The Huashen transition ends the run instead of opening another slot.

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
- Scaling stat: sword count and pierce efficiency
- Support stat: cooldown recovery
- Signature breakthrough evolution: split swords on hit and return through enemy lines
- Intended play pattern: kiting, target selection, and efficient pack thinning from mid-range

#### Jinfeng Gong

- Primary attack behavior: repeated frontal cutting waves that reward facing and route discipline
- Scaling stat: wave width and cut damage
- Support stat: range extension
- Signature breakthrough evolution: cutting waves leave lingering metal qi trails that continue slicing enemies
- Intended play pattern: assertive lane-clearing with deliberate positioning instead of passive orbiting damage

#### Gengjin Huti

- Primary attack behavior: defensive metal-body aura with retaliatory edge bursts when enemies enter close range or hit the cultivator
- Scaling stat: retaliation damage and guard stability
- Support stat: max health or damage reduction efficiency
- Signature breakthrough evolution: convert absorbed pressure into a timed blade-shell eruption
- Intended play pattern: controlled close-range survival that turns danger into counter-pressure

## Economy And Rewards

- Common drops: qi orbs
- Elite drops: spirit treasure, healing pill, reroll token
- Boss rewards: sect scripture, map unlock, new doctrine

## Map Direction

The first map should communicate "cultivation world" immediately without depending on high-detail art.

- Fallen sect courtyard
- Broken spirit lanterns
- Cracked jade tiles
- Sparse fog banks and drifting talisman ash

Future maps:

- Mist bamboo valley
- Burial ridge
- Demon market outskirts

## Tone

- Serious martial-fantasy framing
- Clean and readable language in combat UI
- Short item lore lines with sect flavor, not comedy writing

## Immediate Design Tasks

1. Expand the current one-weapon prototype into three distinct weapon families.
2. Replace the generic Qi-upgrade track with Gongfa Mastery refinements and external utility rewards.
3. Extend the run from 6 minutes to 12 minutes with elite and boss beats.
4. Redesign the enemy roster around combat roles instead of only stat variation.
5. Add one breakthrough event that materially changes how the run plays.
