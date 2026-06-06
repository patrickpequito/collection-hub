"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type InteractiveBannerLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

/**
 * Link wrapper with immediate tap/click feedback that holds while the next page loads.
 */
export function InteractiveBannerLink({
  href,
  className = "",
  children,
}: InteractiveBannerLinkProps) {
  const pathname = usePathname();
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    setIsPressed(false);
  }, [pathname]);

  return (
    <Link
      href={href}
      aria-busy={isPressed}
      onClick={() => setIsPressed(true)}
      className={`${className} touch-manipulation transition-[transform,opacity,filter,border-color] duration-150 ease-out [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none active:scale-[0.98] active:brightness-95 ${
        isPressed
          ? "pointer-events-none scale-[0.98] border-amber-500/40 brightness-95 opacity-90"
          : ""
      }`}
    >
      {isPressed ? (
        <span
          className="pointer-events-none absolute inset-0 z-20 bg-white/10 motion-reduce:hidden"
          aria-hidden
        />
      ) : null}
      {children}
    </Link>
  );
}
