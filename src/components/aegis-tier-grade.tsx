const AEGIS_TIER_COLORS = {
  F: "#ff0d0d",
  E: "#ff4e11",
  D: "#ff8e15",
  C: "#fab733",
  B: "#acb334",
  A: "#69b34c",
  S: "#00aeff",
} as const;

export type AegisTierLetter = keyof typeof AEGIS_TIER_COLORS;

export function aegisTierColor(tier: string | null | undefined): string | undefined {
  if (!tier) return undefined;
  const key = tier.toUpperCase() as AegisTierLetter;
  return AEGIS_TIER_COLORS[key];
}

type AegisTierGradeProps = {
  tier: string | null;
  title?: string;
  className?: string;
};

export function AegisTierGrade({
  tier,
  title,
  className = "",
}: AegisTierGradeProps) {
  const label = tier ?? "—";
  const color = aegisTierColor(tier);

  return (
    <p
      className={`text-center text-2xl font-bold leading-none tabular-nums ${
        color ? "" : "text-zinc-500"
      } ${className}`}
      style={color ? { color } : undefined}
      title={title}
    >
      {label}
    </p>
  );
}
