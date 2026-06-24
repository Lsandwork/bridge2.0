/** Shared client helpers for real-time Tess voice: record → transcribe → chat → speak */

import { logVoiceLatency, markVoiceLatency, measureVoiceLatency } from "./voiceLatency";

export type TessVoiceStatus =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "speaking";

export type VoiceCapabilities = {
  serverTranscribe: boolean;
  serverSpeak: boolean;
  voiceName: string;
};

let cachedCaps: VoiceCapabilities | null = null;
let capsPromise: Promise<VoiceCapabilities> | null = null;
let activeAudio: HTMLAudioElement | null = null;
let sharedAudioCtx: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let amplitudeRaf: number | null = null;
let onAmplitudeCallback: ((level: number) => void) | null = null;

export function stopTessVoice() {
  if (amplitudeRaf) {
    cancelAnimationFrame(amplitudeRaf);
    amplitudeRaf = null;
  }
  onAmplitudeCallback = null;
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/** Pre-warm voice system on page load / first interaction. */
export async function prewarmTessVoice(): Promise<VoiceCapabilities> {
  const caps = await fetchVoiceCapabilities();
  if (typeof window !== "undefined") {
    try {
      if (!sharedAudioCtx) sharedAudioCtx = new AudioContext();
      if (sharedAudioCtx.state === "suspended") await sharedAudioCtx.resume();
    } catch {
      /* ignore */
    }
  }
  return caps;
}

export async function fetchVoiceCapabilities(): Promise<VoiceCapabilities> {
  if (cachedCaps) return cachedCaps;
  if (capsPromise) return capsPromise;

  capsPromise = (async () => {
    try {
      const res = await fetch("/api/tess/voice/status");
      const data = await res.json();
      cachedCaps = {
        serverTranscribe: Boolean(data.serverTranscribe),
        serverSpeak: Boolean(data.serverSpeak),
        voiceName: data.voiceName ?? "nova",
      };
    } catch {
      cachedCaps = { serverTranscribe: false, serverSpeak: false, voiceName: "nova" };
    }
    return cachedCaps;
  })();

  return capsPromise;
}

export function subscribeTessAudioLevel(callback: (level: number) => void) {
  onAmplitudeCallback = callback;
  return () => {
    if (onAmplitudeCallback === callback) onAmplitudeCallback = null;
  };
}

function trackAmplitude(audio: HTMLAudioElement) {
  if (amplitudeRaf) cancelAnimationFrame(amplitudeRaf);
  try {
    if (!sharedAudioCtx) sharedAudioCtx = new AudioContext();
    const source = sharedAudioCtx.createMediaElementSource(audio);
    analyserNode = sharedAudioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    source.connect(analyserNode);
    analyserNode.connect(sharedAudioCtx.destination);
    const data = new Uint8Array(analyserNode.frequencyBinCount);

    const tick = () => {
      if (!analyserNode || !onAmplitudeCallback) return;
      analyserNode.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length / 255;
      onAmplitudeCallback(Math.min(Math.max(avg * 1.4, 0), 1));
      amplitudeRaf = requestAnimationFrame(tick);
    };
    tick();
  } catch {
    /* MediaElementSource can only be created once per element — fallback to CSS mouth */
    if (onAmplitudeCallback) {
      let t = 0;
      const fallback = () => {
        t += 0.08;
        onAmplitudeCallback?.(0.35 + Math.sin(t) * 0.25);
        amplitudeRaf = requestAnimationFrame(fallback);
      };
      fallback();
    }
  }
}

export function pickFemaleBrowserVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const prefer = [
    /samantha/i,
    /victoria/i,
    /karen/i,
    /moira/i,
    /fiona/i,
    /google uk english female/i,
    /google us english.*female/i,
    /female/i,
    /zira/i,
  ];
  for (const pattern of prefer) {
    const match = voices.find((v) => pattern.test(v.name));
    if (match) return match;
  }
  return voices.find((v) => v.lang.startsWith("en")) ?? null;
}

