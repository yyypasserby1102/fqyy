# Gongfa Review Specifications

This is the canonical record of player-approved Gongfa mechanics. It supports
implementation, testing, balance review, and future regression checks.

## Source-of-truth rules

- `GONGFA_CLASS_IDENTITY_MATRIX.md` owns the 5×5 taxonomy and uniqueness gate.
- This document owns the detailed mechanics approved in one-by-one reviews.
- `Design approved` does not mean the current runtime implements the design.
- `Implemented and verified` requires matching runtime, presentation, Codex copy,
  localization, and focused tests.
- Any later mechanical revision must update this document in the same commit.

## Global constraints

- Combat is automatic. No mouse, pointer, or right-stick manual aiming.
- Players influence targeting through movement, position, distance, Evade, timing,
  and target availability.
- Do not reuse “hits build stacks; stacks add damage/projectiles; stacks decay.”
- Every Gongfa needs a distinct targeting rule, spatial silhouette, resource engine,
  failure condition, player lever, and capstone payoff.
- Milestone choices state both gain and cost and materially change the loop.

## Review status

| Gongfa | Family | Review | Implementation |
| --- | --- | --- | --- |
| Blazing Feather Art / 烈羽诀 | Youxia | Approved | Pending redesign |
| Drifting Frost Needle / 游霜针 | Youxia | Approved | Pending redesign |
| Yujian Jue / 御剑诀 | Youxia | Approved | Pending redesign |
| Jinfeng Gong / 金锋功 | Youxia | Approved | Pending redesign |
| Green Vine Art / 青藤诀 | Youxia | Approved | Pending redesign |
| Nine-Sun Calamity Seal / 九阳劫印 | Faxiu | Approved | Pending redesign |
| Scarlet Wave Manual / 赤浪真诀 | Faxiu | Approved | Pending redesign |
| Moonfall Tide Ritual / 月坠潮仪 | Faxiu | Approved | Pending redesign |
| Heaven-Sundering Edict / 断天敕令 | Faxiu | Approved | Pending redesign |
| Verdant Ring Scripture / 碧环经 | Faxiu | Approved | Implemented and verified |
| Burning Ring Scripture / 焚轮经 | Hudao | Approved | Implemented and verified |
| Ice Mirror Guard / 冰镜护体 | Hudao | Approved | Implemented and verified |
| Gengjin Huti / 庚金护体 | Hudao | Approved | Implemented and verified |
| Ironwood Wave Form / 铁木浪形 | Hudao | Approved | Implemented and verified |
| Crimson Furnace Sword Art / 赤炉剑法 | Hudao | Approved | Implemented and verified |
| Vermilion Bird Covenant / 朱雀灵契 | Yuling | Approved | Implemented and verified |
| Black Tide Scripture / 玄潮经 | Yuling | Approved | Implemented and verified |
| Heavenfall Body Art / 天坠锻体术 | Yuling | Approved | Implemented and verified |
| Myriad Beast Grove / 万兽灵林 | Yuling | Approved | Implemented and verified |
| Ancient Tree Body Art / 古木锻体术 | Yuling | Approved | Implemented and verified |
| Flame-Demon Body Art / 炎魔锻体术 | Youxuan | Approved | Implemented and verified |
| Mist Wraith Canon / 雾灵真典 | Youxuan | Approved | Implemented and verified |
| Frozen River Formation / 冰河伏阵 | Youxuan | Approved | Implemented and verified |
| Sword-Burial Formation / 葬剑伏阵 | Youxuan | Approved | Pending redesign |
| Myriad-Root Lifebinding Canon / 万根寄命经 | Youxuan | Approved | Pending redesign |

---

## Blazing Feather Art / 烈羽诀

**Identity:** automatic optimal-range fan, finite quiver, reload timing, persistent
Phoenix Brands, then one automatically selected execution corridor.

### Core

- **Blazing Feather Fan / 烈羽扇:** automatically faces a priority target and releases
  a non-homing fan. Close hits are weak; hits in the narrow outer-edge distance band
  burn and pierce.
- **Molting Quiver / 蜕羽匣:** each volley consumes one finite charge. An empty quiver
  reloads after a visible delay; Evading while empty reloads immediately.
- **Failure:** bad range wastes the fan edge; an empty quiver creates downtime unless
  Evade is committed to reload.

### Milestones

- **R3:** Searing Quill / 灼心翎 = narrow heavy pierce, less coverage; Feather Storm /
  烈羽风暴 = broad short fan, less per-hit damage; Swift Molt / 疾蜕 = smaller magazine,
  faster attacks and reload.
- **R6:** Endless Plumage / 无尽羽藏 = larger magazine, longer reload; Combat Molt /
  战中蜕羽 = Evade reloads immediately but emits no offensive feathers; Last Feather /
  末羽焚空 = explosive final shot, slower empty reload.
- **R9:** Phoenix Brand / 凤印 marks optimal-range targets; Sun-Chasing Wings / 逐日翼
  widens the valid band through consecutive ideal hits but resets on failure; Ashen
  Pursuit / 灰烬追猎 transfers a dead target's Brand to the farthest valid enemy.

### Skill 2 — Phoenix Horizon / 凤翎贯日

After enough optimal-range hits in one magazine, the system selects the corridor
containing the most Brands. One phoenix crosses it, hits each marked enemy once,
executes low-health targets, clears Brands, and leaves the quiver empty.

**Must not become:** homing swords, a companion bird, generic fire volleys, or a
player-aimed shot.

---

## Drifting Frost Needle / 游霜针

**Identity:** one automatic needle, temporary weak points, a distinct-target zigzag,
then an immediate reverse traversal of that exact chain.

### Core

- **Frost Star Needle / 游霜点星:** targets the nearest exposed weak point. Body hits
  do not ricochet; weak-point hits jump to a different exposed target, never repeating
  one target in the chain.
- **Cold-Star Focus / 寒星定念:** distinct weak-point hits build Focus and improve
  damage retention/pierce along the current chain. A repeat or missing next point
  breaks it. Bosses expose multiple cyclic body points.
- **Failure:** poor spacing or unavailable distinct weak points ends the chain.

### Milestones

- **R3:** Army-Breaking Lone Needle / 破军孤针 = single-target damage/pierce and no
  ricochet; Linked-Pearl Thread / 连珠引线 = more jumps, weaker first hit; Swift Frost
  Point / 飞霜急点 = faster reacquisition, shorter lock range and harsher failure.
- **R6:** Still-Water Focus / 静水凝神 loses only part of Focus but has a weaker
  benefit; Moving-Star Acupoint / 移星换穴 moves a repeated boss weak point without
  gaining/resetting Focus but lowers ricochet damage; Cold-Soul Commitment / 寒魄孤注
  spends full Focus for one large hit and brief non-boss freeze.
- **R9:** Reverse-Star Trace / 逆星刻痕 briefly preserves a node after target death;
  Seven-Lodge Balance / 七宿连衡 adds virtual nodes but lowers per-node damage;
  Frost-Sealed Instant / 霜封刹那 briefly freezes full-Focus chain targets, while the
  return does not extend control.

### Skill 2 — Reverse Winter Thread / 逆序冬线

Completing a five-distinct-point chain immediately reverses the same needle through
the recorded zigzag. Return damage rises per node, then Focus and route clear. It
stores no persistent marks and creates no straight corridor.

**Must not become:** Blazing's Brand corridor, Yujian's weapon inventory, Ice Mirror
reflection, or a generic frost volley.

---

## Yujian Jue / 御剑诀

**Identity:** four persistent physical swords whose availability depends on their
real outbound and return journeys.

### Core

- **Sword Unsheathing / 御剑出鞘:** one ready sword automatically attacks per cycle,
  flies beyond its assigned target, then follows its route home. It cannot attack
  again until physically returned.
- **Sword-Rack Rotation / 剑匣轮转:** four swords automatically prioritize nearest,
  highest-health, active-threat, and best-pierce-lane targets. Position changes these
  assignments. Moving toward a returning sword catches it early.
- **Failure:** all swords airborne means no ordinary attack; moving away delays the
  rack.

### Milestones

- **R3:** Execution Order / 诛首剑令 focuses different swords on the toughest target
  but loses pack clearing; Sword Bloom / 剑华分影 creates disposable shades but
  weakens the physical sword; Reversing Sword Path / 回锋剑路 moves damage to the
  return, so catching early sacrifices it.
- **R6:** Still-Sword Edge / 静剑养锋 charges resting swords but slows return; Linked
  Sword Catch / 连环接剑 chains an early catch into the next launch but punishes a miss;
  Four Symbols Together / 四象齐出 launches a full rack together and waits for all.
- **R9:** Heavenly Sword Crown / 天剑为冠 keeps one support sword overhead and reduces
  rack size; Three-Enclosure Sword Domain / 三垣剑域 joins player and airborne swords
  with cutting lines that shrink on catch; Void-Step Recall / 虚步收锋 uses Evade to
  recall all paths but lengthens Evade cooldown.

### Skill 2 — Myriad Swords Return / 万剑归宗

Retained until at least three swords are airborne. Every sword stops and reverses its
own complete route; path intersections cut, then all swords return. No duplicates or
single shared corridor are created.

**Must not become:** generated homing ammunition, Frost's disposable ricochet,
Blazing's magazine, or Jinfeng's player-drawn trail.

---

## Jinfeng Gong / 金锋功

**Identity:** movement distance creates ground cuts; uninterrupted heading builds
Momentum; recent player travel becomes a persistent corridor.

### Core

- **Gale-Step Edge / 踏罡留锋:** each distance interval creates a temporary ground cut
  perpendicular to movement. It is not a projectile. Standing still yields only a
  slow weak close slash.
