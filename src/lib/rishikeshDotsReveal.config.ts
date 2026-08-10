// lib/rishikeshDotsReveal.config.ts — the ONLY file that needs editing to
// change how the Rishikesh word-dot reveal FEELS.
// RishikeshScrollSequence.tsx reads this to build the dots' staggered tween
// inside its pinned timeline; nothing there should need to change for a
// tuning pass. Same "config file owns the numbers" convention as
// rishikeshLineReveal.config.ts and smoothScroll.config.ts.
//
// Modeled on leandra-isler.ch's hero headline reveal (confirmed reference,
// https://www.leandra-isler.ch/en — "Practice for Atlasology and
// Naturopathy"): each word rises with a fade, tightly staggered. These 9
// dots are scattered across the frame rather than sitting in one line, so
// the stagger order is randomized instead of left-to-right.
//
// v1 pinned this to the section's literal "top top" via a `once: true`
// ScrollTrigger — unreachable, since Rishikesh is the last, exactly-one-
// viewport-tall section and "top top" already sits at the document's max
// scroll (sub-pixel rounding made that boundary permanently uncrossable).
//
// v2 swapped to an IntersectionObserver firing once on a visibility
// threshold — fixed "stuck at opacity 0", but only ever played forward,
// so scrolling back up left the dots showing.
//
// v3 scrubbed a sub-range of the section's own entry span — reversible, but
// started the dots (and the crossfade they follow) before the section had
// even finished scrolling into place, rather than after it settled fully
// into view as requested.
//
// v4 (current): no ScrollTrigger of its own any more. The dots are just one
// more tween inside RishikeshScrollSequence.tsx's single pinned timeline,
// which only starts once the section fully fills the viewport (see
// rishikeshScrollSequence.config.ts for why pinning, not a sub-range, is
// what makes that possible). This config only supplies that tween's shape.
//
// v5 (current): pushed from overlapping the background transition to
// strictly after it, and given a slight scale-up alongside the existing
// rise. v4 started the dots at 0.5 against a background transition running
// 0 → 0.8, so they arrived over a half-dissolved background — two things
// moving at once. The intended read is three distinct beats: background
// holds, background dissolves, THEN foreground arrives.
export const RISHIKESH_DOTS_REVEAL_CONFIG = {
  // Where in the sequence's shared timeline the dots start. The background
  // transition (rishikeshCrossfade.config.ts) runs 0.25 → 1.05, so 1.3
  // lands the dots a clear 0.25 AFTER the mountain photo is fully revealed
  // — the same size gap as the hold that precedes the dissolve, so the two
  // pauses in the sequence read as equal beats. That gap is deliberate dead
  // space: it's the "image fully in, keep scrolling" hold, and it's what
  // stops the two beats reading as one simultaneous move. Lower toward 1.05
  // to tighten the handoff; raise it to make the viewer sit with the bare
  // photo longer before the dots land. Keep it >= the crossfade's
  // position + duration, or the dots will start over a half-dissolved
  // background.
  position: 1.3,

  // How far (px) each dot rises as it fades in/out.
  distance: 10,

  // How far each dot is scaled down at the start of its entrance, easing
  // back to 1. Kept very close to 1 on purpose — enough to read as the dot
  // settling into place rather than just appearing, but not so much that
  // the label text visibly resizes. These sit at small type sizes, where an
  // obvious scale reads as a rendering glitch rather than as motion.
  scaleFrom: 0.92,

  // Gap between each dot's stagger start, in the same virtual timeline
  // unit as `duration` below and rishikeshCrossfade.config.ts's own
  // duration/position — GSAP builds the staggered tween into an internal
  // timeline of proportional length; only the relative sizes matter, not
  // the absolute numbers.
  staggerEach: 0.045,

  // Each individual dot's own fade + rise span — deliberately short
  // relative to staggerEach × 9 dots so the reveal reads as a tight, fast
  // cascade rather than one long slow fade once mapped onto the scrub.
  duration: 0.45,

  // Fast start, gentle settle, no overshoot — GSAP's core eases don't
  // include arbitrary cubic-bezier() strings (that needs the CustomEase
  // plugin, not installed here), so this is the closest built-in shape to
  // --ease-out-silk in tokens.css, same substitution rationale as
  // smoothScroll.config.ts's `easing` function.
  ease: "power3.out",
} as const;
