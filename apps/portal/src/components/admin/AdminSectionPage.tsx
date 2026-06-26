"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch(`/api/platform/admin?section=${section}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [section]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-slate-600">{description}</p>
      </div>
      {loading ? <p className="text-slate-500">Loading…</p> : render(data)}
    </div>
  );
}
