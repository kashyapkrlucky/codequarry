import { highlight, LANGUAGE_LABELS, resolveLanguage } from "@/lib/content/highlighter";
import { CopyButton } from "./copy-button";
import { MermaidDiagram } from "./mermaid-diagram";

/** Server-rendered, syntax-highlighted code block. Mermaid fences render as diagrams. */
export async function CodeBlock({ code, language }: { code: string; language?: string }) {
  const source = code.replace(/\n$/, "");
  if (language === "mermaid") return <MermaidDiagram chart={source} />;

  const lang = resolveLanguage(language);
  const html = await highlight(source, lang);
  return (
    <div className="cq-code not-prose group relative overflow-hidden rounded-xl border bg-[var(--code-bg)]">
      <div className="flex h-9 items-center justify-between border-b bg-surface/60 pr-1.5 pl-3.5">
        <span className="font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {LANGUAGE_LABELS[lang] ?? lang}
        </span>
        <CopyButton value={source} />
      </div>
      {/* Shiki emits escaped token spans only; content cannot inject markup. */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
