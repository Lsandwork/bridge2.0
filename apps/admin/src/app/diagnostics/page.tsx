"use client";

import { useCallback, useEffect, useState } from "react";

type VideoActivityRow = {
  id: string;
  profileName: string;
  type: string;
  videoTitle?: string;
  searchQuery?: string;
  pointsAwarded?: number;
  at: string;
};

function AdminVideoActivity() {
  const [rows, setRows] = useState<VideoActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin?section=video-activity")
      .then((r) => r.json())
      .then((d) => setRows(d.activity ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-sm text-slate-500">Loading video activity…</p>;

  return (
    <>
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h3 className="font-semibold">My Space video tracking</h3>
        <p className="text-xs text-slate-500">All plays, searches, and reward events across profiles</p>
      </div>
      <div className="max-h-[32rem] overflow-y-auto">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No video activity logged yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Profile</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="whitespace-nowrap p-3 text-xs text-slate-500">{new Date(a.at).toLocaleString()}</td>
                  <td className="p-3">{a.profileName}</td>
                  <td className="p-3 capitalize">{a.type}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {a.type === "search"
                      ? `"${a.searchQuery}"`
                      : a.videoTitle
                        ? `${a.videoTitle}${a.pointsAwarded ? ` (+${a.pointsAwarded} pt)` : ""}`
                        : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

type AccessPlan = "free" | "monthly" | "annual";
type CourseAccessTier = "included" | "insurance_packet" | "coaching_intensive" | "unlocked";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  mustChangePassword: boolean;
  libraryCredits: number;
  accessPlan: AccessPlan;
  accessExpiresAt: string | null;
  accessActive: boolean;
  lastActiveAt: string | null;
};

type ActivityEvent = {
  id: string;
  userId: string;
  email: string;
  action: string;
  detail?: string;
  at: string;
};

type SiteIssue = {
  id: string;
  severity: "critical" | "warning" | "info";
  category: string;
  message: string;
  source: string;
  status: "open" | "resolved";
  at: string;
};

type Analytics = {
  loginsToday: number;
  logoutsToday: number;
  spectrumLoginsToday: number;
  activeUsers7d: number;
  adminActionsToday: number;
  creditsUsed: number;
  openIssues: number;
  criticalIssues: number;
  totalUsers: number;
  roleCounts: Record<string, number>;
  actionBreakdown: Record<string, number>;
};

type LibraryCourse = { slug: string; title: string; accessTier: string };
type CourseGrant = { courseSlug: string; tier: string; grantedAt: string };

type Tab = "accounts" | "library" | "issues" | "videos" | "activity";

function formatAction(action: string) {
  return action.replace(/_/g, " ");
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString();
}

const COURSE_TIERS: CourseAccessTier[] = ["unlocked", "included", "insurance_packet", "coaching_intensive"];

export default function AdminDiagnosticsPage() {
  const [tab, setTab] = useState<Tab>("accounts");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [siteIssues, setSiteIssues] = useState<SiteIssue[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [courses, setCourses] = useState<LibraryCourse[]>([]);
  const [courseGrants, setCourseGrants] = useState<CourseGrant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [forceChange, setForceChange] = useState(true);
  const [creditAmount, setCreditAmount] = useState("5");
  const [creditNote, setCreditNote] = useState("");
  const [accessPlan, setAccessPlan] = useState<AccessPlan>("monthly");
  const [grantCourseSlug, setGrantCourseSlug] = useState("");
  const [grantCourseTier, setGrantCourseTier] = useState<CourseAccessTier>("unlocked");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [diagRes, coursesRes] = await Promise.all([
        fetch("/api/admin?section=diagnostics"),
        fetch("/api/admin?section=courses"),
      ]);
      const data = await diagRes.json();
      const courseList = await coursesRes.json();
      if (!diagRes.ok) throw new Error(data.error ?? "Failed to load diagnostics.");
      setUsers(data.users ?? []);
      setActivity(data.activity ?? []);
      setSiteIssues(data.siteIssues ?? []);
      setAnalytics(data.analytics ?? null);
      setCourses(Array.isArray(courseList) ? courseList : []);
      setSelectedId((current) => current ?? data.users?.[0]?.id ?? null);
      if (data.users?.[0]?.id) {
        const grantsRes = await fetch(`/api/admin?section=course-access&userId=${data.users[0].id}`);
        const grants = await grantsRes.json();
        setCourseGrants(Array.isArray(grants) ? grants : []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load diagnostics.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCourseGrants = useCallback(async (userId: string) => {
    const res = await fetch(`/api/admin?section=course-access&userId=${userId}`);
    const grants = await res.json();
    setCourseGrants(Array.isArray(grants) ? grants : []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedId) loadCourseGrants(selectedId);
  }, [selectedId, loadCourseGrants]);

  useEffect(() => {
    if (courses.length && !grantCourseSlug) setGrantCourseSlug(courses[0]?.slug ?? "");
  }, [courses, grantCourseSlug]);

  const selected = users.find((u) => u.id === selectedId) ?? null;

  const runAction = async (payload: Record<string, unknown>) => {
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, actorEmail: "admin@bridge" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed.");
      if (data.tempPassword) {
        setMessage(`Temporary password set: ${data.tempPassword} (user must change on next login)`);
      } else {
        setMessage("Updated successfully.");
      }
      await load();
      if (selectedId) await loadCourseGrants(selectedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "accounts", label: "Accounts" },
    { id: "library", label: "Library access" },
    { id: "issues", label: "Site issues" },
    { id: "videos", label: "Video activity" },
    { id: "activity", label: "Activity log" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <section className="card p-6">
        <h2 className="text-2xl font-semibold">Admin Diagnostics</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Full account control, library credits, per-course access, site health, and activity analytics.
        </p>
      </section>

      {analytics ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Logins today", analytics.loginsToday],
            ["Spectrum sign-ins", analytics.spectrumLoginsToday],
            ["Active users (7d)", analytics.activeUsers7d],
            ["Open site issues", analytics.openIssues],
            ["Critical issues", analytics.criticalIssues],
            ["Library credits used", analytics.creditsUsed],
            ["Admin actions today", analytics.adminActionsToday],
            ["Total accounts", analytics.totalUsers],
          ].map(([label, value]) => (
            <article key={String(label)} className="card p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-2xl font-semibold">{value}</p>
            </article>
          ))}
        </section>
      ) : null}

      {error ? <section className="card p-4 text-sm text-red-700">{error}</section> : null}
      {message ? <section className="card p-4 text-sm text-emerald-800">{message}</section> : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <section className="card p-6 text-sm text-slate-500">Loading diagnostics…</section>
      ) : tab === "accounts" ? (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <section className="card overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h3 className="font-semibold">All accounts</h3>
              <p className="text-xs text-slate-500">{users.length} users in auth database</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Plan</th>
                    <th className="p-3 text-left">Credits</th>
                    <th className="p-3 text-left">Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`cursor-pointer border-t border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50 ${
                        selectedId === user.id ? "bg-blue-50 dark:bg-blue-950/30" : ""
                      }`}
                      onClick={() => setSelectedId(user.id)}
                    >
                      <td className="p-3">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="p-3 capitalize text-xs">{user.role.replace(/_/g, " ")}</td>
                      <td className="p-3 capitalize">{user.accessPlan}</td>
                      <td className="p-3">{user.libraryCredits}</td>
                      <td className="p-3 text-xs text-slate-500">
                        {user.lastActiveAt ? formatTime(user.lastActiveAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card p-5">
            <h3 className="font-semibold">Manage account</h3>
            {!selected ? (
              <p className="mt-3 text-sm text-slate-500">Select a user from the table.</p>
            ) : (
              <div className="mt-4 space-y-5">
                <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
                  <p className="font-medium">{selected.name}</p>
                  <p className="text-slate-500">{selected.email}</p>
                  <p className="mt-1 capitalize text-slate-500">{selected.role.replace(/_/g, " ")}</p>
                  <p className="mt-2 text-xs">
                    Access:{" "}
                    <span className={selected.accessActive ? "text-emerald-700" : "text-slate-500"}>
                      {selected.accessActive ? "Active" : "Inactive"}
                    </span>
                    {selected.accessExpiresAt ? ` · expires ${selected.accessExpiresAt}` : ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                      onClick={() => runAction({ action: "reset-password", userId: selected.id })}
                    >
                      Reset to temp password
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    <input
                      type="password"
                      placeholder="Set new password (min 8 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input type="checkbox" checked={forceChange} onChange={(e) => setForceChange(e.target.checked)} />
                      Require change on next login
                    </label>
                    <button
                      type="button"
                      disabled={newPassword.length < 8}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                      onClick={() => {
                        runAction({
                          action: "set-password",
                          userId: selected.id,
                          password: newPassword,
                          mustChangePassword: forceChange,
                        });
                        setNewPassword("");
                      }}
                    >
                      Set password
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Library credits</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Note (optional)"
                      value={creditNote}
                      onChange={(e) => setCreditNote(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    className="mt-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white hover:bg-teal-700"
                    onClick={() =>
                      runAction({
                        action: "add-credits",
                        userId: selected.id,
                        amount: Number(creditAmount),
                        note: creditNote || undefined,
                      })
                    }
                  >
                    Add credits
                  </button>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subscription plan</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["free", "monthly", "annual"] as AccessPlan[]).map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        className={`rounded-lg px-3 py-2 text-xs font-medium capitalize ${
                          accessPlan === plan
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                        onClick={() => setAccessPlan(plan)}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                    onClick={() => runAction({ action: "set-access", userId: selected.id, plan: accessPlan })}
                  >
                    Apply {accessPlan} access
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : tab === "library" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <section className="card p-5">
            <h3 className="font-semibold">Select account</h3>
            <div className="mt-3 max-h-96 space-y-1 overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedId(user.id)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                    selectedId === user.id ? "bg-blue-100 dark:bg-blue-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h3 className="font-semibold">Per-course & coaching access</h3>
            {selected ? (
              <>
                <p className="mt-1 text-sm text-slate-500">Managing: {selected.name}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <select
                    value={grantCourseSlug}
                    onChange={(e) => setGrantCourseSlug(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                  >
                    {courses.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <select
                    value={grantCourseTier}
                    onChange={(e) => setGrantCourseTier(e.target.value as CourseAccessTier)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                  >
                    {COURSE_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white"
                    onClick={() =>
                      runAction({
                        action: "grant-course",
                        userId: selected.id,
                        courseSlug: grantCourseSlug,
                        courseTier: grantCourseTier,
                      })
                    }
                  >
                    Grant access
                  </button>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase text-slate-500">Current grants</p>
                  {courseGrants.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">No per-course grants — user relies on plan or credits.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {courseGrants.map((g) => (
                        <li
                          key={g.courseSlug}
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                        >
                          <span>
                            {courses.find((c) => c.slug === g.courseSlug)?.title ?? g.courseSlug}{" "}
                            <span className="text-slate-500">({g.tier.replace(/_/g, " ")})</span>
                          </span>
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600"
                            onClick={() =>
                              runAction({ action: "revoke-course", userId: selected.id, courseSlug: g.courseSlug })
                            }
                          >
                            Revoke
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Select an account to manage library access.</p>
            )}
          </section>
        </div>
      ) : tab === "issues" ? (
        <section className="card overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h3 className="font-semibold">Site health & issues</h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {siteIssues.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No issues logged.</p>
            ) : (
              siteIssues.map((issue) => (
                <div key={issue.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                          issue.severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : issue.severity === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-xs text-slate-500">{issue.category}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          issue.status === "open" ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {issue.status}
                      </span>
                    </div>
                    <p className="mt-2 font-medium">{issue.message}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {issue.source} · {formatTime(issue.at)}
                    </p>
                  </div>
                  {issue.status === "open" ? (
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                      onClick={() => runAction({ action: "resolve-issue", issueId: issue.id })}
                    >
                      Resolve
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      ) : tab === "videos" ? (
        <section className="card overflow-hidden p-0">
          <AdminVideoActivity />
        </section>
      ) : (
        <section className="card overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h3 className="font-semibold">Recent activity</h3>
          </div>
          <div className="max-h-[32rem] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Detail</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((event) => (
                  <tr key={event.id} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="p-3 whitespace-nowrap text-xs text-slate-500">{formatTime(event.at)}</td>
                    <td className="p-3 text-xs">{event.email}</td>
                    <td className="p-3 capitalize">{formatAction(event.action)}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{event.detail ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {analytics ? (
        <section className="card p-6">
          <h3 className="font-semibold">Role breakdown & action analytics</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Users by role</p>
              <ul className="mt-2 space-y-1 text-sm">
                {Object.entries(analytics.roleCounts).map(([role, count]) => (
                  <li key={role} className="flex justify-between capitalize">
                    <span>{role.replace(/_/g, " ")}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Top actions (recent)</p>
              <ul className="mt-2 space-y-1 text-sm">
                {Object.entries(analytics.actionBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([action, count]) => (
                    <li key={action} className="flex justify-between capitalize">
                      <span>{formatAction(action)}</span>
                      <span className="font-semibold">{count}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
