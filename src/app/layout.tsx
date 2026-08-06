import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

// TODO: replace with the licensed "DaVinci for Balbin" font files once
// supplied, then drop this Google Fonts placeholder. Nothing downstream
// changes — --font-display-placeholder is consumed via the --font-display
// token in tokens.css.
const fontDisplayPlaceholder = Fraunces({
  variable: "--font-display-placeholder",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Bakhayi",
  description: "A curated collection of mountain homes across Uttarakhand, India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontDisplayPlaceholder.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
