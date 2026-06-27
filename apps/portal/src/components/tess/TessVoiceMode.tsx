"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, MessageSquare, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { TessAnimatedCharacter } from "./TessAnimatedCharacter";
import { TessStatusLabel } from "./TessStatusLabel";
import { mapVoiceStatusToCharacter } from "./tessCharacterState";
import {
  TessAudioRecorder,
  fetchVoiceCapabilities,
  speakWithTessVoice,
  transcribeRecording,
  listenWithBrowserSpeech,
  type TessVoiceStatus,
  type VoiceCapabilities,
} from "@/lib/tess/voice-client";

type Props = {
  childProfileId?: string;
  mode?: string;
  onSwitchToText?: () => void;
  compact?: boolean;
};

export function TessVoiceMode({
  childProfileId,
  mode = "voice",
  onSwitchToText,
  compact = false,
}: Props) {
  const [status, setStatus] = useState<TessVoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [autoListen, setAutoListen] = useState(true);
  const [caps, setCaps] = useState<VoiceCapabilities | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const recorderRef = useRef<TessAudioRecorder | null>(null);
  const autoListenRef = useRef(autoListen);
  const mutedRef = useRef(muted);
  const startRecordingRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    autoListenRef.current = autoListen;
    mutedRef.current = muted;
  }, [autoListen, muted]);

  useEffect(() => {
    void fetchVoiceCapabilities().then(setCaps);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const sendToTess = useCallback(
    async (text: string) => {
      setStatus("thinking");
      setError(null);
      try {
        const res = await fetch("/api/tess/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            conversationId: conversationIdRef.current,
            childProfileId,
            mode,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (data.conversationId) conversationIdRef.current = data.conversationId;
        const reply = data.message?.content ?? "";
        setResponse(reply);
        await speakWithTessVoice(reply, {
          muted: mutedRef.current,
          onStart: () => setStatus("speaking"),
          onEnd: () => {
            setStatus("idle");
            if (autoListenRef.current && !mutedRef.current) {
              setTimeout(() => void startRecordingRef.current(), 800);
            }
          },
        });
        if (mutedRef.current) setStatus("idle");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Nuvio could not respond");
        setStatus("idle");
      }
    },
    [childProfileId, mode]
  );

  const processRecording = useCallback(
    async (blob: Blob) => {
      setStatus("transcribing");
      setError(null);
      try {
        let text: string;
        if (caps?.serverTranscribe) {
          text = await transcribeRecording(blob);
        } else {
          throw new Error("Voice transcription needs OPENAI_API_KEY. Set TESS_VOICE_PROVIDER=openai in server env.");
        }
        setTranscript(text);
        await sendToTess(text);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not understand audio");
        setStatus("idle");
      }
    },
    [caps?.serverTranscribe, sendToTess]
  );

  const startRecording = useCallback(async () => {
    if (status === "recording" || status === "thinking" || status === "speaking" || status === "transcribing") return;
    setError(null);
    setTranscript("");
    try {
      if (!caps?.serverTranscribe) {
        setStatus("recording");
        const text = await listenWithBrowserSpeech();
        setTranscript(text);
        await sendToTess(text);
        return;
      }
      const recorder = new TessAudioRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setStatus("recording");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Microphone access denied");
      setStatus("idle");
    }
  }, [status, caps?.serverTranscribe, sendToTess]);

  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  const stopRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder || status !== "recording") return;
    try {
      const blob = await recorder.stop();
      recorderRef.current = null;
      if (blob.size < 800) {
        setError("Recording too short. Tap the mic and speak again.");
        setStatus("idle");
        return;
      }
      await processRecording(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recording failed");
      setStatus("idle");
    }
  }, [status, processRecording]);

  const toggleMic = () => {
    if (status === "recording") void stopRecording();
    else void startRecording();
  };

  const repeatResponse = () => {
    if (!response) return;
    void speakWithTessVoice(response, {
      muted,
      onStart: () => setStatus("speaking"),
      onEnd: () => setStatus("idle"),
    });
  };

  const characterState = mapVoiceStatusToCharacter(status, Boolean(error));

  return (
    <div className={`flex flex-col ${compact ? "h-full" : "min-h-[420px]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2">
        <p className="text-xs font-bold text-[var(--brand)]">
          Talk mode ·{" "}
          {caps?.serverTranscribe
            ? `Real voice (Whisper + ${caps.voiceName})`
            : "Setup needed — add OPENAI_API_KEY"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${autoListen ? "bg-[var(--brand-light)] text-[var(--brand-dark)]" : "border"}`}
            onClick={() => setAutoListen(!autoListen)}
          >
            Keep talking
          </button>
          <button type="button" className="rounded-full border px-2 py-1 text-[10px] font-bold" onClick={() => setMuted(!muted)}>
            {muted ? <VolumeX className="inline h-3 w-3" /> : <Volume2 className="inline h-3 w-3" />} {muted ? "Muted" : "Sound on"}
          </button>
          {onSwitchToText ? (
            <button type="button" className="rounded-full border px-2 py-1 text-[10px] font-bold" onClick={onSwitchToText}>
              <MessageSquare className="inline h-3 w-3" /> Type
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        <TessAnimatedCharacter
          state={characterState}
          size="lg"
          showWaves
          enableIdleWave={characterState === "idle"}
        />

        <TessStatusLabel state={characterState} className="mt-6" />
        <p className="mt-1 text-center text-xs text-[var(--text-tertiary)]">
          {caps?.serverTranscribe
            ? "Tap mic → speak → tap again. Nuvio listens, thinks, and speaks back."
            : "Voice needs OPENAI_API_KEY in apps/portal/.env.local — then restart npm run dev."}
        </p>

        {!caps?.serverTranscribe ? (
          <div className="mt-4 max-w-sm rounded-xl bg-amber-50 px-4 py-3 text-left text-xs leading-relaxed text-amber-900">
            <p className="font-bold">Voice is not fully enabled yet</p>
            <p className="mt-1">
              Without an API key, the browser mic fallback often fails (the error you saw). Add this to{" "}
              <code className="rounded bg-amber-100 px-1">apps/portal/.env.local</code>:
            </p>
            <pre className="mt-2 overflow-x-auto rounded bg-white p-2 text-[10px]">
              {`OPENAI_API_KEY=sk-...
TESS_VOICE_PROVIDER=openai
TESS_VOICE_MODEL=nova`}
            </pre>
            <p className="mt-2">Restart the portal after saving. Chat can still use Gemini.</p>
          </div>
        ) : null}

        <button
          type="button"
          disabled={status === "thinking" || status === "transcribing" || status === "speaking"}
          className={`mt-8 flex h-20 w-20 items-center justify-center rounded-full shadow-lg ${
            status === "recording" ? "bg-red-600 text-white" : "bg-[var(--brand)] text-white"
          } disabled:opacity-50`}
          onClick={toggleMic}
          aria-label={status === "recording" ? "Stop and send" : "Start talking"}
        >
          {status === "recording" ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
        </button>
      </div>

      <div className="space-y-3 border-t border-[var(--border)] bg-[var(--surface-muted)]/50 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-tertiary)]">You said</p>
          <p className="mt-1 min-h-[1.5rem] text-sm leading-relaxed">{transcript || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-tertiary)]">Nuvio said</p>
          <p className="mt-1 min-h-[1.5rem] text-sm leading-relaxed">{response || "—"}</p>
        </div>
        {response ? (
          <button type="button" className="flex items-center gap-1 text-xs font-bold text-[var(--brand)]" onClick={repeatResponse}>
            <RotateCcw className="h-3 w-3" /> Hear again
          </button>
        ) : null}
        {error ? <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
