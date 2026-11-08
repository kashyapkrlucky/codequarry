import type { NextRequest } from "next/server";
import { searchCheatsheets } from "@/db/queries/search";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { searchQuerySchema } from "@/lib/validation/api";
import type { SearchResponse } from "@/types/content";

export async function GET(request: NextRequest) {
  const limit = rateLimit(`search:${clientIp(request.headers)}`, 120, 60_000);
  if (!limit.ok) return tooManyRequests(limit);

  const parsed = searchQuerySchema.safeParse({ q: request.nextUrl.searchParams.get("q") ?? "" });
  if (!parsed.success) return Response.json({ query: "", hits: [] } satisfies SearchResponse);

  try {
    const hits = await searchCheatsheets(parsed.data.q, 12);
    return Response.json({ query: parsed.data.q, hits } satisfies SearchResponse, {
      headers: { "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("[search] query failed", error);
    return Response.json({ error: "Search unavailable" }, { status: 503 });
  }
}
