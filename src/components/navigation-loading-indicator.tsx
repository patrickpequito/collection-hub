"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

function isInternalNavigationClick(event: MouseEvent, pathname: string): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const target = event.target;
  if (!(target instanceof Element)) return false;

  const anchor = target.closest("a");
  if (!anchor) return false;
  if (anchor.target === "_blank") return false;
  if (anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) return false;

  const currentSearch = window.location.search;
  return url.pathname !== pathname || url.search !== currentSearch;
}

/** Never leave the overlay up longer than this, whatever happened to the navigation. */
const MAX_OVERLAY_MS = 10_000;

export function NavigationLoadingIndicator() {
  const pathname = usePathname();
  // Tagged with the page (and full URL) it started on: arriving anywhere else clears it.
  const [loadingFrom, setLoadingFrom] = useState<{ pathname: string; href: string } | null>(null);
  const loading = loadingFrom?.pathname === pathname;

  useEffect(() => {
    const start = () => setLoadingFrom({ pathname, href: window.location.href });
    const handleClick = (event: MouseEvent) => {
      if (isInternalNavigationClick(event, pathname)) start();
    };

    // Jumping to a #section also fires popstate: only show the overlay when
    // back / forward actually lands on another page.
    const handlePopState = () => {
      if (window.location.pathname !== pathname) start();
    };

    // Back from another site (e.g. Bungie sign-in) restores this page from the
    // browser cache with the overlay still up.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setLoadingFrom(null);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pathname]);

  // Same page, new ?query (the pathname doesn't change): clear once the URL moves,
  // and give up after MAX_OVERLAY_MS in any case.
  useEffect(() => {
    if (!loading || !loadingFrom) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (window.location.href !== loadingFrom.href || Date.now() - startedAt > MAX_OVERLAY_MS) {
        setLoadingFrom(null);
      }
    }, 150);
    return () => window.clearInterval(timer);
  }, [loading, loadingFrom]);

  if (!loading) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="sm" label="Loading page" />
      </div>
    </div>
  );
}
