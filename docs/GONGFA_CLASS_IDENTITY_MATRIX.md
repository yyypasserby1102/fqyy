# Gongfa Class Identity Matrix

Status: approved roster taxonomy. Individual Gongfa mechanics remain subject
to one-by-one review before implementation.

## Purpose

The roster uses the breadth of Last Epoch's five base-class fantasies as a
distribution model, translated into original xiuxian schools. It does not copy
Last Epoch skills, names, lore, or exact mechanics.

Every Gongfa must differ in all four identity layers:

1. **Core rhythm**: where attacks originate, how they target, and what movement
   or timing the player performs.
2. **Passive engine**: the fact that produces power. A renamed six-stack meter
   is not a new passive.
3. **Mastery decisions**: structural changes with a real playstyle cost, not
   three versions of damage/count/cooldown.
4. **Capstone event**: a signature rule-breaking capability that another
   Gongfa cannot also own.

Two Gongfa fail the identity test if a player could swap their visuals and
names without changing positioning, target selection, resource behavior, or
the purpose of the capstone.

## Five Xiuxian Class Families

| Family | ARPG role model | FQYY combat contract | Passive territory | Capstone territory |
| --- | --- | --- | --- | --- |
| **Faxiu · Arcane Cultivator** | Mage: Sorcerer / Spellblade / Runemaster | Construct spells through charge, sequence, geometry, or elemental timing | Runes, spell order, channel commitment, elemental cycles | Battlefield-scale spell, completed invocation, rule-changing spell state |
| **Youxia · Wandering Adept** | Rogue: Marksman / Bladedancer / Falconer | Win through aim, spacing, movement, marks, and prepared ground | Precision, edge hits, evade timing, target marks, trap retrieval | Execution line, perfect combo, coordinated tactical strike |
| **Hudao · Dao Sentinel** | Sentinel: Paladin / Void Knight / Forge Guard | Hold dangerous ground and turn defense, armor, or resolve into offense | Guard, prevented damage, proximity, retaliation, forged objects | Fortress, judgment, invulnerable stand, catastrophic counter |
| **Yuling · Primal Cultivator** | Primalist: Beastmaster / Druid / Shaman | Fight through companions, transformation, totems, and natural cycles | Companion bond, form state, terrain, weather, ancestral favor | Full transformation, ancestral manifestation, natural disaster |
| **Youxuan · Forbidden Cultivator** | Acolyte: Necromancer / Lich / Warlock | Trade life, bodies, curses, and corruption for escalating power | Health sacrifice, corpses, souls, spreading curses, doomed targets | Rebirth, mass sacrifice, corpse army, battlefield curse |

## Distribution Rule

- Each family owns exactly five of the 25 Gongfa.
- Every pure Linggen contains at least one Gongfa from all five families.
- The sixth method in each pure root deliberately doubles a different family:
  Fire doubles Faxiu, Water doubles Youxuan, Metal doubles Youxia, and Wood
  doubles Yuling.
- Crimson Furnace Sword Art is the fifth Hudao method and the Fire-Metal hybrid.
- Linggen controls elemental expression; class family controls combat behavior.
  Fire must not always mean caster, and Wood must not always mean summoner.

## Uniqueness Gate

Detailed player-approved mechanics and implementation status are recorded in
[`GONGFA_REVIEW_SPECS.md`](GONGFA_REVIEW_SPECS.md).

Every Gongfa must pass this gate before implementation approval. Sharing an element,
family, or surface tag is allowed; sharing the same complete combat loop is not.

- **Automatic combat only:** no Gongfa introduces mouse, pointer, or right-stick
  manual aiming. Player influence comes from movement, position, distance, Evade,
  target availability, and timing.
- **Distinct targeting rule:** nearest target, priority target, weak point chain,
  corpse, route, interception, companion prey, and ground prediction are different
  targeting verbs and must not collapse into generic homing.
- **Distinct spatial shape:** fan, line, returning path, orbit, moving corridor,
  chained zigzag, domain, trap network, companion dive, and body transformation
  must remain mechanically legible silhouettes.
- **Distinct resource engine:** no two Gongfa may use the same “hits build stacks,
  stacks add damage and projectile count, stacks decay” loop under different names.
- **Distinct failure condition:** each method must lose tempo for a different reason,
  such as bad range, broken target chain, reversed movement, depleted ammunition,
  missing corpses, cracked facets, lost proximity, or mistimed commitment.
- **Distinct capstone:** a capstone must change or cash out its own core verb. It may
  not be a generic larger volley, radial burst, or damage field with a new element.

As a review rule, two Gongfa may share at most one surface trait such as projectile,
summon, aura, or fire. They must differ in at least four of these six axes: targeting,
spatial shape, resource, failure condition, player influence, and capstone payoff.

### Approved Youxia separation

- **Blazing Feather Art:** automatic fan, optimal-distance band, finite quiver and
  reload timing, persistent Phoenix Brands, then one automatically selected straight
  execution corridor.
