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

export function NavigationLoadingIndicator() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isInternalNavigationClick(event, pathname)) {
        setLoading(true);
      }
    };

    const handlePopState = () => {
      setLoading(true);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname]);

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
