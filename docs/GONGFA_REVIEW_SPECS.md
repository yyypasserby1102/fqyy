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
| Verdant Ring Scripture / 碧环经 | Faxiu | Approved | Pending redesign |
| Burning Ring Scripture / 焚轮经 | Hudao | Approved | Pending redesign |
| Ice Mirror Guard / 冰镜护体 | Hudao | Approved | Pending redesign |
| Gengjin Huti / 庚金护体 | Hudao | Approved | Pending redesign |
| Ironwood Wave Form / 铁木浪形 | Hudao | Approved | Pending redesign |
| Crimson Furnace Sword Art / 赤炉剑法 | Hudao | Approved | Pending redesign |

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

**Must not become:** Thousand Root infection, Frozen River crossing curses, generic
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

**Must not become:** Burning Ring proximity orbit, Green Vine tethers, Thousand Root
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
