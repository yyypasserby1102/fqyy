/**
 * Procedural sound effects, synthesised with the Web Audio API so the project
 * ships no audio assets and can follow the Run's realm without downloaded
 * loops. Every method is
 * fail-safe: if the Web Audio API is unavailable (server-side rendering, tests,
 * a locked-down browser) the calls are silent no-ops rather than throwing.
 */

import type { StageId } from "../data/stages";
import { getSettings, subscribeSettings, type GameSettings } from "../persistence/settingsPersistence";

type AudioContextCtor = typeof AudioContext;

let sharedContext: AudioContext | null = null;
let sharedMaster: GainNode | null = null;
let sharedSfx: GainNode | null = null;
let sharedAmbience: GainNode | null = null;
let contextUnavailable = false;
let ambienceNodes: AudioScheduledSourceNode[] = [];
let ambienceGain: GainNode | null = null;
let audioSettings = getSettings();

function applyAudioSettings(settings: GameSettings): void {
  audioSettings = settings;
  if (!sharedContext || !sharedMaster || !sharedSfx || !sharedAmbience) return;
  const now = sharedContext.currentTime;
  sharedMaster.gain.setTargetAtTime(settings.muted ? 0 : settings.masterVolume, now, 0.025);
  sharedSfx.gain.setTargetAtTime(settings.sfxVolume, now, 0.025);
  sharedAmbience.gain.setTargetAtTime(settings.ambienceVolume, now, 0.08);
}

subscribeSettings(applyAudioSettings);

export type SoundCue =
  | "cast"
  | "hit"
  | "evade"
  | "qi-pickup"
  | "healing-pill"
  | "spirit-treasure"
  | "choice-open"
  | "choice-accept"
  | "rank-up"
  | "phase-transition"
  | "breakthrough"
  | "tribulation"
  | "victory"
  | "death";

export interface SoundFxSnapshot {
  ambience: StageId | "none";
  lastCue: SoundCue | "";
  cueCount: number;
  recentCues: SoundCue[];
}

function getContext(): AudioContext | null {
  if (contextUnavailable) {
    return null;
  }
  if (typeof window === "undefined") {
    contextUnavailable = true;
    return null;
  }
  if (!sharedContext) {
    try {
      const Ctor: AudioContextCtor | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
      if (!Ctor) {
        contextUnavailable = true;
        return null;
      }
      sharedContext = new Ctor();
      sharedMaster = sharedContext.createGain();
      sharedSfx = sharedContext.createGain();
      sharedAmbience = sharedContext.createGain();
      sharedSfx.connect(sharedMaster);
      sharedAmbience.connect(sharedMaster);
      sharedMaster.connect(sharedContext.destination);
      applyAudioSettings(audioSettings);
    } catch {
      contextUnavailable = true;
      return null;
    }
  }
  if (sharedContext.state === "suspended") {
    void sharedContext.resume();
  }
  return sharedContext;
}

interface ToneSpec {
  freq: number;
  type: OscillatorType;
  duration: number;
  gain: number;
  freqEnd?: number;
  delay?: number;
}

interface NoiseSpec {
  duration: number;
  gain: number;
  cutoffStart: number;
  cutoffEnd: number;
}

export class SoundFx {
  private lastHitMs = 0;
  private lastCastMs = 0;
  private ambience: StageId | "none" = "none";
  private lastCue: SoundCue | "" = "";
  private cueCount = 0;
  private readonly recentCues: SoundCue[] = [];

  private record(cue: SoundCue): void {
    this.lastCue = cue;
    this.cueCount += 1;
    this.recentCues.push(cue);
    if (this.recentCues.length > 16) {
      this.recentCues.shift();
    }
  }

