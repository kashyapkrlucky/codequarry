import { getCheatsheetBySlug } from "@/db/queries/cheatsheets";
import { OG_SIZE, renderOgImage } from "@/lib/seo/og";

export const alt = "CodeQuarry cheatsheet";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sheet = await getCheatsheetBySlug(slug);
  return renderOgImage({
    eyebrow: sheet ? `${sheet.category.name} · Cheatsheet` : "Cheatsheet",
    title: sheet?.title ?? "CodeQuarry",
    description: sheet?.description,
  });
}
