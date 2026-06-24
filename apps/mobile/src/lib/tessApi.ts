import { CHILD_QUICK_BUTTONS, TESS_DISCLAIMER } from "@family-support/core";

const API_BASE = process.env.EXPO_PUBLIC_BRIDGE_API_URL ?? "http://localhost:4000";

export async function tessChat(message: string, opts?: { conversationId?: string; childProfileId?: string; mode?: string }) {
  const res = await fetch(`${API_BASE}/api/tess/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-bridge-role": "child_user",
      "x-bridge-child-profile": opts?.childProfileId ?? "cp1",
    },
    body: JSON.stringify({
      message,
      conversationId: opts?.conversationId,
      childProfileId: opts?.childProfileId ?? "cp1",
      mode: opts?.mode ?? "text",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Chat failed");
  return data as { conversationId: string; message: { content: string } };
}

export { API_BASE, CHILD_QUICK_BUTTONS, TESS_DISCLAIMER };
