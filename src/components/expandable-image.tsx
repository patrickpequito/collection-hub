"use client";

import { useCallback, useEffect, useState } from "react";

type ExpandableImageProps = {
  src: string;
  alt: string;
  expandLabel?: string;
  imageClassName?: string;
  onError?: () => void;
};

/** Fixed preview frame so version screenshots do not shift the page layout. */
export const DETAIL_PREVIEW_FRAME_CLASS =
  "flex aspect-video w-full items-center justify-center bg-zinc-950/30";

export function ExpandableImage({
  src,
  alt,
  expandLabel,
  imageClassName = "max-h-full max-w-full object-contain",
  onError,
}: ExpandableImageProps) {
  const [expanded, setExpanded] = useState(false);
  const closeLightbox = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded, closeLightbox]);

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="block w-full cursor-zoom-in transition hover:opacity-90"
        aria-label={expandLabel ?? `Expand ${alt}`}
      >
        <div className={DETAIL_PREVIEW_FRAME_CLASS}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={imageClassName}
            onError={onError}
          />
        </div>
      </button>

      {expanded ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-md border border-zinc-600 bg-zinc-900/90 px-3 py-1.5 text-xs uppercase tracking-wide text-zinc-300 transition hover:border-zinc-400 hover:text-zinc-100"
          >
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] w-full max-w-5xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
