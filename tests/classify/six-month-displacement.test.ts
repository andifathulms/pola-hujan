import { describe, expect, it } from "vitest";
import { classifyRegime, fitHarmonics } from "@/lib/harmonic";
import { buildSyntheticCycle } from "../harmonic/synthetic";

/**
 * The case that defines the product (PRD.md §8, CLAUDE.md working style):
 * a cycle whose peak sits half a year from the Asian-monsoon window must
 * classify as Lokal, not Monsunal. This fixture is permanent — do not
 * relax it to make a threshold change pass.
 */
describe("classifyRegime — six-month displacement is the Lokal case", () => {
  it("classifies a July-peaking, annual-dominant cycle as lokal", () => {
    const cycle = buildSyntheticCycle({
      meanMm: 150,
      annualAmpMm: 100,
      annualPeakMonth: 6, // July: exactly opposite the January monsoon-peak centre
      semiAnnualAmpMm: 5,
      semiAnnualPeakMonth: 0,
    });

    const fit = fitHarmonics(cycle);
    const result = classifyRegime(fit);

    expect(result.family).toBe("lokal");
  });

  it("classifies a January-peaking, otherwise identical cycle as monsunal", () => {
    const cycle = buildSyntheticCycle({
      meanMm: 150,
      annualAmpMm: 100,
      annualPeakMonth: 0,
      semiAnnualAmpMm: 5,
      semiAnnualPeakMonth: 0,
    });

    const fit = fitHarmonics(cycle);
    const result = classifyRegime(fit);

    expect(result.family).toBe("monsunal");
  });
});
