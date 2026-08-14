"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RISHIKESH_SCROLL_SEQUENCE_CONFIG } from "@/lib/rishikeshScrollSequence.config";
import { RISHIKESH_CROSSFADE_CONFIG } from "@/lib/rishikeshCrossfade.config";
import { RISHIKESH_DOTS_REVEAL_CONFIG } from "@/lib/rishikeshDotsReveal.config";
import { RISHIKESH_HORIZONTAL_CONFIG } from "@/lib/rishikeshHorizontal.config";

gsap.registerPlugin(ScrollTrigger);

// ─── Rishikesh — pinned crossfade + dot-reveal sequence ─────────────────────
// Renders nothing itself — this is the single orchestrator for what happens
// AFTER the Rishikesh section has fully loaded (green background + line
// illustration completely drawn in via RishikeshLineReveal's own
// mask-reveal tween, which is unaffected by this file and keeps running
// against the section's entry scroll on its own). Once the section fully
// fills the viewport, it holds still (CSS `sticky`, owned by Rishikesh.tsx
// — not a GSAP pin; see rishikeshScrollSequence.config.ts for why the pin
// had to go) while this scrubs ONE shared GSAP timeline: the line
// illustration AND the espresso background veil fade out together,
// revealing the already-opaque photo underneath, then the word-dots stagger
// in on top. See rishikeshScrollSequence.config.ts for the full
// rationale on why pinning (rather than scrubbing a sub-range of the
// section's entry span, tried in earlier versions) is what makes "hold at
// fully-loaded, then advance on further scroll" possible at all.
//
// This queries its siblings by data-attribute/class instead of taking refs
// as props, since RishikeshLineReveal/RishikeshPhotoReveal render their own
// markup independently and none of them need to know about each other —
// only this file needs to reach across all three to keep them scrubbing off
// one shared timeline (a single ScrollTrigger must own the pin; multiple
// pinned ScrollTriggers on the same trigger element would each insert their
// own spacer and stack extra empty scroll space).
//
// prefers-reduced-motion: skip the pin and the timeline entirely (no reason
// to force extra scroll padding on someone who's asked for less motion) and
// land directly on the fully-settled state — the line stays visible (never
// hide content, matching every other Rishikesh reveal's reduced-motion
// fallback), the espresso veil stays opaque so the section reads as the
// designed green frame, and the dots sit fully in place.
// ─────────────────────────────────────────────────────────────────────────

