# FQYY Progression Dictionary

This document is the practical dictionary for the game's progression tree. It exists to answer:

- what can a run roll at the start
- what choices can appear after the first `Breakthrough`
- how `Gongfa` progresses across realms
- what is real content versus scaffolding

Use this alongside [CONTEXT.md](/home/yiyuny/game-dev/fqyy/CONTEXT.md). `CONTEXT.md` defines terms; this file maps the current progression structure.

## Progression Shape

The first-slice run currently follows this structure:

1. Start as a weak cultivator in `Lianqi`
2. Route to the guaranteed `Lingcao`
3. Trigger the first `Breakthrough`
4. Reveal hidden `Linggen`
5. Choose 1 of 3 compatible `Gongfa`
6. Refine that `Gongfa` through later level-up choices
7. Advance into `Zhuji`
8. Advance into `Jindan`

## Realm Tree

Current playable realm ladder:

- `Lianqi`
  - level requirement: `1`
  - role: unstable opening and method acquisition
- `Zhuji`
  - level requirement: `4`
  - role: build stabilization and first real method expression
- `Jindan`
  - level requirement: `7`
  - role: domination spike and stronger refinement/transformation

Deferred realms:

- `Yuanying`
- `Huashen`

## Linggen Pool

The hidden `Linggen` is rolled at run start and revealed later. First-slice pool:

### Single-root

- `Fire Linggen`
  - roots: `fire`
  - efficiency: `1.15`
  - identity: aggressive and focused
- `Water Linggen`
  - roots: `water`
  - efficiency: `1.15`
  - identity: stable and controlled
- `Metal Linggen`
  - roots: `metal`
  - efficiency: `1.18`
  - identity: sharp and efficient

### Dual-root

- `Fire-Metal Linggen`
  - roots: `fire + metal`
  - efficiency: `0.97`
  - identity: volatile and offensive
- `Water-Metal Linggen`
  - roots: `water + metal`
  - efficiency: `0.97`
  - identity: technical and adaptive
- `Water-Wood Linggen`
  - roots: `water + wood`
  - efficiency: `0.95`
  - identity: resilient and flexible

### Rule

- Single-root is narrower and more efficient
- Dual-root is broader and more flexible
- Triple-root exists in the larger fiction but is not in the first-slice playable pool

## Gongfa Dictionary

General rules:

- A `Gongfa` is offered only if its required roots are included in the currently revealed `Linggen`
- Most `Gongfa` require one root
- Some future `Gongfa` can require two roots
- The player currently holds one main `Gongfa`
- Support `Gongfa` design is unresolved

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

#### Metal Progression Tree

This is the first branch that should be treated as a fully authored reference path.

##### Entry Condition

- hidden run-start `Linggen`: `Metal Linggen`
- first `Breakthrough`: reveal `Metal Linggen`
- immediate `Gongfa` choice: exactly one of the three methods below

##### Realm Arc

- `Lianqi`
  - acquire the initial method
  - establish the basic combat rhythm
- `Zhuji`
  - stabilize the method
  - unlock a stronger expression layer without losing identity
- `Jindan`
  - materially refine or transform the method
  - create the run's domination spike

##### Branch A: Yujian Jue

- `Lianqi`
  - core state:
    - one disciplined flying sword
    - low pierce
    - single-target pressure
  - player fantasy:
    - controlled precision
    - clean kiting
- `Zhuji`
  - refinement:
    - multiple swords per volley
    - better pierce
    - smoother target clearing
  - intended feeling:
    - the method becomes reliable rather than improvised
- `Jindan`
  - transformation:
    - swords split and return through enemy lines
    - pressure extends beyond first contact
  - intended feeling:
    - battlefield command rather than simple projectile spam
- refinement nodes:
  - `Sword Intent Sharpening`
    - more method damage
  - `Twin Sword Split`
    - more swords per volley
  - `Refined Sword Channel`
    - faster cycling

##### Branch B: Jinfeng Gong

- `Lianqi`
  - core state:
    - short frontal cutting waves
    - route-dependent pressure
    - stronger lane control than tracking
  - player fantasy:
    - face danger and cut a path open
- `Zhuji`
  - refinement:
    - broader wave fan
    - more wave count
    - better crowd control in front arc
  - intended feeling:
    - the method becomes assertive instead of tentative
- `Jindan`
  - transformation:
    - cutting fronts become sustained battlefield presence
    - lingering metal-qi trails or equivalent persistent pressure
  - intended feeling:
    - the player owns space instead of merely firing through it
