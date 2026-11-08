import { absoluteUrl, siteConfig } from "@/config/site";
import type { CheatsheetDetail } from "@/types/content";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteConfig.url}/explore?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function cheatsheetJsonLd(sheet: CheatsheetDetail) {
  const url = absoluteUrl(`/cheatsheets/${sheet.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: sheet.title,
        description: sheet.description,
        url,
        mainEntityOfPage: url,
        datePublished: (sheet.publishedAt ?? sheet.updatedAt).toISOString(),
        dateModified: new Date(sheet.updatedAt).toISOString(),
        proficiencyLevel: sheet.difficulty === "beginner" ? "Beginner" : "Expert",
        keywords: sheet.tags.map((t) => t.name).join(", "),
        articleSection: sheet.category.name,
        timeRequired: `PT${sheet.readingTime}M`,
        publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: sheet.category.name, item: absoluteUrl(`/categories/${sheet.category.slug}`) },
          { "@type": "ListItem", position: 3, name: sheet.title, item: url },
        ],
      },
    ],
  };
}

export function collectionJsonLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
  };
}
