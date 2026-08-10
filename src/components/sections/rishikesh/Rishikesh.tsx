import { RISHIKESH } from "@/data/rishikesh.data";
import RishikeshLineReveal from "@/components/effects/RishikeshLineReveal";

// ─── Pass 1: structure, Pass 2: background line reveal ──────────────────
// Static layout matching Figma node 779:92 at rest. 100vh full-bleed dark
// section, locked to the exact 1440x1024 desktop frame (same rationale as
// Hero/About: no mobile frame exists in Figma yet — revisit once one is
// designed).
//
// A horizontal-scroll section is planned immediately AFTER this one — out
// of scope for Rishikesh itself, noted here only so the boundary stays
// clear for whoever builds that section next.
//
// Text lockup is mathematically dead-center of the 1440x1024 frame (per
// Figma dev-mode metadata, the lockup's bounding-box center lands exactly
// on the frame's own center), so a simple flex-centered min-h-dvh section
// reproduces the design without needing Figma's own absolute+translate
// centering hack — same technique Hero already uses.
// ───────────────────────────────────────────────────────────────────────

export default function Rishikesh() {
  return (
    <section
      data-figma-node="779:92"
      className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-espresso"
    >
      {/* Background wavy line (Figma "Vector 80"). Raw px offsets against
          the 1440x1024 frame, exported directly from Figma dev mode for
          exact geometry — not reused from an existing similar-looking
          asset in public/Illustrations, since its dimensions didn't match.
          Reveals progressively as the section scrolls into/through view —
          see RishikeshLineReveal.tsx for why this is a mask wipe rather
          than a literal SVG stroke-draw. */}
      <RishikeshLineReveal
        src={RISHIKESH.line}
        className="pointer-events-none absolute left-[-167.28px] top-[-571.5px] h-[2000px] w-[1507.04px]"
      />

      {/* Text lockup */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-paper mix-blend-hard-light">
        <div className="flex w-[420px] flex-col items-center">
          <p className="font-display text-about-headline w-full uppercase not-italic">
            {RISHIKESH.the}
          </p>
          <p className="font-display text-about-headline w-full whitespace-nowrap uppercase not-italic">
            {RISHIKESH.bakhayi}
          </p>
          <p className="font-display text-about-headline w-full uppercase not-italic">
            {RISHIKESH.experience}
          </p>
        </div>
        <p className="font-display text-rishikesh-display whitespace-nowrap uppercase not-italic">
          {RISHIKESH.title}
        </p>
      </div>

      {/* Scroll indicator, anchored to the bottom of the frame. */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-[5px] text-paper">
        <p className="font-body text-rishikesh-scroll uppercase">{RISHIKESH.scroll}</p>
        <img
          src={RISHIKESH.scrollIcon}
          alt=""
          aria-hidden="true"
          className="size-5 rotate-90"
        />
      </div>
    </section>
  );
}
