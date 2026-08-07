// data/hero.data.ts — the ONLY file that needs editing to change Hero content.
// Nothing in components/sections/hero reads content from anywhere else.

export const HERO = {
  eyebrow: "EVERY",
  displayLine1: "HOME",
  displayLine2: "OFFERS",
  accent: "A RARE",
  mega: "EXPERIENCE",
  background: {
    // Original upload was 93s/34MB w/ audio — trimmed to an 8s silent loop
    // and compressed (webm primary, mp4 fallback) since this autoplays on
    // page load. Poster is the video's own first frame, shown instantly
    // while the video buffers — this is what counts toward LCP, not the
    // video itself.
    video: {
      webm: "/videos/hero/hero-bg.webm",
      mp4: "/videos/hero/hero-bg.mp4",
    },
    poster: {
      jpg: "/images/hero/hero-video-poster.jpg",
      webp: "/images/hero/hero-video-poster.webp",
    },
    width: 1920,
    height: 1080,
  },
} as const;
  