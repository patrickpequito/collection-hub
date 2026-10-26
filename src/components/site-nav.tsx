"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { markOAuthPending } from "@/lib/app-navigation-stack";
import {
  isNavLinkActive,
  isNavTabActive,
  NAV_TABS,
  type NavTab,
} from "@/lib/navigation";
import { useSession } from "@/lib/use-session";
import siteLogo from "../../public/icon.png";

const TAB_CLASS =
  "inline-flex h-14 items-center px-3 font-display text-[15px] uppercase tracking-[0.14em] transition";

function KeyHint({ children }: { children: string }) {
  return (
    <kbd
      aria-hidden
      className="hidden border border-white/25 px-1.5 py-px font-display text-xs text-ash xl:inline-block"
    >
      {children}
    </kbd>
  );
}

/** Longest matching link wins, so "/activities" doesn't light up next to the Pantheon. */
function activeLinkHref(pathname: string): string | null {
  let best: string | null = null;
  for (const tab of NAV_TABS) {
    for (const group of tab.groups ?? []) {
      for (const link of group.links) {
        if (!link.href || !isNavLinkActive(pathname, link.href)) continue;
        if (!best || link.href.length > best.length) best = link.href;
      }
    }
  }
  return best;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

function NavSearch({
  id,
  className,
  onSubmitted,
}: {
  id: string;
  className?: string;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/all-loot?q=${encodeURIComponent(trimmed)}` : "/all-loot",
    );
    onSubmitted?.();
  };

  return (
    <form role="search" onSubmit={submit} className={className}>
      <label htmlFor={id} className="sr-only">
        Search loot
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search loot…"
        className="h-10 w-full border border-white/20 bg-white/5 px-3 text-sm text-bone placeholder:text-ash focus:border-bone focus:outline-none"
      />
    </form>
  );
}

function AccountControl({ oauthConfigured }: { oauthConfigured: boolean }) {
  const pathname = usePathname();
  const session = useSession();
  // Remember which page the menu was opened on; navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  const menuId = useId();

  if (!session.signedIn) {
    if (!oauthConfigured) return null;
    return (
      <a
        href={`/api/auth/bungie?returnTo=${encodeURIComponent(pathname)}`}
        onClick={() => markOAuthPending()}
        className="inline-flex h-10 items-center bg-bone px-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-void transition hover:bg-white"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-2.5 border border-white/20 pl-1 pr-3 transition hover:border-bone"
      >
        {session.avatarPath ? (
          // eslint-disable-next-line @next/next/no-img-element -- Bungie.net avatar
          <img
            src={`https://www.bungie.net${session.avatarPath}`}
            alt=""
            aria-hidden
            className="h-8 w-8 border border-owned/70 object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="h-8 w-8 border border-owned/70 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.05)_0_2px,transparent_2px_12px)]"
          />
        )}
        <span className="max-w-[8rem] truncate text-sm text-bone">
          {session.displayName || "Guardian"}
        </span>
      </button>
      {open ? (
        <div
          id={menuId}
          className="absolute right-0 top-12 z-50 w-48 border border-hairline bg-[rgb(14_17_22/0.97)] py-1"
        >
          <Link
            href="/profile"
            className="block px-4 py-2.5 text-sm text-bone/80 transition hover:bg-white/5 hover:text-white"
          >
            My profile
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="block w-full px-4 py-2.5 text-left text-sm text-bone/80 transition hover:bg-white/5 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function MenuPanel({
  tab,
  activeHref,
  onNavigate,
}: {
  tab: NavTab;
  activeHref: string | null;
  onNavigate: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-[1360px] flex-wrap gap-10 px-4 py-8 sm:px-6">
      {tab.groups?.map((group) => (
        <div key={group.label} className="min-w-[12rem] flex-1">
          <p className="ui-label mb-3">{group.label}</p>
          <ul className="space-y-1">
            {group.links.map((link) => (
              <li key={link.label}>
                {link.href && !link.comingSoon ? (
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={activeHref === link.href ? "page" : undefined}
                    className={`block py-1.5 text-[15px] transition hover:text-white ${
                      activeHref === link.href ? "text-white" : "text-bone/75"
                    }`}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <span className="block py-1.5 text-[15px] text-ash/60">
                    {link.label} · soon
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

type SiteNavProps = {
  /** Server-side OAuth availability; the sign-in button hides when false. */
  oauthConfigured?: boolean;
};

export function SiteNav({ oauthConfigured = true }: SiteNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  // Menu state is tagged with the page it was opened on, so navigating
  // anywhere closes every menu without a reset effect.
  const [menu, setMenu] = useState<{
    path: string;
    tabId: string | null;
    mobile: boolean;
  }>({ path: pathname, tabId: null, mobile: false });
  const current = menu.path === pathname ? menu : null;
  const openTabId = current?.tabId ?? null;
  const mobileOpen = current?.mobile ?? false;
  const setOpenTabId = (tabId: string | null) =>
    setMenu({ path: pathname, tabId, mobile: false });
  const setMobileOpen = (mobile: boolean) =>
    setMenu({ path: pathname, tabId: null, mobile });
  const navRef = useRef<HTMLElement>(null);
  const activeHref = activeLinkHref(pathname);
  const openTab = NAV_TABS.find((tab) => tab.id === openTabId) ?? null;

  // Close menus on Escape or a click outside the navigation.
  useEffect(() => {
    if (!openTabId && !mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu((value) => ({ ...value, tabId: null, mobile: false }));
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setMenu((value) => ({ ...value, tabId: null }));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openTabId, mobileOpen]);

  // Q / E switch tabs, like the bumpers in the game's menus.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (isTypingTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key !== "q" && key !== "e") return;
      const current = NAV_TABS.findIndex((tab) => isNavTabActive(pathname, tab));
      const step = key === "e" ? 1 : -1;
      const from = current === -1 ? 0 : current;
      const next = (from + step + NAV_TABS.length) % NAV_TABS.length;
      router.push(NAV_TABS[next].href);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, router]);

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className="sticky top-0 z-50 border-b border-hairline bg-[rgb(11_13_16/0.92)] backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-[1360px] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 font-display text-[15px] font-semibold tracking-[0.22em] text-bone/80 transition hover:text-white"
        >
          <Image
            src={siteLogo}
            alt=""
            className="h-6 w-auto opacity-70 transition-opacity group-hover:opacity-100"
            unoptimized
          />
          {/* Just the logo between lg and xl, where the tabs need the room. */}
          <span className="lg:max-xl:sr-only">COLLECTION HUB</span>
        </Link>

        <div className="hidden min-w-0 items-center lg:flex">
          <KeyHint>Q</KeyHint>
          <ul className="flex items-center">
            {NAV_TABS.map((tab) => {
              const active = isNavTabActive(pathname, tab);
              const stateClass = active
                ? "text-white shadow-[inset_0_-2px_0_var(--color-bone)]"
                : "text-ash hover:text-white";
              return (
                <li key={tab.id}>
                  {tab.groups ? (
                    <button
                      type="button"
                      aria-expanded={openTabId === tab.id}
                      onClick={() =>
                        setOpenTabId(openTabId === tab.id ? null : tab.id)
                      }
                      className={`${TAB_CLASS} gap-1.5 ${
                        openTabId === tab.id ? "text-white" : stateClass
                      }`}
                    >
                      {tab.label}
                      <svg
                        viewBox="0 0 10 6"
                        aria-hidden
                        className={`h-1.5 w-2.5 transition ${
                          openTabId === tab.id ? "rotate-180" : ""
                        }`}
                      >
                        <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={tab.href}
                      aria-current={active ? "page" : undefined}
                      className={`${TAB_CLASS} ${stateClass}`}
                    >
                      {tab.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <KeyHint>E</KeyHint>
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-3 lg:flex">
          <NavSearch id="nav-search" className="hidden w-56 xl:block" />
          <Link
            href="/all-loot"
            aria-label="Search loot"
            className="flex h-10 w-10 items-center justify-center border border-white/20 text-bone transition hover:border-bone xl:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4.5 4.5" />
            </svg>
          </Link>
          <AccountControl oauthConfigured={oauthConfigured} />
        </div>

        <button
          type="button"
          className="ml-auto flex h-10 w-10 items-center justify-center border border-white/20 text-bone lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {openTab ? (
        <div className="hidden border-t border-hairline bg-[rgb(14_17_22/0.97)] lg:block">
          <MenuPanel
            tab={openTab}
            activeHref={activeHref}
            onNavigate={() => setOpenTabId(null)}
          />
        </div>
      ) : null}

      {mobileOpen ? (
        <div className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-hairline bg-[rgb(14_17_22/0.98)] lg:hidden">
          <div className="space-y-6 px-4 py-5">
            <NavSearch id="nav-search-mobile" onSubmitted={() => setMobileOpen(false)} />
            {NAV_TABS.map((tab) => (
              <div key={tab.id} className="space-y-2">
                <Link
                  href={tab.href}
                  className={`block font-display text-lg uppercase tracking-[0.14em] ${
                    isNavTabActive(pathname, tab) ? "text-white" : "text-bone/75"
                  }`}
                >
                  {tab.label}
                </Link>
                {tab.groups?.flatMap((group) => group.links)
                  .filter((link) => link.href && !link.comingSoon)
                  .map((link) => (
                    <Link
                      key={link.label}
                      href={link.href!}
                      className={`block border-l border-hairline py-1 pl-3 text-[15px] ${
                        activeHref === link.href ? "text-white" : "text-bone/70"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
              </div>
            ))}
            <div className="flex items-center justify-end gap-3 border-t border-hairline pt-5">
              <AccountControl oauthConfigured={oauthConfigured} />
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
