// data/rishikesh.data.ts — the ONLY file that needs editing to change
// Rishikesh content. Nothing in components/sections/rishikesh reads
// content from anywhere else.

export const RISHIKESH = {
  // Stacked lockup (node 779:92), three separate lines rather than one
  // wrapped string — Figma centers each line independently with its own
  // padding rather than letting a single block of text wrap naturally.
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
} as const;
