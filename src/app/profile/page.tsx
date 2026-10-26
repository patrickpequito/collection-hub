import type { Metadata } from "next";
import { GuardianProfileBody, ProfileDataProvider, ProfileHeader } from "@/components/profile/guardian-profile";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Guardian profile | Destiny 2 Collection Hub",
  description: "Your Destiny 2 time played, favorites, raid and dungeon clears, combat record and collection progress.",
};

export default function ProfilePage() {
  return (
    <ProfileDataProvider>
      <SectionPageLayout
        title="Guardian profile"
        showHeader={false}
        headerSlot={<ProfileHeader />}
        showBreadcrumbs={false}
        oauthConfigured={isBungieOAuthConfigured()}
        maxWidth="5xl"
      >
        <GuardianProfileBody />
      </SectionPageLayout>
    </ProfileDataProvider>
  );
}
