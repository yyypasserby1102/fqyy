# Machine whole-Run playtest

Generated from the public browser surface and `window.__gameTest` acceleration seam. Machine wall time is diagnostic only and must not be interpreted as game pacing. Coverage facts below seed human-playtest hypotheses; they do not establish subjective readability, mix quality, tactics, or difficulty.

| Measurement | Result |
| --- | --- |
| Commit | 76c6119 |
| Seed / Candidate | 2 / Fire-Metal Linggen |
| Outcome | victory |
| Machine wall time | 32.2 seconds |
| Save/resume cycles | 1 |
| Completed Run record | 1 |
| Choices observed | 23 |
| Final Gongfa / Mastery | 4 / rank 22 |
| Peak enemies sampled | 10 |

## Coverage

- Stages: lianqi, zhuji, jindan, yuanying
- Realm Phases: chuqi, zhongqi, houqi, dayuanman
- Arenas: mist-court, foundation-terrace, golden-core-sanctum, nascent-sky-dais
- Journey presentations: breakthrough, tribulation, victory
- Automatic phase milestones: lianqi:chuqi->zhongqi, lianqi:zhongqi->houqi, lianqi:houqi->dayuanman, zhuji:chuqi->zhongqi, zhuji:zhongqi->houqi, zhuji:houqi->dayuanman, jindan:chuqi->zhongqi, jindan:zhongqi->houqi, jindan:houqi->dayuanman, yuanying:chuqi->zhongqi, yuanying:zhongqi->houqi, yuanying:houqi->dayuanman
- Audio cues: breakthrough, cast, choice-accept, choice-open, evade, healing-pill, hit, phase-transition, qi-pickup, rank-up, tribulation, victory
- Realm identities: Fallen Sect Courtyard · Breath, Mist Bamboo Valley · Root, Burial Ridge · Core, Cloudbreak Summit · Soul
- Gongfa mastery: yujian-jue R22 (Fully Mastered), burning-ring-scripture R22 (Fully Mastered), scarlet-wave-manual R18, blazing-feather-art R9
- Effect hierarchy: yujian-jue founding α1.00, burning-ring-scripture layered α0.82, scarlet-wave-manual layered α0.68, blazing-feather-art layered α0.58

## General-feel suggestions

- **Realm identity is persistently reinforced.** All four arena variants, distinct accent/identity badges, twelve automatic phase milestones, and the Breakthrough/Tribulation/victory presentation family appeared. The machine can prove persistent differentiation; humans still judge how quickly it reads under pressure.
- **Choice interruptions are materially restrained.** The accelerated Run surfaced 23 panels: Realm Phases and ordinary Mastery Refinements resolve automatically, while Transformations and true Breakthroughs remain decisions. Human sessions should still judge the remaining cadence.
- **Late-Run growth remains visible across the build.** The founding path reached Fully Mastered while newer Gongfa retained independent rank progress, so a completed first path no longer presents as a stalled build. Tactical value remains a human judgment.
- **Four-Gongfa effect hierarchy is enforced.** The founding path remained the full-opacity visual layer while later paths stepped down through progressively quieter opacity/depth tiers. Human playtests should confirm that the quieter layers remain identifiable without obscuring threats.
- **Major-beat cues are present; sensory hierarchy needs ears-on validation.** Phase, Breakthrough, Tribulation, and victory cues fired. Human sessions should compare their audible prominence with ordinary hit/cast sounds before judging the mix hierarchy.
- **Difficulty is intentionally ungraded.** Forced Qi and enemy cleanup prove state flow, persistence, and presentation—not challenge, real pacing, or fairness. Apply numerical balance changes only after the real-time human protocol reaches its evidence threshold.

## Checkpoint trace

