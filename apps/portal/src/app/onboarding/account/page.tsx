"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { postAuthJson } from "@/lib/auth/client";
import { useAuth } from "@/components/AuthProvider";
import {
  clearOnboardingIntake,
  readOnboardingIntake,
  type OnboardingIntake,
} from "@/lib/onboarding/intake";
import "../../landing.css";
import "../onboarding.css";

type AuthResponse = {
  user?: { role?: string };
  redirectTo?: string;
};

export default function OnboardingAccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [intake, setIntake] = useState<OnboardingIntake | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileName, setProfileName] = useState("");
  const [ageGroup, setAgeGroup] = useState<"child" | "teen" | "adult">("child");
  const [supportNotes, setSupportNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = readOnboardingIntake();
    if (!saved) {
      router.replace("/onboarding");
      return;
    }
    setIntake(saved);
  }, [router]);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      router.replace(user.role === "caregiver_therapist_teacher" ? "/therapist" : "/dashboard");
    }
  }, [authLoading, user, router]);

  if (!intake) {
    return (
      <main className="bridge-onboarding">
        <section className="bridge-onboarding__panel">
          <p className="text-sm text-slate-400">Loading your Bridge setup…</p>
        </section>
      </main>
    );
  }

  const isProfessional = intake.setupRole === "professional";
  const needsProfile = !isProfessional;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the terms to create your account.");
      return;
    }
    if (needsProfile && !profileName.trim()) {
      setError("Enter the name of the person you are setting up Bridge for.");
      return;
    }

    setLoading(true);
    try {
      const data = await postAuthJson<AuthResponse>("/api/auth/onboarding-signup", {
        name,
        email,
        password,
        confirmPassword,
        accountType: isProfessional ? "therapist" : "parent",
        setupRole: intake.setupRole,
        pathwayId: intake.pathwayId,
        safetyAcceptedAt: intake.safetyAcceptedAt,
        profileName: needsProfile ? profileName.trim() : undefined,
        ageGroup: needsProfile ? ageGroup : undefined,
        supportNotes: needsProfile ? supportNotes : undefined,
        termsAccepted,
      });
      clearOnboardingIntake();
      window.location.assign(data.redirectTo ?? "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bridge-onboarding">
      <section className="bridge-onboarding__story">
        <Link href="/onboarding" className="bridge-onboarding__brand" aria-label="Bridge home">
          <span className="bridge-onboarding__mark"><i /><i /></span>
          <strong>bridge</strong>
        </Link>
        <div className="bridge-onboarding__story-copy">
          <span>Almost there</span>
          <h1>Create your secure Bridge account.</h1>
          <p>
            Your intake answers are saved. Create your account to save your profile and open your
            personalized dashboard.
          </p>
        </div>
      </section>

      <section className="bridge-onboarding__panel">
        <div className="bridge-onboarding__top">
          <Link href="/onboarding?step=3" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">
            <ArrowLeft size={16} /> Back
          </Link>
          <span>Account setup</span>
        </div>

        <form className="bridge-onboarding__content space-y-4" onSubmit={submit}>
          <header className="bridge-onboarding__question">
            <span>Your account</span>
            <h2>{isProfessional ? "Professional account details" : "Parent or caregiver account"}</h2>
            <p>Use this email and password to sign in to Bridge on any device.</p>
          </header>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
              required
            />
          </label>

          {needsProfile ? (
            <div className="space-y-4 border-t border-white/10 pt-4">
              <header className="bridge-onboarding__question">
                <span>Profile</span>
                <h2>
                  {intake.setupRole === "self"
                    ? "Your Bridge profile"
                    : "Who are you supporting?"}
                </h2>
              </header>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-400">
                  {intake.setupRole === "self" ? "Your name on Bridge" : "Child, teen, or adult name"}
                </span>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-400">Age group</span>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as typeof ageGroup)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                >
                  <option value="child">Child</option>
                  <option value="teen">Teen</option>
                  <option value="adult">Adult</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-400">Support notes (optional)</span>
                <textarea
                  value={supportNotes}
                  onChange={(e) => setSupportNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                  placeholder="Sensory needs, communication preferences…"
                />
              </label>
            </div>
          ) : null}

          <label className="bridge-agreement">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>
              I agree to Bridge&apos;s terms and understand Bridge provides supportive tools, not
              clinical diagnosis or emergency services.
            </span>
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button type="submit" className="bridge-onboarding__continue" disabled={loading}>
            {loading ? "Creating account…" : "Create account & open dashboard"} <ArrowRight size={17} />
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-300 hover:text-violet-200">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
