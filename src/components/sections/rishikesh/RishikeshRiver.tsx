import { RISHIKESH_RIVER } from "@/data/rishikeshRiver.data";
import TextRevealCanvas from "@/components/effects/TextRevealCanvas";

// ─── Horizontal rail, panel 2 — "Rishikesh 2" (Figma node 800:2) ───────────
// This renders the panel at rest, exactly as designed, and owns no animation
// whatsoever — not even a scroll reveal. The panel's arrival (sliding in from
// the right as the rail translates) is not this file's job; it belongs to the
// rail's shared timeline in RishikeshScrollSequence.tsx, for the same reason
// panel 1's crossfade lives there rather than in its own components: one
// sticky range can only be described by one scrubbed timeline, and a second
// ScrollTrigger against the same track would be a rival progress clock that
// disagrees with the first the moment either is refreshed.
//
// Not a <section>. It's a panel inside the rail that lives inside the
// Rishikesh <section> (see Rishikesh.tsx) — there is exactly one section
// element for the whole pinned rail, because RishikeshLineReveal finds its
// ScrollTrigger via el.closest("section") and a second section element
// here would silently hand it the wrong trigger box.
//
// Which is also why the background line here is a plain <img> rather than
// <RishikeshLineReveal>. Visually the two panels' lines are the same asset
// at the same offsets (see rishikeshRiver.data.ts), but panel 1's draws
// itself in against the section's ENTRY scroll — scroll that has long since
// passed by the time this panel is on screen. Wrapping this one in the same
// component would give it a trigger range it can never satisfy and leave it
// stuck part-drawn. If this line should animate at all, it animates as part
// of the rail's timeline in Pass 2.
//
// Locked to the exact 1440x1024 desktop frame, same rationale as every
// other section: no mobile frame exists in Figma yet, so there is nothing
// to interpolate toward. Revisit with real breakpoints once one is drawn.
//
// The Nav is present inside this Figma frame (node 800:9) as it is inside
// every frame in the file — Figma duplicates it so each frame screenshots
// standalone. It is NOT rendered here; the real nav is global.
// ───────────────────────────────────────────────────────────────────────────

export default function RishikeshRiver() {
  return (
    <div
      data-rishikesh-panel="river"
      data-figma-node="800:2"
      className="relative flex h-full w-screen shrink-0 items-center justify-center overflow-hidden bg-sand"
    >
      {/* Background wavy line ("Vector 80", node 800:3). Same drawing and the
          same negative bleed offsets as the first panel, but a separate file
          because the fill is inverted for this panel's light background —
          see rishikeshRiver.data.ts for the diff that proved it. And see the
          note above on why this is a bare <img> and not RishikeshLineReveal. */}
      <img
        src={RISHIKESH_RIVER.line}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-[-167.28px] top-[-571.5px] z-0 block h-[2000px] w-[1507.04px] max-w-none object-contain"
      />

      {/* Photographs (nodes 800:7, 800:8). Absolutely positioned against the
          1440x1024 frame; geometry is data-driven so a Figma nudge is a
          one-line edit in rishikeshRiver.data.ts rather than a className
          change here. Inline styles rather than Tailwind arbitrary values
          because Tailwind only extracts class strings it can see statically
          in the JSX, and these come from data. */}
      {Object.entries(RISHIKESH_RIVER.photos).map(([key, photo]) => (
        <div
          key={key}
          className="pointer-events-none absolute z-[1] overflow-hidden"
          style={{
            left: photo.left,
            top: photo.top,
            width: photo.width,
            height: photo.height,
          }}
        >
          <img
            src={photo.src}
            alt=""
            aria-hidden="true"
            className="block size-full max-w-none object-cover"
          />
        </div>
      ))}

      {/* Text lockup (node 800:4) — dead-center of the frame per dev-mode
          metadata, so the panel's own flex centering reproduces it without
          Figma's absolute + translate hack. Same approach as the Rishikesh
          lockup one panel to the left.

          text-ink, not a literal black: Figma reports #000000 on this text
          while the file's own Content/Dark variable is #0A0904 — a
          difference of 10/9/4 out of 255, invisible in situ. Following the
          About section, which uses --color-ink for body copy on this same
          sand background, keeps the palette to the four tokens that
          actually exist instead of introducing a fifth near-identical one. */}
      {/* The headline carries the same WebGL dissolve as the Hero, fired off
          THIS BLOCK's own box rather than the panel's.

          It used to watch the panel at a 0.98 threshold, on the reasoning that
          a viewport-wide panel inside a viewport-wide frame can only reach
          full ratio once the rail has come to rest — so the dissolve would
          never overlap the slide. Correct in the abstract, wrong to watch:
          it tied the reveal to the panel's LAST pixel arriving, which meant
          the heading sat blank in frame, plainly visible and plainly empty,
          for most of the travel and only resolved after everything stopped.

          Watching this block instead ties the reveal to the thing the eye is
          actually waiting for. The block is ~704px inside a ~1440px panel, so
          it clears the clip partway through the slide, and threshold 0 starts
          the clock on its first pixel. The dissolve then runs across the tail
          of the travel and lands close to rest.

          This does mean two things move at once for the overlap, which the
          rest of the page's sequencing avoids. It's deliberate here: they are
          the same object. The heading is not a second beat competing with the
          slide, it's the slide's payload resolving as it arrives.

          Only the headline gets `data-reveal-text` — the body paragraph is
          justified multi-line copy at body size, where the SDF re-render
          would have to reproduce the browser's justification word-spacing
          exactly to avoid ghosting against the DOM text underneath. */}
      <TextRevealCanvas
        className="z-[2] flex w-[704.169px] flex-col items-center gap-6 text-ink"
        trigger={{
          threshold: 0,
          rootMargin: "0px",
        }}
      >
        <p
          data-reveal-text
          className="font-display text-rishikesh-river-headline hero-text-reveal w-full text-center uppercase not-italic"
        >
          {RISHIKESH_RIVER.headline}
        </p>
        <p className="font-body text-about-body w-[386.051px] text-justify">
          {RISHIKESH_RIVER.body}
        </p>
      </TextRevealCanvas>
    </div>
  );
}
