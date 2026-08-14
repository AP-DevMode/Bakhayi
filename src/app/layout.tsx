import type { Metadata } from "next";
import localFont from "next/font/local";
import Nav from "@/components/sections/nav/Nav";
import SmoothScroll from "@/components/effects/SmoothScroll";
import "./globals.css";

// Licensed display face — used for all headings/hero copy. Regular + Italic
// only (matches what's been supplied so far). Consumed via the
// --font-display token in tokens.css — nothing downstream needs to change
// if more weights/styles are added later.
const fontDisplay = localFont({
  src: [
    { path: "../fonts/DaVinciForBalbin-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/DaVinciForBalbin-Italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-display-raw",
  display: "swap",
});

// Body/UI face. Consumed via the --font-body token in tokens.css.
const fontBody = localFont({
  src: [
    { path: "../fonts/PPNeueMontreal-Book.otf", weight: "400", style: "normal" },
    { path: "../fonts/PPNeueMontreal-Italic.otf", weight: "400", style: "italic" },
    { path: "../fonts/PPNeueMontreal-Medium.otf", weight: "500", style: "normal" },
  ],
  variable: "--font-body-raw",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bakhayi",
  description: "A curated collection of mountain homes across Uttarakhand, India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning is here for BROWSER EXTENSIONS, not for any
          server/client difference of our own. Extensions inject attributes
          onto <body> before React hydrates — ColorZilla adds
          cz-shortcut-listen="true", Grammarly adds data-gr-ext-installed, and
          several password managers do the same — and React reports the
          resulting attribute mismatch as a hydration error even though the
          markup we render is identical on both sides.

          It is deliberately scoped to this ONE element and does NOT cascade:
          React only silences attribute/text differences on the tag that
          carries it, so a genuine hydration bug anywhere inside the app still
          reports normally. Do not add this to a component to make a real
          mismatch go away — the cause there is always ours to fix. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SmoothScroll />
        <Nav />
        {children}
      </body>
    </html>
  );
}
