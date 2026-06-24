"use client";

import type { TessCharacterState } from "./tessCharacterState";

type Props = {
  state: TessCharacterState;
  side?: "left" | "right" | "both";
  amplitude?: number;
  className?: string;
};

function WaveGroup({ side, active, amplitude }: { side: "left" | "right"; active: boolean; amplitude: number }) {
  const scale = 0.55 + amplitude * 0.45;
  return (
    <div className={`tess-char-waves tess-char-waves--${side} ${active ? "tess-char-waves--active" : ""}`} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="tess-char-waves__bar"
          style={active ? { transform: `scaleY(${scale * (0.7 + i * 0.08)})` } : undefined}
        />
      ))}
    </div>
  );
}

/** Side audio wave bars — amplitude optional for volume-reactive animation. */
export function TessVoiceWaves({ state, side = "both", amplitude = 0.6, className = "" }: Props) {
  const active =
    state === "listening" ||
    state === "userSpeaking" ||
    state === "tessSpeaking" ||
    state === "greeting";

  const amp =
    state === "tessSpeaking" ? Math.max(amplitude, 0.75) : state === "userSpeaking" ? Math.max(amplitude, 0.65) : amplitude;

  return (
    <div className={`tess-char-waves-wrap ${className}`.trim()} aria-hidden>
      {(side === "left" || side === "both") && <WaveGroup side="left" active={active} amplitude={amp} />}
      {(side === "right" || side === "both") && <WaveGroup side="right" active={active} amplitude={amp} />}
    </div>
  );
}
