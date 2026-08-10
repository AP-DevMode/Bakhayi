// ─── Rishikesh background photo ─────────────────────────────────────────
// Purely presentational — this component owns no animation at all, and the
// image is never faded in. It sits at the bottom of the section's stack at
// full opacity; what reveals it is the espresso veil ([data-rishikesh-bg]
// in Rishikesh.tsx) fading OUT above it, scrubbed by
// RishikeshScrollSequence.tsx as part of one shared pinned timeline.
//
// That inversion is deliberate. Fading the photo IN while the green
// background stayed put only ever *covered* the green; the request was for
// the green background itself to fade away as the photo appears. Fading a
// veil out over an already-opaque photo does exactly that, and avoids the
// murky half-second a true two-layer crossfade produces, where both layers
// sit at ~50% opacity and the page background shows through both.
//
// It also means no inline opacity:0 is needed to prevent a flash before
// GSAP mounts — the opaque veil above already hides the photo, so the
// no-JS / prefers-reduced-motion default is the designed green frame.
//
// Previously this owned its own ScrollTrigger (first an unreachable
// "top top" → "bottom top" scrub, then an IntersectionObserver fire-once
// fade, then a reversible scrub over a sub-range of the section's entry
// span) — all superseded now that the reveal only starts once the section
// is fully loaded and the user keeps scrolling further, which needs a pin
// (see rishikeshScrollSequence.config.ts), and a pin can only be owned by
// one ScrollTrigger.
// ─────────────────────────────────────────────────────────────────────────

type RishikeshPhotoRevealProps = {
  src: string;
  className?: string;
};

export default function RishikeshPhotoReveal({
  src,
  className = "",
}: RishikeshPhotoRevealProps) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      data-rishikesh-photo=""
      className={`pointer-events-none absolute inset-0 z-0 size-full object-cover ${className}`}
    />
  );
}
