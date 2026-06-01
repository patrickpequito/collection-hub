import type { TitleCompletionTier } from "@/types/triumph";

export const TITLE_BORDER_CLASSES: Record<TitleCompletionTier, string> = {
  none: "border-zinc-800",
  base: "border-[#9d6bff]",
  gilded: "border-[#c9a227]",
};

export const TITLE_HOVER_BORDER_CLASSES: Record<TitleCompletionTier, string> = {
  none: "hover:border-zinc-600",
  base: "hover:border-[#e5d6ff]",
  gilded: "hover:border-[#f5e08a]",
};

export const TITLE_FILL_CLASSES: Record<TitleCompletionTier, string> = {
  none: "",
  base: "bg-[#9d6bff]/25",
  gilded: "bg-[#c9a227]/25",
};

export const TITLE_PROGRESS_BAR_CLASSES: Record<TitleCompletionTier, string> = {
  none: "bg-zinc-700/55",
  base: "bg-[#9d6bff]/25",
  gilded: "bg-[#c9a227]/25",
};
