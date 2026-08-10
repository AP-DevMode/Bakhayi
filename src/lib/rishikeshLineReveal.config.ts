// lib/rishikeshLineReveal.config.ts — the ONLY file that needs editing to
// change how the Rishikesh background line's scroll reveal FEELS.
// RishikeshLineReveal.tsx just wires these values into a GSAP ScrollTrigger
// tween; nothing there should need to change for a tuning pass.

export const RISHIKESH_LINE_REVEAL_CONFIG = {
  // When the reveal begins/ends, relative to the Rishikesh <section> itself
  // crossing the viewport (RishikeshLineReveal.tsx triggers off the parent
  // section, not its own illustration container — that container has
  // offset/oversized bounds from the raw Figma bleed geometry, so it
  // doesn't line up with the section's actual edges). "top bottom" = the
  // reveal starts the instant the section's top edge enters the bottom of
  // the viewport; "top top" = it finishes the instant the section's top
  // edge reaches the top of the viewport — i.e. exactly when the section
  // is 100% in view, since the section is exactly one viewport tall
  // (min-h-dvh).
  start: "top bottom",
  end: "top top",

  // `true` ties reveal progress directly to scroll position (scrubbed,
  // reverses on scroll-up) instead of playing once on a fixed timeline. A
  // number instead of `true` (e.g. 0.5) adds that many seconds of catch-up
  // lag behind the scrollbar instead of an exact 1:1 tie — try that if the
  // wipe feels too mechanically tied to the scroll.
  scrub: true,
} as const;
