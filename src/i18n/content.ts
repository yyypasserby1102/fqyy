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
    name: "御剑诀", lore: "以严整金气驾驭四柄实体飞剑。", combatRole: "管理有限剑匣与真实往返剑路；飞剑未归便无法再次出鞘。", visualMotif: "肩侧四剑、持续可见的往返剑路与交汇回锋。",
    skill1: { name: "御剑出鞘", description: "每轮自动分配一柄已归剑，越过目标后沿原路回匣；归匣前不可复用。" },
    passive: { name: "剑匣轮转", resource: "已归飞剑", description: "四剑依次负责最近、最健壮、最高威胁与最佳贯穿线目标；走位会改变分配。" },
    skill2: { name: "万剑归宗", description: "至少三剑在外时，所有飞剑立刻沿各自完整剑路逆返，交点再次斩击。" }
  },
  "jinfeng-gong": {
    name: "金锋功", lore: "以足下行迹为锋路，路不断则金风不绝。", combatRole: "持续走位自动在地面刻下锋痕；路线经营比朝向敌人更重要。", visualMotif: "金白地面锋痕、最近两秒的可见行迹与凝固成形的金风长廊。",
    skill1: { name: "行锋", description: "每移动一段距离便自动沿行迹落下地面斩；静止时仅有较弱的近身横斩。" },
    passive: { name: "罡风势", resource: "势能", description: "连续同向行进积累势能并记录约两秒路线；急转、折返或久停会失势。" },
    skill2: { name: "金风长廊", description: "势能满时，将最近行迹凝成持续切割的实体长廊，随后清空势能。" }
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
    name: "青藤诀", lore: "两极定藤，修士居中引索；势至则断，断处成结。", combatRole: "自动牵住两个端点，靠走位改变藤索几何并积累张力，再以藤结织成收缩天罗。", visualMotif: "一条明亮折形活藤、清晰张力、静止翠结与不断收紧的多边藤网。",
    skill1: { name: "两仪牵藤", description: "自动连接相对两侧的敌人；仅一敌时改连地形。修士作为滑轮走位拉伸，满张力后直线绷断。" },
    passive: { name: "青索张力", resource: "张力", description: "张力只取决于当前藤索几何；回到松弛位置会降张力，失去端点则准备全部作废。" },
    skill2: { name: "天罗藤界", description: "至少三枚藤结时闭合成多边天罗，边线持续收缩、切割并聚拢网内敌人，收尽后消耗全部藤结。" }
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
    name: "雾灵真典", lore: "循尸引魂，一灯一渡；魂尽则雾散。", combatRole: "绕行新鲜尸处收取有时限、有品阶的水魂；每枚魂只化作一次固定路线的实体雾灵渡行。", visualMotif: "尸处品阶魂灯、身后有限魂列、从场界入场的一次性青白送葬路。",
    skill1: { name: "有限雾灵", description: "消耗最旧的一枚水魂，沿已选目标形成一次实体渡行；无魂时只发出微弱引魂灯雾，帮助制造第一具尸体。" },
    passive: { name: "水魂", resource: "存魂", description: "普通、精英、首领尸体留下不同寿命与强度的魂；必须亲自经过尸处收取，命中不会生魂。" },
    skill2: { name: "百鬼夜渡", description: "至少四魂时，自动选择覆盖最佳的场界方向；全部存魂从边界各渡一次，并永久消耗。" }
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
    name: "炎魔锻体术", lore: "熔血为炉，以残躯铸不可返之魔身。", combatRole: "贴身自动连击；首式无偿，后三式依次燃烧当前生命，低血量会显露不同肢体与终式。", visualMotif: "逐段显现的炉拳、侧爪、炉心长击，以及不可逆的常驻双角修罗身。",
    skill1: { name: "炉血连式", description: "首击免费；继续近战会依次燃烧当前生命的 6%、8%、10%。离开近战或闪避会中止且不返还。" }, passive: { name: "残血魔相", resource: "生命区间", description: "生命越低，连式越完整；命中不积累资源，只有完整终击可以按规则返血。" }, skill2: { name: "阿修罗心", description: "生命低于 20% 且完整终击命中后，按所选法则永久化为修罗并锁定可恢复生命上限。" }
  },
  "vermilion-bird-covenant": {
    name: "朱雀灵契", lore: "独契一羽朱雀，以险飞与安归养成同一性命。", combatRole: "护持唯一朱雀完成出击与返巢；它有独立生命，倒下后会失去凤契。", visualMotif: "唯一朱红鸟影、出返羽路、生命契环与实体涅槃卵。",
    skill1: { name: "独契朱雀", description: "同一只活体朱雀受普通移动方向引导自主俯冲；返航不会瞬移，必须沿真实路线活着重聚后才能增长凤契或再次出击。" },
    passive: { name: "凤契", resource: "契合", description: "只有危险出飞后安全归返才能增长凤契；命中本身不增长，倒下则清空。" },
    skill2: { name: "朱雀涅槃", description: "凤契圆满时发动终末俯冲并化为一枚可受伤的卵，成功孵化仍是同一只朱雀。" }
  },
  "frozen-river-formation": {
    name: "冰河伏阵", lore: "债随众生行，越印方成河。", combatRole: "在自动推演的追路上留下无伤河印，以走位改变敌人追势；寒债者越过异印时才唤醒一次冰河并转债。", visualMotif: "圆形起河印、菱形渡河印、可见寒债牵线与静默闭合的蓝白囚界。",
    skill1: { name: "起河渡印", description: "在敌人当前处与预判追路上布下无伤河印；债主越过异脉渡印，才在两印之间爆发一次冰河并将寒债一对一转交。" }, passive: { name: "寒债流转", resource: "完成转债", description: "只有成功转债才推进绝学；命中、伤害与普通冻结都不能凭空生债。" }, skill2: { name: "冰河囚界", description: "三次转债后将至少三名现存债主连成静默闭网；囚界不会自行脉冲，债主穿过他人的债线才结算所选共命法则。" }
  },
  "moonfall-tide-ritual": {
    name: "月坠潮仪", lore: "悬月不坠，引众生绕渊成朔。", combatRole: "缓慢拖动一轮滞后的悬月；敌人只有实际绕月运行才积累合朔，拖行过快会被甩脱。", visualMotif: "滞后的靛色月盘、清晰轨道、环行敌影与三种截然不同的终式。",
    skill1: { name: "悬月引潮", description: "悬月在最密敌群处成形并滞后跟随，附近敌人沿真实轨道运行，固定时间后自动结算。" }, passive: { name: "深渊合朔", resource: "合朔", description: "只计算仍在轨敌人完成的实际角运动；命中与等待均不增长，逃脱会失去未成周天。" }, skill2: { name: "无月蚀界", description: "三次高合朔结算后，巨月随身缓行并悬停敌人，最终把其原有速度弯向月心一次。" }
  },
  "sword-burial-formation": {
    name: "葬剑伏阵", lore: "一尸葬一剑，一起空一坟。", combatRole: "把每个敌人的真实死亡位置化为一把有限墓剑；后来者踏入墓位时，剑只沿所记方向起飞一次。", visualMotif: "常驻半埋金剑、死亡方向横格、封冢外环、合葬剑丘与按埋葬次序相连的阡陌剑路。",
    skill1: { name: "送葬剑", description: "自动斩向首个受伤敌人的微弱终结线，本身绝不预埋剑冢；只有真实死亡才在尸位留下一剑。" }, passive: { name: "尸位墓剑", resource: "墓剑库存", description: "每次死亡只记录一处、一向、一剑；后来者触墓便起剑并永久消耗，命中不会增殖。" }, skill2: { name: "万剑陵", description: "墓剑满十二把时，所有尸位剑按所选剑路各飞一次，无论命中与否都清空整座剑陵。" }
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
  const specialName = id === "sword-intent-sharpening" ? "剑匣淬锋" : null;
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
  "searing-quill": { name: "灼心翎", lore: "羽扇收束为狭长重翎，最佳射程伤害与穿透大增，但侧向覆盖锐减。", gain: "最佳射程的一击更重，射程更远。", cost: "扇面大幅收窄，侧翼敌人更容易漏过", scope: "羽扇角度、射程与最佳射程伤害" },
  "feather-storm": { name: "烈羽风暴", lore: "羽扇展开为宽阔短扇，擅长清群，但射程与单体伤害下降。", gain: "扇面大幅展开，可同时扫中分散敌群。", cost: "射程缩短，单个目标受到的伤害显著降低", scope: "羽扇宽度、射程与清群能力" },
  "swift-molt": { name: "疾蜕", lore: "攻击与换羽更快，但羽匣缩为三发且每发更弱。", gain: "攻击和换羽速度显著加快。", cost: "羽匣仅剩三发，每发伤害降低", scope: "羽匣容量、攻击间隔与换羽时间" },
  "endless-plumage": { name: "无尽羽藏", lore: "羽匣扩为八发，但打空后的换羽时间显著延长。", gain: "羽匣容量提升至八发。", cost: "空匣后的换羽时间显著延长", scope: "连续射击次数与空匣真空期" },
  "combat-molt": { name: "战中蜕羽", lore: "闪避可立刻替换未满羽匣，但不会借机发射攻击，并舍弃余羽。", gain: "闪避时立刻装满羽匣。", cost: "闪避不发动攻击，并丢弃匣中剩余羽翎", scope: "闪避与羽匣重装" },
  "last-feather": { name: "末羽焚空", lore: "最后一羽产生沉重爆燃，但空匣换羽更慢。", gain: "每匣最后一羽造成强力爆燃。", cost: "打空后的换羽时间显著延长", scope: "末发爆发与空匣风险" },
  "phoenix-brand": { name: "凤印", lore: "最佳射程命中的目标留下更持久的可见凤印，偏离射程则无印。", gain: "最佳射程命中留下长时间存在的可见凤印。", cost: "近距或超距命中不会留下凤印", scope: "最佳射程命中与凤翔天际线的标记储备" },
  "sun-chasing-wings": { name: "逐日翼", lore: "连续最佳命中逐步放宽有效射程；一次失败会清空扩宽与准备。", gain: "连续最佳命中会逐步放宽最佳射程带。", cost: "一次落空便清除扩宽效果与绝学准备", scope: "连续命中、最佳射程带与绝学准备" },
  "ashen-pursuit": { name: "灰烬追猎", lore: "带印目标死亡时，凤印转移至最远有效敌人，可能因此离开理想贯廊。", gain: "带印目标死亡时，凤印转移给最远的有效敌人。", cost: "转移后的凤印可能偏离可用贯廊", scope: "凤印继承与贯廊站位" },
  "army-breaking-lone-needle": { name: "破军孤针", lore: "单针直击威力极高，但绝不弹射。", gain: "首个穴位受到极高的单点伤害。", cost: "飞针绝不弹向第二个穴位", scope: "首穴伤害与针路长度" },
  "linked-pearl-thread": { name: "连珠引线", lore: "一针可连续经过四个不同弱点，但首击与后续伤害更低。", gain: "一针最多串联四个不同穴位。", cost: "首击与后续每一击的伤害均降低", scope: "不同穴位数量与沿途伤害" },
  "swift-frost-point": { name: "飞霜急点", lore: "重新寻穴更快，但锁定距离更短，失去下一穴时惩罚更重。", gain: "飞针更快重新寻找下一穴位。", cost: "锁定距离缩短，断链时定念损失更重", scope: "寻穴速度、距离与断链惩罚" },
  "still-water-focus": { name: "静水凝神", lore: "断链时保留最后两穴，但整条针路的伤害保持率下降。", gain: "断链时保留最后两个穴位。", cost: "针路越往后，伤害衰减越明显", scope: "定念保留与连锁伤害" },
  "moving-star-acupoint": { name: "移星换穴", lore: "首领可轮换暴露另一处穴位而不增减定念，但该次弹射较弱。", gain: "同一首领可轮换暴露不同穴位，且不会重置定念。", cost: "重复首领上的弹射更弱，也不会增加定念", scope: "首领多穴位与定念累计" },
  "cold-soul-commitment": { name: "寒魄孤注", lore: "满定念换取一次巨力终针并短暂冻结普通敌人，随后清空针路。", gain: "满定念时打出巨力终针，并短暂冻结普通敌人。", cost: "命中后清空全部针路，无法正常保留连锁", scope: "满定念消耗、终针伤害与控制" },
  "reverse-star-trace": { name: "逆星刻痕", lore: "目标死亡后原穴位短暂悬留，但不能再承受伤害且很快消散。", gain: "目标死亡后，其穴位会短暂留在原地维持返程路线。", cost: "残留穴位很快消散，且不能再承受伤害", scope: "死亡后的路线连续性与穴位寿命" },
  "seven-lodge-balance": { name: "七宿连衡", lore: "虚宿可补全稀疏星路，但所有真实与返程节点伤害降低。", gain: "虚宿可补全稀疏针路，使其更容易形成返程。", cost: "所有真实穴位与返程节点伤害降低", scope: "虚拟穴位、针路完成与节点伤害" },
  "frost-sealed-instant": { name: "霜封刹那", lore: "满定念时短暂冻结去程普通敌人；逆返不会延长控制。", gain: "定念完成时，短暂冻结去程命中的普通敌人。", cost: "逆返不会延长冻结，也不会再次施加控制", scope: "去程控制与返程伤害" },
  "lancing-crescent": { name: "贯日炎月" },
  "frost-cascade": { name: "凝霜连生" },
  "tide-crown": { name: "玄潮加冕" },
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
  "execution-seal": { name: "诛首剑令", lore: "轮转飞剑改为持续围攻最强威胁，牺牲分散清群。", gain: "不同飞剑连续锁定当前最强威胁。", cost: "放弃四种轮转分工，清理分散敌群更弱", scope: "自动目标分配与单体压制" },
  "sword-bloom": { name: "剑华分影", lore: "实体剑出鞘时分出两道一次性剑影，但本体威力下降。", gain: "每次出鞘最多分出两道剑影攻击其他敌人。", cost: "实体飞剑的去程伤害降低", scope: "去程清群与实体剑伤害" },
  "reversing-sword-path": { name: "回锋剑路", lore: "主要伤害转移到归途；提前接剑会牺牲尚未走完的回锋。", gain: "归途伤害大幅提高。", cost: "去程伤害降低，提前接剑会截断回锋收益", scope: "去程、归途与接剑时机" },
  "still-sword-edge": { name: "静剑养锋", lore: "匣中静置越久，下一次出鞘越强，但飞剑返程更慢。", gain: "已归飞剑随静置时间积蓄额外去程伤害。", cost: "每柄飞剑的完整往返时间延长", scope: "匣中蓄力与飞剑周转" },
  "linked-sword-catch": { name: "连环接剑", lore: "迎向返程飞剑可提前接剑并立刻准备下一发；错过则没有加速。", gain: "贴近返程飞剑时提前归匣，并立刻准备下次出鞘。", cost: "必须主动迎接；错过飞剑不会获得任何加速", scope: "移动接剑与攻击节奏" },
  "four-symbols-together": { name: "四象齐出", lore: "剑匣完整时四剑同出；任一未归时都不能再次发动。", gain: "完整剑匣一次放出全部四柄实体飞剑。", cost: "必须等四剑全部归匣才能再次出鞘", scope: "整匣爆发与全空真空期" },
  "heavenly-sword-crown": { name: "天剑为冠", lore: "一剑常驻头顶护持，主动剑匣缩为三柄。", gain: "保留一柄常驻支援天剑。", cost: "可出鞘的实体剑由四柄减为三柄", scope: "常驻支援与剑匣容量" },
  "three-enclosure-sword-domain": { name: "三垣剑域", lore: "修士与在外飞剑之间形成切割线，接回飞剑会缩小剑域。", gain: "修士与在外飞剑之间生成可见切割线。", cost: "每接回一剑，剑域边数与覆盖范围都会缩小", scope: "在外剑位、切割线与接剑取舍" },
  "void-step-recall": { name: "虚步收锋", lore: "闪避令全部飞剑折返，不会凭空生成新剑。", gain: "闪避时立即令所有在外飞剑转入返程。", cost: "该次闪避只用于收锋，不附带额外攻击", scope: "闪避与全剑召回" },
  "heaven-splitting-long-edge": { name: "裂天纵锋", lore: "地面斩改为顺着行迹纵切，锋线更长更窄。", gain: "获得长而窄的纵向地面斩。", cost: "失去横切覆盖，路线两侧更容易漏敌", scope: "行锋方向、长度与横向覆盖" },
  "golden-gale-crosscut": { name: "金风横断", lore: "行锋间隔增大，但每次横断覆盖显著变宽。", gain: "单次横斩更宽，更适合切开密集敌群。", cost: "两次落锋之间需要移动更远", scope: "横向覆盖与落锋频率" },
  "crescent-wake": { name: "月牙余锋", lore: "锋痕延迟落在身后并增强，正前方不再立即受护。", gain: "身后延迟锋痕伤害提高。", cost: "前方没有即时地面斩，追击路线更危险", scope: "延迟、身后路线与伤害" },
  "unbroken-continuance": { name: "绵延不绝", lore: "短暂停步仍可续势，但势能上限降低。", gain: "短暂停顿不会立刻断势。", cost: "最高势能永久降至较低上限", scope: "停步容错与势能上限" },
  "borrowed-turn-edge": { name: "借势折锋", lore: "满势时可承受一次急转，以半数势能支付代价。", gain: "满势时第一次急转不会清空路线。", cost: "急转立即消耗一半势能", scope: "急转容错与势能支出" },
  "gale-rupture": { name: "罡势决流", lore: "满势爆成十字地裂并全部耗尽，平常行锋缩短。", gain: "满势时自动产生高伤十字地面斩。", cost: "触发后势能归零，普通锋痕长度缩短", scope: "满势爆发、清空与日常锋长" },
  "one-line-to-horizon": { name: "天涯一线", lore: "严格直行足够远后，行锋横贯战场。", gain: "长距离直行把地面斩扩展为全屏锋线。", cost: "任何明显转向都会重置直行距离", scope: "直线纪律与全屏覆盖" },
  "returning-dragon-edge": { name: "游龙回锋", lore: "缓弯不再断势，但锋长与势能上限下降。", gain: "可沿平滑曲线持续积势。", cost: "最高势能与地面斩长度均降低", scope: "曲线容错、势能上限与锋长" },
  "formation-breaking-gale-step": { name: "破阵罡步", lore: "闪避起点与终点各留一道横锋，并耗去半势。", gain: "每次闪避在出发与落点各生成一道地面斩。", cost: "闪避立即消耗当前一半势能", scope: "闪避路径与势能支出" },
  "heart-piercing-thorn-cable": { name: "穿心棘索", lore: "固定采用敌人与地形两端，换取更强单体绷断。", gain: "单敌绷断伤害显著提高。", cost: "放弃双敌扫线，清群能力降低", scope: "端点选择与单体绷断" },
  "twin-serpent-bind": { name: "双蛇缚敌", lore: "强化双敌之间的两段扫线，但削弱最终绷断。", gain: "活藤扫过敌人时的接触伤害提高。", cost: "单敌用法与最终绷断伤害降低", scope: "双端扫线与绷断伤害" },
  "flying-vine-graft": { name: "飞蔓换枝", lore: "端点死亡后最多换接两次，并保留一半张力。", gain: "失去端点时可自动换接新敌两次。", cost: "每次换接只留半张力，最终绷断较弱", scope: "端点死亡、换接次数与绷断" },
  "hundred-forged-soft-vine": { name: "百炼柔藤", lore: "几何放松时张力改为渐退，但上限与束缚降低。", gain: "回位或短暂松弛不会瞬间丢尽张力。", cost: "张力上限降低，绷断束缚更短", scope: "张力回落、上限与控制" },
  "mountain-rending-iron-cable": { name: "崩山铁索", lore: "提高张力上限与绷断威力，活藤不再造成沿线接触伤害。", gain: "满张力绷断更强。", cost: "拉索期间的两段藤线不再伤敌", scope: "蓄势阈值、绷断与沿线伤害" },
  "step-borrowed-pull": { name: "借步催索", lore: "每条藤索首次闪避可强拉张力并横扫，但绷断不再束缚。", gain: "首次闪避增加大量张力并产生一次横切。", cost: "最终绷断不附带定身", scope: "闪避、张力与最终控制" },
  "dragon-binding-knot": { name: "困龙结", lore: "天罗聚拢与减速更强，但藤网边伤降低。", gain: "网内敌人受到更强减速与聚拢。", cost: "收缩边线伤害降低", scope: "天罗控制与边线伤害" },
  "dense-heaven-net-knot": { name: "天罗密结", lore: "最多保留六枚长寿藤结，换取较弱网边。", gain: "藤结容量与存续时间提高。", cost: "每段藤网边线伤害降低", scope: "藤结数量、寿命与网边伤害" },
  "broken-vine-branching": { name: "断藤生枝", lore: "端点死亡留下两枚弱结，但天罗更快收尽。", gain: "端点死亡时生成两枚有限弱藤结。", cost: "由其组成的天罗持续时间缩短", scope: "端点死亡、藤结生成与收缩时长" },
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
  "one-line-mountain-sundering": { name: "一线断岳", lore: "只书一条更长更窄的重令，完整双判极强，单段擦中近乎无益。", gain: "敕线延长至六百二十，完整双判伤害显著提高。", cost: "线宽缩至十八，物理或法术只中一段时伤害很低", scope: "敕线长度、宽度与完整双判伤害" },
  "crossed-golden-edict": { name: "十字金章", lore: "同时固定两条短弱正交敕线，交点上的敌人追加一次金章裁决。", gain: "生成两条互相垂直的敕线，并获得交点追加伤害。", cost: "每条线更短，单线物理与法术伤害都较低", scope: "双线几何、交点判定与单线伤害" },
  "swift-short-edict": { name: "疾书短令", lore: "以短令换急判，法术复写更快，却少记天命。", gain: "固定法术裁决延迟缩短至三百四十毫秒。", cost: "敕线只有三百长度，所得天命再降低三成二", scope: "敕线长度、复判延迟与天命收益" },
  "lenient-record": { name: "宽赦留章", lore: "只有一段命中的目标也可留下少量天命，但绝学上限随之降低。", gain: "每个单段命中可获得少量天命，不再完全白费。", cost: "天命与绝学门槛上限降至七成八", scope: "单段命中、天命来源与绝学上限" },
  "aggravated-judgment": { name: "重罪加刑", lore: "完整裁决精英与首领时重记天命，普通敌人只留轻笔。", gain: "精英与首领的同目标双判提供双倍天命权重。", cost: "普通敌人的双判天命降至很低比例", scope: "目标阶位、同目标双判与天命权重" },
  "collective-sentence": { name: "连坐成狱", lore: "一笔完整裁决三名以上敌人时天命翻倍，孤判则收益大减。", gain: "单次至少三名同目标双判时，所得天命翻倍。", cost: "不足三名时天命只按四成五计入", scope: "同次双判人数与群体天命倍率" },
  "lone-heaven-scar": { name: "天痕独断", lore: "只留质量最高的一道窄痕，以单线全威换取不存第二令。", gain: "绝学保留最强单线，并以十六宽度获得最高单线裁决。", cost: "永远不能保留或复写第二条敕线", scope: "记录数量、绝学线宽与单线威力" },
  "twin-edicts": { name: "双敕并书", lore: "保留最近两道较弱敕令并一同复写，重合处追加交点裁决。", gain: "绝学同时延伸最近两条记录，并对双线交点追加伤害。", cost: "每条敕线的独立裁决伤害降低", scope: "记录数量、双线复写与交点伤害" },
  "heaven-moving-amendment": { name: "移天改诏", lore: "保留旧令角度与长度，平移到当前最密敌群，但绝不旋转追踪。", gain: "绝学会把记录中心平移到自动选出的当前最密敌群。", cost: "记录方向不能旋转，且平移后的裁决伤害降低", scope: "最密敌群选择、记录平移与固定朝向" },
  "solitary-heavenly-judgment": { name: "独日天刑", lore: "劫印收窄且延迟更久，正中威力大增，外圈只余弱灼。", gain: "获得更小、更重的正中判定，正中爆发显著提高。", cost: "预警更久且覆盖更窄，擦中外圈的收益很低", scope: "劫印半径、落日延迟与正中伤害" },
  "twin-luminary-eclipse": { name: "双曜蚀界", lore: "分别预判两处威胁，先后固定两枚小印，但每枚威力较低。", gain: "一次自动覆盖两个不同威胁点，并以短间隔先后坠落。", cost: "每枚劫印的单体伤害明显降低", scope: "自动预判数量、落印间隔与单印伤害" },
  "swift-eclipse-calamity": { name: "迅蚀劫光", lore: "阳极积累与落日都更快，却无法凝成最高威力。", gain: "阳极增长加快，固定预警大幅缩短。", cost: "阳极上限降低，单次坠阳的最高伤害较低", scope: "阳极增长、上限与劫印延迟" },
  "fixed-noon-sun": { name: "定午守阳", lore: "每次落印后保留三分之一阳极，以较低上限换取更稳定的循环。", gain: "承诺落印时保留当次阳极的三分之一。", cost: "阳极上限降至六成七，无法达到原本峰值", scope: "阳极保留比例、上限与连续施印节奏" },
  "dark-sun-calamity": { name: "晦日养劫", lore: "漫长预警中，明亮中心持续收缩，凝成更重的正中劫火。", gain: "收缩中心清楚显示凝聚过程，并显著放大阳极的正中收益。", cost: "敌人拥有更长时间逃离固定落点", scope: "劫印预警、可见缩心与正中威力" },
  "unsetting-high-noon": { name: "极昼不落", lore: "阳极未满绝不落印，以最低频率换取最大的单次坠阳。", gain: "满阳极时获得全路线最大的单次冲击收益。", cost: "阳极未满时完全拒绝施放，出手最不频繁", scope: "自动施放门槛、阳极等待与峰值伤害" },
  "center-forged-solar-soul": { name: "正中炼阳", lore: "只认劫印正中；正中一次炼成两兆，外圈命中不生兆。", gain: "每次正中命中直接获得两枚可见日兆。", cost: "外圈命中完全不提供日兆", scope: "正中判定、日兆来源与九阳归一准备" },
  "myriad-beings-calamity": { name: "众生为劫", lore: "一次劫印波及的不同生灵越多，所成日兆越多。", gain: "命中多个不同敌人时可一次获得多枚日兆。", cost: "只对单个首领施印时积兆很慢", scope: "不同受击目标数、日兆数量与清群准备" },
  "returning-afterglow": { name: "残照归天", lore: "完全落空仍留一枚黯淡日兆，但黯兆会削弱最终归一。", gain: "劫印落空时仍获得一枚可见黯兆，不会完全断档。", cost: "每枚黯兆都会降低九阳归一的最终伤害", scope: "落空补偿、黯兆数量与九阳归一威力" },
  "scarlet-lance-tide": { name: "赤练穿潮", lore: "双潮收成迅疾窄练，直伤更强，却只容极小的波面交叠。", gain: "月潮变窄并提高直接穿潮伤害。", cost: "波面交叠容错极小，更容易无法合流", scope: "月潮宽度、直接伤害与合流容错" },
  "river-crossing-flame-moon": { name: "横江炎月", lore: "双潮横展成宽阔慢月，容易包住分散敌群，却削弱直接灼伤。", gain: "波面大幅加宽，更容易形成真实交叠并覆盖敌群。", cost: "施潮较慢，单道月潮的直接伤害较低", scope: "月潮宽度、施放间隔与直接伤害" },
  "rolling-twin-tides": { name: "连潮催浪", lore: "左右潮接续更快，但波面消散更早且每潮较弱。", gain: "双潮施放间隔缩短四成二，更快完成一组配对。", cost: "首潮只保留一千一百毫秒，月潮伤害降低", scope: "双潮间隔、首潮寿命与直接伤害" },
  "after-tide-awaits-moon": { name: "余潮候月", lore: "首潮长留原岸等待映月，以自身变弱换取更宽裕的配对窗口。", gain: "首道月潮保留三千六百毫秒。", cost: "被保留的首潮直接伤害降低", scope: "首潮寿命、配对窗口与首潮伤害" },
  "misbanked-flying-arc": { name: "错岸飞虹", lore: "两潮未能相触时，可在相隔不远的错岸间架起细弱斜缝。", gain: "相隔不超过一定距离的两道波面仍可桥接合流。", cost: "桥接熔缝更窄、更弱，远距分离仍会失败", scope: "分离配对补救、桥接距离与熔缝宽度" },
  "ruptured-burning-current": { name: "焚流决口", lore: "合流瞬间引爆整条会线并抹去双潮，不再留下移动熔缝。", gain: "整条合流线立即造成一次高额爆发。", cost: "不产生持续移动的熔缝，也没有后续扫掠", scope: "合流瞬爆、熔缝寿命与后续伤害" },
  "long-sunset-trace": { name: "落霞长痕", lore: "熔缝延长并缓慢横移更久，以削弱双潮换取持续封线。", gain: "移动熔缝更长，持续时间提升至三千二百毫秒。", cost: "左右月潮的直接伤害降低", scope: "熔缝长度、移动时长与月潮伤害" },
  "horizon-opposing-tides": { name: "天际对潮", lore: "双潮从更远两侧展开成巨浪，若能相会便划出强力战场分界。", gain: "月潮更长、更宽，合流熔缝横移距离更大。", cost: "起潮点彼此更远，形成真实交叠更慢也更冒险", scope: "起潮位置、波面尺度与战场分界" },
  "reverse-scarlet-tide": { name: "赤浪倒卷", lore: "合流后两道弱化月潮各自向外倒返，但移动熔缝的伤害降低。", gain: "成功合流后，左右月潮各追加一次向外返潮伤害。", cost: "熔缝本身伤害降低，返潮也只有原月潮的部分威力", scope: "合流后返潮方向、返潮伤害与熔缝伤害" },
  "sea-suppressing-heavy-moon": { name: "沉月镇海", lore: "悬月几乎钉在原处，以狭小轨域换取沉重牵引与归墟撞击。", gain: "月体牵引与向心结算显著增强。", cost: "轨域缩至九十二，月体几乎无法随身拖行", scope: "月体跟随速度、轨域半径与向心力度" },
  "twin-moon-crossing": { name: "双月交潮", lore: "两轮弱月保持分离同行，敌人会在重叠轨域间自动转入更近月轨。", gain: "同时维持两轮可见悬月，并允许在重叠轨域间转轨。", cost: "每轮月体的牵引与最终伤害都较低", scope: "月体数量、双月间距、转轨与结算伤害" },
  "swift-moon-vessel": { name: "疾月行舟", lore: "宽阔悬月快速随身渡行，擅长沿途收众，却只有轻弱牵引与结算。", gain: "月体跟随更快，真实轨域扩大至二百零五。", cost: "向心牵引和最终结算伤害显著降低", scope: "月体跟随速度、收集半径与结算力度" },
  "still-sea-syzygy": { name: "静海留朔", lore: "离轨者留下已成角运动的一半，但合朔上限随之降低。", gain: "敌人逃脱时保留其已完成角运动的二分之一。", cost: "合朔上限降至七成六", scope: "逃脱损失、保留角运动与合朔上限" },
  "myriad-currents-to-moon": { name: "万流朝月", lore: "同时在轨的不同生灵越多，每段真实周行积朔越快。", gain: "多名不同绕月者会共同提高合朔增长效率。", cost: "只有单个首领在轨时增长效率很低", scope: "不同绕月者数量、实际角运动与合朔效率" },
  "mountain-weight-eclipse": { name: "重岳蚀心", lore: "以敌身之重衡量周行，精英与首领成朔厚重，杂兵近乎无益。", gain: "精英和首领的真实角运动获得更高权重。", cost: "普通敌人的角运动只按很低比例计入", scope: "敌人阶位、角运动权重与首领准备" },
  "returning-abyss-moon": { name: "归墟沉月", lore: "结算时将所有在轨者压向月心重击，但平时周行积朔更慢。", gain: "终式获得强力向心位移与中心伤害。", cost: "所有绕月角运动只按六成二积累", scope: "合朔增长、向心位移与中心结算" },
  "flying-star-release": { name: "飞星离潮", lore: "结算时沿当前切线抛出绕月者，以后续碰撞伤敌，不再轰击月心。", gain: "所有在轨敌人沿切线高速飞出，碰撞可造成额外伤害。", cost: "终式没有中心冲击，未发生碰撞便失去主要收益", scope: "切向释放、敌人碰撞与中心伤害" },
  "grand-yin-suspension": { name: "太阴悬界", lore: "结算将众敌冻结在各自月轨上，以低伤换取无位移悬停。", gain: "在轨敌人会在当前位置清晰悬停一千七百毫秒。", cost: "结算伤害很低，且不会产生推、拉或碰撞", scope: "轨道悬停、控制时长与位移取舍" },
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