- **Unbroken Gale Momentum / 一往罡势:** sustained heading builds Momentum; a sharp
  reversal, obstruction, or long stop loses it. Momentum lengthens cuts and their
  persistence, not their count.
- **Failure:** stopping, colliding, or reversing destroys route-building tempo.

### Milestones

- **R3:** Heaven-Splitting Long Edge / 裂天纵锋 = long narrow cuts parallel to travel;
  Golden Gale Crosscut / 金风横断 = wider control cuts generated less often; Crescent
  Wake / 月牙余锋 = delayed stronger cuts behind the player, no immediate front hit.
- **R6:** Unbroken Continuance / 绵延不绝 preserves brief stops but lowers the cap;
  Borrowed-Turn Edge / 借势折锋 permits one full-Momentum sharp turn and spends half;
  Gale Rupture / 罡势决流 spends full Momentum on a cross cut and shortens normal cuts.
- **R9:** One Line to the Horizon / 天涯一线 rewards strict straight travel with
  screen-wide cuts; Returning Dragon Edge / 游龙回锋 permits gradual curves but lowers
  maximum length; Formation-Breaking Gale Step / 破阵罡步 cuts at Evade start/end and
  spends half Momentum.

### Skill 2 — Golden Gale Corridor / 金风长廊

At full Momentum, the system solidifies roughly two seconds of uninterrupted player
movement into a persistent cutting corridor and empties Momentum. It follows the
player's route, not an enemy-selected line.

**Must not become:** Scarlet's timed waves, Yujian's sword routes, Blazing's selected
line, or a radial moving aura.

---

## Green Vine Art / 青藤诀

**Identity:** automatic two-endpoint tether, player-controlled geometric Tension,
sweeping vine lines, successful snaps, and a tightening polygon net.

### Core

- **Two-Polarity Vine / 两仪牵藤:** chooses enemies on opposite player sides; with one
  enemy, the second endpoint is the cast location. The vine passes through the player
  as a V-shaped pulley. Moving sideways/away stretches it; crossing enemies take
  thorn damage. At maximum Tension it snaps straight between endpoints and binds.
- **Verdant Tension / 青索张力:** the meter is the current geometric stretch. Hits and
  time do not build it; moving back reduces it. Losing an endpoint breaks the tether
  without payoff.
- **Failure:** endpoint loss or relaxed geometry wastes the prepared tether.

### Milestones

- **R3:** Heart-Piercing Thorn Cable / 穿心棘索 uses enemy-plus-terrain for a stronger
  single-target snap; Twin-Serpent Bind / 双蛇缚敌 improves two-enemy sweep but weakens
  snap/single-target use; Flying Vine Graft / 飞蔓换枝 reattaches twice with half Tension
  retained, weakening each final snap.
- **R6:** Hundred-Forged Soft Vine / 百炼柔藤 makes Tension decay gradual but lowers cap
  and bind; Mountain-Rending Iron Cable / 崩山铁索 raises cap and snap but removes line
  contact damage; Step-Borrowed Pull / 借步催索 lets the first Evade crossing add major
  Tension and a cross-cut but removes final bind.
- **R9:** successful snaps leave temporary, inert Verdant Knots. Dragon-Binding Knot /
  困龙结 adds slow/fixation but lowers net damage; Dense Heaven-Net Knot / 天罗密结 keeps
  up to six longer-lived vertices with weaker edges; Broken-Vine Branching / 断藤生枝
  creates two non-propagating weak knots on endpoint death but shortens the net.

### Skill 2 — Heaven-Net Vine Realm / 天罗藤界

Retained until at least three Knots exist. It connects them into a closed polygon
whose visible edges contract, cutting crossed enemies and gathering those inside.
Full contraction breaks the net and consumes all Knots.

**Must not become:** Myriad-Root Lifebinding infection, Frozen River crossing curses, generic
seeking vines, or a stationary pulsing field.

---

## Nine-Sun Calamity Seal / 九阳劫印

**Identity:** an automatic future-position prediction, long fixed telegraph, Zenith
saved only outside casting, real miss risk, and nine omens condensed into one sun.

### Core

- **Falling Sun Seal / 坠阳劫印:** predicts the future position of the highest-threat
  or densest group, fixes a visible ground seal there, then lands one center-weighted
  impact after a long delay. It does not track after commitment or leave generic fire.
- **Zenith / 阳极:** rises only while no seal is charging/falling and is fully spent
  on impact, including a miss. It improves the one impact, not sun count.
- **Failure:** enemies leaving the fixed prediction wastes the entire stored Zenith.

### Milestones

- **R3:** Solitary Heavenly Judgment / 独日天刑 = smaller, slower, much stronger
  center; Twin Luminary Eclipse / 双曜蚀界 = two staggered smaller predictions with
  lower single-target damage; Swift Eclipse Calamity / 迅蚀劫光 = shorter telegraph
  and faster Zenith, lower maximum power.
- **R6:** Fixed-Noon Sun / 定午守阳 retains one-third Zenith but lowers its cap;
  Dark-Sun Calamity / 晦日养劫 lengthens the telegraph while its shrinking center
  gains power; Unsetting High Noon / 极昼不落 refuses to cast before full Zenith and
  gains the largest, least frequent impact.
- **R9:** Center-Forged Solar Soul / 正中炼阳 gives two omens for center hits and none
  for outer hits; Myriad-Beings Calamity / 众生为劫 rewards hitting many distinct
  enemies but is slow on bosses; Returning Afterglow / 残照归天 gives misses a dim
  omen that weakens the final capstone.

### Skill 2 — Nine Suns in One / 九阳归一

At nine visible omens, the system predicts the highest threat and fixes a huge
nine-layer seal. After a long warning, all omens collapse into one center-heavy
impact, then omens and Zenith clear. No tracking, execution, or lingering fire.

**Must not become:** Moonfall gravity, a generic meteor shower, ordinary fire DoT,
or a player-aimed ground spell.

---

## Scarlet Wave Manual / 赤浪真诀

**Identity:** automatic left/right paired crescents whose real spatial intersection
creates a third moving seam.

### Core

- **Scarlet Twin Tides / 赤月双潮:** casts a left crescent and preserves its trail,
  then a mirrored right crescent. Actual overlap creates a moving molten seam. Target
  movement or widely separated cast locations can make the pair fail.
- **Yin-Yang Confluence / 阴阳合流:** a three-state pair (waiting left, waiting right,
  successful Confluence), not a hit meter. Ordinary hits and repeated targets add
  nothing.
- **Failure:** the first trail expires or the two wave surfaces never intersect.

### Milestones

- **R3:** Scarlet Lance Tide / 赤练穿潮 = narrow fast pierce, tiny overlap allowance;
  River-Crossing Flame Moon / 横江炎月 = broad slow coverage, weaker direct damage;
  Rolling Twin Tides / 连潮催浪 = faster pairs with shorter, weaker waves.
- **R6:** After-Tide Awaits Moon / 余潮候月 preserves the first trail but weakens it;
  Misbanked Flying Arc / 错岸飞虹 can bridge separated groups with a weaker diagonal
  seam; Ruptured Burning Current / 焚流决口 replaces the persistent seam with one
  immediate line detonation and deletes both waves.
- **R9:** Long Sunset Trace / 落霞长痕 makes slower, longer-lived seams but weakens
  crescents; Horizon Opposing Tides / 天际对潮 starts larger waves farther away for a
  stronger but riskier arena divide; Reversing Scarlet Tide / 赤浪倒卷 sends weakened
  crescents back outward after Confluence and lowers seam damage.

### Skill 2 — Sunset Divide / 落日分潮

After three successful Confluences, two giant walls enter from opposite arena sides
toward the last successful seam. They push ordinary enemies and detonate the entire
meeting line, then clear the Confluence record. No pull, mark, execution, or fire field.

**Must not become:** Jinfeng player trails, Black Tide's world cycle, Blazing's fan,
or generic repeated fire waves.

---

## Moonfall Tide Ritual / 月坠潮仪

**Identity:** a gravity moon dragged indirectly by player movement, real enemy orbit,
stored angular motion, then a collapse/release/suspension payoff.

### Core

- **Suspended Moon Tide / 悬月引潮:** spawns at a dense group and follows the player
  with lag. Nearby enemies orbit rather than snap to center. Slow dragging gathers
  enemies; fast dragging loses them. It automatically resolves after a fixed duration.
- **Abyssal Syzygy / 深渊合朔:** equals actual angular motion completed by current
  orbiters. Hits and time alone add nothing; escaping enemies lose unfinished motion.
- **Failure:** dragging too quickly or leaving targets behind collapses an empty moon.

### Milestones

- **R3:** Sea-Suppressing Heavy Moon / 沉月镇海 = nearly fixed, small, strong pull and
  collapse; Twin-Moon Crossing / 双月交潮 = two weaker moons with transferable orbits;
  Swift-Moon Vessel / 疾月行舟 = fast wide collection, weak pull and collapse.
- **R6:** Still-Sea Syzygy / 静海留朔 retains half escaped motion but lowers the cap;
  Myriad Currents to Moon / 万流朝月 rewards many distinct orbiters and is weak on one
  boss; Mountain-Weight Eclipse / 重岳蚀心 rewards elite/boss mass and discounts mobs.
- **R9:** Returning-Abyss Moon / 归墟沉月 crushes all orbiters inward with slower orbit
  growth; Flying-Star Release / 飞星离潮 launches enemies tangentially for collision
  damage and has no center hit; Grand-Yin Suspension / 太阴悬界 freezes targets in
  orbit with lower damage and no displacement.

### Skill 2 — Moonless Eclipse / 无月蚀界

After three high-Syzygy resolutions, a giant moon suspends nearby enemies and records
their velocity. The moon follows the player slowly during the pause; resolution bends
all stored vectors toward its center, with faster enemies traveling farther/hitting
harder. It then clears the record.

