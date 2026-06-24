"use client";

import { useState } from "react";
import {
  getLocalizedMedicalApprovalTypes,
  getLocalizedPayerTypeOptions,
  type MedicalApprovalType,
  type PayerType,
} from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";

type FormState = {
  parentName: string;
  email: string;
  state: string;
  payerType: PayerType;
  memberId: string;
  clinicianName: string;
  approvalType: string;
  notes: string;
};

const initial: FormState = {
  parentName: "",
  email: "",
  state: "CA",
  payerType: "medi-cal-ca",
  memberId: "",
  clinicianName: "",
  approvalType: "prior-auth",
  notes: "",
};

export function MedicalApprovalForm() {
  const { t } = useLanguage();
  const medicalApprovalTypes = getLocalizedMedicalApprovalTypes(t);
  const payerTypeOptions = getLocalizedPayerTypeOptions(t);
  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ referenceId: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedApproval = medicalApprovalTypes.find((type) => type.id === form.approvalType);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/pricing/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("pricing.form.requestFailed"));
      setResult({ referenceId: data.referenceId, message: data.message });
      setForm(initial);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={submit} className="library-card space-y-4 bg-white p-6">
        <h3 className="text-lg font-bold text-stone-900">{t("pricing.form.title")}</h3>
        <p className="text-sm text-stone-600">{t("pricing.form.subtitle")}</p>

        <label className="block text-sm">
          <span className="font-semibold text-stone-900">{t("pricing.form.parentName")}</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
            value={form.parentName}
            onChange={(e) => setForm((p) => ({ ...p, parentName: e.target.value }))}
          />
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-stone-900">{t("pricing.form.email")}</span>
          <input
            required
            type="email"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-semibold text-stone-900">{t("pricing.form.state")}</span>
            <input
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
              value={form.state}
              onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-stone-900">{t("pricing.form.payerType")}</span>
            <select
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
              value={form.payerType}
              onChange={(e) => setForm((p) => ({ ...p, payerType: e.target.value as PayerType }))}
            >
              {payerTypeOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="font-semibold text-stone-900">{t("pricing.form.approvalType")}</span>
          <select
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
            value={form.approvalType}
            onChange={(e) => setForm((p) => ({ ...p, approvalType: e.target.value }))}
          >
            {medicalApprovalTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-stone-900">{t("pricing.form.memberId")}</span>
          <input
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
            placeholder={t("pricing.form.memberIdPlaceholder")}
            value={form.memberId}
            onChange={(e) => setForm((p) => ({ ...p, memberId: e.target.value }))}
          />
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-stone-900">{t("pricing.form.clinician")}</span>
          <input
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
            placeholder={t("pricing.form.clinicianPlaceholder")}
            value={form.clinicianName}
            onChange={(e) => setForm((p) => ({ ...p, clinicianName: e.target.value }))}
          />
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-stone-900">{t("pricing.form.notes")}</span>
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
            placeholder={t("pricing.form.notesPlaceholder")}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {result ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-bold">{t("pricing.form.submitted", { id: result.referenceId })}</p>
            <p className="mt-1">{result.message}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? t("pricing.form.submitting") : t("pricing.form.submit")}
        </button>
      </form>

      <div className="space-y-4">
        {medicalApprovalTypes.map((type) => (
          <ApprovalTypeCard key={type.id} type={type} active={form.approvalType === type.id} />
        ))}
      </div>
    </div>
  );
}

function ApprovalTypeCard({ type, active }: { type: MedicalApprovalType; active: boolean }) {
  const { t } = useLanguage();
  return (
    <article
      className={`library-card bg-white p-5 transition ${active ? "ring-2 ring-brand" : "opacity-90"}`}
      id={`approval-${type.id}`}
    >
      <h4 className="font-bold text-stone-900">{type.title}</h4>
      <p className="mt-1 text-sm text-stone-600">{type.description}</p>
      <p className="mt-2 text-xs font-semibold text-brand">
        {t("pricing.form.turnaround", { time: type.typicalTurnaround })}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{t("pricing.form.youProvide")}</p>
          <ul className="mt-1 list-inside list-disc text-sm text-stone-700">
            {type.requiredFromParent.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{t("pricing.form.weProvide")}</p>
          <ul className="mt-1 list-inside list-disc text-sm text-stone-700">
            {type.whatWeProvide.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
