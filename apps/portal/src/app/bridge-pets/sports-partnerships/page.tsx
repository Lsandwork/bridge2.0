import type { Metadata } from "next";
import { listSportsPartners } from "@family-support/data";
import { SportsPartnershipsClient } from "@/components/bridge-pets/SportsPartnershipsClient";

export const metadata: Metadata = {
  title: "Bridge Pets Sports Partnerships",
  description:
    "A licensing-ready fan gear and sports partnership system for Nuvio Bridge companion pets.",
};

export default async function BridgePetsSportsPartnershipsPage() {
  const partners = await listSportsPartners();
  return <SportsPartnershipsClient partners={partners} />;
}
