import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Alegreya, Alegreya_Sans, IBM_Plex_Mono } from "next/font/google";
import { MakerSignature } from "@/components/MakerSignature";
import { SITE_ORIGIN } from "@/lib/metadata";
import "./globals.css";

// next/font downloads and self-hosts these at build time and serves them
// from the app's own origin — no runtime request to Google Fonts, per
// DESIGN.md §1 ("self-hosted fonts") and CLAUDE.md invariant 14 (zero
// runtime network).
const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-alegreya",
  display: "swap",
});

const alegreyaSans = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-alegreya-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

// metadataBase resolves auto-detected routes (app/icon.tsx,
// app/opengraph-image.tsx) to an absolute URL — origin only, no
// basePath, since next.config.js's basePath already prefixes those
// routes before this applies (see lib/metadata.ts's SITE_ORIGIN
// comment for the double-prefix bug this avoids). pageMetadata's own
// canonical/OG urls are already absolute and don't go through this.
// title/description here are the fallback for any route that doesn't
// call pageMetadata itself (currently none do, but this is what a
// route with no metadata export at all would show).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "Pola Hujan — atlas rezim curah hujan Indonesia",
  description:
    "Klasifikasi rezim curah hujan tahunan Indonesia (monsunal, ekuatorial, lokal) dari dekomposisi harmonik data presipitasi grid terbuka — bukan Zona Musim resmi BMKG.",
};

// Locale routing (app/[locale]/, per CLAUDE.md's Layout section) is
// deferred until English content exists; Indonesian is the only UI
// language implemented so far, served flat at the app root.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${alegreya.variable} ${alegreyaSans.variable} ${plexMono.variable}`}>
      <body className="bg-stock text-ink font-sans text-base antialiased">
        <a href="#main-content" className="skip-link">
          Lompat ke konten utama
        </a>
        {children}
        <MakerSignature />
      </body>
    </html>
  );
}
