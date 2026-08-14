import { RISHIKESH_REMEMBER } from "@/data/rishikeshRemember.data";
import TextRevealCanvas from "@/components/effects/TextRevealCanvas";

// ─── Horizontal rail, panel 3 — "Rishikesh 3" (Figma node 804:45) ──────────
// Renders the panel at rest and owns no scroll animation of its own, for the
// same reason RishikeshRiver.tsx doesn't: the panel's arrival belongs to the
// rail's single shared timeline in RishikeshScrollSequence.tsx. One sticky
// range can only be described by one scrubbed timeline; a second
// ScrollTrigger against the same track is a rival progress clock that
// disagrees with the first the moment either refreshes.
//
// Not a <section>, same as panel 2 — RishikeshLineReveal resolves its
// trigger via el.closest("section"), so there is exactly one section element
// for the whole pinned rail (see Rishikesh.tsx). Panels are plain divs.
//
// The only motion here is the lede's WebGL dissolve, which is the site-wide
// heading treatment rather than a flourish specific to this panel.
//
// ─── FILL, NOT ABSOLUTE ────────────────────────────────────────────────────
// This is the first panel on the rail built to FILL its container rather
// than to reproduce Figma's absolute offsets, and the two other panels
// should follow when they're next touched. The layout is one padded flex
// row: two equal columns, each of which fills the row's height, with both
// photos filling their own box completely and the type carrying percentage
// measures of the column it sits in. Every number still comes from Figma —
// see rishikeshRemember.data.ts, where they're divided by the 1440x1024
// frame they were measured against.
//
// The reason is measurable rather than stylistic. The absolute version put
// the text column at a fixed top: 157 and the valley photo at a fixed
// height: 600, which together assume 1024px of height exists. On the real
// browser viewport (805px tall) the lede landed at y781 with one line
// showing and the body was entirely below the fold. In the fill version the
// valley photo is the flex-grow child, so it is the thing that absorbs the
// difference: it eats Figma's 117px of dead space on a tall screen and
// gives height back on a short one, and the type never moves off-screen.
//
// The only knowing deviation from the Figma frame is therefore that photo's
// height. Nothing else changes at 1440x1024.
//
// Type sizes are still fixed px (via the tokens), not fluid — that's a
// site-wide decision that would touch every other section, not something to
// settle inside one panel.
//
// The Nav lockup is present inside this Figma frame (nodes 804:52-804:86) as
// it is inside every frame in the file — Figma duplicates it so each frame
// screenshots standalone. It is NOT rendered here; the real nav is global.
// (Its two small PNGs and its logo SVG came back from download_assets for the
// same reason and were likewise not committed.)
// ───────────────────────────────────────────────────────────────────────────

// Figma px → a percentage of whatever it was measured against. Kept here
// rather than in the data file so the data file stays readable as a list of
// inspector values, and kept as a helper rather than as pre-computed
// constants so a changed figure upstream needs no second edit.
const ratio = (value: number, basis: number) => `${(value / basis) * 100}%`;

// Figma px → a viewport-width-proportional length with a hard floor. Used
// for the frame padding and the column gap, which should keep the panel's
// proportions on a large display but must not shrink to nothing on a small
// one. `max()` rather than `clamp()` deliberately: there's no upper bound
// worth setting, since a wider panel genuinely should breathe more.
const fluid = (value: number, basis: number, floor: number) =>
  `max(${floor}px, ${(value / basis) * 100}vw)`;

