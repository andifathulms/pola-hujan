import { describe, expect, it } from "vitest";
import { classifyRegime, type HarmonicFit } from "@/lib/harmonic";
import {
  EKUATORIAL_4_RATIO,
  EKUATORIAL_DOMINANCE_RATIO,
  MONSUNAL_MAX_DISPLACEMENT_MONTHS,
  SECONDARY_HARMONIC_SUBTYPE_RATIO,
} from "@/lib/harmonic";

function fitWith(overrides: Partial<HarmonicFit>): HarmonicFit {
  return {
    meanMm: 150,
    annualAmpMm: 100,
    annualPeakMonth: 0,
    semiAnnualAmpMm: 0,
    semiAnnualPeakMonth: 0,
    ...overrides,
  };
}

const EPS = 1e-3;

describe("classifyRegime — ekuatorial dominance boundary", () => {
  it("classifies annual-dominant just below the ratio as monsunal/lokal, not ekuatorial", () => {
    const fit = fitWith({
      annualAmpMm: 100,
      annualPeakMonth: 0,
      semiAnnualAmpMm: (EKUATORIAL_DOMINANCE_RATIO - EPS) * 100,
    });
    expect(classifyRegime(fit).family).not.toBe("ekuatorial");
  });

  it("classifies as ekuatorial at and above the ratio", () => {
    const fit = fitWith({
      annualAmpMm: 100,
      annualPeakMonth: 0,
      semiAnnualAmpMm: EKUATORIAL_DOMINANCE_RATIO * 100,
    });
    expect(classifyRegime(fit).family).toBe("ekuatorial");
  });
});

describe("classifyRegime — ekuatorial-4 sub-type boundary", () => {
  it("stays ekuatorial-1 just below the strong-ratio threshold", () => {
    const fit = fitWith({
      annualAmpMm: 100,
      semiAnnualAmpMm: (EKUATORIAL_4_RATIO - EPS) * 100,
    });
    const result = classifyRegime(fit);
    expect(result).toMatchObject({ family: "ekuatorial", subtype: "ekuatorial-1" });
  });

  it("becomes ekuatorial-4 at and above the strong-ratio threshold", () => {
    const fit = fitWith({
      annualAmpMm: 100,
      semiAnnualAmpMm: EKUATORIAL_4_RATIO * 100,
    });
    const result = classifyRegime(fit);
    expect(result).toMatchObject({ family: "ekuatorial", subtype: "ekuatorial-4" });
  });
});

describe("classifyRegime — monsunal/lokal displacement boundary", () => {
  it("classifies as monsunal at exactly the max displacement", () => {
    const fit = fitWith({
      annualAmpMm: 100,
      annualPeakMonth: MONSUNAL_MAX_DISPLACEMENT_MONTHS,
      semiAnnualAmpMm: 0,
    });
    expect(classifyRegime(fit).family).toBe("monsunal");
  });

  it("classifies as lokal just past the max displacement", () => {
    const fit = fitWith({
      annualAmpMm: 100,
      annualPeakMonth: MONSUNAL_MAX_DISPLACEMENT_MONTHS + EPS,
      semiAnnualAmpMm: 0,
    });
    expect(classifyRegime(fit).family).toBe("lokal");
  });

  it("classifies as monsunal just inside the max displacement", () => {
    const fit = fitWith({
      annualAmpMm: 100,
      annualPeakMonth: MONSUNAL_MAX_DISPLACEMENT_MONTHS - EPS,
      semiAnnualAmpMm: 0,
    });
    expect(classifyRegime(fit).family).toBe("monsunal");
  });
});

describe("classifyRegime — secondary-harmonic sub-type boundary", () => {
  it("stays the clean '-1' sub-type just below the secondary-ratio threshold", () => {
    const fit = fitWith({
      annualAmpMm: 100,
      annualPeakMonth: 0,
      semiAnnualAmpMm: (SECONDARY_HARMONIC_SUBTYPE_RATIO - EPS) * 100,
    });
    const result = classifyRegime(fit);
    expect(result).toMatchObject({ family: "monsunal", subtype: "monsunal-1" });
  });

  it("becomes the '-2' sub-type at and above the secondary-ratio threshold", () => {
    const fit = fitWith({
      annualAmpMm: 100,
      annualPeakMonth: 0,
      semiAnnualAmpMm: SECONDARY_HARMONIC_SUBTYPE_RATIO * 100,
    });
    const result = classifyRegime(fit);
    expect(result).toMatchObject({ family: "monsunal", subtype: "monsunal-2" });
  });
});
