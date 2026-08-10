// lib/rishikeshCrossfade.config.ts — the ONLY file to edit to change how the
// Rishikesh line→photo transition FEELS. RishikeshScrollSequence.tsx reads
// this to build the line + espresso-background fade-out inside its pinned
// timeline; nothing there should need to change for a tuning pass.
//
// v1 scrubbed both fades over "top top" → "bottom top" on the section —
// broke once the photo moved into the same section as the line (Rishikesh
// is the last, exactly-one-viewport-tall section on the page), because
// "top top" already coincides with the document's max scroll, so "bottom
// top" needed a further full viewport of scroll that didn't exist.
//
// v2 swapped to an IntersectionObserver firing a fixed-duration tween once
// the section crossed a visibility threshold — fixed the "stuck" symptom,
// but only ever played forward once, so scrolling back up left the photo
// showing and the line hidden.
//
// v3 scrubbed a sub-range of the section's own ENTRY span ("top bottom" →
// "top top") — reversible, but meant the crossfade started partway through
// the section still scrolling into place, which didn't match the request
// for the section to finish loading (fully filling the viewport, line fully
// drawn in) and hold there until the user scrolls further.
//
// v4: the crossfade stopped being its own ScrollTrigger at all.
// RishikeshScrollSequence.tsx pins the section once it fully fills the
// viewport and scrubs ONE shared timeline across the extra scroll room that
// pin manufactures (see rishikeshScrollSequence.config.ts) — this config
// just describes where in that shared timeline the transition sits.
//
// v5 (current): not a crossfade in the two-layer sense any more. The photo
// sits underneath at full opacity permanently, and the line illustration
// AND the espresso background veil fade OUT together, on the values below,
// to reveal it. Changed because the ask was for the green background itself
// to disappear — not merely to be covered by an incoming photo — and
// because fading two layers in opposite directions left a murky midpoint
// where both sat near 50% opacity and the page background showed through
// both. The filename is kept since this is still the same beat in the
// sequence; see RishikeshPhotoReveal.tsx for the full rationale.
export const RISHIKESH_CROSSFADE_CONFIG = {
  // Where in the sequence's shared timeline the crossfade starts. NOT 0:
  // the sticky range begins at the exact scroll position where the line's
  // own draw-in tween finishes (RishikeshLineReveal ends at the section's
  // "top top", which is the same instant the track's "top top" starts this
  // timeline). At 0 the dissolve would begin on the very frame the drawing
  // completed, so the section would never be seen fully loaded and at rest.
  // This offset is that missing beat — roughly the first 12% of the sticky
  // travel (~150px at a 861px viewport) where the green frame and the
  // finished line simply hold, before anything starts leaving. Raise it to
  // sit longer on the loaded state; drop it to 0 only if you want the
  // dissolve to begin the instant the section locks.
  position: 0.25,

  // How much of that shared timeline the crossfade itself spans. (This is a
  // GSAP timeline "duration" in the same virtual unit as
  // rishikeshDotsReveal.config.ts's own duration/staggerEach/position — the
  // absolute number doesn't matter, only its size relative to those.)
  duration: 0.8,

  // Smooth in and out, no bounce — a plain fade doesn't need the fast-start
  // snap that the dot reveal's power3.out uses.
  ease: "power2.inOut",
} as const;
