/**
 * DEV/CI: pull real precipitation source data.
 *
 * CHIRPS (Climate Hazards Center, UC Santa Barbara) publishes a public,
 * no-login-required Indonesia-region monthly product at 0.05° as small
 * per-month tar.gz archives, each containing a signed-16-bit BIL raster
 * (mm, direct — not scaled) and its .hdr sidecar. That's what this
 * script downloads, decodes with lib/geo/bil + lib/geo/tar (no GDAL, no
 * new npm dependency), and samples at each of this build's locations.
 *
 * The regional archive stops at 2016-10 (it isn't being updated), so
 * the climatology period here is 2006-01 through 2015-12 — ten full
 * years, not the 30-year WMO-normal period a production climatology
 * would use. That's a real, disclosed limitation, not a placeholder:
 * every value below is genuine measured/satellite-estimated
 * precipitation, averaged over a shorter window than ideal.
 *
 * Source: https://data.chc.ucsb.edu/products/CHIRPS-2.0/indonesia_monthly/bils/
 * Funk, C. et al. (2015), "The climate hazards infrared precipitation
 * with stations—a new environmental record for monitoring extremes",
 * Sci. Data 2, 150066.
 */
import { gunzipSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { aggregateBilToGrid, gridCellCentre, parseBilHeader, sampleBilNearestValid, type BilHeader, type GridSpec } from "../lib/geo/bil";
import { parseOutlineRings, pointInRings, projectToOutline } from "../lib/geo/outline";
import { INDONESIA_OUTLINE_PATH } from "../lib/geo/indonesiaOutline";
import { extractTarEntries } from "../lib/geo/tar";
import { locationSourceFileSchema, type LocationSource } from "../lib/grid/schema";

const FIRST_YEAR = 2006;
const LAST_YEAR = 2015; // inclusive; the regional archive itself stops at 2016-10
const BASE_URL = "https://data.chc.ucsb.edu/products/CHIRPS-2.0/indonesia_monthly/bils";
const CONCURRENCY = 8;
const MAX_ATTEMPTS = 3;

// Coordinates are straightforward city coordinates. bmkgFamily is
// independent of CHIRPS (BMKG's published Zona Musim isn't a satellite
// product to download); nine of fifteen are now cited against BMKG's
// own "Pemutakhiran Zona Musim Indonesia Periode 1991-2020" (Kussatiti,
// BMKG, 2022 — data/source/README.md has the full citation) via a
// province-level statement explicit enough to apply directly:
//   - Jawa/Bali/NTT provinces are 100% Monsunal (487 of 487 ZOM
//     combined across those three islands are Monsunal — Table 7).
//   - Sumatera Utara and the Halmahera part of Maluku Utara are named
//     explicitly as Ekuatorial regions (p.32-33), and Maluku Utara
//     province is stated to be 100% Ekuatorial-2, its only sub-type
//     (p.40) — Ternate's own ZOM (MALUT_06) covers Halmahera Timur/
//     Utara, so this applies directly, not just "nearby".
//   - Kalimantan Barat is named explicitly as an Ekuatorial region
//     (p.33), with a named Ekuatorial-1 example ZOM (KALBAR_04, p.39).
//   - Ambon/Kota Ambon is named explicitly as a Lokal region (general
//     BMKG regime literature cross-checked during this pass).
// The other six remain unverified best-effort guesses from each
// region's generally documented regime — not scraped from the document,
// and disclosed as such (bmkgFamilySource: "estimate").
// monthlyMm below is replaced entirely with real CHIRPS averages; only
// id/name/province/lat/lon/bmkgFamily(Source) come from here.
const LOCATIONS: Array<Omit<LocationSource, "monthlyMm">> = [
  { id: "jakarta", name: "Jakarta", province: "DKI Jakarta", lat: -6.2088, lon: 106.8456, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "bandung", name: "Bandung", province: "Jawa Barat", lat: -6.9175, lon: 107.6191, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "surabaya", name: "Surabaya", province: "Jawa Timur", lat: -7.2575, lon: 112.7521, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "denpasar", name: "Denpasar", province: "Bali", lat: -8.6705, lon: 115.2126, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "kupang", name: "Kupang", province: "Nusa Tenggara Timur", lat: -10.1772, lon: 123.607, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "ambon", name: "Ambon", province: "Maluku", lat: -3.6954, lon: 128.1814, bmkgFamily: "lokal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "ternate", name: "Ternate", province: "Maluku Utara", lat: 0.79, lon: 127.385, bmkgFamily: "ekuatorial", bmkgFamilySource: "bmkg-zom9120" },
  { id: "manokwari", name: "Manokwari", province: "Papua Barat", lat: -0.8615, lon: 134.062, bmkgFamily: "lokal", bmkgFamilySource: "estimate" },
  { id: "pontianak", name: "Pontianak", province: "Kalimantan Barat", lat: -0.0263, lon: 109.3425, bmkgFamily: "ekuatorial", bmkgFamilySource: "bmkg-zom9120" },
  { id: "palembang", name: "Palembang", province: "Sumatra Selatan", lat: -2.9761, lon: 104.7754, bmkgFamily: "ekuatorial", bmkgFamilySource: "estimate" },
  { id: "medan", name: "Medan", province: "Sumatra Utara", lat: 3.5952, lon: 98.6722, bmkgFamily: "ekuatorial", bmkgFamilySource: "bmkg-zom9120" },
  { id: "pekanbaru", name: "Pekanbaru", province: "Riau", lat: 0.5333, lon: 101.45, bmkgFamily: "ekuatorial", bmkgFamilySource: "estimate" },
  { id: "makassar", name: "Makassar", province: "Sulawesi Selatan", lat: -5.1477, lon: 119.4327, bmkgFamily: "monsunal", bmkgFamilySource: "estimate" },
  { id: "manado", name: "Manado", province: "Sulawesi Utara", lat: 1.4748, lon: 124.8421, bmkgFamily: "ekuatorial", bmkgFamilySource: "estimate" },
  { id: "jayapura", name: "Jayapura", province: "Papua", lat: -2.5337, lon: 140.7181, bmkgFamily: "ekuatorial", bmkgFamilySource: "estimate" },

  // Second pass: more locations for map density. CHIRPS download cost
  // is dominated by number of months (already fetched above), not
  // locations, so widening coverage here is nearly free — every value
  // added is sampled from rasters this script downloads regardless.
  // A few more are BMKG-cited (Table 7: Jawa/NTB are also 100%
  // Monsunal province-wide; Palu and Sorong are both named explicitly
  // as Lokal-type examples, p.32); the rest are estimates, same as above.
  { id: "semarang", name: "Semarang", province: "Jawa Tengah", lat: -6.9667, lon: 110.4167, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "yogyakarta", name: "Yogyakarta", province: "DI Yogyakarta", lat: -7.7956, lon: 110.3695, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "mataram", name: "Mataram", province: "Nusa Tenggara Barat", lat: -8.5833, lon: 116.1167, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "palu", name: "Palu", province: "Sulawesi Tengah", lat: -0.8917, lon: 119.8707, bmkgFamily: "lokal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "sorong", name: "Sorong", province: "Papua Barat Daya", lat: -0.8762, lon: 131.2558, bmkgFamily: "lokal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "banda-aceh", name: "Banda Aceh", province: "Aceh", lat: 5.5483, lon: 95.3238, bmkgFamily: "ekuatorial", bmkgFamilySource: "estimate" },
  { id: "padang", name: "Padang", province: "Sumatra Barat", lat: -0.9471, lon: 100.4172, bmkgFamily: "ekuatorial", bmkgFamilySource: "estimate" },
  { id: "bengkulu", name: "Bengkulu", province: "Bengkulu", lat: -3.7928, lon: 102.2608, bmkgFamily: "ekuatorial", bmkgFamilySource: "estimate" },
  { id: "jambi", name: "Jambi", province: "Jambi", lat: -1.6, lon: 103.6167, bmkgFamily: "ekuatorial", bmkgFamilySource: "estimate" },
  { id: "bandar-lampung", name: "Bandar Lampung", province: "Lampung", lat: -5.4292, lon: 105.2611, bmkgFamily: "monsunal", bmkgFamilySource: "estimate" },
  { id: "banjarmasin", name: "Banjarmasin", province: "Kalimantan Selatan", lat: -3.3186, lon: 114.5944, bmkgFamily: "monsunal", bmkgFamilySource: "estimate" },
  { id: "palangkaraya", name: "Palangka Raya", province: "Kalimantan Tengah", lat: -2.2161, lon: 113.9172, bmkgFamily: "monsunal", bmkgFamilySource: "estimate" },
  { id: "samarinda", name: "Samarinda", province: "Kalimantan Timur", lat: -0.5022, lon: 117.1536, bmkgFamily: "monsunal", bmkgFamilySource: "estimate" },
  { id: "tarakan", name: "Tarakan", province: "Kalimantan Utara", lat: 3.3, lon: 117.6333, bmkgFamily: "ekuatorial", bmkgFamilySource: "estimate" },
  { id: "kendari", name: "Kendari", province: "Sulawesi Tenggara", lat: -3.9778, lon: 122.5089, bmkgFamily: "lokal", bmkgFamilySource: "estimate" },
  { id: "gorontalo", name: "Gorontalo", province: "Gorontalo", lat: 0.5435, lon: 123.0568, bmkgFamily: "ekuatorial", bmkgFamilySource: "estimate" },
  { id: "tual", name: "Tual", province: "Maluku", lat: -5.6323, lon: 132.7517, bmkgFamily: "lokal", bmkgFamilySource: "estimate" },
  { id: "merauke", name: "Merauke", province: "Papua Selatan", lat: -8.4667, lon: 140.4, bmkgFamily: "monsunal", bmkgFamilySource: "estimate" },
  { id: "timika", name: "Timika", province: "Papua Tengah", lat: -4.5453, lon: 136.8874, bmkgFamily: "ekuatorial", bmkgFamilySource: "estimate" },

  // Third pass: every province capital not yet covered, plus regional
  // cities chosen to fill gaps in Nusa Tenggara, Sulawesi, Maluku,
  // Kalimantan and Papua. Policy change for this pass: a new location
  // gets a bmkgFamily ONLY when ZOM9120 states it outright — Table 7
  // (Jawa 487/487, Bali 20/20, NTB 27/27, NTT 28/28 Monsunal), p.40
  // (Maluku Utara is 100% Ekuatorial-2), p.32 (Fak-fak named as a Lokal
  // example). Everywhere else the field is left out, so the location is
  // simply not part of the agreement comparison — adding more unverified
  // guesses would move the reported rate without adding any evidence.
  // (The 20 earlier estimates are kept as they were; changing them now
  // would also move the rate for no methodological reason.)
  { id: "serang", name: "Serang", province: "Banten", lat: -6.12, lon: 106.1503, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "bogor", name: "Bogor", province: "Jawa Barat", lat: -6.595, lon: 106.8166, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "cirebon", name: "Cirebon", province: "Jawa Barat", lat: -6.7063, lon: 108.557, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "cilacap", name: "Cilacap", province: "Jawa Tengah", lat: -7.7267, lon: 109.0098, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "surakarta", name: "Surakarta", province: "Jawa Tengah", lat: -7.5755, lon: 110.8243, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "malang", name: "Malang", province: "Jawa Timur", lat: -7.9666, lon: 112.6326, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "banyuwangi", name: "Banyuwangi", province: "Jawa Timur", lat: -8.2192, lon: 114.3691, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "singaraja", name: "Singaraja", province: "Bali", lat: -8.112, lon: 115.0882, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "sumbawa-besar", name: "Sumbawa Besar", province: "Nusa Tenggara Barat", lat: -8.493, lon: 117.42, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "bima", name: "Bima", province: "Nusa Tenggara Barat", lat: -8.4606, lon: 118.727, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "labuan-bajo", name: "Labuan Bajo", province: "Nusa Tenggara Timur", lat: -8.4964, lon: 119.8877, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "ende", name: "Ende", province: "Nusa Tenggara Timur", lat: -8.8432, lon: 121.6623, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "maumere", name: "Maumere", province: "Nusa Tenggara Timur", lat: -8.6199, lon: 122.2111, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "waingapu", name: "Waingapu", province: "Nusa Tenggara Timur", lat: -9.6567, lon: 120.2641, bmkgFamily: "monsunal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "sofifi", name: "Sofifi", province: "Maluku Utara", lat: 0.7366, lon: 127.558, bmkgFamily: "ekuatorial", bmkgFamilySource: "bmkg-zom9120" },
  { id: "tobelo", name: "Tobelo", province: "Maluku Utara", lat: 1.7284, lon: 128.0095, bmkgFamily: "ekuatorial", bmkgFamilySource: "bmkg-zom9120" },
  { id: "labuha", name: "Labuha", province: "Maluku Utara", lat: -0.6333, lon: 127.4833, bmkgFamily: "ekuatorial", bmkgFamilySource: "bmkg-zom9120" },
  { id: "fakfak", name: "Fakfak", province: "Papua Barat", lat: -2.926, lon: 132.296, bmkgFamily: "lokal", bmkgFamilySource: "bmkg-zom9120" },
  { id: "lhokseumawe", name: "Lhokseumawe", province: "Aceh", lat: 5.1801, lon: 97.1507 },
  { id: "meulaboh", name: "Meulaboh", province: "Aceh", lat: 4.1363, lon: 96.1285 },
  { id: "sibolga", name: "Sibolga", province: "Sumatra Utara", lat: 1.7427, lon: 98.7792 },
  { id: "pematangsiantar", name: "Pematangsiantar", province: "Sumatra Utara", lat: 2.9595, lon: 99.0687 },
  { id: "bukittinggi", name: "Bukittinggi", province: "Sumatra Barat", lat: -0.3055, lon: 100.3692 },
  { id: "dumai", name: "Dumai", province: "Riau", lat: 1.6667, lon: 101.45 },
  { id: "batam", name: "Batam", province: "Kepulauan Riau", lat: 1.0456, lon: 104.0305 },
  { id: "tanjungpinang", name: "Tanjungpinang", province: "Kepulauan Riau", lat: 0.9186, lon: 104.4554 },
  { id: "pangkalpinang", name: "Pangkalpinang", province: "Kepulauan Bangka Belitung", lat: -2.1316, lon: 106.1169 },
  { id: "lubuklinggau", name: "Lubuklinggau", province: "Sumatra Selatan", lat: -3.2967, lon: 102.8617 },
  { id: "singkawang", name: "Singkawang", province: "Kalimantan Barat", lat: 0.906, lon: 108.9872 },
  { id: "ketapang", name: "Ketapang", province: "Kalimantan Barat", lat: -1.85, lon: 109.9833 },
  { id: "putussibau", name: "Putussibau", province: "Kalimantan Barat", lat: 0.8333, lon: 112.9333 },
  { id: "sampit", name: "Sampit", province: "Kalimantan Tengah", lat: -2.532, lon: 112.95 },
  { id: "banjarbaru", name: "Banjarbaru", province: "Kalimantan Selatan", lat: -3.4406, lon: 114.8305 },
  { id: "balikpapan", name: "Balikpapan", province: "Kalimantan Timur", lat: -1.2379, lon: 116.8529 },
  { id: "tanjung-selor", name: "Tanjung Selor", province: "Kalimantan Utara", lat: 2.8375, lon: 117.3653 },
  { id: "mamuju", name: "Mamuju", province: "Sulawesi Barat", lat: -2.6786, lon: 118.8933 },
  { id: "parepare", name: "Parepare", province: "Sulawesi Selatan", lat: -4.0135, lon: 119.6255 },
  { id: "palopo", name: "Palopo", province: "Sulawesi Selatan", lat: -2.9925, lon: 120.1969 },
  { id: "watampone", name: "Watampone", province: "Sulawesi Selatan", lat: -4.5386, lon: 120.3279 },
  { id: "baubau", name: "Baubau", province: "Sulawesi Tenggara", lat: -5.47, lon: 122.61 },
  { id: "poso", name: "Poso", province: "Sulawesi Tengah", lat: -1.3967, lon: 120.7524 },
  { id: "luwuk", name: "Luwuk", province: "Sulawesi Tengah", lat: -0.95, lon: 122.7833 },
  { id: "tolitoli", name: "Tolitoli", province: "Sulawesi Tengah", lat: 1.0333, lon: 120.8167 },
  { id: "kotamobagu", name: "Kotamobagu", province: "Sulawesi Utara", lat: 0.7244, lon: 124.3199 },
  { id: "bitung", name: "Bitung", province: "Sulawesi Utara", lat: 1.4404, lon: 125.1217 },
  { id: "namlea", name: "Namlea", province: "Maluku", lat: -3.25, lon: 127.1 },
  { id: "masohi", name: "Masohi", province: "Maluku", lat: -3.3, lon: 128.9667 },
  { id: "saumlaki", name: "Saumlaki", province: "Maluku", lat: -7.95, lon: 131.32 },
  { id: "kaimana", name: "Kaimana", province: "Papua Barat", lat: -3.6445, lon: 133.695 },
  { id: "nabire", name: "Nabire", province: "Papua Tengah", lat: -3.3667, lon: 135.4833 },
  { id: "biak", name: "Biak", province: "Papua", lat: -1.176, lon: 136.082 },
  { id: "wamena", name: "Wamena", province: "Papua Pegunungan", lat: -4.0956, lon: 138.9453 },
];

/**
 * The regime mosaic's grid: 0.25° cells over the map's own extent
 * (95–141°E, 11°S–6°N), so every cell lines up with the map. 0.25° is
 * five CHIRPS cells a side — coarse enough to average out single-cell
 * noise, fine enough to show the Lokal pockets of Maluku and Papua.
 * Only cells whose centre falls inside Indonesia's own outline are kept.
 */
const MOSAIC_SPEC: GridSpec = { latMax: 6, lonMin: 95, step: 0.25, rows: 68, cols: 184 };

interface MonthTarget {
  year: number;
  month: number; // 1-12
}

function buildMonthTargets(): MonthTarget[] {
  const targets: MonthTarget[] = [];
  for (let year = FIRST_YEAR; year <= LAST_YEAR; year += 1) {
    for (let month = 1; month <= 12; month += 1) targets.push({ year, month });
  }
  return targets;
}

function urlFor({ year, month }: MonthTarget): string {
  const ym = `${year}${String(month).padStart(2, "0")}`;
  return `${BASE_URL}/chirps-v2.0_${ym}.tar.gz`;
}

async function fetchMonth(target: MonthTarget): Promise<{ header: BilHeader; data: Buffer } | undefined> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(urlFor(target));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const gz = Buffer.from(await response.arrayBuffer());
      const tar = gunzipSync(gz);
      const entries = extractTarEntries(tar);

      const hdrEntry = [...entries.entries()].find(([name]) => name.endsWith(".hdr"));
      const bilEntry = [...entries.entries()].find(([name]) => name.endsWith(".bil"));
      if (!hdrEntry || !bilEntry) throw new Error("archive missing .hdr or .bil entry");

      const header = parseBilHeader(hdrEntry[1].toString("utf-8"));
      return { header, data: Buffer.from(bilEntry[1]) };
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        console.warn(`data:fetch — giving up on ${target.year}-${String(target.month).padStart(2, "0")}: ${error}`);
        return undefined;
      }
    }
  }
  return undefined;
}

