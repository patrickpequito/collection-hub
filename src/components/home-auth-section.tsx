"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BungieLoginButton } from "@/components/bungie-login-button";
import type { BungieUserSession } from "@/lib/bungie";

const GREY_BUTTON_CLASS =
  "rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-300";

const FLASH_DISMISS_MS = 4000;

type HomeAuthSectionProps = {
  session: BungieUserSession | null;
  oauthConfigured: boolean;
  error?: string;
  loginSuccess?: boolean;
  logoutSuccess?: boolean;
};

export function HomeAuthSection({
  session,
  oauthConfigured,
  error,
  loginSuccess = false,
  logoutSuccess = false,
}: HomeAuthSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLoginSuccess, setShowLoginSuccess] = useState(loginSuccess);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(logoutSuccess);

  useEffect(() => {
    if (!loginSuccess) return;

    setShowLoginSuccess(true);
    const timer = window.setTimeout(() => {
      setShowLoginSuccess(false);
      router.replace(pathname);
    }, FLASH_DISMISS_MS);

    return () => window.clearTimeout(timer);
  }, [loginSuccess, pathname, router]);

  useEffect(() => {
    if (!logoutSuccess) return;

    setShowLogoutSuccess(true);
    const timer = window.setTimeout(() => {
      setShowLogoutSuccess(false);
      router.replace(pathname);
    }, FLASH_DISMISS_MS);

    return () => window.clearTimeout(timer);
  }, [logoutSuccess, pathname, router]);

  return (
    <div className="mt-4 space-y-2">
      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-xs text-red-200">
          Sign-in error: {decodeURIComponent(error)}
        </div>
      ) : null}

      {showLoginSuccess ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2 text-xs text-emerald-200">
          Signed in successfully.
        </div>
      ) : null}

      {showLogoutSuccess ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-950/40 px-2.5 py-2 text-xs text-zinc-300">
          You have signed out.
        </div>
      ) : null}

      {session ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-zinc-500">
            Signed in as{" "}
            <span className="font-medium text-zinc-300">{session.displayName}</span>
          </p>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className={GREY_BUTTON_CLASS}>
              Log out
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <BungieLoginButton configured={oauthConfigured} variant="compact" />
          {!oauthConfigured ? (
            <p className="text-xs text-zinc-500">
              Configure OAuth in{" "}
              <code className="text-zinc-300">.env.local</code> to enable sign-in.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
