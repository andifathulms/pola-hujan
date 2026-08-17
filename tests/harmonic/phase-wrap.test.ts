import { describe, expect, it } from "vitest";
import { circularMonthDistance, fitHarmonics, wrapMonths } from "@/lib/harmonic";
import { buildSyntheticCycle } from "./synthetic";

describe("wrapMonths", () => {
  it("leaves in-range values unchanged", () => {
    expect(wrapMonths(0)).toBeCloseTo(0);
    expect(wrapMonths(11.9)).toBeCloseTo(11.9);
  });

  it("wraps values at and past the December–January boundary", () => {
    expect(wrapMonths(12)).toBeCloseTo(0);
    expect(wrapMonths(12.5)).toBeCloseTo(0.5);
    expect(wrapMonths(-0.5)).toBeCloseTo(11.5);
    expect(wrapMonths(-12)).toBeCloseTo(0);
  });
});

describe("circularMonthDistance", () => {
  it("is symmetric and wraps across the year boundary", () => {
    expect(circularMonthDistance(11.5, 0)).toBeCloseTo(0.5);
    expect(circularMonthDistance(0, 11.5)).toBeCloseTo(0.5);
    expect(circularMonthDistance(0, 6)).toBeCloseTo(6);
  });
});

describe("fitHarmonics — peak recovery across the December–January boundary", () => {
  it("recovers a peak just before January as a small positive month, not a jump to ~12", () => {
    const cycle = buildSyntheticCycle({
      meanMm: 150,
      annualAmpMm: 100,
      annualPeakMonth: 11.7, // late December
      semiAnnualAmpMm: 5,
      semiAnnualPeakMonth: 2,
    });
    const fit = fitHarmonics(cycle);
    // Wrapped representation must stay within [0, 12) and close to 11.7,
    // not discontinuously reported as e.g. -0.3.
    expect(fit.annualPeakMonth).toBeGreaterThanOrEqual(0);
    expect(fit.annualPeakMonth).toBeLessThan(12);
    expect(circularMonthDistance(fit.annualPeakMonth, 11.7)).toBeCloseTo(0, 3);
  });
});