export default function RishikeshScrollSequence() {
  useEffect(() => {
    // Trigger against the TRACK, not the section. The section is
    // `sticky top-0` inside it, so once it sticks its own bounding box stops
    // moving and can't describe scroll progress any more — the track is the
    // element whose edges actually travel through the viewport.
    const track = document.querySelector<HTMLElement>("[data-rishikesh-track]");
    // Scope the element lookups to the FIRST PANEL of the horizontal rail,
    // not to the whole section. The section now contains every panel of the
    // rail (see Rishikesh.tsx), and this timeline describes only what
    // happens on panel 1 — its line/veil dissolve and its word-dots. A
    // later panel that happens to carry a line illustration or a dot would
    // otherwise be swept into these same tweens and faded out along with
    // panel 1's, on a beat that has nothing to do with it.
    const panel = document.querySelector<HTMLElement>(
      '[data-rishikesh-panel="rishikesh"]',
    );
    if (!track || !panel) return;

    // The rail is the flex row of panels, and it is NOT scoped to panel 1 —
    // it's the thing that carries every panel past the frame, so it's looked
    // up on the section rather than inside the panel the other three live in.
    const rail = document.querySelector<HTMLElement>("[data-rishikesh-rail]");

    const line = panel.querySelector<HTMLElement>(".rishikesh-line-reveal");
    const bg = panel.querySelector<HTMLElement>("[data-rishikesh-bg]");
    const dots = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-rishikesh-dot]"),
    );
    if (!rail || !line || !bg || dots.length === 0) return;

    // How far the rail has to travel: enough that its LAST panel ends flush
    // with the right edge of the sticky frame. Read from the DOM rather than
    // hardcoded to a panel count, so appending a panel needs no arithmetic
    // here — see rishikeshHorizontal.config.ts. Passed to GSAP as a function
    // so it's re-read on every ScrollTrigger refresh (paired with
    // invalidateOnRefresh below) instead of being frozen at the width the
    // window happened to have on mount.
    const railDistance = () => -(rail.scrollWidth - window.innerWidth);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    if (reduced) {
      // Land the DECORATIVE beats on their settled state and never play them:
      // the line stays visible (never hide content, matching every other
      // Rishikesh reveal's fallback), the espresso veil stays opaque so the
      // section reads as the designed green frame, and the dots sit in place.
      gsap.set(line, { opacity: 1 });
      gsap.set(bg, { opacity: 1 });
      gsap.set(dots, { opacity: 1, y: 0, scale: 1 });

      // The rail is NOT decorative and is deliberately still animated here.
      // Earlier this branch returned outright, which left the rail parked at
      // x=0 — and since every panel after Rishikesh lives inside a frame that
      // clips, that meant a reduced-motion visitor could never reach any of
      // them at all. Sideways travel is this part of the page's only
      // navigation, so removing it removes content, not motion.
      //
      // What reduced-motion does get is the honest version: `none` easing, so
      // the rail tracks the scroll wheel exactly 1:1 with no acceleration
      // curve of its own, and no other layer moving at the same time.
      const railOnly = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: RISHIKESH_SCROLL_SEQUENCE_CONFIG.start,
          end: RISHIKESH_SCROLL_SEQUENCE_CONFIG.end,
          scrub: RISHIKESH_SCROLL_SEQUENCE_CONFIG.scrub,
          invalidateOnRefresh: true,
        },
      });
      railOnly.fromTo(
        rail,
        { x: 0 },
        { x: railDistance, ease: "none", duration: 1 },
        0,
      );
      return () => {
        railOnly.scrollTrigger?.kill();
        railOnly.kill();
      };
    }

    gsap.set(dots, {
      opacity: 0,
      y: RISHIKESH_DOTS_REVEAL_CONFIG.distance,
      scale: RISHIKESH_DOTS_REVEAL_CONFIG.scaleFrom,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: track,
        start: RISHIKESH_SCROLL_SEQUENCE_CONFIG.start,
        end: RISHIKESH_SCROLL_SEQUENCE_CONFIG.end,
        scrub: RISHIKESH_SCROLL_SEQUENCE_CONFIG.scrub,
        // The rail's travel distance depends on viewport width, so it has to
        // be recomputed rather than cached — without this, resizing the window
        // (or any refresh triggered by SmoothScroll.tsx re-measuring Lenis)
        // would leave the rail sliding to the OLD width's end position and
        // stop short of, or overshoot past, the last panel.
        invalidateOnRefresh: true,
      },
    });

    // The line illustration and the espresso background veil fade out as
    // one gesture, on the same position/duration/ease, so the green
    // background and the artwork drawn on top of it read as a single layer
    // dissolving away rather than two things leaving at different times.
    // The photo underneath is already fully opaque, so this fade IS the
    // photo's reveal — see RishikeshPhotoReveal.tsx for why it's done this
    // way round instead of as a true two-layer crossfade.
    tl.fromTo(
      [line, bg],
      { opacity: 1 },
      {
        opacity: 0,
        duration: RISHIKESH_CROSSFADE_CONFIG.duration,
        ease: RISHIKESH_CROSSFADE_CONFIG.ease,
      },
      RISHIKESH_CROSSFADE_CONFIG.position,
    );

    // Foreground beat — starts strictly after the background transition has
    // finished (see the `position` note in rishikeshDotsReveal.config.ts),
    // so the photo lands fully before anything arrives on top of it.
    tl.fromTo(
      dots,
      {
        opacity: 0,
        y: RISHIKESH_DOTS_REVEAL_CONFIG.distance,
        scale: RISHIKESH_DOTS_REVEAL_CONFIG.scaleFrom,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: RISHIKESH_DOTS_REVEAL_CONFIG.duration,
        ease: RISHIKESH_DOTS_REVEAL_CONFIG.ease,
        stagger: {
          each: RISHIKESH_DOTS_REVEAL_CONFIG.staggerEach,
          from: "random",
        },
      },
      RISHIKESH_DOTS_REVEAL_CONFIG.position,
    );

    // Travel beat — the rail slides sideways, carrying the finished panel 1
    // out of the frame and the next panel in. Starts strictly after the dots
    // have all landed AND after a hold (see the `position` note in
    // rishikeshHorizontal.config.ts), so panel 1 is seen complete and at rest
    // before it leaves. Nothing else on the timeline is moving at this point:
    // the whole panel travels as one object, which is what makes the move read
    // as the camera panning rather than as the page rebuilding itself.
    tl.fromTo(
      rail,
      { x: 0 },
      {
        x: railDistance,
        duration: RISHIKESH_HORIZONTAL_CONFIG.duration,
        ease: RISHIKESH_HORIZONTAL_CONFIG.ease,
      },
      RISHIKESH_HORIZONTAL_CONFIG.position,
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return null;
}
