// ─── Rishikesh — staggered word-dot labels ──────────────────────────────────
// Purely presentational now — the staggered reveal itself is owned by
// RishikeshScrollSequence.tsx, which needs the line fade-out, photo
// fade-in, and this dot stagger all scrubbing off ONE shared pinned
// timeline (see that file's comment for why). This component just renders
// the 9 dots, each tagged with data-rishikesh-dot so the orchestrator can
// find them, starting at opacity 0 / offset inline so there's no flash of
// fully-visible dots before JS/GSAP takes over on mount.
//
// Modeled on leandra-isler.ch's hero headline reveal (confirmed reference,
// https://www.leandra-isler.ch/en — "Practice for Atlasology and
// Naturopathy"): each word rises with a fade, tightly staggered in a
// randomized (non-reading-order) order, since these 9 words are scattered
// across the frame rather than sitting on one line. Timing lives in
// lib/rishikeshDotsReveal.config.ts.
//
// Previously this owned its own ScrollTrigger/IntersectionObserver (see
// rishikeshDotsReveal.config.ts's history) — superseded now that the dots
// only start once the section is fully loaded and the user keeps scrolling
// further, which needs a pin, and a pin can only be owned by one
// ScrollTrigger.
// ─────────────────────────────────────────────────────────────────────────

type Dot = {
  label: string;
  left: number;
  top: number;
};

type RishikeshDotsRevealProps = {
  dots: readonly Dot[];
  icon: string;
};

export default function RishikeshDotsReveal({
  dots,
  icon,
}: RishikeshDotsRevealProps) {
  return (
    <div className="contents">
      {dots.map((dot) => (
        <div
          key={dot.label}
          data-rishikesh-dot=""
          className="absolute z-10 flex items-center gap-[5px] text-paper"
          style={{ left: dot.left, top: dot.top, opacity: 0 }}
        >
          <img
            src={icon}
            alt=""
            aria-hidden="true"
            className="size-3 shrink-0"
          />
          <p className="font-body text-rishikesh2-dot whitespace-nowrap uppercase">
            {dot.label}
          </p>
        </div>
      ))}
    </div>
  );
}
