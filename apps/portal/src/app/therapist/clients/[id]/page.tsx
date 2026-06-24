"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { TherapistDashboardSnapshot } from "@family-support/data";
import { LoadingBlock, ErrorBlock } from "@/components/StateBlock";
import { VideoActivityPanel } from "@/components/VideoActivityPanel";
import { useLanguage } from "@/components/LanguageProvider";

export default function TherapistClientDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const clientId = params.id as string;
  const [client, setClient] = useState<TherapistDashboardSnapshot["clients"][0] | null>(null);

  useEffect(() => {
    fetch("/api/therapist/dashboard")
      .then((r) => r.json())
      .then((d) => setClient((d.clients ?? []).find((c: { id: string }) => c.id === clientId) ?? null));
  }, [clientId]);

  if (!client) return <LoadingBlock label={t("therapist.clientDetail.loading")} />;
  if (!client.demographics) return <ErrorBlock message={t("therapist.clientDetail.notFound")} />;

  const p = client.passport;

  const passportBlocks = [
    { titleKey: "therapist.clientDetail.sensoryTriggers", items: p.sensoryTriggers },
    { titleKey: "therapist.clientDetail.sensorySupports", items: p.sensorySupports },
    { titleKey: "therapist.clientDetail.calmingStrategies", items: p.calmingStrategies },
    { titleKey: "therapist.clientDetail.strengths", items: p.strengths },
    { titleKey: "therapist.clientDetail.interests", items: p.interests },
    { titleKey: "therapist.clientDetail.accommodations", items: p.accommodations },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/therapist/clients" className="text-sm font-bold text-teal-400">
        {t("therapist.clientDetail.back")}
      </Link>
      <header>
        <h1 className="text-2xl font-extrabold">{client.demographics.name}</h1>
        <p className="text-sm text-slate-400">{client.demographics.supportLevel}</p>
      </header>

      <section className="th-card p-5">
        <h2 className="font-extrabold">{t("therapist.clientDetail.passport")}</h2>
        <p className="mt-2 text-sm text-slate-300">{p.communicationStyle}</p>
        <div className="th-passport-grid mt-4">
          {passportBlocks.map((block) => (
            <div key={block.titleKey} className="rounded-lg bg-black/20 p-3">
              <p className="text-xs font-bold uppercase text-teal-400">{t(block.titleKey)}</p>
              <ul className="mt-2 list-inside list-disc text-sm text-slate-300">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-100">
          {t("therapist.clientDetail.emergency", { notes: p.emergencyNotes })}
        </p>
      </section>

      <section className="th-card p-5">
        <h2 className="font-extrabold">{t("therapist.clientDetail.insurance")}</h2>
        <p className="mt-2 text-sm">
          {client.insurance.payer} · {client.insurance.authNumber}
        </p>
        <p className="text-sm text-slate-400">
          {t("therapist.clientDetail.insuranceMeta", {
            used: String(client.insurance.usedUnits),
            approved: String(client.insurance.approvedUnits),
            date: client.insurance.expirationDate,
          })}
        </p>
      </section>

      <section className="th-card p-5">
        <VideoActivityPanel profileId={clientId} title={t("therapist.clientDetail.videoActivity")} compact />
      </section>
    </div>
  );
}
