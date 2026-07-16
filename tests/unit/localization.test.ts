import { describe, expect, it } from "vitest";
import {
  createLocaleStore,
  defaultLocale,
  resolveLocale,
  type LocaleStorage
} from "../../src/i18n/locale";
import { translate } from "../../src/i18n/messages";
import {
  getChineseFontPreloadText,
  localizeGongfa,
  localizeGongfaPackage,
  localizeLinggen,
  localizeMasteryChoice,
  localizeChoicePayload,
  localizeRuntimeText,
  localizeSpiritTreasure,
  localizeStage,
  localizeUpgrade,
  registerContentAdapter
} from "../../src/i18n/content";
import { gongfaConfigs, type GongfaId } from "../../src/data/gongfa";
import { linggenConfigs, type LinggenId } from "../../src/data/linggen";
import { spiritTreasureConfigs, type SpiritTreasureId } from "../../src/data/spiritTreasures";
import { stageConfigs, type StageId } from "../../src/data/stages";
import { upgradeConfigs } from "../../src/data/upgrades";
import { masteryTransformationConfigs } from "../../src/logic/mastery";

function memoryStorage(initial?: string): LocaleStorage {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_key, next) => { value = next; }
  };
}

describe("localization", () => {
  it("defaults new players to Simplified Chinese and persists an explicit language", () => {
    const storage = memoryStorage();
    const store = createLocaleStore(storage);

    expect(defaultLocale).toBe("zh-CN");
    expect(store.get()).toBe("zh-CN");

    store.set("en");
    expect(store.get()).toBe("en");
    expect(createLocaleStore(storage).get()).toBe("en");
  });

  it("resolves unsupported or malformed saved values to the Chinese default", () => {
    expect(resolveLocale("fr-FR")).toBe("zh-CN");
    expect(resolveLocale(null)).toBe("zh-CN");
    expect(createLocaleStore(memoryStorage("not-json")).get()).toBe("zh-CN");
  });

  it("translates typed messages with variables and falls back to English", () => {
    expect(translate("zh-CN", "run.completionRecord", { count: 3 })).toBe("通关记录：3");
    expect(translate("en", "run.completionRecord", { count: 3 })).toBe("Completion record: 3");
    expect(translate("zh-CN", "test.englishFallback")).toBe("English fallback");
  });

  it("localizes canonical game content by stable domain IDs", () => {
    expect(localizeGongfa("zh-CN", "yujian-jue").name).toBe("御剑诀");
    expect(localizeGongfaPackage("zh-CN", "yujian-jue").skill1.name).toBe("飞剑齐射");
    expect(localizeLinggen("zh-CN", "fire-metal").name).toBe("火金双灵根");
    expect(localizeSpiritTreasure("zh-CN", "jade-heart-pendant").name).toBe("玉心佩");
    expect(localizeStage("zh-CN", "jindan").name).toBe("金丹");
    expect(localizeUpgrade("zh-CN", "sword-intent-sharpening").name).not.toMatch(/[A-Za-z]/);
    expect(localizeMasteryChoice("zh-CN", "execution-seal").name).toBe("诛敌剑印");

    expect(localizeGongfa("en", "yujian-jue").name).toBe("Yujian Jue");
    expect(localizeGongfaPackage("en", "yujian-jue").skill1.name).toBe("Flying Sword Volley");
  });

  it("falls back to English content for a future locale without a content catalog", () => {
    const futureLocale = "ja" as never;
    expect(localizeGongfa(futureLocale, "yujian-jue").name).toBe("Yujian Jue");
    expect(localizeRuntimeText(futureLocale, "Lightning Judgment")).toBe("Lightning Judgment");
  });

  it("registers a future locale adapter once and falls back per missing content family", () => {
    const futureLocale = "ja" as never;
    const unregister = registerContentAdapter("ja", {
      gongfa: (id) => ({ ...gongfaConfigs[id], name: "御剣術" })
    });
    try {
      expect(localizeGongfa(futureLocale, "yujian-jue").name).toBe("御剣術");
      expect(localizeLinggen(futureLocale, "metal").name).toBe("Metal Linggen");
    } finally {
      unregister();
    }
  });

  it("localizes late-run generated gameplay copy without mixed English", () => {
    const lateRunCopy = [
      "Settings open — Run paused.",
      "Qi is unstable. Claim the Lingcao and reveal your roots.",
      "Meditation pause.",
      "Cultivator fell. Qi scattered.",
      "Lightning Judgment",
      "Celestial thunder measures the Cultivator's foundation.",
      "Tribulation Shades",
      "Collapsing Safe Zones",
      "FOUNDATION SETTLES",
      "STAGE BREAKTHROUGH",
      "Chuqi complete. Foundation pressure settles into Zhongqi.",
      "Lianqi pressure deepens without breaking the flow.",
      "Lianqi Chuqi begins.",
      "Cleanup complete. Lianqi Chuqi is ready to advance.",
      "Lianqi Dayuanman clears. Its concluding Tribulation rises.",
      "Lightning Judgment clears. The tribulation deepens.",
      "Complete the Lianqi Tribulation and open the next Gongfa slot.",
      "Lianqi Tribulation",
      "Continue to zhongqi",
      "Continue to Lightning Judgment",
      "Yujian Jue mastery reaches Rank 3. 2 ordinary refinements settle without interrupting combat.",
      "Evade: Ready",
      "Foundation Growth Total",
      "SKILL 2 · UNLOCKS RANK 10",
      "HEAVENLY TRIBULATION · 1/3",
      "Linggen: Metal Linggen · Strong"
    ].map((value) => localizeRuntimeText("zh-CN", value));

    expect(lateRunCopy.filter((value) => /[A-Za-z]/.test(value))).toEqual([]);
    const preload = getChineseFontPreloadText();
    expect([...lateRunCopy.join("")].filter((character) => /\p{Script=Han}/u.test(character) && !preload.includes(character)))
      .toEqual([]);
  });

  it("keeps every authored Chinese content entry free of English fallback copy", () => {
    const visibleChinese = [
      ...(Object.keys(gongfaConfigs) as GongfaId[]).flatMap((id) => {
        const gongfa = localizeGongfa("zh-CN", id);
        const packageInfo = localizeGongfaPackage("zh-CN", id);
        return [
          gongfa.name, gongfa.lore, packageInfo.combatRole, packageInfo.visualMotif,
          packageInfo.skill1.name, packageInfo.skill1.description,
          packageInfo.passive.name, packageInfo.passive.resource, packageInfo.passive.description,
          packageInfo.skill2.name, packageInfo.skill2.description
        ];
      }),
      ...(Object.keys(linggenConfigs) as LinggenId[]).flatMap((id) => {
        const item = localizeLinggen("zh-CN", id);
        return [item.name, item.lore];
      }),
      ...(Object.keys(spiritTreasureConfigs) as SpiritTreasureId[]).flatMap((id) => {
        const item = localizeSpiritTreasure("zh-CN", id);
        return [item.name, item.lore, item.signature.name, item.signature.effect, item.culmination.name, item.culmination.effect];
      }),
      ...(Object.keys(stageConfigs) as StageId[]).flatMap((id) => {
        const stage = localizeStage("zh-CN", id);
        return [stage.name, stage.message];
      }),
      ...upgradeConfigs.flatMap((item) => {
        const translated = localizeUpgrade("zh-CN", item.id);
        return [translated.name, translated.lore];
      }),
      ...masteryTransformationConfigs.flatMap((item) => {
        const translated = localizeMasteryChoice("zh-CN", item.id);
        return [
          translated.name,
          translated.lore,
          translated.playstyle ?? "",
          translated.gain ?? "",
          translated.cost ?? "",
          translated.scope ?? "",
          translated.treasureInteraction ?? ""
        ];
      })
    ];

    expect(visibleChinese.filter((value) => /[A-Za-z]/.test(value))).toEqual([]);
  });

  it("localizes treasure replacement gains, losses, and resonance changes", () => {
    const payload = localizeChoicePayload("zh-CN", {
      title: "Windstep Talisman found",
      options: [{
        id: "ironhide-seal",
        kind: "spirit-treasure-replace",
        title: "Replace Ironhide Seal",
        description: "Gain +24 moveSpeed · Lose -0.08 mitigation",
        gain: "+24 moveSpeed",
        loss: "-0.08 mitigation",
        resonanceGained: ["harvest"],
        resonanceLost: ["vitality"]
      }]
    });
    expect(payload.options[0].description).toBe(
      "收益：+24 移动速度 · 代价：-0.08 减伤 · 激活共鸣：采灵 · 失去共鸣：生息"
    );
  });

  it("localizes every structured Transformation field in choice payloads", () => {
    const source = localizeMasteryChoice("en", "searing-feathers");
    const payload = localizeChoicePayload("zh-CN", {
      title: "Blazing Feather Art Mastery Rank 3",
      options: [{
        id: source.id,
        kind: "mastery",
        title: source.name,
        description: source.lore,
        playstyle: source.playstyle,
        gain: source.gain,
        cost: source.cost,
        scope: source.scope,
        treasureInteraction: source.treasureInteraction
      }]
    });
    const option = payload.options[0];
    expect([
      option.playstyle,
      option.gain,
      option.cost,
      option.scope,
      option.treasureInteraction
    ].filter((value) => /[A-Za-z]/.test(value ?? ""))).toEqual([]);
    expect(option.description).toContain("收益：");
    expect(option.description).toContain("代价：");
  });
});
