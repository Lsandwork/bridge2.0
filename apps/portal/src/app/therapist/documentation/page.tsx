"use client";

import { useCallback, useEffect, useState } from "react";
import type { DocumentType, GeneratedDocument, TherapistDashboardSnapshot } from "@family-support/data";
import { LoadingBlock } from "@/components/StateBlock";
import { DocumentDraftModal } from "@/components/therapist/DocumentDraftModal";
import { useLanguage } from "@/components/LanguageProvider";

const DOC_TYPES: { type: DocumentType; titleKey: string; descriptionKey: string }[] = [
  {
    type: "progress_note",
    titleKey: "therapist.documentation.type.progressNote",
    descriptionKey: "therapist.documentation.type.progressNoteDesc",
  },
  {
    type: "treatment_plan",
    titleKey: "therapist.documentation.type.treatmentPlan",
    descriptionKey: "therapist.documentation.type.treatmentPlanDesc",
  },
  {
    type: "medical_necessity",
    titleKey: "therapist.documentation.type.medicalNecessity",
    descriptionKey: "therapist.documentation.type.medicalNecessityDesc",
  },
];

export default function TherapistDocumentationPage() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<TherapistDashboardSnapshot["clients"]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<DocumentType | null>(null);
  const [activeDoc, setActiveDoc] = useState<GeneratedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/therapist/dashboard");
    const d = await res.json();
    setClients(d.clients ?? []);
    setDocuments(d.documents ?? []);
    setSelectedClientId((prev) => prev || d.clients?.[0]?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const generate = async (documentType: DocumentType) => {
    if (!selectedClientId) {
      setError(t("therapist.common.selectClientFirst"));
      return;
    }
    setError(null);
    setGenerating(documentType);
    try {
      const res = await fetch("/api/therapist/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-document", clientId: selectedClientId, documentType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("therapist.documentation.generateFailed"));
      setActiveDoc(data.document);
      await load();
      showToast(t("therapist.documentation.draftGenerated"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("therapist.documentation.generateFailed"));
    } finally {
      setGenerating(null);
    }
  };

  if (loading) return <LoadingBlock label={t("therapist.documentation.loading")} />;

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{t("therapist.documentation.title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("therapist.documentation.subtitle")}</p>
      </div>

      {toast ? (
        <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm font-semibold text-teal-300">
          {toast}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      ) : null}

      <section className="th-card p-4">
        <label htmlFor="doc-client" className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {t("therapist.documentation.clientLabel")}
        </label>
        <select
          id="doc-client"
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
        {selectedClient ? (
          <p className="mt-2 text-xs text-slate-500">
            {t("therapist.documentation.clientMeta", {
              diagnosis: selectedClient.demographics.diagnosis.join(" · "),
              auth: selectedClient.insurance.authNumber,
            })}
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {DOC_TYPES.map(({ type, titleKey, descriptionKey }) => (
          <article key={type} className="th-card flex flex-col p-5">
            <p className="font-extrabold">{t(titleKey)}</p>
            <p className="mt-2 flex-1 text-xs text-slate-500">{t(descriptionKey)}</p>
            <button
              type="button"
              disabled={generating === type || !selectedClientId}
              onClick={() => generate(type)}
              className="mt-4 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating === type ? t("therapist.common.generating") : t("therapist.documentation.generateDraft")}
            </button>
          </article>
        ))}
      </div>

      {documents.length > 0 ? (
        <section className="th-card p-5">
          <h2 className="font-extrabold">{t("therapist.documentation.savedDrafts")}</h2>
          <ul className="mt-4 space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-bold">{doc.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(doc.updatedAt).toLocaleString()} ·{" "}
                    <span className="capitalize text-teal-400">{doc.status}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDoc(doc)}
                  className="rounded-lg border border-teal-500/40 px-3 py-1.5 text-xs font-bold text-teal-400 hover:bg-teal-500/10"
                >
                  {t("therapist.documentation.openEdit")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {activeDoc ? (
        <DocumentDraftModal
          key={activeDoc.id + activeDoc.updatedAt}
          document={activeDoc}
          onClose={() => setActiveDoc(null)}
          onSaved={(doc) => {
            setActiveDoc(doc);
            load();
            showToast(
              doc.status === "submitted"
                ? t("therapist.documentation.submitted")
                : t("therapist.documentation.saved")
            );
          }}
        />
      ) : null}
    </div>
  );
}
