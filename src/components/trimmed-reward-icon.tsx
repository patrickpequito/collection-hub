"use client";

import { useEffect, useRef, useState } from "react";
import {
  getHorizontalTrimLayout,
  loadTrimBounds,
  type ImageTrimBounds,
} from "@/lib/trim-image-bounds";

type TrimmedRewardIconProps = {
  src: string;
  alt?: string;
};

export function TrimmedRewardIcon({ src, alt = "" }: TrimmedRewardIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<ImageTrimBounds | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let cancelled = false;
    loadTrimBounds(src).then((result) => {
      if (!cancelled) setBounds(result);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout =
    bounds && containerSize.width > 0
      ? getHorizontalTrimLayout(
          bounds,
          containerSize.width,
          containerSize.height,
        )
      : null;

  return (
    <div
      ref={containerRef}
      className="relative flex w-full items-center"
      style={{ minHeight: layout?.imageHeight ?? 48 }}
    >
      {layout ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="block max-w-none"
          style={{
            width: layout.imageWidth,
            height: layout.imageHeight,
            marginLeft: layout.left,
            marginTop: layout.top,
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="block w-full object-contain" />
      )}
    </div>
  );
}
