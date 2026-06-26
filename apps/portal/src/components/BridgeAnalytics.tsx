"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function BridgeAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    const controller = new AbortController();
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({
        eventName: "page_view",
        path,
        referrer: document.referrer,
        width: window.innerWidth,
      }),
    }).catch(() => undefined);

    return () => controller.abort();
  }, [pathname, searchParams]);

  return null;
}
