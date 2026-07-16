# Difficulty, Spirit Treasure, and Gongfa Redesign

Status: approved for implementation; public test seams confirmed 2026-07-15.

## Problem evidence

- A no-input Lianqi Cultivator dies in roughly 20 seconds, but a simple square-movement bot that presses Evade on cooldown remains at full vitality for 45 seconds while the arena reaches its normal enemy cap. The difficulty problem is therefore ineffective anti-kiting pressure, not insufficient opening damage.
- Lianqi, Zhuji, and Jindan Tribulations are currently confirmation panels. Accepting the choice immediately advances the Stage; there is no encounter to test the build.
- Zhuji reuses Lianqi waves. Realm Phase is not passed to the spawner, the soft cap is fixed at 18, and passive recovery restores four vitality per second after three seconds without damage.
- Spirit Treasures are six flat Cultivator Attribute bonuses. Two pairs overlap, duplicate drops do nothing, and replacement cards describe the held treasure rather than the net consequence of swapping it.
- Mastery Transformations are exclusive and often mechanically implemented, but seven Gongfa share the same focus/spread/quicken, hold/cascade/burst, and crown/domain/Evade template. Choice cards expose prose only: no playstyle label, quantified gain, cost, or build interaction.

## Outcomes

### Complete Wood Linggen path

1. Pure Wood Linggen becomes a first-class Cultivator candidate alongside Fire, Water, and Metal.
2. It exposes all three authored Wood Gongfa: Green Vine Art, Verdant Ring Scripture, and Ironwood Wave Form.
3. Every Wood Gongfa retains its distinct Skill, passive, second Skill, Refinements, and exclusive rank-3/6/9 Transformations; Wood-root synergies are visible in game and Tools.
4. Candidate selection, localization, save data, test controls, and the companion Tools route all recognize the new Linggen.

Acceptance evidence:

- The public Linggen catalog contains seven candidates and pure Wood has Strong Wood affinity with no off-root affinity.
- A pure Wood run can learn and fire all three Wood Gongfa, and their passive/Skill snapshots change under their authored Transformations.
- English and Chinese game/Tools surfaces identify Wood Linggen and its compatible Gongfa without fallback copy.

### Foundation Growth

Every completed Realm Phase and successful Stage Breakthrough grants one automatic Foundation Growth package:

- `+1` base damage to every active Gongfa;
- `+8` maximum vitality, restoring the same amount;
- `+3` movement speed;
- `+8` Qi-orb collection radius.

These are Cultivator Attributes, separate from Gongfa Mastery and Spirit Treasure bonuses. The milestone bar previews the exact next package and the breakthrough presentation names every applied gain. Checkpoints persist the transaction count and resulting attributes without applying them twice after resume.

Acceptance evidence:

- Public snapshots show all four attributes increasing exactly once after each ordinary Phase Transition and successful Tribulation.
- Learning another Gongfa after Foundation Growth gives it the same accumulated base-damage bonus.
- Save/resume preserves the values exactly, including legacy checkpoint migration.

### Difficulty

1. Movement remains required, but repeating a perimeter kite is no longer a zero-damage solution.
2. Every Realm Phase has an explicit pressure profile: composition, spawn cadence, concurrent-enemy budget, health, speed, and contact damage.
3. Houqi and Dayuanman introduce flankers or converging spawn geometry instead of only increasing health.
4. Lianqi, Zhuji, and Jindan end in real Tribulation encounters. A Breakthrough happens only after the Tribulation wave is defeated.
5. Passive regeneration is removed. Healing Pills and treasure mechanics own recovery.
6. Difficulty scales against the number of simultaneously active Gongfa, so accumulated packages do not outgrow encounter pressure.

Acceptance evidence:

- Public encounter snapshots distinguish all Stage/Phase pressure profiles.
- A scripted perimeter-kiting sample loses vitality or must change route before Lianqi Dayuanman.
- Each pre-Yuanying Stage snapshot enters a persisted Tribulation state, spawns its authored enemy composition, and cannot Breakthrough before cleanup.
- A full machine Run can still win with active movement and Evade, proving challenge without an impossible state.

