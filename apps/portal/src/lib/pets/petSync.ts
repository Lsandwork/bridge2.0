const queueKey = "nuvio.pet.sync.queue";

export type QueuedPetEvent = { action: string; payload: Record<string, unknown>; at: string };

export function queuePetEvent(event: QueuedPetEvent) {
  if (typeof window === "undefined") return;
  const current = JSON.parse(window.localStorage.getItem(queueKey) ?? "[]") as QueuedPetEvent[];
  current.push(event);
  window.localStorage.setItem(queueKey, JSON.stringify(current.slice(-50)));
}

export async function flushPetSyncQueue() {
  if (typeof window === "undefined") return;
  const current = JSON.parse(window.localStorage.getItem(queueKey) ?? "[]") as QueuedPetEvent[];
  if (!current.length) return;
  const remaining: QueuedPetEvent[] = [];
  for (const event of current) {
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(event.payload),
      });
      if (!res.ok) remaining.push(event);
    } catch {
      remaining.push(event);
    }
  }
  window.localStorage.setItem(queueKey, JSON.stringify(remaining));
}
