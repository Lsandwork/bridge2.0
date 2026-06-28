"use client";

import { Volume2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useCompanionPet } from "@/components/pets/CompanionPetProvider";
import { PetSprite } from "@/components/pets/PetSprite";
import { mapTessStateToCharacter } from "./tessCharacterState";
import { TessDanceHud } from "./TessDanceHud";
import { TessDancePrompt } from "./TessDancePrompt";
import { TessSafetySupport } from "./TessSafetySupport";
import { TessRecommendationCards } from "./TessRecommendationCards";
import { TessInputBar } from "./TessInputBar";
import { TessModeToggle } from "./TessModeToggle";
import { TessQuickActions } from "./TessQuickActions";
import { TessStatusCard } from "./TessStatusCard";
import { TessVoiceToggle } from "./TessVoiceToggle";
import { TessViewModeToggle } from "./TessViewModeToggle";
import type { TessChatSession } from "./useTessChatSession";
import type { TessViewMode } from "./tessTypes";

type Props = {
  session: TessChatSession;
  userName: string;
  viewMode: TessViewMode;
  onViewModeChange: (mode: TessViewMode) => void;
  voiceEnabled: boolean;
  onVoiceChange: (enabled: boolean) => void;
  embedded?: boolean;
  placeholder?: string;
};

export function TessChatMode({
  session,
  userName,
  viewMode,
  onViewModeChange,
  voiceEnabled,
  onVoiceChange,
  embedded = false,
  placeholder,
}: Props) {
  const { t } = useLanguage();
  const { state, awardXp } = useCompanionPet();
  const {
    messages,
    input,
    setInput,
    loading,
    error,
    voiceError,
    inputMode,
    switchInputMode,
    isRecording,
    tessState,
    activeQuickId,
    bottomRef,
    quickActions,
    bumpActivity,
    send,
    speakMessage,
    handleMicToggle,
    handleQuickAction,
    audioLevel,
    dance,
    danceStopMessage,
  } = session;

  const characterState = mapTessStateToCharacter(tessState, Boolean(error || voiceError), {
    isDancing: dance.isDancing,
  });

  return (
    <div className="tess-chat-shell tess-chat flex h-full flex-col">
      {!embedded ? (
        <header className="tess-chat-header">
          <div className="tess-chat-header__profile">
            <div className="tess-chat-header__avatar">
              <PetSprite species={state?.pet?.species ?? "spark"} mood={characterState} size="sm" motionLevel={state?.pet?.settings.motionLevel} />
            </div>
            <div className="min-w-0">
              <p className="tess-chat-header__name">
                Nuvio <span className="tess-chat-header__badge" aria-label="Verified">✓</span>
              </p>
              <p className="tess-chat-header__sub">{t("tess.companion.subtitle")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <TessViewModeToggle mode={viewMode} onChange={onViewModeChange} compact />
            <TessModeToggle mode={inputMode} onChange={switchInputMode} />
          </div>
        </header>
      ) : (
        <div className="flex items-center justify-end gap-2 border-b border-[var(--border)] px-3 py-2">
          <TessModeToggle mode={inputMode} onChange={switchInputMode} />
        </div>
      )}

      <div className="tess-messages flex-1 overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id} className={`tess-msg-row ${m.role === "user" ? "tess-msg-row--user" : ""}`}>
            {m.role === "assistant" ? (
              <span className="tess-msg-avatar">
                <PetSprite species={state?.pet?.species ?? "spark"} mood="idle" size="sm" motionLevel={state?.pet?.settings.motionLevel} />
              </span>
            ) : null}
            <div className={m.role === "user" ? "max-w-[88%]" : "max-w-full flex-1"}>
              <div
                className={`tess-msg-bubble ${
                  m.role === "user" ? "tess-msg-bubble--user" : "tess-msg-bubble--assistant"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.role === "assistant" && m.id !== "welcome" ? (
                  <button
                    type="button"
                    className="mt-2 flex items-center gap-1 text-xs font-bold text-[#6366f1]"
                    onClick={() => void speakMessage(m.content)}
                  >
                    <Volume2 className="h-3 w-3" /> {t("tess.chat.hearTess")}
                  </button>
                ) : null}
              </div>
              {m.role === "assistant" && m.recommendations?.length ? (
                <TessRecommendationCards
                  items={m.recommendations}
                  sourcesUsed={m.recommendationMeta?.sourcesUsed}
                  isFallback={m.recommendationMeta?.isFallback}
                />
              ) : null}
            </div>
          </div>
        ))}
        {loading ? (
          <p className="px-3 text-xs font-semibold text-[#66748a]" role="status">
            {t("tess.chat.thinking")}
          </p>
        ) : null}
        {danceStopMessage ? (
          <p className="mx-3 rounded-lg bg-violet-50 p-2 text-xs font-semibold text-violet-900" role="status">
            {danceStopMessage}
          </p>
        ) : null}
        {error ? <p className="mx-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p> : null}
        {voiceError ? <p className="mx-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">{voiceError}</p> : null}
        <div ref={bottomRef} />
      </div>

      <TessQuickActions
        actions={quickActions}
        activeId={activeQuickId}
        disabled={loading}
        onAction={handleQuickAction}
      />

      <TessStatusCard
        state={tessState}
        userName={userName}
        onCompanionTap={bumpActivity}
        hasError={Boolean(error || voiceError)}
        isDancing={dance.isDancing}
        audioLevel={audioLevel}
      />

      <div className="tess-speak-toggle">
        <TessVoiceToggle enabled={voiceEnabled} onChange={onVoiceChange} />
      </div>

      <TessInputBar
        mode={inputMode}
        value={input}
        loading={loading}
        isRecording={isRecording}
        onChange={(v) => {
          setInput(v);
          if (v.trim()) bumpActivity();
        }}
        onSend={() => {
          if (input.trim()) void awardXp("send_chat_message", { source: "nuvio_chat" });
          void send(input);
        }}
        onMicToggle={() => {
          if (!isRecording) void awardXp("voice_chat", { source: "nuvio_chat" });
          handleMicToggle();
        }}
        placeholder={placeholder}
      />

      <TessDancePrompt
        open={dance.shouldShowDancePrompt || dance.phase === "continue-prompt"}
        phase={dance.phase}
        secondsRemaining={dance.danceSecondsRemaining}
        onStart={() => void dance.startDance()}
        onContinue={() => void dance.continueDance()}
        onStop={() => {
          dance.stopDance();
        }}
        onDismiss={dance.dismissDancePrompt}
      />
      <TessDanceHud
        visible={dance.isDancing && dance.danceSecondsRemaining > 0}
        secondsRemaining={dance.danceSecondsRemaining}
        onStop={dance.stopDance}
      />
      <TessSafetySupport open={dance.showSafetyMessage} onDismiss={dance.dismissSafetyMessage} />
    </div>
  );
}
