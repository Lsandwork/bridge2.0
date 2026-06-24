"use client";

type Props = {
  open: boolean;
  onDismiss: () => void;
};

/** Safety-first support message — shown instead of dance for emergency concerns. */
export function TessSafetySupport({ open, onDismiss }: Props) {
  if (!open) return null;

  return (
    <div className="tess-dance-modal" role="alertdialog" aria-modal="true" aria-labelledby="tess-safety-title">
      <div className="tess-dance-modal__backdrop" onClick={onDismiss} aria-hidden />
      <div className="tess-dance-modal__panel tess-dance-modal__panel--safety">
        <h2 id="tess-safety-title" className="tess-dance-modal__title">
          You matter — let&apos;s get you support
        </h2>
        <p className="tess-dance-modal__desc">
          I&apos;m here with you. If you&apos;re in danger or thinking about hurting yourself, please reach out to someone
          you trust right away, or call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline) in the US.
        </p>
        <p className="tess-dance-modal__desc">
          For emergencies, call <strong>911</strong>. Tess is a supportive companion — not a replacement for professional
          or emergency help.
        </p>
        <button type="button" className="tess-dance-modal__btn tess-dance-modal__btn--primary" onClick={onDismiss}>
          OK, I understand
        </button>
      </div>
    </div>
  );
}
