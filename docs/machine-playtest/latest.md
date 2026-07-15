# Machine whole-Run playtest

Generated from the public browser surface and `window.__gameTest` acceleration seam. Machine wall time is diagnostic only and must not be interpreted as game pacing. Coverage facts below seed human-playtest hypotheses; they do not establish subjective readability, mix quality, tactics, or difficulty.

| Measurement | Result |
| --- | --- |
| Commit | fd288df |
| Seed / Candidate | 2 / Fire-Metal Linggen |
| Outcome | victory |
| Machine wall time | 17.8 seconds |
| Save/resume cycles | 1 |
| Completed Run record | 1 |
| Choices observed | 67 |
| Final Gongfa / Mastery | 4 / rank 20 |
| Peak enemies sampled | 8 |

## Coverage

- Stages: lianqi, zhuji, jindan, yuanying
- Realm Phases: chuqi, zhongqi, houqi, dayuanman
- Arenas: mist-court, foundation-terrace, golden-core-sanctum, nascent-sky-dais
- Journey presentations: phase, breakthrough, tribulation, victory
- Audio cues: breakthrough, cast, choice-accept, choice-open, hit, phase-transition, qi-pickup, rank-up, tribulation, victory

## General-feel suggestions

- **Realm differentiation is present; readability is a human hypothesis.** All four arena variants and the phase/Breakthrough/Tribulation/victory presentation family appeared. Human sessions should verify that each change reads immediately during combat before this is treated as strong realm identity.
- **Choice cadence is the main human-check.** The accelerated Run surfaced 67 choice panels. That count supports testing for decision fatigue—especially near Realm transitions—but does not prove that the cadence feels excessive.
- **Build layering is present; tactical value is ungraded.** The Run retained four learned Gongfa through Yuanying. Human playtests should verify that the fourth path adds a readable tactical layer instead of only more simultaneous effects.
- **Major-beat cues are present; sensory hierarchy needs ears-on validation.** Phase, Breakthrough, Tribulation, and victory cues fired. Human sessions should compare their audible prominence with ordinary hit/cast sounds before judging the mix hierarchy.
- **Difficulty is intentionally ungraded.** Forced Qi and enemy cleanup prove state flow, persistence, and presentation—not challenge, real pacing, or fairness. Apply numerical balance changes only after the real-time human protocol reaches its evidence threshold.

## Checkpoint trace

| Checkpoint | Stage / Phase | Progress | Gongfa | Mastery | Enemies | Choice |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Mortal opening | lianqi / chuqi | 0 | 0 | 0 | 0 | — |
| Linggen awakened | lianqi / chuqi | 0 | 1 | 0 | 0 | — |
| Lianqi combat sample | lianqi / chuqi | 0 | 1 | 0 | 8 | — |
| lianqi Phase Transition | lianqi / chuqi | 100 | 1 | 2 | 0 | Phase Transition |
| lianqi Phase Transition | lianqi / zhongqi | 100 | 1 | 4 | 0 | Phase Transition |
| lianqi Phase Transition | lianqi / houqi | 100 | 1 | 6 | 0 | Phase Transition |
| lianqi Lianqi Tribulation | lianqi / dayuanman | 100 | 1 | 8 | 0 | Lianqi Tribulation |
| Entered zhuji | zhuji / chuqi | 0 | 2 | 8 | 0 | — |
| zhuji combat sample | zhuji / chuqi | 0 | 2 | 8 | 8 | — |
| zhuji Phase Transition | zhuji / chuqi | 100 | 2 | 10 | 0 | Phase Transition |
| zhuji Phase Transition | zhuji / zhongqi | 100 | 2 | 12 | 0 | Phase Transition |
| zhuji Phase Transition | zhuji / houqi | 100 | 2 | 14 | 0 | Phase Transition |
| zhuji Zhuji Tribulation | zhuji / dayuanman | 100 | 2 | 16 | 0 | Zhuji Tribulation |
| Entered jindan | jindan / chuqi | 0 | 3 | 16 | 0 | — |
| jindan combat sample | jindan / chuqi | 0 | 3 | 16 | 8 | — |
| jindan Phase Transition | jindan / chuqi | 100 | 3 | 18 | 0 | Phase Transition |
| jindan Phase Transition | jindan / zhongqi | 100 | 3 | 20 | 0 | Phase Transition |
| jindan Phase Transition | jindan / houqi | 100 | 3 | 20 | 0 | Phase Transition |
| jindan Jindan Tribulation | jindan / dayuanman | 100 | 3 | 20 | 0 | Jindan Tribulation |
| Entered yuanying | yuanying / chuqi | 0 | 4 | 20 | 0 | — |
| yuanying combat sample | yuanying / chuqi | 0 | 4 | 20 | 7 | — |
| yuanying Phase Transition | yuanying / chuqi | 100 | 4 | 20 | 0 | Phase Transition |
| yuanying Phase Transition | yuanying / zhongqi | 100 | 4 | 20 | 0 | Phase Transition |
| yuanying Phase Transition | yuanying / houqi | 100 | 4 | 20 | 0 | Phase Transition |
| yuanying Yuanying Heavenly Tribulation | yuanying / dayuanman | 100 | 4 | 20 | 0 | Yuanying Heavenly Tribulation |
| Heavenly Tribulation started | yuanying / dayuanman | 0 | 4 | 20 | 2 | — |
| Heavenly Tribulation resumed | yuanying / dayuanman | 0 | 4 | 20 | 2 | — |
| Boss resolution 1 | yuanying / dayuanman | 0 | 4 | 20 | 0 | Yuanying Heavenly Tribulation |
| Boss resolution 2 | yuanying / dayuanman | 0 | 4 | 20 | 0 | Yuanying Heavenly Tribulation |
| Boss resolution 3 | yuanying / dayuanman | 0 | 4 | 20 | 0 | Run Complete |
| Ascendant victory | yuanying / dayuanman | 0 | 4 | 20 | 0 | Run Complete |
