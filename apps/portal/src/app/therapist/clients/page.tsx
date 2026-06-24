"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TherapistDashboardSnapshot } from "@family-support/data";
import { LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

export default function TherapistClientsPage() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<TherapistDashboardSnapshot["clients"]>([]);

  useEffect(() => {
    fetch("/api/therapist/dashboard")
      .then((r) => r.json())
      .then((d) => setClients(d.clients ?? []));
  }, []);

  if (!clients.length) return <LoadingBlock label={t("therapist.clients.loading")} />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-extrabold">{t("therapist.clients.title")}</h1>
      <p className="text-sm text-slate-400">{t("therapist.clients.subtitle")}</p>
      <div className="space-y-3">
        {clients.map((c) => (
          <Link key={c.id} href={`/therapist/clients/${c.id}`} className="th-card block p-5 transition hover:border-teal-500/30">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-extrabold">{c.demographics.name}</p>
                <p className="text-sm text-slate-500">
                  {t("therapist.clients.meta", { age: String(c.demographics.age), level: c.demographics.supportLevel })}
                </p>
                <p className="mt-1 text-xs text-slate-400">{c.demographics.diagnosis.join(", ")}</p>
              </div>
              <p className="text-sm font-bold text-teal-400">
                {t("therapist.clients.goalsPct", { pct: String(c.goalsProgress) })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
