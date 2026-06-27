"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ChevronUp, Minimize2, PawPrint } from "lucide-react";
import { useCompanionPet } from "./CompanionPetProvider";
import { PetBubble } from "./PetBubble";
import { PetPanel } from "./PetPanel";
import { PetSetupWizard } from "./PetSetupWizard";
import { PetSprite } from "./PetSprite";
import { PetMobileDock } from "./PetMobileDock";

const skipKey = "nuvio.pet.setup.skipUntil";
const positionKey = "nuvio.pet.position";

function skippedForNow() {
  if (typeof window === "undefined") return false;
  const value = window.localStorage.getItem(skipKey);
  return value ? Number(value) > Date.now() : false;
}

export function CompanionPetOverlay() {
  const { state, loading, createPet, updatePet, awardXp, equipItem } = useCompanionPet();
  const pet = state?.pet ?? null;
  const [open, setOpen] = useState(false);
  const [setupSkipped, setSetupSkipped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setSetupSkipped(skippedForNow());
    const saved = window.localStorage.getItem(positionKey);
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem(positionKey);
      }
    }
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/nuvio-pet-sw.js").catch(() => undefined);
  }, []);

  const minimized = Boolean(pet?.settings?.minimized);
  const disabled = Boolean(pet?.settings?.disabled);
  const showBubble = Boolean(pet && !open && !minimized && !pet.settings.quietMode);
  const rootStyle = useMemo(() => {
    if (!position) return undefined;
    return { left: position.x, top: position.y, right: "auto", bottom: "auto" };
  }, [position]);

  function skipSetup() {
    const oneWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(skipKey, String(oneWeek));
    setSetupSkipped(true);
  }

  function startDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    const next = {
      x: Math.max(12, Math.min(window.innerWidth - 112, event.clientX - dragOffset.current.x)),
      y: Math.max(12, Math.min(window.innerHeight - 112, event.clientY - dragOffset.current.y)),
    };
    setPosition(next);
  }

  function endDrag() {
    if (!dragging) return;
    setDragging(false);
    if (position) window.localStorage.setItem(positionKey, JSON.stringify(position));
  }

  if (loading && !state) return null;
  if (disabled) return null;

  if (!pet) {
    if (setupSkipped) {
      return <PetMobileDock onOpen={() => setSetupSkipped(false)} />;
    }
    return (
      <div className="pet-overlay pet-overlay--setup" style={rootStyle}>
        <PetSetupWizard
          compact
          onCreate={async (input) => {
            await createPet(input);
            window.localStorage.removeItem(skipKey);
          }}
          onSkip={skipSetup}
        />
      </div>
    );
  }

  if (minimized) {
    return (
      <button
        type="button"
        className="pet-minimized"
        onClick={() => void updatePet({ settings: { ...pet.settings, minimized: false } })}
        aria-label="Restore Nuvio companion"
      >
        <PawPrint className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="pet-overlay" style={rootStyle}>
      {showBubble ? <PetBubble mood={pet.mood} /> : null}
      {open ? (
        <PetPanel
          pet={pet}
          onClose={() => setOpen(false)}
          onHide={() => void updatePet({ settings: { ...pet.settings, minimized: true } })}
          onAwardXp={awardXp}
          onEquip={equipItem}
          onUpdate={updatePet}
        />
      ) : null}
      <button
        type="button"
        className="pet-float"
        onClick={() => {
          if (!dragging) setOpen((value) => !value);
        }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label={open ? "Close Nuvio companion panel" : "Open Nuvio companion panel"}
      >
        <PetSprite species={pet.species} mood={pet.mood} outfit={pet.activeOutfit} size="md" motionLevel={pet.settings.motionLevel} />
        <span className="pet-float__name">{pet.name}</span>
        {open ? <Minimize2 className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
    </div>
  );
}
