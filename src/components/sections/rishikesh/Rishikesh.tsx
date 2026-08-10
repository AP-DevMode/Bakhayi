import { RISHIKESH } from "@/data/rishikesh.data";
import RishikeshLineReveal from "@/components/effects/RishikeshLineReveal";
import RishikeshPhotoReveal from "@/components/effects/RishikeshPhotoReveal";
import RishikeshDotsReveal from "@/components/effects/RishikeshDotsReveal";
import RishikeshScrollSequence from "@/components/effects/RishikeshScrollSequence";

// ─── Pass 1: structure, Pass 2: background line→photo crossfade + word-dots ─
// Static layout matching Figma node 779:92 at rest. 100vh full-bleed dark
// section, locked to the exact 1440x1024 desktop frame (same rationale as
// Hero/About: no mobile frame exists in Figma yet — revisit once one is
// designed).
//
// This ONE section also covers Figma node 785:67 (previously built as a
// separate "Rishikesh 2" section). Corrected after user feedback: Figma's
// second frame isn't a new section arriving on scroll — it's the same
// section's background after the photo has replaced the line illustration,
// duplicated into its own frame only so it screenshots standalone (same
// reason Figma duplicates the Nav inside every section frame). So: one
// <section>, one text lockup, and the background crossfades from the line
// illustration to the mountain photo as the user scrolls THROUGH this
// section, rather than scrolling past it into a second one. The nine
// floating word-dots (785:79-103) sit on top, staggering in once the photo
// crossfade has settled.
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
    // Scroll track. The section itself is only ever one viewport tall and
    // sticks to the top of it; this wrapper's EXTRA height is the scroll
    // distance the pinned sequence plays across. 250dvh = 100dvh of section
    // + 150dvh of sequence room.
    //
    // This replaced GSAP's own `pin: true`, which silently produced a
    // pin-spacer with ZERO added height on this page — verified in the
    // browser: the spacer measured exactly 861px against an 861px section,
    // so the crossfade and dots had no scroll room and never played at any
    // scroll position. GSAP's pin has to mutate document height at runtime,
    // which fights both Lenis (SmoothScroll.tsx re-measures Lenis on every
    // ScrollTrigger refresh, so refresh and resize can feed each other) and
    // the flex column in layout.tsx (a spacer is a flex item, and flex items
    // shrink). CSS sticky needs no spacer, mutates no heights, and cannot be
    // collapsed by either — so the scroll room is guaranteed by the DOM
    // before any JS runs.
    //
    // shrink-0 is load-bearing: <main> is `flex flex-col`, so without it
    // this over-tall child is a shrinkable flex item and collapses — the
    // same failure mode that killed the pin spacer.
    //
    // Keep this height in sync with the comment in
    // lib/rishikeshScrollSequence.config.ts. It lives here rather than in
    // that config because Tailwind only sees class strings it can extract
    // statically from JSX.
    <div
      data-rishikesh-track=""
      className="relative h-[250dvh] w-full shrink-0"
    >
      <section
        data-figma-node="779:92"
        className="sticky top-0 isolate flex h-dvh w-full items-center justify-center overflow-hidden"
      >
        {/* Full-bleed background photo (node 785:67 fill). Sits at the very
            bottom of the stack at full opacity from the start — it's never
            faded in. It's revealed instead by the espresso veil above it
            fading OUT, which is what makes the green background itself
            disappear rather than just getting covered up. See
            RishikeshPhotoReveal.tsx. */}
        <RishikeshPhotoReveal src={RISHIKESH.background} />

        {/* The section's espresso ("green") background, as its own layer
            rather than a bg-* class on the <section>. It has to be a real
            element so RishikeshScrollSequence can fade it out alongside the
            line illustration once the user scrolls past the fully-loaded
            section — a background-color on the section itself can't be
            faded independently of its children. Opaque by default, so with
            JS off (or prefers-reduced-motion) the section still reads as the
            designed green frame. */}
        <div
          data-rishikesh-bg=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-espresso"
        />

        {/* Background wavy line (Figma "Vector 80"). Raw px offsets against
            the 1440x1024 frame, exported directly from Figma dev mode for
            exact geometry — not reused from an existing similar-looking
            asset in public/Illustrations, since its dimensions didn't match.
            Draws in as the section scrolls into view, then holds fully drawn
            in once the section fills the viewport — see
            RishikeshLineReveal.tsx. It only fades back out once the user
            keeps scrolling further, driven by RishikeshScrollSequence below.
            z-[2] keeps it above the espresso veil it fades out together
            with. */}
        <RishikeshLineReveal
          src={RISHIKESH.line}
          className="pointer-events-none absolute left-[-167.28px] top-[-571.5px] z-[2] h-[2000px] w-[1507.04px]"
        />

        {/* Scrubs the line + espresso-veil fade-out and the dot stagger
            across the track's sticky travel above — see
            RishikeshScrollSequence.tsx for why it's a single shared
            orchestrator instead of three independent ScrollTriggers.
            Renders nothing itself. */}
        <RishikeshScrollSequence />

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

        {/* Nine floating word-dots (785:79-103), raw px offsets against the
            1440x1024 frame — see rishikesh.data.ts for how these were
            resolved from Figma's calc() exports. Positions stay data-driven
            here; the staggered reveal-in timing is owned by
            RishikeshScrollSequence above, as part of its pinned sequence. */}
        <RishikeshDotsReveal dots={RISHIKESH.dots} icon={RISHIKESH.dotIcon} />

        {/* Scroll indicator, anchored to the bottom of the frame. */}
        <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-[5px] text-paper">
          <p className="font-body text-rishikesh-scroll uppercase">{RISHIKESH.scroll}</p>
          <img
            src={RISHIKESH.scrollIcon}
            alt=""
            aria-hidden="true"
            className="size-5 rotate-90"
          />
        </div>
      </section>
    </div>
  );
}
