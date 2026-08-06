// data/hero.data.ts — the ONLY file that needs editing to change Hero content.
// Nothing in components/sections/hero reads content from anywhere else.

export const HERO = {
  eyebrow: "Every",
  displayLine1: "Home",
  displayLine2: "Offers",
  accent: "a rare",
  mega: "Experience",
  background: {
    src: "/images/hero/hero-bg.jpg",
    // Served via next/image with priority — this is the LCP element.
    alt: "Mist rolling over a forested mountainside in Uttarakhand",
    width: 1920,
    height: 1080,
  },
} as const;
  