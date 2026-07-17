"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BungieLoginButton } from "@/components/bungie-login-button";

const GREY_BUTTON_CLASS =
  "rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-300";

const FLASH_DISMISS_MS = 4000;

type HomeAuthSectionProps = {
  oauthConfigured: boolean;
};

function HomeAuthSectionInner({ oauthConfigured }: HomeAuthSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? undefined;
  const loginSuccess = searchParams.get("login") === "success";
  const logoutSuccess = searchParams.get("logout") === "success";

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [showLoginSuccess, setShowLoginSuccess] = useState(loginSuccess);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(logoutSuccess);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { signedIn?: boolean; displayName?: string | null }) => {
        if (cancelled) return;
        setSignedIn(Boolean(payload.signedIn));
        setDisplayName(payload.displayName ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setSignedIn(false);
          setDisplayName(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

      {signedIn === null ? (
        <p className="text-xs text-zinc-600">Checking sign-in…</p>
      ) : signedIn ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-zinc-500">
            Signed in as{" "}
            <span className="font-medium text-zinc-300">
              {displayName ?? "Guardian"}
            </span>
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
              <code className="text-zinc-300">.env.local</code> to enable
              sign-in.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function HomeAuthSection(props: HomeAuthSectionProps) {
  return (
    <Suspense fallback={<p className="mt-4 text-xs text-zinc-600">…</p>}>
      <HomeAuthSectionInner {...props} />
    </Suspense>
  );
}
