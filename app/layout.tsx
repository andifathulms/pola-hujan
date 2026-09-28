import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Newsreader, IBM_Plex_Mono } from "next/font/google";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SITE_ORIGIN, SITE_URL } from "@/lib/metadata";
import "./globals.css";

// next/font downloads and self-hosts these at build time and serves them
// from the app's own origin — no runtime request to Google Fonts, per
// DESIGN.md §1 ("self-hosted fonts") and CLAUDE.md invariant 14 (zero
// runtime network).
// The variables are named for the role, not the face — body, story,
// mono — so the next time a typeface changes, nothing downstream has to
// be renamed with it.
//
// Plus Jakarta Sans (Tokotype, drawn for Jakarta's own city identity)
// does all the structural work: headings, controls, labels and body.
// Headings are set apart from body by weight and tracking, not by a
// second face. Newsreader italic is the story voice — only the sentences
// that carry a finding (DESIGN.md §8). Both are variable fonts, so
// `weight` is omitted and the whole axis ships in one file each.
const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const story = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-story",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// metadataBase resolves auto-detected routes (app/icon.svg,
// app/apple-icon.png) to an absolute URL — origin only, no basePath,
// since next.config.js's basePath already prefixes those routes before
// this applies (see lib/metadata.ts's SITE_ORIGIN comment for the
// double-prefix bug this avoids). pageMetadata's own canonical/OG urls
// are already absolute and don't go through this. title/description
// here are the fallback for any route that doesn't call pageMetadata
// itself (currently none do, but this is what a route with no metadata
// export at all would show).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "Pola Hujan — atlas rezim curah hujan Indonesia",
  description:
    "Klasifikasi rezim curah hujan tahunan Indonesia (monsunal, ekuatorial, lokal) dari dekomposisi harmonik data presipitasi grid terbuka — bukan Zona Musim resmi BMKG.",
  // public/manifest.webmanifest is a plain static file, not Next's
  // app/manifest.ts convention — that convention's own auto-generated
  // <link rel="manifest"> was confirmed (by inspecting the built HTML)
  // to always omit the basePath prefix, 404ing at the real deployed
  // URL, and it overrides an explicit `manifest` field here rather than
  // deferring to it. The manifest's content is static anyway (fixed
  // icons/name/colours, nothing derived from data), so a checked-in
  // file sidesteps the bug entirely.
  manifest: new URL("manifest.webmanifest", SITE_URL).toString(),
};

// Locale routing (app/[locale]/, per CLAUDE.md's Layout section) is
// deferred until English content exists; Indonesian is the only UI
// language implemented so far, served flat at the app root.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${body.variable} ${story.variable} ${mono.variable}`}>
      <body className="bg-stock text-ink font-sans text-base antialiased">
        <a href="#main-content" className="skip-link">
          Lompat ke konten utama
        </a>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
