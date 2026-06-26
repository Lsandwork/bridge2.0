"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  Check,
  CheckSquare,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  MessageCircle,
  School,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supportPathways } from "@/lib/support-pathways";
import "@/app/landing.css";

const buildHref = "/build-your-bridge";

const trustBadges = [
  "Care-team ready",
  "Person-centered",
  "AI-assisted",
  "Clear safety boundaries",
];

const careNodes = [
  { label: "Child / teen / adult", detail: "Daily tools, check-ins, routines", icon: "◎", className: "node-person" },
  { label: "Parent / caregiver", detail: "Plans, notes, reminders", icon: "♡", className: "node-family" },
  { label: "Therapist", detail: "Goals, carryover, summaries", icon: "✦", className: "node-therapist" },
  { label: "School / IEP team", detail: "Support strategies and context", icon: "▦", className: "node-school" },
  { label: "Case manager", detail: "Coordination and permissions", icon: "♧", className: "node-case" },
  { label: "Organization", detail: "Programs, safety, outcomes", icon: "◇", className: "node-org" },
];

const howItWorks = [
  {
    number: "01",
    title: "Personalize the Bridge",
    body: "Choose a support pathway, age group, communication preferences, safety needs, and the people involved.",
  },
  {
    number: "02",
    title: "Build daily support",
    body: "Create routines, tasks, goals, regulation tools, communication supports, and practical steps for real life.",
  },
  {
    number: "03",
    title: "Coordinate care",
    body: "Share the right information with parents, caregivers, therapists, educators, coordinators, and trusted support teams.",
  },
  {
    number: "04",
    title: "Track and adapt",
    body: "Start with clean real-user data, then use progress patterns and care-team notes to refine what helps over time.",
  },
];

const platformFeatures = [
  { title: "Goals & routines", body: "Track real priorities from a clean baseline.", icon: Target },
  { title: "Communication support", body: "Visual choices, notes, preferences, and carryover.", icon: MessageCircle },
  { title: "Care-team notes", body: "Keep families, therapists, schools, and providers aligned.", icon: UsersRound },
  { title: "Progress reports", body: "Readable summaries for meetings, visits, and planning.", icon: FileText },
  { title: "Safety alerts", body: "Escalation-aware signals with human review boundaries.", icon: ShieldAlert },
  { title: "Learning library", body: "Respectful guidance for everyday support between appointments.", icon: BookOpen },
];

const organizationCards = [
  {
    title: "Schools & IEP teams",
    body: "Support routines, transition planning, communication, documentation, and consistent strategies across settings.",
    icon: School,
  },
  {
    title: "Therapists & clinics",
    body: "Between-session carryover, caregiver education, shared goals, and clearer progress summaries.",
    icon: HeartHandshake,
  },
  {
    title: "Agencies & support programs",
    body: "Coordinate community living, case management, caregiver support, and program-level visibility.",
    icon: Building2,
  },
  {
    title: "Health plans & partners",
    body: "Pilot engagement, functional support, documentation workflows, and implementation-ready care pathways.",
    icon: ClipboardCheck,
  },
];

function NuvioLogo() {
  return (
    <span className="landing-logo-lockup">
      <span className="landing-logo-mark" aria-hidden>
        <svg viewBox="0 0 44 44" fill="none">
          <path className="logo-bridge" d="M9 28c3.5-8 8-12 13-12s9.5 4 13 12" />
          <path className="logo-thread" d="M10 27c6-2.2 10-2.2 15 0 3.8 1.7 6.8 1.6 9.8-.2" />
          <circle cx="10" cy="28" r="3.2" />
          <circle cx="22" cy="16" r="3.2" />
          <circle cx="34" cy="28" r="3.2" />
        </svg>
      </span>
      <span>
        <strong>Nuvio Bridge</strong>
        <small>Care intelligence</small>
      </span>
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
  center = false,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  center?: boolean;
}) {
  return (
    <header className={`landing-section-heading ${center ? "landing-section-heading--center" : ""}`}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </header>
  );
}

