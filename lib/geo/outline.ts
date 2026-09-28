/**
 * Point-in-outline for the pre-projected Indonesia coastline
 * (lib/geo/indonesiaOutline.ts). The pipeline uses this to keep the
 * regime mosaic inside Indonesia: the CHIRPS raster also covers
 * Malaysia, Timor-Leste and Papua New Guinea, and classifying those
 * would put regime colour where this atlas has no business drawing it.
 * Pure — numbers in, numbers out.
 */

/** Same equirectangular projection RegimeMap uses (640 × 320 over 95–141°E, 11°S–6°N). */
export const OUTLINE_PROJECTION = { latMin: -11, latMax: 6, lonMin: 95, lonMax: 141, width: 640, height: 320 } as const;

export function projectToOutline(lat: number, lon: number): { x: number; y: number } {
  const p = OUTLINE_PROJECTION;
  return {
    x: ((lon - p.lonMin) / (p.lonMax - p.lonMin)) * p.width,
    y: ((p.latMax - lat) / (p.latMax - p.latMin)) * p.height,
  };
}

export type Ring = Array<[number, number]>;

/**
 * Parses the outline's "M x y x y … Z" subpaths into rings. Only the
 * commands the checked-in outline uses are supported (M, implicit
 * lineto pairs, Z); anything else throws rather than guessing.
 */
export function parseOutlineRings(path: string): Ring[] {
  const rings: Ring[] = [];
  for (const sub of path.split("M").map((s) => s.trim()).filter(Boolean)) {
    if (/[A-Za-y]/.test(sub.replace(/Z\s*$/, ""))) throw new Error(`unsupported path command in outline: ${sub.slice(0, 20)}`);
    const nums = sub.replace(/Z\s*$/, "").trim().split(/[\s,]+/).map(Number);
    if (nums.length % 2 !== 0 || nums.some((n) => Number.isNaN(n))) throw new Error("malformed outline subpath");
    const ring: Ring = [];
    for (let i = 0; i < nums.length; i += 2) ring.push([nums[i] as number, nums[i + 1] as number]);
    if (ring.length >= 3) rings.push(ring);
  }
  return rings;
}

/** Even-odd rule across every ring — a lake or a hole inside a ring toggles back out. */
export function pointInRings(rings: readonly Ring[], x: number, y: number): boolean {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
      const [xi, yi] = ring[i] as [number, number];
      const [xj, yj] = ring[j] as [number, number];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}
