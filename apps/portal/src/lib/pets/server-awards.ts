import { awardCompanionPetXp, type PetEventType } from "@family-support/data";
import type { SessionUser } from "@/lib/auth/session";

export async function safeAwardPetXp(
  session: Pick<SessionUser, "id">,
  childProfileId: string | null | undefined,
  eventType: PetEventType,
  metadata?: Record<string, unknown>
) {
  try {
    return await awardCompanionPetXp({
      userId: session.id,
      childProfileId: childProfileId ?? null,
      eventType,
      metadata,
    });
  } catch (error) {
    return {
      ok: false,
      xpAwarded: 0,
      reason: error instanceof Error ? error.message : "pet_xp_failed",
    };
  }
}
