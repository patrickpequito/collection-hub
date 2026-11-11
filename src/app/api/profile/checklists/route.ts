import { NextResponse } from "next/server";
import { getFreshSession } from "@/lib/session-access";
import { resolveDestinyMembership } from "@/lib/destiny-membership";
import { getBungieApiKey } from "@/lib/env";

export const dynamic = "force-dynamic";

type ChecklistMap = Record<string, Record<string, boolean>>;

/**
 * Returns Destiny profile checklist entry completion keyed by checklist hash,
 * then entry hash. Used for region chests, lost-sector discovery and destination collectibles.
 */
export async function GET() {
  const session = await getFreshSession();
  if (!session) {
    return NextResponse.json({ checklists: {}, error: "Not signed in" });
  }

  try {
    const apiKey = getBungieApiKey();
    const membership = await resolveDestinyMembership(session);
    if (!membership) {
      return NextResponse.json({
        checklists: {},
        error: "No Destiny membership found",
      });
    }
    const url = `https://www.bungie.net/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=104,202`;
    const response = await fetch(url, {
      headers: {
        "X-API-Key": apiKey,
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });
    const payload = (await response.json()) as {
      ErrorCode: number;
      Message?: string;
      Response?: {
        profileProgression?: {
          data?: {
            checklists?: Record<string, Record<string, boolean>>;
          };
        };
        characterProgressions?: {
          data?: Record<string, { checklists?: Record<string, Record<string, boolean>> }>;
        };
      };
    };

    if (payload.ErrorCode !== 1) {
      return NextResponse.json({
        checklists: {},
        error: payload.Message ?? "Bungie profile error",
      });
    }

    // Profile checklists plus character ones (an entry counts once any character has it).
    const sources = [
      payload.Response?.profileProgression?.data?.checklists ?? {},
      ...Object.values(payload.Response?.characterProgressions?.data ?? {}).map(
        (character) => character.checklists ?? {},
      ),
    ];
    const checklists: ChecklistMap = {};
    for (const rawChecklists of sources) {
      for (const [checklistHash, entries] of Object.entries(rawChecklists)) {
        const normalized = (checklists[String(checklistHash)] ??= {});
        for (const [entryHash, done] of Object.entries(entries ?? {})) {
          normalized[String(entryHash)] = normalized[String(entryHash)] || Boolean(done);
        }
      }
    }

    return NextResponse.json({ checklists, error: null });
  } catch (error) {
    return NextResponse.json({
      checklists: {},
      error:
        error instanceof Error ? error.message : "Failed to load checklists",
    });
  }
}
