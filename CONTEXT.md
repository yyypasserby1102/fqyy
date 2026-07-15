# FQYY

FQYY is a single-context game project for a xiuxian-themed action roguelite. This glossary defines the game-specific language the project should use in design and implementation discussions.

## Language

**Run**:
A persistent cultivation journey from spawn to death, victory, or confirmed abandonment. A Run can be saved, closed, and resumed across multiple play sessions; it remains the main unit of progression. Death, victory, or abandonment closes the Run and removes its active save; abandonment is not a victory.
_Avoid_: Match, round, session as a synonym

**Mortal**:
The cultivator's pre-cultivation state at the beginning of a Run, before Linggen revelation or Gongfa acquisition. A Mortal has no attack and survives through movement and the shared Evade action. Reaching the Lingcao triggers the Breakthrough from Mortal into Lianqi Chuqi.
_Avoid_: Lianqi level zero, tutorial class

**Cultivator**:
The player character as a martial-fantasy practitioner advancing through a run. This term frames the fantasy layer above generic player language.
_Avoid_: Hero, avatar

**Cultivator Candidate**:
One of three prospective cultivators offered when starting a Run, each showing their elemental roots and qualitative Affinity Grades. Candidates may differ cosmetically, but their Linggen is initially their only gameplay difference; exact Root Affinities remain hidden.
_Avoid_: Character class, reroll card, starting Gongfa

**Evade**:
A shared Cultivator action that moves 120 pixels over 200 milliseconds in the currently held movement direction and prevents incoming damage for that duration. Evade has a 1.2-second cooldown, requires directional input, and cannot start while the Run is paused or stopped for a choice.
_Avoid_: Passive dodge chance, Gongfa Skill, teleport

**Weapon Family**:
A high-level combat school or elemental direction that defines how a build deals damage and scales.
_Avoid_: Class, loadout

**Build**:
The emergent combination of weapon families, upgrades, and breakthrough choices assembled during a run.
_Avoid_: Spec, kit

**Combat Profile**:
A Gongfa's relative contribution to Damage, Survival, and Control. Every Gongfa contributes to all three because it must function alone in Lianqi, but its emphasis and method of contribution define its combat identity.
_Avoid_: Hard role, class category, damage-only rating

**Gongfa**:
A complete cultivation system containing multiple Skills and passive bonuses that collectively express one path in combat. Passives may affect only that Gongfa or improve shared Cultivator Attributes and compatible Skills across the build. A Gongfa is not one attack or mechanic. Gongfa accumulate as the cultivator advances through combat Stages rather than being divided into main and support roles. Each Gongfa requires compatible Linggen; a hybrid Gongfa requiring two roots is independently authored rather than generated from single-root Gongfa.
_Avoid_: Method as a separate game concept, skill tree, subclass

**Playable Gongfa**:
A Gongfa with a complete starting Skill, defining passive, fixed Mastery Pool, three Transformation milestones, functioning Skill 2, and persistence support. Only Playable Gongfa may appear in Candidate compatibility or Breakthrough offerings.
_Avoid_: Stat-only configuration, placeholder Gongfa, planned Skill

**Cultivator Attribute**:
A shared baseline property of the cultivator, such as movement speed, maximum health, mitigation, or projectile speed. Foundation Growth, Spirit Treasures, and thematic Gongfa passives can modify Cultivator Attributes, allowing learned Gongfa to support one another.
_Avoid_: Basic attack, generic level-up

**Skill**:
A specific combat behavior contained within a Gongfa and unlocked or improved through Gongfa Mastery. A Gongfa contains multiple Skills rather than being a Skill itself.
_Avoid_: Gongfa, weapon

**Skill Tag**:
A trait such as projectile, aura, fire, or defensive that identifies which global Gongfa passives can affect a Skill. Bonuses from different Gongfa to the same tagged property stack additively from its base value unless an exceptional formula is explicitly authored.
_Avoid_: Class, hidden compatibility rule

