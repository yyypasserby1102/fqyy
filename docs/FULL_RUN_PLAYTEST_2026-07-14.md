# Full Run Playtest — 2026-07-14

## Scope and method

This audit covers the production journey from Cultivator Candidate selection through the Mortal opening, Lianqi, Zhuji, Jindan, Yuanying, all Realm Phases, the three-part Heavenly Tribulation, victory persistence, sensory feedback, and initial loading.

The browser journey used the same public `window.__gameTest` seam as the regression suite to make Candidate generation deterministic and accelerate Qi collection. Stage transitions, choices, autosaves, arena replacement, Gongfa acquisition, boss phase advancement, and completion still ran through production code. Accelerated Qi timing was not used to infer real-time balance.

## Results

| Area | Evidence | Result |
| --- | --- | --- |
| Full journey | `Yuanying phases lead into the Heavenly Tribulation and complete the Run` | Pass; all four Stages, four Gongfa slots, three boss phases, completion record, and active-save deletion verified |
| Phase pacing | Four real Phase Transition decisions per Stage | Pass; cleanup and choice ordering remained stable |
| Difficulty escalation | `stageWaveSpawns`, 18-enemy soft cap, Stage reset browser assertion | Fixed; wave elapsed time previously leaked across Stages, allowing Zhuji to start at the maximum spawn tier after a long Lianqi |
| Stage clarity | Four arena snapshots plus Breakthrough capture | Pass; arena geometry/tint changes before the new Gongfa resolves |
| Tribulation clarity | Live Heavenly Tribulation capture and UI snapshot | Pass; phase number, celestial pattern, HUD, and arena remain legible |
| Late-Stage HUD | Yuanying capture at Mastery Rank 20 | Pass; status and Gongfa regions contain all text |
| Audio | Browser-observable cue history and active ambience | Pass; casting, hit, Evade, pickups, choices, rank-up, phase, Breakthrough, Tribulation, victory, and defeat paths are distinct and throttled |
| Persistence | Reload before boss plus return after victory | Pass; final boss resumes and victory removes Continue |

## Visual evidence

- [`visual-review/realm-breakthrough.png`](visual-review/realm-breakthrough.png)
- [`visual-review/heavenly-tribulation.png`](visual-review/heavenly-tribulation.png)
- [`visual-review/arena-lianqi.png`](visual-review/arena-lianqi.png)
- [`visual-review/arena-zhuji.png`](visual-review/arena-zhuji.png)
- [`visual-review/arena-jindan.png`](visual-review/arena-jindan.png)
- [`visual-review/arena-yuanying.png`](visual-review/arena-yuanying.png)

## Loading measurements

Before this pass, the opening entry JavaScript was approximately **1,902.50 kB** minified (**435.55 kB gzip**) and evaluated Phaser plus gameplay asset modules on the title screen.

After lazy loading:

- opening entry: **35.58 kB** minified (**9.86 kB gzip**)
- lazy gameplay chunk: **1,877.59 kB** minified (**429.45 kB gzip**)
- Phaser and gameplay textures: no requests on title or Candidate selection; requests begin only after Candidate selection or Continue
- reduction in opening JavaScript gzip: approximately **97.7%**

The title painting remains an intentional opening asset. Gameplay textures remain isolated behind the asynchronous arena handoff, which displays an accessible loading status and a recoverable error state.

## Follow-up threshold

No further balance change is justified from accelerated automation alone. Future numerical tuning should use human, real-time sessions with run duration, damage taken, death Stage, and build choice notes. The concrete cross-Stage escalation defect found by this audit is fixed and regression-covered.
