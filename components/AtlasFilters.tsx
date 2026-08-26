"use client";

import type { RegimeRecord } from "@/lib/grid/schema";
import { FAMILIES, FAMILY_BG_CLASS, FAMILY_LABEL, type Family } from "@/lib/family";
import { EMPTY_FILTERS, isFilterActive, type AtlasFilterState } from "@/lib/atlasFilters";

export interface AtlasFiltersProps {
  /** Always the full set — the counts on the chips describe the atlas, not the current filter. */
  records: RegimeRecord[];
  filters: AtlasFilterState;
  onChange: (next: AtlasFilterState) => void;
  visibleCount: number;
}

/**
 * Search, three family toggles, and the disagreement toggle, driving the
 * map and the regime wall together.
 *
 * The disagreement filter is the point of this bar. Where the derived
 * classification differs from BMKG's published family is the atlas's
 * actual finding (PRD.md §1), and it was reachable only as a hatch
 * texture on a dot — visible but not addressable. Here it is a control
 * with a count. It still reports, never asserts: nothing about the
 * threshold or the classification changes when it is on, only which
 * locations are drawn (CLAUDE.md invariant 3).
 */
export function AtlasFilters({ records, filters, onChange, visibleCount }: AtlasFiltersProps) {
  const familyCounts = FAMILIES.map((family) => ({
    family,
    count: records.filter((record) => record.family === family).length,
  }));
  const disagreeCount = records.filter((record) => record.agrees === false).length;
  const active = isFilterActive(filters);

  const toggleFamily = (family: Family) => {
    onChange({
      ...filters,
      families: filters.families.includes(family)
        ? filters.families.filter((f) => f !== family)
        : [...filters.families, family],
    });
  };

  return (
    <section aria-label="Saring lokasi" className="flex flex-col gap-2 border-y border-rule py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="atlas-cari" className="sr-only">
            Cari kota atau provinsi
          </label>
          <input
            id="atlas-cari"
            type="search"
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Cari kota atau provinsi…"
            className="w-56 rounded border border-stitch bg-stock px-2 py-1 text-sm placeholder:text-ink/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {familyCounts.map(({ family, count }) => {
            const on = filters.families.includes(family);
            return (
              <button
                key={family}
                type="button"
                onClick={() => toggleFamily(family)}
                aria-pressed={on}
                className={`flex items-center gap-1.5 rounded border px-2 py-1 text-sm transition-colors duration-fast ${
                  on ? "border-ink bg-plate font-medium" : "border-rule text-ink/70 hover:border-ink hover:text-ink"
                }`}
              >
                <span aria-hidden className={`inline-block h-2 w-2 shrink-0 rounded-full ${FAMILY_BG_CLASS[family]}`} />
                {FAMILY_LABEL[family]} <span className="font-mono text-xs tabular-nums">{count}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => onChange({ ...filters, onlyDisagree: !filters.onlyDisagree })}
            aria-pressed={filters.onlyDisagree}
            className={`flex items-center gap-1.5 rounded border border-dashed px-2 py-1 text-sm transition-colors duration-fast ${
              filters.onlyDisagree ? "border-ink bg-plate font-medium" : "border-stitch text-ink/70 hover:border-ink hover:text-ink"
            }`}
          >
            <span
              aria-hidden
              className="inline-block h-2 w-2 shrink-0 rounded-full bg-ink"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 1px, var(--color-stock) 1px, var(--color-stock) 2px)",
              }}
            />
            Beda dari BMKG <span className="font-mono text-xs tabular-nums">{disagreeCount}</span>
          </button>

          {active && (
            <button
              type="button"
              onClick={() => onChange(EMPTY_FILTERS)}
              className="text-sm text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink"
            >
              Tampilkan semua
            </button>
          )}
        </div>
      </div>

      <p aria-live="polite" className="font-mono text-xs tabular-nums text-ink/70">
        {visibleCount} dari {records.length} lokasi ditampilkan di peta dan dinding rezim
        {filters.onlyDisagree &&
          " · perbedaan dilaporkan apa adanya, bukan diuji — ambang klasifikasinya tidak berubah"}
      </p>
    </section>
  );
}
