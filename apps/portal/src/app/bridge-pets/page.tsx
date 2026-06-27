import { Suspense } from "react";
import { BridgePetsClient } from "@/components/bridge-pets/BridgePetsClient";
import { bridgePetProfiles } from "@/features/bridge-pets/petAssetManifest";

export const metadata = {
  title: "Bridge PETS | Nuvio Bridge",
  description: "Premium animated support companions for focus, routines, calm resets, creative expression, and steady growth.",
};

export default function BridgePetsPage() {
  return (
    <Suspense fallback={<main className="bridge-pets-root">Loading Bridge PETS...</main>}>
      <BridgePetsClient pets={bridgePetProfiles} />
    </Suspense>
  );
}
