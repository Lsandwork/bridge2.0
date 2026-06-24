"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

type Props = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  compact?: boolean;
};

export function TessVoiceToggle({ enabled, onChange, compact }: Props) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className={`tess-voice-toggle ${enabled ? "tess-voice-toggle--on" : ""} ${compact ? "tess-voice-toggle--compact" : ""}`}
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      aria-label={enabled ? t("tess.companion.voiceOffLabel") : t("tess.companion.voiceOnLabel")}
    >
      {enabled ? <Volume2 className="h-3.5 w-3.5" aria-hidden /> : <VolumeX className="h-3.5 w-3.5" aria-hidden />}
      <span>{enabled ? t("tess.companion.voiceOn") : t("tess.companion.voiceOff")}</span>
    </button>
  );
}
