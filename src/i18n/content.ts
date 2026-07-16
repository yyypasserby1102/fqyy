import { gongfaConfigs, type GongfaConfig, type GongfaId } from "../data/gongfa";
import { getGongfaPackage, type GongfaPackageDefinition } from "../data/gongfaPackages";
import { linggenConfigs, type LinggenConfig, type LinggenId } from "../data/linggen";
import {
  getSpiritTreasureConfig,
  type SpiritTreasureConfig,
  type SpiritTreasureId
} from "../data/spiritTreasures";
import { stageConfigs, type StageConfig, type StageId } from "../data/stages";
import { upgradeConfigs, type UpgradeConfig, type UpgradeEffect } from "../data/upgrades";
import {
  masteryTransformationConfigs,
  getMasteryChoiceDefinition,
  type MasteryChoiceDefinition
} from "../logic/mastery";
import type { ChoiceOption, ChoicePayload } from "../data/choices";
import type { Locale } from "./locale";

type GongfaTranslation = {
  name: string;
  lore: string;
  combatRole: string;
  visualMotif: string;
  skill1: { name: string; description: string };
  passive: { name: string; resource: string; description: string };
  skill2: { name: string; description: string };
};

export interface ContentAdapter {
  term?(value: string): string;
  buildSynergy?(synergy: { title: string; description: string }): { title: string; description: string };
  gongfa?(id: GongfaId): GongfaConfig;
  gongfaPackage?(id: GongfaId): GongfaPackageDefinition;
  linggen?(id: LinggenId): LinggenConfig;
  spiritTreasure?(id: SpiritTreasureId): SpiritTreasureConfig;
  stage?(id: StageId): StageConfig;
  upgrade?(id: string): UpgradeConfig;
  masteryChoice?(id: string): MasteryChoiceDefinition;
  runtimeText?(value: string): string;
  choicePayload?(payload: ChoicePayload): ChoicePayload;
}

const contentAdapters: Partial<Record<string, ContentAdapter>> = {};

export function registerContentAdapter(locale: string, adapter: ContentAdapter): () => void {
  const previous = contentAdapters[locale];
  contentAdapters[locale] = adapter;
  return () => {
    if (previous) contentAdapters[locale] = previous;
    else delete contentAdapters[locale];
  };
}

function getContentAdapter(locale: Locale): ContentAdapter | undefined {
  return contentAdapters[locale];
}

const zhGongfa: Record<GongfaId, GongfaTranslation> = {
  "yujian-jue": {
    name: "御剑诀", lore: "以严整金气驾驭飞剑。", combatRole: "灵活游走，以精准剑阵清剿中程敌群。", visualMotif: "淡蓝剑印、整齐剑路与回旋剑弧。",
    skill1: { name: "飞剑齐射", description: "飞剑依序追击附近敌人，以严整剑势贯穿优先目标。" },
    passive: { name: "不灭剑意", resource: "剑意", description: "齐射命中积累剑意，提升御剑伤害与所有投射类术法。" },
    skill2: { name: "回锋剑阵", description: "剑阵横穿最密集的敌阵，随后逆势回斩并刷新剑意。" }
  },
  "jinfeng-gong": {
    name: "金锋功", lore: "金气化作锐利锋潮向外迸发。", combatRole: "沿移动方向斩开长廊，主动走位方能尽显锋芒。", visualMotif: "金白风刃、横贯长空的锋线与流动尾迹。",
    skill1: { name: "断空锋", description: "金气锋浪沿修士移动方向斩出，随势能增长而拓宽。" },
    passive: { name: "罡风势", resource: "势能", description: "移动、锋浪命中与闪避积累势能，拓宽并延长浪形术法。" },
    skill2: { name: "金风长廊", description: "持续存在的锋刃长廊反复切割行进路线上的敌人，并维持势能。" }
  },
  "gengjin-huti": {
    name: "庚金护体", lore: "淬炼肉身，以庚金锋芒反击近身威胁。", combatRole: "以近身防御化险为攻，将敌势转为反击。", visualMotif: "钢蓝护环、多面甲片与放射刃爆。",
    skill1: { name: "庚金护罡", description: "近身护罡在敌人靠近或出手时迸发庚金锐芒。" },
    passive: { name: "百炼金身", resource: "护势", description: "近身威胁与被化解的伤害积累护势，增强减伤与防御类术法。" },
    skill2: { name: "刃甲反震", description: "减免伤害与贴身闪避为刃甲蓄势，最终迸发环形金刃。" }
  },
  "crimson-furnace-sword-art": {
    name: "赤炉剑法", lore: "热刃入体，以炉压引爆连锁锋火。", combatRole: "埋刃蓄势后集中引爆，连锁击破关键目标。", visualMotif: "赤红炉纹、灼热针芒与黑芯爆裂。",
    skill1: { name: "炉心飞针", description: "灼热剑针刺入敌体，达到埋针阈值后同时爆裂。" },
    passive: { name: "熔炉压势", resource: "炉压", description: "爆裂积累炉压，扩大所有爆破类术法的范围。" },
    skill2: { name: "炉火连爆", description: "同时引爆所有埋针，并散出灼热碎片，引发新的连锁爆裂。" }
  },
  "blazing-feather-art": {
    name: "烈羽诀", lore: "凝聚烈火灵气，化作追魂炎羽。", combatRole: "逐步增强的追踪齐射，最终化作漫天烈羽。", visualMotif: "橙红羽扇、余烬微光与凤凰垂翼般的火雨。",
    skill1: { name: "烈焰飞羽", description: "炎羽追击附近敌人，并随余烬积累而增加数量。" },
    passive: { name: "烬火羽衣", resource: "余烬", description: "飞羽命中点燃余烬，持续提升伤害与羽数，直至热力消散。" },
    skill2: { name: "天羽焚阵", description: "多轮炎羽落向最密集的敌群，并继续追索幸存目标。" }
  },
  "burning-ring-scripture": {
    name: "焚轮经", lore: "烈焰环身，以持续近战灼尽群敌。", combatRole: "高风险近身火环，持续贴敌可换取强大回报。", visualMotif: "分节日轮、逆向旋火与扩散炎冕。",
    skill1: { name: "旋焰轮", description: "分节火环绕身旋转，反复灼烧近敌，并保留可辨认的间隙。" },
    passive: { name: "燃脉", resource: "热力", description: "火环接触不同目标积累热力，加速所有环域类术法。" },
    skill2: { name: "日耀轮回", description: "两重完整日轮成形，释放受热力强化的波动，同时维持旋焰。" }
  },
  "scarlet-wave-manual": {
    name: "赤浪真诀", lore: "火气化为灼热月牙，层层席卷前方。", combatRole: "宽阔炎月封锁战线，连续横扫可叠加压制。", visualMotif: "赤红月牙墙、熔融交叠线与余烬尾迹。",
    skill1: { name: "赤焰月牙", description: "宽扇形火浪向前翻涌，在敌阵中不断累积灼压。" },
    passive: { name: "叠浪灼痕", resource: "灼痕", description: "锋浪命中积累灼痕，使后续赤焰月牙更强更多。" },
    skill2: { name: "落日浪极", description: "两面月牙火墙在最密集的敌线上交错，于熔痕处造成二次打击。" }
  },
  "drifting-frost-needle": {
    name: "游霜针", lore: "水气凝寒成针，循隙追击弱处。", combatRole: "寒针精准追索，并逐渐扩展覆盖与贯穿压力。", visualMotif: "青蓝针星、冰晶闪光与霜白轨迹。",
    skill1: { name: "游霜寒针", description: "寒针弯折追向破绽，并随霜意积累增强贯穿。" },
    passive: { name: "凝霜", resource: "霜意", description: "寒针命中积累霜意，增加伤害与针数，直至寒意散去。" },
    skill2: { name: "镜针星阵", description: "环绕星阵分批射出霜针覆盖近敌，并重新锁定倒下目标。" }
  },
  "black-tide-scripture": {
    name: "玄潮经", lore: "凝水成潮，重浪层叠席卷四方。", combatRole: "沉重潮锋先推后卷，将幸存敌人重新聚回。", visualMotif: "深蓝月弧、玄水层带与逆转潮环。",
    skill1: { name: "玄水重潮", description: "层叠水气化作宽阔潮锋向前碾压，并随潮势高涨。" },
    passive: { name: "月引潮生", resource: "潮势", description: "浪形命中提升潮势，增强后续潮锋的力量与宽度。" },
    skill2: { name: "月潮穹阵", description: "环形潮水先将敌人推开，再逆卷幸存者并造成第二次打击。" }
  },
  "ice-mirror-guard": {
    name: "冰镜护体", lore: "寒水凝镜护身，碎裂时反射锋芒。", combatRole: "近身反射防御，绽放为精准霜晶碎片。", visualMotif: "青蓝镜瓣、琉璃切面与碎莲轮廓。",
    skill1: { name: "冰镜寒锋", description: "旋转镜片切割近敌，并加固修士周身的反射防线。" },
    passive: { name: "寒镜反照", resource: "镜意", description: "镜片命中积累镜意，增强并增殖碎片，直至镜光消退。" },
    skill2: { name: "冰莲镜甲", description: "镜瓣结成护体冰莲，旋转后碎裂为精准追敌的霜晶。" }
  },
  "green-vine-art": {
    name: "青藤诀", lore: "木气化生灵藤，循敌缠击不休。", combatRole: "追踪藤鞭不断分枝，织成脉动根网。", visualMotif: "碧玉藤弧、荆棘节点与发光根脉。",
    skill1: { name: "寻敌灵藤", description: "活藤弯折追向近敌，并随藤势积累增强鞭击。" },
    passive: { name: "徐生藤势", resource: "藤势", description: "灵藤命中积累藤势，增加藤鞭数量与力量。" },
    skill2: { name: "碧根灵网", description: "扎根目标牵出分枝藤脉，脉动攻击近敌并寻找新的宿主。" }
  },
  "verdant-ring-scripture": {
    name: "碧环经", lore: "木气环身，绽放为荆棘生域。", combatRole: "原地生长的近战领域，将周身化作荆棘花阵。", visualMotif: "翠叶花环、萌生轮辐与明亮日华。",
    skill1: { name: "碧叶花环", description: "叶刃绕身旋转切割近敌，并随花势增长而繁盛。" },
    passive: { name: "回春", resource: "花势", description: "花瓣命中积累花势，扩大并增殖生灵环域。" },
    skill2: { name: "萌阳法阵", description: "种下法阵，反复生出荆棘轮辐，最终绽成完整杀阵。" }
  },
  "ironwood-wave-form": {
    name: "铁木浪形", lore: "木气层层展开，化作坚密壁浪。", combatRole: "厚重木垒推动战线，回返时迸裂为斜向木浪。", visualMotif: "墨绿年轮、方整木墙与斜飞裂片。",
    skill1: { name: "铁木壁浪", description: "厚重木锋承载心木之力，沿敌阵一路推进。" },
    passive: { name: "深心木", resource: "心木", description: "浪形命中积蓄心木，提升力量与宽度。" },
    skill2: { name: "铁木奔流式", description: "木垒反复推开敌人，随后裂成两道斜向回返浪。" }
  }
};

