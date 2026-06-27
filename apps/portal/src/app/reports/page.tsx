"use client";

import { useEffect, useState } from "react";
import { EmptyBlock, LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

type Report = { id: string; childProfileId: string; title: string; body: string; periodStart: string; periodEnd: string; createdAt: string };

export default function ReportsPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/bridge?section=reports").then((r) => r.json()),
      fetch("/api/profiles").then((r) => r.json()),
    ]).then(([reps, profs]) => {
      setReports(Array.isArray(reps) ? reps : []);
      setProfiles(Array.isArray(profs) ? profs : []);
      setLoading(false);
    });
  }, []);

  const generateReport = async (profileId: string) => {
    setGenerating(true);
    const res = await fetch("/api/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, save: true }),
    });
    const data = await res.json();
    if (res.ok) {
      setReports((prev) => [
        {
          id: data.reportId,
          childProfileId: profileId,
          title: `Nuvio Weekly Summary`,
          body: data.text,
          periodStart: "",
          periodEnd: "",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } else {
      alert(data.error ?? t("parent.reports.generateFailed"));
    }
    setGenerating(false);
  };

  const exportTxt = (report: Report) => {
    const blob = new Blob([`${report.title}\n\n${report.body}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bridge-report-${report.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingBlock label={t("parent.reports.loading")} />;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">{t("parent.reports.title")}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t("parent.reports.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              className="btn-primary px-3 py-2 text-sm"
              disabled={generating}
              onClick={() => generateReport(p.id)}
            >
              {t("parent.reports.generate")} ({p.name})
            </button>
          ))}
        </div>
      </div>

      {reports.length === 0 ? (
        <EmptyBlock message={t("parent.reports.empty")} />
      ) : (
        <div className="mt-6 space-y-4">
          {reports.map((report) => (
            <article key={report.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{report.title}</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {profiles.find((p) => p.id === report.childProfileId)?.name} · {report.createdAt.slice(0, 10)}
                  </p>
                </div>
                <button type="button" className="btn-secondary px-3 py-1.5 text-sm" onClick={() => exportTxt(report)}>
                  {t("parent.reports.export")}
                </button>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">{report.body}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
