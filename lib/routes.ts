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

/** Where a city name links to from search, the wall, and the story. */
export function cityHref(id: string): string {
  return `${ROUTES.atlas}?lokasi=${encodeURIComponent(id)}`;
}

/** The comparison view preloaded with two cities. */
export function compareHref(aId: string, bId: string): string {
  return `${ROUTES.compare}?kiri=${encodeURIComponent(aId)}&kanan=${encodeURIComponent(bId)}`;
}
