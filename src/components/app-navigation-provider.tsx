"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  finalizeOAuthReturn,
  recordAppNavigation,
} from "@/lib/app-navigation-stack";

function AppNavigationProviderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.toString();

  useEffect(() => {
    const login = searchParams.get("login");
    const error = searchParams.get("error");

    if (login || error) {
      finalizeOAuthReturn(pathname, search);

      const next = new URLSearchParams(searchParams);
      next.delete("login");
      next.delete("error");
      const qs = next.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      return;
    }

    recordAppNavigation(pathname, search);
  }, [pathname, search, searchParams, router]);

  return null;
}

export function AppNavigationProvider() {
  return <AppNavigationProviderInner />;
}
