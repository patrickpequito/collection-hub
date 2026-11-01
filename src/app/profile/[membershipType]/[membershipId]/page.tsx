import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { GuardianProfileBody, ProfileDataProvider, ProfileHeader } from "@/components/profile/guardian-profile";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";

type GuardianPageProps = {
  params: Promise<{ membershipType: string; membershipId: string }>;
};

export const metadata: Metadata = pageMetadata(
  "/profile",
  "Guardian · Destiny 2",
  "A guardian's Destiny 2 time played, favorites, clears, combat record and collection progress.", { noindex: true },
);

/** Someone else's public profile (what their Bungie privacy settings allow). */
export default async function GuardianPage({ params }: GuardianPageProps) {
  const { membershipType, membershipId } = await params;
  if (!/^\d{1,3}$/.test(membershipType) || !/^\d{5,25}$/.test(membershipId)) notFound();

  return (
    <ProfileDataProvider guardian={{ membershipType: Number(membershipType), membershipId }}>
      <SectionPageLayout
        title="Guardian"
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
