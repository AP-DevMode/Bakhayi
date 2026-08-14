// data/rishikeshRemember.data.ts — the ONLY file that needs editing to
// change the content OR the proportions of the horizontal rail's THIRD
// panel. Nothing in RishikeshRemember.tsx reads content or geometry from
// anywhere else.
//
// Covers Figma frame "Rishikesh 3" (node 804:45). Named "remember" after
// the turn in its copy — "what people remember is something else" — rather
// than "rishikesh3", for the same reason panel 2 is "river" and not
// "rishikesh2": the Figma frame numbers and this codebase's names have
// already drifted once (785:67 turned out to be panel 1's photo state, not
// a third section), and naming by content stops that drift spreading.
//
// ─── WHY THIS IS RATIOS AND NOT ABSOLUTE PX ────────────────────────────────
// v1 of this panel reproduced Figma's dev-mode offsets literally: the ridge
// at left 730 / top 40 / 670x944, the text column absolutely placed at left
// 40 / top 157, the valley photo pinned to a 600px height. That matched the
// 1440x1024 frame exactly and broke on every other viewport — measured in
// the browser at 1512x805, the lede landed at y781 with only its first line
// on screen and the body paragraph sat entirely below the fold, because a
// column anchored to a fixed top offset cannot give height back when the
// viewport is 219px shorter than the frame it was drawn in.
//
// So the numbers below are no longer POSITIONS, they're PROPORTIONS. Every
// value is still the exact figure from Figma — nothing has been redesigned —
// but the component divides them by the frame they were measured against and
// applies the result as a percentage or a flex ratio. The panel then fills
// whatever box the rail hands it, which is Figma's own "fill container"
// behaviour rather than its absolute-position export.
//
// Practically: a Figma nudge is still a one-line edit here, and the
// component needs no arithmetic of its own beyond `value / basis`.
// ───────────────────────────────────────────────────────────────────────────

export const RISHIKESH_REMEMBER = {
  // The desktop frame every measurement below was taken against. This is a
  // DIVISOR, not a size — nothing is ever rendered at 1440x1024. It exists
  // so the px figures stay recognisable as the ones in Figma's inspector
  // instead of being pre-baked into opaque percentages here.
  frame: {
    width: 1440,
    height: 1024,
  },

  // Node 804:50 — the lede. Display font, uppercase, and the one piece of
  // type on this panel that carries the site-wide WebGL dissolve. Written as
  // one string with the list inline; Figma has no line breaks in it, the
  // measure does the wrapping.
  lede: "Rishikesh is often described through what it offers yoga, rafting, cafés, temples. What people remember is something else.",

  // Node 804:51 — the body. Justified, 80% opacity, and deliberately NOT
  // part of the reveal (justified multi-line copy would need the SDF pass to
  // reproduce the browser's justification word-spacing exactly or it ghosts
  // — see RishikeshRemember.tsx).
  body: "The sound of the river from a distance. The feeling of walking without a destination. A quiet morning before the town wakes up. A conversation that lasts longer than expected.",

  layout: {
    // The frame's inset on all four sides. Figma reports the ridge at top 40
    // with height 944 in a 1024 frame (so 40 below too), and the two columns
    // spanning 40 → 1400 in a 1440 frame — one consistent 40px margin, which
    // is why it's a single number rather than four.
    //
    // Applied as `max(padding, ratio)` in the component: it scales with the
    // viewport so the panel keeps Figma's proportions on a large display,
    // but never collapses below a floor on a small one.
    padding: 40,
    paddingFloor: 20,

    // Horizontal gap between the text column and the ridge: the ridge starts
    // at 730 and the column ends at 40 + 670 = 710.
    columnGap: 20,
    columnGapFloor: 12,

    // Flex ratios for the two columns — 670 and 670 in Figma, i.e. a dead
    // even split of the space left after the padding and the gap. Left as
    // two separate numbers rather than collapsed to `1, 1` so that a Figma
    // change to an uneven split stays a one-line edit here.
    columns: {
      left: 670,
      right: 670,
    },
  },

  photos: {
    // Node 804:46 — the misty ridge, right-hand column. Fills its column
    // completely: full width, full height, object-cover. In Figma that box
    // is 670x944, which IS the full column at 1440x1024 — the panel's
    // padding is what gives it its margins, so nothing is lost by letting it
    // fill rather than pinning it to those two numbers.
    //
    // Source is 1919x1280 landscape cropped into a tall portrait box, so
    // object-cover scales to the box's height and takes a slice out of the
    // middle. Comfortable at 1x, a little under 2x on the height.
    ridge: {
      src: "/images/rishikesh-remember/ridge.jpg",
    },

    // Node 804:49 — the sunlit valley, top of the left column. This is the
    // element that ABSORBS the difference between the viewport and the
    // frame: it's the flex-grow child of the left column, so the type below
    // it always keeps its natural height and the photo takes whatever is
    // left. Figma draws it at 670x600 with 117px of dead space above the
    // column — at 1024 tall the fill version simply eats that dead space
    // (~714 rather than 600), and at 805 tall it gives height back instead
    // of pushing the copy off the bottom of the screen.
    //
    // Source is 1340x914, so it has room to cover either way.
    valley: {
      src: "/images/rishikesh-remember/valley.jpg",
    },
  },

  // Left text column (node 804:47). `items-end` in the component is what
  // right-aligns the narrower body paragraph against the column's right edge
  // while the lede above it stays left-aligned inside its own full-width
  // sub-stack (804:48). Reproduced as flex rather than as absolute boxes so
  // the lede re-wrapping (different font metrics from Figma's) pushes the
  // body down instead of overlapping it.
  column: {
    // Vertical gap between the 804:48 sub-stack (photo + lede) and the body
    // below it, and between the photo and the lede inside 804:48. These stay
    // literal px: they're typographic rhythm between two blocks of text, not
    // proportions of the frame, and scaling them with viewport width would
    // make the copy breathe differently on every monitor for no reason.
    gap: 11,
    innerGap: 24,

    // Text measures, as fractions of the column's own width (670) rather
    // than of the frame — they're set by how many characters should sit on a
    // line, which is a property of the column they live in.
    ledeWidth: 386.051,
    bodyWidth: 325.88,
  },
} as const;
