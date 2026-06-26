import type { ErrorLogEntry, ErrorLogSeverity, ErrorLogStatus } from "@family-support/core";

const logs: ErrorLogEntry[] = [
  {
    id: "err-1",
    severity: "critical",
    status: "open",
    service: "api/tess/chat",
    message: "Intermittent 503 during peak hours",
    stackTrace: null,
    userId: null,
    route: "/api/tess/chat",
    requestId: "req-demo-1",
    environment: process.env.NODE_ENV ?? "development",
    notes: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    resolvedAt: null,
  },
  {
    id: "err-2",
    severity: "medium",
    status: "open",
    service: "email",
    message: "Email notifications not configured",
    stackTrace: null,
    userId: null,
    route: null,
    requestId: null,
    environment: process.env.NODE_ENV ?? "development",
    notes: "Configure SMTP or transactional email provider",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    resolvedAt: null,
  },
];

function now() {
  return new Date().toISOString();
}

export function logError(input: {
  severity: ErrorLogSeverity;
  service: string;
  message: string;
  stackTrace?: string;
  userId?: string;
  route?: string;
  requestId?: string;
}): ErrorLogEntry {
  const entry: ErrorLogEntry = {
    id: `err-${Date.now()}`,
    severity: input.severity,
    status: "open",
    service: input.service,
    message: sanitize(input.message),
    stackTrace: input.stackTrace ? sanitize(input.stackTrace) : null,
    userId: input.userId ?? null,
    route: input.route ?? null,
    requestId: input.requestId ?? null,
    environment: process.env.NODE_ENV ?? "development",
    notes: null,
    createdAt: now(),
    resolvedAt: null,
  };
  logs.unshift(entry);
  if (logs.length > 2000) logs.length = 2000;
  return entry;
}

function sanitize(text: string): string {
  return text
    .replace(/sk-[a-zA-Z0-9_-]+/g, "[REDACTED]")
    .replace(/eyJ[a-zA-Z0-9._-]+/g, "[REDACTED]")
    .replace(/SUPABASE_SERVICE_ROLE_KEY=\S+/gi, "[REDACTED]");
}

export function listErrorLogs(options?: {
  severity?: ErrorLogSeverity;
  status?: ErrorLogStatus;
  route?: string;
  query?: string;
  limit?: number;
  offset?: number;
}) {
  let list = [...logs];
  if (options?.severity) list = list.filter((l) => l.severity === options.severity);
  if (options?.status) list = list.filter((l) => l.status === options.status);
  if (options?.route) list = list.filter((l) => l.route?.includes(options.route!));
  if (options?.query) {
    const q = options.query.toLowerCase();
    list = list.filter(
      (l) => l.message.toLowerCase().includes(q) || l.service.toLowerCase().includes(q)
    );
  }
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 50;
  return { items: list.slice(offset, offset + limit), total: list.length };
}

export function updateErrorLog(
  id: string,
  patch: { status?: ErrorLogStatus; notes?: string }
): ErrorLogEntry | null {
  const entry = logs.find((l) => l.id === id);
  if (!entry) return null;
  if (patch.status) {
    entry.status = patch.status;
    if (patch.status === "resolved") entry.resolvedAt = now();
  }
  if (patch.notes !== undefined) entry.notes = patch.notes;
  return entry;
}

export function getErrorCountsBySeverity() {
  const counts: Record<ErrorLogSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  for (const l of logs.filter((x) => x.status === "open")) counts[l.severity]++;
  return counts;
}
