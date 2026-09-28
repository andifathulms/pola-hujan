import type { RegimeRecord } from "@/lib/grid/schema";
import { FAMILY_LABEL, FAMILY_TEXT_CLASS, MONTH_LABELS_ID, type Family } from "@/lib/family";
import { CurveLegend, CycleCurve } from "@/components/curve/CycleCurve";
import { MonthGridlines } from "@/components/compare/MonthGridlines";
import { PeakDisplacementMarkers } from "@/components/compare/PeakDisplacementMarkers";
import { SharedMonthAxis } from "@/components/compare/SharedMonthAxis";

/**
 * One comparison panel: name, family, and the bars and harmonics. Its
 * own month labels are suppressed — the panels share one axis, drawn
 * once beneath both. Its mm scale stays its own: the comparison is of
 * shape and timing, not magnitude (DESIGN-REWORK.md §1.1).
 */
function CyclePanel({ record }: { record: RegimeRecord }) {
  const family = record.family as Family;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h3 className="text-lg font-extrabold tracking-tight">{record.name}</h3>
        <p className={`text-xs font-bold ${FAMILY_TEXT_CLASS[family]}`}>
          {FAMILY_LABEL[family]} · <span className="font-mono font-normal">{record.subtype}</span>
        </p>
        <p className="font-mono text-xs text-ink-muted">terbasah {MONTH_LABELS_ID[record.wettestMonth]}</p>
      </div>
      <CycleCurve
        monthlyMm={record.monthlyMm}
        annualCurveMm={record.annualCurveMm}
        semiAnnualCurveMm={record.semiAnnualCurveMm}
        meanMm={record.fit.meanMm}
        family={family}
        showMonthLabels={false}
        showLegend={false}
      />
    </div>
  );
}

/**
 * Two places stacked on one fixed Jan–Des axis, gridlines running
 * through both, peak markers where the families differ (PRD.md §6.4,
 * DESIGN-REWORK.md §1). Both curves draw at once — that simultaneity is
 * the demonstration. Used by /banding and by the home page's story.
 */
export function StackedCompare({ left, right }: { left: RegimeRecord; right: RegimeRecord }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex flex-col gap-6">
        <MonthGridlines />
        <PeakDisplacementMarkers leftPeakMonth={left.peakMonth} rightPeakMonth={right.peakMonth} sameFamily={left.family === right.family} />
        <CyclePanel key={`a-${left.id}`} record={left} />
        <CyclePanel key={`b-${right.id}`} record={right} />
      </div>
      <SharedMonthAxis />
      <CurveLegend family={left.family as Family} />
    </div>
  );
}
