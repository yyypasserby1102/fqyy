# FQYY First Slice PRD

## Product Goal

Build a playable first vertical slice of a xiuxian-themed action roguelite where the cultivator begins weak, reveals an innate `Linggen`, selects a stage-appropriate `Gongfa`, and advances from `Lianqi` to `Zhuji` to `Jindan` in one run.

## Problem

The current prototype has a competent survival loop, but it still behaves like a generic one-weapon survivor with xiuxian flavor text on top. The project needs a real cultivation progression model that changes how runs are structured and how combat identity emerges.

## Success Criteria

- The opening minute feels intentionally weak and transitions into a meaningful identity reveal.
- The run exposes a hidden `Linggen` at the first `Breakthrough`.
- The player chooses 1 of 3 compatible `Gongfa` immediately after `Linggen` reveal.
- The run advances through `Lianqi`, `Zhuji`, and `Jindan` with visible combat evolution.
- At least one root with three concrete `Gongfa` options is playable end to end.
- The implementation is data-driven enough to add new roots and methods without rewriting core scene flow.

## Target Experience

The player starts as an underdeveloped cultivator with only weak self-defense. Under pressure, they route to a guaranteed early `Lingcao`, trigger the first `Breakthrough`, discover their innate `Linggen`, and choose a `Gongfa` that determines both combat behavior and scaling. Later breakthroughs deepen or transform that method as the cultivator ascends into higher realms.

## Locked Domain Decisions

- `Linggen` is innate, determined at run start, and revealed during the first `Breakthrough`.
- First-slice `Linggen` profiles are only single-root and dual-root.
- `Linggen` can contain at most three roots overall, but triple-root profiles are outside the first slice.
- Root purity is a tradeoff:
  - Single-root is narrower and more efficient.
  - Dual-root is broader and more flexible.
- `Lingcao` accelerates the first reveal but does not affect `Linggen`.
- `Gongfa` is selected immediately after `Linggen` reveal.
- Exactly three compatible `Gongfa` options are presented.
- `Gongfa` defines both combat expression and scaling.
- `Gongfa` has required `Linggen`, usually one root and at most two.
- `Linggen` can evolve later, but `Gongfa` offers are generated from currently revealed roots only.
- `Gongfa` is stage-bound.
- The cultivator can hold one main `Gongfa` and one support `Gongfa`.
- Support `Gongfa` behavior is unresolved and explicitly deferred.

## First-Slice Realm Arc

- `Lianqi`: unstable survival and basic method acquisition
- `Zhuji`: build stabilization and first true method expression
- `Jindan`: domination spike and major transformation or refinement

This first slice ends at `Jindan`. `Yuanying` and `Huashen` are out of scope.

## First-Slice Linggen Pool

- Single-root:
  - Fire
  - Water
  - Metal
- Dual-root:
  - Fire + Metal
  - Water + Metal
  - Water + Wood

## First Fully Authored Root

The first fully playable root is `Metal`.

### Metal Gongfa Trio

#### Yujian Jue

- Behavior: auto-targeted flying sword volleys
- Scaling: sword count and pierce efficiency
- Support stat: cooldown recovery
- Jindan evolution: swords split on hit and return through enemies

#### Jinfeng Gong

- Behavior: frontal cutting waves
- Scaling: wave width and cut damage
- Support stat: range extension
- Jindan evolution: cutting waves leave lingering metal-qi trails

#### Gengjin Huti

- Behavior: defensive aura with retaliatory bursts
- Scaling: retaliation damage and guard stability
- Support stat: max health or mitigation efficiency
- Jindan evolution: absorbed pressure erupts as a blade shell

## Gameplay Flow

1. Spawn in `Lianqi` with weak baseline defense.
2. Survive early enemy pressure and route toward a guaranteed `Lingcao`.
3. Trigger the first `Breakthrough`.
4. Reveal hidden `Linggen`.
5. Present exactly three compatible `Gongfa` choices.
6. Advance through normal level-up choices that mostly deepen the chosen method.
7. Reach `Zhuji`, refining or materially evolving the active `Gongfa`.
8. Reach `Jindan`, gaining a stronger transformation or refinement.
9. Finish the run under high-pressure late-game conditions.

## Implementation Scope

### Must Have

- Hidden `Linggen` generation at run start
- First `Breakthrough` flow: reveal -> `Gongfa` choice
- Data model for roots, profiles, realms, and methods
- Stage progression for `Lianqi`, `Zhuji`, `Jindan`
- One fully implemented root with three playable `Gongfa`
- HUD updates for realm, root, and method state
- Graybox visuals for the new systems

### Should Have

- A visible `Lingcao` world object or equivalent scripted opening trigger
- Realm-specific messaging for breakthroughs
- Method-specific upgrade pools instead of the current generic list

### Out of Scope

- Full five-element content matrix
- Triple-root playable profiles
- `Yuanying` and `Huashen`
- Final support `Gongfa` system behavior
- Meta progression and account-level unlock economy

## Technical Direction

- Keep the current Phaser scene structure.
- Move progression identity into data:
  - `linggen.ts`
  - `gongfa.ts`
  - `stages.ts`
- Replace the current upgrade-only identity loop with explicit breakthrough phases.
- Reuse the existing three-choice panel for both root revelation and `Gongfa` selection, with event payloads generalized beyond upgrades.
- Preserve the current graybox texture approach for speed.

## Risks

- Overloading the current level-up panel with multiple choice types without a proper schema
- Building too many roots before one complete root is satisfying
- Treating realms as simple stat multipliers instead of method changes
- Making the opening too weak or too long before the first reveal

## Milestones

1. PRD and issue breakdown
2. Core progression skeleton: `Linggen`, `Breakthrough`, `Gongfa`, `Stage`
3. One complete `Metal` path with three methods
4. Realm refinement pass for `Zhuji` and `Jindan`
5. Additional roots after the vertical slice feels coherent
