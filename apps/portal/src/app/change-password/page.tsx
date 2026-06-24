"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { postAuthJson } from "@/lib/auth/client";
import "../landing.css";

type ChangePasswordResponse = {
  redirectTo?: string;
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const data = await postAuthJson<ChangePasswordResponse>("/api/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      router.push(data.redirectTo ?? "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="landing-root min-h-screen">
      <div className="landing-grain" aria-hidden />
      <div className="landing-orb landing-orb-1" aria-hidden />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
        <Link href="/" className="landing-logo mb-8 justify-center">
          <div className="landing-logo-mark">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Bridge
        </Link>

        <section className="landing-mockup p-6">
          <h1 className="text-xl font-bold text-white">Create your new password</h1>
          <p className="mt-2 text-sm text-slate-400">
            For security, set a new password before continuing. Use at least 8 characters.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="current" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current password
              </label>
              <input
                id="current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                required
              />
            </div>
            <div>
              <label htmlFor="new" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                New password
              </label>
              <input
                id="new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                minLength={8}
                required
              />
            </div>
            <div>
              <label htmlFor="confirm" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Confirm new password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                minLength={8}
                required
              />
            </div>
            {error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="landing-btn-primary w-full justify-center disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save and continue"}
            </button>
          </form>

          <button
            type="button"
            onClick={signOut}
            className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-300"
          >
            Sign out
          </button>
        </section>
      </main>
    </div>
  );
}
