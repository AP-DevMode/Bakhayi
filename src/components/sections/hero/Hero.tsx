import { HERO } from "@/data/hero.data";
import TextRevealCanvas from "@/components/effects/TextRevealCanvas";

// ─── Pass 1: structure ─────────────────────────────────────────────────────
// Static layout matching Figma node 741:3 at rest.
//
// Background is a native <video>, not next/image — Next's image pipeline
// doesn't touch video, so the file (already trimmed to an 8s silent loop
// and compressed) is served as-is from /public. `poster` shows instantly
// so there's no black flash while the video buffers; that poster frame is
// what should count toward LCP, not the video itself.
//
// ─── Pass 2: staggered text reveal ─────────────────────────────────────────
// Real DOM text rises through a clipped mask on load. This stays crisp at
// every resolution and avoids canvas/WebGL texture rendering differences.
// ───────────────────────────────────────────────────────────────────────────

const REVEAL_TEXT_CLASSES = "hero-text-reveal";

export default function Hero() {
  return (
    <section
      data-figma-node="741:3"
      className="isolate relative flex min-h-dvh w-full items-center justify-center overflow-hidden"
    >
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
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
      <div className="absolute inset-0 z-[1] bg-black/10" />

      <TextRevealCanvas
        className="z-10 flex flex-col items-center gap-1 px-6 text-center text-paper"
      >
        <div className="flex flex-wrap items-baseline justify-center gap-x-2">
          <span data-reveal-text className={`font-display uppercase text-hero-eyebrow ${REVEAL_TEXT_CLASSES}`}>
            {HERO.eyebrow}
          </span>
          <span
            data-reveal-text
            className={`font-display uppercase text-hero-display leading-[0.88] ${REVEAL_TEXT_CLASSES}`}
          >
            {HERO.displayLine1}
          </span>
        </div>

        <div className="flex flex-wrap items-baseline justify-center gap-x-2">
          <span
            data-reveal-text
            className={`font-display uppercase text-hero-display leading-[0.95] ${REVEAL_TEXT_CLASSES}`}
          >
            {HERO.displayLine2}
          </span>
          <span
            data-reveal-text
            className={`font-display italic text-hero-eyebrow uppercase whitespace-nowrap ${REVEAL_TEXT_CLASSES}`}
          >
            {HERO.accent}
          </span>
        </div>

        <p data-reveal-text className={`font-display text-hero-mega uppercase ${REVEAL_TEXT_CLASSES}`}>
          {HERO.mega}
        </p>
      </TextRevealCanvas>
    </section>
  );
}
