"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatResetCountdown, getNextDailyResetMs } from "@/lib/eververse/reset";

export function EververseResetCountdown() {
  const router = useRouter();
  const [remainingMs, setRemainingMs] = useState(
    () => Math.max(0, getNextDailyResetMs() - Date.now()),
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const tick = () => {
      const target = getNextDailyResetMs();
      const remaining = Math.max(0, target - Date.now());
      setRemainingMs(remaining);

      if (remaining === 0 && !refreshing) {
        setRefreshing(true);
        fetch("/api/eververse/rotation?refresh=1")
          .then((response) => response.json())
          .then(() => {
            router.refresh();
          })
          .catch(() => {
            router.refresh();
          })
          .finally(() => {
            setRefreshing(false);
          });
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [refreshing, router]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Next daily reset
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">
            {refreshing ? "Updating…" : formatResetCountdown(remainingMs)}
          </p>
        </div>
      </div>
    </div>
  );
}
