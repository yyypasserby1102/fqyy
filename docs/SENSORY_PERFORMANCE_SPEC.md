# Sensory, Playtest, and Loading Completion Spec

## Goal

Finish the four post-art priorities without changing Run rules: realm-transition and Heavenly Tribulation presentation, complete synthesized audio, an end-to-end pacing/clarity playtest, and initial-load optimization.

## 1. Realm and Tribulation presentation

- Accepted Phase Transitions receive a short non-blocking cultivation banner naming the destination Realm Phase.
- Stage Breakthroughs receive a stronger banner naming the new Stage before its Gongfa choice resolves.
- The three Yuanying Heavenly Tribulation phases and final victory each receive distinct celestial presentation.
- Presentation may animate while gameplay or a choice is paused, must not add progression delays, and must remain legible at 1280 × 720 and narrow viewports.
- Camera flash/shake may reinforce major beats but must not change world coordinates, arena bounds, decision ordering, or persistence.

## 2. Synthesized audio

- Keep the no-downloaded-audio approach and extend the Web Audio synthesizer.
- Provide restrained cues for casting, hits, Evade, Qi collection, Healing Pills, Spirit Treasures, choice open/accept, Mastery rank-up, Breakthrough, Tribulation, victory, and defeat.
- Provide a quiet, distinct ambient drone for Lianqi, Zhuji, Jindan, and Yuanying.
- Audio must remain a fail-safe no-op where Web Audio is unavailable and must tolerate autoplay suspension.
- Dense combat cues are throttled so they do not become continuous noise.

## 3. Full-Run playtest

- Exercise the production journey from Mortal through all four Stages and the Yuanying Heavenly Tribulation.
- Audit phase pacing, difficulty escalation, HUD/choice clarity, transition ordering, late-Stage HUD containment, and completion persistence.
- Record evidence and correct every concrete issue discovered; do not rebalance solely from accelerated test timing.

## 4. Initial-load and texture optimization

- The title and Candidate shell must not download or evaluate Phaser or gameplay texture modules.
- Begin loading the game runtime only after a Candidate is selected or Continue is accepted.
- Show an accessible loading state during the asynchronous handoff and recover visibly if loading fails.
- Preserve seeded Candidate generation, persistence, Continue/abandon behavior, game dimensions, and development-only test harness behavior.
- Production build output must demonstrate a small opening entry chunk and a separate lazy gameplay chunk.

## Acceptance evidence

- Browser tests use the existing DOM shell and `window.__gameTest` seams.
- Test snapshots expose current/last journey presentation and audio cue/ambience state.
- Browser captures cover a Stage Breakthrough and Heavenly Tribulation arrival.
- A playtest report records the full journey audit and measured build/loading results.
- Typecheck, lint, unit tests, production build, and the full browser suite pass.
