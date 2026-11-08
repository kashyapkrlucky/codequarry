import type { NextRequest } from "next/server";
import { getCheatsheetsBySlugs } from "@/db/queries/cheatsheets";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { slugListSchema } from "@/lib/validation/api";

/** Summaries for a list of slugs — used by the client-side bookmarks page. */
export async function GET(request: NextRequest) {
  const limit = rateLimit(`lookup:${clientIp(request.headers)}`, 60, 60_000);
  if (!limit.ok) return tooManyRequests(limit);

  const parsed = slugListSchema.safeParse(request.nextUrl.searchParams.get("slugs") ?? "");
  if (!parsed.success) return Response.json({ error: "Invalid slugs" }, { status: 400 });
  const items = await getCheatsheetsBySlugs(parsed.data);
  return Response.json({ items });
}
