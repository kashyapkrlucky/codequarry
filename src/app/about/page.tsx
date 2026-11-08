import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/layout/static-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: "What CodeQuarry is, how content is written, and how to contribute.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <StaticPage title="About CodeQuarry" lead={siteConfig.tagline}>
      <p>
        CodeQuarry is a developer knowledge base of concise, technically accurate cheatsheets. Each reference is built for
        scanning: the syntax you need, the trade-offs that matter, and the mistakes worth avoiding — without wading through
        several tabs of documentation.
      </p>
      <h2>How content is written</h2>
      <ul>
        <li>Every cheatsheet is an MDX file under version control, reviewed like code.</li>
        <li>Files are validated (frontmatter schema and a strict content policy) before they are imported into PostgreSQL.</li>
        <li>Examples target current stable releases; each page shows when it was last updated.</li>
      </ul>
      <h2>Contributing</h2>
      <p>
        Found a mistake or want to add a topic? Open an issue or pull request on{" "}
        <a href={siteConfig.githubUrl}>GitHub</a>. You can also browse everything on the <Link href="/explore">Explore</Link> page.
      </p>
    </StaticPage>
  );
}
