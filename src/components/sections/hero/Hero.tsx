import Image from "next/image";
import { HERO } from "@/data/hero.data";

// ─── Pass 1: structure only ───────────────────────────────────────────────
// No animation, no interaction, no scroll behavior yet. Static layout
// matching Figma node 741:3 at rest. Motion comes in the next pass once
// this is approved.
// ───────────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section
      data-figma-node="741:3"
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden"
    >
      <Image
        src={HERO.background.src}
        alt={HERO.background.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Scrim keeps headline legible over bright/foggy patches of the photo */}
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
          <span className="font-display italic text-hero-eyebrow">
            {HERO.accent}
          </span>
        </div>

        <p className="font-display uppercase text-hero-mega">{HERO.mega}</p>
      </div>
    </section>
  );
}
