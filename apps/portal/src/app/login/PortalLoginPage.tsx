"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { postAuthJson } from "@/lib/auth/client";
import { clearBridgeClientState } from "@/lib/auth/clear-client-state";
import { resolvePostLoginDestination } from "@/lib/auth/post-login-dest";
import { useLanguage } from "@/components/LanguageProvider";
import "../landing.css";

type AuthResponse = {
  user?: { mustChangePassword?: boolean; role?: string };
  redirectTo?: string;
};

type Tab = "signin" | "signup";
type AccountType = "parent" | "therapist";

export default function PortalLoginPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [tab, setTab] = useState<Tab>("signin");
  const [accountType, setAccountType] = useState<AccountType>("parent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await postAuthJson<AuthResponse>("/api/auth/login", { email, password });
      clearBridgeClientState();
      const dest = resolvePostLoginDestination(data.user, data.redirectTo, next);
      window.location.assign(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  const submitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      const data = await postAuthJson<AuthResponse>("/api/auth/signup", {
        name,
        email,
        password,
        accountType,
      });
      clearBridgeClientState();
      const defaultRedirect = accountType === "therapist" ? "/setup/therapist" : "/setup/parent";
      const dest = next ? resolvePostLoginDestination(data.user, data.redirectTo ?? defaultRedirect, next) : data.redirectTo ?? defaultRedirect;
      window.location.assign(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.signupFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-root min-h-screen min-h-[100dvh]">
      <div className="landing-grain" aria-hidden />
      <div className="landing-orb landing-orb-1" aria-hidden />
      <div className="landing-orb landing-orb-2" aria-hidden />

      <main className="relative z-10 mx-auto flex min-h-screen min-h-[100dvh] w-full max-w-md flex-col justify-center p-6">
        <Link href="/" className="landing-logo mb-8 justify-center">
          <div className="landing-logo-mark">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Bridge
        </Link>

        <section className="landing-mockup p-6">
          <div className="flex rounded-xl bg-black/30 p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${tab === "signin" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
              onClick={() => {
                setTab("signin");
                setError("");
              }}
            >
              {t("auth.signIn")}
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${tab === "signup" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
              onClick={() => {
                setTab("signup");
                setError("");
              }}
            >
              {t("auth.signUp")}
            </button>
          </div>

          {tab === "signin" ? (
            <>
              <h1 className="mt-6 text-xl font-bold text-white">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-400">Sign in to Bridge with your email and password.</p>
              <form onSubmit={submitSignIn} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t("auth.email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t("auth.password")}
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
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
                  {loading ? t("common.loading") : t("auth.signIn")}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-6 text-xl font-bold text-white">Create your account</h1>
              <p className="mt-2 text-sm text-slate-400">
                For parents and therapists. You&apos;ll receive an access code to connect with individuals on the spectrum.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`rounded-xl border-2 px-3 py-3 text-left text-sm font-bold transition ${
                    accountType === "parent"
                      ? "border-violet-500 bg-violet-500/20 text-white"
                      : "border-white/10 text-slate-400"
                  }`}
                  onClick={() => setAccountType("parent")}
                >
                  {t("auth.accountParent")}
                </button>
                <button
                  type="button"
                  className={`rounded-xl border-2 px-3 py-3 text-left text-sm font-bold transition ${
                    accountType === "therapist"
                      ? "border-teal-400 bg-teal-500/20 text-white"
                      : "border-white/10 text-slate-400"
                  }`}
                  onClick={() => setAccountType("therapist")}
                >
                  {t("auth.accountTherapist")}
                </button>
              </div>

              <form onSubmit={submitSignUp} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t("auth.name")}
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t("auth.email")}
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t("auth.password")}
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                    minLength={8}
                    required
                  />
                  <p className="mt-1 text-[10px] text-slate-500">At least 8 characters</p>
                </div>
                <div>
                  <label htmlFor="confirm" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t("auth.confirmPassword")}
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
                  {loading ? t("common.loading") : t("auth.signUp")}
                </button>
              </form>
            </>
          )}

          <Link href="/" className="mt-4 block text-center text-sm text-slate-500 hover:text-slate-300">
            ← Back to home
          </Link>
          {tab === "signin" ? (
            <p className="mt-3 text-center text-sm text-slate-400">
              New to Bridge?{" "}
              <Link href="/onboarding" className="font-semibold text-violet-300 hover:text-violet-200">
                Build your Bridge
              </Link>
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
