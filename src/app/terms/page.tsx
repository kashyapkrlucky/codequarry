import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for CodeQuarry.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms of use">
      <h2>Use of content</h2>
      <p>CodeQuarry content is provided for educational and reference purposes. Code examples may be used in your own projects. Republishing pages in bulk requires attribution and a link back to the original page.</p>
      <h2>No warranty</h2>
      <p>Content is provided &ldquo;as is&rdquo;, without warranty of any kind. Always verify commands and configuration against official documentation before running them in production.</p>
      <h2>Acceptable use</h2>
      <p>Do not attempt to disrupt the service, circumvent rate limits, or scrape it at a volume that degrades it for others.</p>
      <h2>Changes</h2>
      <p>These terms may be updated; the current version is always available on this page.</p>
    </StaticPage>
  );
}
