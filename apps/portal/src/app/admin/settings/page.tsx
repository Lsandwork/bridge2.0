export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-slate-600">Platform configuration is managed through environment variables and Supabase.</p>
      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
        <li>Auth: Supabase Auth with role-based access</li>
        <li>AI: Nuvio (internal Tess routes unchanged)</li>
        <li>Payments: Stripe, PayPal, Square via env vars</li>
        <li>Email: Configure SMTP or Resend for notifications</li>
      </ul>
    </div>
  );
}