**Must not become:** Nine-Sun prediction, Black Tide's arena-wide phase, a fixed
delayed blast, or an ordinary suction field.

---

## Heaven-Sundering Edict / 断天敕令

**Identity:** an automatic physical line drawn from player position, then a delayed
spell judgment on the exact same world-space line.

### Core

- **Sundering Stroke / 断天一笔:** the system selects the best line through threats,
  performs a partial-damage physical stroke, fixes it in world space, then repeats it
  as the main-damage spell judgment. Targets hit by both receive complete judgment.
- **Judgment Mandate / 裁决天命:** only same-target double hits write Mandate. Each cast
  records line quality from target count/strength and length; the best line is retained
  for Skill 2. Mandate does not buff ordinary attacks.
- **Failure:** enemies hit initially leave the fixed line before judgment.

### Milestones

- **R3:** One-Line Mountain Sundering / 一线断岳 = longer, narrower, stronger double
  hit and weak partial hits; Crossed Golden Edict / 十字金章 = two short weak lines and
  one intersection judgment; Swift Short Edict / 疾书短令 = shorter delay/line and
  lower Mandate.
- **R6:** Lenient Record / 宽赦留章 grants partial Mandate from one-stage hits but
  lowers the capstone ceiling; Aggravated Judgment / 重罪加刑 heavily weights elites
  and bosses and discounts mobs; Collective Sentence / 连坐成狱 doubles reward for
  three-plus double-hit targets and is weak on one target.
- **R9:** Lone Heaven Scar / 天痕独断 stores only the best, narrowest, strongest line;
  Twin Edicts / 双敕并书 stores the latest two weaker lines and adds an intersection;
  Heaven-Moving Amendment / 移天改诏 stores orientation/length and translates the
  line to the current dense group at lower damage without rotating it.

### Skill 2 — Supreme Sundering Decree / 无上断天令

At full Mandate, recorded lines extend to arena boundaries. A giant sword performs
the physical stroke, then the spell judgment repeats exactly. Complete double hits
receive the payoff; Mandate and records clear. No explosion, tracking, or domain.

**Must not become:** Nine-Sun ground prediction, Jinfeng travel lines, Yujian weapon
paths, or Blazing's marked execution corridor.

---

## Verdant Ring Scripture / 碧环经

**Identity:** automatic behavior-generated Root/Leaf/Thorn glyphs; the ordered last
three glyphs algorithmically compose the next invocation.

### Core

- **Three-Life Ring Glyphs / 三生符环:** each timed sample generates Root when nearly
  still, Leaf after enough movement, or Thorn after recent Evade (highest priority).
  The UI shows the queue, next-generation rule, and invocation preview.
- **Three-Ring Order / 三环道序:** glyph 1 chooses shape (Root circle, Leaf route,
  Thorn triangle around the highest threat); glyph 2 chooses motion (fixed, traveling,
  contracting); glyph 3 chooses payoff (bind/guard, repeat, high damage). The queue
  clears after automatic invocation, producing 27 predictable combinations.
- **Failure:** player behavior writes a valid but tactically inappropriate sequence.

### Milestones

- **R3:** Mountain-Root Scripture / 镇岳根书 makes Root easier/stronger and Leaf harder;
  Green-Wind Leaf Scripture / 青风叶书 makes Leaf easier/faster and Root harder;
  Calamity-Step Thorn Scripture / 劫步棘书 extends Thorn timing/damage but lengthens
  Evade cooldown.
- **R6:** Single-Line Specialization / 一脉专精 empowers three identical glyphs and
  weakens mixed sequences; Three-Talents Concord / 三才合契 empowers three different
  glyphs and weakens repeats; First-Last Generation / 首尾相生 weakly repeats A-B-A
  patterns and shrinks other arrangements.
- **R9:** Earth Scripture / 地书·万根 emphasizes Root control and weakens Thorn damage;
  Heaven Scripture / 天书·千叶 adds weaker Leaf repeats/projectile clearing and reduces
  Root guard; Thorn Scripture / 荆书·百劫 raises final Thorn damage while sacrificing
  Root control and Leaf repeats.

### Skill 2 — Sprout-Sun Invocation / 萌阳开界

Retained until the exact Root→Leaf→Thorn sequence occurs. It automatically creates a
three-phase world bloom at the player position: roots spread and temporarily fix the
region, leaves sweep along them, then all paths erupt as one thorn sun and disappear.
No infection, permanent field, manual selection, or following aura.

**Must not become:** Burning Ring proximity orbit, Green Vine tethers, Myriad-Root
infection, generic aura damage, or a manually selected rune menu.

---

## Burning Ring Scripture / 焚轮经

**Identity:** a segmented close orbit with readable gaps, Heat from maintaining
distinct nearby enemies, and a brief complete defensive corona.

### Core

- **Revolving Broken Corona / 旋焰缺轮:** persistent physical fire segments rotate
  around the moving player. Only segment contact damages; visible gaps do not. It
  launches no waves and leaves no burning ground.
- **Kindled Heat / 燃脉热力:** each distinct enemy maintained in the danger band
  contributes once; repeated hits add nothing. Leaving close danger cools rapidly.
- **Failure:** retreating for safety loses Heat and the complete-corona setup.

### Milestones

- **R3:** Counter-Rotating Twin Rings / 双轮逆转 creates weaker inner/outer rings with
  strong intersections; Furnace-Heart Lone Ring / 熔心孤轮 creates two slow heavy
  segments and huge gaps; Wandering Luminary Rings / 游曜错环 alternates inner/outer
  radii with transition downtime.
- **R6:** Banked Sun / 藏阳守轮 holds a half floor but lowers maximum output; Myriad
  Enemies as Furnace / 众敌为炉 weights distinct mobs and is weak on bosses; Lone True
  Sun / 独镇真阳 weights elite/boss contact and is weak on mobs.
- **R9:** Perfect-Sun Consumption / 完阳蚀火 closes gaps above high Heat while draining
  it; Sunspot Lure / 黑子纳敌 widens gaps, slows entrants, then rewards the catching
  segment; Reverse-Wheel Reflection / 逆轮回照 makes Evade reverse rotation at a Heat
  cost without spawning attacks.

### Skill 2 — Sunlit Guard Ring / 日耀护轮

At full Heat and nearby danger, all gaps close around the moving player for a short
no-damage state. The corona burns ordinary projectiles and pushes close mobs, then
returns to segments and consumes all Heat. It emits no full-screen wave.

**Must not become:** Verdant rune rings, generic aura DPS, Gengjin stored damage, or
Flame Demon's health sacrifice.

---

## Ice Mirror Guard / 冰镜护体

**Identity:** finite directional mirror facets that physically intercept attacks,
crack, and require dangerous close Evades to repair.

### Core

- **Sixfold Ice Mirrors / 六合冰镜:** six visible rotating facets with real gaps.
  Projectiles/contact attacks colliding with an intact facet are fully blocked; that
  facet cracks and reflects frost along the incoming direction. Cracked facets cannot
  block. All-cracked state slowly emergency-restores one facet.
- **Cold-Mirror Repair / 寒镜修复:** one close-danger Evade repairs one facet. Distant
  Evades, attacks, and damage dealt repair nothing.
- **Failure:** sequential attacks exhaust facets faster than the player risks repairs.

### Milestones

- **R3:** Three-Enclosure Heavy Mirrors / 三垣重镜 = three two-hit large mirrors with
  stronger reflection and larger gaps; Thousand-Facet Lotus / 千棱莲镜 = eight weak
  slow one-hit facets and long repair burden; Flowing-Light Mirrors / 流光转镜 = fast
  six-facet rotation reversed by Evade, weaker reflection.
- **R6:** Ice-Heart Repair / 冰心补镜 repairs two but lengthens Evade cooldown and
  weakens the next reflection; Shattered-Mirror Frost / 裂镜飞霜 destroys a facet into
  three offensive shards; Lingering Reflection / 残光续照 lets a cracked facet reduce
  one more same-direction hit before disappearing, with weak reflection.
- **R9:** Flawless Lotus / 无瑕莲华 requires all facets and gives the longest shell;
  Calamity-Answering Broken Lotus / 残莲应劫 can use three-plus facets with scaled weak
  duration; Killing Shattered Mirror / 破镜杀生 sharply shortens protection and returns
  high-damage shards along recorded attack directions.

### Skill 2 — Frozen Lotus Shell / 冰莲镜甲

When cooldown, enough intact facets, and imminent danger coincide, facets close into
an all-direction shell. It records incoming directions but not damage values, then
reflects along those directions and leaves every participating facet cracked.

**Must not become:** Gengjin proportional mitigation/storage, Frost ricochet, Verdant
orbit, or unconditional periodic invulnerability.

---

## Gengjin Huti / 庚金护体

**Identity:** proportional mitigation of actual close hits, exact prevented-damage
storage with a hard fracture cap, then conservation-based release.

### Core

- **Gengjin Brace / 庚金架:** close-source damage is partially reduced; the player
  takes the remainder and the exact prevented amount enters Guard. Distant attacks
  receive no default mitigation/storage.
- **Tempered Guard / 百炼护势:** a visible capacity with escalating fractures. Overflow
  before release breaks the armor, disables mitigation briefly, and loses force.
- **Failure:** greedily absorbing too much before Skill 2 is ready causes overload.

### Milestones

- **R3:** Rebounding Edge Armor / 回弹锋甲 immediately reflects part of each prevented
  hit and stores less; Hundred-Forged Heavy Armor / 百炼重甲 raises mitigation/cap but
  slows movement and fracture recovery; Flowing-Gold Vent / 流金卸甲 safely spills
  overflow with no damage and a lower cap.
