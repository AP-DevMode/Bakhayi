import { HERO } from "@/data/hero.data";

// ─── Pass 1: structure only ───────────────────────────────────────────────
// No animation, no interaction, no scroll behavior yet. Static layout
// matching Figma node 741:3 at rest. Motion comes in the next pass once
// this is approved.
//
// Background is a native <video>, not next/image — Next's image pipeline
// doesn't touch video, so the file (already trimmed to an 8s silent loop
// and compressed) is served as-is from /public. `poster` shows instantly
// so there's no black flash while the video buffers; that poster frame is
// what should count toward LCP, not the video itself.
// ───────────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section
      data-figma-node="741:3"
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        poster={HERO.background.poster.jpg}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src={HERO.background.video.webm} type="video/webm" />
        <source src={HERO.background.video.mp4} type="video/mp4" />
      </video>

      {/* Scrim keeps headline legible over bright/foggy patches of the footage */}
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex flex-col items-center gap-1 px-6 text-center text-paper">
        <div className="flex flex-wrap items-baseline justify-center gap-x-2">
          <span className="font-display uppercase text-hero-eyebrow">
            {HERO.eyebrow}
          </span>
          <span className="font-display uppercase text-hero-display leading-[0.88]">
            {HERO.displayLine1}
          </span>
        </div>

        <div className="flex flex-wrap items-baseline justify-center gap-x-2">
          <span className="font-display uppercase text-hero-display leading-[0.95]">
            {HERO.displayLine2}
          </span>
          <span className="font-display italic text-hero-eyebrow uppercase">
            {HERO.accent}
          </span>
        </div>

        <p className="font-display text-hero-mega uppercase opacity-100">{HERO.mega}</p>
      </div>
    </section>
  );
}
