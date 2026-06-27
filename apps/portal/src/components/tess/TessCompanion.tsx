"use client";

// TODO: Replace static Tess asset with Lottie/Rive character animation when final asset is ready.
// TODO: Replace simulated wave with rigged Lottie/Rive Tess character animation.

import type { TessState } from "./tessAnimationState";
import { TessAnimationLayer } from "./TessAnimationLayer";
import { getTessMotionCssVars, type TessMotionPresetKey } from "./tessMotionPreset";
import { useReducedMotion } from "./useReducedMotion";

type Props = {
  state: TessState;
  /** `fullscreen` = calm premium motion; `chat` = minimal status-card motion */
  motionPreset?: TessMotionPresetKey;
};

export function TessCompanion({ state, motionPreset = "chat" }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="tess-companion-wrap">
      <div
        className={`tess-companion tess-companion--${state} tess-companion--motion-${motionPreset} ${reducedMotion ? "tess-companion--reduced" : ""}`}
        style={reducedMotion ? undefined : getTessMotionCssVars(motionPreset)}
        aria-label="Nuvio support companion"
        role="img"
        data-tess-state={state}
        data-motion-preset={motionPreset}
      >
        <TessAnimationLayer state={state} />

        <div className="tess-companion__robot">
          <div className="tess-companion__antenna" aria-hidden>
            <div className="tess-companion__antenna-tip" />
          </div>

          <div className="tess-companion__head">
            <div className="tess-companion__face">
              <div className="tess-companion__eyes">
                <span className="tess-companion__eye tess-companion__eye--left">
                  <span className="tess-companion__eye-shine" />
                </span>
                <span className="tess-companion__eye tess-companion__eye--right">
                  <span className="tess-companion__eye-shine" />
                </span>
              </div>
              <span className="tess-companion__mouth" />
            </div>
          </div>

          <div className="tess-companion__body-row">
            <span className="tess-companion__arm tess-companion__arm--left" aria-hidden />
            <div className="tess-companion__body">
              <span className="tess-companion__heart" aria-hidden>
                💜
              </span>
            </div>
            <span className="tess-companion__arm tess-companion__arm--right" aria-hidden>
              <span className="tess-companion__hand">🤚</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