async function runPool<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  async function next(): Promise<void> {
    while (cursor < items.length) {
      const item = items[cursor];
      cursor += 1;
      if (item !== undefined) await worker(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
}

async function main() {
  const targets = buildMonthTargets();
  console.log(`data:fetch — downloading ${targets.length} monthly CHIRPS rasters (${FIRST_YEAR}-${LAST_YEAR})...`);

  // sums[locationId][monthIndex] and counts[locationId][monthIndex], monthIndex Jan=0.
  const sums = new Map<string, number[]>(LOCATIONS.map((l) => [l.id, Array(12).fill(0)]));
  const counts = new Map<string, number[]>(LOCATIONS.map((l) => [l.id, Array(12).fill(0)]));

  // Mosaic accumulators, [cell][month], for cells inside Indonesia only.
  const rings = parseOutlineRings(INDONESIA_OUTLINE_PATH);
  const cellCount = MOSAIC_SPEC.rows * MOSAIC_SPEC.cols;
  const inIndonesia = new Uint8Array(cellCount);
  for (let row = 0; row < MOSAIC_SPEC.rows; row += 1) {
    for (let col = 0; col < MOSAIC_SPEC.cols; col += 1) {
      const { lat, lon } = gridCellCentre(MOSAIC_SPEC, row, col);
      const { x, y } = projectToOutline(lat, lon);
      if (pointInRings(rings, x, y)) inIndonesia[row * MOSAIC_SPEC.cols + col] = 1;
    }
  }
  const gridSums = new Float64Array(cellCount * 12);
  const gridCounts = new Uint16Array(cellCount * 12);

  let completed = 0;
  await runPool(targets, CONCURRENCY, async (target) => {
    const result = await fetchMonth(target);
    if (result) {
      const { header, data } = result;
      const monthGrid = aggregateBilToGrid(data, header, MOSAIC_SPEC);
      for (let i = 0; i < cellCount; i += 1) {
        const v = monthGrid[i] as number;
        if (!inIndonesia[i] || Number.isNaN(v)) continue;
        const k = i * 12 + (target.month - 1);
        gridSums[k] = (gridSums[k] ?? 0) + v;
        gridCounts[k] = (gridCounts[k] ?? 0) + 1;
      }
      for (const location of LOCATIONS) {
        const value = sampleBilNearestValid(data, header, location.lat, location.lon);
        if (value !== null) {
          const monthIdx = target.month - 1;
          const locSums = sums.get(location.id)!;
          const locCounts = counts.get(location.id)!;
          locSums[monthIdx] = (locSums[monthIdx] ?? 0) + value;
          locCounts[monthIdx] = (locCounts[monthIdx] ?? 0) + 1;
        }
      }
    }
    completed += 1;
    if (completed % 24 === 0 || completed === targets.length) {
      console.log(`data:fetch — ${completed}/${targets.length} months processed`);
    }
  });

  const MIN_SAMPLES_PER_MONTH = Math.floor((LAST_YEAR - FIRST_YEAR + 1) * 0.7);
  const locations: LocationSource[] = LOCATIONS.map((location) => {
    const locSums = sums.get(location.id)!;
    const locCounts = counts.get(location.id)!;
    const monthlyMm = locSums.map((sum, i) => {
      const count = locCounts[i] ?? 0;
      if (count < MIN_SAMPLES_PER_MONTH) {
        throw new Error(
          `data:fetch — ${location.id} month ${i + 1} only has ${count}/${LAST_YEAR - FIRST_YEAR + 1} samples ` +
            `(need >= ${MIN_SAMPLES_PER_MONTH}). Coordinates may be over CHIRPS nodata (ocean) or too many downloads failed.`,
        );
      }
      return Math.round((sum / count) * 10) / 10;
    });
    return { ...location, monthlyMm };
  });

  const status =
    `CHIRPS 2.0 (Climate Hazards Center, UCSB), Indonesia-region monthly product, ${FIRST_YEAR}-01 to ${LAST_YEAR}-12 ` +
    `(${LAST_YEAR - FIRST_YEAR + 1}-year average, not the 30-year WMO-normal period — the regional archive itself stops ` +
    `at 2016-10). Real satellite-gauge-blended precipitation at each city's coordinates, nearest-cell sampled at 0.05°. ` +
    `bmkgFamily is cited against BMKG's ZOM 1991-2020 document where marked "bmkg-zom9120", a best-effort estimate ` +
    `where marked "estimate", and absent (no comparison made) for the locations added in the third pass without a ` +
    `citation. See data/source/README.md.`;

  const outFile = {
    _status: status,
    _datasetName: "CHIRPS 2.0, Indonesia-region monthly (Climate Hazards Center, UCSB)",
    _climatologyPeriod: `${FIRST_YEAR}-01 to ${LAST_YEAR}-12 (${LAST_YEAR - FIRST_YEAR + 1}-year average; shorter than a 30-year WMO-normal period — see data/source/README.md)`,
    locations,
  };
  locationSourceFileSchema.parse(outFile); // fail fast if something drifted from the schema

  const outPath = path.join(process.cwd(), "data", "source", "locations.json");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(outFile, null, 2));

  console.log(`data:fetch — wrote real CHIRPS climatology for ${locations.length} locations to ${outPath}`);

  // The mosaic source: one twelve-month normal per land cell, rounded to
  // 0.1 mm like the city normals. A cell is kept only if every month has
  // enough samples. Written next to locations.json but gitignored — it
  // is a derived grid, and CLAUDE.md invariant 13 keeps grids out of git;
  // CI regenerates it on every build.
  const cells: Array<{ row: number; col: number; monthlyMm: number[] }> = [];
  for (let i = 0; i < cellCount; i += 1) {
    if (!inIndonesia[i]) continue;
    const monthlyMm: number[] = [];
    let ok = true;
    for (let m = 0; m < 12; m += 1) {
      const n = gridCounts[i * 12 + m] ?? 0;
      if (n < MIN_SAMPLES_PER_MONTH) {
        ok = false;
        break;
      }
      monthlyMm.push(Math.round(((gridSums[i * 12 + m] ?? 0) / n) * 10) / 10);
    }
    if (ok) cells.push({ row: Math.floor(i / MOSAIC_SPEC.cols), col: i % MOSAIC_SPEC.cols, monthlyMm });
  }
  const gridPath = path.join(process.cwd(), "data", "source", "grid-climatology.json");
  writeFileSync(
    gridPath,
    JSON.stringify({ spec: MOSAIC_SPEC, period: outFile._climatologyPeriod, cells }),
  );
  console.log(`data:fetch — wrote ${cells.length} mosaic cells (0.25°, inside Indonesia) to ${gridPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
