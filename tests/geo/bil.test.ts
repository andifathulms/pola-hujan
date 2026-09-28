import { describe, expect, it } from "vitest";
import { aggregateBilToGrid, latLonToRowCol, parseBilHeader, sampleBilNearest, sampleBilNearestValid } from "@/lib/geo/bil";

const SAMPLE_HDR = `NROWS           4
NCOLS           4
NBANDS          1
NBITS           16
BYTEORDER       I
PIXELTYPE       SIGNEDINT
LAYOUT          BIL
SKIPBYTES       0
ULXMAP          100.025
ULYMAP          5.975
XDIM            0.05
YDIM            0.05
BANDROWBYTES    8
TOTALROWBYTES   8
BANDGAPBYTES    0
NODATA          -32768
`;

function bufferFromGrid(values: number[]): Buffer {
  const buf = Buffer.alloc(values.length * 2);
  values.forEach((v, i) => buf.writeInt16LE(v, i * 2));
  return buf;
}

describe("parseBilHeader", () => {
  it("parses the fields this project relies on", () => {
    const header = parseBilHeader(SAMPLE_HDR);
    expect(header).toEqual({
      nrows: 4,
      ncols: 4,
      ulX: 100.025,
      ulY: 5.975,
      xdim: 0.05,
      ydim: 0.05,
      nodata: -32768,
    });
  });

  it("throws on a header missing a required field", () => {
    expect(() => parseBilHeader("NROWS 4\n")).toThrow();
  });
});

describe("latLonToRowCol", () => {
  const header = parseBilHeader(SAMPLE_HDR);

  it("maps the upper-left cell centre to row 0, col 0", () => {
    expect(latLonToRowCol(header, 5.975, 100.025)).toEqual({ row: 0, col: 0 });
  });

  it("maps south and east of the upper-left corner to increasing row/col", () => {
    expect(latLonToRowCol(header, 5.975 - 0.05, 100.025 + 0.05)).toEqual({ row: 1, col: 1 });
  });

  it("returns null outside the grid", () => {
    expect(latLonToRowCol(header, 90, 100.025)).toBeNull();
    expect(latLonToRowCol(header, 5.975, -10)).toBeNull();
  });
});

describe("sampleBilNearest", () => {
  const header = parseBilHeader(SAMPLE_HDR);
  // 4x4 grid, row-major; put a distinctive value at row 2, col 3.
  const grid = [
    1, 2, 3, 4, //
    5, 6, 7, 8, //
    9, 10, 11, 927, //
    13, 14, 15, 16,
  ];
  const data = bufferFromGrid(grid);

  it("reads the value at the nearest cell", () => {
    const lat = header.ulY - 2 * header.ydim;
    const lon = header.ulX + 3 * header.xdim;
    expect(sampleBilNearest(data, header, lat, lon)).toBe(927);
  });

  it("returns null for a nodata cell", () => {
    const nodataGrid = bufferFromGrid([header.nodata, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(sampleBilNearest(nodataGrid, header, header.ulY, header.ulX)).toBeNull();
  });

  it("returns null outside the grid", () => {
    expect(sampleBilNearest(data, header, 90, 100.025)).toBeNull();
  });
});

describe("sampleBilNearestValid", () => {
  const header = parseBilHeader(SAMPLE_HDR);
  const N = -32768;

  it("returns the nearest cell when it has data", () => {
    const data = bufferFromGrid([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    expect(sampleBilNearestValid(data, header, 5.975, 100.025)).toBe(1);
  });

  it("steps to the closest valid neighbour over nodata (a coastal city)", () => {
    const data = bufferFromGrid([N, N, N, N, N, N, 42, N, N, N, N, N, N, N, N, 99]);
    // Nearest cell is (0,0), nodata; (1,2) is the closest valid within 2 cells.
    expect(sampleBilNearestValid(data, header, 5.975, 100.025)).toBe(42);
  });

  it("gives up beyond the radius", () => {
    const data = bufferFromGrid([N, N, N, N, N, N, N, N, N, N, N, N, N, N, N, 99]);
    expect(sampleBilNearestValid(data, header, 5.975, 100.025, 1)).toBeNull();
  });
});

describe("aggregateBilToGrid", () => {
  const header = parseBilHeader(SAMPLE_HDR);
  const N = -32768;
  // Source cell centres: lon 100.025..100.175, lat 5.975..5.825 → a 0.1° grid
  // from 6.0°N / 100.0°E is 2 × 2 output cells of 2 × 2 source cells each.
  const spec = { latMax: 6.0, lonMin: 100.0, step: 0.1, rows: 2, cols: 2 };

  it("averages the source cells inside each output cell", () => {
    const data = bufferFromGrid([1, 3, 10, 10, 5, 7, 10, 10, 0, 0, 20, 40, 0, 0, 60, 80]);
    expect(Array.from(aggregateBilToGrid(data, header, spec))).toEqual([4, 10, 0, 50]);
  });

  it("ignores nodata but drops a cell that is mostly missing", () => {
    const data = bufferFromGrid([8, N, N, N, N, N, N, N, 2, 4, 1, 1, N, 6, 1, 1]);
    const out = Array.from(aggregateBilToGrid(data, header, spec));
    expect(Number.isNaN(out[0])).toBe(true); // 1 of 4 valid: below 50%
    expect(Number.isNaN(out[1])).toBe(true); // 0 of 4
    expect(out[2]).toBe(4); // 3 of 4 valid: (2 + 4 + 6) / 3
    expect(out[3]).toBe(1);
  });
});
