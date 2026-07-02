const STACK_KEY = "d2-collector-nav-stack";
const OAUTH_PENDING_KEY = "d2-collector-oauth-pending";
const MAX_STACK = 30;

export function isAuthNavigationPath(path: string): boolean {
  try {
    const { pathname } = new URL(path, "http://local");
    return pathname.startsWith("/api/auth");
  } catch {
    return true;
  }
}

export function normalizeAppPath(pathname: string, search = ""): string {
  const url = new URL(
    `${pathname}${search.startsWith("?") || !search ? search : `?${search}`}`,
    "http://local",
  );
  url.searchParams.delete("login");
  url.searchParams.delete("error");
  const qs = url.searchParams.toString();
  return `${url.pathname}${qs ? `?${qs}` : ""}`;
}

function readStack(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STACK_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

function writeStack(stack: string[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-MAX_STACK)));
}

export function markOAuthPending() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(OAUTH_PENDING_KEY, "1");
}

export function recordAppNavigation(pathname: string, search = "") {
  if (typeof window === "undefined") return;

  const path = normalizeAppPath(pathname, search);
  if (isAuthNavigationPath(path)) return;

  const stack = readStack();
  if (stack[stack.length - 1] === path) return;

  stack.push(path);
  writeStack(stack);
}

export function finalizeOAuthReturn(pathname: string, search = "") {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(OAUTH_PENDING_KEY) !== "1") return;

  sessionStorage.removeItem(OAUTH_PENDING_KEY);

  const path = normalizeAppPath(pathname, search);
  const stack = readStack();

  while (stack.length > 0 && stack[stack.length - 1] === path) {
    stack.pop();
  }

  stack.push(path);
  writeStack(stack);
}

/** Previous in-app destination for the custom back button, if any. */
export function getBackNavigationTarget(
  pathname: string,
  search = "",
): string | null {
  if (typeof window === "undefined") return null;

  const current = normalizeAppPath(pathname, search);
  const stack = readStack();

  if (stack.length > 0 && stack[stack.length - 1] === current) {
    stack.pop();
  }

  const target = stack.length > 0 ? stack[stack.length - 1] : null;
  writeStack(stack);
  return target;
}
