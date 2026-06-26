import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Safety Notice",
  description: "Bridge safety boundaries and crisis-use notice.",
};

export default function SafetyPage() {
  return (
    <LegalPage
      eyebrow="Safety"
      title="Safety Notice"
      updated="June 26, 2026"
      sections={[
        {
          title: "Bridge is not emergency care",
          body: (
            <p>
              Bridge is not monitored as an emergency system and should never be used as the only way to communicate
              urgent medical, behavioral, mental-health, self-harm, abuse, neglect, violence, elopement, or safety
              concerns.
            </p>
          ),
        },
        {
          title: "When to seek immediate help",
          body: (
            <ul>
              <li>Call 911 or local emergency services if someone is in immediate danger.</li>
              <li>Call or text 988 in the U.S. for suicide or mental-health crisis support.</li>
              <li>Contact poison control, urgent care, or emergency medical services for medical emergencies.</li>
              <li>Follow mandated reporting duties for suspected abuse, neglect, exploitation, or imminent harm.</li>
            </ul>
          ),
        },
        {
          title: "AI safety boundaries",
          body: (
            <p>
              AI-assisted responses may provide supportive language, organization, or resource prompts. They are not a
              clinical assessment, risk assessment, treatment plan, diagnosis, prescription, legal opinion, or safety
              determination. A qualified human must review any high-risk situation.
            </p>
          ),
        },
        {
          title: "Care-team responsibility",
          body: (
            <p>
              Families, caregivers, professionals, schools, veteran organizations, and providers must maintain their own
              emergency plans, crisis contacts, medication protocols, professional escalation workflows, IEP/IPP plans,
              and mandated-reporting procedures outside Bridge.
            </p>
          ),
        },
      ]}
    >
      <p>
        Bridge is built to respect supported people and reduce confusion in everyday life. It is not built to replace
        emergency services, licensed judgment, or required human supervision.
      </p>
    </LegalPage>
  );
}
