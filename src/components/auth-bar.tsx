import Link from "next/link";
import { Suspense } from "react";
import { HistoryBackButton } from "@/components/history-back-button";
import { BungieLoginButton } from "@/components/bungie-login-button";
import type { BungieUserSession } from "@/lib/bungie";

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

type AuthBarProps = {
  session: BungieUserSession | null;
  oauthConfigured: boolean;
  backLink?: BackLinkConfig;
};

export function AuthBar({ session, oauthConfigured, backLink }: AuthBarProps) {
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
          {session ? (
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
