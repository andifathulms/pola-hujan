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

/**
 * Nearest *valid* cell to (lat, lon): the nearest cell itself if it has
 * data, otherwise the closest valid cell within `maxRadiusCells` (by
 * distance, ties to the earlier row then column). A city on the coast
 * can sit a cell into the sea, where CHIRPS has no value; one or two
 * cells inland is still that city's rain, and it is better than
 * silently dropping a month. Returns null if nothing within the radius.
 */
export function sampleBilNearestValid(
  data: Buffer,
  header: BilHeader,
  lat: number,
  lon: number,
  maxRadiusCells = 2,
): number | null {
  const direct = sampleBilNearest(data, header, lat, lon);
  if (direct !== null && direct >= 0) return direct;
  const centre = latLonToRowCol(header, lat, lon);
  if (!centre) return null;
  let best: { d: number; value: number } | null = null;
  for (let dr = -maxRadiusCells; dr <= maxRadiusCells; dr += 1) {
    for (let dc = -maxRadiusCells; dc <= maxRadiusCells; dc += 1) {
      const row = centre.row + dr;
      const col = centre.col + dc;
      if (row < 0 || row >= header.nrows || col < 0 || col >= header.ncols) continue;
      const value = data.readInt16LE((row * header.ncols + col) * 2);
      if (value === header.nodata || value < 0) continue;
      const d = dr * dr + dc * dc;
      if (!best || d < best.d) best = { d, value };
    }
  }
  return best ? best.value : null;
}

/** A regular lat/lon grid, described by its north-west corner and cell size. Cell (0,0) is the north-west cell. */
export interface GridSpec {
  /** Northern edge of row 0, degrees. */
  latMax: number;
  /** Western edge of column 0, degrees. */
  lonMin: number;
  /** Cell size in degrees, same in both directions. */
  step: number;
  rows: number;
  cols: number;
}

/** Centre of grid cell (row, col). */
export function gridCellCentre(spec: GridSpec, row: number, col: number): { lat: number; lon: number } {
  return { lat: spec.latMax - (row + 0.5) * spec.step, lon: spec.lonMin + (col + 0.5) * spec.step };
}

/**
 * Averages a fine BIL raster into the coarser `spec` grid: each output
 * cell is the mean of the valid source cells whose centres fall inside
 * it. A cell needs at least `minValidFraction` of its source cells to
 * be valid, so a cell that is mostly sea is left out rather than
 * standing for a sliver of coast. Nodata and CHIRPS's negative fill
 * values are both treated as missing. Output is row-major, NaN where
 * there is no value.
 */
export function aggregateBilToGrid(data: Buffer, header: BilHeader, spec: GridSpec, minValidFraction = 0.5): Float64Array {
  const sums = new Float64Array(spec.rows * spec.cols);
  const valid = new Uint32Array(spec.rows * spec.cols);
  const total = new Uint32Array(spec.rows * spec.cols);
  for (let row = 0; row < header.nrows; row += 1) {
    const lat = header.ulY - row * header.ydim;
    const gr = Math.floor((spec.latMax - lat) / spec.step);
    if (gr < 0 || gr >= spec.rows) continue;
    for (let col = 0; col < header.ncols; col += 1) {
      const lon = header.ulX + col * header.xdim;
      const gc = Math.floor((lon - spec.lonMin) / spec.step);
      if (gc < 0 || gc >= spec.cols) continue;
      const i = gr * spec.cols + gc;
      total[i] = (total[i] ?? 0) + 1;
      const value = data.readInt16LE((row * header.ncols + col) * 2);
      if (value === header.nodata || value < 0) continue;
      sums[i] = (sums[i] ?? 0) + value;
      valid[i] = (valid[i] ?? 0) + 1;
    }
  }
  const out = new Float64Array(spec.rows * spec.cols);
  for (let i = 0; i < out.length; i += 1) {
    const n = valid[i] ?? 0;
    const t = total[i] ?? 0;
    out[i] = t > 0 && n / t >= minValidFraction ? (sums[i] ?? 0) / n : Number.NaN;
  }
  return out;
}
