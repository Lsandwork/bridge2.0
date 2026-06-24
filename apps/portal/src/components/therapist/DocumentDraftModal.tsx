"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import type { GeneratedDocument } from "@family-support/data";
import { TherapistModal } from "./TherapistModal";

type DocumentDraftModalProps = {
  document: GeneratedDocument | null;
  onClose: () => void;
  onSaved: (doc: GeneratedDocument) => void;
};

export function DocumentDraftModal({ document, onClose, onSaved }: DocumentDraftModalProps) {
  const [content, setContent] = useState(document?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"draft" | "submitted">(document?.status ?? "draft");

  useEffect(() => {
    if (document) {
      setContent(document.content);
      setStatus(document.status);
    }
  }, [document]);

  if (!document) return null;

  const save = async (nextStatus?: "draft" | "submitted") => {
    setSaving(true);
    try {
      const res = await fetch("/api/therapist/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-document",
          docId: document.id,
          content,
          status: nextStatus ?? status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      if (nextStatus) setStatus(nextStatus);
      onSaved(data.document);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${document.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TherapistModal open title={document.title} onClose={onClose} wide>
      <p className="text-xs text-slate-500">
        Generated {new Date(document.generatedAt).toLocaleString()} · Status:{" "}
        <span className="font-bold capitalize text-teal-400">{status}</span>
      </p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mt-4 min-h-[16rem] w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 font-mono text-sm leading-relaxed text-slate-200"
        spellCheck
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => save("draft")}
          disabled={saving}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-500 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={() => save("submitted")}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Mark submitted
        </button>
        <button
          type="button"
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5"
        >
          {copied ? <Check className="h-4 w-4 text-teal-400" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white">
          Close
        </button>
      </div>
    </TherapistModal>
  );
}
