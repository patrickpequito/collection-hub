"use client";

import { useRouter } from "next/navigation";

const GREY_BUTTON_CLASS =
  "rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-300";

type HistoryBackButtonProps = {
  label: string;
  fallbackHref: string;
};

export function HistoryBackButton({
  label,
  fallbackHref,
}: HistoryBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={GREY_BUTTON_CLASS}
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallbackHref);
      }}
    >
      {label}
    </button>
  );
}
