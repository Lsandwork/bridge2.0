"use client";

import { useMemo } from "react";

type BarDatum = { label: string; tasks: number; routines: number; checkIns: number };

export function WeekBarChart({ data }: { data: BarDatum[] }) {
  const max = useMemo(
    () => Math.max(...data.flatMap((d) => [d.tasks, d.routines, d.checkIns]), 1),
    [data]
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-xs font-semibold text-[var(--text-secondary)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--brand)]" /> Tasks
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Routines
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Check-ins
        </span>
      </div>
      <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 110 }}>
              <div
                className="w-2 rounded-t bg-[var(--brand)]"
                style={{ height: `${(d.tasks / max) * 100}%`, minHeight: d.tasks ? 4 : 0 }}
                title={`Tasks: ${d.tasks}`}
              />
              <div
                className="w-2 rounded-t bg-emerald-500"
                style={{ height: `${(d.routines / max) * 100}%`, minHeight: d.routines ? 4 : 0 }}
                title={`Routines: ${d.routines}`}
              />
              <div
                className="w-2 rounded-t bg-amber-400"
                style={{ height: `${(d.checkIns / max) * 100}%`, minHeight: d.checkIns ? 4 : 0 }}
                title={`Check-ins: ${d.checkIns}`}
              />
            </div>
            <span className="text-[10px] font-bold text-[var(--text-tertiary)]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmotionDonut({ emotions }: { emotions: { label: string; count: number; color: string }[] }) {
  const total = emotions.reduce((s, e) => s + e.count, 0) || 1;
  let offset = 0;
  const segments = emotions.map((e) => {
    const pct = e.count / total;
    const seg = { ...e, pct, offset };
    offset += pct;
    return seg;
  });

  const gradient = segments
    .map((s) => `${s.color} ${(s.offset - s.pct) * 360}deg ${s.offset * 360}deg`)
    .join(", ");

  return (
    <div className="flex items-center gap-6">
      <div
        className="relative h-28 w-28 shrink-0 rounded-full"
        style={{ background: total > 0 ? `conic-gradient(${gradient})` : "#e5e7eb" }}
      >
        <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white text-center">
          <span className="text-xs font-bold text-[var(--text-secondary)]">{total} logs</span>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm">
        {emotions.map((e) => (
          <li key={e.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />
            <span className="font-medium text-[var(--text-primary)]">{e.label}</span>
            <span className="text-[var(--text-tertiary)]">{Math.round((e.count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
