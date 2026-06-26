"use client";

import { useEffect, useState } from "react";
import { AdminErrorState, AdminLoadingState } from "./AdminUi";

export function AdminSectionPage({
  title,
  description,
  section,
  render,
}: {
  title: string;
  description: string;
  section: string;
  render: (data: unknown) => React.ReactNode;
}) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/platform/admin?section=${section}`)
      .then(async (r) => {
        const payload = await r.json().catch(() => null);
        if (!r.ok) throw new Error(payload?.error ?? `Could not load ${title}.`);
        return payload;
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : `Could not load ${title}.`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [section, title]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-slate-600">{description}</p>
      </div>
      {loading ? <AdminLoadingState label={`Loading ${title.toLowerCase()}…`} /> : null}
      {!loading && error ? <AdminErrorState message={error} /> : null}
      {!loading && !error ? render(data) : null}
    </div>
  );
}
