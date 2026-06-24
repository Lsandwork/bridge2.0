"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import "../../landing.css";

type Mode = "choose" | "code" | "new-client";

export default function TherapistSetupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState<"child" | "teen" | "adult">("teen");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [supportNotes, setSupportNotes] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const redeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeem", code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/therapist");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-client",
          name,
          ageGroup,
          supportNotes,
          parentName,
          parentEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAccessCode(data.accessCode);
      setMode("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add client.");
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
          {mode === "choose" ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300">Therapist setup</p>
              <h1 className="mt-2 text-2xl font-bold text-white">Connect to clients</h1>
              <p className="mt-2 text-sm text-slate-400">
                Enter an access code from a parent, or add a new client and parent to your caseload.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => setMode("code")}
                  className="w-full rounded-xl border-2 border-teal-500/50 bg-teal-500/10 p-4 text-left"
                >
                  <p className="font-bold text-white">I have an access code</p>
                  <p className="mt-1 text-sm text-slate-400">Link to an existing profile shared by a parent</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("new-client")}
                  className="w-full rounded-xl border-2 border-white/10 p-4 text-left hover:border-white/20"
                >
                  <p className="font-bold text-white">Add a new client</p>
                  <p className="mt-1 text-sm text-slate-400">Create profile + parent info; share code with family</p>
                </button>
              </div>
            </>
          ) : mode === "code" && !accessCode ? (
            <>
              <button type="button" onClick={() => setMode("choose")} className="text-sm text-slate-400 hover:text-white">
                ← Back
              </button>
              <h1 className="mt-4 text-xl font-bold text-white">Enter access code</h1>
              <form onSubmit={redeemCode} className="mt-4 space-y-4">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="BR-XXXX-XXXX"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-center font-mono text-lg tracking-widest text-white"
                  required
                />
                {error ? <p className="text-sm text-red-300">{error}</p> : null}
                <button type="submit" disabled={loading} className="landing-btn-primary w-full justify-center">
                  {loading ? "Connecting…" : "Connect to profile"}
                </button>
              </form>
            </>
          ) : mode === "new-client" && !accessCode ? (
            <>
              <button type="button" onClick={() => setMode("choose")} className="text-sm text-slate-400 hover:text-white">
                ← Back
              </button>
              <h1 className="mt-4 text-xl font-bold text-white">Add client & parent</h1>
              <form onSubmit={addClient} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Client name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white" required />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Age group</label>
                  <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value as typeof ageGroup)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white">
                    <option value="child">Child</option>
                    <option value="teen">Teen</option>
                    <option value="adult">Adult</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Parent / caregiver name</label>
                  <input value={parentName} onChange={(e) => setParentName(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Parent email</label>
                  <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Clinical notes</label>
                  <textarea value={supportNotes} onChange={(e) => setSupportNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white" />
                </div>
                {error ? <p className="text-sm text-red-300">{error}</p> : null}
                <button type="submit" disabled={loading} className="landing-btn-primary w-full justify-center">
                  {loading ? "Adding…" : "Add client & generate code"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white">Share with parent</h1>
              <p className="mt-2 text-sm text-slate-400">Give this access code to the parent so they can link their account and collaborate on care.</p>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border-2 border-teal-500/40 bg-teal-500/10 p-4">
                <code className="text-lg font-extrabold tracking-widest text-teal-200">{accessCode}</code>
                <button type="button" onClick={copyCode} className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <button type="button" onClick={() => router.push("/therapist")} className="landing-btn-primary mt-6 w-full justify-center">
                Open therapist dashboard
              </button>
            </>
          )}
        </article>
      </main>
    </div>
  );
}
