import { FAMILIES, FAMILY_BG_CLASS, FAMILY_LABEL, FAMILY_TEXT_CLASS, type Family } from "@/lib/family";

export interface CoverageProportionBarProps {
  byFamily: Record<string, number>;
  total: number;
}

/**
 * Family and sub-type counts already sit as text below this (kept
 * as-is — the precise reading, DESIGN.md §10) — this reuses the same
 * family-hue encoding the reader already learned from the map and
 * legend for the one relationship a row of numbers doesn't show at a
 * glance: proportion (DESIGN-REWORK.md §2.3). Fixed family order
 * (`FAMILIES`), never sorted by count, so segment position doesn't
 * imply a ranking that doesn't exist (CLAUDE.md invariant 11 in spirit
 * — no hue implies "more" or "better").
 */
export function CoverageProportionBar({ byFamily, total }: CoverageProportionBarProps) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-4 w-full overflow-hidden border border-ink" role="presentation" aria-hidden="true">
        {FAMILIES.map((family) => {
          const count = byFamily[family] ?? 0;
          if (count === 0) return null;
          return (
            <div
              key={family}
              className={`${FAMILY_BG_CLASS[family]} border-r border-stock last:border-r-0`}
              style={{ width: `${(count / total) * 100}%` }}
            />
          );
        })}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
        {FAMILIES.map((family: Family) => {
          const count = byFamily[family] ?? 0;
          return (
            <li key={family} className={FAMILY_TEXT_CLASS[family]}>
              {FAMILY_LABEL[family]} {count} ({Math.round((count / total) * 100)}%)
            </li>
          );
        })}
      </ul>
    </div>
  );
}
