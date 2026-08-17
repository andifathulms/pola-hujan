import { wrapToPeriod } from "./phase";

export interface AmplitudePhase {
  ampMm: number;
  /** Month of first peak within one cycle of the given period, wrapped to [0, periodMonths). */
  peakMonth: number;
}

/**
 * Amplitude and peak month from Fourier cosine/sine coefficients for a
 * harmonic of period `periodMonths`, fit as
 * a * cos(2*pi*t/period) + b * sin(2*pi*t/period).
 */
export function amplitudeAndPhase(
  cosCoeff: number,
  sinCoeff: number,
  periodMonths: number,
): AmplitudePhase {
  const ampMm = Math.hypot(cosCoeff, sinCoeff);
  // a*cos(wt) + b*sin(wt) = amp*cos(wt - phaseRad), phaseRad = atan2(b, a)
  const phaseRad = Math.atan2(sinCoeff, cosCoeff);
  const peakMonth = wrapToPeriod((phaseRad / (2 * Math.PI)) * periodMonths, periodMonths);
  return { ampMm, peakMonth };
}
