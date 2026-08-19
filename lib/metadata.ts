import type { Metadata } from "next";

/**
 * The deployed URL (CLAUDE.md "Current state"). Used only to resolve
 * canonical/OG URLs to absolute form — the app itself makes zero
 * runtime requests to it.
 */
export const SITE_URL = "https://andifathulms.github.io/pola-hujan/";
const SITE_NAME = "Pola Hujan";

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
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
