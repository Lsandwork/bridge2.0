"use client";

import { useEffect, useState } from "react";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

type Profile = {
  id: string;
  name: string;
  ageGroup: string;
  mode: string;
  supportNotes: string;
};

const AGE_GROUP_KEYS: Record<string, string> = {
  child: "parent.profiles.age.child",
  teen: "parent.profiles.age.teen",
  adult: "parent.profiles.age.adult",
};

export default function ProfilesPage() {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", ageGroup: "child", supportNotes: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/profiles");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setProfiles(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("parent.profiles.loadFailed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const createProfile = async () => {
    setMessage("");
    setError(null);
    if (!form.name.trim()) {
      setError(t("parent.profiles.nameRequired"));
      return;
    }
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? t("parent.profiles.createFailed"));
      return;
    }
    setForm({ name: "", ageGroup: "child", supportNotes: "" });
    setMessage(t("parent.profiles.created"));
    const res2 = await fetch("/api/profiles");
    const refreshed = await res2.json();
    setProfiles(refreshed);
  };

  if (loading) return <LoadingBlock label={t("parent.profiles.loading")} />;
  if (error && profiles.length === 0) return <ErrorBlock message={error} />;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <section className="card p-6">
        <h2 className="text-2xl font-bold text-stone-900">{t("parent.profiles.title")}</h2>
        <p className="mt-2 text-sm text-stone-600">{t("parent.profiles.subtitle")}</p>
      </section>

      <section className="card p-6">
        <h3 className="text-lg font-bold text-stone-900">{t("parent.profiles.addProfile")}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-md border border-stone-300 p-2"
            placeholder={t("parent.profiles.namePlaceholder")}
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <select
            className="rounded-md border border-stone-300 p-2"
            value={form.ageGroup}
            onChange={(e) => setForm((p) => ({ ...p, ageGroup: e.target.value }))}
          >
            <option value="child">{t("parent.profiles.age.child")}</option>
            <option value="teen">{t("parent.profiles.age.teen")}</option>
            <option value="adult">{t("parent.profiles.age.adult")}</option>
          </select>
          <input
            className="rounded-md border border-stone-300 p-2 md:col-span-1"
            placeholder={t("parent.profiles.notesPlaceholder")}
            value={form.supportNotes}
            onChange={(e) => setForm((p) => ({ ...p, supportNotes: e.target.value }))}
          />
        </div>
        <button className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm text-white" onClick={createProfile}>
          {t("parent.profiles.create")}
        </button>
        {message ? <p className="mt-2 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </section>

      {profiles.length === 0 ? (
        <EmptyBlock message={t("parent.profiles.empty")} />
      ) : (
        <section className="grid gap-3 md:grid-cols-2">
          {profiles.map((profile) => (
            <article key={profile.id} className="card p-5">
              <h3 className="text-xl font-bold text-stone-900">{profile.name}</h3>
              <p className="mt-1 text-sm capitalize text-stone-500">
                {t(AGE_GROUP_KEYS[profile.ageGroup] ?? "parent.profiles.age.child")} ·{" "}
                {t("parent.profiles.modeLabel", { mode: profile.mode })}
              </p>
              <p className="mt-2 text-sm text-stone-700">
                {profile.supportNotes || t("parent.profiles.noNotes")}
              </p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
