import { NextResponse } from "next/server";
import {
  parseAllLootSearchFilters,
  searchAllLootPage,
} from "@/lib/all-loot/search";
import type { AllLootSearchFilters } from "@/types/all-loot";

const DEFAULT_PAGE_SIZE = 60;
const MAX_PAGE_SIZE = 100;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;

type RateLimitWindow = {
  startedAt: number;
  count: number;
};

const requestWindows = new Map<string, RateLimitWindow>();

function resolveClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(request: Request): {
  limited: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  for (const [windowKey, windowState] of requestWindows) {
    if (now - windowState.startedAt >= RATE_LIMIT_WINDOW_MS) {
      requestWindows.delete(windowKey);
    }
  }

  const key = `${resolveClientIp(request)}:${request.method}`;
  const existing = requestWindows.get(key);

  if (!existing || now - existing.startedAt >= RATE_LIMIT_WINDOW_MS) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return { limited: false, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  requestWindows.set(key, existing);

  if (existing.count <= RATE_LIMIT_MAX_REQUESTS) {
    return { limited: false, retryAfterSeconds: 0 };
  }

  const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - existing.startedAt);
  return {
    limited: true,
    retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
  };
}

function parsePageParams(params: URLSearchParams) {
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(
      1,
      Number(params.get("pageSize") ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE,
    ),
  );
  return { page, pageSize };
}

export async function GET(request: Request) {
  const rateLimit = isRateLimited(request);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please retry shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const params = new URL(request.url).searchParams;
  const filters = parseAllLootSearchFilters(params);
  if (filters.collected !== "all") {
    filters.collected = "all";
  }
  const { page, pageSize } = parsePageParams(params);

  try {
    const result = await searchAllLootPage(filters, page, pageSize);
    return NextResponse.json({ ...result, error: null });
  } catch (error) {
    return NextResponse.json(
      {
        items: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to search Loot Collector catalog",
      },
      { status: 500 },
    );
  }
}

type SearchPostBody = {
  filters: AllLootSearchFilters;
  page?: number;
  pageSize?: number;
  ownedItemHashes?: string[];
};

export async function POST(request: Request) {
  const rateLimit = isRateLimited(request);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please retry shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let body: SearchPostBody;
  try {
    body = (await request.json()) as SearchPostBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const page = Math.max(1, Number(body.page ?? 1) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(body.pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE),
  );
  const ownedSet = body.ownedItemHashes?.length
    ? new Set(body.ownedItemHashes)
    : undefined;

  try {
    const result = await searchAllLootPage(
      body.filters,
      page,
      pageSize,
      ownedSet,
    );
    return NextResponse.json({ ...result, error: null });
  } catch (error) {
    return NextResponse.json(
      {
        items: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to search Loot Collector catalog",
      },
      { status: 500 },
    );
  }
}
