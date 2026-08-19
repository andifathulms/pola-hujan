import type { Metadata } from "next";

/**
 * The deployed URL (CLAUDE.md "Current state"). Used only to resolve
 * canonical/OG URLs to absolute form — the app itself makes zero
 * runtime requests to it.
 */
export const SITE_URL = "https://andifathulms.github.io/pola-hujan/";
/**
 * Origin only, no basePath — this is what `metadataBase` in
 * app/layout.tsx must use. Next.config.js's `basePath` already prefixes
 * auto-detected routes (like app/opengraph-image.tsx) before resolving
 * them against metadataBase; giving metadataBase the full SITE_URL
 * (which also has "/pola-hujan/") doubled that prefix into
 * ".../pola-hujan/pola-hujan/opengraph-image" — caught by inspecting
 * the actual rendered og:image tag, not assumed correct.
 */
export const SITE_ORIGIN = "https://andifathulms.github.io";
const SITE_NAME = "Pola Hujan";
/**
 * app/opengraph-image.tsx's rendered output. Referenced explicitly
 * rather than relying on Next's file-convention auto-attachment —
 * verified that only worked for "/" and silently dropped for every
 * other route the moment it defined its own `openGraph` object, which
 * every route here does.
 */
const OG_IMAGE_URL = new URL("opengraph-image", SITE_URL).toString();

export interface PageMetadataInput {
  title: string;
  /** Should be the same string already rendered on the page (see lib/pageCopy.ts) — not a hand-written paraphrase that can drift from it. */
  description: string;
  /** This route's own path, e.g. "/banding/". */
  path: string;
  /**
   * Where this route's canonical/OG url should point, if different from
   * `path` — used once, for "/peta/", which renders byte-identical
   * content to "/" and shouldn't compete with it as a separate
   * indexable page.
   */
  canonicalPath?: string;
}

/**
 * Builds title + description + canonical + OpenGraph + Twitter from a
 * single title/description pair, so a route only states its copy once
 * instead of separately inside three metadata shapes that could drift
 * from each other.
 */
export function pageMetadata({ title, description, path, canonicalPath }: PageMetadataInput): Metadata {
  // A leading "/" makes `new URL` resolve against the domain root,
  // discarding SITE_URL's own "/pola-hujan/" path — strip it so the
  // route path resolves as relative to SITE_URL instead.
  const relativePath = (canonicalPath ?? path).replace(/^\//, "");
  const canonicalUrl = new URL(relativePath, SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "id_ID",
      type: "website",
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE_URL],
    },
  };
}
