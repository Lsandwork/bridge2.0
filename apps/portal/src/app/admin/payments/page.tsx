import { AdminSectionPage } from "@/components/admin/AdminSectionPage";

export default function AdminPaymentsPage() {
  return (
    <AdminSectionPage
      title="Payment Processors"
      description="Stripe, PayPal, Square, and Venmo configuration status."
      section="payments"
      render={(data) => {
        const processors = (data as Array<{ id: string; label: string; configured: boolean; environment: string; notes: string }>) ?? [];
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {processors.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{p.label}</h2>
                  <span className={p.configured ? "text-emerald-600" : "text-slate-400"}>
                    {p.configured ? "Configured" : "Not configured"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{p.notes}</p>
                <p className="mt-1 text-xs text-slate-400">Environment: {p.environment}</p>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
