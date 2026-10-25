import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./rate-limit";

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function rateLimitResponse(resetAt: number) {
  return NextResponse.json(
    {
      error: "Trop de requêtes. Veuillez attendre avant de réessayer.",
      resetAt,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
      },
    }
  );
}

export function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const ip = getClientIp(req);
  const { allowed, resetAt } = checkRateLimit(ip);
  if (!allowed) return Promise.resolve(rateLimitResponse(resetAt));
  return handler();
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}
