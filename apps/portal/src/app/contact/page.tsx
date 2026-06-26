import Link from "next/link";
import { ArrowRight, Building2, HeartHandshake, ShieldCheck } from "lucide-react";
import "@/app/landing.css";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;
  const partnerIntent = intent === "partner" || intent === "demo";
  const subject = encodeURIComponent(
    partnerIntent ? "Nuvio Bridge organization demo request" : "Nuvio Bridge contact"
  );

  return (
    <main className="landing-root landing-simple-page">
      <div className="landing-ambient" aria-hidden />
      <div className="landing-grain" aria-hidden />

      <section className="landing-simple-page__card">
        <Link href="/" className="landing-logo" aria-label="Nuvio Bridge home">
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
            <span><strong>Nuvio Bridge</strong><small>Care intelligence</small></span>
          </span>
        </Link>

        <span className="landing-kicker">Contact and partnership requests</span>
        <h1>{partnerIntent ? "Request an organization conversation." : "Talk with Nuvio Bridge."}</h1>
        <p>
          For schools, clinics, agencies, community programs, veteran-support organizations, health plans,
          or grant-funded pilots, contact the Nuvio Bridge team directly. Do not send protected health
          information, emergency concerns, passwords, or private records by email.
        </p>

        <div className="landing-simple-page__grid">
          <article>
            <Building2 />
            <h2>Organizations</h2>
            <p>Discuss pilots, implementation, staff workflows, pricing, and partnership fit.</p>
          </article>
          <article>
            <HeartHandshake />
            <h2>Families and providers</h2>
            <p>Ask about support pathways, coverage documentation, and safe setup expectations.</p>
          </article>
          <article>
            <ShieldCheck />
            <h2>Safety first</h2>
            <p>Bridge is not an emergency service. Use local emergency or crisis resources for urgent needs.</p>
          </article>
        </div>

        <div className="landing-simple-page__actions">
          <a href={`mailto:hello@nuviobridge.com?subject=${subject}`} className="landing-btn-primary">
            Email Nuvio Bridge <ArrowRight size={16} />
          </a>
          <Link href="/pricing" className="landing-btn-ghost">Coverage & pricing</Link>
          <Link href="/build-your-bridge" className="landing-btn-ghost">Build your Bridge</Link>
        </div>
      </section>
    </main>
  );
}
