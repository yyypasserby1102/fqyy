import type { GongfaId } from "./gongfa";

export type AuthoredMechanicId =
  | "optimal-range-quiver"
  | "alternating-confluence"
  | "segmented-danger-ring"
  | "patient-zenith-omen"
  | "missing-health-combination"
  | "single-companion-return"
  | "distinct-weakpoint-chain"
  | "world-tide-calendar"
  | "finite-mirror-facets"
  | "corpse-soul-procession"
  | "cold-debt-crossings"
  | "movable-gravity-moon"
  | "returning-sword-rack"
  | "movement-cutting-lanes"
  | "prevented-damage-guard"
  | "falling-star-mass"
  | "corpse-bound-grave-swords"
  | "physical-magical-edict-line"
  | "living-embed-topology"
  | "geometric-vine-tension"
  | "ordered-three-glyph-invocation"
  | "stationary-directional-rampart"
  | "living-host-root-lineages"
  | "mixed-species-cooperation"
  | "rooted-growth-rings";

export type AuthoredResourceSource =
  | "optimal-range-ammunition"
  | "opposite-crescent-overlap"
  | "distinct-enemies-in-danger-ring"
  | "time-without-casting"
  | "current-and-missing-health"
  | "dangerous-dive-safe-return"
  | "distinct-exposed-weakpoints"
  | "world-time-modified-by-movement"
  | "intact-physical-facets"
  | "recent-corpse-rank"
  | "one-for-one-crossing-transfer"
  | "enemies-held-until-release"
  | "swords-that-have-returned"
  | "distance-without-reversal"
  | "exact-prevented-close-damage"
  | "distance-without-turning-or-stopping"
  | "one-sword-per-corpse-position"
  | "physical-line-plus-delayed-echo"
  | "simultaneous-embeds-and-links"
  | "distance-across-live-tether"
  | "last-three-glyph-order"
  | "stationary-time-behind-live-wall"
  | "living-host-survival-time"
  | "distinct-species-on-one-kill"
  | "time-while-immovably-rooted";

export type AuthoredPlayerLever =
  | "maintain-narrow-outer-range"
  | "move-the-alternating-seam"
  | "stay-close-within-visible-gaps"
  | "wait-through-a-visible-omen"
  | "commit-or-disengage-from-melee"
  | "guide-dive-and-recall-by-movement"
  | "keep-distinct-weakpoints-available"
  | "move-with-or-against-global-current"
  | "evade-close-danger-to-repair"
  | "route-through-fresh-corpse-souls"
  | "reshape-enemy-pursuit-across-seals"
  | "position-to-hold-enemies-in-orbit"
  | "manage-launch-and-return-downtime"
  | "keep-direction-without-collision"
  | "accept-close-hits-before-fracture"
  | "steer-continuously-with-limited-turning"
  | "shape-kill-sites-and-revisit-graves"
  | "place-one-automatic-line-through-density"
  | "keep-several-live-targets-connected"
  | "stretch-a-tether-through-movement"
  | "change-automatic-glyph-order-by-position"
  | "stop-build-then-move-to-drive"
  | "keep-chosen-hosts-alive-to-mature"
  | "spread-or-recall-pack-by-movement"
  | "choose-when-and-where-to-remain-rooted";

export type AuthoredSpatialShape =
  | "narrow-fan-edge"
  | "left-right-crescent-seam"
  | "gapped-rotating-corona"
  | "delayed-solar-landing-circle"
  | "point-blank-sequential-body-arcs"
  | "one-bird-outbound-and-return-path"
  | "zigzag-weakpoint-polyline"
  | "arena-wide-cardinal-bands"
  | "six-direction-facet-shell"
  | "corpse-to-boundary-spectral-crossings"
  | "seal-to-seal-river-segments"
  | "movable-orbit-disc-and-collapse"
  | "finite-outbound-and-reverse-sword-paths"
  | "recorded-movement-corridor"
  | "close-braced-contact-and-radial-release"
  | "steered-meteor-body-and-crater"
  | "fixed-corpse-graves-and-recorded-lines"
  | "one-drawn-line-with-delayed-same-line-echo"
  | "living-target-node-network"
  | "one-live-tension-line-or-polygon"
  | "three-concentric-ordered-runes"
  | "one-directional-physical-timber-wall"
  | "roots-erupting-from-living-host-bodies"
  | "three-species-independent-formation"
  | "root-trunk-canopy-concentric-tree-body";

