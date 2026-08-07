"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// ─── Illustration scroll-reveal ─────────────────────────────────────────────
// Adapted from a classic scroll-triggered "ink transition" effect (the
// reference used ScrollMagic + a hand-drawn ink-brush sprite sheet to wipe
// photographs into view). The logic worth keeping — not the pixels — is the
// choreography:
//   1. content starts hidden until it scrolls into view
//   2. once triggered, it reveals with a wipe (not a plain fade)
//   3. it reveals once and never re-hides on scroll-up (no reverse tween)
//   4. reveals can be staggered a beat apart (the reference used per-node
//      `data-delay`; here it's a `staggered` prop mapped to a CSS token)
//
// The ink sprite itself doesn't carry over: our mountain illustrations are
// flat line-art SVGs, not photos, so there's no brush texture to mask with.
// Reimplemented with IntersectionObserver + a CSS clip-path wipe
// (see .illustration-reveal in globals.css) instead of ScrollMagic + a
// sprite-sheet animation, keeping this dependency-free.
// ─────────────────────────────────────────────────────────────────────────

type IllustrationRevealProps = {
  children: ReactNode;
  className?: string;
  /** Offsets this reveal by one --delay-illustration-stagger unit (tokens.css),
   * so a second illustration doesn't wipe open in lockstep with the first. */
  staggered?: boolean;
};

export default function IllustrationReveal({
  children,
  className = "",
  staggered = false,
}: IllustrationRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // prefers-reduced-motion is handled entirely in CSS (globals.css forces
    // the revealed end-state regardless of this attribute), so the observer
    // below only needs to worry about the motion-enabled path.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          // Reveal once, like the reference's `.reverse(false)` — never
          // re-trigger or re-hide on subsequent scroll direction changes.
          observer.disconnect();
        }
      },
      // threshold: 0 + a bottom rootMargin instead of a fixed area percentage.
      // These illustrations are large, wide, and partially off-canvas
      // (negative left offsets) — a 15%-of-area threshold could be pushed
      // out of reach on narrower viewports where more of the box is
      // clipped by the section's overflow-x-clip. Firing as soon as any
      // pixel is visible, ~10% before it reaches the bottom of the
      // viewport, is the standard robust pattern for scroll reveals.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-revealed={isRevealed}
      data-staggered={staggered}
      className={`illustration-reveal ${className}`}
    >
      {children}
    </div>
  );
}
