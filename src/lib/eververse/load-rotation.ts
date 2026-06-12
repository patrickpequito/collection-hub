import type { BungieUserSession } from "@/lib/bungie";
import {
  clearCachedEververseRotation,
  getCachedEververseRotation,
  setCachedEververseRotation,
} from "@/lib/eververse/cache";
import { EVERVERSE_DAILY_API_NOTICE } from "@/lib/eververse/constants";
import { fetchEververseRotation } from "@/lib/eververse/fetch-rotation";
import type { EververseVendorDiagnostics } from "@/lib/eververse/fetch-rotation";
import { getNextDailyResetMs } from "@/lib/eververse/reset";
import type { EververseRotation } from "@/types/eververse";

export type EververseRotationResult = {
  rotation: EververseRotation | null;
  source: "cache" | "live" | "none";
  error: string | null;
  apiNotice?: string | null;
  debug?: EververseVendorDiagnostics;
};

export async function loadEververseRotation(
  session: BungieUserSession | null,
  options?: { forceRefresh?: boolean; includeDebug?: boolean },
): Promise<EververseRotationResult> {
  if (options?.forceRefresh) {
    clearCachedEververseRotation();
  }

  const cached = getCachedEververseRotation();
  if (cached && !options?.forceRefresh) {
    return {
      rotation: cached,
      source: "cache",
      error: null,
      apiNotice: cached.apiIncomplete ? EVERVERSE_DAILY_API_NOTICE : null,
    };
  }

  if (!session) {
    return {
      rotation: cached,
      source: cached ? "cache" : "none",
      error: cached
        ? null
        : "Sign in with Bungie to load the current Eververse rotation.",
    };
  }

  try {
    const { rotation, debug } = await fetchEververseRotation(session, {
      includeDebug: options?.includeDebug,
    });
    setCachedEververseRotation(rotation);
    return {
      rotation,
      source: "live",
      error: null,
      apiNotice: rotation.apiIncomplete ? EVERVERSE_DAILY_API_NOTICE : null,
      ...(debug ? { debug } : {}),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Eververse rotation";

    if (cached) {
      return { rotation: cached, source: "cache", error: message };
    }

    return { rotation: null, source: "none", error: message };
  }
}

export function rotationExpiresAtMs(): number {
  return getNextDailyResetMs();
}