- **R6:** Immovable Mountain / 不动如山 grants stationary capacity/mitigation that
  safely drains on movement; Flowing-Gold Turn / 流金转身 vents Guard into a brief
  post-Evade layer, weakening the final release; Armor Remembers Enemy / 刻甲识敌
  adapts to one repeated source, resets on source change, and stores less bonus force.
- **R9:** Eight-Wastes Rebound / 八荒震甲 divides the conserved total among nearby
  enemies; One Edge Breaks Mountain / 一锋破岳 sends the full total into one close
  priority target; Unbroken Golden City / 金城不坏 converts it to a temporary shield and
  deals no damage.

### Skill 2 — Blade-Shell Rebound / 刃甲反震

At high Guard with nearby danger, locks and releases the recorded prevented-damage
total according to the R9 law, clears Guard, and repairs fractures. Enemy count never
multiplies the conserved force.

**Must not become:** Ice Mirror's discrete negation, Burning Ring's Heat defense,
generic nearby-enemy Guard generation, or an unconserved radial burst.

### Implemented tuning contract

- Close range is `190`; base mitigation is `30%`. Guard stores the integer
  difference between incoming damage and damage actually taken. Environmental and
  distant damage do not mitigate or store.
- Base capacity is `100`; overflow fractures the brace, retains only `35%` of
  capacity, and disables mitigation for `2.8s`. Fractures recover every `4.2s`.
- R3: Rebounding Edge Armor reflects `35%` and stores `65%` (the two paths conserve
  the prevented total); Hundred-Forged Heavy
  Armor uses `42%` mitigation, `150` capacity, `-16%` movement, `4.2s` disabled and
  `6.5s` fracture recovery; Flowing-Gold Vent has `72` capacity and safely discards
  overflow.
- R6: Immovable Mountain adds `12%` mitigation and `50` capacity while stationary;
  Flowing-Gold Turn converts `40%` Guard into a `1s` layer; Armor Remembers Enemy
  gains `3%` mitigation per repeat up to `15%`, resets on source change, and stores
  `78%` of prevented force.
- Blade-Shell Rebound requires at least `60` Guard plus a close enemy. Eight-Wastes
  divides the exact integer total among up to eight targets (including remainder);
  One Edge assigns the full total once; Golden City creates an equal `5s` shield.
  Every release clears Guard and fractures. Allocation sums are unit-tested to equal
  the recorded total regardless of enemy count.
- Presentation uses a solid six-plate forged brace with capacity fill and fracture
  scars, not Ice Mirror's directional facets. The HUD shows `Guard/current cap`,
  fracture count, broken state, and Golden City shield.

---

## Ironwood Wave Form / 铁木浪形

**Identity:** stop to construct a directional physical rampart and build Stability;
move to uproot and drive that completed wall forward.

### Core

- **Ironwood Rampart / 铁木壁垒:** after standing still, automatically raises a wall
  toward the densest threat. It physically blocks ordinary enemies/projectiles, has
  durability, and leaves sides/back exposed. Movement ends growth and, with enough
  Stability, sends the wall along its original direction; low Stability merely withers.
- **Growth-Ring Stability / 年轮稳定:** grows only while stationary behind a live
  rampart and is fully spent by its drive. Hits and other Wood skills add nothing.
- **Failure:** moving too early, side/rear pressure, wall destruction, or bad placement.

### Milestones

- **R3:** Lone Great Rampart / 独木巨垒 = narrow durable strong drive and exposed sides;
  Linked Timber Palisade / 连城木栅 = broad fragile slow control; Living-Root Curved
  Wall / 活根曲墙 = slow-built frontal semicircle that splits outward instead of driving.
- **R6:** Deep-Age Root / 岁木深根 = slow root/unroot, high time-based Stability and
  durability; Enemy-Pressed Forest / 众敌压林 gains Stability only from distinct enemies
  pressing the wall; Living-Root Relocation / 活根移垒 permits slow repositioning while
  Stability decays and keeps a lower cap.
- **R9:** Unbroken Iron City / 不破铁城 emphasizes durable long walls and weak drives;
  Mountain-Collapse Timber Array / 崩山木阵 emphasizes fast explosive drives and weak
  stationary walls; Walking City / 行城移岳 lets walls follow briefly but lowers push.

### Skill 2 — Ironwood Citadel / 铁木城寨

After three high-Stability drives, raises four physical walls at the current location.
Corners remain passable, walls can be destroyed, and the player may leave. Remaining
walls later drive outward and splinter, then all construction records clear.

**Must not become:** Ancient Tree body transformation, Gengjin damage storage, Scarlet
waves, Ice Lotus's sealed shell, or a generic Wood projectile.

### Implemented tuning contract

- Base construction requires `650ms` stationary with a live threat. The wall is
  `150` wide with `120` durability and faces the densest automatic threat. Ordinary,
  elite, and boss pressure remove `9/20/36` durability per second while touching it.
- Stability grows `18/s` only while stationary behind a live wall, requires `35` to
  drive, and counts as a strong drive at `70`. Moving early destroys the wall;
  driving spends all Stability. Skill hits and other Wood methods add nothing.
- R3 changes physical construction: Lone Great Rampart is `42%` narrower and `70%`
  tougher; Linked Timber Palisade is `75%` wider and `38%` less durable; Living-Root
  Curved Wall takes `75%` longer and builds three frontal sections that split outward.
- R6 changes Stability law: Deep-Age Root has `145` cap, `55%` durability, and `70%`
  slower construction; Enemy-Pressed Forest gains `14` once per distinct pressing
  enemy and gains nothing from time; Living-Root Relocation caps at `65`, moves the
  wall at `45%` player displacement, and drains `16/s` while relocating.
- R9 changes wall payoff: Unbroken Iron City lengthens and toughens walls but reduces
  drive damage/push; Mountain-Collapse Timber Array weakens rooted durability while
  sharply accelerating drive force; Walking City steers driven walls briefly but
  reduces push and time-based Stability gain.
- After three strong drives, Ironwood Citadel raises four destructible walls for
  `3.2s`. Their corners remain open; the player is never sealed. Surviving walls drive
  outward for `1.15s`, then every wall and construction record clears.
- Presentation is one solid squared timber body with beams, durability fade, and
  whole-wall motion. No substitute wave projectile is scheduled.

---

## Crimson Furnace Sword Art / 赤炉剑法

**Identity:** forged needles embedded across living targets create a visible shared
furnace topology; ignition consumes the network and reforges its needles once.

### Core

- **Furnace Needles / 炉心飞针:** automatically prefers unembedded threats and targets
  that form valid connections, then adds an ignition needle after a network exists.
  Ordinary enemies are one node; elite/boss bodies support multiple visible nodes.
- **Crucible Pressure / 熔炉压势:** recalculated from simultaneous nodes, links,
  branches, and loops. Death/distance removes it immediately. It changes propagation
  topology, not global explosion radius, and explosions do not leave stored Pressure.
- **Ignition:** fire begins at the core and travels along visible links, consuming all
  participating embeds.
- **Failure:** nodes die, separate, over-concentrate, or lose the core before ignition.

### Milestones

- **R3:** Piercing Furnace Needle / 贯炉重针 concentrates strong body nodes and weakens
  wide links; Scattered Furnace Needles / 散炉布针 expands distribution/link range with
  weak nodes and higher ignition requirement; Volatile Furnace Core / 易爆炉芯 ignites
  small networks early with weak explosions/few branches.
- **R6:** Sealed Leftover Needle / 封炉余针 preserves dead nodes as weak temporary
  ground nodes; Star-Furnace Resonance / 星炉共鸣 connects two nearest neighbors for
  branches/loops but splits damage; Compressed Furnace / 压炉密铸 makes short compact
  links powerful and dispersed nodes invalid.
- **R9:** Furnace-Heart Reforge / 炉心回铸 sends weak fragments to unembedded survivors;
  Myriad Edges Return / 万锋归炉 concentrates fragments on the strongest target;
  Falling-Star Forge / 星火落炉 plants one-use ground nodes near old explosions.

### Skill 2 — Furnace Cascade / 炉火连铸

At enough live nodes and Pressure, ignites all connected networks from their highest-
pressure cores. Every consumed needle becomes one fragment following the R9 law. The
new fragments may produce exactly one follow-up chain, preventing infinite recursion.

**Must not become:** Sword Burial corpse inventory, Yujian returning ammo, Green Vine
tethers, ordinary explosive projectiles, or generic hit-built Pressure.

### Implemented tuning contract

- Ordinary bodies hold one node, elites three, and bosses five before branch modifiers.
  Base links reach `210px`; disconnected or dead bodies contribute no Pressure on the
  next simulation tick. A successfully lodged needle remains a node for `4.8s`, while
  a needle that never reaches a body keeps the ordinary short projectile lifetime.
- Pressure is recomputed from node, visible-link, branch, and loop weight. It never
  modifies global explosion radius and is never stored after topology loss.
- Base ignition requires four connected nodes and `42` Pressure. The visible core is
  selected by link degree, node count, then embedded power; propagation advances one
  node every `115ms`.
- Rank-3 branches change body capacity, reach, threshold, cadence, and force. Rank-6
  branches respectively preserve a `4.2s` death-site node, add a second nearest link,
  or reduce reach to `128px` for stronger propagation.
- Rank-9 fragments seek fresh bodies, focus the strongest survivor, or plant `5.2s`
  one-use ground nodes. Fragments can trigger exactly one follow-up within five
  seconds; that follow-up creates no further fragments.
- Furnace Cascade requires at least five connected nodes and `58` live Pressure. It
  records cooldown only when the state-earned ignition actually occurs. While Cascade
  is ready, the furnace reserves its ordinary four-node ignition until that five-node
  threshold is reached; during Cascade cooldown, ordinary ignition proceeds normally.
