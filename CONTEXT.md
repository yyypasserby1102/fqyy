# FQYY

FQYY is a single-context game project for a xiuxian-themed action roguelite. This glossary defines the game-specific language the project should use in design and implementation discussions.

## Language

**Run**:
A single playable session from spawn to death, victory, or retirement. A run is the main unit of moment-to-moment progression.
_Avoid_: Match, round, session

**Cultivator**:
The player character as a martial-fantasy practitioner advancing through a run. This term frames the fantasy layer above generic player language.
_Avoid_: Hero, avatar

**Weapon Family**:
A high-level combat school or elemental direction that defines how a build deals damage and scales.
_Avoid_: Class, loadout

**Build**:
The emergent combination of weapon families, upgrades, and breakthrough choices assembled during a run.
_Avoid_: Spec, kit

**Gongfa**:
A complete cultivation system containing multiple Skills and passive bonuses that collectively express one path in combat. A Gongfa is not one attack or mechanic. Gongfa accumulate as the cultivator advances through combat Stages rather than being divided into main and support roles. Each Gongfa requires compatible Linggen; a hybrid Gongfa requiring two roots is independently authored rather than generated from single-root Gongfa.
_Avoid_: Method as a separate game concept, skill tree, subclass

**Skill**:
A specific combat behavior contained within a Gongfa and unlocked or improved through Gongfa Mastery. A Gongfa contains multiple Skills rather than being a Skill itself.
_Avoid_: Gongfa, weapon

**Gongfa Mastery**:
An independent progression track representing the cultivator's understanding of one learned Gongfa. Gongfa Mastery unlocks or improves that Gongfa's Skills and passive bonuses at a rate derived from its required Root Affinities.
_Avoid_: Weapon XP, Gongfa level

**Stage**:
A major cultivation realm that gates which Gongfa are appropriate and how many Gongfa the cultivator can hold. The combat Stages grant one cumulative Gongfa slot each: one at Lianqi, two at Zhuji, three at Jindan, and four at Yuanying. Yuanying is the normal ending after the final combat challenge. Huashen is the non-combat true ending, available only to a cultivator who completed a five-root Linggen through optional root-awakening challenges.
_Avoid_: Level bracket, chapter

**Linggen**:
The cultivator's innate elemental root profile, determined at run start, revealed during the first Breakthrough, and defining cultivation affinity before Gongfa selection. An initial Linggen contains one or two roots. Optional root-awakening challenges can add roots but never remove them, allowing an evolved Linggen to contain all five elemental roots. An added root randomly redistributes the Linggen's Root Affinity while preserving the relative order of existing roots, changes Cultivation Efficiency, expands future Gongfa choices, and does not transform learned Gongfa. A complete five-root Linggen is required to enter Huashen but not to reach the normal Yuanying ending.
_Avoid_: Class, talent tree

**Root Affinity**:
An integer strength from 1 to 10 assigned to each elemental root present in a Linggen. A Linggen's Root Affinities always total exactly 10. Adding a root redistributes those 10 points without reversing the relative strength order of existing roots; equal strengths are allowed.
_Avoid_: Root level, combat multiplier

**Cultivation Efficiency**:
The rate at which a cultivator advances through Stages and develops learned Gongfa, derived from Root Affinity. Realm-advancement speed is determined by the cultivator's strongest current Root Affinity. A single-root Gongfa develops according to its required root's affinity; a hybrid Gongfa develops according to the arithmetic average of its required roots' affinities. Narrower Linggen provide greater early Cultivation Efficiency, while broader Linggen trade slower progression for being closer to the five-root requirement for Huashen. Cultivation Efficiency does not directly multiply attack damage or reduce attack cooldown.
_Avoid_: Combat power multiplier, damage efficiency

**Fortunate Encounter**:
A rare opportunity that adds an off-path technique, treasure, or modifier to an existing build without erasing its main cultivation direction.
_Avoid_: Multiclass, random bonus

**Breakthrough**:
A high-impact progression event triggered by a Realm Progress threshold. The first Breakthrough reveals the cultivator's Linggen and grants the first Gongfa selection. Each later combat-Stage Breakthrough adds one Gongfa slot while preserving learned Gongfa. Entering Huashen ends the run instead of adding another Gongfa.
_Avoid_: Perk, talent tier

**Qi Orb**:
The primary progression pickup dropped by enemies and collected during a run. The same Qi grants full Realm Progress and full base Mastery progress to every owned Gongfa; Mastery Qi is not divided among Gongfa.
_Avoid_: Gem, soul, XP crystal

**Lingcao**:
A spirit herb placed in the arena that gives the cultivator an early burst of progression toward the first Breakthrough. Lingcao is an intentional opportunity signal, but it does not determine the cultivator's Linggen.
_Avoid_: Powerup, chest, herb drop

**Tribulation**:
A major danger spike such as an elite encounter, boss phase, or optional root-awakening challenge that tests whether a build can survive its current power band.
_Avoid_: Event, wave gimmick
