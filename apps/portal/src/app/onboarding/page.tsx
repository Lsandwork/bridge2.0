"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useSupportPathway } from "@/components/SupportPathwayProvider";
import { supportPathways, type SupportPathwayId } from "@/lib/support-pathways";
import "../landing.css";
import "./onboarding.css";

type SetupRole = "self" | "family" | "professional";

export default function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; pathway?: string }>;
}) {
  const query = use(searchParams);
  const router = useRouter();
  const { selectPathway } = useSupportPathway();
  const requestedStep = Number(query.step);
  const [step, setStep] = useState<1 | 2 | 3>(
    requestedStep === 2 || requestedStep === 3 ? requestedStep : 1
  );
  const [selected, setSelected] = useState<SupportPathwayId>(() => {
    return supportPathways.some((pathway) => pathway.id === query.pathway)
      ? (query.pathway as SupportPathwayId)
      : "autism";
  });
  const [role, setRole] = useState<SetupRole>("family");
  const [accepted, setAccepted] = useState(false);

  const chosenPathway = supportPathways.find((pathway) => pathway.id === selected) ?? supportPathways[0];

  const finish = () => {
    selectPathway(selected);
    window.localStorage.setItem("bridge-setup-role", role);
    router.push(role === "professional" ? "/setup/therapist" : "/setup/parent");
  };

  return (
    <main className="bridge-onboarding">
      <section className="bridge-onboarding__story">
        <Link href="/" className="bridge-onboarding__brand" aria-label="Bridge home">
          <span className="bridge-onboarding__mark"><i /><i /></span>
          <strong>bridge</strong>
        </Link>

        <div className="bridge-onboarding__story-copy">
          <span>Personalized support, made human</span>
          <h1>{step === 1 ? "A clearer path starts here." : step === 2 ? "Support works better together." : "Built around real life."}</h1>
          <p>
            {step === 1
              ? "Bridge shapes everyday support around the person—not the other way around."
              : step === 2
                ? "The experience adapts for the person using Bridge, families, and professional care teams."
                : "Use Bridge for practical support and care coordination alongside—not instead of—qualified professional services."}
          </p>
        </div>

        <div className="bridge-onboarding__trust">
          <span className="bridge-onboarding__avatars"><i>A</i><i>M</i><i>J</i></span>
          <span><strong>One shared picture</strong><small>for everyday life between appointments</small></span>
        </div>
      </section>

      <section className="bridge-onboarding__panel">
        <div className="bridge-onboarding__top">
          <button type="button" onClick={() => step > 1 && setStep((step - 1) as 1 | 2)} disabled={step === 1}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="bridge-onboarding__steps" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((value) => <i key={value} className={step >= value ? "active" : ""} />)}
          </div>
          <span>Step {step} of 3</span>
        </div>

        <div className="bridge-onboarding__content">
          {step === 1 ? (
            <>
              <header className="bridge-onboarding__question">
                <span>A more personal beginning</span>
                <h2>Who are you supporting?</h2>
                <p>Choose the support pathway that feels closest. You can change it anytime and add overlapping needs in the profile.</p>
              </header>
              <div className="bridge-pathway-grid">
                {supportPathways.map((pathway) => (
                  <button
                    type="button"
                    key={pathway.id}
                    className={`bridge-pathway-option ${selected === pathway.id ? "selected" : ""}`}
                    onClick={() => setSelected(pathway.id)}
                    aria-pressed={selected === pathway.id}
                    style={{ "--option-accent": pathway.accent, "--option-soft": pathway.accentSoft } as React.CSSProperties}
                  >
                    <span className="bridge-pathway-option__icon">{pathway.icon}</span>
                    <span><strong>{pathway.name}</strong><small>{pathway.descriptor}</small></span>
                    {selected === pathway.id ? <Check className="bridge-pathway-option__check" size={16} /> : null}
                  </button>
                ))}
              </div>
              <button type="button" className="bridge-onboarding__continue" onClick={() => setStep(2)}>
                Continue with {chosenPathway.shortName} <ArrowRight size={17} />
              </button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <header className="bridge-onboarding__question">
                <span>Your Bridge experience</span>
                <h2>How will you use Bridge?</h2>
                <p>This changes the workspace, permissions, language, and the tools shown first.</p>
              </header>
              <div className="bridge-role-grid">
                {[
                  { id: "self", icon: "◎", title: "For myself", body: "A clear, private space for routines, tools, goals, and trusted support." },
                  { id: "family", icon: "♡", title: "For someone I support", body: "Coordinate daily support as a parent, family member, or caregiver." },
                  { id: "professional", icon: "♧", title: "As a professional", body: "Support clients or students as a clinician, educator, or coordinator." },
                ].map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={`bridge-role-option ${role === option.id ? "selected" : ""}`}
                    onClick={() => setRole(option.id as SetupRole)}
                  >
                    <span>{option.icon}</span>
                    <strong>{option.title}</strong>
                    <small>{option.body}</small>
                    {role === option.id ? <Check size={16} /> : null}
                  </button>
                ))}
              </div>
              <button type="button" className="bridge-onboarding__continue" onClick={() => setStep(3)}>
                Continue <ArrowRight size={17} />
              </button>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <header className="bridge-onboarding__question">
                <span>Clear boundaries, safer support</span>
                <h2>One important agreement.</h2>
                <p>Bridge provides assistive tools, education, organization, and care coordination. It does not diagnose, prescribe, or replace licensed care or emergency services.</p>
              </header>
              <div className="bridge-safety-card">
                <ShieldCheck size={28} />
                <div>
                  <strong>Bridge is a support platform.</strong>
                  <ul>
                    <li>Use professional judgment before following AI-generated suggestions.</li>
                    <li>Contact qualified professionals for diagnosis and treatment decisions.</li>
                    <li>Call 911 or 988 in the United States for urgent or crisis support.</li>
                  </ul>
                </div>
              </div>
              <label className="bridge-agreement">
                <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                <span>I understand these boundaries and agree to use Bridge as supportive technology.</span>
              </label>
              <button type="button" className="bridge-onboarding__continue" onClick={finish} disabled={!accepted}>
                Build my Bridge <ArrowRight size={17} />
              </button>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
