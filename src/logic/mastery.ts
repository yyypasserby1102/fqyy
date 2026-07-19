import { upgradeConfigs } from "../data/upgrades";
import type { GongfaId } from "../data/gongfa";
import { getGongfaPackage } from "../data/gongfaPackages";
import { surgeGongfaSpecs, type SurgeTransformation } from "../data/surgeGongfa";

export interface MasteryChoiceContext {
  gongfaId: GongfaId;
  rank: number;
  seed: string;
  learnedIds: string[];
}

export type MasteryChoiceKind = "refinement" | "transformation" | "skill2";
export const FULLY_MASTERED_RANK = 22;

export function isMasteryTransformationRank(rank: number): rank is 3 | 6 | 9 {
  return rank === 3 || rank === 6 || rank === 9;
}

export interface MasteryChoiceDefinition {
  id: string;
  name: string;
  lore: string;
  kind: MasteryChoiceKind;
  requiredGongfaIds?: GongfaId[];
  milestoneRank?: number;
  exclusivityGroup?: string;
  playstyle?: string;
  gain?: string;
  cost?: string;
  scope?: string;
  treasureInteraction?: string;
}

type TransformationImpact = Required<
  Pick<
    MasteryChoiceDefinition,
    "playstyle" | "gain" | "cost" | "scope" | "treasureInteraction"
  >
>;

function getTransformationImpact(definition: MasteryChoiceDefinition): TransformationImpact {
  if (
    definition.playstyle && definition.gain && definition.cost &&
    definition.scope && definition.treasureInteraction
  ) {
    return {
      playstyle: definition.playstyle,
      gain: definition.gain,
      cost: definition.cost,
      scope: definition.scope,
      treasureInteraction: definition.treasureInteraction
    };
  }
  const siblings = masteryTransformationConfigs.filter(
    (candidate) => candidate.exclusivityGroup === definition.exclusivityGroup
  );
  const branch = Math.max(0, siblings.findIndex((candidate) => candidate.id === definition.id));
  const gongfaId = definition.requiredGongfaIds?.[0];
  const packageInfo = gongfaId ? getGongfaPackage(gongfaId) : undefined;
  const skill1Name = packageInfo?.skill1.name ?? definition.name;
  const passiveName = packageInfo?.passive.name ?? definition.name;
  const resourceName = packageInfo?.passive.resource ?? definition.name;
  const alternativeNames = siblings
    .filter((candidate) => candidate.id !== definition.id)
    .map((candidate) => candidate.name)
    .join(" or ");
  const surgeSpec = surgeGongfaSpecs.find((spec) => spec.gongfaId === gongfaId);
  const mechanics = surgeSpec?.mechanics;
  const percentageLoss = (scale: number | undefined, fallback: number): number =>
    Math.round((1 - (scale ?? fallback)) * 100);
  const usesSharedSurgeRules = gongfaId === "blazing-feather-art" ||
    surgeGongfaSpecs.some((spec) => spec.gongfaId === gongfaId);
  if (!usesSharedSurgeRules) {
    const evadeScoped = /Evade/.test(definition.lore);
    return {
      playstyle: definition.name,
      gain: definition.lore,
      cost: `Locks out ${alternativeNames} at Rank ${definition.milestoneRank}.`,
      scope: definition.milestoneRank === 3
        ? evadeScoped
          ? `Evade and ${packageInfo?.skill1.name ?? "Skill 1"}`
          : `${packageInfo?.skill1.name ?? "Skill 1"} form and hit pattern`
        : definition.milestoneRank === 6
          ? `${packageInfo?.passive.name ?? "Gongfa passive"} (${packageInfo?.passive.resource ?? "resource"}) loop`
          : evadeScoped
            ? `Evade and ${packageInfo?.passive.resource ?? "passive resource"} payoff`
            : `${packageInfo?.skill1.name ?? "Skill 1"} and ${packageInfo?.passive.resource ?? "passive resource"} payoff`,
      treasureInteraction: "Spirit Treasure resonances apply independently after this transformation"
    };
  }
  if (definition.milestoneRank === 3) {
    return [
      {
        playstyle: definition.name,
        gain: `+${Math.round(((mechanics?.focusDamageScale ?? 1.35) - 1) * 100)}% ${skill1Name} damage · +${mechanics?.focusPierce ?? 2} pierce`,
        cost: `-1 attack · -${percentageLoss(mechanics?.focusSpreadScale, 0.65)}% spread`,
        scope: `${skill1Name} shape and direct hits`,
        treasureInteraction: "Perception resonance strengthens the focused lane"
      },
      {
        playstyle: definition.name,
        gain: gongfaId === "blazing-feather-art"
          ? "+3 Skill 1 attacks · +24° coverage"
          : `+${mechanics?.spreadCount ?? 2} ${skill1Name} attacks · +${mechanics?.spreadDegrees ?? 24}° coverage`,
        cost: `-${percentageLoss(mechanics?.spreadDamageScale, 0.8)}% per-hit damage`,
        scope: `${skill1Name} shape and direct hits`,
        treasureInteraction: "Harvest resonance rewards multi-target pickup pressure"
      },
      {
        playstyle: definition.name,
        gain: `-${percentageLoss(mechanics?.quickenCooldownScale, 0.72)}% ${skill1Name} cooldown · +${mechanics?.quickenSpeed ?? 60} projectile speed`,
        cost: `-${percentageLoss(mechanics?.quickenDamageScale, 0.82)}% per-hit damage`,
        scope: `${skill1Name} cooldown and direct hits`,
        treasureInteraction: "Windwalk resonance sustains the close-range rhythm"
      }
    ][branch];
  }
  if (definition.milestoneRank === 6) {
    return [
      {
        playstyle: definition.name,
        gain: `${resourceName} floor stays at ${mechanics?.holdFloor ?? 3}/6 once reached`,
        cost: `Locks out ${alternativeNames}`,
        scope: `${passiveName} (${resourceName})`,
        treasureInteraction: "Vitality resonance supports the steady pattern"
      },
      {
        playstyle: definition.name,
        gain: `${mechanics?.cascadeGain ?? 2} ${resourceName} per hit`,
        cost: `Locks out ${alternativeNames}`,
        scope: `${passiveName} (${resourceName})`,
        treasureInteraction: "Harvest resonance accelerates the pickup loop"
      },
      {
        playstyle: definition.name,
        gain: `+${mechanics?.burstCount ?? 3} attacks at full ${resourceName}`,
        cost: `Locks out ${alternativeNames}`,
        scope: `${resourceName} and the next ${skill1Name} cast`,
        treasureInteraction: "Perception resonance amplifies the release"
      }
    ][branch];
  }
  return [
    {
      playstyle: definition.name,
      gain: `+${mechanics?.crownPerStack ?? 1} spectral attack per ${resourceName} stack`,
      cost: `Locks out ${alternativeNames}`,
      scope: `Every ${skill1Name} cast`,
      treasureInteraction: "Perception resonance extends spectral pressure"
    },
    {
      playstyle: definition.name,
      gain: `Hits create ${Math.round((mechanics?.domainDamageScale ?? 0.35) * 100)}%-damage ${resourceName}-scaled fields`,
      cost: `Locks out ${alternativeNames}`,
      scope: `${skill1Name} impact zones`,
      treasureInteraction: "Bulwark resonance supports fighting inside the domain"
    },
    {
      playstyle: definition.name,
      gain: `Evade fires ${skill1Name} with ${mechanics?.updraftStackScale ?? 1}x ${resourceName} attack scaling`,
      cost: `Locks out ${alternativeNames}`,
      scope: `Evade and ${skill1Name}`,
      treasureInteraction: "Windwalk resonance directly strengthens this trigger"
    }
  ][branch];
}

function buildSurgeTransformations(): MasteryChoiceDefinition[] {
  const result: MasteryChoiceDefinition[] = [];
  for (const spec of surgeGongfaSpecs) {
    if (approvedRuntimeTransformationGongfaIds.has(spec.gongfaId)) continue;
    const entry = (item: SurgeTransformation, rank: number): MasteryChoiceDefinition => ({
      id: item.id,
      name: item.name,
      lore: item.lore,
      kind: "transformation",
      requiredGongfaIds: [spec.gongfaId],
      milestoneRank: rank,
      exclusivityGroup: `${spec.gongfaId}:rank-${rank}`
    });
    result.push(entry(spec.focus, 3), entry(spec.spread, 3), entry(spec.quicken, 3));
    result.push(entry(spec.hold, 6), entry(spec.cascade, 6), entry(spec.burst, 6));
    result.push(entry(spec.crown, 9), entry(spec.domain, 9), entry(spec.updraft, 9));
  }
  return result;
}

type ApprovedTransformationSeed = readonly [
  id: string,
  name: string,
  gain: string,
  cost: string,
  scope: string
];

