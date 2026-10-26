import type { CurseState } from "@/lib/destinations/weekly";

/** Taken look: inky black, white-cyan glow and a few light motes. */
const TAKEN_BACKGROUND = [
  "radial-gradient(circle at 10% 30%, rgba(190,235,255,.16), transparent 38%)",
  "radial-gradient(circle at 88% 80%, rgba(120,90,200,.14), transparent 40%)",
  "radial-gradient(1.5px 1.5px at 22% 70%, rgba(230,250,255,.8), transparent 60%)",
  "radial-gradient(1px 1px at 48% 18%, rgba(230,250,255,.7), transparent 60%)",
  "radial-gradient(1.5px 1.5px at 67% 55%, rgba(230,250,255,.6), transparent 60%)",
  "radial-gradient(1px 1px at 92% 25%, rgba(230,250,255,.8), transparent 60%)",
  "#05060a",
].join(", ");

const GLOW = "0 0 10px rgba(190,235,255,.85), 0 0 22px rgba(160,220,255,.4)";

function TakenEye() {
  return (
    <svg width="34" height="34" viewBox="0 0 44 44" aria-hidden className="shrink-0">
      <path
        d="M22 4 L40 22 L22 40 L4 22 Z"
        fill="none"
        stroke="#dff6ff"
        strokeWidth="1.5"
        style={{ filter: "drop-shadow(0 0 6px rgba(190,235,255,.9))" }}
      />
      <path
        d="M22 13 C29 13 33 22 33 22 C33 22 29 31 22 31 C15 31 11 22 11 22 C11 22 15 13 22 13 Z"
        fill="#05060a"
        stroke="#dff6ff"
        strokeWidth="1.2"
      />
      <circle cx="22" cy="22" r="3.6" fill="#dff6ff" style={{ filter: "drop-shadow(0 0 5px #bfeaff)" }} />
    </svg>
  );
}

/** Dreaming City curse strength: one row with the level, a segmented meter and the week. */
export function CurseBar({ curse }: { curse: CurseState }) {
  const { levels, current } = curse;
  return (
    <div
      className="flex flex-wrap items-center gap-x-[18px] gap-y-3 border border-[rgba(200,240,255,.35)] px-[18px] py-3.5"
      style={{ background: TAKEN_BACKGROUND, boxShadow: "inset 0 0 24px rgba(190,235,255,.10)" }}
    >
      <TakenEye />
      <div className="flex min-w-[150px] flex-col gap-[3px]">
        <span className="ui-label text-[11px]! text-[#9fb8c6]!">Curse strength</span>
        <span
          className="font-display text-2xl font-semibold uppercase leading-none tracking-[0.08em] text-[#f2fbff]"
          style={{ textShadow: "0 0 10px rgba(190,235,255,.85), 0 0 22px rgba(160,220,255,.45)" }}
        >
          {levels[current]}
        </span>
      </div>
      <div className="order-last flex basis-full gap-[5px] sm:order-none sm:flex-1 sm:basis-auto">
        {levels.map((level, index) => {
          const lit = index <= current;
          const isCurrent = index === current;
          return (
            <span
              key={level}
              className={`flex h-[22px] flex-1 items-center justify-center font-display text-[11px] uppercase tracking-[0.16em] ${
                lit
                  ? `border border-[#e9f8ff] bg-[linear-gradient(90deg,#f4fcff,#bfe9ff)] ${
                      isCurrent ? "font-semibold text-[#05060a]" : "text-[#05060a]/40"
                    }`
                  : "border border-dashed border-[rgba(200,240,255,.28)] bg-white/[0.02] text-[#6f8593]"
              }`}
              style={lit ? { boxShadow: GLOW } : undefined}
            >
              {level}
            </span>
          );
        })}
      </div>
      <div className="ml-auto flex min-w-[150px] flex-col gap-[3px] text-right sm:ml-0">
        <span className="ui-label text-[11px]!">
          Week {current + 1} of {levels.length}
        </span>
      </div>
    </div>
  );
}
