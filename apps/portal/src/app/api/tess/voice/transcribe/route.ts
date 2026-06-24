import { NextRequest, NextResponse } from "next/server";
import { getVoiceProvider } from "@/lib/ai";
import { getTessSession } from "@/lib/tess/session";

export async function POST(req: NextRequest) {
  getTessSession(req.headers);
  const formData = await req.formData();
  const file = formData.get("audio");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Audio file required" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "audio/webm";
  const provider = getVoiceProvider();
  if (!provider.transcribe) {
    return NextResponse.json(
      { error: "Speech-to-text requires AI_PROVIDER=openai with OPENAI_API_KEY" },
      { status: 501 }
    );
  }
  try {
    const transcript = await provider.transcribe(buffer, mimeType);
    return NextResponse.json({ transcript });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
