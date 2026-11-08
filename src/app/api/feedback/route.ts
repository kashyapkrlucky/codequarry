import { recordFeedback } from "@/db/queries/engagement";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { feedbackSchema } from "@/lib/validation/api";

export async function POST(request: Request) {
  const limit = rateLimit(`feedback:${clientIp(request.headers)}`, 10, 60_000);
  if (!limit.ok) return tooManyRequests(limit);

  const body: unknown = await request.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid feedback" }, { status: 400 });

  const ok = await recordFeedback(parsed.data.slug, parsed.data.helpful);
  return ok ? Response.json({ ok: true }, { status: 201 }) : Response.json({ error: "Not found" }, { status: 404 });
}
