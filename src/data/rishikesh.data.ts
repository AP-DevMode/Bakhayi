// data/rishikesh.data.ts — the ONLY file that needs editing to change
// Rishikesh content. Nothing in components/sections/rishikesh reads
// content from anywhere else.
//
// Covers BOTH Figma frames 779:92 and 785:67 — these render as a single
// section in the real site (see Rishikesh.tsx), not two separate scroll
// sections. Figma split them into two frames only so each screenshots
// standalone with its own duplicate text lockup, the same reason the Nav
// gets duplicated inside every section frame (see Rishikesh.tsx's own
// comment on this). Previously this was two data files (rishikesh.data.ts +
// rishikesh2.data.ts, one per Figma frame) backing two separate <section>s —
// merged into one file/one section after confirming the photo is meant to
// replace the line illustration in this section's own background as the
// user scrolls, not arrive as a new section.

export const RISHIKESH = {
  // Stacked lockup (node 779:92 / 785:69-76 — identical duplicate text),
  // three separate lines rather than one wrapped string — Figma centers
  // each line independently with its own padding rather than letting a
  // single block of text wrap naturally.
  the: "THE",
  bakhayi: "BAKHAYI",
  experience: "EXPERIENCE",
  // Mega title beneath the lockup (node 779:96).
  title: "RISHIKESH",
  // Scroll affordance label (node 779:100).
  scroll: "SCROLL",
  // User-supplied/Figma-exported assets.
  line: "/Illustrations/Rishikesh-Line.svg",
  scrollIcon: "/images/rishikesh/scroll-arrow.svg",

  // Full-bleed background photo (node 785:67 fill) that crossfades in as
  // the line illustration fades out, plus the small ring icon reused by
  // every floating word below (node 785:78 "Ellipse 3").
  background: "/images/rishikesh2/bg.png",
  dotIcon: "/images/rishikesh2/dot.svg",

  // Nine floating words (nodes 785:79-103), raw px offsets against the
  // 1440x1024 desktop frame — exact dev-mode geometry, same "fixed to
  // desktop, no mobile frame yet" rule as every other section. Left values
  // were exported by Figma as calc(<fraction-of-1440>% ± px); resolved to
  // plain px here to match this project's absolute-positioning convention
  // (see the line illustration above for the same treatment).
  dots: [
    { label: "Solitude", left: 156, top: 339.17 },
    { label: "Adventure", left: 1305, top: 370.5 },
    { label: "Time Together", left: 41, top: 653.5 },
    { label: "Scroll Pause", left: 1075, top: 477.5 },
    { label: "Reset", left: 1191, top: 702.17 },
    { label: "Healing", left: 271, top: 770.17 },
    { label: "Celebration", left: 961, top: 837.17 },
    { label: "Space to Think", left: 616, top: 740.17 },
    { label: "Nature", left: 385, top: 892.17 },
  ],
} as const;
