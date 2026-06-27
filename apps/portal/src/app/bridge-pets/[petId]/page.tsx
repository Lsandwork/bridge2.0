import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BridgePetDetailClient } from "@/components/bridge-pets/BridgePetDetailClient";
import { getBridgePetProfile } from "@/features/bridge-pets/petAssetManifest";

export function generateStaticParams() {
  return [
    "spark",
    "tide",
    "nova",
    "moss",
    "bolt",
    "ranger",
    "focus",
    "zip",
    "echo",
    "atlas",
    "luna",
    "rocket",
    "sage",
  ].map((petId) => ({ petId }));
}

export function generateMetadata({ params }: { params: { petId: string } }) {
  const pet = getBridgePetProfile(params.petId);
  return {
    title: pet ? `${pet.name} | Bridge PETS` : "Bridge PETS",
    description: pet?.descriptor ?? "Bridge PETS companion detail page.",
  };
}

export default function BridgePetDetailPage({ params }: { params: { petId: string } }) {
  const pet = getBridgePetProfile(params.petId);
  if (!pet) notFound();
  return (
    <Suspense fallback={<main className="bridge-pets-root">Loading companion...</main>}>
      <BridgePetDetailClient pet={pet} />
    </Suspense>
  );
}
