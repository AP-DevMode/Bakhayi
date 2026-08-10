"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SMOOTH_SCROLL_CONFIG } from "@/lib/smoothScroll.config";

gsap.registerPlugin(ScrollTrigger);

// ─── Global smooth scroll ───────────────────────────────────────────────
// Mounted once in layout.tsx (above Nav + all page content), so it applies
// to the whole site rather than a single section. Lenis smooths the native
// window scroll in place — it doesn't need to wrap children in an extra
// scroll container, so this component renders nothing itself; it only
// runs the RAF loop for as long as the app is mounted.
//
// To change how scrolling FEELS site-wide, edit lib/smoothScroll.config.ts
// — nothing in this file should need to change for a tuning pass.
//
// Respects prefers-reduced-motion: users who've asked for reduced motion
// get plain native scroll instead of the smoothed/eased version.
//
// GSAP ScrollTrigger integration: without this, Lenis and ScrollTrigger run
// as two independent systems that happen to both watch window scroll — that
// works fine for plain scrubbed tweens (confirmed: the Rishikesh line
// mask-reveal scrubs correctly), but breaks the moment anything PINS.
// Pinning a section means GSAP inserts a spacer element that grows the
// page's actual scrollable height *after* Lenis has already computed its
// own internal scroll limit — and nothing was telling Lenis to recompute
// that limit afterward, so Lenis kept clamping scroll at the page's OLD
// (pre-pin) height, making the pinned section's extra scroll room
// permanently unreachable (confirmed via Playwright: RishikeshScrollSequence
// pinning "top top" → "+=100%" produced a spacer with zero added height,
// and scrolling to the document's real end never advanced past the
// pin's start). Three additions fix this, per Lenis's own documented GSAP
// recipe:
//   1. `lenis.on("scroll", ScrollTrigger.update)` — keeps ScrollTrigger's
//      idea of scroll position in sync with Lenis's smoothed value every
//      frame, not just on native scroll events.
//   2. Driving Lenis from `gsap.ticker` (with `lagSmoothing(0)`) instead of
//      its own separate requestAnimationFrame loop — puts both on the same
//      clock so a pinned ScrollTrigger's per-frame updates and Lenis's
//      smoothing never fall out of step with each other.
//   3. `ScrollTrigger.addEventListener("refresh", () => lenis.resize())` —
//      whenever ScrollTrigger recalculates (e.g. right after it inserts a
//      pin spacer, or on window resize), this tells Lenis to re-measure the
//      document and recompute its own scroll limit to match, instead of
//      trusting a stale measurement from before the spacer existed.
// ─────────────────────────────────────────────────────────────────────────
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis(SMOOTH_SCROLL_CONFIG);

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      lenis.destroy();
    };
  }, []);

  return null;
}
