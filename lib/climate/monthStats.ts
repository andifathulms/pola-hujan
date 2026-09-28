import { DRY_MONTH_MAX_MM, WET_MONTH_MIN_MM } from "../harmonic/thresholds";

/**
 * Plain descriptive statistics of a twelve-month normal. Pure: numbers
 * in, numbers out, so the pipeline can emit them and no component has
 * to compute them (CLAUDE.md invariant 15).
 */
export interface MonthStats {
  annualTotalMm: number;
  /** Index 0–11 (Jan = 0) of the month with the most normal rainfall; the earlier month wins a tie. */
  wettestMonth: number;
  /** Index 0–11 of the month with the least normal rainfall; the earlier month wins a tie. */
  driestMonth: number;
  /** Months above WET_MONTH_MIN_MM in the normal year (Mohr criterion). */
  wetMonths: number;
  /** Months below DRY_MONTH_MAX_MM in the normal year (Mohr criterion). */
  dryMonths: number;
}

export function monthStats(monthlyMm: readonly number[]): MonthStats {
  if (monthlyMm.length !== 12) throw new Error(`monthStats expects 12 months, got ${monthlyMm.length}`);
  let wettestMonth = 0;
  let driestMonth = 0;
  let annualTotalMm = 0;
  let wetMonths = 0;
  let dryMonths = 0;
  monthlyMm.forEach((mm, i) => {
    annualTotalMm += mm;
    if (mm > (monthlyMm[wettestMonth] as number)) wettestMonth = i;
    if (mm < (monthlyMm[driestMonth] as number)) driestMonth = i;
    if (mm > WET_MONTH_MIN_MM) wetMonths += 1;
    if (mm < DRY_MONTH_MAX_MM) dryMonths += 1;
  });
  // Summing 0.1 mm normals accumulates float noise (1999.3999…); the
  // total is stated at the same 0.1 mm scale as its inputs.
  return { annualTotalMm: Math.round(annualTotalMm * 10) / 10, wettestMonth, driestMonth, wetMonths, dryMonths };
}
