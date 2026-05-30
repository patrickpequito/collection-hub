const DEFAULT_RETURN_TO = "/";

/** Same-origin relative path only — blocks open redirects. */
export function sanitizeReturnTo(input: string | null | undefined): string {
  if (!input) return DEFAULT_RETURN_TO;
  if (!input.startsWith("/") || input.startsWith("//")) return DEFAULT_RETURN_TO;
  if (input.startsWith("/api/auth")) return DEFAULT_RETURN_TO;

  try {
    const { pathname, search } = new URL(input, "http://local");
    return `${pathname}${search}`;
  } catch {
    return DEFAULT_RETURN_TO;
  }
}

export function appendQueryParam(path: string, key: string, value: string): string {
  const url = new URL(path, "http://local");
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}
