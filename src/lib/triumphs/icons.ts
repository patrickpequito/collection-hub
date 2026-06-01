export function resolveTriumphIcon(
  iconPath: string,
  records: { iconPath: string }[],
): string {
  if (iconPath) return iconPath;
  return records.find((record) => record.iconPath)?.iconPath ?? "";
}
