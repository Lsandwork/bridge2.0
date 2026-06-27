"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { usePetNotifications } from "@/hooks/usePetNotifications";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PetNotificationPrompt() {
  const { supported, permission, requestPermission } = usePetNotifications();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function capturePrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", capturePrompt);
    return () => window.removeEventListener("beforeinstallprompt", capturePrompt);
  }, []);

  if ((!supported || permission === "granted") && !installPrompt) return null;

  return (
    <div className="pet-notification">
      <Bell className="h-4 w-4" />
      <div>
        <p>{installPrompt ? "App check-ins" : "Optional reminders"}</p>
        <span>
          {installPrompt
            ? "Install Nuvio Bridge for a smoother companion experience on this device."
            : "Pet check-ins can remind you about setup, routines, and calm moments."}
        </span>
      </div>
      {supported && permission !== "granted" ? (
        <button type="button" onClick={() => void requestPermission()}>
          Allow
        </button>
      ) : null}
      {installPrompt ? (
        <button
          type="button"
          onClick={async () => {
            await installPrompt.prompt();
            await installPrompt.userChoice.catch(() => undefined);
            setInstallPrompt(null);
          }}
        >
          Install
        </button>
      ) : null}
    </div>
  );
}
