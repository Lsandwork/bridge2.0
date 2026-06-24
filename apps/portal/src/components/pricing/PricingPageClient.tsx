"use client";

import { useLanguage } from "@/components/LanguageProvider";
import {
  getLocalizedCoverageOptions,
  getLocalizedMedicalApprovalTypes,
  getLocalizedPayerPlans,
  getLocalizedPayerTypeOptions,
  getLocalizedPricingFaqs,
  getLocalizedPricingPlans,
  getLocalizedReimbursementBenchmarks,
} from "@family-support/core";
import { PricingPlanCard } from "./PricingPlanCard";
import { MedicalApprovalForm } from "./MedicalApprovalForm";

export function PricingPageClient() {
  const { t } = useLanguage();
  const plans = getLocalizedPricingPlans(t);
  const payerPlans = getLocalizedPayerPlans(t);
  const coverageOptions = getLocalizedCoverageOptions(t);
  const reimbursementBenchmarks = getLocalizedReimbursementBenchmarks(t);
  const pricingFaqs = getLocalizedPricingFaqs(t);

  return (
    <main className="library-page mx-auto max-w-6xl px-4 py-8 md:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{t("pricing.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900 md:text-4xl">{t("pricing.header")}</h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">{t("library.serviceDescription")}</p>
      </header>

      <section id="plans" className="scroll-mt-24 mt-12">
        <h2 className="text-2xl font-bold text-stone-900">{t("pricing.directTitle")}</h2>
        <p className="mt-2 text-stone-600">{t("pricing.directSubtitle")}</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <PricingPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section id="payers" className="scroll-mt-24 mt-16">
        <h2 className="text-2xl font-bold text-stone-900">{t("pricing.payersTitle")}</h2>
        <p className="mt-2 max-w-3xl text-stone-600">{t("pricing.payersSubtitle")}</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {payerPlans.map((plan) => (
            <article key={plan.id} className="library-card flex flex-col bg-white p-6 ring-1 ring-stone-200">
              <h3 className="text-xl font-bold text-stone-900">{plan.name}</h3>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-stone-900">{plan.price}</span>
                <span className="text-sm text-stone-500">{plan.period}</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{plan.description}</p>
              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-stone-800">
                    <span className="font-bold text-brand">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#approval"
                className="mt-6 inline-flex justify-center rounded-full border border-brand px-5 py-3 text-sm font-bold text-brand hover:bg-brand/5"
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>

        <div className="library-card mt-10 overflow-hidden bg-white">
          <div className="border-b border-stone-200 bg-stone-50 px-6 py-4">
            <h3 className="font-bold text-stone-900">{t("pricing.reimbursementTitle")}</h3>
            <p className="mt-1 text-sm text-stone-600">{t("pricing.reimbursementSubtitle")}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white">
                <tr className="border-b border-stone-200 text-left">
                  <th className="p-4 font-bold">{t("pricing.table.code")}</th>
                  <th className="p-4 font-bold">{t("pricing.table.service")}</th>
                  <th className="p-4 font-bold">{t("pricing.table.range")}</th>
                </tr>
              </thead>
              <tbody>
                {reimbursementBenchmarks.map((row) => (
                  <tr key={row.code} className="border-b border-stone-100">
                    <td className="p-4 font-mono font-bold text-brand">{row.code}</td>
                    <td className="p-4">
                      <p className="font-semibold text-stone-900">{row.title}</p>
                      <p className="mt-1 text-xs text-stone-500">{row.notes}</p>
                    </td>
                    <td className="p-4 text-stone-700">{row.typicalRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="insurance" className="scroll-mt-24 mt-16">
        <h2 className="text-2xl font-bold text-stone-900">{t("pricing.insuranceTitle")}</h2>
        <p className="mt-2 max-w-3xl text-stone-600">{t("pricing.insuranceSubtitle")}</p>
        <div className="mt-8 space-y-6">
          {coverageOptions.map((option) => (
            <article key={option.id} id={option.id} className="library-card scroll-mt-24 overflow-hidden bg-white">
              <div className="border-b border-stone-200 bg-stone-50 px-6 py-5">
                <p className="text-sm font-bold text-brand">{option.priceLabel}</p>
                <h3 className="mt-1 text-xl font-bold text-stone-900">{option.title}</h3>
                <p className="mt-1 text-sm text-stone-600">{option.subtitle}</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-stone-800">
                  <strong className="text-stone-900">{t("pricing.bestFor")}</strong> {option.bestFor}
                </p>
                <h4 className="mt-5 text-sm font-bold uppercase tracking-wide text-stone-500">
                  {t("pricing.howItWorks")}
                </h4>
                <ol className="mt-3 space-y-2">
                  {option.steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm leading-relaxed text-stone-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <h4 className="mt-5 text-sm font-bold uppercase tracking-wide text-stone-500">
                  {t("pricing.documentsIncluded")}
                </h4>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-stone-700">
                  {option.documentsIncluded.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
                {option.note ? (
                  <p className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-700">
                    {option.note}
                  </p>
                ) : null}
                <a
                  href="#approval"
                  className="mt-5 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark"
                >
                  {t("pricing.requestApproval")}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="approval" className="scroll-mt-24 mt-16">
        <h2 className="text-2xl font-bold text-stone-900">{t("pricing.approvalTitle")}</h2>
        <p className="mt-2 max-w-3xl text-stone-600">{t("pricing.approvalSubtitle")}</p>
        <div className="mt-8">
          <MedicalApprovalForm />
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 mt-16">
        <h2 className="text-2xl font-bold text-stone-900">{t("pricing.faqTitle")}</h2>
        <div className="mt-6 space-y-4">
          {pricingFaqs.map((faq) => (
            <article key={faq.q} className="library-card bg-white p-5">
              <h3 className="font-bold text-stone-900">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-16 rounded-2xl border border-stone-300 bg-stone-100 p-6">
        <h2 className="font-bold text-stone-900">{t("pricing.legalTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">{t("pricing.legalNotice")}</p>
        <p className="mt-3 text-sm leading-relaxed text-stone-700">{t("pricing.legalCptNote")}</p>
      </footer>
    </main>
  );
}
