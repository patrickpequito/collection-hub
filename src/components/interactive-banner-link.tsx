"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type InteractiveBannerLinkProps = {
  href?: string | null;
  className?: string;
  children: ReactNode;
};

const PRESS_FEEDBACK_CLASS =
  "touch-manipulation transition-[transform,opacity,filter,border-color] duration-150 ease-out [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none active:scale-[0.98] active:brightness-95";

function PressOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span
      className="pointer-events-none absolute inset-0 z-20 bg-white/10 motion-reduce:hidden"
      aria-hidden
    />
  );
}

/**
 * Link (or static surface) with immediate tap/click feedback.
 * Linked banners hold the pressed state until navigation completes.
 */
export function InteractiveBannerLink({
  href = null,
  className = "",
  children,
}: InteractiveBannerLinkProps) {
  const pathname = usePathname();
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    setIsPressed(false);
  }, [pathname]);

  const pressedClass = isPressed
    ? "pointer-events-none scale-[0.98] border-amber-500/40 brightness-95 opacity-90"
    : "";

  if (!href) {
    return (
      <div
        role="presentation"
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => {
          window.setTimeout(() => setIsPressed(false), 180);
        }}
        onPointerLeave={() => setIsPressed(false)}
        className={`${className} ${PRESS_FEEDBACK_CLASS} ${pressedClass}`}
      >
        <PressOverlay visible={isPressed} />
        {children}
      </div>
    );
  }

  return (
    <Link
      href={href}
      aria-busy={isPressed}
      onClick={() => setIsPressed(true)}
      className={`${className} ${PRESS_FEEDBACK_CLASS} ${pressedClass}`}
    >
      <PressOverlay visible={isPressed} />
      {children}
    </Link>
  );
}
