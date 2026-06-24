export const PRICING_LEGAL_NOTICE =
  "Family Support is a parent/caregiver education platform. It does not diagnose, treat, or replace licensed clinical services. Coverage, reimbursement, and medical necessity determinations are made solely by insurers, Medicaid programs, regional centers, and schools — not by Family Support.";

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
};

export type CoverageOption = {
  id: string;
  title: string;
  subtitle: string;
  bestFor: string;
  priceLabel: string;
  steps: string[];
  documentsIncluded: string[];
  note?: string;
};

export type MedicalApprovalType = {
  id: string;
  title: string;
  description: string;
  typicalTurnaround: string;
  requiredFromParent: string[];
  whatWeProvide: string[];
};

export type PayerType =
  | "medi-cal-ca"
  | "regional-center-ca"
  | "private-insurance"
  | "medicaid-waiver"
  | "school-district"
  | "self-pay";

export const pricingPlans: PricingPlan[] = [
  {
    id: "foundations",
    name: "Foundations",
    price: "$0",
    period: "always free",
    description: "Core education courses every family can access without a credit card.",
    features: [
      "Understanding Autism (full course)",
      "Social Stories Library (full course)",
      "Crisis & Overload Support (full course)",
      "First lesson free in every paid course",
      "Progress tracking on completed lessons",
    ],
    cta: "Start free",
  },
  {
    id: "family-plus",
    name: "Family Access",
    price: "$29",
    period: "per month",
    description:
      "Full library, Tess AI, games, and rewards. Many private plans reimburse $150–$400/mo when billed as parent training (CPT 97156) — ask your BCBA.",
    features: [
      "All courses and lesson plans unlocked",
      "Unlimited child profiles + My Space games",
      "Tess AI voice & chat coaching",
      "Monthly progress summary PDF for clinicians",
      "Cancel anytime · HSA/FSA eligible (verify with plan)",
    ],
    cta: "Subscribe monthly",
    highlighted: true,
    badge: "Most popular",
  },
  {
    id: "family-annual",
    name: "Family Access Annual",
    price: "$249",
    period: "per year (~$21/mo)",
    description:
      "Same full access — save two months. Often submitted for annual prior auth under autism benefit packages.",
    features: [
      "Everything in Family Access",
      "HSA/FSA eligible (verify with your plan)",
      "Priority email support",
      "Annual progress report for care teams",
    ],
    cta: "Subscribe annually",
  },
  {
    id: "documentation-addon",
    name: "Insurance Documentation",
    price: "+$9",
    period: "per month add-on",
    description: "For self-pay families who also need clean paperwork for reimbursement or tax records.",
    features: [
      "Monthly superbill (PDF)",
      "Medical necessity letter template",
      "CPT/HCPCS reference sheet for your clinician",
      "Caseworker-ready session logs",
      "Quarterly authorization summary",
    ],
    cta: "Add documentation",
  },
];

