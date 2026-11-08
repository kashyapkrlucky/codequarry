import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/db/queries/categories";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

function authorized(header: string | null): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Called by `npm run content:import` after publishing so pages pick up new content. */
export async function POST(request: Request) {
  const limit = rateLimit(`revalidate:${clientIp(request.headers)}`, 10, 60_000);
  if (!limit.ok) return tooManyRequests(limit);
  if (!authorized(request.headers.get("authorization"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ revalidated: true, tag: CONTENT_TAG });
}
