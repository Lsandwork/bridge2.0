import { NextRequest, NextResponse } from "next/server";
import { getVoiceProvider } from "@/lib/ai";
import { getTessSession } from "@/lib/tess/session";

export async function POST(req: NextRequest) {
  getTessSession(req.headers);
  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });
  const provider = getVoiceProvider();
  if (!provider.speak) {
    return NextResponse.json({ useBrowserTts: true, text });
  }
  try {
    const audio = await provider.speak(text);
    return NextResponse.json(audio);
  } catch (e) {
    return NextResponse.json({ useBrowserTts: true, text, error: e instanceof Error ? e.message : "TTS failed" });
  }
}
