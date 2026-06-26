import { NextResponse } from "next/server";
import {
  getTherapistDashboard,
  resolveProfilesForSessionUser,
  type ClientProfile,
  type TherapistDashboardSnapshot,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

function clientFromProfile(profile: { id: string; name: string; ageGroup: string; supportNotes?: string }): ClientProfile {
  const age = profile.ageGroup === "adult" ? 21 : profile.ageGroup === "teen" ? 15 : 8;
  return {
    id: profile.id,
    demographics: {
      name: profile.name,
      age,
      diagnosis: ["Support profile"],
      supportLevel: "Personalized support pathway",
    },
    insurance: {
      payer: "Not connected",
      authNumber: "Not connected",
      approvedUnits: 0,
      usedUnits: 0,
      expirationDate: new Date().toISOString().slice(0, 10),
    },
    passport: {
      communicationStyle: profile.supportNotes || "Communication preferences have not been documented yet.",
      sensoryTriggers: [],
      sensorySupports: [],
      preferredActivities: [],
      calmingStrategies: [],
      socialPreferences: [],
      emergencyNotes: "No emergency notes entered in Bridge. Use the family or organization emergency plan.",
      strengths: [],
      interests: [],
      accommodations: [],
    },
    goalsProgress: 0,
    parentEngagementScore: 0,
  };
}

function snapshotForLinkedProfiles(
  base: TherapistDashboardSnapshot,
  clients: ClientProfile[]
): TherapistDashboardSnapshot {
  return {
    ...base,
    overview: {
      ...base.overview,
      activeClients: clients.length,
      reauthorizationsDue: 0,
      highPriorityAlerts: 0,
      unreadParentMessages: 0,
      goalsCompletedThisMonth: 0,
    },
    actionCenter: clients.length
      ? [
          {
            id: "linked-client-review",
            level: "low",
            title: "New linked profile ready",
            detail: "Review support notes, goals, safety plans, and care-team permissions before documenting care.",
          },
        ]
      : [],
    clients,
    goals: [],
    recentBehaviors: [],
    patternInsights: clients.length
      ? [
          {
            id: "linked-profile-start",
            text: "Bridge will surface patterns after routines, check-ins, goals, and care-team notes are added.",
            severity: "low",
          },
        ]
      : [],
    messages: [],
    documents: [],
    insurance: [],
    insuranceReadiness: {
      documentationComplete: 0,
      authorizationUsage: 0,
      missingNotes: 0,
      reauthorizationRisk: "low",
    },
    trends: {
      weeklyBehaviorFrequency: base.trends.weeklyBehaviorFrequency.map((d) => ({ ...d, count: 0 })),
      monthlyImprovementScore: 0,
      goalProgression: 0,
      attendanceTrend: 0,
      parentEngagementScore: 0,
    },
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "caregiver_therapist_teacher" && session.role !== "admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Therapist access only." }, { status: 403 });
  }

  const base = getTherapistDashboard();
  if (!session.isDemo) {
    const profiles = await resolveProfilesForSessionUser(session);
    return NextResponse.json(snapshotForLinkedProfiles(base, profiles.map(clientFromProfile)));
  }

  return NextResponse.json(base);
}
