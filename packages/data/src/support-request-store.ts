export type SupportRequestType =
  | "access"
  | "invite"
  | "care_team"
  | "goal_routine"
  | "documentation"
  | "billing"
  | "platform_support"
  | "safety"
  | "school_iep";

export type SupportRequestStatus = "open" | "in_review" | "assigned" | "resolved" | "closed";
export type SupportRequestPriority = "low" | "normal" | "high" | "urgent";

export type SupportRequest = {
  id: string;
  requesterUserId: string;
  requesterName: string;
  requesterRole: string;
  requesterEmail: string;
  childProfileId: string | null;
  requestType: SupportRequestType;
  priority: SupportRequestPriority;
  status: SupportRequestStatus;
  subject: string;
  message: string;
  assignedAdminId: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

const requests = new Map<string, SupportRequest>();

function now() {
  return new Date().toISOString();
}

export function listSupportRequests(options?: {
  includeDemo?: boolean;
  status?: SupportRequestStatus;
  priority?: SupportRequestPriority;
}) {
  let list = [...requests.values()];
  if (!options?.includeDemo) list = list.filter((r) => !r.isDemo);
  if (options?.status) list = list.filter((r) => r.status === options.status);
  if (options?.priority) list = list.filter((r) => r.priority === options.priority);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateSupportRequestStatus(
  requestId: string,
  status: SupportRequestStatus,
  assignedAdminId?: string | null
): SupportRequest | null {
  const req = requests.get(requestId);
  if (!req) return null;
  req.status = status;
  req.updatedAt = now();
  if (assignedAdminId !== undefined) req.assignedAdminId = assignedAdminId;
  return req;
}

export function seedDemoSupportRequest() {
  if (requests.size > 0) return;
  const id = "sr-demo-1";
  requests.set(id, {
    id,
    requesterUserId: "u-demo-caregiver",
    requesterName: "Alex Caregiver",
    requesterRole: "parent_guardian",
    requesterEmail: "caregiver@demo.com",
    childProfileId: "cp-demo-jasper",
    requestType: "documentation",
    priority: "normal",
    status: "open",
    subject: "Prior authorization packet request",
    message: "Need help preparing Medi-Cal prior auth documentation for Jasper's home program.",
    assignedAdminId: null,
    isDemo: true,
    createdAt: now(),
    updatedAt: now(),
  });
}

seedDemoSupportRequest();
