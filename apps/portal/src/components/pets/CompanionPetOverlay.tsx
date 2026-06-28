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
const legacyPositionKey = "nuvio.pet.position";
const positionKey = "nuvio_pet_position";
const dragThreshold = 6;
const petBounds = { width: 112, height: 112 };

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
  const [dragMoved, setDragMoved] = useState(false);
  const [released, setReleased] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const pointerStart = useRef({ x: 0, y: 0 });

  const clamp = useMemo(() => {
    return (next: { x: number; y: number }) => {
      const margin = window.matchMedia("(max-width: 640px)").matches ? 20 : 32;
      const bottomSafe = window.matchMedia("(max-width: 640px)").matches ? 88 : 32;
      return {
        x: Math.max(margin, Math.min(window.innerWidth - petBounds.width - margin, next.x)),
        y: Math.max(margin, Math.min(window.innerHeight - petBounds.height - bottomSafe, next.y)),
      };
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSetupSkipped(skippedForNow());
      const saved = window.localStorage.getItem(positionKey) ?? window.localStorage.getItem(legacyPositionKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const next = clamp(parsed);
          setPosition(next);
          window.localStorage.setItem(positionKey, JSON.stringify(next));
          window.localStorage.removeItem(legacyPositionKey);
        } catch {
          window.localStorage.removeItem(positionKey);
          window.localStorage.removeItem(legacyPositionKey);
        }
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [clamp]);

  useEffect(() => {
    const onResize = () => {
      setPosition((current) => {
        if (!current) return current;
        const next = clamp(current);
        window.localStorage.setItem(positionKey, JSON.stringify(next));
        return next;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp]);

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

  function resetPosition() {
    setPosition(null);
    window.localStorage.removeItem(positionKey);
    window.localStorage.removeItem(legacyPositionKey);
  }

  function startDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    pointerStart.current = { x: event.clientX, y: event.clientY };
    setDragMoved(false);
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    const distance = Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y);
    if (distance <= dragThreshold && !dragMoved) return;
    setDragMoved(true);
    setPosition(clamp({
      x: event.clientX - dragOffset.current.x,
      y: event.clientY - dragOffset.current.y,
    }));
  }

  function endDrag() {
    if (!dragging) return;
    setDragging(false);
    setReleased(true);
    window.setTimeout(() => setReleased(false), 420);
    if (position && dragMoved) window.localStorage.setItem(positionKey, JSON.stringify(clamp(position)));
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
          onResetPosition={resetPosition}
        />
      ) : null}
      <button
        type="button"
        className={`pet-float ${dragging ? "pet-float--dragging" : ""} ${released ? "pet-float--released" : ""}`}
        onClick={() => {
          if (!dragMoved) {
            setOpen((value) => !value);
            if (!open) void awardXp("open_nuvio_pet", { source: "floating_bubble" });
          }
        }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label={open ? "Close Nuvio companion panel" : "Open Nuvio companion panel"}
      >
        <PetSprite species={pet.species} mood={pet.mood} outfit={pet.activeOutfit} size="md" motionLevel={pet.settings.motionLevel} />
        <span className="pet-float__chevron" aria-hidden>
          {open ? <Minimize2 className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </span>
      </button>
    </div>
  );
}
