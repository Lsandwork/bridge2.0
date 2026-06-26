"use client";

import { type TessQuickAction } from "@family-support/core";
import { TessChatMode } from "./TessChatMode";
import { TessFullScreenMode } from "./TessFullScreenMode";
import type { TessInputMode, TessViewMode } from "./tessTypes";
import { useTessChatSession } from "./useTessChatSession";
import { useTessViewMode } from "./useTessViewMode";
import { useTessVoice } from "./useTessVoice";
import "./tess-companion.css";

type Props = {
  childProfileId?: string;
  userName?: string;
  quickActions?: TessQuickAction[];
  placeholder?: string;
  mode?: string;
  defaultInputMode?: TessInputMode;
  /** Force chat layout (bubble embed). */
  embedded?: boolean;
  /** Override initial view mode (e.g. URL ?view=chat). */
  initialViewMode?: TessViewMode;
};

export function TessScreen({
  childProfileId,
  userName = "friend",
  quickActions = [],
  placeholder,
  mode = "text",
  defaultInputMode = "talk",
  embedded = false,
  initialViewMode,
}: Props) {
  const { enabled: voiceEnabled, setEnabled: setVoiceEnabled } = useTessVoice();
  const { viewMode, setViewMode } = useTessViewMode(embedded ? "chat" : initialViewMode);

  const effectiveView = embedded ? "chat" : viewMode;
  const motionPreset = effectiveView === "fullscreen" ? "fullscreen" : "chat";

  const session = useTessChatSession({
    childProfileId,
    userName,
    mode,
    defaultInputMode,
    tessVoiceEnabled: voiceEnabled,
    quickActions,
    motionPreset,
  });

  if (effectiveView === "fullscreen") {
    return (
      <TessFullScreenMode
        session={session}
        userName={userName}
        viewMode={effectiveView}
        onViewModeChange={setViewMode}
        voiceEnabled={voiceEnabled}
        onVoiceChange={setVoiceEnabled}
        placeholder={placeholder}
      />
    );
  }

  return (
    <TessChatMode
      session={session}
      userName={userName}
      viewMode={effectiveView}
      onViewModeChange={setViewMode}
      voiceEnabled={voiceEnabled}
      onVoiceChange={setVoiceEnabled}
      embedded={embedded}
      placeholder={placeholder}
    />
  );
}
