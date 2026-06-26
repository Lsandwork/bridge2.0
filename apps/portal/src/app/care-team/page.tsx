"use client";

import { useEffect, useState } from "react";
import { EmptyBlock, LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  childProfileIds: string[];
  notes?: string;
};

const ROLE_KEYS: Record<string, string> = {
  therapist: "parent.careTeam.role.therapist",
  teacher: "parent.careTeam.role.teacher",
  caregiver: "parent.careTeam.role.caregiver",
  doctor: "parent.careTeam.role.doctor",
};

export default function CareTeamPage() {
  const { t } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", role: "caregiver", notes: "", childProfileId: "" });

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((profs) => {
        const list = Array.isArray(profs) ? profs : [];
        setProfiles(list);
        const firstId = list[0]?.id ?? "";
        setForm((current) => ({ ...current, childProfileId: current.childProfileId || firstId }));
        if (!firstId) {
          setLoading(false);
          return;
        }
        return fetch(`/api/bridge?section=care-team&profileId=${firstId}`)
          .then((r) => r.json())
          .then((team) => setMembers(Array.isArray(team) ? team : []))
          .finally(() => setLoading(false));
      })
      .catch(() => setLoading(false));
  }, []);

  const addMember = async () => {
    if (!form.name.trim() || !form.email.includes("@") || !form.childProfileId) return;
    const res = await fetch("/api/bridge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-care-team",
        name: form.name,
        email: form.email,
        role: form.role,
        notes: form.notes,
        childProfileIds: [form.childProfileId],
      }),
    });
    const member = await res.json();
    if (res.ok) {
      setMembers((prev) => [...prev, member]);
      setForm((current) => ({ name: "", email: "", role: "caregiver", notes: "", childProfileId: current.childProfileId }));
    }
  };

  if (loading) return <LoadingBlock label={t("parent.careTeam.loading")} />;
  if (!profiles.length) return <EmptyBlock message={t("parent.dashboard.noProfile")} />;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-extrabold">{t("parent.careTeam.title")}</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {t("parent.careTeam.subtitle")}
      </p>

      <section className="card mt-6 p-5">
        <h3 className="font-bold">{t("parent.careTeam.invite")}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <input className="rounded-xl border px-3 py-2" placeholder={t("parent.careTeam.name")} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className="rounded-xl border px-3 py-2" placeholder={t("parent.careTeam.email")} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <select className="rounded-xl border px-3 py-2" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            <option value="therapist">{t("parent.careTeam.role.therapist")}</option>
            <option value="teacher">{t("parent.careTeam.role.teacher")}</option>
            <option value="caregiver">{t("parent.careTeam.role.caregiver")}</option>
            <option value="doctor">{t("parent.careTeam.role.doctor")}</option>
          </select>
          <select className="rounded-xl border px-3 py-2" value={form.childProfileId} onChange={(e) => setForm((f) => ({ ...f, childProfileId: e.target.value }))}>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input className="rounded-xl border px-3 py-2 md:col-span-2" placeholder={t("parent.careTeam.notes")} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <button type="button" className="btn-primary py-2" onClick={addMember} disabled={!form.childProfileId}>{t("parent.careTeam.add")}</button>
        </div>
      </section>

      {members.length === 0 ? (
        <EmptyBlock message={t("parent.careTeam.empty")} />
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <article key={m.id} className="card p-5">
              <p className="text-xs font-bold uppercase text-[var(--brand)]">
                {ROLE_KEYS[m.role] ? t(ROLE_KEYS[m.role]) : m.role}
              </p>
              <h3 className="mt-1 text-lg font-bold">{m.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{m.email}</p>
              {m.notes ? <p className="mt-2 text-sm text-[var(--text-tertiary)]">{m.notes}</p> : null}
              <p className="mt-3 text-xs text-[var(--text-tertiary)]">
                Supports: {m.childProfileIds.map((id) => profiles.find((p) => p.id === id)?.name ?? id).join(", ")}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
