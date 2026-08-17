import type { HarmonicFit } from "./fit";
import { circularMonthDistance } from "./phase";
import {
  EKUATORIAL_4_RATIO,
  EKUATORIAL_DOMINANCE_RATIO,
  LOKAL_MIN_DISPLACEMENT_MONTHS,
  MONSOON_PEAK_CENTER_MONTH,
  MONSUNAL_MAX_DISPLACEMENT_MONTHS,
  SECONDARY_HARMONIC_SUBTYPE_RATIO,
} from "./thresholds";

export type MonsunalSubtype = "monsunal-1" | "monsunal-2";
export type EkuatorialSubtype = "ekuatorial-1" | "ekuatorial-4";
export type LokalSubtype = "lokal-1" | "lokal-2";

export type RegimeClassification =
  | { family: "monsunal"; subtype: MonsunalSubtype; peakMonth: number; displacementMonths: number }
  | { family: "ekuatorial"; subtype: EkuatorialSubtype; peakMonth: number; semiToAnnualRatio: number }
  | { family: "lokal"; subtype: LokalSubtype; peakMonth: number; displacementMonths: number };

/**
 * Classify a fitted annual cycle into one of the three BMKG-terminology
 * families by amplitude ratio and phase — never by amplitude value alone,
 * since regime is about shape, not total rainfall. See PRD.md §3 and
 * CLAUDE.md invariant 10 (family = hue, sub-type = tint, never a fourth
 * family).
 */
export function classifyRegime(fit: HarmonicFit): RegimeClassification {
  const ratio = fit.annualAmpMm === 0 ? Infinity : fit.semiAnnualAmpMm / fit.annualAmpMm;

  if (ratio >= EKUATORIAL_DOMINANCE_RATIO) {
    const subtype: EkuatorialSubtype = ratio >= EKUATORIAL_4_RATIO ? "ekuatorial-4" : "ekuatorial-1";
    return {
      family: "ekuatorial",
      subtype,
      peakMonth: fit.semiAnnualPeakMonth,
      semiToAnnualRatio: ratio,
    };
  }

  const displacementMonths = circularMonthDistance(fit.annualPeakMonth, MONSOON_PEAK_CENTER_MONTH);

  if (displacementMonths <= MONSUNAL_MAX_DISPLACEMENT_MONTHS) {
    const subtype: MonsunalSubtype = ratio >= SECONDARY_HARMONIC_SUBTYPE_RATIO ? "monsunal-2" : "monsunal-1";
    return { family: "monsunal", subtype, peakMonth: fit.annualPeakMonth, displacementMonths };
  }

  // displacementMonths > MONSUNAL_MAX_DISPLACEMENT_MONTHS, and by
  // construction LOKAL_MIN_DISPLACEMENT_MONTHS === MONSUNAL_MAX_DISPLACEMENT_MONTHS,
  // so every remaining case is Lokal (invariant asserted in tests/classify).
  if (displacementMonths < LOKAL_MIN_DISPLACEMENT_MONTHS) {
    throw new Error("unreachable: displacement falls between the monsunal and lokal thresholds");
  }
  const subtype: LokalSubtype = ratio >= SECONDARY_HARMONIC_SUBTYPE_RATIO ? "lokal-2" : "lokal-1";
  return { family: "lokal", subtype, peakMonth: fit.annualPeakMonth, displacementMonths };
}
