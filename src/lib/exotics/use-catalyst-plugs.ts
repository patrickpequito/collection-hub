"use client";

import { useEffect, useState } from "react";
import type { CatalystPlugState } from "@/lib/exotics/catalyst-plugs";
import { useSession } from "@/lib/use-session";

/** Live catalyst plug data for the signed-in account (null until loaded). */
export function useCatalystPlugs(): Record<string, CatalystPlugState> | null {
  const session = useSession();
  const key = session.signedIn ? (session.membershipId ?? "signed-in") : null;
  const [state, setState] = useState<{ key: string; plugs: Record<string, CatalystPlugState> } | null>(null);
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch("/api/exotics/catalysts", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { plugs: Record<string, CatalystPlugState> | null }) => {
        if (!cancelled && payload.plugs) setState({ key, plugs: payload.plugs });
      })
      .catch(() => {
        // Catalysts stay "unknown".
      });
    return () => {
      cancelled = true;
    };
  }, [key]);
  return key && state?.key === key ? state.plugs : null;
}