const zhLinggen: Record<LinggenId, Pick<LinggenConfig, "name" | "lore">> = {
  fire: { name: "火灵根", lore: "纯火之根，刚猛专一，易于精炼。" },
  water: { name: "水灵根", lore: "纯水之根，周天稳固，运转自如。" },
  metal: { name: "金灵根", lore: "纯金之根，锋意凝练，行气严整。" },
  wood: { name: "木灵根", lore: "纯木之根，生机绵延，善于续势与掌控战场。" },
  "fire-metal": { name: "火金双灵根", lore: "炎热与锋锐并生，路数宽广而多变。" },
  "water-metal": { name: "水金双灵根", lore: "流转与锋锐相济，善于应变与精巧御敌。" },
  "water-wood": { name: "水木双灵根", lore: "滋养与流转相生，柔韧而绵长。" }
};

const zhTreasures: Record<
  SpiritTreasureId,
  Pick<SpiritTreasureConfig, "name" | "lore" | "signature" | "culmination">
> = {
  "jade-heart-pendant": { name: "玉心佩", lore: "温润玉意安抚经脉，使气血愈发深厚。", signature: { id: "steady-heart", name: "定心", effect: "气血低于三成时，每三十息恢复气血上限的 5%。" }, culmination: { id: "jade-heart-reborn", name: "玉心再生", effect: "应急恢复提升至气血上限的 10%。" } },
  "windstep-talisman": { name: "御风符", lore: "山风托足，步履轻灵若无物。", signature: { id: "gale-return", name: "风返", effect: "闪避冷却缩短 8%。" }, culmination: { id: "unbound-wind", name: "无拘之风", effect: "闪避冷却缩短 15%。" } },
  "lodestone-charm": { name: "引灵磁符", lore: "散落灵气自会向持有者汇聚。", signature: { id: "qi-pulse", name: "灵气脉冲", effect: "拾取灵气时，对 160 像素内敌人造成 4 点伤害。" }, culmination: { id: "spirit-tide", name: "灵潮", effect: "灵气脉冲伤害提升至 8 点。" } },
  "ironhide-seal": { name: "铁肤印", lore: "皮肉如叠铁般淬炼，抗击重创。", signature: { id: "iron-reprieve", name: "铁息", effect: "承受重击后两秒内，后续伤害降低 18%。" }, culmination: { id: "unbroken-seal", name: "不破铁印", effect: "后续伤害降低提升至 30%。" } },
  "spiritbloom-vial": { name: "灵华瓶", lore: "灵蕴徐徐绽放，滋养并强健肉身。", signature: { id: "second-bloom", name: "二度绽放", effect: "受到的治疗提升 12%。" }, culmination: { id: "endless-bloom", name: "无尽灵华", effect: "受到的治疗提升 25%。" } },
  "farsight-mirror": { name: "远照镜", lore: "远处灵光映入镜中，应召而来。", signature: { id: "far-strike", name: "远击", effect: "投射类命中伤害提升 6%。" }, culmination: { id: "heavenly-sight", name: "天目", effect: "投射类命中伤害提升 12%。" } }
};

const zhStages: Record<StageId, Pick<StageConfig, "name" | "message">> = {
  lianqi: { name: "炼气", message: "灵气初聚，尚显粗粝不稳。" },
  zhuji: { name: "筑基", message: "道基已成，法门渐稳。" },
  jindan: { name: "金丹", message: "金丹凝结，灵气奔涌。" },
  yuanying: { name: "元婴", message: "元婴初醒，天门洞开。" }
};

const zhEffects: Record<UpgradeEffect, string> = {
  skill1Damage: "术法一伤害", skill1Cooldown: "术法一施放速度", skill1Count: "术法一数量",
  skill1Pierce: "术法一贯穿", skill1Range: "术法一范围", retaliationDamage: "反击伤害",
  guardBuild: "护势积累", guardStability: "护势稳定", defensiveSynergy: "防御联动",
  heatBuild: "热力积累", heatDecay: "热力留存", auraSynergy: "环域联动",
  embedThreshold: "埋针阈值", pressureBuild: "炉压积累", pressureDecay: "炉压留存",
  moveSpeed: "移动速度", maxHealth: "气血上限", heal: "气血恢复", magnet: "灵气吸引范围",
  galeMomentumBuild: "势能积累", galeMomentumDecay: "势能留存", waveSynergy: "浪形联动",
  surgeBuild: "功法资源积累", surgeStability: "功法资源稳定", evadeSynergy: "闪避联动",
  gongfaDamageSynergy: "功法伤害联动", gongfaPierceSynergy: "功法贯穿联动",
  gongfaRangeSynergy: "功法范围联动", resourcePotency: "功法资源效力",
  skill2Damage: "术法二伤害", skill2Coverage: "术法二覆盖", skill2Cadence: "术法二施放速度"
};

const categoryNames: Record<UpgradeConfig["category"], string> = {
  skill1: "初式淬炼", passive: "心法淬炼", synergy: "联动淬炼", skill2: "后式淬炼", legacy: "旧法"
};

const zhTerms: Record<string, string> = {
  fire: "火", water: "水", metal: "金", wood: "木",
  homing: "追踪", wave: "浪形", aura: "环域", projectile: "投射",
  sword: "剑", explosive: "爆破", defensive: "防御",
  Weak: "下等", Medium: "中等", Strong: "上等",
  Slow: "缓慢", Normal: "正常", Fast: "迅速",
  Damage: "伤害", Cadence: "间隔", Count: "数量", Pierce: "贯穿",
  Speed: "速度", Lifetime: "持续", Spread: "散布", Range: "范围",
  Returns: "回返", Aura: "环域", Retaliate: "反击", Shells: "甲爆",
  skill1: "初式", passive: "心法", synergy: "联动", skill2: "后式", legacy: "旧法",
  vitality: "生息", bulwark: "壁垒", harvest: "采灵", perception: "洞察", windwalk: "御风",
  Attunement: "契合", moveSpeed: "移动速度", maxHealth: "气血上限",
  magnetRadius: "吸引范围", mitigation: "减伤"
};

export function localizeTerm(locale: Locale, value: string): string {
  return getContentAdapter(locale)?.term?.(value) ?? value;
}

