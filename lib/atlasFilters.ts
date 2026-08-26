/**
 * What the atlas's filter bar means, in one pure place. The map and the
 * regime wall both draw `applyFilters(records, filters)`, so the two
 * views can never disagree about which locations are showing.
 *
 * Pure and Node-runnable, like `lib/harmonic` — it reads fields the
 * pipeline already emitted (`family`, `agrees`) and never re-derives a
 * classification (CLAUDE.md invariant 15). Nothing here can change what
 * a location *is*, only whether it is drawn.
 */
import type { RegimeRecord } from "@/lib/grid/schema";
import type { Family } from "@/lib/family";

export interface AtlasFilterState {
  query: string;
  families: Family[];
  onlyDisagree: boolean;
}

export const EMPTY_FILTERS: AtlasFilterState = { query: "", families: [], onlyDisagree: false };

export function isFilterActive(filters: AtlasFilterState): boolean {
  return filters.query.trim() !== "" || filters.families.length > 0 || filters.onlyDisagree;
}

/**
 * An empty `families` list means every family, not none — a filter the
 * reader has not touched must not hide the atlas. Search matches the
 * location name or its province, so "Maluku" reaches Ambon and Ternate
 * without either being typed.
 */
export function applyFilters(records: RegimeRecord[], filters: AtlasFilterState): RegimeRecord[] {
  const query = filters.query.trim().toLocaleLowerCase("id");
  return records.filter((record) => {
    if (filters.onlyDisagree && record.agrees !== false) return false;
    if (filters.families.length > 0 && !filters.families.includes(record.family as Family)) return false;
    if (query === "") return true;
    return (
      record.name.toLocaleLowerCase("id").includes(query) || record.province.toLocaleLowerCase("id").includes(query)
    );
  });
}

