import { BONE, chip, display, EXOTIC, GOLD, ShareFrame, shareJpegResponse, TEAL, u, VOID, eyebrow } from "@/lib/share/layout";
import { formatShareWeek, loadResetShareData, type ShareActivityRow, type ShareBoss } from "@/lib/share/reset";

/** Weekly reset image for X (approved design "E1"): Pantheon bosses, Tier 5 ribbon, featured raids and dungeons. */

export const dynamic = "force-dynamic";

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
  const data = await loadResetShareData();
  return shareJpegResponse(
    <ShareFrame
      dates={formatShareWeek(data.weekStart, data.weekEnd)}
      title="This week"
      destinyIcon={data.destinyIcon}
      logo={data.logo}
    >
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
    </ShareFrame>,
  );
}
