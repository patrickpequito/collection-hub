import { NextResponse } from "next/server";
import {
  DUNGEONS,
  LEGACY_RAIDS,
  PANTHEON,
  RAID_LAIRS,
  RAIDS,
} from "@/data/rad-loot/activities";
import { loadSignedInActivityBannerStats } from "@/lib/rad-loot-banner-stats";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ bannerStats: null, error: "Not signed in" });
  }

  const allEntries = [PANTHEON, ...RAIDS, ...DUNGEONS, ...LEGACY_RAIDS, ...RAID_LAIRS];

  try {
    const bannerStats = await loadSignedInActivityBannerStats(
      allEntries,
      session,
    );
    return NextResponse.json({ bannerStats, error: null });
  } catch (error) {
    return NextResponse.json({
      bannerStats: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load activity banner stats",
    });
  }
}
