import { circularMonthDistance } from "@/lib/harmonic";
import { CURVE_WIDTH, monthCenterX } from "@/lib/curveLayout";

export interface PeakDisplacementMarkersProps {
  leftPeakMonth: number;
  rightPeakMonth: number;
  sameFamily: boolean;
}

/**
 * Vertical markers at each place's peak month, running through both
 * comparison panels, with the displacement between them stated in
 * months (DESIGN-REWORK.md §1.2) — the number that defines the Lokal
 * family (PRD.md §3, "peak roughly six months displaced") made visible
 * on screen instead of only asserted in prose.
 *
 * Both peak months are pipeline output (RegimeRecord.peakMonth); the
 * only thing worked out here is the circular distance between two
 * already-known numbers, and it's done by lib/harmonic's own
 * circularMonthDistance rather than reimplemented — CLAUDE.md
 * invariant 15 is about not putting domain logic in a component, not
 * about forbidding a component from calling the library that owns it.
 *
 * Drawn only where the two places classify into different families —
 * DESIGN-REWORK.md §1.2: "Where the two places are the same family, no
 * displacement marker is drawn. Absence is information." `ink`, not a
 * family hue: this is a relationship between two regimes, not a regime
 * (invariant 10).
 */
export function PeakDisplacementMarkers({ leftPeakMonth, rightPeakMonth, sameFamily }: PeakDisplacementMarkersProps) {
  if (sameFamily) return null;

  const leftX = (monthCenterX(leftPeakMonth) / CURVE_WIDTH) * 100;
  const rightX = (monthCenterX(rightPeakMonth) / CURVE_WIDTH) * 100;
  const labelX = (leftX + rightX) / 2;
  const distance = circularMonthDistance(leftPeakMonth, rightPeakMonth);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute bottom-0 top-0 w-[1.5px] bg-ink" style={{ left: `${leftX}%` }} />
      <div className="absolute bottom-0 top-0 w-[1.5px] bg-ink" style={{ left: `${rightX}%` }} />
      <span
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border border-ink bg-stock px-1.5 py-0.5 font-mono text-xs text-ink"
        style={{ left: `${labelX}%` }}
      >
        {distance.toFixed(1)} bulan
      </span>
    </div>
  );
}
