import { describe, expect, it } from "vitest";
import { cityLead, compareCaption, referenceCityId, storyLead } from "@/lib/storyCopy";
import type { RegimeRecord } from "@/lib/grid/schema";

function city(id: string, name: string, monthlyMm: number[], wettestMonth: number, driestMonth: number): RegimeRecord {
  return {
    id,
    name,
    province: "",
    lat: 0,
    lon: 0,
    monthlyMm,
    fit: { meanMm: 0, annualAmpMm: 0, annualPeakMonth: 0, semiAnnualAmpMm: 0, semiAnnualPeakMonth: 0 },
    annualCurveMm: monthlyMm,
    semiAnnualCurveMm: monthlyMm,
    family: "monsunal",
    subtype: "monsunal-1",
    peakMonth: wettestMonth,
    classificationDetail: { semiToAnnualRatio: 0 },
    annualTotalMm: 0,
    wettestMonth,
    driestMonth,
    wetMonths: 0,
    dryMonths: 0,
    similarIds: [],
  };
}

const months = (peak: number, value: number) => Array.from({ length: 12 }, (_, i) => (i === peak ? value : 10));

describe("storyLead", () => {
  it("reads every month from the records, not from copy", () => {
    const lead = storyLead([
      city("jakarta", "Jakarta", months(0, 432), 0, 8),
      city("ambon", "Ambon", months(5, 741), 5, 10),
      city("kupang", "Kupang", [...months(0, 358).slice(0, 7), 3, ...months(0, 358).slice(8)], 0, 7),
    ]);
    expect(lead).toContain("Jakarta paling basah di Januari.");
    expect(lead).toContain("Ambon paling basah di Juni.");
    expect(lead).toContain("Kupang hanya menerima 3 mm di bulan Agustus.");
  });

  it("drops a clause rather than inventing it when a city is missing", () => {
    expect(storyLead([])).toBe("Indonesia punya tiga pola hujan, bukan satu.");
  });

  it("never phrases a month as an onset or a forecast", () => {
    const lead = storyLead([city("jakarta", "Jakarta", months(0, 432), 0, 8)]);
    expect(lead).not.toMatch(/mulai|akan|diperkirakan|prakiraan/i);
  });
});

describe("compareCaption", () => {
  it("quotes the first city's rain in the second city's wettest month", () => {
    const caption = compareCaption(city("jakarta", "Jakarta", months(0, 432), 0, 8), city("ambon", "Ambon", months(5, 741), 5, 10));
    expect(caption).toBe("Jakarta mencatat 432 mm di Januari. Ambon mencatat 741 mm di Juni, ketika Jakarta hanya menerima 10 mm.");
  });
});

describe("cityLead", () => {
  const ambon = city("ambon", "Ambon", months(5, 741), 5, 10);
  const jakarta = city("jakarta", "Jakarta", months(0, 432), 0, 8);

  it("states the wettest and driest month and the reference city's rain in that month", () => {
    expect(cityLead(ambon, jakarta)).toBe(
      "Ambon paling basah di Juni (741 mm) dan paling kering di November (10 mm). Pada bulan yang sama, Jakarta menerima 10 mm.",
    );
  });

  it("never compares a city with itself", () => {
    expect(cityLead(jakarta, jakarta)).not.toContain("Pada bulan yang sama");
  });

  it("picks Ambon as Jakarta's reference and Jakarta for everyone else", () => {
    expect(referenceCityId("jakarta")).toBe("ambon");
    expect(referenceCityId("padang")).toBe("jakarta");
  });
});