- **Drifting Frost Needle:** automatic single needle, temporary weak-point zigzag,
  Focus from distinct targets in one chain, then an immediate reverse traversal of
  that exact chain. It stores no persistent marks and has no execution corridor.

## Roster Map

| Root | Gongfa | Family | Mastery lens | Unique core rhythm | Unique passive engine | Exclusive capstone promise | Must not resemble |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Fire | Blazing Feather Art | Youxia | Marksman | Aim a feather fan; its narrow outer edge is the precision zone | Perfect-range edge hits load Molten Pinions; misses break the cadence | Phoenix Horizon: one aimed execution shot crosses every marked enemy in a line | Yujian homing, Vermilion companion, Scarlet waves |
| Fire | Scarlet Wave Manual | Faxiu | Sorcerer | Alternate left and right crescent casts to overlap a moving seam | Crossing opposite crescents creates Confluence; repeating one side creates none | Sunset Divide: the arena is split by two converging fire fronts | Blazing fan, Jinfeng movement cuts, Black Tide cycle |
| Fire | Burning Ring Scripture | Hudao | Paladin / Warpath | Remain inside close danger while segmented rings rotate with readable gaps | Heat comes only from distinct enemies kept inside the ring, then cools outside melee | Solar Bulwark: become the moving center of a complete invulnerable corona briefly | Verdant Ring runes, Gengjin retaliation, Flame Demon sacrifice |
| Fire | Nine-Sun Calamity Seal | Faxiu | Sorcerer | Long telegraph; manually commit a delayed sun to predicted enemy ground | Zenith rises while the method is not cast and is spent completely on impact | Nine Suns in One: nine orbiting omens collapse into a single screen-shaking strike | Moonfall gravity, Heaven Edict line, ordinary fire DoT |
| Fire | Flame-Demon Body Art | Youxuan | Lich | Spend current health to extend a brutal point-blank combination | Missing-health thresholds change the combo, reach, and life leech; hits do not fill a meter | Asura Heart: enter an irreversible low-health demon state until combat ends | Heavenfall transformation, Gengjin tanking, Burning Ring proximity |
| Fire | Vermilion Bird Covenant | Yuling | Beastmaster | One persistent bird companion chooses prey while the player directs its dives by movement | Bond changes through keeping the bird near danger without letting it become downed | Vermilion Rebirth: the bird dies, becomes an egg, then returns as a larger phoenix | Blazing projectiles, Myriad Beast pack, Mist Wraith corpses |
| Water | Drifting Frost Needle | Youxia | Marksman | Fire a single aimed needle that ricochets only from a struck weak point | Consecutive hits on different weak points build Focus; repeating one target resets it | Winter Thread: one shot stitches all exposed weak points in reverse order | Yujian sword ammo, Blazing fan, Ice Mirror reflection |
| Water | Black Tide Scripture | Yuling | Shaman | The attack changes automatically through ebb, still water, and flood phases | Tide is a world cycle, not a hit resource; movement changes the phase transition timing | Deluge Mandate: flood the arena, move enemies as one body, then drain it dry | Scarlet alternating waves, Moonfall single collapse, Frozen River curses |
| Water | Ice Mirror Guard | Hudao | Paladin | Maintain a finite set of mirror facets that physically intercept incoming hits | Successful interception cracks a facet; close Evade repairs one, ordinary attacks do not | Frozen Lotus: all intact facets become a brief total shell, then shatter outward | Gengjin damage conversion, Frost Needle ricochet, Verdant orbit |
| Water | Mist Wraith Canon | Youxuan | Necromancer | Recently killed enemies leave souls that can become short-lived wraiths | Soul availability comes from corpses and enemy rank; no corpses means no army | Hundred-Ghost Procession: every stored soul crosses the arena once and is consumed | Vermilion permanent companion, Myriad living pack, generic timed summons |
| Water | Frozen River Formation | Youxuan | Warlock | Curse selected routes; the river awakens only when a cursed enemy crosses another seal | Each crossing transfers Cold Debt between enemies; damage alone produces nothing | Frozen River Prison: debtors are linked into one shared frozen fate | Thousand Root infection, Sword Burial corpses, ordinary pulsing traps |
| Water | Moonfall Tide Ritual | Faxiu | Sorcerer | Charge a movable gravity moon that pulls before it is released to collapse | Syzygy depends on enemies held in orbit at release, rewarding patient grouping | Moonless Eclipse: suspend the battlefield, then resolve all stored motion inward | Nine-Sun delayed blast, Black Tide world cycle, Heaven Edict execution line |
| Metal | Yujian Jue | Youxia | Marksman / weapon master | Command a limited rack of flying swords; launched swords must return before reuse | Sword Intent comes from assigning the right sword to priority targets, not every hit | Returning Sword Formation: all airborne swords reverse through their exact paths | Frost ricochet, Blazing fan, generic homing volleys |
| Metal | Jinfeng Gong | Youxia | Bladedancer | Movement direction draws cutting lanes; standing still produces a weak cast | Momentum is distance traveled without reversing direction and is lost on collision | Golden Gale Corridor: the last movement path becomes a persistent execution lane | Scarlet alternating caster waves, Heavenfall form, Burning Ring orbit |
| Metal | Gengjin Huti | Hudao | Forge Guard | Deliberately absorb close hits behind a forged guard and answer at contact range | Guard stores prevented damage, with a hard capacity and visible fracture states | Blade-Shell Rebound: release the exact stored force as a radial metal counter | Ice Mirror interception, Ironwood stance, Flame Demon missing health |
| Metal | Heavenfall Body Art | Yuling | Druid | Transform temporarily into a mobile falling-star body with a distinct attack set | Mass rises through uninterrupted movement and falls when turning or stopping | Star-Breaking Descent: spend all Mass on a controllable meteor-body landing | Flame Demon health sacrifice, Ancient Tree rooted form, ordinary melee combo |
| Metal | Sword-Burial Formation | Youxuan | Necromancer | Enemy deaths bury one sword at each corpse; no pre-placed generic traps | Corpses become a finite grave-sword inventory tied to their original positions | Ten-Thousand Sword Tomb: every buried sword rises once, then the gravefield is empty | Frozen River crossings, Thousand Root infection, Yujian reusable swords |
| Metal | Heaven-Sundering Edict | Faxiu | Spellblade | Draw one exact sword line, then seal it with a delayed spell judgment | Mandate rewards hitting both the physical draw and its delayed magical echo | Supreme Sundering Decree: repeat the best recorded line across the entire arena | Nine-Sun circle, Moonfall pull, Jinfeng movement trail |
| Fire-Metal | Crimson Furnace Sword Art | Hudao | Forge Guard | Embed forged needles in chosen enemies, then detonate the shared furnace network | Pressure is produced only by simultaneous embeds and controls explosion topology | Furnace Cascade: consume every embed, forge fragments from each, and start one chain | Sword Burial corpses, Yujian returning ammo, ordinary explosive projectiles |
| Wood | Green Vine Art | Youxia | Falconer / trap tactician | Tether two enemies or an enemy and terrain; player movement stretches the damaging line | Tension is geometric distance across a tether, not time or hit count | Heaven-Net Vine: connect all marked enemies into one tightening polygon | Thousand Root infection, Frozen River routes, generic seeking projectiles |
| Wood | Verdant Ring Scripture | Faxiu | Runemaster | Cast three different ring glyphs whose order changes the resulting spell | The last three glyphs are the passive state; repetition and order create different invocations | Sprout-Sun Invocation: complete a rare three-glyph sequence for a unique world bloom | Burning Ring proximity orbit, root traps, passive aura damage |
| Wood | Ironwood Wave Form | Hudao | Forge Guard | Root in place to raise a directional timber rampart; movement cancels construction | Stability grows only while stationary behind the rampart and converts to push force | Ironwood Citadel: raise four walls, then collapse them outward as splinters | Ancient Tree transformation, Gengjin stored damage, Scarlet waves |
| Wood | Thousand-Root Formation | Youxuan | Warlock | Implant parasitic root curses inside living targets rather than placing floor traps | Infected enemies grow roots over time and spread one seed when they die | Myriad-Root Killing Field: all infections erupt simultaneously and become one organism | Sword Burial corpses, Frozen River crossings, Green Vine tethers |
| Wood | Myriad Beast Grove | Yuling | Beastmaster | Maintain a small mixed pack whose species have distinct jobs and positioning | Kinship comes from different beasts assisting the same kill, rewarding pack composition | Ancestral Menagerie: each living species calls its ancestral avatar once | Vermilion single companion, Mist corpse army, generic identical minions |
| Wood | Ancient Tree Body Art | Yuling | Druid | Become a rooted tree form that cannot move but grows a new radial attack set | Growth Rings accumulate while rooted and are lost when uprooting | World-Tree Incarnation: roots cover the arena while the player becomes the immovable trunk | Heavenfall mobile form, Ironwood constructed walls, Gengjin retaliation |

## One-by-One Review Gate

A Gongfa is ready for implementation only after its review answers all of these:

- What does the player watch or control every attack cycle?
- What exact fact activates the passive, and can another Gongfa activate from the
  same fact?
- What does the player deliberately do differently after learning it?
- What is the capstone's one-sentence spectacle and rule change?
- Which two neighboring Gongfa are most likely to overlap, and what mechanics
  prevent that overlap?
- Does each of the three transformation choices change behavior with a real
  cost, rather than only increasing output?
- Does the Chinese cultivation fantasy stand on its own without referring to
  the ARPG inspiration?

## Reference Structure

The distribution model is derived from the official Last Epoch class pages:

- https://lastepoch.com/class/mage/
- https://lastepoch.com/class/rogue/
- https://lastepoch.com/class/sentinel
- https://lastepoch.com/class/primalist/
- https://lastepoch.com/class/acolyte/
