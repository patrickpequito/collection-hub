import Link from "next/link";
import { PUBLISHED_EXPANSION_SLUGS } from "@/data/expansions";

type Card = { title: string; meta: string; image: string; href: string | null; now?: boolean };

/** Latest expansions plus the current update, newest on the right; links to the full Timeline. */
const CARDS: Card[] = [
  { title: "The Witch Queen", meta: "Year 5 · Expansion", image: "the-witch-queen", href: "/expansions/the-witch-queen" },
  { title: "Lightfall", meta: "Year 6 · Expansion", image: "lightfall", href: "/expansions/lightfall" },
  { title: "The Final Shape", meta: "Year 7 · Expansion", image: "the-final-shape", href: "/expansions/the-final-shape" },
  { title: "The Edge of Fate", meta: "Year 8 · Expansion", image: "the-edge-of-fate", href: "/expansions/the-edge-of-fate" },
  { title: "Renegades", meta: "Year 8 · Expansion", image: "renegades", href: "/expansions/renegades" },
].map((card) => ({
  ...card,
  image: `/images/expansions/activities/${card.image}.webp`,
  href: PUBLISHED_EXPANSION_SLUGS.has(card.href!.replace("/expansions/", "")) ? card.href : null,
}));

const NOW: Card = {
  title: "Monument of Triumph",
  meta: "Year 8 · Update",
  image: "/images/banners/monument-of-triumph.webp",
  href: "/activities/monument-of-triumph",
  now: true,
};

const SHADE =
  "absolute inset-0 bg-[linear-gradient(0deg,rgba(11,13,16,0.92)_8%,rgba(11,13,16,0.25)_65%,rgba(11,13,16,0.05))]";

function TimelineCard({ card }: { card: Card }) {
  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.image}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      />
      <span aria-hidden className={SHADE} />
      {card.now ? (
        <span className="absolute right-2 top-2 z-10 border border-[#e8c860]/60 bg-void/60 px-1.5 py-0.5 font-display text-[10.5px] uppercase tracking-[0.14em] text-[#e8c860]">
          Now
        </span>
      ) : null}
      <span className="text-on-art relative font-display text-[15px] font-semibold uppercase leading-tight tracking-[0.05em] text-white">
        {card.title}
      </span>
      <span className="text-on-art relative text-[12.5px] text-[#c7cad0]">{card.href ? card.meta : `${card.meta} · Soon`}</span>
    </>
  );
  const className = `group relative flex min-h-[96px] flex-col justify-end gap-0.5 overflow-hidden border bg-panel px-3 py-2.5 ${
    card.now ? "border-owned" : "border-white/[0.16]"
  }`;
  return card.href ? (
    <Link href={card.href} className={`${className} transition hover:border-bone/60`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** Timeline strip: five latest expansions and the current update. */
export function HomeTimelineStrip() {
  return (
    <section className="mx-auto max-w-[1360px] px-4 pt-10 sm:px-6">
      <div className="mb-3.5 flex items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">Timeline</h2>
        <Link href="/expansions" className="ui-label transition hover:text-bone">
          View full timeline →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {[...CARDS, NOW].map((card) => (
          <TimelineCard key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}
