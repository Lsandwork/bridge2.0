import { z } from "zod";

const approvalSchema = z.object({
  parentName: z.string().min(2),
  email: z.string().email(),
  state: z.string().min(2),
  payerType: z.enum([
    "medi-cal-ca",
    "regional-center-ca",
    "private-insurance",
    "medicaid-waiver",
    "school-district",
    "self-pay",
  ]),
  memberId: z.string().optional(),
  clinicianName: z.string().optional(),
  approvalType: z.enum(["prior-auth", "lmn", "ipp-rc", "superbill"]),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = approvalSchema.parse(body);
    const referenceId = `AUTH-${Date.now().toString(36).toUpperCase()}`;

    // Demo mode — log and return success. Wire to CRM / email in production.
    console.info("[approval-request]", referenceId, data);

    return Response.json({
      referenceId,
      status: "received",
      message:
        "Our enrollment team will email you within 2 business days with your authorization packet and next steps. You can continue using free courses while we process your request.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: "Please complete all required fields." }, { status: 400 });
    }
    return Response.json({ error: "Could not submit request." }, { status: 500 });
  }
}
