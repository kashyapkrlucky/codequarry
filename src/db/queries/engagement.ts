import "server-only";
import { getDb } from "@/db";

/** Write operations for anonymous engagement. Never cached. */

export async function recordFeedback(slug: string, helpful: boolean): Promise<boolean> {
  const db = getDb();
  const sheet = await db.cheatsheet.findFirst({ where: { slug, status: "published" }, select: { id: true } });
  if (!sheet) return false;
  await db.feedback.create({ data: { cheatsheetId: sheet.id, helpful } });
  return true;
}

export async function incrementViewCount(slug: string): Promise<void> {
  // Raw update avoids bumping `updated_at` (which drives "last updated" in the UI).
  await getDb().$executeRaw`
    UPDATE cheatsheets SET view_count = view_count + 1
    WHERE slug = ${slug} AND status = 'published'`;
}
