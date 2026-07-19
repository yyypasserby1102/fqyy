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
  "heaven-sundering-edict"
]);

const approvedRuntimeTransformationSeeds: Partial<Record<
  GongfaId,
  Record<3 | 6 | 9, readonly ApprovedTransformationSeed[]>
>> = {
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
      ["white-ape-calls-the-pack", "White Ape Calls the Pack", "The Deer becomes a White Ape whose call spreads the other species marks.", "The pack loses player defense and rooting.", "Deer species job and mark coordination"]
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
  {
    id: "searing-feathers",
    name: "Searing Feathers",
    lore: "Condense the feathers into fewer, armor-piercing blazing shafts.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 3,
    exclusivityGroup: "blazing-feather-art:rank-3"
  },
  {
    id: "feather-storm",
    name: "Feather Storm",
    lore: "Loose a wide flurry of blazing feathers each cycle.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 3,
    exclusivityGroup: "blazing-feather-art:rank-3"
  },
  {
    id: "swift-molt",
    name: "Swift Molt",
    lore: "Shed feathers faster and swifter, quickening the barrage.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 3,
    exclusivityGroup: "blazing-feather-art:rank-3"
  },
  {
    id: "banked-embers",
    name: "Banked Embers",
    lore: "Well-stoked Embers no longer fade below half.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 6,
    exclusivityGroup: "blazing-feather-art:rank-6"
  },
  {
    id: "ember-cascade",
    name: "Ember Cascade",
    lore: "Each feather hit stokes Embers twice as fast.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 6,
    exclusivityGroup: "blazing-feather-art:rank-6"
  },
  {
    id: "ember-burst",
    name: "Ember Burst",
    lore: "At full Embers, the next volley erupts with extra feathers.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 6,
    exclusivityGroup: "blazing-feather-art:rank-6"
  },
  {
    id: "phoenix-ascendant",
    name: "Phoenix Ascendant",
    lore: "Embers crown every volley with spectral blazing feathers.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 9,
    exclusivityGroup: "blazing-feather-art:rank-9"
  },
  {
    id: "searing-domain",
    name: "Searing Domain",
    lore: "Feather hits leave Ember-scaled blazing fields.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 9,
    exclusivityGroup: "blazing-feather-art:rank-9"
  },
  {
    id: "molten-updraft",
    name: "Molten Updraft",
    lore: "Each Evade looses an Ember-scaled burst of feathers.",
    kind: "transformation",
    requiredGongfaIds: ["blazing-feather-art"],
    milestoneRank: 9,
    exclusivityGroup: "blazing-feather-art:rank-9"
  },
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
    id: "rebounding-edge",
    name: "Rebounding Edge",
    lore: "Guard launches a focused blade at the source of prevented damage.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 3,
    exclusivityGroup: "gengjin-huti:rank-3"
  },
  {
    id: "hundred-blade-halo",
    name: "Hundred-Blade Halo",
    lore: "Guard fuels a denser rotating close-range blade halo.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 3,
    exclusivityGroup: "gengjin-huti:rank-3"
  },
  {
    id: "iron-wake",
    name: "Iron Wake",
    lore: "Each Evade leaves a temporary cutting wall along its path.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 3,
    exclusivityGroup: "gengjin-huti:rank-3"
  },
  {
    id: "immovable-mountain",
    name: "Immovable Mountain",
    lore: "Standing still greatly increases Guard gain and defensive output.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 6,
    exclusivityGroup: "gengjin-huti:rank-6"
  },
  {
    id: "flowing-iron-body",
    name: "Flowing Iron Body",
    lore: "Each Evade grants Guard and releases a defensive shockwave.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 6,
    exclusivityGroup: "gengjin-huti:rank-6"
  },
  {
    id: "ten-thousand-armor-resonance",
    name: "Ten-Thousand Armor Resonance",
    lore: "Any defensive-tagged Skill hit builds Guard.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 6,
    exclusivityGroup: "gengjin-huti:rank-6"
  },
  {
    id: "gengjin-fortress",
    name: "Gengjin Fortress",
    lore: "Current Guard manifests as orbiting defensive blades.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 9,
    exclusivityGroup: "gengjin-huti:rank-9"
  },
  {
    id: "iron-gravity-domain",
    name: "Iron Gravity Domain",
    lore: "At high Guard, pull nearby enemies into repeated aura bursts.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 9,
    exclusivityGroup: "gengjin-huti:rank-9"
  },
  {
    id: "unbroken-advance",
    name: "Unbroken Advance",
    lore: "High-Guard movement strikes nearby enemies and empowers Evade.",
    kind: "transformation",
    requiredGongfaIds: ["gengjin-huti"],
    milestoneRank: 9,
    exclusivityGroup: "gengjin-huti:rank-9"
  },
  {
    // Counterflow Ring keeps its existing effect in upgradeConfigs (durable,
    // checkpointed runtime state); registering it here promotes it from an
    // ordinary refinement to its proper rank-3 Transformation milestone.
    id: "counterflow-ring",
    name: "Counterflow Ring",
    lore: "Add a second counter-rotating ring with intersection hot zones.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 3,
    exclusivityGroup: "burning-ring-scripture:rank-3"
  },
  {
    id: "condensed-furnace-ring",
    name: "Condensed Furnace Ring",
    lore: "Merge segments into fewer, fiercer priority-burning hotspots.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 3,
    exclusivityGroup: "burning-ring-scripture:rank-3"
  },
  {
    id: "scattered-ember-orbit",
    name: "Scattered Ember Orbit",
    lore: "Segment hits leave short-lived burning patches in the ring's wake.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 3,
    exclusivityGroup: "burning-ring-scripture:rank-3"
  },
  {
    id: "banked-sun",
    name: "Banked Sun",
    lore: "Heat no longer bleeds below half once it is stoked.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 6,
    exclusivityGroup: "burning-ring-scripture:rank-6"
  },
  {
    id: "aura-furnace",
    name: "Aura Furnace",
    lore: "Any aura-tagged Skill hit stokes markedly more Heat.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 6,
    exclusivityGroup: "burning-ring-scripture:rank-6"
  },
  {
    id: "meridian-ignition",
    name: "Meridian Ignition",
    lore: "Full Heat ignites into a brief high-output burst, then resets.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 6,
    exclusivityGroup: "burning-ring-scripture:rank-6"
  },
  {
    id: "perfect-solar-orbit",
    name: "Perfect Solar Orbit",
    lore: "Heat adds ring segments and closes the orbit's gaps.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 9,
    exclusivityGroup: "burning-ring-scripture:rank-9"
  },
  {
    id: "sunspot-collapse",
    name: "Sunspot Collapse",
    lore: "Periodically condense the ring onto the sturdiest nearby enemy.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 9,
    exclusivityGroup: "burning-ring-scripture:rank-9"
  },
  {
    id: "phoenix-passage",
    name: "Phoenix Passage",
    lore: "Each Evade leaves a temporary Heat-scaled ring copy at its origin.",
    kind: "transformation",
    requiredGongfaIds: ["burning-ring-scripture"],
    milestoneRank: 9,
    exclusivityGroup: "burning-ring-scripture:rank-9"
  },
  {
    id: "crimson-piercing-needles",
    name: "Piercing Furnace Needles",
    lore: "Focus the needles into a deeper-piercing line.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 3,
    exclusivityGroup: "crimson-furnace-sword-art:rank-3"
  },
  {
    id: "scattered-needles",
    name: "Scattered Furnace Needles",
    lore: "Loose a broader spray of embedding needles.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 3,
    exclusivityGroup: "crimson-furnace-sword-art:rank-3"
  },
  {
    id: "volatile-embeds",
    name: "Volatile Embeds",
    lore: "Embeds reach detonation with fewer needles.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 3,
    exclusivityGroup: "crimson-furnace-sword-art:rank-3"
  },
  {
    id: "sustained-crucible",
    name: "Sustained Crucible",
    lore: "Crucible Pressure bleeds away far more slowly.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 6,
    exclusivityGroup: "crimson-furnace-sword-art:rank-6"
  },
  {
    id: "resonant-crucible",
    name: "Resonant Crucible",
    lore: "Each detonation builds markedly more Pressure.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 6,
    exclusivityGroup: "crimson-furnace-sword-art:rank-6"
  },
  {
    id: "overpressure-detonation",
    name: "Overpressure Detonation",
    lore: "Pressure swells explosion radius far more sharply.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 6,
    exclusivityGroup: "crimson-furnace-sword-art:rank-6"
  },
  {
    id: "furnace-heart",
    name: "Furnace Heart",
    lore: "Crucible Pressure adds extra needles to every volley.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 9,
    exclusivityGroup: "crimson-furnace-sword-art:rank-9"
  },
  {
    id: "relentless-needles",
    name: "Relentless Needles",
    lore: "High Pressure looses a second needle volley.",
    kind: "transformation",
    requiredGongfaIds: ["crimson-furnace-sword-art"],
    milestoneRank: 9,
    exclusivityGroup: "crimson-furnace-sword-art:rank-9"
  },
  {
    id: "crucible-nova",
    name: "Crucible Nova",
    lore: "Full Pressure erupts in a furnace nova, then resets.",
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
    // An upgrade that is also a milestone Transformation (e.g. counterflow-ring)
    // is offered only at its milestone, never in the ordinary refinement pool.
    .filter((upgrade) => !transformationIdSet.has(upgrade.id))
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
    .filter((upgrade) => !transformationIdSet.has(upgrade.id))
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
