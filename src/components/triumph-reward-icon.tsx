import Image from "next/image";
import { isIncreasedDropRateReward } from "@/lib/triumph-reward-icon";

type TriumphRewardIconProps = {
  src: string;
  alt?: string;
  /** Title reward rows use a larger square slot; group rows are compact. */
  size: "title" | "group";
};

const SQUARE_SIZES = {
  title: { className: "h-14 w-14", px: 56, sizes: "56px" },
  group: { className: "h-8 w-8", px: 32, sizes: "32px" },
} as const;

const DROP_RATE_SIZES = {
  title: { className: "h-7 w-7", px: 28, sizes: "28px" },
  group: { className: "h-6 w-6", px: 24, sizes: "24px" },
} as const;

export function TriumphRewardIcon({
  src,
  alt = "",
  size,
}: TriumphRewardIconProps) {
  if (isIncreasedDropRateReward(src)) {
    const dropRate = DROP_RATE_SIZES[size];
    return (
      <Image
        src={src}
        alt={alt}
        width={dropRate.px}
        height={dropRate.px}
        className={`shrink-0 object-contain ${dropRate.className}`}
        sizes={dropRate.sizes}
        unoptimized
      />
    );
  }

  const square = SQUARE_SIZES[size];
  return (
    <div className={`relative shrink-0 ${square.className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        sizes={square.sizes}
        unoptimized
      />
    </div>
  );
}
