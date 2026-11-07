"use client";

import { ActivityArmorSetPreview } from "@/components/activity-armor-set-preview";
import {
  armorSetPreviewUrl,
  resolveArmorSetPreviewFile,
} from "@/lib/armor-sets/preview-images";
import { X_PROFILE_HANDLE, X_PROFILE_URL } from "@/lib/social";

type ArmorSetPreviewPanelProps = {
  setName: string;
  source?: string;
  /** Image already chosen for this set (Armor sets page); otherwise resolved from name and source. */
  previewUrl?: string;
};

export function ArmorSetPreviewPanel({
  setName,
  source = "",
  previewUrl,
}: ArmorSetPreviewPanelProps) {
  const imageFile = previewUrl?.split("/").pop() ?? resolveArmorSetPreviewFile(setName, source);

  return (
    <div className="min-w-0 lg:h-full">
      <ActivityArmorSetPreview
        imageFile={imageFile}
        imageUrl={previewUrl ?? armorSetPreviewUrl(imageFile)}
        label={`${setName} full set`}
        fill
        missingImageVariant="contribute"
        contributionLink={{
          href: X_PROFILE_URL,
          handle: X_PROFILE_HANDLE,
        }}
      />
    </div>
  );
}
