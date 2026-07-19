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
    name: "赤炉剑法", lore: "以众生为炉位，以赤针为炉脉；脉成则火自炉心传遍全网。", combatRole: "在多个活体之间锻成可见炉网，再从炉压最高的核心依线点燃。", visualMotif: "实体赤红身炉纹、明亮炉脉、分叉回路与由芯至缘的逐节点点火。",
    skill1: { name: "炉心飞针", description: "自动优先刺入未埋针的威胁与能延长炉网的目标；精英与首领可承载多枚炉位。" },
    passive: { name: "熔炉压势", resource: "炉压", description: "炉压仅由同时存在的活体炉位、连线、分叉与回路即时计算；目标死亡或距离断开便立刻消失。" },
    skill2: { name: "炉火连铸", description: "活体炉位与炉压足够时点燃全部相连炉网，每枚被消耗的飞针重铸一次，并且最多再引发一轮追链。" }
  },
  "blazing-feather-art": {
    name: "烈羽诀", lore: "凝聚烈火灵气，化作追魂炎羽。", combatRole: "逐步增强的追踪齐射，最终化作漫天烈羽。", visualMotif: "橙红羽扇、余烬微光与凤凰垂翼般的火雨。",
    skill1: { name: "烈焰飞羽", description: "炎羽追击附近敌人，并随余烬积累而增加数量。" },
    passive: { name: "烬火羽衣", resource: "余烬", description: "飞羽命中点燃余烬，持续提升伤害与羽数，直至热力消散。" },
    skill2: { name: "天羽焚阵", description: "多轮炎羽落向最密集的敌群，并继续追索幸存目标。" }
  },
  "burning-ring-scripture": {
    name: "焚轮经", lore: "旋焰缺轮随身而行，以近险养热，以满阳守身。", combatRole: "有真实缺口的近身实体日轮；维持不同敌人在危险带内才能蓄热。", visualMotif: "金赤实体焰段、醒目暗隙与短暂闭合的护体日冕。",
    skill1: { name: "旋焰缺轮", description: "实体焰段随修士转动，只有焰段接触造成伤害，清晰可见的缺口完全无伤。" },
    passive: { name: "燃脉热力", resource: "热力", description: "危险带内每个不同敌人独立供热；重复命中无效，离开近险会迅速冷却。" },
    skill2: { name: "日耀护轮", description: "满热且近身有敌时短暂闭合全部缺口，免疫伤害、焚除近处敌术并推开敌人，结束后耗尽热力。" }
  },
  "scarlet-wave-manual": {
    name: "赤浪真诀", lore: "左潮留痕，右潮映月；两面真交，方生熔缝。", combatRole: "先保留一面左月潮，再施镜像右月潮；只有两片真实波面相交才生成第三条移动熔缝。", visualMotif: "左右可分辨的赤月波面、只在交点生成的亮金熔缝与对岸巨潮。",
    skill1: { name: "赤月双潮", description: "先施并保留左潮，再施镜像右潮；波面分离或首潮过期都会令合流失败。" },
    passive: { name: "阴阳合流", resource: "配对状态", description: "只显示待左潮、待右潮、合流成功三态；普通命中与重复目标均不增长。" },
    skill2: { name: "落日分潮", description: "三次合流后，两面巨潮从战场对岸压向最近熔缝，并一次引爆整条会合线。" }
  },
  "drifting-frost-needle": {
    name: "游霜针", lore: "水气凝寒成针，循隙追击弱处。", combatRole: "寒针精准追索，并逐渐扩展覆盖与贯穿压力。", visualMotif: "青蓝针星、冰晶闪光与霜白轨迹。",
    skill1: { name: "游霜寒针", description: "寒针弯折追向破绽，并随霜意积累增强贯穿。" },
    passive: { name: "凝霜", resource: "霜意", description: "寒针命中积累霜意，增加伤害与针数，直至寒意散去。" },
    skill2: { name: "镜针星阵", description: "环绕星阵分批射出霜针覆盖近敌，并重新锁定倒下目标。" }
  },
  "black-tide-scripture": {
    name: "玄潮经", lore: "观一界月潮，以顺逆行止改写退、静、涨三相潮历。", combatRole: "全场潮历控场，玩家移动只改变世界潮相的快慢，不瞄准任何局部中心。", visualMotif: "贯穿战场的四向玄水带、潮向罗盘与边界泄洪。",
    skill1: { name: "天地潮历", description: "可见四向潮历依次令退潮退向源岸、静水定驻、涨潮水墙自源岸横渡全场。" },
    passive: { name: "月引潮序", resource: "潮相", description: "顺流加快潮历，逆流拖慢潮历；每完成一轮，天地潮向反转。" },
    skill2: { name: "洪潮敕令", description: "完成三轮潮历后锁定全局流向，使普通敌人保持相对位置一同冲向泄洪边界。" }
  },
  "ice-mirror-guard": {
    name: "冰镜护体", lore: "六合镜面各守一方，受击而裂，涉险方能补全。", combatRole: "六面有限方向镜片真实拦截来袭；镜片会碎，必须在近险闪避中修复。", visualMotif: "六面青蓝琉璃、真实角向缺口、逐层裂纹与短暂闭合的冰莲。",
    skill1: { name: "六合冰镜", description: "六面实体镜片只拦截其所在方向的攻击，完整镜片全挡一次并沿来向反射，缺口与碎镜均不能阻挡。" },
    passive: { name: "寒镜修复", resource: "完整镜片", description: "只有近身危险中的闪避修复一面镜片；远处闪避、攻击和造成伤害均不会修复。" },
    skill2: { name: "冰莲镜甲", description: "完整镜片足够且近险将至时闭合成全向冰莲，记录来袭方向，结束后沿原方向反射并使参与镜片全部碎裂。" }
  },
  "green-vine-art": {
    name: "青藤诀", lore: "木气化生灵藤，循敌缠击不休。", combatRole: "追踪藤鞭不断分枝，织成脉动根网。", visualMotif: "碧玉藤弧、荆棘节点与发光根脉。",
    skill1: { name: "寻敌灵藤", description: "活藤弯折追向近敌，并随藤势积累增强鞭击。" },
    passive: { name: "徐生藤势", resource: "藤势", description: "灵藤命中积累藤势，增加藤鞭数量与力量。" },
    skill2: { name: "碧根灵网", description: "扎根目标牵出分枝藤脉，脉动攻击近敌并寻找新的宿主。" }
  },
  "verdant-ring-scripture": {
    name: "碧环经", lore: "根定其形，叶行其势，棘断其果。", combatRole: "按玩家静止、移动与闪避自动书写根、叶、棘；最近三符依次决定形状、运动和结算。", visualMotif: "方根印、叶脉路线、三角棘纹与组合成形的翠玉三环。",
    skill1: { name: "三生符环", description: "定时采样行为：近乎静止写根，持续移动写叶，刚刚闪避优先写棘；三符齐备后自动施术。" },
    passive: { name: "三环道序", resource: "符序", description: "首符定形，次符定势，末符定果；界面公开队列、下一符规则与施术预览。" },
    skill2: { name: "萌阳开界", description: "精确写成根→叶→棘时，在当前位置依次展开定域之根、扫径之叶与一次棘阳爆发，随后全数消失。" }
  },
  "ironwood-wave-form": {
    name: "铁木浪形", lore: "静立筑垒，移步推城，以年轮稳定驾驭整面铁木墙。", combatRole: "停止移动后朝最密威胁筑起实体木垒，再以移动将成熟墙体连根推出。", visualMotif: "方整木梁、清晰年轮、敞开墙角与整墙推进。",
    skill1: { name: "铁木壁垒", description: "静止时朝最密威胁筑起可破坏木墙；稳定足够后移动会将墙体推出，过早移动则枯散。" },
    passive: { name: "年轮稳定", resource: "稳定", description: "只在活墙后静止时增长，推墙时全部消耗；命中与其他木系功法均不能补充。" },
    skill2: { name: "铁木城寨", description: "三次高稳定推墙后立起四面可破坏墙，墙角保持通行，余墙随后向外推出并清空建造记录。" }
  },
  "nine-sun-calamity-seal": {
    name: "九阳劫印", lore: "预断来位，定印不移；九兆归一，一日坠天。", combatRole: "自动预判高威胁或密集敌群的未来地面，固定长警示太阳印，并承担敌人逃离后的真实落空风险。", visualMotif: "固定同心日印、收缩明亮中心、九层可见日兆与归一凝日冲击。",
    skill1: { name: "坠阳劫印", description: "预判未来敌位并固定可见地印，长延迟后落下一次中心加权冲击，承诺后绝不追踪。" },
    passive: { name: "阳极", resource: "阳极", description: "只有未在蓄印或坠落时才增长阳极；冲击时无论命中或落空都会消耗。" },
    skill2: { name: "九阳归一", description: "九枚日兆齐备后固定九层巨印，将全部日兆凝为一次中心重击，不留下火场。" }
  },
  "mist-wraith-canon": {
    name: "雾灵真典", lore: "召雾为灵，随身巡游，寒潮猎敌。", combatRole: "召唤雾灵自主索敌，以连续寒击压制并侵蚀敌群。", visualMotif: "淡青魂灯、流雾长尾与层叠水纹。",
    skill1: { name: "雾灵侍从", description: "召唤环身水灵，各自寻找猎物并连续射出寒雾灵弹。" },
    passive: { name: "幽潮灵契", resource: "灵契", description: "雾灵命中加深灵契，增加召唤数量并强化自主齐射。" },
    skill2: { name: "百鬼夜潮", description: "召来强化雾灵列阵巡游，以追踪寒弹覆盖整片战场。" }
  },
  "heavenfall-body-art": {
    name: "天坠锻体术", lore: "行身如星，直进聚质，循势坠天。", combatRole: "持续移动自动化为坠星身，以不中断的行进方向积累陨星质量，并沿当前航向自动落地。", visualMotif: "随质量扩张的金属星体、压缩行迹、落点预示线与星槊、天坑、返星三种终击。",
    skill1: { name: "坠星身", description: "临敌持续移动会暂化坠星身；身体穿过普通敌人时按目标独立冷却造成碰撞伤害。" },
    passive: { name: "陨星质量", resource: "质量", description: "不间断直行增长质量；停步、急转与硬碰撞会损失质量，命中本身不增长。" },
    skill2: { name: "碎星天坠", description: "质量圆满或形态到期时短暂升空；期间仅以普通移动有限修正可见落点，随后坠落并消耗全部质量。" }
  },
  "thousand-root-formation": {
    name: "万根寄命经", lore: "寄一根于一命，以宿主存亡养成根脉传承。", combatRole: "寄生控场，维持有限活体根脉成熟，并借宿主死亡完成一脉一传。", visualMotif: "宿主体内翠种、破体根枝与爬行汇合的根母。",
    skill1: { name: "寄命根种", description: "将一条有限根脉植入合适的活体宿主；只有宿主存活时间能令其成长。" },
    passive: { name: "一脉一传", resource: "活体根脉", description: "宿主死亡只释放一枚种子转投另一活体；过早死亡会重置成熟度。" },
    skill2: { name: "万根同祖", description: "令至少四条寄生根破体而出，沿宿主决定的路线爬行，并一次汇成根母。" }
  },
  "flame-demon-body-art": {
    name: "炎魔锻体术", lore: "熔血为炉，怒火铸身。", combatRole: "贴身猛攻，以连拳与反震积怒，终以炎爆重击收式。", visualMotif: "血红炉拳、魔角炎弧与焦黑震环。",
    skill1: { name: "炉血连式", description: "连续施展近身炎拳，最终以大范围重击点燃余敌。" }, passive: { name: "魔心反势", resource: "怒势", description: "近战与反震积累怒势，强化下一轮连式。" }, skill2: { name: "修罗焚世", description: "化身修罗，以连续贴身爆拳焚尽周遭敌群。" }
  },
  "vermilion-bird-covenant": {
    name: "朱雀灵契", lore: "独契一羽朱雀，以险飞与安归养成同一性命。", combatRole: "护持唯一朱雀完成出击与返巢；它有独立生命，倒下后会失去凤契。", visualMotif: "唯一朱红鸟影、出返羽路、生命契环与实体涅槃卵。",
    skill1: { name: "独契朱雀", description: "同一只活体朱雀受普通移动方向引导自主俯冲；返航不会瞬移，必须沿真实路线活着重聚后才能增长凤契或再次出击。" },
    passive: { name: "凤契", resource: "契合", description: "只有危险出飞后安全归返才能增长凤契；命中本身不增长，倒下则清空。" },
    skill2: { name: "朱雀涅槃", description: "凤契圆满时发动终末俯冲并化为一枚可受伤的卵，成功孵化仍是同一只朱雀。" }
  },
  "frozen-river-formation": {
    name: "冰河伏阵", lore: "封寒流于地脉，待敌入阵。", combatRole: "以持久冰阵封锁追路，层叠寒脉反复控场伤敌。", visualMotif: "冰裂河道、霜白水结与蓝白寒潮。",
    skill1: { name: "冰下缚阵", description: "在敌路种下冰河印，苏醒后反复迸发寒潮。" }, passive: { name: "凛冬暗流", resource: "寒霜", description: "困敌积累寒霜，扩大并延长后续伏阵。" }, skill2: { name: "冰河囚界", description: "以相连冰脉封锁广域，依序破冰迸发。" }
  },
  "moonfall-tide-ritual": {
    name: "月坠潮仪", lore: "悬月不坠，引众生绕渊成朔。", combatRole: "缓慢拖动一轮滞后的悬月；敌人只有实际绕月运行才积累合朔，拖行过快会被甩脱。", visualMotif: "滞后的靛色月盘、清晰轨道、环行敌影与三种截然不同的终式。",
    skill1: { name: "悬月引潮", description: "悬月在最密敌群处成形并滞后跟随，附近敌人沿真实轨道运行，固定时间后自动结算。" }, passive: { name: "深渊合朔", resource: "合朔", description: "只计算仍在轨敌人完成的实际角运动；命中与等待均不增长，逃脱会失去未成周天。" }, skill2: { name: "无月蚀界", description: "三次高合朔结算后，巨月随身缓行并悬停敌人，最终把其原有速度弯向月心一次。" }
  },
  "sword-burial-formation": {
    name: "葬剑伏阵", lore: "藏万剑于土，闻敌而鸣。", combatRole: "沿敌路埋设剑冢，以反复破土剑潮惩罚闯阵之敌。", visualMotif: "半埋金剑、墓印与升腾剑环。",
    skill1: { name: "埋剑阵", description: "在行路处布下剑冢，阵势共鸣时反复破土。" }, passive: { name: "墓剑共鸣", resource: "共鸣", description: "困敌加深共鸣，增加并强化后续剑冢。" }, skill2: { name: "万剑陵", description: "化广域为剑陵，埋剑相连，连绵升起。" }
  },
  "heaven-sundering-edict": {
    name: "断天敕令", lore: "先书一笔，再敕同痕；留于线者，方受全判。", combatRole: "自动选择威胁线完成一次物理书写，将其固定在世界坐标，延迟后由法术裁决原样重写。", visualMotif: "细金物理敕线、完全重合的白色法术复判与保留线章。",
    skill1: { name: "断天一笔", description: "自动书写最佳敌线并固定；延迟法术在同一坐标复判，敌人必须仍在线上才受完整裁决。" }, passive: { name: "裁决天命", resource: "天命", description: "只有同一目标同时受物理书写与法术复判才增长天命，并记录该线质量。" }, skill2: { name: "无上断天令", description: "天命圆满时，将保留敕线延伸至战场边界，并按原方向完成两段裁决。" }
  },
  "myriad-beast-grove": {
    name: "万兽灵林", lore: "一豕、一狐、一鹿，各司其猎，同契一林。", combatRole: "维持固定三兽猎群，让独立存活、各司其职的灵兽共同助攻同一场击杀。", visualMotif: "岩豕、灵狐、青鹿三种清晰兽影，物种印记、猎阵路线与一次显化的巨祖灵。",
    skill1: { name: "三兽猎群", description: "移动时派出岩豕、灵狐、青鹿执行不同狩猎职责；停步或闪避只会召回这支独立存活的猎群，不会发动攻击。" }, passive: { name: "荒林同契", resource: "亲缘", description: "不同存活物种共同助攻一次击杀才增长亲缘；三兽齐印还会治疗猎群。" }, skill2: { name: "万兽祖庭", description: "亲缘圆满时，当前每个存活物种各唤出一尊巨型祖灵完成一次不同的本命行动，随后消散。" }
  },
  "ancient-tree-body-art": {
    name: "古木锻体术", lore: "止步生根，以岁月为轮，身化参天古木。", combatRole: "临敌静止后扎根，以扎根时间生长年轮，并用根域、枝区、树冠三层自动攻势取代普通连击。", visualMotif: "可数年轮、依序占据的枝区、外层树冠与唯一不动的世界树主干。",
    skill1: { name: "古木身", description: "危险附近静止会自动扎根；只有扎根时间能生长年轮并扩张根、枝、冠三层攻势。" }, passive: { name: "生长年轮", resource: "年轮", description: "命中、击杀与受伤均不增长年轮；移动会开始可见拔根，成功拔根后年轮归零。" }, skill2: { name: "世界树化身", description: "年轮圆满后化为限时不可移动的世界树主干，结束时强制恢复行动并失去全部年轮。" }
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
  summon: "召唤", melee: "近战", trap: "伏阵", ritual: "术式", ailment: "异常", reflect: "反震",
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
    .map((item, index) => zhMasteryOverrides[item.id]?.name ?? zhMasteryDrafts[item.id]?.name ?? `${gongfaName}·同阶蜕变${index + 1}`)
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
  const usesAuthoredSpecialRules = source.gain === source.lore || override?.gain !== undefined;
  const specialImpact = usesAuthoredSpecialRules
    ? {
        playstyle: name,
        gain: override?.gain ?? lore,
        cost: override?.cost ? `${override.cost}；${opportunityCost}` : opportunityCost,
        scope: override?.scope ?? (source.milestoneRank === 3
          ? /Evade/.test(source.lore)
            ? `闪避与「${packageInfo?.skill1.name ?? "初式"}」`
            : `「${packageInfo?.skill1.name ?? "初式"}」形态与命中方式`
          : source.milestoneRank === 6
            ? `心法「${packageInfo?.passive.name ?? "心法"}」（${packageInfo?.passive.resource ?? "资源"}）循环`
            : /Evade/.test(source.lore)
              ? `闪避与${packageInfo?.passive.resource ?? "心法资源"}终式`
              : `「${packageInfo?.skill1.name ?? "初式"}」与${packageInfo?.passive.resource ?? "心法资源"}终式`),
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
  "lone-great-rampart": {
    "name": "独木巨垒",
    "lore": "木墙更窄、更坚固，直推更强，但两侧暴露。"
  },
  "linked-timber-palisade": {
    "name": "连城木栅",
    "lore": "木栅更宽但更脆，推进缓慢且伤害较低。"
  },
  "living-root-curved-wall": {
    "name": "活根曲墙",
    "lore": "缓慢筑起正面弧墙，移动时向外分裂而非直推。"
  },
  "deep-age-root": {
    "name": "岁木深根",
    "lore": "扎根与拔根更慢，换取更高的时间稳定与耐久。"
  },
  "enemy-pressed-forest": {
    "name": "众敌压林",
    "lore": "稳定只由压迫墙体的不同敌人提供，静止时间本身不再增长。"
  },
  "living-root-relocation": {
    "name": "活根移垒",
    "lore": "可缓慢带墙移位，但移动时稳定衰减且上限降低。"
  },
  "unbroken-iron-city": {
    "name": "不破铁城",
    "lore": "墙体更长更耐久，但推进伤害与推力显著降低。"
  },
  "mountain-collapse-timber-array": {
    "name": "崩山木阵",
    "lore": "推进更快更猛烈，但静止墙体非常脆弱。"
  },
  "walking-city": {
    "name": "行城移岳",
    "lore": "推出的墙会短暂跟随移动方向，但推力降低。"
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
  "rebounding-edge-armor": {
    "name": "回弹锋甲",
    "lore": "每次近身减伤都会立刻反弹部分力道，但留存在守势中的力道更少。"
  },
  "hundred-forged-heavy-armor": {
    "name": "百炼重甲",
    "lore": "提高减伤与守势上限，但移速降低且破甲恢复更慢。"
  },
  "flowing-gold-vent": {
    "name": "流金卸甲",
    "lore": "溢出的守势会安全散去而不破甲，但守势上限更低。"
  },
  "immovable-mountain": {
    "name": "不动如山",
    "lore": "静止时提高守势上限与减伤，移动时安全卸去临时容量。"
  },
  "flowing-gold-turn": {
    "name": "流金转身",
    "lore": "闪避将部分守势转为短暂减伤层，因此最终释放的力道更少。"
  },
  "armor-remembers-enemy": {
    "name": "刻甲识敌",
    "lore": "连续承受同一来源的近身攻击会逐渐适应，换敌即重置且储力更少。"
  },
  "eight-wastes-rebound": {
    "name": "八荒震甲",
    "lore": "将守恒的总力道分配给最多八名近敌，敌人数不会复制总伤害。"
  },
  "one-edge-breaks-mountain": {
    "name": "一锋破岳",
    "lore": "将全部守恒力道集中斩向一名近身优先目标。"
  },
  "unbroken-golden-city": {
    "name": "金城不坏",
    "lore": "将全部守恒力道化为临时护盾，不造成伤害。"
  },
  "counter-rotating-twin-rings": {
    "name": "双轮逆转",
    "lore": "内外两道弱轮逆向转动，交点灼伤更强，但非交点伤害下降。"
  },
  "furnace-heart-lone-ring": {
    "name": "熔心孤轮",
    "lore": "只保留两段缓慢重焰，单段伤害大增，同时留下巨大缺口。"
  },
  "wandering-luminary-rings": {
    "name": "游曜错环",
    "lore": "日轮在内外危险带间交替，每次换轨都会短暂停转。"
  },
  "banked-sun": {
    "name": "藏阳守轮",
    "lore": "热力达到一半后不再跌破五十，但上限降至七十八，无法形成满热护轮。"
  },
  "myriad-enemies-as-furnace": {
    "name": "众敌为炉",
    "lore": "不同普通敌人供热更强，精英与首领供热很弱。"
  },
  "lone-true-sun": {
    "name": "独镇真阳",
    "lore": "精英与首领供热更强，普通敌人供热很弱。"
  },
  "perfect-sun-consumption": {
    "name": "完阳蚀火",
    "lore": "高热时闭合全部轮位，但维持完整日轮会持续消耗热力。"
  },
  "sunspot-lure": {
    "name": "黑子纳敌",
    "lore": "扩大缺口并减速入隙敌人，随后捕获它的焰段造成重伤。"
  },
  "reverse-wheel-reflection": {
    "name": "逆轮回照",
    "lore": "闪避消耗十八热力并逆转现有日轮，不会生成额外攻击。"
  },
  "falling-star-forge": {
    "name": "星火落炉",
    "lore": "旧爆点旁锻出一次性地面炉位。"
  }
};

const zhMasteryOverrides: Record<string, { name: string; lore?: string; gain?: string; cost?: string; scope?: string }> = {
  "searing-feathers": { name: "炽羽凝锋" },
  "swift-molt": { name: "疾羽蜕生" },
  "banked-embers": { name: "蕴火余烬" },
  "phoenix-ascendant": { name: "凤羽升华" },
  "molten-updraft": { name: "熔火升流" },
  "lancing-crescent": { name: "贯日炎月" },
  "frost-cascade": { name: "凝霜连生" },
  "tide-crown": { name: "玄潮加冕" },
  "growth-crown": { name: "青藤华冠" },
  "growth-domain": { name: "荆棘生域" },
  "swift-bloom": { name: "瞬息花开" },
  "lone-great-rampart": { name: "独木巨垒" },
  "linked-timber-palisade": { name: "连城木栅" },
  "living-root-curved-wall": { name: "活根曲墙" },
  "deep-age-root": { name: "岁木深根" },
  "enemy-pressed-forest": { name: "众敌压林" },
  "living-root-relocation": { name: "活根移垒" },
  "unbroken-iron-city": { name: "不破铁城" },
  "mountain-collapse-timber-array": { name: "崩山木阵" },
  "walking-city": { name: "行城移岳" },
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
  "rebounding-edge-armor": { name: "回弹锋甲" },
  "hundred-forged-heavy-armor": { name: "百炼重甲" },
  "flowing-gold-vent": { name: "流金卸甲" },
  "immovable-mountain": { name: "不动如山" },
  "flowing-gold-turn": { name: "流金转身" },
  "armor-remembers-enemy": { name: "刻甲识敌" },
  "eight-wastes-rebound": { name: "八荒震甲" },
  "one-edge-breaks-mountain": { name: "一锋破岳" },
  "unbroken-golden-city": { name: "金城不坏" },
  "counter-rotating-twin-rings": { name: "双轮逆转", gain: "生成内外两道逆转日轮，交点追加伤害", cost: "每道日轮在非交点处伤害降低 28%", scope: "日轮层数、转向与分节接触" },
  "furnace-heart-lone-ring": { name: "熔心孤轮", gain: "只留两段重焰，单段伤害提高 85%", cost: "六个轮位只占两个，缺口显著扩大", scope: "日轮转速、覆盖与分节伤害" },
  "wandering-luminary-rings": { name: "游曜错环", gain: "日轮在 76 与 138 距离的危险带间交替", cost: "每次换轨有 250 毫秒无焰空档", scope: "日轮半径与持续时间" },
  "banked-sun": { name: "藏阳守轮", gain: "达到五十热力后最低保留五十", cost: "热力上限降至七十八，无法发动满热护轮", scope: "燃脉热力的下限与上限" },
  "myriad-enemies-as-furnace": { name: "众敌为炉", gain: "每个不同普通敌人的供热提高至 1.4 倍", cost: "精英仅供热 0.65 倍，首领仅供热 0.2 倍", scope: "不同敌人的热力权重" },
  "lone-true-sun": { name: "独镇真阳", gain: "精英供热 1.55 倍，首领供热 2.2 倍", cost: "普通敌人仅供热 0.2 倍", scope: "不同敌人的热力权重" },
  "perfect-sun-consumption": { name: "完阳蚀火", gain: "热力不低于七十二时闭合八个轮位", cost: "完整日轮每秒消耗十点热力", scope: "高热覆盖与持续消耗" },
  "sunspot-lure": { name: "黑子纳敌", gain: "入隙敌人减速，捕获焰段伤害提高 85%", cost: "八个轮位只保留三个", scope: "缺口、减速与下一次焰段接触" },
  "reverse-wheel-reflection": { name: "逆轮回照", gain: "闪避逆转全部现有日轮", cost: "每次逆转消耗十八热力，且不生成攻击", scope: "闪避与现有日轮转向" },
  "piercing-furnace-needle": { name: "贯炉重针", gain: "精英与首领可承载更多强炉位", cost: "炉脉距离短，难以铺开", scope: "炉位容量、连线距离与点火威力" },
  "scattered-furnace-needles": { name: "散炉布针", gain: "远距离铺设更宽炉网", cost: "至少六炉位且点火要求更高", scope: "目标分布、连线距离与点火门槛" },
  "volatile-furnace-core": { name: "易爆炉芯", gain: "三炉位即可低压点火", cost: "爆发弱且分叉稀少", scope: "点火门槛与传播威力" },
  "sealed-leftover-needle": { name: "封炉余针", gain: "埋针目标死亡后留下四秒弱炉位", cost: "余针弱且会消散", scope: "死亡地点与临时炉网" },
  "star-furnace-resonance": { name: "星炉共鸣", gain: "每炉位连接两个近邻，能形成分叉回路", cost: "点火伤害分流", scope: "连线度数、分叉、回路与伤害" },
  "compressed-furnace": { name: "压炉密铸", gain: "短炉脉高速传递强火", cost: "分散炉位不计入炉网", scope: "连线距离、有效拓扑与伤害" },
  "furnace-heart-reforge": { name: "炉心回铸", gain: "碎针追向尚未埋针的幸存目标", cost: "碎针较弱且需要新宿主", scope: "点火后的碎针选敌" },
  "myriad-edges-return": { name: "万锋归炉", gain: "全部碎针集中最强幸存者", cost: "不再扩散至新目标", scope: "点火后的碎针集中" },
  "falling-star-forge": { name: "星火落炉", gain: "旧爆点旁落下单次地面炉位", cost: "炉位固定且会消散", scope: "点火后的地面拓扑" },
  "life-seeking-fierce-wraith": { name: "索命厉魂" },
  "wandering-mist-host": { name: "游雾群鬼" },
  "lantern-returning-underworld-attendant": { name: "归灯冥侍" },
  "long-banner-soul-call": { name: "长幡招魂" },
  "tread-corpse-guide-soul": { name: "踏尸引魄" },
  "halt-lantern-keep-vigil": { name: "停灯守夜" },
  "hundred-ghosts-cross-river": { name: "百鬼横江" },
  "myriad-souls-ask-for-life": { name: "万魂问命" },
  "nether-river-funeral": { name: "冥河送葬" },
  "lone-grave-great-que": { name: "孤冢巨阙" },
  "collective-burial-sword-mound": { name: "合葬剑丘" },
  "field-path-sword-forest": { name: "阡陌剑林" },
  "rise-at-living-presence": { name: "见生即起" },
  "recognize-calamity-leave-sheath": { name: "识煞出鞘" },
  "seal-grave-treading-stars": { name: "踏罡封冢" },
  "gravefield-cuts-across": { name: "墓野横绝" },
  "myriad-edges-ask-the-leader": { name: "万锋问首" },
  "old-roads-return-the-soul": { name: "故道返魂" },
  "one-horn-army-breaker": { name: "独角破军" },
  "six-armed-yaksha": { name: "六臂夜叉" },
  "hungry-ghost-soul-pursuit": { name: "饿鬼逐魂" },
  "meridian-locking-heart-guard": { name: "锁脉护心" },
  "blood-debt-repaid-at-the-end": { name: "血债终偿" },
  "life-flame-without-return": { name: "命火无归" },
  "undying-asura": { name: "不灭修罗" },
  "world-burning-asura": { name: "焚世修罗" },
  "life-hunting-asura": { name: "猎命修罗" },
  "lone-bridge-final-crossing": { name: "独桥绝渡" },
  "three-ford-branching-flow": { name: "三津分流" },
  "curving-nether-river": { name: "回湾冥河" },
  "cold-debt-pursues-the-strong": { name: "寒债逐强" },
  "cold-debt-pursues-the-weak": { name: "寒债逐弱" },
  "cold-debt-migrates-afar": { name: "寒债远徙" },
  "all-guilty-share-the-cold": { name: "众罪同寒" },
  "collective-liability": { name: "连坐同伤" },
  "compensating-ferry": { name: "代偿轮渡" },
  "heart-piercing-killing-root": { name: "穿心杀根" },
  "body-borrowing-branch-root": { name: "借躯蔓枝" },
  "bone-locking-coiling-root": { name: "锁骨盘根" },
  "new-sprout-pursues-the-crowd": { name: "新芽逐众" },
  "old-root-seizes-a-body": { name: "老根夺舍" },
  "strong-seed-chooses-its-host": { name: "强种择主" },
  "many-mouths-devour-life": { name: "众口噬生" },
  "one-heart-strangles-life": { name: "独心绞命" },
  "wither-and-flourish-leave-a-seed": { name: "枯荣留种" },
  "azure-sea-withdraws-the-border": { name: "沧海退界" },
  "still-sea-mystic-mirror": { name: "静海玄镜" },
  "great-flood-presses-the-realm": { name: "洪涛压境" },
  "ride-the-tide": { name: "乘潮行舟" },
  "hold-the-moon-against-the-tide": { name: "逆潮留月" },
  "heaven-timed-tide": { name: "天时定潮" },
  "all-beings-share-the-flow": { name: "众生同流" },
  "mystic-water-anchors-the-realm": { name: "玄水镇界" },
  "dry-sea-splits-the-shore": { name: "枯海裂岸" },
  "crimson-feather-head-hunt": { name: "赤羽猎首" },
  "cinnabar-plume-guardian": { name: "丹翎护主" },
  "firewing-sweeping-formation": { name: "火翼掠阵" },
  "nurtured-covenant": { name: "温养灵契" },
  "blood-covenant-of-fire-bathing": { name: "浴火血契" },
  "paired-wing-flight": { name: "比翼同翔" },
  "urgent-ember-egg": { name: "烬卵急生" },
  "true-plume-nirvana": { name: "真羽涅槃" },
  "sacrifice-to-guard-the-master": { name: "舍身护主" },
  "mountain-lord-enters-the-grove": { name: "山君入林" },
  "black-tortoise-guards-the-grove": { name: "玄龟镇林" },
  "white-ape-calls-the-pack": { name: "白猿号群" },
  "two-beasts-aid-each-other": { name: "双兽相援" },
  "three-spirits-hunt-together": { name: "三灵会猎" },
  "unending-rotating-hunt": { name: "轮猎不息" },
  "ancestors-run-the-wild": { name: "群祖奔荒" },
  "ancestral-encirclement": { name: "祖灵围猎" },
  "ancestors-return-to-the-grove": { name: "祖林归巢" },
  "great-rooted-banyan": { name: "盘根古榕" },
  "iron-crowned-divine-tree": { name: "铁冠神木" },
  "spirit-fruit-fusang": { name: "灵果扶桑" },
  "one-ring-in-a-thousand-years": { name: "千年一轮" },
  "spring-flourishing": { name: "春荣催生" },
  "hollow-trunk-tribulation": { name: "空心渡劫" },
  "myriad-roots-cover-the-realm": { name: "万根覆界" },
  "one-tree-upholds-heaven": { name: "一木擎天" },
  "world-sheltering-canopy": { name: "庇世华盖" },
  "star-piercing-iron-body": { name: "贯星铁躯" },
  "heavenfall-giant-body": { name: "天陨巨身" },
  "wandering-star-light-body": { name: "游星轻身" },
  "no-return-advance": { name: "一往无回" },
  "iron-body-opens-the-road": { name: "铁躯开道" },
  "heaven-turning-pivot": { name: "回天转斗" },
  "mountain-piercing-star-lance": { name: "穿岳星槊" },
  "heavenfall-crater": { name: "天坑陨界" },
  "reverse-star-return": { name: "逆星回天" },
  "one-line-mountain-sundering": { name: "一线断岳" },
  "crossed-golden-edict": { name: "十字金章" },
  "swift-short-edict": { name: "疾书短令" },
  "lenient-record": { name: "宽赦留章" },
  "aggravated-judgment": { name: "重罪加刑" },
  "collective-sentence": { name: "连坐成狱" },
  "lone-heaven-scar": { name: "天痕独断" },
  "twin-edicts": { name: "双敕并书" },
  "heaven-moving-amendment": { name: "移天改诏" },
  "solitary-heavenly-judgment": { name: "独日天刑" },
  "twin-luminary-eclipse": { name: "双曜蚀界" },
  "swift-eclipse-calamity": { name: "迅蚀劫光" },
  "fixed-noon-sun": { name: "定午守阳" },
  "dark-sun-calamity": { name: "晦日养劫" },
  "unsetting-high-noon": { name: "极昼不落" },
  "center-forged-solar-soul": { name: "正中炼阳" },
  "myriad-beings-calamity": { name: "众生为劫" },
  "returning-afterglow": { name: "残照归天" },
  "scarlet-lance-tide": { name: "赤练穿潮" },
  "river-crossing-flame-moon": { name: "横江炎月" },
  "rolling-twin-tides": { name: "连潮催浪" },
  "after-tide-awaits-moon": { name: "余潮候月" },
  "misbanked-flying-arc": { name: "错岸飞虹" },
  "ruptured-burning-current": { name: "焚流决口" },
  "long-sunset-trace": { name: "落霞长痕" },
  "horizon-opposing-tides": { name: "天际对潮" },
  "reverse-scarlet-tide": { name: "赤浪倒卷" },
  "sea-suppressing-heavy-moon": { name: "沉月镇海" },
  "twin-moon-crossing": { name: "双月交潮" },
  "swift-moon-vessel": { name: "疾月行舟" },
  "still-sea-syzygy": { name: "静海留朔" },
  "myriad-currents-to-moon": { name: "万流朝月" },
  "mountain-weight-eclipse": { name: "重岳蚀心" },
  "returning-abyss-moon": { name: "归墟沉月" },
  "flying-star-release": { name: "飞星离潮" },
  "grand-yin-suspension": { name: "太阴悬界" },
  "three-enclosure-heavy-mirrors": { name: "三垣重镜", lore: "三面大镜各可承受两次攻击，反射更强，但方向缺口巨大。", gain: "三面大镜各可完整阻挡两次，反射伤害提高 55%", cost: "只覆盖三个方向且转速很慢，缺口显著扩大", scope: "镜片数量、耐久、宽度、转速与反射" },
  "thousand-facet-lotus": { name: "千棱莲镜", lore: "八面窄镜覆盖更多方向，但每面脆弱、转速慢且修复负担沉重。", gain: "镜片增至八面，可覆盖更多不同方向", cost: "每面只能阻挡一次，反射伤害降低 45%，全碎应急修复更慢", scope: "镜片数量、宽度、转速、反射与修复" },
  "flowing-light-mirrors": { name: "流光转镜", lore: "六镜高速轮转，闪避可逆转镜路，但反射威力下降。", gain: "六镜转速接近三倍，闪避会逆转旋转方向", cost: "所有反射伤害降低 32%", scope: "镜片转速、闪避逆转与反射" },
  "ice-heart-repair": { name: "冰心补镜", lore: "近险闪避一次修复两面镜片，但闪避更慢，下一次反射减弱。", gain: "一次近险闪避修复两面不同的受损镜片", cost: "闪避冷却延长 35%，下一次反射伤害减半", scope: "近险闪避、修复数量、冷却与下一次反射" },
  "shattered-mirror-frost": { name: "裂镜飞霜", lore: "镜片彻底碎裂时沿来袭方向射出三道飞霜。", gain: "镜片最后一点耐久破碎时释放三道方向飞霜", cost: "只有彻底碎裂触发，完整镜片的普通反射不增强", scope: "镜片碎裂与方向反射数量" },
  "lingering-reflection": { name: "残光续照", lore: "刚碎的镜片可再削减一次同方向攻击，随后彻底消散。", gain: "碎镜再将一次同方向伤害降低 50%", cost: "最后反射很弱，触发后该镜片彻底失效", scope: "碎镜方向、部分格挡与最后反射" },
  "flawless-lotus": { name: "无瑕莲华", lore: "六镜无缺方可结成持续最久的冰莲镜甲。", gain: "全镜完整时形成持续 2.2 秒的最长全向镜甲", cost: "缺少任何一面都不能发动，结束后参与镜片全部碎裂", scope: "冰莲镜甲的完整要求与持续时间" },
  "calamity-answering-broken-lotus": { name: "残莲应劫", lore: "三面以上残镜即可应劫结莲，持续时间随参与镜片而变。", gain: "至少三面完整镜片即可结甲，持续时间随参与数量增加", cost: "镜甲较短，记录方向的反射伤害降低 45%", scope: "冰莲镜甲的门槛、持续时间与反射" },
  "killing-shattered-mirror": { name: "破镜杀生", lore: "舍弃护持时长，将所有记录来向化作三重杀生飞霜。", gain: "每个记录方向返回三道高伤飞霜", cost: "全向保护仅持续 0.62 秒，结束后参与镜片全部碎裂", scope: "冰莲镜甲时长与记录方向杀伤" },
  "mountain-root-scripture": { name: "镇岳根书", lore: "更易以静止写出强根符，但叶符需要更长移动。", gain: "根符静止判定放宽，定域与护持增强", cost: "叶符需要更长移动距离", scope: "根/叶行为阈值与根符结算" },
  "green-wind-leaf-scripture": { name: "青风叶书", lore: "更易以移动写出疾叶符，但根符要求更彻底静止。", gain: "叶符移动判定提前，行进术式更快更强", cost: "根符静止判定收紧", scope: "叶/根行为阈值与叶符运动" },
  "calamity-step-thorn-scripture": { name: "劫步棘书", lore: "闪避后的棘符窗口与伤害扩大，但闪避恢复更慢。", gain: "棘符窗口延长，末位棘符伤害提高", cost: "闪避冷却延长 35%", scope: "闪避、棘符生成与棘符伤害" },
  "single-line-specialization": { name: "一脉专精", lore: "三枚同符时威力大增，混合符序则减弱。", gain: "三枚相同符的术式威力提高 55%", cost: "混合符序威力降低 28%", scope: "三符同类与混合序列" },
  "three-talents-concord": { name: "三才合契", lore: "根叶棘各一时威力大增，出现重复则减弱。", gain: "三枚各异符的术式威力提高 45%", cost: "含重复符的序列威力降低 28%", scope: "三符异类与重复序列" },
  "first-last-generation": { name: "首尾相生", lore: "首尾同符的甲乙甲序列弱重演一次，其他序列缩小。", gain: "甲→乙→甲序列额外弱重演一次", cost: "其他排列的威力与范围降低", scope: "首尾对称、重演次数与术式范围" },
  "earth-scripture-myriad-roots": { name: "地书·万根", lore: "强化末位根符的定域护持，代价是削弱棘符杀伤。", gain: "根符定域与护持显著增强", cost: "末位棘符伤害降低 32%", scope: "根符控制、护持与棘符伤害" },
  "heaven-scripture-thousand-leaves": { name: "天书·千叶", lore: "叶势增加弱重演并扫除敌术，代价是根符护持下降。", gain: "叶符运动额外弱重演，并清除路径内敌对术式", cost: "末位根符护持降低 35%", scope: "叶符重演、敌术清除与根符护持" },
  "thorn-scripture-hundred-calamities": { name: "荆书·百劫", lore: "末位棘符换取极高杀伤，同时舍弃根控与叶重演。", gain: "末位棘符伤害提高 65%", cost: "根符控制削弱，叶符不再重演", scope: "末位棘符杀伤与根叶功能" }
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
  "SKILL FORM": "术式分支",
  "PASSIVE PATH": "被动分支",
  "CAPSTONE PATH": "终极分支",
  "SECOND SKILL": "术法二",
  "SELECTED": "已选择",
  "UNSELECTED": "未选择",
  "AVAILABLE": "可选择",
  "FUTURE": "未解锁",
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
  "Stormfeather Calamity": "惊雷劫羽",
  "A thunder-crowned omen tests whether gathered Qi can endure.": "雷冠凶兆降世，检验初聚灵气能否承受天威。",
  "Gravebound Foundation": "镇基冥骸",
  "A ruined cultivator rises to crush an unsteady Dao foundation.": "陨落修士自冥土起身，要将未稳道基彻底碾碎。",
  "Ninefold Thunder Warden": "九重雷狱使",
  "A celestial executioner descends to shatter the newborn Golden Core.": "天刑使者降临，誓要击碎初成金丹。",
  "Heavenly Judgment Avatar": "天刑化身",
  "The first thunder seal takes form and hunts the Nascent Soul.": "第一重雷印化形，追猎初醒元婴。",
  "Myriad Calamity Sovereign": "万劫阴君",
  "The storm grows a will of its own and calls every shadow to judgment.": "雷海生出自身意志，召尽群影共赴天刑。",
  "Heaven-Rending Dao Eye": "裂天道眼",
  "The final eye opens as the last sanctuary collapses beneath it.": "终末道眼睁开，最后净域亦在其下崩塌。",
  "ENRAGED": "狂化",
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
  if (value === "Foundation Growth Total") return "根基成长累计";
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
  const bossEnraged = /^(.+) · ENRAGED$/.exec(value);
  if (bossEnraged) return `${localizeZhRuntimeText(bossEnraged[1])} · 狂化`;
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
  result = result.replace(/^(.+) TIANJIE$/, "$1天劫");
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
    const packageInfo = localizeGongfaPackage(locale, id);
    const speed = /Mastery Speed: (Slow|Normal|Fast)/.exec(option.description)?.[1];
    const localizedSpeed = speed ? localizeTerm(locale, speed) : "正常";
    return {
      ...option,
      title: gongfa.name,
      description: `${gongfa.lore} 精通速度：${localizedSpeed}。`,
      playstyle: packageInfo.combatRole,
      gain: packageInfo.skill1.name,
      scope: `${packageInfo.passive.name} · ${packageInfo.passive.resource}`,
      cost: `${localizedSpeed}精通`
    };
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
