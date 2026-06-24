import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiModelName } from "@/lib/gemini";
import type { AIChatOptions, AIChatResult, AIProvider } from "../types";

export function createGeminiProvider(): AIProvider {
  const key = process.env.GEMINI_API_KEY;
  const modelName = getGeminiModelName();

  return {
    name: "gemini",
    async chat(options: AIChatOptions): Promise<AIChatResult> {
      if (!key) throw new Error("GEMINI_API_KEY is not configured");
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: modelName });
      const history = options.messages.filter((m) => m.role !== "system");
      const last = history[history.length - 1];
      const prior = history.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({
        history: prior as { role: string; parts: { text: string }[] }[],
        systemInstruction: options.systemPrompt,
      });

      const result = await chat.sendMessage(last?.content ?? "");
      const text = result.response.text();
      return {
        content: text,
        provider: "gemini",
        model: modelName,
        tokensInput: Math.ceil(options.messages.join("").length / 4),
        tokensOutput: Math.ceil(text.length / 4),
      };
    },
    async healthCheck() {
      if (!key) return { ok: false, message: "GEMINI_API_KEY missing" };
      return { ok: true, message: `Gemini ${modelName} configured` };
    },
  };
}