- Presentation uses solid body-runes, needle spokes, black-core red/gold links,
  highlighted cores, and core-to-edge flashes.

---

## Heavenfall Body Art / 天坠锻体术

**Identity:** periodically become a mobile falling-star body whose uninterrupted
movement builds Mass; the transformed body replaces the normal attack set and ends in
a movement-steered descent.

### Core

- **Falling-Star Body / 坠星身:** when ready, continuous movement with a nearby threat
  automatically begins a temporary transformation. Normal attacks disappear; the body
  itself damages ordinary enemies it passes through, with a per-enemy contact cooldown.
- **Meteor Mass / 陨星质量:** uninterrupted travel builds visible Mass. Stopping, sharp
  turns, and hard collisions shed it. Higher Mass increases body size, collision force,
  and the final descent, while reducing turning response. Hits never generate Mass.
- **Failure:** hesitant movement, repeated turns, or an early hard collision produces
  a weak descent. No cursor, pointer, or separate manual aiming is used.

### Milestones

- **R3:** Star-Piercing Iron Body / 贯星铁躯 is narrow and fast but turns poorly;
  Heavenfall Giant Body / 天陨巨身 is broad and powerful but slow to build Mass;
  Wandering-Star Light Body / 游星轻身 turns easily but has lower Mass and descent caps.
- **R6:** No-Return Advance / 一往无回 builds Mass rapidly in a straight line but a
  large turn clears it; Iron Body Opens the Road / 铁躯开道 preserves Mass through
  ordinary enemies but each passage briefly slows movement; Heaven-Turning Pivot /
  回天转斗 permits one sharp turn for half Mass but lowers the Mass cap and descent area.
- **R9:** Mountain-Piercing Star Lance / 穿岳星槊 converts the finish into a narrow,
  high-priority-target pierce with almost no crater; Heavenfall Crater / 天坑陨界 makes
  a huge crowd-control crater with long recovery; Reverse-Star Return / 逆星回天
  rebounds along the approach route for a weaker second pass and creates no crater.

### Skill 2 — Star-Breaking Descent / 碎星天坠

At the transformation time limit or full Mass, the body rises briefly and continues
to steer with ordinary movement at a limited turn rate. A projected landing indicator
follows the current travel heading, then the body crashes, spends all Mass, and ends
the form. Damage, area, and impact use the Mass present at commitment.

**Must not become:** Jinfeng's persistent movement cuts, Flame Demon's health
sacrifice, Ancient Tree's rooted form, Gengjin stored damage, or an ordinary melee
combo.

### Implemented tuning contract

- Moving near a threat for `420ms` enters Falling-Star Body. The ordinary attack planner
  emits nothing during this Gongfa; the moving body is the attack and each ordinary
  target has a `720ms` personal contact cooldown.
- Base Mass grows by `20%/s` while traveling and drains by `110%/s` while stopped.
  A sharp turn costs `36%`; an ordinary collision costs `5.5%`, while an elite or boss
  hard collision costs `32%`. Hits themselves never award Mass.
- Star-Piercing, Giant, and Light Body use different radii, movement speed, contact
  power, turning response, gain rates, and caps. Higher current Mass further reduces turning response. No-Return,
  Opens-the-Road, and Pivot respectively enforce the full-reset turn, the `360ms`
  passage slowdown, and the one-use half-Mass turn.
- Full Mass or the six-second form limit automatically enters a `760ms` rise and
  commitment phase when Star-Breaking Descent is ready. Ordinary movement may still
  turn the projected landing at a limited rate. Direct Skill 2 events cannot skip
  this warning, and no pointer or cursor input is read.
- Star Lance automatically bends toward the highest-rank threat and uses a narrow
  pierce. Crater uses the largest area, applies crowd control, and imposes `1.45s` of
  slow recovery. Reverse Return records the transformation's starting position and
  performs its weaker second pass along that actual approach route.
- Presentation keeps a persistent mass-scaled meteor body and compressed wake,
  switches to a live projected landing line/cross during commitment, then renders
  visibly separate lance, crater, and outbound/return silhouettes.

---

## Myriad Beast Grove / 万兽灵林

**Identity:** maintain a fixed small pack of different species whose independent jobs
must overlap on the same prey; composition, survival, and cooperative kills replace
generic summon count.

### Core

- **Three-Beast Pack / 三兽猎群:** at most one Rock Boar, Spirit Fox, and Verdant Deer
  live at once. The Boar breaks dense groups, the Fox flanks isolated or weakened prey,
  and the Deer stays near the player to root approaching threats. Each has independent
  health, position, and a seed-rebirth delay.
- **Wildwood Kinship / 荒林同契:** a beast that meaningfully assists places its species
  mark. A death with two distinct marks grants Kinship; three distinct marks grants a
  complete bond and heals the pack. Repeated marks from one species add nothing.
- **Indirect command:** continuous player movement spreads the hunt; standing recalls
  the formation. Evade makes every beast disengage and reform at the destination but
  causes no attack. There is no manual target selection.
- **Failure:** solo kills, split prey, or a downed species prevent complete cooperation.

### Milestones

- **R3:** Mountain Lord Enters the Grove / 山君入林 replaces the Fox with an elite/boss
  hunter that neglects weak mobs; Black Tortoise Guards the Grove / 玄龟镇林 replaces
  the Boar with interception and loses active crowd breaking; White Ape Calls the Pack /
  白猿号群 replaces the Deer and spreads its own mark but loses player defense/rooting.
- **R6:** Two Beasts Aid Each Other / 双兽相援 makes two marks reliable but lowers
  Kinship and ancestor caps; Three Spirits Hunt Together / 三灵会猎 doubles complete
  three-species rewards but collapses while one beast is down; Unending Rotating Hunt /
  轮猎不息 rewards consecutive different species combinations but repeating one grants
  nothing.
- **R9:** Ancestors Run the Wild / 群祖奔荒 sends each ancestor across the field for
  crowd clear but limits repeat boss hits; Ancestral Encirclement / 祖灵围猎 focuses all
  ancestors on the strongest threat with little area clear; Ancestors Return to the
  Grove / 祖林归巢 revives downed beasts and protects the pack with sharply lower damage.

### Skill 2 — Ancestral Menagerie / 万兽祖庭

At full Kinship with at least two living species, each currently living species calls
one giant ancestral echo to perform its signature action exactly once, then vanish.
Downed species contribute no ancestor. The activation consumes all Kinship and never
adds permanent summons.

**Must not become:** Vermilion Bird's single central companion, Mist Wraith's corpse
army, identical summon multiplication, manual pet targeting, or a generic hit meter.

### Implemented tuning contract

- Exactly three persistent beast records exist: Boar, Fox, and Deer. Each owns its
  position, target, health, downed state, and visible rebirth timer. Nearby danger can
  down each beast independently; the pack never grows by generic summon count.
- While the player moves, Boar selects density, Fox selects isolated or weakened prey,
  and Deer holds near the player and roots approaching threats. Standing still recalls
  all three without emitting an attack; Evade reforms them for `620ms` and also deals
  no damage.
- Species marks are bit-unique per target. One species cannot increase its own mark.
  A two-species death grants `18%` base Kinship and a living three-species death grants
  `34%` plus a `30%` pack heal. Solo kills, split marks, and downed partners do not
  counterfeit complete cooperation.
- Mountain Lord uses a large striped feline body and refuses ordinary targets. Black
  Tortoise uses a shell silhouette, abandons Boar crowd breaking, and intercepts `30%`
  of nearby incoming damage through its own health. White Ape uses a broad armed body
  and an expanding call, spreading its species mark over an area while surrendering
  Deer's root and `14%` close protection.
- Two-Beast Aid normalizes a lower `70%` Kinship budget and calls at most two ancestors.
  Three-Spirit Hunt grants `68%` only for a full living pack. Rotating Hunt stores the
  previous species combination and grants nothing when that combination repeats.
- Full Kinship calls exactly one ancestor action per living species. Wild Run uses a
  broad Boar charge, diagonal Fox hunt, and rooted Deer domain while allowing only one
  boss hit across the crowd-clear pass. Encirclement concentrates all distinct actions
  on the strongest threat. Return to the Grove deals sharply reduced damage, revives
  every beast, and grants `4.2s` of `45%` ancestral protection.
- Persistent beasts, replacement forms, species marks, action routes, and the three R9
  ancestor laws all use different geometry rather than recolored copies.

---

## Vermilion Bird Covenant / 朱雀灵契

**Identity:** protect and guide one persistent companion through dangerous outbound
dives and safe returns; its independent life and position matter more than projectile
count.

### Core

- **One Vermilion Bird / 独契朱雀:** exactly one bird owns independent health,
  position, target, and behavior. Player movement direction indirectly guides its dive;
  standing still recalls it to close guard. There is no manual target selection.
- **Phoenix Bond / 凤契:** dangerous flight followed by a safe return builds Bond.
  Hits alone add nothing. Being downed turns the bird into an ember for a visible
  recovery period and loses Bond.
- **Failure:** repeated long dives without a safe return down the companion and remove
  both its pressure and capstone readiness.

### Milestones

- **R3:** Crimson-Feather Head Hunt / 赤羽猎首 performs dangerous deep boss dives;
  Cinnabar-Plume Guardian / 丹翎护主 stays close with lower damage; Firewing Sweeping
  Formation / 火翼掠阵 crosses multiple targets but has weak single-target damage and a
  difficult return.
- **R6:** Nurtured Covenant / 温养灵契 safely heals on return with a low Bond ceiling;
  Blood Covenant of Fire-Bathing / 浴火血契 grants high Bond for low-health returns but
  punishes a down heavily; Paired-Wing Flight / 比翼同翔 rewards moving with the bird
  and makes opposing movement impede its return.
