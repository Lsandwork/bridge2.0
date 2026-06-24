import type { TranslateFn } from "./i18n";
import {
  coverageOptions,
  medicalApprovalTypes,
  payerPlans,
  payerTypeOptions,
  pricingFaqs,
  pricingPlans,
  reimbursementBenchmarks,
  type CoverageOption,
  type MedicalApprovalType,
  type PayerPlan,
  type PricingPlan,
  type ReimbursementBenchmark,
} from "./pricing";

function tf(t: TranslateFn, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

function features(t: TranslateFn, prefix: string, count: number, fallback: string[]): string[] {
  return fallback.map((f, i) => tf(t, `${prefix}.feature.${i}`, f));
}

function list(t: TranslateFn, prefix: string, count: number, fallback: string[]): string[] {
  return fallback.map((f, i) => tf(t, `${prefix}.${i}`, f));
}

export function getLocalizedPricingPlans(t: TranslateFn): PricingPlan[] {
  return pricingPlans.map((plan) => ({
    ...plan,
    name: tf(t, `pricing.plan.${plan.id}.name`, plan.name),
    period: tf(t, `pricing.plan.${plan.id}.period`, plan.period),
    description: tf(t, `pricing.plan.${plan.id}.description`, plan.description),
    cta: tf(t, `pricing.plan.${plan.id}.cta`, plan.cta),
    badge: plan.badge ? tf(t, `pricing.plan.${plan.id}.badge`, plan.badge) : undefined,
    features: features(t, `pricing.plan.${plan.id}`, plan.features.length, plan.features),
  }));
}

export function getLocalizedPayerPlans(t: TranslateFn): PayerPlan[] {
  return payerPlans.map((plan) => ({
    ...plan,
    name: tf(t, `pricing.payer.${plan.id}.name`, plan.name),
    period: tf(t, `pricing.payer.${plan.id}.period`, plan.period),
    description: tf(t, `pricing.payer.${plan.id}.description`, plan.description),
    cta: tf(t, `pricing.payer.${plan.id}.cta`, plan.cta),
    features: features(t, `pricing.payer.${plan.id}`, plan.features.length, plan.features),
  }));
}

export function getLocalizedCoverageOptions(t: TranslateFn): CoverageOption[] {
  return coverageOptions.map((opt) => ({
    ...opt,
    title: tf(t, `pricing.coverage.${opt.id}.title`, opt.title),
    subtitle: tf(t, `pricing.coverage.${opt.id}.subtitle`, opt.subtitle),
    bestFor: tf(t, `pricing.coverage.${opt.id}.bestFor`, opt.bestFor),
    priceLabel: tf(t, `pricing.coverage.${opt.id}.priceLabel`, opt.priceLabel),
    steps: list(t, `pricing.coverage.${opt.id}.step`, opt.steps.length, opt.steps),
    documentsIncluded: list(t, `pricing.coverage.${opt.id}.doc`, opt.documentsIncluded.length, opt.documentsIncluded),
    note: opt.note ? tf(t, `pricing.coverage.${opt.id}.note`, opt.note) : undefined,
  }));
}

export function getLocalizedMedicalApprovalTypes(t: TranslateFn): MedicalApprovalType[] {
  return medicalApprovalTypes.map((type) => ({
    ...type,
    title: tf(t, `pricing.approval.${type.id}.title`, type.title),
    description: tf(t, `pricing.approval.${type.id}.description`, type.description),
    typicalTurnaround: tf(t, `pricing.approval.${type.id}.turnaround`, type.typicalTurnaround),
    requiredFromParent: list(t, `pricing.approval.${type.id}.parent`, type.requiredFromParent.length, type.requiredFromParent),
    whatWeProvide: list(t, `pricing.approval.${type.id}.provide`, type.whatWeProvide.length, type.whatWeProvide),
  }));
}

export function getLocalizedPayerTypeOptions(t: TranslateFn) {
  return payerTypeOptions.map((opt) => ({
    ...opt,
    label: tf(t, `pricing.payerType.${opt.id}`, opt.label),
  }));
}

export function getLocalizedPricingFaqs(t: TranslateFn) {
  return pricingFaqs.map((faq, i) => ({
    q: tf(t, `pricing.faq.${i}.q`, faq.q),
    a: tf(t, `pricing.faq.${i}.a`, faq.a),
  }));
}

export function getLocalizedReimbursementBenchmarks(t: TranslateFn): ReimbursementBenchmark[] {
  return reimbursementBenchmarks.map((row) => ({
    ...row,
    title: tf(t, `pricing.benchmark.${row.code}.title`, row.title),
    typicalRange: tf(t, `pricing.benchmark.${row.code}.range`, row.typicalRange),
    notes: tf(t, `pricing.benchmark.${row.code}.notes`, row.notes),
  }));
}

export function getLocalizedLibraryFilter(t: TranslateFn, filter: string): string {
  return tf(t, `library.filter.${filter}`, filter);
}

export function getLocalizedAccessTierLabel(t: TranslateFn, tier: string): string {
  return tf(t, `library.tier.${tier}`, tier);
}

export type LocalizedLibraryCourse = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  filter: string;
  documentation: { label: string; detail: string; referenceCodes?: string[] };
};

export function getLocalizedLibraryCourse(
  t: TranslateFn,
  course: {
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    filter: string;
    documentation: { label: string; detail: string; referenceCodes?: string[] };
  }
): LocalizedLibraryCourse {
  const prefix = `library.course.${course.slug}`;
  return {
    slug: course.slug,
    title: tf(t, `${prefix}.title`, course.title),
    subtitle: tf(t, `${prefix}.subtitle`, course.subtitle),
    description: tf(t, `${prefix}.description`, course.description),
    filter: getLocalizedLibraryFilter(t, course.filter),
    documentation: {
      ...course.documentation,
      label: tf(t, `${prefix}.docLabel`, course.documentation.label),
      detail: tf(t, `${prefix}.docDetail`, course.documentation.detail),
    },
  };
}
