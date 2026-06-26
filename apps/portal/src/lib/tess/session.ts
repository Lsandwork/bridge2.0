import { buildTessSystemPrompt } from "@family-support/core";
import { buildTessContext, getTessSettings, getTessMessages } from "@family-support/data";
import { parseSessionCookie, SESSION_COOKIE } from "@/lib/auth/session-cookie";

export type TessSession = {
  userId: string;
  role: string;
  childProfileId?: string;
};

function sessionFromCookieHeader(cookieHeader: string | null): TessSession | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match?.[1]) return null;
  const user = parseSessionCookie(match[1]);
  if (!user) return null;
  return {
    userId: user.id,
    role: user.role,
  };
}

export function getTessSession(headers?: Headers): TessSession {
  const fromCookie = sessionFromCookieHeader(headers?.get("cookie") ?? null);
  if (fromCookie) {
    const childProfileId = headers?.get("x-bridge-child-profile") ?? undefined;
    return { ...fromCookie, childProfileId };
  }

  const role = headers?.get("x-bridge-role") ?? "parent_guardian";
  const childProfileId = headers?.get("x-bridge-child-profile") ?? undefined;
  return { userId: "anonymous", role, childProfileId };
}

export function resolveRoleScope(role: string, ageGroup?: string): string {
  if (role === "parent_guardian") return "parent";
  if (role === "caregiver_therapist_teacher") return "caregiver";
  if (role === "admin" || role === "super_admin") return "admin";
  if (ageGroup === "teen") return "teen";
  if (ageGroup === "adult") return "adult";
  return "child";
}

export function buildTessChatContext(session: TessSession, conversationId?: string, mode?: string) {
  const childProfileId = session.childProfileId;
  const ctx = childProfileId ? buildTessContext(childProfileId, session.role) : { profile: null, routines: [], tasks: [], checkIns: [], goals: [] };
  const settings = childProfileId
    ? getTessSettings({ childProfileId }) ?? getTessSettings({ userId: session.userId })
    : getTessSettings({ userId: session.userId });
  const roleScope = resolveRoleScope(session.role, ctx.profile?.ageGroup);
  const voiceMode = mode === "voice";

  const systemPrompt = buildTessSystemPrompt(roleScope, {
    simpleLanguage: settings?.simpleLanguage,
    teenAdultRespectful: settings?.teenAdultRespectfulMode,
    lowStimulation: settings?.lowStimulation,
    voiceMode,
  });

  const contextBlock = `
Profile: ${ctx.profile?.name ?? "Unknown"} (${ctx.profile?.ageGroup ?? "child"})
Support notes: ${ctx.profile?.supportNotes ?? "none"}
Active routines: ${ctx.routines.map((r) => r.title).join(", ") || "none"}
Pending tasks: ${ctx.tasks.filter((t) => t.status === "pending").map((t) => t.title).join(", ") || "none"}
Recent check-ins: ${ctx.checkIns.map((c) => `${c.type}:${c.value}`).join("; ") || "none"}
Goals: ${ctx.goals.map((g) => g.title).join(", ") || "none"}
`;

  const history = conversationId
    ? getTessMessages(conversationId)
        .slice(-20)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
    : [];

  return { systemPrompt: `${systemPrompt}\n\nAllowed context:\n${contextBlock}`, history, settings, roleScope, ctx };
}