const approvedRuntimeTransformationGongfaIds = new Set<GongfaId>([
  "blazing-feather-art",
  "drifting-frost-needle",
  "mist-wraith-canon",
  "sword-burial-formation",
  "flame-demon-body-art",
  "frozen-river-formation",
  "thousand-root-formation",
  "black-tide-scripture",
  "vermilion-bird-covenant",
  "myriad-beast-grove",
  "ancient-tree-body-art",
  "heavenfall-body-art",
  "heaven-sundering-edict",
  "nine-sun-calamity-seal",
  "scarlet-wave-manual",
  "moonfall-tide-ritual",
  "verdant-ring-scripture",
  "ice-mirror-guard",
  "ironwood-wave-form"
]);

const approvedRuntimeTransformationSeeds: Partial<Record<
  GongfaId,
  Record<3 | 6 | 9, readonly ApprovedTransformationSeed[]>
>> = {
  "blazing-feather-art": {
    3: [
      ["searing-quill", "Searing Quill", "The fan becomes a narrow, heavy piercing edge with a much stronger ideal hit.", "Most side coverage is lost.", "Fan arc, range, and ideal-edge damage"],
      ["feather-storm", "Feather Storm", "The fan becomes very broad and catches spread-out packs.", "Its reach and per-target damage are sharply reduced.", "Fan breadth, reach, and crowd coverage"],
      ["swift-molt", "Swift Molt", "Attack and reload cadence become much faster.", "The quiver shrinks to three weaker volleys.", "Magazine size, attack cadence, and reload"]
    ],
    6: [
      ["endless-plumage", "Endless Plumage", "The quiver holds eight volleys.", "An empty quiver takes much longer to reload.", "Magazine size and empty downtime"],
      ["combat-molt", "Combat Molt", "Evade instantly replaces even a partially spent quiver.", "The Evade creates no attack and discards remaining feathers.", "Evade and quiver replacement"],
      ["last-feather", "Last Feather", "The final feather explodes with a bright, heavy impact.", "Empty reload is substantially slower.", "Final-shot payoff and reload risk"]
    ],
    9: [
      ["phoenix-brand", "Phoenix Brand", "Every ideal-range victim keeps a long-lived visible Phoenix Brand.", "Close and over-range hits leave no mark.", "Ideal hits and capstone corridor inventory"],
      ["sun-chasing-wings", "Sun-Chasing Wings", "Consecutive ideal volleys widen the precision band.", "One failed volley clears the widening and ideal-hit preparation.", "Precision streak and optimal-distance band"],
      ["ashen-pursuit", "Ashen Pursuit", "A dead branded target transfers its Brand to the farthest valid enemy.", "The transferred mark may leave the useful firing lane.", "Brand death transfer and corridor geometry"]
    ]
  },
  "drifting-frost-needle": {
    3: [
      ["army-breaking-lone-needle", "Army-Breaking Lone Needle", "One heavy needle gains exceptional direct force.", "It never ricochets to another weak point.", "Initial point damage and chain length"],
      ["linked-pearl-thread", "Linked-Pearl Thread", "One needle may visit four distinct exposed points.", "The first and subsequent hits are weaker.", "Distinct-point jump count and damage retention"],
      ["swift-frost-point", "Swift Frost Point", "Needles reacquire their next point rapidly.", "Lock range is short and missing a point breaks Focus harshly.", "Reacquisition cadence, range, and failure"]
    ],
    6: [
      ["still-water-focus", "Still-Water Focus", "A failed route preserves its last two points.", "Damage retention along the route is weaker.", "Focus loss and chain damage"],
      ["moving-star-acupoint", "Moving-Star Acupoint", "A boss may expose another cyclic body point without resetting Focus.", "Boss ricochet damage is reduced.", "Repeated-boss weak points and Focus"],
      ["cold-soul-commitment", "Cold-Soul Commitment", "Full Focus is spent on one greatly enlarged final hit and a brief ordinary-enemy freeze.", "The route clears without a normal retained chain.", "Full-Focus spend and control"]
    ],
    9: [
      ["reverse-star-trace", "Reverse-Star Trace", "A dead target leaves its route node briefly suspended in place.", "The preserved node expires quickly and cannot be damaged.", "Death continuity and route lifetime"],
      ["seven-lodge-balance", "Seven-Lodge Balance", "Virtual lodge points can complete a sparse constellation.", "Every real and return-node hit deals less damage.", "Virtual route nodes and per-node damage"],
      ["frost-sealed-instant", "Frost-Sealed Instant", "Completing Focus freezes ordinary outbound targets briefly.", "The reverse traversal never extends that freeze.", "Outbound control versus return damage"]
    ]
  },
  "ironwood-wave-form": {
    3: [
      ["lone-great-rampart", "Lone Great Rampart", "A narrow wall gains 70% durability and a 65% stronger drive.", "The wall covers 42% less width, leaving both sides exposed.", "Rampart width, durability, and drive"],
      ["linked-timber-palisade", "Linked Timber Palisade", "A wall 75% wider controls a broad front.", "Durability falls 38% and its drive is slow and weak.", "Rampart width, durability, and control"],
      ["living-root-curved-wall", "Living-Root Curved Wall", "Build a frontal three-section semicircle that splits outward on movement.", "Construction takes 75% longer and it never performs a straight drive.", "Rampart geometry, construction, and split release"]
    ],
    6: [
      ["deep-age-root", "Deep-Age Root", "Stationary time grants a 45% higher Stability cap and 55% more durability.", "Rooting and uprooting are substantially slower.", "Time-based Stability, durability, and transition speed"],
      ["enemy-pressed-forest", "Enemy-Pressed Forest", "Each distinct enemy pressing the wall grants Stability.", "Stationary time alone grants no Stability.", "Distinct wall pressure and Stability source"],
      ["living-root-relocation", "Living-Root Relocation", "Move slowly while keeping and repositioning the live rampart.", "Stability decays while moving and its cap is only 65.", "Rampart relocation, movement, and Stability cap"]
    ],
    9: [
      ["unbroken-iron-city", "Unbroken Iron City", "Walls become 55% tougher, longer, and remain rooted longer.", "Every drive deals 45% less damage and pushes less.", "Wall endurance and drive tradeoff"],
      ["mountain-collapse-timber-array", "Mountain-Collapse Timber Array", "Drives accelerate and splinter with 75% more force.", "Stationary wall durability falls 42%.", "Drive speed, damage, and stationary weakness"],
      ["walking-city", "Walking City", "A driven wall follows the Cultivator's movement direction briefly.", "Push strength falls 35% and Stability gain is slower.", "Drive steering, duration, and push"]
    ]
  },
  "ice-mirror-guard": {
    3: [
      ["three-enclosure-heavy-mirrors", "Three-Enclosure Heavy Mirrors", "Three large mirrors each block two attacks and reflect with 55% more force.", "Only three directions are covered and rotation is slow, leaving much larger gaps.", "Facet count, durability, arc width, rotation, and reflection"],
      ["thousand-facet-lotus", "Thousand-Facet Lotus", "Eight narrow facets cover more distinct directions.", "Each facet blocks only once, reflects 45% less damage, rotates slowly, and takes longer to emergency-repair.", "Facet count, width, rotation, reflection, and repair burden"],
      ["flowing-light-mirrors", "Flowing-Light Mirrors", "Six facets rotate almost three times faster and Evade reverses their direction.", "Every reflection deals 32% less damage.", "Facet rotation, Evade reversal, and reflection"],
    ],
    6: [
      ["ice-heart-repair", "Ice-Heart Repair", "One close-danger Evade repairs two distinct damaged facets.", "Evade cooldown is 35% longer and the next reflection deals half damage.", "Close-danger Evade, repair count, cooldown, and next reflection"],
      ["shattered-mirror-frost", "Shattered-Mirror Frost", "A facet that cracks completely releases three offensive frost shards along the attack direction.", "Only the final durability loss releases shards; intact reflections gain nothing.", "Facet destruction and directional reflection shards"],
      ["lingering-reflection", "Lingering Reflection", "A newly cracked facet halves one more attack from the same direction.", "Its final reflection is weak and the facet then disappears completely.", "Cracked facet direction, partial block, and final reflection"],
    ],
    9: [
      ["flawless-lotus", "Flawless Lotus", "All intact facets form the longest 2.2-second Frozen Lotus Shell.", "The shell cannot form unless every facet is intact; all participating facets crack afterward.", "Frozen Lotus intact requirement and duration"],
      ["calamity-answering-broken-lotus", "Calamity-Answering Broken Lotus", "Frozen Lotus may form with any three intact facets and scales its duration with participants.", "Its recorded-direction reflections deal 45% less damage and the shell is shorter.", "Frozen Lotus threshold, duration, and reflection"],
      ["killing-shattered-mirror", "Killing Shattered Mirror", "The shell returns three high-damage shards along every recorded incoming direction.", "Protection lasts only 0.62 seconds and every participating facet cracks.", "Frozen Lotus duration and recorded-direction killing return"],
    ]
  },
  "mist-wraith-canon": {
    3: [
      ["life-seeking-fierce-wraith", "Life-Seeking Fierce Wraith", "Oldest soul immediately makes a powerful strongest-target crossing.", "Procession capacity is limited to five and souls are spent rapidly.", "Mist-wraith behavior and procession capacity"],
      ["wandering-mist-host", "Wandering-Mist Host", "Each soul curves through up to three distinct ordinary enemies.", "Each crossing deals less damage and may hit a boss only once.", "Mist-wraith crossing shape and target limits"],
      ["lantern-returning-underworld-attendant", "Lantern-Returning Underworld Attendant", "Souls live longer and the procession holds more.", "Stored souls make no independent attack before Skill 2.", "Soul storage and Skill 1 replacement"]
    ],
    6: [
      ["long-banner-soul-call", "Long-Banner Soul Call", "Automatically collect corpse souls in a much wider radius.", "Lose two procession slots and 20% wraith damage.", "Corpse-soul collection radius and inventory"],
      ["tread-corpse-guide-soul", "Tread the Corpse, Guide the Soul", "Close collection creates longer-lived, 35% stronger souls.", "Collection radius becomes very small.", "Close corpse routing and collected-soul strength"],
      ["halt-lantern-keep-vigil", "Halt the Lantern, Keep the Vigil", "Standing by a corpse upgrades one ordinary soul without duplication.", "Moving before the vigil completes loses the upgrade attempt while expiry continues.", "Stationary corpse vigil"]
    ],
    9: [
      ["hundred-ghosts-cross-river", "Hundred Ghosts Cross the River", "Skill 2 spreads parallel crossings across the arena.", "Repeat hits on one target are limited.", "Hundred-Ghost Night Crossing"],
      ["myriad-souls-ask-for-life", "Myriad Souls Ask for Life", "Every Skill 2 crossing converges on the strongest enemy.", "Almost no crowd clearing; paths never retarget after death.", "Hundred-Ghost Night Crossing"],
      ["nether-river-funeral", "Nether River Funeral", "Crossings leave strongly slowing funeral mist roads.", "Immediate Skill 2 damage is sharply reduced.", "Hundred-Ghost Night Crossing and control wake"]
    ]
  },
  "sword-burial-formation": {
    3: [
      ["lone-grave-great-que", "Lone-Grave Great Que", "Isolated graves grow into much stronger, longer great-sword lines.", "Nearby graves prevent the upgrade and clustered kills are weak.", "Grave structure and emergence strength"],
      ["collective-burial-sword-mound", "Collective-Burial Sword Mound", "Nearby graves form one mound and erupt together.", "Each sword is weaker and one weak trespasser may waste the mound.", "Grave clustering and shared trigger"],
      ["field-path-sword-forest", "Field-Path Sword Forest", "Burial order forms a visible sequential sword chain.", "Individual swords are weak and a chain may run the wrong way.", "Chronological grave chain"]
    ],
    6: [
      ["rise-at-living-presence", "Rise at Living Presence", "Any enemy triggers graves from a wider radius.", "Weak mobs can waste valuable swords.", "Grave trigger eligibility"],
      ["recognize-calamity-leave-sheath", "Recognize Calamity, Leave the Sheath", "Only elite and boss trespassers trigger stronger grave swords.", "Ordinary enemies never trigger regular grave damage.", "Elite and boss grave trigger"],
      ["seal-grave-treading-stars", "Seal the Grave by Treading the Stars", "Evading across up to six graves reserves stronger capstone swords.", "Unsealed regular eruptions deal less damage.", "Evade grave sealing and capstone inventory"]
    ],
    9: [
      ["gravefield-cuts-across", "Gravefield Cuts Across", "Every sword keeps its recorded burial direction for broad clear.", "Bad recorded directions may miss the entire fight.", "Ten-Thousand Sword Tomb flight law"],
      ["myriad-edges-ask-the-leader", "Myriad Edges Ask the Leader", "Each sword rotates once toward the strongest enemy.", "Almost no crowd clear and no retargeting.", "Ten-Thousand Sword Tomb flight law"],
      ["old-roads-return-the-soul", "Old Roads Return the Soul", "Each sword retraces toward the player's historical death-position location.", "Clustered kills or static play create poor coverage.", "Ten-Thousand Sword Tomb historical route"]
    ]
  },
  "flame-demon-body-art": {
    3: [
      ["one-horn-army-breaker", "One-Horn Army Breaker", "All blows focus the strongest close enemy with high armor breaking.", "Attack width is halved and side enemies are ignored.", "Furnace-Blood Combination target shape"],
      ["six-armed-yaksha", "Six-Armed Yaksha", "Every step strikes several directions for maximum crowd coverage.", "Total force is split and single-target damage is weak.", "Furnace-Blood Combination target shape"],
      ["hungry-ghost-soul-pursuit", "Hungry-Ghost Soul Pursuit", "Each step automatically advances toward a nearby weakened target.", "The automatic pursuit may carry the Cultivator into danger and cannot hold boss focus.", "Furnace-Blood Combination movement and targeting"]
    ],
    6: [
      ["meridian-locking-heart-guard", "Meridian-Locking Heart Guard", "Every health cost is halved.", "Missing-health form bonuses are also halved.", "Furnace-Blood health economy"],
      ["blood-debt-repaid-at-the-end", "Blood Debt Repaid at the End", "A landed full finisher refunds up to 70% of that combination's burn.", "Cancel, miss, or early target death returns nothing.", "Furnace-Blood completion refund"],
      ["life-flame-without-return", "Life-Flame Without Return", "Costs and missing-health power rise by 50%.", "All Gongfa life leech is disabled.", "Furnace-Blood risk and recovery"]
    ],
    9: [
      ["undying-asura", "Undying Asura", "Asura Heart gains the strongest refunds and sustain.", "Recoverable health locks at 30% and damage is lower.", "Asura Heart permanent form"],
      ["world-burning-asura", "World-Burning Asura", "Asura attacks gain maximum area and damage.", "Recoverable health locks at 15% and all leech is removed.", "Asura Heart permanent form"],
      ["life-hunting-asura", "Life-Hunting Asura", "A killing finisher may continue through up to three ordinary enemies.", "Recoverable health locks at 25%; boss damage is lower and every continuation burns health.", "Asura Heart permanent form and kill chain"]
    ]
  },
  "frozen-river-formation": {
    3: [
      ["lone-bridge-final-crossing", "Lone-Bridge Final Crossing", "Creates one long narrow river with greatly increased force.", "Its distant single crossing seal is difficult to route a debtor through.", "River length, width, and force"],
      ["three-ford-branching-flow", "Three-Ford Branching Flow", "Projects three nearby approaches that are easy to cross.", "Each short river carries sharply reduced damage.", "Crossing-seal count and river force"],
      ["curving-nether-river", "Curving Nether River", "Forms three broad defensive approaches around the Cultivator.", "Range and boss damage are weak.", "Defensive river geometry around the player"]
    ],
    6: [
      ["cold-debt-pursues-the-strong", "Cold Debt Pursues the Strong", "Transfers Debt to the highest-health enemy caught in the river.", "A slow boss may strand the chain away from another seal.", "Cold-Debt recipient priority"],
      ["cold-debt-pursues-the-weak", "Cold Debt Pursues the Weak", "Transfers rapidly to the weakest enemy caught in the river.", "Early recipient death frequently drops the Debt at a seal.", "Cold-Debt recipient priority"],
      ["cold-debt-migrates-afar", "Cold Debt Migrates Afar", "Transfers to the caught enemy farthest from the player.", "The chain can migrate outside the useful battlefield.", "Cold-Debt recipient priority"]
    ],
    9: [
      ["all-guilty-share-the-cold", "All Guilty Share the Cold", "The prison hard-freezes ordinary enemies and strongly slows bosses.", "Prison damage is very low.", "Frozen River Prison shared fate"],
      ["collective-liability", "Collective Liability", "Divides one large fixed damage pool across every debtor.", "Freeze is weak and adding debtors lowers damage per target.", "Frozen River Prison shared fate"],
      ["compensating-ferry", "Compensating Ferry", "Debtor death can keep transferring Debt and extending the prison.", "There is no group freeze and single-boss value is weak.", "Frozen River Prison transfer continuity"]
    ]
  },
  "thousand-root-formation": {
    3: [
      ["heart-piercing-killing-root", "Heart-Piercing Killing Root", "Every growth stage heavily damages its living host.", "Hosts often die early, resetting maturity and losing capstone readiness.", "Host-stage damage and lineage survival"],
      ["body-borrowing-branch-root", "Body-Borrowing Branch Root", "A mature root strikes three distinct nearby enemies once.", "Damage dealt directly to the host is low.", "Mature infection branching"],
      ["bone-locking-coiling-root", "Bone-Locking Coiling Root", "Growth stages apply escalating slow and mature roots immobilize ordinary hosts.", "Direct and splash damage are very low; bosses are slowed rather than immobilized.", "Host control at growth transitions"]
    ],
    6: [
      ["new-sprout-pursues-the-crowd", "New Sprout Pursues the Crowd", "A released seed jumps far toward the densest available group.", "Every succession fully resets its age.", "Death succession range and host density"],
      ["old-root-seizes-a-body", "Old Root Seizes a Body", "A nearby successor inherits half the dead root's age.", "The lineage dies when no host is available within short range.", "Short-range age inheritance"],
      ["strong-seed-chooses-its-host", "Strong Seed Chooses Its Host", "The seed retains full age while seeking a high-health or elite host.", "It waits at the corpse and withers after four seconds.", "Full-age selective succession"]
    ],
    9: [
      ["many-mouths-devour-life", "Many Mouths Devour Life", "Each erupting root routes through a different ordinary enemy before merging.", "Boss convergence is slow and weak.", "Root-Mother crowd route"],
      ["one-heart-strangles-life", "One Heart Strangles Life", "Every root converges through the strongest infected host for great focused damage.", "It provides almost no crowd clear.", "Root-Mother convergence target"],
      ["wither-and-flourish-leave-a-seed", "Wither and Flourish Leave a Seed", "After merging, one mature seed remains in the healthiest survivor.", "The Root-Mother payoff is sharply reduced.", "Post-capstone lineage preservation"]
    ]
  },
  "black-tide-scripture": {
    3: [
      ["azure-sea-withdraws-the-border", "Azure Sea Withdraws the Border", "Ebb currents gain much greater force and damage.", "Still and Flood output are reduced.", "Ebb phase global bands"],
      ["still-sea-mystic-mirror", "Still-Sea Mystic Mirror", "Still water bands gain stronger damage and control.", "Ebb and Flood output are reduced.", "Still phase global bands"],
      ["great-flood-presses-the-realm", "Great Flood Presses the Realm", "Flood walls gain much greater force and damage.", "Ebb and Still output are reduced.", "Flood phase global bands"]
    ],
    6: [
      ["ride-the-tide", "Ride the Tide", "Moving with the current advances the tide calendar extremely quickly.", "Against-current movement can no longer hold a useful phase effectively.", "Player movement and tide-calendar rate"],
      ["hold-the-moon-against-the-tide", "Hold the Moon Against the Tide", "Against-current movement nearly suspends the current phase.", "The Cultivator moves more slowly while this law is active.", "Player movement speed and tide-calendar delay"],
      ["heaven-timed-tide", "Heaven-Timed Tide", "Every phase follows a fixed predictable duration regardless of movement.", "Completing three cycles for Deluge Mandate takes longer.", "Fixed world-tide calendar"]
    ],
    9: [
      ["all-beings-share-the-flow", "All Beings Share the Flow", "All ordinary enemies receive maximum shared displacement.", "Tide damage is low.", "Global current and Deluge Mandate"],
      ["mystic-water-anchors-the-realm", "Mystic Water Anchors the Realm", "Still water and Deluge apply maximum slowing control.", "Movement and damage are weak.", "Global slow and anchored Deluge"],
      ["dry-sea-splits-the-shore", "Dry Sea Splits the Shore", "Flood becomes a short violent draining wave with maximum damage.", "It provides little movement control and ends quickly.", "Flood duration and Deluge burst"]
    ]
  },
  "vermilion-bird-covenant": {
    3: [
      ["crimson-feather-head-hunt", "Crimson-Feather Head Hunt", "The one bird makes deep high-damage dives against elite and boss threats.", "Long exposure makes it easy to down and weak against ordinary crowds.", "Companion target priority, dive depth, and risk"],
      ["cinnabar-plume-guardian", "Cinnabar-Plume Guardian", "The bird stays near the Cultivator and suffers much less dive danger.", "Flight range and damage are low.", "Close-guard dive envelope"],
      ["firewing-sweeping-formation", "Firewing Sweeping Formation", "One flight crosses up to three distinct enemies.", "Single-target damage is weak and the long route is difficult to return from safely.", "Multi-target outbound route"]
    ],
    6: [
      ["nurtured-covenant", "Nurtured Covenant", "Every safe return heals the bird substantially.", "Its maximum Bond is low, weakening Vermilion Rebirth.", "Return healing and Bond ceiling"],
      ["blood-covenant-of-fire-bathing", "Blood Covenant of Fire-Bathing", "A low-health safe return grants very high Bond.", "Being downed erases that risky accumulated Bond.", "Low-health return reward"],
      ["paired-wing-flight", "Paired-Wing Flight", "Moving with the returning bird speeds reunion and increases Bond.", "Moving against its return path delays safety and lowers the reward.", "Player movement relative to return flight"]
    ],
    9: [
      ["urgent-ember-egg", "Urgent Ember Egg", "Eggs hatch and ember recovery finish quickly.", "The returned bird has low maximum health and reduced terminal force.", "Nirvana egg speed and rebirth health"],
      ["true-plume-nirvana", "True-Plume Nirvana", "A successful durable egg returns the same bird as a larger persistent phoenix.", "The egg hatches very slowly and remains exposed longer.", "Durable egg and persistent phoenix form"],
      ["sacrifice-to-guard-the-master", "Sacrifice to Guard the Master", "The living bird negates one incoming blow while the Cultivator is at low health.", "It immediately becomes an exposed weak egg and loses all Bond.", "Low-health rescue and forced egg state"]
    ]
  },
  "myriad-beast-grove": {
    3: [
      ["mountain-lord-enters-the-grove", "Mountain Lord Enters the Grove", "The Fox becomes a Mountain Lord that hunts elite and boss prey with heavy strikes.", "It neglects weak ordinary mobs.", "Fox species job and target priority"],
      ["black-tortoise-guards-the-grove", "Black Tortoise Guards the Grove", "The Boar becomes a durable Black Tortoise interceptor.", "It loses active crowd breaking and deals low damage.", "Boar species job and defensive envelope"],
      ["white-ape-calls-the-pack", "White Ape Calls the Pack", "The Deer becomes a White Ape whose broad call spreads its species mark.", "The pack loses player defense and rooting.", "Deer species job and mark coordination"]
    ],
    6: [
      ["two-beasts-aid-each-other", "Two Beasts Aid Each Other", "Any two distinct marks grant reliable Kinship.", "Kinship and ancestor readiness are capped lower.", "Cooperation threshold and Kinship cap"],
      ["three-spirits-hunt-together", "Three Spirits Hunt Together", "A complete three-species kill grants double Kinship and pack healing.", "Two-mark kills grant nothing and the rule collapses while a beast is down.", "Complete-pack cooperation reward"],
      ["unending-rotating-hunt", "Unending Rotating Hunt", "Consecutive different species combinations sustain Kinship gains.", "Repeating the same combination grants nothing.", "Kill-to-kill species rotation"]
    ],
    9: [
      ["ancestors-run-the-wild", "Ancestors Run the Wild", "Each ancestor crosses the field for strong crowd clearing.", "Repeat boss hits are limited.", "Ancestral Menagerie field routes"],
      ["ancestral-encirclement", "Ancestral Encirclement", "All living-species ancestors focus the strongest threat.", "It provides little area clearing.", "Ancestral Menagerie focus target"],
      ["ancestors-return-to-the-grove", "Ancestors Return to the Grove", "The ancestors revive downed beasts and protect the pack.", "Ancestral damage is sharply reduced.", "Ancestral Menagerie restoration"]
    ]
  },
  "ancient-tree-body-art": {
    3: [
      ["great-rooted-banyan", "Great Rooted Banyan", "Roots gain maximum reach and control.", "Branch and canopy damage are low.", "Root-trunk-canopy proportions"],
      ["iron-crowned-divine-tree", "Iron-Crowned Divine Tree", "The canopy focuses elites and bosses for heavy damage.", "The root zone is small.", "Canopy priority and root reach"],
      ["spirit-fruit-fusang", "Spirit-Fruit Fusang", "Growth cycles heal the Cultivator and injured companions.", "Rings grow slowly and attack reach is reduced.", "Growth healing and maturation"]
    ],
    6: [
      ["one-ring-in-a-thousand-years", "One Ring in a Thousand Years", "Three slow Rings are exceptionally strong.", "Maturation takes much longer.", "Ring count, interval, and power"],
      ["spring-flourishing", "Spring Flourishing", "Seven weak Rings grow rapidly.", "Uprooting becomes sharply slower with age.", "Ring count, interval, and uprooting"],
      ["hollow-trunk-tribulation", "Hollow-Trunk Tribulation", "One Ring prevents a fatal blow.", "That layer's reach and power are permanently lost until uprooting.", "Fatal-hit prevention and Ring loss"]
    ],
    9: [
      ["myriad-roots-cover-the-realm", "Myriad Roots Cover the Realm", "A hunting root reaches every ordinary enemy.", "Boss damage is weak.", "World-tree ordinary-enemy routing"],
      ["one-tree-upholds-heaven", "One Tree Upholds Heaven", "All main roots concentrate on the strongest enemy.", "Other enemies are ignored.", "World-tree focus routing"],
      ["world-sheltering-canopy", "World-Sheltering Canopy", "The canopy protects and heals allies.", "World-tree damage is low.", "World-tree protection and healing"]
    ]
  },
  "heavenfall-body-art": {
    3: [
      ["star-piercing-iron-body", "Star-Piercing Iron Body", "The falling-star body is narrow, fast, and forceful.", "It turns very poorly.", "Body width, speed, and turning"],
      ["heavenfall-giant-body", "Heavenfall Giant Body", "The body becomes broad and powerful.", "Mass builds slowly.", "Body radius, power, and Mass rate"],
      ["wandering-star-light-body", "Wandering-Star Light Body", "The body turns easily.", "Mass and descent caps are low.", "Turning response and Mass ceiling"]
    ],
    6: [
      ["no-return-advance", "No-Return Advance", "Straight travel builds Mass rapidly.", "A large turn clears all Mass.", "Straight-line Mass gain and turn loss"],
      ["iron-body-opens-the-road", "Iron Body Opens the Road", "Ordinary enemy passages preserve Mass.", "Each passage briefly slows movement.", "Collision Mass retention and movement"],
      ["heaven-turning-pivot", "Heaven-Turning Pivot", "One sharp turn preserves half Mass.", "Mass cap and descent area are lower.", "One-turn allowance and cap" ]
    ],
    9: [
      ["mountain-piercing-star-lance", "Mountain-Piercing Star Lance", "The finish pierces the strongest threat in a narrow line.", "It creates almost no crater.", "Descent shape and priority"],
      ["heavenfall-crater", "Heavenfall Crater", "The finish makes a huge controlling crater.", "Recovery is long.", "Descent radius and recovery"],
      ["reverse-star-return", "Reverse-Star Return", "The body rebounds along its approach route for a second pass.", "Both passes are weaker and create no crater.", "Descent return route"]
    ]
  },
  "heaven-sundering-edict": {
    3: [
      ["one-line-mountain-sundering", "One-Line Mountain Sundering", "One line becomes longer, narrower, and stronger on complete judgment.", "Partial hits are weak.", "Stroke length, width, and double-hit power"],
      ["crossed-golden-edict", "Crossed Golden Edict", "Two short lines add an intersection judgment.", "Each line is weak.", "Two-line geometry and intersection"],
      ["swift-short-edict", "Swift Short Edict", "The fixed judgment repeats quickly.", "The line is short and grants less Mandate.", "Delay, line length, and record value"]
    ],
    6: [
      ["lenient-record", "Lenient Record", "One-stage hits grant partial Mandate.", "The capstone ceiling is lower.", "Partial-hit Mandate and cap"],
      ["aggravated-judgment", "Aggravated Judgment", "Elite and boss double hits grant heavy Mandate.", "Ordinary mobs contribute little.", "Target-rank Mandate weighting"],
      ["collective-sentence", "Collective Sentence", "Three-plus complete judgments grant double Mandate.", "Single-target judgment is weak.", "Multi-target double-hit reward"]
    ],
    9: [
      ["lone-heaven-scar", "Lone Heaven Scar", "Only the best narrow record is retained at full force.", "No second line is retained.", "Record count and width"],
      ["twin-edicts", "Twin Edicts", "The latest two weaker records repeat together.", "Each line deals lower damage.", "Two-record capstone geometry"],
      ["heaven-moving-amendment", "Heaven-Moving Amendment", "The recorded orientation translates to the current dense group.", "Damage is lower and orientation cannot rotate.", "Record translation without rotation"]
    ]
  },
  "nine-sun-calamity-seal": {
    3: [
      ["solitary-heavenly-judgment", "Solitary Heavenly Judgment", "A smaller slower center lands with much greater force.", "Outer hits are weak.", "Seal radius, delay, and center power"],
      ["twin-luminary-eclipse", "Twin Luminary Eclipse", "Two staggered predictions cover separate threats.", "Each impact has low single-target damage.", "Prediction count and stagger"],
      ["swift-eclipse-calamity", "Swift Eclipse Calamity", "Telegraphs and Zenith growth are faster.", "Maximum impact power is lower.", "Telegraph duration and Zenith cap"]
    ],
    6: [
      ["fixed-noon-sun", "Fixed-Noon Sun", "One-third Zenith remains after commitment.", "The Zenith cap is lower.", "Zenith retention and cap"],
      ["dark-sun-calamity", "Dark-Sun Calamity", "A long warning condenses great center power.", "Enemies have much longer to escape.", "Telegraph and shrinking center"],
      ["unsetting-high-noon", "Unsetting High Noon", "Only full Zenith casts and creates the largest impact.", "Casts are least frequent.", "Cast threshold and maximum payoff"]
    ],
    9: [
      ["center-forged-solar-soul", "Center-Forged Solar Soul", "Center hits grant two omens.", "Outer hits grant none.", "Omen source by impact band"],
      ["myriad-beings-calamity", "Myriad-Beings Calamity", "Many distinct victims grant several omens.", "Boss-only preparation is slow.", "Omen source by distinct targets"],
      ["returning-afterglow", "Returning Afterglow", "A miss still grants one dim omen.", "Dim omens weaken Nine Suns in One.", "Miss recovery and capstone power"]
    ]
  },
  "scarlet-wave-manual": {
    3: [
      ["scarlet-lance-tide", "Scarlet Lance Tide", "Crescents become narrow, fast, and piercing.", "Overlap allowance is tiny.", "Wave width, speed, and overlap"],
      ["river-crossing-flame-moon", "River-Crossing Flame Moon", "Broad slow crescents cover more space.", "Direct damage is weak.", "Wave breadth and damage"],
      ["rolling-twin-tides", "Rolling Twin Tides", "Pairs arrive quickly.", "Waves are shorter-lived and weaker.", "Pair cadence and trail lifetime"]
    ],
    6: [
      ["after-tide-awaits-moon", "After-Tide Awaits Moon", "The first trail waits much longer for its pair.", "The preserved tide is weaker.", "First-trail lifetime and power"],
      ["misbanked-flying-arc", "Misbanked Flying Arc", "Separated waves can bridge with a diagonal seam.", "The bridge seam is narrow and weak.", "Separated-pair recovery"],
      ["ruptured-burning-current", "Ruptured Burning Current", "Confluence detonates its whole line immediately.", "No persistent moving seam remains.", "Seam duration and burst"]
    ],
    9: [
      ["long-sunset-trace", "Long Sunset Trace", "The molten seam is long and persistent.", "Crescent damage is reduced.", "Seam length, lifetime, and wave power"],
      ["horizon-opposing-tides", "Horizon Opposing Tides", "Large distant waves create a powerful arena divide.", "Their meeting is riskier and slower.", "Wave origins and divide scale"],
      ["reverse-scarlet-tide", "Reversing Scarlet Tide", "Weakened crescents return outward after Confluence.", "Seam damage is lower.", "Post-Confluence reverse pass"]
    ]
  },
  "moonfall-tide-ritual": {
    3: [
      ["sea-suppressing-heavy-moon", "Sea-Suppressing Heavy Moon", "A nearly fixed small moon pulls and collapses with great force.", "It gathers only a tight area and barely follows the player.", "Moon lag, orbit radius, and collapse force"],
      ["twin-moon-crossing", "Twin-Moon Crossing", "Two weaker moons transfer orbiters between their overlapping paths.", "Each moon pulls and resolves for less damage.", "Moon count and transferable orbits"],
      ["swift-moon-vessel", "Swift-Moon Vessel", "A fast broad moon gathers enemies while traveling.", "Its pull and final collapse are weak.", "Moon follow speed, collection width, and force"]
    ],
    6: [
      ["still-sea-syzygy", "Still-Sea Syzygy", "Escaping orbiters retain half their completed angular motion.", "Maximum Syzygy is lower.", "Escaped-motion retention and Syzygy cap"],
      ["myriad-currents-to-moon", "Myriad Currents to Moon", "Many distinct orbiters build Syzygy rapidly.", "A lone boss builds it poorly.", "Distinct-orbiter weighting"],
      ["mountain-weight-eclipse", "Mountain-Weight Eclipse", "Elite and boss mass builds heavy Syzygy.", "Ordinary enemies contribute little.", "Target-rank angular weighting"]
    ],
    9: [
      ["returning-abyss-moon", "Returning-Abyss Moon", "Resolution crushes every orbiter inward for a powerful center hit.", "Angular progress grows more slowly.", "Inward resolution and orbit gain"],
      ["flying-star-release", "Flying-Star Release", "Resolution launches orbiters tangentially for collision damage.", "There is no center impact.", "Tangential release and collision payoff"],
      ["grand-yin-suspension", "Grand-Yin Suspension", "Resolution freezes enemies visibly along their orbit.", "Damage is low and there is no displacement.", "Orbital suspension and displacement"]
    ]
  },
  "verdant-ring-scripture": {
    3: [
      ["mountain-root-scripture", "Mountain-Root Scripture", "Root is easier to write and strengthens fixed control.", "Leaf requires more travel to write.", "Root and Leaf behavior thresholds"],
      ["green-wind-leaf-scripture", "Green-Wind Leaf Scripture", "Leaf writes sooner and its traveling motion is faster.", "Root requires deeper stillness.", "Leaf and Root behavior thresholds"],
      ["calamity-step-thorn-scripture", "Calamity-Step Thorn Scripture", "The post-Evade Thorn window and Thorn damage are greater.", "Evade cooldown is longer.", "Thorn timing, damage, and Evade cadence"]
    ],
    6: [
      ["single-line-specialization", "Single-Line Specialization", "Three identical glyphs invoke with great power.", "Mixed sequences are weaker.", "Identical versus mixed sequences"],
      ["three-talents-concord", "Three-Talents Concord", "Three different glyphs invoke with great power.", "Repeated glyphs are weaker.", "Distinct versus repeated sequences"],
      ["first-last-generation", "First-Last Generation", "A-B-A patterns repeat weakly once.", "Every other arrangement is smaller.", "First-last symmetry and repeat count"]
    ],
    9: [
      ["earth-scripture-myriad-roots", "Earth Scripture: Myriad Roots", "Root control and guard are greatly strengthened.", "Thorn damage is reduced.", "Root payoff and Thorn damage"],
      ["heaven-scripture-thousand-leaves", "Heaven Scripture: Thousand Leaves", "Leaf motions repeat weakly and clear hostile projectiles.", "Root guard is reduced.", "Leaf repeats, projectile clearing, and Root guard"],
      ["thorn-scripture-hundred-calamities", "Thorn Scripture: Hundred Calamities", "A final Thorn payoff deals much greater damage.", "Root control and Leaf repeats are sacrificed.", "Final Thorn payoff versus utility"]
    ]
  }
};

