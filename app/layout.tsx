import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Alegreya, Alegreya_Sans, IBM_Plex_Mono } from "next/font/google";
import { MakerSignature } from "@/components/MakerSignature";
import { SITE_URL } from "@/lib/metadata";
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

// metadataBase resolves every route's relative canonical/OG url (set via
// lib/metadata.ts's pageMetadata) to an absolute one — required for
// those tags to be valid, and set once here rather than per route.
// title/description here are the fallback for any route that doesn't
// call pageMetadata itself (currently none do, but this is what a
// route with no metadata export at all would show).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