function AnimatedConnectionLines() {
  return (
    <svg className="landing-connection-lines" viewBox="0 0 760 360" fill="none" aria-hidden>
      <path d="M58 259C173 113 302 92 417 184C523 268 626 242 703 94" />
      <path d="M83 99C209 187 321 219 422 153C526 85 612 123 690 229" />
      <path d="M158 305C273 218 360 208 456 246C548 282 617 257 681 169" />
    </svg>
  );
}

function HumanAICollage() {
  return (
    <div className="landing-human-ai" aria-label="Families, care teams, and Bridge connected by supportive AI">
      <AnimatedConnectionLines />
      <div className="landing-human-ai__photo landing-human-ai__photo--family">
        <Image src="/landing/bridge-hero-family.jpg" alt="Family support moment" fill sizes="(max-width: 900px) 82vw, 360px" priority />
      </div>
      <div className="landing-human-ai__photo landing-human-ai__photo--therapy">
        <Image src="/landing/bridge-hero-therapy.jpg" alt="Supportive therapy and learning moment" fill sizes="(max-width: 900px) 58vw, 280px" />
      </div>
      <div className="landing-human-ai__photo landing-human-ai__photo--therapist">
        <Image src="/landing/bridge-hero-therapist.jpg" alt="Therapist and caregiver care coordination" fill sizes="(max-width: 900px) 54vw, 260px" />
      </div>
      <div className="landing-live-card landing-live-card--main">
        <div className="landing-live-card__top">
          <span><i /> Live care layer</span>
          <b>Index 94</b>
        </div>
        <h3>Calmer morning. Goal practice ready.</h3>
        <div className="landing-pulse-line" aria-hidden />
        <div className="landing-live-card__metrics">
          <span><strong>7/8</strong><small>Routine</small></span>
          <span><strong>3</strong><small>Care notes</small></span>
          <span><strong>0</strong><small>Alerts</small></span>
        </div>
      </div>
      <div className="landing-mini-signal landing-mini-signal--parent">Parent synced · 2m ago</div>
      <div className="landing-mini-signal landing-mini-signal--school">School / IEP · goal updated</div>
      <div className="landing-mini-signal landing-mini-signal--ai">Nuvio AI · 3 gentle nudges</div>
    </div>
  );
}

function BridgeNetworkVisual() {
  return (
    <div className="landing-network" aria-label="Nuvio Bridge connects the support network">
      <AnimatedConnectionLines />
      <div className="landing-network__core">
        <NuvioLogo />
        <p>AI-assisted care coordination layer</p>
      </div>
      {careNodes.map((node) => (
        <article key={node.label} className={`landing-network__node ${node.className}`}>
          <span>{node.icon}</span>
          <strong>{node.label}</strong>
          <small>{node.detail}</small>
        </article>
      ))}
    </div>
  );
}

