import { incrementViewCount } from "@/db/queries/engagement";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { viewSchema } from "@/lib/validation/api";

export async function POST(request: Request) {
  const limit = rateLimit(`views:${clientIp(request.headers)}`, 30, 60_000);
  // Beacons ignore the response, so silently drop over-limit views.
  if (!limit.ok) return new Response(null, { status: 204 });

  const body: unknown = await request.json().catch(() => null);
  const parsed = viewSchema.safeParse(body);
  if (!parsed.success) return new Response(null, { status: 400 });
  await incrementViewCount(parsed.data.slug);
  return new Response(null, { status: 204 });
}
