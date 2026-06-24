"use client";

type Props = {
  visible: boolean;
  secondsRemaining: number;
  onStop: () => void;
};

/** Countdown HUD during dance break — stop always visible. */
export function TessDanceHud({ visible, secondsRemaining, onStop }: Props) {
  if (!visible || secondsRemaining <= 0) return null;

  return (
    <div className="tess-dance-hud" role="status" aria-live="polite">
      <span>Dancing with Tess · {secondsRemaining}s</span>
      <button type="button" className="tess-dance-hud__stop" onClick={onStop}>
        Stop
      </button>
    </div>
  );
}
