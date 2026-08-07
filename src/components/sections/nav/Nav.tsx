import { NAV } from "@/data/nav.data";

// ─── Pass 1: structure only ───────────────────────────────────────────────
// No animation, no interaction yet. Static layout matching Figma node
// 749:14 at rest — logo + glass pill (hamburger, Book Now), centered,
// 20px from the top of the 1440px desktop frame. Fixed over the Hero
// video since Figma has no scroll/sticky behavior defined yet.
//
// Hamburger and Book Now are both non-functional placeholders here —
// menu open/close and the booking destination land in the interaction
// pass once that's designed.
// ───────────────────────────────────────────────────────────────────────────

export default function Nav() {
  return (
    <header
      data-figma-node="749:14"
      className="fixed inset-x-0 top-5 z-50 mx-auto flex w-[298px] flex-col items-center gap-3"
    >
      <img
        src={NAV.logo.src}
        alt={NAV.logo.alt}
        width={NAV.logo.width}
        height={NAV.logo.height}
        className="h-12 w-auto"
      />

      <div className="flex w-full items-center justify-between rounded-full bg-nav-surface p-0.5 backdrop-blur-[7.95px]">
        <button
          type="button"
          aria-label={NAV.menu.label}
          className="flex size-[27px] flex-col items-center justify-center rounded-full border border-nav-border px-1.5 py-1"
        >
          <span className="flex w-full flex-col items-start gap-1">
            <span className="h-px w-full rounded-full bg-paper" />
            <span className="h-px w-full rounded-full bg-paper" />
            <span className="h-px w-full rounded-full bg-paper" />
          </span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center rounded-full border border-nav-border-strong px-3 py-[5px] font-body text-nav-label text-paper"
        >
          {NAV.cta.label}
        </button>
      </div>
    </header>
  );
}