- **R9:** Urgent Ember Egg / 烬卵急生 hatches quickly into a weaker bird; True-Plume
  Nirvana / 真羽涅槃 creates a slow defensible egg and a strong persistent phoenix;
  Sacrifice to Guard the Master / 舍身护主 lets the bird save a low-health player, but
  leaves an exposed egg and a weak rebirth.

### Skill 2 — Vermilion Rebirth / 朱雀涅槃

At full Bond, the bird makes a terminal dive, burns away its life, and becomes a
physical damageable egg. Staying nearby speeds hatching. Egg destruction causes
ordinary ember downtime; success returns the same individual as one larger phoenix.
It never creates a second bird.

**Must not become:** Blazing Feather projectiles, Myriad Beast's mixed pack, a generic
pet multiplier, manual dive aiming, or multiple phoenix summons.

### Implemented tuning contract

- Exactly one persistent companion record owns health, maximum health, position,
  target, flight state, and egg/ember state. No branch or rebirth creates a second
  bird. The normal attack planner emits no substitute projectile attack.
- Moving automatically starts a dive when prey exists. The ordinary movement heading
  weights target choice; no pointer, cursor, or skill-button aim is read. Standing
  during an outbound dive requests a return rather than producing another attack.
- Outbound exposure drains health according to nearby danger. Return flight retains
  its real starting position, visibly travels toward the moving player for `560–1120ms`,
  and remains vulnerable along that route. Only a completed living reunion grants
  Bond; a return-path down immediately clears all Bond and enters ember recovery.
- Head Hunt refuses ordinary-only packs, dives deepest, deals the highest focused
  damage, and suffers `1.5×` outbound danger. Guardian caps its route at `105px`, uses
  a close shield silhouette, and suffers `0.45×` danger. Sweeping Flight visits up to
  three distinct targets with a broad ribbon route, weak single-target damage, and the
  longest, most dangerous return.
- Nurtured Covenant caps raw Bond at `65%`, heals `24%` maximum health on reunion, and
  reduces Vermilion Rebirth damage to `72%`. Blood Covenant grants `42%` Bond only for
  a living sub-half-health return. Paired Wing accumulates alignment across the whole
  return: aligned movement accelerates it and grants `32%`, while opposing movement
  slows it and grants only `10%`.
- Full normalized Bond can trigger Vermilion Rebirth only from Close Guard or the
  persistent Phoenix state. The terminal dive consumes Bond, life, and the current
  bird, leaving one damageable egg at the landing site. Staying within `115px` doubles
  hatch progress; nearby enemies damage the egg and destruction falls back to ember.
- Urgent Egg uses a `2.2s` hatch and weak `0.68`-health rebirth. True Plume uses a
  durable but exposed `5.6s` egg and returns the same individual as a `1.4`-health
  phoenix with a larger crowned silhouette. Sacrifice negates one low-health blow but
  forces a weak `0.55`-health egg and clears Bond.
- Guided, head-hunt, guardian, sweeping, return, terminal-rebirth, egg, ember, and true
  phoenix states use different routes or silhouettes, with visible health, Bond, hatch,
  and recovery progress.

---

## Black Tide Scripture / 玄潮经

**Identity:** a world-scale tide with one visible cardinal flow direction and three
automatic phases; player movement changes the calendar rather than aiming a spell.

### Core

- **Ebb, Still, Flood / 退潮、静水、涨潮:** Ebb deals little damage and broad currents
  draw toward the ebb boundary; Still removes displacement, slows, and forms medium
  water bands; Flood sends high-damage walls from the source boundary and pushes along
  the global current. It never pulls toward the player or a selected point.
- **Moon-Guided Tide Order / 月引潮序:** UI always shows phase, cardinal direction,
  progress, and next phase. Moving with the current accelerates time, moving against it
  slows time, and lateral movement or standing keeps normal time. Hits change nothing.
- **Failure:** careless movement advances a useful phase too early or prolongs the
  wrong one. The global direction reverses after every complete cycle.

### Milestones

- **R3:** Azure Sea Withdraws the Border / 沧海退界 empowers Ebb at the cost of the
  other phases; Still-Sea Mystic Mirror / 静海玄镜 empowers Still; Great Flood Presses
  the Realm / 洪涛压境 empowers Flood under the same tradeoff.
- **R6:** Ride the Tide / 乘潮行舟 strongly accelerates with-current travel but cannot
  hold a phase well; Hold the Moon Against the Tide / 逆潮留月 strongly delays against
  the current but slows the player; Heaven-Timed Tide / 天时定潮 fixes phase timing and
  makes capstone preparation slower.
- **R9:** All Beings Share the Flow / 众生同流 maximizes displacement with low damage;
  Mystic Water Anchors the Realm / 玄水镇界 emphasizes attack slow/control with weak
  movement and damage; Dry Sea Splits the Shore / 枯海裂岸 creates a short violent
  draining Flood with little movement control.

### Skill 2 — Deluge Mandate / 洪潮敕令

After three complete cycles, locks the current and floods the whole arena. All movable
ordinary enemies receive the same global velocity and preserve their relative
positions; bosses are slowed but not displaced. The tide drains at the destination
boundary, deposits survivors, and clears. It is never a point-centered pull.

**Must not become:** Scarlet alternating waves, Moonfall's point gravity, generic
periodic knockback, a hit resource, or a player-aimed current.

### Implemented tuning contract

- The world calendar owns exactly three `6.2s` phases and one cardinal direction.
  Ebb, Still, and Flood advance only from elapsed world time. Hits, kills, damage, and
  enemy count never alter phase progress. Completing Flood increments one cycle and
  reverses the cardinal direction by `180°`.
- Base movement with the flow advances the calendar at `1.45×`; opposing movement uses
  `0.68×`, while lateral movement and standing use `1×`. Ride the Tide changes those
  extremes to `2.2×/0.9×`; Hold the Moon uses `1.15×/0.34×` and slows the player;
  Heaven-Timed Tide fixes every input at `0.78×`.
- Ebb uses three broad world-spanning fronts, low `0.28×` damage, and `95` force toward
  the source boundary. Still uses medium stationary bands, `0.52×` damage, no force,
  and `0.5×` movement slow. Flood visibly enters from the source boundary, crosses the
  arena, deals `1.35×` damage, and pushes with `150` force along the current; each
  enemy's hit timing follows the front's actual travel distance from that boundary.
- A Rank-3 doctrine multiplies its chosen phase damage by `1.58`, control/force by
  `1.55`, adds one front, and widens it by `22%`. Both unchosen phases fall to `0.68`
  damage, `0.72` control, and `82%` width, so the doctrine changes silhouette and not
  just damage text.
- Shared Flow reduces ordinary phase damage to `62%` but maximizes displacement.
  Anchored Water reduces damage and force, strengthens Still to `0.24×` speed, and
  renders fixed anchor knots. Dry Sea shortens Flood to `3s`, raises its damage to
  `155%`, reduces displacement, and renders a compressed destination-boundary drain.
- After three complete cycles, Deluge Mandate locks phase progression and ordinary
  attacks for its duration. Shared Flow applies one identical `250` velocity to every
  movable ordinary enemy for `1.5s`; Anchored Water applies no displacement and holds
  for `1.8s`; Dry Sea uses a short `0.9s`, `75`-force damaging drain. Bosses are slowed
  rather than translated.
- A persistent bottom-right compass shows the exact cardinal arrow, current phase,
  phase progress, reversal, and Deluge lock. Ebb retreats, Still remains fixed, Flood
  crosses from its source boundary, and the three Deluge laws use arrow, anchor, and
  drain-boundary geometry respectively.

---

## Ancient Tree Body Art / 古木锻体术

**Identity:** stop long enough to become an immovable tree with a replacement
root-trunk-canopy attack set; time rooted creates visible Growth Rings that vanish on
uprooting.

### Core

- **Ancient Tree Body / 古木身:** standing near danger automatically roots the player.
  Movement input begins a readable uprooting delay. Normal attacks are replaced by an
  inner root zone that seizes and pushes, sequential middle branch sectors, and an
  outer canopy strike against the farthest threat.
- **Growth Rings / 生长年轮:** rooted time alone creates Rings. Each expands roots,
  adds an occupied branch sector, enlarges the canopy, and slightly lengthens uprooting.
  Hits, kills, and damage taken grant none; uprooting removes all Rings.
- **Failure:** a poor initial position leaves a weak young tree exposed, while a mature
  tree cannot escape immediately.

### Milestones

- **R3:** Great Rooted Banyan / 盘根古榕 has the widest control and low branch/canopy
  damage; Iron-Crowned Divine Tree / 铁冠神木 focuses its canopy on elites and bosses
  with a small root zone; Spirit-Fruit Fusang / 灵果扶桑 heals the player and injured
  beasts but grows slowly with reduced attack range.
- **R6:** One Ring in a Thousand Years / 千年一轮 has three slow, exceptionally strong
  Rings; Spring Flourishing / 春荣催生 quickly grows seven weak Rings with sharply
  increasing uproot time; Hollow-Trunk Tribulation / 空心渡劫 consumes one Ring to
  prevent a fatal hit, permanently losing that layer's reach and power.
- **R9:** Myriad Roots Cover the Realm / 万根覆界 assigns one hunting root to each
  ordinary enemy but is weak on bosses; One Tree Upholds Heaven / 一木擎天 concentrates
  main roots on the strongest enemy and ignores others; World-Sheltering Canopy /
  庇世华盖 intercepts most hostile projectiles and heals allies with little damage.

### Skill 2 — World-Tree Incarnation / 世界树化身

At maximum Rings after continuing to hold the rooted position, the player becomes the
immovable trunk for a clearly timed duration. Every effect grows outward from that
trunk according to the R9 law; it creates no separate walls or summons. The player
cannot uproot during the duration, then forcibly returns to mobile form with zero
Rings. There is no directional or manual aiming step.

