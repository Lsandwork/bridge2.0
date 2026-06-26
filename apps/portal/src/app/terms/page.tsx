import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Bridge terms for supportive technology use.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms of Use"
      updated="June 26, 2026"
      sections={[
        {
          title: "Acceptance",
          body: (
            <p>
              By accessing Bridge, creating an account, inviting a care-team member, or using any Bridge feature, you
              agree to these Terms. If you use Bridge for an organization, client, student, patient, veteran, child,
              teen, or dependent adult, you represent that you have authority and required consent to do so.
            </p>
          ),
        },
        {
          title: "Supportive technology only",
          body: (
            <p>
              Bridge provides supportive tools, routines, education, documentation aids, AI-assisted organization, and
              care coordination. Bridge does not diagnose, treat, cure, prevent, or mitigate any disease or condition;
              does not provide medical, mental-health, legal, educational, insurance, or emergency advice; and does not
              replace licensed professionals, IEP teams, emergency responders, crisis services, or clinical judgment.
            </p>
          ),
        },
        {
          title: "Emergency and crisis use prohibited",
          body: (
            <p>
              Do not use Bridge for emergencies or urgent safety situations. If someone may be in immediate danger,
              call 911 or local emergency services. If there is suicidal ideation, self-harm risk, abuse, neglect,
              violence, medical distress, or another urgent concern, contact appropriate emergency, crisis, mandated
              reporting, or professional resources immediately.
            </p>
          ),
        },
        {
          title: "User responsibilities",
          body: (
            <ul>
              <li>Enter accurate information and keep account credentials secure.</li>
              <li>Share access codes only with trusted people authorized to view the profile.</li>
              <li>Review AI-assisted content before using, sharing, or relying on it.</li>
              <li>Do not upload unlawful, abusive, exploitative, or unauthorized information.</li>
              <li>Comply with all laws that apply to your role, organization, state, and country.</li>
            </ul>
          ),
        },
        {
          title: "Professional and organizational use",
          body: (
            <p>
              Professionals and organizations remain responsible for licensure, scope of practice, clinical decisions,
              documentation standards, payer requirements, IEP obligations, mandated reporting, consent, supervision,
              and record-retention duties. Bridge-generated drafts must be reviewed and edited before use.
            </p>
          ),
        },
        {
          title: "Insurance, grants, and reimbursement",
          body: (
            <p>
              Bridge may provide education, documentation support, or reimbursement-oriented workflows, but Bridge does
              not guarantee insurance coverage, grant awards, medical necessity approval, authorization, payment,
              reimbursement, coding acceptance, or eligibility under any public or private program.
            </p>
          ),
        },
        {
          title: "AI features",
          body: (
            <p>
              AI features may be incomplete, inaccurate, delayed, or inappropriate for a specific person or situation.
              AI outputs are informational drafts only. Users must apply human review, professional judgment, and local
              legal/clinical requirements before using or sharing any output.
            </p>
          ),
        },
        {
          title: "Limitation of liability",
          body: (
            <p>
              To the maximum extent permitted by law, Bridge is provided “as is” and “as available.” Bridge is not
              liable for indirect, incidental, special, consequential, exemplary, punitive, or lost-profit damages, or
              for decisions made outside Bridge. Some states do not allow certain limitations, so some limits may not
              apply where prohibited.
            </p>
          ),
        },
        {
          title: "Changes and suspension",
          body: (
            <p>
              Bridge may change features, policies, or these Terms as the service evolves. Bridge may suspend or remove
              access for security, safety, unlawful conduct, nonpayment, misuse, or risk to users or the service.
            </p>
          ),
        },
      ]}
    >
      <p>
        These Terms are intentionally conservative to protect Bridge, families, professionals, and supported users across
        U.S. jurisdictions. They require attorney review before full launch or paid commercial use.
      </p>
    </LegalPage>
  );
}
