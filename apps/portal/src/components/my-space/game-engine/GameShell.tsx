"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";

type HudProps = {
  label: string;
  progress?: string;
  sublabel?: string;
};

/** HUD sits above the playfield so canvas content is never clipped. */
export function GameStage({
  hud,
  children,
  className = "",
}: {
  hud: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="pg-game-stage">
      {hud}
      <GameViewport className={className}>{children}</GameViewport>
    </div>
  );
}

export function GameViewport({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`pg-viewport ${className}`}>{children}</div>;
}

export function GameCanvasLayer({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement | null> }) {
  return (
    <div className="pg-playfield-surface">
      <canvas ref={canvasRef} className="pg-canvas" aria-hidden />
    </div>
  );
}

export function GameHud({ label, progress, sublabel }: HudProps) {
  return (
    <div className="pg-hud">
      <div className="pg-hud-inner">
        <span className="pg-hud-label">{label}</span>
        {progress ? <span className="pg-hud-progress">{progress}</span> : null}
        {sublabel ? <span className="pg-hud-sub">{sublabel}</span> : null}
      </div>
    </div>
  );
}

export function GameControls({ children }: { children: ReactNode }) {
  return <div className="pg-controls">{children}</div>;
}

export function GameControlBtn({
  children,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  wide,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
  wide?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      className={`pg-control-btn ${wide ? "pg-control-btn-wide" : ""}`}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export function VictoryScreen({
  title,
  subtitle,
  emoji,
  onComplete,
  buttonLabel = "Done! Get points ✨",
}: {
  title: string;
  subtitle?: string;
  emoji?: string;
  onComplete: () => void;
  buttonLabel?: string;
}) {
  return (
    <div className="pg-victory">
      <div className="pg-victory-rays" aria-hidden />
      <div className="pg-victory-content">
        {emoji ? <span className="pg-victory-emoji">{emoji}</span> : null}
        <h3 className="pg-victory-title">{title}</h3>
        {subtitle ? <p className="pg-victory-sub">{subtitle}</p> : null}
        <button type="button" className="pg-victory-btn" onClick={onComplete}>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

export function PremiumTile({
  active,
  selected,
  onClick,
  children,
  hue = 260,
  className = "",
}: {
  active?: boolean;
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  hue?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`pg-tile ${active ? "pg-tile-active" : ""} ${selected ? "pg-tile-selected" : ""} ${className}`}
      style={{ "--tile-hue": hue } as CSSProperties}
      onClick={onClick}
    >
      <span className="pg-tile-glow" aria-hidden />
      {children}
    </button>
  );
}

export function PremiumCardGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  return <div className={`pg-card-grid pg-card-grid-${cols}`}>{children}</div>;
}

export function MoodOrb({
  emoji,
  label,
  hue,
  onClick,
}: {
  emoji: string;
  label: string;
  hue: number;
  onClick: () => void;
}) {
  return (
    <button type="button" className="pg-mood-orb" style={{ "--orb-hue": hue } as CSSProperties} onClick={onClick}>
      <span className="pg-mood-orb-ring" aria-hidden />
      <span className="pg-mood-orb-face">{emoji}</span>
      <span className="pg-mood-orb-label">{label}</span>
    </button>
  );
}

export function StoryScene({
  title,
  body,
  accent,
  children,
}: {
  title: string;
  body: string;
  accent: string;
  children?: ReactNode;
}) {
  return (
    <div className="pg-story" style={{ "--story-accent": accent } as CSSProperties}>
      <div className="pg-story-bg" aria-hidden />
      <p className="pg-story-kicker">{title}</p>
      <p className="pg-story-body">{body}</p>
      {children ? <div className="pg-story-actions">{children}</div> : null}
    </div>
  );
}

export function StoryChoice({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="pg-story-choice" onClick={onClick}>
      {children}
    </button>
  );
}

export function ShapeToken({
  shape,
  color,
  selected,
  onClick,
}: {
  shape: string;
  color: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`pg-shape ${selected ? "pg-shape-selected" : ""}`}
      style={{ "--shape-color": color } as CSSProperties}
      onClick={onClick}
      aria-label={shape}
    >
      <span className={`pg-shape-icon pg-shape-${shape.toLowerCase()}`} />
    </button>
  );
}

export function SortBin({
  label,
  shape,
  onClick,
}: {
  label: string;
  shape: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="pg-bin" onClick={onClick}>
      <span className={`pg-bin-slot pg-shape-${shape.toLowerCase()}`} />
      <span className="pg-bin-label">{label}</span>
    </button>
  );
}

export function MemoryCard({
  face,
  hidden,
  matched,
  onClick,
}: {
  face: string;
  hidden: boolean;
  matched: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`pg-memory-card ${hidden ? "pg-memory-hidden" : "pg-memory-revealed"} ${matched ? "pg-memory-matched" : ""}`}
      onClick={onClick}
      disabled={matched}
    >
      <span className="pg-memory-inner">
        <span className="pg-memory-back" aria-hidden />
        <span className="pg-memory-face">{face}</span>
      </span>
    </button>
  );
}

export function HelpPhraseCard({
  phrase,
  step,
  total,
  onClick,
}: {
  phrase: string;
  step: number;
  total: number;
  onClick: () => void;
}) {
  return (
    <button type="button" className="pg-help-card" onClick={onClick}>
      <span className="pg-help-step">
        {step} / {total}
      </span>
      <span className="pg-help-phrase">{phrase}</span>
      <span className="pg-help-hint">Tap to practice</span>
    </button>
  );
}

export function PetStage({
  mood,
  action,
  onAct,
}: {
  mood: number;
  action: string;
  onAct: () => void;
}) {
  return (
    <div className="pg-pet-stage">
      <div className="pg-pet-bg" aria-hidden />
      <div className="pg-pet-meter">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`pg-pet-meter-pip ${i <= mood ? "filled" : ""}`} />
        ))}
      </div>
      <div className={`pg-pet-avatar mood-${mood}`} aria-hidden />
      <p className="pg-pet-action">{action}</p>
      <button type="button" className="pg-pet-btn" onClick={onAct}>
        {action}
      </button>
    </div>
  );
}

export function TreasureBoard({
  tiles,
  next,
  onTap,
}: {
  tiles: number;
  next: number;
  onTap: (idx: number) => void;
}) {
  return (
    <div className="pg-treasure-board">
      {Array.from({ length: tiles }).map((_, i) => (
        <button
          key={i}
          type="button"
          className={`pg-treasure-tile ${i === next ? "pg-treasure-next" : i < next ? "pg-treasure-done" : ""}`}
          onClick={() => onTap(i)}
        >
          {i < next ? "✦" : i === next ? "◆" : ""}
        </button>
      ))}
    </div>
  );
}

export function RhythmPadGrid({
  active,
  hits,
  target,
  onTap,
}: {
  active: number;
  hits: number;
  target: number;
  onTap: (idx: number) => void;
}) {
  const hues = [260, 200, 320, 45];
  return (
    <div className="pg-rhythm">
      <p className="pg-rhythm-score">
        {hits} / {target}
      </p>
      <div className="pg-rhythm-grid">
        {[0, 1, 2, 3].map((i) => (
          <PremiumTile key={i} active={active === i} hue={hues[i]} onClick={() => onTap(i)} className="pg-rhythm-pad">
            <span className="pg-rhythm-wave" aria-hidden />
          </PremiumTile>
        ))}
      </div>
    </div>
  );
}
