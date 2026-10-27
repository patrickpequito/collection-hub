import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * next/link that prefetches on hover / touch instead of as soon as the link scrolls
 * into view. Pages here show dozens to hundreds of item links, and viewport prefetching
 * turned every visit (and every crawler pass) into a burst of CDN requests.
 */
export default function AppLink({ prefetch = false, ...props }: ComponentProps<typeof Link>) {
  return <Link prefetch={prefetch} {...props} />;
}
