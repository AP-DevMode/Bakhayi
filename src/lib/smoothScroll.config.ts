// lib/smoothScroll.config.ts — the ONLY file that needs editing to change
// how smooth scroll FEELS across the whole site. SmoothScroll.tsx just
// wires these values into Lenis; nothing there should need to change for
// a tuning pass.

export const SMOOTH_SCROLL_CONFIG = {
  // How long (in seconds) each scroll input takes to settle. This is the
  // main "intensity" knob: higher = heavier/smoother, with more visible
  // "drag" behind the cursor/trackpad; lower = snappier, closer to native
  // scroll. Lenis's own default is 1.2 — 1.1 here reads slightly lighter.
  duration: 1.1,

  // Easing curve applied over `duration`. Cubic ease-out: fast start,
  // gentle settle — the same shape as --ease-out-silk in tokens.css,
  // rewritten as a plain (t) => number function since Lenis can't consume
  // a CSS cubic-bezier() string directly.
  easing: (t: number) => 1 - Math.pow(1 - t, 3),

  // Scales mouse-wheel input distance. >1 = travels further per wheel
  // tick ("heavier"/faster scroll), <1 = travels less ("lighter"/slower).
  wheelMultiplier: 1,

  // Scales touchpad/touch input the same way as wheelMultiplier above.
  touchMultiplier: 1,

  // Keep native (non-smoothed) touch scrolling on phones/tablets — Lenis's
  // touch smoothing tends to feel laggy compared to native touch scroll.
  // Flip to `true` only if a smoothed mobile feel is specifically wanted.
  syncTouch: false,
} as const;
