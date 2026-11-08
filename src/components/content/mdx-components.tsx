import { ExternalLink, Hash } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { isValidElement } from "react";
import { isSafeUrl } from "@/lib/content/policy";
import { Callout } from "./callout";
import { CodeBlock } from "./code-block";
import { Kbd } from "./kbd";

function Heading({ as: Tag, id, children }: { as: "h2" | "h3" | "h4"; id?: string; children?: React.ReactNode }) {
  return (
    <Tag id={id} className="group scroll-mt-24">
      <a href={id ? `#${id}` : undefined} className="cq-anchor inline-flex items-center gap-2">
        {children}
        <Hash aria-hidden="true" className="cq-anchor-icon print-hidden size-4 text-muted-foreground opacity-0 transition-opacity" />
      </a>
    </Tag>
  );
}

function Anchor({ href = "", children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!isSafeUrl(href)) return <span>{children}</span>;
  if (href.startsWith("/") || href.startsWith("#")) return <Link href={href}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-baseline gap-0.5">
      {children}
      <ExternalLink aria-hidden="true" className="size-3 self-center opacity-60" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Pre({ children }: { children?: React.ReactNode }) {
  if (isValidElement<{ className?: string; children?: React.ReactNode }>(children)) {
    const { className = "", children: code } = children.props;
    const language = /language-([\w+-]+)/.exec(className)?.[1];
    if (typeof code === "string") return <CodeBlock code={code} language={language} />;
  }
  return <pre>{children}</pre>;
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="!list-none space-y-4 border-l pl-6 [counter-reset:step]">{children}</ol>;
}

function Step({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <li className="relative [counter-increment:step] before:absolute before:-left-[2.1rem] before:grid before:size-6 before:place-items-center before:rounded-full before:border before:bg-background before:font-mono before:text-xs before:content-[counter(step)]">
      {title && <p className="font-semibold">{title}</p>}
      {children}
    </li>
  );
}

const Blocked = () => null;

/**
 * The complete allow-list of components available to MDX content. Anything
 * dangerous is mapped to a null renderer as defence-in-depth (the importer
 * already rejects such content).
 */
export const mdxComponents: MDXComponents = {
  h1: ({ id, children }) => <Heading as="h2" id={id}>{children}</Heading>,
  h2: ({ id, children }) => <Heading as="h2" id={id}>{children}</Heading>,
  h3: ({ id, children }) => <Heading as="h3" id={id}>{children}</Heading>,
  h4: ({ id, children }) => <Heading as="h4" id={id}>{children}</Heading>,
  a: Anchor,
  pre: Pre,
  table: ({ children }) => (
    <div className="cq-table-wrap">
      <table>{children}</table>
    </div>
  ),
  img: ({ src, alt = "" }) =>
    typeof src === "string" && isSafeUrl(src) ? (
      // eslint-disable-next-line @next/next/no-img-element -- remote content images have unknown dimensions
      <img src={src} alt={alt} loading="lazy" decoding="async" className="h-auto max-w-full" />
    ) : null,
  Callout,
  Kbd,
  Steps,
  Step,
  script: Blocked,
  style: Blocked,
  iframe: Blocked,
  object: Blocked,
  embed: Blocked,
  form: Blocked,
  input: Blocked,
  button: Blocked,
  link: Blocked,
  meta: Blocked,
  base: Blocked,
};