export function localizeBuildSynergy(
  locale: Locale,
  synergy: { title: string; description: string }
): { title: string; description: string } {
  return getContentAdapter(locale)?.buildSynergy?.(synergy) ?? synergy;
}

function localizeZhBuildSynergy(
  synergy: { title: string; description: string }
): { title: string; description: string } {
  const shared = /^Shared (.+) core$/.exec(synergy.title);
  if (shared) {
    const count = /^([0-9]+) Gongfa/.exec(synergy.description)?.[1] ?? "多";
    const tag = zhTerms[shared[1]] ?? shared[1];
    return { title: `${tag}系共鸣`, description: `${count} 门功法共享「${tag}」战斗特征，使出手方式彼此呼应。` };
  }
  if (synergy.title === "Mobile wave front") return { title: "身随浪走", description: "移动速度能够支撑浪形功法所需的走位与控线。" };
  if (synergy.title === "Close-range foundation") return { title: "近身根基", description: "防御灵宝帮助环域与防御功法稳守危险近身区域。" };
  if (synergy.title === "Layered engagement") return { title: "多层交战", description: "不同形态覆盖各类位置，避免所有攻势争抢同一条战线。" };
  return { title: "流派联动", description: "所选功法与灵宝形成互相支撑的战斗关系。" };
}

export function localizeGongfa(locale: Locale, id: GongfaId): GongfaConfig {
  return getContentAdapter(locale)?.gongfa?.(id) ?? gongfaConfigs[id];
}

function localizeZhGongfa(id: GongfaId): GongfaConfig {
  const source = gongfaConfigs[id];
  const translated = zhGongfa[id];
  return { ...source, name: translated.name, lore: translated.lore };
}

export function localizeGongfaPackage(locale: Locale, id: GongfaId): GongfaPackageDefinition {
  return getContentAdapter(locale)?.gongfaPackage?.(id) ?? getGongfaPackage(id);
}

function localizeZhGongfaPackage(id: GongfaId): GongfaPackageDefinition {
  const source = getGongfaPackage(id);
  const translated = zhGongfa[id];
  return {
    ...source,
    combatRole: translated.combatRole,
    visualMotif: translated.visualMotif,
    skill1: { ...source.skill1, ...translated.skill1 },
    passive: { ...source.passive, ...translated.passive },
    skill2: { ...source.skill2, ...translated.skill2 }
  };
}

export function localizeLinggen(locale: Locale, id: LinggenId): LinggenConfig {
  const source = linggenConfigs[id];
  return getContentAdapter(locale)?.linggen?.(id) ?? source;
}

export function localizeSpiritTreasure(locale: Locale, id: SpiritTreasureId): SpiritTreasureConfig {
  const source = getSpiritTreasureConfig(id);
  return getContentAdapter(locale)?.spiritTreasure?.(id) ?? source;
}

export function localizeStage(locale: Locale, id: StageId): StageConfig {
  const source = stageConfigs[id];
  return getContentAdapter(locale)?.stage?.(id) ?? source;
}

export function localizeUpgrade(locale: Locale, id: string): UpgradeConfig {
  const localized = getContentAdapter(locale)?.upgrade?.(id);
  if (localized) return localized;
  const source = upgradeConfigs.find((item) => item.id === id);
  if (!source) throw new Error(`Unknown upgrade: ${id}`);
  return source;
}

function localizeZhUpgrade(id: string): UpgradeConfig {
  const source = upgradeConfigs.find((item) => item.id === id);
  if (!source) throw new Error(`Unknown upgrade: ${id}`);
  const gongfaName = source.requiredGongfaIds?.[0]
    ? zhGongfa[source.requiredGongfaIds[0]].name
    : "修士根基";
  const specialName = id === "sword-intent-sharpening" ? "剑意淬锋" : null;
  return {
    ...source,
    name: specialName ?? `${gongfaName}·${categoryNames[source.category]}`,
    lore: `强化「${gongfaName}」的${zhEffects[source.effect]}（${source.value}）。`,
    scope: gongfaName
  };
}

export function localizeMasteryChoice(locale: Locale, id: string): MasteryChoiceDefinition {
  const localized = getContentAdapter(locale)?.masteryChoice?.(id);
  if (localized) return localized;
  const source = getMasteryChoiceDefinition(id);
  if (!source) throw new Error(`Unknown mastery choice: ${id}`);
  return source;
}

function localizeZhMasteryChoice(id: string): MasteryChoiceDefinition {
  const source = getMasteryChoiceDefinition(id);
  if (!source) throw new Error(`Unknown mastery choice: ${id}`);
  if (source.kind === "refinement") {
    const upgrade = localizeZhUpgrade(id);
    return { ...source, name: upgrade.name, lore: upgrade.lore };
  }
  const gongfaId = source.requiredGongfaIds?.[0];
  const gongfaName = gongfaId ? zhGongfa[gongfaId].name : "功法";
  const peers = masteryTransformationConfigs.filter((item) =>
    item.requiredGongfaIds?.[0] === gongfaId && item.milestoneRank === source.milestoneRank
  );
  const option = Math.max(0, peers.findIndex((item) => item.id === id)) + 1;
  const draft = zhMasteryDrafts[id];
  const override = zhMasteryOverrides[id];
  const packageInfo = gongfaId ? zhGongfa[gongfaId] : undefined;
  const alternativeNames = peers
    .filter((item) => item.id !== id)
    .map((item) => zhMasteryOverrides[item.id]?.name ?? zhMasteryDrafts[item.id]?.name ?? item.name)
    .join("或");
  const opportunityCost = `永久放弃同阶的${alternativeNames}。`;
  const impacts: Record<number, Array<Pick<MasteryChoiceDefinition, "playstyle" | "gain" | "cost" | "scope" | "treasureInteraction">>> = {
    3: [
      { playstyle: "凝力破阵", gain: "初式伤害提升 35%，贯穿增加 2", cost: "覆盖范围降低 35%", scope: `「${packageInfo?.skill1.name ?? "初式"}」形态与直接命中`, treasureInteraction: "洞察共鸣强化凝聚攻势" },
      { playstyle: "广域压制", gain: `初式数量增加 ${gongfaId === "blazing-feather-art" ? 3 : 2}，覆盖角度增加 24 度`, cost: "单次命中伤害降低 20%", scope: `「${packageInfo?.skill1.name ?? "初式"}」形态与直接命中`, treasureInteraction: "采灵共鸣支撑多目标拾取节奏" },
      { playstyle: "疾速连发", gain: "初式冷却缩短 28%", cost: "单次命中伤害降低 18%", scope: `「${packageInfo?.skill1.name ?? "初式"}」冷却与直接命中`, treasureInteraction: "御风共鸣维持近身节奏" }
    ],
    6: [
      { playstyle: "稳守储备", gain: "心法资源最低保留一半", cost: opportunityCost, scope: `心法「${packageInfo?.passive.name ?? "心法"}」（${packageInfo?.passive.resource ?? "资源"}）循环`, treasureInteraction: "生息共鸣支撑稳定循环" },
      { playstyle: "加速运转", gain: "每次命中心法资源积累翻倍", cost: opportunityCost, scope: `心法「${packageInfo?.passive.name ?? "心法"}」（${packageInfo?.passive.resource ?? "资源"}）循环`, treasureInteraction: "采灵共鸣加快拾取循环" },
      { playstyle: "蓄势爆发", gain: "满资源时额外发动 3 次攻击", cost: opportunityCost, scope: `「${packageInfo?.skill1.name ?? "初式"}」与${packageInfo?.passive.resource ?? "心法资源"}`, treasureInteraction: "洞察共鸣放大爆发" }
    ],
    9: [
      { playstyle: "持续输出", gain: "每层资源增加 1 次幻化攻击", cost: opportunityCost, scope: `「${packageInfo?.skill1.name ?? "初式"}」与${packageInfo?.passive.resource ?? "心法资源"}`, treasureInteraction: "洞察共鸣延伸幻化攻势" },
      { playstyle: "领域控制", gain: "命中生成伤害为 35% 的资源领域", cost: opportunityCost, scope: `「${packageInfo?.skill1.name ?? "初式"}」命中与${packageInfo?.passive.resource ?? "心法资源"}`, treasureInteraction: "壁垒共鸣支撑领域内作战" },
      { playstyle: "游走反击", gain: "闪避时发动一次随资源增强的初式", cost: opportunityCost, scope: `闪避与「${packageInfo?.skill1.name ?? "初式"}」`, treasureInteraction: "御风共鸣直接强化此触发" }
    ]
  };
  const name = override?.name ?? draft?.name ?? `${gongfaName}·${source.milestoneRank ?? 0}重蜕变${option}`;
  const lore = override?.lore ?? draft?.lore ?? `重塑「${gongfaName}」的战斗形态；选定后将永久生效。`;
  const usesAuthoredSpecialRules = source.gain === source.lore;
  const specialImpact = usesAuthoredSpecialRules
    ? {
        playstyle: name,
        gain: lore,
        cost: opportunityCost,
        scope: source.milestoneRank === 3
          ? /Evade/.test(source.lore)
            ? `闪避与「${packageInfo?.skill1.name ?? "初式"}」`
            : `「${packageInfo?.skill1.name ?? "初式"}」形态与命中方式`
          : source.milestoneRank === 6
            ? `心法「${packageInfo?.passive.name ?? "心法"}」（${packageInfo?.passive.resource ?? "资源"}）循环`
            : /Evade/.test(source.lore)
              ? `闪避与${packageInfo?.passive.resource ?? "心法资源"}终式`
              : `「${packageInfo?.skill1.name ?? "初式"}」与${packageInfo?.passive.resource ?? "心法资源"}终式`,
        treasureInteraction: "法宝共鸣在此蜕变结算后独立生效"
      }
    : undefined;
  const impact = specialImpact ?? (source.milestoneRank ? impacts[source.milestoneRank]?.[option - 1] : undefined);
  return {
    ...source,
    ...impact,
    name,
    lore
  };
}

