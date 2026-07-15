# Real-time difficulty playtest protocol

Use this protocol for human balance sessions. Do not use the accelerated browser harness, forced Qi, forced enemies, or debug choices: those remain regression tools and cannot justify numerical tuning.

## Release candidate setup

1. Test the deployed production URL in fullscreen at the tester's preferred display scale.
2. Start with default settings. Record any accessibility changes the tester chooses.
3. Start a new Run and let the tester make every Candidate, movement, Evade, Gongfa, Mastery, Treasure, and Breakthrough decision.
4. Do not coach during combat. Stop only at death, victory, abandonment, or 45 minutes.

## Session record

Record one row per session in a dated copy of this document:

| Field | Value |
| --- | --- |
| Build commit | |
| Tester/session ID | |
| Input method and viewport | |
| Accessibility settings | |
| Outcome and final Stage/Phase | |
| Real elapsed time | |
| First damage / first near-death time | |
| Death cause or hardest threat | |
| Gongfa and major choices | |
| Moments of confusion | |
| Most/least satisfying moment | |

## Tuning gate

Collect at least five independent real-time sessions, including two first-time players. Tune only repeated observations: at least three sessions must identify the same pacing or difficulty problem. Preserve the raw notes, state the proposed numerical change and expected effect, then rerun the complete automated suite plus two confirmation sessions. Accelerated automation may verify the resulting rule but never supplies the balance evidence.