**Gongfa Mastery**:
An independent progression track representing the cultivator's understanding of one learned Gongfa. Ordinary ranks deterministically integrate authored Mastery Refinements without pausing combat; ranks three, six, and nine instead offer Mastery Transformation decisions, and rank ten automatically unlocks the Gongfa's second Skill.
_Avoid_: Weapon XP, Gongfa level

**Mastery Refinement**:
A deterministic numerical improvement to a Gongfa's existing Skills, passive bonuses, synergies, or related Cultivator Attributes. Each family has authored tiers, remains available until every tier is integrated, and settles automatically at ordinary Mastery ranks so only structural decisions interrupt combat.
_Avoid_: Foundation Growth, generic stat upgrade, Skill unlock

**Mastery Transformation**:
A chosen structural change to how a Gongfa's Skill or passive delivers comparable killing power through a different play pattern. Ranks three, six, and nine each offer three milestone-specific Transformations; the chosen one becomes permanent and the other two become unavailable for that Run.
_Avoid_: Mastery Refinement, flat stat increase, Realm Breakthrough

**Mastery Pool**:
The fixed, authored set of Refinements and Transformations belonging to one Gongfa. Ordinary Refinements are reproducibly selected from this pool and integrated automatically; Transformation offerings are drawn from it at milestone ranks. Effects are never procedurally generated or replaced with generic upgrades when Gongfa-specific content is missing.
_Avoid_: Global upgrade pool, generated stat roll, fallback rewards

**Effect Scope**:
The explicit target of a Mastery effect: a named Skill, the owning Gongfa, its defining passive, a Skill Tag shared across Gongfa, or a Cultivator Attribute. No Mastery effect implicitly changes every Skill through an ambiguous shared Method stat.
_Avoid_: Method-wide bonus, implicit global modifier, unlabeled stat increase

**Fully Mastered**:
The terminal state of a Gongfa after Skill 2 is unlocked and every available Refinement tier in its authored Mastery Pool has been integrated. A Fully Mastered Gongfa remains active but no longer gains Mastery progress or creates choices from Qi; the HUD keeps its completion visible beside newer paths that are still growing.
_Avoid_: Maximum Stage, completed Run, evergreen Mastery

**Stage**:
A major cultivation realm that gates which Gongfa are appropriate and how many Gongfa the cultivator can hold. Each combat Stage progresses through the four Realm Phases Chuqi, Zhongqi, Houqi, and Dayuanman. The combat Stages grant one cumulative Gongfa slot each: one at Lianqi, two at Zhuji, three at Jindan, and four at Yuanying. Yuanying is a full combat Stage with time to develop the fourth Gongfa before its final Tribulation; overcoming that challenge grants the normal ending. Huashen is the hidden, non-combat true ending available only to a cultivator with a complete five-root Linggen.
_Avoid_: Level bracket, chapter

**Realm Phase**:
One of four ordered progression states within a combat Stage. Chuqi introduces the Stage's threats, Zhongqi mixes them at greater density, Houqi adds elite or environmental pressure, and Dayuanman combines them before the concluding Tribulation.
_Avoid_: Level, wave

**Phase Transition**:
The automatic safe boundary after a Realm Phase reaches its progress threshold and its remaining enemies are defeated. It grants Foundation Growth, advances the segmented Realm Progress bar, autosaves, and begins the next Realm Phase without opening a choice panel.
_Avoid_: Realm Phase, Breakthrough

**Realm Progress**:
Cultivation progress toward the next Realm Phase. Qi fills Realm Progress through Chuqi, Zhongqi, Houqi, and Dayuanman; completing Dayuanman makes the Stage's concluding Tribulation available.
_Avoid_: Character level, account XP

**Foundation Growth**:
A small automatic increase to the cultivator's baseline strength granted when a Realm Phase is completed and called out on the Realm Progress bar. Foundation Growth is separate from Gongfa, Gongfa Mastery, and Spirit Treasures.
_Avoid_: Mastery choice, Gongfa improvement

