"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type HorizontalScrollHintProps = {
  children: ReactNode;
  className?: string;
  hintLabel?: string;
};

function scrollMaskStyle(
  canScrollLeft: boolean,
  canScrollRight: boolean,
): CSSProperties | undefined {
  if (!canScrollLeft && !canScrollRight) return undefined;

  const edgeFade = "1.75rem";
  const stops: string[] = [];

  if (canScrollLeft) {
    stops.push("transparent 0", `black ${edgeFade}`);
  } else {
    stops.push("black 0");
  }

  if (canScrollRight) {
    stops.push(`black calc(100% - ${edgeFade})`, "transparent 100%");
  } else {
    stops.push("black 100%");
  }

  const gradient = `linear-gradient(to right, ${stops.join(", ")})`;

  return {
    maskImage: gradient,
    WebkitMaskImage: gradient,
  };
}

export function HorizontalScrollHint({
  children,
  className = "",
  hintLabel = "Scroll for more ranks",
}: HorizontalScrollHintProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollHints = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const overflows = element.scrollWidth > element.clientWidth + 1;
    setCanScrollLeft(overflows && element.scrollLeft > 4);
    setCanScrollRight(
      overflows &&
        element.scrollLeft + element.clientWidth < element.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    updateScrollHints();

    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("scroll", updateScrollHints, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollHints);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener("scroll", updateScrollHints);
      resizeObserver.disconnect();
    };
  }, [updateScrollHints]);

  const maskStyle = scrollMaskStyle(canScrollLeft, canScrollRight);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {canScrollLeft ? (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-7 items-center justify-start pl-0.5 text-lg leading-none text-zinc-500/90"
          aria-hidden
        >
          ‹
        </div>
      ) : null}

      {canScrollRight ? (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-7 items-center justify-end pr-0.5 text-lg leading-none text-zinc-500/90"
            aria-hidden
          >
            ›
          </div>
          <p className="pointer-events-none absolute bottom-0 right-0 z-10 text-[10px] text-zinc-500">
            {hintLabel}
          </p>
        </>
      ) : null}

      <div
        ref={scrollRef}
        style={maskStyle}
        className="overflow-x-auto pb-4 [scrollbar-width:thin] snap-x snap-mandatory"
        tabIndex={0}
        aria-label={hintLabel}
      >
        {children}
      </div>
    </div>
  );
}