| Checkpoint | Stage / Phase | Progress | Gongfa | Mastery | Enemies | Choice |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Mortal opening | lianqi / chuqi | 0 | 0 | 0 | 0 | — |
| Linggen awakened | lianqi / chuqi | 0 | 1 | 0 | 0 | — |
| Lianqi combat sample | lianqi / chuqi | 0 | 1 | 0 | 8 | — |
| lianqi chuqi milestone | lianqi / zhongqi | 0 | 1 | 1 | 0 | — |
| lianqi zhongqi milestone | lianqi / houqi | 0 | 1 | 2 | 0 | — |
| lianqi houqi milestone | lianqi / dayuanman | 0 | 1 | 4 | 0 | Yujian Jue Mastery Rank 3 |
| lianqi Lianqi Tribulation | lianqi / dayuanman | 100 | 1 | 5 | 0 | Lianqi Tribulation |
| lianqi Tribulation combat | lianqi / dayuanman | 100 | 1 | 5 | 6 | — |
| Entered zhuji | zhuji / chuqi | 0 | 2 | 5 | 0 | — |
| zhuji combat sample | zhuji / chuqi | 7.76 | 2 | 5 | 7 | — |
| zhuji chuqi milestone | zhuji / zhongqi | 0 | 2 | 7 | 0 | Yujian Jue Mastery Rank 6 |
| zhuji zhongqi milestone | zhuji / houqi | 0 | 2 | 8 | 0 | Burning Ring Scripture Mastery Rank 3 |
| zhuji houqi milestone | zhuji / dayuanman | 0 | 2 | 9 | 0 | Yujian Jue Mastery Rank 9 |
| zhuji Zhuji Tribulation | zhuji / dayuanman | 100 | 2 | 11 | 0 | Zhuji Tribulation |
| zhuji Tribulation combat | zhuji / dayuanman | 100 | 2 | 11 | 8 | — |
| Entered jindan | jindan / chuqi | 11.64 | 3 | 11 | 0 | — |
| jindan combat sample | jindan / chuqi | 11.64 | 3 | 11 | 8 | — |
| jindan chuqi milestone | jindan / zhongqi | 0 | 3 | 12 | 0 | Burning Ring Scripture Mastery Rank 9 |
| jindan zhongqi milestone | jindan / houqi | 0 | 3 | 14 | 0 | Scarlet Wave Manual Mastery Rank 3 |
| jindan houqi milestone | jindan / dayuanman | 0 | 3 | 15 | 0 | Scarlet Wave Manual Mastery Rank 6 |
| jindan Jindan Tribulation | jindan / dayuanman | 100 | 3 | 16 | 0 | Jindan Tribulation |
| jindan Tribulation combat | jindan / dayuanman | 100 | 3 | 16 | 10 | — |
| Entered yuanying | yuanying / chuqi | 19.4 | 4 | 17 | 0 | Scarlet Wave Manual Mastery Rank 9 |
| yuanying combat sample | yuanying / chuqi | 19.4 | 4 | 17 | 8 | Scarlet Wave Manual Mastery Rank 9 |
| yuanying chuqi milestone | yuanying / zhongqi | 31.04 | 4 | 19 | 0 | Blazing Feather Art Mastery Rank 3 |
| yuanying zhongqi milestone | yuanying / houqi | 0 | 4 | 20 | 0 | — |
| yuanying houqi milestone | yuanying / dayuanman | 0 | 4 | 22 | 0 | Blazing Feather Art Mastery Rank 6 |
| yuanying Yuanying Heavenly Tribulation | yuanying / dayuanman | 100 | 4 | 22 | 0 | Yuanying Heavenly Tribulation |
| Heavenly Tribulation started | yuanying / dayuanman | 0 | 4 | 22 | 2 | — |
| Heavenly Tribulation resumed | yuanying / dayuanman | 0 | 4 | 22 | 2 | — |
| Boss resolution 1 | yuanying / dayuanman | 0 | 4 | 22 | 0 | Yuanying Heavenly Tribulation |
| Boss resolution 2 | yuanying / dayuanman | 0 | 4 | 22 | 0 | Yuanying Heavenly Tribulation |
| Boss resolution 3 | yuanying / dayuanman | 0 | 4 | 22 | 0 | Run Complete |
| Ascendant victory | yuanying / dayuanman | 0 | 4 | 22 | 0 | Run Complete |
