import { TRIALS_OF_OSIRIS_HUB } from "@/data/activities/trials-of-osiris";
import { resolveTrialsFeaturedMaps } from "@/lib/activities/trials-featured-maps";
import { resolveTrialsOfOsirisLoot } from "@/lib/activities/trials-of-osiris-loot";
import { bungieUrl, localImage } from "@/lib/share/assets";
import { BONE, display, eyebrow, PANEL, ShareFrame, shareJpegResponse, TEAL, u } from "@/lib/share/layout";
import { formatShareWeek } from "@/lib/share/reset";
import type { LootItem } from "@/types/activity-loot";

/**
 * Trials of Osiris image for X (approved design "pvp-trials-c"), posted on Fridays: current armor
 * set + the weekend's three maps, then the bonus-pool weapons.
 */

export const dynamic = "force-dynamic";

const ACCENT = "#e8c860";
const HERO_H = 430;

const fill = { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%" };

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
      <img
        src={bungieUrl(item.iconPath)}
        alt=""
        style={{ width: u(112), height: u(112), border: `${u(1)}px solid rgba(255,255,255,0.22)` }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ ...display(34), color: BONE }}>{item.name}</div>
        <div style={{ ...eyebrow(22), color: ACCENT, marginTop: u(8) }}>{item.classOrWeaponType ?? ""}</div>
      </div>
    </div>
  );
}

export async function GET() {
  const trials = await resolveTrialsFeaturedMaps();
  if (!trials.maps.length) return new Response("No Trials maps this weekend (Iron Banner week or Trials not live).", { status: 404 });

  const [loot, setArt, destinyIcon, logo] = await Promise.all([
    resolveTrialsOfOsirisLoot(),
    localImage(`/images/armor-set-previews/${TRIALS_OF_OSIRIS_HUB.armorSetPreviewFiles?.[0] ?? "cruel-electrum-set.webp"}`, 1400),
    localImage("/images/share/destiny-white.png", 200, true),
    localImage("/icon.png", 120, true),
  ]);
  const pool = loot.currentWeaponPools?.find((entry) => entry.isActive);
  const setName = (loot.currentArmorRows[0]?.setName ?? "Cruel Electrum").replace(/ Set$/, "");

  return shareJpegResponse(
    <ShareFrame
      dates={formatShareWeek(trials.weekStart, trials.weekEnd)}
      title="Trials of Osiris"
      titleSize={96}
      destinyIcon={destinyIcon}
      logo={logo}
      footer={false}
    >
      {/* Armor set (slightly cropped on the right) + the three maps as strips. */}
      <div style={{ display: "flex", gap: u(10), marginTop: u(26), height: u(HERO_H) }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            width: u(HERO_H * 1.62),
            overflow: "hidden",
            border: `${u(1)}px solid rgba(255,255,255,0.16)`,
          }}
        >
          {setArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={setArt} alt="" style={{ ...fill, objectFit: "cover", objectPosition: "0% 50%" }} />
          ) : null}
          <div style={{ ...fill, backgroundImage: "linear-gradient(to top, rgba(11,13,16,0.9) 2%, rgba(11,13,16,0) 30%)" }} />
          <div style={{ position: "absolute", left: u(18), bottom: u(14), display: "flex", alignItems: "baseline", gap: u(14) }}>
            <div style={{ ...eyebrow(22), color: ACCENT }}>Armor set</div>
            <div style={{ ...display(40), color: BONE }}>{setName}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: u(8), flex: 1 }}>
          {trials.maps.slice(0, 3).map((map, index) => (
            <div
              key={map.name}
              style={{ position: "relative", display: "flex", flex: 1, overflow: "hidden", border: `${u(1)}px solid rgba(255,255,255,0.16)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bungieUrl(map.imagePath)} alt="" style={{ ...fill, objectFit: "cover" }} />
              <div style={{ ...fill, backgroundImage: "linear-gradient(to right, rgba(11,13,16,0.92) 10%, rgba(11,13,16,0.2) 75%)" }} />
              <div style={{ position: "absolute", left: u(18), top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ ...eyebrow(20), color: ACCENT }}>{`Map ${index + 1}`}</div>
                <div style={{ ...display(38), color: BONE, marginTop: u(4) }}>{map.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: `${u(22)}px 0 ${u(12)}px` }}>
        <div style={{ ...eyebrow(30), color: BONE }}>Bonus weapons</div>
        <div style={{ ...eyebrow(22), color: ACCENT }}>{`Saint-14 · ${pool?.label.toLowerCase() ?? "bonus pool"}`}</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: u(10) }}>
        {(pool?.items ?? []).map((item) => (
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
          <div style={{ ...display(30), color: BONE }}>All Trials loot</div>
          <div style={{ ...eyebrow(30), color: TEAL }}>d2collector.site</div>
        </div>
      </div>
    </ShareFrame>,
  );
}
