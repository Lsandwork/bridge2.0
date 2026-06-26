import { NextResponse } from "next/server";
import { getEffectivePayerPlans, getEffectivePricingPlans } from "@family-support/data";

export async function GET() {
  return NextResponse.json({
    plans: getEffectivePricingPlans(),
    payerPlans: getEffectivePayerPlans(),
  });
}
