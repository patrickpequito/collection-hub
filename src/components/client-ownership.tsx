"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useProfileInventory } from "@/components/profile-progress-provider";

type OwnershipContextValue = {
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  inventoryError: string | null;
  signedIn: boolean;
};

const OwnershipContext = createContext<OwnershipContextValue>({
  ownedItemHashes: new Set(),
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
  const { ownedItemHashes, showOwnership, inventoryError, signedIn } =
    useProfileInventory();

  const value = useMemo(
    () => ({
      ownedItemHashes,
      showOwnership,
      inventoryError,
      signedIn,
    }),
    [ownedItemHashes, showOwnership, inventoryError, signedIn],
  );

  return (
    <OwnershipContext.Provider value={value}>
      {showSignInHint ? (
        inventoryError ? (
          <p className="mb-4 text-xs text-zinc-500">
            Collection unavailable: {inventoryError}
          </p>
        ) : !signedIn ? (
          <p className="mb-4 text-xs text-amber-200/80">
            Sign in to highlight items you own.
          </p>
        ) : null
      ) : null}
      {children}
    </OwnershipContext.Provider>
  );
}
