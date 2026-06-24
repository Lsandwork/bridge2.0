"use client";

import { useCallback, useEffect, useState } from "react";
import type { GeneratedDocument, TherapistDashboardSnapshot } from "@family-support/data";
import { LoadingBlock } from "@/components/StateBlock";
import { DocumentDraftModal } from "@/components/therapist/DocumentDraftModal";
import { useLanguage } from "@/components/LanguageProvider";

export default function TherapistSchoolPage() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<TherapistDashboardSnapshot["clients"]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeDoc, setActiveDoc] = useState<GeneratedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/therapist/dashboard");
    const d = await res.json();
    setClients(d.clients ?? []);
    setSelectedClientId((prev) => prev || d.clients?.[0]?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const generateIep = async () => {
    if (!selectedClientId) {
      setError(t("therapist.common.selectClientFirst"));
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/therapist/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-document",
          clientId: selectedClientId,
          documentType: "iep_report",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("therapist.school.generateFailed"));
      setActiveDoc(data.document);
      setToast(t("therapist.school.generated"));
      setTimeout(() => setToast(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("therapist.school.generateFailed"));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingBlock label={t("therapist.school.loading")} />;

  const client = clients.find((c) => c.id === selectedClientId);

  const accommodationsList = client
    ? client.passport.accommodations.slice(0, 3).join(", ") +
      (client.passport.accommodations.length > 3 ? "…" : "")
    : "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{t("therapist.school.title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("therapist.school.subtitle")}</p>
      </div>

      {toast ? (
        <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm font-semibold text-teal-300">
          {toast}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      ) : null}

      <article className="th-card p-5">
        <h2 className="font-extrabold">{t("therapist.school.iepGenerator")}</h2>
        <ul className="mt-3 list-inside list-disc text-sm text-slate-300">
          <li>{t("therapist.school.bullet1")}</li>
          <li>{t("therapist.school.bullet2")}</li>
          <li>{t("therapist.school.bullet3")}</li>
          <li>{t("therapist.school.bullet4")}</li>
        </ul>

        <div className="mt-5">
          <label htmlFor="iep-client" className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("therapist.common.client")}
          </label>
          <select
            id="iep-client"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm font-semibold sm:max-w-xs"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.demographics.name}
              </option>
            ))}
          </select>
        </div>

        {client ? (
          <p className="mt-3 text-xs text-slate-500">
            {t("therapist.school.accommodations", { list: accommodationsList })}
          </p>
        ) : null}

        <button
          type="button"
          disabled={generating || !selectedClientId}
          onClick={generateIep}
          className="mt-4 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-500 disabled:opacity-50"
        >
          {generating ? t("therapist.school.generatingReport") : t("therapist.school.generateReport")}
        </button>
      </article>

      {activeDoc ? (
        <DocumentDraftModal
          key={activeDoc.id}
          document={activeDoc}
          onClose={() => setActiveDoc(null)}
          onSaved={(doc) => {
            setActiveDoc(doc);
            setToast(t("therapist.school.saved"));
            setTimeout(() => setToast(null), 3000);
          }}
        />
      ) : null}
    </div>
  );
}
