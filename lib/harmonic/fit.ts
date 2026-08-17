import { amplitudeAndPhase } from "./amplitude";

export const MONTHS_PER_YEAR = 12;
const ANNUAL_PERIOD_MONTHS = 12;
const SEMI_ANNUAL_PERIOD_MONTHS = 6;

export interface HarmonicFit {
  meanMm: number;
  annualAmpMm: number;
  /** Month of the annual peak, Jan = 0 .. Dec = 11.999, wrapped to [0, 12). */
  annualPeakMonth: number;
  semiAnnualAmpMm: number;
  /** Month of the first semi-annual peak, wrapped to [0, 6). */
  semiAnnualPeakMonth: number;
}

/**
 * Least-squares fit of the annual and semi-annual harmonics to a 12-value
 * monthly climatology (Jan first). With exactly 12 equally spaced monthly
 * samples the least-squares Fourier coefficients have a closed form — no
 * iterative solver needed, which is why this stays pure and dependency-free.
 *
 * `lib/harmonic` is pure Node/TS: numbers in, numbers out. See CLAUDE.md
 * invariant 1.
 */
export function fitHarmonics(monthlyMm: readonly number[]): HarmonicFit {
  if (monthlyMm.length !== MONTHS_PER_YEAR) {
    throw new Error(`fitHarmonics expects exactly 12 monthly values, got ${monthlyMm.length}`);
  }

  const n = MONTHS_PER_YEAR;
  const meanMm = monthlyMm.reduce((sum, v) => sum + v, 0) / n;

  let annualCos = 0;
  let annualSin = 0;
  let semiCos = 0;
  let semiSin = 0;

  for (let t = 0; t < n; t += 1) {
    const value = monthlyMm[t] as number;
    const annualAngle = (2 * Math.PI * t) / ANNUAL_PERIOD_MONTHS;
    const semiAngle = (2 * Math.PI * t) / SEMI_ANNUAL_PERIOD_MONTHS;
    annualCos += value * Math.cos(annualAngle);
    annualSin += value * Math.sin(annualAngle);
    semiCos += value * Math.cos(semiAngle);
    semiSin += value * Math.sin(semiAngle);
  }

  // Closed-form least-squares coefficients for n equally spaced samples.
  const annualScale = 2 / n;
  const semiScale = 2 / n;

  const annual = amplitudeAndPhase(annualCos * annualScale, annualSin * annualScale, ANNUAL_PERIOD_MONTHS);
  const semiAnnual = amplitudeAndPhase(semiCos * semiScale, semiSin * semiScale, SEMI_ANNUAL_PERIOD_MONTHS);

  return {
    meanMm,
    annualAmpMm: annual.ampMm,
    annualPeakMonth: annual.peakMonth,
    semiAnnualAmpMm: semiAnnual.ampMm,
    semiAnnualPeakMonth: semiAnnual.peakMonth,
  };
}

/** The fitted annual harmonic alone, evaluated at month `t` (Jan = 0). Used to draw the two harmonics separately — see CLAUDE.md invariant 9. */
export function annualHarmonicMm(fit: HarmonicFit, t: number): number {
  const angle = (2 * Math.PI * (t - fit.annualPeakMonth)) / ANNUAL_PERIOD_MONTHS;
  return fit.meanMm + fit.annualAmpMm * Math.cos(angle);
}

/** The fitted semi-annual harmonic alone, evaluated at month `t` (Jan = 0), zero-mean (the mean is carried by the annual term). */
export function semiAnnualHarmonicMm(fit: HarmonicFit, t: number): number {
  const angle = (2 * Math.PI * (t - fit.semiAnnualPeakMonth)) / SEMI_ANNUAL_PERIOD_MONTHS;
  return fit.semiAnnualAmpMm * Math.cos(angle);
}
