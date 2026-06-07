import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { UpdatesPageContent } from "@/components/updates-page-content";

export const metadata = {
  title: "Updates | Destiny 2 Collection Hub",
  description:
    "Version history and release notes for Destiny 2 Collection Hub.",
};

export default function UpdatesPage() {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <SiteNav />

      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <UpdatesPageContent />

        <SiteFooter>
          New releases are added here when a version ships.
        </SiteFooter>
      </div>
    </main>
  );
}
