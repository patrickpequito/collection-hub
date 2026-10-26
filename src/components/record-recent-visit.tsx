"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { recentVisitKind, recordRecentVisit } from "@/lib/recent-visits";

type RecordRecentVisitProps = {
  title: string;
  imageUrl?: string;
};

/** Remembers this page for the home "Jump back in" block. Renders nothing. */
export function RecordRecentVisit({ title, imageUrl }: RecordRecentVisitProps) {
  const pathname = usePathname();

  useEffect(() => {
    const kind = recentVisitKind(pathname);
    if (!kind || !title) return;
    recordRecentVisit({ href: pathname, title, kind, imageUrl });
  }, [pathname, title, imageUrl]);

  return null;
}