const zhMasteryDrafts: Record<string, { name: string; lore: string }> =
{
  "searing-feathers": {
    "name": "灼热羽毛",
    "lore": "将羽毛凝结成更少的、穿甲的炽热的轴。"
  },
  "feather-storm": {
    "name": "羽毛风暴",
    "lore": "每个周期都会释放出一大片燃烧的羽毛。"
  },
  "swift-molt": {
    "name": "迅速蜕皮",
    "lore": "脱落羽毛的速度越来越快，弹幕速度也越来越快。"
  },
  "banked-embers": {
    "name": "银行余烬",
    "lore": "充足的余烬不再褪色到一半以下。"
  },
  "ember-cascade": {
    "name": "余烬瀑布",
    "lore": "每击中一根羽毛，燃烬的速度都会加快两倍。"
  },
  "ember-burst": {
    "name": "余烬爆裂",
    "lore": "当余烬满时，下一次齐射会爆发出额外的羽毛。"
  },
  "phoenix-ascendant": {
    "name": "凤凰上升",
    "lore": "余烬在每一次齐射中都笼罩着幽灵般的炽热羽毛。"
  },
  "searing-domain": {
    "name": "灼热领域",
    "lore": "羽毛击中留下了余烬鳞片的炽热场地。"
  },
  "molten-updraft": {
    "name": "熔融上升气流",
    "lore": "每次躲避都会释放出一片灰烬鳞片的羽毛。"
  },
  "lancing-crescent": {
    "name": "兰斯新月",
    "lore": "将新月压缩成一支深深刺穿的猩红色长矛。"
  },
  "wide-crescent": {
    "name": "宽新月形",
    "lore": "将新月形分布在宽阔的灼热弧上。"
  },
  "rolling-heat": {
    "name": "滚烫",
    "lore": "将波浪滚得越来越快。"
  },
  "lasting-scorch": {
    "name": "持久焦灼",
    "lore": "充分燃烧的焦土不再褪色到一半以下。"
  },
  "spreading-scorch": {
    "name": "焦烧蔓延",
    "lore": "每波攻击都会使焦土速度加快两倍。"
  },
  "scorch-detonation": {
    "name": "焦灼爆炸",
    "lore": "在完全焦化时，下一波会爆发出额外的新月。"
  },
  "sunfire-crescents": {
    "name": "日火新月",
    "lore": "焦灼在每一波波浪上都镀上了光谱新月。"
  },
  "cinder-trail": {
    "name": "煤渣小径",
    "lore": "波浪的撞击留下了焦黑的煤渣场。"
  },
  "heatwave-step": {
    "name": "热浪步",
    "lore": "每次闪避都会释放出一道焦鳞波。"
  },
  "piercing-frost": {
    "name": "冰霜刺骨",
    "lore": "将针磨成深深刺穿的冰冻碎片。"
  },
  "frost-flurry": {
    "name": "冰霜乱舞",
    "lore": "散布大量的霜针。"
  },
  "swift-frost": {
    "name": "迅捷霜冻",
    "lore": "松散的霜针越来越快。"
  },
  "lasting-frost": {
    "name": "持久霜冻",
    "lore": "充分燃烧的霜冻不会再褪色到一半以下。"
  },
  "frost-cascade": {
    "name": "冰霜瀑布",
    "lore": "每击中一根针，弗罗斯特的速度都会加快两倍。"
  },
  "frost-burst": {
    "name": "霜降爆裂",
    "lore": "在完全霜冻时，下一次齐射会爆发出额外的针。"
  },
  "frost-crown": {
    "name": "霜冠",
    "lore": "霜冻为每一次齐射都加上了幽灵针。"
  },
  "frost-domain": {
    "name": "霜域",
    "lore": "针击中会留下一片冰霜鳞片的冰冻区域。"
  },
  "frost-step": {
    "name": "冰霜步",
    "lore": "每次闪避都会释放出冰霜鳞片的针齐射。"
  },
  "crushing-tide": {
    "name": "粉碎潮汐",
    "lore": "将潮汐引导成一股毁灭性的浪潮。"
  },
  "tide-spread": {
    "name": "潮汐传播",
    "lore": "将潮流传播到广阔的战线上。"
  },
  "swift-tide": {
    "name": "迅捷潮汐",
    "lore": "让潮水涌得更快、更快。"
  },
  "lasting-tide": {
    "name": "恒潮",
    "lore": "充满活力的潮汐不再消失到一半以下。"
  },
  "tide-cascade": {
    "name": "潮汐瀑布",
    "lore": "每次命中都会使潮汐速度加快两倍。"
  },
  "tide-burst": {
    "name": "潮汐爆发",
    "lore": "在满潮时，下一次浪潮会以额外的力量爆发。"
  },
  "tide-crown": {
    "name": "潮汐皇冠",
    "lore": "潮汐使每一次浪潮都笼罩在幽灵般的水流之上。"
  },
  "tide-domain": {
    "name": "深渊领域",
    "lore": "命中后会留下一片潮汐规模的溺水场。"
  },
  "tide-step": {
    "name": "潮步",
    "lore": "每次闪避都会失去潮汐鳞片的冲击力。"
  },
  "mirror-edge": {
    "name": "镜边",
    "lore": "将镜子碎片磨成刺穿的边缘。"
  },
  "mirror-spread": {
    "name": "镜面传播",
    "lore": "将镜子碎片散布在宽阔的弧线上。"
  },
  "swift-mirror": {
    "name": "迅捷镜子",
    "lore": "转动镜子的速度越来越快。"
  },
  "lasting-reflection": {
    "name": "持久的反思",
    "lore": "充满活力的反射不再消失到一半以下。"
  },
  "reflection-cascade": {
    "name": "反射级联",
    "lore": "每次命中都会使反射速度提高两倍。"
  },
  "reflection-burst": {
    "name": "折射爆发",
    "lore": "在完全反射时，下一回合会爆发出额外的碎片。"
  },
  "reflection-crown": {
    "name": "倒影皇冠",
    "lore": "反射在每一个回合中都充满了光谱碎片。"
  },
  "reflection-domain": {
    "name": "冰川域",
    "lore": "命中会留下反射比例的镜面区域。"
  },
  "reflection-step": {
    "name": "反思步骤",
    "lore": "每次躲避都会释放一次反射级碎片爆发。"
  },
  "thorned-vines": {
    "name": "荆棘藤蔓",
    "lore": "将藤蔓硬化成刺眼的睫毛。"
  },
  "vine-spread": {
    "name": "藤蔓延",
    "lore": "将藤蔓铺展在宽阔的灌木丛中。"
  },
  "swift-vines": {
    "name": "迅捷藤蔓",
    "lore": "鞭打藤蔓的速度越来越快。"
  },
  "lasting-growth": {
    "name": "持久增长",
    "lore": "充满活力的藤蔓不再褪色到一半以下。"
  },
  "growth-cascade": {
    "name": "增长级联",
    "lore": "每次命中都会使藤蔓生长速度加快两倍。"
  },
  "growth-burst": {
    "name": "过度生长爆发",
    "lore": "当藤蔓完全生长时，下一鞭子会爆发出额外的藤蔓。"
  },
  "growth-crown": {
    "name": "翠绿皇冠",
    "lore": "每根睫毛上都长满了幽灵般的藤蔓。"
  },
  "growth-domain": {
    "name": "布兰布尔域",
    "lore": "击中后会留下藤蔓规模的荆棘田。"
  },
  "growth-step": {
    "name": "藤步",
    "lore": "每次躲避都会失去一根藤蔓鳞片藤鞭。"
  },
  "piercing-bloom": {
    "name": "刺穿绽放",
    "lore": "将环形花瓣磨成刺穿刀片。"
  },
  "bloom-spread": {
    "name": "绽放蔓延",
    "lore": "打开戒指，变成宽阔的绽放光环。"
  },
  "swift-bloom": {
    "name": "斯威夫特·布鲁姆",
    "lore": "让花开得越来越快。"
  },
  "lasting-bloom": {
    "name": "持久绽放",
    "lore": "充满活力的布鲁姆不再褪色到一半以下。"
  },
  "bloom-cascade": {
    "name": "绽放级联",
    "lore": "每次命中都会使布鲁姆的速度提高两倍。"
  },
  "bloom-burst": {
    "name": "蓬勃发展",
    "lore": "盛开时，下一个环会绽放出额外的花瓣。"
  },
  "bloom-crown": {
    "name": "绽放皇冠",
    "lore": "绽放的光影花瓣为每一个戒指加冕。"
  },
  "bloom-domain": {
    "name": "翠绿域",
    "lore": "命中留下一片盛开的花田。"
  },
  "bloom-step": {
    "name": "绽放步",
    "lore": "每次躲避都会释放出绽放的鳞片花瓣。"
  },
  "ironwood-spear": {
    "name": "铁木矛",
    "lore": "将波浪凝聚成一支刺骨的铁木长矛。"
  },
  "ironwood-spread": {
    "name": "铁木传播",
    "lore": "将波浪传播到宽阔的铁木前沿。"
  },
  "swift-ironwood": {
    "name": "斯威夫特铁木",
    "lore": "推动波浪更快、更快。"
  },
  "lasting-heartwood": {
    "name": "持久的心材",
    "lore": "充分燃烧的心材不再褪色到一半以下。"
  },
  "heartwood-cascade": {
    "name": "心材瀑布",
    "lore": "每次命中都会使心木的速度提高两倍。"
  },
  "heartwood-burst": {
    "name": "铁木爆裂",
    "lore": "当心材饱满时，下一波会以额外的力量爆发。"
  },
  "heartwood-crown": {
    "name": "心材冠",
    "lore": "心材用光谱木材为每一波波浪加冕。"
  },
  "heartwood-domain": {
    "name": "铁木领域",
    "lore": "命中会留下一片心木鳞片的碎片。"
  },
  "heartwood-step": {
    "name": "铁木台阶",
    "lore": "每次躲避都会释放出心木鳞片的波浪。"
  },
  "execution-seal": {
    "name": "执行印章",
    "lore": "重复御剑技能1对标记的优先目标的攻击会升级。"
  },
  "sword-bloom": {
    "name": "剑华",
    "lore": "御剑一技能的第一击会分裂成较弱的剑，寻找不同的敌人。"
  },
  "reversing-sword-path": {
    "name": "逆转剑道",
    "lore": "御剑一技剑穿过敌人返回到修真者身上。"
  },
  "still-sword-heart": {
    "name": "依旧剑心",
    "lore": "受到的伤害不再分散累积的剑意。"
  },
  "myriad-blade-resonance": {
    "name": "万刀共鸣",
    "lore": "带有射弹标记的命中可以更快地提供剑意。"
  },
  "intent-unleashed": {
    "name": "意图释放",
    "lore": "意图充分时，下一次剑齐射会爆发出额外的剑刃。"
  },
  "sword-crown": {
    "name": "剑冠",
    "lore": "当前意图以较弱的光谱剑来完成齐射。"
  },
  "intent-domain": {
    "name": "意图域",
    "lore": "命中后会留下短暂的刀刃场，并随意图而扩展。"
  },
  "void-step-formation": {
    "name": "虚阶阵",
    "lore": "每次闪避都会从其路径上失去一次额外的剑齐射。"
  },
  "heaven-splitting-line": {
    "name": "裂天线",
    "lore": "将切割前沿压缩成一条长的穿透通道。"
  },
  "golden-gale-fan": {
    "name": "金色大风扇",
    "lore": "将切割前端分布在宽阔的刀片正面弧上。"
  },
  "crescent-wake": {
    "name": "新月唤醒",
    "lore": "沿着耕耘者的移动路线快速切割新月。"
  },
  "unbroken-current": {
    "name": "不间断的电流",
    "lore": "当修行者停止时，动量不再消失。"
  },
  "ten-thousand-wave-resonance": {
    "name": "万波共振",
    "lore": "每个带有波浪标记的技能命中都会增加动量。"
  },
  "gale-detonation": {
    "name": "强风爆炸",
    "lore": "动量满时，花费部分动量来发射交叉切割波。"
  },
  "endless-horizon": {
    "name": "无尽的地平线",
    "lore": "切割前沿在传播过程中不断增长，并根据动量进行缩放。"
  },
  "walking-storm": {
    "name": "行走的风暴",
    "lore": "在高动量下，耕耘机周围爆发出周期性的径向切割波。"
  },
  "gale-step-severance": {
    "name": "疾风断绝",
    "lore": "每次躲避都会沿着其路径切出一条动量规模的走廊。"
  },
  "rebounding-edge": {
    "name": "篮板优势",
    "lore": "守卫向被阻止伤害的源头发射聚焦刀片。"
  },
  "hundred-blade-halo": {
    "name": "百刃光环",
    "lore": "防护装置会产生更密集的旋转近距离刀刃光环。"
  },
  "iron-wake": {
    "name": "钢铁觉醒",
    "lore": "每次躲避都会沿着其路径留下临时的切割墙。"
  },
  "immovable-mountain": {
    "name": "不动山",
    "lore": "站立不动会大大增加后卫的增益和防御输出。"
  },
  "flowing-iron-body": {
    "name": "流动的铁身",
    "lore": "每次闪避都会给予防御并释放防御冲击波。"
  },
  "ten-thousand-armor-resonance": {
    "name": "万甲共鸣",
    "lore": "任何带有防御标记的技能命中都会构建守卫。"
  },
  "gengjin-fortress": {
    "name": "耿津堡",
    "lore": "当前的守卫表现为绕轨道运行的防御刀片。"
  },
  "iron-gravity-domain": {
    "name": "铁重力域",
    "lore": "在高守卫状态下，将附近的敌人拉入重复的光环爆发中。"
  },
  "unbroken-advance": {
    "name": "不间断的前进",
    "lore": "高防御运动会攻击附近的敌人并增强闪避能力。"
  },
  "counterflow-ring": {
    "name": "逆流环",
    "lore": "添加第二个具有交叉热区的反向旋转环。"
  },
  "condensed-furnace-ring": {
    "name": "冷凝炉环",
    "lore": "将片段合并为更少、更激烈的优先燃烧热点。"
  },
  "scattered-ember-orbit": {
    "name": "分散的余烬轨道",
    "lore": "分段撞击会在环的尾迹中留下短暂的燃烧痕迹。"
  },
  "banked-sun": {
    "name": "太阳银行",
    "lore": "一旦加热，热量就不会再流失到一半以下。"
  },
  "aura-furnace": {
    "name": "灵气熔炉",
    "lore": "任何带有光环标记的技能命中都会明显增加热量。"
  },
  "meridian-ignition": {
    "name": "经络点火",
    "lore": "全热会引发短暂的高输出爆发，然后重置。"
  },
  "perfect-solar-orbit": {
    "name": "完美的太阳轨道",
    "lore": "热量会增加环段并闭合轨道间隙。"
  },
  "sunspot-collapse": {
    "name": "太阳黑子崩溃",
    "lore": "定期将戒指凝聚到附近最坚固的敌人身上。"
  },
  "phoenix-passage": {
    "name": "凤凰通道",
    "lore": "每次逃避都会在其起源处留下一个临时的热鳞环副本。"
  },
  "crimson-piercing-needles": {
    "name": "穿孔炉针",
    "lore": "将针集中到更深的刺穿线上。"
  },
  "scattered-needles": {
    "name": "散落的炉针",
    "lore": "松开更广泛的包埋针喷雾。"
  },
  "volatile-embeds": {
    "name": "易失性嵌入",
    "lore": "嵌入物用更少的针就能达到爆炸。"
  },
  "sustained-crucible": {
    "name": "持续坩埚",
    "lore": "坩埚压力的流失速度要慢得多。"
  },
  "resonant-crucible": {
    "name": "共振坩埚",
    "lore": "每次爆炸都会产生明显更大的压力。"
  },
  "overpressure-detonation": {
    "name": "超压爆炸",
    "lore": "压力使爆炸半径急剧膨胀。"
  },
  "furnace-heart": {
    "name": "炉心",
    "lore": "坩埚压力为每次射击增加了额外的针头。"
  },
  "relentless-needles": {
    "name": "无情的针",
    "lore": "高压失去了第二针截击。"
  },
  "crucible-nova": {
    "name": "坩埚新星",
    "lore": "全压力在熔炉新星中爆发，然后重置。"
  }
};

