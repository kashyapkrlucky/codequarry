"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

/**
 * Renders a Mermaid diagram on the client. The library (~large) is only
 * fetched on pages that contain a diagram. The source is shown as a fallback
 * before render, without JavaScript, and if rendering fails.
 */
export function MermaidDiagram({ chart }: { chart: string }) {
  const { resolvedTheme } = useTheme();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "light" ? "neutral" : "dark",
          fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
          themeVariables: resolvedTheme === "light" ? {} : { background: "transparent", primaryColor: "#1a2638", primaryBorderColor: "#7c5cfc", lineColor: "#94a3b8", primaryTextColor: "#f1f5f9" },
        });
        const { svg: rendered } = await mermaid.render(`mermaid-${id}-${resolvedTheme ?? "dark"}`, chart);
        if (!cancelled) setSvg(rendered);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id, resolvedTheme]);

  return (
    <figure className="not-prose overflow-x-auto rounded-xl border bg-surface/40 p-4">
      {svg && !failed ? (
        // Mermaid output with securityLevel "strict" is sanitised by DOMPurify.
        <div role="img" aria-label="Diagram" className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <pre className="font-mono text-xs whitespace-pre text-muted-foreground" aria-busy={!failed}>{chart}</pre>
      )}
    </figure>
  );
}
