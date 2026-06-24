import { NextResponse } from "next/server";
import {
  generateTherapistDocument,
  logTherapistBehaviorEvent,
  markTherapistMessageRead,
  replyToTherapistMessage,
  updateTherapistDocument,
  type DocumentType,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

async function requireTherapist() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (
    session.role !== "caregiver_therapist_teacher" &&
    session.role !== "admin" &&
    session.role !== "super_admin"
  ) {
    return { error: NextResponse.json({ error: "Therapist access only." }, { status: 403 }) };
  }
  return { session };
}

type ActionBody = {
  action?: string;
  clientId?: string;
  documentType?: DocumentType;
  docId?: string;
  content?: string;
  status?: "draft" | "submitted";
  messageId?: string;
  replyText?: string;
  behavior?: {
    clientId: string;
    type: string;
    severity: number;
    durationMinutes: number;
    trigger?: string;
    interventionUsed?: string;
    outcome?: string;
    reportedBy?: string;
  };
};

export async function POST(request: Request) {
  const auth = await requireTherapist();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const body = (await request.json()) as ActionBody;
    const { action } = body;

    switch (action) {
      case "generate-document": {
        if (!body.clientId || !body.documentType) {
          return NextResponse.json({ error: "clientId and documentType are required." }, { status: 400 });
        }
        const doc = generateTherapistDocument(body.documentType, body.clientId);
        return NextResponse.json({ ok: true, document: doc });
      }
      case "update-document": {
        if (!body.docId || body.content === undefined) {
          return NextResponse.json({ error: "docId and content are required." }, { status: 400 });
        }
        const doc = updateTherapistDocument(body.docId, body.content, body.status);
        if (!doc) return NextResponse.json({ error: "Document not found." }, { status: 404 });
        return NextResponse.json({ ok: true, document: doc });
      }
      case "mark-message-read": {
        if (!body.messageId) {
          return NextResponse.json({ error: "messageId is required." }, { status: 400 });
        }
        const msg = markTherapistMessageRead(body.messageId);
        if (!msg) return NextResponse.json({ error: "Message not found." }, { status: 404 });
        return NextResponse.json({ ok: true, message: msg });
      }
      case "reply-message": {
        if (!body.messageId || !body.replyText?.trim()) {
          return NextResponse.json({ error: "messageId and replyText are required." }, { status: 400 });
        }
        const msg = replyToTherapistMessage(body.messageId, body.replyText.trim());
        if (!msg) return NextResponse.json({ error: "Message not found." }, { status: 404 });
        return NextResponse.json({ ok: true, message: msg });
      }
      case "log-behavior": {
        if (!body.behavior?.clientId || !body.behavior?.type) {
          return NextResponse.json({ error: "behavior.clientId and behavior.type are required." }, { status: 400 });
        }
        const event = logTherapistBehaviorEvent({
          clientId: body.behavior.clientId,
          type: body.behavior.type,
          severity: body.behavior.severity ?? 2,
          durationMinutes: body.behavior.durationMinutes ?? 15,
          trigger: body.behavior.trigger,
          interventionUsed: body.behavior.interventionUsed,
          outcome: body.behavior.outcome,
          reportedBy: body.behavior.reportedBy ?? "Jordan Therapist",
        });
        return NextResponse.json({ ok: true, event });
      }
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed." },
      { status: 400 }
    );
  }
}
