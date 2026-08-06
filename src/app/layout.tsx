import type { Metadata } from "next";
import localFont from "next/font/local";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
