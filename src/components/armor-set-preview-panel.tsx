"use client";

import { ActivityArmorSetPreview } from "@/components/activity-armor-set-preview";
import {
  armorSetPreviewUrl,
  resolveArmorSetPreviewFile,
} from "@/lib/armor-sets/preview-images";
import { X_PROFILE_HANDLE, X_PROFILE_URL } from "@/lib/social";

type ArmorSetPreviewPanelProps = {
  setName: string;
};

export function ArmorSetPreviewPanel({ setName }: ArmorSetPreviewPanelProps) {
  const imageFile = resolveArmorSetPreviewFile(setName);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        {setName} Full Set Preview
      </h2>
      <ActivityArmorSetPreview
        imageFile={imageFile}
        imageUrl={armorSetPreviewUrl(imageFile)}
        label={`${setName} full set`}
        missingImageVariant="contribute"
        contributionLink={{
          href: X_PROFILE_URL,
          handle: X_PROFILE_HANDLE,
        }}
      />
    </div>
  );
}
