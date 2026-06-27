"use client";

import { useEffect, useState } from "react";

export function usePetNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setSupported("Notification" in window);
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  async function requestPermission() {
    if (!("Notification" in window)) return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }

  return { supported, permission, requestPermission };
}
