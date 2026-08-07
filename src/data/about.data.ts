// data/about.data.ts — the ONLY file that needs editing to change About content.
// Nothing in components/sections/about reads content from anywhere else.

export const ABOUT = {
  eyebrow: "MEANING OF BAKHAYI",
  // One continuous sentence (node 760:49) — the apparent two-line split in
  // Figma's dev-mode export was that frame's own wrap at rest, not a manual
  // break. Keep as a single string and let the 857.384px column wrap it
  // naturally, so "built on" and "the same idea." can share a line.
  headline:
    "A KUMAONI WORD FOR A CLUSTER OF HOMES — ONE ROOF, ONE TABLE, SEVERAL HOUSEHOLDS STANDING TOGETHER. THE COLLECTION IS BUILT ON THE SAME IDEA.",
  // Rendered as a justified single row ("A More Conscious Way to Travel"),
  // node 760:60 — kept as separate words because Figma spaces them with
  // justify-between rather than normal word-spacing.
  kicker: ["A", "MORE", "CONSCIOUS", "WAY", "TO", "TRAVEL"],
  body: "Bakhayi is a collection of distinctive homes and thoughtfully curated experiences across Uttarakhand. Rooted in local knowledge and personal relationships, each stay offers access to the region beyond what is typically seen—through places, people, and moments chosen with intention.",
  illustrations: {
    // User-supplied SVGs from the local "Illustrations" folder (public/Illustrations).
    // Space in the left filename is intentional (as uploaded) — kept
    // percent-encoded here so Next's static file server resolves it.
    left: "/Illustrations/Illustration-%20Left.svg",
    right: "/Illustrations/Illustration-Right.svg",
  },
} as const;