function buildApprovedRuntimeTransformations(): MasteryChoiceDefinition[] {
  return Object.entries(approvedRuntimeTransformationSeeds).flatMap(([gongfaId, ranks]) =>
    ([3, 6, 9] as const).flatMap((rank) =>
      (ranks?.[rank] ?? []).map(([id, name, gain, cost, scope]) => ({
        id,
        name,
        lore: `${gain} ${cost}`,
        kind: "transformation" as const,
        requiredGongfaIds: [gongfaId as GongfaId],
        milestoneRank: rank,
        exclusivityGroup: `${gongfaId}:rank-${rank}`,
        playstyle: name,
        gain,
        cost,
        scope,
        treasureInteraction: "Spirit Treasure resonances apply after this authored rule"
      }))
    )
  );
}

export const masteryTransformationConfigs: MasteryChoiceDefinition[] = [
  ...buildSurgeTransformations(),
  ...buildApprovedRuntimeTransformations(),
  {
    id: "execution-seal",
    name: "Execution Seal",
    lore: "Repeated Yujian Skill 1 hits escalate against a marked priority target.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 3,
    exclusivityGroup: "yujian-jue:rank-3"
  },
  {
    id: "sword-bloom",
    name: "Sword Bloom",
    lore: "The first Yujian Skill 1 hit splits into weaker swords seeking different enemies.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 3,
    exclusivityGroup: "yujian-jue:rank-3"
  },
  {
    id: "reversing-sword-path",
    name: "Reversing Sword Path",
    lore: "Yujian Skill 1 swords return back through enemies toward the Cultivator.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 3,
    exclusivityGroup: "yujian-jue:rank-3"
  },
  {
    id: "still-sword-heart",
    name: "Still Sword Heart",
    lore: "Incoming damage no longer scatters accumulated Sword Intent.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 6,
    exclusivityGroup: "yujian-jue:rank-6"
  },
  {
    id: "myriad-blade-resonance",
    name: "Myriad Blade Resonance",
    lore: "Projectile-tagged hits feed Sword Intent far faster.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 6,
    exclusivityGroup: "yujian-jue:rank-6"
  },
  {
    id: "intent-unleashed",
    name: "Intent Unleashed",
    lore: "At full Intent, the next sword volley erupts with extra blades.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 6,
    exclusivityGroup: "yujian-jue:rank-6"
  },
  {
    id: "sword-crown",
    name: "Sword Crown",
    lore: "Current Intent crowns the volley with weaker spectral swords.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 9,
    exclusivityGroup: "yujian-jue:rank-9"
  },
  {
    id: "intent-domain",
    name: "Intent Domain",
    lore: "Hits leave short-lived blade fields that scale with Intent.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 9,
    exclusivityGroup: "yujian-jue:rank-9"
  },
  {
    id: "void-step-formation",
    name: "Void-Step Formation",
    lore: "Each Evade looses an extra sword volley from its path.",
    kind: "transformation",
    requiredGongfaIds: ["yujian-jue"],
    milestoneRank: 9,
    exclusivityGroup: "yujian-jue:rank-9"
  },
  {
    id: "heaven-splitting-line",
    name: "Heaven-Splitting Line",
    lore: "Compress Cutting Front into a single long penetrating lane.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 3,
    exclusivityGroup: "jinfeng-gong:rank-3"
  },
  {
    id: "golden-gale-fan",
    name: "Golden Gale Fan",
    lore: "Spread Cutting Front across a broad frontal arc of blades.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 3,
    exclusivityGroup: "jinfeng-gong:rank-3"
  },
  {
    id: "crescent-wake",
    name: "Crescent Wake",
    lore: "Trail cutting crescents along the Cultivator's movement route at speed.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 3,
    exclusivityGroup: "jinfeng-gong:rank-3"
  },
  {
    id: "unbroken-current",
    name: "Unbroken Current",
    lore: "Momentum no longer bleeds away when the Cultivator stops.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 6,
    exclusivityGroup: "jinfeng-gong:rank-6"
  },
  {
    id: "ten-thousand-wave-resonance",
    name: "Ten-Thousand Wave Resonance",
    lore: "Every wave-tagged Skill hit feeds Momentum.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 6,
    exclusivityGroup: "jinfeng-gong:rank-6"
  },
  {
    id: "gale-detonation",
    name: "Gale Detonation",
    lore: "At full Momentum, spend part of it to launch a crossing cutting wave.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 6,
    exclusivityGroup: "jinfeng-gong:rank-6"
  },
  {
    id: "endless-horizon",
    name: "Endless Horizon",
    lore: "Cutting Front keeps growing as it travels, scaled by Momentum.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 9,
    exclusivityGroup: "jinfeng-gong:rank-9"
  },
  {
    id: "walking-storm",
    name: "Walking Storm",
    lore: "At high Momentum, periodic radial cutting waves erupt around the Cultivator.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 9,
    exclusivityGroup: "jinfeng-gong:rank-9"
  },
  {
    id: "gale-step-severance",
    name: "Gale-Step Severance",
    lore: "Each Evade cuts a Momentum-scaled corridor along its path.",
    kind: "transformation",
    requiredGongfaIds: ["jinfeng-gong"],
    milestoneRank: 9,
    exclusivityGroup: "jinfeng-gong:rank-9"
  },
  {
    id: "rebounding-edge-armor",
    name: "Rebounding Edge Armor",
    lore: "Each prevented close hit immediately reflects part of its force, but less of that force remains in Guard.",
    playstyle: "Fast counter-pressure", gain: "Reflect 35% of each prevented close hit immediately", cost: "Only 65% of prevented force is stored", scope: "Gengjin Brace prevention and storage", treasureInteraction: "Immediate reflection plus stored force never exceeds the prevented amount",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 3,
    exclusivityGroup: "gengjin-huti:rank-3"
  },
  {
    id: "hundred-forged-heavy-armor",
    name: "Hundred-Forged Heavy Armor",
    lore: "Heavier plates raise mitigation and Guard capacity, but slow movement and take longer to recover from fractures.",
    playstyle: "Slow heavy tank", gain: "42% base mitigation and 150 Guard capacity", cost: "16% slower movement and longer fracture recovery", scope: "Brace weight, cap, and recovery", treasureInteraction: "Treasure mitigation resolves before the heavy brace",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 3,
    exclusivityGroup: "gengjin-huti:rank-3"
  },
  {
    id: "flowing-gold-vent",
    name: "Flowing-Gold Vent",
    lore: "Overflow vents harmlessly instead of fracturing the armor, at the cost of a lower Guard ceiling.",
    playstyle: "Safe frequent release", gain: "Overflow is discarded without fracture", cost: "Guard capacity falls to 72", scope: "Guard overflow and capacity", treasureInteraction: "Vented force cannot trigger Treasure damage",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 3,
    exclusivityGroup: "gengjin-huti:rank-3"
  },
  {
    id: "immovable-mountain",
    name: "Immovable Mountain",
    lore: "Standing still adds mitigation and capacity; moving safely drains the temporary capacity instead of breaking it.",
    playstyle: "Hold ground", gain: "+12% mitigation and +50 capacity while stationary", cost: "Moving removes the temporary capacity", scope: "Stationary Brace posture", treasureInteraction: "Treasure movement does not count as standing still",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 6,
    exclusivityGroup: "gengjin-huti:rank-6"
  },
  {
    id: "flowing-gold-turn",
    name: "Flowing-Gold Turn",
    lore: "Evade vents part of Guard into a brief mitigation layer, leaving less conserved force for the final rebound.",
    playstyle: "Defensive vent timing", gain: "Evade converts 40% Guard into a one-second layer", cost: "Vented Guard no longer contributes to release", scope: "Evade and stored Guard", treasureInteraction: "The layer stacks after Treasure evade defense",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 6,
    exclusivityGroup: "gengjin-huti:rank-6"
  },
  {
    id: "armor-remembers-enemy",
    name: "Armor Remembers Enemy",
    lore: "Repeated close hits from one source teach the armor to resist it; changing sources resets the lesson and stores less force.",
    playstyle: "Duel adaptation", gain: "Repeated source gains up to 15% extra mitigation", cost: "Source changes reset adaptation; only 78% force is stored", scope: "Incoming source identity", treasureInteraction: "Treasure retaliation does not advance adaptation",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 6,
    exclusivityGroup: "gengjin-huti:rank-6"
  },
  {
    id: "eight-wastes-rebound",
    name: "Eight-Wastes Rebound",
    lore: "Blade-Shell Rebound divides its exact conserved total among as many as eight nearby enemies.",
    playstyle: "Crowd redistribution", gain: "Release reaches up to eight nearby enemies", cost: "Each target receives only its share of the fixed total", scope: "Blade-Shell allocation law", treasureInteraction: "Treasure effects resolve per allocation without copying its amount",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 9,
    exclusivityGroup: "gengjin-huti:rank-9"
  },
  {
    id: "one-edge-breaks-mountain",
    name: "One Edge Breaks Mountain",
    lore: "Blade-Shell Rebound sends the entire conserved total into one close priority target.",
    playstyle: "Single-target execution", gain: "One close target receives the full stored total", cost: "No other enemy is hit", scope: "Blade-Shell allocation law", treasureInteraction: "Treasure effects apply once to the chosen edge",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 9,
    exclusivityGroup: "gengjin-huti:rank-9"
  },
  {
    id: "unbroken-golden-city",
    name: "Unbroken Golden City",
    lore: "Blade-Shell Rebound converts the entire conserved total into a temporary shield and deals no damage.",
    playstyle: "Pure survival conversion", gain: "Stored force becomes a five-second shield", cost: "Release deals no damage", scope: "Blade-Shell allocation law", treasureInteraction: "Shield absorption occurs after Treasure guards",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 9,
    exclusivityGroup: "gengjin-huti:rank-9"
  },
  {
    id: "counter-rotating-twin-rings",
    name: "Counter-Rotating Twin Rings",
    lore: "Gain two weaker inner and outer coronas whose intersections burn harder; pay with lower damage away from intersections.",
    playstyle: "Intersection weaving", gain: "Two counter-rotating danger bands; double contact gains intersection damage", cost: "Each ring deals 28% less damage outside intersections", scope: "Corona geometry and segment contact", treasureInteraction: "Spirit Treasure effects apply after segment contact",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 3,
    exclusivityGroup: "burning-ring-scripture:rank-3"
  },
  {
    id: "furnace-heart-lone-ring",
    name: "Furnace-Heart Lone Ring",
    lore: "Gain two slow, heavy segments; pay with enormous openings between them.",
    playstyle: "Heavy gap timing", gain: "+85% segment damage with two slow heavy arcs", cost: "Only two of six slots are occupied, leaving enormous gaps", scope: "Corona speed, coverage, and segment damage", treasureInteraction: "Spirit Treasure effects apply after segment contact",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 3,
    exclusivityGroup: "burning-ring-scripture:rank-3"
  },
  {
    id: "wandering-luminary-rings",
    name: "Wandering Luminary Rings",
    lore: "Gain alternating inner and outer danger bands; pay with visible transition downtime.",
    playstyle: "Alternating range", gain: "Corona alternates between 76 and 138 range", cost: "Each radius change has 250 ms with no active segment", scope: "Corona radius and uptime", treasureInteraction: "Spirit Treasure effects apply after segment contact",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 3,
    exclusivityGroup: "burning-ring-scripture:rank-3"
  },
  {
    id: "banked-sun",
    name: "Banked Sun",
    lore: "Gain a half-Heat floor after stoking; pay with a lower Heat ceiling that cannot form Sunlit Guard.",
    playstyle: "Steady bank", gain: "Heat no longer falls below 50 after reaching it", cost: "Heat is capped at 78, disabling the full-Heat Guard", scope: "Kindled Heat floor and ceiling", treasureInteraction: "Spirit Treasure effects do not bypass the Heat ceiling",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 6,
    exclusivityGroup: "burning-ring-scripture:rank-6"
  },
  {
    id: "myriad-enemies-as-furnace",
    name: "Myriad Enemies as Furnace",
    lore: "Gain much more Heat from distinct ordinary enemies; elite and boss bodies contribute little.",
    playstyle: "Crowd furnace", gain: "Each distinct ordinary enemy contributes 1.4× Heat", cost: "Elites contribute 0.65× and bosses 0.2× Heat", scope: "Distinct-enemy Heat weighting", treasureInteraction: "Spirit Treasure hits never count as new Heat sources",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 6,
    exclusivityGroup: "burning-ring-scripture:rank-6"
  },
  {
    id: "lone-true-sun",
    name: "Lone True Sun",
    lore: "Gain much more Heat from elite and boss contact; ordinary enemies contribute little.",
    playstyle: "Champion furnace", gain: "Elites contribute 1.55× and bosses 2.2× Heat", cost: "Ordinary enemies contribute only 0.2× Heat", scope: "Distinct-enemy Heat weighting", treasureInteraction: "Spirit Treasure hits never count as new Heat sources",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 6,
    exclusivityGroup: "burning-ring-scripture:rank-6"
  },
  {
    id: "perfect-sun-consumption",
    name: "Perfect-Sun Consumption",
    lore: "Gain a nearly complete corona above high Heat; pay continuous Heat while its gaps remain closed.",
    playstyle: "Consume the perfect sun", gain: "At 72+ Heat, all eight corona slots close", cost: "The complete corona drains 10 Heat per second", scope: "High-Heat corona coverage and drain", treasureInteraction: "Spirit Treasure effects do not stop the Heat drain",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 9,
    exclusivityGroup: "burning-ring-scripture:rank-9"
  },
  {
    id: "sunspot-lure",
    name: "Sunspot Lure",
    lore: "Gain slowing gaps and a powerful catching segment; pay with wider openings and lower steady coverage.",
    playstyle: "Bait through the sunspot", gain: "Gap entrants are slowed; the segment that catches them deals +85% damage", cost: "Only three of eight slots remain occupied", scope: "Corona gaps, slow, and next segment contact", treasureInteraction: "Spirit Treasure control applies after the sunspot slow",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 9,
    exclusivityGroup: "burning-ring-scripture:rank-9"
  },
  {
    id: "reverse-wheel-reflection",
    name: "Reverse-Wheel Reflection",
    lore: "Evade reverses the existing corona; each reversal costs Heat and creates no extra attack.",
    playstyle: "Reflect the wheel", gain: "Evade reverses every active corona rotation", cost: "Each reversal costs 18 Heat and creates no attack", scope: "Evade and existing corona direction", treasureInteraction: "Spirit Treasure Evade effects remain independent",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 9,
    exclusivityGroup: "burning-ring-scripture:rank-9"
  },
  {
    id: "piercing-furnace-needle",
    name: "Piercing Furnace Needle",
    lore: "Concentrate several strong nodes inside elite bodies; links are short, but ignition is forceful.",
    playstyle: "Forge a few heavy bodies", gain: "Elite and boss bodies hold more strong nodes", cost: "Short link range and poor wide coverage", scope: "Node capacity, link range, and ignition force",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 3,
    exclusivityGroup: "crimson-furnace-sword-art:rank-3"
  },
  {
    id: "scattered-furnace-needles",
    name: "Scattered Furnace Needles",
    lore: "Spread weak nodes over a wide field and demand a larger connected furnace before ignition.",
    playstyle: "Build a wide furnace web", gain: "Long links and broad target distribution", cost: "Six nodes and higher Pressure are required", scope: "Distribution, link range, and ignition threshold",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 3,
    exclusivityGroup: "crimson-furnace-sword-art:rank-3"
  },
  {
    id: "volatile-furnace-core",
    name: "Volatile Furnace Core",
    lore: "Small networks ignite early, but their core is weak and cannot support rich branching.",
    playstyle: "Cycle small unstable furnaces", gain: "Three-node low-Pressure ignition", cost: "Weak damage and few branches", scope: "Ignition threshold and propagation force",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 3,
    exclusivityGroup: "crimson-furnace-sword-art:rank-3"
  },
  {
    id: "sealed-leftover-needle",
    name: "Sealed Leftover Needle",
    lore: "A dead embedded body leaves one weak temporary ground node instead of stored Pressure.",
    playstyle: "Bridge gaps through death sites", gain: "Embedded deaths leave a four-second connector", cost: "The leftover node is weak and expires", scope: "Death sites and temporary topology",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 6,
    exclusivityGroup: "crimson-furnace-sword-art:rank-6"
  },
  {
    id: "star-furnace-resonance",
    name: "Star-Furnace Resonance",
    lore: "Each node seeks two neighbors, forming branches and loops while splitting ignition force.",
    playstyle: "Engineer branching loops", gain: "Two nearest links per node", cost: "Propagation damage is divided", scope: "Graph degree, branches, loops, and damage",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 6,
    exclusivityGroup: "crimson-furnace-sword-art:rank-6"
  },
  {
    id: "compressed-furnace",
    name: "Compressed Furnace",
    lore: "Only tight clusters count as a furnace; their short links propagate exceptional force.",
    playstyle: "Compress enemies into one forge", gain: "Fast, powerful short-link propagation", cost: "Dispersed nodes become invalid", scope: "Link distance, valid topology, and damage",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 6,
    exclusivityGroup: "crimson-furnace-sword-art:rank-6"
  },
  {
    id: "furnace-heart-reforge",
    name: "Furnace-Heart Reforge",
    lore: "Consumed needles reforge as weak fragments seeking unembedded survivors.",
    playstyle: "Keep spreading the living forge", gain: "Fragments seek fresh bodies", cost: "Fragments are weak and need surviving targets", scope: "Post-ignition fragment targeting",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 9,
    exclusivityGroup: "crimson-furnace-sword-art:rank-9"
  },
  {
    id: "myriad-edges-return",
    name: "Myriad Edges Return",
    lore: "Every reforged fragment converges on the strongest surviving body.",
    playstyle: "Collapse the forge onto one threat", gain: "All fragments focus the strongest survivor", cost: "No fresh-body distribution", scope: "Post-ignition fragment concentration",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 9,
    exclusivityGroup: "crimson-furnace-sword-art:rank-9"
  },
  {
    id: "falling-star-forge",
    name: "Falling-Star Forge",
    lore: "Ignition hammers one-use ground nodes beside the old explosions instead of seeking bodies.",
    playstyle: "Leave a temporary battlefield forge", gain: "Old blasts plant new spatial connectors", cost: "Ground nodes expire and cannot move", scope: "Post-ignition ground topology",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 9,
    exclusivityGroup: "crimson-furnace-sword-art:rank-9"
  }
];

