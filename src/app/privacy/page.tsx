import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How CodeQuarry handles data: no accounts, no tracking cookies, local bookmarks.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy" lead="Short version: no accounts, no advertising trackers, and your bookmarks never leave your browser.">
      <h2>What we store</h2>
      <ul>
        <li><strong>Bookmarks</strong> are saved in your browser&apos;s localStorage. They are not sent to our servers except as a list of page identifiers when you open the Bookmarks page, so we can show titles.</li>
        <li><strong>Feedback</strong> (&ldquo;Was this helpful?&rdquo;) stores only the page and your yes/no answer — no identifier.</li>
        <li><strong>Page views</strong> increment an anonymous counter per cheatsheet used to rank popular content.</li>
      </ul>
      <h2>Analytics</h2>
      <p>We use Vercel Analytics, which collects aggregated, cookie-less traffic metrics. IP addresses are used transiently for rate limiting and are not stored.</p>
      <h2>Contact</h2>
      <p>Questions about privacy can be raised as an issue on the project&apos;s GitHub repository.</p>
    </StaticPage>
  );
}
