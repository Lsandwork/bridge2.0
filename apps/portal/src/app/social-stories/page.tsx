"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyBlock, LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

type Story = { id: string; title: string; situation: string; sentences: string[]; childProfileId: string };

export default function SocialStoriesPage() {
  const { t } = useLanguage();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bridge?section=social-stories")
      .then((r) => r.json())
      .then((data) => setStories(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock label={t("socialStories.loading")} />;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">{t("socialStories.title")}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t("socialStories.subtitle")}</p>
        </div>
        <Link href="/tess" className="btn-primary px-4 py-2 text-sm">
          {t("socialStories.generate")}
        </Link>
      </div>

      {stories.length === 0 ? (
        <EmptyBlock message={t("socialStories.empty")} />
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {stories.map((story) => (
            <article key={story.id} className="card p-6">
              <p className="text-xs font-bold uppercase text-[var(--brand)]">{story.situation}</p>
              <h3 className="mt-1 text-xl font-bold">{story.title}</h3>
              <ol className="mt-4 space-y-2">
                {story.sentences.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-light)] text-xs font-bold text-[var(--brand-dark)]">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
