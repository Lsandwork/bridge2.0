"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type TessQuickAction } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";
import {
  fetchVoiceCapabilities,
  listenWithBrowserSpeech,
  prewarmTessVoice,
  speakWithTessVoice,
  TessAudioRecorder,
  transcribeRecording,
  type VoiceCapabilities,
} from "@/lib/tess/voice-client";
import {
  detectEmergencySafetyConcern,
  detectFeelingBetter,
  detectSupportiveDanceTrigger,
} from "@/lib/tess/emotionDetection";
import { logVoiceLatency, markVoiceLatency, measureVoiceLatency } from "@/lib/tess/voiceLatency";
import { useTessDanceBreak } from "@/hooks/useTessDanceBreak";
import {
  quickActionTessState,
  resolveTessState,
  speakingVisualDurationMs,
  type TessState,
} from "./tessAnimationState";
import { useTessEngagement } from "./useTessEngagement";
import type { TessMotionPresetKey } from "./tessMotionPreset";
import type { TessInputMode, TessMessage } from "./tessTypes";

type Options = {
  childProfileId?: string;
  userName?: string;
  mode?: string;
  defaultInputMode?: TessInputMode;
  tessVoiceEnabled: boolean;
  quickActions?: TessQuickAction[];
  motionPreset?: TessMotionPresetKey;
};

