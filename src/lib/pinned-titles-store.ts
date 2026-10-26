/**
 * Pinned titles in Upstash Redis (REST API, no SDK), keyed by Bungie membership.
 * Works with Upstash's own env names or the Vercel Marketplace ones (KV_REST_API_*).
 */

const MAX_PINS = 3;

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export function isPinStorageConfigured(): boolean {
  return redisConfig() !== null;
}

const pinsKey = (membershipId: string) => `pins:titles:${membershipId}`;

export async function readPinnedTitles(membershipId: string): Promise<string[]> {
  const config = redisConfig();
  if (!config) return [];
  const response = await fetch(`${config.url}/get/${encodeURIComponent(pinsKey(membershipId))}`, {
    headers: { Authorization: `Bearer ${config.token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Pin storage error (${response.status})`);
  const payload = (await response.json()) as { result: string | null };
  if (!payload.result) return [];
  try {
    const parsed = JSON.parse(payload.result) as unknown;
    return Array.isArray(parsed) ? parsed.filter((slug): slug is string => typeof slug === "string") : [];
  } catch {
    return [];
  }
}

export async function writePinnedTitles(membershipId: string, slugs: string[]): Promise<void> {
  const config = redisConfig();
  if (!config) throw new Error("Pin storage is not configured");
  const response = await fetch(`${config.url}/set/${encodeURIComponent(pinsKey(membershipId))}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}` },
    body: JSON.stringify(slugs.slice(-MAX_PINS)),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Pin storage error (${response.status})`);
}

export { MAX_PINS };
