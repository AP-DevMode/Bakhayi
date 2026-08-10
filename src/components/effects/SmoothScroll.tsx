"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { SMOOTH_SCROLL_CONFIG } from "@/lib/smoothScroll.config";

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
// ─────────────────────────────────────────────────────────────────────────
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis(SMOOTH_SCROLL_CONFIG);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
