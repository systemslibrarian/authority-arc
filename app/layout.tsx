import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { StripNav } from "@/components/shared/strip-nav";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://authorityarc.systemslibrarian.dev"),
  title: {
    default: "The Authority Arc",
    template: "%s — The Authority Arc",
  },
  description:
    "A five-stage learning path through library identity: identifier resolution, telling near-duplicate records apart, classification, entity connections, and metadata change tracking — taught through OCLC and VIAF.",
  openGraph: {
    title: "The Authority Arc",
    description:
      "How librarians solved identity, decades before Big Tech tried.",
    type: "website",
    siteName: "The Authority Arc",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Authority Arc",
    description:
      "How librarians solved identity, decades before Big Tech tried.",
    creator: "@systemslibrarian",
  },
  authors: [{ name: "Paul Clark", url: "https://systemslibrarian.dev" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3eee4",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="paper-grain bg-paper bg-paper-warmth text-ink font-sans font-light antialiased min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[2px] focus:bg-ink focus:px-4 focus:py-3 focus:font-mono focus:text-[12px] focus:uppercase focus:tracking-eyebrow focus:text-paper focus:outline-none focus:ring-2 focus:ring-oxblood focus:ring-offset-2 focus:ring-offset-paper"
        >
          Skip to content
        </a>
        <div className="relative z-10">
          <StripNav />
          {children}
          <SiteDedication />
        </div>
      </body>
    </html>
  );
}

/**
 * Standard site dedication. A small scriptural footer appearing under every
 * page, below each page's own nav-footer. Mono, italic, deliberately quiet.
 */
function SiteDedication() {
  return (
    <aside
      aria-label="Site dedication"
      className="border-t border-rule bg-paper py-5"
    >
      <div className="mx-auto max-w-[1100px] px-5 text-center font-display sm:px-7">
        <p className="m-0 italic text-[13px] leading-[1.55] text-ink-faint">
          “Whether therefore ye eat, or drink, or whatsoever ye do, do all to
          the glory of God.”
        </p>
        <p className="mt-1 font-mono text-[9.5px] uppercase tracking-eyebrow text-ink-faint not-italic">
          1 Corinthians 10:31
        </p>
      </div>
    </aside>
  );
}
