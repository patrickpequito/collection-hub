"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getBackNavigationTarget } from "@/lib/app-navigation-stack";
import { backLabelForPath, parseAppReturnPath } from "@/lib/weapons/paths";

const GREY_BUTTON_CLASS =
  "inline-flex h-9 items-center border border-white/20 px-3 font-display text-xs uppercase tracking-[0.14em] text-ash transition hover:border-bone hover:text-bone";

type HistoryBackButtonProps = {
  label: string;
  fallbackHref: string;
  /** Take the fallback (and its label) from a `?from=` path when present. */
  fromQuery?: boolean;
};

function HistoryBackButtonInner({
  label,
  fallbackHref,
  fromQuery = false,
}: HistoryBackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = fromQuery ? searchParams.get("from") ?? undefined : undefined;
  const fallback = from ? parseAppReturnPath(from, fallbackHref) : fallbackHref;
  const buttonLabel = fallback === fallbackHref ? label : backLabelForPath(fallback);

  return (
    <button
      type="button"
      className={GREY_BUTTON_CLASS}
      onClick={() => {
        const target = getBackNavigationTarget(
          pathname,
          searchParams.toString(),
        );
        router.push(target ?? fallback);
      }}
    >
      {buttonLabel}
    </button>
  );
}

export function HistoryBackButton(props: HistoryBackButtonProps) {
  return <HistoryBackButtonInner {...props} />;
}
