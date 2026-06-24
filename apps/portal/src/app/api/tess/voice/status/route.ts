import { NextResponse } from "next/server";
import { getVoiceProvider } from "@/lib/ai";

export async function GET() {
  const provider = getVoiceProvider();
  const voiceName = process.env.TESS_VOICE_MODEL ?? "nova";
  let transcribe = false;
  let speak = false;

  try {
    if (provider.transcribe) {
      const hc = await provider.healthCheck();
      transcribe = hc.ok;
    }
    if (provider.speak) speak = Boolean(process.env.OPENAI_API_KEY);
  } catch {
    /* demo / missing keys */
  }

  return NextResponse.json({
    serverTranscribe: transcribe,
    serverSpeak: speak,
    voiceName,
    voiceProvider: provider.name,
    femaleVoice: true,
  });
}
