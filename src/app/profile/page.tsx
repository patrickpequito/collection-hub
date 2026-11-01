import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { GuardianProfileBody, ProfileDataProvider, ProfileHeader } from "@/components/profile/guardian-profile";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";

export const metadata: Metadata = pageMetadata(
  "/profile",
  "Guardian profile · Destiny 2",
  "Your Destiny 2 time played, favorites, raid and dungeon clears, combat record and collection progress.", { noindex: true },
);

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
