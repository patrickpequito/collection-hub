"use client";

import { useEffect, useState } from "react";
import { clearProfileCache } from "@/lib/profile-cache";

const SESSION_HINT_KEY = "d2-collector:session-hint:v1";

type SessionHint = {
  signedIn: boolean;
  membershipId: string | null;
  displayName: string | null;
  /** Bungie.net profile picture path. */
  avatarPath: string | null;
};

type SessionState = SessionHint & {
  ready: boolean;
};

function readSessionHint(): SessionHint {
  if (typeof window === "undefined") {
    return { signedIn: false, membershipId: null, displayName: null, avatarPath: null };
  }

  try {
    const raw = sessionStorage.getItem(SESSION_HINT_KEY);
    if (!raw) {
      return { signedIn: false, membershipId: null, displayName: null, avatarPath: null };
    }
    const parsed = JSON.parse(raw) as SessionHint;
    return {
      signedIn: Boolean(parsed.signedIn),
      membershipId: parsed.membershipId ?? null,
      displayName: parsed.displayName ?? null,
      avatarPath: parsed.avatarPath ?? null,
    };
  } catch {
    return { signedIn: false, membershipId: null, displayName: null, avatarPath: null };
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

const SIGNED_OUT: SessionState = {
  signedIn: false,
  membershipId: null,
  displayName: null,
  avatarPath: null,
  ready: false,
};

export function useSession(): SessionState {
  // Start signed out on both server and client so hydration matches; the
  // sessionStorage hint is applied right after mount, then the API confirms.
  const [session, setSession] = useState<SessionState>(SIGNED_OUT);

  useEffect(() => {
    let cancelled = false;
    const hint = readSessionHint();
    if (hint.signedIn) {
      void Promise.resolve().then(() => {
        if (!cancelled) {
          setSession((current) =>
            current.ready ? current : { ...hint, ready: false },
          );
        }
      });
    }

    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then(
        (payload: {
          signedIn?: boolean;
          membershipId?: string | null;
          displayName?: string | null;
          avatarPath?: string | null;
        }) => {
          if (cancelled) return;

          const next: SessionHint = {
            signedIn: Boolean(payload.signedIn),
            membershipId: payload.membershipId ?? null,
            displayName: payload.displayName ?? null,
            avatarPath: payload.avatarPath ?? null,
          };

          if (!next.signedIn) {
            clearProfileCache();
            writeSessionHint({
              signedIn: false,
              membershipId: null,
              displayName: null,
              avatarPath: null,
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
            avatarPath: null,
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
