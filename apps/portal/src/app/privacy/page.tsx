import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Bridge privacy practices for supportive care technology.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy Policy"
      updated="June 26, 2026"
      sections={[
        {
          title: "What Bridge is",
          body: (
            <p>
              Bridge is supportive technology for routines, communication supports, care coordination, education,
              documentation, and functional skill-building. Bridge is not an emergency service, not a crisis hotline,
              not a medical diagnosis tool, and not a replacement for licensed clinical, educational, legal, or
              professional care.
            </p>
          ),
        },
        {
          title: "Information we may collect",
          body: (
            <>
              <p>Depending on how Bridge is used, we may collect:</p>
              <ul>
                <li>Account information such as name, email, role, and login status.</li>
                <li>Profile information such as age group, support notes, preferences, goals, routines, and care-team links.</li>
                <li>Care coordination content entered by users, including messages, notes, reports, and access-code links.</li>
                <li>Supportive app activity such as page views, setup completion, feature usage, and safety alerts.</li>
                <li>Technical information needed for security, debugging, fraud prevention, and service reliability.</li>
              </ul>
              <p>
                Bridge is designed to avoid collecting unnecessary sensitive information. Users should not enter Social
                Security numbers, payment card numbers, full medical records, or emergency-only information unless a
                specifically approved workflow asks for it.
              </p>
            </>
          ),
        },
        {
          title: "Sensitive personal information and health-related data",
          body: (
            <p>
              Bridge may contain disability, developmental, behavioral, mental-health, caregiver, veteran-support, or
              education-related information. We treat this information as sensitive. We use it to provide Bridge,
              maintain safety, support care coordination, improve reliability, and comply with legal obligations. We do
              not sell sensitive personal information. We do not use sensitive support data for third-party advertising.
            </p>
          ),
        },
        {
          title: "HIPAA and provider relationships",
          body: (
            <p>
              Bridge is not automatically a HIPAA covered entity. If Bridge contracts with a covered health care
              provider, health plan, or other covered entity as a business associate, separate HIPAA terms, security
              obligations, and a Business Associate Agreement may apply. Until such an agreement is signed, customers
              should not assume Bridge is operating as their HIPAA business associate.
            </p>
          ),
        },
        {
          title: "How we use information",
          body: (
            <ul>
              <li>Provide accounts, dashboards, routines, reports, access codes, and care-team coordination.</li>
              <li>Maintain safety boundaries, detect abuse, investigate errors, and protect users.</li>
              <li>Improve Bridge using privacy-minimized analytics and aggregated operational signals.</li>
              <li>Respond to support, privacy, export, deletion, legal, or security requests.</li>
              <li>Comply with applicable federal, state, and international legal obligations.</li>
            </ul>
          ),
        },
        {
          title: "Sharing",
          body: (
            <p>
              We share information only as needed to operate Bridge, at the user’s direction, with linked care-team
              members, with service providers under appropriate obligations, for safety/security reasons, in business
              transactions with protections, or when legally required. Access codes should be shared only with trusted
              caregivers, therapists, educators, coordinators, or support-team members.
            </p>
          ),
        },
        {
          title: "State privacy rights",
          body: (
            <p>
              Residents of California and other states with privacy laws may have rights to know, access, correct,
              delete, port, or limit certain personal information, and to appeal certain decisions. Bridge will honor
              applicable rights based on the user’s state, the type of data, verified identity, legal exceptions, and
              whether Bridge acts as a business, processor/service provider, or business associate in that context.
            </p>
          ),
        },
        {
          title: "Children and dependent users",
          body: (
            <p>
              Bridge is intended to be used by parents/guardians, caregivers, professionals, organizations, and, where
              appropriate, supported users with proper consent. A parent, guardian, school, provider, or organization is
              responsible for obtaining required permissions before entering information about a child, teen, dependent
              adult, student, client, or veteran.
            </p>
          ),
        },
        {
          title: "Security and retention",
          body: (
            <p>
              We use administrative, technical, and organizational safeguards designed to protect Bridge data. No system
              can be guaranteed completely secure. We retain information only as needed for the service, legal duties,
              safety, audit, dispute resolution, backups, and legitimate business purposes, then delete or de-identify it
              when appropriate.
            </p>
          ),
        },
      ]}
    >
      <p>
        This policy is written for a nationwide U.S. launch posture and privacy-by-design operation. It is not legal
        advice and must be reviewed by licensed privacy, health care, education, disability, and consumer-protection
        counsel before broad public launch.
      </p>
    </LegalPage>
  );
}