function ProductPreviewGrid() {
  return (
    <div className="landing-dashboard-preview" id="dashboards">
      <div className="landing-dashboard-preview__window landing-dashboard-preview__window--large">
        <div className="landing-window-bar"><i /><i /><i /><span>parent dashboard</span></div>
        <div className="landing-dashboard-preview__body">
          <aside>
            <b>Bridge</b>
            <span className="active">Today</span>
            <span>Routines</span>
            <span>Goals</span>
            <span>Care team</span>
          </aside>
          <main>
            <span className="landing-product-preview__tag">Clean real-user baseline</span>
            <h3>No demo stats. Real progress starts here.</h3>
            <div className="landing-stat-row">
              <span><strong>0%</strong><small>Tasks</small></span>
              <span><strong>0%</strong><small>Routines</small></span>
              <span><strong>0</strong><small>Check-ins</small></span>
            </div>
            <div className="landing-setup-strip">
              <CheckSquare size={16} />
              <span>Quick Setup: goals, notifications, routines, care-team access</span>
            </div>
          </main>
        </div>
      </div>
      <article className="landing-preview-card">
        <Calendar />
        <strong>Daily routines</strong>
        <small>Step-by-step support that can be shared with trusted people.</small>
      </article>
      <article className="landing-preview-card">
        <UsersRound />
        <strong>Care-team workspace</strong>
        <small>Family, therapist, school, and organization views stay coordinated.</small>
      </article>
      <article className="landing-preview-card landing-preview-card--alert">
        <ShieldAlert />
        <strong>Safety boundaries</strong>
        <small>Supportive alerts with emergency limitations clearly stated.</small>
      </article>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="landing-root landing-root--home">
      <div className="landing-ambient" aria-hidden />
      <div className="landing-grain" aria-hidden />

      <header className="landing-nav">
        <Link href="/" className="landing-logo" aria-label="Nuvio Bridge home">
          <NuvioLogo />
        </Link>

        <nav className="landing-desktop-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#who-we-support">Who it helps</a>
          <a href="#dashboards">Dashboards</a>
          <Link href="/pricing">Coverage</Link>
          <a href="#responsible-ai">Safety</a>
        </nav>

        <div className="landing-nav-actions">
          <LanguageSwitcher compact />
          <Link href="/login" className="landing-link-quiet">Sign in</Link>
          <Link href={buildHref} className="landing-btn-primary">Build <ArrowRight size={15} /></Link>
        </div>
      </header>

      <main>
        <section className="landing-hero-pro">
          <div className="landing-hero-pro__copy">
            <span className="landing-kicker"><Sparkles size={14} /> AI-assisted care, finally connected</span>
            <h1>The bridge between every person who cares.</h1>
            <p>
              Nuvio Bridge connects the child, teen, or adult at the center with parents, caregivers,
              therapists, schools, IEP teams, providers, and support organizations—turning routines,
              goals, communication, and safety into one calm, intelligent care ecosystem.
            </p>
            <div className="landing-hero-pro__actions">
              <Link href={buildHref} className="landing-btn-primary landing-btn-xl">
                Build your Bridge <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="landing-btn-ghost">
                See how it works
              </a>
            </div>
            <div className="landing-trust-badges" aria-label="Nuvio Bridge trust markers">
              {trustBadges.map((badge) => (
                <span key={badge}><Check size={14} /> {badge}</span>
              ))}
            </div>
          </div>
          <HumanAICollage />
        </section>

        <section className="landing-section landing-section--network" id="how-it-works">
          <SectionHeader
            center
            eyebrow="The Bridge"
            title="One intelligent layer around the whole support circle."
            body="Bridge does not replace care. It connects the people, plans, routines, goals, and notes that already surround someone—so everyday support can become easier to understand and act on."
          />
          <BridgeNetworkVisual />
        </section>

        <section className="landing-section landing-pathways" id="who-we-support">
          <SectionHeader
            eyebrow="Who Nuvio Bridge can support"
            title="Start with the person, then personalize around real support needs."
            body="These are support pathways, not boxes. Families and teams can combine routines, communication, emotional regulation, independence, recovery, and care coordination based on the person’s actual goals."
          />
          <div className="landing-pathway-grid">
            {supportPathways.map((pathway) => (
              <Link
                key={pathway.id}
                href={`${buildHref}?pathway=${pathway.id}`}
                className="landing-pathway-card"
                style={{ "--lp-path-accent": pathway.accent, "--lp-path-soft": pathway.accentSoft } as CSSProperties}
              >
                <i>{pathway.icon}</i>
                <span>
                  <strong>{pathway.name}</strong>
                  <small>{pathway.descriptor}</small>
                </span>
                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-section landing-how-pro">
          <SectionHeader
            eyebrow="How it works"
            title="From a first setup to a living support system."
            body="The flow is connected to the real Supabase signup/onboarding path, so new real users start clean and demo content stays only in demo accounts."
          />
          <div className="landing-how-pro__grid">
            {howItWorks.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-ai-section" id="features">
          <div>
            <span className="landing-kicker">Nuvio AI companion</span>
            <h2>Helpful intelligence with human boundaries.</h2>
            <p>
              Nuvio helps organize daily support, routines, check-ins, communication needs, therapy
              carryover, progress summaries, and gentle recommendations. It is supportive technology—not
              diagnosis, treatment, emergency response, or a replacement for licensed professionals.
            </p>
            <div className="landing-feature-list">
              {platformFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title}>
                    <Icon />
                    <span>
                      <strong>{feature.title}</strong>
                      <small>{feature.body}</small>
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
          <div className="landing-ai-console">
            <div className="landing-ai-console__orb" aria-hidden />
            <span>NUVIO · SUPPORTIVE AI</span>
            <h3>Today’s care-team brief</h3>
            <p>
              “Morning routine is ready. No real progress data yet, so Quick Setup will ask for first goals,
              notification preferences, and care-team access before tracking begins.”
            </p>
            <ul>
              <li><Check /> No diagnosis or treatment claims</li>
              <li><Check /> Human review for high-risk signals</li>
              <li><Check /> Role-based sharing and clear consent boundaries</li>
            </ul>
          </div>
        </section>

        <section className="landing-section">
          <SectionHeader
            center
            eyebrow="Product preview"
            title="A premium dashboard experience for real care work."
            body="Parents, caregivers, therapists, school users, and organizations need useful information without overwhelming the person at the center."
          />
          <ProductPreviewGrid />
        </section>

        <section className="landing-section landing-organizations" id="organizations">
          <SectionHeader
            eyebrow="Organizations and partners"
            title="Built for the systems around families."
            body="Nuvio Bridge can support direct families first, then grow into schools, clinics, agencies, community programs, health plans, and veteran-support partnerships."
          />
          <div className="landing-org-grid">
            {organizationCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title}>
                  <Icon />
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              );
            })}
          </div>
          <div className="landing-org-cta">
            <Link href="/contact?intent=partner" className="landing-btn-primary">
              Partner with Nuvio Bridge <ArrowRight size={16} />
            </Link>
            <Link href="/pricing" className="landing-btn-ghost">Coverage & pricing</Link>
          </div>
        </section>

        <section className="landing-section landing-pricing-band">
          <div>
            <span className="landing-kicker">Coverage and payment pathways</span>
            <h2>Professional coverage conversations, without overpromising reimbursement.</h2>
            <p>
              Bridge can support private pay, organization pilots, grant-funded programs, school or provider workflows,
              and payer conversations. Coverage always depends on eligibility, medical necessity, program rules, and documentation.
            </p>
          </div>
          <Link href="/pricing" className="landing-btn-primary landing-btn-lg">
            View coverage options <ArrowRight size={16} />
          </Link>
        </section>

        <section className="landing-section landing-safety-pro" id="responsible-ai">
          <ShieldCheck size={36} />
          <div>
            <span>Responsible AI and safety</span>
            <h2>Clear boundaries protect Bridge, families, and the people being supported.</h2>
            <p>
              Nuvio Bridge does not diagnose, prescribe treatment, replace licensed professionals, replace emergency services,
              or make final clinical decisions. High-risk alerts should be reviewed by humans and emergency needs should use local emergency services or crisis resources.
            </p>
          </div>
          <div className="landing-safety-pro__links">
            <Link href="/safety">Safety notice</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </section>

        <section className="landing-close landing-close--premium">
          <span className="landing-kicker">Your Bridge can begin here</span>
          <h2>Create a connected support system around the person you love.</h2>
          <p>Choose a support pathway, create the real account, add the person’s profile, and start with a clean Quick Setup instead of demo stats.</p>
          <div className="landing-close__actions">
            <Link href={buildHref} className="landing-btn-primary landing-btn-xl">
              Build your Bridge <ArrowRight size={18} />
            </Link>
            <Link href="/contact?intent=demo" className="landing-btn-ghost">
              Request organization demo
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer landing-footer--complete">
        <div>
          <NuvioLogo />
          <p>Human-centered, AI-assisted support for life between appointments.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href={buildHref}>Build your Bridge</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/pricing">Coverage</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/safety">Safety</Link>
          <Link href="/data-policy">Data policy</Link>
        </nav>
        <small>
          Nuvio Bridge is supportive technology. It does not provide diagnosis, treatment, legal advice,
          insurance approval, crisis intervention, or emergency services.
        </small>
      </footer>
    </div>
  );
}
