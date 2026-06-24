import { API_BASE, tessChat } from "./tessApi";

export async function tessTranscribe(uri: string): Promise<string> {
  const form = new FormData();
  form.append("audio", {
    uri,
    name: "tess.m4a",
    type: "audio/m4a",
  } as unknown as Blob);
  const res = await fetch(`${API_BASE}/api/tess/voice/transcribe`, {
    method: "POST",
    headers: {
      "x-bridge-role": "child_user",
      "x-bridge-child-profile": "cp1",
    },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Transcription failed");
  return data.transcript?.trim() ?? "";
}

export async function tessSpeak(text: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/api/tess/voice/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (data.audioBase64) {
    return `data:${data.mimeType ?? "audio/mpeg"};base64,${data.audioBase64}`;
  }
  return null;
}

export { tessChat };
