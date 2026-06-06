"use client";

import { useCallback, useEffect, useState } from "react";

type ActivityArmorSetPreviewProps = {
  imageFile: string;
  imageUrl: string;
  label: string;
};

export function ActivityArmorSetPreview({
  imageFile,
  imageUrl,
  label,
}: ActivityArmorSetPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const showImage = !imageError;

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
      <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/50">
        {showImage ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="block min-w-0 w-full max-w-full cursor-zoom-in transition hover:opacity-90"
            aria-label={`Expand ${label} preview`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={label}
              className="block h-auto max-w-full w-full"
              onError={() => setImageError(true)}
            />
          </button>
        ) : (
          <div
            className="flex min-h-28 w-full flex-col items-center justify-center gap-2 px-4 py-8 text-center"
            aria-hidden
          >
            <p className="text-[10px] uppercase tracking-wide text-zinc-600">
              Armor set preview
            </p>
            <p className="font-mono text-xs text-zinc-500">{imageFile}</p>
          </div>
        )}
      </div>

      {expanded && showImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={label}
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
            src={imageUrl}
            alt={label}
            className="max-h-[90vh] w-full max-w-5xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
