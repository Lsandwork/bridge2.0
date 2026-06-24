"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error("Something went wrong. Please try again.");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed.");
      router.push(next.startsWith("/") ? next : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card w-full p-6">
      <h1 className="text-2xl font-semibold">Admin sign in</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Admin accounts only. Use your Bridge admin credentials.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <Link href="http://localhost:4000/" className="mt-4 inline-block text-sm text-blue-600">
        ← Back to Bridge portal
      </Link>
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-6">
      <Suspense fallback={<section className="card w-full p-6">Loading…</section>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
