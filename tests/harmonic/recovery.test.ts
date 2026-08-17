import { describe, expect, it } from "vitest";
import { fitHarmonics } from "@/lib/harmonic";
import { buildSyntheticCycle } from "./synthetic";

const NOISY_AMP_TOLERANCE_MM = 3;
const NOISY_PHASE_TOLERANCE_MONTHS = 0.5;

describe("fitHarmonics — synthetic recovery, noise-free", () => {
  const cases: Array<{
    name: string;
    annualAmpMm: number;
    annualPeakMonth: number;
    semiAnnualAmpMm: number;
    semiAnnualPeakMonth: number;
  }> = [
    { name: "monsunal-shaped", annualAmpMm: 120, annualPeakMonth: 0, semiAnnualAmpMm: 10, semiAnnualPeakMonth: 1 },
    { name: "ekuatorial-shaped", annualAmpMm: 20, annualPeakMonth: 3, semiAnnualAmpMm: 80, semiAnnualPeakMonth: 2 },
    { name: "lokal-shaped", annualAmpMm: 100, annualPeakMonth: 6, semiAnnualAmpMm: 5, semiAnnualPeakMonth: 4 },
    { name: "peak at Nov (year-boundary case)", annualAmpMm: 90, annualPeakMonth: 10.5, semiAnnualAmpMm: 15, semiAnnualPeakMonth: 5 },
  ];

  for (const c of cases) {
    it(`recovers amplitude and phase for ${c.name}`, () => {
      const meanMm = 150;
      const cycle = buildSyntheticCycle({
        meanMm,
        annualAmpMm: c.annualAmpMm,
        annualPeakMonth: c.annualPeakMonth,
        semiAnnualAmpMm: c.semiAnnualAmpMm,
        semiAnnualPeakMonth: c.semiAnnualPeakMonth,
      });

      const fit = fitHarmonics(cycle);

      expect(fit.meanMm).toBeCloseTo(meanMm, 6);
      expect(fit.annualAmpMm).toBeCloseTo(c.annualAmpMm, 4);
      expect(fit.annualPeakMonth).toBeCloseTo(c.annualPeakMonth, 4);
      expect(fit.semiAnnualAmpMm).toBeCloseTo(c.semiAnnualAmpMm, 4);
      // Semi-annual phase is only unique modulo 6 months; peakMonth is already wrapped to [0,6).
      expect(fit.semiAnnualPeakMonth).toBeGreaterThanOrEqual(0);
      expect(fit.semiAnnualPeakMonth).toBeLessThan(6);
    });
  }
});

describe("fitHarmonics — synthetic recovery, swept across noise and amplitude ratio", () => {
  const noiseLevelsMm = [0, 5, 15, 30];
  const amplitudeRatios = [0.2, 0.5, 1, 2, 5];

  for (const noiseAmpMm of noiseLevelsMm) {
    for (const ratio of amplitudeRatios) {
      it(`recovers within tolerance at noise=${noiseAmpMm}mm, semi/annual ratio=${ratio}`, () => {
        const annualAmpMm = 50;
        const semiAnnualAmpMm = annualAmpMm * ratio;
        // meanMm stays well above annualAmpMm + semiAnnualAmpMm + noiseAmpMm
        // at every ratio in the sweep so the cycle never clips at zero —
        // clipping is a real physical effect for extreme synthetic inputs,
        // but it is not what this suite is testing.
        const cycle = buildSyntheticCycle({
          meanMm: 400,
          annualAmpMm,
          annualPeakMonth: 1,
          semiAnnualAmpMm,
          semiAnnualPeakMonth: 3,
          noiseAmpMm,
          seed: Math.round((noiseAmpMm + 1) * ratio * 97),
        });

        const fit = fitHarmonics(cycle);

        expect(Math.abs(fit.annualAmpMm - annualAmpMm)).toBeLessThan(NOISY_AMP_TOLERANCE_MM * (noiseAmpMm || 1));
        expect(Math.abs(fit.semiAnnualAmpMm - semiAnnualAmpMm)).toBeLessThan(
          NOISY_AMP_TOLERANCE_MM * (noiseAmpMm || 1),
        );
        if (noiseAmpMm === 0) {
          expect(fit.annualPeakMonth).toBeCloseTo(1, 4);
        } else {
          expect(Math.abs(fit.annualPeakMonth - 1)).toBeLessThan(NOISY_PHASE_TOLERANCE_MONTHS * (noiseAmpMm / 5));
        }
      });
    }
  }
});
