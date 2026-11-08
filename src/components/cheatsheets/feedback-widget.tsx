"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

type State = "idle" | "sending" | "sent" | "error";

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function FeedbackWidget({ slug }: { slug: string }) {
  const storageKey = `cq:feedback:${slug}`;
  const alreadyVoted = useSyncExternalStore(
    () => () => {},
    () => readStored(storageKey) !== null,
    () => false,
  );
  const [state, setState] = useState<State>("idle");

  const send = async (helpful: boolean) => {
    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, helpful }),
      });
      if (!res.ok) throw new Error(String(res.status));
      try {
        localStorage.setItem(storageKey, helpful ? "up" : "down");
      } catch {
        /* ignore */
      }
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <section aria-label="Feedback" className="print-hidden flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-surface/50 px-5 py-4">
      {state === "sent" || alreadyVoted ? (
        <p className="text-sm text-muted-foreground" role="status">Thanks for the feedback — it helps us improve this page.</p>
      ) : (
        <>
          <p className="text-sm font-medium">{state === "error" ? "Couldn't send feedback. Try again?" : "Was this helpful?"}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={state === "sending"} onClick={() => send(true)}>
              <ThumbsUp /> Yes
            </Button>
            <Button variant="outline" size="sm" disabled={state === "sending"} onClick={() => send(false)}>
              <ThumbsDown /> No
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
