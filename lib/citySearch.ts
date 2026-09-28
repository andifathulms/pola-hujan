import type { Family } from "@/lib/family";
import type { RegimeRecord } from "@/lib/grid/schema";

/**
 * The global "Cari kota atau provinsi" search. Pure, so the header's
 * search box only renders results — the matching rule lives here, where
 * it can be tested, and not inside a component (CLAUDE.md invariant 15).
 */
export interface CityIndexEntry {
  id: string;
  name: string;
  province: string;
  family: Family;
}

/** Trims full records down to what the search box needs, so the header never ships monthly curves to the client. */
export function toCityIndex(records: readonly RegimeRecord[]): CityIndexEntry[] {
  return records
    .map(({ id, name, province, family }) => ({ id, name, province, family: family as Family }))
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
}

/** Lowercase, accents stripped, whitespace collapsed — "Palangka  Raya" and "palangka raya" match. */
export function normaliseQuery(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Ranks name-prefix matches first, then name-substring, then province
 * matches, alphabetical within each rank. An empty query returns
 * nothing: the box shows suggestions of its own rather than all 34.
 */
export function searchCities(index: readonly CityIndexEntry[], query: string, limit = 8): CityIndexEntry[] {
  const q = normaliseQuery(query);
  if (q === "") return [];
  const ranked: Array<{ entry: CityIndexEntry; rank: number }> = [];
  for (const entry of index) {
    const name = normaliseQuery(entry.name);
    const province = normaliseQuery(entry.province);
    let rank = -1;
    if (name.startsWith(q)) rank = 0;
    else if (name.includes(q)) rank = 1;
    else if (province.includes(q)) rank = 2;
    if (rank >= 0) ranked.push({ entry, rank });
  }
  ranked.sort((a, b) => a.rank - b.rank || a.entry.name.localeCompare(b.entry.name, "id"));
  return ranked.slice(0, limit).map((r) => r.entry);
}
