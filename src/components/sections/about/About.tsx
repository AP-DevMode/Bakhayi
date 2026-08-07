import { ABOUT } from "@/data/about.data";
import IllustrationReveal from "@/components/effects/IllustrationReveal";
import TextRevealCanvas from "@/components/effects/TextRevealCanvas";
import Clouds from "@/components/effects/Clouds";

// ─── Pass 1: structure only (+ one scoped reveal interaction) ─────────────
// Static layout matching Figma node 760:45 at rest.
//
// Two stacked blocks, per Figma:
//   1. "Pre-About" — full-bleed eyebrow + headline over two mountain
//      illustrations, with a soft cloud layer on top. Locked to the exact
//      1440px desktop frame (same rationale as Hero: no mobile frame exists
//      in Figma yet, so there's nothing to interpolate toward — revisit
//      with real breakpoints once one is designed).
//   2. "About" — a short kicker line + a paragraph of body copy, centered
//      in a fixed 440px column per spec.
//
// The two mountain illustrations are the user's own uploaded SVGs
// (public/Illustrations) — used as-is, without the extra rotate/flip
// transform Figma's dev-mode export applies to its own internal asset,
// since these files are already authored for their respective sides.
// They're wrapped in IllustrationReveal (components/effects) so each one
// wipes into view the first time it's scrolled into frame — see that file
// for where the interaction was adapted from and why. The right side is
// given a slight stagger so the two don't reveal in lockstep.
//
// The eyebrow + headline are wired into the same TextRevealCanvas WebGL
// reveal as the Hero (components/effects/TextRevealCanvas) — real DOM text
// for layout/SEO/accessibility, with an SDF copy that dissolves in over it.
// Hero's captions are each a single line, so that component never had to
// wrap text; About's headline is a genuine paragraph that wraps across
// lines in the DOM (see about.data.ts), so TextRevealCanvas now also
// constrains the SDF mesh to the node's own width and mirrors its
// text-align, so the WebGL copy breaks lines in the same places the real
// text does. Unlike Hero (always in view at load), About sits below the
// fold, so TextRevealCanvas now defers its first build until the section
// scrolls into view — see that file for the IntersectionObserver gate.
//
// The cloud layer (Figma node 760:57, "1 6") is animated in Figma
// (mix-blend-screen). It's now driven by the Clouds shader component
// (components/effects/Clouds) instead of the static PNG this section used
// to render — a WebGL2 fog effect that drifts continuously and parts along
// the cursor's trail. Clouds wraps BOTH stacked blocks (Pre-About's text
// reveal + mountains, AND the About kicker/body block below it) as its
// children, so the fog spans the section's full height rather than
// stopping at the Pre-About block's own bottom edge. Its content wrapper
// is patched to `overflow: visible` (see Clouds.tsx) so it doesn't clip the
// mountains' intentional bottom bleed.
// ───────────────────────────────────────────────────────────────────────────

export default function About() {
  return (
    <section
      data-figma-node="760:45"
      className="relative flex w-full flex-col items-center overflow-x-clip bg-sand"
    >
      {/* Clouds carries no fixed height of its own: its two children below
          are normal-flow, non-absolute blocks (942px + 680px), so their
          combined height becomes Clouds' own content height, and the fog
          canvas (absolutely positioned inset-0 inside Clouds) stretches to
          match automatically — covering the whole section, not just the
          Pre-About block. */}
      <Clouds
        className="block w-full"
        scale={1}
        speed={0.3}
        cover={0.4}
        density={3.2}
        shading={0.6}
        opacity={2}
        shadow={0.08}
        shadowOffsetX={200}
        shadowOffsetY={-10}
        shadowSoftness={1}
        wind={0.6}
        windRadius={320}
        refraction={0}
        fogBlur={1}
        quality={1}
        // Explicit sand RGB (219/208/195, i.e. #dbd0c3 normalized to 0–1)
        // rather than color="auto". The real cause of an earlier
        // solid-black rendering wasn't color detection — it was
        // Clouds.tsx's html-in-canvas content-capture path being
        // (incorrectly) detected as available and polluting the composite
        // with an unpopulated black placeholder texture; that path is now
        // force-disabled in Clouds.tsx. This explicit value is kept anyway
        // as a belt-and-suspenders guard against "auto" ever misreading
        // the background in some browser.
        color={[219 / 255, 208 / 255, 195 / 255]}
      >
        {/* z-10: both illustrations bleed past this block's own 942px
            bottom edge on purpose (Figma's bleed values put them there).
            Without an explicit stacking order, the next sibling below —
            the kicker/body block — paints over that overflow in normal
            DOM order, silently clipping the bottom of each mountain
            (worse for the taller left one). Lifting this block above its
            sibling in the stacking order fixes that without touching
            either block's layout. */}
        <div className="relative z-10 h-[942px] w-full shrink-0">
          {/* Position/size live on this wrapper, not on TextRevealCanvas's
              own div — that div is already `relative` internally (it
              anchors the absolutely-positioned reveal canvas), and
              stacking `absolute` and `relative` on the same element is a
              genuine Tailwind footgun: both utilities land in the same
              layer, so whichever is later in the compiled stylesheet wins
              regardless of className order, not necessarily the one that
              looks intentional. Keeping them on separate elements
              sidesteps that entirely. */}
          <div className="absolute top-1/2 left-1/2 w-[857.384px] -translate-x-1/2 -translate-y-1/2 text-center uppercase text-ink">
            <TextRevealCanvas className="flex w-full flex-col items-center gap-12">
              <p
                data-reveal-text
                className="font-display text-about-eyebrow hero-text-reveal w-full not-italic"
              >
                {ABOUT.eyebrow}
              </p>
              <p
                data-reveal-text
                className="font-display text-about-headline hero-text-reveal w-full not-italic"
              >
                {ABOUT.headline}
              </p>
            </TextRevealCanvas>
          </div>

          <IllustrationReveal className="absolute left-[-200px] top-[574.07px] h-[534.894px] w-[955.082px]">
            <img
              src={ABOUT.illustrations.left}
              alt=""
              aria-hidden="true"
              className="block size-full max-w-none object-contain"
            />
          </IllustrationReveal>

          <IllustrationReveal
            className="absolute left-[1108.1px] top-[694.07px] h-[371.758px] w-[663.793px]"
            staggered
          >
            <img
              src={ABOUT.illustrations.right}
              alt=""
              aria-hidden="true"
              className="block size-full max-w-none object-contain"
            />
          </IllustrationReveal>
        </div>

        <div className="relative flex h-[680px] w-full flex-col items-center justify-center gap-4 px-10 py-20">
          <div className="flex w-[440px] flex-col items-start gap-4 text-justify text-ink">
            <div className="font-body text-about-kicker flex w-full items-center justify-between whitespace-nowrap font-medium uppercase">
              {ABOUT.kicker.map((word, i) => (
                <span key={`${word}-${i}`}>{word}</span>
              ))}
            </div>
            <p className="font-body text-about-body w-full">{ABOUT.body}</p>
          </div>
        </div>
      </Clouds>
    </section>
  );
}
