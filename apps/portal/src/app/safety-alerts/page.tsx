"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

type Alert = {
  id: string;
  userName: string;
  bridgeGroupName: string | null;
  concernCategory: string;
  severity: string;
  status: string;
  triggeringExcerpt: string;
  aiSummary: string | null;
  recommendedSteps: string | null;
  createdAt: string;
  isDemo: boolean;
};

export default function SafetyAlertsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (user?.role === "child_user") {
      router.replace("/dashboard");
      return;
    }
    fetch("/api/platform/safety-alerts")
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts ?? []));
  }, [user, router]);

  const updateStatus = async (alertId: string, status: string) => {
    await fetch("/api/platform/safety-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId, status }),
    });
    const res = await fetch("/api/platform/safety-alerts");
    const d = await res.json();
    setAlerts(d.alerts ?? []);
  };

  if (user?.role === "child_user") return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 dark:border-rose-900 dark:bg-rose-950/30">
        <h1 className="text-2xl font-bold text-rose-900 dark:text-rose-100">Safety Alerts</h1>
        <p className="mt-1 text-rose-800/80 dark:text-rose-200/80">
          Concerns that may need a calm, caring adult response. Center users are not shown this tab.
        </p>
      </div>
      <div className="space-y-4">
        {alerts.map((a) => (
          <article key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">{a.severity}</span>
              <span className="font-semibold">{a.userName}</span>
              <span className="text-sm text-slate-500">{a.bridgeGroupName}</span>
              {a.isDemo ? <span className="text-xs text-violet-600">Demo sample</span> : null}
            </div>
            <p className="mt-3 text-sm italic text-slate-700 dark:text-slate-300">&ldquo;{a.triggeringExcerpt}&rdquo;</p>
            {a.aiSummary ? <p className="mt-2 text-sm text-slate-600">{a.aiSummary}</p> : null}
            {a.recommendedSteps ? (
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800">{a.recommendedSteps}</pre>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {(["acknowledged", "in_progress", "resolved"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateStatus(a.id, s)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium capitalize hover:bg-slate-50 dark:border-slate-600"
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </article>
        ))}
        {alerts.length === 0 ? <p className="text-slate-500">No safety alerts at this time.</p> : null}
      </div>
    </div>
  );
}
