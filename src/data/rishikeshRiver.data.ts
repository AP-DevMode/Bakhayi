// data/rishikeshRiver.data.ts — the ONLY file that needs editing to change
// the content of the horizontal rail's SECOND panel. Nothing in
// RishikeshRiver.tsx reads content from anywhere else.
//
// Covers Figma frame "Rishikesh 2" (node 800:2) — the first panel that
// arrives by scrolling sideways rather than down. Named "river" after its
// headline rather than "rishikesh2" on purpose: `rishikesh2` is already
// taken in this codebase by Figma frame 785:67, which turned out NOT to be
// a separate section at all but the photo state of the FIRST panel (see
// rishikesh.data.ts's own comment, and public/images/rishikesh2/ which
// holds that panel's background + dot icon). Reusing the number here would
// have put two unrelated designs behind one name.
//
// Geometry below is raw px against the 1440x1024 desktop frame — exact
// dev-mode values, same "fixed to desktop, no mobile frame yet" rule as
// every other section.

export const RISHIKESH_RIVER = {
  // Centered lockup (node 800:4), dead-center of the 1440x1024 frame, so
  // the panel flex-centers it rather than reproducing Figma's own
  // absolute + translate hack — same technique as Rishikesh.tsx's lockup.
  headline: "Where River Sets The Pace",
  body: "Set along the banks of the Ganges and framed by the foothills of the Himalayas, Rishikesh is a place where movement and stillness coexist. Known for its riverside culture, forested surroundings, and slower pace of life, it offers a different way to spend your time—one shaped by the river, the mountains, and the moments in between.",

  // Background wavy line (node 800:3). Same artwork and the same offsets as
  // the first panel's line, but NOT the same file, and this is the one
  // detail on the panel that is easy to get wrong: diffing Figma's export
  // for this node against the committed Rishikesh-Line.svg showed the two
  // are byte-identical except for six bytes — the fill hex. Panel 1's copy
  // is filled #DBD0C3 (sand) because it sits on the espresso background;
  // this one is filled #312725 (espresso) because it sits on sand. They are
  // the same drawing in inverted colors.
  //
  // Pointing this panel at the shared file therefore renders sand on sand:
  // the line is present, correctly positioned, and completely invisible. It
  // looks like a broken asset path but nothing errors. Hence a second file.
  line: "/Illustrations/Rishikesh-Line-Dark.svg",

  // Two photographs (nodes 800:7 and 800:8). Both are object-cover inside
  // fixed boxes, per Figma — the source images are wider than their boxes
  // and get cropped, which is the intended framing, not a bug.
  photos: {
    // Node 800:7 — Ram Jhula / the river, bottom-left. Source is 878x585,
    // comfortably over 2x for a 439x236 box.
    bridge: {
      src: "/images/rishikesh-river/bridge.jpg",
      left: 40,
      top: 748,
      width: 439,
      height: 236,
    },
    // Node 800:8 — Trimbakeshwar temple, upper-right. Figma exported this
    // one's left as calc(83.33% - 10px); resolved to plain px against the
    // 1440 frame (1440 x 0.8333 - 10 = 1190) to match this project's
    // absolute-positioning convention, same treatment as the word-dot
    // offsets in rishikesh.data.ts.
    //
    // NOTE: the source is 480x320 landscape, cropped into a 210x236
    // portrait box. That's only ~1.36x for the box's height on a 2x
    // display, so this is the one asset on the panel that may read soft on
    // a retina screen. Worth re-exporting larger from the original if it
    // shows.
    temple: {
      src: "/images/rishikesh-river/temple.jpg",
      left: 1190,
      top: 229.17,
      width: 210,
      height: 236,
    },
  },
} as const;