export function useTessChatSession({
  childProfileId = "cp1",
  userName = "friend",
  mode = "text",
  defaultInputMode = "talk",
  tessVoiceEnabled,
  quickActions = [],
  motionPreset = "chat",
}: Options) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<TessMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<TessInputMode>(defaultInputMode);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stateOverride, setStateOverride] = useState<TessState | null>(null);
  const [activeQuickId, setActiveQuickId] = useState<string | null>(null);
  const [lastReply, setLastReply] = useState("");
  const [caps, setCaps] = useState<VoiceCapabilities | null>(null);
  const [welcomed, setWelcomed] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [danceStopMessage, setDanceStopMessage] = useState<string | null>(null);

  const dance = useTessDanceBreak();

  const bottomRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<TessAudioRecorder | null>(null);
  const overrideTimerRef = useRef<number | null>(null);
  const welcomeSpokenRef = useRef(false);

  const chatMode = inputMode === "talk" ? "voice" : mode;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    void prewarmTessVoice().then(setCaps);
  }, []);

  useEffect(() => {
    return () => {
      if (overrideTimerRef.current) window.clearTimeout(overrideTimerRef.current);
    };
  }, []);

  const welcomeText = t("tess.companion.welcome", { name: userName });

  useEffect(() => {
    if (welcomed) return;
    setWelcomed(true);
    setMessages([{ id: "welcome", role: "assistant", content: welcomeText }]);
    setLastReply(welcomeText);
  }, [welcomed, welcomeText]);

  const coreBusy =
    Boolean(stateOverride) ||
    loading ||
    isSpeaking ||
    isRecording ||
    (inputMode === "text" && input.trim().length > 0);

  const { isWaving, bumpActivity } = useTessEngagement({
    enabled: !coreBusy,
    motionPreset,
  });

  const tessState = useMemo(
    () =>
      resolveTessState({
        override: stateOverride,
        isWaving,
        isRecording,
        isThinking: loading,
        isSpeaking,
        hasInput: inputMode === "text" && input.trim().length > 0,
        isTalkMode: inputMode === "talk" && !isRecording && !loading && !isSpeaking && !isWaving,
      }),
    [stateOverride, isWaving, isRecording, inputMode, loading, isSpeaking, input]
  );

  const setTemporaryState = useCallback((state: TessState, ms = 2200) => {
    setStateOverride(state);
    if (overrideTimerRef.current) window.clearTimeout(overrideTimerRef.current);
    overrideTimerRef.current = window.setTimeout(() => {
      setStateOverride(null);
      overrideTimerRef.current = null;
    }, ms);
  }, []);

  const playReply = useCallback(
    async (text: string) => {
      setLastReply(text);
      setVoiceError(null);
      bumpActivity();
      setIsSpeaking(true);
      setAudioLevel(0.35);
      try {
        if (tessVoiceEnabled) {
          await speakWithTessVoice(text, {
            onAudioLevel: (level) => setAudioLevel(level),
          });
        } else {
          let t = 0;
          const visual = window.setInterval(() => {
            t += 0.1;
            setAudioLevel(0.35 + Math.sin(t) * 0.25);
          }, 80);
          await new Promise((r) => window.setTimeout(r, speakingVisualDurationMs(text)));
          window.clearInterval(visual);
        }
      } catch {
        setVoiceError(t("tess.companion.voiceUnavailable"));
      } finally {
        setAudioLevel(0);
        setIsSpeaking(false);
      }
    },
    [tessVoiceEnabled, bumpActivity, t]
  );

  const speakMessage = useCallback(
    async (text: string) => {
      bumpActivity();
      setIsSpeaking(true);
      setAudioLevel(0.35);
      setVoiceError(null);
      try {
        await speakWithTessVoice(text, {
          onAudioLevel: (level) => setAudioLevel(level),
          onEnd: () => setIsSpeaking(false),
        });
      } catch {
        setVoiceError(t("tess.companion.voiceUnavailable"));
        setIsSpeaking(false);
      } finally {
        setAudioLevel(0);
      }
    },
    [bumpActivity, t]
  );

  useEffect(() => {
    if (!welcomed || welcomeSpokenRef.current || !tessVoiceEnabled) return;
    welcomeSpokenRef.current = true;
    const timer = window.setTimeout(() => {
      void playReply(welcomeText);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [welcomed, tessVoiceEnabled, welcomeText, playReply]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      if (dance.checkUserTextDuringDance(text)) {
        setDanceStopMessage("Nice job. I'm here with you.");
        setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: text }]);
        return;
      }

      if (detectEmergencySafetyConcern(text)) {
        dance.showSafetySupport();
      } else if (detectSupportiveDanceTrigger(text)) {
        dance.offerDance(text);
      } else if (detectFeelingBetter(text) && dance.isDancing) {
        dance.stopDance();
        setDanceStopMessage("Nice job. I'm here with you.");
      }

      setError(null);
      setStateOverride(null);
      bumpActivity();
      setShowQuickHelp(false);
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: text }]);
      setInput("");
      setShowTypeInput(false);
      setLoading(true);
      markVoiceLatency("ai-start");

      try {
        const res = await fetch("/api/tess/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, conversationId, childProfileId, mode: chatMode }),
        });
        const data = await res.json();
        markVoiceLatency("ai-end");
        if (!res.ok) throw new Error(data.error);
        if (data.conversationId) setConversationId(data.conversationId);
        const reply = data.message?.content ?? data.error ?? "No response";
        setMessages((prev) => [
          ...prev,
          {
            id: data.message?.id ?? `a-${Date.now()}`,
            role: "assistant",
            content: reply,
            recommendations: data.recommendations,
            recommendationMeta: data.recommendationMeta,
          },
        ]);
        setLoading(false);
        logVoiceLatency({ aiResponseMs: measureVoiceLatency("ai-start", "ai-end") });
        await playReply(reply);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send");
        setLoading(false);
      }
    },
    [loading, conversationId, childProfileId, chatMode, playReply, bumpActivity, dance]
  );

  const processVoiceRecording = useCallback(
    async (blob: Blob) => {
      setLoading(true);
      try {
        const text = caps?.serverTranscribe
          ? await transcribeRecording(blob)
          : await listenWithBrowserSpeech();
        await send(text);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not understand audio");
        setLoading(false);
      }
    },
    [caps?.serverTranscribe, send]
  );

  const startRecording = useCallback(async () => {
    if (loading || isSpeaking) return;
    setError(null);
    bumpActivity();
    try {
      if (!caps?.serverTranscribe) {
        setIsRecording(true);
        const text = await listenWithBrowserSpeech();
        setIsRecording(false);
        await send(text);
        return;
      }
      const recorder = new TessAudioRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setIsRecording(true);
    } catch (e) {
      setIsRecording(false);
      setError(e instanceof Error ? e.message : "Microphone access denied");
    }
  }, [loading, isSpeaking, caps?.serverTranscribe, send, bumpActivity]);

  const stopRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder || !isRecording) return;
    try {
      const blob = await recorder.stop();
      recorderRef.current = null;
      setIsRecording(false);
      if (blob.size < 800) {
        setError("Recording too short. Tap the mic and try again.");
        return;
      }
      await processVoiceRecording(blob);
    } catch (e) {
      setIsRecording(false);
      setError(e instanceof Error ? e.message : "Recording failed");
    }
  }, [isRecording, processVoiceRecording]);

  const handleMicToggle = useCallback(() => {
    bumpActivity();
    if (inputMode === "text") {
      setInputMode("talk");
      return;
    }
    if (isRecording) void stopRecording();
    else void startRecording();
  }, [bumpActivity, inputMode, isRecording, stopRecording, startRecording]);

  const handleQuickAction = useCallback(
    (action: TessQuickAction) => {
      bumpActivity();
      const mood = quickActionTessState(action.id);
      if (mood) setTemporaryState(mood);
      setActiveQuickId(action.id);
      setShowQuickHelp(false);
      window.setTimeout(() => setActiveQuickId(null), 600);
      void send(action.prompt);
    },
    [bumpActivity, setTemporaryState, send]
  );

  const switchInputMode = useCallback(
    (next: TessInputMode) => {
      bumpActivity();
      setInputMode(next);
      if (next === "text" && isRecording) {
        recorderRef.current?.cancel();
        setIsRecording(false);
      }
    },
    [bumpActivity, isRecording]
  );

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    voiceError,
    inputMode,
    isSpeaking,
    isRecording,
    tessState,
    activeQuickId,
    lastReply,
    showQuickHelp,
    setShowQuickHelp,
    showTypeInput,
    setShowTypeInput,
    bottomRef,
    quickActions,
    bumpActivity,
    send,
    speakMessage,
    handleMicToggle,
    handleQuickAction,
    switchInputMode,
    startRecording,
    stopRecording,
    audioLevel,
    dance,
    danceStopMessage,
  };
}

export type TessChatSession = ReturnType<typeof useTessChatSession>;
