import { CURVE_WIDTH, monthCenterX } from "@/lib/curveLayout";
import { MONTH_LABELS_ID } from "@/lib/family";

/**
 * The two comparison panels' Jan–December axis, drawn once beneath both
 * (DESIGN-REWORK.md §1.1) instead of once per panel. Uses the same
 * geometry as CycleCurve and MonthGridlines so a given month sits at
 * the same x here as the gridline running up through it. Fixed order,
 * never rotated (CLAUDE.md invariant 8) — this only ever renders
 * MONTH_LABELS_ID as given.
 */
export function SharedMonthAxis() {
  return (
    <svg
      viewBox={`0 0 ${CURVE_WIDTH} 20`}
      role="presentation"
      aria-hidden="true"
      className="w-full"
    >
      {MONTH_LABELS_ID.map((label, t) => (
        <text key={label} x={monthCenterX(t)} y={12} textAnchor="middle" className="fill-ink font-mono text-tick">
          {label}
        </text>
      ))}
    </svg>
  );
}
