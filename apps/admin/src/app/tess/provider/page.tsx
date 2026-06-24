"use client";

import { useEffect, useState } from "react";
import { TESS_DISCLAIMER } from "@family-support/core";
import { LoadingBlock } from "@/components/StateBlock";

type ProviderConfig = {
  provider: string;
  model: string;
  voiceModel: string;
  sttModel: string;
  maxTokens: number;
  temperature: number;
  failoverProvider?: string;
};

export default function AdminTessProviderPage() {
  const [config, setConfig] = useState<ProviderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/tess?section=provider")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const save = async () => {
    if (!config) return;
    await fetch("/api/admin/tess", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-provider", config }),
    });
    setSaved(true);
  };

  if (loading || !config) return <LoadingBlock label="Loading provider settings…" />;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Tess Provider Settings</h1>
      <p className="mt-4 rounded-lg bg-violet-50 p-3 text-xs text-violet-900">{TESS_DISCLAIMER}</p>

      <div className="mt-6 space-y-4 rounded-xl border bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        {(
          [
            ["provider", "AI Provider"],
            ["model", "Chat Model"],
            ["voiceModel", "Voice Model"],
            ["sttModel", "STT Model"],
            ["failoverProvider", "Failover Provider"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm font-medium">
            {label}
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              value={String(config[key as keyof ProviderConfig] ?? "")}
              onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="block text-sm font-medium">
          Max tokens
          <input
            type="number"
            className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={config.maxTokens}
            onChange={(e) => setConfig({ ...config, maxTokens: Number(e.target.value) })}
          />
        </label>
        <label className="block text-sm font-medium">
          Temperature
          <input
            type="number"
            step="0.1"
            className="mt-1 w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={config.temperature}
            onChange={(e) => setConfig({ ...config, temperature: Number(e.target.value) })}
          />
        </label>
        <button type="button" className="w-full rounded-lg bg-blue-600 py-2 text-white" onClick={save}>
          Save provider settings
        </button>
        {saved ? <p className="text-center text-sm text-green-600">Saved (runtime uses AI_PROVIDER env).</p> : null}
        <p className="text-xs text-slate-500">
          Set AI_PROVIDER, OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY in server environment. No rebuild required to switch providers.
        </p>
      </div>
    </main>
  );
}
