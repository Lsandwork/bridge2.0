"use client";

import { useEffect, useState } from "react";
import type { VideoActivity } from "@family-support/data";

type Props = {
  profileId?: string;
  title?: string;
  compact?: boolean;
  apiUrl?: string;
};

function formatType(type: string) {
  return type.replace(/_/g, " ");
}

export function VideoActivityPanel({ profileId, title = "Video activity", compact = false, apiUrl }: Props) {
  const [activity, setActivity] = useState<VideoActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url =
      apiUrl ??
      (profileId
        ? `/api/videos?section=activity&profileId=${profileId}&limit=50`
        : `/api/videos?section=activity&limit=100`);
    fetch(url)
      .then((r) => r.json())
      .then((d) => setActivity(d.activity ?? []))
      .finally(() => setLoading(false));
  }, [profileId, apiUrl]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading video activity…</p>;
  }

  if (activity.length === 0) {
    return (
      <section className={compact ? "" : "card p-5"}>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">No video plays or searches logged yet.</p>
      </section>
    );
  }

  return (
    <section className={compact ? "" : "card overflow-hidden"}>
      {!compact ? (
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-slate-500">Plays, searches, and points from My Space Videos</p>
        </div>
      ) : (
        <h3 className="mb-2 font-extrabold">{title}</h3>
      )}
      <div className={compact ? "space-y-2" : "max-h-80 overflow-y-auto"}>
        <table className={`w-full text-sm ${compact ? "" : ""}`}>
          {!compact ? (
            <thead className="sticky top-0 bg-slate-50 text-xs dark:bg-slate-800">
              <tr>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-left">Profile</th>
                <th className="p-2 text-left">Action</th>
                <th className="p-2 text-left">Detail</th>
              </tr>
            </thead>
          ) : null}
          <tbody>
            {activity.map((a) => (
              <tr key={a.id} className={compact ? "block rounded-lg bg-black/20 p-2 text-xs" : "border-t border-slate-200 dark:border-slate-700"}>
                {!compact ? (
                  <>
                    <td className="whitespace-nowrap p-2 text-xs text-slate-500">
                      {new Date(a.at).toLocaleString()}
                    </td>
                    <td className="p-2">{a.profileName}</td>
                    <td className="p-2 capitalize">{formatType(a.type)}</td>
                    <td className="p-2 text-slate-600 dark:text-slate-300">
                      {a.type === "search"
                        ? `"${a.searchQuery}"`
                        : a.videoTitle
                          ? `${a.videoTitle}${a.pointsAwarded ? ` (+${a.pointsAwarded} pt)` : ""}`
                          : "—"}
                    </td>
                  </>
                ) : (
                  <td>
                    <p className="font-bold capitalize">{formatType(a.type)}</p>
                    <p className="text-slate-500">
                      {a.type === "search" ? `Search: ${a.searchQuery}` : a.videoTitle ?? "—"}
                      {a.pointsAwarded ? ` · +${a.pointsAwarded} pt` : ""}
                    </p>
                    <p className="text-[10px] text-slate-500">{new Date(a.at).toLocaleString()}</p>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
