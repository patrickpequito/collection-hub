"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getBackNavigationTarget } from "@/lib/app-navigation-stack";

const GREY_BUTTON_CLASS =
  "inline-flex h-9 items-center border border-white/20 px-3 font-display text-xs uppercase tracking-[0.14em] text-ash transition hover:border-bone hover:text-bone";

type HistoryBackButtonProps = {
  label: string;
  fallbackHref: string;
};

function HistoryBackButtonInner({
  label,
  fallbackHref,
}: HistoryBackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <button
      type="button"
      className={GREY_BUTTON_CLASS}
      onClick={() => {
        const target = getBackNavigationTarget(
          pathname,
          searchParams.toString(),
        );
        router.push(target ?? fallbackHref);
      }}
    >
      {label}
    </button>
  );
}

export function HistoryBackButton(props: HistoryBackButtonProps) {
  return <HistoryBackButtonInner {...props} />;
}
