/**
 * Every internal URL the app builds, in one place. Paths end in "/"
 * because next.config.js sets trailingSlash for GitHub Pages; Next's
 * <Link> and router add the basePath themselves.
 */
export const ROUTES = {
  home: "/",
  atlas: "/peta/",
  compare: "/banding/",
  method: "/cara-kerja/",
} as const;

/** A city's own page — where search, the story and "pola serupa" links go. */
export function cityHref(id: string): string {
  return `/kota/${encodeURIComponent(id)}/`;
}

/** The atlas with a city selected. */
export function atlasHref(id: string): string {
  return `${ROUTES.atlas}?lokasi=${encodeURIComponent(id)}`;
}

/** The comparison view preloaded with two cities. */
export function compareHref(aId: string, bId: string): string {
  return `${ROUTES.compare}?kiri=${encodeURIComponent(aId)}&kanan=${encodeURIComponent(bId)}`;
}

/** The harmonic explainer, seeded with a city's own fit. */
export function explainerHref(id: string): string {
  return `${ROUTES.method}?dari=${encodeURIComponent(id)}#interaktif`;
}