const zhMasteryOverrides: Record<string, { name: string; lore?: string }> = {
  "searing-feathers": { name: "炽羽凝锋" },
  "swift-molt": { name: "疾羽蜕生" },
  "banked-embers": { name: "蕴火余烬" },
  "phoenix-ascendant": { name: "凤羽升华" },
  "molten-updraft": { name: "熔火升流" },
  "lancing-crescent": { name: "贯日炎月" },
  "frost-cascade": { name: "凝霜连生" },
  "tide-crown": { name: "玄潮加冕" },
  "lasting-reflection": { name: "镜意长存" },
  "reflection-step": { name: "镜影步" },
  "growth-crown": { name: "青藤华冠" },
  "growth-domain": { name: "荆棘生域" },
  "swift-bloom": { name: "瞬息花开" },
  "lasting-heartwood": { name: "心木长存" },
  "execution-seal": { name: "诛敌剑印", lore: "御剑诀初式反复命中被标记的关键目标时，伤害会逐步提升。" },
  "sword-bloom": { name: "剑华分影", lore: "御剑诀初式首次命中时分裂出较弱飞剑，分别追索其他敌人。" },
  "reversing-sword-path": { name: "回锋剑路", lore: "御剑诀初式穿敌后折返修士身旁，再次贯穿沿途目标。" },
  "still-sword-heart": { name: "不动剑心", lore: "受到伤害时不再散失已经积累的剑意。" },
  "myriad-blade-resonance": { name: "万剑共鸣", lore: "所有投射类术法命中都能更快地积累剑意。" },
  "intent-unleashed": { name: "剑意迸发", lore: "剑意充盈时，下一轮飞剑齐射会额外迸发剑刃。" },
  "sword-crown": { name: "剑冠", lore: "当前剑意会为每轮齐射补充较弱的灵体飞剑。" },
  "intent-domain": { name: "剑意领域", lore: "命中后留下短暂剑域，其范围随剑意扩大。" },
  "void-step-formation": { name: "虚步剑阵", lore: "每次闪避都会沿移动路径额外释放一轮飞剑。" },
  "golden-gale-fan": { name: "金风巨扇" },
  "crescent-wake": { name: "月牙尾流" },
  "unbroken-current": { name: "势流不绝" },
  "walking-storm": { name: "随身罡风" },
  "rebounding-edge": { name: "回弹锋刃" },
  "iron-wake": { name: "铁壁留痕" },
  "gengjin-fortress": { name: "庚金堡垒" },
  "banked-sun": { name: "蕴日藏火" },
  "aura-furnace": { name: "环域熔炉" },
  "meridian-ignition": { name: "经脉点燃" },
  "perfect-solar-orbit": { name: "圆满日轮" },
  "sunspot-collapse": { name: "日斑坍缩" },
  "phoenix-passage": { name: "凤凰过隙" },
  "crimson-piercing-needles": { name: "赤炉贯针" },
  "volatile-embeds": { name: "易爆埋针" },
  "sustained-crucible": { name: "恒压熔炉" },
  "resonant-crucible": { name: "共鸣熔炉" },
  "crucible-nova": { name: "熔炉新星" }
};

