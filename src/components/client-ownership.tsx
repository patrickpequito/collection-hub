"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useOwnedItemHashes } from "@/lib/use-owned-item-hashes";
import { useSignedIn } from "@/lib/use-signed-in";

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

/** Hydrates collection ownership on the client so pages stay statically cacheable. */
export function ClientOwnership({
  children,
  showSignInHint = true,
}: ClientOwnershipProps) {
  const signedIn = useSignedIn();
  const { itemHashes, error } = useOwnedItemHashes(signedIn);
  const ownedItemHashes = useMemo(() => new Set(itemHashes), [itemHashes]);
  const showOwnership = signedIn && !error;

  const value = useMemo(
    () => ({
      ownedItemHashes,
      showOwnership,
      inventoryError: error,
      signedIn,
    }),
    [ownedItemHashes, showOwnership, error, signedIn],
  );

  return (
    <OwnershipContext.Provider value={value}>
      {showSignInHint ? (
        error ? (
          <p className="mb-4 text-xs text-zinc-500">
            Collection unavailable: {error}
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
