export type HealthReportSeverity = "low" | "moderate" | "high" | "critical";
export type HealthReportStatus = "new" | "reviewing" | "escalated" | "resolved" | "closed";

export type HealthReport = {
  id: string;
  userId: string;
  userName: string;
  childProfileId: string | null;
  submittedByUserId: string;
  submittedByName: string;
  concernType: string;
  severity: HealthReportSeverity;
  status: HealthReportStatus;
  summary: string;
  aiSummary: string | null;
  recommendedFollowUp: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

const reports = new Map<string, HealthReport>();

function now() {
  return new Date().toISOString();
}

export function listHealthReports(options?: { includeDemo?: boolean; status?: HealthReportStatus }) {
  let list = [...reports.values()];
  if (!options?.includeDemo) list = list.filter((r) => !r.isDemo);
  if (options?.status) list = list.filter((r) => r.status === options.status);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateHealthReportStatus(
  reportId: string,
  status: HealthReportStatus,
  note?: string
): HealthReport | null {
  const report = reports.get(reportId);
  if (!report) return null;
  report.status = status;
  report.updatedAt = now();
  if (note) report.recommendedFollowUp = note;
  return report;
}

export function seedDemoHealthReport() {
  if (reports.size > 0) return;
  const id = "hr-demo-1";
  reports.set(id, {
    id,
    userId: "u-demo-user",
    userName: "Jasper",
    childProfileId: "cp-demo-jasper",
    submittedByUserId: "u-demo-caregiver",
    submittedByName: "Alex Caregiver",
    concernType: "emotional_regulation",
    severity: "moderate",
    status: "new",
    summary: "Reported increased anxiety before school transitions this week.",
    aiSummary:
      "Caregiver reported a pattern of increased anxiety before school transitions. Recommended follow-up: review routine supports and consider therapist check-in. Not a diagnosis.",
    recommendedFollowUp: "Review morning routine supports with family. Escalate to therapist if pattern continues.",
    isDemo: true,
    createdAt: now(),
    updatedAt: now(),
  });
}

seedDemoHealthReport();
