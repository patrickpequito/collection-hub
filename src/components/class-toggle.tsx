"use client";

import { GuardianClassIcon } from "@/components/guardian-class-icon";
import { CLASS_LABELS, GUARDIAN_CLASSES } from "@/lib/armor-sets/constants";
import type { GuardianClass } from "@/types/armor-set";

/** Hunter / Titan / Warlock icon buttons (ornament lists show one class at a time). */
export function ClassToggle({
  value,
  onChange,
  noun = "ornaments",
}: {
  value: GuardianClass;
  onChange: (guardianClass: GuardianClass) => void;
  noun?: string;
}) {
  return (
    <div className="flex gap-1">
      {GUARDIAN_CLASSES.map((guardianClass) => (
        <button
          key={guardianClass}
          type="button"
          title={CLASS_LABELS[guardianClass]}
          aria-label={`Show ${CLASS_LABELS[guardianClass]} ${noun}`}
          aria-pressed={value === guardianClass}
          onClick={() => onChange(guardianClass)}
          className={`inline-flex size-8 items-center justify-center border transition ${
            value === guardianClass
              ? "border-bone text-bone"
              : "border-white/[0.22] text-bone/70 opacity-60 hover:border-bone hover:opacity-100"
          }`}
        >
          <GuardianClassIcon guardianClass={guardianClass} size="sm" />
        </button>
      ))}
    </div>
  );
}
