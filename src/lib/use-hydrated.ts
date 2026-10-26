"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False while React hydrates server HTML, true afterwards. Use it to render
 * session-dependent markup exactly like the server did during hydration.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
