import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Fonts and art for the share-kit images (next/og). Satori only reads TTF/OTF fonts and
 * PNG/JPEG images, so local WebP art is converted with sharp into data URIs.
 */

const root = process.cwd();

type ShareFont = { name: string; data: Buffer; weight: 500 | 600 | 700; style: "normal" };

let fontsPromise: Promise<ShareFont[]> | null = null;

export function loadShareFonts(): Promise<ShareFont[]> {
  fontsPromise ??= Promise.all(
    (
      [
        ["Barlow Semi Condensed", "BarlowSemiCondensed-SemiBold.ttf", 600],
        ["Barlow Semi Condensed", "BarlowSemiCondensed-Bold.ttf", 700],
        ["Barlow", "Barlow-Medium.ttf", 500],
        ["Barlow", "Barlow-SemiBold.ttf", 600],
      ] as const
    ).map(async ([name, file, weight]) => ({
      name,
      data: await readFile(path.join(root, "assets/fonts", file)),
      weight,
      style: "normal" as const,
    })),
  );
  return fontsPromise;
}

/** public/… image as a JPEG (or PNG when `png`) data URI, resized to `width` px. */
export async function localImage(publicPath: string, width: number, png = false): Promise<string | null> {
  try {
    const input = sharp(path.join(root, "public", publicPath)).resize({ width, withoutEnlargement: true });
    const buffer = png ? await input.png().toBuffer() : await input.jpeg({ quality: 86 }).toBuffer();
    return `data:image/${png ? "png" : "jpeg"};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Same as localImage but every opaque pixel turned black (icon on the teal ribbon). */
export async function localImageBlack(publicPath: string, width: number): Promise<string | null> {
  try {
    const { data, info } = await sharp(path.join(root, "public", publicPath))
      .resize({ width })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let index = 0; index < data.length; index += 4) {
      data[index] = data[index + 1] = data[index + 2] = 0;
    }
    const buffer = await sharp(data, { raw: info }).png().toBuffer();
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export const bungieUrl = (iconPath: string) => `https://www.bungie.net${iconPath}`;
