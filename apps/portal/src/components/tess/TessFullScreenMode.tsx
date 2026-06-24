"use client";

import { MessageSquare, Mic, MicOff, Send } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { TessCaption } from "./TessCaption";
import { TessDanceHud } from "./TessDanceHud";
import { TessDancePrompt } from "./TessDancePrompt";
import { TessSafetySupport } from "./TessSafetySupport";
import { TessAnimatedCharacter } from "./TessAnimatedCharacter";
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
            <TessAnimatedCharacter state={characterState} size="sm" showWaves={false} enableIdleWave={false} />
          </span>
          <span className="tess-fullscreen__name">Tess</span>
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
            aria-label="Tess AI support companion"
          >
            <TessAnimatedCharacter
              state={characterState}
              size="fullscreen"
              showWaves
              enableIdleWave={characterState === "idle" && !dance.isDancing}
              audioLevel={audioLevel}
              onInteract={bumpActivity}
            />
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
