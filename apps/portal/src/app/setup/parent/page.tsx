"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { useAuth } from "@/components/AuthProvider";
import "../../landing.css";

export default function ParentSetupPage() {
  const router = useRouter();
  const { user, loading: authLoading, refresh: refreshAuth } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState<"child" | "teen" | "adult">("child");
  const [supportNotes, setSupportNotes] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [profileId, setProfileId] = useState("");
  const [childEmail, setChildEmail] = useState("");
  const [childPassword, setChildPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const createProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          action: "create-profile",
          name,
          ageGroup,
          supportNotes,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        await refreshAuth();
        throw new Error("Your sign-in session was not available. Please sign in again.");
      }
      if (!res.ok) throw new Error(data.error);
      setAccessCode(data.accessCode);
      setProfileId(data.profile.id);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create profile.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="landing-root min-h-screen min-h-[100dvh]">
      <div className="landing-grain" aria-hidden />
      <main className="relative z-10 mx-auto max-w-lg px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/" className="landing-logo">
            Bridge
          </Link>
          <SignOutButton variant="compact" className="border-white/20 text-slate-300 hover:bg-white/10" />
        </div>

        <article className="landing-mockup p-6">
          {!authLoading && !user ? (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
              <h1 className="text-xl font-bold text-white">Please sign in again</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Your account was created, but this browser does not currently have an active Bridge session.
              </p>
              <Link href="/login?next=/setup/parent" className="landing-btn-primary mt-4 w-full justify-center">
                Return to sign in
              </Link>
            </div>
          ) : authLoading ? (
            <p className="py-8 text-center text-sm text-slate-400">Checking your secure session…</p>
          ) : step === 1 ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-300">Parent setup · Step 1 of 2</p>
              <h1 className="mt-2 text-2xl font-bold text-white">Add your child, teen, or adult</h1>
              <p className="mt-2 text-sm text-slate-400">
                Create a profile for the person using Bridge. You&apos;ll get an access code to share with therapists and caregivers.
              </p>
              <form onSubmit={createProfile} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Age group</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as typeof ageGroup)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                  >
                    <option value="child">Child</option>
                    <option value="teen">Teen</option>
                    <option value="adult">Adult</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Support notes (optional)</label>
                  <textarea
                    value={supportNotes}
                    onChange={(e) => setSupportNotes(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                    placeholder="Sensory needs, communication preferences…"
                  />
                </div>
                {error ? <p className="text-sm text-red-300">{error}</p> : null}
                <button type="submit" disabled={loading} className="landing-btn-primary w-full justify-center">
                  {loading ? "Creating…" : "Create profile & get access code"}
                </button>
              </form>
            </>
          ) : step === 2 ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Step 2 · Your access code</p>
              <h1 className="mt-2 text-2xl font-bold text-white">Share this code</h1>
              <p className="mt-2 text-sm text-slate-400">
                Therapists and other caregivers enter this code in Bridge to connect to {name}&apos;s profile and track progress, rewards, and interactions.
              </p>
              <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 p-4">
                <code className="text-lg font-extrabold tracking-widest text-emerald-200">{accessCode}</code>
                <button type="button" onClick={copyCode} className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <h2 className="font-bold text-white">Optional: My Space login for {name}</h2>
                <p className="mt-1 text-sm text-slate-400">Let them sign in on their own device to use games, Talk cards, and mood check-ins.</p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!childEmail || !childPassword) {
                      router.push("/dashboard");
                      return;
                    }
                    setLoading(true);
                    setError("");
                    try {
                      const res = await fetch("/api/access-codes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        cache: "no-store",
                        body: JSON.stringify({
                          action: "add-child-login",
                          profileId,
                          childLoginEmail: childEmail,
                          childLoginPassword: childPassword,
                          childLoginName: name,
                        }),
                      });
                      if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error);
                      }
                      router.push("/dashboard");
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Could not create login.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="mt-4 space-y-3"
                >
                  <input
                    type="email"
                    placeholder="Their email"
                    value={childEmail}
                    onChange={(e) => setChildEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                  />
                  <input
                    type="password"
                    placeholder="Password (min 8 characters)"
                    value={childPassword}
                    onChange={(e) => setChildPassword(e.target.value)}
                    minLength={8}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                  />
                  {error ? <p className="text-sm text-red-300">{error}</p> : null}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button type="button" onClick={() => router.push("/dashboard")} className="flex-1 rounded-xl border border-white/20 py-3 text-sm font-bold text-white">
                      Skip for now
                    </button>
                    <button type="submit" disabled={loading} className="landing-btn-primary flex-1 justify-center">
                      {loading ? "Saving…" : "Create My Space login"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : null}
        </article>
      </main>
    </div>
  );
}
