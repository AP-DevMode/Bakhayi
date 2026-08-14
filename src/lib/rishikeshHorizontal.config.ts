// lib/rishikeshHorizontal.config.ts — the ONLY file to edit to change how the
// horizontal rail SLIDES feel: when the first one starts, how long each takes,
// how long the rail rests between them, and the easing.
// RishikeshScrollSequence.tsx reads this to append one tween PER SLIDE to the
// sequence's single shared timeline; nothing there should need to change for a
// tuning pass, or for a fourth panel. Same "config owns the numbers"
// convention as rishikeshCrossfade.config.ts and rishikeshDotsReveal.config.ts.
//
// WHY IT LIVES ON THE SAME TIMELINE AS PANEL 1'S BEATS
// The rail, the line/veil dissolve, and the word-dots all play inside ONE
// sticky range (the track in Rishikesh.tsx). A sticky range can only be
// described by one scrubbed timeline — a second ScrollTrigger against the same
// track would be a separate progress clock racing the first, and the two would
// disagree the moment either is refreshed. So the slides are tweens positioned
// after the dots, not a rig of their own.
//
// ─── ONE TWEEN PER SLIDE, NOT ONE TWEEN FOR THE WHOLE RAIL ─────────────────
// With two panels this was a single tween to `-(scrollWidth - innerWidth)`,
// which needed no arithmetic and no edit here when a panel was appended. That
// stops being right at three: the same tween now covers TWO viewports of
// travel, so either the rail moves at double speed, or `duration` is doubled
// and the two panel changes run together as one long uninterrupted move with
// no moment where panel 2 is at rest and readable. Both fail the page's
// sequencing rule — beats, separated by holds, not one indeterminate slide.
//
// So the sequence now emits N-1 tweens for N panels, each advancing the rail
// by exactly one panel, with `hold` of dead scroll between them. Panel count
// is still read from the DOM, so appending a panel is still just dropping the
// component into Rishikesh.tsx — but see the track-height note below, because
// the timeline does now get longer with each one.
//
// ─── THE TRACK-HEIGHT RELATIONSHIP (read before changing anything here) ────
// The timeline's virtual units are mapped onto the track's sticky travel by
// ScrollTrigger, so units and scroll distance are locked together: if the
// timeline gets longer without the track getting taller, every beat —
// including panel 1's, which are already tuned — gets physically shorter.
//
// Panel 1's beats occupy timeline 0 → 2.11 (crossfade 0.25→1.05, dots
// 1.3→2.11). Before the rail existed those 2.11 units mapped onto 150dvh of
// sticky travel (a 250dvh track), which fixes the exchange rate for
// everything since: 1 timeline unit ≈ 71.09dvh of scroll.
//
// Each slide costs `hold` + `duration` = 0.29 + 1.82 = 2.11 units — the same
// as panel 1's whole opening sequence, and not a coincidence: it's what lets
// the track height stay a whole multiple of 150dvh, so panel 1's dissolve and
// dot cascade keep landing at the same physical scroll positions they were
// tuned at. Two panels ended at 4.22 units / 400dvh track. Three end at 6.33
// units / 550dvh.
//
// SO: adding a panel means BOTH of these, together —
//   1. drop the component into the rail in Rishikesh.tsx, and
//   2. raise that file's h-[550dvh] by 150dvh.
// Doing (1) alone silently re-times the approved first panel.
// ───────────────────────────────────────────────────────────────────────────

export const RISHIKESH_HORIZONTAL_CONFIG = {
  // Where in the shared timeline the FIRST slide starts. The dots finish at
  // 2.11 (position 1.3 + 8 stagger gaps of 0.045 + a 0.45 tween), so 2.4 is a
  // deliberate 0.29 of dead space where panel 1 sits complete and still —
  // photo revealed, all nine dots landed, nothing moving.
  //
  // That hold is not padding. It's the same size as the two pauses already in
  // the sequence (the 0.25 before the dissolve and the 0.25 between dissolve
  // and dots), so the page reads as evenly-weighted beats — hold, dissolve,
  // hold, dots, hold, travel — instead of the dots' cascade running straight
  // into the rail departing, which would read as one long indeterminate move.
  position: 2.4,

  // How much of the timeline ONE slide spans — one panel's worth of travel,
  // not the whole rail's. In physical terms that's roughly 129dvh of
  // scrolling to move one full viewport sideways: the travel is slower than
  // the scroll driving it, which is what makes a horizontal move feel like a
  // deliberate camera pan rather than a page swapping out.
  duration: 1.82,

  // Dead scroll between one slide finishing and the next starting. Same 0.29
  // as the hold before the first slide, so every panel gets the same beat of
  // stillness on arrival that panel 1 gets before departure — and, more to
  // the point, so each panel's own heading dissolve has somewhere to finish
  // before anything else moves.
  //
  // Set this to 0 and the rail becomes one continuous two-viewport pan again,
  // which is the thing the note above exists to prevent.
  hold: 0.29,

  // Gentle acceleration and deceleration, nothing more. A scrubbed tween is
  // tied 1:1 to scroll position, so a strong ease here would make the rail
  // visibly lag or outrun the wheel — the hand-off between input and motion
  // stops feeling connected. power1.inOut is just enough to round off the
  // start and the stop so the rail doesn't jerk into motion at the exact frame
  // the hold ends, while staying close enough to linear that the user still
  // feels they are the one moving it.
  ease: "power1.inOut",
} as const;
