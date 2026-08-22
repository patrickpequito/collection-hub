"use client";

import { ProfileProgressProvider } from "@/components/profile-progress-provider";
import { useSession } from "@/lib/use-session";

type ProfileBootstrapProps = {
  children: React.ReactNode;
};

/** Keeps profile progress + local cache alive across client navigations. */
export function ProfileBootstrap({ children }: ProfileBootstrapProps) {
  const { signedIn, membershipId } = useSession();

  return (
    <ProfileProgressProvider signedIn={signedIn} membershipId={membershipId}>
      {children}
    </ProfileProgressProvider>
  );
}
