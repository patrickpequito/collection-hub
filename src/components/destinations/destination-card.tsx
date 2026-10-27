import Link from "@/components/app-link";
import type { ReactNode } from "react";
import { bungieIconUrl } from "@/lib/bungie-icon";

/** Destination card: art with icon, era and name; progress band underneath. */
export function DestinationCard({
  href,
  name,
  era,
  imageUrl,
  iconPath,
  size,
  chip,
  children,
}: {
  href?: string;
  name: string;
  era: string;
  imageUrl: string;
  iconPath: string | null;
  size: "lg" | "md";
  chip?: string | null;
  children: ReactNode;
}) {
  const body = (
    <>
      <span className={`relative block overflow-hidden ${size === "lg" ? "h-[260px]" : "h-[210px]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent from-45% to-void/95" />
        {chip ? (
          <span className="absolute right-3 top-3 border border-white/30 bg-void/70 px-1.5 py-px font-display text-[11px] uppercase tracking-[0.14em] text-[#c7cad0]">
            {chip}
          </span>
        ) : null}
        <span className="absolute inset-x-4 bottom-3 flex items-center gap-0.5">
          {iconPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bungieIconUrl(iconPath)} alt="" width={38} height={38} className="size-[38px] shrink-0 object-contain" />
          ) : null}
          <span className="min-w-0">
            <span className="ui-label text-on-art block text-[11px]! text-[#c7cad0]!">{era}</span>
            <span
              className={`text-on-art block font-display font-semibold uppercase leading-tight tracking-[0.06em] text-bone ${
                size === "lg" ? "text-[26px]" : "text-[22px]"
              }`}
            >
              {name}
            </span>
          </span>
        </span>
      </span>
      <span className="flex min-h-[80px] flex-col justify-center gap-1.5 bg-panel/90 px-4 py-3 [&>*]:mt-0">{children}</span>
    </>
  );
  const className = `group relative flex flex-col overflow-hidden border border-white/[0.18] transition ${
    href ? "hover:border-bone" : ""
  }`;
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
