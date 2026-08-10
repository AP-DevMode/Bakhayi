"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RISHIKESH_LINE_REVEAL_CONFIG } from "@/lib/rishikeshLineReveal.config";

gsap.registerPlugin(ScrollTrigger);

// ─── Rishikesh background line — scroll-scrubbed reveal ─────────────────
// Inspired by mindmarket.com's scroll-drawn SVG icons, which use GSAP's
// DrawSVGPlugin (stroke-dashoffset) to draw a line in as you scroll.
// Rishikesh-Line.svg can't use that technique directly: inspecting the
// asset showed it's a 121-subpath compound FILL shape (no `stroke`
// anywhere), i.e. a brush illustration exported as filled outlines rather
// than an actual stroked line — dash properties have nothing to animate on
// a fill-only path.
//
// This recreates the same *feeling* — the artwork progressively appearing
// as you scroll — with a top-to-bottom mask wipe instead of a literal
// stroke draw. GSAP/ScrollTrigger still does the scroll-scrubbing (same
// stack decision as the reference site), it just drives a CSS custom
// property (--line-reveal-progress, see .rishikesh-line-reveal in
// globals.css) rather than a dasharray/dashoffset pair.
//
// To change how the wipe FEELS (start/end points, scrub tightness), edit
// lib/rishikeshLineReveal.config.ts — nothing here should need to change
// for a tuning pass. To change how soft the wipe edge is, edit
// --feather-rishikesh-line-reveal in tokens.css.
//
// This tween only draws the line IN as the section scrolls into place
// ("top bottom" → "top top" — i.e. finishes exactly when the section fully
// fills the viewport). What happens AFTER that — the line fading back out
// as the photo crossfades in underneath, once the user keeps scrolling
// further — used to live in this file as a second tween, but now lives in
// RishikeshScrollSequence.tsx: that fade is part of a pinned sequence that
// only starts once this reveal-in has already finished, so it made more
// sense as one shared timeline alongside the photo fade-in and dot reveal
// than a second independent tween bolted onto this component. See
// rishikeshScrollSequence.config.ts for why pinning (not a scroll
// sub-range) was needed to make "hold fully-loaded, then advance on further
// scroll" possible at all.
// ─────────────────────────────────────────────────────────────────────────

type RishikeshLineRevealProps = {
  src: string;
  className?: string;
};

export default function RishikeshLineReveal({
  src,
  className = "",
}: RishikeshLineRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // prefers-reduced-motion: skip the ScrollTrigger tween entirely and
    // leave --line-reveal-progress at its CSS initial value of 0%... but
    // 0% would hide the artwork completely for reduced-motion users, which
    // is worse than the motion itself. Jump straight to fully revealed
    // instead, matching the reduced-motion override already used by
    // .illustration-reveal in globals.css.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--line-reveal-progress", "100%");
      return;
    }

    // Trigger against the parent <section>, not this element. This
    // container is absolutely positioned with a negative top offset and
    // is taller than the section itself (raw Figma bleed geometry for the
    // illustration), so its own bounding box doesn't line up with the
    // section's visible edges — using it as the trigger made the reveal
    // finish almost immediately, well before the section actually filled
    // the viewport. The section is exactly 100vh (min-h-dvh), so its own
    // top/bottom crossing the viewport IS "section X% in view".
    const trigger = el.closest("section") ?? el;

    const tween = gsap.fromTo(
      el,
      { "--line-reveal-progress": "0%" },
      {
        "--line-reveal-progress": "100%",
        ease: "none",
        scrollTrigger: {
          trigger,
          start: RISHIKESH_LINE_REVEAL_CONFIG.start,
          end: RISHIKESH_LINE_REVEAL_CONFIG.end,
          scrub: RISHIKESH_LINE_REVEAL_CONFIG.scrub,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`rishikesh-line-reveal ${className}`}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="block size-full max-w-none object-contain"
      />
    </div>
  );
}