### Spirit Treasures (Baowu)

1. The three-slot constraint remains.
2. Each held treasure has Attunement rank 1–3. A duplicate deepens Attunement instead of disappearing as a no-op.
3. Every treasure has:
   - a primary Cultivator Attribute;
   - a rank-2 signature trigger;
   - a rank-3 culmination;
   - two resonance seals used to form pair synergies.
4. Resonances require two compatible held treasures and are intentionally build-shaping:
   - Vitality: healing amplification and controlled emergency recovery;
   - Bulwark: short protection after a heavy contact hit;
   - Harvest: Qi pickup creates a small tactical benefit rather than raw passive power;
   - Perception: ranged/projectile Gongfa gain reach or force;
   - Windwalk: Evade cadence and movement-triggered Gongfa interact.
5. Replacing a treasure removes its Attunement and any resonance it completed. The offered card shows `gain`, `loss`, and resonance changes before selection.
6. IDs and Attunement ranks persist at safe Run checkpoints. Legacy saves containing only IDs restore every held treasure at rank 1.

Acceptance evidence:

- Duplicate acquisition advances rank and caps at rank 3.
- Effect projection changes at ranks 2 and 3 through the public treasure state.
- Pair resonance appears and disappears when the relevant slot is replaced.
- Save/resume preserves ranks, effects, and active resonance.
- Replacement choice snapshots expose net gains, losses, and resonance changes in Chinese and English.

### Gongfa improvement

1. Ordinary Mastery Refinements remain automatic, honoring the existing ADR. Their rank-up presentation names the exact integrated Refinement and its changed value.
2. Every Transformation card exposes:
   - playstyle identity;
   - concrete gain;
   - concrete cost or opportunity cost;
   - affected Skill/passive scope;
   - compatible treasure resonance when one exists.
3. Rank-3 shape choices become real tradeoffs:
   - focus sacrifices coverage for concentrated force/pierce;
   - spread sacrifices per-hit force for coverage/count;
   - quicken sacrifices per-hit force or resource stability for cadence.
4. Rank-6 resource choices distinguish reliability, acceleration, and spend/burst. Rank-9 choices distinguish persistent output, territory control, and Evade-triggered output.
5. The seven Surge-based Gongfa keep shared runtime infrastructure but receive authored values and language so their choices do not read as renamed copies.
6. Selection feedback immediately shows the new combat behavior and records the lost alternatives.

Acceptance evidence:

- Choice payload snapshots contain playstyle, gain, cost, and scope for all 117 Transformations in both locales.
- Worked combat examples show each rank-3 branch producing different count/damage/cadence or geometry with a real drawback.
- At least one rank-6 and rank-9 branch per runtime archetype has an observable trigger in the browser harness.
- The Gongfa Codex records chosen Transformations and their tradeoffs after save/resume.

## Proposed public seams

1. `advanceRunJourney` plus game/encounter snapshots for Phase and Tribulation behavior.
2. Spirit Treasure acquisition/replacement through projected active treasure state and persisted Run checkpoints.
3. Mastery choice payloads plus observable Gongfa combat snapshots.

These seams were explicitly confirmed before the first TDD slice.

## Vertical implementation order

1. Lianqi Phase pressure and recovery removal.
2. Lianqi combat Tribulation, then generalize it across Zhuji/Jindan.
3. Pure Wood Linggen through candidate selection, all Wood Gongfa, localization, and Tools.
4. Foundation Growth package through phase transition, Tribulation, persistence, HUD, and combat.
5. One treasure (Jade Heart Pendant) with Attunement and legacy persistence.
6. Duplicate acquisition and comparison UI.
7. Remaining treasures and pair resonances.
8. One Surge rank-3 Transformation trio with quantified tradeoffs.
9. General Transformation impact metadata and authored values across every Gongfa.
10. Full-run tuning, machine evidence, localization audit, and visual review.