let zhReplacementPairs: Array<[string, string]> | null = null;

function getZhReplacementPairs(): Array<[string, string]> {
  if (zhReplacementPairs) return zhReplacementPairs;
  const pairs: Array<[string, string]> = [];
  for (const id of Object.keys(gongfaConfigs) as GongfaId[]) {
    const source = gongfaConfigs[id];
    const translated = localizeGongfa("zh-CN", id);
    const sourcePackage = getGongfaPackage(id);
    const translatedPackage = localizeGongfaPackage("zh-CN", id);
    pairs.push(
      [source.name, translated.name], [source.lore, translated.lore],
      [sourcePackage.combatRole, translatedPackage.combatRole],
      [sourcePackage.visualMotif, translatedPackage.visualMotif],
      [sourcePackage.skill1.name, translatedPackage.skill1.name],
      [sourcePackage.skill1.description, translatedPackage.skill1.description],
      [sourcePackage.passive.name, translatedPackage.passive.name],
      [sourcePackage.passive.resource, translatedPackage.passive.resource],
      [sourcePackage.passive.description, translatedPackage.passive.description],
      [sourcePackage.skill2.name, translatedPackage.skill2.name],
      [sourcePackage.skill2.description, translatedPackage.skill2.description]
    );
  }
  for (const id of Object.keys(linggenConfigs) as LinggenId[]) {
    pairs.push([linggenConfigs[id].name, zhLinggen[id].name], [linggenConfigs[id].lore, zhLinggen[id].lore]);
  }
  for (const id of Object.keys(stageConfigs) as StageId[]) {
    pairs.push([stageConfigs[id].name, zhStages[id].name], [stageConfigs[id].message, zhStages[id].message]);
  }
  for (const id of Object.keys(zhTreasures) as SpiritTreasureId[]) {
    const source = getSpiritTreasureConfig(id);
    pairs.push(
      [source.name, zhTreasures[id].name], [source.lore, zhTreasures[id].lore],
      [source.signature.name, zhTreasures[id].signature.name],
      [source.signature.effect, zhTreasures[id].signature.effect],
      [source.culmination.name, zhTreasures[id].culmination.name],
      [source.culmination.effect, zhTreasures[id].culmination.effect]
    );
  }
  for (const source of upgradeConfigs) {
    const translated = localizeUpgrade("zh-CN", source.id);
    pairs.push([source.name, translated.name], [source.lore, translated.lore], [source.scope, translated.scope]);
  }
  for (const source of masteryTransformationConfigs) {
    const translated = localizeMasteryChoice("zh-CN", source.id);
    pairs.push([source.name, translated.name], [source.lore, translated.lore]);
  }
  zhReplacementPairs = pairs
    .filter(([source, translated]) => source !== translated && source.length > 1)
    .sort(([left], [right]) => right.length - left.length);
  return zhReplacementPairs;
}

