import { CollectionItemIcon } from "@/components/collection-item-icon";
import type { ArmorPiece } from "@/types/armor-set";

type ArmorPieceIconProps = {
  piece?: ArmorPiece;
  slotLabel: string;
  sourceLabel?: string;
  owned?: boolean;
  showOwnership?: boolean;
};

export function ArmorPieceIcon({
  piece,
  slotLabel,
  sourceLabel,
  owned = false,
  showOwnership = false,
}: ArmorPieceIconProps) {
  if (!piece?.iconPath) {
    return (
      <div
        className="flex h-[60px] w-[60px] items-center justify-center rounded-md border border-dashed border-zinc-700 bg-zinc-900/60 text-[10px] text-zinc-500"
        title={`Missing ${slotLabel}`}
      >
        —
      </div>
    );
  }

  return (
    <CollectionItemIcon
      name={piece.name}
      iconPath={piece.iconPath}
      source={sourceLabel}
      owned={owned}
      showOwnership={showOwnership}
    />
  );
}
