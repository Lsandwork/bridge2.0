"use client";

import { MessageSquare, Mic, MicOff, Send } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useCompanionPet } from "@/components/pets/CompanionPetProvider";
import { PetSprite } from "@/components/pets/PetSprite";
import { TessCaption } from "./TessCaption";
import { TessDanceHud } from "./TessDanceHud";
import { TessDancePrompt } from "./TessDancePrompt";
import { TessSafetySupport } from "./TessSafetySupport";
import { mapTessStateToCharacter } from "./tessCharacterState";
import { TessModeToggle } from "./TessModeToggle";
import { TessQuickHelpSheet } from "./TessQuickHelpSheet";
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
  placeholder?: string;
};

export function TessFullScreenMode({
  session,
  userName,
  viewMode,
  onViewModeChange,
  voiceEnabled,
  onVoiceChange,
  placeholder,
}: Props) {
  const { t } = useLanguage();
  const { state, awardXp } = useCompanionPet();
  const {
    tessState,
    inputMode,
    switchInputMode,
    input,
    setInput,
    loading,
    isRecording,
    lastReply,
    showQuickHelp,
    setShowQuickHelp,
    showTypeInput,
    setShowTypeInput,
    handleMicToggle,
    handleQuickAction,
    send,
    bumpActivity,
    quickActions,
    activeQuickId,
    error,
    voiceError,
    audioLevel,
    dance,
  } = session;

  const characterState = mapTessStateToCharacter(tessState, Boolean(error || voiceError), {
    isDancing: dance.isDancing,
  });

  return (
    <div className="tess-fullscreen">
      <header className="tess-fullscreen__header">
        <div className="tess-fullscreen__brand">
          <span className="tess-fullscreen__avatar">
            <PetSprite species={state?.pet?.species ?? "spark"} mood={characterState} size="sm" motionLevel={state?.pet?.settings.motionLevel} />
          </span>
          <span className="tess-fullscreen__name">Nuvio</span>
        </div>
        <div className="tess-fullscreen__header-controls">
          <TessViewModeToggle mode={viewMode} onChange={onViewModeChange} compact />
        </div>
      </header>

      <div className="tess-fullscreen__stage">
        <div className="tess-fullscreen__glow" aria-hidden />

        <div className="tess-fullscreen__companion-slot">
          <button
            type="button"
            className="tess-fullscreen__companion"
            onClick={bumpActivity}
            aria-label="Nuvio support companion"
          >
            <PetSprite species={state?.pet?.species ?? "spark"} mood={characterState} size="lg" motionLevel={state?.pet?.settings.motionLevel} />
          </button>
        </div>

        <div className="tess-fullscreen__caption-slot">
          <TessCaption
            state={tessState}
            userName={userName}
            lastReply={lastReply}
            voiceEnabled={voiceEnabled}
            showFullReply={!voiceEnabled}
          />
        </div>

        {error || voiceError ? (
          <div className="tess-fullscreen__toasts" role="status">
            {error ? <p className="tess-fullscreen__toast tess-fullscreen__toast--error">{error}</p> : null}
            {voiceError ? <p className="tess-fullscreen__toast tess-fullscreen__toast--voice">{voiceError}</p> : null}
          </div>
        ) : null}
      </div>

      {showTypeInput ? (
        <form
          className="tess-fullscreen__type-drawer"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) void awardXp("send_chat_message", { source: "nuvio_fullscreen" });
            void send(input);
          }}
        >
          <input
            className="tess-fullscreen__type-field"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value.trim()) bumpActivity();
            }}
            placeholder={placeholder ?? t("tess.companion.typePlaceholder")}
            disabled={loading}
            aria-label="Type a message"
            autoFocus
          />
          <button type="submit" className="tess-fullscreen__type-send" disabled={loading || !input.trim()} aria-label="Send message">
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : null}

      <div className="tess-fullscreen__controls">
        <div className="tess-fullscreen__control-row">
          <TessModeToggle mode={inputMode} onChange={switchInputMode} />
          <TessVoiceToggle enabled={voiceEnabled} onChange={onVoiceChange} compact />
        </div>

        <div className="tess-fullscreen__action-row">
          <button
            type="button"
            className="tess-fullscreen__pill-btn"
            onClick={() => {
              bumpActivity();
              setShowTypeInput((v) => !v);
              if (inputMode === "talk") switchInputMode("text");
            }}
            aria-label="Switch to Type mode"
          >
            <MessageSquare className="h-4 w-4" aria-hidden />
            {t("tess.chat.type")}
          </button>

          <button
            type="button"
            className={`tess-fullscreen__mic ${isRecording ? "tess-fullscreen__mic--active" : ""}`}
            onClick={() => {
              if (inputMode === "text") switchInputMode("talk");
              if (!isRecording) void awardXp("voice_chat", { source: "nuvio_fullscreen" });
              handleMicToggle();
            }}
            disabled={loading}
            aria-label={isRecording ? "Stop voice input" : "Start voice input"}
          >
            {isRecording ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
          </button>

          <button
            type="button"
            className="tess-fullscreen__pill-btn"
            onClick={() => {
              bumpActivity();
              setShowQuickHelp(true);
            }}
            aria-label={t("tess.companion.quickHelp")}
          >
            {t("tess.companion.quickHelp")}
          </button>
        </div>
      </div>

      <TessQuickHelpSheet
        open={showQuickHelp}
        actions={quickActions}
        activeId={activeQuickId}
        disabled={loading}
        onClose={() => setShowQuickHelp(false)}
        onAction={handleQuickAction}
      />

      <TessDancePrompt
        open={dance.shouldShowDancePrompt || dance.phase === "continue-prompt"}
        phase={dance.phase}
        secondsRemaining={dance.danceSecondsRemaining}
        onStart={() => void dance.startDance()}
        onContinue={() => void dance.continueDance()}
        onStop={dance.stopDance}
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
