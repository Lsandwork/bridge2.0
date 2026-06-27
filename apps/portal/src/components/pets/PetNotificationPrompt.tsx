"use client";

import { Bell } from "lucide-react";
import { usePetNotifications } from "@/hooks/usePetNotifications";

export function PetNotificationPrompt() {
  const { supported, permission, requestPermission } = usePetNotifications();
  if (!supported || permission === "granted") return null;

  return (
    <div className="pet-notification">
      <Bell className="h-4 w-4" />
      <div>
        <p>Optional reminders</p>
        <span>Pet check-ins can remind you about setup, routines, and calm moments.</span>
      </div>
      <button type="button" onClick={() => void requestPermission()}>
        Allow
      </button>
    </div>
  );
}
