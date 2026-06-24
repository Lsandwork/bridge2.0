import { notFound } from "next/navigation";
import { PathwayDashboard } from "@/components/dashboard/PathwayDashboard";
import { supportPathways } from "@/lib/support-pathways";

export default async function PathwayPreviewPage({
  params,
}: {
  params: Promise<{ pathway: string }>;
}) {
  const { pathway: pathwayId } = await params;
  const pathway = supportPathways.find((item) => item.id === pathwayId);
  if (!pathway) notFound();
  return <PathwayDashboard pathway={pathway} />;
}
