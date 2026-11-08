"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-28 text-center">
      <TriangleAlert className="size-10 text-warning" aria-hidden="true" />
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground">We couldn&apos;t load this page. This is usually temporary.</p>
      {error.digest && <p className="font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>}
      <Button onClick={reset}>
        <RotateCcw /> Try again
      </Button>
    </div>
  );
}
