// data/nav.data.ts — the ONLY file that needs editing to change Nav content.
// Nothing in components/sections/nav reads content from anywhere else.

export const NAV = {
  logo: {
    // User-supplied local export (public/images/Logo) — the light/white
    // mark, since Nav sits over the dark Hero video. Logo-Dark.svg is the
    // counterpart for light backgrounds, once a section needs it.
    src: "/images/Logo/Logo-Light.svg",
    alt: "Bakhayi",
    width: 90,
    height: 48,
  },
  menu: {
    // No menu items exist in the Figma dev-mode frame yet — just the
    // hamburger glyph. Wire this up once the menu content/destination
    // is designed.
    label: "Open menu",
  },
  cta: {
    label: "Book Now",
  },
} as const;
