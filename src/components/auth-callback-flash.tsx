"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const FLASH_DISMISS_MS = 4000;

export function AuthCallbackFlash() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const loginSuccess = searchParams.get("login") === "success";
  const logoutSuccess = searchParams.get("logout") === "success";
  const [visible, setVisible] = useState(Boolean(error || loginSuccess || logoutSuccess));

  useEffect(() => {
    if (!error && !loginSuccess && !logoutSuccess) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      const next = new URLSearchParams(searchParams.toString());
      next.delete("error");
      next.delete("login");
      next.delete("logout");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, FLASH_DISMISS_MS);

    return () => window.clearTimeout(timer);
  }, [error, loginSuccess, logoutSuccess, pathname, router, searchParams]);

  if (!visible) return null;

  if (error) {
    return (
      <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-center text-xs text-red-200 sm:px-6">
        Sign-in error: {decodeURIComponent(error)}
      </div>
    );
  }

  if (loginSuccess) {
    return (
      <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-center text-xs text-emerald-200 sm:px-6">
        Signed in successfully.
      </div>
    );
  }

  if (logoutSuccess) {
    return (
      <div className="border-b border-zinc-800 bg-zinc-950/40 px-4 py-2 text-center text-xs text-zinc-300 sm:px-6">
        You have signed out.
      </div>
    );
  }

  return null;
}
