/**
 * Gentle royalty-free dance beat via Web Audio API.
 * No copyrighted audio — soft upbeat pulse for emotion-aware support flow.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let beatTimer: number | null = null;
let isPlaying = false;

const DEFAULT_VOLUME = 0.35;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = DEFAULT_VOLUME;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

function playSoftTone(ctx: AudioContext, freq: number, start: number, duration: number, volume = 0.08) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(masterGain!);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export async function prewarmDanceAudio() {
  const ctx = getContext();
  if (ctx.state === "suspended") await ctx.resume();
}

export async function startTessDanceMusic(volume = DEFAULT_VOLUME) {
  await prewarmDanceAudio();
  if (isPlaying) return;
  isPlaying = true;
  const ctx = getContext();
  if (masterGain) masterGain.gain.value = volume;

  const bpm = 100;
  const beatMs = (60_000 / bpm) / 2;

  const tick = () => {
    if (!isPlaying) return;
    const now = ctx.currentTime;
    playSoftTone(ctx, 392, now, 0.15, 0.06);
    playSoftTone(ctx, 523.25, now + 0.08, 0.12, 0.04);
  };

  tick();
  beatTimer = window.setInterval(tick, beatMs);
}

export function stopTessDanceMusic() {
  isPlaying = false;
  if (beatTimer) {
    window.clearInterval(beatTimer);
    beatTimer = null;
  }
  if (masterGain) {
    masterGain.gain.linearRampToValueAtTime(0.001, getContext().currentTime + 0.3);
    window.setTimeout(() => {
      if (masterGain && !isPlaying) masterGain.gain.value = DEFAULT_VOLUME;
    }, 350);
  }
}

export function setDanceMusicVolume(volume: number) {
  if (masterGain) {
    masterGain.gain.value = Math.min(Math.max(volume, 0), 1);
  }
}

export function isDanceMusicPlaying() {
  return isPlaying;
}