export interface GongfaBalanceEnvelope {
  /** Sustainable single-Gongfa damage relative to the roster baseline. */
  damage: number;
  /** Prevention, recovery, or space-making contribution. */
  survival: number;
  /** Slow, displacement, routing, or target denial contribution. */
  control: number;
  /** Expected seconds between major payoffs before milestone modifiers. */
  payoffSeconds: number;
  /** Maximum intended simultaneous persistent combat objects. */
  objectBudget: number;
}

export interface AuthoredGongfaMechanic {
  gongfaId: GongfaId;
  mechanicId: AuthoredMechanicId;
  targetingRule: string;
  resourceSource: AuthoredResourceSource;
  spatialShape: AuthoredSpatialShape;
  playerLever: AuthoredPlayerLever;
  failureCondition: string;
  capstoneRule: string;
  manualAim: false;
  visual: {
    geometry: string;
    motion: string;
    silhouette: string;
  };
  initialCharges: number;
  maxCharges: number;
  balance: GongfaBalanceEnvelope;
}

const mechanic = (
  value: Omit<AuthoredGongfaMechanic, "manualAim">
): AuthoredGongfaMechanic => ({ ...value, manualAim: false });

export const authoredGongfaMechanics: Record<GongfaId, AuthoredGongfaMechanic> = {
  "blazing-feather-art": mechanic({
    gongfaId: "blazing-feather-art", mechanicId: "optimal-range-quiver",
    targetingRule: "automatic priority target; only the fan's outer edge is optimal",
    resourceSource: "optimal-range-ammunition", spatialShape: "narrow-fan-edge",
    playerLever: "maintain-narrow-outer-range", failureCondition: "bad distance wastes a finite feather before reload",
    capstoneRule: "one automatic execution corridor crosses current Phoenix Brands",
    visual: { geometry: "asymmetric feather fan", motion: "outward snap then full molt", silhouette: "red-gold razor fan" },
    initialCharges: 5, maxCharges: 5, balance: { damage: 1.08, survival: 0.72, control: 0.72, payoffSeconds: 8, objectBudget: 7 }
  }),
  "scarlet-wave-manual": mechanic({
    gongfaId: "scarlet-wave-manual", mechanicId: "alternating-confluence",
    targetingRule: "automatic alternating left and right crescents around a priority lane",
    resourceSource: "opposite-crescent-overlap", spatialShape: "left-right-crescent-seam",
    playerLever: "move-the-alternating-seam", failureCondition: "repeating one side or separating fronts creates no Confluence",
    capstoneRule: "two converging fronts divide the arena at the best automatic seam",
    visual: { geometry: "opposed crescents", motion: "alternating lateral sweep", silhouette: "scarlet moving seam" },
    initialCharges: 0, maxCharges: 3, balance: { damage: 1.02, survival: 0.74, control: 0.92, payoffSeconds: 9, objectBudget: 6 }
  }),
  "burning-ring-scripture": mechanic({
    gongfaId: "burning-ring-scripture", mechanicId: "segmented-danger-ring",
    targetingRule: "rotating ring segments hit only distinct enemies held at close range",
    resourceSource: "distinct-enemies-in-danger-ring", spatialShape: "gapped-rotating-corona",
    playerLever: "stay-close-within-visible-gaps", failureCondition: "leaving danger cools Heat and gaps admit attacks",
    capstoneRule: "the moving corona closes every gap briefly, then consumes all Heat",
    visual: { geometry: "segmented sun wheel", motion: "constant orbit with readable gaps", silhouette: "gold-red broken corona" },
    initialCharges: 0, maxCharges: 100, balance: { damage: 0.96, survival: 1.08, control: 0.82, payoffSeconds: 11, objectBudget: 10 }
  }),
  "nine-sun-calamity-seal": mechanic({
    gongfaId: "nine-sun-calamity-seal", mechanicId: "patient-zenith-omen",
    targetingRule: "delayed sun commits to automatically predicted enemy ground",
    resourceSource: "time-without-casting", spatialShape: "delayed-solar-landing-circle",
    playerLever: "wait-through-a-visible-omen", failureCondition: "enemy movement escapes the committed landing and resets patience",
    capstoneRule: "nine orbiting omens collapse into one single impact",
    visual: { geometry: "nine-point solar seal", motion: "slow convergence then vertical fall", silhouette: "black-core calamity sun" },
    initialCharges: 0, maxCharges: 100, balance: { damage: 1.2, survival: 0.68, control: 0.8, payoffSeconds: 13, objectBudget: 10 }
  }),
  "flame-demon-body-art": mechanic({
    gongfaId: "flame-demon-body-art", mechanicId: "missing-health-combination",
    targetingRule: "strongest point-blank threat throughout a health-paid combination",
    resourceSource: "current-and-missing-health", spatialShape: "point-blank-sequential-body-arcs",
    playerLever: "commit-or-disengage-from-melee", failureCondition: "cancelling loses paid health while completing risks lethal exposure",
    capstoneRule: "a completed low-health combination irreversibly locks the Asura form",
    visual: { geometry: "horned sequential fist arcs", motion: "accelerating body blows", silhouette: "blood-red furnace demon" },
    initialCharges: 0, maxCharges: 100, balance: { damage: 1.18, survival: 0.84, control: 0.62, payoffSeconds: 10, objectBudget: 5 }
  }),
  "vermilion-bird-covenant": mechanic({
    gongfaId: "vermilion-bird-covenant", mechanicId: "single-companion-return",
    targetingRule: "one independent bird chooses prey while movement guides its dive direction",
    resourceSource: "dangerous-dive-safe-return", spatialShape: "one-bird-outbound-and-return-path",
    playerLever: "guide-dive-and-recall-by-movement", failureCondition: "a downed bird becomes an ember and loses Bond",
    capstoneRule: "the same bird becomes a damageable egg and may return as one larger phoenix",
    visual: { geometry: "single winged companion", motion: "deep dive and visible return", silhouette: "one vermilion phoenix" },
    initialCharges: 1, maxCharges: 100, balance: { damage: 1.0, survival: 0.84, control: 0.76, payoffSeconds: 12, objectBudget: 2 }
  }),
  "drifting-frost-needle": mechanic({
    gongfaId: "drifting-frost-needle", mechanicId: "distinct-weakpoint-chain",
    targetingRule: "one needle selects exposed weakpoints on distinct enemies",
    resourceSource: "distinct-exposed-weakpoints", spatialShape: "zigzag-weakpoint-polyline",
    playerLever: "keep-distinct-weakpoints-available", failureCondition: "a repeated body or unavailable point breaks the chain",
    capstoneRule: "the current weakpoint chain is traversed immediately in reverse",
    visual: { geometry: "single luminous needle and star points", motion: "sharp zigzag then reverse", silhouette: "pale-blue constellation thread" },
    initialCharges: 1, maxCharges: 7, balance: { damage: 1.1, survival: 0.7, control: 0.82, payoffSeconds: 7, objectBudget: 9 }
  }),
  "black-tide-scripture": mechanic({
    gongfaId: "black-tide-scripture", mechanicId: "world-tide-calendar",
    targetingRule: "all enemies are affected by the current cardinal world flow",
    resourceSource: "world-time-modified-by-movement", spatialShape: "arena-wide-cardinal-bands",
    playerLever: "move-with-or-against-global-current", failureCondition: "movement advances a useful phase too soon or prolongs the wrong phase",
    capstoneRule: "one locked global velocity moves the arena as a body before draining",
    visual: { geometry: "cardinal water bands", motion: "ebb stillness then flood", silhouette: "arena-scale black-blue tide" },
    initialCharges: 0, maxCharges: 3, balance: { damage: 0.86, survival: 0.9, control: 1.2, payoffSeconds: 18, objectBudget: 7 }
  }),
  "ice-mirror-guard": mechanic({
    gongfaId: "ice-mirror-guard", mechanicId: "finite-mirror-facets",
    targetingRule: "six rotating physical facets intercept incoming directions",
    resourceSource: "intact-physical-facets", spatialShape: "six-direction-facet-shell",
    playerLever: "evade-close-danger-to-repair", failureCondition: "sequential attacks crack every facet before risky repairs",
    capstoneRule: "intact facets close into one shell then all shatter outward",
    visual: { geometry: "six faceted mirror petals", motion: "rotation crack repair and closure", silhouette: "cyan lotus shell" },
    initialCharges: 6, maxCharges: 6, balance: { damage: 0.82, survival: 1.22, control: 0.78, payoffSeconds: 12, objectBudget: 12 }
  }),
  "mist-wraith-canon": mechanic({
    gongfaId: "mist-wraith-canon", mechanicId: "corpse-soul-procession",
    targetingRule: "fresh corpse souls are collected by proximity and cross once",
    resourceSource: "recent-corpse-rank", spatialShape: "corpse-to-boundary-spectral-crossings",
    playerLever: "route-through-fresh-corpse-souls", failureCondition: "uncollected souls expire and spent processions leave no army",
    capstoneRule: "every stored ranked soul crosses the arena exactly once and is consumed",
    visual: { geometry: "ranked trailing soul lanterns", motion: "corpse pickup then boundary crossing", silhouette: "pale-cyan funeral procession" },
    initialCharges: 0, maxCharges: 10, balance: { damage: 1.02, survival: 0.76, control: 0.82, payoffSeconds: 10, objectBudget: 12 }
  }),
  "frozen-river-formation": mechanic({
    gongfaId: "frozen-river-formation", mechanicId: "cold-debt-crossings",
    targetingRule: "cursed pursuit routes awaken only when a debtor crosses another seal",
    resourceSource: "one-for-one-crossing-transfer", spatialShape: "seal-to-seal-river-segments",
    playerLever: "reshape-enemy-pursuit-across-seals", failureCondition: "parallel routes or an empty river strand the Debt",
    capstoneRule: "active debtors become nodes sharing one chosen frozen fate",
    visual: { geometry: "paired river seals and ice segments", motion: "crossing flash and debt handoff", silhouette: "cracked blue-white river network" },
    initialCharges: 0, maxCharges: 5, balance: { damage: 0.84, survival: 0.88, control: 1.18, payoffSeconds: 13, objectBudget: 12 }
  }),
  "moonfall-tide-ritual": mechanic({
    gongfaId: "moonfall-tide-ritual", mechanicId: "movable-gravity-moon",
    targetingRule: "one automatic moon follows the densest orbiting group before release",
    resourceSource: "enemies-held-until-release", spatialShape: "movable-orbit-disc-and-collapse",
    playerLever: "position-to-hold-enemies-in-orbit", failureCondition: "early release or escaping enemies waste Syzygy",
    capstoneRule: "the battlefield suspends then resolves all stored motion inward once",
    visual: { geometry: "dark moon and orbit tracks", motion: "slow carry pull and collapse", silhouette: "indigo eclipse well" },
    initialCharges: 0, maxCharges: 8, balance: { damage: 1.1, survival: 0.78, control: 1.04, payoffSeconds: 14, objectBudget: 10 }
  }),
  "yujian-jue": mechanic({
    gongfaId: "yujian-jue", mechanicId: "returning-sword-rack",
    targetingRule: "finite swords are assigned automatically to priority threats",
    resourceSource: "swords-that-have-returned", spatialShape: "finite-outbound-and-reverse-sword-paths",
    playerLever: "manage-launch-and-return-downtime", failureCondition: "airborne swords cannot be reused and poor assignments delay the rack",
    capstoneRule: "every airborne sword reverses through its exact recorded path",
    visual: { geometry: "visible shoulder sword rack", motion: "launch dwell and exact return", silhouette: "white-gold finite sword array" },
    initialCharges: 4, maxCharges: 4, balance: { damage: 1.06, survival: 0.74, control: 0.78, payoffSeconds: 8, objectBudget: 10 }
  }),
  "jinfeng-gong": mechanic({
    gongfaId: "jinfeng-gong", mechanicId: "movement-cutting-lanes",
    targetingRule: "current movement direction draws each cutting lane",
    resourceSource: "distance-without-reversal", spatialShape: "recorded-movement-corridor",
    playerLever: "keep-direction-without-collision", failureCondition: "reversal collision or stopping collapses Momentum",
    capstoneRule: "the recorded movement path becomes one persistent execution corridor",
    visual: { geometry: "parallel ground cuts", motion: "drawn behind continuous travel", silhouette: "golden wind corridor" },
    initialCharges: 0, maxCharges: 100, balance: { damage: 1.04, survival: 0.8, control: 0.86, payoffSeconds: 9, objectBudget: 10 }
  }),
  "gengjin-huti": mechanic({
    gongfaId: "gengjin-huti", mechanicId: "prevented-damage-guard",
    targetingRule: "close incoming sources are braced and answered at contact range",
    resourceSource: "exact-prevented-close-damage", spatialShape: "close-braced-contact-and-radial-release",
    playerLever: "accept-close-hits-before-fracture", failureCondition: "overflow fractures the armor and loses conserved force",
    capstoneRule: "the exact prevented total is released once without enemy-count multiplication",
    visual: { geometry: "fracturing forged plates", motion: "brace crack and conserved rebound", silhouette: "dense white-gold blade shell" },
    initialCharges: 0, maxCharges: 100, balance: { damage: 0.86, survival: 1.22, control: 0.76, payoffSeconds: 12, objectBudget: 9 }
  }),
  "heavenfall-body-art": mechanic({
    gongfaId: "heavenfall-body-art", mechanicId: "falling-star-mass",
    targetingRule: "the transformed body collides along its limited-turn movement heading",
    resourceSource: "distance-without-turning-or-stopping", spatialShape: "steered-meteor-body-and-crater",
    playerLever: "steer-continuously-with-limited-turning", failureCondition: "stopping sharp turns or hard collision shed Mass before descent",
    capstoneRule: "full Mass is spent on one movement-steered landing",
    visual: { geometry: "growing faceted meteor body", motion: "accelerating travel rise and crash", silhouette: "gold-white falling star" },
    initialCharges: 0, maxCharges: 100, balance: { damage: 1.1, survival: 0.9, control: 0.76, payoffSeconds: 10, objectBudget: 5 }
  }),
  "sword-burial-formation": mechanic({
    gongfaId: "sword-burial-formation", mechanicId: "corpse-bound-grave-swords",
    targetingRule: "later trespassers awaken one sword at an exact prior corpse site",
    resourceSource: "one-sword-per-corpse-position", spatialShape: "fixed-corpse-graves-and-recorded-lines",
    playerLever: "shape-kill-sites-and-revisit-graves", failureCondition: "bad death directions trash triggers or inventory overflow waste graves",
    capstoneRule: "every buried sword rises from its own corpse once then the field empties",
    visual: { geometry: "fixed half-buried swords", motion: "single emergence along recorded death line", silhouette: "white-gold gravefield" },
    initialCharges: 0, maxCharges: 12, balance: { damage: 1.08, survival: 0.72, control: 0.82, payoffSeconds: 12, objectBudget: 14 }
  }),
  "heaven-sundering-edict": mechanic({
    gongfaId: "heaven-sundering-edict", mechanicId: "physical-magical-edict-line",
    targetingRule: "one automatic exact line maximizes dense targets and a priority body",
    resourceSource: "physical-line-plus-delayed-echo", spatialShape: "one-drawn-line-with-delayed-same-line-echo",
    playerLever: "place-one-automatic-line-through-density", failureCondition: "targets leaving the recorded line avoid the delayed judgment",
    capstoneRule: "the best recorded line repeats across the arena once",
    visual: { geometry: "single calligraphic sword stroke", motion: "physical draw pause and exact light echo", silhouette: "white-gold divided heaven" },
    initialCharges: 0, maxCharges: 6, balance: { damage: 1.18, survival: 0.66, control: 0.76, payoffSeconds: 11, objectBudget: 5 }
  }),
  "crimson-furnace-sword-art": mechanic({
    gongfaId: "crimson-furnace-sword-art", mechanicId: "living-embed-topology",
    targetingRule: "needles prefer unembedded living targets that form valid links",
    resourceSource: "simultaneous-embeds-and-links", spatialShape: "living-target-node-network",
    playerLever: "keep-several-live-targets-connected", failureCondition: "death distance or over-concentration breaks the topology before ignition",
    capstoneRule: "all connected embeds ignite and each consumed needle reforges once",
    visual: { geometry: "red needle nodes and furnace links", motion: "embed connect ignite and reforge", silhouette: "crimson living crucible graph" },
    initialCharges: 0, maxCharges: 12, balance: { damage: 1.12, survival: 0.7, control: 0.78, payoffSeconds: 10, objectBudget: 16 }
  }),
  "green-vine-art": mechanic({
    gongfaId: "green-vine-art", mechanicId: "geometric-vine-tension",
    targetingRule: "automatically tether two enemies or one enemy and terrain",
    resourceSource: "distance-across-live-tether", spatialShape: "one-live-tension-line-or-polygon",
    playerLever: "stretch-a-tether-through-movement", failureCondition: "slack distance or a dead endpoint removes Tension",
    capstoneRule: "all marked enemies become one tightening polygon",
    visual: { geometry: "one elastic vine line", motion: "stretch vibrate and polygon tighten", silhouette: "bright-green geometric snare" },
    initialCharges: 0, maxCharges: 100, balance: { damage: 0.94, survival: 0.82, control: 1.08, payoffSeconds: 9, objectBudget: 12 }
  }),
  "verdant-ring-scripture": mechanic({
    gongfaId: "verdant-ring-scripture", mechanicId: "ordered-three-glyph-invocation",
    targetingRule: "timed Root Leaf or Thorn glyphs are written automatically from player behavior",
    resourceSource: "last-three-glyph-order", spatialShape: "three-concentric-ordered-runes",
    playerLever: "change-automatic-glyph-order-by-position", failureCondition: "a valid but tactically wrong behavior sequence invokes the wrong geometry",
    capstoneRule: "the exact Root Leaf Thorn order creates one fixed three-phase Sprout-Sun world bloom",
    visual: { geometry: "root leaf and bloom runes", motion: "ordered inscription then invocation", silhouette: "jade three-ring mandala" },
    initialCharges: 0, maxCharges: 3, balance: { damage: 1.02, survival: 0.82, control: 0.92, payoffSeconds: 8, objectBudget: 8 }
  }),
  "ironwood-wave-form": mechanic({
    gongfaId: "ironwood-wave-form", mechanicId: "stationary-directional-rampart",
    targetingRule: "a wall faces the densest automatic threat direction",
    resourceSource: "stationary-time-behind-live-wall", spatialShape: "one-directional-physical-timber-wall",
    playerLever: "stop-build-then-move-to-drive", failureCondition: "early movement side pressure or wall destruction wastes construction",
    capstoneRule: "three strong drives raise four walls that later drive outward",
    visual: { geometry: "squared timber rampart", motion: "grow brace uproot and drive", silhouette: "dark-green directional wall" },
    initialCharges: 0, maxCharges: 100, balance: { damage: 0.84, survival: 1.12, control: 1.02, payoffSeconds: 12, objectBudget: 8 }
  }),
  "thousand-root-formation": mechanic({
    gongfaId: "thousand-root-formation", mechanicId: "living-host-root-lineages",
    targetingRule: "nearby eligible living enemies automatically receive finite lineages",
    resourceSource: "living-host-survival-time", spatialShape: "roots-erupting-from-living-host-bodies",
    playerLever: "keep-chosen-hosts-alive-to-mature", failureCondition: "premature isolated host death resets age or loses the one seed",
    capstoneRule: "all infections erupt once and merge into one Root Mother organism",
    visual: { geometry: "internal seed sprout and mature roots", motion: "host growth death transfer and organic merge", silhouette: "jade roots bursting from bodies" },
    initialCharges: 0, maxCharges: 5, balance: { damage: 1.0, survival: 0.76, control: 1.0, payoffSeconds: 13, objectBudget: 12 }
  }),
  "myriad-beast-grove": mechanic({
    gongfaId: "myriad-beast-grove", mechanicId: "mixed-species-cooperation",
    targetingRule: "boar fox and deer independently select density weakness and player threats",
    resourceSource: "distinct-species-on-one-kill", spatialShape: "three-species-independent-formation",
    playerLever: "spread-or-recall-pack-by-movement", failureCondition: "split prey or a downed species prevents complete Kinship",
    capstoneRule: "each currently living species calls one ancestral action exactly once",
    visual: { geometry: "three distinct beast silhouettes", motion: "break flank guard and regroup", silhouette: "small jade mixed pack" },
    initialCharges: 3, maxCharges: 3, balance: { damage: 1.02, survival: 0.88, control: 0.88, payoffSeconds: 12, objectBudget: 8 }
  }),
  "ancient-tree-body-art": mechanic({
    gongfaId: "ancient-tree-body-art", mechanicId: "rooted-growth-rings",
    targetingRule: "root trunk and canopy automatically answer near middle and far threats",
    resourceSource: "time-while-immovably-rooted", spatialShape: "root-trunk-canopy-concentric-tree-body",
    playerLever: "choose-when-and-where-to-remain-rooted", failureCondition: "a poor young-tree position is weak and a mature tree uproots slowly",
    capstoneRule: "the player becomes an immovable world-tree trunk until the timed incarnation ends",
    visual: { geometry: "concentric roots trunk and canopy", motion: "root grow rings expand and forced uproot", silhouette: "large ancient tree body" },
    initialCharges: 0, maxCharges: 7, balance: { damage: 0.9, survival: 1.12, control: 0.98, payoffSeconds: 14, objectBudget: 11 }
  })
};

