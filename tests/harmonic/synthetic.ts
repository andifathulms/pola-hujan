import { MONTHS_PER_YEAR } from "@/lib/harmonic";

export interface SyntheticCycleParams {
  meanMm: number;
  annualAmpMm: number;
  annualPeakMonth: number;
  semiAnnualAmpMm: number;
  semiAnnualPeakMonth: number;
  /** Deterministic pseudo-noise amplitude in mm, added per month. Zero by default. */
  noiseAmpMm?: number;
  /** Seed for the deterministic noise generator; irrelevant when noiseAmpMm is 0. */
  seed?: number;
}

/**
 * Build a synthetic 12-month climatology from known amplitudes and
 * phases, so the fit can be checked against an answer we chose ourselves
 * rather than an external reference (CLAUDE.md working style: "you
 * control the answer, so correctness is provable rather than plausible").
 *
 * Noise is a fixed pseudo-random sequence (no Math.random) so the whole
 * test suite is deterministic.
 */
export function buildSyntheticCycle(params: SyntheticCycleParams): number[] {
  const { meanMm, annualAmpMm, annualPeakMonth, semiAnnualAmpMm, semiAnnualPeakMonth, noiseAmpMm = 0, seed = 1 } =
    params;

  const months: number[] = [];
  let state = seed;
  for (let t = 0; t < MONTHS_PER_YEAR; t += 1) {
    const annual = annualAmpMm * Math.cos((2 * Math.PI * (t - annualPeakMonth)) / 12);
    const semi = semiAnnualAmpMm * Math.cos((2 * Math.PI * (t - semiAnnualPeakMonth)) / 6);
    // Deterministic linear-congruential noise in [-1, 1], no Math.random.
    state = (state * 1103515245 + 12345) % 2147483648;
    const noiseUnit = (state / 2147483648) * 2 - 1;
    months.push(Math.max(0, meanMm + annual + semi + noiseUnit * noiseAmpMm));
  }
  return months;
}