export const coverageOptions: CoverageOption[] = [
  {
    id: "medi-cal-ca",
    title: "Medi-Cal (California)",
    subtitle: "Managed care prior authorization",
    bestFor: "Families with Medi-Cal, CalAIM, or CCS coverage in California",
    priceLabel: "$0 with approved prior auth",
    steps: [
      "Download the Vendor Information Packet and Prior Authorization Request form.",
      "Submit to your managed care case manager or PCP care coordination team.",
      "We respond to payer inquiries within 2 business days.",
      "Upon approval, your account unlocks and we bill Medi-Cal directly.",
    ],
    documentsIncluded: [
      "DHCS-compatible service description",
      "EPSDT / benefit category justification",
      "Quarterly progress report template",
      "Session logs (date, duration, skill targeted)",
    ],
    note: "Approval is determined by your Medi-Cal plan. We provide documentation to support your request — we do not guarantee authorization.",
  },
  {
    id: "regional-center-ca",
    title: "California regional center",
    subtitle: "Lanterman Act vendor authorization",
    bestFor: "Clients with an active IPP and regional center service coordinator",
    priceLabel: "$0 with IPP amendment or vendor auth",
    steps: [
      "Share the Home-Program Vendor Packet with your service coordinator.",
      "Request IPP goal alignment for parent training / home program.",
      "Regional center reviews vendor credentials and service description.",
      "Upon authorization, access unlocks under vendor billing.",
    ],
    documentsIncluded: [
      "IPP goal alignment worksheet",
      "Quarterly report template (regional center format)",
      "Fidelity checklist for parent implementation",
      "Vendor W-9 and service rate sheet (on request)",
    ],
    note: "Regional center purchase-of-service decisions are made by your service coordinator and regional center — not by Family Support.",
  },
  {
    id: "private-insurance",
    title: "Private insurance",
    subtitle: "Reimbursement & prior authorization",
    bestFor: "PPO plans, autism mandates, TRICARE, or out-of-network benefits",
    priceLabel: "Pay upfront · submit for reimbursement",
    steps: [
      "Enroll in Family Access + Documentation add-on (or annual plan).",
      "Complete lessons — session data auto-logs to your account.",
      "Download monthly superbill; have your treating clinician sign the medical necessity letter.",
      "Submit to insurer. For some plans, we can submit prior auth on your behalf (demo workflow).",
    ],
    documentsIncluded: [
      "Monthly superbill with reference CPT codes",
      "Medical necessity letter template (clinician-signed)",
      "Treatment plan alignment summary",
      "Appeal support letter if claim denied (template)",
    ],
    note: "Reference codes (e.g. 97156 family guidance, S5110 family training) must be verified by your billing provider. Reimbursement is not guaranteed.",
  },
  {
    id: "medicaid-waiver",
    title: "Medicaid & HCBS waivers (50 states)",
    subtitle: "Waiver caregiver training authorization",
    bestFor: "EPSDT, Katie Beckett, HCBS waiver, or state DD programs outside California",
    priceLabel: "Varies · authorization packet included",
    steps: [
      "Select your state — we load payer-specific contact and form hints.",
      "Download the Waiver Service Justification packet.",
      "Submit through your waiver case manager or MCO care coordinator.",
      "Upon approval, access unlocks under vendor or FMS billing.",
    ],
    documentsIncluded: [
      "50-state payer contact directory (updated quarterly)",
      "HCBS caregiver training service description",
      "Person-centered goal documentation",
      "HIPAA-compliant progress exports",
    ],
    note: "We are not enrolled as a vendor in every state Medicaid program. The documentation package supports caseworker review regardless of enrollment status.",
  },
  {
    id: "school-district",
    title: "School district & IEP",
    subtitle: "Home-program coordination",
    bestFor: "Parents aligning home practice with IEP/IFSP team goals",
    priceLabel: "Foundations free · district licenses available",
    steps: [
      "Share the Home-Program Alignment Summary with your case manager.",
      "Map library lessons to current IEP goals.",
      "Export monthly progress for IEP meetings.",
      "Districts can purchase multi-family licenses (contact us).",
    ],
    documentsIncluded: [
      "IEP goal mapping worksheet",
      "Parent training attendance record",
      "Home-program implementation log",
    ],
  },
  {
    id: "caseworker",
    title: "Caseworker & county review",
    subtitle: "Free access for authorized workers",
    bestFor: "County social workers, IHSS assessors, and managed care care coordinators",
    priceLabel: "No cost for verified caseworkers",
    steps: [
      "Caseworker submits agency email for verification.",
      "Read-only access to assigned family's progress dashboard.",
      "Download authorization recommendation memo.",
    ],
    documentsIncluded: [
      "Caseworker summary view",
      "Authorization recommendation template",
      "Fidelity checklist (parent completed steps vs. plan)",
    ],
  },
];

export const medicalApprovalTypes: MedicalApprovalType[] = [
  {
    id: "prior-auth",
    title: "Prior authorization (PA)",
    description: "Required by most Medi-Cal managed care plans and many private insurers before services begin.",
    typicalTurnaround: "5–14 business days (payer dependent)",
    requiredFromParent: [
      "Insurance or Medi-Cal member ID",
      "Child's diagnosis documentation (from your clinician)",
      "Treating provider name and NPI (if applicable)",
    ],
    whatWeProvide: [
      "Completed PA request form with service description",
      "Clinical justification narrative (parent education / home program)",
      "Progress tracking methodology summary",
      "Direct payer follow-up within 2 business days",
    ],
  },
  {
    id: "lmn",
    title: "Letter of medical necessity (LMN)",
    description: "Signed by your child's treating clinician to support reimbursement or appeal of a denied claim.",
    typicalTurnaround: "3–5 business days after clinician signature",
    requiredFromParent: [
      "Treating clinician contact (SLP, OT, BCBA, MD, or psychologist)",
      "Current treatment plan or IEP summary (optional but helpful)",
    ],
    whatWeProvide: [
      "Pre-filled LMN template with skill targets and frequency",
      "Session log summary for clinician review",
      "Instructions for clinician signature and return",
    ],
  },
  {
    id: "ipp-rc",
    title: "Regional center IPP authorization",
    description: "California Lanterman Act — vendor authorization through your service coordinator.",
    typicalTurnaround: "2–6 weeks (regional center dependent)",
    requiredFromParent: [
      "Regional center name and service coordinator contact",
      "Current IPP goals related to parent training or home program",
    ],
    whatWeProvide: [
      "Vendor information packet",
      "IPP goal alignment worksheet",
      "Sample quarterly report",
      "Participation in IPP meeting (on request, demo)",
    ],
  },
  {
    id: "superbill",
    title: "Superbill reimbursement",
    description: "For families who pay upfront and submit to insurance for out-of-network or PPO reimbursement.",
    typicalTurnaround: "Available monthly · insurer processing 30–90 days",
    requiredFromParent: [
      "Active Family Access subscription",
      "Completed lessons (logged automatically)",
    ],
    whatWeProvide: [
      "Monthly superbill PDF with dates of service",
      "Reference CPT/HCPCS codes for your billing provider",
      "Receipt suitable for HSA/FSA submission",
    ],
  },
];

