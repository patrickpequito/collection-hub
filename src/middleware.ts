import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Free-tier hardening (no paid Vercel add-ons):
 * - Deny public /data/* catalog dumps
 * - Block common scrapers / AI crawlers
 * - Soft rate-limit by IP on Edge
 */

const BLOCKED_UA =
  /GPTBot|ChatGPT-User|CCBot|anthropic-ai|Claude-Web|ClaudeBot|Google-Extended|Bytespider|PetalBot|Scrapy|curl\/|wget|python-requests|Go-http-client|libwww-perl|Java\/|PhantomJS|HeadlessChrome|semrush|ahrefs|mj12bot|dotbot|dataforseo|meta-externalagent|FacebookBot|Amazonbot|Applebot-Extended|cohere-ai|Diffbot|omgili|TimpiBot|ImagesiftBot|FriendlyCrawler/i;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 90;

type WindowState = { startedAt: number; count: number };

const windows = new Map<string, WindowState>();

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (windows.size > 5_000) {
    for (const [key, state] of windows) {
      if (now - state.startedAt >= RATE_LIMIT_WINDOW_MS) windows.delete(key);
    }
  }

  const existing = windows.get(ip);
  if (!existing || now - existing.startedAt >= RATE_LIMIT_WINDOW_MS) {
    windows.set(ip, { startedAt: now, count: 1 });
    return false;
  }

  existing.count += 1;
  return existing.count > RATE_LIMIT_MAX;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/data" ||
    pathname.startsWith("/data/") ||
    pathname.includes("/../data/")
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ua = request.headers.get("user-agent") ?? "";
  if (ua && BLOCKED_UA.test(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (rateLimited(clientIp(request))) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on pages + APIs; skip Next internals and common static assets
     * so image/css hits are not double-counted as function work here.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|map)$).*)",
  ],
};
