/**
 * Activities launchable this week, read from a public profile's character
 * activities (same probe profile as the Pale Heart Pathfinder). Used to mark
 * which rotating seasonal activity (e.g. Plunder expeditions) is active.
 */

const PROBE_PROFILE = "/Platform/Destiny2/3/Profile/4611686018473121985/?components=204";

export async function loadAvailableActivityHashes(): Promise<Set<string>> {
  const apiKey = process.env.BUNGIE_API_KEY?.trim();
  if (!apiKey) return new Set();
  try {
    const response = await fetch(`https://www.bungie.net${PROBE_PROFILE}`, {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return new Set();
    const payload = (await response.json()) as {
      Response?: {
        characterActivities?: {
          data?: Record<string, { availableActivities?: { activityHash: number }[] }>;
        };
      };
    };
    const hashes = new Set<string>();
    for (const character of Object.values(payload.Response?.characterActivities?.data ?? {})) {
      for (const activity of character.availableActivities ?? []) hashes.add(String(activity.activityHash));
    }
    return hashes;
  } catch {
    return new Set();
  }
}
