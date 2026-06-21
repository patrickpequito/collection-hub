"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ALL_LOOT_COLLECTION_BANNERS,
  isLootCollectionBannerAvailable,
  isLootNavActive,
  isLootSearchNavActive,
  LOOT_SEARCH_NAV_ITEM,
} from "@/lib/loot-navigation";

const LOOT_MENU_PANEL_CLASS =
  "rounded-lg border border-zinc-800/80 bg-black/50 py-1 shadow-xl shadow-black/40 backdrop-blur-md";

type LootNavMenuProps = {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

function isLootItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function LootNavItem({
  title,
  href,
  available,
  pathname,
  onNavigate,
  variant,
  active,
}: {
  title: string;
  href?: string;
  available: boolean;
  pathname: string;
  onNavigate?: () => void;
  variant: "desktop" | "mobile";
  active?: boolean;
}) {
  const paddingClass =
    variant === "desktop" ? "px-3 py-2" : "rounded-lg px-3 py-2.5";

  if (!available || !href) {
    return (
      <span
        className={`block text-sm font-medium text-zinc-600 ${paddingClass}`}
        aria-disabled="true"
      >
        {title}
      </span>
    );
  }

  const isActive = active ?? isLootItemActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`block text-sm font-medium transition ${paddingClass} ${
        isActive
          ? "bg-zinc-800 text-zinc-100"
          : variant === "desktop"
            ? "text-zinc-300 hover:bg-zinc-900/80 hover:text-zinc-100"
            : "text-zinc-300 hover:bg-zinc-900"
      }`}
    >
      {title}
    </Link>
  );
}

function LootNavDivider({ variant }: { variant: "desktop" | "mobile" }) {
  if (variant === "mobile") {
    return <li className="my-1 border-t border-zinc-800" aria-hidden />;
  }

  return (
    <li role="separator" className="my-1 border-t border-zinc-800/80" aria-hidden />
  );
}

function LootSearchNavItem({
  pathname,
  onNavigate,
  variant,
}: {
  pathname: string;
  onNavigate?: () => void;
  variant: "desktop" | "mobile";
}) {
  return (
    <LootNavItem
      title={LOOT_SEARCH_NAV_ITEM.title}
      href={LOOT_SEARCH_NAV_ITEM.href}
      available
      pathname={pathname}
      onNavigate={onNavigate}
      variant={variant}
      active={isLootSearchNavActive(pathname)}
    />
  );
}

function LootDesktopMenuItems({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <>
      <li role="none">
        <LootSearchNavItem
          pathname={pathname}
          onNavigate={onNavigate}
          variant="desktop"
        />
      </li>
      <LootNavDivider variant="desktop" />
      {ALL_LOOT_COLLECTION_BANNERS.map((banner) => (
        <li key={banner.title} role="none">
          <LootNavItem
            title={banner.title}
            href={banner.href}
            available={isLootCollectionBannerAvailable(banner)}
            pathname={pathname}
            onNavigate={onNavigate}
            variant="desktop"
          />
        </li>
      ))}
    </>
  );
}

function LootMobileMenuItems({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <>
      <li>
        <LootSearchNavItem
          pathname={pathname}
          onNavigate={onNavigate}
          variant="mobile"
        />
      </li>
      <LootNavDivider variant="mobile" />
      {ALL_LOOT_COLLECTION_BANNERS.map((banner) => (
        <li key={banner.title}>
          <LootNavItem
            title={banner.title}
            href={banner.href}
            available={isLootCollectionBannerAvailable(banner)}
            pathname={pathname}
            onNavigate={onNavigate}
            variant="mobile"
          />
        </li>
      ))}
    </>
  );
}

export function LootNavMenu({ variant, onNavigate }: LootNavMenuProps) {
  const pathname = usePathname();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const lootActive = isLootNavActive(pathname);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const handleNavigate = useCallback(() => {
    closeMenu();
    onNavigate?.();
  }, [closeMenu, onNavigate]);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (variant !== "desktop" || !open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu();
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [closeMenu, open, variant]);

  if (variant === "mobile") {
    return (
      <li>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            lootActive || open
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-300 hover:bg-zinc-900"
          }`}
        >
          Loot
          <svg
            viewBox="0 0 20 20"
            className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`}
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open ? (
          <ul className="mt-0.5 space-y-0.5 border-l border-zinc-800 pl-2">
            <LootMobileMenuItems
              pathname={pathname}
              onNavigate={handleNavigate}
            />
          </ul>
        ) : null}
      </li>
    );
  }

  const desktopMenu =
    open && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            id={`${menuId}-menu`}
            role="menu"
            aria-labelledby={`${menuId}-trigger`}
            style={{ top: menuPosition.top, left: menuPosition.left }}
            className="fixed z-[60] min-w-52"
          >
            <ul className={LOOT_MENU_PANEL_CLASS}>
              <LootDesktopMenuItems
                pathname={pathname}
                onNavigate={handleNavigate}
              />
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <li className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={`${menuId}-trigger`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={`${menuId}-menu`}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          lootActive || open
            ? "bg-zinc-800 text-zinc-100"
            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
        }`}
      >
        Loot
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {desktopMenu}
    </li>
  );
}