- refinement nodes:
  - `Cutting Qi Pressure`
    - more method damage
  - `Broadened Front`
    - more wave count
  - `Long Edge Resonance`
    - more reach and threat width

##### Branch C: Gengjin Huti

- `Lianqi`
  - core state:
    - defensive aura
    - retaliatory close-range edge bursts
    - danger-conversion playstyle
  - player fantasy:
    - endure pressure and answer it
- `Zhuji`
  - refinement:
    - stronger guard expression
    - larger aura radius
    - retaliation becomes dependable rather than incidental
  - intended feeling:
    - close-range survival becomes deliberate and stable
- `Jindan`
  - transformation:
    - absorbed pressure erupts outward as a blade shell
    - defensive posture becomes offensive inevitability
  - intended feeling:
    - enemies commit into your domain and pay for it
- refinement nodes:
  - `Guard Pressure`
    - more aura damage
  - `Retaliatory Edge`
    - more retaliation damage
  - `Expanding Shell`
    - larger defensive zone

##### Authoring Goal

The `Metal` tree should become the benchmark for all later branches:

- each `Gongfa` must feel different by minute 2
- `Zhuji` must feel like stabilization, not just numbers
- `Jindan` must feel like a genuine cultivation leap

### Fire Root

- `Blazing Feather Art`
  - required roots: `fire`
  - pattern: `homing`
  - fantasy: blazing feather shots
  - status: scaffold content
- `Burning Ring Scripture`
  - required roots: `fire`
  - pattern: `aura`
  - fantasy: rotating heat aura
  - status: scaffold content
- `Scarlet Wave Manual`
  - required roots: `fire`
  - pattern: `wave`
  - fantasy: scorching crescents
  - status: scaffold content

### Water Root

- `Drifting Frost Needle`
  - required roots: `water`
  - pattern: `homing`
  - fantasy: curved frost needles
  - status: scaffold content
- `Black Tide Scripture`
  - required roots: `water`
  - pattern: `wave`
  - fantasy: layered water tides
  - status: scaffold content
- `Ice Mirror Guard`
  - required roots: `water`
  - pattern: `aura`
  - fantasy: defensive cold mirrors
  - status: scaffold content

### Wood Root

Wood is only present to support the `Water-Wood` dual-root profile right now.

- `Green Vine Art`
  - required roots: `wood`
  - pattern: `homing`
  - fantasy: living vine lashes
  - status: scaffold content
- `Verdant Ring Scripture`
  - required roots: `wood`
  - pattern: `aura`
  - fantasy: thorned growth ring
  - status: scaffold content
- `Ironwood Wave Form`
  - required roots: `wood`
  - pattern: `wave`
  - fantasy: rib-like slashing fronts
  - status: scaffold content

## Compatibility Tree

This is the current practical lookup for what a revealed `Linggen` can roll from the `Gongfa` pool.

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
  - all `Fire` methods
  - all `Metal` methods
- `Water + Metal`
  - all `Water` methods
  - all `Metal` methods
- `Water + Wood`
  - all `Water` methods
  - all `Wood` methods

Current choice rule:

- after reveal, the game shows exactly `3` compatible `Gongfa`
- dual-root profiles can pull from both single-root pools

## Stage Progression By Gongfa

Each `Gongfa` has a state for each realm:

- `Lianqi`
  - first combat expression
- `Zhuji`
  - stabilization and expansion
- `Jindan`
  - stronger refinement or transformation

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

This is the current progression schema, even where the authored feel still needs iteration.

## Upgrade Tree

There are currently two upgrade categories:

### Generic upgrades

- movement speed
- max health
- healing
- orb magnet

### Gongfa-specific upgrades

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

## What Is Actually Finished

Currently authored enough to be judged:

- `Linggen` reveal structure
- realm ladder through `Jindan`
- generalized `Gongfa` selection flow
- `Metal` as the main design target

Currently present but not yet trustworthy as final design:

- `Fire` methods
- `Water` methods
- `Wood` methods
- late-stage feel of `Zhuji` and `Jindan`

Currently unresolved:

- support `Gongfa`
- `Linggen` completion/evolution events
- dual-root exclusive `Gongfa`
- true endgame beyond `Jindan`

## Recommended Use

When discussing new content, specify it in this order:

1. `Linggen`
2. realm
3. `Gongfa`
4. upgrade/refinement

Example:

- not: "add a cool sword skill"
- yes: "`Metal Linggen`, `Zhuji`, `Yujian Jue`, new refinement that adds a return-blade split"
