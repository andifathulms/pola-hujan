/**
 * Pure great-circle distance and nearest-location lookup. Used by the
 * "your place" feature (PRD.md §6.6) to match a browser-reported
 * coordinate to the closest location this build actually has data for —
 * never a prediction, never a boundary, just a nearest neighbour.
 */

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(latA: number, lonA: number, latB: number, lonB: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(latB - latA);
  const dLon = toRad(lonB - lonA);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export interface WithCoords {
  lat: number;
  lon: number;
}

export function findNearest<T extends WithCoords>(target: WithCoords, candidates: readonly T[]): T | undefined {
  let best: T | undefined;
  let bestDistanceKm = Infinity;
  for (const candidate of candidates) {
    const distanceKm = haversineDistanceKm(target.lat, target.lon, candidate.lat, candidate.lon);
    if (distanceKm < bestDistanceKm) {
      bestDistanceKm = distanceKm;
      best = candidate;
    }
  }
  return best;
}