const transformationIdSet = new Set(masteryTransformationConfigs.map((item) => item.id));

const rank10Skill2Ids: Record<GongfaId, string> = {
  "yujian-jue": "returning-sword-formation",
  "jinfeng-gong": "golden-gale-corridor",
  "gengjin-huti": "blade-shell-rebound",
  "crimson-furnace-sword-art": "furnace-cascade",
  "blazing-feather-art": "feather-rain-formation",
  "burning-ring-scripture": "solar-flare-cycle",
  "scarlet-wave-manual": "sunset-wave-apex",
  "drifting-frost-needle": "mirror-needle-constellation",
  "black-tide-scripture": "moon-tide-vault",
  "ice-mirror-guard": "frozen-lotus-shell",
  "green-vine-art": "verdant-root-network",
  "verdant-ring-scripture": "sprout-sun-circle",
  "ironwood-wave-form": "ironwood-surge-form",
  "nine-sun-calamity-seal": "heavenly-sun-descent",
  "mist-wraith-canon": "hundred-ghost-procession",
  "heavenfall-body-art": "star-breaking-descent",
  "thousand-root-formation": "myriad-root-killing-field",
  "flame-demon-body-art": "asura-conflagration",
  "vermilion-bird-covenant": "vermilion-host-descent",
  "frozen-river-formation": "frozen-river-prison",
  "moonfall-tide-ritual": "moonfall-cataclysm",
  "sword-burial-formation": "ten-thousand-sword-tomb",
  "heaven-sundering-edict": "supreme-sundering-decree",
  "myriad-beast-grove": "myriad-beast-stampede",
  "ancient-tree-body-art": "world-tree-incarnation"
};

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getRank10Skill2Id(gongfaId: GongfaId): string {
  return rank10Skill2Ids[gongfaId];
}

