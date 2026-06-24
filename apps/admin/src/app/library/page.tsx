"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Category = { slug: string; title: string; articles: { title: string }[] };

export default function AdminLibraryPage() {
  const [library, setLibrary] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/admin?section=library")
      .then((res) => res.json())
      .then(setLibrary);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <section className="card p-6">
        <h2 className="text-2xl font-semibold">Parent Library Content Management</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Manage education modules, social story templates, and exercise library content.
        </p>
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        {library.map((category) => (
          <article key={category.slug} className="card p-5">
            <h3 className="font-semibold">{category.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{category.articles.length} articles</p>
            <Link href={`http://localhost:4000/library/${category.slug}`} className="mt-2 inline-block text-sm text-blue-600">
              Preview in parent portal →
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