export async function speakWithTessVoice(
  text: string,
  options?: {
    muted?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onAudioLevel?: (level: number) => void;
  }
): Promise<void> {
  if (options?.muted || !text.trim()) {
    options?.onEnd?.();
    return;
  }

  markVoiceLatency("tts-start");
  options?.onStart?.();

  if (options?.onAudioLevel) {
    onAmplitudeCallback = options.onAudioLevel;
  }

  try {
    const res = await fetch("/api/tess/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    markVoiceLatency("tts-ready");

    if (data.audioBase64) {
      await new Promise<void>((resolve, reject) => {
        const audio = new Audio(`data:${data.mimeType ?? "audio/mpeg"};base64,${data.audioBase64}`);
        activeAudio = audio;
        audio.onended = () => {
          if (amplitudeRaf) cancelAnimationFrame(amplitudeRaf);
          amplitudeRaf = null;
          onAmplitudeCallback = null;
          activeAudio = null;
          resolve();
        };
        audio.onerror = () => {
          if (amplitudeRaf) cancelAnimationFrame(amplitudeRaf);
          activeAudio = null;
          reject(new Error("Audio playback failed"));
        };
        void audio.play().then(() => {
          markVoiceLatency("playback-start");
          const ttsMs = measureVoiceLatency("tts-start", "tts-ready");
          const totalMs = measureVoiceLatency("user-stop", "playback-start");
          logVoiceLatency({ ttsMs, playbackStartMs: totalMs });
          trackAmplitude(audio);
        }).catch(reject);
      });
      options?.onEnd?.();
      return;
    }
  } catch {
    /* fall through to browser TTS */
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    markVoiceLatency("playback-start");
    if (options?.onAudioLevel) {
      let t = 0;
      const speakLoop = () => {
        t += 0.1;
        options.onAudioLevel?.(0.4 + Math.sin(t) * 0.3);
        amplitudeRaf = requestAnimationFrame(speakLoop);
      };
      speakLoop();
    }
    await new Promise<void>((resolve) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 0.95;
      utter.pitch = 1.05;
      const female = pickFemaleBrowserVoice();
      if (female) utter.voice = female;
      utter.onend = () => {
        if (amplitudeRaf) cancelAnimationFrame(amplitudeRaf);
        onAmplitudeCallback = null;
        resolve();
      };
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
    });
  }

  options?.onEnd?.();
}

export async function transcribeRecording(blob: Blob): Promise<string> {
  markVoiceLatency("transcribe-start");
  const form = new FormData();
  form.append("audio", blob, "tess-recording.webm");
  const res = await fetch("/api/tess/voice/transcribe", { method: "POST", body: form });
  const data = await res.json();
  markVoiceLatency("transcribe-end");
  if (!res.ok) throw new Error(data.error ?? "Could not understand audio");
  if (!data.transcript?.trim()) throw new Error("No speech detected. Try again.");
  logVoiceLatency({ transcribeMs: measureVoiceLatency("transcribe-start", "transcribe-end") });
  return data.transcript.trim();
}

export class TessAudioRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  async start(): Promise<void> {
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
    this.recorder = new MediaRecorder(this.stream, { mimeType });
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.start(250);
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.recorder) {
        reject(new Error("Not recording"));
        return;
      }
      const recorder = this.recorder;
      recorder.onstop = () => {
        markVoiceLatency("user-stop");
        const blob = new Blob(this.chunks, { type: recorder.mimeType || "audio/webm" });
        this.cleanup();
        resolve(blob);
      };
      recorder.onerror = () => {
        this.cleanup();
        reject(new Error("Recording failed"));
      };
      if (recorder.state !== "inactive") recorder.stop();
    });
  }

  cancel(): void {
    if (this.recorder?.state !== "inactive") this.recorder?.stop();
    this.cleanup();
  }

  private cleanup(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
  }
}

/** Browser speech recognition fallback when server STT unavailable */
export function listenWithBrowserSpeech(): Promise<string> {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      reject(new Error("Microphone speech not supported in this browser."));
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (ev) => {
      markVoiceLatency("user-stop");
      const t = ev.results[0]?.[0]?.transcript?.trim();
      if (t) resolve(t);
      else reject(new Error("No speech detected."));
    };
    rec.onerror = (ev: Event) => {
      const code = (ev as Event & { error?: string }).error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        reject(new Error("Microphone blocked. Allow mic access in browser settings, then refresh."));
      } else if (code === "no-speech") {
        reject(new Error("No speech detected. Tap mic, wait for Listening…, then speak clearly."));
      } else if (code === "network") {
        reject(new Error("Browser speech needs internet. Add OPENAI_API_KEY for reliable voice."));
      } else {
        reject(new Error("Could not hear you. Add OPENAI_API_KEY in .env.local for real voice, then restart the server."));
      }
    };
    rec.start();
  });
}
