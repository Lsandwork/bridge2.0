export function shouldAnimate(motionLevel?: string) {
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  return motionLevel !== "off";
}

export function bubbleAllowed(settings?: { quietMode?: boolean; bubbleFrequency?: string }) {
  if (settings?.quietMode) return false;
  return settings?.bubbleFrequency !== "low" || Math.floor(Date.now() / 15000) % 2 === 0;
}
