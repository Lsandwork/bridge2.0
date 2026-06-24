"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { GeneratedDocument, TherapistDashboardSnapshot } from "@family-support/data";
import { LoadingBlock } from "@/components/StateBlock";
import { DocumentDraftModal } from "@/components/therapist/DocumentDraftModal";
import { useLanguage } from "@/components/LanguageProvider";

export default function TherapistInsurancePage() {
  const { t } = useLanguage();
  const [insurance, setInsurance] = useState<TherapistDashboardSnapshot["insurance"]>([]);
  const [readiness, setReadiness] = useState<TherapistDashboardSnapshot["insuranceReadiness"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<GeneratedDocument | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/therapist/dashboard");
    const d = await res.json();
    setInsurance(d.insurance ?? []);
    setReadiness(d.insuranceReadiness ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const generateReauth = async (clientId: string) => {
    setGeneratingId(clientId);
    try {
      const res = await fetch("/api/therapist/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-document",
          clientId,
          documentType: "medical_necessity",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActiveDoc(data.document);
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading || !readiness) return <LoadingBlock label={t("therapist.insurance.loading")} />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{t("therapist.insurance.title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("therapist.insurance.subtitle")}</p>
      </div>

      <article className="th-card p-5">
        <h2 className="font-extrabold">{t("therapist.insurance.readiness")}</h2>
        <p className="mt-2 text-sm text-slate-400">
          {t("therapist.insurance.readinessSummary", {
            doc: String(readiness.documentationComplete),
            usage: String(readiness.authorizationUsage),
            missing: String(readiness.missingNotes),
            risk: readiness.reauthorizationRisk,
          })}
        </p>
        <Link href="/therapist/documentation" className="mt-3 inline-block text-sm font-bold text-teal-400">
          {t("therapist.insurance.openDocs")}
        </Link>
      </article>

      <div className="space-y-3">
        {insurance.map((i) => (
          <article key={i.clientId} className="th-card p-5">
            <p className="font-extrabold">{i.clientName}</p>
            <p className="text-sm text-slate-500">{i.payer}</p>
            <p className="mt-2 font-mono text-xs">{i.authNumber}</p>
            <p className="mt-2 text-sm">
              {t("therapist.insurance.unitsUsed", { used: String(i.usedUnits), approved: String(i.approvedUnits) })}
            </p>
            <p className={`mt-1 text-sm font-bold ${i.daysRemaining <= 30 ? "text-amber-400" : "text-slate-400"}`}>
              {i.daysRemaining <= 30
                ? t("therapist.insurance.expiringSoon", { days: String(i.daysRemaining) })
                : t("therapist.insurance.expires", { date: i.expirationDate })}
            </p>
            <button
              type="button"
              disabled={generatingId === i.clientId}
              onClick={() => generateReauth(i.clientId)}
              className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-500 disabled:opacity-50"
            >
              {generatingId === i.clientId ? t("therapist.common.generating") : t("therapist.insurance.generateReauth")}
            </button>
          </article>
        ))}
      </div>

      {activeDoc ? (
        <DocumentDraftModal
          key={activeDoc.id}
          document={activeDoc}
          onClose={() => setActiveDoc(null)}
          onSaved={(doc) => setActiveDoc(doc)}
        />
      ) : null}
    </div>
  );
}
