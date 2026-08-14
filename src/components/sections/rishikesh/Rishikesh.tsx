import { RISHIKESH } from "@/data/rishikesh.data";
import RishikeshLineReveal from "@/components/effects/RishikeshLineReveal";
import RishikeshPhotoReveal from "@/components/effects/RishikeshPhotoReveal";
import RishikeshDotsReveal from "@/components/effects/RishikeshDotsReveal";
import RishikeshScrollSequence from "@/components/effects/RishikeshScrollSequence";
import RishikeshRiver from "@/components/sections/rishikesh/RishikeshRiver";
import RishikeshRemember from "@/components/sections/rishikesh/RishikeshRemember";
import TextRevealCanvas from "@/components/effects/TextRevealCanvas";

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
// HORIZONTAL RAIL. Everything from here to the end of the page scrolls
// sideways, and this section is where that starts — not as a new section
// after Rishikesh, but with Rishikesh itself as PANEL 1 of the rail. So
// there is one <section>, one sticky viewport-sized frame, and a flex row
// of full-width panels inside it: the Rishikesh photo state, then
// "Rishikesh 2" (RishikeshRiver.tsx, Figma node 800:2). Further panels get
// appended to that row as they're designed; nothing else has to change.
//
// Only ONE <section> element for the whole rail, deliberately:
// RishikeshLineReveal resolves its ScrollTrigger via el.closest("section"),
// so a second section element inside the rail would silently hand it a
// different trigger box. Panels are plain divs.
//
// The rail's translateX is live and belongs to the SAME shared timeline as
// panel 1's dissolve and dots — see RishikeshScrollSequence.tsx. It runs
// last, after a hold, so panel 1 is complete and at rest before it travels,
// and it is one tween PER PANEL CHANGE rather than one tween across the whole
// width: the rail advances exactly one panel, holds, then advances again, so
// each panel is seen at rest instead of the whole rail making one long
// uninterrupted pan. The track grew 250 → 400 → 550dvh to buy those beats
// their own scroll room without compressing panel 1's; see the note on the
// track div below for why 150dvh per panel has to be exact.
//
// Text lockup is mathematically dead-center of the 1440x1024 frame (per
// Figma dev-mode metadata, the lockup's bounding-box center lands exactly
// on the frame's own center), so a simple flex-centered panel reproduces
// the design without needing Figma's own absolute+translate centering hack
// — same technique Hero already uses.
// ───────────────────────────────────────────────────────────────────────

