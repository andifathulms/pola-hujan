import { CURVE_WIDTH, monthCenterX } from "@/lib/curveLayout";
import { MONTH_LABELS_ID } from "@/lib/family";

/**
 * Vertical hairlines at each month's x-position, absolutely positioned
 * over the two stacked comparison panels so a given month is the same x
 * in both (DESIGN-REWORK.md §1.1). The parent must be `position:
 * relative` and wrap exactly the two CycleCurve panels — nothing else —
 * so the lines run through both and stop where they end.
 *
 * `--rule` is already documented in DESIGN.md §3 as "hairlines, month
 * gridlines" — this is that second use, not a new token.
 */
export function MonthGridlines() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {MONTH_LABELS_ID.map((label, t) => (
        <div
          key={label}
          className="absolute bottom-0 top-0 w-px bg-rule"
          style={{ left: `${(monthCenterX(t) / CURVE_WIDTH) * 100}%` }}
        />
      ))}
    </div>
  );
}
