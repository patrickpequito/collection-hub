import path from "node:path";

/** Server-only catalog files live under /data (not publicly downloadable). */
export function serverDataPath(...segments: string[]): string {
  return path.join(process.cwd(), "data", ...segments);
}
