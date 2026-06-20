# FQYY Game Design

## Elevator Pitch

`FQYY` is a 2D action roguelite with a xiuxian cultivation theme. The player survives escalating monster waves while refining their build through sect techniques, spirit treasures, and breakthrough choices. The target feel is "Vampire Survivors pressure with cultivation progression and readable martial-fantasy spectacle."

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
  - Late game: survive elite pressure, complete a major breakthrough, and defeat a boss or final calamity

## Core Gameplay Loop

1. Move through the arena and avoid contact pressure.
2. Survive the opening with a weak baseline self-defense tool.
3. Route toward a guaranteed early Lingcao while under pressure.
4. Collect dropped qi orbs and claim the Lingcao to secure the first major progression spike.
5. Reach an early breakthrough that reveals the cultivator's innate Linggen.
6. Select a Gongfa that expresses that Linggen in combat.
7. Level up and choose upgrades that deepen or hybridize the build.
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
- Standard level-up choices every time the XP threshold is reached
- An early first breakthrough that identifies the cultivator's Linggen
- Gongfa selection after root identification to determine combat expression
- Most later growth should deepen the chosen path rather than flattening all doctrines into one generic pool
- Rare fortunate encounters can introduce limited off-path techniques without replacing the main path
- Later major breakthrough choices at milestone levels or timed intervals
- Elite drops that offer treasure-grade upgrades or consumables
- The first slice should contain 3 major Stages, each with a meaningful Gongfa refinement opportunity

Advancing to the next Stage should usually preserve the identity of the current Gongfa while unlocking a stronger expression layer, but some transitions can materially transform or replace the current combat pattern when the cultivation step is large enough to justify it.

For the first vertical slice, the run should span Lianqi -> Zhuji -> Jindan. Yuanying and Huashen should remain outside the first slice so later realms retain their narrative and mechanical weight.

Mechanical identity by realm:

- Lianqi: unstable survival and basic method acquisition
- Zhuji: build stabilization and first true method expression
- Jindan: domination spike and major transformation or refinement

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

A Gongfa should define both the cultivator's combat expression and the way that build scales. In practice, that means a Gongfa changes both attack behavior and progression logic rather than acting as a cosmetic wrapper on top of a generic weapon system.

Gongfa should be gated by required Linggen rather than only by broad profile categories. Most Gongfa should require one root, while more advanced or hybrid methods can require two roots. No Gongfa in the first slice should require more than two roots.

When a dual-root cultivator selects Gongfa, the option set should mix single-root methods from either root with some dual-root-compatible methods. This preserves the flexibility advantage of mixed affinity without requiring every dual-root profile to have a fully bespoke content track.

Linggen can evolve later through rare progression events, including completion toward broader affinity profiles. However, Gongfa offerings should always be generated from the cultivator's current revealed Linggen at the time of selection, not from hypothetical future roots.

Gongfa should also be stage-bound. A method that is appropriate for the cultivator's current stage may later be refined, replaced, or supplemented by a stronger Gongfa at the next major Breakthrough. This keeps progression aligned with xiuxian logic: methods are not eternally universal, and advancing cultivation should unlock higher-order practice rather than only bigger numbers on the same technique.

At any given time, the cultivator should carry one main Gongfa and one support Gongfa. This creates room for stage progression and synergy without turning the build into an unreadable stack of parallel systems.

For scope control and readability, a Linggen in FQYY should contain at most three roots overall, but the first slice should only support single-root and dual-root profiles.

Root purity should create tradeoffs rather than a flat rarity ladder. Single-root cultivators should feel more specialized and efficient within one doctrine, while dual-root cultivators should gain broader access and hybrid potential at the cost of peak efficiency.

For the first vertical slice, the active Linggen pool should be limited to 3 single-root profiles and 3 dual-root profiles. This is enough to validate the system without exploding the Gongfa matrix too early.

Recommended first-slice Linggen pool:

- Single-root: Fire, Water, Metal
- Dual-root: Fire+Metal, Water+Metal, Water+Wood

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
2. Replace generic upgrades with archetype-specific and synergy-driven choices.
3. Extend the run from 6 minutes to 12 minutes with elite and boss beats.
4. Redesign the enemy roster around combat roles instead of only stat variation.
5. Add one breakthrough event that materially changes how the run plays.
