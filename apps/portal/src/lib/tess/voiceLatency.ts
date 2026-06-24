/** Dev-only latency logging for low-latency voice pipeline tuning. */

export type VoiceLatencyMarks = {
  transcribeMs?: number;
  aiResponseMs?: number;
  ttsMs?: number;
  playbackStartMs?: number;
  totalMs?: number;
};

const marks = new Map<string, number>();

export function markVoiceLatency(label: string) {
  if (process.env.NODE_ENV === "production") return;
  marks.set(label, performance.now());
}

export function measureVoiceLatency(from: string, to: string): number | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  const start = marks.get(from);
  const end = marks.get(to);
  if (start == null || end == null) return undefined;
  return Math.round(end - start);
}

export function logVoiceLatency(summary: VoiceLatencyMarks) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[Tess voice latency]", summary);
}

export function clearVoiceLatencyMarks() {
  marks.clear();
}
