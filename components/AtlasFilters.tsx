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
 * Three family toggles and the disagreement toggle, driving the
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

  const chip = (on: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-fast ${
      on ? "border-ink bg-ink text-stock" : "border-rule bg-stock text-ink hover:border-ink"
    }`;

  return (
    <section aria-label="Saring lokasi" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {familyCounts.map(({ family, count }) => {
          const on = filters.families.includes(family);
          return (
            <button key={family} type="button" onClick={() => toggleFamily(family)} aria-pressed={on} className={chip(on)}>
              <span aria-hidden className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-stock ${FAMILY_BG_CLASS[family]}`} />
              {FAMILY_LABEL[family]} <span className="font-mono font-normal tabular-nums opacity-75">{count}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onChange({ ...filters, onlyDisagree: !filters.onlyDisagree })}
          aria-pressed={filters.onlyDisagree}
          className={chip(filters.onlyDisagree)}
        >
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-[2px] outline outline-1 outline-current"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, currentColor 0 1.2px, transparent 1.2px 3.2px)" }}
          />
          Beda dengan BMKG <span className="font-mono font-normal tabular-nums opacity-75">{disagreeCount}</span>
        </button>

        {active && (
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="px-2 text-xs font-semibold text-ink underline underline-offset-4">
            Tampilkan semua
          </button>
        )}
      </div>

      <p aria-live="polite" className="font-mono text-xs tabular-nums text-ink-muted">
        {visibleCount} dari {records.length} lokasi
        {filters.onlyDisagree && " · perbedaan dilaporkan apa adanya, bukan diuji — ambang klasifikasinya tidak berubah"}
      </p>
    </section>
  );
}
