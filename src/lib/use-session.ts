"use client";

import { useEffect, useState } from "react";
import { clearProfileCache } from "@/lib/profile-cache";

const SESSION_HINT_KEY = "d2-collector:session-hint:v1";

type SessionHint = {
  signedIn: boolean;
  membershipId: string | null;
  displayName: string | null;
};

type SessionState = SessionHint & {
  ready: boolean;
};

function readSessionHint(): SessionHint {
  if (typeof window === "undefined") {
    return { signedIn: false, membershipId: null, displayName: null };
  }

  try {
    const raw = sessionStorage.getItem(SESSION_HINT_KEY);
    if (!raw) {
      return { signedIn: false, membershipId: null, displayName: null };
    }
    const parsed = JSON.parse(raw) as SessionHint;
    return {
      signedIn: Boolean(parsed.signedIn),
      membershipId: parsed.membershipId ?? null,
      displayName: parsed.displayName ?? null,
    };
  } catch {
    return { signedIn: false, membershipId: null, displayName: null };
  }
}

function writeSessionHint(hint: SessionHint): void {
  if (typeof window === "undefined") return;

  try {
    if (!hint.signedIn) {
      sessionStorage.removeItem(SESSION_HINT_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_HINT_KEY, JSON.stringify(hint));
  } catch {
    // Optional hint — ignore storage failures.
  }
}

export function useSession(): SessionState {
  const [session, setSession] = useState<SessionState>(() => ({
    ...readSessionHint(),
    ready: false,
  }));

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then(
        (payload: {
          signedIn?: boolean;
          membershipId?: string | null;
          displayName?: string | null;
        }) => {
          if (cancelled) return;

          const next: SessionHint = {
            signedIn: Boolean(payload.signedIn),
            membershipId: payload.membershipId ?? null,
            displayName: payload.displayName ?? null,
          };

          if (!next.signedIn) {
            clearProfileCache();
            writeSessionHint({
              signedIn: false,
              membershipId: null,
              displayName: null,
            });
          } else {
            writeSessionHint(next);
          }

          setSession({ ...next, ready: true });
        },
      )
      .catch(() => {
        if (!cancelled) {
          setSession({
            signedIn: false,
            membershipId: null,
            displayName: null,
            ready: true,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return session;
}

/** @deprecated Prefer useSession().signedIn */
export function useSignedIn(): boolean {
  return useSession().signedIn;
}
