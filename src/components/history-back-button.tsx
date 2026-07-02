"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getBackNavigationTarget } from "@/lib/app-navigation-stack";

const GREY_BUTTON_CLASS =
  "rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-300";

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
