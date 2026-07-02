"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { markOAuthPending } from "@/lib/app-navigation-stack";

type BungieLoginButtonProps = {
  configured: boolean;
  variant?: "default" | "compact";
};

export function BungieLoginButton({
  configured,
  variant = "default",
}: BungieLoginButtonProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const returnTo = `${pathname}${search ? `?${search}` : ""}`;
  const loginHref = `/api/auth/bungie?returnTo=${encodeURIComponent(returnTo)}`;

  if (!configured) {
    if (variant === "compact") {
      return (
        <span className="text-xs text-zinc-500">OAuth not configured</span>
      );
    }

    return (
      <button
        type="button"
        disabled
        className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-200 disabled:cursor-not-allowed"
      >
        Configure OAuth in .env.local
      </button>
    );
  }

  const compactClass =
    "inline-flex items-center rounded-lg bg-[#f2721b] px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-[#ff8a3d]";
  const defaultClass =
    "flex w-full items-center justify-center rounded-xl bg-[#f2721b] px-3 py-2 text-sm font-semibold text-black transition hover:bg-[#ff8a3d]";

  return (
    <a
      href={loginHref}
      onClick={() => markOAuthPending()}
      className={variant === "compact" ? compactClass : defaultClass}
    >
      Sign in with Bungie
    </a>
  );
}
