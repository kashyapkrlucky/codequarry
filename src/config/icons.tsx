import { createElement } from "react";
import {
  Atom, Binary, Boxes, Braces, Cloud, CodeXml, Container, Cpu, Database, FileCode, FileType,
  GitBranch, Globe, Hexagon, Network, Paintbrush, PanelsTopLeft, Server, Share2, ShieldCheck,
  Table, Terminal, Triangle, Zap, BookOpen, type LucideIcon,
} from "lucide-react";

/**
 * Allow-listed icons referenced by name from the database (categories,
 * technologies). Importing only these keeps the client bundle small.
 */
const ICONS: Record<string, LucideIcon> = {
  atom: Atom,
  binary: Binary,
  boxes: Boxes,
  braces: Braces,
  cloud: Cloud,
  "code-xml": CodeXml,
  container: Container,
  cpu: Cpu,
  database: Database,
  "file-code": FileCode,
  "file-type": FileType,
  "git-branch": GitBranch,
  globe: Globe,
  hexagon: Hexagon,
  network: Network,
  paintbrush: Paintbrush,
  "panels-top-left": PanelsTopLeft,
  server: Server,
  "share-2": Share2,
  "shield-check": ShieldCheck,
  table: Table,
  terminal: Terminal,
  triangle: Triangle,
  zap: Zap,
};

export function getIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || BookOpen;
}

/** Renders an allow-listed icon by name (a stable component, safe for React Compiler rules). */
export function IconByName({ name, className }: { name: string | null | undefined; className?: string }) {
  return createElement(getIcon(name), { className, "aria-hidden": true });
}
