/**
 * The entries of `index` whose key appears anywhere in `sources` (as a string value,
 * at any depth). Lets a page ship only the slice of a big lookup table it actually
 * renders — e.g. one weapon's plugs instead of the whole catalog plug index.
 */
export function pickReferenced<T>(index: Record<string, T>, sources: unknown[]): Record<string, T> {
  const picked: Record<string, T> = {};
  const visit = (value: unknown) => {
    if (typeof value === "string") {
      if (Object.hasOwn(index, value)) picked[value] = index[value];
    } else if (Array.isArray(value)) {
      for (const entry of value) visit(entry);
    } else if (value && typeof value === "object") {
      for (const entry of Object.values(value)) visit(entry);
    }
  };
  for (const source of sources) visit(source);
  return picked;
}
