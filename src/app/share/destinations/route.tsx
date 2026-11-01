import { localImage } from "@/lib/share/assets";
import { loadDestinationTiles, type DestinationRow, type DestinationSlug, type DestinationTile } from "@/lib/share/destinations";
import { BONE, display, eyebrow, LIGHT_GOLD, PANEL, ShareFrame, shareJpegResponse, TEAL, u } from "@/lib/share/layout";
import { formatShareWeek } from "@/lib/share/reset";
import { rotationWeekIndex, weekBounds } from "@/lib/rad-loot/featured-rotation";

/** Destinations image for X (approved design "V3"): seven equal tiles, each with its own look. */

export const dynamic = "force-dynamic";

const TILE_H = 262;
const TILE_W = 555;

type Skin = {
  accent: string;
  text: string;
  /** Border + outer glow of the tile. */
  frame: Record<string, string | number>;
  /** Name glow (CSS text-shadow). */
  glow: string;
  /** Colour wash over the art. */
  tint: string;
  artPosition: string;
};

const SKINS: Record<DestinationSlug, Skin> = {
  kepler: {
    accent: "#ff8a3d",
    text: "#fff3e8",
    frame: { border: `${u(2)}px solid #ff8a3d` },
    glow: "0 0 0 transparent",
    tint: "linear-gradient(135deg, rgba(255,138,61,0.18), rgba(255,138,61,0) 60%)",
    artPosition: "50% 40%",
  },
  "the-pale-heart": {
    accent: "#f1dfa8",
    text: "#ffffff",
    frame: { border: `${u(1)}px solid rgba(241,223,168,0.7)`, boxShadow: `0 0 0 ${u(3)}px rgba(241,223,168,0.25)` },
    glow: `0 0 ${u(18)}px rgba(255,240,200,0.65)`,
    tint: "radial-gradient(ellipse 70% 80% at 20% 0%, rgba(255,247,220,0.22), rgba(255,247,220,0) 70%)",
    artPosition: "50% 45%",
  },
  neomuna: {
    accent: "#3df0ff",
    text: "#eafcff",
    frame: { border: `${u(2)}px solid #ff3df2`, boxShadow: `0 0 ${u(18)}px rgba(255,61,242,0.55)` },
    glow: `0 0 ${u(8)}px #3df0ff, 0 0 ${u(22)}px rgba(61,240,255,0.7)`,
    tint: "linear-gradient(160deg, rgba(255,61,242,0.22), rgba(61,240,255,0.12))",
    artPosition: "50% 50%",
  },
  "throne-world": {
    accent: "#b8e04a",
    text: "#f3f7df",
    frame: { border: `${u(2)}px solid #c9a227` },
    glow: `0 0 ${u(14)}px rgba(184,224,74,0.6)`,
    tint: "linear-gradient(180deg, rgba(150,200,60,0.16), rgba(12,20,11,0.2))",
    artPosition: "50% 50%",
  },
  europa: {
    accent: "#8fc4ff",
    text: "#f2f8ff",
    frame: { border: `${u(1)}px solid rgba(210,230,255,0.9)` },
    glow: `0 0 ${u(14)}px rgba(143,196,255,0.75)`,
    tint: "linear-gradient(180deg, rgba(143,196,255,0.12), rgba(143,196,255,0))",
    artPosition: "50% 50%",
  },
  "the-moon": {
    accent: "#ff3b3b",
    text: "#ffecec",
    frame: { border: `${u(1)}px solid rgba(255,59,59,0.85)`, boxShadow: `0 0 ${u(22)}px rgba(200,16,46,0.45)` },
    glow: `0 0 ${u(12)}px rgba(255,40,40,0.8), 0 0 ${u(26)}px rgba(200,16,46,0.6)`,
    tint: "radial-gradient(ellipse 80% 90% at 0% 100%, rgba(200,16,46,0.38), rgba(200,16,46,0) 70%)",
    artPosition: "50% 50%",
  },
  "dreaming-city": {
    accent: "#bfeaff",
    text: "#f2fbff",
    frame: { border: `${u(1)}px solid rgba(200,240,255,0.55)` },
    glow: `0 0 ${u(10)}px rgba(190,235,255,0.85), 0 0 ${u(22)}px rgba(160,220,255,0.45)`,
    tint: "radial-gradient(circle at 10% 30%, rgba(190,235,255,0.16), rgba(190,235,255,0) 38%), radial-gradient(circle at 70% 80%, rgba(120,90,200,0.18), rgba(120,90,200,0) 40%)",
    artPosition: "50% 45%",
  },
};