const runtimeExactZh: Record<string, string> = {
  "Run Ended": "本次修行已结束",
  "Settings open — Run paused.": "设置已打开，本次修行暂停。",
  "Qi is unstable. Claim the Lingcao and reveal your roots.": "灵气尚不稳定。取得灵草，觉醒你的灵根。",
  "Meditation pause.": "入定暂停。",
  "Cultivator fell. Qi scattered.": "修士陨落，灵气溃散。",
  "Paused - ESC to resume": "已暂停 · 按 ESC 继续",
  "WASD Move · Space Evade · G Gongfa · Esc Pause": "WASD 移动 · 空格 闪避 · G 功法 · ESC 暂停",
  "WASD Move · Space Evade · G Gongfa · Esc Pause · F3 Debug": "WASD 移动 · 空格 闪避 · G 功法 · ESC 暂停 · F3 调试",
  "G · GONGFA": "G · 功法",
  "No Gongfa Awakened": "尚未觉醒功法",
  "MORTAL": "凡人",
  "Claim the Lingcao to awaken a Linggen and choose a Gongfa.": "取得灵草，觉醒灵根并选择第一门功法。",
  "The archive will record every learned path.": "图鉴将记录所有已习得的修行道路。",
  "SEALED": "封印",
  "Unknown": "未知",
  "This meridian has not yet opened.": "此道经脉尚未贯通。",
  "No refinements integrated yet.": "尚未融入任何精通淬炼。",
  "No refinements integrated yet. The first insight arrives at Mastery Rank 1.": "尚未融入任何精通淬炼，精通一重时将获得首次感悟。",
  "GONGFA ARCHIVE": "功法图鉴",
  "Keyboard: G close · ← → change path": "按键：G 关闭 · ← → 切换功法",
  "‹ PREVIOUS": "‹ 上一门",
  "NEXT ›": "下一门 ›",
  "CLOSE ×": "关闭 ×",
  "INTEGRATED MASTERY": "已融入精通",
  "REALM PHASE": "境界阶段",
  "Leave it behind": "暂不收取",
  "Keep your current three Spirit Treasures.": "保留当前三件灵宝。",
  "All three Spirit Treasure slots are full.": "三个灵宝栏位均已占满。",
  "Choose one refinement for the current Gongfa rank.": "为当前功法重数选择一项淬炼。",
  "Choose one permanent Transformation. The other two paths close.": "选择一项永久蜕变，其余两条同阶道路将封闭。",
  "A deterministic mastery refinement.": "一项既定的精通淬炼。",
  "Return to Title": "返回主界面",
  "Abandon Run": "放弃本次修行",
  "Advance after cleanup and autosave.": "清场并自动存档后继续前进。",
  "Leave the run on the current checkpoint.": "在当前存档点离开本次修行。",
  "Delete the active save and return to title.": "删除当前存档并返回主界面。",
  "Face the Heavenly Tribulation": "直面天劫",
  "Begin the normal-ending boss sequence.": "开始普通结局的最终天劫。",
  "Resolve the next celestial pattern after cleanup and autosave.": "清场并自动存档后迎接下一重天象。",
  "Run Complete": "修行圆满",
  "The Heavenly Tribulation is broken. The run is complete.": "天劫已破，本次修行圆满。",
  "Leave the completed run and return to the shell.": "结束本次修行并返回主界面。",
  "HEAVENLY TRIBULATION BROKEN": "天劫已破",
  "TRIBULATION BEGINS": "天劫降临",
  "TRIBULATION CLEARED": "天劫已破",
  "Defeat the Tribulation host. The breakthrough is not yet yours.": "击败天劫之主，方可真正突破。",
  "Foundation Growth: +1 damage · +8 max HP · +3 movement · +8 orb radius.": "根基成长：伤害 +1 · 气血上限 +8 · 移动 +3 · 灵气拾取范围 +8。",
  "Ascendant": "飞升者",
  "The Yuanying Cultivator stands beyond the storm.": "元婴修士越过雷海，立于天穹之外。",
  "A permanent completion record has been written.": "本次通关已永久记录。",
  "Crude Qi Thread": "粗浅灵气",
  "Fallen Sect Courtyard · Breath": "荒宗庭院 · 吐纳",
  "Mist Bamboo Valley · Root": "雾竹谷 · 道基",
  "Burial Ridge · Core": "葬岭 · 金丹",
  "Cloudbreak Summit · Soul": "破云峰 · 元神",
  "You leave the Spirit Treasure behind.": "你暂且留下了这件灵宝。",
  "Healing Pill restores your vitality.": "疗伤丹恢复了你的气血。",
  "Lightning judgment descends over Cloudbreak Summit.": "雷霆天罚降临破云峰。",
  "Lightning Judgment": "雷霆裁决",
  "Celestial thunder measures the Cultivator's foundation.": "九天雷霆衡量修士道基。",
  "Tribulation Shades": "劫影群生",
  "Shades gather where the storm refuses the light.": "雷云遮光之处，劫影悄然聚集。",
  "Collapsing Safe Zones": "净域崩塌",
  "The last sanctuary contracts beneath a broken sky.": "破碎天穹之下，最后的净域不断收缩。",
  "Heavenly Judgment": "天道裁决",
  "The heavens answer.": "苍天已有回应。",
  "FOUNDATION SETTLES": "根基稳固",
  "STAGE BREAKTHROUGH": "境界突破",
  "Phase Transition": "阶段流转",
  "Yuanying Heavenly Tribulation": "元婴天劫",
  "Chuqi complete. Foundation pressure settles into Zhongqi.": "初期圆满，根基压力沉淀，迈入中期。",
  "Zhongqi complete. Pressure deepens into Houqi.": "中期圆满，根基压力加深，迈入后期。",
  "Houqi complete. Dayuanman approaches.": "后期圆满，大圆满已近在眼前。",
  "Dayuanman clears. Cloudbreak Summit answers with thunder.": "大圆满已成，破云峰以雷霆回应。",
  "Unrevealed": "未觉醒",
  "Hidden": "未显露",
  "Fully Mastered": "圆满精通",
  "Locked": "未解锁",
  "None": "无",
  "Next choice at Rank 3": "三重时获得下一次选择"
};

export function localizeRuntimeText(locale: Locale, value: string): string {
  return getContentAdapter(locale)?.runtimeText?.(value) ?? value;
}

function localizeZhRuntimeText(value: string): string {
  if (value.length === 0) return value;
  if (runtimeExactZh[value]) return runtimeExactZh[value];
  const nextFoundationReward = /^NEXT REWARD · \+1 damage · \+8 max HP\/heal · \+3 movement · \+8 orb radius · (.+)$/.exec(value);
  if (nextFoundationReward) {
    return `下次奖励 · 伤害 +1 · 气血上限与恢复 +8 · 移动 +3 · 灵气拾取范围 +8 · ${localizeZhRuntimeText(nextFoundationReward[1])}`;
  }
  const cleanup = /^Cleanup complete\. (.+) is ready to advance\.$/.exec(value);
  if (cleanup) return `清场完成，${localizeZhRuntimeText(cleanup[1])}已可推进。`;
  const concludingTribulation = /^(.+) Dayuanman clears\. Its concluding Tribulation rises\.$/.exec(value);
  if (concludingTribulation) {
    return `${localizeZhRuntimeText(concludingTribulation[1])}大圆满已成，终末天劫随之降临。`;
  }
  const phaseCleared = /^(.+) clears\. The tribulation deepens\.$/.exec(value);
  if (phaseCleared) return `${localizeZhRuntimeText(phaseCleared[1])}已破，天劫愈发深重。`;
  const stageTribulation = /^Complete the (.+) Tribulation and open the next Gongfa slot\.$/.exec(value);
  if (stageTribulation) {
    return `渡过${localizeZhRuntimeText(stageTribulation[1])}天劫，并开启下一功法槽位。`;
  }
  let result = value;
  for (const [source, translated] of Object.entries(runtimeExactZh).sort(
    ([left], [right]) => right.length - left.length
  )) {
    if (result.includes(source)) result = result.replaceAll(source, translated);
  }
  for (const [source, translated] of getZhReplacementPairs()) {
    if (result.includes(source)) result = result.replaceAll(source, translated);
  }
  result = result
    .replaceAll("Crude Qi Thread", "粗浅灵气")
    .replaceAll("Fallen Sect Courtyard · Breath", "荒宗庭院 · 吐纳")
    .replaceAll("Mist Bamboo Valley · Root", "雾竹谷 · 道基")
    .replaceAll("Burial Ridge · Core", "葬岭 · 金丹")
    .replaceAll("Cloudbreak Summit · Soul", "破云峰 · 元神")
    .replaceAll("LIANQI", "炼气").replaceAll("ZHUJI", "筑基").replaceAll("JINDAN", "金丹").replaceAll("YUANYING", "元婴")
    .replaceAll("Chuqi", "初期").replaceAll("Zhongqi", "中期").replaceAll("Houqi", "后期").replaceAll("Dayuanman", "大圆满")
    .replaceAll("chuqi", "初期").replaceAll("zhongqi", "中期").replaceAll("houqi", "后期").replaceAll("dayuanman", "大圆满")
    .replace(/^Qi:/, "灵气：").replace(/^Vitality:/, "气血：").replace(/^Vitality /, "气血 ")
    .replace(/^Gongfa:/, "功法：").replace(/^Mastery:/, "精通：").replace(/^Paths:/, "功法路数：")
    .replace(/^Linggen:/, "灵根：").replace(/^Evade:/, "闪避：").replace(/^Spirit Treasures:/, "灵宝：")
    .replace(/^Lingcao:/, "灵草：").replace(/^Gale Momentum:/, "罡风势：").replace(/^Guard:/, "护势：")
    .replace(/^REALM PROGRESS/, "境界进度").replace(/^HEAVENLY TRIBULATION/, "天劫")
    .replaceAll("breakthrough ready", "可突破").replaceAll("Rank", "重").replaceAll("Progress", "进度")
    .replaceAll("Skill 2", "术法二").replaceAll("Casts", "施放").replaceAll("Active", "生效中").replaceAll("Ready", "就绪")
    .replaceAll("mitigation", "减伤").replaceAll("Blade Shell", "刃甲").replaceAll("unclaimed — claim it to awaken your Linggen", "尚未取得——取得后觉醒灵根")
    .replaceAll("Refinements", "淬炼").replaceAll("Transformations", "蜕变").replaceAll("Mastery", "精通")
    .replaceAll("Tribulation", "天劫")
    .replaceAll("Breakthrough", "突破")
    .replaceAll("complete", "完成").replaceAll("Foundation Growth", "根基成长").replaceAll("Total", "累计")
    .replaceAll("Strong", "上等").replaceAll("Medium", "中等").replaceAll("Weak", "下等")
    .replaceAll("SKILL 1 · ACTIVE", "术法一 · 已启用").replaceAll("SKILL 2 · ACTIVE", "术法二 · 已启用")
    .replaceAll("SKILL 2 · UNLOCKS RANK 10", "术法二 · 十重解锁").replaceAll("PASSIVE", "被动").replaceAll("RESOURCE", "资源")
    .replace(/^Sealed\. /, "尚未解锁。")
    .replace(/^Replace /, "替换 ").replace(/ found$/, " 已发现")
    .replace(/^Continue to /, "继续前往 ").replace(/^Break through into /, "突破至 ")
    .replace(/ mastery reaches 重 ([0-9]+)\./, "精通达到第 $1 重。")
    .replace(/ Mastery 重 ([0-9]+)/, " · 精通第 $1 重")
    .replace(/ stirs within your meridians\.$/, "在你的经脉中苏醒。")
    .replace(/ attunes to you\.$/, "与你完成认主。")
    .replace(/ supplants (.+)\.$/, "替换了$1。")
    .replace(/ circulates through your meridians\.$/, "开始在你的经脉中运转。")
    .replace(/ mastery deepens\.$/, "的精通更进一步。")
    .replace(" Integrated automatically without interrupting combat: ", " 战斗未被打断，自动融入：")
    .replace(/ ([0-9]+) ordinary refinement settles without interrupting combat\.$/, " 战斗未被打断，并完成 $1 项常规淬炼。")
    .replace(/ ([0-9]+) ordinary refinements settle without interrupting combat\.$/, " 战斗未被打断，并完成 $1 项常规淬炼。")
    .replace(/ begins\.$/, "开始。")
    .replace(/^Foundation settles into /, "根基稳固，迈入");
  result = result
    .replace(/^MASTERY RANK ([0-9]+)$/, "精通第 $1 重")
    .replace(/^RANK ([0-9]+) · FULLY MASTERED$/, "第 $1 重 · 精通圆满")
    .replace(/^(.+) pressure deepens without breaking the flow\.$/, "$1根基压力加深，修行流转不息。")
    .replace(/^(.+) Chuqi begins\.$/, "$1初期开始。")
    .replace(/^HEAVENLY TRIBULATION · ([0-9]+)\/3$/, "天劫 · $1/3");
  return runtimeExactZh[result] ?? result;
}