**Linggen**:
The cultivator's innate elemental root profile, selected visibly through one of three Cultivator Candidates at Run start and awakened by the first Breakthrough. An initial Linggen contains one or two roots. Exceptional progression can add roots but never remove them, allowing an evolved Linggen to contain all five elemental roots. A complete five-root Linggen is required to enter Huashen but not to reach the normal Yuanying ending.
_Avoid_: Class, talent tree

**Root Affinity**:
An integer strength from 1 to 10 assigned to each elemental root present in a Linggen. A Linggen's Root Affinities always total exactly 10. Adding a root redistributes those 10 points without reversing the relative strength order of existing roots; equal strengths are allowed.
_Avoid_: Root level, combat multiplier

**Affinity Grade**:
The player-facing qualitative description of a hidden Root Affinity: Weak, Medium, or Strong. Players reason about affinity through Grades rather than exact numbers. Affinity Grade changes progression speed but never blocks a Gongfa compatible with that root.
_Avoid_: Displayed affinity score, rarity

**Cultivation Efficiency**:
The rate at which a cultivator advances through Stages and develops learned Gongfa, derived from Root Affinity. Realm-advancement speed is determined by the cultivator's strongest current Root Affinity. A single-root Gongfa develops according to its required root's affinity; a hybrid Gongfa develops according to the arithmetic average of its required roots' affinities. Narrower Linggen provide greater early Cultivation Efficiency, while broader Linggen trade slower progression for being closer to the five-root requirement for Huashen. Cultivation Efficiency does not directly multiply attack damage or reduce attack cooldown.
_Avoid_: Combat power multiplier, damage efficiency

**Mastery Speed**:
The Slow, Normal, or Fast player-facing rate shown for a Gongfa, derived from the hidden effective affinity of its required roots. Hybrid Gongfa use the average of their required roots.
_Avoid_: Displayed affinity number, damage rating

**Fortunate Encounter**:
A rare opportunity that adds an off-path technique, treasure, or modifier to an existing build without erasing its main cultivation direction.
_Avoid_: Multiclass, random bonus

**Breakthrough**:
A high-impact transition into a new Stage. Reaching the Lingcao triggers the first Breakthrough from Mortal into Lianqi Chuqi, awakens the selected Linggen, and grants the first Gongfa selection. Each later Breakthrough follows the current Stage's Dayuanman Tribulation, adds one Gongfa slot, and preserves learned Gongfa. Entering Huashen ends the Run instead of adding another Gongfa.
_Avoid_: Perk, talent tier

**Qi Orb**:
The primary progression pickup dropped by enemies and collected during a run. The same Qi grants full Realm Progress and full base Mastery progress to every owned Gongfa; Mastery Qi is not divided among Gongfa.
_Avoid_: Gem, soul, XP crystal

**Spirit Treasure**:
A Run-bound item that grants passive utility independently from Gongfa, Gongfa Mastery, and Realm Progress. A cultivator can keep three active Spirit Treasures; acquiring another requires replacing one or leaving the new Treasure behind.
_Avoid_: Gongfa, permanent unlock

**Healing Pill**:
A world pickup that restores missing health immediately on contact. A full-health cultivator does not consume it.
_Avoid_: Inventory item, passive regeneration, permanent upgrade

**Lingcao**:
A spirit herb placed in the opening arena that triggers the Mortal cultivator's first Breakthrough into Lianqi Chuqi and awakens the Linggen selected at Run start. Lingcao does not determine or alter that Linggen.
_Avoid_: Powerup, chest, herb drop

**Tribulation**:
A major danger spike such as an elite encounter, boss phase, or special challenge that tests whether a build can survive its current power band. The `Yuanying Heavenly Tribulation` is the celestial, multi-phase final boss whose defeat grants the normal ending and closes the Run.
_Avoid_: Event, wave gimmick
