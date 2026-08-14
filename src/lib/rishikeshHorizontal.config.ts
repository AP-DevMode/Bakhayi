// lib/rishikeshHorizontal.config.ts — the ONLY file to edit to change how the
// horizontal rail SLIDE feels: when it starts, how long it takes, and its
// easing. RishikeshScrollSequence.tsx reads this to add one more tween to the
// sequence's single shared timeline; nothing there should need to change for a
// tuning pass. Same "config owns the numbers" convention as
// rishikeshCrossfade.config.ts and rishikeshDotsReveal.config.ts.
//
// WHY IT LIVES ON THE SAME TIMELINE AS PANEL 1'S BEATS
// The rail, the line/veil dissolve, and the word-dots all play inside ONE
// sticky range (the track in Rishikesh.tsx). A sticky range can only be
// described by one scrubbed timeline — a second ScrollTrigger against the same
// track would be a separate progress clock racing the first, and the two would
// disagree the moment either is refreshed. So the slide is a tween positioned
// after the dots, not a rig of its own.
//
// HOW FAR IT SLIDES — deliberately not a number in this file. The tween reads
// `-(rail.scrollWidth - window.innerWidth)` at refresh time, so the rail always
// ends with its LAST panel flush against the right edge of the frame. Adding a
// third panel to the rail therefore needs no edit here, no edit in
// Rishikesh.tsx beyond dropping the component in, and no arithmetic anywhere —
// which is the whole reason the rail is `w-max` with `w-screen` panels rather
// than a hardcoded `w-[200vw]`. It does mean the slide gets FASTER per panel as
// panels are added, since the same `duration` below covers more distance; when
// a third panel lands, grow the track height and `duration` together (see
// below) rather than leaving it to compress.
//
// ─── THE TRACK-HEIGHT RELATIONSHIP (read before changing `duration`) ────────
// The timeline's virtual units are mapped onto the track's sticky travel by
// ScrollTrigger, so units and scroll distance are locked together: if the
// timeline gets longer without the track getting taller, every beat — including
// panel 1's, which are already tuned — gets physically shorter.
//
// Panel 1's beats occupy timeline 0 → 2.11 (crossfade 0.25→1.05, dots
// 1.3→2.11). Before the rail existed those 2.11 units mapped onto 150dvh of
// sticky travel (a 250dvh track). This file adds 2.11 more units, so the track
// was grown to 400dvh — exactly 300dvh of travel, exactly double — which keeps
// panel 1's dissolve and dot cascade landing at the same physical scroll
// positions they were tuned at. That equality is the reason `position` and
// `duration` below sum to precisely 4.22 and not a rounder-looking number.
//
// So: to give the slide more room, raise `duration` AND raise h-[400dvh] in
// Rishikesh.tsx in the same proportion. Raising one alone re-times panel 1.
// ───────────────────────────────────────────────────────────────────────────

export const RISHIKESH_HORIZONTAL_CONFIG = {
  // Where in the shared timeline the rail starts moving. The dots finish at
  // 2.11 (position 1.3 + 8 stagger gaps of 0.045 + a 0.45 tween), so 2.4 is a
  // deliberate 0.29 of dead space where panel 1 sits complete and still —
  // photo revealed, all nine dots landed, nothing moving.
  //
  // That hold is not padding. It's the same size as the two pauses already in
  // the sequence (the 0.25 before the dissolve and the 0.25 between dissolve
  // and dots), so the page reads as four evenly-weighted beats — hold,
  // dissolve, hold, dots, hold, travel — instead of the dots' cascade running
  // straight into the rail departing, which would read as one long
  // indeterminate move. Lower it toward 2.11 to tighten the handoff; raise it
  // to make the viewer sit longer on the finished panel before it leaves.
  position: 2.4,

  // How much of the timeline the slide itself spans. 1.82 lands the total at
  // exactly 4.22 = 2 × 2.11, which is what preserves panel 1's tuning against
  // the doubled track — see the note above before changing this.
  //
  // In physical terms that's roughly 129dvh of scrolling to move one full
  // viewport sideways: the travel is slower than the scroll driving it, which
  // is what makes a horizontal move feel like a deliberate camera pan rather
  // than a page swapping out.
  duration: 1.82,

  // Gentle acceleration and deceleration, nothing more. A scrubbed tween is
  // tied 1:1 to scroll position, so a strong ease here would make the rail
  // visibly lag or outrun the wheel — the hand-off between input and motion
  // stops feeling connected. power1.inOut is just enough to round off the
  // start and the stop so the rail doesn't jerk into motion at the exact frame
  // the hold ends, while staying close enough to linear that the user still
  // feels they are the one moving it.
  ease: "power1.inOut",
} as const;
