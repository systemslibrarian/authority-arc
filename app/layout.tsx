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
    "A five-stage learning path through library identity: identifier resolution, authority disambiguation, classification, entity connections, and metadata change tracking — taught through OCLC and VIAF.",
  openGraph: {
    title: "The Authority Arc",
    description:
      "How librarians solved identity, decades before Big Tech tried.",
    type: "website",
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
        </div>
      </body>
    </html>
  );
}
