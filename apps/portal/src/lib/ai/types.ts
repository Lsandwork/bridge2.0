export type AIChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type AIChatOptions = {
  messages: AIChatMessage[];
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
};

export type AIChatResult = {
  content: string;
  provider: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
};

export type AIProvider = {
  name: string;
  chat(options: AIChatOptions): Promise<AIChatResult>;
  transcribe?(audioBuffer: Buffer, mimeType: string): Promise<string>;
  speak?(text: string): Promise<{ audioBase64: string; mimeType: string }>;
  healthCheck(): Promise<{ ok: boolean; message: string }>;
};
