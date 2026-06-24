"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  HeartHandshake,
  School,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supportPathways } from "@/lib/support-pathways";
import "@/app/landing.css";

export function LandingPage() {
  return (
    <div className="landing-root">
      <div className="landing-ambient" aria-hidden />

      <header className="landing-nav">
        <Link href="/" className="landing-logo">
          <div className="landing-logo-mark">
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden>
              <path d="M8 22c0-4 3-8 8-8s8 4 8 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="10" cy="12" r="3" fill="#fff" fillOpacity="0.9" />
              <circle cx="22" cy="12" r="3" fill="#fff" fillOpacity="0.9" />
              <path d="M13 12h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
            </svg>
          </div>
          <span className="landing-logo-name">Bridge</span>
        </Link>

        <nav className="landing-desktop-links" aria-label="Main navigation">
          <a href="#who-we-support">Who we support</a>
          <a href="#how-it-works">How it works</a>
          <a href="#organizations">For organizations</a>
          <Link href="/pricing">Coverage & pricing</Link>
        </nav>

        <div className="landing-nav-actions">
          <LanguageSwitcher compact />
          <Link href="/login" className="landing-link-quiet">Sign in</Link>
          <Link href="/onboarding" className="landing-btn-primary">Build your Bridge</Link>
        </div>
      </header>

      <main>
        <section className="landing-new-hero">
          <div className="landing-new-hero__copy">
            <span className="landing-kicker"><Sparkles size={14} /> Support for life between appointments</span>
            <h1>Everyday support, shaped around the person.</h1>
            <p>Bridge brings routines, communication, skill-building, care coordination, and progress into one calm place—for people, families, clinicians, schools, and support organizations.</p>
            <div className="landing-new-hero__actions">
              <Link href="/onboarding" className="landing-btn-primary landing-btn-lg">Find your support pathway <ArrowRight size={16} /></Link>
              <a href="#how-it-works" className="landing-btn-ghost">See how Bridge works</a>
            </div>
            <div className="landing-new-hero__trust">
              <span><Check size={14} /> Person-centered</span>
              <span><Check size={14} /> Care-team ready</span>
              <span><Check size={14} /> Clear safety boundaries</span>
            </div>
          </div>

          <div className="landing-product-preview">
            <div className="landing-product-preview__bar"><i /><i /><i /><span>bridge · today</span></div>
            <div className="landing-product-preview__body">
              <aside>
                <b>bridge</b>
                <span className="active">⌂ Today</span>
                <span>◎ Support plan</span>
                <span>☷ Routines</span>
                <span>◇ Tools</span>
                <span>↗ Progress</span>
                <span>♧ Care circle</span>
              </aside>
              <div className="landing-product-preview__main">
                <span className="landing-product-preview__tag">Personalized support pathway</span>
                <h2>A clearer next step for today.</h2>
                <p>Visual routines, practical tools, and one shared plan.</p>
                <div className="landing-product-preview__cards">
                  <i /><i /><i />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-pathways" id="who-we-support">
          <header className="landing-section-heading">
            <span>Who Bridge can support</span>
            <h2>Start with the person, not a label.</h2>
            <p>Select the pathway that feels closest, then personalize around real functional needs, preferences, goals, and support settings.</p>
          </header>
          <div className="landing-pathway-grid">
            {supportPathways.map((pathway) => (
              <Link
                key={pathway.id}
                href={`/onboarding?pathway=${pathway.id}`}
                style={{ "--lp-path-accent": pathway.accent, "--lp-path-soft": pathway.accentSoft } as React.CSSProperties}
              >
                <i>{pathway.icon}</i>
                <strong>{pathway.name}</strong>
                <small>{pathway.descriptor}</small>
                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-how" id="how-it-works">
          <header className="landing-section-heading">
            <span>One connected system</span>
            <h2>From everyday moments to a clearer care picture.</h2>
          </header>
          <div className="landing-how-grid">
            {[
              ["01", "Personalize", "Choose a support pathway, communication preferences, sensory needs, goals, and the people involved."],
              ["02", "Use Bridge daily", "Follow routines, practice skills, complete check-ins, and keep helpful tools available in the moment."],
              ["03", "See what helps", "Review progress, patterns, and care-team notes without reducing the person to a score."],
              ["04", "Coordinate support", "Share the right information with family, clinicians, educators, coordinators, or veteran support teams."],
            ].map(([number, title, body]) => (
              <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
        </section>

        <section className="landing-platform">
          <div className="landing-platform__copy">
            <span className="landing-kicker">Complete, not complicated</span>
            <h2>Everything needed to carry support into real life.</h2>
            <p>Bridge is designed as a shared layer around existing professional care—not a replacement for it.</p>
            <div className="landing-feature-list">
              {[
                "Visual routines and step-by-step tasks",
                "Communication boards and preference supports",
                "Goals, progress, reports, and care-team notes",
                "Exercises and between-session carryover",
                "Parent and caregiver education library",
                "Coverage, documentation, and organization workflows",
                "Accessible personal space with mood and regulation tools",
                "Therapist, educator, and support-coordinator workspaces",
              ].map((feature) => <span key={feature}><Check size={15} /> {feature}</span>)}
            </div>
          </div>
          <div className="landing-platform__stack">
            <article><ClipboardCheck /><span><strong>Today’s plan</strong><small>Clear routines and next steps</small></span><b>82%</b></article>
            <article><UsersRound /><span><strong>Care circle</strong><small>Family, clinician, teacher</small></span><b>3</b></article>
            <article><HeartHandshake /><span><strong>Weekly progress</strong><small>Meaningful moments captured</small></span><b>+18%</b></article>
          </div>
        </section>

        <section className="landing-organizations" id="organizations">
          <header className="landing-section-heading">
            <span>Built to partner</span>
            <h2>For families and the systems around them.</h2>
          </header>
          <div className="landing-org-grid">
            <article><HeartHandshake /><h3>Families & caregivers</h3><p>A calmer way to organize daily support, share updates, and notice progress.</p></article>
            <article><ShieldCheck /><h3>Clinics & therapists</h3><p>Between-session carryover, approved exercises, documentation, and coordinated goals.</p></article>
            <article><School /><h3>Schools & community programs</h3><p>Accessible routines, communication supports, transition planning, and consistent strategies.</p></article>
            <article><Building2 /><h3>Health plans & organizations</h3><p>Configurable programs, engagement signals, functional outcomes, and implementation support.</p></article>
          </div>
        </section>

        <section className="landing-safety">
          <ShieldCheck size={34} />
          <div><span>Responsible by design</span><h2>Supportive technology with clear boundaries.</h2><p>Bridge does not diagnose, prescribe treatment, or replace licensed professionals, emergency services, or a person’s existing clinical care.</p></div>
          <Link href="/onboarding">Read and continue <ArrowRight size={15} /></Link>
        </section>

        <section className="landing-close">
          <span className="landing-kicker">Your Bridge can begin here</span>
          <h2>Make everyday support feel more connected.</h2>
          <p>Choose a pathway and see the experience Bridge shapes around it.</p>
          <Link href="/onboarding" className="landing-btn-primary landing-btn-lg">Build your Bridge <ArrowRight size={16} /></Link>
        </section>
      </main>

      <footer className="landing-footer landing-footer--complete">
        <div><span className="landing-logo-name">Bridge</span><p>Support that meets people where they are.</p></div>
        <div><Link href="/pricing">Coverage & pricing</Link><Link href="/login">Sign in</Link><Link href="/onboarding">Get started</Link></div>
        <small>Bridge is supportive technology and does not provide diagnosis, treatment, or emergency services.</small>
      </footer>
    </div>
  );
}
