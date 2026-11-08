"use client";

import { useEffect } from "react";

/** Records one view per slug per browser session (feeds the "Popular" sort). */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `cq:viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable — still count */
    }
    const body = JSON.stringify({ slug });
    if (!navigator.sendBeacon?.("/api/views", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/views", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
    }
  }, [slug]);
  return null;
}