function collectChineseStrings(value: unknown, result: string[]): void {
  if (typeof value === "string") {
    result.push(value);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const child of Object.values(value)) collectChineseStrings(child, result);
}

export function getChineseFontPreloadText(): string {
  const values: string[] = [];
  collectChineseStrings(zhGongfa, values);
  collectChineseStrings(zhLinggen, values);
  collectChineseStrings(zhTreasures, values);
  collectChineseStrings(zhStages, values);
  collectChineseStrings(zhEffects, values);
  collectChineseStrings(zhTerms, values);
  collectChineseStrings(categoryNames, values);
  collectChineseStrings(zhMasteryDrafts, values);
  collectChineseStrings(zhMasteryOverrides, values);
  collectChineseStrings(runtimeExactZh, values);
  [
    "Lianqi pressure deepens without breaking the flow.",
    "Lianqi Chuqi begins.",
    "Cleanup complete. Lianqi Chuqi is ready to advance.",
    "Lianqi Dayuanman clears. Its concluding Tribulation rises.",
    "Lightning Judgment clears. The tribulation deepens.",
    "Complete the Lianqi Tribulation and open the next Gongfa slot.",
    "Continue to zhongqi",
    "Continue to Lightning Judgment",
    "Yujian Jue mastery reaches Rank 3. 2 ordinary refinements settle without interrupting combat.",
    "MASTERY RANK 10",
    "RANK 10 · FULLY MASTERED",
    "Evade: Ready",
    "Foundation Growth Total",
    "SKILL 2 · UNLOCKS RANK 10",
    "HEAVENLY TRIBULATION · 1/3",
    "Replace Jade Heart Pendant",
    "Fire Linggen stirs within your meridians."
  ].forEach((source) => collectChineseStrings(localizeZhRuntimeText(source), values));
  upgradeConfigs.forEach((item) => collectChineseStrings(localizeUpgrade("zh-CN", item.id), values));
  masteryTransformationConfigs.forEach((item) => collectChineseStrings(localizeMasteryChoice("zh-CN", item.id), values));
  return values.join("");
}

function localizeChoiceOption(locale: Locale, option: ChoiceOption): ChoiceOption {
  if (option.kind === "gongfa" && option.id in gongfaConfigs) {
    const id = option.id as GongfaId;
    const gongfa = localizeGongfa(locale, id);
    const speed = /Mastery Speed: (Slow|Normal|Fast)/.exec(option.description)?.[1];
    return { ...option, title: gongfa.name, description: `${gongfa.lore} 精通速度：${speed ? localizeTerm(locale, speed) : "正常"}。` };
  }
  if (option.kind === "mastery") {
    const choice = localizeMasteryChoice(locale, option.id);
    return {
      ...option,
      title: choice.name,
      description: choice.playstyle
        ? `${choice.gain === choice.lore ? "" : `${choice.lore} · `}收益：${choice.gain} · 代价：${choice.cost} · 灵宝：${choice.treasureInteraction}`
        : choice.lore,
      playstyle: choice.playstyle,
      gain: choice.gain,
      cost: choice.cost,
      scope: choice.scope,
      treasureInteraction: choice.treasureInteraction
    };
  }
  if (option.kind === "spirit-treasure-replace") {
    const treasure = localizeSpiritTreasure(locale, option.id as SpiritTreasureId);
    const localizeDelta = (value: string | undefined) => {
      if (!value) return "无";
      const match = /^([+-][0-9.]+) ([A-Za-z]+)$/.exec(value);
      return match ? `${match[1]} ${localizeTerm(locale, match[2])}` : value;
    };
    const gained = option.resonanceGained?.map((seal) => localizeTerm(locale, seal)) ?? [];
    const lost = option.resonanceLost?.map((seal) => localizeTerm(locale, seal)) ?? [];
    const parts = [
      `收益：${localizeDelta(option.gain)}`,
      `代价：${localizeDelta(option.loss)}`,
      ...(gained.length ? [`激活共鸣：${gained.join("、")}`] : []),
      ...(lost.length ? [`失去共鸣：${lost.join("、")}`] : []),
      ...(option.mechanicsGained?.map((effect) => `获得机制：${localizeRuntimeText(locale, effect)}`) ?? []),
      ...(option.mechanicsLost?.map((effect) => `失去机制：${localizeRuntimeText(locale, effect)}`) ?? [])
    ];
    return { ...option, title: `替换 ${treasure.name}`, description: parts.join(" · ") };
  }
  return { ...option, title: localizeRuntimeText(locale, option.title), description: localizeRuntimeText(locale, option.description) };
}

export function localizeChoicePayload(locale: Locale, payload: ChoicePayload): ChoicePayload {
  return getContentAdapter(locale)?.choicePayload?.(payload) ?? payload;
}

function localizeZhChoicePayload(payload: ChoicePayload): ChoicePayload {
  const locale = "zh-CN" as const;
  const options = payload.options.map((option) => localizeChoiceOption(locale, option));
  let title = localizeRuntimeText(locale, payload.title);
  let subtitle = payload.subtitle ? localizeRuntimeText(locale, payload.subtitle) : undefined;
  if (payload.options[0]?.kind === "gongfa") {
    const linggenId = (Object.keys(linggenConfigs) as LinggenId[]).find((id) => payload.title.includes(linggenConfigs[id].name));
    title = linggenId ? `${localizeLinggen(locale, linggenId).name}觉醒` : "灵根觉醒";
    if (linggenId) subtitle = localizeLinggen(locale, linggenId).lore;
  } else if (payload.options[0]?.kind === "mastery") {
    const choice = getMasteryChoiceDefinition(payload.options[0].id);
    const gongfaId = choice?.requiredGongfaIds?.[0];
    const rank = /Rank ([0-9]+)/.exec(payload.title)?.[1] ?? choice?.milestoneRank ?? "";
    title = gongfaId ? `${localizeGongfa(locale, gongfaId).name} · 精通第 ${rank} 重` : "功法精通";
  }
  return { ...payload, title, subtitle, options };
}

registerContentAdapter("zh-CN", {
  term: (value) => zhTerms[value] ?? value,
  buildSynergy: localizeZhBuildSynergy,
  gongfa: localizeZhGongfa,
  gongfaPackage: localizeZhGongfaPackage,
  linggen: (id) => ({ ...linggenConfigs[id], ...zhLinggen[id] }),
  spiritTreasure: (id) => ({ ...getSpiritTreasureConfig(id), ...zhTreasures[id] }),
  stage: (id) => ({ ...stageConfigs[id], ...zhStages[id] }),
  upgrade: localizeZhUpgrade,
  masteryChoice: localizeZhMasteryChoice,
  runtimeText: localizeZhRuntimeText,
  choicePayload: localizeZhChoicePayload
});
