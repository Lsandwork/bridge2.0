import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Data Export, Retention, and Backups",
  description: "Bridge data export, retention, deletion, and backup policy.",
};

export default function DataPolicyPage() {
  return (
    <LegalPage
      eyebrow="Data governance"
      title="Data Export, Retention, and Backups"
      updated="June 26, 2026"
      sections={[
        {
          title: "Export requests",
          body: (
            <p>
              Verified account owners may request a copy of their account data, profile data, care-team links, notes,
              routines, reports, and other reasonably exportable information. Bridge may require identity verification,
              authority confirmation, organization approval, or guardian/professional authorization before releasing
              data about another person.
            </p>
          ),
        },
        {
          title: "Deletion and correction",
          body: (
            <p>
              Verified users may request correction or deletion where legally available. Some information may be
              retained where necessary for security, safety, audit logs, legal obligations, dispute resolution,
              professional/organization records, backup integrity, or compliance with applicable law.
            </p>
          ),
        },
        {
          title: "Backups",
          body: (
            <p>
              Bridge should maintain database backups through its infrastructure provider, including routine backup
              snapshots and restoration procedures appropriate to the production plan. Backups are intended for disaster
              recovery, security, continuity, and accidental-loss protection—not for routine user browsing. Deleted data
              may remain in backups for a limited period until backup expiration.
            </p>
          ),
        },
        {
          title: "Operational policy",
          body: (
            <ul>
              <li>Review backup status before each production launch and after major schema migrations.</li>
              <li>Restrict database and backup access to authorized administrators only.</li>
              <li>Log administrative exports and restoration events where technically available.</li>
              <li>Test restoration procedures periodically before relying on production data at scale.</li>
              <li>Do not use production exports for development unless de-identified or approved under policy.</li>
            </ul>
          ),
        },
        {
          title: "Expected response timing",
          body: (
            <p>
              Bridge aims to acknowledge verified export, correction, or deletion requests within a reasonable period
              and respond within timeframes required by applicable state, federal, organizational, or contractual law.
              Complex requests, child/dependent records, provider records, and legal exceptions may require additional
              review.
            </p>
          ),
        },
      ]}
    >
      <p>
        This policy sets Bridge’s operating standard for respectful data handling. Final retention schedules, backup
        windows, and request procedures should be approved by counsel and matched to the active Supabase/Vercel plan.
      </p>
    </LegalPage>
  );
}
