import { AlmostComplete, ClosestTitles, JumpBackIn } from "@/components/home/home-continue-parts";

/** Continue: closest titles, collections near completion, recently viewed. */
export function HomeContinue() {
  return (
    <section className="mx-auto max-w-[1360px] px-4 pt-10 sm:px-6">
      <div className="mb-3.5 flex items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">Continue</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <ClosestTitles />
        <AlmostComplete />
        <JumpBackIn />
      </div>
    </section>
  );
}
