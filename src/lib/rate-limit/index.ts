import "server-only";

/**
 * Fixed-window rate limiter for public write endpoints.
 *
 * In-memory, so limits apply per server instance — adequate as abuse
 * protection for anonymous feedback/view beacons. Swap `MemoryStore` for a
 * shared store (e.g. Upstash Redis) behind the same interface to enforce
 * global limits.
 */
export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

interface Window {
  count: number;
  resetAt: number;
}

const MAX_KEYS = 10_000;
const windows = new Map<string, Window>();

function sweep(now: number) {
  if (windows.size < MAX_KEYS) return;
  for (const [key, w] of windows) if (w.resetAt <= now) windows.delete(key);
  // Still full (sustained flood): drop oldest entries.
  if (windows.size >= MAX_KEYS) [...windows.keys()].slice(0, MAX_KEYS / 2).forEach((k) => windows.delete(k));
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    windows.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }
  current.count += 1;
  return { ok: current.count <= limit, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous"
  );
}

export function tooManyRequests(result: RateLimitResult): Response {
  return Response.json(
    { error: "Too many requests" },
    { status: 429, headers: { "retry-after": String(Math.ceil((result.resetAt - Date.now()) / 1000)) } },
  );
}
