import { describe, expect, it } from "vitest";
import { codeToFamily, isTintCode, mosaicFamilyCounts, mosaicRuns, subtypeToCode, type MosaicGrid } from "@/lib/grid/mosaic";

describe("mosaic codes", () => {
  it("round-trips every sub-type to its family, hue for -1, tint for the second", () => {
    const cases: Array<[string, string, boolean]> = [
      ["monsunal-1", "monsunal", false],
      ["monsunal-2", "monsunal", true],
      ["ekuatorial-1", "ekuatorial", false],
      ["ekuatorial-4", "ekuatorial", true],
      ["lokal-1", "lokal", false],
      ["lokal-2", "lokal", true],
    ];
    for (const [subtype, family, tint] of cases) {
      const code = subtypeToCode(subtype);
      expect(codeToFamily(code)).toBe(family);
      expect(isTintCode(code)).toBe(tint);
    }
  });

  it("refuses an unknown sub-type rather than drawing it as something else", () => {
    expect(() => subtypeToCode("monsunal-9")).toThrow();
  });

  it("treats the empty cell as no family and no tint", () => {
    expect(codeToFamily(".")).toBeUndefined();
    expect(isTintCode(".")).toBe(false);
  });
});

describe("mosaicRuns / mosaicFamilyCounts", () => {
  const grid: MosaicGrid = { latMax: 6, lonMin: 95, step: 0.25, rows: 2, cols: 6, codes: ["..MMm.", "LLL.EE"] };

  it("groups horizontal runs and skips empty cells", () => {
    expect(mosaicRuns(grid)).toEqual([
      { row: 0, col: 2, length: 2, code: "M" },
      { row: 0, col: 4, length: 1, code: "m" },
      { row: 1, col: 0, length: 3, code: "L" },
      { row: 1, col: 4, length: 2, code: "E" },
    ]);
  });

  it("counts cells per family", () => {
    expect(mosaicFamilyCounts(grid)).toEqual({ monsunal: 3, ekuatorial: 2, lokal: 3 });
  });
});
