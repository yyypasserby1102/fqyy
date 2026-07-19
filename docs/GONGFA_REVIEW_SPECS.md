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
