"use client";

import Link from "next/link";
import type { PricingPlan } from "@family-support/core";

export function PricingPlanCard({ plan }: { plan: PricingPlan }) {
  return (
    <article
      className={`library-card flex flex-col bg-white p-6 ${
        plan.highlighted ? "ring-2 ring-brand shadow-lg" : ""
      }`}
    >
      {plan.badge ? (
        <span className="mb-3 w-fit rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">{plan.badge}</span>
      ) : null}
      <h3 className="text-xl font-bold text-stone-900">{plan.name}</h3>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-stone-900">{plan.price}</span>
        <span className="text-sm text-stone-500">{plan.period}</span>
      </p>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{plan.description}</p>
      <ul className="mt-5 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2 text-sm text-stone-800">
            <span className="font-bold text-brand">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={plan.id === "foundations" ? "/library" : "/login"}
        className={`mt-6 block w-full rounded-full px-5 py-3 text-center text-sm font-bold ${
          plan.highlighted
            ? "bg-brand text-white hover:bg-brand-dark"
            : "border border-stone-300 bg-white text-stone-900 hover:bg-stone-50"
        }`}
      >
        {plan.cta}
      </Link>
    </article>
  );
}
