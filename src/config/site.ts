export const siteConfig = {
  name: "CodeQuarry",
  tagline: "Dig Deeper. Build Smarter.",
  description:
    "Practical, searchable cheatsheets and engineering references for software developers — languages, frontend, backend, databases, DevOps, and computer science.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://codequarry.vercel.app").replace(/\/$/, ""),
  githubUrl: "https://github.com/kashyapkrlucky/codequarry",
  nav: [
    { href: "/explore", label: "Explore" },
    { href: "/categories", label: "Categories" },
    { href: "/explore?sort=latest", label: "Latest" },
    { href: "/bookmarks", label: "Bookmarks" },
  ],
} as const;

export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
