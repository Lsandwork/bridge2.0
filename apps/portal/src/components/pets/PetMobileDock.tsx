"use client";

import { PawPrint } from "lucide-react";

export function PetMobileDock({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="pet-mobile-dock" onClick={onOpen} aria-label="Open Nuvio companion">
      <PawPrint className="h-5 w-5" />
      Companion
    </button>
  );
}