export default function RishikeshRemember() {
  const { frame, layout, photos, column } = RISHIKESH_REMEMBER;

  return (
    <div
      data-rishikesh-panel="remember"
      data-figma-node="804:45"
      // bg-espresso on the panel rather than on <section>: neither photo
      // bleeds to an edge, so the brand background is doing real work on all
      // four sides here, not just sitting behind an opaque image.
      className="relative flex h-full w-screen shrink-0 overflow-hidden bg-espresso"
      style={{
        padding: fluid(layout.padding, frame.width, layout.paddingFloor),
        gap: fluid(layout.columnGap, frame.width, layout.columnGapFloor),
      }}
    >
      {/* Left column (node 804:47). `basis-0` alongside flexGrow so the two
          columns split the row by their Figma ratio and not by their
          content's intrinsic width — without it a long word in the body
          would widen this column and squeeze the ridge. `min-w-0` for the
          same reason, and `min-h-0` so the photo inside can actually shrink
          rather than forcing the column taller than the panel.

          items-end is what right-aligns the narrower body paragraph to the
          column's right edge while the lede stays left-aligned inside its
          own full-width sub-stack. */}
      <div
        className="flex min-h-0 min-w-0 basis-0 flex-col items-end"
        style={{ flexGrow: layout.columns.left, gap: column.gap }}
      >
        {/* Sub-stack 804:48 — photo above lede. This is the flex-grow child
            of the column, so it takes all the height the body paragraph
            below doesn't need. */}
        <div
          className="flex min-h-0 w-full flex-1 flex-col items-start"
          style={{ gap: column.innerGap }}
        >
          {/* The valley (node 804:49). flex-1 + min-h-0 is the whole
              responsive mechanism on this panel: this box is the only thing
              here without a natural height of its own, so it's what absorbs
              the difference between the viewport and the 1024px frame. See
              the header note. */}
          <div className="pointer-events-none relative min-h-0 w-full flex-1 overflow-hidden">
            {/* absolute inset-0 rather than size-full: the wrapper's height
                comes from flex-grow, and a percentage height on a child
                resolving against a flex-resolved parent is the one case
                browsers have historically disagreed on. Absolute positioning
                against a `relative` wrapper has no such ambiguity — the image
                fills the box the flex algorithm produced, whatever it is. */}
            <img
              src={photos.valley.src}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 block size-full max-w-none object-cover"
            />
          </div>

          {/* The lede (node 804:50), carrying the same WebGL dissolve as
              every other heading on the site. Its measure is a percentage of
              the column rather than Figma's 386.051px, so the line count
              holds as the column resizes — TextRevealCanvas re-measures and
              rebuilds its SDF meshes on its own ResizeObserver, so the
              dissolve tracks the new wrap instead of ghosting against it.

              Inline style rather than a Tailwind class because the value
              comes from a data file, and Tailwind only extracts arbitrary
              values it can see statically in the JSX.

              Trigger override, same as the river panel and for the same
              reason: the default rootMargin's -10% bottom inset describes an
              element rising into view, which is not how anything on this rail
              arrives. Panels come in sideways, and an IntersectionObserver's
              rect is clipped by the rail's overflow-hidden, so what matters
              is when this block clears that clip — threshold 0 starts the
              clock on its first pixel.

              The block sits hard against the panel's LEADING edge as it
              travels in, so the dissolve starts early in the slide and has
              resolved well before the rail comes to rest. That is deliberate
              and is the correction Pawan asked for on panel 2: a heading
              gated behind its panel's arrival sits visibly blank for the
              whole travel. Two things move at once during the overlap, which
              the rest of the page's sequencing avoids — but they are the same
              object, so it reads as the slide's payload resolving as it lands
              rather than as two beats colliding.

              Only the lede gets `data-reveal-text`. The body below is
              justified multi-line copy at body size, where the SDF re-render
              would have to reproduce the browser's justification word-spacing
              exactly to avoid ghosting against the DOM text underneath. */}
          <TextRevealCanvas
            className="shrink-0 text-paper"
            style={{ width: ratio(column.ledeWidth, layout.columns.left) }}
            trigger={{
              threshold: 0,
              rootMargin: "0px",
            }}
          >
            <p
              data-reveal-text
              className="font-display text-rishikesh-remember-lede hero-text-reveal w-full uppercase not-italic"
            >
              {RISHIKESH_REMEMBER.lede}
            </p>
          </TextRevealCanvas>
        </div>

        {/* The body (node 804:51). shrink-0 so it keeps its natural height
            and the photo above is what gives way. opacity-80 is Figma's,
            applied as an element style rather than folded into the type
            token — see tokens.css. */}
        <p
          className="font-body text-about-body shrink-0 text-justify text-paper opacity-80"
          style={{ width: ratio(column.bodyWidth, layout.columns.left) }}
        >
          {RISHIKESH_REMEMBER.body}
        </p>
      </div>

      {/* The ridge (node 804:46), right-hand column. Fills its half of the
          row outright — full width, full height, object-cover — which at
          1440x1024 reproduces Figma's 670x944 box exactly, since the panel's
          padding is what draws that box's margins. */}
      <div
        className="pointer-events-none relative min-w-0 basis-0 overflow-hidden"
        style={{ flexGrow: layout.columns.right }}
      >
        <img
          src={photos.ridge.src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 block size-full max-w-none object-cover"
        />
      </div>
    </div>
  );
}
