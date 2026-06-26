import { getAdminSection } from "@family-support/data";
import { AdminErrorState } from "./AdminUi";

export async function AdminSectionPage({
  title,
  description,
  section,
  render,
}: {
  title: string;
  description: string;
  section: string;
  render: (data: unknown) => React.ReactNode;
}) {
  let data: unknown = null;
  let error: string | null = null;

  try {
    data = await getAdminSection(section, new URLSearchParams({ section }));
    if (data === null) error = `Unknown admin section: ${section}`;
  } catch (err) {
    error = err instanceof Error ? err.message : `Could not load ${title}.`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-slate-600">{description}</p>
      </div>
      {error ? <AdminErrorState message={error} /> : render(data)}
    </div>
  );
}
