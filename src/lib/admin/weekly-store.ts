/**
 * Admin weekly overrides in Upstash Redis (REST API, same store as pinned titles):
 * - admin:week:<weekIndex> — what the owner picked for that week (featured raids/dungeons,
 *   destination rotations). Wins over the automatic sources until the next reset.
 * - admin:rotation-history — every confirmed rotation value by week, so the site can learn
 *   each rotation's cycle (see lib/destinations/rotation-learning).
 * Reads are cached under the "admin-week" tag; saving updates the tag.
 */

export const ADMIN_WEEK_TAG = "admin-week";

export type AdminWeekOverride = {
  featuredRaids?: string[];
  featuredDungeons?: string[];
  /** rotation key ("europa:Empire Hunt") → value name. */
  rotations?: Record<string, string>;
};

/** rotation key → { weekIndex → value name }. */
export type RotationHistory = Record<string, Record<string, string>>;

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

const weekKey = (weekIndex: number) => `admin:week:${weekIndex}`;
const HISTORY_KEY = "admin:rotation-history";

async function readJson<T>(key: string): Promise<T | null> {
  const config = redisConfig();
  if (!config) return null;
  try {
    const response = await fetch(`${config.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${config.token}` },
      next: { revalidate: 3600, tags: [ADMIN_WEEK_TAG] },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { result: string | null };
    return payload.result ? (JSON.parse(payload.result) as T) : null;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  const config = redisConfig();
  if (!config) throw new Error("Upstash is not configured");
  const response = await fetch(`${config.url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}` },
    body: JSON.stringify(value),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Upstash error (${response.status})`);
}

export function readWeekOverride(weekIndex: number): Promise<AdminWeekOverride | null> {
  return readJson<AdminWeekOverride>(weekKey(weekIndex));
}

export async function readRotationHistory(): Promise<RotationHistory> {
  return (await readJson<RotationHistory>(HISTORY_KEY)) ?? {};
}

/** Saves the week's picks and records the confirmed rotation values in the history. */
export async function saveWeek(weekIndex: number, override: AdminWeekOverride, confirmedKeys: string[]): Promise<void> {
  await writeJson(weekKey(weekIndex), override);
  const history = await readRotationHistory();
  for (const key of confirmedKeys) {
    const value = override.rotations?.[key];
    if (!value) continue;
    history[key] = { ...(history[key] ?? {}), [String(weekIndex)]: value };
  }
  await writeJson(HISTORY_KEY, history);
}

/** Clears the week's picks (history is kept). */
export async function clearWeek(weekIndex: number): Promise<void> {
  await writeJson(weekKey(weekIndex), {});
}

/** Bungie.net membership ids allowed in /admin (env ADMIN_MEMBERSHIP_IDS, comma separated). */
export function isAdminMembership(membershipId: string | null | undefined): boolean {
  if (!membershipId) return false;
  const allowed = (process.env.ADMIN_MEMBERSHIP_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return allowed.includes(membershipId);
}
