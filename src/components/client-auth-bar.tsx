"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { HistoryBackButton } from "@/components/history-back-button";
import { BungieLoginButton } from "@/components/bungie-login-button";

const GREY_BUTTON_CLASS =
  "rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-300";

type BackLinkConfig =
  | {
      href: string;
      label: string;
      useHistory?: false;
    }
  | {
      label: string;
      useHistory: true;
      fallbackHref: string;
    };

type ClientAuthBarProps = {
  oauthConfigured: boolean;
  backLink?: BackLinkConfig;
};

export function ClientAuthBar({
  oauthConfigured,
  backLink,
}: ClientAuthBarProps) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { signedIn?: boolean }) => {
        if (!cancelled) setSignedIn(Boolean(payload.signedIn));
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="min-w-0">
          {backLink ? (
            backLink.useHistory ? (
              <Suspense
                fallback={
                  <span className={GREY_BUTTON_CLASS}>{backLink.label}</span>
                }
              >
                <HistoryBackButton
                  label={backLink.label}
                  fallbackHref={backLink.fallbackHref}
                />
              </Suspense>
            ) : (
              <Link href={backLink.href} className={GREY_BUTTON_CLASS}>
                {backLink.label}
              </Link>
            )
          ) : null}
        </div>

        <div className="shrink-0">
          {signedIn === null ? (
            <span className="text-xs text-zinc-600">…</span>
          ) : signedIn ? (
            <form action="/api/auth/logout" method="post">
              <button type="submit" className={GREY_BUTTON_CLASS}>
                Log out
              </button>
            </form>
          ) : (
            <Suspense
              fallback={
                <span className="text-xs text-zinc-500">Sign in…</span>
              }
            >
              <BungieLoginButton configured={oauthConfigured} variant="compact" />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