export const payerTypeOptions: { id: PayerType; label: string }[] = [
  { id: "medi-cal-ca", label: "Medi-Cal (California)" },
  { id: "regional-center-ca", label: "California regional center" },
  { id: "private-insurance", label: "Private insurance / TRICARE" },
  { id: "medicaid-waiver", label: "Medicaid / HCBS waiver (other states)" },
  { id: "school-district", label: "School district / IEP" },
  { id: "self-pay", label: "Self-pay (no insurance)" },
];

export const pricingFaqs = [
  {
    q: "Does Family Support replace therapy?",
    a: "No. We provide parent education and home-program lesson plans between clinical sessions. Your child's therapists, doctors, and school team remain primary for clinical care.",
  },
  {
    q: "Are you 'approved' by Medi-Cal or insurance companies?",
    a: "We do not claim universal payer approval. We provide documentation formatted for prior authorization and reimbursement workflows. Whether services are covered is decided by your specific plan and caseworker.",
  },
  {
    q: "What happens after I submit a medical approval request?",
    a: "Our enrollment team reviews your packet within 2 business days, contacts the payer if needed, and updates your portal with status. You can continue using free courses while waiting.",
  },
  {
    q: "Can my caseworker see our progress?",
    a: "Yes — verified caseworkers can receive read-only access to your family's progress dashboard and download authorization recommendation memos at no cost.",
  },
  {
    q: "What do insurers typically pay for parent training platforms?",
    a: "Private and Medicaid plans often authorize parent/caregiver training under CPT 97156 (individual) or 97157 (group), typically $45–$175 per 15-minute unit depending on region and provider type. Digital mental health treatment management (HCPCS G0552–G0554) may apply when Tess AI augments a clinician's treatment plan. Bridge provides documentation aligned to these workflows — final payment is always determined by the payer.",
  },
];

/** Reference rates for payer presentations — not a guarantee of reimbursement. */
export type ReimbursementBenchmark = {
  code: string;
  title: string;
  typicalRange: string;
  notes: string;
};

export const reimbursementBenchmarks: ReimbursementBenchmark[] = [
  {
    code: "97156",
    title: "Family adaptive behavior treatment guidance",
    typicalRange: "$45 – $175 / 15 min",
    notes: "Most common code for 1:1 parent/caregiver training by BCBA or qualified professional (USA, 2025–2026 fee schedules).",
  },
  {
    code: "97157",
    title: "Multi-family group parent training",
    typicalRange: "$35 – $120 / 15 min",
    notes: "Group format; requires two or more families. Often capped separately on Medicaid plans.",
  },
  {
    code: "G0553",
    title: "DMHT — initial 20 min/month treatment management",
    typicalRange: "Medicare MPFS crosswalk",
    notes: "Digital mental health treatment when Tess augments a behavioral therapy plan (2025 CMS).",
  },
  {
    code: "G0554",
    title: "DMHT — each additional 20 min/month",
    typicalRange: "Medicare MPFS crosswalk",
    notes: "Requires interactive communication with patient/caregiver each calendar month.",
  },
  {
    code: "S5110",
    title: "Family training & counseling (Medicaid)",
    typicalRange: "State-specific",
    notes: "Used by some state Medicaid programs for caregiver training hours.",
  },
];

export type PayerPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
};

/** B2B pricing for health plans, Medicaid MCOs, and regional centers. */
export const payerPlans: PayerPlan[] = [
  {
    id: "payer-pmpm",
    name: "Health Plan — Population",
    price: "$11",
    period: "PMPM (per enrolled member)",
    description:
      "Full Bridge access for members with autism or developmental disability diagnoses. Includes library, Tess AI (human-in-the-loop), games, outcomes reporting, and caseworker read-only access.",
    features: [
      "Unlimited caregiver accounts per member",
      "Monthly outcome & utilization reports",
      "Prior auth packet templates (97156 / 97157 aligned)",
      "HIPAA-ready role-based access audit logs",
      "Dedicated payer success manager",
    ],
    cta: "Request payer demo",
  },
  {
    id: "payer-auth",
    name: "Prior Authorization — Per Family",
    price: "$0",
    period: "member cost when approved",
    description:
      "Families pay nothing when your plan authorizes caregiver training. Bridge bills the plan at an authorized monthly rate typically equivalent to $165–$220 (aligned with ~1 hr/week parent training + digital support).",
    features: [
      "Zero member copay with active authorization",
      "Auto-generated session logs for re-auth",
      "Meltdown frequency & skill acquisition trends",
      "Caregiver sustainability metrics",
      "Quarterly medical director summary PDF",
    ],
    cta: "Download auth packet",
  },
  {
    id: "payer-enterprise",
    name: "Enterprise — State / MCO",
    price: "Custom",
    period: "annual contract",
    description:
      "Multi-county Medicaid MCOs, regional center networks, and TRICARE contractors. Volume pricing from $8 PMPM with SLA, custom integrations, and white-label reporting.",
    features: [
      "API export to claims / care management systems",
      "Custom CPT/HCPCS mapping for your billing team",
      "Member stratification dashboards",
      "24-hour payer support line",
      "Pilot cohort with matched controls (optional)",
    ],
    cta: "Contact partnerships",
  },
];
