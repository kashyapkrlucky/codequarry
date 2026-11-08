import "server-only";
import { createHighlighter, type BundledLanguage, type Highlighter } from "shiki";

const LANGUAGES = [
  "bash", "css", "diff", "dockerfile", "go", "graphql", "html", "http", "ini", "javascript", "json", "jsx",
  "markdown", "nginx", "python", "sql", "toml", "tsx", "typescript", "yaml",
] as const satisfies readonly BundledLanguage[];

const ALIASES: Record<string, (typeof LANGUAGES)[number]> = {
  sh: "bash", shell: "bash", zsh: "bash", console: "bash",
  js: "javascript", mjs: "javascript", cjs: "javascript",
  ts: "typescript", mts: "typescript",
  py: "python", yml: "yaml", docker: "dockerfile", gql: "graphql", md: "markdown", golang: "go",
  psql: "sql", postgres: "sql", postgresql: "sql", env: "ini",
};

export const LANGUAGE_LABELS: Record<string, string> = {
  bash: "Shell", css: "CSS", diff: "Diff", dockerfile: "Dockerfile", go: "Go", graphql: "GraphQL",
  html: "HTML", http: "HTTP", ini: "INI", javascript: "JavaScript", json: "JSON", jsx: "JSX", markdown: "Markdown",
  nginx: "Nginx", python: "Python", sql: "SQL", toml: "TOML", tsx: "TSX", typescript: "TypeScript", yaml: "YAML",
  text: "Text",
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: ["github-light", "github-dark-default"],
    langs: [...LANGUAGES],
  });
  return highlighterPromise;
}

export function resolveLanguage(raw: string | undefined): string {
  const lang = (raw ?? "").toLowerCase();
  if ((LANGUAGES as readonly string[]).includes(lang)) return lang;
  return ALIASES[lang] ?? "text";
}

/** Returns Shiki HTML (escaped tokens only — safe to inject) with light/dark CSS variables. */
export async function highlight(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang: lang === "text" ? "text" : (lang as BundledLanguage),
    themes: { light: "github-light", dark: "github-dark-default" },
    defaultColor: false,
  });
}