const fill = { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%" };

/** Dreaming City curse meter: lit segments up to this week's strength. */
function CurseMeter({ current, levels }: NonNullable<DestinationRow["curse"]>) {
  return (
    <div style={{ display: "flex", gap: u(4), marginLeft: u(12) }}>
      {Array.from({ length: levels }, (_, index) => (
        <div
          key={index}
          style={
            index <= current
              ? {
                  width: u(30),
                  height: u(12),
                  backgroundImage: "linear-gradient(90deg, #f4fcff, #bfe9ff)",
                  boxShadow: `0 0 ${u(8)}px rgba(190,235,255,0.9)`,
                }
              : { width: u(30), height: u(12), border: `${u(1)}px dashed rgba(200,240,255,0.5)` }
          }
        />
      ))}
    </div>
  );
}

function Tile({ tile }: { tile: DestinationTile }) {
  const skin = SKINS[tile.slug];
  const fade = tile.rows.length ? 58 - tile.rows.length * 12 : 55;
  return (
    <div style={{ position: "relative", display: "flex", width: u(TILE_W), height: u(TILE_H), overflow: "hidden", ...skin.frame }}>
      {tile.art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tile.art} alt="" style={{ ...fill, objectFit: "cover", objectPosition: skin.artPosition }} />
      ) : null}
      <div style={{ ...fill, backgroundImage: skin.tint }} />
      <div
        style={{
          ...fill,
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) ${fade}%, rgba(0,0,0,0.58) ${fade + 30}%, rgba(0,0,0,0.7) 100%)`,
        }}
      />
      <div style={{ position: "absolute", left: u(20), top: u(16), display: "flex" }}>
        <div style={{ ...display(44), color: skin.text, textShadow: `${skin.glow}, 0 ${u(2)}px ${u(10)}px rgba(0,0,0,0.8)` }}>{tile.name}</div>
      </div>
      <div style={{ position: "absolute", left: u(20), right: u(16), bottom: u(18), display: "flex", flexDirection: "column", gap: u(12) }}>
        {tile.rows.length ? (
          tile.rows.map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: u(16) }}>
              <div style={{ ...eyebrow(20), width: u(150), lineHeight: 1.15, letterSpacing: u(20 * 0.12), color: skin.accent }}>{row.label}</div>
              <div style={{ ...display(31), color: skin.text }}>{row.value}</div>
              {row.curse ? <CurseMeter {...row.curse} /> : null}
            </div>
          ))
        ) : (
          <div style={{ ...display(28), color: skin.accent }}>Rotation coming soon</div>
        )}
      </div>
    </div>
  );
}

export async function GET() {
  const { weekStart, weekEnd } = weekBounds(rotationWeekIndex(new Date()));
  const [tiles, destinyIcon, logo] = await Promise.all([
    loadDestinationTiles(),
    localImage("/images/share/destiny-white.png", 200, true),
    localImage("/icon.png", 120, true),
  ]);

  return shareJpegResponse(
    <ShareFrame dates={formatShareWeek(weekStart, weekEnd)} title="Destinations" titleSize={96} destinyIcon={destinyIcon} logo={logo} footer={false}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: u(10), marginTop: u(26) }}>
        {tiles.map((tile) => (
          <Tile key={tile.slug} tile={tile} />
        ))}
        {/* Closing tile: where the full details live. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: u(TILE_W),
            height: u(TILE_H),
            padding: u(24),
            border: `${u(1)}px solid rgba(255,255,255,0.16)`,
            background: PANEL,
            backgroundImage: "radial-gradient(ellipse 90% 80% at 100% 100%, rgba(36,180,179,0.16), rgba(36,180,179,0) 70%)",
          }}
        >
          <div style={{ ...eyebrow(24), color: LIGHT_GOLD }}>Weekly rotations</div>
          <div style={{ display: "flex", flexDirection: "column", ...display(46), color: BONE }}>
            <span>Full details,</span>
            <span>loot &amp; triumphs</span>
          </div>
          <div style={{ ...eyebrow(30), color: TEAL }}>d2collector.site</div>
        </div>
      </div>
    </ShareFrame>,
  );
}
