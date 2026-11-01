import { IRON_BANNER_HUB } from "@/data/activities/iron-banner";
import { resolveIronBannerLoot } from "@/lib/activities/iron-banner-loot";
import { bungieUrl, localImage } from "@/lib/share/assets";
import { ironBannerWeek } from "@/lib/share/iron-banner";
import { BONE, chip, display, eyebrow, PANEL, ShareFrame, shareJpegResponse, TEAL, u } from "@/lib/share/layout";
import { formatShareWeek } from "@/lib/share/reset";
import type { LootItem } from "@/types/activity-loot";

/**
 * Iron Banner image for X (approved design "pvp-ib-c"), third image of the reset post every
 * four weeks: Iron Banner art + the full current armor set, then the focus weapons.
 */

export const dynamic = "force-dynamic";

const ACCENT = "#e07a3f";
const HERO_H = 430;

const fill = { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%" };
const legendaryIcon = (size: number) => ({ width: u(size), height: u(size), border: `${u(1)}px solid rgba(255,255,255,0.22)` });

function Weapon({ item }: { item: LootItem }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: u(18),
        width: u(555),
        height: u(128),
        padding: `0 ${u(16)}px`,
        border: `${u(1)}px solid rgba(255,255,255,0.14)`,
        background: PANEL,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bungieUrl(item.iconPath)} alt="" style={legendaryIcon(112)} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ ...display(34), color: BONE }}>{item.name}</div>
        <div style={{ ...eyebrow(22), color: ACCENT, marginTop: u(8) }}>{item.classOrWeaponType ?? ""}</div>
      </div>
    </div>
  );
}

export async function GET() {
  const { startMs, endMs, startedToday } = ironBannerWeek();

  const [loot, art, setArt, destinyIcon, logo] = await Promise.all([
    resolveIronBannerLoot(),
    localImage("/images/share/iron-banner-emblem.jpg", 1000),
    localImage(`/images/armor-set-previews/${IRON_BANNER_HUB.armorSetPreviewFiles?.[0] ?? "iron-battalion-set.webp"}`, 1400),
    localImage("/images/share/destiny-white.png", 200, true),
    localImage("/icon.png", 120, true),
  ]);
  const weapons = loot.currentWeaponPools?.find((pool) => pool.isActive)?.items ?? [];
  const setName = (loot.currentArmorRows[0]?.setName ?? "Iron Battalion").replace(/ Set$/, "");

  return shareJpegResponse(
    <ShareFrame
      dates={formatShareWeek(new Date(startMs).toISOString(), new Date(endMs).toISOString())}
      title="Iron Banner"
      destinyIcon={destinyIcon}
      logo={logo}
      footer={false}
    >
      {/* Iron Banner art + the full armor set (16:9, uncropped). */}
      <div style={{ display: "flex", gap: u(10), marginTop: u(26), height: u(HERO_H) }}>
        <div style={{ position: "relative", display: "flex", flex: 1, overflow: "hidden", border: `${u(1)}px solid rgba(255,255,255,0.16)` }}>
          {art ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={art} alt="" style={{ ...fill, objectFit: "cover", objectPosition: "50% 50%" }} />
          ) : null}
          <div style={{ ...fill, backgroundImage: "linear-gradient(to top, rgba(11,13,16,0.9) 4%, rgba(11,13,16,0) 50%)" }} />
          <div style={{ position: "absolute", left: u(20), top: u(20), display: "flex", ...chip(ACCENT) }}>
            {startedToday ? "Starts today" : "Live this week"}
          </div>
          <div style={{ position: "absolute", left: u(20), right: u(14), bottom: u(16), display: "flex", flexDirection: "column" }}>
            <div style={{ ...eyebrow(22), color: ACCENT }}>Crucible</div>
            <div style={{ ...display(46), color: BONE, marginTop: u(5) }}>Lord Saladin</div>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            width: u((HERO_H * 16) / 9),
            overflow: "hidden",
            border: `${u(1)}px solid rgba(255,255,255,0.16)`,
          }}
        >
          {setArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={setArt} alt="" style={{ ...fill, objectFit: "cover" }} />
          ) : null}
          <div style={{ ...fill, backgroundImage: "linear-gradient(to top, rgba(11,13,16,0.9) 2%, rgba(11,13,16,0) 30%)" }} />
          <div style={{ position: "absolute", left: u(18), bottom: u(14), display: "flex", alignItems: "baseline", gap: u(14) }}>
            <div style={{ ...eyebrow(22), color: ACCENT }}>Armor set</div>
            <div style={{ ...display(40), color: BONE }}>{setName}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: `${u(22)}px 0 ${u(12)}px` }}>
        <div style={{ ...eyebrow(30), color: BONE }}>Focus weapons</div>
        <div style={{ ...eyebrow(22), color: ACCENT }}>Saladin · focused decoding</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: u(10) }}>
        {weapons.map((item) => (
          <Weapon key={item.itemHash} item={item} />
        ))}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: u(10),
            width: u(555),
            height: u(128),
            padding: `0 ${u(20)}px`,
            border: `${u(1)}px solid rgba(255,255,255,0.14)`,
            background: PANEL,
            backgroundImage: "radial-gradient(ellipse 90% 90% at 100% 100%, rgba(36,180,179,0.16), rgba(36,180,179,0) 70%)",
          }}
        >
          <div style={{ ...display(30), color: BONE }}>All Iron Banner loot</div>
          <div style={{ ...eyebrow(30), color: TEAL }}>d2collector.site</div>
        </div>
      </div>
    </ShareFrame>,
  );
}
