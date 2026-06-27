import { getBridgePetsAdminOverview } from "@family-support/data";
import { AdminBridgePetsClient } from "@/components/bridge-pets/AdminBridgePetsClient";

export default async function AdminBridgePetsPage() {
  const data = await getBridgePetsAdminOverview();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bridge PETS</h1>
        <p className="text-slate-600">
          Manage the premium companion catalog, activation, asset readiness, usage, and engagement health.
        </p>
      </div>
      <AdminBridgePetsClient data={data as never} />
    </div>
  );
}
