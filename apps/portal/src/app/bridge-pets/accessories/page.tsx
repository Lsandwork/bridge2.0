import type { Metadata } from "next";
import { companionFanGearItems, fanGearCollections } from "@family-support/data";
import { FanGearClient } from "@/components/bridge-pets/FanGearClient";

export const metadata: Metadata = {
  title: "Bridge Pets Fan Gear",
  description:
    "Original Nuvio Bridge companion pet accessories, style drops, and healthy-engagement unlocks.",
};

export default function BridgePetsAccessoriesPage() {
  return <FanGearClient fallbackItems={companionFanGearItems} fallbackCollections={fanGearCollections} />;
}