export const authoredGongfaMechanicList = Object.values(authoredGongfaMechanics);

export interface AuthoredGongfaRuntimeState {
  mechanicId: AuthoredMechanicId;
  resource: number;
  secondaryResource: number;
  phase: number;
  phaseElapsedMs: number;
  cycleCount: number;
  charges: number;
  maxCharges: number;
  continuousMovementMs: number;
  continuousDistance: number;
  lastMovementAngle?: number;
  activationCount: number;
  targetLedger: Record<number, number>;
  anchors: Array<{
    kind: "corpse-soul" | "stored-soul" | "grave-sword" | "seal" | "infection" | "trail" | "companion" | "beast" | "moon" | "orbiter" | "glyph";
    x: number;
    y: number;
    value: number;
    remainingMs?: number;
    targetId?: number;
    angle?: number;
    originPlayerX?: number;
    originPlayerY?: number;
    sealed?: boolean;
    sealRole?: "origin" | "crossing" | "waiting";
    chainId?: number;
    infectionStage?: 0 | 1 | 2;
    companionState?: "guard" | "outbound" | "return" | "ember" | "egg" | "phoenix";
    beastSpecies?: "boar" | "fox" | "deer";
    beastForm?: "rock-boar" | "spirit-fox" | "verdant-deer" | "mountain-lord" | "black-tortoise" | "white-ape";
    beastState?: "living" | "downed";
    rebirthMs?: number;
    maxValue?: number;
    glyph?: "root" | "leaf" | "thorn";
  }>;
}

export function createAuthoredGongfaRuntimeState(gongfaId: GongfaId): AuthoredGongfaRuntimeState {
  const spec = authoredGongfaMechanics[gongfaId];
  return {
    mechanicId: spec.mechanicId,
    resource: 0,
    secondaryResource: 0,
    phase: 0,
    phaseElapsedMs: 0,
    cycleCount: 0,
    charges: spec.initialCharges,
    maxCharges: spec.maxCharges,
    continuousMovementMs: 0,
    continuousDistance: 0,
    activationCount: 0,
    targetLedger: {},
    anchors: gongfaId === "vermilion-bird-covenant" ? [{
      kind: "companion",
      companionState: "guard",
      x: 0,
      y: 0,
      value: 1,
      maxValue: 1
    }] : gongfaId === "myriad-beast-grove" ? ([
      ["boar", "rock-boar", -46, 22],
      ["fox", "spirit-fox", 46, 22],
      ["deer", "verdant-deer", 0, -48]
    ] as const).map(([beastSpecies, beastForm, x, y]) => ({
      kind: "beast" as const,
      beastSpecies,
      beastForm,
      beastState: "living" as const,
      x,
      y,
      value: 1,
      maxValue: 1
    })) : []
  };
}
