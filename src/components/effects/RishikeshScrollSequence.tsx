"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RISHIKESH_SCROLL_SEQUENCE_CONFIG } from "@/lib/rishikeshScrollSequence.config";
import { RISHIKESH_CROSSFADE_CONFIG } from "@/lib/rishikeshCrossfade.config";
import { RISHIKESH_DOTS_REVEAL_CONFIG } from "@/lib/rishikeshDotsReveal.config";

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
    const section = document.querySelector<HTMLElement>(
      '[data-figma-node="779:92"]',
    );
    if (!track || !section) return;

    const line = section.querySelector<HTMLElement>(".rishikesh-line-reveal");
    const bg = section.querySelector<HTMLElement>("[data-rishikesh-bg]");
    const dots = Array.from(
      section.querySelectorAll<HTMLElement>("[data-rishikesh-dot]"),
    );
    if (!line || !bg || dots.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(line, { opacity: 1 });
      gsap.set(bg, { opacity: 1 });
      gsap.set(dots, { opacity: 1, y: 0, scale: 1 });
      return;
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

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return null;
}
