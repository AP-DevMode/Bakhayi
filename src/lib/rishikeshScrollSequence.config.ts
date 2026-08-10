// lib/rishikeshScrollSequence.config.ts — the ONLY file to edit to change how
// long the Rishikesh section pins in place, and how much extra scroll
// distance drives the crossfade + dots sequence once it's pinned.
// RishikeshScrollSequence.tsx just wires this into a single GSAP timeline +
// ScrollTrigger; nothing there should need to change for a tuning pass.
//
// Earlier versions tried to fit the crossfade + dots into a sub-range of the
// section's own ENTRY distance ("top bottom" → "top top", the same span the
// line's mask-reveal-in tween uses in RishikeshLineReveal.tsx) — reversible,
// but wrong once the user clarified the actual intent: the section should
// finish loading (green background + line fully drawn in, exactly filling
// the viewport) and STAY that way until the user deliberately keeps
// scrolling — only THEN should the photo crossfade and dot reveal begin.
//
// That needs scroll distance that doesn't exist yet at "top top" — Rishikesh
// is the last section on the page and exactly one viewport tall, so "top
// top" already sits at the document's natural end.
//
// v1 of that fix used GSAP's `pin: true` to manufacture the room on demand.
// It did not work here: verified in the browser, the pin-spacer measured
// exactly 861px against an 861px section — zero extra scroll distance — so
// the sequence had nowhere to play and NOTHING animated at any scroll
// position, at any point in the page. Two plausible contributors, both
// structural rather than tuning issues: SmoothScroll.tsx re-measures Lenis
// on every ScrollTrigger refresh (so refresh and resize can feed each
// other), and the spacer is inserted as a child of layout.tsx's flex
// column, where flex items shrink.
//
// v2 (current) drops GSAP pinning entirely. Rishikesh.tsx now wraps the
// section in a 250dvh "track" and makes the section `sticky top-0`, so the
// section holds still for 150dvh of scrolling purely in CSS. The scroll
// room exists in the DOM before any JS runs, can't be collapsed by a flex
// parent, and needs no document-height mutation for Lenis to re-measure.
// This ScrollTrigger now only READS that range — it no longer creates it.
// Still fully reversible with scrub: true, same as every other Rishikesh
// reveal.
export const RISHIKESH_SCROLL_SEQUENCE_CONFIG = {
  // The sequence is measured against the TRACK (the tall wrapper in
  // Rishikesh.tsx), not the section. "top top" = the moment the track's top
  // reaches the top of the viewport, which is exactly when the sticky
  // section has finished filling the screen — i.e. the fully-loaded state
  // the sequence is supposed to start from. "bottom bottom" = the moment
  // the track's bottom reaches the bottom of the viewport, which is where
  // the section stops sticking and normal scrolling resumes.
  //
  // Between those two points the section is visually frozen, and the scroll
  // distance is exactly the track's extra height (250dvh − 100dvh = 150dvh
  // of sequence room). To make the sequence longer or shorter, change the
  // track's h-[250dvh] in Rishikesh.tsx — these two strings don't need to
  // change, since they're expressed as the track's own edges rather than as
  // a fixed pixel or percentage distance.
  start: "top top",
  end: "bottom bottom",

  // `true` ties the sequence directly to scroll position (scrubbed,
  // reverses on scroll-up) — same mechanism as
  // RISHIKESH_LINE_REVEAL_CONFIG.scrub.
  scrub: true,
} as const;
