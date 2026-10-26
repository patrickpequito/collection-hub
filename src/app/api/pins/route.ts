import { NextResponse } from "next/server";
import {
  isPinStorageConfigured,
  MAX_PINS,
  readPinnedTitles,
  writePinnedTitles,
} from "@/lib/pinned-titles-store";
import { getFreshSession } from "@/lib/session-access";
import { loadTriumphCatalog } from "@/lib/triumphs/load";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Signed-in player's pinned titles. storage "local" = no database configured, client keeps them. */
export async function GET() {
  const session = await getFreshSession();
  if (!session) return NextResponse.json({ pins: [], storage: "none", error: "Not signed in" }, { headers: NO_STORE });
  if (!isPinStorageConfigured()) return NextResponse.json({ pins: [], storage: "local", error: null }, { headers: NO_STORE });
  try {
    const pins = await readPinnedTitles(session.membershipId);
    return NextResponse.json({ pins, storage: "cloud", error: null }, { headers: NO_STORE });
  } catch (error) {
    return NextResponse.json(
      { pins: [], storage: "cloud", error: error instanceof Error ? error.message : "Failed to load pins" },
      { status: 502, headers: NO_STORE },
    );
  }
}

export async function PUT(request: Request) {
  const session = await getFreshSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401, headers: NO_STORE });
  if (!isPinStorageConfigured()) {
    return NextResponse.json({ error: "Pin storage is not configured" }, { status: 501, headers: NO_STORE });
  }

  let body: { pins?: unknown };
  try {
    body = (await request.json()) as { pins?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers: NO_STORE });
  }

  // Only current (obtainable) titles, no duplicates, newest kept when over the limit.
  const catalog = await loadTriumphCatalog();
  const valid = new Set(catalog.titles.map((title) => title.slug));
  const pins = Array.isArray(body.pins)
    ? [...new Set(body.pins.filter((slug): slug is string => typeof slug === "string" && valid.has(slug)))].slice(
        -MAX_PINS,
      )
    : [];

  try {
    await writePinnedTitles(session.membershipId, pins);
    return NextResponse.json({ pins, error: null }, { headers: NO_STORE });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save pins" },
      { status: 502, headers: NO_STORE },
    );
  }
}
