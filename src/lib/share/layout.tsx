import type { ReactElement, ReactNode } from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { loadShareFonts } from "@/lib/share/assets";

/**
 * Shared frame of the X share images: dark page, "DESTINY 2 · dates" header with the Destiny icon
 * and title, Collection Hub brand, d2collector.site footer. Laid out on a 1200 × 1292 grid and
 * rendered at 1.5× (1800 × 1938), then saved as JPEG to stay well under X's 5 MB limit.
 */

export const SCALE = 1.5;
export const u = (px: number) => px * SCALE;

export const VOID = "#0b0d10";
export const PANEL = "#12161c";
export const BONE = "#e9e7e2";
export const GOLD = "#c9a227";
export const LIGHT_GOLD = "#e8c860";
export const TEAL = "#24b4b3";
export const EXOTIC = "#ceae33";
export const DISPLAY = "Barlow Semi Condensed";

export const eyebrow = (size = 30) => ({
  fontFamily: DISPLAY,
  fontWeight: 600,
  fontSize: u(size),
  letterSpacing: u(size * 0.16),
  textTransform: "uppercase" as const,
  lineHeight: 1,
});
export const display = (size: number) => ({
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: u(size),
  textTransform: "uppercase" as const,
  lineHeight: 0.95,
});
export const chip = (background: string) => ({
  ...eyebrow(26),
  fontWeight: 700,
  letterSpacing: u(26 * 0.14),
  background,
  color: VOID,
  padding: `${u(6)}px ${u(12)}px`,
});
export const exoticIcon = (size: number) => ({
  width: u(size),
  height: u(size),
  border: `${u(3)}px solid ${EXOTIC}`,
  boxShadow: `0 0 ${u(22)}px rgba(206,174,51,0.45)`,
});

type ShareFrameProps = {
  dates: string;
  title: string;
  destinyIcon: string | null;
  logo: string | null;
  children: ReactNode;
};

export function ShareFrame({ dates, title, destinyIcon, logo, children }: ShareFrameProps) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: `${u(36)}px ${u(40)}px`,
        backgroundImage: `linear-gradient(to bottom, #17150f, ${VOID} ${u(300)}px)`,
        color: BONE,
        fontFamily: "Barlow",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", ...eyebrow() }}>
            <span style={{ color: BONE, letterSpacing: u(30 * 0.24) }}>Destiny 2</span>
            <span style={{ color: TEAL }}>&nbsp;· {dates}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: u(22), marginTop: u(12) }}>
            {destinyIcon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={destinyIcon} alt="" height={u(92)} width={u(92 * (438 / 405))} />
            ) : null}
            <div style={{ ...display(112) }}>{title}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: u(14) }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" height={u(50)} width={u(50 * (495 / 569))} />
          ) : null}
          <div style={{ ...eyebrow(32), letterSpacing: u(32 * 0.2) }}>Collection Hub</div>
        </div>
      </div>

      {children}

      <div style={{ position: "absolute", right: u(40), bottom: u(26), display: "flex", ...eyebrow(), color: TEAL }}>
        d2collector.site
      </div>
    </div>
  );
}

/** Renders a share frame to a JPEG response. */
export async function shareJpegResponse(element: ReactElement): Promise<Response> {
  const png = new ImageResponse(element, { width: u(1200), height: u(1292), fonts: await loadShareFonts() });
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 90 }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" },
  });
}
