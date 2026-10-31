import { ImageResponse } from "next/og";
import sharp from "sharp";
import { loadShareFonts } from "@/lib/share/assets";
import { formatShareWeek, loadResetShareData, type ShareActivityRow, type ShareBoss } from "@/lib/share/reset";

/** Weekly reset image for X (approved design "E1"): Pantheon bosses, Tier 5 ribbon, featured raids and dungeons. */

export const dynamic = "force-dynamic";

/** Laid out on a 1200 × 1292 grid, rendered at 1.5× for a sharp 1800 × 1938 PNG. */
const SCALE = 1.5;
const u = (px: number) => px * SCALE;

const VOID = "#0b0d10";
const BONE = "#e9e7e2";
const GOLD = "#c9a227";
const TEAL = "#24b4b3";
const EXOTIC = "#ceae33";
const DISPLAY = "Barlow Semi Condensed";

const eyebrow = (size = 30) => ({
  fontFamily: DISPLAY,
  fontWeight: 600,
  fontSize: u(size),
  letterSpacing: u(size * 0.16),
  textTransform: "uppercase" as const,
  lineHeight: 1,
});
const display = (size: number) => ({
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: u(size),
  textTransform: "uppercase" as const,
  lineHeight: 0.95,
});
const chip = (background: string) => ({
  ...eyebrow(26),
  fontWeight: 700,
  letterSpacing: u(26 * 0.14),
  background,
  color: VOID,
  padding: `${u(6)}px ${u(12)}px`,
});

function Boss({ boss }: { boss: ShareBoss }) {
  return (
    <div style={{ position: "relative", display: "flex", flex: 1, overflow: "hidden", background: "#12161c" }}>
      {boss.art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={boss.art} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "linear-gradient(to top, rgba(11,13,16,0.95) 4%, rgba(11,13,16,0) 50%)",
        }}
      />
      <div style={{ position: "absolute", left: u(24), right: u(16), bottom: u(20), display: "flex", flexDirection: "column" }}>
        <div style={{ ...eyebrow(28), color: GOLD }}>{boss.pool}</div>
        <div style={{ ...display(76), color: BONE, marginTop: u(6) }}>{boss.boss}</div>
      </div>
    </div>
  );
}

function Row({ row }: { row: ShareActivityRow }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: u(116),
        overflow: "hidden",
        border: `${u(1)}px solid rgba(255,255,255,0.16)`,
      }}
    >
      {row.art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.art} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "linear-gradient(to right, rgba(11,13,16,0.95) 35%, rgba(11,13,16,0.4))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: u(24),
          right: u(20),
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          gap: u(22),
        }}
      >
        <div
          style={{
            ...chip(row.kind === "Raid" ? GOLD : BONE),
            width: u(150),
            display: "flex",
            justifyContent: "center",
          }}
        >
          {row.kind}
        </div>
        <div style={{ ...display(54), color: BONE, flex: 1 }}>{row.title}</div>
        {row.exoticIcon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.exoticIcon}
            alt=""
            width={u(96)}
            height={u(96)}
            style={{ border: `${u(3)}px solid ${EXOTIC}`, boxShadow: `0 0 ${u(24)}px rgba(206,174,51,0.5)` }}
          />
        ) : null}
      </div>
    </div>
  );
}

export async function GET() {
  const [data, fonts] = await Promise.all([loadResetShareData(), loadShareFonts()]);
  const png = new ImageResponse(
    (
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
        {/* Header: "DESTINY 2 · dates", Destiny icon + THIS WEEK, brand on the right. */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", ...eyebrow() }}>
              <span style={{ color: BONE, letterSpacing: u(30 * 0.24) }}>Destiny 2</span>
              <span style={{ color: TEAL }}>&nbsp;· {formatShareWeek(data.weekStart, data.weekEnd)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: u(22), marginTop: u(12) }}>
              {data.destinyIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.destinyIcon} alt="" height={u(92)} width={u(92 * (438 / 405))} />
              ) : null}
              <div style={{ ...display(112) }}>This week</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: u(14) }}>
            {data.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logo} alt="" height={u(50)} width={u(50 * (495 / 569))} />
            ) : null}
            <div style={{ ...eyebrow(32), letterSpacing: u(32 * 0.2) }}>Collection Hub</div>
          </div>
        </div>

        {/* Pantheon: this week's featured Reprise and Encore bosses. */}
        <div
          style={{
            position: "relative",
            display: "flex",
            gap: u(4),
            height: u(400),
            marginTop: u(26),
            border: `${u(1)}px solid rgba(255,255,255,0.16)`,
            background: VOID,
          }}
        >
          {data.bosses.map((boss) => (
            <Boss key={boss.pool} boss={boss} />
          ))}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: `${u(20)}px ${u(24)}px`,
              backgroundImage: "linear-gradient(to bottom, rgba(11,13,16,0.9), rgba(11,13,16,0))",
            }}
          >
            <div style={{ ...display(60) }}>Pantheon</div>
            <div style={{ ...chip(GOLD), display: "flex" }}>Featured bosses</div>
          </div>
        </div>

        {/* Full-bleed Tier 5 ribbon. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: u(16),
            height: u(66),
            margin: `${u(16)}px ${-u(40)}px`,
            background: TEAL,
            color: VOID,
          }}
        >
          {data.tierIcon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.tierIcon} alt="" width={u(42)} height={u(42)} />
          ) : null}
          <div style={{ ...display(40), letterSpacing: u(1.2) }}>Tier 5 loot in every featured activity</div>
        </div>

        {/* Featured raids and dungeons. */}
        <div style={{ display: "flex", flexDirection: "column", gap: u(10) }}>
          {data.rows.map((row) => (
            <Row key={row.title} row={row} />
          ))}
        </div>

        <div style={{ position: "absolute", right: u(40), bottom: u(26), display: "flex", ...eyebrow(), color: TEAL }}>
          d2collector.site
        </div>
      </div>
    ),
    { width: u(1200), height: u(1292), fonts },
  );
  // JPEG keeps the file well under X's 5 MB image limit (the PNG is ~4 MB).
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 90 }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" },
  });
}
