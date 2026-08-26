import { FAMILY_FILL_CLASS, type Family } from "@/lib/family";

export interface MiniCycleProps {
  monthlyMm: number[];
  family: Family;
  /** The cell's own y-scale, in mm, so the caller can state it next to the chart. */
  maxMm: number;
}

// A wall cell, not a chart: twelve slots wide, no axis, no ticks, no
// legend. Geometry is deliberately its own — CycleCurve's canvas is
// 480x240 with a 40px gutter for y-labels, none of which survives at
// thumbnail size — but the twelve-slot division is identical, so a given
// month sits at the same fraction of every cell's width and the wall
// reads as one shared Jan-Dec axis (DESIGN-REWORK.md §1.1's shared-axis
// principle, applied across 34 panels instead of two).
const WIDTH = 120;
const HEIGHT = 44;
const BAR_GAP = 1.4;
const SLOT = WIDTH / 12;

/**
 * One location's twelve monthly normals at wall size. Month order is
 * fixed Jan-Dec and this component never rotates it (CLAUDE.md
 * invariant 8) — peaks landing in different months is the whole point
 * of putting the cells side by side.
 *
 * The two fitted harmonics are deliberately not drawn here. They are the
 * evidence for the classification (DESIGN.md §4) and need room to be
 * read as two separate lines; at 120x44 they would overlap into one
 * grey smudge, which would assert the fit rather than show it. The
 * reading panel and the field plate draw them at a size where they can
 * actually be told apart.
 */
export function MiniCycle({ monthlyMm, family, maxMm }: MiniCycleProps) {
  const scale = maxMm > 0 ? maxMm : 1;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" aria-hidden="true" focusable="false">
      {/* Month gridlines, same twelve divisions in every cell — this is
          what lets the eye carry a month across the wall. */}
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={i}
          x1={(i + 1) * SLOT}
          y1={0}
          x2={(i + 1) * SLOT}
          y2={HEIGHT - 1}
          className="stroke-rule"
          strokeWidth={0.5}
        />
      ))}

      {monthlyMm.map((mm, month) => {
        const height = ((HEIGHT - 1) * mm) / scale;
        return (
          <rect
            key={month}
            x={month * SLOT + BAR_GAP}
            y={HEIGHT - 1 - height}
            width={SLOT - BAR_GAP * 2}
            height={height}
            className={FAMILY_FILL_CLASS[family]}
          />
        );
      })}

      <line x1={0} y1={HEIGHT - 1} x2={WIDTH} y2={HEIGHT - 1} className="stroke-ink" strokeWidth={0.75} />
    </svg>
  );
}
