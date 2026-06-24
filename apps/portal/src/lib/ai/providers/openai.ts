import OpenAI from "openai";
import type { AIChatOptions, AIChatResult, AIProvider } from "../types";

export function createOpenAIProvider(): AIProvider {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.TESS_MODEL || "gpt-4o-mini";
  const voiceModel = process.env.TESS_VOICE_MODEL || "nova";
  const sttModel = process.env.TESS_STT_MODEL || "whisper-1";

  return {
    name: "openai",
    async chat(options: AIChatOptions): Promise<AIChatResult> {
      if (!key) throw new Error("OPENAI_API_KEY is not configured");
      const client = new OpenAI({ apiKey: key });
      const res = await client.chat.completions.create({
        model,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        messages: [
          { role: "system", content: options.systemPrompt },
          ...options.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      });
      const text = res.choices[0]?.message?.content ?? "";
      return {
        content: text,
        provider: "openai",
        model,
        tokensInput: res.usage?.prompt_tokens ?? 0,
        tokensOutput: res.usage?.completion_tokens ?? 0,
      };
    },
    async transcribe(audioBuffer: Buffer, mimeType: string) {
      if (!key) throw new Error("OPENAI_API_KEY is not configured");
      const client = new OpenAI({ apiKey: key });
      const file = new File([new Uint8Array(audioBuffer)], "audio.webm", { type: mimeType });
      const res = await client.audio.transcriptions.create({ file, model: sttModel });
      return res.text;
    },
    async speak(text: string) {
      if (!key) throw new Error("OPENAI_API_KEY is not configured");
      const client = new OpenAI({ apiKey: key });
      const res = await client.audio.speech.create({
        model: "tts-1-hd",
        voice: voiceModel as "nova",
        input: text,
        speed: 0.98,
      });
      const buf = Buffer.from(await res.arrayBuffer());
      return { audioBase64: buf.toString("base64"), mimeType: "audio/mpeg" };
    },
    async healthCheck() {
      if (!key) return { ok: false, message: "OPENAI_API_KEY missing" };
      return { ok: true, message: `OpenAI ${model} configured` };
    },
  };
}
