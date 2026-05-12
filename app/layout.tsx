import type { Metadata } from "next";
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
        <div className="relative z-10">
          <StripNav />
          {children}
        </div>
      </body>
    </html>
  );
}
