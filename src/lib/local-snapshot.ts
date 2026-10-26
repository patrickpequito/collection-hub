/**
 * Last good copy of a signed-in API response, kept in the browser so a page can show it
 * instantly and refresh from Bungie in the background (stale-while-revalidate).
 * Bump the version when a response shape changes so old copies are ignored.
 */
const PREFIX = "d2-collector:snapshot:v1:";

type Stored<T> = { savedAt: number; data: T };

function storage(kind: "local" | "session"): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readSnapshot<T>(key: string, kind: "local" | "session" = "local"): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = storage(kind)?.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as Stored<T>).data : null;
  } catch {
    return null;
  }
}

export function writeSnapshot<T>(key: string, data: T, kind: "local" | "session" = "local") {
  if (typeof window === "undefined") return;
  try {
    storage(kind)?.setItem(PREFIX + key, JSON.stringify({ savedAt: Date.now(), data } satisfies Stored<T>));
  } catch {
    // Storage full or blocked: the page simply loads from Bungie next time.
  }
}