  private tone(spec: ToneSpec): void {
    const ctx = getContext();
    if (!ctx || !sharedSfx) {
      return;
    }
    const t0 = ctx.currentTime + (spec.delay ?? 0);
    const osc = ctx.createOscillator();
    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.freq, t0);
    if (spec.freqEnd) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.freqEnd), t0 + spec.duration);
    }
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(spec.gain, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + spec.duration);
    osc.connect(gain);
    gain.connect(sharedSfx);
    osc.start(t0);
    osc.stop(t0 + spec.duration + 0.02);
  }

  private noise(spec: NoiseSpec): void {
    const ctx = getContext();
    if (!ctx || !sharedSfx) {
      return;
    }
    const t0 = ctx.currentTime;
    const frames = Math.max(1, Math.floor(ctx.sampleRate * spec.duration));
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(spec.cutoffStart, t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(1, spec.cutoffEnd), t0 + spec.duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(spec.gain, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + spec.duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(sharedSfx);
    source.start(t0);
    source.stop(t0 + spec.duration);
  }

  /** A successful hit — throttled so dense combat does not become a buzz. */
  hit(): void {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - this.lastHitMs < 45) {
      return;
    }
    this.lastHitMs = now;
    this.record("hit");
    this.tone({
      freq: 520 + Math.random() * 60,
      freqEnd: 300,
      type: "triangle",
      duration: 0.06,
      gain: 0.1
    });
  }

  cast(): void {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - this.lastCastMs < 90) {
      return;
    }
    this.lastCastMs = now;
    this.record("cast");
    this.noise({ duration: 0.07, gain: 0.055, cutoffStart: 900, cutoffEnd: 2100 });
  }

  pickup(): void {
    this.record("qi-pickup");
    this.tone({ freq: 680, freqEnd: 1020, type: "sine", duration: 0.09, gain: 0.14 });
  }

  healingPill(): void {
    this.record("healing-pill");
    this.tone({ freq: 420, freqEnd: 720, type: "sine", duration: 0.18, gain: 0.13 });
    this.tone({ freq: 630, type: "triangle", duration: 0.14, gain: 0.08, delay: 0.06 });
  }

  spiritTreasure(): void {
    this.record("spirit-treasure");
    this.tone({ freq: 360, freqEnd: 540, type: "triangle", duration: 0.24, gain: 0.14 });
    this.tone({ freq: 720, type: "sine", duration: 0.2, gain: 0.09, delay: 0.08 });
  }

  choiceOpen(): void {
    this.record("choice-open");
    this.tone({ freq: 300, freqEnd: 460, type: "sine", duration: 0.13, gain: 0.08 });
  }

  choiceAccept(): void {
    this.record("choice-accept");
    this.tone({ freq: 520, freqEnd: 760, type: "triangle", duration: 0.1, gain: 0.1 });
  }

  rankUp(): void {
    this.record("rank-up");
    this.tone({ freq: 440, type: "triangle", duration: 0.12, gain: 0.16 });
    this.tone({ freq: 660, type: "triangle", duration: 0.16, gain: 0.16, delay: 0.1 });
  }

  breakthrough(): void {
    this.record("breakthrough");
    this.tone({ freq: 220, freqEnd: 880, type: "sawtooth", duration: 0.4, gain: 0.16 });
    this.tone({ freq: 330, freqEnd: 1320, type: "sine", duration: 0.45, gain: 0.12, delay: 0.04 });
  }

  death(): void {
    this.record("death");
    this.tone({ freq: 320, freqEnd: 70, type: "sawtooth", duration: 0.5, gain: 0.2 });
  }

  evade(): void {
    this.record("evade");
    this.noise({ duration: 0.14, gain: 0.12, cutoffStart: 1600, cutoffEnd: 480 });
  }

  phaseTransition(): void {
    this.record("phase-transition");
    this.tone({ freq: 280, freqEnd: 560, type: "sine", duration: 0.3, gain: 0.11 });
    this.tone({ freq: 420, freqEnd: 840, type: "triangle", duration: 0.26, gain: 0.08, delay: 0.08 });
  }

  tribulation(): void {
    this.record("tribulation");
    this.noise({ duration: 0.38, gain: 0.14, cutoffStart: 180, cutoffEnd: 1200 });
    this.tone({ freq: 110, freqEnd: 55, type: "sawtooth", duration: 0.48, gain: 0.15 });
  }

  victory(): void {
    this.record("victory");
    [330, 495, 660, 990].forEach((freq, index) => {
      this.tone({ freq, type: "sine", duration: 0.5, gain: 0.1, delay: index * 0.11 });
    });
  }

  setAmbience(stage: StageId): void {
    this.ambience = stage;
    const ctx = getContext();
    if (!ctx || !sharedAmbience) {
      return;
    }

    ambienceNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // A node may already have ended during browser teardown.
      }
    });
    ambienceNodes = [];
    ambienceGain?.disconnect();

    const profiles: Record<StageId, [number, number, number]> = {
      lianqi: [110, 165, 0.012],
      zhuji: [82, 164, 0.013],
      jindan: [132, 264, 0.014],
      yuanying: [73, 219, 0.014]
    };
    const [root, overtone, level] = profiles[stage];
    ambienceGain = ctx.createGain();
    ambienceGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    ambienceGain.gain.exponentialRampToValueAtTime(level, ctx.currentTime + 1.2);
    ambienceGain.connect(sharedAmbience);

    const low = ctx.createOscillator();
    low.type = "sine";
    low.frequency.value = root;
    const high = ctx.createOscillator();
    high.type = stage === "yuanying" ? "triangle" : "sine";
    high.frequency.value = overtone;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = stage === "lianqi" ? 0.08 : 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = level * 0.24;
    lfo.connect(lfoGain);
    lfoGain.connect(ambienceGain.gain);
    low.connect(ambienceGain);
    high.connect(ambienceGain);
    low.start();
    high.start();
    lfo.start();
    ambienceNodes = [low, high, lfo];
  }

  getSnapshot(): SoundFxSnapshot {
    return {
      ambience: this.ambience,
      lastCue: this.lastCue,
      cueCount: this.cueCount,
      recentCues: [...this.recentCues]
    };
  }
}
