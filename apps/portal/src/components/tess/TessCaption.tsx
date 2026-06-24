"use client";

import { useLanguage } from "@/components/LanguageProvider";
import type { TessState } from "./tessAnimationState";
import { getTessStatusCopy } from "./tessAnimationState";

type Props = {
  state: TessState;
  userName?: string;
  lastReply?: string;
  voiceEnabled: boolean;
  showFullReply?: boolean;
};

/** Fullscreen status copy — matches TessStatusCard text and transitions. */
export function TessCaption({ state, userName = "friend", lastReply, voiceEnabled, showFullReply }: Props) {
  const { t } = useLanguage();
  const copy = getTessStatusCopy(state, userName, t);

  return (
    <div className={`tess-caption tess-caption--${state}`} aria-live="polite" aria-atomic="true">
      <div className="tess-caption__copy" key={state}>
        <p className="tess-caption__line1">{copy.line1}</p>
        <p className="tess-caption__line2">{copy.line2}</p>
      </div>
      {!voiceEnabled && lastReply ? (
        <p className={`tess-caption__reply ${showFullReply ? "tess-caption__reply--full" : ""}`}>{lastReply}</p>
      ) : null}
    </div>
  );
}
