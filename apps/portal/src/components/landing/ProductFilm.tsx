"use client";

import { useCallback, useEffect, useState } from "react";

const SCENES = [
  { id: "family", image: "/landing/bridge-hero-family.jpg", label: "Families" },
  { id: "therapy", image: "/landing/bridge-hero-therapy.jpg", label: "Daily life" },
  { id: "clinical", image: "/landing/bridge-hero-therapist.jpg", label: "Care teams" },
] as const;

const SCENE_MS = 7000;

export function ProductFilm() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % SCENES.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const start = performance.now();

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - start;
      setProgress(Math.min(100, (elapsed / SCENE_MS) * 100));
      if (elapsed >= SCENE_MS) {
        next();
        return;
      }
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [index, next]);

  const scene = SCENES[index];

  return (
    <div className="film-wrap">
      <div className="film-stage" aria-label="Bridge in action">
        <div className="film-screen">
          {SCENES.map((s, i) => (
            <div
              key={s.id}
              className={`film-scene ${i === index ? "film-scene-active" : ""}`}
              aria-hidden={i !== index}
            >
              <div className="film-scene-bg" style={{ backgroundImage: `url(${s.image})` }} />
              <div className="film-scene-shade" />
            </div>
          ))}

          <div className="film-bar" aria-hidden>
            <div className="film-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <p className="film-label" aria-live="polite">
        {scene.label}
      </p>
    </div>
  );
}
