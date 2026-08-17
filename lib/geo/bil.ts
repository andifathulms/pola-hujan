/**
 * Minimal ESRI BIL (Band Interleaved by Line) raster reader — just
 * enough to sample a single point from a CHIRPS monthly grid. Pure,
 * dependency-free, and only needs to support what CHIRPS actually
 * ships: one band, signed 16-bit little-endian, geographic (lat/lon)
 * corners. See data/source/README.md for where the files come from.
 */

export interface BilHeader {
  nrows: number;
  ncols: number;
  /** Upper-left cell-centre longitude, degrees. */
  ulX: number;
  /** Upper-left cell-centre latitude, degrees. */
  ulY: number;
  xdim: number;
  ydim: number;
  nodata: number;
}

const HDR_FIELD = /^(\S+)\s+(\S+)/;

export function parseBilHeader(hdrText: string): BilHeader {
  const fields: Record<string, string> = {};
  for (const line of hdrText.split(/\r?\n/)) {
    const match = HDR_FIELD.exec(line.trim());
    if (match) fields[match[1]!.toUpperCase()] = match[2]!;
  }

  const required = ["NROWS", "NCOLS", "ULXMAP", "ULYMAP", "XDIM", "YDIM", "NODATA"] as const;
  for (const key of required) {
    if (!(key in fields)) throw new Error(`BIL header missing ${key}`);
  }

  return {
    nrows: Number(fields.NROWS),
    ncols: Number(fields.NCOLS),
    ulX: Number(fields.ULXMAP),
    ulY: Number(fields.ULYMAP),
    xdim: Number(fields.XDIM),
    ydim: Number(fields.YDIM),
    nodata: Number(fields.NODATA),
  };
}

/** Nearest-cell row/col for a lat/lon, or null if outside the grid. */
export function latLonToRowCol(header: BilHeader, lat: number, lon: number): { row: number; col: number } | null {
  const col = Math.round((lon - header.ulX) / header.xdim);
  const row = Math.round((header.ulY - lat) / header.ydim);
  if (row < 0 || row >= header.nrows || col < 0 || col >= header.ncols) return null;
  return { row, col };
}

/**
 * Sample the nearest cell to (lat, lon) as a signed 16-bit little-endian
 * value. Returns null for out-of-bounds or nodata cells — callers decide
 * how to handle a miss (CHIRPS uses nodata over open ocean and outside
 * its computed coverage).
 */
export function sampleBilNearest(data: Buffer, header: BilHeader, lat: number, lon: number): number | null {
  const cell = latLonToRowCol(header, lat, lon);
  if (!cell) return null;
  const index = cell.row * header.ncols + cell.col;
  const byteOffset = index * 2;
  if (byteOffset < 0 || byteOffset + 2 > data.length) return null;
  const value = data.readInt16LE(byteOffset);
  return value === header.nodata ? null : value;
}
