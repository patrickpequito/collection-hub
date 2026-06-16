import { NextResponse } from "next/server";
import {
  parseAllLootSearchFilters,
  searchAllLootPage,
} from "@/lib/all-loot/search";
import type { AllLootSearchFilters } from "@/types/all-loot";

const DEFAULT_PAGE_SIZE = 60;
const MAX_PAGE_SIZE = 100;

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
            : "Failed to search All Loot catalog",
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
            : "Failed to search All Loot catalog",
      },
      { status: 500 },
    );
  }
}
