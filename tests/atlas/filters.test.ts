import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, applyFilters, isFilterActive } from "@/lib/atlasFilters";
import type { RegimeRecord } from "@/lib/grid/schema";

/**
 * The map and the regime wall both draw `applyFilters(records, filters)`
 * — if it drifts, the two views start answering the same question
 * differently, which is exactly the kind of bug a reader would have to
 * catch by eye. These assert the filter's meaning, not its wiring.
 */
function record(partial: Partial<RegimeRecord> & Pick<RegimeRecord, "id" | "name" | "province" | "family">): RegimeRecord {
  const flat = Array.from({ length: 12 }, () => 100);
  return {
    lat: 0,
    lon: 110,
    monthlyMm: flat,
    fit: { meanMm: 100, annualAmpMm: 10, annualPeakMonth: 0, semiAnnualAmpMm: 1, semiAnnualPeakMonth: 0 },
    annualCurveMm: flat,
    semiAnnualCurveMm: Array.from({ length: 12 }, () => 0),
    subtype: `${partial.family}-1`,
    peakMonth: 0,
    classificationDetail: { semiToAnnualRatio: 0.1, displacementMonths: 0 },
    ...partial,
  };
}

const ATLAS: RegimeRecord[] = [
  record({ id: "jakarta", name: "Jakarta", province: "DKI Jakarta", family: "monsunal", agrees: true }),
  record({ id: "ambon", name: "Ambon", province: "Maluku", family: "lokal", agrees: true }),
  record({ id: "ternate", name: "Ternate", province: "Maluku Utara", family: "ekuatorial", agrees: true }),
  record({ id: "medan", name: "Medan", province: "Sumatera Utara", family: "lokal", agrees: false }),
  record({ id: "palu", name: "Palu", province: "Sulawesi Tengah", family: "monsunal", agrees: false }),
  // No BMKG family to compare against at all — `agrees` is absent, which
  // is not the same as disagreeing.
  record({ id: "sorong", name: "Sorong", province: "Papua Barat", family: "lokal" }),
];

const ids = (records: RegimeRecord[]) => records.map((r) => r.id);

describe("applyFilters", () => {
  it("returns the whole atlas when nothing is filtered", () => {
    expect(applyFilters(ATLAS, EMPTY_FILTERS)).toHaveLength(ATLAS.length);
  });

  it("treats an empty family list as every family, not none", () => {
    expect(applyFilters(ATLAS, { ...EMPTY_FILTERS, families: [] })).toHaveLength(ATLAS.length);
  });

  it("keeps only the selected families, and unions when several are on", () => {
    expect(ids(applyFilters(ATLAS, { ...EMPTY_FILTERS, families: ["lokal"] }))).toEqual(["ambon", "medan", "sorong"]);
    expect(ids(applyFilters(ATLAS, { ...EMPTY_FILTERS, families: ["lokal", "ekuatorial"] }))).toEqual([
      "ambon",
      "ternate",
      "medan",
      "sorong",
    ]);
  });

  it("matches the search against name or province, case-insensitively", () => {
    expect(ids(applyFilters(ATLAS, { ...EMPTY_FILTERS, query: "amb" }))).toEqual(["ambon"]);
    expect(ids(applyFilters(ATLAS, { ...EMPTY_FILTERS, query: "MALUKU" }))).toEqual(["ambon", "ternate"]);
    expect(applyFilters(ATLAS, { ...EMPTY_FILTERS, query: "   " })).toHaveLength(ATLAS.length);
  });

  it("shows only disagreements, and never counts an uncompared location as one", () => {
    const disagreeing = applyFilters(ATLAS, { ...EMPTY_FILTERS, onlyDisagree: true });
    expect(ids(disagreeing)).toEqual(["medan", "palu"]);
    // `sorong` has no bmkgFamily, so `agrees` is undefined — absent is not
    // the same as disagreeing, and reporting it as one would overstate the
    // finding (CLAUDE.md invariant 3).
    expect(ids(disagreeing)).not.toContain("sorong");
  });

  it("intersects the three filters rather than unioning them", () => {
    expect(
      ids(applyFilters(ATLAS, { query: "Utara", families: ["lokal"], onlyDisagree: true })),
    ).toEqual(["medan"]);
  });

  it("never mutates the records it is given", () => {
    const before = ids(ATLAS);
    applyFilters(ATLAS, { query: "medan", families: ["lokal"], onlyDisagree: true });
    expect(ids(ATLAS)).toEqual(before);
  });
});

describe("isFilterActive", () => {
  it("is false for the untouched state and for whitespace-only search", () => {
    expect(isFilterActive(EMPTY_FILTERS)).toBe(false);
    expect(isFilterActive({ ...EMPTY_FILTERS, query: "  " })).toBe(false);
  });

  it("is true once any one filter is set", () => {
    expect(isFilterActive({ ...EMPTY_FILTERS, query: "ambon" })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTERS, families: ["lokal"] })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTERS, onlyDisagree: true })).toBe(true);
  });
});
