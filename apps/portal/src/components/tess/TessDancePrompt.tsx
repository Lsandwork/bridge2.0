"use client";

type Props = {
  open: boolean;
  phase: "initial" | "continue-prompt" | "extended" | "idle";
  secondsRemaining?: number;
  onStart: () => void;
  onContinue: () => void;
  onStop: () => void;
  onDismiss: () => void;
};

/**
 * Emotion-aware support flow — gentle dance break modal.
 * Accessible, keyboard-friendly, mobile responsive.
 */
export function TessDancePrompt({
  open,
  phase,
  secondsRemaining = 0,
  onStart,
  onContinue,
  onStop,
  onDismiss,
}: Props) {
  if (!open && phase === "idle") return null;

  const isContinuePrompt = phase === "continue-prompt" || phase === "extended";

  return (
    <div
      className="tess-dance-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tess-dance-title"
      aria-describedby="tess-dance-desc"
    >
      <div className="tess-dance-modal__backdrop" onClick={onDismiss} aria-hidden />
      <div className="tess-dance-modal__panel">
        <button type="button" className="tess-dance-modal__close" onClick={onDismiss} aria-label="Close">
          ×
        </button>

        {!isContinuePrompt ? (
          <>
            <h2 id="tess-dance-title" className="tess-dance-modal__title">
              Want to dance with Nuvio for a quick reset?
            </h2>
            <p id="tess-dance-desc" className="tess-dance-modal__desc">
              Sometimes a tiny movement break helps. We can dance for 15 seconds, and you can stop anytime.
            </p>
            <div className="tess-dance-modal__actions">
              <button type="button" className="tess-dance-modal__btn tess-dance-modal__btn--primary" onClick={onStart}>
                Yes, dance with Nuvio
              </button>
              <button type="button" className="tess-dance-modal__btn" onClick={onDismiss}>
                Not right now
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="tess-dance-title" className="tess-dance-modal__title">
              {secondsRemaining > 0 ? `Dancing… ${secondsRemaining}s` : "Keep dancing or take a breath?"}
            </h2>
            <p id="tess-dance-desc" className="tess-dance-modal__desc">
              {secondsRemaining > 0
                ? "Move gently — you can stop anytime."
                : "Want to keep going or are you feeling better?"}
            </p>
            <div className="tess-dance-modal__actions">
              {secondsRemaining <= 0 ? (
                <>
                  <button type="button" className="tess-dance-modal__btn tess-dance-modal__btn--primary" onClick={onContinue}>
                    Dance 30 more seconds
                  </button>
                  <button type="button" className="tess-dance-modal__btn" onClick={onStop}>
                    I&apos;m good
                  </button>
                </>
              ) : null}
              <button type="button" className="tess-dance-modal__btn tess-dance-modal__btn--stop" onClick={onStop}>
                Stop
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
