/** Clears client-side Bridge state that can leak between accounts. */
export function clearBridgeClientState() {
  if (typeof window === "undefined") return;
  const prefixes = [
    "bridge.quickSetup.",
    "bridge-tess-widget-profile:",
    "bridge.activeProfile.",
    "bridge.pathway.",
  ];
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      localStorage.removeItem(key);
    }
  }
  for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    if (key.startsWith("bridge.")) {
      sessionStorage.removeItem(key);
    }
  }
}
