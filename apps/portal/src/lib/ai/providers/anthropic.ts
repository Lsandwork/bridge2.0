import type { AIChatOptions, AIChatResult, AIProvider } from "../types";

/** Anthropic provider — uses Messages API when ANTHROPIC_API_KEY is set */
export function createAnthropicProvider(): AIProvider {
  const key = process.env.ANTHROPIC_API_KEY;
  const model = process.env.TESS_MODEL || "claude-3-5-haiku-latest";

  return {
    name: "anthropic",
    async chat(options: AIChatOptions): Promise<AIChatResult> {
      if (!key) throw new Error("ANTHROPIC_API_KEY is not configured");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: options.maxTokens ?? 2048,
          system: options.systemPrompt,
          messages: options.messages.filter((m) => m.role !== "system").map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic error: ${err}`);
      }
      const data = (await res.json()) as {
        content: { type: string; text: string }[];
        usage?: { input_tokens: number; output_tokens: number };
      };
      const text = data.content.find((c) => c.type === "text")?.text ?? "";
      return {
        content: text,
        provider: "anthropic",
        model,
        tokensInput: data.usage?.input_tokens ?? 0,
        tokensOutput: data.usage?.output_tokens ?? 0,
      };
    },
    async healthCheck() {
      if (!key) return { ok: false, message: "ANTHROPIC_API_KEY missing" };
      return { ok: true, message: `Anthropic ${model} configured` };
    },
  };
}
