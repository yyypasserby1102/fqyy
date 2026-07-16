import { describe, expect, it } from "vitest";
import {
  createLocaleStore,
  defaultLocale,
  resolveLocale,
  type LocaleStorage
} from "../../src/i18n/locale";
import { translate } from "../../src/i18n/messages";
import {
  localizeGongfa,
  localizeGongfaPackage,
  localizeLinggen,
  localizeMasteryChoice,
  localizeSpiritTreasure,
  localizeStage,
  localizeUpgrade
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
        return [item.name, item.lore];
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
        return [translated.name, translated.lore];
      })
    ];

    expect(visibleChinese.filter((value) => /[A-Za-z]/.test(value))).toEqual([]);
  });
});
