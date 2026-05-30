"use client";

import { usePathname } from "next/navigation";

type BungieLoginButtonProps = {
  configured: boolean;
  variant?: "default" | "compact";
};

export function BungieLoginButton({
  configured,
  variant = "default",
}: BungieLoginButtonProps) {
  const pathname = usePathname();
  const loginHref = `/api/auth/bungie?returnTo=${encodeURIComponent(pathname)}`;

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
      className={variant === "compact" ? compactClass : defaultClass}
    >
      Sign in with Bungie
    </a>
  );
}
