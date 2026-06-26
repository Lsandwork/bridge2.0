import Link from "next/link";
import type { ReactNode } from "react";
import "@/app/legal.css";

type Section = {
  title: string;
  body: ReactNode;
};

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
  sections: Section[];
}) {
  return (
    <main className="legal-root">
      <div className="legal-shell">
        <Link href="/" className="legal-back">
          ← Back to Bridge
        </Link>
        <article className="legal-card">
          <p className="legal-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>Last updated: {updated}</p>
          <div className="legal-notice">{children}</div>
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <div>{section.body}</div>
            </section>
          ))}
          <section>
            <h2>Contact</h2>
            <p>
              Questions, privacy requests, data export requests, safety concerns, or legal notices may be sent to{" "}
              <a href="mailto:privacy@nuviobridge.com">privacy@nuviobridge.com</a>. If that inbox is not yet active,
              use your organization’s designated Bridge administrator until counsel approves final contact channels.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