export default function Rishikesh() {
  return (
    // Scroll track. The section itself is only ever one viewport tall and
    // sticks to the top of it; this wrapper's EXTRA height is the scroll
    // distance the pinned sequence plays across. 550dvh = 100dvh of section
    // + 450dvh of sequence room.
    //
    // GROW THIS BY 150dvh EVERY TIME A PANEL IS ADDED TO THE RAIL. It went
    // 250 → 400 when panel 2 started moving and 400 → 550 for panel 3, and
    // the exactness is load-bearing rather than a round number: ScrollTrigger
    // maps the shared timeline's virtual units onto this travel linearly, and
    // each panel costs the timeline exactly 2.11 units (a 0.29 hold plus a
    // 1.82 slide) — the same 2.11 that panel 1's own beats occupy, which
    // originally mapped onto 150dvh. So 150dvh per panel is what keeps panel
    // 1's dissolve and dot cascade landing at the same physical scroll
    // positions they were already tuned at. Add a panel without adding the
    // height and the approved first panel silently re-times.
    // See lib/rishikeshHorizontal.config.ts for the full arithmetic.
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
      className="relative h-[550dvh] w-full shrink-0"
    >
      {/* The sticky frame. Exactly one viewport, and it CLIPS — that clip is
          what makes the rail work: the row inside is wider than the screen,
          and only the panel currently aligned to this box is visible.
          Without overflow-hidden here, panel 2 would sit off the right edge
          of the document and add horizontal page scroll. */}
      <section
        data-figma-node="779:92"
        className="sticky top-0 h-dvh w-full overflow-hidden"
      >
        {/* The rail. A flex row of viewport-wide panels, translated on X off
            the shared timeline (RishikeshScrollSequence.tsx). w-max rather
            than a hardcoded w-[200vw] so appending a third panel needs no
            arithmetic here — each panel carries its own w-screen shrink-0,
            and the slide reads its own distance from this element's
            scrollWidth at refresh time rather than from a panel count. */}
        <div data-rishikesh-rail="" className="flex h-full w-max">
          {/* ── Panel 1 — Rishikesh (Figma node 779:92 / 785:67) ─────────
              `relative` re-anchors every absolutely-positioned child below
              (photo, veil, line, dots, scroll indicator) to this panel
              instead of to the section. Same box, same geometry — the panel
              is w-screen h-full inside a viewport-sized frame — so nothing
              shifts.

              `isolate` moved here from the section on purpose: the lockup
              uses mix-blend-hard-light, and a stacking context on the
              section would let it blend against whatever else is in the
              rail. Scoped to this panel, it can only ever blend against
              this panel's own photo/veil stack, which is what the design
              intends. */}
          <div
            data-rishikesh-panel="rishikesh"
            className="relative isolate flex h-full w-screen shrink-0 items-center justify-center"
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

            {/* Text lockup, with the same WebGL dissolve the Hero uses.
                TextRevealCanvas renders its own `relative` wrapper div, so the
                classes that were on the plain div here transfer to it verbatim
                (minus the now-redundant `relative`) and the layout is
                unchanged. mix-blend-hard-light still applies: the canvas is a
                child of this wrapper, so the whole reveal blends against
                panel 1's own photo/veil stack exactly as the DOM text did.

                Default trigger — this panel arrives by ordinary vertical
                scrolling, so the standard "fires when it clears 10% up from
                the bottom of the viewport" behaviour is correct. Panel 2 is
                the one that needs an override. */}
            <TextRevealCanvas className="z-10 flex flex-col items-center justify-center text-center text-paper mix-blend-hard-light">
              <div className="flex w-[420px] flex-col items-center">
                <p
                  data-reveal-text
                  className="font-display text-about-headline hero-text-reveal w-full uppercase not-italic"
                >
                  {RISHIKESH.the}
                </p>
                <p
                  data-reveal-text
                  className="font-display text-about-headline hero-text-reveal w-full whitespace-nowrap uppercase not-italic"
                >
                  {RISHIKESH.bakhayi}
                </p>
                <p
                  data-reveal-text
                  className="font-display text-about-headline hero-text-reveal w-full uppercase not-italic"
                >
                  {RISHIKESH.experience}
                </p>
              </div>
              <p
                data-reveal-text
                className="font-display text-rishikesh-display hero-text-reveal whitespace-nowrap uppercase not-italic"
              >
                {RISHIKESH.title}
              </p>
            </TextRevealCanvas>

            {/* Nine floating word-dots (785:79-103), raw px offsets against the
            1440x1024 frame — see rishikesh.data.ts for how these were
            resolved from Figma's calc() exports. Positions stay data-driven
            here; the staggered reveal-in timing is owned by
            RishikeshScrollSequence above, as part of its pinned sequence. */}
            <RishikeshDotsReveal
              dots={RISHIKESH.dots}
              icon={RISHIKESH.dotIcon}
            />

            {/* Scroll indicator, anchored to the bottom of the frame. */}
            <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-[5px] text-paper">
              <p className="font-body text-rishikesh-scroll uppercase">
                {RISHIKESH.scroll}
              </p>
              <img
                src={RISHIKESH.scrollIcon}
                alt=""
                aria-hidden="true"
                className="size-5 rotate-90"
              />
            </div>
          </div>

          {/* ── Panel 2 — "Rishikesh 2" (Figma node 800:2) ────────────────
              Sits clipped off the right edge of the sticky frame until the
              rail's slide brings it in. Fully rendered and laid out from
              first paint, not mounted on arrival — a panel that mounts
              mid-scroll would decode its photos while the rail is already
              moving, which is exactly when a hitch is most visible. */}
          <RishikeshRiver />

          {/* ── Panel 3 — "Rishikesh 3" (Figma node 804:45) ───────────────
              Same deal, two viewports off to the right. Appending it here is
              most of the work of adding a panel — the sequence emits one
              slide tween per gap between [data-rishikesh-panel] elements and
              reads its travel from their offsetLeft, so no distance is
              hardcoded anywhere. The ONE thing that does not follow
              automatically is the track height above; see the note there and
              in rishikeshHorizontal.config.ts. */}
          <RishikeshRemember />
        </div>
      </section>
    </div>
  );
}