**Must not become:** Ironwood's constructed directional walls, Myriad-Root's target
infection, Verdant glyph ordering, Gengjin stored damage, or a generic radial aura.

### Implemented tuning contract

- Danger within `520ms` of standing still begins rooted form. Movement from rooted
  form starts a visible uproot of `360ms + 170ms` per Ring; Spring Flourishing uses
  `310ms` per Ring. Attacks, kills, and incoming damage never grow Rings.
- The default tree grows five Rings at `1.25s` each. Thousand-Year grows three at
  `2.6s` each with `1.65×` layer power; Spring grows seven at `0.62s` each with
  `0.72×` power; Fusang uses `1.9s` Rings, reduced canopy reach, and heals on cycles.
- Every attack is three separately targeted and separately resolved layers: roots
  seize and push targets in the inner radius, exactly one branch sector advances in
  sequence, and the canopy selects the farthest reachable threat. Iron Crown instead
  prioritizes an elite or boss for its high-damage canopy.
- Hollow-Trunk checks actual incoming damage against current health. It consumes a
  Ring only for a fatal hit, prevents that hit, and locks the lost layer until the
  next completed uproot; banked growth time is also cleared.
- Holding maximum Rings for `0.9s` automatically begins World-Tree for `5.6s` and
  locks movement. Direct or generic Skill-2 events cannot bypass this hold. End of
  duration forcibly returns to mobile form with zero Rings.
- Myriad Roots assigns realm-wide roots to ordinary enemies and bosses but applies
  only `28%` root damage to bosses; One Tree sends all three layers to the strongest
  enemy; Sheltering Canopy uses `35%` damage, destroys hostile boss hazards inside
  its canopy, and heals the player plus injured companions.
- A persistent rooted-body marker displays every current Ring, the rotating active
  branch, uprooting state, and law-specific World-Tree silhouette. The HUD reports
  mobile, rooted, uprooting, or World-Tree state and exact Rings.

---

## Flame-Demon Body Art / 炎魔锻体术

**Identity:** extend an automatic point-blank combination by visibly burning current
health; missing-health bands replace a generic meter and can culminate in an
irreversible low-health demon state.

### Core

- **Furnace-Blood Combination / 炉血连式:** the opening blow is free; its three
  extensions burn 6%, 8%, then 10% of current health before striking. Leaving melee
  range or Evading cancels the remainder and stops further cost, but refunds nothing.
  Self-burn cannot directly kill the player.
- **Missing-health forms:** above 70% health attacks are short and narrow with no
  leech; 40–70% adds a side-cleaving claw; 20–40% adds the long Furnace-Heart finish
  and limited leech; below 20% reveals the full body and enables the capstone. Only a
  completed final direct strike can leech, capped to half that combination's self-cost.
- **Failure:** overcommitting lowers real survivability; disengaging protects the
  player but forfeits spent health and the finisher. Hits build no resource.

### Milestones

- **R3:** One-Horn Army Breaker / 独角破军 focuses the strongest close target with
  narrow weak clear; Six-Armed Yaksha / 六臂夜叉 splits attacks across several directions
  with weak single-target damage; Hungry-Ghost Soul Pursuit / 饿鬼逐魂 automatically
  advances between low-health targets but can carry the player into danger and cannot
  hold boss focus.
- **R6:** Meridian-Locking Heart Guard / 锁脉护心 halves cost and missing-health
  bonuses; Blood Debt Repaid at the End / 血债终偿 refunds up to 70% only when the full
  finish lands; Life-Flame Without Return / 命火无归 raises costs and missing-health
  power by 50% while disabling all Gongfa leech.
- **R9:** Undying Asura / 不灭修罗 locks recoverable health at 30% with strong refunds
  and lower damage; World-Burning Asura / 焚世修罗 locks it at 15%, removes leech, and
  maximizes area/damage; Life-Hunting Asura / 猎命修罗 locks it at 25% and can continue
  the combination through up to three ordinary kills, with weak boss damage and fresh
  health costs on each continuation.

### Skill 2 — Asura Heart / 阿修罗心

Below 20% health, completing the full combination while the capstone is ready triggers
a persistent irreversible warning and then transformation. The player can still avoid
commitment by disengaging before completion. Once active, recoverable health is locked
by the R9 law and the lowest-health full combination remains for the rest of the run,
until victory or death. Healing never restores human form.

**Must not become:** Heavenfall's temporary movement form, Burning Ring's proximity
Heat, Gengjin damage storage, Furnace Sword embeds, or a generic low-health damage buff.

### Implemented tuning contract

- Human form has four health-band presentations. Above `70%` it uses the free opener
  and first paid short strike; `40–70%` reveals a four-arm side-claw step; below `40%`
  reveals the full four-step Furnace-Heart finish; below `20%` reveals the demon body
  and makes Asura Heart eligible. Permanent Asura always retains the full four steps.
- Paid steps remove `6%`, `8%`, then `10%` of current health immediately before their
  strikes and cannot reduce health below one. Leaving the close-combat envelope,
  losing every eligible target, or Evading cancels all later steps and returns none
  of the health already burned.
- One Horn selects only the strongest close target and uses a narrow body line. Six
  Arms renders and resolves the multi-direction body form at `62%` per-target power.
  Hungry Ghost prefers the weakest ordinary target, advances only `18` world units per
  step, and uses `55%` boss damage rather than locking onto a boss.
- Meridian Lock halves all three costs and missing-health scaling. Blood Debt refunds
  `70%` of that combination's burn only after its final direct strike lands. Life-Flame
  multiplies costs and missing-health power by `1.5` and suppresses player healing from
  every Gongfa while leaving pills, treasures, and non-Gongfa recovery intact.
- Generic or direct Skill-2 events cannot transform the player. A landed full finish
  below `20%` sends an authored result back to the runtime; only a ready Rank-10 Asura
  Heart with an R9 law then records its cast and irreversibly enters Asura form.
- Undying locks recoverable health at `30%`, lowers damage to `84%`, and has the
  strongest finish refund. World-Burning locks at `15%`, removes leech, expands reach
  by `1.5×`, and raises damage by `1.55×`. Life-Hunting locks at `25%`, uses `35%` boss
  damage, and may begin up to three new fully paid combinations after ordinary kills.
- The HUD exposes the current health form or permanent Asura law. A persistent horned
  body marker follows the player after transformation, with shield-ring, six-arm, and
  hunting silhouettes kept distinct for the three laws.

---

## Mist Wraith Canon / 雾灵真典

**Identity:** recent deaths leave finite rank-bearing souls at their corpse positions;
the player must route through them before they fade, and every raised wraith is
eventually consumed rather than becoming a permanent pet.

### Core

- **Water Souls / 水魂:** ordinary, elite, and boss deaths leave souls for 6, 12, and
  20 seconds respectively. Passing near the death site collects one visible soul into
  the trailing procession. Rank changes size, lifetime, and force; attacks never create
  or duplicate souls.
- **Soul-Guiding Lantern / 引魂灯:** one weak non-summon mist attack helps finish a first
  wounded enemy but cannot generate inventory itself. With no corpses there is no
  wraith army or capstone.
- **Finite Wraiths / 有限雾灵:** each collected soul becomes one physical spectral
  crossing rather than firing homing bolts, then is consumed. Capacity, source rank,
  and expiry remain visible per slot.
- **Failure:** failing to route through corpse sites loses souls; spending the
  procession leaves a real no-corpse downtime.

### Milestones

- **R3:** Life-Seeking Fierce Wraith / 索命厉魂 rapidly spends the oldest of five souls
  on high single-target damage; Wandering-Mist Host / 游雾群鬼 curves each weak soul
  through up to three distinct ordinary enemies with one boss hit; Lantern-Returning
  Underworld Attendant / 归灯冥侍 stores a larger, longer-lived procession but deals
  almost no independent summon damage before the capstone.
- **R6:** Long-Banner Soul Call / 长幡招魂 collects a wide area at minus two slots and
  20% wraith damage; Tread the Corpse, Guide the Soul / 踏尸引魄 requires close pickup
  and rewards it with longer, stronger souls; Halt the Lantern, Keep the Vigil /
  停灯守夜 upgrades one nearby ordinary soul without duplication, but requires standing
  still and loses the attempt if interrupted.
- **R9:** Hundred Ghosts Cross the River / 百鬼横江 uses parallel crowd-clear lanes with
  repeat-hit limits; Myriad Souls Ask for Life / 万魂问命 converges once on the strongest
  enemy and never retargets; Nether River Funeral / 冥河送葬 leaves slowing mist roads
  with sharply reduced immediate damage.

### Skill 2 — Hundred-Ghost Night Crossing / 百鬼夜渡

With enough stored souls, automatically projects the orientation covering the most
valid enemies. Every stored soul appears at one arena boundary, crosses exactly once
according to the R9 law, and is permanently consumed. Elite and boss souls are wider
and stronger but still receive only one crossing. There is no manual aiming.

**Must not become:** Vermilion Bird's persistent companion, Myriad Beast's living pack,
Sword Burial's lasting corpse sites, generic timed summons, homing frost bolts, or a
hit-built summon meter.

### Implemented tuning contract

- Ordinary, elite, and boss deaths leave one soul worth `1/2/3` rank power for
  `6/12/20s`. Hits, damage, and existing wraiths never create or duplicate souls.
  Default pickup radius is `68`; Long Banner uses `140` but removes two of ten slots,
  while Tread the Corpse uses `40`, multiplies power by `1.35`, and stored lifetime by
  `1.5`.
