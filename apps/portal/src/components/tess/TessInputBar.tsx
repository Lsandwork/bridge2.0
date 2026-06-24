"use client";

import { Mic, MicOff, Send } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

type InputMode = "text" | "talk";

type Props = {
  mode: InputMode;
  value: string;
  loading?: boolean;
  isRecording?: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onMicToggle: () => void;
  placeholder?: string;
};

export function TessInputBar({
  mode,
  value,
  loading,
  isRecording,
  onChange,
  onSend,
  onMicToggle,
  placeholder,
}: Props) {
  const { t } = useLanguage();
  const resolvedPlaceholder =
    placeholder ??
    (mode === "talk" ? t("tess.companion.talkPlaceholder") : t("tess.companion.typePlaceholder"));

  if (mode === "talk") {
    return (
      <div className="tess-input-bar">
        <button
          type="button"
          className={`tess-input-bar__mic ${isRecording ? "tess-input-bar__mic--active" : ""}`}
          onClick={onMicToggle}
          disabled={loading}
          aria-label={isRecording ? "Stop voice input" : "Start voice input"}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <p className="flex-1 text-center text-xs font-bold text-[#66748a]">
          {isRecording ? t("tess.companion.recordingHint") : t("tess.companion.talkMicHint")}
        </p>
      </div>
    );
  }

  return (
    <form
      className="tess-input-bar"
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
    >
      <button
        type="button"
        className="tess-input-bar__mic"
        onClick={onMicToggle}
        aria-label="Switch to Talk mode"
      >
        <Mic className="h-5 w-5" />
      </button>
      <input
        className="tess-input-bar__field"
        placeholder={resolvedPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        aria-label="Type a message"
      />
      <button
        type="submit"
        className="tess-input-bar__send"
        disabled={loading || !value.trim()}
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
