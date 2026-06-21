"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LootNavMenu } from "@/components/loot-nav-menu";
import { isNavItemActive, NAV_ITEMS, type NavItem } from "@/lib/navigation";

function navLinkClassName(active: boolean, variant: "desktop" | "mobile") {
  if (variant === "desktop") {
    return `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      active
        ? "bg-zinc-800 text-zinc-100"
        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
    }`;
  }

  return `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    active
      ? "bg-zinc-800 text-zinc-100"
      : "text-zinc-300 hover:bg-zinc-900"
  }`;
}

function NavLink({
  item,
  pathname,
  variant,
}: {
  item: NavItem;
  pathname: string;
  variant: "desktop" | "mobile";
}) {
  const active = isNavItemActive(pathname, item);

  return (
    <Link href={item.href} className={navLinkClassName(active, variant)}>
      {item.label}
    </Link>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const homeItem = NAV_ITEMS.find((item) => item.href === "/");
  const menuItems = NAV_ITEMS.filter((item) => item.href !== "/");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-zinc-800/80 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium tracking-[0.2em] text-zinc-400 transition hover:text-zinc-200"
          >
            <Image
              src="/icon.png"
              alt=""
              width={12}
              height={12}
              className="h-[1em] w-[1em] shrink-0 opacity-60"
              unoptimized
            />
            COLLECTION HUB
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {homeItem ? (
              <li>
                <NavLink item={homeItem} pathname={pathname} variant="desktop" />
              </li>
            ) : null}
            <LootNavMenu variant="desktop" />
            {menuItems.map((item) => (
              <li key={item.href}>
                <NavLink item={item} pathname={pathname} variant="desktop" />
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-zinc-900 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Menu</span>
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div className="fixed inset-0 top-12 z-40 flex flex-col md:hidden">
          <div className="shrink-0 border-b border-zinc-800/80 bg-black/50 px-4 py-3 shadow-xl backdrop-blur-md">
            <ul className="space-y-1">
              {homeItem ? (
                <li>
                  <NavLink item={homeItem} pathname={pathname} variant="mobile" />
                </li>
              ) : null}
              <LootNavMenu
                variant="mobile"
                onNavigate={() => setMenuOpen(false)}
              />
              {menuItems.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} pathname={pathname} variant="mobile" />
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="min-h-0 flex-1 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
        </div>
      ) : null}
    </>
  );
}