export function getMasteryChoiceDefinition(id: string): MasteryChoiceDefinition | undefined {
  const transformation = masteryTransformationConfigs.find((item) => item.id === id);
  if (transformation) {
    return { ...transformation, ...getTransformationImpact(transformation) };
  }

  const upgrade = upgradeConfigs.find((item) => item.id === id);
  if (upgrade) {
    return {
      id: upgrade.id,
      name: upgrade.name,
      lore: upgrade.lore,
      kind: "refinement",
      requiredGongfaIds: upgrade.requiredGongfaIds
    };
  }

  const skill2Entry = Object.entries(rank10Skill2Ids).find(([, skill2Id]) => skill2Id === id);
  if (skill2Entry) {
    return {
      id,
      name: id,
      lore: "Unlock this Gongfa's second Skill.",
      kind: "skill2",
      requiredGongfaIds: [skill2Entry[0] as GongfaId],
      milestoneRank: 10
    };
  }

  return undefined;
}

export function hasMasteryTransformation(
  learnedIds: string[],
  transformationId: string
): boolean {
  return learnedIds.includes(transformationId);
}

function getMilestoneTransformationIds(context: MasteryChoiceContext): string[] | undefined {
  const transformations = masteryTransformationConfigs.filter(
    (transformation) =>
      transformation.milestoneRank === context.rank &&
      transformation.requiredGongfaIds?.includes(context.gongfaId)
  );
  if (transformations.length === 0) {
    return undefined;
  }

  const learned = new Set(context.learnedIds);
  const chosenGroup = transformations.find(
    (transformation) =>
      transformation.exclusivityGroup && learned.has(transformation.id)
  )?.exclusivityGroup;

  if (chosenGroup) {
    return [];
  }

  return transformations
    .filter((transformation) => !learned.has(transformation.id))
    .map((transformation) => transformation.id);
}

