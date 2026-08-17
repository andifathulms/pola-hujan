import { describe, expect, it } from "vitest";
import { latLonToRowCol, parseBilHeader, sampleBilNearest } from "@/lib/geo/bil";

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
