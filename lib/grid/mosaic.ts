import type { Family } from "@/lib/family";

/**
 * The regime mosaic's wire format: one character per 0.25° cell, one
 * string per grid row, north to south. "." is no cell (sea, outside
 * Indonesia, or not enough data). The six sub-types map to six letters —
 * upper case for a family's first sub-type (drawn in its hue), lower
 * case for the second (drawn in its tint), so family = hue and
 * sub-type = tint survive the encoding (DESIGN.md §3). Quantised and
 * categorical by construction: nothing continuous is shipped
 * (CLAUDE.md invariant 13).
 */
export const MOSAIC_EMPTY = ".";

const SUBTYPE_TO_CODE: Record<string, string> = {
  "monsunal-1": "M",
  "monsunal-2": "m",
  "ekuatorial-1": "E",
  "ekuatorial-4": "e",
  "lokal-1": "L",
  "lokal-2": "l",
};

const CODE_TO_FAMILY: Record<string, Family> = { M: "monsunal", m: "monsunal", E: "ekuatorial", e: "ekuatorial", L: "lokal", l: "lokal" };

export function subtypeToCode(subtype: string): string {
  const code = SUBTYPE_TO_CODE[subtype];
  if (!code) throw new Error(`no mosaic code for sub-type "${subtype}"`);
  return code;
}

export function codeToFamily(code: string): Family | undefined {
  return CODE_TO_FAMILY[code];
}

/** Lower case marks a family's second sub-type — drawn as a tint. */
export function isTintCode(code: string): boolean {
  return code !== MOSAIC_EMPTY && code === code.toLowerCase();
}

export interface MosaicGrid {
  latMax: number;
  lonMin: number;
  step: number;
  rows: number;
  cols: number;
  codes: string[];
}

export interface MosaicRun {
  row: number;
  col: number;
  length: number;
  code: string;
}

/** Horizontal runs of one code — a row of 184 cells draws as a handful of rectangles, not 184. */
export function mosaicRuns(grid: MosaicGrid): MosaicRun[] {
  const runs: MosaicRun[] = [];
  grid.codes.forEach((line, row) => {
    let col = 0;
    while (col < line.length) {
      const code = line[col] as string;
      let end = col + 1;
      while (end < line.length && line[end] === code) end += 1;
      if (code !== MOSAIC_EMPTY) runs.push({ row, col, length: end - col, code });
      col = end;
    }
  });
  return runs;
}

/** Cell counts per family, for the manifest's area report. */
export function mosaicFamilyCounts(grid: MosaicGrid): Record<Family, number> {
  const counts: Record<Family, number> = { monsunal: 0, ekuatorial: 0, lokal: 0 };
  for (const line of grid.codes) {
    for (const code of line) {
      const family = codeToFamily(code);
      if (family) counts[family] += 1;
    }
  }
  return counts;
}
