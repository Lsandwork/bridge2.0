import {
  payerPlans as defaultPayerPlans,
  pricingPlans as defaultPricingPlans,
  type PayerPlan,
  type PricingPlan,
} from "@family-support/core";
import { logUserActivity } from "./admin-diagnostics-store";

type PlanOverride = Partial<Pick<PricingPlan, "price" | "period" | "description" | "cta" | "highlighted" | "badge">>;
type PayerOverride = Partial<Pick<PayerPlan, "price" | "period" | "description" | "cta">>;

const planOverrides = new Map<string, PlanOverride>();
const payerOverrides = new Map<string, PayerOverride>();

function mergePlan(plan: PricingPlan): PricingPlan {
  const patch = planOverrides.get(plan.id);
  return patch ? { ...plan, ...patch } : plan;
}

function mergePayerPlan(plan: PayerPlan): PayerPlan {
  const patch = payerOverrides.get(plan.id);
  return patch ? { ...plan, ...patch } : plan;
}

export function getEffectivePricingPlans(): PricingPlan[] {
  return defaultPricingPlans.map(mergePlan);
}

export function getEffectivePayerPlans(): PayerPlan[] {
  return defaultPayerPlans.map(mergePayerPlan);
}

export function getAdminPricingState() {
  return {
    plans: getEffectivePricingPlans(),
    payerPlans: getEffectivePayerPlans(),
    overrides: {
      plans: Object.fromEntries(planOverrides),
      payerPlans: Object.fromEntries(payerOverrides),
    },
  };
}

export function updatePricingPlan(
  planId: string,
  patch: PlanOverride,
  actorEmail: string
): PricingPlan {
  const base = defaultPricingPlans.find((p) => p.id === planId);
  if (!base) throw new Error("Pricing plan not found.");
  const current = planOverrides.get(planId) ?? {};
  planOverrides.set(planId, { ...current, ...patch });
  logUserActivity("platform", actorEmail, "admin_action", `Updated pricing plan ${planId}`);
  return mergePlan(base);
}

export function updatePayerPlan(
  planId: string,
  patch: PayerOverride,
  actorEmail: string
): PayerPlan {
  const base = defaultPayerPlans.find((p) => p.id === planId);
  if (!base) throw new Error("Payer plan not found.");
  const current = payerOverrides.get(planId) ?? {};
  payerOverrides.set(planId, { ...current, ...patch });
  logUserActivity("platform", actorEmail, "admin_action", `Updated payer plan ${planId}`);
  return mergePayerPlan(base);
}

export function resetPricingOverrides(actorEmail: string) {
  planOverrides.clear();
  payerOverrides.clear();
  logUserActivity("platform", actorEmail, "admin_action", "Reset pricing overrides to defaults");
}