- Picked souls remain finite and keep individual expiry rings in a visible procession
  behind the player. Ordinary, elite, and boss shapes differ. Uncollected markers stay
  at the exact corpse position, so both the route and time loss are visible.
- Without a stored soul, Soul-Guiding Lantern emits one weak `0.24×` non-wraith line.
  Life-Seeking spends the oldest soul against the strongest close threat at `1.35×`
  and caps storage at five; Wandering Mist spends one soul on up to three committed
  ordinary waypoints at `0.62×`; Lantern-Returning never spends a soul on Skill 1,
  adds three slots, extends storage by `1.45×`, and retains only the weak lantern.
- Long Banner reduces wraith damage to `80%`. Halt the Lantern requires `0.8s`
  stationary beside an ordinary corpse, resets its attempt on movement or leaving,
  and upgrades that one soul by one rank without duplication. Elite and boss souls
  cannot receive the vigil upgrade.
- Hundred-Ghost Night Crossing requires at least four stored souls. It selects among
  horizontal, vertical, and diagonal boundary orientations by the smallest enemy
  cross-field spread. Every soul receives one fixed boundary route, rank-scaled width
  and damage, then the entire stored procession is consumed.
- Hundred Ghosts uses parallel lanes and assigns each enemy to at most one lane;
  Myriad Souls fixes every route on the strongest target and never retargets after
  movement or death; Nether Funeral deals only `38%` immediate damage and leaves each
  broad road pulsing a `0.32×` movement slow for `3s`.
- The HUD exposes stored capacity, fresh corpse count, and the four-soul threshold.
  There are no orbiting familiars, seeking frost bolts, Covenant stacks, or generic
  timed summon effects in the active runtime; legacy Surge saves migrate safely.

---

## Frozen River Formation / 冰河伏阵

**Identity:** place harmless seals on automatically predicted pursuit routes; only a
debtor crossing a different seal awakens a one-shot river and transfers its finite Cold
Debt to another enemy.

### Core

- **River-Origin and Crossing Seals / 起河印与渡河印:** the method selects threats on
  distinct approaches, leaves an origin at the target's position, projects a crossing
  seal on its pursuit route, and assigns visible Cold Debt without dealing damage.
- **Crossing transfer:** when a debtor crosses another active seal, one river erupts
  between the previous and new seals, damages/slows enemies on that segment once, and
  transfers the Debt one-for-one to a different enemy caught in it. With no recipient,
  the Debt waits in the new seal; debtor death drops it at the last seal to expire.
- **Indirect control:** automatic seals follow predicted pursuit routes. Player
  movement reshapes those routes and brings debtors across other seals. Damage, hits,
  and ordinary freeze never create Debt.
- **Failure:** parallel pursuit, a missed second seal, an empty river segment, or debtor
  death interrupts the chain.

### Milestones

- **R3:** Lone-Bridge Final Crossing / 独桥绝渡 creates a long narrow powerful river
  that is hard to trigger; Three-Ford Branching Flow / 三津分流 creates three easy weak
  short approaches; Curving Nether River / 回湾冥河 forms defensive arcs near the player
  with weak range and boss damage.
- **R6:** Cold Debt Pursues the Strong / 寒债逐强 prefers the highest-health recipient
  but may stall on slow bosses; Cold Debt Pursues the Weak / 寒债逐弱 rapidly reaches
  weakened prey but often drops on early death; Cold Debt Migrates Afar / 寒债远徙
  prefers the farthest downstream recipient but risks leaving the useful battlefield.
- **R9:** All Guilty Share the Cold / 众罪同寒 shares hard ordinary freeze and boss slow
  with little damage; Collective Liability / 连坐同伤 divides one fixed damage pool
  across all debtors with weak freeze; Compensating Ferry / 代偿轮渡 transfers Debt on
  debtor death and extends the prison, with no group freeze and weak single-boss value.

### Skill 2 — Frozen River Prison / 冰河囚界

Once at least three Debt chains have completed a transfer and at least three debtors remain, connects all current debtors
into a closed river network. The network never pulses on its own; crossing another
debtor's line resolves the chosen shared fate. Boss freeze becomes slow. At the end,
all participating Debts and seals clear. Connections are automatic and never aimed.

**Must not become:** Black Tide's global calendar, Myriad-Root's death infection,
Sword Burial corpse inventory, Green Vine's player-stretched tether, or an ordinary
pulsing floor trap.

---

## Sword-Burial Formation / 葬剑伏阵

**Identity:** every enemy death buries exactly one finite one-use sword at that exact
corpse position; later trespassers or the capstone raise it once and leave the
gravefield empty.

### Core

- **Corpse-Bound Grave Swords / 尸位墓剑:** any enemy death creates one sword with a
  visible burial direction recorded from its final movement, or from player to corpse
  if stationary. Swords remain fixed, do not expire normally, and cap at twelve; excess
  deaths harmlessly crumble the oldest.
- **One emergence:** a later enemy entering the grave raises the sword through the
  trespasser and sends it once along the recorded direction, then destroys it. Hits,
  eruptions, and sword damage never create extra inventory.
- **Funeral Sword / 送葬剑:** one weak automatic strike helps finish the first wounded
  enemy but never pre-places a trap. With no deaths there is no gravefield.
- **Failure:** poor death positions, bad recorded directions, weak enemies wasting
  graves, and inventory overflow destroy finite value.

### Milestones

- **R3:** Lone-Grave Great Que / 孤冢巨阙 grows isolated graves into powerful great
  swords but rejects clustering; Collective-Burial Sword Mound / 合葬剑丘 triggers a
  nearby cluster together at lower per-sword damage and risks total waste; Field-Path
  Sword Forest / 阡陌剑林 connects burial order into a weak sequential chain that may
  run the wrong way.
- **R6:** Rise at Living Presence / 见生即起 has wide universal triggering and wastes
  easily on weak mobs; Recognize Calamity, Leave the Sheath / 识煞出鞘 triggers only on
  elite/boss threats with no ordinary clear; Seal the Grave by Treading the Stars /
  踏罡封冢 lets an Evade crossing reserve up to six stronger capstone-only swords while
  weakening unsealed regular eruptions.
- **R9:** Gravefield Cuts Across / 横绝剑陵 launches every original burial direction
  simultaneously for broad but inaccurate clear; Myriad Edges Ask the Leader /
  万锋问首 rotates once toward the current strongest enemy with no retarget or crowd
  clear; Old Roads Return the Soul / 旧路还魂 uses the recorded corpse-to-historical-
  player path, rewarding distributed kiting and punishing clustered deaths.

### Skill 2 — Ten-Thousand Sword Tomb / 万剑陵

At full grave inventory, every sword rises from its own corpse site and performs
exactly one R9 flight before being consumed, hit or miss. The full inventory then
clears. Routes are previewed but never manually changed; with no corpse swords the
capstone cannot activate.

**Must not become:** Mist Wraith's collected expiring souls, Yujian's reusable returning
weapon rack, Frozen River's crossings, Myriad-Root's propagation, Furnace Sword's
living-target network, or pre-placed repeating traps.

---

## Myriad-Root Lifebinding Canon / 万根寄命经

**Identity:** implant one-for-one parasitic root lineages inside living hosts; survival
time grows each infection, host death transfers exactly one seed, and the capstone
temporarily merges every infection into one organism.

### Core

- **Life-Hosted Root Seed / 寄命根种:** automatically infects a nearby eligible living
  enemy, up to five independent lineages. Seed, Sprout, and Mature stages advance only
  with host survival time and each stage transition resolves once. Hits never add age,
  seeds, or duplicates; nothing is planted on the floor.
- **One-for-one succession:** host death releases exactly one seed toward an uninfected
  living target. With no target, it briefly struggles at the corpse and withers. The
  default successor restarts at Seed, so rapid killing preserves lineage count but
  sacrifices maturity.
- **Indirect selection:** proximity determines the automatic eligible host. The player
  positions mature hosts within useful crowds rather than manually selecting them.
- **Failure:** premature host death repeatedly resets age; isolated deaths lose seeds;
  killing every host without successors can erase all lineages.

### Milestones

- **R3:** Heart-Piercing Killing Root / 穿心杀根 heavily damages its host at each stage
  and therefore often resets early; Body-Borrowing Branch Root / 借躯蔓枝 deals low host
  damage and strikes three nearby distinct enemies once at maturity; Bone-Locking
  Coiling Root / 锁骨盘根 sacrifices damage for escalating slow and mature ordinary
  immobilization, with boss slow only.
- **R6:** New Sprout Pursues the Crowd / 新芽逐众 jumps far toward the densest group but
  fully resets age; Old Root Seizes a Body / 老根夺舍 inherits half its age within a
  short range and dies with no nearby host; Strong Seed Chooses Its Host / 强种择主
  retains full age while waiting at the corpse for a high-health or elite host, but
  withers after four seconds.
- **R9:** Many Mouths Devour Life / 众口噬生 sends each root mass through a different
  ordinary target before merging, with slow weak boss convergence; One Heart Strangles
  Life / 独心绞命 converges through the strongest infected host and ignores crowd clear;
  Wither and Flourish Leave a Seed / 枯荣留种 sharply lowers the merge payoff but
  replants one mature seed in the highest-health survivor.

### Skill 2 — Myriad Roots Share One Ancestor / 万根同祖

With at least four infections and two mature roots, all parasites erupt from their
hosts once, clearing those independent infections. Root bodies crawl across the ground
and damage each enemy only on first contact, then merge into one Root Mother and
resolve the R9 law once. The organism then withers, except for the single preserved
seed option. Host distribution determines every route; there is no manual aiming.

**Must not become:** Green Vine's player-stretched tethers, Frozen River's crossing
Debt, Sword Burial's corpse inventory, Furnace Sword's living-node topology, Ancient
Tree's player transformation, or a generic ground trap/infection stack.
