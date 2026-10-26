"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useProfileInventory } from "@/components/profile-progress-provider";
import { useHydrated } from "@/lib/use-hydrated";

type OwnershipContextValue = {
  ownedItemHashes: Set<string>;
  /** Only what is on your characters / in the vault right now. */
  inventoryItemHashes: Set<string>;
  showOwnership: boolean;
  inventoryError: string | null;
  signedIn: boolean;
};

const OwnershipContext = createContext<OwnershipContextValue>({
  ownedItemHashes: new Set(),
  inventoryItemHashes: new Set(),
  showOwnership: false,
  inventoryError: null,
  signedIn: false,
});

export function useOwnership(): OwnershipContextValue {
  return useContext(OwnershipContext);
}

type ClientOwnershipProps = {
  children: ReactNode;
  showSignInHint?: boolean;
};

/** Optional sign-in hint wrapper; inventory lives in ProfileProgressProvider. */
export function ClientOwnership({
  children,
  showSignInHint = true,
}: ClientOwnershipProps) {
  const { ownedItemHashes, inventoryItemHashes, showOwnership, inventoryError, signedIn } =
    useProfileInventory();
  // Page content hydrates after the root layout has restored the session, so
  // render the hint as the server did (signed out) until hydration finishes.
  const hydrated = useHydrated();

  const value = useMemo(
    () => ({
      ownedItemHashes,
      inventoryItemHashes,
      showOwnership,
      inventoryError,
      signedIn,
    }),
    [ownedItemHashes, inventoryItemHashes, showOwnership, inventoryError, signedIn],
  );

  return (
    <OwnershipContext.Provider value={value}>
      {showSignInHint ? (
        hydrated && inventoryError ? (
          <p className="mb-4 text-xs text-zinc-500">
            Collection unavailable: {inventoryError}
          </p>
        ) : !(hydrated && signedIn) ? (
          <p className="mb-4 text-xs text-amber-200/80">
            Sign in to highlight items you own.
          </p>
        ) : null
      ) : null}
      {children}
    </OwnershipContext.Provider>
  );
}
