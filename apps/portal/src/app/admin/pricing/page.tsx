"use client";

import { useEffect, useState } from "react";

type PricingPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  highlighted?: boolean;
  badge?: string;
};

type PayerPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  cta: string;
};

type PricingState = {
  plans: PricingPlan[];
  payerPlans: PayerPlan[];
};

export default function AdminPricingPage() {
  const [data, setData] = useState<PricingState | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/platform/admin?section=pricing");
    const json = await res.json();
    setData({ plans: json.plans ?? [], payerPlans: json.payerPlans ?? [] });
  };

  useEffect(() => {
    void load();
  }, []);

  const savePlan = async (planId: string, patch: Record<string, unknown>, kind: "pricing" | "payer") => {
    setSaving(planId);
    setMessage(null);
    const action = kind === "pricing" ? "update-pricing-plan" : "update-payer-plan";
    const res = await fetch("/api/platform/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, planId, patch }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error ?? "Could not save plan.");
    } else {
      setMessage("Pricing updated. Families will see changes on the public pricing page.");
      await load();
    }
    setSaving(null);
  };

  const resetAll = async () => {
    if (!confirm("Reset all pricing overrides to platform defaults?")) return;
    await fetch("/api/platform/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-pricing" }),
    });
    setMessage("Pricing reset to defaults.");
    await load();
  };

  if (!data) return <p className="text-slate-500">Loading pricing…</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pricing & Coverage</h1>
          <p className="mt-1 text-slate-600">
            Manage family and payer pricing shown on the public site. User accounts, credits, and insurance approvals
            are managed under User Accounts and Credits / Library.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/pricing"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Preview public page
          </a>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Family plans (direct pay)</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          {data.plans.map((plan) => (
            <PlanEditor
              key={plan.id}
              plan={plan}
              saving={saving === plan.id}
              onSave={(patch) => savePlan(plan.id, patch, "pricing")}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Payer / enterprise plans</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          {data.payerPlans.map((plan) => (
            <PlanEditor
              key={plan.id}
              plan={plan}
              saving={saving === plan.id}
              onSave={(patch) => savePlan(plan.id, patch, "payer")}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function PlanEditor({
  plan,
  saving,
  onSave,
}: {
  plan: PricingPlan | PayerPlan;
  saving: boolean;
  onSave: (patch: Record<string, string>) => void;
}) {
  const [price, setPrice] = useState(plan.price);
  const [period, setPeriod] = useState(plan.period);
  const [description, setDescription] = useState(plan.description);
  const [cta, setCta] = useState(plan.cta);

  useEffect(() => {
    setPrice(plan.price);
    setPeriod(plan.period);
    setDescription(plan.description);
    setCta(plan.cta);
  }, [plan]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
      <p className="text-xs text-slate-500">ID: {plan.id}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Price</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Period</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-slate-600">Description</span>
          <textarea
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-slate-600">Call to action</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
          />
        </label>
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={() => onSave({ price, period, description, cta })}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save plan"}
      </button>
    </div>
  );
}