export function getDeterministicMasteryChoiceIds(
  context: MasteryChoiceContext
): string[] {
  const milestoneTransformationIds = getMilestoneTransformationIds(context);
  if (milestoneTransformationIds) {
    return milestoneTransformationIds;
  }

  if (context.rank === 10) {
    return [getRank10Skill2Id(context.gongfaId)];
  }

  const learnedCounts = context.learnedIds.reduce<Record<string, number>>((counts, id) => {
    counts[id] = (counts[id] ?? 0) + 1;
    return counts;
  }, {});

  const authoredPool = upgradeConfigs
    .filter((upgrade) => upgrade.requiredGongfaIds?.includes(context.gongfaId))
    .filter((upgrade) => (upgrade.unlockRank ?? 0) <= context.rank)
    // Legacy counterflow-ring remains checkpoint-readable but is superseded by
    // the authored twin-ring Transformation and must never be offered again.
    .filter((upgrade) => upgrade.id !== "counterflow-ring" && !transformationIdSet.has(upgrade.id))
    .filter((upgrade) => {
      const limit = upgrade.maxSelections ?? Infinity;
      return (learnedCounts[upgrade.id] ?? 0) < limit;
    })
    .map((upgrade) => upgrade.id);

  const pool = authoredPool;
  if (pool.length === 0) {
    return [];
  }

  const startIndex = hashString(`${context.seed}:${context.gongfaId}:${context.rank}`) % pool.length;
  const result: string[] = [];

  for (let offset = 0; offset < pool.length && result.length < 3; offset += 1) {
    const candidate = pool[(startIndex + offset) % pool.length];
    if (!result.includes(candidate)) {
      result.push(candidate);
    }
  }

  return result;
}

export function hasAvailableGongfaRefinement(
  gongfaId: GongfaId,
  learnedIds: string[]
): boolean {
  const learnedCounts = learnedIds.reduce<Record<string, number>>((counts, id) => {
    counts[id] = (counts[id] ?? 0) + 1;
    return counts;
  }, {});

  return upgradeConfigs
    .filter((upgrade) => upgrade.requiredGongfaIds?.includes(gongfaId))
    .filter((upgrade) => upgrade.id !== "counterflow-ring" && !transformationIdSet.has(upgrade.id))
    .some((upgrade) => (learnedCounts[upgrade.id] ?? 0) < (upgrade.maxSelections ?? Infinity));
}

export function isGongfaFullyMastered(
  gongfaId: GongfaId,
  rank: number,
  skill2Id: string | undefined,
  learnedIds: string[]
): boolean {
  return rank >= FULLY_MASTERED_RANK && Boolean(skill2Id) && !hasAvailableGongfaRefinement(gongfaId, learnedIds);
}
