# Localization

FQYY uses one locale for the game shell, Phaser game UI, settings, and Tools.
Simplified Chinese (`zh-CN`) is the default; English (`en`) remains available
and is the source-language fallback.

## Add a language

1. Add its BCP 47 code and self-name to `localeMetadata` in `locale.ts`;
   `supportedLocales` and the Settings selector derive from that registry.
2. Add its interface messages to the catalog registry in `messages.ts`. The
   English catalog defines the typed key set; missing entries fall back to
   English instead of rendering keys.
3. Add stable-ID content translations in `content.ts` for Gongfa, skills,
   Linggen, stages, treasures, refinements, and transformations. Content IDs,
   save data, build links, and gameplay rules never change with language.
4. Extend the catalog-completeness and browser persistence tests.
5. Bundle a font that covers the language when the existing font does not.

UI code should use `t()` for interface messages and the `localize*()` helpers
for authored game content. Do not branch on translated display text in game
logic or persistence.
