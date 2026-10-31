import { readFile } from "node:fs/promises";
import path from "node:path";
import { localImage } from "@/lib/share/assets";
import {
  BONE,
  display,
  exoticIcon,
  eyebrow,
  LIGHT_GOLD,
  PANEL,
  ShareFrame,
  shareJpegResponse,
  u,
} from "@/lib/share/layout";
import { formatShareWeek } from "@/lib/share/reset";
import { loadXur, xurWindow, type XurArmor, type XurClass, type XurItem } from "@/lib/xur";

/** Friday image for X (approved design "A"): Xûr portrait + 2 catalysts, exotic weapons, exotic armor by class. */

export const dynamic = "force-dynamic";

const CLASSES: XurClass[] = ["Titan", "Hunter", "Warlock"];
const MS_DAY = 24 * 60 * 60 * 1000;

/** Class symbols as light-grey SVG data URIs (Satori draws <img> SVGs). */
async function classIcons(): Promise<Record<XurClass, string>> {
  const entries = await Promise.all(
    CLASSES.map(async (guardianClass) => {
      const svg = await readFile(path.join(process.cwd(), "public/icons/d2", `class_${guardianClass.toLowerCase()}.svg`), "utf8");
      const tinted = svg.replace("<svg ", '<svg fill="#c7cad0" ');
      return [guardianClass, `data:image/svg+xml;base64,${Buffer.from(tinted).toString("base64")}`] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<XurClass, string>;
}

function Catalyst({ item }: { item: XurItem }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: u(22),
        padding: `${u(16)}px ${u(20)}px`,
        border: `${u(1)}px solid rgba(232,200,96,0.5)`,
        background: PANEL,
        backgroundImage: "linear-gradient(to right, rgba(232,200,96,0.10), rgba(232,200,96,0) 70%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.icon} alt="" style={exoticIcon(124)} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ ...eyebrow(26), color: LIGHT_GOLD }}>Catalyst</div>
        <div style={{ ...display(50), color: BONE, marginTop: u(8) }}>{item.name}</div>
      </div>
    </div>
  );
}

function Weapon({ item }: { item: XurItem }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: u(18),
        width: u(555),
        height: u(124),
        padding: `0 ${u(16)}px`,
        border: `${u(1)}px solid rgba(255,255,255,0.14)`,
        background: PANEL,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.icon} alt="" style={exoticIcon(100)} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ ...display(36), color: BONE }}>{item.name}</div>
        <div style={{ ...eyebrow(22), color: LIGHT_GOLD, marginTop: u(8) }}>{item.type}</div>
      </div>
    </div>
  );
}

function ArmorClass({ guardianClass, pieces, icon }: { guardianClass: XurClass; pieces: XurArmor[]; icon: string }) {
  const symbol = guardianClass === "Warlock" ? 22 : 18;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: u(12), flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: u(10) }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" width={u(symbol)} height={u(symbol)} />
        <div style={{ ...eyebrow(24), color: "#c7cad0" }}>{guardianClass}</div>
      </div>
      <div style={{ display: "flex", gap: u(12) }}>
        {pieces.map((piece) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={piece.hash} src={piece.icon} alt="" style={exoticIcon(158)} />
        ))}
      </div>
    </div>
  );
}

const section = (label: string) => (
  <div style={{ display: "flex", ...eyebrow(30), color: BONE, margin: `${u(26)}px 0 ${u(14)}px` }}>{label}</div>
);

export async function GET() {
  const window = xurWindow();
  const xur = await loadXur();
  if (!window || !xur) return new Response("Xûr is not in the Tower right now.", { status: 404 });
  if (!xur.gear) return new Response("Xûr's weapons and catalysts are not loaded yet: open the home page signed in.", { status: 409 });

  const [art, destinyIcon, logo, icons] = await Promise.all([
    localImage("/images/xur/xur.webp", 800),
    localImage("/images/share/destiny-white.png", 200, true),
    localImage("/icon.png", 120, true),
    classIcons(),
  ]);
  const arrives = new Date(Date.parse(window.weekStart) + 3 * MS_DAY).toISOString();

  return shareJpegResponse(
    <ShareFrame dates={formatShareWeek(arrives, window.leavesAt)} title="Xûr is here" destinyIcon={destinyIcon} logo={logo}>
      {/* Portrait + the two catalysts. */}
      <div style={{ display: "flex", gap: u(12), marginTop: u(26), height: u(330) }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            width: u(400),
            overflow: "hidden",
            border: `${u(1)}px solid rgba(232,200,96,0.4)`,
          }}
        >
          {art ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={art}
              alt=""
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 22%" }}
            />
          ) : null}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: "linear-gradient(to top, rgba(11,13,16,0.9) 4%, rgba(11,13,16,0) 45%)",
            }}
          />
          <div style={{ position: "absolute", left: u(20), bottom: u(16), display: "flex", ...eyebrow(24), color: LIGHT_GOLD }}>
            Agent of the Nine
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          {xur.gear.catalysts.map((item) => (
            <Catalyst key={item.hash} item={item} />
          ))}
        </div>
      </div>

      {section("Exotic weapons")}
      <div style={{ display: "flex", flexWrap: "wrap", gap: u(10) }}>
        {xur.gear.weapons.map((item) => (
          <Weapon key={item.hash} item={item} />
        ))}
      </div>

      {section("Exotic armor")}
      <div style={{ display: "flex", gap: u(24) }}>
        {CLASSES.map((guardianClass) => (
          <ArmorClass
            key={guardianClass}
            guardianClass={guardianClass}
            pieces={xur.armor.filter((piece) => piece.guardianClass === guardianClass)}
            icon={icons[guardianClass]}
          />
        ))}
      </div>
    </ShareFrame>,
  );
}
